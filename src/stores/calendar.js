/**
 * [INPUT]: 依赖 React useMemo，依赖日期计算逻辑
 * [OUTPUT]: 导出 useCalendar hook，提供日历网格数据和任务分组
 * [POS]: stores 层日历状态模块，被 CalendarView 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo, useCallback } from 'react'

/* ========================================
   日期工具函数
   ======================================== */

const toDateKey = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const isSameDay = (d1, d2) => toDateKey(d1) === toDateKey(d2)

const isToday = (date) => isSameDay(date, new Date())

/* ========================================
   日历网格生成
   ======================================== */

const getMonthGrid = (year, month) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay() // 0=周日
  const daysInMonth = lastDay.getDate()

  const grid = []
  let week = []

  // 填充上月空白
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month, 1 - startOffset + i)
    week.push({ date: d, isCurrentMonth: false, key: toDateKey(d) })
  }

  // 当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day)
    week.push({ date: d, isCurrentMonth: true, key: toDateKey(d) })
    if (week.length === 7) {
      grid.push(week)
      week = []
    }
  }

  // 填充下月空白
  let nextDay = 1
  while (week.length > 0 && week.length < 7) {
    const d = new Date(year, month + 1, nextDay++)
    week.push({ date: d, isCurrentMonth: false, key: toDateKey(d) })
  }
  if (week.length) grid.push(week)

  return grid
}

const getWeekGrid = (year, month, day) => {
  const current = new Date(year, month, day)
  const dayOfWeek = current.getDay()
  const startOfWeek = new Date(year, month, day - dayOfWeek)

  const week = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    week.push({
      date: d,
      isCurrentMonth: d.getMonth() === month,
      key: toDateKey(d)
    })
  }
  return [week]
}

/* ========================================
   日历 Hook
   ======================================== */

export function useCalendar(tasks) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month' | 'week'

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const day = currentDate.getDate()

  // 按日期分组任务
  const { tasksByDate, unscheduledTasks } = useMemo(() => {
    const byDate = new Map()
    const unscheduled = []

    tasks.forEach(task => {
      if (task.dueDate) {
        const key = toDateKey(task.dueDate)
        if (!byDate.has(key)) byDate.set(key, [])
        byDate.get(key).push(task)
      } else if (!task.completed) {
        unscheduled.push(task)
      }
    })

    return { tasksByDate: byDate, unscheduledTasks: unscheduled }
  }, [tasks])

  // 日历网格
  const grid = useMemo(() => {
    return viewMode === 'month'
      ? getMonthGrid(year, month)
      : getWeekGrid(year, month, day)
  }, [year, month, day, viewMode])

  // 导航
  const goToday = useCallback(() => setCurrentDate(new Date()), [])

  const goPrev = useCallback(() => {
    setCurrentDate(d => {
      const next = new Date(d)
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() - 1)
      } else {
        next.setDate(next.getDate() - 7)
      }
      return next
    })
  }, [viewMode])

  const goNext = useCallback(() => {
    setCurrentDate(d => {
      const next = new Date(d)
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() + 1)
      } else {
        next.setDate(next.getDate() + 7)
      }
      return next
    })
  }, [viewMode])

  // 格式化标题
  const title = useMemo(() => {
    return { year, month }
  }, [year, month])

  return {
    grid,
    tasksByDate,
    unscheduledTasks,
    currentDate,
    viewMode,
    setViewMode,
    title,
    goToday,
    goPrev,
    goNext,
    isToday,
    toDateKey
  }
}
