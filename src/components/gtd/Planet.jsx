/**
 * [INPUT]: react, gsap, @/lib/utils
 * [OUTPUT]: Planet 组件, PLANET_COLORS 常量
 * [POS]: SVG filter 手绘风格行星，不规则边缘 + 渐变填充 + 玻璃球高光
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 行星颜色配置
// ═══════════════════════════════════════════════════════════════════════════
export const PLANET_COLORS = {
  coral: {
    base: '#ff7b5c',
    highlight: '#ffb090',
    shadow: '#cc5a40',
  },
  purple: {
    base: '#a855f7',
    highlight: '#d4a5ff',
    shadow: '#7c3aed',
  },
  cyan: {
    base: '#4dd4ac',
    highlight: '#a0f0d0',
    shadow: '#2a9d8f',
  },
  cream: {
    base: '#f0d090',
    highlight: '#fff0c0',
    shadow: '#c0a060',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 手绘风格行星组件 - SVG filter 实现不规则边缘
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

  // 渐变背景
  const gradient = `radial-gradient(circle at 30% 30%, ${color.highlight} 0%, ${color.base} 45%, ${color.shadow} 100%)`

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
      {/* SVG Filter 定义 */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id={filterId}>
            {/* 手绘扭曲效果 */}
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="2"
              result="noise"
              seed={Math.floor(Math.random() * 100)}
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={size * 0.04}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* 土星环（在行星后面） */}
      {hasRing && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            width: size * 1.6,
            height: size * 0.5,
            border: `2px solid ${color.base}60`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%) rotateX(70deg)',
          }}
        />
      )}

      {/* 行星主体 - 应用手绘 filter */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: gradient,
          boxShadow: `0 0 ${size * 0.3}px ${color.base}40`,
          filter: `url(#${filterId})`,
        }}
      />

      {/* 玻璃球高光 */}
      <div
        className="absolute rounded-full bg-white/70"
        style={{
          width: size * 0.15,
          height: size * 0.15,
          left: '22%',
          top: '18%',
          filter: 'blur(1px)',
        }}
      />

      {/* 次级高光 */}
      <div
        className="absolute rounded-full bg-white/40"
        style={{
          width: size * 0.08,
          height: size * 0.08,
          left: '35%',
          top: '28%',
          filter: 'blur(0.5px)',
        }}
      />

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
