/**
 * [INPUT]: 依赖 @/stores/gtd, @/components/gtd/*, @/components/ui/sonner
 * [OUTPUT]: 导出 App 根组件
 * [POS]: 应用入口，组装 GTD 布局，支持列表/日历视图切换
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback } from 'react'
import { useGTD, GTD_LIST_META, GTD_LISTS } from '@/stores/gtd'
import { Sidebar } from '@/components/gtd/Sidebar'
import { QuickCapture } from '@/components/gtd/QuickCapture'
import { TaskList } from '@/components/gtd/TaskList'
import { CalendarView } from '@/components/gtd/CalendarView'
import { NotesPanel } from '@/components/gtd/NotesPanel'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatePresence } from 'framer-motion'

function App() {
  const {
    tasks,
    filteredTasks,
    activeList,
    setActiveList,
    counts,
    addTask,
    updateTask,
    toggleComplete,
    moveTask,
    deleteTask
  } = useGTD()

  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [notesPanelWidth, setNotesPanelWidth] = useState(() => Math.floor(window.innerWidth / 2)) // 笔记面板宽度，默认为页面一半
  const [isResizing, setIsResizing] = useState(false)
  const selectedTask = tasks.find(t => t.id === selectedTaskId)

  const handleAdd = (title) => {
    addTask(title)
    toast.success('任务已添加到收集箱')
  }

  const handleAddWithDate = (title, date) => {
    const task = addTask(title)
    if (task && date) {
      updateTask(task.id, { dueDate: date.getTime() })
    }
    toast.success('任务已添加')
  }

  const handleDelete = (id) => {
    if (id === selectedTaskId) setSelectedTaskId(null)
    deleteTask(id)
    toast.success('任务已删除')
  }

  // 处理面板大小调整
  const handleMouseDown = (e) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = useCallback((e) => {
    const newWidth = window.innerWidth - e.clientX
    if (newWidth >= 400 && newWidth <= 1000) {
      setNotesPanelWidth(newWidth)
    }
  }, [])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // 监听全局鼠标事件
  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const meta = GTD_LIST_META[activeList]

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeList={activeList}
        onSelect={setActiveList}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {viewMode === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          onUpdateTask={updateTask}
          onToggle={toggleComplete}
          onAddTask={handleAddWithDate}
        />
      ) : (
        <main className="flex-1 flex flex-col transition-all duration-[350ms] ease-out">
          <header className="p-6 h-[88px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold">{meta.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {counts[activeList]} 个任务
            </p>
          </header>
          <div className="p-6">
            <QuickCapture onAdd={handleAdd} />
          </div>
          <ScrollArea className="flex-1 px-6 pb-6">
            <TaskList
              tasks={filteredTasks}
              activeList={activeList}
              onToggle={toggleComplete}
              onMove={moveTask}
              onDelete={handleDelete}
              onUpdateDate={(id, dueDate) => updateTask(id, { dueDate })}
              onTaskClick={setSelectedTaskId}
            />
          </ScrollArea>
        </main>
      )}
      <AnimatePresence>
        {viewMode === 'list' && selectedTaskId && selectedTask && (
          <>
            {/* 可拖动的分隔条 */}
            <div
              onMouseDown={handleMouseDown}
              className="w-px bg-border/40 hover:bg-primary/60 cursor-col-resize transition-colors relative group flex-shrink-0"
            >
              {/* 扩大点击区域 */}
              <div className="absolute inset-y-0 -left-2 -right-2" />
            </div>
            <NotesPanel
              task={selectedTask}
              onUpdate={updateTask}
              onClose={() => setSelectedTaskId(null)}
              style={{ width: `${notesPanelWidth}px`, flexShrink: 0 }}
            />
          </>
        )}
      </AnimatePresence>
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
