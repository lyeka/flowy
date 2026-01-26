/**
 * [INPUT]: React useState/useEffect/useCallback, fs/index.js, format/index.js
 * [OUTPUT]: useFileSystem hook，提供文件系统操作和数据持久化
 * [POS]: hooks/ 模块的文件系统 Hook，封装文件读写和缓存逻辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { getFileSystem, supportsRealFileSystem } from '../lib/fs'
import {
  serializeTasks,
  deserializeTasks,
  createEmptyTaskFile,
  serializeJournal,
  deserializeJournal,
  getJournalPath,
  createJournal
} from '../lib/format'

// ============================================================================
// 常量定义
// ============================================================================

const DEBOUNCE_DELAY = 500 // 写入防抖延迟
const CONFIG_PATH = '.gtd/config.json'
const TASK_PATHS = {
  inbox: 'tasks/inbox.json',
  today: 'tasks/today.json',
  next: 'tasks/next.json',
  someday: 'tasks/someday.json'
}

// localStorage 迁移标记
const MIGRATION_KEY = 'gtd-fs-migrated'
const OLD_TASKS_KEY = 'gtd-tasks'
const OLD_JOURNALS_KEY = 'flowy-journal-storage'
const BASE_PATH_KEY = 'gtd-base-path'

const loadBasePath = () => {
  try {
    return localStorage.getItem(BASE_PATH_KEY) || ''
  } catch {
    return ''
  }
}

const saveBasePath = (basePath) => {
  try {
    if (basePath) {
      localStorage.setItem(BASE_PATH_KEY, basePath)
    } else {
      localStorage.removeItem(BASE_PATH_KEY)
    }
  } catch {
    // ignore storage errors
  }
}

// ============================================================================
// 文件系统 Hook
// ============================================================================

export function useFileSystem() {
  const [fs, setFs] = useState(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)

  const writeQueueRef = useRef(new Map())
  const debounceTimersRef = useRef(new Map())

  // 初始化文件系统
  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const storedBasePath = loadBasePath()
        let fileSystem = await getFileSystem(storedBasePath || undefined)
        if (!mounted) return

        const ensureStructure = async (fs) => {
          await fs.ensureDir('.gtd')
          await fs.ensureDir('tasks')
          await fs.ensureDir('tasks/done')
          await fs.ensureDir('journals')
        }

        // 确保目录结构存在（默认路径）
        await ensureStructure(fileSystem)

        // 加载配置
        let cfg = { basePath: storedBasePath || '', lastSyncTime: 0 }
        if (await fileSystem.exists(CONFIG_PATH)) {
          const content = await fileSystem.read(CONFIG_PATH)
          cfg = JSON.parse(content)
        }

        const desiredBasePath = cfg.basePath || storedBasePath || ''

        // 如果配置的 basePath 与当前不同，重新初始化文件系统
        if (desiredBasePath && desiredBasePath !== fileSystem.basePath) {
          const nextFS = await getFileSystem(desiredBasePath)
          await ensureStructure(nextFS)
          if (!await nextFS.exists(CONFIG_PATH)) {
            await nextFS.write(CONFIG_PATH, JSON.stringify({ ...cfg, basePath: desiredBasePath }, null, 2))
          }
          fileSystem = nextFS
          cfg = { ...cfg, basePath: desiredBasePath }
        } else if (!await fileSystem.exists(CONFIG_PATH)) {
          await fileSystem.write(CONFIG_PATH, JSON.stringify({ ...cfg, basePath: desiredBasePath }, null, 2))
        }

        saveBasePath(desiredBasePath)
        setFs(fileSystem)
        setConfig(cfg)

        // 检查是否需要迁移
        await checkAndMigrate(fileSystem)

        setIsReady(true)
      } catch (err) {
        console.error('Failed to initialize file system:', err)
        setError(err)
      }
    }

    init()
    return () => { mounted = false }
  }, [])

  // 检查并执行 localStorage 迁移
  const checkAndMigrate = async (fileSystem) => {
    if (localStorage.getItem(MIGRATION_KEY)) return

    // 迁移任务数据
    const oldTasks = localStorage.getItem(OLD_TASKS_KEY)
    if (oldTasks) {
      try {
        const tasks = JSON.parse(oldTasks)
        if (Array.isArray(tasks) && tasks.length > 0) {
          // 按列表分组
          const grouped = { inbox: [], today: [], next: [], someday: [] }
          for (const task of tasks) {
            if (task.completed) continue // 跳过已完成任务
            const list = task.list || 'inbox'
            if (grouped[list]) {
              grouped[list].push(task)
            }
          }
          // 写入文件
          for (const [list, listTasks] of Object.entries(grouped)) {
            if (listTasks.length > 0) {
              await fileSystem.write(TASK_PATHS[list], serializeTasks(listTasks))
            }
          }
        }
      } catch (err) {
        console.error('Failed to migrate tasks:', err)
      }
    }

    // 迁移日记数据
    const oldJournals = localStorage.getItem(OLD_JOURNALS_KEY)
    if (oldJournals) {
      try {
        const journals = JSON.parse(oldJournals)
        if (Array.isArray(journals)) {
          for (const journal of journals) {
            const path = getJournalPath(journal.date)
            const parts = path.split('/')
            const dir = parts.slice(0, -1).join('/')
            await fileSystem.ensureDir(dir)
            await fileSystem.write(path, serializeJournal(journal))
          }
        }
      } catch (err) {
        console.error('Failed to migrate journals:', err)
      }
    }

    // 标记迁移完成
    localStorage.setItem(MIGRATION_KEY, Date.now().toString())
  }

  // 防抖写入
  const debouncedWrite = useCallback((path, content) => {
    if (!fs) return

    // 清除之前的定时器
    const existingTimer = debounceTimersRef.current.get(path)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 更新队列
    writeQueueRef.current.set(path, content)

    // 设置新定时器
    const timer = setTimeout(async () => {
      const contentToWrite = writeQueueRef.current.get(path)
      if (contentToWrite !== undefined) {
        try {
          await fs.write(path, contentToWrite)
          writeQueueRef.current.delete(path)
        } catch (err) {
          console.error(`Failed to write ${path}:`, err)
        }
      }
      debounceTimersRef.current.delete(path)
    }, DEBOUNCE_DELAY)

    debounceTimersRef.current.set(path, timer)
  }, [fs])

  // 立即写入（绕过防抖）
  const writeImmediate = useCallback(async (path, content) => {
    if (!fs) return

    // 清除防抖定时器
    const existingTimer = debounceTimersRef.current.get(path)
    if (existingTimer) {
      clearTimeout(existingTimer)
      debounceTimersRef.current.delete(path)
    }
    writeQueueRef.current.delete(path)

    await fs.write(path, content)
  }, [fs])

  // 读取文件
  const read = useCallback(async (path) => {
    if (!fs) return null
    try {
      return await fs.read(path)
    } catch {
      return null
    }
  }, [fs])

  // 检查文件是否存在
  const exists = useCallback(async (path) => {
    if (!fs) return false
    return await fs.exists(path)
  }, [fs])

  // 列出目录
  const list = useCallback(async (dir) => {
    if (!fs) return []
    try {
      return await fs.list(dir)
    } catch {
      return []
    }
  }, [fs])

  // 更新配置
  const updateConfig = useCallback(async (updates) => {
    if (!fs) return
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    await fs.write(CONFIG_PATH, JSON.stringify(newConfig, null, 2))
    if (Object.prototype.hasOwnProperty.call(updates, 'basePath')) {
      saveBasePath(updates.basePath || '')
    }
  }, [fs, config])

  // 刷新所有待写入内容
  const flush = useCallback(async () => {
    if (!fs) return

    // 清除所有定时器
    for (const timer of debounceTimersRef.current.values()) {
      clearTimeout(timer)
    }
    debounceTimersRef.current.clear()

    // 写入所有待写入内容
    for (const [path, content] of writeQueueRef.current.entries()) {
      try {
        await fs.write(path, content)
      } catch (err) {
        console.error(`Failed to flush ${path}:`, err)
      }
    }
    writeQueueRef.current.clear()
  }, [fs])

  return {
    fs,
    isReady,
    error,
    config,
    supportsRealFS: supportsRealFileSystem(),
    read,
    write: debouncedWrite,
    writeImmediate,
    exists,
    list,
    updateConfig,
    flush
  }
}

// ============================================================================
// 任务文件路径常量导出
// ============================================================================

export { TASK_PATHS }
