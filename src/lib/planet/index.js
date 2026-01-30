/**
 * [INPUT]: ./svgs.js, ./colors.js
 * [OUTPUT]: selectSVG, selectColor, PLANET_SVGS, PLANET_COLORS, COLOR_KEYS
 * [POS]: 共享素材系统入口，统一导出 SVG 素材和颜色配置
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

export { PLANET_SVGS, selectSVG } from './svgs'
export { PLANET_COLORS, COLOR_KEYS, selectColor } from './colors'
