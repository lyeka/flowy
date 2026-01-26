/**
 * [INPUT]: react, @/lib/utils
 * [OUTPUT]: SettingItem 组件 - 单行设置项（标签 + 控件）
 * [POS]: settings/components 基础组��，被各 Section 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { cn } from '@/lib/utils'

// ============================================================================
// 单行设置项
// ============================================================================

export function SettingItem({
  label,
  description,
  icon: Icon,
  children,
  className,
  onClick,
  chevron = false
}) {
  const Wrapper = onClick ? 'button' : 'div'

  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        "flex items-center justify-between py-3",
        onClick && "w-full text-left hover:bg-muted/50 -mx-3 px-3 rounded-lg transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          {description && (
            <div className="text-xs text-muted-foreground truncate">
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {chevron && onClick && (
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </div>
    </Wrapper>
  )
}
