/**
 * [INPUT]: 依赖 @/components/ui/input, @/stores/gtd, framer-motion
 * [OUTPUT]: 导出 QuickCapture 组件
 * [POS]: GTD 快速收集输入框，位于页面顶部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { snappy } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function QuickCapture({ onAdd }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (value.trim()) {
      onAdd(value)
      setValue('')
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="relative"
      initial={{ scale: 0.98 }}
      whileHover={{ scale: 1 }}
      transition={snappy}
    >
      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="快速添加任务到收集箱..."
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "pl-10 h-12"
        )}
      />
    </motion.form>
  )
}
