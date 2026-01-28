/**
 * [INPUT]: react, gsap
 * [OUTPUT]: OrbitPaths 组件
 * [POS]: 轨道带 - 独立短弧线片段，随机分布，自然感
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef, useMemo } from 'react'
import gsap from 'gsap'

// ═══════════════════════════════════════════════════════════════════════════
// 椭圆上的点计算
// ═══════════════════════════════════════════════════════════════════════════

function getEllipsePoint(cx, cy, rx, ry, angle, rotation) {
  const rad = angle * (Math.PI / 180)
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)

  // 旋转
  const rotRad = rotation * (Math.PI / 180)
  const rotCos = Math.cos(rotRad)
  const rotSin = Math.sin(rotRad)

  const x = cx + rx * cos
  const y = cy + ry * sin

  return {
    x: cx + (x - cx) * rotCos - (y - cy) * rotSin,
    y: cy + (x - cx) * rotSin + (y - cy) * rotCos
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 单个弧线片段
// ═══════════════════════════════════════════════════════════════════════════

function OrbitSegment({ segment, index }) {
  const pathRef = useRef(null)

  useEffect(() => {
    if (!pathRef.current) return

    // 极慢闪烁
    gsap.to(pathRef.current, {
      strokeOpacity: segment.opacity * (0.4 + Math.random() * 0.4),
      duration: 6 + Math.random() * 4,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: Math.random() * 3
    })
  }, [segment.opacity])

  // 计算弧线路径
  const start = getEllipsePoint(segment.cx, segment.cy, segment.rx, segment.ry, segment.startAngle, segment.rotation)
  const end = getEllipsePoint(segment.cx, segment.cy, segment.rx, segment.ry, segment.endAngle, segment.rotation)

  const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? '0' : '1'

  const pathData = `M ${start.x} ${start.y} A ${segment.rx} ${segment.ry} ${segment.rotation} ${largeArcFlag} 1 ${end.x} ${end.y}`

  return (
    <path
      ref={pathRef}
      d={pathData}
      stroke="#5a6a7a"
      strokeWidth={segment.width}
      fill="none"
      strokeLinecap="round"
      strokeOpacity={segment.opacity}
      style={{ filter: `blur(${segment.blur}px)` }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 生成轨道片段 - 随机分布的短弧线
// ═══════════════════════════════════════════════════════════════════════════

function generateOrbitSegments() {
  const segments = []
  const rotation = -15  // 统一倾斜

  // 每条轨道分成 8-12 个随机片段
  const orbits = [
    { rx: 350, ry: 100, count: 12, width: 1.5, blur: 0.3, baseOpacity: 0.6 },
    { rx: 400, ry: 130, count: 10, width: 1.2, blur: 0.5, baseOpacity: 0.5 },
    { rx: 450, ry: 160, count: 8, width: 1, blur: 0.8, baseOpacity: 0.4 },
    { rx: 500, ry: 190, count: 7, width: 0.8, blur: 1, baseOpacity: 0.35 },
    { rx: 550, ry: 220, count: 5, width: 0.5, blur: 1.2, baseOpacity: 0.25 },
  ]

  orbits.forEach((orbit) => {
    const totalAngle = 340  // 总共 340 度，留 20 度缺口
    const usedAngles = []

    for (let i = 0; i < orbit.count; i++) {
      // 随机位置和长度
      let startAngle, length
      let attempts = 0

      do {
        startAngle = Math.random() * totalAngle
        length = 15 + Math.random() * 35  // 15-50 度的弧长
        attempts++
      } while (attempts < 50 && usedAngles.some(a => Math.abs(a - startAngle) < 20))

      if (attempts >= 50) continue

      usedAngles.push(startAngle)

      segments.push({
        cx: 400, cy: 300,
        rx: orbit.rx,
        ry: orbit.ry,
        rotation,
        startAngle,
        endAngle: startAngle + length,
        width: orbit.width,
        blur: orbit.blur,
        opacity: orbit.baseOpacity * (0.6 + Math.random() * 0.4)
      })
    }
  })

  return segments
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件
// ═══════════════════════════════════════════════════════════════════════════

export function OrbitPaths() {
  const containerRef = useRef(null)
  const segments = useMemo(() => generateOrbitSegments(), [])

  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 3 }
    )
  }, [])

  return (
    <svg
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {segments.map((seg, index) => (
        <OrbitSegment key={index} segment={seg} index={index} />
      ))}
    </svg>
  )
}
