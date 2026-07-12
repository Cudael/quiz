'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Choice } from '../play-view.types'

interface MatchQuestionProps {
  choices: Choice[]
  isAnswered: boolean
  /** Correct left/right pairings — server reveal, post-answer. */
  correctPairs?: Array<{ leftId: string; rightId: string }>
  onSubmit: (pairs: Array<{ leftId: string; rightId: string }>) => void
}

function metaOf(choice: Choice): Record<string, unknown> {
  return (choice.meta as Record<string, unknown> | null) ?? {}
}

/** MATCH — tap an item on the left, then its partner on the right. */
export function MatchQuestion({ choices, isAnswered, correctPairs, onSubmit }: MatchQuestionProps) {
  const left = useMemo(() => choices.filter((c) => metaOf(c).side === 'L'), [choices])
  const right = useMemo(() => choices.filter((c) => metaOf(c).side === 'R'), [choices])

  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null)
  const [pairedRightByLeft, setPairedRightByLeft] = useState<Record<string, string>>({})

  const rightToLeft = useMemo(() => {
    const map: Record<string, string> = {}
    for (const [leftId, rightId] of Object.entries(pairedRightByLeft)) map[rightId] = leftId
    return map
  }, [pairedRightByLeft])

  const allPaired = left.length > 0 && left.every((l) => pairedRightByLeft[l.id])

  const handleLeftClick = (leftId: string) => {
    if (isAnswered) return
    setSelectedLeftId((prev) => (prev === leftId ? null : leftId))
  }

  const handleRightClick = (rightId: string) => {
    if (isAnswered || !selectedLeftId) return
    setPairedRightByLeft((prev) => {
      const next = { ...prev }
      // Free this right item if it was paired elsewhere
      for (const [l, r] of Object.entries(next)) {
        if (r === rightId) delete next[l]
      }
      next[selectedLeftId] = rightId
      return next
    })
    setSelectedLeftId(null)
  }

  const isPairCorrect = (leftId: string, rightId: string) => {
    return (correctPairs ?? []).some((p) => p.leftId === leftId && p.rightId === rightId)
  }

  const correctPartnerText = (leftChoice: Choice) => {
    const pair = (correctPairs ?? []).find((p) => p.leftId === leftChoice.id)
    if (!pair) return ''
    return right.find((r) => r.id === pair.rightId)?.text ?? ''
  }

  const pairNumberByRightId = (rightId: string) => {
    const leftId = rightToLeft[rightId]
    if (!leftId) return null
    const index = left.findIndex((l) => l.id === leftId)
    return index === -1 ? null : index + 1
  }

  return (
    <div className="space-y-4">
      {!isAnswered ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            {left.map((choice, index) => {
              const paired = !!pairedRightByLeft[choice.id]
              const selected = selectedLeftId === choice.id
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleLeftClick(choice.id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    selected
                      ? 'border-primary bg-primary/10'
                      : paired
                        ? 'border-quiz-green/50 bg-quiz-green/10'
                        : 'border-border bg-card hover:border-primary'
                  )}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">{choice.text}</span>
                </button>
              )
            })}
          </div>
          <div className="space-y-2">
            {right.map((choice) => {
              const pairNumber = pairNumberByRightId(choice.id)
              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={() => handleRightClick(choice.id)}
                  disabled={!selectedLeftId && pairNumber === null}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md border p-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pairNumber !== null
                      ? 'border-quiz-green/50 bg-quiz-green/10'
                      : selectedLeftId
                        ? 'border-border bg-card hover:border-primary'
                        : 'border-border bg-card opacity-70'
                  )}
                >
                  <span className="min-w-0 flex-1">{choice.text}</span>
                  {pairNumber !== null && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border border-quiz-green/60 text-xs font-bold text-quiz-green">
                      {pairNumber}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {left.map((choice) => {
            const rightId = pairedRightByLeft[choice.id]
            const rightChoice = right.find((r) => r.id === rightId)
            const pending = !correctPairs
            const correct = rightId ? isPairCorrect(choice.id, rightId) : false
            return (
              <li
                key={choice.id}
                className={cn(
                  'flex flex-wrap items-center gap-2 rounded-md border p-3 text-sm font-medium',
                  pending
                    ? 'border-border bg-card'
                    : correct
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                      : 'border-destructive bg-destructive/10 text-destructive'
                )}
              >
                <span className="min-w-0">{choice.text}</span>
                <span aria-hidden>→</span>
                <span className="min-w-0">{rightChoice?.text ?? '—'}</span>
                {!pending && !correct && (
                  <span className="ml-auto text-xs font-semibold">
                    Correct: {correctPartnerText(choice)}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {!isAnswered && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {selectedLeftId
              ? 'Now tap the matching item on the right.'
              : 'Tap an item on the left to start a pair.'}
          </p>
          <Button
            variant="accent"
            disabled={!allPaired}
            onClick={() =>
              onSubmit(
                Object.entries(pairedRightByLeft).map(([leftId, rightId]) => ({ leftId, rightId }))
              )
            }
          >
            Submit Pairs
          </Button>
        </div>
      )}
    </div>
  )
}
