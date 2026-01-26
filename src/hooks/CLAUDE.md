# hooks/
> L2 | 父级: src/CLAUDE.md

## 成员清单

useFileSystem.js: 文件系统 Hook，初始化 + 防抖写入 + localStorage 迁移 + 配置管理
useSync.js: 同步 Hook，WebDAV 配置 + 同步状态 + 冲突检测 + 交互式冲突解决

## 使用示例

```jsx
import { useFileSystem } from '@/hooks/useFileSystem'
import { useSync } from '@/hooks/useSync'

function App() {
  const fileSystem = useFileSystem()
  const sync = useSync(fileSystem)

  // 文件系统就绪后使用
  if (fileSystem.isReady) {
    // 读写文件
    const content = await fileSystem.read('tasks/inbox.json')
    fileSystem.write('tasks/inbox.json', newContent) // 防抖写入
  }

  // 配置同步
  sync.configureWebDAV({ url, username, password })

  // 执行同步（自动检测冲突）
  const result = await sync.sync()

  // 如果有冲突，sync.status === 'conflict'
  // 用户选择策略后调用 resolveConflicts
  if (sync.status === 'conflict') {
    await sync.resolveConflicts('merge') // 或 'local-wins', 'remote-wins', 'keep-both'
  }
}
```

## 同步状态流转

```
idle → syncing → success
              → conflict → (用户选择) → syncing → success
              → error
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
