# lib/
> L2 | 父级: src/CLAUDE.md

## 成员清单

utils.js: 通用工具函数，cn() 类名合并
motion.js: Framer Motion 动画预设，snappy 弹性动画配置
platform.js: 跨平台 API 封装（Tauri 桌面端 + Capacitor 移动端），统一通知、导出、导入功能
haptics.js: 触觉反馈封装，移动端操作反馈（轻/中/重冲击，成功/警告/错误通知）
tauri.js: (已废弃，使用 platform.js 替代) Tauri 桌面端 API 封装
i18n.js: i18next 国际化配置，语言切换与持久化

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
