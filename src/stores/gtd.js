/**
 * [INPUT]: 依赖 React useState/useEffect，依赖 localStorage API
 * [OUTPUT]: 导出 useGTD hook，提供任务 CRUD 和状态管理
 * [POS]: stores 层核心状态模块，被所有 GTD 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react'

/* ========================================
   常量定义
   ======================================== */

export const GTD_LISTS = {
  INBOX: 'inbox',
  TODAY: 'today',
  NEXT: 'next',
  SOMEDAY: 'someday',
  DONE: 'done'
}

export const GTD_LIST_META = {
  [GTD_LISTS.INBOX]: { key: 'inbox', icon: 'Inbox', color: 'text-muted-foreground' },
  [GTD_LISTS.TODAY]: { key: 'today', icon: 'Sun', color: 'text-muted-foreground' },
  [GTD_LISTS.NEXT]: { key: 'next', icon: 'ArrowRight', color: 'text-muted-foreground' },
  [GTD_LISTS.SOMEDAY]: { key: 'someday', icon: 'Calendar', color: 'text-muted-foreground' },
  [GTD_LISTS.DONE]: { key: 'done', icon: 'CheckCircle', color: 'text-muted-foreground' }
}

const STORAGE_KEY = 'gtd-tasks'

/* ========================================
   工具函数
   ======================================== */

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const getDefaultTasks = () => {
  const now = Date.now()
  return [
    {
      id: generateId(),
      title: 'Sonnet 18',
      list: GTD_LISTS.TODAY,
      completed: false,
      createdAt: now,
      completedAt: null,
      dueDate: now,
      notes: [
        "Shall I compare thee to a summer's day?",
        "Thou art more lovely and more temperate:",
        "Rough winds do shake the darling buds of May,",
        "And summer's lease hath all too short a date;",
        "Sometime too hot the eye of heaven shines,",
        "And often is his gold complexion dimm'd;",
        "And every fair from fair sometime declines,",
        "By chance or nature's changing course untrimm'd;",
        "But thy eternal summer shall not fade,",
        "Nor lose possession of that fair thou ow'st;",
        "Nor shall death brag thou wander'st in his shade,",
        "When in eternal lines to time thou grow'st:",
        "So long as men can breathe or eyes can see,",
        "So long lives this, and this gives life to thee."
      ].join('\n')
    }
  ]
}

const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data === null) return getDefaultTasks()
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

const getTodayBounds = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000
  return { start, end }
}

const isToday = (timestamp) => {
  if (!timestamp) return false
  const { start, end } = getTodayBounds()
  return timestamp >= start && timestamp < end
}

const isFuture = (timestamp) => {
  if (!timestamp) return false
  const { end } = getTodayBounds()
  return timestamp >= end
}

const isPast = (timestamp) => {
  if (!timestamp) return false
  const { start } = getTodayBounds()
  return timestamp < start
}

const getStartOfTomorrow = () => getTodayBounds().end

const isTaskInList = (task, list) => {
  switch (list) {
    case GTD_LISTS.INBOX:
      return !task.completed
    case GTD_LISTS.TODAY:
      return !task.completed && isToday(task.dueDate)
    case GTD_LISTS.NEXT:
      return !task.completed && isFuture(task.dueDate)
    case GTD_LISTS.SOMEDAY:
      return !task.completed && (!task.dueDate || isPast(task.dueDate))
    case GTD_LISTS.DONE:
      return task.completed
    default:
      return task.list === list
  }
}

const getSortTime = (task) => task.dueDate ?? task.createdAt ?? 0
const getDoneSortTime = (task) => task.completedAt ?? task.dueDate ?? task.createdAt ?? 0

/* ========================================
   GTD Hook
   ======================================== */

export function useGTD() {
  const [tasks, setTasks] = useState(loadTasks)
  const [activeList, setActiveList] = useState(GTD_LISTS.INBOX)

  // 持久化
  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  // 添加任务
  const addTask = useCallback((title, list = GTD_LISTS.INBOX) => {
    if (!title.trim()) return
    const now = Date.now()
    const dueDate = list === GTD_LISTS.TODAY
      ? now
      : list === GTD_LISTS.NEXT
        ? getStartOfTomorrow()
        : null
    const task = {
      id: generateId(),
      title: title.trim(),
      list,
      completed: list === GTD_LISTS.DONE,
      createdAt: now,
      completedAt: list === GTD_LISTS.DONE ? now : null,
      dueDate,
      notes: ''
    }
    setTasks(prev => [task, ...prev])
    return task
  }, [])

  // 更新任务
  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  // 删除任务
  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // 切换完成状态
  const toggleComplete = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const nextCompleted = !t.completed
      return {
        ...t,
        completed: nextCompleted,
        completedAt: nextCompleted ? Date.now() : null,
        list: nextCompleted ? GTD_LISTS.DONE : t.list === GTD_LISTS.DONE ? GTD_LISTS.INBOX : t.list
      }
    }))
  }, [])

  // 移动任务到指定列表
  const moveTask = useCallback((id, list) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const now = Date.now()
      const next = {
        ...t,
        list,
        completed: list === GTD_LISTS.DONE,
        completedAt: list === GTD_LISTS.DONE ? now : null
      }
      if (list === GTD_LISTS.TODAY) {
        next.dueDate = now
      } else if (list === GTD_LISTS.NEXT) {
        next.dueDate = isFuture(next.dueDate) ? next.dueDate : getStartOfTomorrow()
      } else if (list === GTD_LISTS.SOMEDAY) {
        next.dueDate = null
      }
      return next
    }))
  }, [])

  // 加载任务(用于导入)
  const loadTasksFromData = useCallback((data) => {
    if (Array.isArray(data)) {
      setTasks(data)
    }
  }, [])

  // 按列表筛选
  const filteredTasks = useMemo(() => {
    const listTasks = tasks.filter(t => isTaskInList(t, activeList))
    return listTasks.sort((a, b) => {
      if (activeList === GTD_LISTS.DONE) {
        return getDoneSortTime(b) - getDoneSortTime(a)
      }
      if (activeList === GTD_LISTS.INBOX) {
        return getSortTime(a) - getSortTime(b)
      }
      return getSortTime(a) - getSortTime(b)
    })
  }, [tasks, activeList])

  // 统计
  const counts = useMemo(() => {
    return Object.values(GTD_LISTS).reduce((acc, list) => {
      acc[list] = tasks.filter(t => isTaskInList(t, list)).length
      return acc
    }, {})
  }, [tasks])

  return {
    tasks,
    filteredTasks,
    activeList,
    setActiveList,
    counts,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    loadTasks: loadTasksFromData
  }
}
