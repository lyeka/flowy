/**
 * [INPUT]: 依赖 framer-motion，依赖 CalendarCell, react-i18next, @/lib/platform
 * [OUTPUT]: 导出 CalendarGrid 组件
 * [POS]: 日历网格渲染，包含星期标题和日期矩阵，固定 5-6 行一屏显示
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { CalendarCell } from './CalendarCell'
import { gentle } from '@/lib/motion'
import { isMobile } from '@/lib/platform'

export function CalendarGrid({
  grid,
  tasksByDate,
  journalsByDate,
  isToday,
  onDrop,
  onAddEntry,
  onToggle,
  onJournalClick,
  direction
}) {
  const { t } = useTranslation()
  const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const mobile = isMobile()

  return (
    <div className="flex-1 flex flex-col border-l border-t overflow-hidden">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b shrink-0">
        {weekdays.map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground border-r"
          >
            {t(`calendar.weekdays.${day}`)}
          </div>
        ))}
      </div>

      {/* 日期网格 - 自适应行高，不可滚动 */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={grid[0]?.[0]?.key}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -30 }}
            transition={gentle}
            className="h-full grid"
            style={{ gridTemplateRows: `repeat(${grid.length}, 1fr)` }}
          >
            {grid.map((week, i) => (
              <div key={i} className="grid grid-cols-7">
                {week.map(cell => (
                  <CalendarCell
                    key={cell.key}
                    cell={cell}
                    tasks={tasksByDate.get(cell.key) || []}
                    journal={journalsByDate?.get(cell.key)}
                    isToday={isToday(cell.date)}
                    onDrop={onDrop}
                    onAddEntry={onAddEntry}
                    onToggle={onToggle}
                    onJournalClick={onJournalClick}
                  />
                ))}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
