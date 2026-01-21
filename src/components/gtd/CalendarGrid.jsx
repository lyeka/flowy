/**
 * [INPUT]: 依赖 framer-motion，依赖 CalendarCell
 * [OUTPUT]: 导出 CalendarGrid 组件
 * [POS]: 日历网格渲染，包含星期标题和日期矩阵
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion, AnimatePresence } from 'framer-motion'
import { CalendarCell } from './CalendarCell'
import { gentle } from '@/lib/motion'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarGrid({
  grid,
  tasksByDate,
  isToday,
  toDateKey,
  onDrop,
  onAddTask,
  onToggle,
  direction
}) {
  return (
    <div className="flex-1 flex flex-col border-l border-t">
      {/* 星期标题 */}
      <div className="grid grid-cols-7 border-b">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground border-r"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日期网格 */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={grid[0]?.[0]?.key}
          initial={{ opacity: 0, x: direction * 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -30 }}
          transition={gentle}
          className="flex-1 grid"
          style={{ gridTemplateRows: `repeat(${grid.length}, 1fr)` }}
        >
          {grid.map((week, i) => (
            <div key={i} className="grid grid-cols-7">
              {week.map(cell => (
                <CalendarCell
                  key={cell.key}
                  cell={cell}
                  tasks={tasksByDate.get(cell.key) || []}
                  isToday={isToday(cell.date)}
                  onDrop={onDrop}
                  onAddTask={onAddTask}
                  onToggle={onToggle}
                />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
