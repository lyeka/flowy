/**
 * [INPUT]: react, react-i18next, framer-motion, @/stores/gtd, @/lib/utils, @/components/gtd/Focus*, @/components/gtd/FocusMode
 * [OUTPUT]: FocusView 组件
 * [POS]: 专注视图主组件，柔性宇宙插画风格，整合专注模式、坍缩动画、星座系统、溢出任务折叠卡片
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, Plus, Calendar, BookOpen, Star } from 'lucide-react'
import { FocusCircle } from './FocusCircle'
import { FocusMode } from './FocusMode'
import { useConstellation } from './Constellation'

// ═══════════════════════════════════════════════════════════════════════════
// 空状态 - 宇宙创世风格
// 设计理念：空状态是"宇宙诞生前的虚空"——宁静、神秘、充满可能性
// ═══════════════════════════════════════════════════════════════════════════
function EmptyState({ onGoToInbox, level = 'empty' }) {
  const { t } = useTranslation()

  // 层级1：完全空白（无任务）
  if (level === 'empty') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center space-y-6 z-50 w-full max-w-md px-8"
      >
        {/* 星点装饰 - 带光晕 */}
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="relative w-1.5 h-1.5"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'var(--focus-star-core)',
                  boxShadow: '0 0 6px var(--focus-star-glow)'
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 2 + i * 0.3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-lg font-light"
          style={{ color: 'var(--focus-text-secondary)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          宇宙诞生于你的第一个念头
        </motion.p>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToInbox}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light transition-all relative overflow-hidden"
            style={{
              background: `
                radial-gradient(ellipse 100% 100% at 50% 50%, var(--focus-button-glow), transparent 70%),
                var(--focus-button-bg)
              `,
              color: 'var(--focus-text-secondary)',
              boxShadow: '0 0 20px var(--focus-nebula-cool-glow)'
            }}
          >
            <Plus className="w-4 h-4" />
            从收集箱选择
          </motion.button>
        </div>
      </motion.div>
    )
  }

  // 层级2：今日任务全部完成
  if (level === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center space-y-6 z-50 w-full max-w-md px-8"
      >
        {/* 恒星装饰 - 带光晕 */}
        <div className="flex justify-center gap-6 mb-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="relative w-2 h-2"
            >
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'var(--focus-star-core)',
                  boxShadow: '0 0 8px var(--focus-star-glow)'
                }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                  duration: 2 + i * 0.4,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-xl font-light"
          style={{ color: 'var(--focus-text-secondary)' }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          今天的宇宙很完整
        </motion.p>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light transition-all"
            style={{
              background: `
                radial-gradient(ellipse 100% 100% at 50% 50%, var(--focus-button-glow), transparent 70%),
                var(--focus-button-bg)
              `,
              color: 'var(--focus-text-secondary)',
              boxShadow: '0 0 15px var(--focus-nebula-cool-glow)'
            }}
          >
            <BookOpen className="w-4 h-4" />
            写篇日记
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-light transition-all"
            style={{
              background: `
                radial-gradient(ellipse 100% 100% at 50% 50%, var(--focus-button-glow), transparent 70%),
                var(--focus-button-bg)
              `,
              color: 'var(--focus-text-secondary)',
              boxShadow: '0 0 15px var(--focus-nebula-cool-glow)'
            }}
          >
            <Calendar className="w-4 h-4" />
            查看明日计划
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════
// 过期任务折叠卡片 - 红巨星星云风格
// 设计理念：过期任务是"即将消亡的红巨星"——温暖、柔和、带有紧迫感但不刺眼
// ═══════════════════════════════════════════════════════════════════════════
function OverdueCard({ tasks, onMoveToToday, onMoveToTomorrow, onDelete }) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (tasks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-6 left-6 right-6 z-50"
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 30% 20%, var(--focus-nebula-warm-glow), transparent 60%),
            radial-gradient(ellipse 100% 60% at 70% 80%, var(--focus-nebula-warm-glow), transparent 50%),
            oklch(from var(--focus-bg-night) l c h / 85%)
          `,
          boxShadow: `
            0 0 40px var(--focus-nebula-warm-glow),
            inset 0 0 30px var(--focus-nebula-warm-glow)
          `
        }}
      >
        {/* 头部 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {/* 微型红巨星指示器 + 十字星芒 */}
            <div className="relative w-3 h-3">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, var(--focus-nebula-warm-core), var(--focus-nebula-warm))`,
                  boxShadow: '0 0 8px var(--focus-nebula-warm-glow)'
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* 十字星芒 */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="absolute w-[1px] h-4 -top-0.5" style={{ background: 'linear-gradient(transparent, var(--focus-nebula-warm), transparent)' }} />
                <div className="absolute w-4 h-[1px] -left-0.5" style={{ background: 'linear-gradient(to right, transparent, var(--focus-nebula-warm), transparent)' }} />
              </motion.div>
            </div>
            <span className="text-sm font-light" style={{ color: 'var(--focus-text-secondary)' }}>
              {tasks.length} 个过期任务
            </span>
          </div>
          <ChevronRight
            className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")}
            style={{ color: 'var(--focus-text-muted)' }}
          />
        </button>

        {/* 展开 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t"
              style={{ borderColor: 'var(--focus-nebula-border)' }}
            >
              <div className="p-3 space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--focus-nebula-warm-glow)' }}
                  >
                    <span className="text-sm truncate flex-1" style={{ color: 'var(--focus-text-secondary)' }}>
                      {task.title}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onMoveToToday?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors hover:bg-[var(--focus-button-hover)]"
                        style={{ color: 'var(--focus-text-muted)' }}
                      >
                        今天
                      </button>
                      <button
                        onClick={() => onMoveToTomorrow?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors hover:bg-[var(--focus-button-hover)]"
                        style={{ color: 'var(--focus-text-muted)' }}
                      >
                        明天
                      </button>
                      <button
                        onClick={() => onDelete?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors hover:bg-[var(--focus-nebula-warm-glow)]"
                        style={{ color: 'var(--focus-nebula-warm)' }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 批量操作 */}
              <div className="px-3 pb-3 flex gap-2">
                <button
                  onClick={() => tasks.forEach(t => onMoveToToday?.(t.id))}
                  className="flex-1 px-3 py-2 text-xs rounded-lg transition-colors hover:bg-[var(--focus-button-hover)]"
                  style={{ color: 'var(--focus-text-secondary)' }}
                >
                  全部移到今天
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-2 text-xs rounded-lg transition-colors hover:bg-[var(--focus-button-hover)]"
                  style={{ color: 'var(--focus-text-muted)' }}
                >
                  收起
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 溢出任务折叠卡片 - 深空门户风格
// 设计理念：溢出任务是"更深处的宇宙"——点击展开就像"放大望远镜"
// ═══════════════════════════════════════════════════════════════════════════
function OverflowCard({ tasks, onTaskClick, onToggleStar }) {
  const { t } = useTranslation()
  const [isExpanded, setIsExpanded] = useState(false)

  if (tasks.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 left-6 right-6 z-50"
    >
      <div
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: `
            radial-gradient(ellipse 80% 100% at 50% 100%, var(--focus-nebula-cool-glow), transparent 70%),
            oklch(from var(--focus-bg-night) l c h / 80%)
          `,
          border: '1px solid var(--focus-nebula-border)',
          boxShadow: '0 0 30px var(--focus-nebula-cool-glow)'
        }}
      >
        {/* 头部 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            {/* 恒星核心指示器 + 光晕 */}
            <div className="relative w-2.5 h-2.5">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'var(--focus-star-core)',
                  boxShadow: '0 0 6px var(--focus-star-glow)'
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <span className="text-sm font-light" style={{ color: 'var(--focus-text-secondary)' }}>
              还有 {tasks.length} 个任务
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: 'var(--focus-text-muted)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--focus-text-muted)' }} />
          )}
        </button>

        {/* 展开 */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t"
              style={{ borderColor: 'var(--focus-nebula-border)' }}
            >
              <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--focus-button-hover)]"
                    style={{ background: 'var(--focus-nebula-cool-glow)' }}
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleStar?.(task.id)
                        }}
                        className="flex-shrink-0"
                      >
                        <Star
                          className={cn(
                            "w-4 h-4 transition-colors",
                            task.starred
                              ? "fill-[var(--focus-star-core)] text-[var(--focus-star-core)]"
                              : "text-[var(--focus-text-muted)]"
                          )}
                          style={task.starred ? { filter: 'drop-shadow(0 0 4px var(--focus-star-glow))' } : {}}
                        />
                      </button>
                      <span className="text-sm truncate" style={{ color: 'var(--focus-text-secondary)' }}>
                        {task.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 收起按钮 */}
              <div className="px-3 pb-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full px-3 py-2 text-xs rounded-lg transition-colors text-center hover:bg-[var(--focus-button-hover)]"
                  style={{ color: 'var(--focus-text-muted)' }}
                >
                  收起
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════════════════
export function FocusView({
  todayTasks = [],
  completedCount = 0,
  overdueTasks = [],
  planetTasks = [],
  overflowTasks = [],
  allTasks = [],
  onComplete,
  onMoveToToday,
  onMoveToTomorrow,
  onDelete,
  onGoToInbox,
  onGoToToday,
  onEditTask,
  onUpdatePomodoro,
  onToggleStar,
  className
}) {
  const { t } = useTranslation()

  // 专注模式状态
  const [focusModeTask, setFocusModeTask] = useState(null)

  // 星座系统
  const { stars, addStar } = useConstellation()

  // 处理任务完成
  const handleComplete = useCallback((taskId) => {
    onComplete?.(taskId)
  }, [onComplete])

  // 处理长按进入专注模式
  const handleLongPress = useCallback((task) => {
    setFocusModeTask(task)
  }, [])

  // 处理行星坍缩完成
  const handlePlanetCollapsed = useCallback((task, position, size) => {
    // 添加到星座系统
    addStar(task, position, size)
  }, [addStar])

  // 处理番茄钟完成
  const handlePomodoroComplete = useCallback((taskId, count) => {
    onUpdatePomodoro?.(taskId, count)
  }, [onUpdatePomodoro])

  // 处理专注模式放弃
  const handleFocusModeAbandon = useCallback(() => {
    setFocusModeTask(null)
  }, [])

  // 判断状态
  const isEmpty = todayTasks.length === 0 && completedCount === 0
  const isAllDone = todayTasks.length === 0 && completedCount > 0

  return (
    <div
      className={cn(
        "flex-1 flex flex-col min-h-screen relative overflow-hidden",
        className
      )}
      style={{ contain: 'layout style paint' }}
    >
      {/* 柔性宇宙插画 */}
      <FocusCircle
        totalCount={todayTasks.length + completedCount}
        completedCount={completedCount}
        planetTasks={planetTasks}
        allTasks={allTasks}
        onParticleClick={handleComplete}
        onLongPress={handleLongPress}
        onPlanetCollapsed={handlePlanetCollapsed}
        className="flex-1"
      />

      {/* 过期任务卡片 */}
      <OverdueCard
        tasks={overdueTasks}
        onMoveToToday={onMoveToToday}
        onMoveToTomorrow={onMoveToTomorrow}
        onDelete={onDelete}
      />

      {/* 溢出任务卡片 */}
      <OverflowCard
        tasks={overflowTasks}
        onTaskClick={onEditTask}
        onToggleStar={onToggleStar}
      />

      {/* 空状态 */}
      {isEmpty && <EmptyState level="empty" onGoToInbox={onGoToInbox} />}

      {/* 完成状态 */}
      {isAllDone && <EmptyState level="complete" />}

      {/* 专注模式 */}
      <AnimatePresence>
        {focusModeTask && (
          <FocusMode
            task={focusModeTask}
            initialPomodoros={focusModeTask.pomodoros || 0}
            onPomodoroComplete={handlePomodoroComplete}
            onTaskComplete={handleComplete}
            onAbandon={handleFocusModeAbandon}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
