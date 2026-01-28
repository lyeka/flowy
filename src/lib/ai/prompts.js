/**
 * [INPUT]: journal data, tasks, AI config, time context
 * [OUTPUT]: buildContext, parseAIResponse, buildTaskRecommendPrompt, parseTaskRecommendResponse - 构建 AI prompt 上下文和解析响应
 * [POS]: AI 模块的核心逻辑层，负责 prompt 工程（开放式问题引导 + 维度池灵感 + 反套路设计 + 任务推荐）
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

// ============================================================
// System Prompt Template
// ============================================================

export function buildSystemPrompt(userGuidance) {
  return `你是一个善于倾听的日记伙伴。你的问题不是为了获取信息，而是为了帮助用户发现自己内心深处的想法。

用户的指导方向：
${userGuidance || '帮助用户觉察今天的情绪变化，发现值得记录的瞬间，并思考这些经历对自己的意义。'}

你的任务是生成 3 个引导性问题，帮助用户开始今天的日记。

问题设计原则：
1. 问题应该像一面镜子，让用户看到自己没注意到的角落
2. 问题应该让用户停下来思考，而不是能立即回答的问题
3. 避免说教或评判，保持好奇和开放的语气
4. 每个问题 15-40 字，太短缺乏上下文，太长显得啰嗦

问题多样性要求（重要）：
- 三个问题应该覆盖不同的角度，避免重复或雷同
- 不要按固定套路出题（比如总是"感受→事件→思考"）
- 每次生成的问题组合应该是独特的、有新鲜感的

可以从以下维度获取灵感（但不必全部使用，也不必按顺序）：
· 此刻的身心状态
· 今天的具体事件或瞬间
· 深层的思考或意义探索
· 人际关系和社交互动
· 身体感受和能量水平
· 对未来的期待或担忧
· 最近的困惑或顿悟
· 值得感恩或珍惜的事物

问题来源多元化（重要）：
- 问题可以来自用户的任务情况，但不要让所有问题都围绕任务
- 问题可以来自当前的时间和场景（周末、深夜、季节变化）
- 问题可以来自生活的其他维度（身体状态、人际关系、兴趣爱好、内心感受）
- 即使用户只有一个任务，也应该有开放性的、与任务无关的问题
- 日记是记录生活的，不只是记录任务的

如果用户有任务上下文，可以适度参考，但不要让所有问题都围绕任务。
任务只是生活的一部分，日记应该记录更丰富的内容。

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
  return `你是一个为日记命名的助手。你的任务是为今天的日记生成一个简短的标题。

用户的指导方向：
${userGuidance || '帮助用户觉察今天的情绪变化，发现值得记录的瞬间。'}

标题要求：
1. 长度 4-12 个字（太短无法表达，太长失去简洁）
2. 标题风格应该与用户的指导方向呼应
3. 标题应该能让用户在未来回顾时，立即想起当天的核心内容或感受
4. 避免使用"日记"、"记录"、"今天"等词汇
5. 可以是一个场景、一种情绪、一个瞬间、一个动作
6. 每次生成的标题都应该是独特的

标题来源多元化：
- 如果有任务上下文，可以参考但不必强关联
- 可以基于时间场景（"周末午后"、"冬日暖阳"、"深夜独处"）
- 可以基于情绪状态（"平静的一天"、"忙碌之后"、"小确幸"）
- 可以基于开放性主题（"新的开始"、"转折点"、"慢下来"）
- 不要让标题只围绕单一任务

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
  // 使用当前时间而非日记的 date 字段
  // 日记的 date 是当天 00:00:00，不代表用户当前时间
  const date = new Date()
  const hour = date.getHours()
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  const isWeekend = date.getDay() === 0 || date.getDay() === 6

  // 更细粒度的时间段
  let timeOfDay = '清晨'  // 5-8
  if (hour >= 8 && hour < 12) timeOfDay = '上午'
  else if (hour >= 12 && hour < 14) timeOfDay = '中午'
  else if (hour >= 14 && hour < 18) timeOfDay = '下午'
  else if (hour >= 18 && hour < 22) timeOfDay = '晚上'
  else if (hour >= 22 || hour < 5) timeOfDay = '深夜'

  // 特殊时刻标记
  const isLateNight = hour >= 22 || hour < 5
  const isEarlyMorning = hour >= 5 && hour < 8

  return { dayOfWeek, timeOfDay, isWeekend, isLateNight, isEarlyMorning }
}

function buildTasksContext(tasks) {
  // 判断日期是否是今天
  const isToday = (timestamp) => {
    if (!timestamp) return false
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const end = start + 24 * 60 * 60 * 1000
    return timestamp >= start && timestamp < end
  }

  // 今日任务：dueDate 是今天（包括已完成和未完成）
  const todayAll = tasks.filter(t => isToday(t.dueDate))
  const todayCompleted = todayAll.filter(t => t.completed)
  const todayPending = todayAll.filter(t => !t.completed)
  // 搁置任务：未完成 + 无 dueDate
  const someday = tasks.filter(t => !t.completed && !t.dueDate)

  const lines = []
  lines.push(`今日任务：完成 ${todayCompleted.length}/${todayAll.length} (${todayAll.length > 0 ? Math.round(todayCompleted.length / todayAll.length * 100) : 0}%)`)

  if (todayAll.length > 0) {
    lines.push('任务列表：')
    todayAll.slice(0, 5).forEach(t => {
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

  // 时间上下文，增加特殊时刻提示
  let timeDesc = `${context.timeContext.dayOfWeek} ${context.timeContext.timeOfDay}`
  if (context.timeContext.isLateNight) {
    timeDesc += '（夜深了，这是一个安静的时刻）'
  } else if (context.timeContext.isEarlyMorning) {
    timeDesc += '（新的一天刚开始）'
  }
  lines.push(`当前时间：${timeDesc}`)
  lines.push('')

  if (context.tasksContext) {
    lines.push(context.tasksContext)
    lines.push('')
  }

  if (context.historyContext) {
    lines.push(context.historyContext)
    lines.push('')
  }

  // 判断上下文是否稀疏
  const isSparseContext = !context.tasksContext && !context.historyContext
  const hasMinimalTasks = context.tasksContext && context.tasksContext.includes('0/0')

  if (isSparseContext || hasMinimalTasks) {
    lines.push('提示：当前上下文较少，请生成更加开放和多元的问题。可以探索：')
    lines.push('- 身体状态和能量水平')
    lines.push('- 最近的人际互动')
    lines.push('- 正在思考的问题或困惑')
    lines.push('- 最近让你感到开心或困扰的事')
    lines.push('- 对未来的期待或计划')
    lines.push('')
  }

  lines.push('请根据用户的指导方向，结合以上信息，生成 3 个个性化的引导问题。')
  lines.push('记住：三个问题应该各有特色，不要雷同，也不要按固定套路出题。')

  return lines.join('\n')
}

export function buildTitleUserPrompt(context) {
  const lines = []

  // 时间上下文，增加特殊时刻提示
  let timeDesc = `${context.timeContext.dayOfWeek} ${context.timeContext.timeOfDay}`
  if (context.timeContext.isLateNight) {
    timeDesc += '（夜深了，这是一个安静的时刻）'
  } else if (context.timeContext.isEarlyMorning) {
    timeDesc += '（新的一天刚开始）'
  }
  lines.push(`当前时间：${timeDesc}`)
  lines.push('')

  if (context.tasksContext) {
    lines.push(context.tasksContext)
    lines.push('')
  }

  if (context.historyContext) {
    lines.push(context.historyContext)
    lines.push('')
  }

  // 判断上下文是否稀疏
  const isSparseContext = !context.tasksContext && !context.historyContext
  const hasMinimalTasks = context.tasksContext && context.tasksContext.includes('0/0')

  if (isSparseContext || hasMinimalTasks) {
    lines.push('提示：当前上下文较少，请生成一个开放性的、有意境的标题，不必围绕具体任务。')
    lines.push('')
  }

  lines.push('请根据用户的指导方向，结合以上信息，为今天的日记生成一个简短的标题（4-12 个字）。')

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

    // 不再强制分类，统一使用 'prompt' 类型
    return lines.slice(0, 3).map((text, index) => ({
      id: String(index + 1),
      text: text,
      category: 'prompt',
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
      .slice(0, 12) // 限制最多 12 个字

    if (title.length < 4) { // 最少 4 个字
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
  // 多组降级问题，随机选择
  // 每组问题不再按固定顺序，统一使用 'prompt' 类型
  const fallbackSets = [
    [
      '此刻你的心情如何？用一个词来形容',
      '今天有什么让你停下来思考的瞬间？',
      '如果今天的经历是一个故事，它的主题是什么？'
    ],
    [
      '现在的你，身体和心灵分别在哪里？',
      '今天有什么事情你想记住，但怕会忘记？',
      '今天的你，想对明天的自己说什么？'
    ],
    [
      '如果给此刻的状态打个分，你会打几分？',
      '今天最让你感到意外的事情是什么？',
      '这件事让你对自己有什么新的认识？'
    ],
    [
      '最近有什么事情一直在你脑海里盘旋？',
      '今天你和谁有过有意义的交流？',
      '此刻你的身体在告诉你什么？'
    ],
    [
      '如果可以重来，今天你���做什么不同的选择？',
      '最近有什么让你感到感恩的事情？',
      '你现在最想逃避的是什么？'
    ],
    [
      '今天有什么小事让你微笑了？',
      '你最近在担心什么？',
      '如果明天是全新的开始，你想改变什么？'
    ]
  ]

  // 随机选择一组
  const selectedSet = fallbackSets[Math.floor(Math.random() * fallbackSets.length)]

  return selectedSet.map((text, index) => ({
    id: `fallback-${index + 1}`,
    text: text,
    category: 'prompt',
    source: 'fallback',
    dismissed: false,
    inserted: false
  }))
}

// ============================================================
// Task Recommendation Prompt
// ============================================================

export function buildTaskRecommendSystemPrompt() {
  return `你是一个任务优先级分析助手。你的任务是帮助用户从待办事项中选出最应该优先处理的 3 个任务。

分析原则：
1. 紧急性：过期任务 > 今天到期 > 即将到期 > 无截止日期
2. 重要性：根据任务标题判断任务的重要程度
3. 可行性：考虑当前时间，选择适合现在做的任务
4. 心理负担：拖延较久的任务应该优先处理，减轻心理负担

输出格式（纯文本，每行一个任务 ID）：
任务ID1
任务ID2
任务ID3

注意：
- 直接输出任务 ID，不要添加序号、标点或其他格式
- 如果任务少于 3 个，输出所有任务 ID
- 按推荐优先级排序，最重要的在第一行`
}

export function buildTaskRecommendUserPrompt(tasks, timeContext) {
  const lines = []

  // 时间上下文
  lines.push(`当前时间：${timeContext.dayOfWeek} ${timeContext.timeOfDay}`)
  lines.push('')

  // 任务列表
  lines.push('待处理任务：')
  tasks.forEach(task => {
    const dueInfo = task.dueDate
      ? `截止: ${new Date(task.dueDate).toLocaleDateString('zh-CN')}`
      : '无截止日期'
    const createdDays = Math.floor((Date.now() - task.createdAt) / (24 * 60 * 60 * 1000))
    const createdInfo = createdDays > 0 ? `创建于 ${createdDays} 天前` : '今天创建'
    lines.push(`- ID: ${task.id}`)
    lines.push(`  标题: ${task.title}`)
    lines.push(`  ${dueInfo} | ${createdInfo}`)
  })
  lines.push('')

  lines.push('请从以上任务中选出最应该优先处理的 3 个任务（按优先级排序）。')

  return lines.join('\n')
}

export function parseTaskRecommendResponse(response, tasks) {
  try {
    // 按行分割，提取任务 ID
    const ids = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 3)

    // 根据 ID 找到对应的任务
    const recommended = []
    for (const id of ids) {
      const task = tasks.find(t => t.id === id)
      if (task) {
        recommended.push(task)
      }
    }

    return recommended
  } catch (error) {
    console.error('Failed to parse task recommend response:', error)
    return []
  }
}

// 本地排序降级方案
export function getLocalRecommendedTasks(tasks, count = 3) {
  const now = Date.now()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStart = today.getTime()

  // 计算任务优先级分数
  const scored = tasks.map(task => {
    let score = 0

    // 过期任务优先级最高
    if (task.dueDate && task.dueDate < todayStart) {
      const daysOverdue = Math.floor((todayStart - task.dueDate) / (24 * 60 * 60 * 1000))
      score += 1000 + daysOverdue * 10
    }
    // 今天到期
    else if (task.dueDate && task.dueDate < todayStart + 24 * 60 * 60 * 1000) {
      score += 500
    }
    // 有截止日期
    else if (task.dueDate) {
      const daysUntilDue = Math.floor((task.dueDate - now) / (24 * 60 * 60 * 1000))
      score += Math.max(0, 100 - daysUntilDue * 5)
    }

    // 创建时间越久，优先级越高（减轻心理负担）
    const daysOld = Math.floor((now - task.createdAt) / (24 * 60 * 60 * 1000))
    score += Math.min(daysOld * 2, 50)

    return { task, score }
  })

  // 按分数排序，取前 N 个
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.task)
}
