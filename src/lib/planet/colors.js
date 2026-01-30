/**
 * [INPUT]: 无
 * [OUTPUT]: PLANET_COLORS 对象, COLOR_KEYS 数组, selectColor 函数
 * [POS]: 颜色滤镜配置，供 Planet.jsx 和 FocusMode.jsx 共同使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ═══════════════════════════════════════════════════════════════════════════
// 颜色键列表（用于随机选择）
// ═══════════════════════════════════════════════════════════════════════════
export const COLOR_KEYS = [
  'red', 'orange', 'amber', 'yellow', 'lime', 'green',
  'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
  'violet', 'purple', 'fuchsia', 'pink', 'rose', 'cream'
]

// ═══════════════════════════════════════════════════════════════════════════
// 行星颜色配置 - 通过 hue-rotate 滤镜实现
// ═════════════════════════════════════════════��═════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════════
// 根据任务 ID 确定性地选择颜色（保持一致性）
// ═══════════════════════════════════════════════════════════════════════════
export function selectColor(taskId) {
  const hash = taskId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const key = COLOR_KEYS[hash % COLOR_KEYS.length]
  return { key, config: PLANET_COLORS[key] }
}
