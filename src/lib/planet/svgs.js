/**
 * [INPUT]: @/assets/plant/*.svg
 * [OUTPUT]: PLANET_SVGS 数组, selectSVG 函数
 * [POS]: SVG 素材定义，供 Planet.jsx 和 FocusMode.jsx 共同使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import plant1SVG from '@/assets/plant/plant1.svg?raw'
import plant2SVG from '@/assets/plant/plant2.svg?raw'
import plant3SVG from '@/assets/plant/plant3.svg?raw'
import starSVG from '@/assets/plant/star.svg?raw'

// ═══════════════════════════════════════════════════════════════════════════
// 星球 SVG 素材列表
// ═══════════════════════════════════════════════════════════════════════════
export const PLANET_SVGS = [plant1SVG, plant2SVG, plant3SVG, starSVG]

// ═══════════════════════════════════════════════════════════════════════════
// 根据任务 ID 确定性地选择素材（保持一致性）
// ═══════════════════════════════════════════════════════════════════════════
export function selectSVG(taskId) {
  const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return PLANET_SVGS[hash % PLANET_SVGS.length]
}
