/**
 * [INPUT]: react, gsap, react-i18next, @/lib/utils
 * [OUTPUT]: MiniInfo 组件
 * [POS]: 右上角极简信息标签，问候语 + 数字，GSAP 入场动画
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════
// 右上角极简信息
// ═══════════════════════════════════════════════════════════════════════════
export function MiniInfo({ count = 0, className }) {
  const { t } = useTranslation()
  const ref = useRef(null)

  // 根据时间获取问候语
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return t('focus.circle.morning')
    if (hour >= 12 && hour < 18) return t('focus.circle.afternoon')
    if (hour >= 18 && hour < 22) return t('focus.circle.evening')
    return t('focus.circle.night')
  }, [t])

  // GSAP 入场动画
  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(ref.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    )
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "absolute top-6 right-6 z-50",
        "flex items-center gap-3 px-5 py-2.5",
        "bg-white/15 backdrop-blur-sm",
        "rounded-full",
        "text-white/90",
        className
      )}
      style={{ opacity: 0 }}
    >
      <span className="text-sm font-light">{greeting}</span>
      <span className="text-xl font-medium tabular-nums">{count}</span>
    </div>
  )
}
