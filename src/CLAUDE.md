# src/
> L2 | 父级: CLAUDE.md

## 成员清单

App.jsx: 应用入口，视图切换（列表/日历/日记）+ 跨平台功能集成
main.jsx: React 挂载点，i18n 初始化
index.css: 全局样式 + CSS 变量

## 子目录

components/: UI 组件（ui/ shadcn 组件库 + gtd/ 业务组件）
stores/: 状态管理（gtd.js, calendar.js, journal.js, ai.js）
hooks/: React Hooks（useFileSystem.js, useSync.js）
lib/: 工具函数 + 子模块（ai/, fs/, format/, sync/）
locales/: 国际化翻译文件

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
