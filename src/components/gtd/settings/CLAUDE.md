# settings/
> L2 | 父级: gtd/CLAUDE.md

## 成员清单

SettingsDialog.jsx: 主容器，桌面端 Dialog 左右分栏（左侧 192px 导航 + 右侧内容区），移动端 Sheet 全屏 + 返回导航模式
SettingsNav.jsx: 左侧导航栏，五分类（外观/编辑器/数据/AI/关于），图标 + 标签，激活态高亮
SettingsContent.jsx: 右侧内容容器，AnimatePresence 动画切换，根据 activeSection 渲染对应 Section

## 子目录

components/: 基础组件（SettingItem 单行设置项、SettingGroup 设置分组）
sections/: 内容区块（AppearanceSection 外观、EditorSection 编辑器/预设/排版/样式、DataSection 数据、AISection AI、AboutSection 关于）

## 设计原则

- 克制：单入口，避免嵌套对话框
- 优雅：左右分栏，导航与内容分离
- 扩展：Section 模式化，新增分类无需改动容器

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
