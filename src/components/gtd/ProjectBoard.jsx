/**
 * [INPUT]: 依赖 @dnd-kit/core，依赖 @dnd-kit/sortable，依赖 ./ProjectColumn，依赖 @/stores/project，依赖 @/stores/gtd，依赖 lucide-react
 * [OUTPUT]: 导出 ProjectBoard 组件
 * [POS]: 项目看板主容器，整合列组件和拖拽功能，管理任务在列之间的流转
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { ChevronLeft, Settings, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ProjectColumn } from './ProjectColumn'
import { ProjectTaskCard } from './ProjectTaskCard'
import { snappy } from '@/lib/motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export function ProjectBoard({
  project,
  tasks,
  onUpdateTask,
  onAddTask,
  onDeleteTask,
  onDeleteProject,
  onBack,
  onOpenSettings,
  onTaskClick
}) {
  const [activeId, setActiveId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // 按列分组任务
  const tasksByColumn = useMemo(() => {
    const grouped = {}
    project.columns.forEach(col => {
      grouped[col.id] = tasks.filter(t => t.columnId === col.id)
    })
    return grouped
  }, [project.columns, tasks])

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // 查找活动任务
  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  // 处理拖拽开始
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  // 处理拖拽结束
  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const overId = over.id
    const overColumn = project.columns.find(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)

    // 拖拽到列：改变列 ID
    if (overColumn) {
      if (activeTask.columnId !== overColumn.id) {
        onUpdateTask(activeTask.id, { columnId: overColumn.id })
      }
      return
    }

    // 拖拽到任务：在同一列内排序或跨列移动
    if (overTask) {
      const activeColumnId = activeTask.columnId
      const overColumnId = overTask.columnId

      if (activeColumnId === overColumnId) {
        // 同列内排序
        const columnTasks = tasksByColumn[activeColumnId]
        const oldIndex = columnTasks.findIndex(t => t.id === active.id)
        const newIndex = columnTasks.findIndex(t => t.id === over.id)

        if (oldIndex !== newIndex) {
          // 重新排序所有任务的 order 字段
          const newTasks = arrayMove(columnTasks, oldIndex, newIndex)
          newTasks.forEach((task, index) => {
            if (task.order !== index) {
              onUpdateTask(task.id, { order: index })
            }
          })
        }
      } else {
        // 跨列移动
        onUpdateTask(activeTask.id, { columnId: overColumnId })
      }
    }
  }

  // 添加任务到列
  const handleAddTask = (columnId, title) => {
    onAddTask(title, project.id, columnId)
  }

  // 获取列的拖拽状态
  const isColumnOver = (columnId) => {
    return activeId && tasks.find(t => t.id === activeId)?.columnId !== columnId
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 头部 */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </Button>
          <h2 className="font-bold">{project.title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenSettings(project.id)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive"
              >
                删除项目
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* 看板区域 */}
      <div className="flex-1 min-h-0 p-6 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full min-w-max px-1">
            {project.columns.map((column) => (
              <ProjectColumn
                key={column.id}
                column={column}
                tasks={tasksByColumn[column.id] || []}
                onToggleComplete={(id) => onUpdateTask(id, { completed: !tasks.find(t => t.id === id)?.completed })}
                onToggleStar={(id) => onUpdateTask(id, { starred: !tasks.find(t => t.id === id)?.starred })}
                onUpdateDate={(id, dueDate) => onUpdateTask(id, { dueDate })}
                onUpdateTitle={(id, title) => onUpdateTask(id, { title })}
                onDeleteTask={onDeleteTask}
                onTaskClick={onTaskClick}
                onAddTask={handleAddTask}
                isOver={isColumnOver(column.id)}
              />
            ))}
          </div>

          {/* 拖拽预览 */}
          <DragOverlay>
            {activeTask ? (
              <ProjectTaskCard
                task={activeTask}
                onToggleComplete={() => {}}
                onToggleStar={() => {}}
                onClick={() => {}}
                isDragging
                className="rotate-3 shadow-xl"
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除项目</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除项目「{project.title}」吗？此操作不可撤销，项目中的任务将保留但不再关联此项目。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteProject(project.id)
                setDeleteDialogOpen(false)
              }}
              className="bg-destructive text-destructive-foreground"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
