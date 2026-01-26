/**
 * [INPUT]: React useState/useCallback, WebDAVSync, useFileSystem
 * [OUTPUT]: useSync hook，提供同步状态和操作，支持冲突检测与交互式解决
 * [POS]: hooks/ 模块的同步 Hook，封装 WebDAV 同步逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback, useRef } from 'react'
import { WebDAVSync } from '../lib/sync'

// ============================================================================
// 同步状态
// ============================================================================

/**
 * @typedef {'idle' | 'syncing' | 'conflict' | 'success' | 'error'} SyncStatus
 */

/**
 * @typedef {Object} SyncState
 * @property {SyncStatus} status - 同步状态
 * @property {string|null} error - 错误信息
 * @property {number} progress - 进度 (0-100)
 * @property {string} currentFile - 当前同步文件
 * @property {number} lastSyncTime - 上次同步时间
 * @property {Array} conflicts - 冲突列表
 */

// ============================================================================
// 同步配置存储
// ============================================================================

const SYNC_CONFIG_KEY = 'gtd-sync-config'

/**
 * 加载同步配置
 * @returns {Object|null}
 */
function loadSyncConfig() {
  try {
    const data = localStorage.getItem(SYNC_CONFIG_KEY)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

/**
 * 保存同步配置
 * @param {Object} config
 */
function saveSyncConfig(config) {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config))
}

/**
 * 清除同步配置
 */
function clearSyncConfig() {
  localStorage.removeItem(SYNC_CONFIG_KEY)
}

// ============================================================================
// 同步 Hook
// ============================================================================

export function useSync(fileSystem) {
  const [state, setState] = useState({
    status: 'idle',
    error: null,
    progress: 0,
    currentFile: '',
    lastSyncTime: loadSyncConfig()?.lastSyncTime || 0,
    conflicts: []
  })

  const [syncConfig, setSyncConfig] = useState(loadSyncConfig)
  const syncClientRef = useRef(null)

  // 配置 WebDAV
  const configureWebDAV = useCallback((config) => {
    const fullConfig = {
      ...config,
      lastSyncTime: state.lastSyncTime
    }
    saveSyncConfig(fullConfig)
    setSyncConfig(fullConfig)
    syncClientRef.current = new WebDAVSync(config)
  }, [state.lastSyncTime])

  // 测试连接
  const testConnection = useCallback(async (config) => {
    const client = new WebDAVSync(config)
    return await client.testConnection()
  }, [])

  // 断开连接
  const disconnect = useCallback(() => {
    clearSyncConfig()
    setSyncConfig(null)
    syncClientRef.current = null
    setState(prev => ({
      ...prev,
      status: 'idle',
      error: null,
      lastSyncTime: 0,
      conflicts: []
    }))
  }, [])

  // 执行同步（带冲突检测）
  const sync = useCallback(async () => {
    if (!fileSystem?.fs || !syncClientRef.current) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: '同步未配置'
      }))
      return false
    }

    setState(prev => ({
      ...prev,
      status: 'syncing',
      error: null,
      progress: 0,
      currentFile: '',
      conflicts: []
    }))

    try {
      // 先刷新待写入内容
      await fileSystem.flush()

      // 第一步：检测冲突
      const conflicts = await syncClientRef.current.detectConflicts(
        fileSystem.fs,
        state.lastSyncTime,
        (current, total, file) => {
          setState(prev => ({
            ...prev,
            progress: Math.round((current / total) * 50), // 检测阶段占 50%
            currentFile: file
          }))
        }
      )

      // 如果有冲突，暂停等待用户选择
      if (conflicts.length > 0) {
        setState(prev => ({
          ...prev,
          status: 'conflict',
          progress: 50,
          currentFile: '',
          conflicts
        }))
        return { needsResolution: true, conflicts }
      }

      // 无冲突，直接同步
      const result = await syncClientRef.current.sync(
        fileSystem.fs,
        state.lastSyncTime,
        (current, total, file) => {
          setState(prev => ({
            ...prev,
            progress: 50 + Math.round((current / total) * 50), // 同步阶段占后 50%
            currentFile: file
          }))
        }
      )

      const now = Date.now()
      const newConfig = { ...syncConfig, lastSyncTime: now }
      saveSyncConfig(newConfig)
      setSyncConfig(newConfig)

      setState(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        currentFile: '',
        lastSyncTime: now
      }))

      return result
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err.message || '同步失败'
      }))
      return false
    }
  }, [fileSystem, state.lastSyncTime, syncConfig])

  // 解决冲突并继续同步
  const resolveConflicts = useCallback(async (strategy) => {
    if (!fileSystem?.fs || !syncClientRef.current) {
      return false
    }

    setState(prev => ({
      ...prev,
      status: 'syncing',
      progress: 50,
      currentFile: ''
    }))

    try {
      // 使用用户选择的策略执行同步
      const result = await syncClientRef.current.sync(
        fileSystem.fs,
        state.lastSyncTime,
        (current, total, file) => {
          setState(prev => ({
            ...prev,
            progress: 50 + Math.round((current / total) * 50),
            currentFile: file
          }))
        },
        strategy
      )

      const now = Date.now()
      const newConfig = { ...syncConfig, lastSyncTime: now }
      saveSyncConfig(newConfig)
      setSyncConfig(newConfig)

      setState(prev => ({
        ...prev,
        status: 'success',
        progress: 100,
        currentFile: '',
        lastSyncTime: now,
        conflicts: []
      }))

      return result
    } catch (err) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: err.message || '同步失败'
      }))
      return false
    }
  }, [fileSystem, state.lastSyncTime, syncConfig])

  // 取消冲突解决
  const cancelConflictResolution = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'idle',
      progress: 0,
      currentFile: '',
      conflicts: []
    }))
  }, [])

  // 初始化同步客户端
  if (syncConfig && !syncClientRef.current) {
    syncClientRef.current = new WebDAVSync(syncConfig)
  }

  return {
    ...state,
    isConfigured: !!syncConfig,
    syncConfig,
    configureWebDAV,
    testConnection,
    disconnect,
    sync,
    resolveConflicts,
    cancelConflictResolution
  }
}
