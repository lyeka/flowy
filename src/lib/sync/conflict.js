/**
 * [INPUT]: 无外部依赖，纯逻辑
 * [OUTPUT]: 冲突检测与解决函数
 * [POS]: sync/ 模块的冲突处理逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================================
// 冲突类型
// ============================================================================

/**
 * @typedef {'keep-both' | 'local-wins' | 'remote-wins' | 'merge'} ConflictStrategy
 */

/**
 * @typedef {Object} ConflictInfo
 * @property {string} path - 文件路径
 * @property {number} localMtime - 本地修改时间
 * @property {number} remoteMtime - 远程修改时间
 * @property {string} localContent - 本地内容
 * @property {string} remoteContent - 远程内容
 */

// ============================================================================
// 冲突检测
// ============================================================================

/**
 * 检测文件是否存在冲突
 * @param {number} localMtime - 本地修改时间
 * @param {number} remoteMtime - 远程修改时间
 * @param {number} lastSyncTime - 上次同步时间
 * @returns {boolean} 是否存在冲突
 */
export function detectConflict(localMtime, remoteMtime, lastSyncTime) {
  const localModified = localMtime > lastSyncTime
  const remoteModified = remoteMtime > lastSyncTime
  return localModified && remoteModified
}

/**
 * 判断同步方向
 * @param {number} localMtime - 本地修改时间
 * @param {number} remoteMtime - 远程修改时间
 * @param {number} lastSyncTime - 上次同步时间
 * @returns {'upload' | 'download' | 'conflict' | 'none'} 同步方向
 */
export function getSyncDirection(localMtime, remoteMtime, lastSyncTime) {
  const localModified = localMtime > lastSyncTime
  const remoteModified = remoteMtime > lastSyncTime

  if (localModified && remoteModified) return 'conflict'
  if (localModified) return 'upload'
  if (remoteModified) return 'download'
  return 'none'
}

// ============================================================================
// 冲突解决
// ============================================================================

/**
 * 解决冲突
 * @param {ConflictInfo} conflict - 冲突信息
 * @param {ConflictStrategy} strategy - 解决策略
 * @param {Function} [mergeFn] - 自定义合并函数
 * @returns {{ content: string, conflictCopy?: string }} 解决结果
 */
export function resolveConflict(conflict, strategy, mergeFn) {
  switch (strategy) {
    case 'keep-both':
      return {
        content: conflict.localContent,
        conflictCopy: conflict.remoteContent
      }

    case 'local-wins':
      return { content: conflict.localContent }

    case 'remote-wins':
      return { content: conflict.remoteContent }

    case 'merge':
      if (mergeFn) {
        return { content: mergeFn(conflict.localContent, conflict.remoteContent) }
      }
      // 默认合并：保留本地
      return { content: conflict.localContent }

    default:
      return { content: conflict.localContent }
  }
}

/**
 * 生成冲突副本文件名
 * @param {string} path - 原文件路径
 * @param {string} [suffix='conflict'] - 后缀
 * @returns {string} 冲突副本路径
 */
export function getConflictCopyPath(path, suffix = 'conflict') {
  const lastDot = path.lastIndexOf('.')
  if (lastDot === -1) {
    return `${path}.${suffix}`
  }
  return `${path.slice(0, lastDot)}.${suffix}${path.slice(lastDot)}`
}

// ============================================================================
// JSON 文件合并
// ============================================================================

/**
 * 合并两个 JSON 任务文件
 * @param {string} localContent - 本地 JSON 内容
 * @param {string} remoteContent - 远程 JSON 内容
 * @returns {string} 合并后的 JSON 内容
 */
export function mergeTaskFiles(localContent, remoteContent) {
  const local = JSON.parse(localContent)
  const remote = JSON.parse(remoteContent)

  // 合并任务列表
  const merged = new Map()

  const getTaskTime = (task) => {
    return Math.max(task.completedAt || 0, task.createdAt || 0)
  }

  for (const task of [...(local.tasks || []), ...(remote.tasks || [])]) {
    const existing = merged.get(task.id)
    if (!existing || getTaskTime(task) > getTaskTime(existing)) {
      merged.set(task.id, task)
    }
  }

  return JSON.stringify({
    version: Math.max(local.version || 1, remote.version || 1),
    updatedAt: Date.now(),
    tasks: Array.from(merged.values())
  }, null, 2)
}
