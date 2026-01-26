/**
 * [INPUT]: 无外部依赖，纯接口定义
 * [OUTPUT]: FileSystemAdapter 抽象类，定义统一文件系统接口
 * [POS]: fs/ 模块的接口契约，所有平台实现必须遵循此接口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================================
// 文件信息结构
// ============================================================================

/**
 * @typedef {Object} FileInfo
 * @property {string} name - 文件名
 * @property {string} path - 相对路径
 * @property {boolean} isDirectory - 是否为目录
 * @property {number} mtime - 修改时间戳
 * @property {number} size - 文件大小（字节）
 */

// ============================================================================
// 文件系统适配器抽象类
// ============================================================================

/**
 * 文件系统适配器抽象类
 * 所有平台实现必须继承此类并实现所有方法
 */
export class FileSystemAdapter {
  constructor(basePath) {
    this.basePath = basePath
  }

  /**
   * 读取文件内容
   * @param {string} path - 相对路径
   * @returns {Promise<string>} 文件内容
   */
  async read(path) {
    throw new Error('Not implemented')
  }

  /**
   * 写入文件内容
   * @param {string} path - 相对路径
   * @param {string} content - 文件内容
   * @returns {Promise<void>}
   */
  async write(path, content) {
    throw new Error('Not implemented')
  }

  /**
   * 检查文件或目录是否存在
   * @param {string} path - 相对路径
   * @returns {Promise<boolean>}
   */
  async exists(path) {
    throw new Error('Not implemented')
  }

  /**
   * 删除文件
   * @param {string} path - 相对路径
   * @returns {Promise<void>}
   */
  async delete(path) {
    throw new Error('Not implemented')
  }

  /**
   * 列出目录内容
   * @param {string} dir - 目录相对路径
   * @returns {Promise<FileInfo[]>}
   */
  async list(dir) {
    throw new Error('Not implemented')
  }

  /**
   * 确保目录存在（递归创建）
   * @param {string} path - 目录相对路径
   * @returns {Promise<void>}
   */
  async ensureDir(path) {
    throw new Error('Not implemented')
  }

  /**
   * 获取文件信息
   * @param {string} path - 相对路径
   * @returns {Promise<FileInfo|null>}
   */
  async stat(path) {
    throw new Error('Not implemented')
  }

  /**
   * 移动/重命名文件
   * @param {string} from - 源路径
   * @param {string} to - 目标路径
   * @returns {Promise<void>}
   */
  async move(from, to) {
    throw new Error('Not implemented')
  }

  /**
   * 复制文件
   * @param {string} from - 源路径
   * @param {string} to - 目标路径
   * @returns {Promise<void>}
   */
  async copy(from, to) {
    throw new Error('Not implemented')
  }
}
