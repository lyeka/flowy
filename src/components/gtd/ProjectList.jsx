/**
 * [INPUT]: 依赖 @/stores/project，依赖 lucide-react 图标，依赖 framer-motion，依赖 react-i18next
 * [OUTPUT]: 导出 ProjectList 组件
 * [POS]: 项目列表组件，显示所有项目卡片，支持创建新项目
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, FolderKanban, MoreHorizontal, Trash2, Archive, Settings } from 'lucide-react'
import { snappy } from '@/lib/motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function ProjectList({
  projects,
  activeProjectId,
  onSelect,
  onCreateProject,
  onDeleteProject,
  onArchiveProject,
  onOpenSettings,
  collapsed = false,
  className
}) {
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreateProject(newTitle.trim())
      setNewTitle('')
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreate()
    } else if (e.key === 'Escape') {
      setNewTitle('')
      setIsCreating(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* 项目列表 */}
      <AnimatePresence mode="popLayout">
        {projects.map((project) => {
          const isActive = activeProjectId === project.id
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={snappy}
              className="group relative"
            >
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={snappy}
                onClick={() => onSelect(project.id)}
                title={collapsed ? project.title : undefined}
                className={cn(
                  'flex items-center gap-3 py-2 rounded-lg text-sm transition-colors w-full',
                  'px-3',
                  'hover:bg-sidebar-accent',
                  isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
                  collapsed && 'justify-center'
                )}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{project.title}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar-accent rounded transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onOpenSettings(project.id)}>
                          <Settings className="h-4 w-4 mr-2" />
                          {t('project.settings')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onArchiveProject(project.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          {t('project.archive')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteProject(project.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </motion.button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      {/* 创建新项目 */}
      {isCreating ? (
        <div className="px-3 py-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTitle.trim()) {
                setIsCreating(false)
              }
            }}
            placeholder={t('project.newPlaceholder')}
            autoFocus
            className={cn(
              'w-full bg-transparent border-b border-primary/50 outline-none',
              'text-sm py-1 placeholder:text-muted-foreground'
            )}
          />
        </div>
      ) : (
        <motion.button
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          transition={snappy}
          onClick={() => setIsCreating(true)}
          title={collapsed ? t('project.new') : undefined}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
            'hover:bg-sidebar-accent/50 text-muted-foreground',
            collapsed && 'justify-center'
          )}
        >
          <Plus className="h-[18px] w-[18px]" />
          {!collapsed && <span>{t('project.new')}</span>}
        </motion.button>
      )}
    </div>
  )
}
