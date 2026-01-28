/**
 * [INPUT]: react, gsap
 * [OUTPUT]: OrbitPaths 组件
 * [POS]: 轨道带 - 椭圆形轨道线（像土星环），使用 CSS 变量
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 椭圆轨道配置 - 像土星环一样的椭圆
// ═══════════════════════════════════════════════════════════════════════════
const ORBIT_ELLIPSES = [
  { cx: 400, cy: 300, rx: 380, ry: 120, rotation: -15, opacity: 0.4, width: 2.5, speed: 1 },
  { cx: 400, cy: 300, rx: 420, ry: 140, rotation: -15, opacity: 0.35, width: 2, speed: 0.8 },
  { cx: 400, cy: 300, rx: 460, ry: 160, rotation: -15, opacity: 0.25, width: 1.5, speed: 0.6 },
  { cx: 400, cy: 300, rx: 500, ry: 180, rotation: -15, opacity: 0.2, width: 1, speed: 0.5 },
  { cx: 400, cy: 300, rx: 540, ry: 200, rotation: -15, opacity: 0.15, width: 1, speed: 0.4 },
  { cx: 400, cy: 300, rx: 580, ry: 220, rotation: -15, opacity: 0.1, width: 0.5, speed: 0.3 },
]

// ═══════════════════════════════════════════════════════════════════════════
// 轨道带组件 - 椭圆形，呼吸感动效
// ═══════════════════════════════════════════════════════════════════════════
export function OrbitPaths() {
  const ellipsesRef = useRef([])
  const containerRef = useRef(null)

  // 入场动画 + 呼吸效果
  useEffect(() => {
    ellipsesRef.current.forEach((ellipse, i) => {
      if (!ellipse) return

      // 入场描边动画
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

      // 呼吸感 - 缓慢的透明度脉冲
      gsap.to(ellipse, {
        strokeOpacity: ORBIT_ELLIPSES[i].opacity * 0.6,
        duration: 3 + i * 0.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 2,
      })
    })
  }, [])

  return (
    <svg
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      style={{
        // 使用 CSS 变量作为轨道颜色
        color: 'var(--focus-orbit)'
      }}
    >
      {ORBIT_ELLIPSES.map((orbit, i) => (
        <ellipse
          key={i}
          ref={el => ellipsesRef.current[i] = el}
          cx={orbit.cx}
          cy={orbit.cy}
          rx={orbit.rx}
          ry={orbit.ry}
          transform={`rotate(${orbit.rotation} ${orbit.cx} ${orbit.cy})`}
          stroke="currentColor"
          strokeOpacity={orbit.opacity}
          strokeWidth={orbit.width}
          fill="none"
        />
      ))}
    </svg>
  )
}
