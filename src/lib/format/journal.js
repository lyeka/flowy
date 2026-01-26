/**
 * [INPUT]: gray-matter (Markdown frontmatter 解析)
 * [OUTPUT]: 日记 Markdown 格式读写函数
 * [POS]: format/ 模块的日记格式处理，定义日记文件结构（Markdown + Frontmatter）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import matter from 'gray-matter'

// ============================================================================
// 日记文件格式
// ============================================================================

/**
 * @typedef {Object} Journal
 * @property {string} id - 日记 ID (journal-YYYY-MM-DD)
 * @property {number} date - 日期时间戳（当天 00:00）
 * @property {string} title - 标题
 * @property {string} content - 正文内容
 * @property {number} createdAt - 创建时间戳
 * @property {number} updatedAt - 更新时间戳
 */

// ============================================================================
// 序列化与反序列化
// ============================================================================

/**
 * 将日记对象序列化为 Markdown 字符串
 * @param {Journal} journal - 日记对象
 * @returns {string} Markdown 字符串
 */
export function serializeJournal(journal) {
  const frontmatter = {
    id: journal.id,
    date: formatDate(journal.date),
    title: journal.title,
    createdAt: journal.createdAt,
    updatedAt: journal.updatedAt
  }

  return matter.stringify(journal.content || '', frontmatter)
}

/**
 * 从 Markdown 字符串反序列化日记对象
 * @param {string} content - Markdown 字符串
 * @returns {Journal} 日记对象
 */
export function deserializeJournal(content) {
  const { data, content: body } = matter(content)

  return {
    id: data.id,
    date: parseDate(data.date),
    title: data.title || '',
    content: body.trim(),
    createdAt: data.createdAt || Date.now(),
    updatedAt: data.updatedAt || Date.now()
  }
}

/**
 * 从日期生成日记 ID
 * @param {Date|number} date - 日期
 * @returns {string} 日记 ID
 */
export function generateJournalId(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `journal-${formatDate(d.getTime())}`
}

/**
 * 从日期生成文件路径
 * @param {Date|number} date - 日期
 * @returns {string} 文件路径 (journals/YYYY/MM/YYYY-MM-DD.md)
 */
export function getJournalPath(date) {
  const d = date instanceof Date ? date : new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `journals/${year}/${month}/${year}-${month}-${day}.md`
}

/**
 * 从文件路径解析日期
 * @param {string} path - 文件路径
 * @returns {Date|null} 日期对象
 */
export function parseDateFromPath(path) {
  const match = path.match(/(\d{4})-(\d{2})-(\d{2})\.md$/)
  if (!match) return null
  return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
}

/**
 * 创建新日记对象
 * @param {Date|number} date - 日期
 * @param {string} [title] - 标题（可选）
 * @returns {Journal} 日记对象
 */
export function createJournal(date, title) {
  const d = date instanceof Date ? date : new Date(date)
  const now = Date.now()

  return {
    id: generateJournalId(d),
    date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(),
    title: title || formatDefaultTitle(d),
    content: '',
    createdAt: now,
    updatedAt: now
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {number} timestamp - 时间戳
 * @returns {string}
 */
function formatDate(timestamp) {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 解析 YYYY-MM-DD 为时间戳
 * @param {string} dateStr - 日期字符串
 * @returns {number} 时间戳
 */
function parseDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

/**
 * 生成默认标题 YYYY.MM.DD
 * @param {Date} date - 日期
 * @returns {string}
 */
function formatDefaultTitle(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

/**
 * 获取日记文件的更新时间
 * @param {string} content - Markdown 字符串
 * @returns {number} 更新时间戳
 */
export function getJournalUpdatedAt(content) {
  try {
    const { data } = matter(content)
    return data.updatedAt || 0
  } catch {
    return 0
  }
}
