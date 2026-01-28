/**
 * [INPUT]: react, @/lib/utils, ./StarDust, ./OrbitPaths, ./Planet, ./BlueDust, ./MiniInfo, ./NoiseOverlay, ./Constellation, ./ZDepthLayer, ./DeepSpaceDust, ./DarkNebula, ./SpaceGlow
 * [OUTPUT]: FocusCircle 组件
 * [POS]: 专注视图核心 - 柔性宇宙插画，时间感知背景，深度分层 + 视差，已完成任务星座
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useMemo, useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { isPast } from '@/stores/gtd'
import { StarDust } from './StarDust'
import { OrbitPaths } from './OrbitPaths'
import { Planet } from './Planet'
import { BlueDust } from './BlueDust'
import { MiniInfo } from './MiniInfo'
import { NoiseOverlay } from './NoiseOverlay'
import { Constellation } from './Constellation'
import { ParallaxProvider, FarLayer, MidLayer, NearLayer } from './ZDepthLayer'
import { DeepSpaceDust } from './DeepSpaceDust'
import { DarkNebula } from './DarkNebula'
import { SpaceGlow } from './SpaceGlow'

// ═══════════════════════════════════════════════════════════════════════════
// 时间感知背景色配置 - 使用 CSS 变量
// ═══════════════════════════════════════════════════════════════════════════
const TIME_BASED_BACKGROUNDS = {
  // 早 5-8点：晨曦
  dawn: {
    hours: [5, 8],
    cssVar: '--focus-bg-dawn',
    textClass: 'text-[var(--focus-text-primary)]'
  },
  // 上午 8-12：清醒
  morning: {
    hours: [8, 12],
    cssVar: '--focus-bg-morning',
    textClass: 'text-[var(--focus-text-primary)]'
  },
  // 下午 12-18：午后
  afternoon: {
    hours: [12, 18],
    cssVar: '--focus-bg-afternoon',
    textClass: 'text-[var(--focus-text-primary)]'
  },
  // 晚上 18-22：暮色
  evening: {
    hours: [18, 22],
    cssVar: '--focus-bg-evening',
    textClass: 'text-[var(--focus-text-bright)]'
  },
  // 深夜 22-5：深空
  night: {
    hours: [22, 5],
    cssVar: '--focus-bg-night',
    textClass: 'text-[var(--focus-text-bright)]'
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 获取当前时间段配置
// ═══════════════════════════════════════════════════════════════════════════
function getTimeBasedConfig() {
  const hour = new Date().getHours()

  for (const [key, config] of Object.entries(TIME_BASED_BACKGROUNDS)) {
    const [start, end] = config.hours
    if (start < end) {
      if (hour >= start && hour < end) return { key, ...config }
    } else {
      // 跨午夜的情况（如 22-5）
      if (hour >= start || hour < end) return { key, ...config }
    }
  }

  return TIME_BASED_BACKGROUNDS.morning
}

// ═══════════════════════════════════════════════════════════════════════════
// 行星配置 - 沿椭圆轨道分布
// ═══════════════════════════════════════════════════════════════════════════
const PLANET_CONFIG = [
  // 左侧小行星
  { x: '12%', y: '35%', size: 75, colorKey: 'purple', layer: 'back' },

  // 中间大行星（主角）
  { x: '50%', y: '40%', size: 150, colorKey: 'coral', layer: 'front' },

  // 右上小行星
  { x: '72%', y: '20%', size: 82, colorKey: 'cyan', layer: 'mid' },

  // 左下小行星
  { x: '28%', y: '50%', size: 68, colorKey: 'purple', layer: 'back' },

  // 右下土星
  { x: '85%', y: '42%', size: 98, colorKey: 'cream', hasRing: true, layer: 'front' },

  // 额外小行星
  { x: '62%', y: '48%', size: 52, colorKey: 'cyan', layer: 'mid' },
]

// ═══════════════════════════════════════════════════════════════════════════
// 从 localStorage 加载保存的行星位置
// ═══════════════════════════════════════════════════════════════════════════
function loadSavedPositions() {
  try {
    const saved = localStorage.getItem('gtd-planet-positions')
    return saved ? JSON.parse(saved) : {}
  } catch (e) {
    console.error('Failed to load planet positions:', e)
    return {}
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 保存行星位置到 localStorage
// ═══════════════════════════════════════════════════════════════════════════
function savePlanetPosition(taskId, position) {
  try {
    const saved = loadSavedPositions()
    saved[taskId] = position
    localStorage.setItem('gtd-planet-positions', JSON.stringify(saved))
  } catch (e) {
    console.error('Failed to save planet position:', e)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 主组件 - 柔性宇宙插画
// ═══════════════════════════════════════════════════════════════════════════
export function FocusCircle({
  totalCount = 0,
  completedCount = 0,
  planetTasks = [],
  allTasks = [],
  selectedTaskId = null,
  onParticleClick,
  onTaskSelect,
  onLongPress,
  onPlanetCollapsed,
  onPositionChange,
  onEditTask,
  onMoveToToday,
  onMoveToTomorrow,
  onDeleteTask,
  className
}) {
  // 时间感知背景
  const [timeConfig, setTimeConfig] = useState(getTimeBasedConfig())

  // 更新时间配置（每分钟检查一次）
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeConfig(getTimeBasedConfig())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // 加载保存的位置
  const savedPositions = loadSavedPositions()

  // 处理位置变化
  const handlePositionChange = useCallback((taskId, position) => {
    savePlanetPosition(taskId, position)
    onPositionChange?.(taskId, position)
  }, [onPositionChange])

  // 处理行星坍缩完成
  const handleCollapsed = useCallback((task, position, size) => {
    onPlanetCollapsed?.(task, position, size)
  }, [onPlanetCollapsed])

  // 判断任务是否过期
  const isTaskOverdue = useCallback((task) => {
    return task.dueDate && isPast(task.dueDate)
  }, [])

  // 获取番茄钟数量（从任务数据）
  const getTaskPomodoros = useCallback((task) => {
    return task.pomodoros || 0
  }, [])

  const pendingCount = totalCount - completedCount

  // 获取已保存的位置或使用默认位置
  const getPlanetPosition = useCallback((task, defaultPos) => {
    const saved = savedPositions[task.id]
    return saved ? { x: saved.x, y: saved.y } : { x: defaultPos.x, y: defaultPos.y }
  }, [savedPositions])

  return (
    <ParallaxProvider className={cn("relative w-full h-full min-h-[500px]", className)} intensity={0.8}>
      {/* 时间感知背景底色 */}
      <div
        className="absolute inset-0"
        style={{
          minHeight: '600px',
          background: `var(${timeConfig.cssVar})`
        }}
      />

      {/* ═════════════════════════════════════════════════════════════════════════
          Far Layer - 最远景
          zIndex: 3-5, blur: 1px, 视差速度: 0.08
         ═════════════════════════════════════════════════════════════════════════ */}
      <FarLayer>
        {/* 背景星点 - 1-3px */}
        <StarDust count={35} />
      </FarLayer>

      {/* 星云 - 移出层测试 */}
      <DarkNebula />

      {/* 极微星点 - 移出层测试 */}
      <DeepSpaceDust count={200} />

      {/* ═════════════════════════════════════════════════════════════════════════
          Mid Layer - 中景
          zIndex: 10, blur: 0.3px, 视差速度: 0.2
         ═════════════════════════════════════════════════════════════════════════ */}
      <MidLayer>
        {/* 空间辉光 */}
        <SpaceGlow />

        {/* 蓝色粒子 */}
        <BlueDust count={25} />

        {/* 已完成任务星座 */}
        <Constellation stars={allTasks.filter(t => t.completed)} />
      </MidLayer>

      {/* 轨道 - 移出层测试 */}
      <OrbitPaths />

      {/* ═════════════════════════════════════════════════════════════════════════
          Near Layer - 近景
          zIndex: 20, blur: 0, 视差速度: 0.4
         ═════════════════════════════════════════════════════════════════════════ */}
      <NearLayer>
        {/* 行星 */}
        {PLANET_CONFIG.map((config, i) => {
          const task = planetTasks[i]
          if (!task) return null

          const position = getPlanetPosition(task, config)

          return (
            <Planet
              key={task.id}
              task={task}
              size={config.size}
              position={position}
              colorKey={config.colorKey}
              hasRing={config.hasRing}
              layer={config.layer}
              isSelected={task.id === selectedTaskId}
              isOverdue={isTaskOverdue(task)}
              pomodoroCount={getTaskPomodoros(task)}
              onClick={onParticleClick}
              onLongPress={onLongPress}
              onPositionChange={handlePositionChange}
              onTaskSelect={onTaskSelect}
              onEdit={onEditTask}
              onMoveToToday={onMoveToToday}
              onMoveToTomorrow={onMoveToTomorrow}
              onDelete={onDeleteTask}
              onCollapsed={handleCollapsed}
            />
          )
        })}
      </NearLayer>

      {/* ═════════════════════════════════════════════════════════════════════════
          UI Layer - 不参与视差
         ═════════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* 噪点纹理 */}
        <NoiseOverlay />

        {/* 右上角信息 */}
        <MiniInfo count={pendingCount} timeKey={timeConfig.key} />
      </div>
    </ParallaxProvider>
  )
}
