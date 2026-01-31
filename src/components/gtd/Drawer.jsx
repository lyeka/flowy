/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion，依赖 @/lib/haptics，依赖 react-i18next，依赖 @/components/gtd/SidebarGroup
 * [OUTPUT]: 导出 Drawer 组件
 * [POS]: 移动端左侧滑抽屉，分组式设计（GTD 列表 + 项目 + 日记），与桌面端 Sidebar 保持一致
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LIST_META } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, Settings, X, PenLine, BookOpen, Focus, CalendarDays, Plus, FolderKanban } from 'lucide-react'
import { hapticsLight } from '@/lib/haptics'
import { SidebarGroup } from './SidebarGroup'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

// ─────────────────────────────────────────────────────────────────────────────
// localStorage 持久化分组折叠状态（与 Sidebar 共享）
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

export function Drawer({
  open,
  onOpenChange,
  activeList,
  onSelect,
  counts,
  viewMode,
  onViewModeChange,
  journalView,
  onJournalViewChange,
  onSettingsOpen,
  // 项目相关
  projects = [],
  tasks = [],
  activeProjectId,
  onSelectProject,
  onCreateProject
}) {
  const { t } = useTranslation()
  const [collapsedGroups, setCollapsedGroups] = useState(() => loadCollapsedGroups())

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

  // 计算项目进度
  const getProjectProgress = (projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    if (projectTasks.length === 0) return 0
    const completed = projectTasks.filter(t => t.list === 'done').length
    return Math.round((completed / projectTasks.length) * 100)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              hapticsLight()
              onOpenChange(false)
            }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />

          {/* 抽屉内容 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-sidebar border-r border-border flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-primary">Flowy</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  hapticsLight()
                  onOpenChange(false)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-y-auto p-2">
              {/* ─────────────────────────────────────────────────────────────
               * 固定导航区：专注、日程
               * ───────────────────────────────────────────────────────────── */}
              <div className="space-y-1 mb-2">
                {/* 专注视图 */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    if (journalView) {
                      onJournalViewChange(null)
                    }
                    onViewModeChange('focus')
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    "hover:bg-sidebar-accent",
                    viewMode === 'focus' && !journalView && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <Focus className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('focus.title')}</span>
                </motion.button>

                {/* 日程视图 */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    if (journalView) {
                      onJournalViewChange(null)
                    }
                    onViewModeChange('calendar')
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    "hover:bg-sidebar-accent",
                    viewMode === 'calendar' && !journalView && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <CalendarDays className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('views.calendar')}</span>
                </motion.button>
              </div>

              {/* 分隔线 */}
              <div className="h-px bg-border/50 mx-2 my-2" />

              {/* ─────────────────────────────────────────────────────────────
               * 可折叠分组区：GTD 列表
               * ───────────────────────────────────────────────────────────── */}
              <SidebarGroup
                title="GTD"
                collapsed={false}
                expanded={!collapsedGroups.has('gtd')}
                onToggle={() => toggleGroup('gtd')}
              >
                {Object.entries(GTD_LIST_META).map(([key, meta]) => {
                  const Icon = ICONS[meta.icon]
                  const isActive = viewMode === 'list' && activeList === key && !journalView
                  const count = counts[key] || 0

                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        hapticsLight()
                        if (journalView) {
                          onJournalViewChange(null)
                        }
                        onViewModeChange('list')
                        onSelect(key)
                        onOpenChange(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 pl-6 pr-4 py-3 rounded-lg text-sm transition-colors",
                        "hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", meta.color)} />
                      <span className="flex-1 text-left">{t(`gtd.${meta.key}`)}</span>
                      {count > 0 && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium">
                          {count}
                        </span>
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
                collapsed={false}
                expanded={!collapsedGroups.has('projects')}
                onToggle={() => toggleGroup('projects')}
              >
                {projects.map(project => {
                  const isActive = viewMode === 'board' && activeProjectId === project.id && !journalView
                  const progress = getProjectProgress(project.id)

                  return (
                    <motion.button
                      key={project.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        hapticsLight()
                        if (journalView) {
                          onJournalViewChange(null)
                        }
                        onViewModeChange('board')
                        onSelectProject(project.id)
                        onOpenChange(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 pl-6 pr-4 py-3 rounded-lg text-sm transition-colors",
                        "hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <FolderKanban className="h-5 w-5" />
                      <span className="flex-1 text-left truncate">{project.title}</span>
                      {progress > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {progress}%
                        </span>
                      )}
                    </motion.button>
                  )
                })}

                {/* 新建项目 */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    if (journalView) {
                      onJournalViewChange(null)
                    }
                    onViewModeChange('board')
                    onCreateProject()
                    onOpenChange(false)
                  }}
                  className="w-full flex items-center gap-3 pl-6 pr-4 py-3 rounded-lg text-sm transition-colors hover:bg-sidebar-accent text-muted-foreground"
                >
                  <Plus className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('project.create')}</span>
                </motion.button>
              </SidebarGroup>

              {/* ─────────────────────────────────────────────────────────────
               * 可折叠分组区：日记
               * ───────────────────────────────────────────────────────────── */}
              <SidebarGroup
                title={t('journal.title')}
                collapsed={false}
                expanded={!collapsedGroups.has('journal')}
                onToggle={() => toggleGroup('journal')}
              >
                {/* 此刻 */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    onJournalViewChange('now')
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 pl-6 pr-4 py-3 rounded-lg text-sm transition-colors",
                    "hover:bg-sidebar-accent",
                    journalView === 'now' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <PenLine className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('journal.now')}</span>
                </motion.button>

                {/* 过往 */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    onJournalViewChange('past')
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 pl-6 pr-4 py-3 rounded-lg text-sm transition-colors",
                    "hover:bg-sidebar-accent",
                    journalView === 'past' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="flex-1 text-left">{t('journal.past')}</span>
                </motion.button>
              </SidebarGroup>
            </div>

            {/* 底部设置 */}
            <div className="p-2 border-t border-border">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticsLight()
                  onSettingsOpen()
                  onOpenChange(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors hover:bg-sidebar-accent text-muted-foreground"
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1 text-left">{t('common.settings')}</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
