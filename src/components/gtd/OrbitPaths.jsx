/**
 * [INPUT]: react
 * [OUTPUT]: OrbitPaths 组件
 * [POS]: 轨道带 - 简化版本测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 简化版轨道 - 椭圆
// ═══════════════════════════════════════════════════════════════════════════

const ORBITS = [
  { cx: 400, cy: 300, rx: 350, ry: 100, rotation: -15 },
  { cx: 400, cy: 300, rx: 400, ry: 130, rotation: -15 },
  { cx: 400, cy: 300, rx: 450, ry: 160, rotation: -15 },
  { cx: 400, cy: 300, rx: 500, ry: 190, rotation: -15 },
  { cx: 400, cy: 300, rx: 550, ry: 220, rotation: -15 },
]

export function OrbitPaths() {
  const svgRef = useRef(null)

  useEffect(() => {
    if (!svgRef.current) return
    // 入场动画
    gsap.fromTo(svgRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
  }, [])

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {ORBITS.map((orbit, i) => (
        <ellipse
          key={i}
          cx={orbit.cx}
          cy={orbit.cy}
          rx={orbit.rx}
          ry={orbit.ry}
          transform={`rotate(${orbit.rotation} ${orbit.cx} ${orbit.cy})`}
          fill="none"
          stroke="#5a6a7a"
          strokeWidth="1.5"
          strokeOpacity="0.4"
        />
      ))}
    </svg>
  )
}
