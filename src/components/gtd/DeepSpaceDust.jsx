/**
 * [INPUT]: react, gsap
 * [OUTPUT]: DeepSpaceDust 组件
 * [POS]: 极微小星点层，创造尺度差，位于 far 层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 极微小星点 - 0.3-1px，创造尺度差
// ═══════════════════════════════════════════════════════════════════════════

const MICRO_DUST_COUNT = 200

// 冷色系星点颜色 - 80% 灰白，20% 冷蓝
function pickDustColor() {
  const r = Math.random()
  if (r < 0.5) return '#ffffff'      // 50% 白
  if (r < 0.8) return '#f0f0f0'      // 30% 浅灰
  if (r < 0.95) return '#d0d5dc'     // 15% 冷灰
  return '#b0c4de'                   // 5% 钢蓝
}

// 生成极微星点数据
function generateMicroDust() {
  return Array.from({ length: MICRO_DUST_COUNT }, () => ({
    id: Math.random().toString(36).substr(2, 9),
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 0.3 + Math.random() * 0.7,  // 0.3-1px
    opacity: 0.05 + Math.random() * 0.1,  // 5-15% 极低
    color: pickDustColor()
  }))
}

// ═══════════════════════════════════════════════════════════════════════════
// 单个极微星点
// ═══════════════════════════════════════════════════════════════════════════
function MicroDustParticle({ dust, index }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    // 极慢闪烁 - 分钟级
    const twinkleDuration = 180 + Math.random() * 120  // 3-5 分钟
    const twinkleDelay = Math.random() * 60

    gsap.to(ref.current, {
      opacity: dust.opacity * (0.3 + Math.random() * 0.4),
      duration: twinkleDuration,
      delay: twinkleDelay,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // 极慢漂移 - 每次持续 5-10 分钟
    const driftDuration = 300 + Math.random() * 300  // 5-10 分钟
    const driftX = (Math.random() - 0.5) * 3
    const driftY = (Math.random() - 0.5) * 3

    gsap.to(ref.current, {
      x: driftX,
      y: driftY,
      duration: driftDuration,
      delay: Math.random() * 120,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, [dust.opacity])

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        left: `${dust.x}%`,
        top: `${dust.y}%`,
        width: `${dust.size}px`,
        height: `${dust.size}px`,
        borderRadius: '50%',
        backgroundColor: dust.color,
        opacity: dust.opacity
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 极微星点层
// ═══════════════════════════════════════════════════════════════════════════
export function DeepSpaceDust({
  count = MICRO_DUST_COUNT,
  className
}) {
  const containerRef = useRef(null)

  // 生成星点数据（只生成一次）
  const dustParticles = useMemo(() => generateMicroDust(), [])

  useEffect(() => {
    if (!containerRef.current) return

    // 整体入场动画 - 极慢浮现
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 3,
        ease: 'power1.out'
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        zIndex: 4,  // far 层，比 StarDust 更远
        filter: 'blur(0.3px)',  // 轻微模糊增强距离感
      }}
    >
      {dustParticles.slice(0, count).map((dust, index) => (
        <MicroDustParticle key={dust.id} dust={dust} index={index} />
      ))}
    </div>
  )
}
