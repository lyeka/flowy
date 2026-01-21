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
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export function NotesPanel({ task, onUpdate, onClose }) {
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

  const dateStr = formatDate(task.dueDate)

  return (
    <motion.aside
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={gentle}
      className="flex-1 border-l bg-card flex flex-col relative"
    >
      {/* 关闭按钮 - 右上角 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 h-8 w-8 z-10"
      >
        <X className="h-4 w-4" />
      </Button>

      {/* 内容区域 - 统一左对齐 */}
      <div className="flex-1 overflow-y-auto px-10 py-12 flex flex-col">
        {/* 标题 */}
        <input
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          className="font-semibold text-2xl bg-transparent border-0 outline-none w-full"
          placeholder="任务标题"
          spellCheck={false}
        />

        {/* 日期 */}
        {dateStr && (
          <div className="text-sm text-muted-foreground mt-2">
            {dateStr}
          </div>
        )}

        {/* 正文区域 - 相对定位容器 */}
        <div className="flex-1 relative mt-8">
          {/* 横线层 - 绝对定位在 textarea 下方 */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div
                key={i}
                className="border-b border-border/40"
                style={{ height: '1.8em' }}
              />
            ))}
          </div>

          {/* 文本输入 */}
          <textarea
            ref={textareaRef}
            value={task.notes || ''}
            onChange={handleNotesChange}
            placeholder="写下你的想法..."
            className="relative w-full h-full resize-none bg-transparent border-0 outline-none text-base leading-[1.8] placeholder:text-muted-foreground/50"
            spellCheck={false}
          />
        </div>
      </div>
    </motion.aside>
  )
}
