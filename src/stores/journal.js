/**
 * [INPUT]: React useState/useEffect/useMemo, date-fns, localStorage API
 * [OUTPUT]: useJournal hook, 日记 CRUD 操作
 * [POS]: 日记状态管理中心，与 gtd.js 平行，管理独立的日记数据
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

// 生成默认标题: HH:mm · 小记
const generateDefaultTitle = () => {
  return `${format(new Date(), 'HH:mm')} · 小记`
}

// 获取当天 00:00 时间戳
const getTodayTimestamp = () => {
  return startOfDay(new Date()).getTime()
}

// ============================================================================
// Hook
// ============================================================================

export const useJournal = () => {
  const [journals, setJournals] = useState([])

  // 从 localStorage 加载日记
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setJournals(parsed)
      }
    } catch (error) {
      console.error('Failed to load journals:', error)
    }
  }, [])

  // 保存到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journals))
    } catch (error) {
      console.error('Failed to save journals:', error)
    }
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

  // 获取或创建今日日记
  const getTodayJournal = () => {
    const today = new Date()
    const todayId = generateJournalId(today)
    const existing = journals.find(j => j.id === todayId)

    if (existing) {
      return existing
    }

    // 创建新日记
    const newJournal = {
      id: todayId,
      date: getTodayTimestamp(),
      title: generateDefaultTitle(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    setJournals(prev => [...prev, newJournal])
    return newJournal
  }

  // 更新日记
  const updateJournal = (id, updates) => {
    setJournals(prev =>
      prev.map(journal =>
        journal.id === id
          ? { ...journal, ...updates, updatedAt: Date.now() }
          : journal
      )
    )
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
    setJournals(prev => prev.filter(j => j.id !== id))
  }

  return {
    journals,
    journalsByDate,
    pastJournals,
    getTodayJournal,
    updateJournal,
    getJournalByDate,
    getJournalById,
    deleteJournal
  }
}
