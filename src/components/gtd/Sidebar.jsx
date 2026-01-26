/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LISTS/GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion，依赖 @/lib/platform 跨平台 API，依赖 react-i18next
 * [OUTPUT]: 导出 Sidebar 组件
 * [POS]: GTD 侧边栏导航，响应式设计（桌面端侧边栏，移动端底部导航），支持视图切换和列表导航，日记分组与标题同组展示
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LISTS, GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, CalendarDays, List, ChevronLeft, ChevronRight, ChevronDown, Settings, Plus, Menu, BookText, PenLine, BookOpen } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { isMobile } from '@/lib/platform'
import { hapticsLight } from '@/lib/haptics'
import { Settings as SettingsDialog } from './Settings'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function Sidebar({ activeList, onSelect, counts, viewMode, onViewModeChange, journalView, onJournalViewChange, onExport, onImport, settingsOpen, onSettingsOpenChange, onDrawerOpen, onQuickCaptureOpen, sync, fileSystem, className }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [journalExpanded, setJournalExpanded] = useState(true)
  const mobile = isMobile()

  // 移动端：底部导航栏（简化版：列表、FAB、日历）
  if (mobile) {
    return (
      <>
        <nav className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-sidebar border-t border-border",
          "flex items-center justify-between",
          "h-16 px-8 safe-area-inset-bottom",
          className
        )}>
          {/* 列表视图按钮 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              hapticsLight()
              if (journalView) {
                onJournalViewChange(null)
                onViewModeChange('list')
                return
              }
              if (viewMode !== 'list') {
                onViewModeChange('list')
                return
              }
              onDrawerOpen()
            }}
            className={cn(
              "relative flex items-center justify-center w-14 h-14 rounded-lg",
              "text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            <Menu className="h-6 w-6" />
            {viewMode === 'list' && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
          </motion.button>

          {/* FAB - 快速捕获 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              hapticsLight()
              onQuickCaptureOpen()
            }}
            className={cn(
              "relative flex items-center justify-center w-16 h-16 rounded-full",
              "bg-primary text-primary-foreground shadow-lg",
              "-mt-8" // 突出 16px (64px - 48px = 16px，但导航栏高度是 64px，所以用 -mt-8)
            )}
          >
            <Plus className="h-6 w-6" />
          </motion.button>

          {/* 日历视图按钮 */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              hapticsLight()
              if (journalView) {
                onJournalViewChange(null)
              }
              onViewModeChange('calendar')
            }}
            className={cn(
              "relative flex items-center justify-center w-14 h-14 rounded-lg",
              "text-muted-foreground hover:text-foreground transition-colors"
            )}
          >
            <CalendarDays className="h-6 w-6" />
            {viewMode === 'calendar' && (
              <motion.div
                layoutId="mobile-nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              />
            )}
          </motion.button>
        </nav>

        <SettingsDialog
          open={settingsOpen}
          onOpenChange={onSettingsOpenChange}
          onExport={onExport}
          onImport={onImport}
          sync={sync}
          fileSystem={fileSystem}
        />
      </>
    )
  }

  // 桌面端：侧边栏
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
            if (journalView) {
              onJournalViewChange(null)
            }
            onViewModeChange('list')
          }}
          title={collapsed ? t('views.list') : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent/50",
            viewMode === 'list' ? "text-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <List className="h-[18px] w-[18px]" />
          {!collapsed && <span className="flex-1 text-left">{t('views.list')}</span>}
        </motion.button>
        {/* 日记 - 一级标题 */}
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => {
            // 点击日记时，如果已经在日记视图，则切换展开状态；否则打开"此刻"
            if (journalView) {
              setJournalExpanded(!journalExpanded)
            } else {
              onJournalViewChange('now')
              setJournalExpanded(true)
            }
          }}
          title={collapsed ? t('journal.title') : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent/50",
            journalView ? "text-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <BookText className="h-[18px] w-[18px]" />
          {!collapsed && <span className="flex-1 text-left">{t('journal.title')}</span>}
        </motion.button>

        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => {
            if (journalView) {
              onJournalViewChange(null)
            }
            onViewModeChange('calendar')
          }}
          title={collapsed ? t('views.calendar') : undefined}
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
        {viewMode === 'list' && !journalView && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 overflow-hidden border-t border-sidebar-primary/60 pt-2"
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
                  title={collapsed ? t(`gtd.${meta.key}`) : undefined}
                  className={cn(
                    "flex items-center gap-3 py-2 rounded-lg text-sm transition-colors",
                    "px-3",
                    "hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                    collapsed && "justify-center"
                  )}
                >
                  <Icon className={cn(collapsed ? "h-5 w-5" : "h-[18px] w-[18px]", meta.color)} />
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

      {/* 日记子菜单分组 - 二级标题 */}
      <AnimatePresence>
        {journalView && journalExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-1 overflow-hidden border-t border-sidebar-primary/60 pt-2"
          >
            {/* 此刻 */}
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={snappy}
              onClick={() => onJournalViewChange('now')}
              title={collapsed ? t('journal.now') : undefined}
              className={cn(
                "flex items-center gap-3 py-2 rounded-lg text-sm transition-colors",
                "px-3",
                "hover:bg-sidebar-accent",
                journalView === 'now' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                collapsed && "justify-center"
              )}
            >
              <PenLine className={cn(collapsed ? "h-5 w-5" : "h-[18px] w-[18px]")} />
              {!collapsed && <span className="flex-1 text-left">{t('journal.now')}</span>}
            </motion.button>

            {/* 过往 */}
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={snappy}
              onClick={() => onJournalViewChange('past')}
              title={collapsed ? t('journal.past') : undefined}
              className={cn(
                "flex items-center gap-3 py-2 rounded-lg text-sm transition-colors",
                "px-3",
                "hover:bg-sidebar-accent",
                journalView === 'past' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
                collapsed && "justify-center"
              )}
            >
              <BookOpen className={cn(collapsed ? "h-5 w-5" : "h-[18px] w-[18px]")} />
              {!collapsed && <span className="flex-1 text-left">{t('journal.past')}</span>}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 设置按钮 */}
      <div className="mt-auto flex flex-col gap-1">
          <motion.button
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={snappy}
            onClick={() => onSettingsOpenChange(true)}
            title={collapsed ? t('common.settings') : undefined}
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
            sync={sync}
          />
        </div>
    </aside>
  )
}
