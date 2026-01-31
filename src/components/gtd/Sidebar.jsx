/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LISTS/GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion，依赖 @/lib/platform 跨平台 API，依赖 react-i18next，依赖 @/components/gtd/settings/Settings，依赖 @/components/gtd/SidebarGroup
 * [OUTPUT]: 导出 Sidebar 组件
 * [POS]: GTD 侧边栏导航，分组式设计（固定导航区 + 可折叠分组区），响应式设计（桌面端侧边栏，移动端底部导航）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, CalendarDays, ChevronLeft, ChevronRight, Settings, Plus, Menu, PenLine, BookOpen, Focus } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { isMobile } from '@/lib/platform'
import { hapticsLight } from '@/lib/haptics'
import { Settings as SettingsDialog } from './settings'
import { ProjectList } from './ProjectList'
import { SidebarGroup } from './SidebarGroup'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

// ─────────────────────────────────────────────────────────────────────────────
// localStorage 持久化分组折叠状态
// ─────────────────────────────────────────────────────────────────────────────
const COLLAPSED_GROUPS_KEY = 'sidebar-collapsed-groups'

function loadCollapsedGroups() {
  try {
    const saved = localStorage.getItem(COLLAPSED_GROUPS_KEY)
    return saved ? new Set(JSON.parse(saved)) : new Set()
  } catch {
    return new Set()
  }
}

function saveCollapsedGroups(groups) {
  try {
    localStorage.setItem(COLLAPSED_GROUPS_KEY, JSON.stringify([...groups]))
  } catch {
    // ignore
  }
}

export function Sidebar({
  activeList,
  onSelect,
  counts,
  tasks = [],
  viewMode,
  onViewModeChange,
  journalView,
  onJournalViewChange,
  onExport,
  onImport,
  settingsOpen,
  onSettingsOpenChange,
  onDrawerOpen,
  onQuickCaptureOpen,
  sync,
  fileSystem,
  // 项目相关
  projects = [],
  activeProjectId,
  onSelectProject,
  onCreateProject,
  className
}) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState(() => loadCollapsedGroups())
  const mobile = isMobile()

  // 持久化分组折叠状态
  useEffect(() => {
    saveCollapsedGroups(collapsedGroups)
  }, [collapsedGroups])

  // 切换分组展开/折叠
  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) {
        next.delete(groupId)
      } else {
        next.add(groupId)
      }
      return next
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 移动端：底部导航栏（简化版：列表、FAB、日历）
  // ─────────────────────────────────────────────────────────────────────────────
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
            {viewMode === 'list' && !journalView && (
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
              "-mt-8"
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
            {viewMode === 'calendar' && !journalView && (
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

  // ─────────────────────────────────────────────────────────────────────────────
  // 桌面端：分组式侧边栏
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <aside
      className={cn(
        "border-r bg-sidebar p-4 flex flex-col gap-2 overflow-y-auto elegant-scroll",
        collapsed ? "w-20" : "w-64",
        className
      )}
      style={{
        transition: 'width 150ms ease-out',
        willChange: 'width'
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
       * 标题栏 + 折叠按钮
       * ───────────────────────────────────────────────────────────── */}
      <div className={cn(
        "flex items-center px-3 mb-2",
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

      {/* ─────────────────────────────────────────────────────────────
       * 固定导航区：专注、日程
       * ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        {/* 专注视图 */}
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => {
            if (journalView) {
              onJournalViewChange(null)
            }
            onViewModeChange('focus')
          }}
          title={collapsed ? t('focus.title') : undefined}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            "hover:bg-sidebar-accent/50",
            viewMode === 'focus' && !journalView ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <Focus className="h-[18px] w-[18px]" />
          {!collapsed && <span className="flex-1 text-left">{t('focus.title')}</span>}
        </motion.button>

        {/* 日程视图 */}
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
            viewMode === 'calendar' && !journalView ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-muted-foreground",
            collapsed && "justify-center"
          )}
        >
          <CalendarDays className="h-[18px] w-[18px]" />
          {!collapsed && <span className="flex-1 text-left">{t('views.calendar')}</span>}
        </motion.button>
      </div>

      {/* 分隔线 */}
      <div className="h-px bg-sidebar-primary/30 mx-2 my-1" />

      {/* ─────────────────────────────────────────────────────────────
       * 可折叠分组区：GTD 列表
       * ───────────────────────────────────────────────────────────── */}
      <SidebarGroup
        title="GTD"
        collapsed={collapsed}
        expanded={!collapsedGroups.has('gtd')}
        onToggle={() => toggleGroup('gtd')}
      >
        {Object.entries(GTD_LIST_META).map(([key, meta]) => {
          const Icon = ICONS[meta.icon]
          const isActive = viewMode === 'list' && activeList === key && !journalView
          return (
            <motion.button
              key={key}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={snappy}
              onClick={() => {
                if (journalView) {
                  onJournalViewChange(null)
                }
                onViewModeChange('list')
                onSelect(key)
              }}
              title={collapsed ? t(`gtd.${meta.key}`) : undefined}
              className={cn(
                "flex items-center gap-3 py-1.5 rounded-lg text-sm transition-colors",
                collapsed ? "px-3 justify-center" : "pl-6 pr-3",
                "hover:bg-sidebar-accent/50",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
            >
              <Icon className={cn(collapsed ? "h-5 w-5" : "h-[16px] w-[16px]", meta.color)} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{t(`gtd.${meta.key}`)}</span>
                  {counts[key] > 0 && (
                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                      {counts[key]}
                    </span>
                  )}
                </>
              )}
            </motion.button>
          )
        })}
      </SidebarGroup>

      {/* ─────────────────────────────────────────────────────────────
       * 可折叠分组区：项目
       * ───────────────────────────────────────────────────────────── */}
      <SidebarGroup
        title={t('views.board')}
        collapsed={collapsed}
        expanded={!collapsedGroups.has('projects')}
        onToggle={() => toggleGroup('projects')}
      >
        <div className={cn(collapsed ? "" : "pl-3")}>
          <ProjectList
            projects={projects}
            tasks={tasks}
            activeProjectId={viewMode === 'board' && !journalView ? activeProjectId : null}
            onSelect={(projectId) => {
              if (journalView) {
                onJournalViewChange(null)
              }
              onViewModeChange('board')
              onSelectProject(projectId)
            }}
            onCreateProject={() => {
              if (journalView) {
                onJournalViewChange(null)
              }
              onViewModeChange('board')
              onCreateProject()
            }}
            collapsed={collapsed}
          />
        </div>
      </SidebarGroup>

      {/* ─────────────────────────────────────────────────────────────
       * 可折叠分组区：日记
       * ───────────────────────────────────────────────────────────── */}
      <SidebarGroup
        title={t('journal.title')}
        collapsed={collapsed}
        expanded={!collapsedGroups.has('journal')}
        onToggle={() => toggleGroup('journal')}
      >
        {/* 此刻 */}
        <motion.button
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={snappy}
          onClick={() => onJournalViewChange('now')}
          title={collapsed ? t('journal.now') : undefined}
          className={cn(
            "flex items-center gap-3 py-1.5 rounded-lg text-sm transition-colors",
            collapsed ? "px-3 justify-center" : "pl-6 pr-3",
            "hover:bg-sidebar-accent/50",
            journalView === 'now' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}
        >
          <PenLine className={cn(collapsed ? "h-5 w-5" : "h-[16px] w-[16px]")} />
          {!collapsed && <span className="flex-1 text-left">{t('journal.now')}</span>}
        </motion.button>

        {/* 过往 */}
        <motion.button
          whileHover={{ y: -1, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={snappy}
          onClick={() => onJournalViewChange('past')}
          title={collapsed ? t('journal.past') : undefined}
          className={cn(
            "flex items-center gap-3 py-1.5 rounded-lg text-sm transition-colors",
            collapsed ? "px-3 justify-center" : "pl-6 pr-3",
            "hover:bg-sidebar-accent/50",
            journalView === 'past' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          )}
        >
          <BookOpen className={cn(collapsed ? "h-5 w-5" : "h-[16px] w-[16px]")} />
          {!collapsed && <span className="flex-1 text-left">{t('journal.past')}</span>}
        </motion.button>
      </SidebarGroup>

      {/* ─────────────────────────────────────────────────────────────
       * 设置按钮
       * ───────────────────────────────────────────────────────────── */}
      <div className="mt-auto flex flex-col gap-3 pt-2">
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
          fileSystem={fileSystem}
        />
      </div>
    </aside>
  )
}
