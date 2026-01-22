/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LISTS/GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion，依赖 @/lib/tauri 桌面端 API，依赖 react-i18next
 * [OUTPUT]: 导出 Sidebar 组件
 * [POS]: GTD 侧边栏导航，上下排布，支持视图切换和列表导航，支持折叠，支持数据导出/导入
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, CalendarDays, List, ChevronLeft, ChevronRight, ChevronDown, Settings } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { isTauri, exportData, importData } from '@/lib/tauri'
import { Settings as SettingsDialog } from './Settings'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function Sidebar({ activeList, onSelect, counts, viewMode, onViewModeChange, onExport, onImport, settingsOpen, onSettingsOpenChange, className }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [listExpanded, setListExpanded] = useState(true)

  return (
    <aside className={cn(
      "border-r bg-sidebar p-4 flex flex-col gap-4 transition-all duration-300",
      collapsed ? "w-20" : "w-64",
      className
    )}>
      {/* 标题栏 + 折叠按钮 */}
      <div className={cn(
        "flex items-center px-3",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && <h1 className="text-xl font-bold text-primary">Flowy</h1>}
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
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => {
            if (viewMode === 'list') {
              setListExpanded(!listExpanded)
            } else {
              onViewModeChange('list')
              setListExpanded(true)
            }
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent/50",
            viewMode === 'list' ? "text-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <List className="h-[18px] w-[18px]" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{t('views.list')}</span>
              {viewMode === 'list' && (
                listExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => {
            onViewModeChange('calendar')
            setListExpanded(false)
          }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent/50",
            viewMode === 'calendar' ? "text-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
          {!collapsed && t('views.calendar')}
        </motion.button>
      </div>

      {/* GTD 列表分组 */}
      <AnimatePresence>
        {listExpanded && viewMode === 'list' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 overflow-hidden"
          >
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
                    "flex items-center gap-3 py-2 rounded-lg text-sm transition-colors",
                    "pl-8 pr-3",
                    "hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px]", meta.color)} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{t(`gtd.${meta.key}`)}</span>
                      {counts[key] > 0 && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium inline-flex items-center justify-center leading-none">
                          {counts[key]}
                        </span>
                      )}
                    </>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 桌面端操作 */}
      {isTauri() && (
        <div className="mt-auto flex flex-col gap-1">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={snappy}
            onClick={() => onSettingsOpenChange(true)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              "hover:bg-sidebar-accent/50 text-muted-foreground",
              collapsed && "justify-center"
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
            {!collapsed && t('common.settings')}
          </motion.button>
          <SettingsDialog
            open={settingsOpen}
            onOpenChange={onSettingsOpenChange}
            onExport={onExport}
            onImport={onImport}
          />
        </div>
      )}
    </aside>
  )
}
