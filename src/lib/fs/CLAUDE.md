# fs/
> L2 | 父级: src/lib/CLAUDE.md

## 成员清单

adapter.js: 文件系统适配器抽象类，定义统一接口（read/write/exists/delete/list/ensureDir/stat/move/copy）
tauri.js: Tauri 桌面端实现，使用 @tauri-apps/plugin-fs，支持 ~ 路径解析
capacitor.js: Capacitor 移动端实现，使用 @capacitor/filesystem，默认 Documents 目录
web.js: Web 端降级实现，使用 IndexedDB 模拟文件系统，支持 ZIP 导入导出
index.js: 统一入口，getFileSystem 工厂函数根据平台自动选择实现

## 架构设计

```
业务层 (React/JS)
      ↓
FileSystemAdapter 接口
      ↓
┌─────────┬─────────┬─────────┐
│ TauriFS │CapacitorFS│ WebFS │
└─────────┴─────────┴─────────┘
      ↓         ↓         ↓
  真实文件系统    IndexedDB
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
