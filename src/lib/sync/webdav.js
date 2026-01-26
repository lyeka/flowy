/**
 * [INPUT]: webdav 库
 * [OUTPUT]: WebDAVSync 类，WebDAV 同步实现
 * [POS]: sync/ 模块的 WebDAV 同步实现，支持坚果云等服务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { createClient } from 'webdav'
import { detectConflict, getSyncDirection, resolveConflict, getConflictCopyPath, mergeTaskFiles } from './conflict'

// ============================================================================
// WebDAV 同步配置
// ============================================================================

/**
 * @typedef {Object} WebDAVConfig
 * @property {string} url - WebDAV 服务器地址
 * @property {string} username - 用户名
 * @property {string} password - 密码
 * @property {string} [remotePath='/GTD'] - 远程目录路径
 */

// ============================================================================
// WebDAV 同步类
// ============================================================================

export class WebDAVSync {
  /**
   * @param {WebDAVConfig} config - WebDAV 配置
   */
  constructor(config) {
    this.client = createClient(config.url, {
      username: config.username,
      password: config.password
    })
    this.remotePath = config.remotePath || '/GTD'
  }

  /**
   * 测试连接
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.client.getDirectoryContents('/')
      return true
    } catch {
      return false
    }
  }

  /**
   * 确保远程目录存在
   * @param {string} path - 目录路径
   */
  async ensureRemoteDir(path) {
    const fullPath = `${this.remotePath}/${path}`
    try {
      await this.client.stat(fullPath)
    } catch {
      await this.client.createDirectory(fullPath, { recursive: true })
    }
  }

  /**
   * 获取远程文件列表
   * @param {string} [dir=''] - 目录路径
   * @returns {Promise<Array<{name: string, path: string, mtime: number, isDirectory: boolean}>>}
   */
  async listRemote(dir = '') {
    const fullPath = dir ? `${this.remotePath}/${dir}` : this.remotePath

    try {
      const contents = await this.client.getDirectoryContents(fullPath)
      return contents.map(item => ({
        name: item.basename,
        path: dir ? `${dir}/${item.basename}` : item.basename,
        mtime: new Date(item.lastmod).getTime(),
        isDirectory: item.type === 'directory'
      }))
    } catch {
      return []
    }
  }

  /**
   * 下载文件
   * @param {string} path - 文件路径
   * @returns {Promise<string>}
   */
  async download(path) {
    const fullPath = `${this.remotePath}/${path}`
    const content = await this.client.getFileContents(fullPath, { format: 'text' })
    return content
  }

  /**
   * 上传文件
   * @param {string} path - 文件路径
   * @param {string} content - 文件内容
   */
  async upload(path, content) {
    const fullPath = `${this.remotePath}/${path}`
    // 确保父目录存在
    const parts = path.split('/')
    if (parts.length > 1) {
      const parentDir = parts.slice(0, -1).join('/')
      await this.ensureRemoteDir(parentDir)
    }
    await this.client.putFileContents(fullPath, content)
  }

  /**
   * 删除远程文件
   * @param {string} path - 文件路径
   */
  async deleteRemote(path) {
    const fullPath = `${this.remotePath}/${path}`
    await this.client.deleteFile(fullPath)
  }

  /**
   * 获取远程文件信息
   * @param {string} path - 文件路径
   * @returns {Promise<{mtime: number, size: number}|null>}
   */
  async statRemote(path) {
    const fullPath = `${this.remotePath}/${path}`
    try {
      const stat = await this.client.stat(fullPath)
      return {
        mtime: new Date(stat.lastmod).getTime(),
        size: stat.size
      }
    } catch {
      return null
    }
  }

  /**
   * 同步单个文件
   * @param {import('../fs/adapter').FileSystemAdapter} localFS - 本地文件系统
   * @param {string} path - 文件路径
   * @param {number} lastSyncTime - 上次同步时间
   * @param {string} [conflictStrategy='merge'] - 冲突解决策略
   * @returns {Promise<{action: string, conflict?: boolean}>}
   */
  async syncFile(localFS, path, lastSyncTime, conflictStrategy = 'merge') {
    const localStat = await localFS.stat(path)
    const remoteStat = await this.statRemote(path)

    const localMtime = localStat?.mtime || 0
    const remoteMtime = remoteStat?.mtime || 0

    // 本地和远程都不存在
    if (!localStat && !remoteStat) {
      return { action: 'none' }
    }

    // 只有本地存在：上传
    if (localStat && !remoteStat) {
      const content = await localFS.read(path)
      await this.upload(path, content)
      return { action: 'upload' }
    }

    // 只有远程存在：下载
    if (!localStat && remoteStat) {
      const content = await this.download(path)
      await localFS.write(path, content)
      return { action: 'download' }
    }

    // 两边都存在：检查同步方向
    const direction = getSyncDirection(localMtime, remoteMtime, lastSyncTime)

    switch (direction) {
      case 'upload': {
        const content = await localFS.read(path)
        await this.upload(path, content)
        return { action: 'upload' }
      }

      case 'download': {
        const content = await this.download(path)
        await localFS.write(path, content)
        return { action: 'download' }
      }

      case 'conflict': {
        const localContent = await localFS.read(path)
        const remoteContent = await this.download(path)

        // 判断是否为 JSON 文件（可合并）
        const isJson = path.endsWith('.json')
        const mergeFn = isJson ? mergeTaskFiles : null

        const result = resolveConflict(
          { path, localMtime, remoteMtime, localContent, remoteContent },
          conflictStrategy,
          mergeFn
        )

        // 写入解决后的内容
        await localFS.write(path, result.content)
        await this.upload(path, result.content)

        // 如果有冲突副本
        if (result.conflictCopy) {
          const copyPath = getConflictCopyPath(path)
          await localFS.write(copyPath, result.conflictCopy)
        }

        return { action: 'merge', conflict: true }
      }

      default:
        return { action: 'none' }
    }
  }

  /**
   * 收集所有需要同步的文件
   * @param {import('../fs/adapter').FileSystemAdapter} localFS - 本地文件系统
   * @returns {Promise<string[]>}
   */
  async collectFiles(localFS) {
    const filesToSync = new Set()

    // 递归收集本地文件
    const collectLocal = async (dir) => {
      const entries = await localFS.list(dir)
      for (const entry of entries) {
        if (entry.isDirectory) {
          await collectLocal(entry.path)
        } else {
          filesToSync.add(entry.path)
        }
      }
    }

    // 递归收集远程文件
    const collectRemote = async (dir) => {
      const entries = await this.listRemote(dir)
      for (const entry of entries) {
        if (entry.isDirectory) {
          await collectRemote(entry.path)
        } else {
          filesToSync.add(entry.path)
        }
      }
    }

    await collectLocal('')
    await collectRemote('')

    return Array.from(filesToSync)
  }

  /**
   * 检测冲突（不执行同步）
   * @param {import('../fs/adapter').FileSystemAdapter} localFS - 本地文件系统
   * @param {number} lastSyncTime - 上次同步时间
   * @param {Function} [onProgress] - 进度回调
   * @returns {Promise<Array<{path: string, localMtime: number, remoteMtime: number}>>}
   */
  async detectConflicts(localFS, lastSyncTime, onProgress) {
    const conflicts = []
    const files = await this.collectFiles(localFS)

    for (let i = 0; i < files.length; i++) {
      const path = files[i]
      onProgress?.(i + 1, files.length, path)

      const localStat = await localFS.stat(path)
      const remoteStat = await this.statRemote(path)

      // 两边都存在才可能冲突
      if (localStat && remoteStat) {
        const direction = getSyncDirection(localStat.mtime, remoteStat.mtime, lastSyncTime)
        if (direction === 'conflict') {
          conflicts.push({
            path,
            localMtime: localStat.mtime,
            remoteMtime: remoteStat.mtime
          })
        }
      }
    }

    return conflicts
  }

  /**
   * 完整同步
   * @param {import('../fs/adapter').FileSystemAdapter} localFS - 本地文件系统
   * @param {number} lastSyncTime - 上次同步时间
   * @param {Function} [onProgress] - 进度回调
   * @param {string} [conflictStrategy='merge'] - 冲突解决策略
   * @returns {Promise<{uploaded: number, downloaded: number, conflicts: number}>}
   */
  async sync(localFS, lastSyncTime, onProgress, conflictStrategy = 'merge') {
    const stats = { uploaded: 0, downloaded: 0, conflicts: 0 }
    const files = await this.collectFiles(localFS)

    for (let i = 0; i < files.length; i++) {
      const path = files[i]
      onProgress?.(i + 1, files.length, path)

      const result = await this.syncFile(localFS, path, lastSyncTime, conflictStrategy)

      if (result.action === 'upload') stats.uploaded++
      if (result.action === 'download') stats.downloaded++
      if (result.conflict) stats.conflicts++
    }

    return stats
  }
}
