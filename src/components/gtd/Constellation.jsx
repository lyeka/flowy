/**
 * [INPUT]: react, gsap, @/lib/utils
 * [OUTPUT]: Constellation 组件, useConstellation hook
 * [POS]: 完成任务的星座系统，显示已完成任务的恒星和连线
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 单个已完成任务的恒星
// ═══════════════════════════════════════════════════════════════════════════
function CompletedStar({ star, index }) {
  const starRef = useRef(null)
  const glowRef = useRef(null)

  useEffect(() => {
    if (!starRef.current) return

    // 入场动画 - 从小点浮现
    gsap.fromTo(starRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 0.6, duration: 0.8, delay: index * 0.1, ease: 'back.out(1.7)' }
    )

    // 闪烁动画 - 随机周期
    const twinkleDuration = 2 + Math.random() * 3
    const twinkleDelay = Math.random() * 2

    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: [0.3, 0.8, 0.3],
        duration: twinkleDuration,
        repeat: -1,
        delay: twinkleDelay,
        ease: 'sine.inOut'
      })
    }
  }, [index])

  return (
    <div
      ref={starRef}
      className="absolute pointer-events-none"
      style={{
        left: star.x,
        top: star.y,
        width: star.size,
        height: star.size,
        marginLeft: `-${star.size / 2}px`,
        marginTop: `-${star.size / 2}px`,
      }}
    >
      {/* 光晕 */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, var(--focus-star-glow) 0%, transparent 70%)',
          opacity: 0.5
        }}
      />

      {/* 核心亮点 */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: 'var(--focus-star-core)', opacity: 0.8 }}
      />

      {/* 十字星芒 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="w-full h-px"
          style={{ background: 'oklch(from var(--focus-star-core) l c h / 60%)' }}
        />
        <div
          className="w-px h-full absolute"
          style={{ background: 'oklch(from var(--focus-star-core) l c h / 60%)' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 星座连线
// ═══════════════════════════════════════════════════════════════════════════
function ConstellationLines({ stars }) {
  const linesRef = useRef(null)
  const svgRef = useRef(null)

  // 生成的连线数据
  const lines = useMemo(() => {
    const result = []
    // 只连接今天完成的恒星
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayStars = stars.filter(s => {
      const completedDate = new Date(s.completedAt)
      completedDate.setHours(0, 0, 0, 0)
      return completedDate.getTime() === today.getTime()
    })

    // 按位置排序，连接相邻的恒星
    for (let i = 0; i < todayStars.length - 1; i++) {
      const from = todayStars[i]
      const to = todayStars[i + 1]

      // 解析百分比位置 - 处理可能是字符串 "50%" 或数字 0.5 的情况
      const parsePercent = (val) => {
        if (!val) return 0.5
        const str = String(val)
        if (str.includes('%')) {
          return parseFloat(str.replace('%', '')) / 100
        }
        const num = parseFloat(val)
        return isNaN(num) ? 0.5 : Math.max(0, Math.min(1, num))
      }

      const fromX = parsePercent(from.x)
      const fromY = parsePercent(from.y)
      const toX = parsePercent(to.x)
      const toY = parsePercent(to.y)

      // 检查是否有效
      if ([fromX, fromY, toX, toY].some(v => isNaN(v))) continue

      result.push({
        x1: fromX,
        y1: fromY,
        x2: toX,
        y2: toY
      })
    }

    return result
  }, [stars])

  useEffect(() => {
    if (!svgRef.current || lines.length === 0) return

    // 连线动画
    gsap.fromTo(svgRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 0.5, ease: 'power2.out' }
    )
  }, [lines.length])

  if (lines.length === 0) return null

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--focus-star-line)" />
          <stop offset="50%" stopColor="oklch(from var(--focus-star-line) l c h / 3)" />
          <stop offset="100%" stopColor="var(--focus-star-line)" />
        </linearGradient>
      </defs>
      {lines.map((line, i) => (
        <line
          key={i}
          x1={`${line.x1 * 100}%`}
          y1={`${line.y1 * 100}%`}
          x2={`${line.x2 * 100}%`}
          y2={`${line.y2 * 100}%`}
          stroke="url(#lineGradient)"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      ))}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 完成任务的星座系统
// ═══════════════════════════════════════════════════════════════════════════
export function Constellation({
  stars = [], // { id, x, y, size, completedAt, title }
  className
}) {
  const containerRef = useRef(null)
  const tooltipRef = useRef(null)

  if (stars.length === 0) return null

  // 今天完成的数量
  const todayCount = stars.filter(s => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedDate = new Date(s.completedAt)
    completedDate.setHours(0, 0, 0, 0)
    return completedDate.getTime() === today.getTime()
  }).length

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
    >
      {/* 连线 */}
      <ConstellationLines stars={stars} />

      {/* 恒星 */}
      {stars.map((star, index) => (
        <CompletedStar key={star.id} star={star} index={index} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: 管理已完成任务的位置和状态
// ═══════════════════════════════════════════════════════════════════════════
export function useConstellation() {
  const [stars, setStars] = useState([])

  // 添加一颗新的恒星
  const addStar = useCallback((task, position, planetSize) => {
    const newStar = {
      id: task.id,
      x: position.x,
      y: position.y,
      size: planetSize * 0.25, // 恒星大小是星球的 1/4
      completedAt: task.completedAt || new Date().toISOString(),
      title: task.title
    }

    setStars(prev => {
      // 检查是否已存在
      const exists = prev.find(s => s.id === task.id)
      if (exists) return prev
      return [...prev, newStar]
    })

    // 持久化到 localStorage
    try {
      const key = 'gtd-constellation-stars'
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      const updated = existing.filter(s => s.id !== task.id)
      updated.push(newStar)
      localStorage.setItem(key, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to save constellation:', e)
    }
  }, [])

  // 加载已保存的恒星
  useEffect(() => {
    try {
      const key = 'gtd-constellation-stars'
      const saved = JSON.parse(localStorage.getItem(key) || '[]')

      // 只保留最近 7 天的恒星
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)

      const filtered = saved.filter(s => {
        const completedDate = new Date(s.completedAt)
        return completedDate > weekAgo
      })

      setStars(filtered)

      // 清理过期数据
      if (filtered.length < saved.length) {
        localStorage.setItem(key, JSON.stringify(filtered))
      }
    } catch (e) {
      console.error('Failed to load constellation:', e)
    }
  }, [])

  return { stars, addStar }
}
