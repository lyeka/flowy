/**
 * [INPUT]: @tauri-apps/plugin-fs, @tauri-apps/api/path, FileSystemAdapter
 * [OUTPUT]: TauriFS 类，Tauri 桌面端文件系统实现
 * [POS]: fs/ 模块的 Tauri 平台实现，处理桌面端文件操作
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import {
  readTextFile,
  writeTextFile,
  exists as tauriExists,
  remove,
  readDir,
  mkdir,
  stat as tauriStat,
  rename,
  copyFile
} from '@tauri-apps/plugin-fs'
import { join, homeDir } from '@tauri-apps/api/path'
import { FileSystemAdapter } from './adapter'

// ============================================================================
// Tauri 文件系统适配器
// ============================================================================

export class TauriFS extends FileSystemAdapter {
  constructor(basePath) {
    super(basePath)
    this._resolvedBase = null
  }

  /**
   * 解析基础路径（处理 ~ 符号）
   */
  async _getBasePath() {
    if (this._resolvedBase) return this._resolvedBase

    if (this.basePath.startsWith('~')) {
      const home = await homeDir()
      this._resolvedBase = await join(home, this.basePath.slice(2))
    } else {
      this._resolvedBase = this.basePath
    }
    return this._resolvedBase
  }

  /**
   * 获取完整路径
   */
  async _fullPath(relativePath) {
    const base = await this._getBasePath()
    return await join(base, relativePath)
  }

  async read(path) {
    const fullPath = await this._fullPath(path)
    return await readTextFile(fullPath)
  }

  async write(path, content) {
    const fullPath = await this._fullPath(path)
    // 确保父目录存在
    const parts = path.split('/')
    if (parts.length > 1) {
      const parentDir = parts.slice(0, -1).join('/')
      await this.ensureDir(parentDir)
    }
    await writeTextFile(fullPath, content)
  }

  async exists(path) {
    const fullPath = await this._fullPath(path)
    return await tauriExists(fullPath)
  }

  async delete(path) {
    const fullPath = await this._fullPath(path)
    await remove(fullPath)
  }

  async list(dir) {
    const fullPath = await this._fullPath(dir)
    const entries = await readDir(fullPath)

    return entries.map(entry => ({
      name: entry.name,
      path: dir ? `${dir}/${entry.name}` : entry.name,
      isDirectory: entry.isDirectory,
      mtime: entry.mtime || 0,
      size: entry.size || 0
    }))
  }

  /**
   * 确保基础目录存在
   */
  async _ensureBaseDir() {
    const base = await this._getBasePath()
    if (!await tauriExists(base)) {
      await mkdir(base, { recursive: true })
    }
  }

  async ensureDir(path) {
    // 先确保基础目录存在
    await this._ensureBaseDir()

    const fullPath = await this._fullPath(path)
    if (!await tauriExists(fullPath)) {
      await mkdir(fullPath, { recursive: true })
    }
  }

  async stat(path) {
    const fullPath = await this._fullPath(path)
    if (!await tauriExists(fullPath)) return null

    const info = await tauriStat(fullPath)
    return {
      name: path.split('/').pop(),
      path,
      isDirectory: info.isDirectory,
      mtime: info.mtime ? new Date(info.mtime).getTime() : 0,
      size: info.size || 0
    }
  }

  async move(from, to) {
    const fromPath = await this._fullPath(from)
    const toPath = await this._fullPath(to)
    // 确保目标目录存在
    const parts = to.split('/')
    if (parts.length > 1) {
      const parentDir = parts.slice(0, -1).join('/')
      await this.ensureDir(parentDir)
    }
    await rename(fromPath, toPath)
  }

  async copy(from, to) {
    const fromPath = await this._fullPath(from)
    const toPath = await this._fullPath(to)
    // 确保目标目录存在
    const parts = to.split('/')
    if (parts.length > 1) {
      const parentDir = parts.slice(0, -1).join('/')
      await this.ensureDir(parentDir)
    }
    await copyFile(fromPath, toPath)
  }
}
