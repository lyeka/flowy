/**
 * [INPUT]: useJournal (stores/journal), JournalItem (components/gtd), NotesPanel (components/gtd), ScrollArea (components/ui), useTranslation (react-i18next)
 * [OUTPUT]: JournalPastView 组件
 * [POS]: "过往"视图，历史日记列表采用任务列表式排版 + 支持指定日期创建并沉浸式编辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useJournal } from '@/stores/journal'
import { JournalItem } from './JournalItem'
import { NotesPanel } from './NotesPanel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { BookOpen, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isMobile } from '@/lib/platform'

export function JournalPastView() {
  const { t } = useTranslation()
  const { pastJournals, updateJournal, getOrCreateJournalByDate } = useJournal()
  const [selectedJournal, setSelectedJournal] = useState(null)
  const [immersiveOpen, setImmersiveOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const mobile = isMobile()

  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal)
    setImmersiveOpen(false)
  }

  const handleClosePanel = () => {
    setSelectedJournal(null)
    setImmersiveOpen(false)
  }

  const handleCreateByDate = (date) => {
    if (!date) return
    const journal = getOrCreateJournalByDate(date)
    if (!journal) return
    setSelectedJournal(journal)
    setImmersiveOpen(true)
    setDatePickerOpen(false)
  }

  return (
    <div className="flex-1 flex h-full">
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
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {t('journal.journalCount', { count: pastJournals.length })}
              </div>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size={mobile ? "sm" : "default"}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t('journal.createByDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="p-3 w-auto">
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    {t('journal.selectDateToCreate')}
                  </div>
                  <CalendarComponent
                    mode="single"
                    onSelect={handleCreateByDate}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* 列表 */}
        <ScrollArea className="flex-1">
          <div className="p-6">
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
              <div className="flex flex-col gap-2">
                {pastJournals.map(journal => (
                  <JournalItem
                    key={journal.id}
                    journal={journal}
                    onClick={handleSelectJournal}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* 右侧：NotesPanel（如果有选中的日记） */}
      {selectedJournal && (
        <>
          <NotesPanel
            type="journal"
            data={selectedJournal}
            onUpdate={(id, updates) => {
              updateJournal(id, updates)
              // 更新本地状态
              setSelectedJournal(prev => ({ ...prev, ...updates }))
            }}
            onClose={handleClosePanel}
            mode="dock"
            onToggleImmersive={() => setImmersiveOpen(true)}
          />
          <AnimatePresence>
            {immersiveOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute inset-6 md:inset-12"
                >
                  <NotesPanel
                    type="journal"
                    data={selectedJournal}
                    onUpdate={(id, updates) => {
                      updateJournal(id, updates)
                      setSelectedJournal(prev => ({ ...prev, ...updates }))
                    }}
                    onClose={handleClosePanel}
                    mode="immersive"
                    onToggleImmersive={() => setImmersiveOpen(false)}
                    className="h-full w-full"
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
