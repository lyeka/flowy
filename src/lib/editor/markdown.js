/**
 * [INPUT]: CodeMirror view/state, IME composition state, editor store
 * [OUTPUT]: Markdown decorations + toolbar commands
 * [POS]: Typora 风格 Markdown WYSIWYG，光标所在行显示原始语法，离开后渲染效果
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { RangeSetBuilder } from '@codemirror/state'
import { Decoration, ViewPlugin, WidgetType } from '@codemirror/view'
import { getBullet } from '@/stores/editor'

class BulletWidget extends WidgetType {
  toDOM() {
    const span = document.createElement('span')
    span.className = 'cm-md-bullet'
    span.textContent = getBullet()
    return span
  }
}

const hiddenMark = Decoration.mark({ class: 'cm-md-hidden' })
const boldMark = Decoration.mark({ class: 'cm-md-bold cm-md-formatted' })

const listLine = Decoration.line({ class: 'cm-md-list cm-md-formatted' })
const quoteLine = Decoration.line({ class: 'cm-md-quote cm-md-formatted' })
const h1Line = Decoration.line({ class: 'cm-md-heading cm-md-h1 cm-md-formatted' })
const h2Line = Decoration.line({ class: 'cm-md-heading cm-md-h2 cm-md-formatted' })
const h3Line = Decoration.line({ class: 'cm-md-heading cm-md-h3 cm-md-formatted' })

const bulletReplace = Decoration.replace({ widget: new BulletWidget() })

const boldPattern = /\*\*([^*]+)\*\*/g

const buildDecorations = (view) => {
  const builder = new RangeSetBuilder()
  const doc = view.state.doc

  // Typora 风格：获取光标所在行号，该行显示原始 Markdown 语法
  const cursorLine = doc.lineAt(view.state.selection.main.head).number

  for (const range of view.visibleRanges) {
    let pos = range.from
    while (pos <= range.to) {
      const line = doc.lineAt(pos)

      // 跳过光标所在行 - Typora 风格核心
      if (line.number === cursorLine) {
        pos = line.to + 1
        continue
      }

      const text = line.text

      const headingMatch = text.match(/^(#{1,3})\s+/)
      if (headingMatch) {
        const hashes = headingMatch[1].length
        if (hashes === 1) builder.add(line.from, line.from, h1Line)
        if (hashes === 2) builder.add(line.from, line.from, h2Line)
        if (hashes === 3) builder.add(line.from, line.from, h3Line)
        builder.add(line.from, line.from + headingMatch[0].length, hiddenMark)
      }

      if (text.startsWith('- ')) {
        builder.add(line.from, line.from, listLine)
        builder.add(line.from, line.from + 2, bulletReplace)
      }

      if (text.startsWith('> ')) {
        builder.add(line.from, line.from, quoteLine)
        builder.add(line.from, line.from + 2, hiddenMark)
      }

      boldPattern.lastIndex = 0
      let match = boldPattern.exec(text)
      while (match) {
        const start = line.from + match.index
        const openFrom = start
        const openTo = start + 2
        const textFrom = openTo
        const textTo = textFrom + match[1].length
        const closeFrom = textTo
        const closeTo = closeFrom + 2

        builder.add(openFrom, openTo, hiddenMark)
        builder.add(textFrom, textTo, boldMark)
        builder.add(closeFrom, closeTo, hiddenMark)

        match = boldPattern.exec(text)
      }

      if (line.to >= range.to) break
      pos = line.to + 1
    }
  }

  return builder.finish()
}

// ------------------------------------------------------------
// WYSIWYG 装饰插件：保持光标稳定
// ------------------------------------------------------------
export const markdownWysiwyg = () =>
  ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = buildDecorations(view)
      }

      update(update) {
        // IME 输入期间不更新装饰
        if (update.view.composing) {
          return
        }

        // 文档变化、视口变化、选区变化时同步更新装饰
        // 选区变化触发 Typora 风格：光标移动时重新计算哪行显示原始语法
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
          this.decorations = buildDecorations(update.view)
        }
      }
    },
    {
      decorations: (value) => value.decorations
    }
  )

const applyChanges = (view, changes) => {
  if (!view || changes.length === 0) return
  view.dispatch({ changes })
  view.focus()
}

export const toggleBold = (view) => {
  if (!view) return
  const doc = view.state.doc
  const selection = view.state.selection.main
  const from = selection.from
  const to = selection.to

  const before = doc.sliceString(Math.max(0, from - 2), from)
  const after = doc.sliceString(to, Math.min(doc.length, to + 2))

  if (from !== to && before === '**' && after === '**') {
    applyChanges(view, [
      { from: from - 2, to: from, insert: '' },
      { from: to, to: to + 2, insert: '' }
    ])
    return
  }

  if (from === to) {
    view.dispatch({
      changes: { from, to, insert: '****' },
      selection: { anchor: from + 2 }
    })
    view.focus()
    return
  }

  applyChanges(view, [{ from, to, insert: `**${doc.sliceString(from, to)}**` }])
}

const toggleLinePrefix = (view, prefix) => {
  if (!view) return
  const doc = view.state.doc
  const selection = view.state.selection.main
  const from = selection.from
  const to = selection.to

  const lines = []
  let pos = from
  while (pos <= to) {
    const line = doc.lineAt(pos)
    lines.push(line)
    if (line.to + 1 > to) break
    pos = line.to + 1
  }

  const shouldRemove = lines.every((line) => line.text.startsWith(prefix))
  const changes = lines.map((line) => {
    if (shouldRemove) {
      return { from: line.from, to: line.from + prefix.length, insert: '' }
    }
    return { from: line.from, to: line.from, insert: prefix }
  })

  applyChanges(view, changes)
}

export const toggleList = (view) => toggleLinePrefix(view, '- ')

export const toggleQuote = (view) => toggleLinePrefix(view, '> ')

// ------------------------------------------------------------
// 标题循环切换：# -> ## -> ### -> 无 -> #
// 前导空格保留，只处理标题部分
// ------------------------------------------------------------
export const cycleHeading = (view) => {
  if (!view) return
  const doc = view.state.doc
  const selection = view.state.selection.main
  const line = doc.lineAt(selection.from)

  // 统一 trim 前导空格，保留原始行信息用于计算位置
  const trimmed = line.text.trimStart()
  const leadingSpaceLength = line.text.length - trimmed.length

  // 判断当前标题级别，确定下一级
  let nextPrefix = '# '
  if (trimmed.startsWith('# ')) {
    nextPrefix = '## '
  } else if (trimmed.startsWith('## ')) {
    nextPrefix = '### '
  } else if (trimmed.startsWith('### ')) {
    nextPrefix = ''
  }

  // 计算当前标题前缀长度（不包括前导空格）
  const currentPrefixMatch = trimmed.match(/^(#{1,3})\s/)
  const currentPrefixLength = currentPrefixMatch
    ? currentPrefixMatch[0].length
    : 0

  // 替换范围：前导空格保留，只替换标题前缀
  const from = line.from + leadingSpaceLength
  const to = from + currentPrefixLength

  applyChanges(view, [{
    from,
    to,
    insert: nextPrefix
  }])
}

// ------------------------------------------------------------
// 命令注册表：开闭原则，新增命令无需修改消费者
// ------------------------------------------------------------
export const markdownCommands = {
  bold: toggleBold,
  list: toggleList,
  quote: toggleQuote,
  heading: cycleHeading,
}
