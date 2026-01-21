/**
 * [INPUT]: 依赖 framer-motion, lucide-react, @/lib/motion
 * [OUTPUT]: 导出 NotesPanel 组件
 * [POS]: 任务副文本编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { gentle } from '@/lib/motion'

export function NotesPanel({ task, onUpdate, onClose }) {
  const handleNotesChange = (e) => {
    onUpdate(task.id, { notes: e.target.value })
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={gentle}
      className="flex-1 border-l bg-card flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-6 h-[88px]">
        <input
          value={task.title}
          onChange={(e) => onUpdate(task.id, { title: e.target.value })}
          className="font-semibold text-lg bg-transparent border-0 outline-none flex-1 mr-4"
          placeholder="任务标题..."
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </header>

      {/* 文本编辑区 */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          value={task.notes || ''}
          onChange={handleNotesChange}
          placeholder="写下你的想法..."
          className="w-full h-full resize-none bg-transparent border-0 outline-none font-serif text-base leading-[1.8] px-10 py-12 placeholder:text-muted-foreground/50"
        />
      </div>
    </motion.aside>
  )
}
