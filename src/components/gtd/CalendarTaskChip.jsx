/**
 * [INPUT]: 依赖 framer-motion，依赖 @/stores/gtd
 * [OUTPUT]: 导出 CalendarTaskChip 组件
 * [POS]: 日历格子内的任务小卡片，支持拖拽
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { snappy } from '@/lib/motion'

export function CalendarTaskChip({ task, onToggle, onClick }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={snappy}
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className={cn(
        "text-xs px-2 py-1 rounded truncate cursor-grab active:cursor-grabbing",
        "hover:ring-1 hover:ring-primary/50 transition-shadow",
        task.completed
          ? "bg-muted text-muted-foreground line-through"
          : "bg-primary/10 text-primary"
      )}
    >
      {task.title}
    </motion.div>
  )
}
