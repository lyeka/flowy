/**
 * [INPUT]: 依赖 lucide-react 图标，依赖 framer-motion，依赖 @/components/ui/popover，依赖 @/components/ui/calendar，依赖 @/components/ui/context-menu，依赖 @/components/ui/dialog
 * [OUTPUT]: 导出 ProjectTaskCard 组件
 * [POS]: 看板任务卡片，显示任务信息，支持拖拽，支持快速设置日期（Popover + Calendar），右键菜单编辑标题
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Star, CheckCircle2, Circle, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ProjectTaskCard({
  task,
  onToggleComplete,
  onToggleStar,
  onUpdateDate,
  onUpdateTitle,
  onDelete,
  onClick,
  isDragging = false,
  className
}) {
  const { t } = useTranslation()
  const [dateOpen, setDateOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)

  // 格式化日期
  const formatDate = (timestamp) => {
    if (!timestamp) return null
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 处理日历选择
  const handleCalendarSelect = (date) => {
    if (date) {
      const selected = new Date(date)
      selected.setHours(0, 0, 0, 0)
      onUpdateDate(task.id, selected.getTime())
    }
    setDateOpen(false)
  }

  // 打开编辑弹窗
  const handleOpenEdit = () => {
    setEditTitle(task.title)
    setEditDialogOpen(true)
  }

  // 保存标题
  const handleSaveTitle = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title && onUpdateTitle) {
      onUpdateTitle(task.id, trimmed)
    }
    setEditDialogOpen(false)
  }

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    }
  }

  const dueDate = formatDate(task.dueDate)
  const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
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
              {/* 日期选择 */}
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <button className={cn(
                    'inline-flex items-center gap-1 text-xs hover:bg-muted-foreground/10 rounded px-1.5 py-0.5 transition-colors',
                    isOverdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    <CalendarDays className="h-3 w-3" />
                    {dueDate || '设置日期'}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={handleCalendarSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleOpenEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            编辑标题
          </ContextMenuItem>
          {onDelete && (
            <ContextMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>

      {/* 编辑标题弹窗 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>编辑任务</DialogTitle>
            <DialogDescription className="sr-only">
              修改任务标题
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="任务标题..."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveTitle}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
