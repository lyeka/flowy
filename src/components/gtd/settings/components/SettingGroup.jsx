/**
 * [INPUT]: react, @/lib/utils
 * [OUTPUT]: SettingGroup 组件 - 设置分组（标题 + 子项）
 * [POS]: settings/components 基础组件，被各 Section 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { cn } from '@/lib/utils'

// ============================================================================
// 设置分组
// ============================================================================

export function SettingGroup({
  title,
  children,
  className
}) {
  return (
    <div className={cn("space-y-1", className)}>
      {title && (
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
}
