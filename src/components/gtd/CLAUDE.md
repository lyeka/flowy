# gtd/
> L2 | 父级: src/components/CLAUDE.md

## 成员清单

QuickCapture.jsx: 快速收集输入框，顶部任务添加入口
Sidebar.jsx: 侧边栏导航，GTD 五大列表切换 + 列表/日历视图切换 + 设置入口，移动端简化为 3 按钮底部导航（Menu、FAB、日历）
Drawer.jsx: 移动端左侧滑抽屉，显示 GTD 五大列表 + 设置入口，替代底部导航的列表切换功能
ActionSheet.jsx: 移动端底部操作表，显示任务操作选项（设置日期、移动到列表、删除），替代桌面端的下拉菜单
Settings.jsx: 设置对话框，数据导入/导出入口
TaskItem.jsx: 单任务项，支持完成/移动/删除/日期设置，移动端支持滑动手势（右滑完成、左滑删除）和长按菜单，行高 64px，Checkbox 24px
TaskList.jsx: 任务列表容器，处理空状态和序列动画
CalendarView.jsx: 日历视图容器，组装 Header + Grid + UnscheduledPanel，移动端简化 Header，隐藏 UnscheduledPanel
CalendarGrid.jsx: 日历网格渲染，星期标题 + 日期矩阵
CalendarCell.jsx: 单日格子，显示日期和任务，支持拖放，移动端减小尺寸（min-h-20，日期 text-xs）
CalendarTaskChip.jsx: 日历内任务小卡片，可拖拽
UnscheduledPanel.jsx: 无日期任务面板，可折叠，支持拖拽到日历
NotesPanel.jsx: 任务副文本编辑面板，右侧滑入，衬线字体 + 宽行距，优雅写作体验，移动端减少留白（px-6 py-8）

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
