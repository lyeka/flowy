/**
 * [INPUT]: react, react-i18next, @/components/ui/dialog, @/components/ui/sheet, @/lib/platform, ./SettingsNav, ./SettingsContent
 * [OUTPUT]: SettingsDialog 组件 - 设置主容器（响应式布局）
 * [POS]: settings 入口组件，桌面端 Dialog 左右分栏，移动端 Sheet 单列
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { isMobile } from '@/lib/platform'
import { SettingsNav, SETTINGS_SECTIONS } from './SettingsNav'
import { SettingsContent } from './SettingsContent'

// ============================================================================
// 设置对话框
// ============================================================================

export function SettingsDialog({ open, onOpenChange, sync, fileSystem, onExport, onImport }) {
  const { t } = useTranslation()
  const [activeSection, setActiveSection] = useState('appearance')
  const mobile = isMobile()

  // 移动端：当前是否在内容页
  const [mobileShowContent, setMobileShowContent] = useState(false)

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId)
    if (mobile) {
      setMobileShowContent(true)
    }
  }

  const handleMobileBack = () => {
    setMobileShowContent(false)
  }

  const handleOpenChange = (open) => {
    if (!open) {
      // 关闭时重置移动端状态
      setMobileShowContent(false)
    }
    onOpenChange(open)
  }

  // 获取当前 section 标题
  const currentSectionTitle = SETTINGS_SECTIONS.find(s => s.id === activeSection)?.labelKey

  // ============================================================
  // 移动端：Sheet 全屏
  // ============================================================
  if (mobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
          {!mobileShowContent ? (
            // 导航列表
            <>
              <SheetHeader className="p-4 border-b">
                <SheetTitle>{t('common.settings')}</SheetTitle>
              </SheetHeader>
              <div className="p-4">
                <SettingsNav
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                />
              </div>
            </>
          ) : (
            // 内容页
            <>
              <SheetHeader className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMobileBack}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <SheetTitle>{t(currentSectionTitle)}</SheetTitle>
                </div>
              </SheetHeader>
              <div className="p-4 overflow-y-auto flex-1">
                <SettingsContent
                  activeSection={activeSection}
                  sync={sync}
                  fileSystem={fileSystem}
                  onExport={onExport}
                  onImport={onImport}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    )
  }

  // ============================================================
  // 桌面端：Dialog 左右分栏
  // ============================================================
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        <div className="flex h-[500px]">
          {/* 左侧导航 */}
          <div className="w-48 border-r bg-muted/30 p-4 flex flex-col">
            <DialogHeader className="mb-4">
              <DialogTitle>{t('common.settings')}</DialogTitle>
            </DialogHeader>
            <SettingsNav
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </div>

          {/* 右侧内容 */}
          <div className="flex-1 p-6 overflow-y-auto">
            <SettingsContent
              activeSection={activeSection}
              sync={sync}
              fileSystem={fileSystem}
              onExport={onExport}
              onImport={onImport}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
