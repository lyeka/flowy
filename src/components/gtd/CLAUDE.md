# gtd/
> L2 | 父级: src/components/CLAUDE.md

## 成员清单

QuickCapture.jsx: 快速收集输入框，顶部任务添加入口
Sidebar.jsx: 侧边栏导航，GTD 五大列表切换 + 列表/日历视图切换 + 日记分组（此刻/过往）+ 设置入口，移动端简化为 3 按钮底部导航（Menu、FAB、日历）
Drawer.jsx: 移动端左侧滑抽屉，显示 GTD 五大列表 + 日记分组 + 设置入口，替代底部导航的列表切换功能
ActionSheet.jsx: 移动端底部操作表，显示任务操作选项（设置日期、移动到列表、删除），替代桌面端的下拉菜单
Settings.jsx: 设置对话框，主题切换 + 语言切换 + AI 配置 + 数据导入/导出入口
TaskItem.jsx: 单任务项，支持完成/移动/删除/日期设置，移动端支持滑动手势（右滑完成、左滑删除）和长按菜单，行高 64px，Checkbox 24px
TaskList.jsx: 任务列表容器，处理空状态和序列动画
CalendarView.jsx: 日历视图容器，组装 Header + Grid + UnscheduledPanel，移动端简化 Header，隐藏 UnscheduledPanel，支持日记显示
CalendarGrid.jsx: 日历网格渲染，星期标题 + 日期矩阵，传递日记数据到 CalendarCell
CalendarCell.jsx: 单日格子，显示日期、日记和任务，支持拖放，移动端减小尺寸（min-h-20，日期 text-xs）
CalendarTaskChip.jsx: 日历内任务小卡片，可拖拽，实线边框
UnscheduledPanel.jsx: 无日期任务面板，可折叠，支持拖拽到日历
NotesPanel.jsx: 任务/日记编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，移动端减少留白（px-6 py-8），支持 type='task'|'journal' 双模式，集成 AI 问题卡片
JournalNowView.jsx: "此刻"视图，自动打开今日日记编辑，全屏 NotesPanel，支持 AI 问题自动生成（流式输出）
JournalPastView.jsx: "过往"视图，历史日记支持列表/弧线画布（连续浏览） + 侧边 NotesPanel 编辑
JournalItem.jsx: 过往日记列表项，显示日期 + 标题 + 预览 + 字数
JournalChip.jsx: 日历内日记小卡片，虚线边框，不可拖拽，BookText 图标
AIPromptCard.jsx: AI 问题卡片，展示生成的引导问题（无 emoji），支持点击插入、悬停删除、刷新，淡入淡出动画，显示加载状态
AISettings.jsx: AI 配置界面，API Key 输入（密码框）+ 模型选择 + 指导方向输入 + 自动生成开关 + 任务上下文开关 + 连接测试功能（测试按钮 + 结果 Dialog + 错误诊断）

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
