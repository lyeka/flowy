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
  [GTD_LISTS.INBOX]: { label: '收集箱', icon: 'Inbox', color: 'text-muted-foreground' },
  [GTD_LISTS.TODAY]: { label: '今日待办', icon: 'Sun', color: 'text-muted-foreground' },
  [GTD_LISTS.NEXT]: { label: '下一步行动', icon: 'ArrowRight', color: 'text-muted-foreground' },
  [GTD_LISTS.SOMEDAY]: { label: '将来/也许', icon: 'Calendar', color: 'text-muted-foreground' },
  [GTD_LISTS.DONE]: { label: '已完成', icon: 'CheckCircle', color: 'text-muted-foreground' }
}

const STORAGE_KEY = 'gtd-tasks'

/* ========================================
   工具函数
   ======================================== */

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const loadTasks = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const saveTasks = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

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
    const task = {
      id: generateId(),
      title: title.trim(),
      list,
      completed: false,
      createdAt: Date.now(),
      dueDate: null,
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
      return {
        ...t,
        completed: !t.completed,
        list: !t.completed ? GTD_LISTS.DONE : t.list === GTD_LISTS.DONE ? GTD_LISTS.INBOX : t.list
      }
    }))
  }, [])

  // 移动任务到指定列表
  const moveTask = useCallback((id, list) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, list, completed: list === GTD_LISTS.DONE } : t))
  }, [])

  // 按列表筛选
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.list === activeList)
  }, [tasks, activeList])

  // 统计
  const counts = useMemo(() => {
    return Object.values(GTD_LISTS).reduce((acc, list) => {
      acc[list] = tasks.filter(t => t.list === list).length
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
    moveTask
  }
}
