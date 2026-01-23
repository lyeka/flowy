/**
 * [INPUT]: @capacitor/haptics
 * [OUTPUT]: 触觉反馈工具函数 (impact, notification, selection)
 * [POS]: lib/ 的触觉反馈封装，移动端操作反馈
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isMobile } from './platform'

// ============================================================
// 触觉反馈函数
// ============================================================

/**
 * 轻微冲击反馈（按钮点击）
 */
export const hapticsLight = async () => {
  if (!isMobile()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 中等冲击反馈（任务操作）
 */
export const hapticsMedium = async () => {
  if (!isMobile()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Medium })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 强烈冲击反馈（重要操作）
 */
export const hapticsHeavy = async () => {
  if (!isMobile()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Heavy })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 成功通知反馈
 */
export const hapticsSuccess = async () => {
  if (!isMobile()) return
  try {
    await Haptics.notification({ type: NotificationType.Success })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 警告通知反馈
 */
export const hapticsWarning = async () => {
  if (!isMobile()) return
  try {
    await Haptics.notification({ type: NotificationType.Warning })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 错误通知反馈
 */
export const hapticsError = async () => {
  if (!isMobile()) return
  try {
    await Haptics.notification({ type: NotificationType.Error })
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}

/**
 * 选择反馈（滑动选择）
 */
export const hapticsSelection = async () => {
  if (!isMobile()) return
  try {
    await Haptics.selectionStart()
    await Haptics.selectionChanged()
    await Haptics.selectionEnd()
  } catch (error) {
    console.warn('Haptics not available:', error)
  }
}
