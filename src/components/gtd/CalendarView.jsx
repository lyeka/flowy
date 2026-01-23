/**
 * [INPUT]: 依赖 @/stores/calendar，依赖 CalendarGrid, UnscheduledPanel, @/lib/platform, react-i18next
 * [OUTPUT]: 导出 CalendarView 组件
 * [POS]: 日历视图容器，组装 Header + Grid + UnscheduledPanel，移动端优化布局
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useCalendar } from '@/stores/calendar'
import { CalendarGrid } from './CalendarGrid'
import { UnscheduledPanel } from './UnscheduledPanel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react'
import { isMobile } from '@/lib/platform'
import { cn } from '@/lib/utils'

export function CalendarView({ tasks, onUpdateTask, onToggle, onAddTask }) {
  const { t, i18n } = useTranslation()
  const mobile = isMobile()
  const {
    grid,
    tasksByDate,
    unscheduledTasks,
    viewMode,
    setViewMode,
    title,
    goToday,
    goPrev,
    goNext,
    isToday,
    toDateKey
  } = useCalendar(tasks)

  const [direction, setDirection] = useState(0)

  const handlePrev = () => {
    setDirection(-1)
    goPrev()
  }

  const handleNext = () => {
    setDirection(1)
    goNext()
  }

  const handleDrop = (taskId, date) => {
    onUpdateTask(taskId, { dueDate: date.getTime() })
  }

  const handleAddTask = (date) => {
    const title = prompt(t('tasks.addPlaceholder'))
    if (title?.trim()) {
      onAddTask(title, date)
    }
  }

  const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
  const monthLabel = t(`calendar.months.${monthNames[title.month]}`)
  const isZh = i18n.language?.startsWith('zh')
  const formattedTitle = isZh ? `${title.year}年 ${monthLabel}` : `${monthLabel} ${title.year}`

  return (
    <div className="flex-1 flex flex-col">
      {/* Header - 移动端简化 */}
      <header className={cn(
        "border-b flex items-center gap-2",
        mobile ? "p-3" : "p-4 gap-4"
      )}>
        <h2 className={cn(
          "font-bold",
          mobile ? "text-base min-w-24" : "text-xl min-w-32"
        )}>{formattedTitle}</h2>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrev} className={mobile ? "h-8 w-8" : ""}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday} className={mobile ? "text-xs px-2" : ""}>
            {t('calendar.today')}
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext} className={mobile ? "h-8 w-8" : ""}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* 月/周切换 - 移动端简化 */}
        {!mobile && (
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                viewMode === 'month' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {t('calendar.month')}
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
                viewMode === 'week' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}
            >
              <CalendarRange className="h-4 w-4" />
              {t('calendar.week')}
            </button>
          </div>
        )}
      </header>

      {/* 主体 - 移动端隐藏 UnscheduledPanel */}
      <div className="flex-1 flex overflow-hidden">
        <CalendarGrid
          grid={grid}
          tasksByDate={tasksByDate}
          isToday={isToday}
          toDateKey={toDateKey}
          onDrop={handleDrop}
          onAddTask={handleAddTask}
          onToggle={onToggle}
          direction={direction}
        />
        {!mobile && (
          <UnscheduledPanel
            tasks={unscheduledTasks}
            onToggle={onToggle}
          />
        )}
      </div>
    </div>
  )
}
