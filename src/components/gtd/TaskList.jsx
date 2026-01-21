/**
 * [INPUT]: 依赖 @/components/gtd/TaskItem, framer-motion
 * [OUTPUT]: 导出 TaskList 组件
 * [POS]: 任务列表容器，处理空状态和动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { AnimatePresence, motion } from 'framer-motion'
import { TaskItem } from './TaskItem'
import { GTD_LIST_META } from '@/stores/gtd'
import { staggerContainer, staggerItem, smooth } from '@/lib/motion'
import { Inbox } from 'lucide-react'

export function TaskList({ tasks, activeList, onToggle, onMove, onDelete, onUpdateDate, onTaskClick }) {
  const meta = GTD_LIST_META[activeList]

  if (tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-muted-foreground"
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            ...smooth,
            repeat: Infinity,
            duration: 3
          }}
        >
          <Inbox className="h-12 w-12 mb-4 opacity-50" />
        </motion.div>
        <p className="text-sm">{meta.label} 暂无任务</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-2"
    >
      <AnimatePresence mode="popLayout">
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggle}
            onMove={onMove}
            onDelete={onDelete}
            onUpdateDate={onUpdateDate}
            onTaskClick={onTaskClick}
          />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
