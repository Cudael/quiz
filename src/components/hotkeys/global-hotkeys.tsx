'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { ShortcutsCheatsheet } from '@/components/hotkeys/shortcuts-cheatsheet'

interface ShortcutsContextValue {
  openShortcuts: () => void
}

const ShortcutsContext = createContext<ShortcutsContextValue | null>(null)

export function GlobalHotkeysProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  const openShortcuts = useCallback(() => setShortcutsOpen(true), [])
  const closeShortcuts = useCallback(() => setShortcutsOpen(false), [])

  useHotkeys({
    goHome: () => router.push('/'),
    goCategories: () => router.push('/categories'),
    goLeaderboard: () => router.push('/leaderboard'),
    goStudio: () => router.push('/studio'),
    goProfile: () => router.push('/me'),
    openShortcuts,
  })

  const value = useMemo(() => ({ openShortcuts }), [openShortcuts])

  return (
    <ShortcutsContext.Provider value={value}>
      {children}
      <ShortcutsCheatsheet open={shortcutsOpen} onClose={closeShortcuts} />
    </ShortcutsContext.Provider>
  )
}

export function useShortcutsModal() {
  const ctx = useContext(ShortcutsContext)
  if (!ctx) {
    throw new Error('useShortcutsModal must be used inside GlobalHotkeysProvider')
  }
  return ctx
}
