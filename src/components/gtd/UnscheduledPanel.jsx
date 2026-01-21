/**
 * [INPUT]: 依赖 framer-motion，依赖 CalendarTaskChip
 * [OUTPUT]: 导出 UnscheduledPanel 组件
 * [POS]: 无日期任务面板，可折叠，支持拖拽到日历
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarTaskChip } from './CalendarTaskChip'
import { ChevronDown, ChevronRight, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { gentle, staggerContainer, staggerItem } from '@/lib/motion'

export function UnscheduledPanel({ tasks, onToggle }) {
  const [isExpanded, setIsExpanded] = useState(true)

  if (tasks.length === 0) return null

  return (
    <div className="w-64 border-l flex flex-col bg-muted/30">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 p-3 hover:bg-muted/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <Inbox className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">无日期任务</span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full ml-auto">
          {tasks.length}
        </span>
      </button>

      {/* 任务列表 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={gentle}
            className="overflow-hidden"
          >
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="p-2 flex flex-col gap-1"
            >
              {tasks.map(task => (
                <motion.div key={task.id} variants={staggerItem}>
                  <CalendarTaskChip
                    task={task}
                    onToggle={onToggle}
                  />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 提示 */}
      {isExpanded && (
        <p className="text-xs text-muted-foreground px-3 pb-3">
          拖拽到日历设置日期
        </p>
      )}
    </div>
  )
}
