/**
 * [INPUT]: react
 * [OUTPUT]: NoiseOverlay 组件
 * [POS]: 全局噪点纹理层，SVG feTurbulence 实现颗粒感
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ═══════════════════════════════════════════════════════════════════════════
// 噪点纹理层 - SVG Filter 实现颗粒感
// ═══════════════════════════════════════════════════════════════════════════
export function NoiseOverlay() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-overlay">
      <defs>
        <filter id="grain-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#grain-noise)" />
    </svg>
  )
}
