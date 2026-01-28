/**
 * [INPUT]: react, gsap
 * [OUTPUT]: StarDust 组件
 * [POS]: 背景星点层，冷色系（80% 灰白，20% 冷蓝），GSAP 漂移 + 闪烁动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 冷色系星点颜色 - 80% 灰白，20% 冷蓝
// ═══════════════════════════════════════════════════════════════════════════
function pickStarColor() {
  const r = Math.random()
  if (r < 0.5) return '#ffffff'      // 50% 白
  if (r < 0.8) return '#f0f0f0'      // 30% 浅灰
  if (r < 0.95) return '#d0d5dc'     // 15% 冷灰
  return '#b0c4de'                   // 5% 钢蓝
}

// ═══════════════════════════════════════════════════════════════════════════
// 背景星点 - GSAP 极慢漂移
// ═══════════════════════════════════════════════════════════════════════════
export function StarDust({ count = 35 }) {
  const containerRef = useRef(null)

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      color: pickStarColor()
    })),
    [count]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const dots = containerRef.current.children
    const tweens = []

    Array.from(dots).forEach((dot, i) => {
      // 漂移动画
      const duration = 6 + Math.random() * 4
      const driftX = (Math.random() - 0.5) * 20
      const driftY = (Math.random() - 0.5) * 20

      const driftTween = gsap.to(dot, {
        x: `+=${driftX}`,
        y: `+=${driftY}`,
        duration,
        delay: Math.random() * 4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      tweens.push(driftTween)

      // 只有前8个星点闪烁，减少性能开销
      if (i < 8) {
        const twinkleDuration = 2 + Math.random() * 4
        const targetOpacity = 0.15 + Math.random() * 0.35

        const twinkleTween = gsap.to(dot, {
          opacity: targetOpacity,
          duration: twinkleDuration,
          delay: Math.random() * 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        })
        tweens.push(twinkleTween)
      }
    })

    return () => tweens.forEach(t => t.kill())
  }, [particles])

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  )
}
