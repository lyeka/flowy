/**
 * [INPUT]: React hooks, crypto.js (encryptKey, decryptKey), openai.js (generatePrompts, generateTitle), prompts.js (buildContext)
 * [OUTPUT]: useAI hook - AI 配置和状态管理
 * [POS]: AI 模块的状态层，管理配置和生成逻辑（问题 + 标题）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback } from 'react'
import { encryptKey, decryptKey } from '@/lib/ai/crypto'
import { generatePrompts as generatePromptsAPI, generateTitle as generateTitleAPI } from '@/lib/ai/openai'
import { buildContext } from '@/lib/ai/prompts'

// ============================================================
// Constants
// ============================================================

const STORAGE_KEY = 'gtd-ai-settings'

const DEFAULT_CONFIG = {
  enabled: false,
  provider: 'openai',
  apiKey: '',
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  userGuidance: '',
  autoGenerate: true,
  autoGenerateTitle: true,  // 自动生成日记标题
  includeTaskContext: true,
  includeHistoryContext: true,
  maxPrompts: 3
}

// ============================================================
// Storage Functions
// ============================================================

function loadConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error('Failed to load AI config:', error)
  }
  return DEFAULT_CONFIG
}

function saveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save AI config:', error)
  }
}

// ============================================================
// Hook
// ============================================================

export function useAI() {
  const [config, setConfig] = useState(loadConfig)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  // 持久化配置
  useEffect(() => {
    saveConfig(config)
  }, [config])

  // 更新配置
  const updateConfig = useCallback(async (updates) => {
    // 如果更新了 API Key，需要加密
    if (updates.apiKey !== undefined && updates.apiKey !== config.apiKey) {
      const encrypted = await encryptKey(updates.apiKey)
      setConfig(prev => ({ ...prev, ...updates, apiKey: encrypted }))
    } else {
      setConfig(prev => ({ ...prev, ...updates }))
    }
  }, [config.apiKey])

  // 获取解密后的 API Key
  const getDecryptedApiKey = useCallback(async () => {
    return await decryptKey(config.apiKey)
  }, [config.apiKey])

  // 生成问题（支持流式输出）
  const generatePrompts = useCallback(async (journal, tasks, recentJournals = [], onProgress = null) => {
    // 检查是否启用
    if (!config.enabled || !config.apiKey) {
      return []
    }

    setGenerating(true)
    setError(null)

    try {
      // 构建上下文
      const context = buildContext(journal, tasks, config, recentJournals)

      // 调用 API（支持进度回调）
      const prompts = await generatePromptsAPI(context, config, onProgress)

      setGenerating(false)
      return prompts
    } catch (err) {
      console.error('Failed to generate prompts:', err)
      setGenerating(false)
      setError(err.message)
      return []
    }
  }, [config])

  // 生成标题
  const generateTitle = useCallback(async (journal, tasks, recentJournals = []) => {
    // 检查是否启用
    if (!config.enabled || !config.apiKey) {
      return null
    }

    setGenerating(true)
    setError(null)

    try {
      // 构建上下文
      const context = buildContext(journal, tasks, config, recentJournals)

      // 调用 API
      const title = await generateTitleAPI(context, config)

      setGenerating(false)
      return title
    } catch (err) {
      console.error('Failed to generate title:', err)
      setGenerating(false)
      setError(err.message)
      return null
    }
  }, [config])

  // 重置配置
  const resetConfig = useCallback(() => {
    setConfig(DEFAULT_CONFIG)
  }, [])

  return {
    config,
    generating,
    error,
    updateConfig,
    getDecryptedApiKey,
    generatePrompts,
    generateTitle,
    resetConfig
  }
}
