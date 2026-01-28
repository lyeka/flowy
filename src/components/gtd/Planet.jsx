/**
 * [INPUT]: react, gsap, @/lib/utils
 * [OUTPUT]: Planet 组件, PLANET_COLORS 常量
 * [POS]: 基于 SVG 素材的手绘风格行星，支持拖拽移动，呼吸动效
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import yellowPlanetSVG from '@/assets/yellow_plant.svg?raw'

// ═══════════════════════════════════════════════════════════════════════════
// 行星颜色配置 - 通过 hue-rotate 滤镜实现
// ═══════════════════════════════════════════════════════════════════════════
export const PLANET_COLORS = {
  coral: {
    filter: 'hue-rotate(320deg) saturate(1.2)',  // 黄→珊瑚橙
    glow: 'rgba(255, 150, 120, 0.6)',  // 对应的光晕颜色
  },
  purple: {
    filter: 'hue-rotate(200deg) saturate(0.9)',  // 黄→紫色
    glow: 'rgba(180, 140, 255, 0.6)',  // 紫色光晕
  },
  cyan: {
    filter: 'hue-rotate(140deg) saturate(1.1)',  // 黄→青色
    glow: 'rgba(120, 200, 220, 0.6)',  // 青色光晕
  },
  cream: {
    filter: 'none',  // 保持原色（黄色/奶油色）
    glow: 'rgba(255, 230, 150, 0.6)',  // 奶油色光晕
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// 基于 SVG 素材的行星 - 支持拖拽
// ═══════════════════════════════════════════════════════════════════════════
export function Planet({
  task,
  size = 60,
  position = { x: '50%', y: '50%' },
  colorKey = 'coral',
  hasRing = false,
  layer = 'mid',
  isSelected = false,
  onClick,
  onPositionChange,  // 新增：位置变化回调
  onTaskSelect,  // 新增：任务选择回调
  className
}) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const colorConfig = PLANET_COLORS[colorKey] || PLANET_COLORS.coral

  // 本地位置状态（用于拖拽）
  const [localPos, setLocalPos] = useState({ x: position.x, y: position.y })

  // 层级配置
  const layerConfig = useMemo(() => {
    switch (layer) {
      case 'front': return { zIndex: 30, speed: 1 }
      case 'back': return { zIndex: 10, speed: 0.5 }
      default: return { zIndex: 20, speed: 0.75 }
    }
  }, [layer])

  // 拖拽处理
  const handleMouseDown = (e) => {
    e.stopPropagation()
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const container = ref.current.parentElement
    const containerRect = container.getBoundingClientRect()

    // 当前位置转像素
    const currentX = (parseFloat(localPos.x) / 100) * containerRect.width
    const currentY = (parseFloat(localPos.y) / 100) * containerRect.height

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      // 计算新位置（百分比）
      let newX = ((currentX + deltaX) / containerRect.width) * 100
      let newY = ((currentY + deltaY) / containerRect.height) * 100

      // 限制在容器内
      newX = Math.max(5, Math.min(95, newX))
      newY = Math.max(5, Math.min(95, newY))

      setLocalPos({ x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      onPositionChange?.(localPos)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // GSAP 呼吸感动画 - 缩放 + 旋转（拖拽时暂停）
  useEffect(() => {
    if (!ref.current) return

    const duration = 4 + Math.random() * 2
    const driftX = (Math.random() - 0.5) * 15 * layerConfig.speed
    const driftY = (Math.random() - 0.5) * 12 * layerConfig.speed

    // 入场动画
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.6, rotation: -10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1, delay: Math.random() * 0.5, ease: 'back.out(1.7)' }
    )

    // 呼吸感动画 - 缩放 + 旋转
    breatheTweenRef.current = gsap.to(ref.current, {
      scale: 1.05,
      rotation: 3,
      duration,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    // 漂移动画
    driftTweenRef.current = gsap.to(ref.current, {
      x: driftX,
      y: driftY,
      duration: duration * 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })

    return () => {
      if (breatheTweenRef.current) breatheTweenRef.current.kill()
      if (driftTweenRef.current) driftTweenRef.current.kill()
    }
  }, [layerConfig.speed])

  // 存储动画 tween 引用，用于暂停/恢复
  const breatheTweenRef = useRef(null)
  const driftTweenRef = useRef(null)

  // 拖拽时暂停呼吸动画
  useEffect(() => {
    if (breatheTweenRef.current) {
      if (isDragging) {
        breatheTweenRef.current.pause()
      } else {
        breatheTweenRef.current.resume()
      }
    }
    if (driftTweenRef.current) {
      if (isDragging) {
        driftTweenRef.current.pause()
      } else {
        driftTweenRef.current.resume()
      }
    }
  }, [isDragging])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute cursor-pointer transition-all duration-300",
        isHovered && !isDragging && "scale-110",
        isDragging && "scale-105 cursor-grabbing",
        isSelected && "scale-125",
        className
      )}
      style={{
        width: size,
        height: size,
        marginLeft: `calc(${localPos.x} - ${size / 2}px)`,
        marginTop: `calc(${localPos.y} - ${size / 2}px)`,
        zIndex: layerConfig.zIndex + (isDragging ? 100 : 0),
        opacity: 0,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // 拖拽结束时才触发点击
        if (!isDragging) {
          onTaskSelect?.(task?.id)
          onClick?.(task?.id)
        }
      }}
    >
      {/* 选中状态脉冲光环 - 动态匹配星球颜色 */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${colorConfig.glow.replace('0.6', '0.4')} 0%, transparent 70%)`,
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        />
      )}
      {/* SVG 素材 - 用 filter 改变颜色，选中时叠加光晕 */}
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        style={{
          filter: isSelected
            ? `${colorConfig.filter} drop-shadow(0 0 20px ${colorConfig.glow})`
            : colorConfig.filter
        }}
        dangerouslySetInnerHTML={{ __html: yellowPlanetSVG }}
      />

      {/* Tooltip */}
      {isHovered && task && !isDragging && (
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
