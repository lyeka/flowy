/**
 * [INPUT]: 依赖 @/components/ui/dialog, @/components/ui/select，依赖 lucide-react 图标，依赖 framer-motion，依赖 react-i18next，依赖 next-themes，依赖 AISettings 组件
 * [OUTPUT]: 导出 Settings 组件
 * [POS]: 设置对话框，主题切换 + 语言切换 + AI 配置 + 数据导入/导出入口，被 Sidebar 调用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Download, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { snappy } from '@/lib/motion'
import { AISettings } from './AISettings'

export function Settings({ open, onOpenChange, onExport, onImport }) {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const currentTheme = theme ?? 'light'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('common.settings')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {/* 主题设置 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('common.theme')}</span>
            <Select value={currentTheme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">{t('themes.light')}</SelectItem>
                <SelectItem value="dark">{t('themes.dark')}</SelectItem>
                <SelectItem value="system">{t('themes.system')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 语言设置 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('common.language')}</span>
            <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zh-CN">{t('languages.zh-CN')}</SelectItem>
                <SelectItem value="en-US">{t('languages.en-US')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 分隔线 */}
          <div className="border-t" />

          {/* AI 设置 */}
          <AISettings />

          {/* 分隔线 */}
          <div className="border-t" />

          {/* 数据同步 */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{t('common.dataSync')}</span>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={snappy}
                onClick={onExport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-sidebar-accent/50 text-muted-foreground"
              >
                <Download className="h-4 w-4" />
                {t('common.export')}
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={snappy}
                onClick={onImport}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-sidebar-accent/50 text-muted-foreground"
              >
                <Upload className="h-4 w-4" />
                {t('common.import')}
              </motion.button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
