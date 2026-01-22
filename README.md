# GTD 时间项目管理

基于 GTD (Getting Things Done) 方法论的时间和项目管理工具,支持 Web 和桌面端。

## 技术栈

- **前端**: Vite 7 + React 19 + TailwindCSS v4 + shadcn/ui + Framer Motion
- **桌面端**: Tauri 2.0 + Rust
- **状态管理**: React Hooks + localStorage
- **UI 组件**: Radix UI + shadcn/ui

## 核心功能

### GTD 五大列表

- **收集箱 (Inbox)**: 快速捕获想法和任务
- **今日待办 (Today)**: 当天必须完成的任务
- **下一步行动 (Next)**: 已明确的下一步行动
- **将来/也许 (Someday)**: 暂时搁置的想法
- **已完成 (Done)**: 已完成任务归档

### 视图模式

- **列表视图**: 按 GTD 列表分类展示任务
- **日历视图**: 月视图/周视图切换,拖拽设置任务日期
- **笔记面板**: 右侧滑入式笔记编辑,衬线字体优雅体验

### 桌面端特性 (Tauri)

- **全局快捷键**: `Cmd+Shift+Space` (macOS) / `Ctrl+Shift+Space` (Windows/Linux) 快速显示/隐藏窗口
- **桌面通知**: 任务完成时显示系统原生通知
- **数据导出**: 导出任务为 JSON/Markdown 文件
- **数据导入**: 从 JSON 文件导入任务
- **离线可用**: 完全本地化,无需网络连接

## 安装

```bash
npm install
```

### 环境检查

运行环境验证脚本,检查所有依赖是否正确安装:

```bash
./check-env.sh
```

该脚本会检查:
- Node.js 版本 (需要 >= 18.0.0)
- Rust 版本 (桌面端需要 >= 1.70.0)
- 项目依赖安装状态

## 开发

```bash
# Web 开发模式
npm run dev

# Tauri 桌面开发模式
npm run tauri:dev
```

## 构建

```bash
# Web 构建
npm run build

# 桌面应用构建 (macOS/Windows/Linux)
npm run tauri:build
```

构建产物:
- **macOS**: `src-tauri/target/release/bundle/macos/GTD Manager.app` (~8MB)
- **Windows**: `src-tauri/target/release/bundle/msi/GTD Manager.msi` (~10MB)
- **Linux**: `src-tauri/target/release/bundle/appimage/gtd-manager.AppImage` (~12MB)

## 项目结构

```
src/
├── components/
│   ├── ui/          # shadcn 组件库
│   └── gtd/         # GTD 业务组件
├── stores/          # 状态管理
├── lib/             # 工具函数
└── App.jsx          # 应用入口

src-tauri/
├── src/main.rs      # Rust 主程序
├── Cargo.toml       # Rust 依赖
└── tauri.conf.json  # Tauri 配置
```

## 数据存储

- **Web 版**: localStorage
- **桌面版**: 本地文件系统 (通过 localStorage API)

所有数据完全本地化,无需服务器,保护隐私。

## License

MIT
