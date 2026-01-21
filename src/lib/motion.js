/**
 * [INPUT]: 依赖 framer-motion 的 Spring 物理引擎
 * [OUTPUT]: 导出所有动画预设配置和变体
 * [POS]: lib 层动效核心模块，被所有需要动画的组件消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

/* ========================================
   Spring 物理配置
   ======================================== */

// 标准交互 - 按钮、卡片 hover (~200ms)
export const snappy = { type: "spring", stiffness: 400, damping: 30 }

// 柔和过渡 - 面板展开、模态框 (~350ms)
export const gentle = { type: "spring", stiffness: 300, damping: 35 }

// 弹性强调 - 成功反馈、关键元素 (~300ms)
export const bouncy = { type: "spring", stiffness: 500, damping: 25, mass: 0.8 }

// 优雅落定 - 页面过渡、大元素移动 (~500ms)
export const smooth = { type: "spring", stiffness: 200, damping: 40, mass: 1.2 }

// 惯性滑动 - 列表、轮播
export const inertia = { type: "spring", stiffness: 150, damping: 20, mass: 0.5 }

/* ========================================
   动画变体
   ======================================== */

// 淡入上移 - 通用入场
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

// 弹性缩放入场 - 强调元素
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

// 序列进场容器
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 }
  }
}

// 序列进场子元素
export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  }
}

// 左滑入
export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

// 右滑入
export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 }
  }
}

// 悬浮提升 - Apple Card 效果
export const hoverLift = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 12px 32px rgba(0,0,0,0.15)",
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
}

// 点击反馈 - 弹性回弹
export const tapScale = {
  rest: { scale: 1 },
  pressed: {
    scale: 0.96,
    transition: { type: "spring", stiffness: 500, damping: 30 }
  }
}

// 页面路由过渡
export const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 260, damping: 40 }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 }
  }
}
