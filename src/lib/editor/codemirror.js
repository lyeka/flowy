/**
 * [INPUT]: CodeMirror state/view/markdown, markdownWysiwyg, React refs, CSS var --font-serif
 * [OUTPUT]: createMarkdownEditor + helpers for syncing/editor insertion
 * [POS]: Editor wrapper to isolate CodeMirror init/update details, Typora 风格始终启用 WYSIWYG
 * [PROTOCOL]: Update this header on change, then check CLAUDE.md
 */

import { Compartment, EditorState } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap } from '@codemirror/commands'
import { markdown } from '@codemirror/lang-markdown'
import { markdownWysiwyg } from './markdown'

const toStringSafe = (value) => (value == null ? '' : String(value))

export const createMarkdownEditor = ({
  parent,
  value,
  onChangeRef,
  placeholderText
}) => {
  const placeholderCompartment = new Compartment()
  // ============================================================
  // 编辑器主题：字体与项目一致（Signifier 衬线字体）
  // ============================================================
  const focusTheme = EditorView.theme({
    '&': {
      outline: 'none',
      fontFamily: 'var(--font-serif)'
    },
    '&.cm-focused': {
      outline: 'none'
    },
    '.cm-content': {
      outline: 'none',
      fontFamily: 'var(--font-serif)'
    },
    '.cm-scroller': {
      outline: 'none',
      fontFamily: 'var(--font-serif)'
    }
  })

  const updateListener = EditorView.updateListener.of((update) => {
    if (!update.docChanged) return
    const nextValue = update.state.doc.toString()
    if (onChangeRef?.current) {
      onChangeRef.current(nextValue)
    }
  })

  const state = EditorState.create({
    doc: toStringSafe(value),
    extensions: [
      EditorView.lineWrapping,
      markdown(),
      keymap.of(defaultKeymap),
      updateListener,
      focusTheme,
      EditorView.contentAttributes.of({
        spellcheck: 'false',
        'data-gramm': 'false'
      }),
      placeholderCompartment.of(placeholder(toStringSafe(placeholderText))),
      markdownWysiwyg()
    ]
  })

  const view = new EditorView({ state, parent })

  const setValue = (nextValue) => {
    const next = toStringSafe(nextValue)
    const current = view.state.doc.toString()
    if (next === current) return
    view.dispatch({ changes: { from: 0, to: current.length, insert: next } })
  }

  const setPlaceholder = (text) => {
    view.dispatch({
      effects: placeholderCompartment.reconfigure(placeholder(toStringSafe(text)))
    })
  }

  const destroy = () => {
    view.destroy()
  }

  return { view, setValue, setPlaceholder, destroy }
}

export const insertTextAtSelection = (view, text) => {
  if (!view) return
  const insertText = toStringSafe(text)
  const selection = view.state.selection.main
  const from = selection.from
  const to = selection.to
  const nextCursor = from + insertText.length
  view.dispatch({
    changes: { from, to, insert: insertText },
    selection: { anchor: nextCursor },
    scrollIntoView: true
  })
  view.focus()
}

export const getEditorSelection = (view) => {
  if (!view) return { from: 0, to: 0 }
  const selection = view.state.selection.main
  return { from: selection.from, to: selection.to }
}
