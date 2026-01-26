/**
 * [INPUT]: React useState, lucide-react, framer-motion, react-i18next, @/components/ui/dialog, @/components/ui/input, @/components/ui/button
 * [OUTPUT]: SyncSettings 组件，WebDAV 同步配置界面
 * [POS]: gtd/ 模块的同步设置组件，配置 WebDAV 连接
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, RefreshCw, Check, X, Loader2, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { snappy } from '@/lib/motion'

// ============================================================================
// 同步设置组件
// ============================================================================

export function SyncSettings({ open, onOpenChange, sync }) {
  const { t } = useTranslation()
  const [url, setUrl] = useState(sync.syncConfig?.url || '')
  const [username, setUsername] = useState(sync.syncConfig?.username || '')
  const [password, setPassword] = useState(sync.syncConfig?.password || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // 测试连接
  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const success = await sync.testConnection({ url, username, password })
      setTestResult(success ? 'success' : 'failed')
    } catch {
      setTestResult('failed')
    } finally {
      setTesting(false)
    }
  }

  // 保存配置
  const handleSave = () => {
    sync.configureWebDAV({ url, username, password })
    onOpenChange(false)
  }

  // 断开连接
  const handleDisconnect = () => {
    sync.disconnect()
    setUrl('')
    setUsername('')
    setPassword('')
    setTestResult(null)
  }

  const isConfigured = sync.isConfigured
  const canSave = url && username && password

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isConfigured ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
            {t('sync.title')}
          </DialogTitle>
          <DialogDescription>
            {t('sync.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* WebDAV URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.serverUrl')}</label>
            <Input
              type="url"
              placeholder="https://dav.jianguoyun.com/dav/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">
              {t('sync.serverUrlHint')}
            </p>
          </div>

          {/* 用户名 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.username')}</label>
            <Input
              type="text"
              placeholder={t('sync.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isConfigured}
            />
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.password')}</label>
            <Input
              type="password"
              placeholder={t('sync.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">
              {t('sync.passwordHint')}
            </p>
          </div>

          {/* 测试结果 */}
          <AnimatePresence>
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={snappy}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  testResult === 'success'
                    ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-red-500/10 text-red-600 dark:text-red-400'
                }`}
              >
                {testResult === 'success' ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('sync.testSuccess')}
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    {t('sync.testFailed')}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            {isConfigured ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleDisconnect}
                >
                  <CloudOff className="h-4 w-4 mr-2" />
                  {t('sync.disconnect')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => sync.sync()}
                  disabled={sync.status === 'syncing'}
                >
                  {sync.status === 'syncing' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t('sync.syncNow')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleTest}
                  disabled={!canSave || testing}
                >
                  {testing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t('sync.test')}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={!canSave || testResult !== 'success'}
                >
                  <Check className="h-4 w-4 mr-2" />
                  {t('sync.save')}
                </Button>
              </>
            )}
          </div>

          {/* 同步状态 */}
          {isConfigured && (
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('sync.lastSync')}</span>
                <span>
                  {sync.lastSyncTime
                    ? new Date(sync.lastSyncTime).toLocaleString()
                    : t('sync.never')}
                </span>
              </div>
              {sync.status === 'syncing' && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>{sync.currentFile || t('sync.preparing')}</span>
                    <span>{sync.progress}%</span>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${sync.progress}%` }}
                      transition={snappy}
                    />
                  </div>
                </div>
              )}
              {sync.status === 'error' && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {sync.error}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
