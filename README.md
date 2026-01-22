# GTD 时间项目管理

基于 GTD (Getting Things Done) 方法论的时间和项目管理工具,支持 Web 和桌面端。

## 技术栈

- **前端**: Vite 7 + React 19 + TailwindCSS v4 + shadcn/ui + Framer Motion
- **桌面端**: Tauri 2.0 + Rust
- **状态管理**: React Hooks + localStorage
- **UI 组件**: Radix UI + shadcn/ui

## 核心功能

### GTD 五大列表

- **未了 (Tasks)**: 所有未完成任务的总览
- **今朝 (Today)**: 今天截止的任务，活在当下
- **来日 (Next)**: 未来日期的任务，来日方长
- **搁置 (Someday)**: 无明确计划的任务，暂缓但不放弃
- **了结 (Done)**: 已完成的任务，功德圆满

### 视图模式

- **事务 (Things)**: 按 GTD 列表分类展示任务
- **日程 (Schedule)**: 月视图/周视图切换，拖拽设置任务日期
- **笔记面板**: 右侧滑入式笔记编辑，衬线字体优雅体验

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
- **macOS**: `src-tauri/target/release/bundle/dmg/Flowy_0.1.0_aarch64.dmg` (Apple Silicon)
- **macOS**: `src-tauri/target/release/bundle/dmg/Flowy_0.1.0_x64.dmg` (Intel)
- **macOS**: `src-tauri/target/release/bundle/macos/Flowy.app` (原始应用包)
- **Windows**: `src-tauri/target/release/bundle/msi/Flowy_0.1.0_x64.msi`
- **Linux**: `src-tauri/target/release/bundle/appimage/flowy_0.1.0_amd64.AppImage`

## 分发应用

### macOS 分发

**方式一：分发 .dmg（推荐）**
```bash
# 构建后直接分发 dmg 文件
# Apple Silicon Mac: Flowy_0.1.0_aarch64.dmg
# Intel Mac: Flowy_0.1.0_x64.dmg
```

用户双击 .dmg 文件，拖拽到 Applications 文件夹即可安装。

**方式二：分发 .app**
```bash
# 压缩应用包
cd src-tauri/target/release/bundle/macos
zip -r Flowy.zip Flowy.app
```

用户解压后拖到 Applications 文件夹。

### 首次运行问题

用户首次打开可能遇到"无法打开，因为无法验证开发者"提示：

**解决方法 1**（推荐）：
```bash
# 用户在终端执行（替换为实际路径）
xattr -cr /Applications/Flowy.app
```

**解决方法 2**：
右键点击应用 → 选择"打开" → 点击"打开"按钮确认

### 代码签名（可选）

如果需要避免上述安全提示，需要 Apple Developer 账号（$99/年）进行代码签名：

1. **配置签名**

在 `src-tauri/tauri.conf.json` 的 `bundle.macOS` 中添加：
```json
{
  "bundle": {
    "macOS": {
      "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)",
      "minimumSystemVersion": "10.13"
    }
  }
}
```

2. **公证应用**
```bash
# 构建后执行公证
xcrun notarytool submit src-tauri/target/release/bundle/dmg/Flowy_0.1.0_aarch64.dmg \
  --apple-id your@email.com \
  --team-id TEAM_ID \
  --password app-specific-password \
  --wait

# 装订公证票据
xcrun stapler staple src-tauri/target/release/bundle/dmg/Flowy_0.1.0_aarch64.dmg
```

**注意**：个人分发或小范围使用无需签名，直接使用 `xattr -cr` 命令即可。

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
