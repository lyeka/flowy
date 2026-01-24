/**
 * [INPUT]: OpenAI API, crypto.js (decryptKey), prompts.js (buildSystemPrompt, buildUserPrompt, buildTitlePrompt, buildTitleUserPrompt, parseAIResponse, parseTitleResponse, getFallbackPrompts)
 * [OUTPUT]: generatePrompts, generateTitle - 调用 OpenAI API 生成问题和标题（支持流式输出）
 * [POS]: AI 模块的 API 层，负责与 OpenAI 通信
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { decryptKey } from './crypto'
import {
  buildSystemPrompt,
  buildUserPrompt,
  buildTitlePrompt,
  buildTitleUserPrompt,
  parseAIResponse,
  parseTitleResponse,
  getFallbackPrompts
} from './prompts'

// ============================================================
// OpenAI API Integration (Streaming Support)
// ============================================================

export async function generatePrompts(context, config, onProgress = null) {
  try {
    // 解密 API Key
    const apiKey = await decryptKey(config.apiKey)
    if (!apiKey) {
      console.error('No API key available')
      return getFallbackPrompts()
    }

    // 构建 prompt
    const systemPrompt = buildSystemPrompt(context.userGuidance)
    const userPrompt = buildUserPrompt(context)

    // 使用配置的 baseURL，如果没有则使用默认的 OpenAI endpoint
    const baseURL = config.baseURL || 'https://api.openai.com/v1'
    const endpoint = `${baseURL}/chat/completions`

    // 调用 OpenAI 兼容 API（非流式模式，避免渲染闪烁）
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
        stream: false  // 禁用流式输出，等待完整响应
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return getFallbackPrompts()
    }

    // 解析完整响应
    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No content in response')
      return getFallbackPrompts()
    }

    // 解析问题
    const prompts = parseAIResponse(content)

    if (prompts.length === 0) {
      return getFallbackPrompts()
    }

    return prompts
  } catch (error) {
    console.error('Failed to generate prompts:', error)
    return getFallbackPrompts()
  }
}

// ============================================================
// Title Generation (Non-streaming)
// ============================================================

export async function generateTitle(context, config) {
  try {
    // 解密 API Key
    const apiKey = await decryptKey(config.apiKey)
    if (!apiKey) {
      console.error('No API key available')
      return null
    }

    // 构建 prompt
    const systemPrompt = buildTitlePrompt(context.userGuidance)
    const userPrompt = buildTitleUserPrompt(context)

    // 使用配置的 baseURL
    const baseURL = config.baseURL || 'https://api.openai.com/v1'
    const endpoint = `${baseURL}/chat/completions`

    // 调用 OpenAI 兼容 API（非流式模式，标题生成很快）
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: config.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,  // 提高随机性，让标题更有创意和变化
        max_tokens: 50
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return null
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      console.error('No content in response')
      return null
    }

    // 解析标题
    const title = parseTitleResponse(content)

    return title
  } catch (error) {
    console.error('Failed to generate title:', error)
    return null
  }
}
