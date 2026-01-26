/**
 * [INPUT]: react, react-i18next, lucide-react, @/stores/ai, @/stores/gtd, @/components/ui/*, ../components
 * [OUTPUT]: AISection 组件 - AI 助手设置（API 配置 + 自动化选项 + 测试）
 * [POS]: settings/sections AI 配置区，迁移自 AISettings.jsx
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useAI } from '@/stores/ai'
import { useGTD } from '@/stores/gtd'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SettingItem, SettingGroup } from '../components'

// ============================================================================
// AI 设置
// ============================================================================

export function AISection() {
  const { t } = useTranslation()
  const { config, updateConfig, getDecryptedApiKey, generatePrompts, generateTitle } = useAI()
  const { tasks } = useGTD()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [isLoadingKey, setIsLoadingKey] = useState(true)

  // 测试相关状态
  const [testing, setTesting] = useState(false)
  const [testDialogOpen, setTestDialogOpen] = useState(false)
  const [testPrompts, setTestPrompts] = useState([])
  const [testTitle, setTestTitle] = useState(null)
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

  // 解析错误信息
  const parseErrorMessage = (error) => {
    const message = error.message || String(error)
    if (message.includes('401') || message.includes('Unauthorized')) {
      return t('ai.errorInvalidApiKey')
    }
    if (message.includes('fetch') || message.includes('network')) {
      return t('ai.errorNetwork')
    }
    if (message.includes('model') || message.includes('404')) {
      return t('ai.errorInvalidModel')
    }
    if (message.includes('quota') || message.includes('429')) {
      return t('ai.errorQuotaExceeded')
    }
    if (message.includes('fallback') || message.includes('降级')) {
      return t('ai.errorFallback')
    }
    return message
  }

  // 测试 AI 连接
  const handleTest = async () => {
    setTesting(true)
    setTestError(null)
    setTestTitle(null)

    try {
      const mockJournal = {
        id: 'test-journal',
        date: Date.now(),
        content: '',
        title: t('journal.defaultTitle')
      }
      const mockTasks = config.includeTaskContext ? tasks.slice(0, 5) : []

      const [prompts, title] = await Promise.all([
        generatePrompts(mockJournal, mockTasks, []),
        config.autoGenerateTitle ? generateTitle(mockJournal, mockTasks, []) : Promise.resolve(null)
      ])

      if (prompts.length > 0 && prompts[0].source === 'fallback') {
        throw new Error('API 调用失败，返回了降级问题')
      }
      if (prompts.length === 0 && !title) {
        throw new Error('未生成任何内容')
      }

      setTestPrompts(prompts)
      setTestTitle(title)
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
    <div className="space-y-6">
      {/* AI 助手总开关 */}
      <SettingGroup>
        <SettingItem label={t('ai.title')} icon={Bot}>
          <Switch
            checked={config.enabled}
            onCheckedChange={(checked) => updateConfig({ enabled: checked })}
          />
        </SettingItem>
      </SettingGroup>

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
            <p className="text-xs text-muted-foreground">{t('ai.baseURLHint')}</p>
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

          {/* 开关选项 */}
          <div className="space-y-3 pt-2">
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
            <p className="text-xs text-muted-foreground">{t('ai.userGuidanceHint')}</p>
          </div>

          {/* 测试按钮 */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">{t('ai.testHint')}</p>
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
            <div className="space-y-3">
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm text-destructive">{t('ai.testFailed')}</p>
                    <p className="text-xs text-destructive/80">{testError}</p>
                  </div>
                </div>
              </div>
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

              {testTitle && (
                <div className="space-y-2">
                  <Label>{t('ai.generatedTitle')}</Label>
                  <div className="rounded-md bg-primary/10 text-primary px-3 py-2 text-sm font-medium">
                    {testTitle}
                  </div>
                </div>
              )}

              {testPrompts.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('ai.generatedQuestions')}</Label>
                  {testPrompts.map((prompt, index) => (
                    <div key={index} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                      {prompt.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button onClick={() => setTestDialogOpen(false)}>{t('common.close')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
