/**
 * [INPUT]: 依赖 @/lib/utils 的 cn 函数
 * [OUTPUT]: 导出 CircularProgress 组件
 * [POS]: UI 基础组件，SVG 圆环进度条，用于项目列表显示完成进度，支持 themeColor 使用系统主题色
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { cn } from '@/lib/utils'

export function CircularProgress({
  value = 0,
  color,
  size = 16,
  strokeWidth = 2,
  className
}) {
  // 半径 = (尺寸 - 线宽) / 2
  const radius = (size - strokeWidth) / 2
  // 周长
  const circumference = 2 * Math.PI * radius
  // 偏移量 = 周长 * (1 - 进度百分比)
  const offset = circumference - (value / 100) * circumference

  // 优先使用传入的颜色，否则使用系统主题色
  const strokeColor = color ?? 'var(--primary)'

  return (
    <svg
      width={size}
      height={size}
      className={cn('flex-shrink-0', className)}
      style={{ color: strokeColor }}
    >
      {/* 背景环 - 20% 透明度 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
      />
      {/* 进度环 - 100% 不透明度 */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-300 ease-out"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}
