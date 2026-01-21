/**
 * [INPUT]: 依赖 @/stores/calendar，依赖 CalendarGrid, UnscheduledPanel
 * [OUTPUT]: 导出 CalendarView 组件
 * [POS]: 日历视图容器，组装 Header + Grid + UnscheduledPanel
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useRef } from 'react'
import { useCalendar } from '@/stores/calendar'
import { CalendarGrid } from './CalendarGrid'
import { UnscheduledPanel } from './UnscheduledPanel'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CalendarView({ tasks, onUpdateTask, onToggle, onAddTask }) {
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
    const title = prompt('添加任务:')
    if (title?.trim()) {
      onAddTask(title, date)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b p-4 flex items-center gap-4">
        <h2 className="text-xl font-bold min-w-32">{title}</h2>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            今天
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        {/* 月/周切换 */}
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('month')}
            className={cn(
              "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
              viewMode === 'month' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <CalendarDays className="h-4 w-4" />
            月
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={cn(
              "px-3 py-1.5 text-sm flex items-center gap-1.5 transition-colors",
              viewMode === 'week' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <CalendarRange className="h-4 w-4" />
            周
          </button>
        </div>
      </header>

      {/* 主体 */}
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
        <UnscheduledPanel
          tasks={unscheduledTasks}
          onToggle={onToggle}
        />
      </div>
    </div>
  )
}
