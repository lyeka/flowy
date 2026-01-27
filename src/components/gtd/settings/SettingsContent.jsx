/**
 * [INPUT]: react, framer-motion, @/lib/motion, ./sections/*
 * [OUTPUT]: SettingsContent 组件 - 设置内容区（带动画）
 * [POS]: settings 右侧内容区，被 SettingsDialog 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { motion, AnimatePresence } from 'framer-motion'
import { pageTransition } from '@/lib/motion'
import { AppearanceSection, EditorSection, DataSection, AISection, AboutSection } from './sections'

// ============================================================================
// 设置内容区
// ============================================================================

export function SettingsContent({ activeSection, sync, fileSystem, onExport, onImport }) {
  const renderSection = () => {
    switch (activeSection) {
      case 'appearance':
        return <AppearanceSection />
      case 'editor':
        return <EditorSection />
      case 'data':
        return (
          <DataSection
            sync={sync}
            fileSystem={fileSystem}
            onExport={onExport}
            onImport={onImport}
          />
        )
      case 'ai':
        return <AISection />
      case 'about':
        return <AboutSection />
      default:
        return <AppearanceSection />
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeSection}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
      >
        {renderSection()}
      </motion.div>
    </AnimatePresence>
  )
}
