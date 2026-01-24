/**
 * [INPUT]: journal data, tasks, AI config, time context
 * [OUTPUT]: buildContext, parseAIResponse - 构建 AI prompt 上下文和解析响应
 * [POS]: AI 模块的核心逻辑层，负责 prompt 工程
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================
// System Prompt Template
// ============================================================

export function buildSystemPrompt(userGuidance) {
  return `你是一个温暖、善解人意的日记助手。你的任务是根据用户的指导方向、任务完成情况和历史日记，生成 3 个引导性问题，帮助用户开始今天的日记。

用户的指导方向：
${userGuidance || '帮助用户记录今天的想法和感受'}

要求：
1. 问题要自然、温暖，像朋友的关心
2. 深度结合用户的指导方向，生成个性化的问题
3. 结合用户的任务完成情况，给予肯定或鼓励
4. 问题要开放式，引导深度思考和自我探索
5. 避免说教，保持轻松的语气
6. 每个问题不超过 30 字
7. 每次生成的问题都应该是独特的、有针对性的

输出格式（纯文本，每行一个问题）：
问题1
问题2
问题3

注意：直接输出问题文本，不要添加序号、标点或其他格式。`
}

// ============================================================
// Title Generation Prompt
// ============================================================

export function buildTitlePrompt(userGuidance) {
  return `你是一个温暖、善解人意的日记助手。你的任务是根据用户的指导方向、任务完成情况、历史日记和当前时间，为今天的日记生成一个简短的标题。

用户的指导方向：
${userGuidance || '帮助用户记录今天的想法和感受'}

要求：
1. 标题要简短精炼，3-8 个字
2. 标题要概括今天的主题、情绪或重点
3. 结合用户的指导方向和任务情况
4. 标题要有诗意和温度，不要太直白
5. 避免使用"日记"、"记录"等词汇
6. 标题要独特，不要重复历史日记的标题

输出格式（纯文本，只输出标题）：
标题文本

注意：直接输出标题文本，不要添加引号、标点或其他格式。`
}

// ============================================================
// Context Building
// ============================================================

export function buildContext(journal, tasks, aiConfig, recentJournals = []) {
  const context = {
    timeContext: getTimeContext(journal.date),
    userGuidance: aiConfig.userGuidance || ''
  }

  // 引入任务上下文
  if (aiConfig.includeTaskContext && tasks) {
    context.tasksContext = buildTasksContext(tasks)
  }

  // 引入历史日记上下文
  if (aiConfig.includeHistoryContext && recentJournals.length > 0) {
    context.historyContext = buildHistoryContext(recentJournals)
  }

  return context
}

function getTimeContext(timestamp) {
  const date = new Date(timestamp)
  const hour = date.getHours()
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  let timeOfDay = '早上'
  if (hour >= 12 && hour < 14) timeOfDay = '中午'
  else if (hour >= 14 && hour < 18) timeOfDay = '下午'
  else if (hour >= 18) timeOfDay = '晚上'

  return { dayOfWeek, timeOfDay, isWeekend }
}

function buildTasksContext(tasks) {
  const today = tasks.filter(t => t.list === 'today')
  const completed = today.filter(t => t.completed)
  const pending = today.filter(t => !t.completed)
  const someday = tasks.filter(t => t.list === 'someday')

  const lines = []
  lines.push(`今日任务：完成 ${completed.length}/${today.length} (${today.length > 0 ? Math.round(completed.length / today.length * 100) : 0}%)`)

  if (today.length > 0) {
    lines.push('任务列表：')
    today.slice(0, 5).forEach(t => {
      lines.push(`  ${t.completed ? '✓' : '○'} ${t.title}`)
    })
  }

  if (someday.length > 0) {
    lines.push(`搁置任务：${someday.length} 个`)
  }

  return lines.join('\n')
}

function buildHistoryContext(recentJournals) {
  const lines = ['最近日记主题：']

  recentJournals.slice(0, 3).forEach(j => {
    const date = new Date(j.date).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
    const preview = j.content.slice(0, 50).replace(/\n/g, ' ')
    lines.push(`  ${date}: ${preview}...`)
  })

  return lines.join('\n')
}

// ============================================================
// User Prompt Building
// ============================================================

export function buildUserPrompt(context) {
  const lines = []

  lines.push(`当前时间：${context.timeContext.dayOfWeek} ${context.timeContext.timeOfDay}`)
  lines.push('')

  if (context.tasksContext) {
    lines.push(context.tasksContext)
    lines.push('')
  }

  if (context.historyContext) {
    lines.push(context.historyContext)
    lines.push('')
  }

  lines.push('请根据用户的指导方向，结合以上信息，生成 3 个个性化的引导问题。')

  return lines.join('\n')
}

export function buildTitleUserPrompt(context) {
  const lines = []

  lines.push(`当前时间：${context.timeContext.dayOfWeek} ${context.timeContext.timeOfDay}`)
  lines.push('')

  if (context.tasksContext) {
    lines.push(context.tasksContext)
    lines.push('')
  }

  if (context.historyContext) {
    lines.push(context.historyContext)
    lines.push('')
  }

  lines.push('请根据用户的指导方向，结合以上信息，为今天的日记生成一个简短的标题（3-8 个字）。')

  return lines.join('\n')
}

// ============================================================
// Response Parsing (支持纯文本格式)
// ============================================================

export function parseAIResponse(response) {
  try {
    // 尝试按行分割
    const lines = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    if (lines.length === 0) {
      return []
    }

    // 将每行转换为问题对象
    return lines.slice(0, 3).map((text, index) => ({
      id: String(index + 1),
      text: text,
      category: 'reflection',
      source: 'ai-generated',
      dismissed: false,
      inserted: false
    }))
  } catch (error) {
    console.error('Failed to parse AI response:', error)
    return []
  }
}

export function parseTitleResponse(response) {
  try {
    // 提取第一行作为标题
    const title = response
      .split('\n')[0]
      .trim()
      .replace(/^["']|["']$/g, '') // 移除可能的引号
      .slice(0, 8) // 限制最多 8 个字

    if (title.length < 3) {
      return null
    }

    return title
  } catch (error) {
    console.error('Failed to parse title response:', error)
    return null
  }
}

// ============================================================
// Fallback Prompts
// ============================================================

export function getFallbackPrompts() {
  return [
    {
      id: 'fallback-1',
      text: '今天有什么值得记录的事情？',
      category: 'reflection',
      source: 'fallback',
      dismissed: false,
      inserted: false
    },
    {
      id: 'fallback-2',
      text: '有什么让你感到满足或困扰的时刻？',
      category: 'emotion',
      source: 'fallback',
      dismissed: false,
      inserted: false
    },
    {
      id: 'fallback-3',
      text: '明天最想做的一件事是什么？',
      category: 'action',
      source: 'fallback',
      dismissed: false,
      inserted: false
    }
  ]
}
