/**
 * [INPUT]: react-i18next, lucide-react, ../components
 * [OUTPUT]: AboutSection 组件 - 关于页面（版本信息 + 开源协议）
 * [POS]: settings/sections 关于信息区
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { Info, FileText, Github, Heart } from 'lucide-react'
import { SettingItem, SettingGroup } from '../components'

// ============================================================================
// 关于页面
// ============================================================================

export function AboutSection() {
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <SettingGroup>
        <SettingItem label={t('about.version')} icon={Info}>
          <span className="text-sm text-muted-foreground font-mono">1.0.0</span>
        </SettingItem>

        <SettingItem label={t('about.license')} icon={FileText}>
          <span className="text-sm text-muted-foreground">MIT</span>
        </SettingItem>
      </SettingGroup>

      <SettingGroup title={t('about.links')}>
        <SettingItem
          label="GitHub"
          icon={Github}
          onClick={() => window.open('https://github.com', '_blank')}
          chevron
        />
      </SettingGroup>

      <div className="pt-4 text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          {t('about.madeWith')} <Heart className="h-3 w-3 text-red-500" /> {t('about.by')}
        </p>
      </div>
    </div>
  )
}
