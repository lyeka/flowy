/**
 * [INPUT]: @tauri-apps/api 的 invoke 方法
 * [OUTPUT]: showNotification, exportData, importData 三个桌面端 API
 * [POS]: lib/ 的桌面端能力封装,被业务组件调用
 * [PROTOCOL]: 变更时更新此头部,然后检查 CLAUDE.md
 */

import { invoke } from '@tauri-apps/api/core';

// ============================================================
// 检测是否在 Tauri 环境中运行
// ============================================================
export const isTauri = () => {
  return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;
};

// ============================================================
// 显示桌面通知
// ============================================================
export const showNotification = async (title, body) => {
  if (!isTauri()) {
    console.warn('Not running in Tauri environment');
    return;
  }

  try {
    await invoke('show_notification', { title, body });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

// ============================================================
// 导出数据到文件
// ============================================================
export const exportData = async (data) => {
  if (!isTauri()) {
    console.warn('Not running in Tauri environment');
    return null;
  }

  try {
    const jsonData = JSON.stringify(data, null, 2);
    const filePath = await invoke('export_data', { data: jsonData });
    return filePath;
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

// ============================================================
// 导入数据
// ============================================================
export const importData = async () => {
  if (!isTauri()) {
    console.warn('Not running in Tauri environment');
    return null;
  }

  try {
    const jsonData = await invoke('import_data');
    return JSON.parse(jsonData);
  } catch (error) {
    console.error('Failed to import data:', error);
    return null;
  }
};
