# gtd/
> L2 | 父级: src/components/CLAUDE.md

## 成员清单

QuickCapture.jsx: 快速收集输入框，顶部任务添加入口
Sidebar.jsx: 侧边栏导航，GTD 五大列表切换 + 专注/列表/看板/日历视图切换 + 日记分组（此刻/过往）+ 设置入口 + 项目列表（看板模式下显示），移动端简化为 3 按钮底部导航（Menu、FAB、日历）
Drawer.jsx: 移动端左侧滑抽屉，显示 GTD 五大列表 + 日记分组 + 设置入口，替代底部导航的列表切换功能
ActionSheet.jsx: 移动端底部操作表，显示任务操作选项（设置日期、移动到列表、删除），替代桌面端的下拉菜单
ConflictDialog.jsx: 同步冲突解决对话框，展示冲突详情 + 策略选择（合并/本地/远程/保留两者）
TaskItem.jsx: 单任务项，支持完成/移动/删除/日期设置/星标切换，移动端支持滑动手势（右滑完成、左滑删除）和长按菜单，行高 64px，Checkbox 24px
TaskList.jsx: 任务列表容器，处理空状态和序列动画
CalendarView.jsx: 日历视图容器，组装 Header + Grid + UnscheduledPanel，移动端简化 Header，隐藏 UnscheduledPanel，支持日记显示
CalendarGrid.jsx: 日历网格渲染，星期标题 + 日期矩阵，固定 5-6 行一屏显示，自适应行高
CalendarCell.jsx: 单日格子，显示日期、日记和任务，支持拖放，移动端减小尺寸（min-h-20，日期 text-xs）
CalendarTaskChip.jsx: 日历内任务小卡片，可拖拽，实线边框
UnscheduledPanel.jsx: 无日期任务面板，可折叠，支持拖拽到日历
NotesPanel.jsx: 任务/日记编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，移动端减少留白（px-6 py-8），支持 type='task'|'journal' 双模式，集成 AI 问题卡片
JournalNowView.jsx: "此刻"视图，自动打开今日日记编辑，全屏 NotesPanel，支持 AI 问题自动生成（流式输出）
JournalPastView.jsx: "过往"视图，历史日记支持列表/弧线画布（连续浏览） + 侧边 NotesPanel 编辑
JournalItem.jsx: 过往日记列表项，显示日期 + 标题 + 预览 + 字数
JournalChip.jsx: 日历内日记小卡片，虚线边框，不可拖拽，BookText 图标
AIPromptCard.jsx: AI 问题卡片，展示生成的引导问题（无 emoji），支持点击插入、悬停删除、刷新，淡入淡出动画，显示加载状态
FocusView.jsx: 专注视图主组件，柔性宇宙插画风格，整合 FocusMode 专注模式 + Constellation 星座系统 + OverdueCard 过期任务卡片 + OverflowCard 溢出任务卡片 + 两层空状态引导
FocusCircle.jsx: 专注视图核心 - 深邃宇宙插画，时间感知背景，深度分层（far/mid/near）+ 鼠标视差，集成 DarkNebula/DeepSpaceDust/SpaceGlow/OrbitPaths/StarDust/BlueDust/Constellation
Planet.jsx: 手绘风格行星，使用 @/lib/planet 共享素材系统，支持坍缩动画（GSAP 收缩 + 粒子迸发 + 闪白）+ 红巨星状态（过期任务暗红脉动）+ 番茄环渲染 + 长按进入专注模式 + 极简右键菜单 + 拖拽整理位置 + 星标金色光晕
FocusMode.jsx: 全屏专注模式组件，极简设计（SVG 手绘星球 + 有机运动 + 尺寸进度），使用 @/lib/planet 共享素材系统，番茄钟计时器（15/25/45分钟可选），GSAP 呼吸漂移动画
Constellation.jsx: 完成任务星座系统，已完成任务留下微弱恒星（闪烁动画），当天完成的恒星之间虚线连线，useConstellation hook 管理状态 + localStorage 持久化
ZDepthLayer.jsx: 深度层管理器，定义 far/mid/near 三层配置（zIndex/blur/parallaxSpeed/opacity），提供 ParallaxProvider/使用视差组件/FarLayer/MidLayer/NearLayer
DarkNebula.jsx: 巨大暗星云层，占据画面大比例，极暗透明度(2-3.5%)，大模糊(80px)，mix-blend-mode: multiply 实现遮挡效果，分钟级呼吸漂移
DeepSpaceDust.jsx: 极微星点层，200个 0.3-1px 星尘，低透明度(5-15%)，冷色系(80%灰白20%冷蓝)，创造尺度差
SpaceGlow.jsx: 空间辉光层，非中心式不规则光斑，极低对比度(2-5%)，大模糊(60px)，分钟级脉动
StarDust.jsx: 背景星点层，GSAP 动画，35个微小粒子极慢漂浮，冷色系(80%灰白20%冷蓝)
OrbitPaths.jsx: 断续轨道带 - 不完整椭圆弧线，随机亮度，CSS mask 局部遮挡，GSAP 描边动画
BlueDust.jsx: 蓝色粒子层，GSAP 动画，25个蓝色小点集中在中间区域
MiniInfo.jsx: 右上角极简信息标签，GSAP 入场动画，问候语 + 数字，支持时间感知
NoiseOverlay.jsx: 全局噪点纹理层，SVG feTurbulence 实现颗粒感
FloatingTaskBubble.jsx: 漂浮气泡任务卡片，圆角胶囊形状，渐变圆点前缀，与行星系统融为一体
TaskBubbleZone.jsx: 底部任务气泡区域，水平排列漂浮气泡，最多显示5个
ProjectList.jsx: 项目列表组件，侧边栏导航，仅支持点击切换视图和创建项目，操作功能（设置/归档/删除）移至主区域 ProjectGallery 右键菜单
ProjectGallery.jsx: 项目画廊组件，呼吸感卡片网格布局（h-40 垂直居中），系统主题色进度环 + 标题 + 纯文字统计，响应式 1/2/3 列，hover 仅背景色变化，右键菜单操作（设置/归档/删除）
ProjectSettings.jsx: 项目设置对话框，支持编辑标题/描述，管理自定义列（添加/删除/重命名/排序），移除颜色选择，统一使用系统主题色
ProjectBoard.jsx: 项目看板主容器，整合列组件和拖拽功能，管理任务在列之间的流转，支持 dnd-kit
ProjectColumn.jsx: 看板列组件，显示列内任务，支持任务拖拽，支持添加新任务（添加按钮固定在列头下方，始终可见）
ProjectTaskCard.jsx: 看板任务卡片，显示任务信息，支持拖拽，显示 GTD 归属标签
SortableTask.jsx: 可拖拽排序的任务卡片包装器，集成 dnd-kit

## 子目录

settings/: 设置模块，左右分栏布局（桌面端）+ Sheet 全屏（移动端）

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
