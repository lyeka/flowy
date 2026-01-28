/**
 * [INPUT]: react, gsap
 * [OUTPUT]: DarkNebula 组件
 * [POS]: 星云层 - 细腻的云雾感，大量小光点叠加
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 星云粒子 - 小而多
// ═══════════════════════════════════════════════════════════════════════════

function NebulaParticle({ particle }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: `${particle.x}%`,
        top: `${particle.y}%`,
        width: `${particle.size}%`,
        height: `${particle.size}%`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${particle.color} 0%, transparent 65%)`,
        opacity: particle.opacity,
        filter: `blur(${particle.blur}px)`
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 生成大量细腻星云粒子
// ═══════════════════════════════════════════════════════════════════════════

function generateNebulaParticles() {
  const particles = []

  // 20-30 个小光点，形成云雾感
  for (let i = 0; i < 24; i++) {
    particles.push({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      size: 8 + Math.random() * 20,  // 8-28% 小尺寸
      opacity: 0.15 + Math.random() * 0.25,  // 0.15-0.4
      blur: 10 + Math.random() * 25,  // 10-35px
      color: `rgba(${150 + Math.random() * 40}, ${165 + Math.random() * 40}, ${180 + Math.random() * 35}, ${0.15 + Math.random() * 0.15})`
    })
  }

  return particles
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════════════════

export function DarkNebula({ className }) {
  const containerRef = useRef(null)
  const particles = useMemo(() => generateNebulaParticles(), [])

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 4 }
    )
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ zIndex: 3, mixBlendMode: 'multiply' }}
    >
      {particles.map((p, i) => (
        <NebulaParticle key={i} particle={p} />
      ))}
    </div>
  )
}
