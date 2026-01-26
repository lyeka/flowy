# lib/
> L2 | 父级: src/CLAUDE.md

## 成员清单

utils.js: 通用工具函数，cn() 类名合并
motion.js: Framer Motion 动画预设，snappy 弹性动画配置
platform.js: 跨平台 API 封装（Tauri 桌面端 + Capacitor 移动端），统一通知、导出、导入功能
haptics.js: 触觉反馈封装，移动端操作反馈（轻/中/重冲击，成功/警告/错误通知）
tauri.js: (已废弃，使用 platform.js 替代) Tauri 桌面端 API 封装
i18n.js: i18next 国际化配置，语言切换与持久化

## 子目录

fs/: 文件系统抽象层，统一 Tauri/Capacitor/Web 三端文件操作
format/: 数据格式处理，任务 JSON + 日记 Markdown 序列化
sync/: 云同步功能，WebDAV 同步 + 冲突检测与解决
ai/: AI 功能模块，OpenAI API 集成 + 问题生成

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
