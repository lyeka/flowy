/**
 * [INPUT]: @tauri-apps/api/core, platform.js
 * [OUTPUT]: 触觉反馈工具函数 (impact, notification, selection)
 * [POS]: lib/ 的触觉反馈封装，移动端操作反馈
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { invoke } from '@tauri-apps/api/core'
import { isMobile, isTauri } from './platform'

const canHaptics = () => isTauri() && isMobile()

const safeInvoke = async (command, payload) => {
  if (!canHaptics()) return
  try {
    await invoke(command, payload)
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 轻微冲击反馈（按钮点击）
 */
export const hapticsLight = async () => {
  await safeInvoke('plugin:haptics|impact_feedback', { intensity: 'light' })
}

/**
 * 中等冲击反馈（任务操作）
 */
export const hapticsMedium = async () => {
  await safeInvoke('plugin:haptics|impact_feedback', { intensity: 'medium' })
}

/**
 * 强烈冲击反馈（重要操作）
 */
export const hapticsHeavy = async () => {
  await safeInvoke('plugin:haptics|impact_feedback', { intensity: 'heavy' })
}

/**
 * 成功通知反馈
 */
export const hapticsSuccess = async () => {
  await safeInvoke('plugin:haptics|notification_feedback', { type: 'success' })
}

/**
 * 警告通知反馈
 */
export const hapticsWarning = async () => {
  await safeInvoke('plugin:haptics|notification_feedback', { type: 'warning' })
}

/**
 * 错误通知反馈
 */
export const hapticsError = async () => {
  await safeInvoke('plugin:haptics|notification_feedback', { type: 'error' })
}

/**
 * 选择反馈（滑动选择）
 */
export const hapticsSelection = async () => {
  await safeInvoke('plugin:haptics|selection_feedback')
}
