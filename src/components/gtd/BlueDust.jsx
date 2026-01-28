/**
 * [INPUT]: react, gsap
 * [OUTPUT]: BlueDust 组件
 * [POS]: 蓝色粒子层，GSAP 动画，中间区域密集分布
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 蓝色粒子 - GSAP 动画，中间区域密集
// ═══════════════════════════════════════════════════════════════════════════
export function BlueDust({ count = 25 }) {
  const containerRef = useRef(null)

  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      // 集中在中间区域 (30%-70%)
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      size: 3 + Math.random() * 5,
    })),
    [count]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const dots = containerRef.current.children
    const tweens = []

    Array.from(dots).forEach(dot => {
      const duration = 5 + Math.random() * 4
      const driftX = (Math.random() - 0.5) * 15
      const driftY = (Math.random() - 0.5) * 15

      const tween = gsap.to(dot, {
        x: `+=${driftX}`,
        y: `+=${driftY}`,
        opacity: 0.7,
        duration,
        delay: Math.random() * 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
      tweens.push(tween)
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
            background: '#4a90d9',
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  )
}
