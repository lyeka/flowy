/**
 * [INPUT]: 依赖 @/components/ui/input, @/stores/gtd
 * [OUTPUT]: 导出 QuickCapture 组件
 * [POS]: GTD 快速收集输入框，位于页面顶部
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'

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
    <form onSubmit={handleSubmit} className="relative">
      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="快速添加任务到收集箱..."
        className="pl-10 h-12 text-base"
      />
    </form>
  )
}
