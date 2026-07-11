'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useTheme } from '@/components/theme/theme-provider'

interface AppearanceSectionProps {
  reducedMotion: boolean
  setReducedMotion: Dispatch<SetStateAction<boolean>>
}

export function AppearanceSection({ reducedMotion, setReducedMotion }: AppearanceSectionProps) {
  const { theme, setTheme } = useTheme()

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="settings-theme" className="text-sm font-medium">
            Theme
          </label>
          <select
            id="settings-theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as 'light' | 'dark' | 'system')}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
          Reduced motion
        </label>
      </div>
    </section>
  )
}
