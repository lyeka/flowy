# stores/
> L2 | 父级: src/CLAUDE.md

## 成员清单

gtd.js: GTD 核心状态管理，任务 CRUD + 列表筛选 + 持久化 + calculateFocusState 专注度计算 + isToday/isPast/isFuture 日期工具 + 星标功能(toggleStar) + 星球任务筛选(planetTasks/overflowTasks) + 项目归属(projectId/columnId)
calendar.js: 日历状态管理，日期分组 + 网格生成 + 导航
journal.js: 日记状态管理，一天一记约束 + 按日期分组 + 时间倒序
ai.js: AI 配置和状态管理，OpenAI API 集成 + 问题生成逻辑（支持流式输出回调）+ 任务推荐逻辑 + API Key 加密存储
editor.js: 编辑器样式配置管理，预设主题（默认/极简/舒适）+ 自定义样式（bullet/标题大小/行高/字号/宽度/边框/字重）+ CSS 变量应用
project.js: 项目状态管理，项目 CRUD + 列管理 + 持久化，支持文件系统和 localStorage 降级，移除 PROJECT_COLORS 常量，统一使用系统主题色

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
