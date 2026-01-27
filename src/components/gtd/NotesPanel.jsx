/**
 * [INPUT]: 依赖 framer-motion, lucide-react, @/lib/motion, @/lib/platform, @/lib/editor/*, react hooks, react-i18next, AIPromptCard, MarkdownToolbar, useAI
 * [OUTPUT]: 导出 NotesPanel 组件
 * [POS]: 任务/日记编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，信件风格，移动端全屏模式，支持 type='task'|'journal' 双模式，字数统计支持中英混排，集成 AI 问题卡片
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Maximize2, Minimize2, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gentle } from '@/lib/motion'
import { isMobile } from '@/lib/platform'
import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { AIPromptCard } from './AIPromptCard'
import { useAI } from '@/stores/ai'
import { createMarkdownEditor, insertTextAtSelection } from '@/lib/editor/codemirror'

const cjkPattern = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu

const computeStats = (text, isZh) => {
  const safeText = text || ''
  const cjkCount = (safeText.match(cjkPattern) || []).length
  const nonCjkText = safeText.replace(cjkPattern, ' ')
  const wordCount = (nonCjkText.match(/\b[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)?\b/gu) || []).length
  const count = cjkCount + wordCount
  const minutes = count > 0 ? Math.ceil(count / (isZh ? 300 : 200)) : 0
  return { count, minutes }
}

export function NotesPanel({
  // 新接口：支持 task 和 journal 双模式
  type = 'task',  // 'task' | 'journal'
  data,           // task 或 journal 对象
  task,           // 向后兼容：如果传入 task，则自动识别为 type='task'

  onUpdate,
  onClose,
  onDelete,       // 新增：删除回调（可选）
  deleteMode = 'delete',  // 'delete' | 'reset' - 删除模式
  style,
  immersive = false,
  mode = 'dock',  // 新增：'dock' | 'immersive'，替代 immersive boolean
  onToggleImmersive,
  className,
  motionPreset
}) {
  // 向后兼容：如果传入 task，则使用 task
  const actualType = task ? 'task' : type
  const actualData = task || data

  // 根据 type 提取字段
  const title = actualData?.title || ''
  const content = actualType === 'journal' ? (actualData?.content || '') : (actualData?.notes || '')
  const dateTimestamp = actualType === 'journal' ? actualData?.date : actualData?.dueDate
  const aiPrompts = actualType === 'journal' ? (actualData?.aiPrompts || []) : []

  const { t, i18n } = useTranslation()
  const mobile = isMobile()
  const editorContainerRef = useRef(null)
  const editorViewRef = useRef(null)
  const editorApiRef = useRef(null)
  const editorChangeRef = useRef(null)
  const isZh = i18n.language?.startsWith('zh')
  const [stats, setStats] = useState(() => computeStats(content, isZh))
  const saveTimerRef = useRef(null)
  const statsTimerRef = useRef(null)
  const latestValueRef = useRef(content)
  const lastSavedRef = useRef(content)
  const isFocusedRef = useRef(false)
  const onUpdateRef = useRef(onUpdate)
  const dataIdRef = useRef(actualData?.id)
  const typeRef = useRef(actualType)
  const { config, generating } = useAI()

  // 根据 mode 决定是否沉浸式
  const isImmersive = mode === 'immersive' || immersive

  // AI 问题处理
  const handlePromptSelect = (prompt) => {
    // 插入问题到光标位置
    const view = editorViewRef.current
    if (!view) return
    insertTextAtSelection(view, `${prompt.text}\n\n`)

    // 标记为已插入
    const updatedPrompts = aiPrompts.map(p =>
      p.id === prompt.id ? { ...p, inserted: true } : p
    )
    onUpdate(actualData.id, { aiPrompts: updatedPrompts })
  }

  const handlePromptDismiss = (promptId) => {
    const updatedPrompts = aiPrompts.map(p =>
      p.id === promptId ? { ...p, dismissed: true } : p
    )
    onUpdate(actualData.id, { aiPrompts: updatedPrompts })
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const weekday = t(`calendar.weekdays.${weekdays[d.getDay()]}`)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${weekday}`
  }

  const placeholderText = actualType === 'journal' ? t('journal.preview') : t('tasks.notesPlaceholder')

  const flushSave = useCallback(() => {
    const id = dataIdRef.current
    if (!id) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    const nextValue = latestValueRef.current
    if (nextValue === lastSavedRef.current) return
    const field = typeRef.current === 'journal' ? 'content' : 'notes'
    startTransition(() => {
      if (onUpdateRef.current) {
        onUpdateRef.current(id, { [field]: nextValue })
      }
    })
    lastSavedRef.current = nextValue
  }, [])

  const scheduleSave = useCallback((nextValue) => {
    latestValueRef.current = nextValue
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }
    saveTimerRef.current = setTimeout(() => {
      flushSave()
    }, 1000)
  }, [flushSave])

  const scheduleStats = useCallback((nextValue) => {
    if (statsTimerRef.current) {
      clearTimeout(statsTimerRef.current)
    }
    statsTimerRef.current = setTimeout(() => {
      setStats(computeStats(nextValue, isZh))
    }, 200)
  }, [isZh])

  useEffect(() => {
    return () => {
      if (statsTimerRef.current) {
        clearTimeout(statsTimerRef.current)
        statsTimerRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    editorChangeRef.current = (nextValue) => {
      latestValueRef.current = nextValue
      scheduleSave(nextValue)
      scheduleStats(nextValue)
    }
  }, [scheduleSave, scheduleStats])

  // ============================================================
  // 数据同步：笔记切换时重置，内容更新时同步（用户未聚焦时）
  // ============================================================
  useEffect(() => {
    // 笔记切换时重置焦点标记
    if (dataIdRef.current !== actualData?.id) {
      isFocusedRef.current = false
    }

    // 更新 refs
    dataIdRef.current = actualData?.id
    typeRef.current = actualType
    onUpdateRef.current = onUpdate

    // 同步数据到编辑器（如果用户未聚焦）
    if (!isFocusedRef.current) {
      latestValueRef.current = content
      lastSavedRef.current = content
      setStats(computeStats(content, isZh))
      if (editorApiRef.current) {
        editorApiRef.current.setValue(content)
      }
    }
  }, [actualData?.id, content, actualType, onUpdate, isZh])

  useEffect(() => {
    return () => {
      flushSave()
    }
  }, [flushSave])

  useEffect(() => {
    if (!editorContainerRef.current || editorApiRef.current) return
    const api = createMarkdownEditor({
      parent: editorContainerRef.current,
      value: content,
      onChangeRef: editorChangeRef,
      placeholderText
    })
    editorApiRef.current = api
    editorViewRef.current = api.view
    const handleFocus = () => {
      isFocusedRef.current = true
    }
    const handleBlur = () => {
      isFocusedRef.current = false
      flushSave()
    }
    api.view.dom.addEventListener('focus', handleFocus, true)
    api.view.dom.addEventListener('blur', handleBlur, true)
    return () => {
      api.view.dom.removeEventListener('focus', handleFocus, true)
      api.view.dom.removeEventListener('blur', handleBlur, true)
      api.destroy()
      editorApiRef.current = null
      editorViewRef.current = null
    }
  }, [flushSave, placeholderText])

  useEffect(() => {
    if (!editorApiRef.current) return
    editorApiRef.current.setPlaceholder(placeholderText)
  }, [placeholderText])

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const dateStr = formatDate(dateTimestamp)
  const count = stats.count
  const minutes = stats.minutes

  const actualMotionPreset = motionPreset || (isImmersive ? 'immersive' : 'dock')
  const motionConfig = actualMotionPreset === 'immersive'
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: 'easeOut' }
      }
    : {
        initial: { opacity: 0, x: '100%' },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: '100%', width: 0 },
        transition: gentle
      }

  return (
    <motion.aside
      initial={motionConfig.initial}
      animate={motionConfig.animate}
      exit={motionConfig.exit}
      transition={motionConfig.transition}
      className={cn(
        "bg-card flex flex-col relative overflow-hidden notes-panel",
        isImmersive ? "rounded-2xl border border-border/60 shadow-2xl" : "border-l",
        className
      )}
      style={style}
    >
      {/* 关闭按钮 - 右上角，降低对比度 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className={cn(
          "absolute z-10 text-muted-foreground/40 hover:text-muted-foreground transition-colors",
          mobile ? "top-3 right-3 h-9 w-9" : "top-6 right-6 h-8 w-8"
        )}
      >
        <X className="h-4 w-4" />
      </Button>
      {onToggleImmersive && !mobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleImmersive}
          title={isImmersive ? t('tasks.exitImmersive') : t('tasks.enterImmersive')}
          aria-label={isImmersive ? t('tasks.exitImmersive') : t('tasks.enterImmersive')}
          className="absolute top-6 right-16 h-8 w-8 z-10 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          {isImmersive ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      )}
      {/* 删除/重置按钮 - 如果提供了 onDelete 回调则显示 */}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(actualData)}
          title={deleteMode === 'reset' ? t('journal.reset') : t('tasks.delete')}
          aria-label={deleteMode === 'reset' ? t('journal.reset') : t('tasks.delete')}
          className={cn(
            "absolute z-10 text-muted-foreground/40 transition-colors",
            deleteMode === 'reset' ? "hover:text-primary" : "hover:text-destructive",
            mobile ? "top-3 left-3 h-9 w-9" : (onToggleImmersive ? "top-6 right-26 h-8 w-8" : "top-6 right-16 h-8 w-8")
          )}
        >
          {deleteMode === 'reset' ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* 内容区域 - 移动端减少留白 */}
      <div className={cn(
        "notes-scroll flex-1 min-h-0 overflow-y-auto flex flex-col",
        mobile ? "px-6 py-8" : "px-16 py-16"
      )}>
        {/* 标题 - 移动端减小字号 */}
        <motion.input
          value={title}
          onChange={(e) => onUpdate(actualData.id, { title: e.target.value })}
          className={cn(
            "font-semibold bg-transparent border-0 border-b border-transparent hover:border-border/50 focus:border-primary outline-none w-full transition-colors",
            mobile ? "text-2xl" : "text-3xl"
          )}
          placeholder={actualType === 'journal' ? t('journal.defaultTitle') : t('tasks.notes')}
          spellCheck={false}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />

        {/* 日期 - 移动端减小间距 */}
        {dateStr && (
          <div className={cn(
            "text-sm text-muted-foreground",
            mobile ? "mt-3" : "mt-4"
          )}>
            {dateStr}
          </div>
        )}

        {/* AI 问题卡片 - 仅在日记模式下显示（包括加载状态） */}
        {actualType === 'journal' && (config.enabled && config.apiKey) && (aiPrompts.length > 0 || generating) && (
          <div className={cn(mobile ? "mt-4" : "mt-6")}>
            <AIPromptCard
              prompts={aiPrompts}
              onSelect={handlePromptSelect}
              onDismiss={handlePromptDismiss}
            />
          </div>
        )}

        {/* 正文区域 - 移动端减小间距 */}
        <div
          className={cn(
            "flex-1 relative notes-lines",
            mobile ? "mt-8" : "mt-12"
          )}
        >
          {/* Markdown 编辑器 - Typora 风格，直接输入语法 */}
          <div ref={editorContainerRef} className="relative z-10" />
        </div>

        {/* 字数统计 - 右下角，淡入动画 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute bottom-6 right-16 text-xs text-muted-foreground/60"
        >
          {isZh
            ? t('tasks.charCount', { count })
            : t('tasks.wordCount', { count })}
          {count > 0 && ` ${t('tasks.readingTime', { minutes })}`}
        </motion.div>
      </div>
    </motion.aside>
  )
}
