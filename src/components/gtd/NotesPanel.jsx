/**
 * [INPUT]: 依赖 framer-motion, lucide-react, @/lib/motion, @/lib/platform, react hooks, react-i18next
 * [OUTPUT]: 导出 NotesPanel 组件
 * [POS]: 任务/日记编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，信件风格，移动端全屏模式，支持 type='task'|'journal' 双模式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gentle } from '@/lib/motion'
import { isMobile } from '@/lib/platform'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function NotesPanel({
  // 新接口：支持 task 和 journal 双模式
  type = 'task',  // 'task' | 'journal'
  data,           // task 或 journal 对象
  task,           // 向后兼容：如果传入 task，则自动识别为 type='task'

  onUpdate,
  onClose,
  style,
  immersive = false,
  mode = 'dock',  // 新增：'dock' | 'immersive'，替代 immersive boolean
  onToggleImmersive,
  className,
  motionPreset
}) {
  const { t, i18n } = useTranslation()
  const mobile = isMobile()
  const textareaRef = useRef(null)
  const [lineCount, setLineCount] = useState(0)

  // 向后兼容：如果传入 task，则使用 task
  const actualType = task ? 'task' : type
  const actualData = task || data

  // 根据 type 提取字段
  const title = actualData?.title || ''
  const content = actualType === 'journal' ? (actualData?.content || '') : (actualData?.notes || '')
  const dateTimestamp = actualType === 'journal' ? actualData?.date : actualData?.dueDate

  // 根据 mode 决定是否沉浸式
  const isImmersive = mode === 'immersive' || immersive

  const formatDate = (timestamp) => {
    if (!timestamp) return ''
    const d = new Date(timestamp)
    const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    const weekday = t(`calendar.weekdays.${weekdays[d.getDay()]}`)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${weekday}`
  }

  const handleNotesChange = (e) => {
    const field = actualType === 'journal' ? 'content' : 'notes'
    onUpdate(actualData.id, { [field]: e.target.value })
  }

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const container = textarea.parentElement
      const minHeight = container ? container.clientHeight : 0
      textarea.style.height = 'auto'
      const nextHeight = Math.max(textarea.scrollHeight, minHeight)
      textarea.style.height = `${nextHeight}px`
      const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight)
      const lines = Math.ceil(nextHeight / lineHeight)
      setLineCount(lines)
    }
  }, [content, isImmersive])

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
  const notesText = content
  const isZh = i18n.language?.startsWith('zh')
  const wordCount = (notesText.match(/\b[\p{L}\p{N}']+\b/gu) || []).length
  const charCount = notesText.length
  const count = isZh ? charCount : wordCount
  const minutes = count > 0 ? Math.ceil(count / (isZh ? 300 : 200)) : 0

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

        {/* 正文区域 - 移动端减小间距 */}
        <div className={cn(
          "flex-1 relative",
          mobile ? "mt-8" : "mt-12"
        )}>
          {/* 横线层 - 降低透明度，淡入动画 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: lineCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                className="border-b border-border/30 dark:border-border/20"
                style={{ height: '1.8em' }}
              />
            ))}
          </div>

          {/* 文本输入 - 优化 placeholder */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleNotesChange}
            placeholder={actualType === 'journal' ? t('journal.preview') : t('tasks.notesPlaceholder')}
            className="relative w-full resize-none overflow-hidden bg-transparent border-0 outline-none text-base leading-[1.8] placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40"
            spellCheck={false}
          />
        </div>

        {/* 字数统计 - 右下角，淡入动画 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="absolute bottom-6 right-6 text-xs text-muted-foreground/60"
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
