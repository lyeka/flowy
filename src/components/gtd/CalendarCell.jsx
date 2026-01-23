/**
 * [INPUT]: 依赖 framer-motion，依赖 CalendarTaskChip, JournalChip，依赖 @/components/ui/popover, @/components/ui/button, react-i18next, @/lib/platform
 * [OUTPUT]: 导出 CalendarCell 组件
 * [POS]: 日历单日格子，显示日期、日记和任务列表，支持拖放，移动端优化尺寸
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { isMobile } from '@/lib/platform'
import { CalendarTaskChip } from './CalendarTaskChip'
import { JournalChip } from './JournalChip'
import { Plus, BookText, CheckSquare } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const MAX_VISIBLE = 3

export function CalendarCell({ cell, tasks = [], journal, isToday, onDrop, onAddEntry, onToggle, onJournalClick }) {
  const { t } = useTranslation()
  const mobile = isMobile()
  const [isDragOver, setIsDragOver] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const visibleTasks = tasks.slice(0, mobile ? 2 : MAX_VISIBLE)
  const moreCount = tasks.length - (mobile ? 2 : MAX_VISIBLE)

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

  const handlePick = (type) => {
    onAddEntry?.(cell.date, type)
    setPickerOpen(false)
  }

  return (
    <motion.div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "p-1 border-b border-r flex flex-col transition-colors group",
        mobile ? "min-h-20" : "min-h-24",
        !cell.isCurrentMonth && "bg-muted/30",
        isDragOver && "bg-primary/10 ring-2 ring-primary/50 ring-inset"
      )}
    >
      {/* 日期头 - 移动端减小尺寸 */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={cn(
            "flex items-center justify-center rounded-full",
            mobile ? "text-xs w-6 h-6" : "text-sm w-7 h-7",
            isToday && "bg-primary text-primary-foreground font-bold",
            !cell.isCurrentMonth && "text-muted-foreground"
          )}
        >
          {cell.date.getDate()}
        </span>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "p-1 hover:bg-muted rounded transition-opacity",
                mobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
            >
              <Plus className={cn(mobile ? "h-4 w-4" : "h-3 w-3", "text-muted-foreground")} />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-2">
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handlePick('journal')}
              >
                <BookText className="h-4 w-4 text-primary" />
                {t('calendar.createJournal')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start gap-2"
                onClick={() => handlePick('task')}
              >
                <CheckSquare className="h-4 w-4 text-primary" />
                {t('calendar.createTask')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 任务和日记列表 */}
      <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
        {/* 日记 chip（如果存在） */}
        {journal && (
          <JournalChip
            journal={journal}
            onClick={() => onJournalClick?.(journal)}
          />
        )}

        {/* 任务 chips */}
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
