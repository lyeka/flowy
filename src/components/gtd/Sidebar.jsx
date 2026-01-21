/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LISTS/GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion
 * [OUTPUT]: 导出 Sidebar 组件
 * [POS]: GTD 侧边栏导航，上下排布，支持视图切换和列表导航，支持折叠
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, CalendarDays, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { snappy } from '@/lib/motion'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function Sidebar({ activeList, onSelect, counts, viewMode, onViewModeChange }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={cn(
      "border-r bg-sidebar p-4 flex flex-col gap-4 transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* 标题栏 + 折叠按钮 */}
      <div className={cn(
        "flex items-center px-3",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <h1 className="text-xl font-bold text-sidebar-foreground">GTD</h1>}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={snappy}
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? <ChevronRight className="h-[18px] w-[18px]" /> : <ChevronLeft className="h-[18px] w-[18px]" />}
        </motion.button>
      </div>

      {/* 视图分组 */}
      <div className="flex flex-col gap-1">
        {!collapsed && <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-1">视图</h2>}
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => onViewModeChange('list')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent",
            viewMode === 'list' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            collapsed && "justify-center"
          )}
        >
          <List className="h-[18px] w-[18px]" />
          {!collapsed && '列表视图'}
        </motion.button>
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => onViewModeChange('calendar')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent",
            viewMode === 'calendar' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
            collapsed && "justify-center"
          )}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
          {!collapsed && '日历视图'}
        </motion.button>
      </div>

      {/* GTD 列表分组 */}
      {viewMode === 'list' && (
        <div className="flex flex-col gap-1">
          {!collapsed && <h2 className="text-xs font-semibold text-muted-foreground px-3 mb-1">列表</h2>}
          {Object.entries(GTD_LIST_META).map(([key, meta]) => {
            const Icon = ICONS[meta.icon]
            const isActive = activeList === key
            return (
              <motion.button
                key={key}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={snappy}
                onClick={() => onSelect(key)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  "hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                  collapsed && "justify-center"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", meta.color)} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{meta.label}</span>
                    {counts[key] > 0 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {counts[key]}
                      </span>
                    )}
                  </>
                )}
              </motion.button>
            )
          })}
        </div>
      )}
    </aside>
  )
}
