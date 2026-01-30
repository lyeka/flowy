/**
 * [INPUT]: React useState/useEffect/useCallback/useMemo/useRef, format/task.js
 * [OUTPUT]: useGTD hook，提供任务 CRUD 和状态管理，支持文件系统持久化；calculateFocusState 专注度计算；isToday/isPast/isFuture 日期工具；星标功能；项目归属(projectId/columnId)
 * [POS]: stores 层核心状态模块，被所有 GTD 组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { serializeTasks, deserializeTasks } from '@/lib/format'

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

// localStorage 降级 key
const STORAGE_KEY = 'gtd-tasks'

// 文件路径
const TASK_PATHS = {
  [GTD_LISTS.INBOX]: 'tasks/inbox.json',
  [GTD_LISTS.TODAY]: 'tasks/today.json',
  [GTD_LISTS.NEXT]: 'tasks/next.json',
  [GTD_LISTS.SOMEDAY]: 'tasks/someday.json'
}

// 防抖延迟
const DEBOUNCE_DELAY = 500

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
      updatedAt: now,
      completedAt: null,
      dueDate: now,
      starred: false,
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

// localStorage 读取（降级方案）
const loadTasksFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data === null) return getDefaultTasks()
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// localStorage 保存（降级方案）
const saveTasksToStorage = (tasks) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

const getTodayBounds = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = start + 24 * 60 * 60 * 1000
  return { start, end }
}

// 导出日期工具函数供其他模块使用
export const isToday = (timestamp) => {
  if (!timestamp) return false
  const { start, end } = getTodayBounds()
  return timestamp >= start && timestamp < end
}

export const isFuture = (timestamp) => {
  if (!timestamp) return false
  const { end } = getTodayBounds()
  return timestamp >= end
}

export const isPast = (timestamp) => {
  if (!timestamp) return false
  const { start } = getTodayBounds()
  return timestamp < start
}

const getStartOfTomorrow = () => getTodayBounds().end

/* ========================================
   专注度计算
   ======================================== */

/**
 * 计算专注度状态
 * @param {Array} tasks - 所有任务
 * @returns {Object} 专注度状态
 */
export function calculateFocusState(tasks) {
  // 今日任务：dueDate 是今天且未完成
  const today = tasks.filter(t => isToday(t.dueDate) && !t.completed)
  // 过期任务：dueDate 在今天之前且未完成
  const overdue = tasks.filter(t => isPast(t.dueDate) && !t.completed && t.dueDate)

  // 主状态：基于 Today 数量
  // idle(0) → flow(1-2) → optimal(3-5) → busy(6-7) → overload(8+)
  let state = 'optimal'

  if (today.length === 0) {
    state = 'idle'
  } else if (today.length <= 2) {
    state = 'flow'
  } else if (today.length <= 5) {
    state = 'optimal'
  } else if (today.length <= 7) {
    state = 'busy'
  } else {
    state = 'overload'
  }

  return {
    state,
    todayCount: today.length,
    overdueCount: overdue.length,
    overdueTasks: overdue,
    todayTasks: today
  }
}

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

/**
 * GTD 状态管理 Hook
 * @param {Object} [options] - 配置选项
 * @param {Object} [options.fileSystem] - 文件系统适配器（可选，无则降级到 localStorage）
 */
export function useGTD(options = {}) {
  const { fileSystem } = options
  const [tasks, setTasks] = useState([])
  const [activeList, setActiveList] = useState(GTD_LISTS.INBOX)
  const [isLoading, setIsLoading] = useState(true)

  // 防抖写入相关
  const debounceTimerRef = useRef(null)
  const pendingWriteRef = useRef(null)

  // 从文件系统加载任务
  const loadFromFS = useCallback(async () => {
    if (!fileSystem) return null

    const allTasks = []

    for (const [list, path] of Object.entries(TASK_PATHS)) {
      try {
        if (await fileSystem.exists(path)) {
          const content = await fileSystem.read(path)
          const listTasks = deserializeTasks(content)
          // 标记任务所属列表
          listTasks.forEach(t => { t.list = list })
          allTasks.push(...listTasks)
        }
      } catch (err) {
        console.error(`Failed to load ${path}:`, err)
      }
    }

    // 加载已完成任务（当月）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const donePath = `tasks/done/${year}-${month}.json`

    try {
      if (await fileSystem.exists(donePath)) {
        const content = await fileSystem.read(donePath)
        const doneTasks = deserializeTasks(content)
        doneTasks.forEach(t => { t.list = GTD_LISTS.DONE; t.completed = true })
        allTasks.push(...doneTasks)
      }
    } catch (err) {
      console.error(`Failed to load ${donePath}:`, err)
    }

    return allTasks.length > 0 ? allTasks : null
  }, [fileSystem])

  // 保存到文件系统（防抖）
  const saveToFS = useCallback(async (tasksToSave) => {
    if (!fileSystem) {
      saveTasksToStorage(tasksToSave)
      return
    }

    // 按列表分组
    const grouped = {
      [GTD_LISTS.INBOX]: [],
      [GTD_LISTS.TODAY]: [],
      [GTD_LISTS.NEXT]: [],
      [GTD_LISTS.SOMEDAY]: [],
      [GTD_LISTS.DONE]: []
    }

    for (const task of tasksToSave) {
      if (task.completed) {
        grouped[GTD_LISTS.DONE].push(task)
      } else if (isToday(task.dueDate)) {
        grouped[GTD_LISTS.TODAY].push(task)
      } else if (isFuture(task.dueDate)) {
        grouped[GTD_LISTS.NEXT].push(task)
      } else {
        grouped[GTD_LISTS.SOMEDAY].push(task)
      }
    }

    // 写入各列表文件
    for (const [list, path] of Object.entries(TASK_PATHS)) {
      try {
        const content = serializeTasks(grouped[list])
        await fileSystem.write(path, content)
      } catch (err) {
        console.error(`Failed to save ${path}:`, err)
      }
    }

    // 写入已完成任务（按月归档）
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const donePath = `tasks/done/${year}-${month}.json`

    try {
      await fileSystem.ensureDir('tasks/done')
      const content = serializeTasks(grouped[GTD_LISTS.DONE])
      await fileSystem.write(donePath, content)
    } catch (err) {
      console.error(`Failed to save ${donePath}:`, err)
    }

    // 同时保存到 localStorage 作为备份
    saveTasksToStorage(tasksToSave)
  }, [fileSystem])

  // 防抖保存
  const debouncedSave = useCallback((tasksToSave) => {
    pendingWriteRef.current = tasksToSave

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingWriteRef.current) {
        saveToFS(pendingWriteRef.current)
        pendingWriteRef.current = null
      }
    }, DEBOUNCE_DELAY)
  }, [saveToFS])

  // 初始化加载
  useEffect(() => {
    let mounted = true

    const init = async () => {
      setIsLoading(true)

      // 尝试从文件系统加载
      const fsTasks = await loadFromFS()

      if (!mounted) return

      if (fsTasks) {
        setTasks(fsTasks)
      } else {
        // 降级到 localStorage
        setTasks(loadTasksFromStorage())
      }

      setIsLoading(false)
    }

    init()

    return () => {
      mounted = false
      // 清理防抖定时器
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [loadFromFS])

  // 任务变化时保存
  useEffect(() => {
    if (!isLoading && tasks.length > 0) {
      debouncedSave(tasks)
    }
  }, [tasks, isLoading, debouncedSave])

  // 添加任务
  const addTask = useCallback((title, list = GTD_LISTS.INBOX, projectOptions = {}) => {
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
      updatedAt: now,
      completedAt: list === GTD_LISTS.DONE ? now : null,
      dueDate,
      starred: false,
      notes: '',
      // 项目归属字段
      projectId: projectOptions.projectId || null,
      columnId: projectOptions.columnId || null
    }
    setTasks(prev => [task, ...prev])
    return task
  }, [])

  // 更新任务
  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
    ))
  }, [])

  // 删除任务
  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // 切换完成状态
  const toggleComplete = useCallback((id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t
      const now = Date.now()
      const nextCompleted = !t.completed
      return {
        ...t,
        completed: nextCompleted,
        completedAt: nextCompleted ? now : null,
        updatedAt: now,
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
        completedAt: list === GTD_LISTS.DONE ? now : null,
        updatedAt: now
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

  // 切换星标状态
  const toggleStar = useCallback((id) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, starred: !t.starred, updatedAt: Date.now() } : t
    ))
  }, [])

  // 加载任务(用于导入)
  const loadTasksFromData = useCallback((data) => {
    if (Array.isArray(data)) {
      setTasks(data)
    }
  }, [])

  // 立即刷新保存（用于同步前）
  const flush = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    if (pendingWriteRef.current) {
      await saveToFS(pendingWriteRef.current)
      pendingWriteRef.current = null
    }
  }, [saveToFS])

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

  // ═══════════════════════════════════════════════════════════════════════════
  // 预处理数据 - 供 FocusView 使用
  // ═══════════════════════════════════════════════════════════════════════════

  // 今日任务（包括过期）
  const todayTasks = useMemo(() => {
    return tasks.filter(t =>
      !t.completed && (isToday(t.dueDate) || isPast(t.dueDate))
    )
  }, [tasks])

  // 已完成任务数
  const completedToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks.filter(t =>
      t.completed && t.completedAt && new Date(t.completedAt) >= today
    ).length
  }, [tasks])

  // 过期任务
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && isPast(t.dueDate))
  }, [tasks])

  // 行星任务（今天或过期，必须有截止日期，星标优先，最多 6 个）
  const planetTasks = useMemo(() => {
    const now = new Date()
    now.setHours(23, 59, 59, 999)

    return tasks
      .filter(t => {
        if (t.completed) return false
        if (!t.dueDate) return false
        return t.dueDate <= now.getTime()
      })
      .sort((a, b) => {
        // 1. 星标优先
        if (a.starred !== b.starred) return (b.starred ? 1 : 0) - (a.starred ? 1 : 0)
        // 2. 过期任务优先（更紧急）
        if (a.dueDate !== b.dueDate) return a.dueDate - b.dueDate
        // 3. 按创建时间
        return new Date(a.createdAt) - new Date(b.createdAt)
      })
  }, [tasks])

  // 星球显示任务（前 6 个）
  const displayPlanetTasks = useMemo(() => planetTasks.slice(0, 6), [planetTasks])

  // 溢出任务（第 7 个及之后）
  const overflowTasks = useMemo(() => planetTasks.slice(6), [planetTasks])

  return {
    tasks,
    filteredTasks,
    activeList,
    setActiveList,
    counts,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    moveTask,
    toggleStar,
    loadTasks: loadTasksFromData,
    flush,
    // 预处理数据
    todayTasks,
    completedToday,
    overdueTasks,
    planetTasks: displayPlanetTasks,
    overflowTasks
  }
}
