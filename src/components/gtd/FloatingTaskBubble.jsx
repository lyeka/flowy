/**
 * [INPUT]: react, framer-motion, lucide-react, @/lib/utils
 * [OUTPUT]: FloatingTaskBubble 组件
 * [POS]: 漂浮气泡任务卡片，圆角胶囊，与行星系统融为一体
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLANET_COLORS } from './Planet'

// ═══════════════════════════════════════════════════════════════════════════
// 漂浮气泡任务卡片
// ═══════════════════════════════════════════════════════════════════════════

const COLOR_KEYS = ['coral', 'purple', 'cyan', 'cream']

export function FloatingTaskBubble({
  task,
  index = 0,
  isAIRecommended = false,
  isSelected = false,
  onSelect,
  onComplete,
  className
}) {
  if (!task) return null

  // 获取对应的行星颜色
  const colorKey = COLOR_KEYS[index % COLOR_KEYS.length]
  const color = PLANET_COLORS[colorKey]

  // 随机动画参数
  const animDuration = useMemo(() => 4 + Math.random() * 2, [])
  const animDelay = useMemo(() => Math.random() * 2, [])

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-3 px-5 py-3",
        "bg-background/40 backdrop-blur-md",
        "rounded-full",
        "border",
        "cursor-pointer",
        "hover:bg-background/60",
        "transition-all duration-200",
        isSelected
          ? "border-primary/50 bg-primary/10 ring-2 ring-primary/20"
          : "border-border/20 hover:border-primary/30",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: [0, -3, 0],
      }}
      transition={{
        opacity: { duration: 0.5, delay: index * 0.1 },
        y: {
          duration: animDuration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: animDelay,
        },
      }}
      whileHover={{ scale: isSelected ? 1.02 : 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        if (isSelected) {
          onComplete?.(task.id)
        } else {
          onSelect?.(task.id)
        }
      }}
    >
      {/* 小圆点 - 与行星呼应，用相同 filter */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 bg-amber-300"
        style={{ filter: color.filter }}
      />

      {/* 任务标题 */}
      <span className="text-sm text-foreground/70 font-light truncate max-w-[200px]">
        {task.title}
      </span>

      {/* AI 推荐标记 */}
      {isAIRecommended && (
        <Zap className="w-3 h-3 text-amber-500/50 flex-shrink-0" />
      )}
    </motion.div>
  )
}
