'use client'

import { useEffect, useRef } from 'react'

type HotkeyHandlers = {
  goHome: () => void
  goCategories: () => void
  goLeaderboard: () => void
  goStudio: () => void
  goProfile: () => void
  openShortcuts: () => void
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

export function useHotkeys(handlers: HotkeyHandlers) {
  const pendingRef = useRef<string | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    const clearPending = () => {
      pendingRef.current = null
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const typing = isTypingTarget(event.target)

      if ((key === '?' || (key === '/' && event.shiftKey)) && !typing) {
        event.preventDefault()
        handlers.openShortcuts()
        clearPending()
        return
      }

      if (key === '/' && !typing) {
        const search = document.querySelector<HTMLInputElement>('[data-global-search="true"]')
        if (search) {
          event.preventDefault()
          search.focus()
          search.select()
        }
        clearPending()
        return
      }

      if (typing) return

      if (pendingRef.current === 'g') {
        if (key === 'h') handlers.goHome()
        if (key === 'c') handlers.goCategories()
        if (key === 'l') handlers.goLeaderboard()
        if (key === 's') handlers.goStudio()
        if (key === 'p') handlers.goProfile()
        clearPending()
        return
      }

      if (key === 'g') {
        pendingRef.current = 'g'
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
        timeoutRef.current = window.setTimeout(clearPending, 900)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      clearPending()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [handlers])
}
