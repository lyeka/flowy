/**
 * [INPUT]: react, react-i18next, lucide-react, framer-motion, @/lib/utils
 * [OUTPUT]: SettingsNav 组件 - 设置导航栏
 * [POS]: settings 左侧导航，被 SettingsDialog 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Palette, Database, Bot, Info, Type } from 'lucide-react'
import { cn } from '@/lib/utils'
import { snappy } from '@/lib/motion'

// ============================================================================
// 导航配置
// ============================================================================

export const SETTINGS_SECTIONS = [
  { id: 'appearance', icon: Palette, labelKey: 'settings.appearance' },
  { id: 'editor', icon: Type, labelKey: 'settings.editor' },
  { id: 'data', icon: Database, labelKey: 'settings.data' },
  { id: 'ai', icon: Bot, labelKey: 'settings.ai' },
  { id: 'about', icon: Info, labelKey: 'settings.about' }
]

// ============================================================================
// 设置导航
// ============================================================================

export function SettingsNav({ activeSection, onSectionChange, className }) {
  const { t } = useTranslation()

  return (
    <nav className={cn("space-y-1", className)}>
      {SETTINGS_SECTIONS.map((section) => {
        const Icon = section.icon
        const isActive = activeSection === section.id

        return (
          <motion.button
            key={section.id}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={snappy}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(section.labelKey)}</span>
          </motion.button>
        )
      })}
    </nav>
  )
}
