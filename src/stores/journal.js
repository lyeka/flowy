/**
 * [INPUT]: React useState/useEffect/useMemo/useCallback/useRef, date-fns, format/journal.js
 * [OUTPUT]: useJournal hook, 日记 CRUD 操作，支持文件系统持久化
 * [POS]: 日记状态管理中心，与 gtd.js 平行，管理独立的日记数据，支持指定日期创建并实时同步
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useMemo, useCallback, useRef, createContext, useContext, createElement } from 'react'
import { format, startOfDay } from 'date-fns'
import {
  serializeJournal,
  deserializeJournal,
  getJournalPath,
  createJournal as createJournalData
} from '@/lib/format'

// ============================================================================
// 常量定义
// ============================================================================

const STORAGE_KEY = 'flowy-journal-storage'
const DEBOUNCE_DELAY = 500

// ============================================================================
// 工具函数
// ============================================================================

// 生成日记 ID: journal-YYYY-MM-DD
const generateJournalId = (date) => {
  return `journal-${format(date, 'yyyy-MM-dd')}`
}

// 生成默认标题: YYYY.MM.DD
const generateDefaultTitle = (date = new Date()) => {
  return format(date, 'yyyy.MM.dd')
}

// 获取指定日期 00:00 时间戳
const getDateTimestamp = (date) => {
  return startOfDay(date).getTime()
}

// localStorage 读取（降级方案）
const loadJournalsFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load journals from storage:', error)
    return []
  }
}

// localStorage 保存（降级方案）
const saveJournalsToStorage = (journals) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journals))
  } catch (error) {
    console.error('Failed to save journals to storage:', error)
  }
}

// ============================================================================
// Hook
// ============================================================================

/**
 * 日记状态管理 Hook
 * @param {Object} [options] - 配置选项
 * @param {Object} [options.fileSystem] - 文件系统适配器（可选，无则降级到 localStorage）
 */
const JournalContext = createContext(null)

const useJournalStore = (options = {}) => {
  const { fileSystem } = options
  const [journals, setJournals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // 防抖写入相关
  const debounceTimersRef = useRef(new Map())
  const pendingWritesRef = useRef(new Map())
  const fileSystemRef = useRef(fileSystem)
  const hasMigratedRef = useRef(false)

  // 同步更新 fileSystem ref（不用 useEffect，直接赋值）
  fileSystemRef.current = fileSystem

  const migrateLocalJournalsToFS = useCallback(async (journalsToMigrate) => {
    const fs = fileSystemRef.current
    if (!fs || hasMigratedRef.current) return
    if (!Array.isArray(journalsToMigrate) || journalsToMigrate.length === 0) return

    try {
      if (!await fs.exists('journals')) {
        await fs.ensureDir('journals')
      }
      const years = await fs.list('journals')
      if (Array.isArray(years) && years.length > 0) {
        hasMigratedRef.current = true
        return
      }
    } catch (err) {
      console.error('[Journal] Failed to check journals directory:', err)
      return
    }

    for (const journal of journalsToMigrate) {
      const path = getJournalPath(journal.date)
      const content = serializeJournal(journal)
      try {
        const parts = path.split('/')
        const dir = parts.slice(0, -1).join('/')
        await fs.ensureDir(dir)
        await fs.write(path, content)
      } catch (err) {
        console.error(`Failed to migrate journal ${path}:`, err)
      }
    }
    hasMigratedRef.current = true
  }, [])

  // 从文件系统加载日记
  const loadFromFS = useCallback(async () => {
    if (!fileSystem) return null

    const loadedJournals = []

    // 扫描 journals 目录
    try {
      if (!await fileSystem.exists('journals')) {
        return null
      }

      // 获取年份目录
      const years = await fileSystem.list('journals')

      for (const yearDir of years) {
        if (!yearDir.isDirectory) continue

        // 获取月份目录
        const months = await fileSystem.list(yearDir.path)

        for (const monthDir of months) {
          if (!monthDir.isDirectory) continue

          // 获取日记文件
          const files = await fileSystem.list(monthDir.path)

          for (const file of files) {
            if (file.isDirectory || !file.name.endsWith('.md')) continue

            try {
              const content = await fileSystem.read(file.path)
              const journal = deserializeJournal(content)
              loadedJournals.push(journal)
            } catch (err) {
              console.error(`Failed to load journal ${file.path}:`, err)
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to scan journals directory:', err)
      return null
    }

    return loadedJournals.length > 0 ? loadedJournals : null
  }, [fileSystem])

  // 保存单个日记到文件系统
  const saveJournalToFS = useCallback(async (journal) => {
    const fs = fileSystemRef.current
    console.log('[Journal] saveJournalToFS called, fileSystem:', fs ? 'exists' : 'null')
    if (!fs) {
      // 降级到 localStorage（保存全部）
      setJournals(prev => {
        const next = prev.map(j => j.id === journal.id ? journal : j)
        if (!next.find(j => j.id === journal.id)) {
          next.push(journal)
        }
        saveJournalsToStorage(next)
        return next
      })
      return
    }

    const path = getJournalPath(journal.date)
    const content = serializeJournal(journal)

    try {
      // 确保目录存在
      const parts = path.split('/')
      const dir = parts.slice(0, -1).join('/')
      console.log('[Journal] ensureDir:', dir)
      await fs.ensureDir(dir)

      console.log('[Journal] writing to:', path)
      await fs.write(path, content)
      console.log('[Journal] write success')
    } catch (err) {
      console.error(`Failed to save journal ${path}:`, err)
    }

    // 同时更新 localStorage 备份
    setJournals(prev => {
      const next = prev.map(j => j.id === journal.id ? journal : j)
      if (!next.find(j => j.id === journal.id)) {
        next.push(journal)
      }
      saveJournalsToStorage(next)
      return next
    })
  }, [fileSystem])

  // 防抖保存
  const debouncedSaveJournal = useCallback((journal) => {
    const id = journal.id

    // 更新待写入队列
    pendingWritesRef.current.set(id, journal)

    // 清除之前的定时器
    const existingTimer = debounceTimersRef.current.get(id)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新定时器
    const timer = setTimeout(() => {
      const journalToSave = pendingWritesRef.current.get(id)
      if (journalToSave) {
        saveJournalToFS(journalToSave)
        pendingWritesRef.current.delete(id)
      }
      debounceTimersRef.current.delete(id)
    }, DEBOUNCE_DELAY)

    debounceTimersRef.current.set(id, timer)
  }, [saveJournalToFS])

  // 初始化加载
  useEffect(() => {
    let mounted = true

    const init = async () => {
      setIsLoading(true)

      // 尝试从文件系统加载
      const fsJournals = await loadFromFS()

      if (!mounted) return

      if (fsJournals) {
        setJournals(fsJournals)
      } else {
        // 降级到 localStorage
        const localJournals = loadJournalsFromStorage()
        setJournals(localJournals)
        migrateLocalJournalsToFS(localJournals)
      }

      setIsLoading(false)
    }

    init()

    return () => {
      mounted = false
      // 清理所有防抖定时器
      for (const timer of debounceTimersRef.current.values()) {
        clearTimeout(timer)
      }
    }
  }, [loadFromFS, migrateLocalJournalsToFS])

  // 计算属性：按日期分组的日记 Map<string, Journal>
  const journalsByDate = useMemo(() => {
    const map = new Map()
    journals.forEach(journal => {
      const dateKey = format(journal.date, 'yyyy-MM-dd')
      map.set(dateKey, journal)
    })
    return map
  }, [journals])

  // 计算属性：过往日记列表（按时间倒序）
  const pastJournals = useMemo(() => {
    return [...journals].sort((a, b) => b.date - a.date)
  }, [journals])

  // 获取或创建指定日期日记
  const getOrCreateJournalByDate = useCallback((date) => {
    if (!date) return null
    const dateObj = date instanceof Date ? date : new Date(date)
    const journalId = generateJournalId(dateObj)
    const existing = journals.find(j => j.id === journalId)

    if (existing) {
      return existing
    }

    // 创建新日记
    const newJournal = createJournalData(dateObj)

    // 立即更新状态
    setJournals(prev => [...prev, newJournal])

    // 保存到文件系统
    debouncedSaveJournal(newJournal)

    return newJournal
  }, [journals, debouncedSaveJournal])

  // 获取或创建今日日记
  const getTodayJournal = useCallback(() => {
    return getOrCreateJournalByDate(new Date())
  }, [getOrCreateJournalByDate])

  // 更新日记
  const updateJournal = useCallback((id, updates) => {
    setJournals(prev => {
      const next = prev.map(journal => {
        if (journal.id !== id) return journal
        const updated = { ...journal, ...updates, updatedAt: Date.now() }
        // 触发防抖保存
        debouncedSaveJournal(updated)
        return updated
      })
      return next
    })
  }, [debouncedSaveJournal])

  // 获取指定日期的日记
  const getJournalByDate = useCallback((date) => {
    const journalId = generateJournalId(date)
    return journals.find(j => j.id === journalId)
  }, [journals])

  // 获取指定 ID 的日记
  const getJournalById = useCallback((id) => {
    return journals.find(j => j.id === id)
  }, [journals])

  // 删除日记
  const deleteJournal = useCallback(async (id) => {
    const journal = journals.find(j => j.id === id)
    if (!journal) return

    // 从文件系统删除
    if (fileSystem) {
      const path = getJournalPath(journal.date)
      try {
        if (await fileSystem.exists(path)) {
          await fileSystem.delete(path)
        }
      } catch (err) {
        console.error(`Failed to delete journal ${path}:`, err)
      }
    }

    // 更新状态
    setJournals(prev => {
      const next = prev.filter(j => j.id !== id)
      saveJournalsToStorage(next)
      return next
    })
  }, [journals, fileSystem])

  // 立即刷新保存（用于同步前）
  const flush = useCallback(async () => {
    // 清除所有定时器并立即保存
    for (const [id, timer] of debounceTimersRef.current.entries()) {
      clearTimeout(timer)
      debounceTimersRef.current.delete(id)

      const journal = pendingWritesRef.current.get(id)
      if (journal) {
        await saveJournalToFS(journal)
        pendingWritesRef.current.delete(id)
      }
    }
  }, [saveJournalToFS])

  return {
    journals,
    journalsByDate,
    pastJournals,
    isLoading,
    getTodayJournal,
    getOrCreateJournalByDate,
    updateJournal,
    getJournalByDate,
    getJournalById,
    deleteJournal,
    flush
  }
}

export function JournalProvider({ children, fileSystem }) {
  const store = useJournalStore({ fileSystem })
  return createElement(JournalContext.Provider, { value: store }, children)
}

/**
 * 日记状态管理 Hook
 * - 若存在 Provider，优先使用共享状态
 * - 否则退回独立实例（兼容旧用法）
 */
export const useJournal = (options = {}) => {
  const context = useContext(JournalContext)
  if (context) return context
  return useJournalStore(options)
}
