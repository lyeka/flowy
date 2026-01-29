/**
 * [INPUT]: react, gsap, react-i18next, framer-motion, @/lib/utils, TimerPlanet, NoiseOverlay
 * [OUTPUT]: FocusMode 组件
 * [POS]: 全屏专注模式 - 星际航行设计，星球从远方逐渐靠近表达进度
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause } from 'lucide-react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { TimerPlanet } from './TimerPlanet'
import { getRandomPlanet } from './planetTextures'
import { NoiseOverlay } from './NoiseOverlay'

// ═══════════════════════════════════════════════════════════════════════════
// 番茄钟时长选项（分钟）
// ═══════════════════════════════════════════════════════════════════════════
const POMODORO_DURATIONS = [15, 25, 45]

// ═══════════════════════════════════════════════════════════════════════════
// 格式化时间显示
// ═══════════════════════════════════════════════════════════════════════════
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ═══════════════════════════════════════════════════════════════════════════
// 深空星尘 - 稀疏的背景星点
// ═══════════════════════════════════════════════════════════════════════════
function DeepSpaceStars() {
  const stars = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 0.5 + Math.random() * 1,
      opacity: 0.1 + Math.random() * 0.3,
      delay: Math.random() * 3
    }))
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map(star => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            background: 'var(--focus-star-core)',
            boxShadow: `0 0 ${star.size * 2}px var(--focus-star-glow)`
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 1.5, star.opacity],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 航程选择按钮 - 小星点设计
// ═══════════════════════════════════════════════════════════════════════════
function VoyageButton({ minutes, selected, onSelect, label }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(minutes)}
      className="flex flex-col items-center gap-2 px-4 py-3"
    >
      {/* 星点 */}
      <motion.div
        className="relative"
        animate={{
          scale: selected ? [1, 1.2, 1] : 1
        }}
        transition={{
          duration: 1.5,
          repeat: selected ? Infinity : 0,
          ease: 'easeInOut'
        }}
      >
        <div
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            selected ? "bg-[var(--focus-star-core)]" : "bg-[var(--focus-text-muted)]"
          )}
          style={{
            boxShadow: selected
              ? '0 0 12px var(--focus-star-glow), 0 0 24px var(--focus-star-glow)'
              : 'none'
          }}
        />
      </motion.div>
      {/* 时长文字 */}
      <span
        className={cn(
          "text-sm font-light transition-colors duration-300",
          selected ? "text-[var(--focus-text-bright)]" : "text-[var(--focus-text-muted)]"
        )}
      >
        {minutes}
      </span>
      {/* 标签 */}
      <span
        className={cn(
          "text-xs transition-colors duration-300",
          selected ? "text-[var(--focus-text-secondary)]" : "text-[var(--focus-text-muted)]"
        )}
      >
        {label}
      </span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 航行进度条
// ═══════════════════════════════════════════════════════════════════════════
function VoyageProgress({ progress }) {
  return (
    <div className="w-48 h-[2px] bg-[var(--focus-text-muted)] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'var(--focus-star-core)',
          boxShadow: '0 0 8px var(--focus-star-glow)'
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 粒子爆发效果
// ═══════════════════════════════════════════════════════════════════════════
function ParticleBurst({ active }) {
  const particles = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      angle: (i / 16) * Math.PI * 2,
      distance: 150 + Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 0.3
    }))
  }, [])

  if (!active) return null

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: 'var(--focus-star-core)',
            boxShadow: '0 0 8px var(--focus-star-glow)'
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 0
          }}
          transition={{
            duration: 1,
            delay: p.delay,
            ease: 'power2.out'
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 专注模式主组件 - 星际航行
// ═══════════════════════════════════════════════════════════════════════════
export function FocusMode({
  task = null,
  initialPomodoros = 0,
  onPomodoroComplete,
  onTaskComplete,
  onAbandon
}) {
  const { t } = useTranslation()
  const containerRef = useRef(null)

  // 随机选择星球
  const [planet] = useState(getRandomPlanet)

  // 状态
  const [step, setStep] = useState('select')
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)
  const [totalDuration, setTotalDuration] = useState(25 * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(initialPomodoros)
  const [showBurst, setShowBurst] = useState(false)

  // 计时器引用
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const totalDurationRef = useRef(25 * 60)

  // 计算进度和星球尺寸
  const progress = (totalDuration - remainingSeconds) / totalDuration
  // 星球尺寸：100px（远方）→ 400px（抵达）
  const planetSize = step === 'select' ? 120 : 100 + progress * 300

  // 入场动画
  useEffect(() => {
    if (!containerRef.current) return
    gsap.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.8, ease: 'power2.out' }
    )
  }, [])

  // 启动计时器
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = totalDurationRef.current - elapsed
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        setRemainingSeconds(0)
        setShowBurst(true)
        setTimeout(() => setStep('complete'), 500)
      } else {
        setRemainingSeconds(remaining)
      }
    }, 100)
  }, [])

  // 开始专注
  const handleStart = useCallback(() => {
    const duration = selectedDuration * 60
    totalDurationRef.current = duration
    setTotalDuration(duration)
    setRemainingSeconds(duration)
    setStep('running')
    startTimer()
  }, [selectedDuration, startTimer])

  // 暂停/继续
  const handlePauseToggle = useCallback(() => {
    if (step === 'running') {
      clearInterval(timerRef.current)
      setStep('paused')
    } else if (step === 'paused') {
      const elapsedBeforePause = totalDurationRef.current - remainingSeconds
      startTimeRef.current = Date.now() - elapsedBeforePause * 1000
      setStep('running')
      startTimer()
    }
  }, [step, remainingSeconds, startTimer])

  // 完成番茄钟
  const handlePomodoroComplete = useCallback(() => {
    const newCount = completedPomodoros + 1
    setCompletedPomodoros(newCount)
    onPomodoroComplete?.(task?.id, newCount)
    setStep('select')
    setRemainingSeconds(selectedDuration * 60)
    setShowBurst(false)
  }, [completedPomodoros, onPomodoroComplete, selectedDuration, task])

  // 直接完成任务
  const handleTaskComplete = useCallback(() => {
    clearInterval(timerRef.current)
    onTaskComplete?.(task?.id)
  }, [onTaskComplete, task])

  // 放弃
  const handleAbandon = useCallback(() => {
    clearInterval(timerRef.current)
    onAbandon?.()
  }, [onAbandon])

  // 清理计时器
  useEffect(() => {
    return () => { clearInterval(timerRef.current) }
  }, [])

  if (!task) return null

  return (
    <motion.div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: 'var(--focus-bg-night)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 深空背景 */}
      <DeepSpaceStars />
      <NoiseOverlay />

      {/* 粒子爆发 */}
      <ParticleBurst active={showBurst} />

      {/* 返回基地按钮 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={handleAbandon}
        className="absolute top-8 left-8 flex items-center gap-2 text-sm text-[var(--focus-text-muted)] hover:text-[var(--focus-text-secondary)] transition-colors"
      >
        <X className="w-4 h-4" />
        <span>{t('focus.pomodoro.returnBase', '返回基地')}</span>
      </motion.button>

      {/* 已完成番茄钟数量 */}
      {completedPomodoros > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-8 right-8 flex items-center gap-2"
        >
          {Array.from({ length: completedPomodoros }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--focus-star-core)',
                boxShadow: '0 0 6px var(--focus-star-glow)'
              }}
            />
          ))}
        </motion.div>
      )}

      {/* 主内容区 */}
      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          {/* ═══════════════════════════════════════════════════════════
              选择航程
              ═══════════════════════════════════════════════════════════ */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              {/* 星球预览 */}
              <div className="mb-8">
                <TimerPlanet
                  size={planetSize}
                  progress={0}
                  timeDisplay=""
                  isPaused={false}
                  planet={planet}
                />
              </div>

              {/* 任务标题 */}
              <p className="text-sm text-[var(--focus-text-secondary)] mb-2 max-w-md text-center">
                {task.title}
              </p>

              {/* 提示文字 */}
              <p className="text-lg text-[var(--focus-text-bright)] font-light mb-12">
                {t('focus.pomodoro.selectVoyage', '选择航程')}
              </p>

              {/* 航程选择 */}
              <div className="flex gap-8 mb-12">
                <VoyageButton
                  minutes={15}
                  selected={selectedDuration === 15}
                  onSelect={setSelectedDuration}
                  label={t('focus.pomodoro.short', '短途')}
                />
                <VoyageButton
                  minutes={25}
                  selected={selectedDuration === 25}
                  onSelect={setSelectedDuration}
                  label={t('focus.pomodoro.standard', '标准')}
                />
                <VoyageButton
                  minutes={45}
                  selected={selectedDuration === 45}
                  onSelect={setSelectedDuration}
                  label={t('focus.pomodoro.expedition', '远征')}
                />
              </div>

              {/* 启航按钮 */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                className="px-8 py-3 rounded-full text-sm font-light transition-all"
                style={{
                  background: 'var(--focus-button-bg)',
                  color: 'var(--focus-text-bright)',
                  boxShadow: '0 0 20px var(--focus-button-glow)'
                }}
              >
                {t('focus.pomodoro.launch', '启航')}
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              航行中 / 暂停
              ═══════════════════════════════════════════════════════════ */}
          {(step === 'running' || step === 'paused') && (
            <motion.div
              key="running"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* 动态尺寸星球 */}
              <motion.div
                animate={{ scale: step === 'paused' ? [1, 1.02, 1] : 1 }}
                transition={{
                  duration: 2,
                  repeat: step === 'paused' ? Infinity : 0,
                  ease: 'easeInOut'
                }}
                className="mb-8"
              >
                <TimerPlanet
                  size={planetSize}
                  progress={progress}
                  timeDisplay={formatTime(remainingSeconds)}
                  isPaused={step === 'paused'}
                  planet={planet}
                />
              </motion.div>

              {/* 任务标题 */}
              <p className="text-sm text-[var(--focus-text-secondary)] mb-2 max-w-md text-center">
                {task.title}
              </p>

              {/* 倒计时（星球外显示） */}
              <p className="text-4xl text-[var(--focus-text-bright)] font-light tabular-nums mb-8">
                {formatTime(remainingSeconds)}
              </p>

              {/* 航行进度条 */}
              <div className="mb-8">
                <VoyageProgress progress={progress} />
              </div>

              {/* 控制按钮 */}
              <div className="flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePauseToggle}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'var(--focus-button-bg)',
                    color: 'var(--focus-text-bright)',
                    boxShadow: '0 0 16px var(--focus-button-glow)'
                  }}
                >
                  {step === 'running' ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" />
                  )}
                </motion.button>

                <button
                  onClick={handleTaskComplete}
                  className="text-sm text-[var(--focus-text-muted)] hover:text-[var(--focus-text-secondary)] transition-colors"
                >
                  {t('focus.pomodoro.completeNow', '直接完成')}
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              抵达 - 征服仪式
              ═══════════════════════════════════════════════════════════ */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              {/* 最大尺寸星球 + 光晕 */}
              <motion.div
                className="mb-8 relative"
                animate={{
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <TimerPlanet
                  size={400}
                  progress={1}
                  timeDisplay=""
                  isPaused={false}
                  planet={planet}
                />
                {/* 额外光晕 */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow: `0 0 60px ${planet.glow}, 0 0 120px ${planet.glow}`
                  }}
                />
              </motion.div>

              {/* 征服文字 */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl text-[var(--focus-text-bright)] font-light mb-2"
              >
                {t('focus.pomodoro.conquered', '星球已征服')}
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-[var(--focus-text-secondary)] mb-12"
              >
                {task.title}
              </motion.p>

              {/* 操作按钮 */}
              <div className="flex flex-col items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePomodoroComplete}
                  className="px-8 py-3 rounded-full text-sm font-light transition-all"
                  style={{
                    background: 'var(--focus-button-bg)',
                    color: 'var(--focus-text-bright)',
                    boxShadow: '0 0 20px var(--focus-button-glow)'
                  }}
                >
                  {t('focus.pomodoro.continueVoyage', '继续航行')}
                </motion.button>

                <button
                  onClick={handleTaskComplete}
                  className="text-sm text-[var(--focus-text-muted)] hover:text-[var(--focus-text-secondary)] transition-colors"
                >
                  {t('focus.pomodoro.returnBase', '返回基地')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 用于显示打开时的过渡动画遮罩
// ═══════════════════════════════════════════════════════════════════════════
export function FocusModeBackdrop({ isOpening }) {
  return (
    <motion.div
      className="fixed inset-0 z-[99]"
      initial={{ scale: 0, borderRadius: '50%' }}
      animate={{
        scale: isOpening ? 100 : 0,
        backgroundColor: 'var(--focus-bg-night)'
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{
        left: '50%',
        top: '50%',
        width: '100px',
        height: '100px',
        marginLeft: '-50px',
        marginTop: '-50px'
      }}
    />
  )
}
