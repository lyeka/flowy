/**
 * [INPUT]: @tauri-apps/api/core, Web Notification API
 * [OUTPUT]: getPlatform, isMobile, isDesktop, isWeb, isTauri, showNotification, exportData, importData 跨平台 API
 * [POS]: lib/ 的跨平台能力封装,统一桌面端/移动端(Tauri)与 Web 的 API
 * [PROTOCOL]: 变更时更新此头部,然后检查 CLAUDE.md
 */

import { invoke } from '@tauri-apps/api/core'

// ============================================================
// 平台检测
// ============================================================

const isTauriRuntime = () => typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined

const getUserAgent = () => (typeof navigator !== 'undefined' ? navigator.userAgent : '')

const isAndroidUA = () => /Android/i.test(getUserAgent())

const isIOSUA = () => /iPad|iPhone|iPod/i.test(getUserAgent())

/**
 * 获取当前运行平台
 * @returns {'tauri' | 'ios' | 'android' | 'web'}
 */
export const getPlatform = () => {
  if (isTauriRuntime()) {
    if (isAndroidUA()) return 'android'
    if (isIOSUA()) return 'ios'
    return 'tauri'
  }

  if (isAndroidUA()) return 'android'
  if (isIOSUA()) return 'ios'
  return 'web'
}

/**
 * 是否为 Tauri 运行时
 */
export const isTauri = () => isTauriRuntime()

/**
 * 是否为移动端
 */
export const isMobile = () => isAndroidUA() || isIOSUA()

/**
 * 是否为桌面端
 */
export const isDesktop = () => isTauriRuntime() && !isMobile()

/**
 * 是否为 Web 端
 */
export const isWeb = () => !isTauriRuntime()

// ============================================================
// 通知功能
// ============================================================

/**
 * 显示通知（跨平台）
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 */
export const showNotification = async (title, body) => {
  try {
    if (isTauriRuntime()) {
      await invoke('show_notification', { title, body })
      return
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification(title, { body })
      }
    }
  } catch (error) {
    console.error('Failed to show notification:', error)
  }
}

// ============================================================
// 文件操作
// ============================================================

/**
 * 导出数据到文件（跨平台）
 * @param {Object} data - 要导出的数据
 * @returns {Promise<string|null>} 文件路径或 null
 */
export const exportData = async (data) => {
  try {
    const jsonData = JSON.stringify(data, null, 2)

    if (isTauriRuntime()) {
      const filePath = await invoke('export_data', { data: jsonData })
      return filePath
    }

    // Web 端：下载文件
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flowy-backup-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return a.download
  } catch (error) {
    console.error('Failed to export data:', error)
    return null
  }
}

/**
 * 导入数据（跨平台）
 * @returns {Promise<Object|null>} 导入的数据或 null
 */
export const importData = async () => {
  try {
    if (isTauriRuntime()) {
      const jsonData = await invoke('import_data')
      return JSON.parse(jsonData)
    }

    // Web 端：使用文件选择器
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'application/json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const text = await file.text()
          resolve(JSON.parse(text))
        } else {
          resolve(null)
        }
      }
      input.click()
    })
  } catch (error) {
    console.error('Failed to import data:', error)
    return null
  }
}
