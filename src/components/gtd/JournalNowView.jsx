/**
 * [INPUT]: useJournal (stores/journal), useAI (stores/ai), useGTD (stores/gtd), NotesPanel (components/gtd)
 * [OUTPUT]: JournalNowView 组件
 * [POS]: "此刻"视图，自动打开今日日记编辑，全屏 NotesPanel（占满主视图），支持 AI 问题自动生成
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useState } from 'react'
import { useJournal } from '@/stores/journal'
import { useAI } from '@/stores/ai'
import { useGTD } from '@/stores/gtd'
import { NotesPanel } from './NotesPanel'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function JournalNowView({ onClose }) {
  const { t } = useTranslation()
  const { getTodayJournal, updateJournal, journals, deleteJournal } = useJournal()
  const { config, generatePrompts, generateTitle } = useAI()
  const { tasks } = useGTD()
  const [todayJournal, setTodayJournal] = useState(null)
  const [streamingPrompts, setStreamingPrompts] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    // 获取或创建今日日记
    const journal = getTodayJournal()
    setTodayJournal(journal)

    // 检查是否需要自动生成 AI 问题
    const shouldGeneratePrompts =
      config.enabled &&
      config.autoGenerate &&
      config.apiKey &&
      !journal.content &&
      !journal.aiPrompts

    // 检查是否需要自动生成标题
    const shouldGenerateTitle =
      config.enabled &&
      config.autoGenerateTitle &&
      config.apiKey &&
      !journal.content &&
      /^\d{4}\.\d{2}\.\d{2}$/.test(journal.title) // 检查是否是默认标题格式（yyyy.MM.dd）

    if (shouldGeneratePrompts || shouldGenerateTitle) {
      // 延迟 500ms 避免闪烁
      setTimeout(async () => {
        // 获取最近的日记（用于历史上下文）
        const recentJournals = journals
          .filter(j => j.id !== journal.id)
          .sort((a, b) => b.date - a.date)
          .slice(0, 3)

        // 并行生成问题和标题
        const [prompts, title] = await Promise.all([
          shouldGeneratePrompts
            ? generatePrompts(
                journal,
                tasks,
                recentJournals,
                (partialPrompts) => {
                  // 流式更新：逐步显示问题
                  setStreamingPrompts(partialPrompts)
                }
              )
            : Promise.resolve([]),
          shouldGenerateTitle
            ? generateTitle(journal, tasks, recentJournals)
            : Promise.resolve(null)
        ])

        // 更新日记
        const updates = {}

        if (prompts.length > 0) {
          updates.aiPrompts = prompts
          updates.aiContext = {
            tasksTotal: tasks.length,
            tasksCompleted: tasks.filter(t => t.completed).length,
            generatedAt: Date.now(),
            provider: config.provider,
            model: config.model
          }
        }

        if (title) {
          updates.title = title
        }

        if (Object.keys(updates).length > 0) {
          updateJournal(journal.id, updates)

          // 更新本地状态
          setTodayJournal(prev => ({
            ...prev,
            ...updates
          }))

          // 清空流式状态
          setStreamingPrompts([])
        }
      }, 500)
    }
  }, [getTodayJournal, config, generatePrompts, generateTitle, tasks, journals, updateJournal])

  if (!todayJournal) {
    return null
  }

  const handleRequestDelete = (journal) => {
    setDeleteTarget(journal)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteJournal(deleteTarget.id)
    setDeleteTarget(null)
    onClose?.()
  }

  return (
    <>
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
            data={{
              ...todayJournal,
              // 如果正在流式生成，使用流式问题；否则使用已保存的问题
              aiPrompts: streamingPrompts.length > 0 ? streamingPrompts : todayJournal.aiPrompts
            }}
            onUpdate={(id, updates) => {
              updateJournal(id, updates)
              // 更新本地状态以反映变化
              setTodayJournal(prev => ({ ...prev, ...updates }))
            }}
            onClose={onClose}
            onDelete={handleRequestDelete}
            mode="immersive"
            className="h-full w-full rounded-none border-0 shadow-none bg-background"
          />
        </div>
      </div>

      {/* 删除确认 Dialog */}
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
    </>
  )
}
