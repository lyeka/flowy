/**
 * [INPUT]: lucide-react (Calendar), date-fns (format), cn (lib/utils), useTranslation (react-i18next)
 * [OUTPUT]: JournalItem 组件
 * [POS]: 过往日记列表项，显示日期 + 标题 + 预览 + 字数
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

export function JournalItem({ journal, onClick, className }) {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh-CN'

  // 计算字数
  const wordCount = journal.content.length

  // 格式化日期
  const day = format(journal.date, 'd')
  const month = format(journal.date, isZh ? 'M月' : 'MMM', {
    locale: isZh ? zhCN : undefined
  })
  const weekday = format(journal.date, isZh ? 'EEEE' : 'EEE', {
    locale: isZh ? zhCN : undefined
  })

  // 内容预览（2行截断）
  const preview = journal.content.slice(0, 100)

  return (
    <button
      onClick={() => onClick?.(journal)}
      className={cn(
        'w-full p-4 rounded-lg border border-border',
        'flex gap-4 items-start',
        'hover:border-primary/30 hover:shadow-sm',
        'transition-all duration-200',
        'text-left',
        className
      )}
    >
      {/* 左侧：日期 */}
      <div className="flex flex-col items-center justify-center min-w-[60px]">
        <div className="text-3xl font-bold text-foreground">{day}</div>
        <div className="text-xs text-muted-foreground">{month}</div>
        <div className="text-xs text-muted-foreground">{weekday}</div>
      </div>

      {/* 右侧：标题 + 预览 + 字数 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* 标题 */}
        <div className="font-medium text-foreground truncate">
          {journal.title}
        </div>

        {/* 预览（2行截断） */}
        {preview && (
          <div className="text-sm text-muted-foreground line-clamp-2">
            {preview}
          </div>
        )}

        {/* 字数 */}
        <div className="text-xs text-muted-foreground text-right mt-1">
          {wordCount} 字
        </div>
      </div>
    </button>
  )
}
