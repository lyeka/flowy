# GTD 时间项目管理 (跨平台版)
Tauri 2.0 (桌面端) + Capacitor 8.0 (移动端) + Vite 7 + React 19 + TailwindCSS v4 + shadcn/ui + GSAP + react-i18next

<directory>
src/
├── components/
│   ├── ui/          - shadcn 组件库
│   └── gtd/         - GTD 业务组件 (28文件: QuickCapture, Sidebar, Settings, SyncSettings, ConflictDialog, FolderPicker, TaskItem, TaskList, CalendarView, CalendarGrid, CalendarCell, CalendarTaskChip, UnscheduledPanel, NotesPanel, Drawer, ActionSheet, JournalNowView, JournalPastView, JournalItem, JournalChip, AIPromptCard, AISettings, FocusView, FocusGreeting, FocusRecommendCard, FocusTaskItem, FocusOverdueCard, FocusEmptyState)
├── stores/          - 状态管理 (5文件: gtd.js, calendar.js, journal.js, ai.js, editor.js)
├── hooks/           - React Hooks (2文件: useFileSystem.js, useSync.js)
├── lib/             - 工具函数 (6文件: utils.js, motion.js, platform.js, haptics.js, tauri.js(废弃), i18n.js)
│   ├── ai/          - AI 功能模块 (3文件: crypto.js, prompts.js, openai.js)
│   ├── fs/          - 文件系统抽象层 (5文件: adapter.js, tauri.js, capacitor.js, web.js, index.js)
│   ├── format/      - 数据格式处理 (3文件: task.js, journal.js, index.js)
│   └── sync/        - 云同步功能 (3文件: conflict.js, webdav.js, index.js)
├── locales/         - 国际化翻译文件 (2文件: zh-CN.json, en-US.json)
├── App.jsx          - 应用入口，支持专注/列表/日历/日记视图切换，集成跨平台功能
├── main.jsx         - React 挂载点，初始化 i18n
└── index.css        - 全局样式 + CSS 变量

src-tauri/
├── src/
│   └── main.rs      - Rust 主程序，系统托盘、全局快捷键、通知、文件操作（桌面端）
├── Cargo.toml       - Rust 依赖配置
├── tauri.conf.json  - Tauri 配置
└── build.rs         - 构建脚本

android/             - Capacitor Android 原生项目
ios/                 - Capacitor iOS 原生项目
</directory>

<config>
vite.config.js      - Vite 配置 + TailwindCSS 插件 + 路径别名 + base: './' (Capacitor 需要)
jsconfig.json       - 路径别名配置 (@/ -> src/)
components.json     - shadcn/ui 配置
capacitor.config.ts - Capacitor 配置（移动端）
package.json        - 包含 tauri:dev/tauri:build (桌面端) 和 cap:android/cap:ios (移动端) 命令
</config>

## GTD 核心功能

- 收集箱 (Inbox): 快速捕获想法
- 今日待办 (Today): 当天必须完成
- 下一步行动 (Next): 已明确的下一步
- 将来/也许 (Someday): 暂时搁置
- 已完成 (Done): 归档

## 专注视图 (Focus View)

- **设计哲学**：专注是一种"主动选择"，而非"被动提醒"
- **视觉风格**：柔性宇宙插画，SVG filter 手绘行星 + 椭圆轨道带 + GSAP 动画
- **轨道带**：多条同心椭圆（像土星环），深蓝紫色，-15度倾斜
- **手绘行星**：SVG feTurbulence + feDisplacementMap 实现不规则边缘，玻璃球高光
- **独立视图**：与列表/日历/日记并列，作为侧边栏第一个入口
- **时间感知问候**：根据早中晚显示不同问候语 + 今日任务数量
- **星标功能**：任务可标记星标，星标任务优先显示在主角位置（中间大行星）
- **星球筛选**：只显示有截止日期且为今天或过期的任务，最多 6 个
- **排序规则**：星标优先 → 过期优先 → 创建时间
- **溢出任务**：超过 6 个任务时，底部折叠卡片显示剩余任务
- **过期任务处理**：折叠卡片显示过期任务，支持快速操作（今天/明天/删除）
- **空状态引导**：无任务时引导用户去收集箱选择

## 日历视图

- 月视图/周视图切换
- 拖拽任务设置日期
- 无日期任务面板
- 点击日期快速添加任务
- 日记显示：日历格子内显示当天日记（虚线边框区分）

## 日记功能

- **此刻**：自动打开今日日记编辑，全屏 NotesPanel
- **过往**：历史日记列表，点击编辑
- **一天一记**：每天只能有一篇日记，通过 ID 格式 `journal-YYYY-MM-DD` 确保
- **日历集成**：日记在日历格子内显示，虚线边框与任务区分
- **数据分离**：日记与任务数据独立存储，不混淆语义
- **默认标题**：`HH:mm · 小记`（如 "14:32 · 小记"）
- **AI 助手**：根据用户指导方向、任务情况和历史日记，智能生成个性化引导问题

## AI 功能

- **智能问题生成**：根据用户指导方向、任务完成情况和历史日记，动态生成个性化引导问题
- **任务推荐**：分析任务紧急性、重要性、可行性，推荐最应该优先处理的任务
- **用户指导方向**：用户输入指导性提示词（如"我想探讨人生的哲理和意义"），AI 据此生成问题
- **上下文感知**：结合今日任务、最近日记、时间上下文（周几、早中晚）生成问题
- **优雅交互**：问题卡片轻量非侵入，点击插入、悬停删除、支持刷新
- **隐私优先**：用户自己配置 OpenAI API Key，加密存储在本地
- **完全可选**：默认关闭，用户完全控制
- **优雅降级**：API 失败时使用通用开放式问题或本地排序

## 跨平台特性

### 桌面端 (Tauri)
- 全局快捷键: Cmd+Shift+Space (macOS) / Ctrl+Shift+Space (Windows/Linux) 快速显示/隐藏窗口
- 系统托盘: 最小化到托盘
- 桌面通知: 任务完成时显示系统通知
- 数据导出: 导出任务为 JSON/Markdown 文件
- 数据导入: 从 JSON 文件导入任务
- 离线可用: 完全本地化，无需网络

### 移动端 (Capacitor)
- 本地通知: 任务完成时显示移动端通知
- 数据导出: 通过分享面板导出数据
- 数据导入: 通过文件选择器导入数据
- 触觉反馈: 任务操作时的震动反馈
- 响应式布局: 适配小屏幕设备
- 离线可用: 完全本地化，无需网络

## 云同步

- **文件优先**：所有数据存储为本地文件（JSON/Markdown），用户可用任何工具打开、编辑、备份
- **WebDAV 同步**：支持坚果云等 WebDAV 服务，实现多设备同步
- **iCloud 同步**：苹果生态可通过 iCloud Drive 自动同步
- **冲突处理**：智能合并 + 手动选择，支持保留两个版本
- **文件结构**：
  ```
  ~/GTD/
  ├── .gtd/           # 应用配置
  ├── tasks/          # 任务数据 (JSON)
  │   ├── inbox.json
  │   ├── today.json
  │   └── done/       # 按月归档
  └── journals/       # 日记数据 (Markdown)
      └── 2026/01/
  ```

## 国际化

- 支持中英文切换
- 语言偏好持久化到 localStorage
- 所有界面文本支持翻译
- 设置界面提供语言选择器

## 启动

```bash
# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev

# Tauri 桌面构建
npm run tauri:build

# Capacitor 移动端构建
npm run mobile:build

# Capacitor Android 运行
npm run cap:android

# Capacitor iOS 运行
npm run cap:ios

# 打开原生 IDE
npm run cap:open:android  # Android Studio
npm run cap:open:ios      # Xcode
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
