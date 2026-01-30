/**
 * [INPUT]: 依赖 lucide-react 图标，依赖 framer-motion，依赖 react-i18next，依赖 @/stores/gtd
 * [OUTPUT]: 导出 ProjectTaskCard 组件
 * [POS]: 看板任务卡片，显示任务信息，支持拖拽，显示 GTD 归属标签
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Calendar, Star, CheckCircle2, Circle } from 'lucide-react'
import { GTD_LISTS } from '@/stores/gtd'
import { snappy } from '@/lib/motion'

// GTD 列表标签颜色
const GTD_TAG_COLORS = {
  [GTD_LISTS.INBOX]: 'bg-slate-100 text-slate-600',
  [GTD_LISTS.TODAY]: 'bg-amber-100 text-amber-700',
  [GTD_LISTS.NEXT]: 'bg-blue-100 text-blue-700',
  [GTD_LISTS.SOMEDAY]: 'bg-purple-100 text-purple-700',
  [GTD_LISTS.DONE]: 'bg-green-100 text-green-700'
}

// GTD 列表标签文本
const GTD_TAG_KEYS = {
  [GTD_LISTS.INBOX]: 'inbox',
  [GTD_LISTS.TODAY]: 'today',
  [GTD_LISTS.NEXT]: 'next',
  [GTD_LISTS.SOMEDAY]: 'someday',
  [GTD_LISTS.DONE]: 'done'
}

export function ProjectTaskCard({
  task,
  onToggleComplete,
  onToggleStar,
  onClick,
  isDragging = false,
  className
}) {
  const { t } = useTranslation()

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const dueDate = formatDate(task.dueDate)
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed
  const gtdList = task.list || GTD_LISTS.INBOX

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={snappy}
      onClick={onClick}
      className={cn(
        'p-3 bg-card rounded-lg border border-border/50 cursor-pointer',
        'hover:border-border hover:shadow-sm transition-all',
        isDragging && 'shadow-lg opacity-90',
        task.completed && 'opacity-60',
        className
      )}
    >
      {/* 标题行 */}
      <div className="flex items-start gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(task.id)
          }}
          className="mt-0.5 flex-shrink-0"
        >
          {task.completed ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        <span className={cn(
          'flex-1 text-sm leading-tight',
          task.completed && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </span>
        {task.starred && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(task.id)
            }}
          >
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
          </button>
        )}
      </div>

      {/* 元信息行 */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {/* 截止日期 */}
        {dueDate && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs',
            isOverdue ? 'text-destructive' : 'text-muted-foreground'
          )}>
            <Calendar className="h-3 w-3" />
            {dueDate}
          </span>
        )}

        {/* GTD 归属标签 */}
        {gtdList && gtdList !== GTD_LISTS.DONE && (
          <span className={cn(
            'text-xs px-1.5 py-0.5 rounded',
            GTD_TAG_COLORS[gtdList]
          )}>
            {t(`gtd.${GTD_TAG_KEYS[gtdList]}`)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
