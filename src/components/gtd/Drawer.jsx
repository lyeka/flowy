/**
 * [INPUT]: 依赖 @/stores/gtd 的 GTD_LIST_META，依赖 lucide-react 图标，依赖 framer-motion，依赖 @/lib/haptics，依赖 react-i18next
 * [OUTPUT]: 导出 Drawer 组件
 * [POS]: 移动端左侧滑抽屉，显示 GTD 列表和设置入口，替代底部导航的列表切换功能
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GTD_LIST_META, GTD_LISTS } from '@/stores/gtd'
import { Inbox, Sun, ArrowRight, Calendar, CheckCircle, Settings, X, PenLine, BookOpen } from 'lucide-react'
import { hapticsLight } from '@/lib/haptics'

const ICONS = { Inbox, Sun, ArrowRight, Calendar, CheckCircle }

export function Drawer({ open, onOpenChange, activeList, onSelect, counts, journalView, onJournalViewChange, onSettingsOpen }) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              hapticsLight()
              onOpenChange(false)
            }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          />

          {/* 抽屉内容 */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-sidebar border-r border-border flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-primary">Flowy</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  hapticsLight()
                  onOpenChange(false)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            {/* GTD 列表 */}
            <div className="flex-1 overflow-y-auto p-2">
              <div className="space-y-1">
                {Object.entries(GTD_LIST_META).map(([key, meta]) => {
                  const Icon = ICONS[meta.icon]
                  const isActive = activeList === key
                  const count = counts[key] || 0

                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        hapticsLight()
                        onSelect(key)
                        onOpenChange(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm transition-colors",
                        "hover:bg-sidebar-accent",
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", meta.color)} />
                      <span className="flex-1 text-left">{t(`gtd.${meta.key}`)}</span>
                      {count > 0 && (
                        <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full font-medium">
                          {count}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {/* 日记分组 */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="text-xs text-muted-foreground px-4 mb-2 font-medium">
                  {t('journal.title')}
                </div>
                <div className="space-y-1">
                  {/* 此刻 */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      hapticsLight()
                      onJournalViewChange('now')
                      onOpenChange(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm transition-colors",
                      "hover:bg-sidebar-accent",
                      journalView === 'now' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <PenLine className="h-5 w-5" />
                    <span className="flex-1 text-left">{t('journal.now')}</span>
                  </motion.button>

                  {/* 过往 */}
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      hapticsLight()
                      onJournalViewChange('past')
                      onOpenChange(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm transition-colors",
                      "hover:bg-sidebar-accent",
                      journalView === 'past' && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span className="flex-1 text-left">{t('journal.past')}</span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* 底部设置 */}
            <div className="p-2 border-t border-border">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  hapticsLight()
                  onSettingsOpen()
                  onOpenChange(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm transition-colors hover:bg-sidebar-accent text-muted-foreground"
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1 text-left">{t('common.settings')}</span>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
