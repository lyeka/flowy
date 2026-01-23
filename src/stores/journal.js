/**
 * [INPUT]: React useState/useEffect/useMemo, date-fns, localStorage API
 * [OUTPUT]: useJournal hook, 日记 CRUD 操作
 * [POS]: 日记状态管理中心，与 gtd.js 平行，管理独立的日记数据，支持指定日期创建并实时同步
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useMemo } from 'react'
import { format, startOfDay } from 'date-fns'

// ============================================================================
// 常量定义
// ============================================================================

const STORAGE_KEY = 'flowy-journal-storage'

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

// ============================================================================
// Hook
// ============================================================================

export const useJournal = () => {
  const [journals, setJournals] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load journals:', error)
      return []
    }
  })

  const persistJournals = (nextJournals) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextJournals))
    } catch (error) {
      console.error('Failed to save journals:', error)
    }
  }

  // 保存到 localStorage（兜底：防止外部更新漏写）
  useEffect(() => {
    persistJournals(journals)
  }, [journals])

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
  const getOrCreateJournalByDate = (date) => {
    if (!date) return null
    const dateObj = date instanceof Date ? date : new Date(date)
    const journalId = generateJournalId(dateObj)
    const existing = journals.find(j => j.id === journalId)

    if (existing) {
      return existing
    }

    // 创建新日记
    const newJournal = {
      id: journalId,
      date: getDateTimestamp(dateObj),
      title: generateDefaultTitle(dateObj),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setJournals(prev => {
      const next = [...prev, newJournal]
      persistJournals(next)
      return next
    })
    return newJournal
  }

  // 获取或创建今日日记
  const getTodayJournal = () => getOrCreateJournalByDate(new Date())

  // 更新日记
  const updateJournal = (id, updates) => {
    setJournals(prev => {
      const next = prev.map(journal =>
        journal.id === id
          ? { ...journal, ...updates, updatedAt: Date.now() }
          : journal
      )
      persistJournals(next)
      return next
    })
  }

  // 获取指定日期的日记
  const getJournalByDate = (date) => {
    const journalId = generateJournalId(date)
    return journals.find(j => j.id === journalId)
  }

  // 获取指定 ID 的日记
  const getJournalById = (id) => {
    return journals.find(j => j.id === id)
  }

  // 删除日记（虽然设计上不鼓励删除，但保留接口）
  const deleteJournal = (id) => {
    setJournals(prev => {
      const next = prev.filter(j => j.id !== id)
      persistJournals(next)
      return next
    })
  }

  return {
    journals,
    journalsByDate,
    pastJournals,
    getTodayJournal,
    getOrCreateJournalByDate,
    updateJournal,
    getJournalByDate,
    getJournalById,
    deleteJournal
  }
}
