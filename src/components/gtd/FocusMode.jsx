/**
 * [INPUT]: react, gsap, react-i18next, framer-motion, @/lib/utils
 * [OUTPUT]: FocusMode 组件
 * [POS]: 全屏专注模式组件，番茄钟计时器，长按星球后进入
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Clock } from 'lucide-react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

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
// 时长选择按钮
// ═══════════════════════════════════════════════════════════════════════════
function DurationButton({ minutes, selected, onSelect }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(minutes)}
      className={cn(
        "w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all"
      )}
      style={{
        background: selected
          ? 'oklch(from var(--focus-text-bright) l c h / 30%)'
          : 'oklch(from var(--focus-text-bright) l c h / 10%)',
        color: selected
          ? 'var(--focus-text-bright)'
          : 'oklch(from var(--focus-text-bright) l c h / 60%)'
      }}
    >
      <span className="text-2xl font-light">{minutes}</span>
      <span className="text-xs opacity-60">分钟</span>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// 专注模式主组件
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
  const circleRef = useRef(null)
  const progressRef = useRef(null)

  // 状态
  const [step, setStep] = useState('select') // 'select' | 'running' | 'paused' | 'complete'
  const [selectedDuration, setSelectedDuration] = useState(25)
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(initialPomodoros)

  // 计时器引用
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const totalDurationRef = useRef(25 * 60)

  // 入场动画
  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline()

    // 背景渐入
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.out' }
    )

    // 中心圆环展开
    if (circleRef.current) {
      tl.fromTo(circleRef.current,
        { scale: 0, rotate: -90 },
        { scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.3'
      )
    }

    return () => { tl.kill() }
  }, [])

  // 启动计时器
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      const remaining = totalDurationRef.current - elapsed

      // 更新进度圆环
      if (progressRef.current) {
        const progress = 1 - (remaining / totalDurationRef.current)
        progressRef.current.style.strokeDashoffset = 283 * (1 - progress)
      }

      if (remaining <= 0) {
        // 计时结束
        clearInterval(timerRef.current)
        setRemainingSeconds(0)
        setStep('complete')
      } else {
        setRemainingSeconds(remaining)
      }
    }, 100)
  }, [])

  // 开始专注
  const handleStart = useCallback(() => {
    totalDurationRef.current = selectedDuration * 60
    setRemainingSeconds(selectedDuration * 60)
    setStep('running')
    startTimer()
  }, [selectedDuration, startTimer])

  // 暂停/继续
  const handlePauseToggle = useCallback(() => {
    if (step === 'running') {
      clearInterval(timerRef.current)
      setStep('paused')
    } else if (step === 'paused') {
      // 调整开始时间以扣除已暂停的时间
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

    // 重置到选择状态，可以继续下一个番茄钟
    setStep('select')
    setRemainingSeconds(selectedDuration * 60)

    // 重置进度圆环
    if (progressRef.current) {
      progressRef.current.style.strokeDashoffset = 283
    }
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
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--focus-bg-evening) 0%, var(--focus-bg-night) 100%)'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* 放弃按钮 */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAbandon}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full transition-colors"
        style={{
          background: 'oklch(from var(--focus-text-bright) l c h / 10%)',
          color: 'oklch(from var(--focus-text-bright) l c h / 60%)'
        }}
      >
        <X className="w-4 h-4" />
        <span className="text-sm">{t('focus.pomodoro.abandon', '放弃')}</span>
      </motion.button>

      {/* 完成数量徽章 */}
      {completedPomodoros > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: 'oklch(from var(--destructive) l c h / 20%)',
            color: 'oklch(from var(--destructive) l c h / 70%)'
          }}
        >
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {t('focus.pomodoro.completedCount', '已完成 {{count}} 个', { count: completedPomodoros })}
          </span>
        </motion.div>
      )}

      <div className="flex flex-col items-center">
        {/* 步骤1: 选择时长 */}
        {step === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-xl font-light mb-2" style={{ color: 'var(--focus-text-bright)' }}>
              {t('focus.pomodoro.selectDuration', '选择专注时长')}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'oklch(from var(--focus-text-bright) l c h / 60%)' }}>{task.title}</p>

            <div className="flex gap-4 mb-8">
              {POMODORO_DURATIONS.map(duration => (
                <DurationButton
                  key={duration}
                  minutes={duration}
                  selected={selectedDuration === duration}
                  onSelect={setSelectedDuration}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-3 rounded-full transition-colors"
              style={{
                background: 'oklch(from var(--focus-text-bright) l c h / 20%)',
                color: 'var(--focus-text-bright)'
              }}
            >
              {t('focus.pomodoro.start', '开始专注')}
            </motion.button>
          </motion.div>
        )}

        {/* 步骤2/3: 计时中 / 暂停 */}
        {(step === 'running' || step === 'paused') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* 任务标题 */}
            <h2 className="text-lg font-light mb-8 max-w-md" style={{ color: 'var(--focus-text-bright)' }}>
              {task.title}
            </h2>

            {/* 计时器圆环 */}
            <div className="relative w-64 h-64 mb-8">
              {/* 背景圆 */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="45"
                  fill="none"
                  stroke="oklch(from var(--focus-text-bright) l c h / 10%)"
                  strokeWidth="2"
                />
                {/* 进度圆 */}
                <circle
                  ref={progressRef}
                  cx="128"
                  cy="128"
                  r="45"
                  fill="none"
                  stroke="oklch(from var(--focus-text-bright) l c h / 80%)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 * (1 - (totalDurationRef.current - remainingSeconds) / totalDurationRef.current)}
                  className="transition-all duration-100"
                />
              </svg>

              {/* 时间显示 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-light tabular-nums" style={{ color: 'var(--focus-text-bright)' }}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>
            </div>

            {/* 暂停/继续按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePauseToggle}
              className="w-16 h-16 rounded-full transition-colors flex items-center justify-center mb-8"
              style={{
                background: 'oklch(from var(--focus-text-bright) l c h / 20%)',
                color: 'var(--focus-text-bright)'
              }}
            >
              {step === 'running' ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </motion.button>

            {/* 直接完成任务 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTaskComplete}
              className="px-6 py-2 rounded-full transition-colors text-sm"
              style={{
                background: 'oklch(from var(--destructive) l c h / 20%)',
                color: 'oklch(from var(--destructive) l c h / 70%)'
              }}
            >
              {t('focus.pomodoro.completeTask', '直接完成任务')}
            </motion.button>
          </motion.div>
        )}

        {/* 步骤4: 完成 */}
        {step === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ background: 'oklch(from var(--destructive) l c h / 20%)' }}
            >
              <Clock
                className="w-10 h-10"
                style={{ color: 'oklch(from var(--destructive) l c h / 70%)' }}
              />
            </div>

            <h2 className="text-2xl font-light mb-2" style={{ color: 'var(--focus-text-bright)' }}>
              {t('focus.pomodoro.timeUp', '时间到！')}
            </h2>
            <p className="text-sm mb-8" style={{ color: 'oklch(from var(--focus-text-bright) l c h / 60%)' }}>
              {t('focus.pomodoro.takeBreak', '休息一下，喝杯水')}
            </p>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePomodoroComplete}
                className="px-6 py-3 rounded-full transition-colors"
                style={{
                  background: 'oklch(from var(--focus-text-bright) l c h / 20%)',
                  color: 'var(--focus-text-bright)'
                }}
              >
                {t('focus.pomodoro.continue', '继续下一个')}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleTaskComplete}
                className="px-6 py-3 rounded-full transition-colors"
                style={{
                  background: 'oklch(from var(--destructive) l c h / 20%)',
                  color: 'oklch(from var(--destructive) l c h / 70%)'
                }}
              >
                {t('focus.pomodoro.completeTask', '完成任务')}
              </motion.button>
            </div>
          </motion.div>
        )}
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
