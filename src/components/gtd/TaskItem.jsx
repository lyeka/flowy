/**
 * [INPUT]: 依赖 @/components/ui/checkbox, @/stores/gtd, framer-motion, lucide-react
 * [OUTPUT]: 导出 TaskItem 组件
 * [POS]: 单个任务项渲染，支持完成、编辑、移动、删除、日期设置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { MoreHorizontal, Trash2, ArrowRight, Inbox, Sun, Calendar, CheckCircle, CalendarDays, X } from 'lucide-react'
import { snappy } from '@/lib/motion'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

const formatDate = (timestamp) => {
  if (!timestamp) return null
  const d = new Date(timestamp)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === tomorrow.toDateString()) return '明天'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function TaskItem({ task, onToggle, onMove, onDelete, onUpdateDate }) {
  const [dateOpen, setDateOpen] = useState(false)
  const dateStr = formatDate(task.dueDate)

  const getQuickDate = (type) => {
    const now = new Date()
    switch (type) {
      case 'today':
        return now.getTime()
      case 'tomorrow':
        now.setDate(now.getDate() + 1)
        return now.getTime()
      case 'next-week':
        now.setDate(now.getDate() + 7)
        return now.getTime()
      case 'next-month':
        now.setMonth(now.getMonth() + 1)
        return now.getTime()
      default:
        return null
    }
  }

  const handleQuickDate = (type) => {
    const timestamp = getQuickDate(type)
    onUpdateDate?.(task.id, timestamp)
    setDateOpen(false)
  }

  const handleCalendarSelect = (date) => {
    if (date) {
      onUpdateDate?.(task.id, date.getTime())
      setDateOpen(false)
    }
  }

  const handleDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value).getTime() : null
    onUpdateDate?.(task.id, date)
    setDateOpen(false)
  }

  const handleClearDate = () => {
    onUpdateDate?.(task.id, null)
    setDateOpen(false)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={snappy}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border bg-card",
        "hover:shadow-sm transition-shadow"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-5 w-5 shadow-lg ring-1 ring-border"
      />
      <span className={cn(
        "flex-1 text-sm",
        task.completed && "line-through text-muted-foreground"
      )}>
        {task.title}
      </span>

      {/* 日期显示/编辑 */}
      {onUpdateDate && (
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                dateStr
                  ? "text-primary bg-primary/10 hover:bg-primary/20"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted"
              )}
            >
              <CalendarDays className="h-3 w-3" />
              {dateStr || '设置日期'}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            {/* 快捷日期按钮 */}
            <div className="flex gap-2 mb-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickDate('today')}
                className="text-xs"
              >
                今天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickDate('tomorrow')}
                className="text-xs"
              >
                明天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickDate('next-week')}
                className="text-xs"
              >
                下周
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickDate('next-month')}
                className="text-xs"
              >
                下个月
              </Button>
            </div>

            {/* 日历选择器 */}
            <div className="border-t pt-3">
              <CalendarComponent
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate) : undefined}
                onSelect={handleCalendarSelect}
                className="rounded-md border"
              />
              {task.dueDate && (
                <button
                  onClick={handleClearDate}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive mt-2"
                >
                  <X className="h-3 w-3" />
                  清除日期
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(GTD_LIST_META).map(([key, meta]) => {
            if (key === task.list) return null
            const Icon = ICONS[meta.icon]
            return (
              <DropdownMenuItem key={key} onClick={() => onMove(task.id, key)}>
                <Icon className={cn("h-4 w-4 mr-2", meta.color)} />
                移动到 {meta.label}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete(task.id)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  )
}
