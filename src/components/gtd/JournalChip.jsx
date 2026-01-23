/**
 * [INPUT]: lucide-react (BookText), cn (lib/utils)
 * [OUTPUT]: JournalChip 组件
 * [POS]: 日历格子内的日记卡片，与 CalendarTaskChip 平行，通过虚线边框和图标区分
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { BookText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function JournalChip({ journal, onClick, className }) {
  if (!journal) return null

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(journal)
      }}
      className={cn(
        // 基础样式
        'w-full px-2 py-1 rounded text-xs text-left',
        'flex items-center gap-1.5',

        // 视觉差异化：透明背景 + 虚线边框
        'bg-transparent',
        'border border-dashed border-primary/30',

        // 交互效果
        'hover:ring-1 hover:ring-primary/30',
        'transition-all duration-200',

        // 不可拖拽（通过样式暗示）
        'cursor-pointer',

        className
      )}
      draggable={false}
    >
      {/* 图标前缀 */}
      <BookText className="w-3 h-3 text-primary/60 flex-shrink-0" />

      {/* 标题 */}
      <span className="flex-1 truncate text-foreground/80">
        {journal.title}
      </span>
    </button>
  )
}
