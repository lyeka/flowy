/**
 * [INPUT]: useJournal (stores/journal), JournalItem (components/gtd), NotesPanel (components/gtd), ScrollArea (components/ui), useTranslation (react-i18next)
 * [OUTPUT]: JournalPastView 组件
 * [POS]: "过往"视图，历史日记列表 + 侧边 NotesPanel 编辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useJournal } from '@/stores/journal'
import { JournalItem } from './JournalItem'
import { NotesPanel } from './NotesPanel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'

export function JournalPastView() {
  const { t } = useTranslation()
  const { pastJournals, updateJournal } = useJournal()
  const [selectedJournal, setSelectedJournal] = useState(null)

  return (
    <div className="flex h-full">
      {/* 左侧：日记列表 */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {t('journal.past')} · {t('journal.title')}
              </h2>
            </div>
            <div className="text-sm text-muted-foreground">
              {t('journal.journalCount', { count: pastJournals.length })}
            </div>
          </div>
        </div>

        {/* 列表 */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-3">
            {pastJournals.length === 0 ? (
              // 空状态
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <div className="text-muted-foreground">
                  {t('journal.emptyPast')}
                </div>
                <div className="text-sm text-muted-foreground/60 mt-1">
                  {t('journal.emptyPastDesc')}
                </div>
              </div>
            ) : (
              // 日记列表
              pastJournals.map(journal => (
                <JournalItem
                  key={journal.id}
                  journal={journal}
                  onClick={setSelectedJournal}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧：NotesPanel（如果有选中的日记） */}
      {selectedJournal && (
        <NotesPanel
          type="journal"
          data={selectedJournal}
          onUpdate={(id, updates) => {
            updateJournal(id, updates)
            // 更新本地状态
            setSelectedJournal(prev => ({ ...prev, ...updates }))
          }}
          onClose={() => setSelectedJournal(null)}
          mode="dock"
        />
      )}
    </div>
  )
}
