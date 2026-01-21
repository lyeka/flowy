/**
 * [INPUT]: 依赖 framer-motion，依赖 CalendarTaskChip
 * [OUTPUT]: 导出 CalendarCell 组件
 * [POS]: 日历单日格子，显示日期和任务列表，支持拖放
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CalendarTaskChip } from './CalendarTaskChip'
import { Plus } from 'lucide-react'

const MAX_VISIBLE = 3

export function CalendarCell({ cell, tasks = [], isToday, onDrop, onAddTask, onToggle }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const visibleTasks = tasks.slice(0, MAX_VISIBLE)
  const moreCount = tasks.length - MAX_VISIBLE

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) onDrop(taskId, cell.date)
  }

  const handleClick = () => {
    onAddTask(cell.date)
  }

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "min-h-24 p-1 border-b border-r flex flex-col",
        "transition-colors group",
        !cell.isCurrentMonth && "bg-muted/30",
        isDragOver && "bg-primary/10 ring-2 ring-primary/50 ring-inset"
      )}
    >
      {/* 日期头 */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "text-sm w-7 h-7 flex items-center justify-center rounded-full",
            isToday && "bg-primary text-primary-foreground font-bold",
            !cell.isCurrentMonth && "text-muted-foreground"
          )}
        >
          {cell.date.getDate()}
        </span>
        <button
          onClick={handleClick}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded transition-opacity"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {visibleTasks.map(task => (
            <CalendarTaskChip
              key={task.id}
              task={task}
              onToggle={onToggle}
            />
          ))}
        </AnimatePresence>
        {moreCount > 0 && (
          <span className="text-xs text-muted-foreground px-2">
            +{moreCount} 更多
          </span>
        )}
      </div>
    </motion.div>
  )
}
