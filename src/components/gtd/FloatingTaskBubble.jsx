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
  onComplete,
  className
}) {
  if (!task) return null

  // 获取对应的行星颜色
  const colorKey = COLOR_KEYS[index % COLOR_KEYS.length]
  const color = PLANET_COLORS[colorKey]

  // 生成渐变
  const gradient = `radial-gradient(circle at 35% 35%, ${color.highlight} 0%, ${color.base} 50%, ${color.shadow} 100%)`

  // 随机动画参数
  const animDuration = useMemo(() => 4 + Math.random() * 2, [])
  const animDelay = useMemo(() => Math.random() * 2, [])

  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-3 px-5 py-3",
        "bg-background/40 backdrop-blur-md",
        "rounded-full",
        "border border-border/20",
        "cursor-pointer",
        "hover:bg-background/60 hover:border-primary/30",
        "transition-colors",
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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onComplete?.(task.id)}
    >
      {/* 小圆点 - 与行星呼应 */}
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ background: gradient }}
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
