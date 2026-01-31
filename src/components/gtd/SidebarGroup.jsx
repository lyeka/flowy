/**
 * [INPUT]: 依赖 framer-motion，依赖 lucide-react 的 ChevronRight，依赖 @/lib/utils 的 cn，依赖 @/lib/motion 的 snappy
 * [OUTPUT]: 导出 SidebarGroup 组件
 * [POS]: 侧边栏可折叠分组组件，统一处理展开/折叠逻辑、箭头旋转动画、分组标题样式
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { snappy } from '@/lib/motion'

/**
 * 侧边栏可折叠分组组件
 * @param {string} title - 分组标题（如 "GTD"、"PROJECTS"）
 * @param {boolean} collapsed - 侧边栏是否处于折叠模式
 * @param {boolean} expanded - 分组是否展开
 * @param {function} onToggle - 展开/折叠切换回调
 * @param {React.ReactNode} children - 分组内容
 */
export function SidebarGroup({
  title,
  collapsed,
  expanded,
  onToggle,
  children
}) {
  return (
    <div className="flex flex-col">
      {/* ─────────────────────────────────────────────────────────────
       * 分组标题栏
       * 样式：小号字体、大写字母、灰色、右侧箭头
       * ───────────────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ backgroundColor: 'var(--sidebar-accent-hover)' }}
        whileTap={{ scale: 0.98 }}
        transition={snappy}
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "text-[11px] font-semibold uppercase tracking-wider",
          "text-muted-foreground/70 hover:text-muted-foreground",
          "transition-colors",
          collapsed && "justify-center"
        )}
      >
        {/* 箭头图标 - 旋转动画 */}
        <motion.div
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={snappy}
        >
          <ChevronRight className="h-3 w-3" />
        </motion.div>

        {/* 标题文字 - 折叠时隐藏 */}
        {!collapsed && <span>{title}</span>}
      </motion.button>

      {/* ─────────────────────────────────────────────────────────────
       * 分组内容区
       * 展开/折叠动画
       * ───────────────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-0.5 py-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
