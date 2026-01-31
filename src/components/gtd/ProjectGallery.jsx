/**
 * [INPUT]: 依赖 @/components/ui/circular-progress，依赖 lucide-react 图标，依赖 framer-motion，依赖 react-i18next
 * [OUTPUT]: 导出 ProjectGallery 组件
 * [POS]: 项目画廊组件，呼吸感卡片网格布局（h-40 垂直居中），系统主题色进度环 + 标题 + 纯文字统计，响应式 1/2/3 列，支持右键菜单操作
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Plus, FolderOpen, MoreHorizontal, Settings, Archive, Trash2 } from 'lucide-react'
import { snappy, staggerContainer, staggerItem } from '@/lib/motion'
import { CircularProgress } from '@/components/ui/circular-progress'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu'

// ============================================
// 项目卡片 - 呼吸感设计 + 右键菜单
// ============================================

function ProjectCard({ project, stats, onClick, onSettings, onArchive, onDelete }) {
  const { t } = useTranslation()
  const { total, completed, overdue, progress } = stats
  const isComplete = progress === 100 && total > 0

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <motion.button
          variants={staggerItem}
          whileTap={{ scale: 0.98 }}
          transition={snappy}
          onClick={onClick}
          className={cn(
            'flex flex-col items-center justify-center',
            'h-40 p-6 rounded-xl text-center',
            'bg-card hover:bg-accent',
            'transition-colors w-full relative group'
          )}
        >
          {/* 进度圆环 - 32px，使用系统主题色 */}
          <CircularProgress
            value={progress}
            size={32}
            strokeWidth={3}
            className="mb-3"
          />

          {/* 项目标题 */}
          <h3 className="font-medium truncate w-full mb-1">
            {project.title}
          </h3>

          {/* 统计信息 - 纯文字，淡色 */}
          <div className="text-sm text-muted-foreground">
            {isComplete ? (
              `${completed}/${total} completed`
            ) : total === 0 ? (
              'No tasks'
            ) : (
              <>
                {total} task{total !== 1 ? 's' : ''}
                {overdue > 0 && (
                  <span className="text-destructive"> · {overdue} overdue</span>
                )}
              </>
            )}
          </div>

          {/* Hover 时显示的操作提示 */}
          <div className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
          </div>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onSettings(project.id)}>
          <Settings className="h-4 w-4 mr-2" />
          {t('project.settings')}
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onArchive(project.id)}>
          <Archive className="h-4 w-4 mr-2" />
          {t('project.archive')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDelete(project.id)}
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {t('common.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ============================================
// 新建项目卡片 - 呼吸感设计
// ============================================

function CreateProjectCard({ onClick }) {
  const { t } = useTranslation()
  return (
    <motion.button
      variants={staggerItem}
      whileTap={{ scale: 0.98 }}
      transition={snappy}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center',
        'h-40 p-6 rounded-xl',
        'border-2 border-dashed border-muted-foreground/25',
        'hover:border-muted-foreground/40 hover:bg-accent/30',
        'text-muted-foreground hover:text-foreground',
        'transition-colors'
      )}
    >
      <Plus className="h-8 w-8 mb-2 opacity-50" />
      <span className="text-sm font-medium">{t('project.gallery.newProject')}</span>
    </motion.button>
  )
}

// ============================================
// 空状态 - 无项目时
// ============================================

function EmptyState({ onCreate }) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] text-center"
    >
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <FolderOpen className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold mb-2">{t('project.gallery.emptyTitle')}</h2>
      <p className="text-muted-foreground mb-6 max-w-xs">
        {t('project.gallery.emptyDesc')}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreate}
        className={cn(
          'px-6 py-3 rounded-xl font-medium',
          'bg-primary text-primary-foreground',
          'hover:primary/90'
        )}
      >
        + {t('project.gallery.createButton')}
      </motion.button>
    </motion.div>
  )
}

// ============================================
// 创建项目输入框 - 呼吸感设计
// ============================================

function CreateProjectInput({ onCancel, onConfirm }) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && title.trim()) {
      onConfirm(title.trim())
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={snappy}
      className={cn(
        'flex flex-col items-center justify-center',
        'h-40 p-6 rounded-xl',
        'border-2 border-primary/50 bg-accent/50'
      )}
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!title.trim()) onCancel()
        }}
        placeholder={t('project.newPlaceholder')}
        autoFocus
        className={cn(
          'w-full bg-transparent text-center font-medium',
          'placeholder:text-muted-foreground outline-none',
          'border-b-2 border-primary/50 focus:border-primary',
          'pb-2 mb-2'
        )}
      />
      <p className="text-xs text-muted-foreground">
        按 Enter 确认，Esc 取消
      </p>
    </motion.div>
  )
}

// ============================================
// 项目画廊主组件
// ============================================

export function ProjectGallery({
  projects,
  tasks = [],
  onSelect,
  onCreateProject,
  onDeleteProject,
  onArchiveProject,
  onOpenSettings,
  className
}) {
  const { t } = useTranslation()
  const [isCreating, setIsCreating] = useState(false)

  // 计算项目统计数据
  const getProjectStats = useCallback((projectId) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId)
    const total = projectTasks.length
    const completed = projectTasks.filter(t => t.completed).length

    // 逾期任务：有截止日期、未完成、已过期
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const overdue = projectTasks.filter(t =>
      t.dueDate && !t.completed && new Date(t.dueDate) < today
    ).length

    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, overdue, progress }
  }, [tasks])

  // 处理创建项目
  const handleCreate = (title) => {
    onCreateProject(title)
    setIsCreating(false)
  }

  // 空状态
  if (projects.length === 0 && !isCreating) {
    return (
      <div className={cn('flex-1 p-6 overflow-auto', className)}>
        <EmptyState onCreate={() => setIsCreating(true)} />
      </div>
    )
  }

  return (
    <div className={cn('flex-1 p-6 overflow-auto', className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{t('project.title')}</h2>
        {!isCreating && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreating(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl',
              'bg-primary text-primary-foreground',
              'text-sm font-medium'
            )}
          >
            <Plus className="h-4 w-4" />
            <span>{t('project.gallery.newProject')}</span>
          </motion.button>
        )}
      </div>

      {/* 网格布局 - 响应式 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={cn(
          'grid gap-4',
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        )}
      >
        <AnimatePresence mode="popLayout">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              stats={getProjectStats(project.id)}
              onClick={() => onSelect(project.id)}
              onSettings={onOpenSettings}
              onArchive={onArchiveProject}
              onDelete={onDeleteProject}
            />
          ))}
          {isCreating ? (
            <CreateProjectInput
              key="create-input"
              onCancel={() => setIsCreating(false)}
              onConfirm={handleCreate}
            />
          ) : (
            <CreateProjectCard key="create-card" onClick={() => setIsCreating(true)} />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
