# sync/
> L2 | 父级: src/lib/CLAUDE.md

## 成员清单

conflict.js: 冲突检测与解决逻辑，支持 keep-both/local-wins/remote-wins/merge 策略
webdav.js: WebDAV 同步实现，支持坚果云等服务，双向同步 + 冲突预检测 + 策略化解决
index.js: 统一导出

## 同步流程

```
1. 收集本地文件列表
2. 收集远程文件列表
3. 检测冲突（detectConflicts）
   - 如果有冲突 → 返回冲突列表，等待用户选择策略
4. 执行同步（sync）
   - 只有本地 → 上传
   - 只有远程 → 下载
   - 两边都有 → 比较修改时间
     - 本地更新 → 上传
     - 远程更新 → 下载
     - 都更新 → 使用用户选择的策略解决
5. 更新同步时间戳
```

## 冲突解决策略

- merge: 尝试合并（仅 JSON 文件，推荐）
- local-wins: 保留本地，覆盖远程
- remote-wins: 保留远程，覆盖本地
- keep-both: 保留两个版本，创建冲突副本

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
