/**
 * [INPUT]: react hooks, localStorage
 * [OUTPUT]: useEditor hook - 编辑器样式配置状态管理
 * [POS]: 编辑器样式配置状态管理，支持用户自定义 Markdown 渲染样式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback } from 'react'

// ============================================================
// 预设主题
// ============================================================
export const editorPresets = {
  default: {
    name: '默认',
    bullet: '•',
    h1Size: 1.6,
    h2Size: 1.35,
    h3Size: 1.15,
    quoteBorderWidth: 2,
    boldWeight: 600,
    lineHeight: 1.8,
    fontSize: 1.0
  },
  minimal: {
    name: '极简',
    bullet: '-',
    h1Size: 1.4,
    h2Size: 1.25,
    h3Size: 1.1,
    quoteBorderWidth: 1,
    boldWeight: 500,
    lineHeight: 1.6,
    fontSize: 0.95
  },
  cozy: {
    name: '舒适',
    bullet: '•',
    h1Size: 1.6,
    h2Size: 1.35,
    h3Size: 1.15,
    quoteBorderWidth: 2,
    boldWeight: 600,
    lineHeight: 2.0,
    fontSize: 1.05
  }
}

// ============================================================
// 可选项
// ============================================================
export const bulletOptions = [
  { value: '•', label: '• 实心圆' },
  { value: '*', label: '* 星号' },
  { value: '-', label: '- 短横' },
  { value: '→', label: '→ 箭头' },
  { value: '◦', label: '◦ 空心圆' }
]

export const boldWeightOptions = [
  { value: 500, label: '500 中等' },
  { value: 600, label: '600 半粗' },
  { value: 700, label: '700 粗体' }
]

const STORAGE_KEY = 'gtd-editor-config'

// 默认配置
const defaultConfig = { ...editorPresets.default }

// ============================================================
// Store Hook
// ============================================================
export function useEditor() {
  const [config, setConfig] = useState(defaultConfig)

  // 从 localStorage 加载配置
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved)
        // 合并默认值，确保新字段在旧配置中存在
        setConfig({ ...defaultConfig, ...savedConfig })
      } catch (e) {
        console.warn('[Editor] Failed to load config:', e)
      }
    }
  }, [])

  // 应用配置到 CSS 变量
  const applyToCSS = useCallback((cfg) => {
    const root = document.documentElement
    root.style.setProperty('--md-h1-size', `${cfg.h1Size}rem`)
    root.style.setProperty('--md-h2-size', `${cfg.h2Size}rem`)
    root.style.setProperty('--md-h3-size', `${cfg.h3Size}rem`)
    root.style.setProperty('--md-quote-border-width', `${cfg.quoteBorderWidth}px`)
    root.style.setProperty('--md-bold-weight', cfg.boldWeight)
    root.style.setProperty('--md-line-height', cfg.lineHeight)
    root.style.setProperty('--md-font-size', `${cfg.fontSize}rem`)
  }, [])

  // 配置变更时应用到 CSS
  useEffect(() => {
    applyToCSS(config)
  }, [config, applyToCSS])

  // 应用预设
  const applyPreset = useCallback((presetKey) => {
    const preset = editorPresets[presetKey]
    if (preset) {
      setConfig((prev) => {
        const next = { ...preset }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }
  }, [])

  // 更新单个配置项
  const updateConfig = useCallback((key, value) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // 初始化（已在加载时自动完成）
  const init = useCallback(() => {
    // CSS 变量已在 useEffect 中应用
  }, [])

  return {
    config,
    applyPreset,
    updateConfig,
    init
  }
}

// 获取当前 bullet 配置（供 markdown.js 使用）
export const getBullet = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const cfg = JSON.parse(saved)
      return cfg.bullet || defaultConfig.bullet
    }
  } catch (e) {}
  return defaultConfig.bullet
}
