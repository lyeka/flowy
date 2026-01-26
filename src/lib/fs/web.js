/**
 * [INPUT]: idb (IndexedDB 封装), jszip, FileSystemAdapter
 * [OUTPUT]: WebFS 类，Web 端文件系统降级实现
 * [POS]: fs/ 模块的 Web 平台实现，使用 IndexedDB 模拟文件系统
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { openDB } from 'idb'
import JSZip from 'jszip'
import { FileSystemAdapter } from './adapter'

// ============================================================================
// 常量定义
// ============================================================================

const DB_NAME = 'gtd-filesystem'
const DB_VERSION = 1
const STORE_FILES = 'files'
const STORE_META = 'meta'

// ============================================================================
// Web 文件系统适配器（IndexedDB 降级方案）
// ============================================================================

export class WebFS extends FileSystemAdapter {
  constructor() {
    super('')
    this._db = null
  }

  /**
   * 获取数据库连接
   */
  async _getDB() {
    if (this._db) return this._db

    this._db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 文件内容存储
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES)
        }
        // 文件元数据存储
        if (!db.objectStoreNames.contains(STORE_META)) {
          const metaStore = db.createObjectStore(STORE_META)
          metaStore.createIndex('parent', 'parent')
        }
      }
    })
    return this._db
  }

  /**
   * 获取父目录路径
   */
  _getParent(path) {
    const parts = path.split('/')
    return parts.length > 1 ? parts.slice(0, -1).join('/') : ''
  }

  async read(path) {
    const db = await this._getDB()
    const content = await db.get(STORE_FILES, path)
    if (content === undefined) {
      throw new Error(`File not found: ${path}`)
    }
    return content
  }

  async write(path, content) {
    const db = await this._getDB()
    const now = Date.now()

    // 确保父目录存在
    const parent = this._getParent(path)
    if (parent) {
      await this.ensureDir(parent)
    }

    // 写入文件内容
    await db.put(STORE_FILES, content, path)

    // 更新元数据
    await db.put(STORE_META, {
      name: path.split('/').pop(),
      path,
      parent,
      isDirectory: false,
      mtime: now,
      size: new Blob([content]).size
    }, path)
  }

  async exists(path) {
    const db = await this._getDB()
    const meta = await db.get(STORE_META, path)
    return meta !== undefined
  }

  async delete(path) {
    const db = await this._getDB()
    await db.delete(STORE_FILES, path)
    await db.delete(STORE_META, path)
  }

  async list(dir) {
    const db = await this._getDB()
    const tx = db.transaction(STORE_META, 'readonly')
    const index = tx.store.index('parent')
    const entries = await index.getAll(dir || '')
    return entries.map(entry => ({
      name: entry.name,
      path: entry.path,
      isDirectory: entry.isDirectory,
      mtime: entry.mtime,
      size: entry.size
    }))
  }

  async ensureDir(path) {
    const db = await this._getDB()
    const existing = await db.get(STORE_META, path)
    if (existing) return

    // 递归创建父目录
    const parent = this._getParent(path)
    if (parent) {
      await this.ensureDir(parent)
    }

    // 创建目录元数据
    await db.put(STORE_META, {
      name: path.split('/').pop(),
      path,
      parent,
      isDirectory: true,
      mtime: Date.now(),
      size: 0
    }, path)
  }

  async stat(path) {
    const db = await this._getDB()
    const meta = await db.get(STORE_META, path)
    return meta || null
  }

  async move(from, to) {
    const content = await this.read(from)
    await this.write(to, content)
    await this.delete(from)
  }

  async copy(from, to) {
    const content = await this.read(from)
    await this.write(to, content)
  }

  // ============================================================================
  // Web 端特有功能：导入导出
  // ============================================================================

  /**
   * 导出所有数据为 ZIP 文件
   * @returns {Promise<Blob>} ZIP 文件 Blob
   */
  async exportAll() {
    const db = await this._getDB()
    const zip = new JSZip()

    // 获取所有文件元数据
    const tx = db.transaction([STORE_FILES, STORE_META], 'readonly')
    const allMeta = await tx.objectStore(STORE_META).getAll()

    // 添加文件到 ZIP
    for (const meta of allMeta) {
      if (!meta.isDirectory) {
        const content = await db.get(STORE_FILES, meta.path)
        if (content) {
          zip.file(meta.path, content)
        }
      }
    }

    return await zip.generateAsync({ type: 'blob' })
  }

  /**
   * 从 ZIP 文件导入数据
   * @param {File|Blob} zipFile - ZIP 文件
   * @returns {Promise<number>} 导入的文件数量
   */
  async importAll(zipFile) {
    const zip = await JSZip.loadAsync(zipFile)
    let count = 0

    for (const [path, file] of Object.entries(zip.files)) {
      if (!file.dir) {
        const content = await file.async('string')
        await this.write(path, content)
        count++
      }
    }

    return count
  }

  /**
   * 清空所有数据
   */
  async clear() {
    const db = await this._getDB()
    await db.clear(STORE_FILES)
    await db.clear(STORE_META)
  }
}
