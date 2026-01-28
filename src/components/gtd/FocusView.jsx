/**
 * [INPUT]: react, react-i18next, framer-motion, @/stores/gtd, @/stores/ai, @/lib/utils, @/components/gtd/Focus*, @/components/gtd/TaskBubbleZone, @/components/gtd/FocusMode
 * [OUTPUT]: FocusView 组件
 * [POS]: 专注视图主组件，柔性宇宙插画风格，整合专注模式、坍缩动画、星座系统
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useAI } from '@/stores/ai'
import { ChevronRight, Sparkles, Plus, Calendar, BookOpen } from 'lucide-react'
import { FocusCircle } from './FocusCircle'
import { TaskBubbleZone } from './TaskBubbleZone'
import { FocusMode } from './FocusMode'
import { useConstellation } from './Constellation'

// ═══════════════════════════════════════════════════════════════════════════
// 空状态 - 三层递进式引导
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
        {/* 星点装饰 */}
        <div className="flex justify-center gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{
                background: 'var(--focus-text-bright)',
                opacity: 0.4
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
          ))}
        </div>

        <p className="text-lg font-light" style={{ color: 'var(--focus-text-secondary)' }}>
          宇宙诞生于你的第一个念头
        </p>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoToInbox}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "text-sm font-light",
              "transition-colors backdrop-blur-sm"
            )}
            style={{
              background: 'var(--focus-accent-bg)',
              color: 'var(--focus-text-bright)'
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
        {/* 恒星装饰 */}
        <div className="flex justify-center gap-6 mb-4">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--focus-star-core)',
                opacity: 0.6,
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
          ))}
        </div>

        <p className="text-xl font-light" style={{ color: 'var(--focus-text-bright)' }}>
          今天的宇宙很完整
        </p>

        <div className="flex gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
              "text-sm font-light",
              "transition-colors backdrop-blur-sm"
            )}
            style={{
              background: 'var(--focus-accent-bg)',
              color: 'var(--focus-text-bright)'
            }}
          >
            <BookOpen className="w-4 h-4" />
            写篇日记
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "inline-flex items-center gap-2 px-5 py-2.5 rounded-full",
              "text-sm font-light",
              "transition-colors backdrop-blur-sm"
            )}
            style={{
              background: 'var(--focus-accent-bg)',
              color: 'var(--focus-text-bright)'
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
// 过期任务折叠卡片
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
        className={cn(
          "rounded-2xl backdrop-blur-sm overflow-hidden border"
        )}
        style={{
          background: 'oklch(from var(--destructive) l c h / 15%)',
          borderColor: 'oklch(from var(--destructive) l c h / 20%)'
        }}
      >
        {/* 头部 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--destructive)' }}
            />
            <span className="text-sm" style={{ color: 'var(--focus-text-bright)' }}>
              {tasks.length} 个过期任务
            </span>
          </div>
          <ChevronRight
            className={cn(
              "w-4 h-4 transition-transform",
              isExpanded && "rotate-90"
            )}
            style={{ color: 'oklch(from var(--focus-text-bright) l c h / 60%)' }}
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
              style={{ borderColor: 'oklch(from var(--destructive) l c h / 10%)' }}
            >
              <div className="p-3 space-y-2">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'oklch(from var(--destructive) l c h / 10%)' }}
                  >
                    <span
                      className="text-sm truncate flex-1"
                      style={{ color: 'oklch(from var(--focus-text-bright) l c h / 80%)' }}
                    >
                      {task.title}
                    </span>
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => onMoveToToday?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors"
                        style={{
                          color: 'oklch(from var(--focus-text-bright) l c h / 60%)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--focus-text-bright)'}
                        onMouseLeave={(e) => e.target.style.color = 'oklch(from var(--focus-text-bright) l c h / 60%)'}
                      >
                        今天
                      </button>
                      <button
                        onClick={() => onMoveToTomorrow?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors"
                        style={{
                          color: 'oklch(from var(--focus-text-bright) l c h / 60%)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'var(--focus-text-bright)'}
                        onMouseLeave={(e) => e.target.style.color = 'oklch(from var(--focus-text-bright) l c h / 60%)'}
                      >
                        明天
                      </button>
                      <button
                        onClick={() => onDelete?.(task.id)}
                        className="px-2 py-1 text-xs rounded transition-colors"
                        style={{
                          color: 'oklch(from var(--destructive) l c h / 70%)'
                        }}
                        onMouseEnter={(e) => e.target.style.color = 'oklch(from var(--destructive) l c h / 90%)'}
                        onMouseLeave={(e) => e.target.style.color = 'oklch(from var(--destructive) l c h / 70%)'}
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
                  className="flex-1 px-3 py-2 text-xs rounded-lg transition-colors"
                  style={{
                    color: 'oklch(from var(--focus-text-bright) l c h / 80%)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'oklch(from var(--focus-text-bright) l c h / 10%)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  全部移到今天
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-2 text-xs rounded-lg transition-colors"
                  style={{
                    color: 'oklch(from var(--focus-text-bright) l c h / 60%)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'oklch(from var(--focus-text-bright) l c h / 10%)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
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
  allTasks = [],
  onComplete,
  onMoveToToday,
  onMoveToTomorrow,
  onDelete,
  onGoToInbox,
  onGoToToday,
  onEditTask,
  onUpdatePomodoro,
  className
}) {
  const { t } = useTranslation()
  const { recommendTasks } = useAI()

  // 推荐任务状态
  const [recommendedTasks, setRecommendedTasks] = useState([])
  const [isFallback, setIsFallback] = useState(false)
  const [loading, setLoading] = useState(false)

  // 选中任务状态
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  // 专注模式状态
  const [focusModeTask, setFocusModeTask] = useState(null)

  // 星座系统
  const { stars, addStar } = useConstellation()

  // 加载推荐任务
  const loadRecommendations = useCallback(async () => {
    if (todayTasks.length === 0) {
      setRecommendedTasks([])
      return
    }

    setLoading(true)
    try {
      const result = await recommendTasks(todayTasks)
      setRecommendedTasks(result.tasks.slice(0, 5))
      setIsFallback(result.fallback)
    } catch (error) {
      console.error('Failed to load recommendations:', error)
      setRecommendedTasks(todayTasks.slice(0, 5))
      setIsFallback(true)
    } finally {
      setLoading(false)
    }
  }, [todayTasks, recommendTasks])

  // 初始加载
  useEffect(() => {
    loadRecommendations()
  }, [])

  // 处理任务完成
  const handleComplete = useCallback((taskId) => {
    const task = todayTasks.find(t => t.id === taskId)
    if (task) {
      onComplete?.(taskId)
    }
    setRecommendedTasks(prev => prev.filter(t => t.id !== taskId))
    if (selectedTaskId === taskId) setSelectedTaskId(null)
  }, [todayTasks, onComplete, selectedTaskId])

  // 处理任务选择
  const handleTaskSelect = useCallback((taskId) => {
    setSelectedTaskId(prev => prev === taskId ? null : taskId)
  }, [])

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
    <div className={cn(
      "flex-1 flex flex-col min-h-screen relative overflow-hidden",
      className
    )}>
      {/* 柔性宇宙插画 */}
      <FocusCircle
        totalCount={todayTasks.length + completedCount}
        completedCount={completedCount}
        planetTasks={planetTasks}
        allTasks={allTasks}
        selectedTaskId={selectedTaskId}
        onParticleClick={handleComplete}
        onTaskSelect={handleTaskSelect}
        onLongPress={handleLongPress}
        onPlanetCollapsed={handlePlanetCollapsed}
        onEditTask={onEditTask}
        onMoveToToday={onMoveToToday}
        onMoveToTomorrow={onMoveToTomorrow}
        onDeleteTask={onDelete}
        className="flex-1"
      />

      {/* 过期任务卡片 */}
      <OverdueCard
        tasks={overdueTasks}
        onMoveToToday={onMoveToToday}
        onMoveToTomorrow={onMoveToTomorrow}
        onDelete={onDelete}
      />

      {/* 空状态 */}
      {isEmpty && <EmptyState level="empty" onGoToInbox={onGoToInbox} />}

      {/* 完成状态 */}
      {isAllDone && <EmptyState level="complete" />}

      {/* 底部任务气泡区 */}
      {!isEmpty && !isAllDone && recommendedTasks.length > 0 && (
        <TaskBubbleZone
          tasks={recommendedTasks}
          isFallback={isFallback}
          selectedTaskId={selectedTaskId}
          onSelect={handleTaskSelect}
          onComplete={handleComplete}
          onViewAll={onGoToToday}
        />
      )}

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
