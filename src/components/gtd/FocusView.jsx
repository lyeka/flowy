/**
 * [INPUT]: react, react-i18next, framer-motion, @/stores/gtd, @/stores/ai, @/lib/utils, @/components/gtd/Focus*, @/components/gtd/TaskBubbleZone
 * [OUTPUT]: FocusView 组件
 * [POS]: 专注视图主组件，柔性宇宙插画风格
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { isToday, isPast } from '@/stores/gtd'
import { useAI } from '@/stores/ai'
import { ChevronRight, Sparkles } from 'lucide-react'
import { FocusCircle } from './FocusCircle'
import { TaskBubbleZone } from './TaskBubbleZone'

// ═══════════════════════════════════════════════════════════════════════════
// 空状态 - 宁静的虚无
// ═══════════════════════════════════════════════════════════════════════════
function EmptyState({ onGoToInbox }) {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center space-y-4 z-50"
    >
      <p className="text-white/60 font-light">
        {t('focus.empty.hint')}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onGoToInbox}
        className={cn(
          "inline-flex items-center gap-2 px-6 py-2.5 rounded-full",
          "bg-white/15 hover:bg-white/25",
          "text-white text-sm font-light",
          "transition-colors backdrop-blur-sm"
        )}
      >
        {t('focus.empty.action')}
        <ChevronRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 完成状态 - 完美的圆
// ═══════════════════════════════════════════════════════════════════════════
function CompleteState() {
  const { t } = useTranslation()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center z-50"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 mx-auto mb-4"
      >
        <Sparkles className="w-full h-full text-white/40" />
      </motion.div>
      <p className="text-white/60 font-light">
        {t('focus.complete.hint')}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════════════════
export function FocusView({
  tasks = [],
  onComplete,
  onMoveToToday,
  onMoveToTomorrow,
  onDelete,
  onGoToInbox,
  onGoToToday,
  className
}) {
  const { t } = useTranslation()
  const { recommendTasks } = useAI()

  // 推荐任务状态
  const [recommendedTasks, setRecommendedTasks] = useState([])
  const [isFallback, setIsFallback] = useState(false)
  const [loading, setLoading] = useState(false)

  // 今日任务（包括过期）
  const todayTasks = useMemo(() => {
    return tasks.filter(t =>
      !t.completed && (isToday(t.dueDate) || isPast(t.dueDate))
    )
  }, [tasks])

  // 已完成任务数
  const completedToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return tasks.filter(t =>
      t.completed && t.completedAt && new Date(t.completedAt) >= today
    ).length
  }, [tasks])

  // 过期任务
  const overdueTasks = useMemo(() => {
    return tasks.filter(t => !t.completed && isPast(t.dueDate))
  }, [tasks])

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
    onComplete?.(taskId)
    setRecommendedTasks(prev => prev.filter(t => t.id !== taskId))
  }, [onComplete])

  // 判断状态
  const isEmpty = todayTasks.length === 0 && completedToday === 0
  const isAllDone = todayTasks.length === 0 && completedToday > 0

  return (
    <div className={cn(
      "flex-1 flex flex-col min-h-screen relative overflow-hidden",
      className
    )}>
      {/* 柔性宇宙插画 */}
      <FocusCircle
        totalCount={todayTasks.length + completedToday}
        completedCount={completedToday}
        tasks={todayTasks}
        onParticleClick={handleComplete}
        className="flex-1"
      />

      {/* 空状态 */}
      {isEmpty && <EmptyState onGoToInbox={onGoToInbox} />}

      {/* 完成状态 */}
      {isAllDone && <CompleteState />}

      {/* 底部任务气泡区 */}
      {!isEmpty && !isAllDone && recommendedTasks.length > 0 && (
        <TaskBubbleZone
          tasks={recommendedTasks}
          isFallback={isFallback}
          onComplete={handleComplete}
          onViewAll={onGoToToday}
        />
      )}

      {/* 过期任务提醒 - 左上角 */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute top-6 left-6 z-50"
        >
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "bg-red-500/20 backdrop-blur-sm",
            "text-xs text-white/80 font-light"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {t('focus.overdueTitle', { count: overdueTasks.length })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
