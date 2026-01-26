/**
 * [INPUT]: react, react-i18next, next-themes, @/components/ui/select, ../components
 * [OUTPUT]: AppearanceSection 组件 - 外观设置（主题 + 语言）
 * [POS]: settings/sections 外观配置区，被 SettingsContent 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { useTheme } from 'next-themes'
import { Palette, Globe } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SettingItem, SettingGroup } from '../components'

// ============================================================================
// 外观设置
// ============================================================================

export function AppearanceSection() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const currentTheme = theme ?? 'light'

  return (
    <div className="space-y-6">
      <SettingGroup>
        {/* 主题设置 */}
        <SettingItem label={t('common.theme')} icon={Palette}>
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
        </SettingItem>

        {/* 语言设置 */}
        <SettingItem label={t('common.language')} icon={Globe}>
          <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh-CN">{t('languages.zh-CN')}</SelectItem>
              <SelectItem value="en-US">{t('languages.en-US')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingGroup>
    </div>
  )
}
