'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import type { DefaultDifficulty, DefaultMode } from '../settings-client.types'

interface GameplaySectionProps {
  defaultMode: DefaultMode
  setDefaultMode: Dispatch<SetStateAction<DefaultMode>>
  defaultDifficulty: DefaultDifficulty
  setDefaultDifficulty: Dispatch<SetStateAction<DefaultDifficulty>>
  onSave: () => void
}

export function GameplaySection({
  defaultMode,
  setDefaultMode,
  defaultDifficulty,
  setDefaultDifficulty,
  onSave,
}: GameplaySectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Gameplay</h2>
      {/* TODO: prefill mode/difficulty selectors in all quiz-start entry points from saved preferences. */}
      <p className="mb-3 text-sm text-muted-foreground">
        Defaults are saved now. Wiring defaults into all quiz start surfaces remains a follow-up.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="settings-default-mode" className="text-sm font-medium">
            Default mode
          </label>
          <select
            id="settings-default-mode"
            value={defaultMode}
            onChange={(event) => setDefaultMode(event.target.value as typeof defaultMode)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="CLASSIC">Classic</option>
            <option value="TIMED">Timed</option>
            <option value="SURVIVAL">Survival</option>
            <option value="DAILY">Daily</option>
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="settings-default-difficulty" className="text-sm font-medium">
            Default difficulty
          </label>
          <select
            id="settings-default-difficulty"
            value={defaultDifficulty}
            onChange={(event) =>
              setDefaultDifficulty(event.target.value as typeof defaultDifficulty)
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="ANY">Any</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>
      <Button className="mt-4" onClick={onSave}>
        Save preferences
      </Button>
    </section>
  )
}
