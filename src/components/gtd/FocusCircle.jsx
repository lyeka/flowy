/**
 * [INPUT]: react, @/lib/utils, ./StarDust, ./OrbitPaths, ./Planet, ./BlueDust, ./MiniInfo, ./NoiseOverlay
 * [OUTPUT]: FocusCircle 组件
 * [POS]: 专注视图核心 - 柔性宇宙插画，SVG filter 手绘行星 + 椭圆轨道带
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { StarDust } from './StarDust'
import { OrbitPaths } from './OrbitPaths'
import { Planet } from './Planet'
import { BlueDust } from './BlueDust'
import { MiniInfo } from './MiniInfo'
import { NoiseOverlay } from './NoiseOverlay'

// ═══════════════════════════════════════════════════════════════════════════
// 行星配置 - 沿椭圆轨道分布
// ═══════════════════════════════════════════════════════════════════════════
const PLANET_CONFIG = [
  // 左侧小行星
  { x: '12%', y: '45%', size: 40, colorKey: 'purple', layer: 'back' },

  // 中间巨大橙色行星（主角）
  { x: '50%', y: '50%', size: 150, colorKey: 'coral', layer: 'front' },

  // 右上小行星
  { x: '72%', y: '28%', size: 45, colorKey: 'cyan', layer: 'mid' },

  // 左下小行星
  { x: '28%', y: '68%', size: 35, colorKey: 'purple', layer: 'back' },

  // 右下土星
  { x: '85%', y: '55%', size: 80, colorKey: 'cream', hasRing: true, layer: 'front' },

  // 额外小行星
  { x: '62%', y: '65%', size: 28, colorKey: 'cyan', layer: 'mid' },
]

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 柔性宇宙插画
// ═══════════════════════════════════════════════════════════════════════════
export function FocusCircle({
  totalCount = 0,
  completedCount = 0,
  tasks = [],
  onParticleClick,
  className
}) {
  // 准备行星任务数据 - 只取未完成的任务
  const planetTasks = useMemo(() => {
    return tasks.filter(t => !t.completed).slice(0, PLANET_CONFIG.length)
  }, [tasks])

  const pendingCount = totalCount - completedCount

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[500px]",
        // 低饱和度灰绿背景 - 宇宙底噪
        "bg-[#9aa8a0]",
        className
      )}
    >
      {/* Layer 1: 背景星点 */}
      <StarDust count={35} />

      {/* Layer 2: 椭圆轨道带 */}
      <OrbitPaths />

      {/* Layer 3: 蓝色粒子 */}
      <BlueDust count={25} />

      {/* Layer 4: 行星 */}
      {PLANET_CONFIG.map((config, i) => {
        const task = planetTasks[i]
        if (!task) return null

        return (
          <Planet
            key={task.id}
            task={task}
            size={config.size}
            position={{ x: config.x, y: config.y }}
            colorKey={config.colorKey}
            hasRing={config.hasRing}
            layer={config.layer}
            onClick={onParticleClick}
          />
        )
      })}

      {/* Layer 5: 噪点纹理 */}
      <NoiseOverlay />

      {/* Layer 6: 右上角信息 */}
      <MiniInfo count={pendingCount} />
    </div>
  )
}
