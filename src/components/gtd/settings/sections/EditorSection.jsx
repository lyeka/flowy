/**
 * [INPUT]: react, react-i18next, lucide-react, @/components/ui/select, @/components/ui/slider, @/stores/editor, ../components
 * [OUTPUT]: EditorSection 组件 - 编辑器样式设置
 * [POS]: settings/sections 编辑器配置区，被 SettingsContent 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useTranslation } from 'react-i18next'
import { Type, List, Minus, AlignLeft } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { SettingItem, SettingGroup } from '../components'
import { useEditor, editorPresets, bulletOptions, boldWeightOptions } from '@/stores/editor'

// ============================================================================
// 编辑器样式设置
// ============================================================================

export function EditorSection() {
  const { t } = useTranslation()
  const { config, applyPreset, updateConfig } = useEditor()

  return (
    <div className="space-y-6">
      <SettingGroup>
        {/* 预设选择 */}
        <SettingItem label={t('editor.preset')} icon={Type}>
          <Select
            value={Object.keys(editorPresets).find(k => editorPresets[k].name === config.name) || 'default'}
            onValueChange={applyPreset}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(editorPresets).map(([key, preset]) => (
                <SelectItem key={key} value={key}>{preset.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingGroup>

      {/* 列表符号 */}
      <SettingGroup>
        <SettingItem label={t('editor.bullet')} icon={List}>
          <Select
            value={config.bullet}
            onValueChange={(v) => updateConfig('bullet', v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {bulletOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingGroup>

      {/* 标题大小 */}
      <SettingGroup>
        <SettingItem label={t('editor.h1Size')} subLabel={`${config.h1Size.toFixed(2)}rem`}>
          <Slider
            value={[config.h1Size]}
            onValueChange={([v]) => updateConfig('h1Size', v)}
            min={1.2}
            max={2.0}
            step={0.05}
            className="w-32"
          />
        </SettingItem>
        <SettingItem label={t('editor.h2Size')} subLabel={`${config.h2Size.toFixed(2)}rem`}>
          <Slider
            value={[config.h2Size]}
            onValueChange={([v]) => updateConfig('h2Size', v)}
            min={1.1}
            max={1.6}
            step={0.05}
            className="w-32"
          />
        </SettingItem>
        <SettingItem label={t('editor.h3Size')} subLabel={`${config.h3Size.toFixed(2)}rem`}>
          <Slider
            value={[config.h3Size]}
            onValueChange={([v]) => updateConfig('h3Size', v)}
            min={1.0}
            max={1.4}
            step={0.05}
            className="w-32"
          />
        </SettingItem>
      </SettingGroup>

      {/* 排版 */}
      <SettingGroup>
        <SettingItem label={t('editor.lineHeight')} icon={AlignLeft} subLabel={config.lineHeight.toFixed(1)}>
          <Slider
            value={[config.lineHeight]}
            onValueChange={([v]) => updateConfig('lineHeight', v)}
            min={1.5}
            max={2.2}
            step={0.1}
            className="w-32"
          />
        </SettingItem>
        <SettingItem label={t('editor.fontSize')} subLabel={`${config.fontSize.toFixed(2)}rem`}>
          <Slider
            value={[config.fontSize]}
            onValueChange={([v]) => updateConfig('fontSize', v)}
            min={0.9}
            max={1.2}
            step={0.05}
            className="w-32"
          />
        </SettingItem>
      </SettingGroup>

      {/* 其他样式 */}
      <SettingGroup>
        <SettingItem label={t('editor.quoteBorder')} icon={Minus} subLabel={`${config.quoteBorderWidth}px`}>
          <Slider
            value={[config.quoteBorderWidth]}
            onValueChange={([v]) => updateConfig('quoteBorderWidth', v)}
            min={1}
            max={4}
            step={1}
            className="w-32"
          />
        </SettingItem>
        <SettingItem label={t('editor.boldWeight')} subLabel={config.boldWeight}>
          <Select
            value={config.boldWeight}
            onValueChange={(v) => updateConfig('boldWeight', v)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {boldWeightOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SettingItem>
      </SettingGroup>
    </div>
  )
}
