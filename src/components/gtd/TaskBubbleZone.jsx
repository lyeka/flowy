/**
 * [INPUT]: react, framer-motion, react-i18next, @/lib/utils, ./FloatingTaskBubble
 * [OUTPUT]: TaskBubbleZone 组件
 * [POS]: 底部任务气泡区域，水平排列漂浮气泡
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { FloatingTaskBubble } from './FloatingTaskBubble'

// ═══════════════════════════════════════════════════════════════════════════
// 底部任务气泡区域
// ═══════════════════════════════════════════════════════════════════════════
export function TaskBubbleZone({
  tasks = [],
  isFallback = false,
  onComplete,
  onViewAll,
  className
}) {
  const { t } = useTranslation()
  const displayTasks = tasks.slice(0, 5)
  const hasMore = tasks.length > 5

  if (tasks.length === 0) return null

  return (
    <div className={cn("absolute bottom-8 left-0 right-0 px-8", className)}>
      {/* 分隔线 - 与轨道线呼应 */}
      <motion.div
        className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mb-6"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* 标签 */}
      <motion.div
        className="flex justify-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-xs text-muted-foreground/30 uppercase tracking-widest">
          {isFallback ? t('focus.recommend.fallback') : t('focus.recommend.short')}
        </span>
      </motion.div>

      {/* 漂浮气泡 */}
      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence mode="popLayout">
          {displayTasks.map((task, i) => (
            <FloatingTaskBubble
              key={task.id}
              task={task}
              index={i}
              isAIRecommended={!isFallback}
              onComplete={onComplete}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 更多任务提示 */}
      {hasMore && (
        <motion.button
          className="mt-4 mx-auto block text-xs text-muted-foreground/40 hover:text-muted-foreground/60 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          onClick={onViewAll}
        >
          +{tasks.length - 5} {t('focus.viewAll')}
        </motion.button>
      )}
    </div>
  )
}
