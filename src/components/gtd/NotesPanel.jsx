/**
 * [INPUT]: 依赖 framer-motion, lucide-react, @/lib/motion, react hooks
 * [OUTPUT]: 导出 NotesPanel 组件
 * [POS]: 任务副文本编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，信件风格
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gentle } from '@/lib/motion'
import { useEffect, useRef, useState } from 'react'

const formatDate = (timestamp) => {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${weekday}`
}

export function NotesPanel({ task, onUpdate, onClose, style }) {
  const textareaRef = useRef(null)
  const [lineCount, setLineCount] = useState(0)

  const handleNotesChange = (e) => {
    onUpdate(task.id, { notes: e.target.value })
  }

  useEffect(() => {
    if (textareaRef.current) {
      const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight)
      const height = textareaRef.current.scrollHeight
      const lines = Math.ceil(height / lineHeight)
      setLineCount(lines)
    }
  }, [task.notes])

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

  const dateStr = formatDate(task.dueDate)

  return (
    <motion.aside
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%', width: 0 }}
      transition={gentle}
      className="border-l bg-card flex flex-col relative overflow-hidden"
      style={style}
    >
      {/* 关闭按钮 - 右上角，降低对比度 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 h-8 w-8 z-10 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* 内容区域 - 增加留白 */}
      <div className="flex-1 overflow-y-auto px-16 py-16 flex flex-col">
        {/* 标题 - 增大字号，添加底部边框效果，微妙缩放动画 */}
        <motion.input
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          className="font-semibold text-3xl bg-transparent border-0 border-b border-transparent hover:border-border/50 focus:border-primary outline-none w-full transition-colors"
          placeholder="任务标题"
          spellCheck={false}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        />

        {/* 日期 - 增加间距 */}
        {dateStr && (
          <div className="text-sm text-muted-foreground mt-4">
            {dateStr}
          </div>
        )}

        {/* 正文区域 - 增加间距 */}
        <div className="flex-1 relative mt-12">
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
            value={task.notes || ''}
            onChange={handleNotesChange}
            placeholder="在这里记录你的思考、计划和灵感..."
            className="relative w-full h-full resize-none bg-transparent border-0 outline-none text-base leading-[1.8] placeholder:text-muted-foreground/50 dark:placeholder:text-muted-foreground/40"
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
          {task.notes?.length || 0} 字
          {task.notes?.length > 0 && ` · 约 ${Math.ceil(task.notes.length / 300)} 分钟`}
        </motion.div>
      </div>
    </motion.aside>
  )
}
