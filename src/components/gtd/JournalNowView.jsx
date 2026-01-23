/**
 * [INPUT]: useJournal (stores/journal), NotesPanel (components/gtd)
 * [OUTPUT]: JournalNowView 组件
 * [POS]: "此刻"视图，自动打开今日日记编辑，全屏 NotesPanel（占满主视图）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from 'react'
import { useJournal } from '@/stores/journal'
import { NotesPanel } from './NotesPanel'

export function JournalNowView({ onClose }) {
  const { getTodayJournal, updateJournal } = useJournal()
  const [todayJournal, setTodayJournal] = useState(null)

  useEffect(() => {
    // 获取或创建今日日记
    const journal = getTodayJournal()
    setTodayJournal(journal)
  }, [getTodayJournal])

  if (!todayJournal) {
    return null
  }

  return (
    <div
      className="flex-1 h-full"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div className="h-full" onClick={(e) => e.stopPropagation()}>
        <NotesPanel
          type="journal"
          data={todayJournal}
          onUpdate={(id, updates) => {
            updateJournal(id, updates)
            // 更新本地状态以反映变化
            setTodayJournal(prev => ({ ...prev, ...updates }))
          }}
          onClose={onClose}
          mode="immersive"
          className="h-full w-full rounded-none border-0 shadow-none bg-background"
        />
      </div>
    </div>
  )
}
