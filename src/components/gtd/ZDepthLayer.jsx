/**
 * [INPUT]: react, gsap
 * [OUTPUT]: ZDepthLayer 组件, DEPTH_LAYERS 常量
 * [POS]: 深度层管理器，统一管理 far/mid/near 三层的视差、模糊
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { createContext, useContext, useState, useRef, useEffect } from 'react'
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
  x: 0,
  y: 0
})

// Hook: 获取当前视差偏移
export function useParallax(speed = 1) {
  const { x, y } = useContext(ParallaxContext)
  return {
    x: x * speed,
    y: y * speed,
    style: {
      transform: `translate(${x * speed}px, ${y * speed}px)`
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
  const { x, y } = useContext(ParallaxContext)

  // 计算视差偏移
  const parallaxX = disableParallax ? 0 : x * config.parallaxSpeed * 10
  const parallaxY = disableParallax ? 0 : y * config.parallaxSpeed * 10

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
          transform: `translate(${parallaxX}px, ${parallaxY}px)`,
          willChange: 'transform',
          transition: 'transform 0.15s ease-out',
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
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 })  // 鼠标目标位置
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 }) // 当前缓动位置
  const gsapObjRef = useRef({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    // 归一化到 -1 到 1
    const x = ((e.clientX / window.innerWidth) - 0.5) * 2 * intensity
    const y = ((e.clientY / window.innerHeight) - 0.5) * 2 * intensity
    setTargetPos({ x, y })
  }

  const handleMouseLeave = () => {
    setTargetPos({ x: 0, y: 0 })
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 惯性回弹 - 鼠标停止后缓动归位
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    gsap.to(gsapObjRef.current, {
      x: targetPos.x,
      y: targetPos.y,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        setCurrentPos({ x: gsapObjRef.current.x, y: gsapObjRef.current.y })
      }
    })
  }, [targetPos])

  return (
    <ParallaxContext.Provider value={currentPos}>
      <div
        className={cn("relative", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
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
