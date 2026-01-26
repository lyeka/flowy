/**
 * [INPUT]: 无外部依赖，纯数据转换
 * [OUTPUT]: 任务 JSON 格式读写函数
 * [POS]: format/ 模块的任务格式处理，定义任务文件结构
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================================
// 常量定义
// ============================================================================

const CURRENT_VERSION = 1

// ============================================================================
// 任务文件格式
// ============================================================================

/**
 * @typedef {Object} TaskFile
 * @property {number} version - 文件格式版本
 * @property {number} updatedAt - 最后更新时间戳
 * @property {Task[]} tasks - 任务列表
 */

/**
 * @typedef {Object} Task
 * @property {string} id - 任务 ID
 * @property {string} title - 任务标题
 * @property {boolean} completed - 是否完成
 * @property {number} createdAt - 创建时间戳
 * @property {number|null} completedAt - 完成时间戳
 * @property {number|null} dueDate - 截止日期时间戳
 * @property {string} notes - 备注
 */

// ============================================================================
// 序列化与反序列化
// ============================================================================

/**
 * 将任务列表序列化为 JSON 字符串
 * @param {Task[]} tasks - 任务列表
 * @returns {string} JSON 字符串
 */
export function serializeTasks(tasks) {
  const file = {
    version: CURRENT_VERSION,
    updatedAt: Date.now(),
    tasks: tasks.map(task => ({
      id: task.id,
      title: task.title,
      completed: task.completed,
      createdAt: task.createdAt,
      completedAt: task.completedAt,
      dueDate: task.dueDate,
      notes: task.notes || ''
    }))
  }
  return JSON.stringify(file, null, 2)
}

/**
 * 从 JSON 字符串反序列化任务列表
 * @param {string} content - JSON 字符串
 * @returns {Task[]} 任务列表
 */
export function deserializeTasks(content) {
  const file = JSON.parse(content)

  // 版本迁移（预留）
  if (file.version !== CURRENT_VERSION) {
    return migrateTasks(file)
  }

  return file.tasks || []
}

/**
 * 版本迁移（预留）
 * @param {Object} file - 旧版本文件
 * @returns {Task[]} 迁移后的任务列表
 */
function migrateTasks(file) {
  // 目前只有 v1，直接返回
  return file.tasks || []
}

/**
 * 创建空任务文件内容
 * @returns {string} JSON 字符串
 */
export function createEmptyTaskFile() {
  return serializeTasks([])
}

/**
 * 获取任务文件的更新时间
 * @param {string} content - JSON 字符串
 * @returns {number} 更新时间戳
 */
export function getTaskFileUpdatedAt(content) {
  try {
    const file = JSON.parse(content)
    return file.updatedAt || 0
  } catch {
    return 0
  }
}

// ============================================================================
// 任务合并（用于同步冲突解决）
// ============================================================================

/**
 * 合并两个任务列表
 * 按 ID 去重，保留更新时间更晚的版本
 * @param {Task[]} local - 本地任务列表
 * @param {Task[]} remote - 远程任务列表
 * @returns {Task[]} 合并后的任务列表
 */
export function mergeTasks(local, remote) {
  const merged = new Map()

  // 计算任务的"更新时间"
  const getTaskTime = (task) => {
    return Math.max(
      task.completedAt || 0,
      task.createdAt || 0
    )
  }

  // 先添加本地任务
  for (const task of local) {
    merged.set(task.id, task)
  }

  // 合并远程任务
  for (const task of remote) {
    const existing = merged.get(task.id)
    if (!existing || getTaskTime(task) > getTaskTime(existing)) {
      merged.set(task.id, task)
    }
  }

  return Array.from(merged.values())
}
