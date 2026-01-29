/**
 * [INPUT]: react, gsap, framer-motion, @/lib/utils, @/assets/plant/*
 * [OUTPUT]: Planet 组件, PLANET_COLORS 常量
 * [POS]: 手绘风格行星，随机素材渲染，支持坍缩动画、红巨星状态、番茄环渲染、长按专注、右键菜单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import plant1SVG from '@/assets/plant/plant1.svg?raw'
import plant2SVG from '@/assets/plant/plant2.svg?raw'
import plant3SVG from '@/assets/plant/plant3.svg?raw'
import starSVG from '@/assets/plant/star.svg?raw'

// ═══════════════════════════════════════════════════════════════════════════
// 星球素材列表
// ═══════════════════════════════════════════════════════════════════════════
const PLANET_SVGS = [plant1SVG, plant2SVG, plant3SVG, starSVG]

// 根据任务 ID 确定性地选择素材（保持一致性）
function selectPlanetSVG(taskId) {
  // 简单哈希：将 ID 字符转为数字和，然后取模
  const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PLANET_SVGS[hash % PLANET_SVGS.length]
}

// ═══════════════════════════════════════════════════════════════════════════
// 行星颜色配置 - 扩展颜色选项，通过 hue-rotate 滤镜实现
// ═══════════════════════════════════════════════════════════════════════════
const COLOR_KEYS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose', 'cream'
]

export const PLANET_COLORS = {
  // 暖色系
  red: { filter: 'hue-rotate(0deg) saturate(1.3)' },
  orange: { filter: 'hue-rotate(30deg) saturate(1.2)' },
  amber: { filter: 'hue-rotate(45deg) saturate(1.3)' },
  yellow: { filter: 'hue-rotate(60deg) saturate(1.2)' },
  lime: { filter: 'hue-rotate(90deg) saturate(1.1)' },
  // 绿色系
  green: { filter: 'hue-rotate(120deg) saturate(1.0)' },
  emerald: { filter: 'hue-rotate(140deg) saturate(1.1)' },
  teal: { filter: 'hue-rotate(170deg) saturate(0.9)' },
  // 冷色系
  cyan: { filter: 'hue-rotate(180deg) saturate(1.0)' },
  sky: { filter: 'hue-rotate(200deg) saturate(1.0)' },
  blue: { filter: 'hue-rotate(220deg) saturate(1.1)' },
  indigo: { filter: 'hue-rotate(250deg) saturate(1.0)' },
  // 紫粉色系
  violet: { filter: 'hue-rotate(270deg) saturate(1.0)' },
  purple: { filter: 'hue-rotate(290deg) saturate(1.0)' },
  fuchsia: { filter: 'hue-rotate(310deg) saturate(1.2)' },
  pink: { filter: 'hue-rotate(330deg) saturate(1.2)' },
  rose: { filter: 'hue-rotate(345deg) saturate(1.3)' },
  // 中性
  cream: { filter: 'hue-rotate(45deg) saturate(0.3) brightness(1.2)' },
  // 紧急状态
  urgent: { filter: 'hue-rotate(0deg) saturate(2.0) brightness(1.2)' },
}

// 根据任务 ID 确定性地选择颜色（保持一致性）
function selectPlanetColor(taskId) {
  const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return COLOR_KEYS[hash % COLOR_KEYS.length]
}

// ═══════════════════════════════════════════════════════════════════════════
// 粒子效果组件
// ═══════════════════════════════════════════════════════════════════════════
function Particles({ origin, count = 12, onComplete }) {
  const particlesRef = useRef(null)

  useEffect(() => {
    if (!particlesRef.current) return

    const particles = particlesRef.current.children
    const tl = gsap.timeline({
      onComplete
    })

    // 每个粒子向不同方向飞散
    Array.from(particles).forEach((particle, i) => {
      const angle = (i / count) * Math.PI * 2
      const distance = 80 + Math.random() * 60
      const x = Math.cos(angle) * distance
      const y = Math.sin(angle) * distance

      tl.to(particle, {
        x,
        y,
        opacity: 0,
        scale: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power2.out'
      }, 0)
    })

    return () => tl.kill()
  }, [count, onComplete, origin])

  return (
    <div
      ref={particlesRef}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: `translate(${origin.x}px, ${origin.y}px)` }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-amber-200"
          style={{
            left: '50%',
            top: '50%',
            marginLeft: '-4px',
            marginTop: '-4px',
            boxShadow: '0 0 6px rgba(255,255,200,0.8)'
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 番茄环组件 - 显示已完成的番茄钟数量
// ═══════════════════════════════════════════════════════════════════════════
function PomodoroRings({ count, size }) {
  const ringsRef = useRef(null)

  useEffect(() => {
    if (!ringsRef.current || count === 0) return

    // 入场动画
    gsap.fromTo(ringsRef.current.children,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.1,
        ease: 'back.out(1.7)'
      }
    )
  }, [count])

  if (count === 0) return null

  // 显示最多 2 个环，更多显示数字
  const ringCount = Math.min(count, 2)
  const ringSize = size * 0.7
  const ringGap = 8

  return (
    <div
      ref={ringsRef}
      className="absolute inset-0 pointer-events-none flex items-center justify-center"
    >
      {Array.from({ length: ringCount }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-amber-400/60"
          style={{
            width: ringSize + (i * ringGap * 2),
            height: ringSize + (i * ringGap * 2),
            animation: 'ring-pulse 3s ease-in-out infinite',
            animationDelay: `${i * 0.5}s`
          }}
        />
      ))}
      {count >= 3 && (
        <div className="absolute text-amber-400 font-bold text-sm">
          {count}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 右键菜单组件
// ═══════════════════════════════════════════════════════════════════════════
function ContextMenu({ position, task, onClose, onComplete, onMoveToToday, onMoveToTomorrow, onDelete, onEdit, onFocus }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  if (!position) return null

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] py-2 rounded-lg backdrop-blur-sm shadow-xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(8px, 8px)',
        background: 'var(--focus-card-bg)',
        border: '1px solid var(--focus-card-border)'
      }}
    >
      {/* 进入专注 - 首选项 */}
      {onFocus && (
        <ContextMenuButton onClick={onFocus} className="text-amber-600 hover:bg-amber-500/10 font-medium">
          进入专注
        </ContextMenuButton>
      )}
      <ContextMenuButton onClick={onComplete} className="text-green-600 hover:bg-green-500/10">
        完成任务
      </ContextMenuButton>
      <ContextMenuButton onClick={onEdit}>
        编辑任务
      </ContextMenuButton>
      <ContextMenuButton onClick={onMoveToToday}>
        移到今天
      </ContextMenuButton>
      <ContextMenuButton onClick={onMoveToTomorrow}>
        移到明天
      </ContextMenuButton>
      <div className="h-px bg-border/50 my-1" />
      <ContextMenuButton onClick={onDelete} className="text-destructive hover:bg-destructive/10">
        删除
      </ContextMenuButton>
    </div>
  )
}

function ContextMenuButton({ children, onClick, className }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2 text-left text-sm transition-colors",
        "text-foreground hover:bg-accent",
        className
      )}
    >
      {children}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 坍缩动画完成后的恒星残留
// ═══════════════════════════════════════════════════════════════════════════
function CollapsedStar({ size, onComplete }) {
  const starRef = useRef(null)

  useEffect(() => {
    if (!starRef.current) return

    // 恒星浮现动画
    gsap.fromTo(starRef.current,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        delay: 0.3,
        ease: 'back.out(2)',
        onComplete
      }
    )
  }, [onComplete])

  return (
    <div
      ref={starRef}
      className="absolute pointer-events-none"
      style={{
        width: size * 0.3,
        height: size * 0.3,
        left: '50%',
        top: '50%',
        marginLeft: `-${size * 0.15}px`,
        marginTop: `-${size * 0.15}px`,
      }}
    >
      {/* 闪烁的光晕 */}
      <div className="absolute inset-0 rounded-full bg-amber-200/40 animate-pulse" />
      {/* 核心亮点 */}
      <div className="absolute inset-2 rounded-full bg-amber-100/80" />
      {/* 星芒 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-px bg-white/80" />
        <div className="w-px h-full bg-white/80 absolute" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 手绘风格行星
// ═══════════════════════════════════════════════════════════════════════════
export function Planet({
  task,
  size = 60,
  position = { x: '50%', y: '50%' },
  colorKey = 'coral',
  hasRing = false,
  layer = 'mid',
  isSelected = false,
  isOverdue = false,
  pomodoroCount = 0,
  onClick,
  onLongPress,
  onPositionChange,
  onTaskSelect,
  onEdit,
  onMoveToToday,
  onMoveToTomorrow,
  onDelete,
  onCollapsed, // 新增：坍缩完成回调
  className
}) {
  const ref = useRef(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(null)
  const [contextMenuPos, setContextMenuPos] = useState(null)
  const [isCollapsing, setIsCollapsing] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  // 长按相关
  const longPressTimerRef = useRef(null)
  const [isLongPressing, setIsLongPressing] = useState(false)

  // 本地位置状态（用于拖拽）
  const [localPos, setLocalPos] = useState({ x: position.x, y: position.y })

  // 根据任务 ID 选择随机颜色（过期任务除外）
  const randomColorKey = useMemo(() => selectPlanetColor(task.id), [task.id])
  const effectiveColorKey = isOverdue ? 'urgent' : randomColorKey
  const colorConfig = PLANET_COLORS[effectiveColorKey] || PLANET_COLORS.cream

  // 层级配置
  const layerConfig = useMemo(() => {
    switch (layer) {
      case 'front': return { zIndex: 30, speed: 1 }
      case 'back': return { zIndex: 10, speed: 0.5 }
      default: return { zIndex: 20, speed: 0.75 }
    }
  }, [layer])

  // 动画引用
  const breatheTweenRef = useRef(null)
  const driftTweenRef = useRef(null)

  // 坍缩动画
  const triggerCollapse = useCallback(() => {
    if (!ref.current || isCollapsing || collapsed) return

    setIsCollapsing(true)

    const tl = gsap.timeline({
      onComplete: () => {
        setCollapsed(true)
        setIsCollapsing(false)
        onCollapsed?.(task, {
          x: localPos.x,
          y: localPos.y
        }, size)
      }
    })

    // 1. 收缩
    tl.to(ref.current, {
      scale: 0,
      opacity: 0.5,
      duration: 0.5,
      ease: 'power4.in'
    })

    // 2. 同时触发粒子效果和闪白
    tl.add(() => {
      // 创建闪白效果
      const flash = document.createElement('div')
      flash.className = 'fixed inset-0 bg-white pointer-events-none z-50'
      flash.style.opacity = '0.3'
      document.body.appendChild(flash)

      gsap.to(flash, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => flash.remove()
      })
    }, 0.3)

  }, [isCollapsing, collapsed, onCollapsed, task, localPos, size])

  // 长按处理
  const handleMouseDown = (e) => {
    if (e.button === 2) return // 右键不处理

    e.stopPropagation()
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const container = ref.current.parentElement
    const containerRect = container.getBoundingClientRect()
    const hasMoved = useRef(false)

    // 当前位置转像素
    const currentX = (parseFloat(localPos.x) / 100) * containerRect.width
    const currentY = (parseFloat(localPos.y) / 100) * containerRect.height

    // 启动长按计时
    longPressTimerRef.current = setTimeout(() => {
      if (!hasMoved.current) {
        setIsLongPressing(true)
        onLongPress?.(task)
      }
    }, 800)

    const handleMouseMove = (moveEvent) => {
      hasMoved.current = true

      // 取消长按
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      let newX = ((currentX + deltaX) / containerRect.width) * 100
      let newY = ((currentY + deltaY) / containerRect.height) * 100

      newX = Math.max(5, Math.min(95, newX))
      newY = Math.max(5, Math.min(95, newY))

      setLocalPos({ x: `${newX.toFixed(1)}%`, y: `${newY.toFixed(1)}%` })
    }

    const handleMouseUp = (upEvent) => {
      setIsDragging(false)

      // 清理长按计时
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current)
        longPressTimerRef.current = null
      }

      setIsLongPressing(false)

      // 保存位置
      if (hasMoved.current) {
        onPositionChange?.(task.id, localPos)
      }

      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // 右键菜单处理
  const handleContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  // 点击处理（只选中，不完成）
  const handleClick = useCallback((e) => {
    e.stopPropagation()

    // 如果已坍缩，不处理
    if (collapsed) return

    // 如果正在坍缩，不处理
    if (isCollapsing) return

    // 点击切换选中状态
    onTaskSelect?.(task.id)
  }, [collapsed, isCollapsing, onTaskSelect, task.id])

  // GSAP 呼吸感动画
  useEffect(() => {
    if (!ref.current || collapsed) return

    const duration = 4 + Math.random() * 2
    const driftX = (Math.random() - 0.5) * 15 * layerConfig.speed
    const driftY = (Math.random() - 0.5) * 12 * layerConfig.speed

    // 入场动画
    gsap.fromTo(ref.current,
      { opacity: 0, scale: 0.6, rotation: -10 },
      { opacity: 1, scale: 1, rotation: 0, duration: 1, delay: Math.random() * 0.5, ease: 'back.out(1.7)' }
    )

    // 过期任务的快速脉动
    if (isOverdue) {
      breatheTweenRef.current = gsap.to(ref.current, {
        scale: 1.12,
        filter: 'hue-rotate(10deg)',
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })
    } else {
      // 正常呼吸
      breatheTweenRef.current = gsap.to(ref.current, {
        scale: 1.05,
        rotation: 3,
        duration,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }

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
  }, [layerConfig.speed, isOverdue, collapsed])

  // 拖拽时暂停呼吸动画
  useEffect(() => {
    if (breatheTweenRef.current) {
      if (isDragging || isLongPressing) {
        breatheTweenRef.current.pause()
      } else {
        breatheTweenRef.current.resume()
      }
    }
    if (driftTweenRef.current) {
      if (isDragging || isLongPressing) {
        driftTweenRef.current.pause()
      } else {
        driftTweenRef.current.resume()
      }
    }
  }, [isDragging, isLongPressing])

  // 长按进度指示器
  const longPressProgress = useLongPressProgress(isLongPressing)

  return (
    <>
      <div
        ref={ref}
        className={cn(
          "absolute cursor-pointer transition-all duration-300",
          isHovered && !isDragging && !collapsed && "scale-110",
          isDragging && "scale-105 cursor-grabbing",
          isSelected && !collapsed && "scale-125",
          className
        )}
        style={{
          width: size,
          height: size,
          marginLeft: `calc(${localPos.x} - ${size / 2}px)`,
          marginTop: `calc(${localPos.y} - ${size / 2}px)`,
          zIndex: layerConfig.zIndex + (isDragging ? 100 : 0),
          opacity: collapsed ? 0 : 1,
          pointerEvents: collapsed ? 'none' : 'auto'
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        onClick={handleClick}
      >
        {/* 番茄环 */}
        <PomodoroRings count={pomodoroCount} size={size} />

        {/* 选中状态脉冲光环 */}
        {isSelected && !collapsed && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, oklch(from var(--primary) l c h / 50%) 0%, transparent 70%)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }}
          />
        )}

        {/* 长按进度环 */}
        {isLongPressing && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset={283 * (1 - longPressProgress)}
              />
            </svg>
          </div>
        )}

        {/* SVG 素材 - 根据任务 ID 随机选择，使用素材自带的 viewBox */}
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            filter: isSelected
              ? `${colorConfig.filter} drop-shadow(0 0 15px oklch(from var(--primary) l c h / 60%))`
              : colorConfig.filter
          }}
          dangerouslySetInnerHTML={{ __html: selectPlanetSVG(task.id) }}
        />

        {/* Tooltip - 重新设计 */}
        {isHovered && task && !isDragging && !collapsed && (
          <div
            className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
            style={{ top: '135%' }}
          >
            {/* 连接线 */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-px"
              style={{
                top: '-8px',
                height: '8px',
                background: 'oklch(from var(--primary) l c h / 40%)'
              }}
            />
            {/* 内容卡片 */}
            <div
              className="px-3 py-2 rounded-lg shadow-sm text-xs whitespace-nowrap"
              style={{
                background: 'oklch(from var(--card) l c h)',
                border: '1px solid oklch(from var(--border) l c h)',
                color: 'oklch(from var(--foreground) l c h)'
              }}
            >
              <span className="font-medium">{task.title}</span>
              {pomodoroCount > 0 && (
                <span
                  className="ml-2 px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: 'oklch(from var(--primary) l c h / 15%)',
                    color: 'oklch(from var(--primary) l c h)'
                  }}
                >
                  {pomodoroCount}
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 坍缩后的恒星残留 */}
      {collapsed && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: localPos.x,
            top: localPos.y,
            width: size,
            height: size,
            marginLeft: `-${size / 2}px`,
            marginTop: `-${size / 2}px`,
            zIndex: layerConfig.zIndex
          }}
        >
          <CollapsedStar size={size} />
        </div>
      )}

      {/* 右键菜单 */}
      <AnimatePresence>
        {showContextMenu && (
          <ContextMenu
            position={contextMenuPos}
            task={task}
            onClose={() => setShowContextMenu(false)}
            onComplete={() => { triggerCollapse(); onClick?.(task.id); setShowContextMenu(false) }}
            onFocus={() => { onLongPress?.(task); setShowContextMenu(false) }}
            onEdit={() => { onEdit?.(task); setShowContextMenu(false) }}
            onMoveToToday={() => { onMoveToToday?.(task.id); setShowContextMenu(false) }}
            onMoveToTomorrow={() => { onMoveToTomorrow?.(task.id); setShowContextMenu(false) }}
            onDelete={() => { onDelete?.(task.id); setShowContextMenu(false) }}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook: 长按进度动画
// ═══════════════════════════════════════════════════════════════════════════
function useLongPressProgress(isActive) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }

    const startTime = Date.now()
    const duration = 800 // 长按触发时间

    const raf = requestAnimationFrame(function update() {
      const elapsed = Date.now() - startTime
      setProgress(Math.min(elapsed / duration, 1))

      if (elapsed < duration) {
        requestAnimationFrame(update)
      }
    })

    return () => cancelAnimationFrame(raf)
  }, [isActive])

  return progress
}
