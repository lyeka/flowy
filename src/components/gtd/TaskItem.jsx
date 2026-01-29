/**
 * [INPUT]: 依赖 @/components/ui/checkbox, @/stores/gtd, framer-motion, lucide-react, react-i18next, @/lib/platform, @/lib/haptics
 * [OUTPUT]: 导出 TaskItem 组件
 * [POS]: 单个任务项渲染，支持完成、编辑、移动、删除、日期设置、星标切换，移动端支持滑动手势和长按菜单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, useMotionValue, useTransform } from 'framer-motion'
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
import { ActionSheet } from './ActionSheet'
import { cn } from '@/lib/utils'
import { isMobile } from '@/lib/platform'
import { hapticsLight, hapticsSuccess, hapticsWarning } from '@/lib/haptics'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { MoreHorizontal, Trash2, ArrowRight, Inbox, Sun, Calendar, CheckCircle, CalendarDays, X, Check, Star } from 'lucide-react'
import { snappy, bouncy } from '@/lib/motion'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function TaskItem({ task, onToggle, onMove, onDelete, onUpdateDate, onTaskClick, onToggleStar }) {
  const { t } = useTranslation()
  const mobile = isMobile()
  const [dateOpen, setDateOpen] = useState(false)
  const [actionSheetOpen, setActionSheetOpen] = useState(false)
  const [calendarWidth, setCalendarWidth] = useState(null)
  const calendarRef = useRef(null)
  const longPressTimer = useRef(null)
  const x = useMotionValue(0)

  // 滑动背景颜色
  const backgroundColor = useTransform(
    x,
    [-100, -50, 0, 50, 100],
    ['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0)', 'rgba(255, 255, 255, 0)', 'rgba(34, 197, 94, 0)', 'rgba(34, 197, 94, 0.1)']
  )

  const formatDate = (timestamp) => {
    if (!timestamp) return null
    const d = new Date(timestamp)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) return t('calendar.today')
    if (d.toDateString() === tomorrow.toDateString()) return t('calendar.tomorrow')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

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

  // 长按处理
  const handlePointerDown = (e) => {
    if (!mobile) return
    longPressTimer.current = setTimeout(() => {
      hapticsLight()
      setActionSheetOpen(true)
    }, 500)
  }

  const handlePointerUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // 滑动手势处理
  const handleDragEnd = (event, info) => {
    if (!mobile) return

    const offset = info.offset.x
    const velocity = info.velocity.x

    // 右滑完成任务
    if (offset > 100 || velocity > 500) {
      hapticsSuccess()
      onToggle(task.id)
      x.set(0)
      return
    }

    // 左滑删除任务
    if (offset < -100 || velocity < -500) {
      hapticsWarning()
      onDelete(task.id)
      return
    }

    // 回弹
    x.set(0)
  }

  // ActionSheet 操作列表
  const actionSheetActions = [
    {
      icon: Star,
      label: task.starred ? '取消星标' : '添加星标',
      onPress: () => onToggleStar?.(task.id)
    },
    {
      icon: CalendarDays,
      label: t('tasks.setDate'),
      onPress: () => setDateOpen(true)
    },
    ...Object.entries(GTD_LIST_META)
      .filter(([key]) => key !== task.list)
      .map(([key, meta]) => ({
        icon: ICONS[meta.icon],
        label: `${t('tasks.moveTo')} ${t(`gtd.${meta.key}`)}`,
        onPress: () => onMove(task.id, key)
      })),
    {
      icon: Trash2,
      label: t('tasks.delete'),
      destructive: true,
      onPress: () => onDelete(task.id)
    }
  ]

  useEffect(() => {
    if (!dateOpen || !calendarRef.current) return
    const node = calendarRef.current
    const updateWidth = () => setCalendarWidth(node.offsetWidth || null)
    updateWidth()

    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => updateWidth())
    observer.observe(node)
    return () => observer.disconnect()
  }, [dateOpen])

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={snappy}
        style={mobile ? { x, backgroundColor } : undefined}
        drag={mobile ? "x" : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (e.target.closest?.('[data-no-note]')) return
          if (mobile && actionSheetOpen) return
          e.stopPropagation()
          onTaskClick?.(task.id)
        }}
        className={cn(
          "group flex items-center gap-3 rounded-lg cursor-pointer relative",
          mobile ? "p-4 border-b border-border" : "p-3 border bg-card hover:shadow-sm transition-shadow"
        )}
      >
        <motion.div
          key={task.completed ? 'checked' : 'unchecked'}
          initial={{ scale: 1 }}
          animate={task.completed ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={bouncy}
          data-no-note
        >
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked, e) => {
              e?.stopPropagation?.()
              onToggle(task.id)
            }}
            className={cn(
              "shadow-lg ring-1 ring-border",
              mobile ? "h-6 w-6" : "h-5 w-5"
            )}
          />
        </motion.div>
        <motion.span
          layout
          animate={{
            opacity: task.completed ? 0.5 : 1,
            x: task.completed ? 4 : 0
          }}
          transition={snappy}
          className={cn(
            mobile ? "flex-1 text-[15px]" : "flex-1 text-sm",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </motion.span>

        {/* 星标图标 */}
        {onToggleStar && (
          <button
            data-no-note
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(task.id)
            }}
            className={cn(
              "p-1 rounded transition-colors",
              task.starred
                ? "text-amber-500"
                : mobile
                  ? "text-muted-foreground"
                  : "text-muted-foreground opacity-0 group-hover:opacity-100"
            )}
          >
            <Star className={cn("h-4 w-4", task.starred && "fill-amber-500")} />
          </button>
        )}

        {/* 滑动提示图标（移动端） */}
        {mobile && (
          <>
            <motion.div
              style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}
              className="absolute right-4 text-green-500"
            >
              <Check className="h-5 w-5" />
            </motion.div>
            <motion.div
              style={{ opacity: useTransform(x, [-50, 0], [1, 0]) }}
              className="absolute left-4 text-red-500"
            >
              <Trash2 className="h-5 w-5" />
            </motion.div>
          </>
        )}

        {/* 日期显示/编辑 */}
        {onUpdateDate && (
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                data-no-note
                className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors",
                  dateStr
                    ? "text-primary bg-primary/10 hover:bg-primary/20"
                    : mobile
                      ? "text-muted-foreground hover:bg-muted"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted"
                )}
              >
                <CalendarDays className="h-3 w-3" />
                {dateStr || t('tasks.setDate')}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="end">
              {/* 快捷日期按钮 */}
              <div className="grid grid-cols-2 gap-2 mb-3" style={calendarWidth ? { width: calendarWidth } : undefined}>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={snappy}
                    onClick={() => handleQuickDate('today')}
                  >
                    {t('calendar.today')}
                  </motion.button>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={snappy}
                    onClick={() => handleQuickDate('tomorrow')}
                  >
                    {t('calendar.tomorrow')}
                  </motion.button>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={snappy}
                    onClick={() => handleQuickDate('next-week')}
                  >
                    {t('calendar.nextWeek')}
                  </motion.button>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                >
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    transition={snappy}
                    onClick={() => handleQuickDate('next-month')}
                  >
                    {t('calendar.nextMonth')}
                  </motion.button>
                </Button>
              </div>

              {/* 日历选择器 */}
              <div className="border-t pt-3">
                <div ref={calendarRef}>
                  <CalendarComponent
                  mode="single"
                  selected={task.dueDate ? new Date(task.dueDate) : undefined}
                  onSelect={handleCalendarSelect}
                  className="rounded-md border"
                  />
                </div>
                {task.dueDate && (
                  <button
                    onClick={handleClearDate}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
                  >
                    <X className="h-3 w-3" />
                    {t('calendar.clearDate')}
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* 更多菜单（仅桌面端） */}
        {!mobile && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                data-no-note
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(GTD_LIST_META).map(([key, meta]) => {
                if (key === task.list) return null
                const Icon = ICONS[meta.icon]
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={(e) => {
                      e.stopPropagation()
                      onMove(task.id, key)
                    }}
                  >
                    <Icon className={cn("h-4 w-4 mr-2", meta.color)} />
                    {t('tasks.moveTo')} {t(`gtd.${meta.key}`)}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(task.id)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('tasks.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </motion.div>

      {/* ActionSheet（仅移动端） */}
      {mobile && (
        <ActionSheet
          open={actionSheetOpen}
          onOpenChange={setActionSheetOpen}
          title={task.title}
          actions={actionSheetActions}
        />
      )}
    </>
  )
}
