/**
 * [INPUT]: react, lucide-react, useAI hook, useGTD hook, i18next, ui components (Dialog, Button)
 * [OUTPUT]: AISettings 组件 - AI 配置界面（含测试功能）
 * [POS]: Settings 对话框的子组件，负责 AI 配置和连接测试
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { Bot, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAI } from '@/stores/ai'
import { useGTD } from '@/stores/gtd'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

// ============================================================
// AI Settings Component
// ============================================================

export function AISettings() {
  const { t } = useTranslation()
  const { config, updateConfig, getDecryptedApiKey, generatePrompts } = useAI()
  const { tasks } = useGTD()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isLoadingKey, setIsLoadingKey] = useState(true)

  // 测试相关状态
  const [testing, setTesting] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testPrompts, setTestPrompts] = useState([])
  const [testError, setTestError] = useState(null)

  // 加载解密后的 API Key
  useEffect(() => {
    async function loadKey() {
      if (config.apiKey) {
        const decrypted = await getDecryptedApiKey()
        setApiKeyInput(decrypted)
      }
      setIsLoadingKey(false)
    }
    loadKey()
  }, [])

  const handleApiKeyChange = async (value) => {
    setApiKeyInput(value)
    await updateConfig({ apiKey: value })
  }

  // ============================================================
  // 测试逻辑
  // ============================================================

  // 解析错误信息，提供友好提示
  const parseErrorMessage = (error) => {
    const message = error.message || String(error)

    // API Key 错误
    if (message.includes('401') || message.includes('Unauthorized')) {
      return t('ai.errorInvalidApiKey')
    }

    // 网络错误
    if (message.includes('fetch') || message.includes('network')) {
      return t('ai.errorNetwork')
    }

    // 模型不存在
    if (message.includes('model') || message.includes('404')) {
      return t('ai.errorInvalidModel')
    }

    // 配额超限
    if (message.includes('quota') || message.includes('429')) {
      return t('ai.errorQuotaExceeded')
    }

    // 降级问题
    if (message.includes('fallback') || message.includes('降级')) {
      return t('ai.errorFallback')
    }

    // 通用错误
    return message
  }

  // 测试 AI 连接
  const handleTest = async () => {
    setTesting(true)
    setTestError(null)

    try {
      // 构建测试上下文
      const mockJournal = {
        id: 'test-journal',
        date: Date.now(),
        content: '',
        title: t('journal.defaultTitle')
      }

      // 使用真实任务数据（如果启用了任务上下文）
      const mockTasks = config.includeTaskContext ? tasks.slice(0, 5) : []

      // 调用 AI 生成（复用现有逻辑）
      const prompts = await generatePrompts(mockJournal, mockTasks, [])

      // 检查是否是降级问题（fallback）
      if (prompts.length > 0 && prompts[0].source === 'fallback') {
        throw new Error('API 调用失败，返回了降级问题')
      }

      if (prompts.length === 0) {
        throw new Error('未生成任何问题')
      }

      setTestPrompts(prompts)
      setTestDialogOpen(true)
    } catch (error) {
      console.error('Test failed:', error)
      setTestError(parseErrorMessage(error))
      setTestDialogOpen(true)
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* AI 助手总开关 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <Label>{t('ai.title')}</Label>
        </div>
        <Switch
          checked={config.enabled}
          onCheckedChange={(checked) => updateConfig({ enabled: checked })}
        />
      </div>

      {/* AI 配置区域（仅在启用时显示） */}
      {config.enabled && (
        <div className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="ai-api-key">{t('ai.apiKey')}</Label>
            <Input
              id="ai-api-key"
              type="password"
              placeholder={t('ai.apiKeyPlaceholder')}
              value={apiKeyInput}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              disabled={isLoadingKey}
            />
          </div>

          {/* Base URL */}
          <div className="space-y-2">
            <Label htmlFor="ai-base-url">{t('ai.baseURL')}</Label>
            <Input
              id="ai-base-url"
              type="text"
              placeholder={t('ai.baseURLPlaceholder')}
              value={config.baseURL}
              onChange={(e) => updateConfig({ baseURL: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              {t('ai.baseURLHint')}
            </p>
          </div>

          {/* 模型名称 */}
          <div className="space-y-2">
            <Label htmlFor="ai-model">{t('ai.model')}</Label>
            <Input
              id="ai-model"
              type="text"
              placeholder={t('ai.modelPlaceholder')}
              value={config.model}
              onChange={(e) => updateConfig({ model: e.target.value })}
            />
          </div>

          {/* 自动生成开关 */}
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-auto-generate" className="text-sm">
              {t('ai.autoGenerate')}
            </Label>
            <Switch
              id="ai-auto-generate"
              checked={config.autoGenerate}
              onCheckedChange={(checked) => updateConfig({ autoGenerate: checked })}
            />
          </div>

          {/* 自动生成标题开关 */}
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-auto-generate-title" className="text-sm">
              {t('ai.autoGenerateTitle')}
            </Label>
            <Switch
              id="ai-auto-generate-title"
              checked={config.autoGenerateTitle}
              onCheckedChange={(checked) => updateConfig({ autoGenerateTitle: checked })}
            />
          </div>

          {/* 引入任务上下文 */}
          <div className="flex items-center justify-between">
            <Label htmlFor="ai-task-context" className="text-sm">
              {t('ai.includeTaskContext')}
            </Label>
            <Switch
              id="ai-task-context"
              checked={config.includeTaskContext}
              onCheckedChange={(checked) => updateConfig({ includeTaskContext: checked })}
            />
          </div>

          {/* AI 指导方向 */}
          <div className="space-y-2">
            <Label htmlFor="ai-guidance">{t('ai.userGuidance')}</Label>
            <Textarea
              id="ai-guidance"
              placeholder={t('ai.userGuidancePlaceholder')}
              value={config.userGuidance}
              onChange={(e) => updateConfig({ userGuidance: e.target.value })}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {t('ai.userGuidanceHint')}
            </p>
          </div>

          {/* 测试按钮 */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              {t('ai.testHint')}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testing || !config.apiKey}
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {t('ai.testing')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {t('ai.testConnection')}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* 测试结果 Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('ai.testResults')}</DialogTitle>
          </DialogHeader>

          {testError ? (
            // 错误展示
            <div className="space-y-3">
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-destructive">
                      {t('ai.testFailed')}
                    </p>
                    <p className="text-xs text-destructive/80">
                      {testError}
                    </p>
                  </div>
                </div>
              </div>

              {/* 排查建议 */}
              <div className="space-y-2 text-xs text-muted-foreground">
                <p className="font-medium">{t('ai.troubleshootingSteps')}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t('ai.checkApiKey')}</li>
                  <li>{t('ai.checkBaseURL')}</li>
                  <li>{t('ai.checkModel')}</li>
                  <li>{t('ai.checkNetwork')}</li>
                </ul>
              </div>
            </div>
          ) : (
            // 成功展示
            <div className="space-y-3">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-green-700 dark:text-green-400">
                      {t('ai.testSuccess')}
                    </p>
                    <p className="text-xs text-green-600/80 dark:text-green-400/80">
                      {t('ai.testSuccessDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* 生成的问题预览 */}
              <div className="space-y-2">
                <Label>{t('ai.generatedQuestions')}</Label>
                {testPrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="rounded-md bg-muted/50 px-3 py-2 text-sm"
                  >
                    {prompt.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setTestDialogOpen(false)}>
              {t('common.close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
