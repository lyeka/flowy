/**
 * [INPUT]: 依赖 @/stores/project，依赖 lucide-react 图标，依赖 @/components/ui/*，依赖 react-i18next
 * [OUTPUT]: 导出 ProjectSettings 组件
 * [POS]: 项目设置对话框，支持编辑标题/描述/颜色，管理自定义列
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { PROJECT_COLORS } from '@/stores/project'
import { GripVertical, Plus, Trash2, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function ProjectSettings({
  open,
  onOpenChange,
  project,
  onUpdateProject,
  onAddColumn,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns
}) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [newColumnTitle, setNewColumnTitle] = useState('')
  const [editingColumnId, setEditingColumnId] = useState(null)
  const [editingColumnTitle, setEditingColumnTitle] = useState('')

  // 同步项目数据
  useEffect(() => {
    if (project) {
      setTitle(project.title)
      setDescription(project.description || '')
      setColor(project.color)
    }
  }, [project])

  if (!project) return null

  const handleSave = () => {
    onUpdateProject(project.id, { title, description, color })
    onOpenChange(false)
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      onAddColumn(project.id, newColumnTitle.trim())
      setNewColumnTitle('')
    }
  }

  const handleColumnTitleSave = (columnId) => {
    if (editingColumnTitle.trim()) {
      onUpdateColumn(project.id, columnId, { title: editingColumnTitle.trim() })
    }
    setEditingColumnId(null)
    setEditingColumnTitle('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('project.settings')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 基本信息 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('project.title')}</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('project.titlePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('project.description')}</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('project.descriptionPlaceholder')}
                rows={3}
              />
            </div>

            {/* 颜色选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('project.color')}</label>
              <div className="flex gap-2 flex-wrap">
                {PROJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color === c && 'ring-2 ring-offset-2 ring-primary'
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 列管理 */}
          <div className="space-y-3">
            <label className="text-sm font-medium">{t('project.columns')}</label>
            <div className="space-y-2">
              {project.columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg group"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  {editingColumnId === column.id ? (
                    <Input
                      value={editingColumnTitle}
                      onChange={(e) => setEditingColumnTitle(e.target.value)}
                      onBlur={() => handleColumnTitleSave(column.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleColumnTitleSave(column.id)
                        if (e.key === 'Escape') {
                          setEditingColumnId(null)
                          setEditingColumnTitle('')
                        }
                      }}
                      autoFocus
                      className="h-8 flex-1"
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm cursor-pointer hover:text-primary"
                      onClick={() => {
                        setEditingColumnId(column.id)
                        setEditingColumnTitle(column.title)
                      }}
                    >
                      {column.title}
                    </span>
                  )}
                  <button
                    onClick={() => onDeleteColumn(project.id, column.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                    disabled={project.columns.length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              ))}

              {/* 添加新列 */}
              <div className="flex items-center gap-2">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddColumn()
                  }}
                  placeholder={t('project.newColumnPlaceholder')}
                  className="h-8 flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddColumn}
                  disabled={!newColumnTitle.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
