/**
 * [INPUT]: 依赖 @/stores/gtd, @/stores/journal, @/components/gtd/*, @/components/ui/sonner, @/lib/platform, react-i18next
 * [OUTPUT]: 导出 App 根组件
 * [POS]: 应用入口，组装 GTD 布局，支持列表/日历/日记视图切换，集成跨平台功能（桌面端+移动端），管理抽屉和快速捕获状态
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard } from '@capacitor/keyboard'
import { StatusBar, Style } from '@capacitor/status-bar'
import { useGTD, GTD_LIST_META, GTD_LISTS } from '@/stores/gtd'
import { useJournal } from '@/stores/journal'
import { Sidebar } from '@/components/gtd/Sidebar'
import { Drawer } from '@/components/gtd/Drawer'
import { QuickCapture } from '@/components/gtd/QuickCapture'
import { TaskList } from '@/components/gtd/TaskList'
import { CalendarView } from '@/components/gtd/CalendarView'
import { NotesPanel } from '@/components/gtd/NotesPanel'
import { JournalNowView } from '@/components/gtd/JournalNowView'
import { JournalPastView } from '@/components/gtd/JournalPastView'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AnimatePresence, motion } from 'framer-motion'
import { exportData, importData, showNotification, isMobile } from '@/lib/platform'
import { hapticsSuccess, hapticsWarning, hapticsLight } from '@/lib/haptics'
import { cn } from '@/lib/utils'

function App() {
  const { t } = useTranslation()
  const mobile = isMobile()
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

  const { journalsByDate } = useJournal()

  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [journalView, setJournalView] = useState(null) // 'now' | 'past' | null
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false) // 移动端抽屉状态
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false) // 移动端快速捕获模态框状态
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
    hapticsLight()
    toast.success(t('toast.taskAdded'))
    // 移动端：添加任务后关闭快速捕获模态框
    if (mobile && quickCaptureOpen) {
      setQuickCaptureOpen(false)
    }
  }

  const handleAddWithDate = (title, date) => {
    const task = addTask(title)
    if (task && date) {
      updateTask(task.id, { dueDate: date.getTime() })
    }
    hapticsLight()
    toast.success(t('toast.taskAddedWithDate'))
  }

  const handleDelete = (id) => {
    if (id === selectedTaskId) setSelectedTaskId(null)
    deleteTask(id)
    hapticsWarning()
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

  // 任务完成时显示通知和触觉反馈
  const handleToggleComplete = (id) => {
    const task = tasks.find(t => t.id === id)
    toggleComplete(id)

    if (task && !task.completed) {
      hapticsSuccess()
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

  // 移动端键盘处理
  useEffect(() => {
    if (!mobile) return

    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (info) => {
      // 键盘即将显示，可以调整布局
      console.log('Keyboard will show:', info.keyboardHeight)
    })

    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      // 键盘即将隐藏
      console.log('Keyboard will hide')
    })

    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [mobile])

  // 移动端状态栏配置
  useEffect(() => {
    if (!mobile) return

    const setupStatusBar = async () => {
      try {
        // 设置状态栏样式（深色文字，适配浅色背景）
        await StatusBar.setStyle({ style: Style.Light })

        // 设置状态栏背景色（与应用背景一致）
        await StatusBar.setBackgroundColor({ color: '#ffffff' })

        // 显示状态栏
        await StatusBar.show()
      } catch (error) {
        console.warn('StatusBar not available:', error)
      }
    }

    setupStatusBar()
  }, [mobile])

  const meta = GTD_LIST_META[activeList]

  // 日记视图切换处理
  const handleJournalViewChange = (view) => {
    setJournalView(view)
    // 切换到日记视图时，清除任务选择
    if (view) {
      setSelectedTaskId(null)
    }
  }

  // 日记点击处理（从日历视图）
  const handleJournalClick = (journal) => {
    setJournalView('past')
    // TODO: 在 JournalPastView 中打开对应的日记
  }

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
    <div className={cn(
      "flex bg-background",
      mobile ? "flex-col h-screen" : "flex-row h-screen"
    )}>
      {!mobile && (
        <Sidebar
          activeList={activeList}
          onSelect={setActiveList}
          counts={counts}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          journalView={journalView}
          onJournalViewChange={handleJournalViewChange}
          onExport={handleExport}
          onImport={handleImport}
          settingsOpen={settingsOpen}
          onSettingsOpenChange={setSettingsOpen}
        />
      )}
      {/* 视图渲染优先级：journalView > viewMode */}
      {journalView === 'now' ? (
        <JournalNowView onClose={() => setJournalView(null)} />
      ) : journalView === 'past' ? (
        <JournalPastView />
      ) : viewMode === 'calendar' ? (
        <CalendarView
          tasks={tasks}
          journalsByDate={journalsByDate}
          onUpdateTask={updateTask}
          onToggle={handleToggleComplete}
          onAddTask={handleAddWithDate}
          onJournalClick={handleJournalClick}
        />
      ) : (
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-[350ms] ease-out",
            mobile && "pb-16", // 移动端底部导航栏高度
            immersiveActive && showNotesPanel && "opacity-0 pointer-events-none"
          )}
          onClick={() => {
            if (immersivePhase === 'dock' && selectedTaskId) {
              setDockClosing(true)
            }
          }}
        >
          <header className={cn(
            "flex flex-col justify-center",
            mobile ? "p-3 h-14" : "p-6 h-[88px]"
          )}>
            <h2 className={cn(
              "font-bold",
              mobile ? "text-lg" : "text-2xl"
            )}>{t(`gtd.${meta.key}`)}</h2>
            <p className={cn(
              "text-muted-foreground mt-1",
              mobile ? "text-[13px]" : "text-sm"
            )}>
              {t('tasks.taskCount', { count: counts[activeList] })}
            </p>
          </header>
          <div className={cn(mobile ? "px-3 pb-2" : "p-6")}>
            <QuickCapture onAdd={handleAdd} />
          </div>
          <ScrollArea className={cn(
            "flex-1",
            mobile ? "px-3 pb-3" : "px-6 pb-6"
          )}>
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
            style={(dockClosing || immersivePhase === 'closing') && dockRect ? {
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

      {/* 移动端底部导航 */}
      {mobile && (
        <>
          <Sidebar
            activeList={activeList}
            onSelect={setActiveList}
            counts={counts}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            journalView={journalView}
            onJournalViewChange={handleJournalViewChange}
            onExport={handleExport}
            onImport={handleImport}
            settingsOpen={settingsOpen}
            onSettingsOpenChange={setSettingsOpen}
            onDrawerOpen={() => setDrawerOpen(true)}
            onQuickCaptureOpen={() => setQuickCaptureOpen(true)}
          />

          {/* 移动端抽屉 */}
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            activeList={activeList}
            onSelect={setActiveList}
            counts={counts}
            journalView={journalView}
            onJournalViewChange={handleJournalViewChange}
            onSettingsOpen={() => setSettingsOpen(true)}
          />

          {/* 移动端快速捕获模态框 */}
          <AnimatePresence>
            {quickCaptureOpen && (
              <>
                {/* 背景遮罩 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setQuickCaptureOpen(false)}
                  className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
                />

                {/* 输入框 */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                  className="fixed left-0 right-0 bottom-0 z-50 bg-background border-t border-border rounded-t-2xl p-6 pb-8 safe-area-inset-bottom"
                >
                  <QuickCapture onAdd={handleAdd} autoFocus />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      <Toaster position={mobile ? "top-center" : "bottom-right"} />
    </div>
  )
}

export default App
