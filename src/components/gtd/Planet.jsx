/**
 * [INPUT]: react, gsap, @/lib/utils
 * [OUTPUT]: Planet 组件, PLANET_COLORS 常量
 * [POS]: 手绘插画风格行星，平涂色块 + SVG filter 不规则边缘
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 行星颜色配置 - 平涂色块，手绘插画风格
// ═══════════════════════════════════════════════════════════════════════════
export const PLANET_COLORS = {
  coral: {
    fill: '#ff7b5c',
    stroke: '#cc5a40',
  },
  purple: {
    fill: '#a855f7',
    stroke: '#7c3aed',
  },
  cyan: {
    fill: '#4dd4ac',
    stroke: '#2a9d8f',
  },
  cream: {
    fill: '#f0d090',
    stroke: '#c0a060',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 手绘插画风格行星 - 平涂 + 不规则边缘
// ═══════════════════════════════════════════════════════════════════════════
export function Planet({
  task,
  size = 60,
  position = { x: '50%', y: '50%' },
  colorKey = 'coral',
  hasRing = false,
  layer = 'mid',
  onClick,
  className
}) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const color = PLANET_COLORS[colorKey] || PLANET_COLORS.coral

  // 唯一 ID 用于 SVG filter
  const filterId = useMemo(() => `hand-drawn-${Math.random().toString(36).slice(2, 9)}`, [])

  // 层级配置
  const layerConfig = useMemo(() => {
    switch (layer) {
      case 'front': return { zIndex: 30, speed: 1 }
      case 'back': return { zIndex: 10, speed: 0.5 }
      default: return { zIndex: 20, speed: 0.75 }
    }
  }, [layer])

  // GSAP 漂移动画
  useEffect(() => {
    if (!ref.current) return

    const duration = 12 + Math.random() * 8
    const driftX = (Math.random() - 0.5) * 20 * layerConfig.speed
    const driftY = (Math.random() - 0.5) * 16 * layerConfig.speed

    // 入场动画
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, delay: Math.random() * 0.5 }
    )

    // 漂移动画
    const tween = gsap.to(ref.current, {
      x: driftX,
      y: driftY,
      duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => tween.kill()
  }, [layerConfig.speed])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute cursor-pointer transition-transform duration-200",
        isHovered && "scale-110",
        className
      )}
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
        zIndex: layerConfig.zIndex,
        opacity: 0,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(task?.id)}
    >
      {/* SVG 手绘行星 */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
      >
        <defs>
          {/* 手绘扭曲效果 */}
          <filter id={filterId}>
            <feTurbulence
              type="turbulence"
              baseFrequency="0.02"
              numOctaves="2"
              result="noise"
              seed={Math.floor(Math.random() * 100)}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* 土星环（在行星后面） */}
        {hasRing && (
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="12"
            fill="none"
            stroke={color.stroke}
            strokeWidth="2"
            strokeOpacity="0.5"
            filter={`url(#${filterId})`}
          />
        )}

        {/* 行星主体 - 平涂色块 */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill={color.fill}
          stroke={color.stroke}
          strokeWidth="2"
          filter={`url(#${filterId})`}
        />
      </svg>

      {/* Tooltip */}
      {isHovered && task && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
            "px-3 py-1.5 rounded-full",
            "bg-white/90 backdrop-blur-sm",
            "text-xs text-gray-700",
            "pointer-events-none shadow-lg"
          )}
          style={{ top: '110%' }}
        >
          {task.title}
        </div>
      )}
    </div>
  )
}
