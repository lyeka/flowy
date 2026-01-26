# format/
> L2 | 父级: src/lib/CLAUDE.md

## 成员清单

task.js: 任务 JSON 格式处理，序列化/反序列化/合并，版本迁移预留
journal.js: 日记 Markdown 格式处理，Frontmatter 解析，路径生成
index.js: 统一导出

## 文件格式

### 任务文件 (JSON)
```json
{
  "version": 1,
  "updatedAt": 1706000000000,
  "tasks": [{ "id", "title", "completed", "createdAt", "completedAt", "dueDate", "notes" }]
}
```

### 日记文件 (Markdown + Frontmatter)
```markdown
---
id: journal-2026-01-25
date: 2026-01-25
title: 2026.01.25
createdAt: 1706000000000
updatedAt: 1706000000000
---

正文内容...
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
