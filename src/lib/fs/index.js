/**
 * [INPUT]: platform.js, TauriFS, WebFS
 * [OUTPUT]: getFileSystem 工厂函数，FileSystemAdapter 类型导出
 * [POS]: fs/ 模块统一入口，根据平台自动选择文件系统实现
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { isMobile, isTauri } from '../platform'

// ============================================================================
// 默认配置
// ============================================================================

const DEFAULT_BASE_PATH = '~/GTD'
const MOBILE_BASE_PATH = 'GTD'

// ============================================================================
// 文件系统工厂
// ============================================================================

/**
 * 获取文件系统适配器实例
 * @param {string} [basePath] - 基础路径，默认根据平台自动选择
 * @returns {Promise<import('./adapter').FileSystemAdapter>}
 */
export async function getFileSystem(basePath) {
  if (isTauri()) {
    const { TauriFS } = await import('./tauri')
    const resolvedBasePath = basePath || (isMobile() ? MOBILE_BASE_PATH : DEFAULT_BASE_PATH)
    return new TauriFS(resolvedBasePath)
  }

  // Web 端降级
  const { WebFS } = await import('./web')
  return new WebFS()
}

/**
 * 获取默认基础路径
 * @returns {string}
 */
export function getDefaultBasePath() {
  if (isTauri()) return isMobile() ? MOBILE_BASE_PATH : DEFAULT_BASE_PATH
  return ''
}

/**
 * 检查是否支持真实文件系统
 * @returns {boolean}
 */
export function supportsRealFileSystem() {
  return isTauri()
}

// 导出适配器类型
export { FileSystemAdapter } from './adapter'
