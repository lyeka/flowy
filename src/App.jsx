/**
 * [INPUT]: 依赖 @/stores/gtd, @/components/gtd/*, @/components/ui/sonner, @/lib/tauri, react-i18next
 * [OUTPUT]: 导出 App 根组件
 * [POS]: 应用入口，组装 GTD 布局，支持列表/日历视图切换，集成桌面端功能
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useGTD, GTD_LIST_META, GTD_LISTS } from '@/stores/gtd'
import { Sidebar } from '@/components/gtd/Sidebar'
import { QuickCapture } from '@/components/gtd/QuickCapture'
import { TaskList } from '@/components/gtd/TaskList'
import { CalendarView } from '@/components/gtd/CalendarView'
import { NotesPanel } from '@/components/gtd/NotesPanel'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatePresence, motion } from 'framer-motion'
import { exportData, importData, showNotification, isTauri } from '@/lib/tauri'
import { cn } from '@/lib/utils'

function App() {
  const { t } = useTranslation()
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
    deleteTask,
    loadTasks
  } = useGTD()

  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [notesPanelWidth, setNotesPanelWidth] = useState(() => Math.floor(window.innerWidth / 2)) // 笔记面板宽度，默认为页面一半
  const [isResizing, setIsResizing] = useState(false)
  const [immersivePhase, setImmersivePhase] = useState('dock')
  const [dockClosing, setDockClosing] = useState(false)
  const [dockRect, setDockRect] = useState(null)
  const dockPanelRef = useRef(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const selectedTask = tasks.find(t => t.id === selectedTaskId)
  const showNotesPanel = viewMode === 'list' && selectedTaskId && selectedTask
  const isImmersive = immersivePhase !== 'dock'
  const immersiveActive = immersivePhase === 'immersive'

  const handleAdd = (title) => {
    const targetList = activeList === GTD_LISTS.DONE ? GTD_LISTS.INBOX : activeList
    addTask(title, targetList)
    toast.success(t('toast.taskAdded'))
  }

  const handleAddWithDate = (title, date) => {
    const task = addTask(title)
    if (task && date) {
      updateTask(task.id, { dueDate: date.getTime() })
    }
    toast.success(t('toast.taskAddedWithDate'))
  }

  const handleDelete = (id) => {
    if (id === selectedTaskId) setSelectedTaskId(null)
    deleteTask(id)
    toast.success(t('toast.taskDeleted'))
  }

  // 导出数据
  const handleExport = async () => {
    try {
      const filePath = await exportData(tasks)
      if (filePath) {
        toast.success(t('toast.exportSuccess', { path: filePath }))
      }
    } catch (error) {
      toast.error(t('toast.exportFailed'))
    }
  }

  // 导入数据
  const handleImport = async () => {
    try {
      const data = await importData()
      if (data && Array.isArray(data)) {
        loadTasks(data)
        toast.success(t('toast.importSuccess'))
      }
    } catch (error) {
      toast.error(t('toast.importFailed'))
    }
  }

  // 任务完成时显示桌面通知
  const handleToggleComplete = (id) => {
    const task = tasks.find(t => t.id === id)
    toggleComplete(id)

    if (task && !task.completed && isTauri()) {
      showNotification(t('toast.taskCompleted', { title: '' }), t('toast.taskCompleted', { title: task.title }))
    }
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

  useEffect(() => {
    if (!selectedTaskId || viewMode !== 'list') {
      setImmersivePhase('dock')
    }
  }, [selectedTaskId, viewMode])

  useEffect(() => {
    if (!showNotesPanel && dockClosing) {
      setDockClosing(false)
    }
  }, [showNotesPanel, dockClosing])

  useLayoutEffect(() => {
    if (!showNotesPanel || immersivePhase !== 'dock' || !dockPanelRef.current) return
    const rect = dockPanelRef.current.getBoundingClientRect()
    setDockRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    })
  }, [showNotesPanel, immersivePhase, notesPanelWidth])

  useEffect(() => {
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      if (!showNotesPanel || immersivePhase !== 'dock' || !dockPanelRef.current) return
      const rect = dockPanelRef.current.getBoundingClientRect()
      setDockRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [showNotesPanel, immersivePhase])

  const meta = GTD_LIST_META[activeList]
  const handleCloseNotes = () => {
    if (immersivePhase === 'dock') {
      if (dockPanelRef.current) {
        const rect = dockPanelRef.current.getBoundingClientRect()
        setDockRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        })
      }
      setDockClosing(true)
      return
    }
    setImmersivePhase('closing')
  }
  const handleEnterImmersive = () => {
    if (dockPanelRef.current) {
      const rect = dockPanelRef.current.getBoundingClientRect()
      setDockRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      })
    }
    setImmersivePhase('immersive')
  }
  const handleExitImmersive = () => {
    if (dockPanelRef.current) {
      const rect = dockPanelRef.current.getBoundingClientRect()
      setDockRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      })
    }
    setImmersivePhase('exiting')
  }

  const immersiveRect = {
    width: Math.min(viewport.width * 0.9, 1100),
    height: Math.min(viewport.height * 0.85, 900)
  }
  immersiveRect.left = (viewport.width - immersiveRect.width) / 2
  immersiveRect.top = (viewport.height - immersiveRect.height) / 2
  const fromRect = dockRect || immersiveRect

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeList={activeList}
        onSelect={setActiveList}
        counts={counts}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onExport={handleExport}
        onImport={handleImport}
        settingsOpen={settingsOpen}
        onSettingsOpenChange={setSettingsOpen}
      />
      {viewMode === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          onUpdateTask={updateTask}
          onToggle={handleToggleComplete}
          onAddTask={handleAddWithDate}
        />
      ) : (
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-[350ms] ease-out",
            immersiveActive && showNotesPanel && "opacity-0 pointer-events-none"
          )}
          onClick={() => {
            if (immersivePhase === 'dock' && selectedTaskId) {
              setDockClosing(true)
            }
          }}
        >
          <header className="p-6 h-[88px] flex flex-col justify-center">
            <h2 className="text-2xl font-bold">{t(`gtd.${meta.key}`)}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t('tasks.taskCount', { count: counts[activeList] })}
            </p>
          </header>
          <div className="p-6">
            <QuickCapture onAdd={handleAdd} />
          </div>
          <ScrollArea className="flex-1 px-6 pb-6">
            <TaskList
              tasks={filteredTasks}
              activeList={activeList}
              onToggle={handleToggleComplete}
              onMove={moveTask}
              onDelete={handleDelete}
              onUpdateDate={(id, dueDate) => updateTask(id, { dueDate })}
              onTaskClick={setSelectedTaskId}
            />
          </ScrollArea>
        </main>
      )}
      <AnimatePresence mode="sync" initial={false}>
        {showNotesPanel && (
          <motion.div
            key="notes-dock"
            animate={{
              x: dockClosing ? '100%' : 0,
              opacity: immersivePhase === 'dock'
                ? (dockClosing ? 0 : 1)
                : immersivePhase === 'exiting'
                  ? 1
                  : 0
            }}
            transition={{
              x: { type: 'spring', damping: 32, stiffness: 220 },
              opacity: { duration: 0.25, ease: 'easeOut', delay: immersivePhase === 'exiting' ? 0.12 : 0 }
            }}
            onAnimationComplete={() => {
              if (dockClosing) {
                setSelectedTaskId(null)
                setDockClosing(false)
              }
            }}
            className={cn(
              "flex h-full",
              (immersivePhase !== 'dock' || dockClosing) && "pointer-events-none"
            )}
            style={dockClosing && dockRect ? {
              position: 'fixed',
              top: dockRect.top,
              left: dockRect.left,
              width: dockRect.width,
              height: dockRect.height,
              zIndex: 50
            } : undefined}
          >
            {/* 可拖动的分隔条 */}
            <div
              onMouseDown={handleMouseDown}
              className="w-px bg-border/40 hover:bg-primary/60 cursor-col-resize transition-colors relative group flex-shrink-0"
            >
              {/* 扩大点击区域 */}
              <div className="absolute inset-y-0 -left-2 -right-2" />
            </div>
            <div ref={dockPanelRef} className="h-full" style={{ width: `${notesPanelWidth}px`, flexShrink: 0 }}>
              <NotesPanel
                task={selectedTask}
                onUpdate={updateTask}
                onClose={handleCloseNotes}
                onToggleImmersive={handleEnterImmersive}
                motionPreset="dock"
                style={{ width: '100%', height: '100%', flexShrink: 0 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showNotesPanel && isImmersive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: immersivePhase === 'immersive' ? 1 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm"
        >
          <motion.div
            initial={fromRect}
            animate={immersivePhase === 'immersive'
              ? { ...immersiveRect, opacity: 1, scale: 1 }
              : immersivePhase === 'exiting'
                ? { ...fromRect, opacity: 1, scale: 1 }
                : { ...immersiveRect, opacity: 0, scale: 0.98 }}
            transition={immersivePhase === 'closing'
              ? { duration: 0.45, ease: 'easeOut' }
              : { type: 'spring', damping: 42, stiffness: 120, mass: 1.2 }}
            style={{ position: 'fixed', transformOrigin: 'right center' }}
            onAnimationComplete={() => {
              if (immersivePhase === 'exiting') {
                requestAnimationFrame(() => setImmersivePhase('dock'))
              }
              if (immersivePhase === 'closing') {
                setSelectedTaskId(null)
                requestAnimationFrame(() => setImmersivePhase('dock'))
              }
            }}
          >
            <NotesPanel
              task={selectedTask}
              onUpdate={updateTask}
              onClose={handleCloseNotes}
              immersive
              onToggleImmersive={handleExitImmersive}
              motionPreset="immersive"
              className="h-full w-full"
            />
          </motion.div>
        </motion.div>
      )}
      <Toaster position="bottom-right" />
    </div>
  )
}

export default App
