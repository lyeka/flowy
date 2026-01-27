/**
 * [INPUT]: react, @/lib/utils
 * [OUTPUT]: Slider component
 * [POS]: Range input slider for numeric settings
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import * as React from "react"
import { cn } from "@/lib/utils"

const Slider = React.forwardRef(({ className, value, onValueChange, min, max, step, ...props }, ref) => {
  return (
    <input
      type="range"
      ref={ref}
      min={min}
      max={max}
      step={step}
      value={value?.[0] ?? 0}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
      className={cn(
        "h-1.5 w-full rounded-full appearance-none bg-secondary cursor-pointer",
        "accent-primary accent-[length:100%]",
        "hover:accent-primary/80",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
Slider.displayName = "Slider"

export { Slider }
