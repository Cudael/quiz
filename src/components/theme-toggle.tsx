'use client'

import { useCallback, useSyncExternalStore } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from './theme-provider'
import { Button } from './ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'

  const cycle = useCallback(() => {
    if (theme === 'light') {
      setTheme('dark')
      return
    }
    if (theme === 'dark') {
      setTheme('system')
      return
    }
    setTheme('light')
  }, [setTheme, theme])
  const Icon = (() => {
    if (!mounted) return Monitor
    if (theme === 'light') return Sun
    if (theme === 'dark') return Moon
    return Monitor
  })()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Switch theme (current: ${mounted ? theme : 'system'}, next: ${mounted ? nextTheme : 'light'})`}
      suppressHydrationWarning
    >
      <Icon className="h-5 w-5" />
    </Button>
  )
}
