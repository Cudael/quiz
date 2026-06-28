'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import type { DefaultDifficulty } from '../settings-client.types'

interface GameplaySectionProps {
  defaultDifficulty: DefaultDifficulty
  setDefaultDifficulty: Dispatch<SetStateAction<DefaultDifficulty>>
  onSave: () => void
}

export function GameplaySection({
  defaultDifficulty,
  setDefaultDifficulty,
  onSave,
}: GameplaySectionProps) {
  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Gameplay</h2>
      <div className="grid gap-3">
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
