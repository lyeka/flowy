/**
 * [INPUT]: 无外部依赖，纯数据转换
 * [OUTPUT]: 项目 JSON 格式读写函数
 * [POS]: format/ 模块的项目格式处理，定义项目文件结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================================
// 常量定义
// ============================================================================

const CURRENT_VERSION = 1

// ============================================================================
// 项目文件格式
// ============================================================================

/**
 * @typedef {Object} ProjectFile
 * @property {number} version - 文件格式版本
 * @property {Project} project - 项目数据
 */

/**
 * @typedef {Object} Project
 * @property {string} id - 项目 ID
 * @property {string} title - 项目标题
 * @property {string} description - 项目描述
 * @property {string} color - 项目颜色
 * @property {Column[]} columns - 自定义列
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 更新时间戳
 * @property {boolean} archived - 是否归档
 */

/**
 * @typedef {Object} Column
 * @property {string} id - 列 ID
 * @property {string} title - 列标题
 */

// ============================================================================
// 序列化与反序列化
// ============================================================================

/**
 * 将项目序列化为 JSON 字符串
 * @param {Project} project - 项目数据
 * @returns {string} JSON 字符串
 */
export function serializeProject(project) {
  const file = {
    version: CURRENT_VERSION,
    project: {
      id: project.id,
      title: project.title,
      description: project.description || '',
      color: project.color,
      columns: project.columns,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      archived: project.archived || false
    }
  }
  return JSON.stringify(file, null, 2)
}

/**
 * 从 JSON 字符串反序列化项目
 * @param {string} content - JSON 字符串
 * @returns {Project} 项目数据
 */
export function deserializeProject(content) {
  const file = JSON.parse(content)

  // 版本迁移（预留）
  if (file.version !== CURRENT_VERSION) {
    return migrateProject(file)
  }

  return file.project || null
}

/**
 * 版本迁移（预留）
 * @param {Object} file - 旧版本文件
 * @returns {Project} 迁移后的项目数据
 */
function migrateProject(file) {
  // 目前只有 v1，直接返回
  return file.project || null
}

/**
 * 创建空项目文件内容
 * @param {Project} project - 项目数据
 * @returns {string} JSON 字符串
 */
export function createEmptyProjectFile(project) {
  return serializeProject(project)
}
