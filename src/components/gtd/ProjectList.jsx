/**
 * [INPUT]: 依赖 @/stores/project，依赖 lucide-react 图标，依赖 framer-motion，依赖 react-i18next，依赖 @/components/ui/circular-progress
 * [OUTPUT]: 导出 ProjectList 组件
 * [POS]: 项目列表组件，侧边栏导航，仅支持点击切换视图，操作功能移至主区域卡片
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { CircularProgress } from '@/components/ui/circular-progress'

export function ProjectList({
  projects,
  tasks = [],
  activeProjectId,
  onSelect,
  onCreateProject,
  collapsed = false,
  className
}) {
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  // 计算项目进度
  const getProjectProgress = useCallback((projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    const total = projectTasks.length
    const completed = projectTasks.filter(t => t.completed).length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }, [tasks])

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
      {/* 项目列表 - 仅导航 */}
      <AnimatePresence mode="popLayout">
        {projects.map((project) => {
          const isActive = activeProjectId === project.id
          return (
            <motion.button
              key={project.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={snappy}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.96 }}
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
              <CircularProgress
                value={getProjectProgress(project.id)}
                size={16}
                strokeWidth={2}
              />
              {!collapsed && (
                <span className="flex-1 text-left truncate">{project.title}</span>
              )}
            </motion.button>
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
          whileHover={{ x: 2 }}
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
