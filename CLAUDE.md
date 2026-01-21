# GTD 时间项目管理
Vite 7 + React 19 + TailwindCSS v4 + shadcn/ui + Framer Motion

<directory>
src/
├── components/
│   ├── ui/          - shadcn 组件库
│   └── gtd/         - GTD 业务组件 (9文件: QuickCapture, Sidebar, TaskItem, TaskList, CalendarView, CalendarGrid, CalendarCell, CalendarTaskChip, UnscheduledPanel)
├── stores/          - 状态管理 (2文件: gtd.js, calendar.js)
├── lib/             - 工具函数 (2文件: utils.js, motion.js)
├── App.jsx          - 应用入口，支持列表/日历视图切换
├── main.jsx         - React 挂载点
└── index.css        - 全局样式 + CSS 变量
</directory>

<config>
vite.config.js   - Vite 配置 + TailwindCSS 插件 + 路径别名
jsconfig.json    - 路径别名配置 (@/ -> src/)
components.json  - shadcn/ui 配置
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

## 启动

```bash
npm run dev
```

[PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
