/**
 * [INPUT]: 依赖 framer-motion，依赖 lucide-react 图标，依赖 @/lib/haptics，依赖 react-i18next
 * [OUTPUT]: 导出 ActionSheet 组件
 * [POS]: 移动端底部操作表，显示任务操作选项（设置日期、移动到列表、删除），替代桌面端的下拉菜单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { hapticsLight } from '@/lib/haptics'
import { X } from 'lucide-react'

export function ActionSheet({ open, onOpenChange, title, actions }) {
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          />

          {/* 操作表内容 */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 right-0 bottom-0 z-50 bg-background border-t border-border rounded-t-2xl safe-area-inset-bottom"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
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

            {/* 操作列表 */}
            <div className="p-2">
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    hapticsLight()
                    action.onPress()
                    onOpenChange(false)
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-4 rounded-lg text-sm transition-colors",
                    "hover:bg-sidebar-accent",
                    action.destructive && "text-destructive"
                  )}
                >
                  {action.icon && <action.icon className="h-5 w-5" />}
                  <span className="flex-1 text-left">{action.label}</span>
                </motion.button>
              ))}
            </div>

            {/* 底部安全区域 */}
            <div className="h-4" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
