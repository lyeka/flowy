/**
 * [INPUT]: 依赖 @/components/gtd/ProjectTaskCard，依赖 @dnd-kit/core，依赖 @dnd-kit/sortable，依赖 framer-motion
 * [OUTPUT]: 导出 ProjectColumn 组件
 * [POS]: 看板列组件，显示列内任务，支持任务拖拽，支持添加新任务
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, GripVertical } from 'lucide-react'
import { ProjectTaskCard } from './ProjectTaskCard'
import { snappy } from '@/lib/motion'
import { SortableTask } from './SortableTask'

export function ProjectColumn({
  column,
  tasks = [],
  onToggleComplete,
  onToggleStar,
  onTaskClick,
  onAddTask,
  isOver = false
}) {
  const { setNodeRef } = useDroppable({
    id: column.id
  })

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

  const taskIds = tasks.map(t => t.id)

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
        <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onToggleStar={onToggleStar}
                onTaskClick={onTaskClick}
              />
            ))}
          </AnimatePresence>
        </SortableContext>

        {/* 空状态提示 */}
        {tasks.length === 0 && !isAdding && (
          <div className="text-center py-8 text-muted-foreground text-xs">
            拖拽任务到此处
          </div>
        )}

        {/* 添加任务 */}
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
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={snappy}
            onClick={() => setIsAdding(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-border/50 text-muted-foreground text-sm hover:border-border hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加任务
          </motion.button>
        )}
      </div>
    </div>
  )
}
