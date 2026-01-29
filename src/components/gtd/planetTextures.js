/**
 * [INPUT]: 无
 * [OUTPUT]: PLANET_TEXTURES 配置, getRandomPlanet 函数
 * [POS]: 番茄钟星球纹理配置，供 TimerPlanet 和 FocusMode 使用
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ═══════════════════════════════════════════════════════════════════════════
// 星球纹理配置 - NASA 真实图片
// ═══════════════════════════════════════════════════════════════════════════
export const PLANET_TEXTURES = [
  { id: 'mars', src: '/planets/mars.jpg', name: '火星', glow: 'rgba(193, 68, 14, 0.15)' },
  { id: 'jupiter', src: '/planets/jupiter.png', name: '木星', glow: 'rgba(200, 150, 100, 0.15)' },
  { id: 'moon', src: '/planets/moon.jpg', name: '月球', glow: 'rgba(200, 200, 200, 0.15)' },
  { id: 'venus', src: '/planets/venus.jpg', name: '金星', glow: 'rgba(230, 180, 100, 0.15)' },
  { id: 'neptune', src: '/planets/neptune.png', name: '海王星', glow: 'rgba(50, 100, 200, 0.15)' },
  { id: 'mercury', src: '/planets/mercury.jpg', name: '水星', glow: 'rgba(150, 150, 150, 0.15)' },
  { id: 'pluto', src: '/planets/pluto.jpg', name: '冥王星', glow: 'rgba(180, 160, 140, 0.15)' },
]

// ═══════════════════════════════════════════════════════════════════════════
// 随机选择星球
// ═══════════════════════════════════════════════════════════════════════════
export function getRandomPlanet() {
  return PLANET_TEXTURES[Math.floor(Math.random() * PLANET_TEXTURES.length)]
}
