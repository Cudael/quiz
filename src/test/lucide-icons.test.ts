import * as LucideIcons from 'lucide-react'
import { describe, expect, it } from 'vitest'

const usedIcons = [
  'AlertTriangle',
  'ArrowLeft',
  'ArrowRight',
  'BarChart3',
  'BookOpen',
  'Brain',
  'Calendar',
  'CheckCircle',
  'ChevronDown',
  'ChevronRight',
  'Clock',
  'Flag',
  'Flame',
  'Info',
  'Keyboard',
  'LogOut',
  'Medal',
  'Menu',
  'Monitor',
  'Moon',
  'Play',
  'Plus',
  'RotateCcw',
  'Search',
  'Settings2',
  'Share2',
  'ShieldX',
  'SkipForward',
  'SlidersHorizontal',
  'Sun',
  'Swords',
  'Trophy',
  'UserCircle2',
  'Users',
  'Volume2',
  'VolumeX',
  'X',
  'XCircle',
  'Zap',
] as const

describe('lucide icon imports', () => {
  it('exports every icon used in the codebase', () => {
    for (const iconName of usedIcons) {
      const icon = (LucideIcons as Record<string, unknown>)[iconName]
      expect(icon, `${iconName} should exist in lucide-react exports`).toBeDefined()
      const isComponentLike =
        typeof icon === 'function' ||
        (typeof icon === 'object' && icon !== null && '$$typeof' in icon)
      expect(isComponentLike, `${iconName} should be a valid React component export`).toBe(true)
    }
  })
})
