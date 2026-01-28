/**
 * [INPUT]: react, gsap
 * [OUTPUT]: OrbitPaths 组件
 * [POS]: 轨道带 - 椭圆形轨道线（像土星环），深蓝紫色
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 椭圆轨道配置 - 像土星环一样的椭圆
// ═══════════════════════════════════════════════════════════════════════════
const ORBIT_ELLIPSES = [
  { cx: 400, cy: 300, rx: 380, ry: 120, rotation: -15, opacity: 0.4, width: 2.5 },
  { cx: 400, cy: 300, rx: 420, ry: 140, rotation: -15, opacity: 0.35, width: 2 },
  { cx: 400, cy: 300, rx: 460, ry: 160, rotation: -15, opacity: 0.25, width: 1.5 },
  { cx: 400, cy: 300, rx: 500, ry: 180, rotation: -15, opacity: 0.2, width: 1 },
  { cx: 400, cy: 300, rx: 540, ry: 200, rotation: -15, opacity: 0.15, width: 1 },
  { cx: 400, cy: 300, rx: 580, ry: 220, rotation: -15, opacity: 0.1, width: 0.5 },
]

// 深蓝紫色
const ORBIT_COLOR = '100, 120, 180'

// ═══════════════════════════════════════════════════════════════════════════
// 轨道带组件 - 椭圆形
// ═══════════════════════════════════════════════════════════════════════════
export function OrbitPaths() {
  const pathsRef = useRef([])

  // 入场动画 - 描边绘制
  useEffect(() => {
    pathsRef.current.forEach((ellipse, i) => {
      if (!ellipse) return

      // 计算椭圆周长近似值
      const rx = ORBIT_ELLIPSES[i].rx
      const ry = ORBIT_ELLIPSES[i].ry
      const length = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))

      ellipse.style.strokeDasharray = length
      ellipse.style.strokeDashoffset = length

      gsap.to(ellipse, {
        strokeDashoffset: 0,
        duration: 2.5,
        delay: i * 0.12,
        ease: 'power2.out',
      })
    })
  }, [])

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {ORBIT_ELLIPSES.map((orbit, i) => (
        <ellipse
          key={i}
          ref={el => pathsRef.current[i] = el}
          cx={orbit.cx}
          cy={orbit.cy}
          rx={orbit.rx}
          ry={orbit.ry}
          transform={`rotate(${orbit.rotation} ${orbit.cx} ${orbit.cy})`}
          stroke={`rgba(${ORBIT_COLOR}, ${orbit.opacity})`}
          strokeWidth={orbit.width}
          fill="none"
        />
      ))}
    </svg>
  )
}
