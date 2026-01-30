/**
 * [INPUT]: 依赖 @/components/ui/progress，依赖 @/components/gtd/ProjectTaskCard，依赖 @dnd-kit/core，依赖 @dnd-kit/sortable，依赖 framer-motion
 * [OUTPUT]: 导出 ProjectColumn 组件
 * [POS]: 看板列组件，显示列内任务，支持任务拖拽，支持添加新任务，显示进度百分比，已完成任务沉底
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, GripVertical } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { ProjectTaskCard } from './ProjectTaskCard'
import { snappy } from '@/lib/motion'
import { SortableTask } from './SortableTask'

export function ProjectColumn({
  column,
  tasks = [],
  onToggleComplete,
  onToggleStar,
  onUpdateDate,
  onTaskClick,
  onAddTask,
  isOver = false
}) {
  const { setNodeRef } = useDroppable({
    id: column.id
  })

  // =====================================================
  // 进度计算 (完成数 / 总数)
  // =====================================================
  const { completedCount, totalCount, progress } = useMemo(() => {
    const completed = tasks.filter(t => t.completed).length
    const total = tasks.length
    return {
      completedCount: completed,
      totalCount: total,
      progress: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [tasks])

  // =====================================================
  // 任务排序 (未完成在前，已完成沉底)
  // =====================================================
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // 已完成沉底
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      // 同组按 order 排序
      return (a.order || 0) - (b.order || 0)
    })
  }, [tasks])

  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(column.id, newTaskTitle.trim())
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddTask()
    } else if (e.key === 'Escape') {
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  const taskIds = sortedTasks.map(t => t.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-w-[280px] max-w-[320px] bg-muted/30 rounded-lg',
        'border transition-colors',
        isOver ? 'border-primary bg-muted/50' : 'border-transparent'
      )}
    >
      {/* 列头 */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
        <h3 className="flex-1 font-medium text-sm">{column.title}</h3>
        {/* 进度条 + 百分比 */}
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-12 h-1" />
          <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
            {totalCount > 0 ? `${progress}%` : '—'}
          </span>
        </div>
      </div>

      {/* 添加任务区域 - 固定在列头下方 */}
      <div className="px-3 pt-3 pb-2 border-b border-border/30">
        {isAdding ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={snappy}
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newTaskTitle.trim()) {
                  setIsAdding(false)
                }
              }}
              placeholder="任务标题..."
              autoFocus
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
          </motion.div>
        ) : (
          <motion.button
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={snappy}
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-dashed border-border/50 text-muted-foreground text-xs hover:border-border hover:text-foreground hover:bg-background/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            添加任务
          </motion.button>
        )}
      </div>

      {/* 任务列表 - 可滚动 */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto min-h-0">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {sortedTasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onToggleStar={onToggleStar}
                onUpdateDate={onUpdateDate}
                onTaskClick={onTaskClick}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* 空状态提示 */}
        {sortedTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            拖拽任务到此处
          </div>
        )}
      </div>
    </div>
  )
}
