/**
 * [INPUT]: conflict.js, webdav.js
 * [OUTPUT]: 同步功能统一导出
 * [POS]: sync/ 模块统一入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export {
  detectConflict,
  getSyncDirection,
  resolveConflict,
  getConflictCopyPath,
  mergeTaskFiles
} from './conflict'

export { WebDAVSync } from './webdav'
