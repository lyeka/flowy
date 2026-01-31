/**
 * [INPUT]: 依赖 @dnd-kit/core，依赖 @dnd-kit/sortable，依赖 @dnd-kit/utilities，依赖 ./ProjectTaskCard
 * [OUTPUT]: 导出 SortableTask 组件
 * [POS]: 可拖拽排序的任务卡片包装器，集成 dnd-kit
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProjectTaskCard } from './ProjectTaskCard'

export function SortableTask({ task, onToggleComplete, onToggleStar, onUpdateDate, onUpdateTitle, onDelete, onTaskClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id,
    data: { type: 'task', task }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <ProjectTaskCard
        task={task}
        onToggleComplete={onToggleComplete}
        onToggleStar={onToggleStar}
        onUpdateDate={onUpdateDate}
        onUpdateTitle={onUpdateTitle}
        onDelete={onDelete}
        onClick={onTaskClick}
        isDragging={isDragging}
      />
    </div>
  )
}
