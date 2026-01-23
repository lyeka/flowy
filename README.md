# GTD 时间项目管理

基于 GTD (Getting Things Done) 方法论的跨平台时间和项目管理工具，支持 Web、桌面端和移动端。

## 技术栈

### 前端核心
- **框架**: React 19 + Vite 7
- **样式**: TailwindCSS v4 + shadcn/ui
- **动画**: Framer Motion
- **状态管理**: Zustand + localStorage
- **国际化**: react-i18next (中文/英文)

### 桌面端
- **运行时**: Tauri 2.0
- **后端**: Rust
- **特性**: 全局快捷键、系统托盘、原生通知

### 移动端
- **运行时**: Capacitor 7.x
- **平台**: iOS 16+ / Android 8+
- **特性**: 触觉反馈、本地通知、文件分享

### 代码复用率
- **跨平台共享**: 95%+ 代码复用
- **平台特定**: 仅 5% 平台适配代码

## 核心功能

### GTD 五大列表

- **收集箱 (Inbox)**: 快速捕获所有想法和任务
- **今日待办 (Today)**: 当天必须完成的任务
- **下一步行动 (Next)**: 已明确的下一步行动
- **将来/也许 (Someday)**: 暂时搁置的想法
- **已完成 (Done)**: 归档的完成任务

### 视图模式

- **列表视图 (List)**: 按 GTD 列表分类展示任务
- **日历视图 (Calendar)**: 月视图/周视图切换，拖拽设置任务日期
- **笔记面板 (Notes)**: 右侧滑入式笔记编辑，衬线字体优雅体验

### 桌面端特性 (Tauri)

- ✅ **全局快捷键**: `Cmd+Shift+Space` (macOS) / `Ctrl+Shift+Space` (Windows/Linux)
- ✅ **系统托盘**: 最小化到托盘，快速访问
- ✅ **桌面通知**: 任务完成时显示系统原生通知
- ✅ **文件对话框**: 原生文件选择器导入导出数据
- ✅ **离线可用**: 完全本地化，无需网络连接

### 移动端特性 (Capacitor)

- ✅ **底部导航**: 移动端友好的导航栏设计
- ✅ **触觉反馈**: 任务操作时的震动反馈
- ✅ **本地通知**: 任务完成时的移动端通知
- ✅ **分享面板**: 通过系统分享面板导出数据
- ✅ **响应式布局**: 适配各种屏幕尺寸
- ✅ **状态栏适配**: 深色模式和颜色配置
- ✅ **键盘优化**: 自动处理键盘弹出

## 环境要求

### 通用要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 桌面端开发
- Rust >= 1.70.0
- Tauri CLI

### 移动端开发

**iOS 开发**:
- macOS (必需)
- Xcode 15.0+
- CocoaPods
- iOS 模拟器或真机

**Android 开发**:
- Android Studio
- Android SDK (API 26+)
- Java JDK 17+
- Android 模拟器或真机

## 安装

```bash
# 克隆项目
git clone <repository-url>
cd skill-gtd

# 安装依赖
npm install

# (可选) 安装 CocoaPods (iOS 开发需要)
sudo gem install cocoapods
```

### 环境检查

运行环境验证脚本，检查所有依赖是否正确安装：

```bash
./check-env.sh
```

该脚本会检查：
- Node.js 版本 (需要 >= 18.0.0)
- Rust 版本 (桌面端需要 >= 1.70.0)
- 项目依赖安装状态

## 开发

### Web 开发

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 桌面端开发

```bash
# 启动 Tauri 开发模式
npm run tauri:dev

# 应用会自动打开，支持热重载
```

### 移动端开发

#### iOS 开发

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 iOS
npx cap sync ios

# 3. 在 Xcode 中打开项目
npx cap open ios

# 4. 在 Xcode 中选择模拟器并运行 (Cmd+R)
```

**或者使用命令行直接运行**:
```bash
# 构建并运行到 iOS 模拟器
npm run mobile:build
npx cap run ios
```

#### Android 开发

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 在 Android Studio 中打开项目
npx cap open android

# 4. 在 Android Studio 中选择模拟器并运行
```

**或者使用命令行直接运行**:
```bash
# 构建并运行到 Android 模拟器
npm run mobile:build
npx cap run android
```

### 开发命令汇总

```bash
# Web 开发
npm run dev              # 启动 Vite 开发服务器
npm run build            # 构建 Web 应用
npm run preview          # 预览构建产物

# 桌面端开发
npm run tauri:dev        # Tauri 开发模式
npm run tauri:build      # 构建桌面应用

# 移动端开发
npm run mobile:build     # 构建并同步到移动端
npm run cap:sync         # 同步 Web 资源到移动端
npm run cap:ios          # 运行 iOS 应用
npm run cap:android      # 运行 Android 应用
npm run cap:open:ios     # 在 Xcode 中打开
npm run cap:open:android # 在 Android Studio 中打开
```

## 构建

### Web 构建

```bash
npm run build
```

构建产物位于 `dist/` 目录，可部署到任何静态文件服务器。

### 桌面端构建

```bash
npm run tauri:build
```

构建产物位置：
- **macOS**:
  - `src-tauri/target/release/bundle/dmg/Flowy_0.1.0_aarch64.dmg` (Apple Silicon)
  - `src-tauri/target/release/bundle/dmg/Flowy_0.1.0_x64.dmg` (Intel)
  - `src-tauri/target/release/bundle/macos/Flowy.app` (原始应用包)
- **Windows**:
  - `src-tauri/target/release/bundle/msi/Flowy_0.1.0_x64.msi`
- **Linux**:
  - `src-tauri/target/release/bundle/appimage/flowy_0.1.0_amd64.AppImage`

### 移动端构建

#### iOS 构建

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 iOS
npx cap sync ios

# 3. 在 Xcode 中打开
npx cap open ios

# 4. 在 Xcode 中:
#    - 选择 "Any iOS Device" 或连接的真机
#    - Product > Archive
#    - 上传到 App Store Connect 或导出 IPA
```

#### Android 构建

```bash
# 1. 构建 Web 资源
npm run build

# 2. 同步到 Android
npx cap sync android

# 3. 在 Android Studio 中打开
npx cap open android

# 4. 在 Android Studio 中:
#    - Build > Generate Signed Bundle / APK
#    - 选择 APK 或 AAB
#    - 配置签名密钥
#    - 构建 Release 版本
```

## 部署

### Web 部署

将 `dist/` 目录部署到任何静态文件服务器：

```bash
# 示例：部署到 Vercel
vercel deploy

# 示例：部署到 Netlify
netlify deploy --prod --dir=dist

# 示例：部署到 GitHub Pages
npm run build
# 将 dist/ 内容推送到 gh-pages 分支
```

### 桌面端分发

#### macOS 分发

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

#### 首次运行问题

用户首次打开可能遇到"无法打开，因为无法验证开发者"提示：

**解决方法 1**（推荐）：
```bash
# 用户在终端执行（替换为实际路径）
xattr -cr /Applications/Flowy.app
```

**解决方法 2**：
右键点击应用 → 选择"打开" → 点击"打开"按钮确认

#### 代码签名（可选）

如果需要避免上述安全提示，需要 Apple Developer 账号（$99/年）进行代码签名。

**注意**：个人分发或小范围使用无需签名，直接使用 `xattr -cr` 命令即可。

### 移动端发布

#### iOS 发布到 App Store

1. **准备工作**
   - 注册 Apple Developer 账号（$99/年）
   - 在 App Store Connect 创建应用
   - 配置应用图标和启动屏幕

2. **构建和上传**
   ```bash
   # 在 Xcode 中
   # Product > Archive
   # Window > Organizer
   # 选择 Archive > Distribute App > App Store Connect
   ```

3. **提交审核**
   - 在 App Store Connect 填写应用信息
   - 提交审核（通常 1-3 天）

#### Android 发布到 Google Play

1. **准备工作**
   - 注册 Google Play Developer 账号（$25 一次性）
   - 在 Google Play Console 创建应用
   - 配置应用图标和截图

2. **生成签名密钥**
   ```bash
   keytool -genkey -v -keystore my-release-key.keystore \
     -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

3. **构建 Release 版本**
   - 在 Android Studio 中 Build > Generate Signed Bundle / APK
   - 选择 AAB (推荐) 或 APK
   - 上传到 Google Play Console

4. **提交审核**
   - 填写应用信息和内容分级
   - 提交审核（通常几小时）

## 项目结构

```
skill-gtd/
├── src/                          # 前端源码（跨平台共享）
│   ├── components/
│   │   ├── ui/                   # shadcn 组件库
│   │   └── gtd/                  # GTD 业务组件
│   ├── stores/                   # Zustand 状态管理
│   ├── lib/
│   │   ├── platform.js           # 跨平台 API 封装
│   │   ├── haptics.js            # 触觉反馈
│   │   ├── utils.js              # 工具函数
│   │   └── i18n.js               # 国际化配置
│   ├── locales/                  # 翻译文件
│   ├── App.jsx                   # 应用入口
│   └── main.jsx                  # React 挂载点
│
├── src-tauri/                    # Tauri 桌面端
│   ├── src/main.rs               # Rust 主程序
│   ├── Cargo.toml                # Rust 依赖
│   └── tauri.conf.json           # Tauri 配置
│
├── ios/                          # iOS 原生项目
│   └── App/
│       ├── App.xcodeproj         # Xcode 项目
│       ├── App.xcworkspace       # Xcode 工作空间
│       ├── Podfile               # CocoaPods 依赖
│       └── App/                  # 应用资源
│
├── android/                      # Android 原生项目
│   ├── app/
│   │   ├── build.gradle          # 应用构建配置
│   │   └── src/main/             # 应用源码和资源
│   └── build.gradle              # 项目构建配置
│
├── capacitor.config.ts           # Capacitor 配置
├── vite.config.js                # Vite 配置
├── package.json                  # 项目依赖
└── CLAUDE.md                     # 项目架构文档
```

## 数据存储

- **Web 版**: localStorage
- **桌面版**: 本地文件系统 (通过 localStorage API)
- **移动端**: 本地存储 (通过 Capacitor Storage API)

所有数据完全本地化，无需服务器，保护隐私。

## 国际化

应用支持中英文切换：
- 中文 (zh-CN)
- English (en-US)

语言偏好自动保存到本地存储。

## 常见问题

### Q: 为什么选择 Tauri 而不是 Electron？
A: Tauri 使用系统原生 WebView，应用体积更小（~600KB vs ~100MB），内存占用更低，性能更好。

### Q: 为什么选择 Capacitor 而不是 React Native？
A: Capacitor 允许 95%+ 的代码复用，开发效率更高。对于内容型应用，WebView 性能完全够用。

### Q: 移动端性能如何？
A: 基于 WebView 的性能对于 GTD 应用完全够用。我们使用了 Framer Motion 优化动画，触觉反馈提升体验。

### Q: 数据如何同步？
A: 当前版本数据完全本地化。未来可以考虑添加云同步功能（可选）。

### Q: 支持哪些平台？
A:
- Web: 所有现代浏览器
- 桌面: macOS 10.13+, Windows 10+, Linux
- 移动: iOS 16+, Android 8+

## 开发路线图

- [x] 桌面端支持 (Tauri)
- [x] 移动端支持 (Capacitor)
- [x] 响应式 UI
- [x] 触觉反馈
- [x] 国际化 (中英文)
- [ ] 云同步 (可选)
- [ ] Widget 支持
- [ ] Apple Watch / Wear OS
- [ ] 数据分析和统计

## 贡献

欢迎提交 Issue 和 Pull Request！

## License

MIT

## 致谢

- [Tauri](https://tauri.app/) - 桌面端运行时
- [Capacitor](https://capacitorjs.com/) - 移动端运行时
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Framer Motion](https://www.framer.com/motion/) - 动画库
