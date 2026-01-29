/**
 * [INPUT]: react, gsap, @/lib/utils, ./planetTextures
 * [OUTPUT]: TimerPlanet 组件
 * [POS]: FocusMode 专用计时星球，NASA 真实图片纹理 + CSS 旋转动画 + 进度轨道，支持动态尺寸
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, memo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { PLANET_TEXTURES } from './planetTextures'

// ═══════════════════════════════════════════════════════════════════════════
// 进度轨道 SVG - 根据尺寸动态调整
// ═══════════════════════════════════════════════════════════════════════════
const ProgressOrbit = memo(function ProgressOrbit({ size, progress, glowColor }) {
  // 轨道间距随尺寸缩放
  const orbitGap = Math.max(12, size * 0.08)
  const orbitRadius = size / 2 + orbitGap
  const circumference = 2 * Math.PI * orbitRadius
  const strokeOffset = circumference * (1 - progress)
  // 线宽随尺寸缩放
  const strokeWidth = Math.max(2, Math.min(4, size * 0.015))

  return (
    <svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90"
      width={orbitRadius * 2 + 16}
      height={orbitRadius * 2 + 16}
      style={{ filter: `drop-shadow(0 0 ${size * 0.03}px ${glowColor})` }}
    >
      {/* 背景轨道 */}
      <circle
        cx={orbitRadius + 8}
        cy={orbitRadius + 8}
        r={orbitRadius}
        fill="none"
        stroke="var(--focus-text-muted)"
        strokeWidth={strokeWidth}
        opacity={0.3}
      />
      {/* 进度弧 */}
      <circle
        cx={orbitRadius + 8}
        cy={orbitRadius + 8}
        r={orbitRadius}
        fill="none"
        stroke="var(--focus-star-core)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeOffset}
        className="transition-all duration-100"
      />
      {/* 进度头部光点 */}
      {progress > 0 && (
        <circle
          cx={orbitRadius + 8 + orbitRadius * Math.cos(2 * Math.PI * progress - Math.PI / 2)}
          cy={orbitRadius + 8 + orbitRadius * Math.sin(2 * Math.PI * progress - Math.PI / 2)}
          r={Math.max(3, strokeWidth + 1)}
          fill="var(--focus-star-core)"
          style={{ filter: 'blur(1px)' }}
        />
      )}
    </svg>
  )
})

// ═══════════════════════════════════════════════════════════════════════════
// 计时星球主组件 - 支持动态尺寸变化
// ═══════════════════════════════════════════════════════════════════════════
export const TimerPlanet = memo(function TimerPlanet({
  size = 180,
  progress = 0,
  timeDisplay = '',
  isPaused = false,
  planet = PLANET_TEXTURES[0]
}) {
  const planetRef = useRef(null)
  const breathTween = useRef(null)
  const hasAnimated = useRef(false)

  // 入场动画（只执行一次）
  useEffect(() => {
    if (!planetRef.current || hasAnimated.current) return
    hasAnimated.current = true

    gsap.fromTo(planetRef.current,
      { scale: 0, rotate: -30 },
      { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' }
    )
  }, [])

  // 暂停时呼吸动画
  useEffect(() => {
    if (!planetRef.current) return

    if (isPaused) {
      breathTween.current = gsap.to(planetRef.current, {
        scale: 1.03,
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      })
    } else {
      breathTween.current?.kill()
      gsap.to(planetRef.current, { scale: 1, duration: 0.3 })
    }

    return () => { breathTween.current?.kill() }
  }, [isPaused])

  // 动态计算阴影尺寸
  const shadowSize = Math.max(20, size * 0.1)

  return (
    <div
      className="relative transition-all duration-300 ease-out"
      style={{ width: size + 60, height: size + 60 }}
    >
      {/* 进度轨道 */}
      <ProgressOrbit size={size} progress={progress} glowColor={planet.glow} />

      {/* 星球本体 */}
      <div
        ref={planetRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden transition-all duration-300 ease-out"
        style={{
          width: size,
          height: size,
          boxShadow: `
            inset -${shadowSize}px -${shadowSize}px ${shadowSize * 2}px rgba(0, 0, 0, 0.8),
            0 0 ${shadowSize * 1.5}px ${planet.glow}
          `
        }}
      >
        {/* 旋转纹理层 */}
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            isPaused ? "animate-none" : "animate-planet-rotate"
          )}
          style={{
            backgroundImage: `
              radial-gradient(
                circle at 30% 30%,
                rgba(255, 255, 255, 0.25) 0%,
                rgba(255, 255, 255, 0.05) 30%,
                transparent 60%
              ),
              url(${planet.src})
            `,
            backgroundSize: '150%',
            backgroundPosition: '0% center',
            backgroundRepeat: 'repeat-x'
          }}
        />

        {/* 球体暗面遮罩 */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `
              radial-gradient(
                circle at 70% 70%,
                transparent 30%,
                rgba(0, 0, 0, 0.4) 70%,
                rgba(0, 0, 0, 0.7) 100%
              )
            `
          }}
        />
      </div>

      {/* 时间显示（可选，当 timeDisplay 非空时显示） */}
      {timeDisplay && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span
            className="font-light tabular-nums"
            style={{
              fontSize: Math.max(16, size * 0.15),
              color: 'var(--focus-text-bright)',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 0, 0, 0.3)'
            }}
          >
            {timeDisplay}
          </span>
        </div>
      )}
    </div>
  )
})
