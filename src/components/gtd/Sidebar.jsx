/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LISTS/GTD_LIST_META，依赖 lucide-react 图标
 * [OUTPUT]: 导出 Sidebar 组件
 * [POS]: GTD 侧边栏导航，上下排布，支持视图切换和列表导航
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { cn } from '@/lib/utils'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, CalendarDays, List } from 'lucide-react'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function Sidebar({ activeList, onSelect, counts, viewMode, onViewModeChange }) {
  return (
    <aside className="w-64 border-r bg-sidebar p-4 flex flex-col gap-4">
      <h1 className="text-xl font-bold px-3 text-sidebar-foreground">GTD</h1>

      {/* 视图分组 */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-1">视图</h2>
        <button
          onClick={() => onViewModeChange('list')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent",
            viewMode === 'list' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}
        >
          <List className="h-4 w-4" />
          列表视图
        </button>
        <button
          onClick={() => onViewModeChange('calendar')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent",
            viewMode === 'calendar' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}
        >
          <CalendarDays className="h-4 w-4" />
          日历视图
        </button>
      </div>

      {/* GTD 列表分组 */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-1">
          <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-1">列表</h2>
          {Object.entries(GTD_LIST_META).map(([key, meta]) => {
            const Icon = ICONS[meta.icon]
            const isActive = activeList === key
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  "hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
              >
                <Icon className={cn("h-4 w-4", meta.color)} />
                <span className="flex-1 text-left">{meta.label}</span>
                {counts[key] > 0 && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {counts[key]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
