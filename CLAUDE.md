# GTD 时间项目管理 (桌面版)
Tauri 2.0 + Vite 7 + React 19 + TailwindCSS v4 + shadcn/ui + Framer Motion

<directory>
src/
├── components/
│   ├── ui/          - shadcn 组件库
│   └── gtd/         - GTD 业务组件 (10文件: QuickCapture, Sidebar, TaskItem, TaskList, CalendarView, CalendarGrid, CalendarCell, CalendarTaskChip, UnscheduledPanel, NotesPanel)
├── stores/          - 状态管理 (2文件: gtd.js, calendar.js)
├── lib/             - 工具函数 (3文件: utils.js, motion.js, tauri.js)
├── App.jsx          - 应用入口，支持列表/日历视图切换，集成桌面端功能
├── main.jsx         - React 挂载点
└── index.css        - 全局样式 + CSS 变量

src-tauri/
├── src/
│   └── main.rs      - Rust 主程序，系统托盘、全局快捷键、通知、文件操作
├── Cargo.toml       - Rust 依赖配置
├── tauri.conf.json  - Tauri 配置
└── build.rs         - 构建脚本
</directory>

<config>
vite.config.js   - Vite 配置 + TailwindCSS 插件 + 路径别名
jsconfig.json    - 路径别名配置 (@/ -> src/)
components.json  - shadcn/ui 配置
package.json     - 包含 tauri:dev 和 tauri:build 命令
</config>

## GTD 核心功能

- 收集箱 (Inbox): 快速捕获想法
- 今日待办 (Today): 当天必须完成
- 下一步行动 (Next): 已明确的下一步
- 将来/也许 (Someday): 暂时搁置
- 已完成 (Done): 归档

## 日历视图

- 月视图/周视图切换
- 拖拽任务设置日期
- 无日期任务面板
- 点击日期快速添加任务

## 桌面端特性

- 全局快捷键: Cmd+Shift+Space (macOS) / Ctrl+Shift+Space (Windows/Linux) 快速显示/隐藏窗口
- 桌面通知: 任务完成时显示系统通知
- 数据导出: 导出任务为 JSON/Markdown 文件
- 数据导入: 从 JSON 文件导入任务
- 离线可用: 完全本地化，无需网络

## 启动

```bash
# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev

# 构建桌面应用
npm run tauri:build
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
