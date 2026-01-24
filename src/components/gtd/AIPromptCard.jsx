/**
 * [INPUT]: react, framer-motion, lucide-react, useAI hook, i18next
 * [OUTPUT]: AIPromptCard 组件 - 展示 AI 生成的问题卡片
 * [POS]: NotesPanel 的子组件，负责 AI 问题的展示和交互
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAI } from '@/stores/ai'

// ============================================================
// AI Prompt Card Component
// ============================================================

export function AIPromptCard({ prompts = [], onSelect, onDismiss, onRefresh }) {
  const { t } = useTranslation()
  const { generating } = useAI()
  const [hoveredId, setHoveredId] = useState(null)

  // 过滤掉已删除和已插入的问题
  const visiblePrompts = prompts.filter(p => !p.dismissed && !p.inserted)

  // 如果没有可见问题，不显示卡片
  if (visiblePrompts.length === 0 && !generating) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4 rounded-lg border border-border/50 bg-muted/30 p-3"
    >
      {/* 卡片头部 */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-foreground/80">
          <span>{t('ai.todayGuide')}</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={generating}
          className="rounded p-1 hover:bg-muted transition-colors disabled:opacity-50"
          title={t('ai.refresh')}
        >
          <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* 问题列表 */}
      <div className="space-y-2">
        {generating && visiblePrompts.length === 0 ? (
          // 加载中且没有问题时，显示加载提示
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{t('ai.generating')}</span>
          </div>
        ) : (
          // 有问题时，显示问题列表（流式输出过程中也显示）
          <AnimatePresence mode="popLayout">
            {visiblePrompts.map((prompt) => (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
                onMouseEnter={() => setHoveredId(prompt.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <button
                  onClick={() => onSelect(prompt)}
                  className="w-full text-left rounded-md bg-background/50 py-2 text-sm hover:bg-background transition-colors"
                >
                  <span>{prompt.text}</span>
                </button>

                {/* 删除按钮（悬停显示） */}
                <AnimatePresence>
                  {hoveredId === prompt.id && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => onDismiss(prompt.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 bg-background hover:bg-muted transition-colors"
                      title="删除"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}
