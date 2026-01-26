/**
 * [INPUT]: React useState, lucide-react, framer-motion, react-i18next, @/components/ui/dialog, @/components/ui/input, @/components/ui/button, platform.js
 * [OUTPUT]: FolderPicker 组件，GTD 数据目录选择器
 * [POS]: gtd/ 模块的文件夹选择组件，配置数据存储位置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Folder, FolderOpen, Check, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { snappy } from '@/lib/motion'
import { getPlatform } from '@/lib/platform'

// ============================================================================
// 文件夹选择器组件
// ============================================================================

export function FolderPicker({ open, onOpenChange, currentPath, onSelect }) {
  const { t } = useTranslation()
  const [path, setPath] = useState(currentPath || '~/GTD')
  const platform = getPlatform()

  // 预设路径选项
  const presets = platform === 'tauri'
    ? [
        { path: '~/GTD', label: t('folder.homeGTD') },
        { path: '~/Documents/GTD', label: t('folder.documentsGTD') },
        { path: '~/Library/Mobile Documents/com~apple~CloudDocs/GTD', label: t('folder.iCloudGTD') }
      ]
    : [
        { path: 'GTD', label: t('folder.defaultGTD') }
      ]

  const handleSelect = () => {
    onSelect(path)
    onOpenChange(false)
  }

  // 移动端不支持自定义路径
  const isMobile = platform === 'ios' || platform === 'android'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {t('folder.title')}
          </DialogTitle>
          <DialogDescription>
            {t('folder.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* 预设路径 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('folder.presets')}</label>
            <div className="space-y-2">
              {presets.map((preset) => (
                <motion.button
                  key={preset.path}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={snappy}
                  onClick={() => setPath(preset.path)}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    path === preset.path
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FolderOpen className={`h-5 w-5 ${
                      path === preset.path ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{preset.label}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {preset.path}
                      </div>
                    </div>
                    {path === preset.path && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 自定义路径（仅桌面端） */}
          {!isMobile && (
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('folder.custom')}</label>
              <Input
                type="text"
                placeholder="~/path/to/GTD"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {t('folder.customHint')}
              </p>
            </div>
          )}

          {/* 移动端提示 */}
          {isMobile && (
            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-muted-foreground">
                {t('folder.mobileHint')}
              </p>
            </div>
          )}

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
              onClick={handleSelect}
              disabled={!path}
            >
              <Check className="h-4 w-4 mr-2" />
              {t('folder.select')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
