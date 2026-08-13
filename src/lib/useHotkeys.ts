import { useEffect } from 'react'

type Handlers = Record<string, (e: KeyboardEvent) => void>

/**
 * Maps single keys (and Ctrl+key) to handlers. Keys are matched case-insensitively.
 * Use "ctrl+z" style strings for modifier combos. Ignores typing in inputs/textareas.
 */
export function useHotkeys(handlers: Handlers, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      const key = e.key.toLowerCase()
      const combo = `${e.ctrlKey || e.metaKey ? 'ctrl+' : ''}${key}`
      const handler = handlers[combo] || handlers[key]
      if (handler) {
        e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handlers, enabled])
}
