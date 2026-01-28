/**
 * [INPUT]: react, gsap
 * [OUTPUT]: SpaceGlow 组件
 * [POS]: 空间辉光层，非中心式、不规则光斑，创造"空间本身发光"的感觉
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 空间辉光配置 - 非中心式、极低对比度、大模糊
// ═══════════════════════════════════════════════════════════════════════════

// 生成辉光数据
function generateGlows() {
  return [
    {
      id: 'glow-1',
      x: 15 + Math.random() * 20,  // 15-35%
      y: 20 + Math.random() * 20,  // 20-40%
      size: 25 + Math.random() * 15,  // 25-40%
      opacity: 0.03 + Math.random() * 0.02,  // 3-5%
      color: `hsl(${210 + Math.random() * 20}, 25%, ${12 + Math.random() * 6}%)`  // 深蓝灰
    },
    {
      id: 'glow-2',
      x: 65 + Math.random() * 20,  // 65-85%
      y: 55 + Math.random() * 25,  // 55-80%
      size: 20 + Math.random() * 15,  // 20-35%
      opacity: 0.02 + Math.random() * 0.015,  // 2-3.5%
      color: `hsl(${240 + Math.random() * 20}, 20%, ${10 + Math.random() * 5}%)`  // 深紫灰
    },
    {
      id: 'glow-3',
      x: 35 + Math.random() * 25,  // 35-60%
      y: 70 + Math.random() * 20,  // 70-90%
      size: 30 + Math.random() * 10,  // 30-40%
      opacity: 0.025 + Math.random() * 0.015,  // 2.5-4%
      color: `hsl(${200 + Math.random() * 15}, 22%, ${11 + Math.random() * 5}%)`  // 深青灰
    }
  ]
}

// ═══════════════════════════════════════════════════════════════════════════
// 单个辉光斑
// ═══════════════════════════════════════════════════════════════════════════

function GlowSpot({ glow, index }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    // 极慢脉动 - 分钟级
    const pulseDuration = 300 + Math.random() * 240  // 5-9 分钟
    const targetOpacity = glow.opacity * (0.6 + Math.random() * 0.3)

    gsap.to(ref.current, {
      opacity: targetOpacity,
      duration: pulseDuration,
      delay: index * 80,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })

    // 极慢漂移
    const driftDuration = 480 + Math.random() * 360  // 8-14 分钟
    const driftX = (Math.random() - 0.5) * 15
    const driftY = (Math.random() - 0.5) * 15

    gsap.to(ref.current, {
      x: driftX,
      y: driftY,
      duration: driftDuration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    })
  }, [glow.opacity, index])

  // 非中心式径向渐变 - 光源不在正中心
  const offsetX = 25 + Math.random() * 50
  const offsetY = 25 + Math.random() * 50

  return (
    <div
      ref={ref}
      className="absolute pointer-events-none"
      style={{
        left: `${glow.x}%`,
        top: `${glow.y}%`,
        width: `${glow.size}%`,
        height: `${glow.size}%`,
        transform: 'translate(-50%, -50%)',
        // 非中心式径向渐变 + 巨大模糊
        background: `radial-gradient(
          circle at ${offsetX}% ${offsetY}%,
          ${glow.color} 0%,
          transparent 65%
        )`,
        opacity: glow.opacity,
        filter: 'blur(60px)'
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 空间辉光层
// ═══════════════════════════════════════════════════════════════════════════

export function SpaceGlow({
  glows: customGlows,
  className
}) {
  const containerRef = useRef(null)

  // 生成辉光数据（只生成一次）
  const glows = useMemo(() => customGlows || generateGlows(), [customGlows])

  useEffect(() => {
    if (!containerRef.current) return

    // 整体极慢入场
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 6,
        ease: 'power1.inOut'
      }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        zIndex: 5  // far 层，在 StarDust 和 DarkNebula 之上
      }}
    >
      {glows.map((glow, index) => (
        <GlowSpot key={glow.id} glow={glow} index={index} />
      ))}
    </div>
  )
}
