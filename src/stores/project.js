/**
 * [INPUT]: React useState/useEffect/useCallback/useMemo, format/project.js
 * [OUTPUT]: useProject hook，提供项目 CRUD 和状态管理，支持文件系统持久化
 * [POS]: stores 层项目状态模块，被看板组件消费，移除 PROJECT_COLORS 常量，统一使用系统主题色
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { serializeProject, deserializeProject } from '@/lib/format'

/* ========================================
   常量定义
   ======================================== */

const STORAGE_KEY = 'gtd-projects'
const PROJECTS_DIR = 'projects'
const DEBOUNCE_DELAY = 500

// 默认列模板
export const DEFAULT_COLUMNS = [
  { id: 'backlog', title: '待办' },
  { id: 'in_progress', title: '进行中' },
  { id: 'done', title: '完成' }
]

/* ========================================
   工具函数
   ======================================== */

const generateId = () => `proj-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
const generateColumnId = () => `col-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

// localStorage 读取（降级方案）
const loadProjectsFromStorage = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data === null) return []
    const parsed = JSON.parse(data)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// localStorage 保存（降级方案）
const saveProjectsToStorage = (projects) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

/* ========================================
   Project Hook
   ======================================== */

/**
 * 项目状态管理 Hook
 * @param {Object} [options] - 配置选项
 * @param {Object} [options.fileSystem] - 文件系统适配器
 */
export function useProject(options = {}) {
  const { fileSystem } = options
  const [projects, setProjects] = useState([])
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 防抖写入相关
  const debounceTimerRef = useRef(null)
  const pendingWriteRef = useRef(null)

  // 从文件系统加载项目
  const loadFromFS = useCallback(async () => {
    if (!fileSystem) return null

    const allProjects = []

    try {
      if (!await fileSystem.exists(PROJECTS_DIR)) {
        return null
      }

      const files = await fileSystem.list(PROJECTS_DIR)
      for (const file of files) {
        if (!file.name.endsWith('.json')) continue
        try {
          const content = await fileSystem.read(`${PROJECTS_DIR}/${file.name}`)
          const project = deserializeProject(content)
          if (project && !project.archived) {
            allProjects.push(project)
          }
        } catch (err) {
          console.error(`Failed to load project ${file.name}:`, err)
        }
      }
    } catch (err) {
      console.error('Failed to list projects:', err)
    }

    return allProjects.length > 0 ? allProjects : null
  }, [fileSystem])

  // 保存单个项目到文件系统
  const saveProjectToFS = useCallback(async (project) => {
    if (!fileSystem) {
      saveProjectsToStorage(projects)
      return
    }

    try {
      await fileSystem.ensureDir(PROJECTS_DIR)
      const content = serializeProject(project)
      await fileSystem.write(`${PROJECTS_DIR}/${project.id}.json`, content)
    } catch (err) {
      console.error(`Failed to save project ${project.id}:`, err)
    }

    // 同时保存到 localStorage 作为备份
    saveProjectsToStorage(projects)
  }, [fileSystem, projects])

  // 删除项目文件
  const deleteProjectFromFS = useCallback(async (projectId) => {
    if (!fileSystem) return

    try {
      const path = `${PROJECTS_DIR}/${projectId}.json`
      if (await fileSystem.exists(path)) {
        await fileSystem.delete(path)
      }
    } catch (err) {
      console.error(`Failed to delete project ${projectId}:`, err)
    }
  }, [fileSystem])

  // 防抖保存
  const debouncedSave = useCallback((project) => {
    pendingWriteRef.current = project

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingWriteRef.current) {
        saveProjectToFS(pendingWriteRef.current)
        pendingWriteRef.current = null
      }
    }, DEBOUNCE_DELAY)
  }, [saveProjectToFS])

  // 初始化加载
  useEffect(() => {
    let mounted = true

    const init = async () => {
      setIsLoading(true)

      const fsProjects = await loadFromFS()

      if (!mounted) return

      if (fsProjects) {
        setProjects(fsProjects)
      } else {
        setProjects(loadProjectsFromStorage())
      }

      setIsLoading(false)
    }

    init()

    return () => {
      mounted = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [loadFromFS])

  // 创建项目
  const createProject = useCallback((title, description = '') => {
    const now = Date.now()
    const project = {
      id: generateId(),
      title: title.trim(),
      description,
      columns: DEFAULT_COLUMNS.map(col => ({ ...col, id: generateColumnId() })),
      createdAt: now,
      updatedAt: now,
      archived: false
    }
    setProjects(prev => [project, ...prev])
    debouncedSave(project)
    return project
  }, [debouncedSave])

  // 更新项目
  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, ...updates, updatedAt: Date.now() }
      debouncedSave(updated)
      return updated
    }))
  }, [debouncedSave])

  // 删除项目
  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    deleteProjectFromFS(id)
    if (activeProjectId === id) {
      setActiveProjectId(null)
    }
  }, [activeProjectId, deleteProjectFromFS])

  // 归档项目
  const archiveProject = useCallback((id) => {
    updateProject(id, { archived: true })
  }, [updateProject])

  // 添加列
  const addColumn = useCallback((projectId, title) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const newColumn = { id: generateColumnId(), title }
      const updated = {
        ...p,
        columns: [...p.columns, newColumn],
        updatedAt: Date.now()
      }
      debouncedSave(updated)
      return updated
    }))
  }, [debouncedSave])

  // 更新列
  const updateColumn = useCallback((projectId, columnId, updates) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const updated = {
        ...p,
        columns: p.columns.map(col =>
          col.id === columnId ? { ...col, ...updates } : col
        ),
        updatedAt: Date.now()
      }
      debouncedSave(updated)
      return updated
    }))
  }, [debouncedSave])

  // 删除列
  const deleteColumn = useCallback((projectId, columnId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const updated = {
        ...p,
        columns: p.columns.filter(col => col.id !== columnId),
        updatedAt: Date.now()
      }
      debouncedSave(updated)
      return updated
    }))
  }, [debouncedSave])

  // 重排列
  const reorderColumns = useCallback((projectId, newColumns) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p
      const updated = { ...p, columns: newColumns, updatedAt: Date.now() }
      debouncedSave(updated)
      return updated
    }))
  }, [debouncedSave])

  // 当前选中的项目
  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId) || null
  }, [projects, activeProjectId])

  // 未归档的项目
  const activeProjects = useMemo(() => {
    return projects.filter(p => !p.archived)
  }, [projects])

  return {
    projects: activeProjects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    isLoading,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    addColumn,
    updateColumn,
    deleteColumn,
    reorderColumns
  }
}
