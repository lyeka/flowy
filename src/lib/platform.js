/**
 * [INPUT]: @tauri-apps/api, @capacitor/core, @capacitor/local-notifications, @capacitor/filesystem, @capacitor/share
 * [OUTPUT]: getPlatform, isMobile, isDesktop, showNotification, exportData, importData 跨平台 API
 * [POS]: lib/ 的跨平台能力封装,统一桌面端(Tauri)和移动端(Capacitor)的 API
 * [PROTOCOL]: 变更时更新此头部,然后检查 CLAUDE.md
 */

import { invoke } from '@tauri-apps/api/core'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

// ============================================================
// 平台检测
// ============================================================

/**
 * 获取当前运行平台
 * @returns {'tauri' | 'ios' | 'android' | 'web'}
 */
export const getPlatform = () => {
  if (typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined) {
    return 'tauri'
  }
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() // 'ios' | 'android'
  }
  return 'web'
}

/**
 * 是否为移动端
 */
export const isMobile = () => {
  const platform = getPlatform()
  return platform === 'ios' || platform === 'android'
}

/**
 * 是否为桌面端
 */
export const isDesktop = () => {
  return getPlatform() === 'tauri'
}

/**
 * 是否为 Web 端
 */
export const isWeb = () => {
  return getPlatform() === 'web'
}

// ============================================================
// 通知功能
// ============================================================

/**
 * 显示通知（跨平台）
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 */
export const showNotification = async (title, body) => {
  const platform = getPlatform()

  try {
    if (platform === 'tauri') {
      // Tauri 桌面端通知
      await invoke('show_notification', { title, body })
    } else if (isMobile()) {
      // Capacitor 移动端通知
      // 先请求权限
      const permission = await LocalNotifications.requestPermissions()
      if (permission.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 100) }, // 立即显示
            },
          ],
        })
      }
    } else {
      // Web 端使用浏览器通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          new Notification(title, { body })
        }
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
  const platform = getPlatform()

  try {
    const jsonData = JSON.stringify(data, null, 2)

    if (platform === 'tauri') {
      // Tauri 桌面端：使用文件对话框
      const filePath = await invoke('export_data', { data: jsonData })
      return filePath
    } else if (isMobile()) {
      // Capacitor 移动端：保存到应用目录并分享
      const fileName = `flowy-backup-${Date.now()}.json`

      // 保存到应用文档目录
      await Filesystem.writeFile({
        path: fileName,
        data: jsonData,
        directory: Directory.Documents,
      })

      // 使用分享面板
      await Share.share({
        title: 'Export Flowy Data',
        text: 'Flowy backup data',
        url: fileName,
        dialogTitle: 'Export Data',
      })

      return fileName
    } else {
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
    }
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
  const platform = getPlatform()

  try {
    if (platform === 'tauri') {
      // Tauri 桌面端：使用文件对话框
      const jsonData = await invoke('import_data')
      return JSON.parse(jsonData)
    } else if (isMobile()) {
      // Capacitor 移动端：使用文件选择器
      // 注意：Capacitor 没有内置文件选择器，需要使用 HTML input
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
    } else {
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
    }
  } catch (error) {
    console.error('Failed to import data:', error)
    return null
  }
}
