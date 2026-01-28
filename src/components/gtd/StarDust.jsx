/**
 * [INPUT]: react, gsap
 * [OUTPUT]: StarDust 组件
 * [POS]: 背景星点层，GSAP 动画，微小粒子随机漂浮
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

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
    })),
    [count]
  )

  useEffect(() => {
    if (!containerRef.current) return

    const dots = containerRef.current.children
    const tweens = []

    Array.from(dots).forEach(dot => {
      const duration = 6 + Math.random() * 4
      const driftX = (Math.random() - 0.5) * 20
      const driftY = (Math.random() - 0.5) * 20

      const tween = gsap.to(dot, {
        x: `+=${driftX}`,
        y: `+=${driftY}`,
        opacity: 0.6,
        duration,
        delay: Math.random() * 4,
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
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: 0.2,
          }}
        />
      ))}
    </div>
  )
}
