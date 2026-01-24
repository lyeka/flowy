/**
 * [INPUT]: useJournal (stores/journal), JournalItem (components/gtd), NotesPanel (components/gtd), ScrollArea (components/ui), useTranslation (react-i18next)
 * [OUTPUT]: JournalPastView 组件
 * [POS]: "过往"视图，历史日记支持列表与弧线画布两种模式，支持指定日期创建并沉浸式编辑
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useJournal } from '@/stores/journal'
import { JournalItem } from './JournalItem'
import { NotesPanel } from './NotesPanel'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTranslation } from 'react-i18next'
import { BookOpen, CalendarDays, Plus, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isMobile } from '@/lib/platform'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function JournalPastView() {
  const { t, i18n } = useTranslation()
  const { pastJournals, updateJournal, getOrCreateJournalByDate, deleteJournal } = useJournal()
  const [selectedJournal, setSelectedJournal] = useState(null)
  const [immersiveOpen, setImmersiveOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const mobile = isMobile()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [layoutMode, setLayoutMode] = useState('list') // 'list' | 'canvas'

  const handleSelectJournal = (journal) => {
    setSelectedJournal(journal)
    setImmersiveOpen(false)
  }

  const handleClosePanel = () => {
    setSelectedJournal(null)
    setImmersiveOpen(false)
  }

  const handleDeleteJournal = (id) => {
    if (selectedJournal?.id === id) {
      handleClosePanel()
    }
    deleteJournal(id)
  }

  const handleRequestDelete = (journal) => {
    setDeleteTarget(journal)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    handleDeleteJournal(deleteTarget.id)
    setDeleteTarget(null)
  }

  useEffect(() => {
    if (layoutMode === 'canvas') {
      handleClosePanel()
    }
  }, [layoutMode])

  const isZh = i18n.language?.startsWith('zh')
  const formatCanvasDate = (timestamp) => {
    if (!timestamp) return ''
    const locale = isZh ? zhCN : undefined
    return isZh
      ? format(timestamp, 'yyyy年M月d日 · EEEE', { locale })
      : format(timestamp, 'MMM d, yyyy · EEE', { locale })
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
    <div className="flex-1 flex h-full min-h-0">
      {/* 左侧：日记列表 */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {t('journal.past')}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">
                {t('journal.journalCount', { count: pastJournals.length })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLayoutMode(prev => (prev === 'canvas' ? 'list' : 'canvas'))}
                title={layoutMode === 'canvas' ? t('journal.listMode') : t('journal.canvasMode')}
                aria-label={layoutMode === 'canvas' ? t('journal.listMode') : t('journal.canvasMode')}
                aria-pressed={layoutMode === 'canvas'}
                className={cn(
                  mobile ? 'h-8 w-8' : 'h-8 w-8',
                  layoutMode === 'canvas' ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <Waves className="h-4 w-4" />
              </Button>
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
        <ScrollArea className="flex-1 min-h-0">
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
            ) : layoutMode === 'canvas' ? (
              <div className="flex flex-col gap-12">
                {pastJournals.map(journal => (
                  <section key={journal.id} className="group">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatCanvasDate(journal.date)}</span>
                    </div>
                    <div className="mt-3 text-xl font-semibold text-foreground">
                      {(journal.title || '').trim() || t('journal.defaultTitle')}
                    </div>
                    {journal.content && (
                      <div className="mt-4 whitespace-pre-wrap text-base leading-[1.9] text-foreground/90">
                        {journal.content}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            ) : (
              // 日记列表
              <div className="flex flex-col gap-2">
                {pastJournals.map(journal => (
                  <JournalItem
                    key={journal.id}
                    journal={journal}
                    onClick={handleSelectJournal}
                    onRequestDelete={handleRequestDelete}
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

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {t('journal.deleteConfirmPrefix')}
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md text-sm">
                {(deleteTarget?.title || '').trim() || t('journal.defaultTitle')}
              </span>
              {t('journal.deleteConfirmSuffix')}
            </DialogTitle>
            <DialogDescription>{t('journal.deleteConfirmDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t('common.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
