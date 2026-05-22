'use client'

import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme, type Theme } from './theme-provider'
import { Button } from './ui/button'

const themeCycle: Theme[] = ['light', 'dark', 'system']

const themeLabel: Record<Theme, string> = {
  light: 'light mode',
  dark: 'dark mode',
  system: 'system theme',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const currentTheme = theme
  const currentIndex = themeCycle.indexOf(currentTheme)
  const nextTheme = themeCycle[(currentIndex + 1) % themeCycle.length]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      aria-label={`Switch from ${themeLabel[currentTheme]} to ${themeLabel[nextTheme]}`}
      title={`Theme: ${themeLabel[currentTheme]}`}
      suppressHydrationWarning
    >
      {currentTheme === 'light' ? (
        <Sun className="h-5 w-5" />
      ) : currentTheme === 'dark' ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Monitor className="h-5 w-5" />
      )}
    </Button>
  )
}
