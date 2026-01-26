/**
 * [INPUT]: React useState, lucide-react, framer-motion, react-i18next, @/components/ui/dialog, @/components/ui/button
 * [OUTPUT]: ConflictDialog 组件，同步冲突解决对话框
 * [POS]: gtd/ 模块的冲突解决组件，展示冲突详情并让用户选择解决策略
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, Clock, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { snappy } from '@/lib/motion'

// ============================================================================
// 冲突解决对话框
// ============================================================================

export function ConflictDialog({ open, onOpenChange, conflict, onResolve }) {
  const { t } = useTranslation()
  const [selectedStrategy, setSelectedStrategy] = useState(null)

  if (!conflict) return null

  const strategies = [
    {
      id: 'merge',
      icon: Check,
      title: t('conflict.merge'),
      description: t('conflict.mergeDesc'),
      recommended: true
    },
    {
      id: 'local-wins',
      icon: FileText,
      title: t('conflict.localWins'),
      description: t('conflict.localWinsDesc')
    },
    {
      id: 'remote-wins',
      icon: FileText,
      title: t('conflict.remoteWins'),
      description: t('conflict.remoteWinsDesc')
    },
    {
      id: 'keep-both',
      icon: FileText,
      title: t('conflict.keepBoth'),
      description: t('conflict.keepBothDesc')
    }
  ]

  const handleResolve = () => {
    if (selectedStrategy) {
      onResolve(selectedStrategy)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            {t('conflict.title')}
          </DialogTitle>
          <DialogDescription>
            {t('conflict.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 冲突文件信息 */}
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              {conflict.path}
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('conflict.localTime')}: {new Date(conflict.localMtime).toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('conflict.remoteTime')}: {new Date(conflict.remoteMtime).toLocaleString()}
              </div>
            </div>
          </div>

          {/* 解决策略选择 */}
          <div className="space-y-2">
            {strategies.map((strategy) => (
              <motion.button
                key={strategy.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={snappy}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  selectedStrategy === strategy.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <strategy.icon className={`h-5 w-5 mt-0.5 ${
                    selectedStrategy === strategy.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{strategy.title}</span>
                      {strategy.recommended && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                          {t('conflict.recommended')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {strategy.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleResolve}
              disabled={!selectedStrategy}
            >
              {t('conflict.resolve')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
