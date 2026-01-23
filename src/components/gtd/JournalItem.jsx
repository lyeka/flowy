/**
 * [INPUT]: lucide-react (Calendar), date-fns (format), cn (lib/utils), useTranslation (react-i18next)
 * [OUTPUT]: JournalItem 组件
 * [POS]: 过往日记列表项，布局与任务列表一致，显示日期 + 标题 + 预览 + 字数
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { isMobile } from '@/lib/platform'

export function JournalItem({ journal, onClick, className }) {
  const { i18n } = useTranslation()
  const isZh = i18n.language === 'zh-CN'
  const mobile = isMobile()

  // 计算字数
  const wordCount = journal.content.length

  // 格式化日期
  const dateLabel = format(journal.date, isZh ? 'M月d日' : 'MMM d', {
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
        'group w-full rounded-lg text-left',
        'flex items-center gap-3',
        mobile ? 'p-4 border-b border-border' : 'p-3 border bg-card hover:bg-secondary hover:shadow-sm transition-colors transition-shadow',
        className
      )}
    >
      {/* 左侧：日期 */}
      <div className="flex flex-col items-start justify-center min-w-[72px]">
        <div className={cn(
          "font-semibold text-foreground",
          mobile ? "text-sm" : "text-[13px]"
        )}>
          {dateLabel}
        </div>
        <div className="text-xs text-muted-foreground">{weekday}</div>
      </div>

      {/* 中间：标题 + 预览 */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* 标题 */}
        <div
          className={cn(
            "font-medium truncate inline-flex items-center w-fit max-w-full",
            "bg-primary/10 text-primary px-2 py-0.5 rounded-md",
            mobile ? "text-[15px]" : "text-sm"
          )}
        >
          {journal.title}
        </div>

        {/* 预览（单行截断） */}
        {preview && (
          <div className="text-xs text-muted-foreground line-clamp-1">
            {preview}
          </div>
        )}
      </div>

      {/* 右侧：字数 */}
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {wordCount} 字
      </div>
    </button>
  )
}
