/**
 * [INPUT]: @capacitor/filesystem, FileSystemAdapter
 * [OUTPUT]: CapacitorFS 类，Capacitor 移动端文件系统实现
 * [POS]: fs/ 模块的 Capacitor 平台实现，处理 iOS/Android 文件操作
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { FileSystemAdapter } from './adapter'

// ============================================================================
// Capacitor 文件系统适配器
// ============================================================================

export class CapacitorFS extends FileSystemAdapter {
  constructor(basePath = 'GTD') {
    super(basePath)
    this.directory = Directory.Documents
  }

  /**
   * 获取完整路径
   */
  _fullPath(relativePath) {
    return relativePath ? `${this.basePath}/${relativePath}` : this.basePath
  }

  async read(path) {
    const result = await Filesystem.readFile({
      path: this._fullPath(path),
      directory: this.directory,
      encoding: Encoding.UTF8
    })
    return result.data
  }

  async write(path, content) {
    await Filesystem.writeFile({
      path: this._fullPath(path),
      data: content,
      directory: this.directory,
      encoding: Encoding.UTF8,
      recursive: true
    })
  }

  async exists(path) {
    try {
      await Filesystem.stat({
        path: this._fullPath(path),
        directory: this.directory
      })
      return true
    } catch {
      return false
    }
  }

  async delete(path) {
    await Filesystem.deleteFile({
      path: this._fullPath(path),
      directory: this.directory
    })
  }

  async list(dir) {
    const result = await Filesystem.readdir({
      path: this._fullPath(dir),
      directory: this.directory
    })

    return result.files.map(file => ({
      name: file.name,
      path: dir ? `${dir}/${file.name}` : file.name,
      isDirectory: file.type === 'directory',
      mtime: file.mtime || 0,
      size: file.size || 0
    }))
  }

  async ensureDir(path) {
    try {
      await Filesystem.mkdir({
        path: this._fullPath(path),
        directory: this.directory,
        recursive: true
      })
    } catch (error) {
      // 目录已存在时忽略错误
      if (!error.message?.includes('exists')) {
        throw error
      }
    }
  }

  async stat(path) {
    try {
      const result = await Filesystem.stat({
        path: this._fullPath(path),
        directory: this.directory
      })
      return {
        name: path.split('/').pop(),
        path,
        isDirectory: result.type === 'directory',
        mtime: result.mtime || 0,
        size: result.size || 0
      }
    } catch {
      return null
    }
  }

  async move(from, to) {
    await Filesystem.rename({
      from: this._fullPath(from),
      to: this._fullPath(to),
      directory: this.directory,
      toDirectory: this.directory
    })
  }

  async copy(from, to) {
    await Filesystem.copy({
      from: this._fullPath(from),
      to: this._fullPath(to),
      directory: this.directory,
      toDirectory: this.directory
    })
  }
}
