/**
 * [INPUT]: react, react-i18next, framer-motion, lucide-react, @/components/ui/*, @/lib/motion, @/lib/platform, @/lib/fs, ../components
 * [OUTPUT]: DataSection 组件 - 数据设置（数据目录 + 云同步 + 导入导出）
 * [POS]: settings/sections 数据配置区，整合原 FolderPicker + SyncSettings 功能
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder, FolderOpen, Cloud, CloudOff, Download, Upload,
  RefreshCw, Check, AlertCircle, Loader2, ChevronLeft
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { snappy } from '@/lib/motion'
import { getPlatform } from '@/lib/platform'
import { supportsRealFileSystem } from '@/lib/fs'
import { SettingItem, SettingGroup } from '../components'

// ============================================================================
// 数据设置
// ============================================================================

export function DataSection({ sync, fileSystem, onExport, onImport }) {
  const { t } = useTranslation()
  const [subView, setSubView] = useState(null) // 'folder' | 'sync' | null
  const platform = getPlatform()

  // 文件夹选择状态
  const [folderPath, setFolderPath] = useState(fileSystem?.config?.basePath || '~/GTD')

  // 同步配置状态
  const [syncUrl, setSyncUrl] = useState(sync?.syncConfig?.url || '')
  const [syncUsername, setSyncUsername] = useState(sync?.syncConfig?.username || '')
  const [syncPassword, setSyncPassword] = useState(sync?.syncConfig?.password || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  // 预设路径
  const presets = platform === 'tauri'
    ? [
        { path: '~/GTD', label: t('folder.homeGTD') },
        { path: '~/Documents/GTD', label: t('folder.documentsGTD') },
        { path: '~/Library/Mobile Documents/com~apple~CloudDocs/GTD', label: t('folder.iCloudGTD') }
      ]
    : [{ path: 'GTD', label: t('folder.defaultGTD') }]

  const isMobile = platform === 'ios' || platform === 'android'

  // 文件夹选择处理
  const handleFolderSelect = async () => {
    if (fileSystem?.updateConfig) {
      await fileSystem.updateConfig({ basePath: folderPath })
      window.location.reload()
    }
  }

  // 同步测试
  const handleSyncTest = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const success = await sync.testConnection({
        url: syncUrl,
        username: syncUsername,
        password: syncPassword
      })
      setTestResult(success ? 'success' : 'failed')
    } catch {
      setTestResult('failed')
    } finally {
      setTesting(false)
    }
  }

  // 保存同步配置
  const handleSyncSave = () => {
    sync.configureWebDAV({
      url: syncUrl,
      username: syncUsername,
      password: syncPassword
    })
    setSubView(null)
  }

  // 断开同步
  const handleSyncDisconnect = () => {
    sync.disconnect()
    setSyncUrl('')
    setSyncUsername('')
    setSyncPassword('')
    setTestResult(null)
  }

  const canSaveSync = syncUrl && syncUsername && syncPassword

  // ============================================================
  // 子视图：文件夹选择
  // ============================================================
  if (subView === 'folder') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSubView(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">{t('folder.presets')}</h3>
          <div className="space-y-2">
            {presets.map((preset) => (
              <motion.button
                key={preset.path}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={snappy}
                onClick={() => setFolderPath(preset.path)}
                className={`w-full p-3 rounded-lg border text-left transition-colors ${
                  folderPath === preset.path
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className={`h-5 w-5 ${
                    folderPath === preset.path ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {preset.path}
                    </div>
                  </div>
                  {folderPath === preset.path && (
                    <Check className="h-4 w-4 text-primary shrink-0" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>

          {!isMobile && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">{t('folder.custom')}</h3>
              <Input
                type="text"
                placeholder="~/path/to/GTD"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {t('folder.customHint')}
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setSubView(null)}>
              {t('common.cancel')}
            </Button>
            <Button className="flex-1" onClick={handleFolderSelect} disabled={!folderPath}>
              <Check className="h-4 w-4 mr-2" />
              {t('folder.select')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // 子视图：同步设置
  // ============================================================
  if (subView === 'sync') {
    const isConfigured = sync?.isConfigured

    return (
      <div className="space-y-6">
        <button
          onClick={() => setSubView(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('common.back')}
        </button>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('sync.description')}</p>

          {/* WebDAV URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.serverUrl')}</label>
            <Input
              type="url"
              placeholder="https://dav.jianguoyun.com/dav/"
              value={syncUrl}
              onChange={(e) => setSyncUrl(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">{t('sync.serverUrlHint')}</p>
          </div>

          {/* 用户名 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.username')}</label>
            <Input
              type="text"
              placeholder={t('sync.usernamePlaceholder')}
              value={syncUsername}
              onChange={(e) => setSyncUsername(e.target.value)}
              disabled={isConfigured}
            />
          </div>

          {/* 密码 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('sync.password')}</label>
            <Input
              type="password"
              placeholder={t('sync.passwordPlaceholder')}
              value={syncPassword}
              onChange={(e) => setSyncPassword(e.target.value)}
              disabled={isConfigured}
            />
            <p className="text-xs text-muted-foreground">{t('sync.passwordHint')}</p>
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
                <Button variant="outline" className="flex-1" onClick={handleSyncDisconnect}>
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
                  onClick={handleSyncTest}
                  disabled={!canSaveSync || testing}
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
                  onClick={handleSyncSave}
                  disabled={!canSaveSync || testResult !== 'success'}
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
      </div>
    )
  }

  // ============================================================
  // 主视图
  // ============================================================
  return (
    <div className="space-y-6">
      {/* 数据目录（仅桌面端） */}
      {supportsRealFileSystem() && (
        <SettingGroup title={t('settings.storage')}>
          <SettingItem
            label={t('folder.title')}
            description={fileSystem?.config?.basePath || '~/GTD'}
            icon={Folder}
            onClick={() => setSubView('folder')}
            chevron
          />
        </SettingGroup>
      )}

      {/* 云同步 */}
      {sync && (
        <SettingGroup title={t('sync.title')}>
          <SettingItem
            label={t('sync.webdav')}
            description={
              sync.isConfigured
                ? sync.status === 'syncing'
                  ? t('sync.syncing')
                  : t('sync.connected')
                : t('sync.notConfigured')
            }
            icon={sync.isConfigured ? Cloud : CloudOff}
            onClick={() => setSubView('sync')}
            chevron
          />
        </SettingGroup>
      )}

      {/* 导入导出 */}
      <SettingGroup title={t('common.dataSync')}>
        <SettingItem label={t('common.export')} icon={Download}>
          <Button variant="outline" size="sm" onClick={onExport}>
            {t('common.export')}
          </Button>
        </SettingItem>
        <SettingItem label={t('common.import')} icon={Upload}>
          <Button variant="outline" size="sm" onClick={onImport}>
            {t('common.import')}
          </Button>
        </SettingItem>
      </SettingGroup>
    </div>
  )
}
