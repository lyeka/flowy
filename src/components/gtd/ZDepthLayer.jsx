/**
 * [INPUT]: react, gsap
 * [OUTPUT]: ZDepthLayer 组件, DEPTH_LAYERS 常量
 * [POS]: 深度层管理器，统一管理 far/mid/near 三层的视差、模糊
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 深度层配置 - Z 轴三层系统
// ═══════════════════════════════════════════════════════════════════════════

export const DEPTH_LAYERS = {
  far: {
    zIndex: 3,
    blur: 1,
    parallaxSpeed: 0.03,  // 最慢，最远
    opacity: 0.7
  },
  mid: {
    zIndex: 10,
    blur: 0.3,
    parallaxSpeed: 0.15,  // 中速
    opacity: 0.85
  },
  near: {
    zIndex: 20,
    blur: 0,  // 清晰
    parallaxSpeed: 0.4,   // 最快，最近 (是 far 的 13 倍)
    opacity: 1
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 视差上下文
// ═══════════════════════════════════════════════════════════════════════════

const ParallaxContext = createContext({
  intensity: 1
})

// Hook: 获取当前视差偏移（已废弃，保留兼容性）
export function useParallax(speed = 1) {
  const { intensity } = useContext(ParallaxContext)
  // 通过 CSS 变量应用视差，不在 render 中计算
  return {
    x: 0,
    y: 0,
    intensity,
    style: {
      transform: `translate(
        calc(var(--parallax-x) * ${speed}),
        calc(var(--parallax-y) * ${speed})
      )`
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 深度层组件 - 包装子元素并应用深度效果 + 自动漂移
// ═══════════════════════════════════════════════════════════════════════════

export function ZDepthLayer({
  layer = 'mid',  // 'far' | 'mid' | 'near'
  children,
  className,
  style = {},
  disableParallax = false
}) {
  const config = DEPTH_LAYERS[layer] || DEPTH_LAYERS.mid

  // 通过 CSS 变量应用视差，不在 render 中计算
  const transformStyle = disableParallax ? {} : {
    transform: `translate(
      calc(var(--parallax-x) * ${config.parallaxSpeed * 10}),
      calc(var(--parallax-y) * ${config.parallaxSpeed * 10})
    )`
  }

  return (
    <div
      className={cn("absolute inset-0", className)}
      style={{
        zIndex: config.zIndex,
        opacity: config.opacity,
        pointerEvents: 'none',
        ...style
      }}
    >
      <div
        style={{
          filter: config.blur > 0 ? `blur(${config.blur}px)` : undefined,
          ...transformStyle,
          willChange: 'transform',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 视差提供者 - 在最外层监听鼠标移动，带惯性回弹
// ═══════════════════════════════════════════════════════════════════════════

export function ParallaxProvider({
  children,
  className,
  intensity = 1  // 视差强度倍数
}) {
  const containerRef = useRef(null)
  const gsapObjRef = useRef({ x: 0, y: 0 })
  const targetPosRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = useCallback((e) => {
    // 归一化到 -1 到 1
    const x = ((e.clientX / window.innerWidth) - 0.5) * 2 * intensity
    const y = ((e.clientY / window.innerHeight) - 0.5) * 2 * intensity
    targetPosRef.current = { x, y }
  }, [intensity])

  const handleMouseLeave = useCallback(() => {
    targetPosRef.current = { x: 0, y: 0 }
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════
  // 惯性回弹 - GSAP 直接操作 CSS 变量，不触发 React 渲染
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!containerRef.current) return

    // 创建 GSAP 动画，返回一个 tween 对象
    const tween = gsap.to(gsapObjRef.current, {
      x: targetPosRef.current.x,
      y: targetPosRef.current.y,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        // 直接修改 CSS 变量，不通过 React
        if (containerRef.current) {
          containerRef.current.style.setProperty('--parallax-x', `${gsapObjRef.current.x}px`)
          containerRef.current.style.setProperty('--parallax-y', `${gsapObjRef.current.y}px`)
        }
      }
    })

    // 清理函数
    return () => {
      tween.kill()
    }
  }, [intensity]) // 依赖 intensity 而非 targetPosRef.current

  return (
    <ParallaxContext.Provider value={{ intensity }}>
      <div
        ref={containerRef}
        className={cn("relative", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          '--parallax-x': '0px',
          '--parallax-y': '0px'
        }}
      >
        {children}
      </div>
    </ParallaxContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 便捷组件 - 各层快捷方式
// ═══════════════════════════════════════════════════════════════════════════

export function FarLayer(props) {
  return <ZDepthLayer layer="far" {...props} />
}

export function MidLayer(props) {
  return <ZDepthLayer layer="mid" {...props} />
}

export function NearLayer(props) {
  return <ZDepthLayer layer="near" {...props} />
}
