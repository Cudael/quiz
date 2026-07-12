'use client'

import { useMemo, useState } from 'react'
import { Delete } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AnswerFeedback, Question } from '../play-view.types'

interface AnagramQuestionProps {
  question: Question
  isAnswered: boolean
  /** Server feedback — carries correctness and the revealed answer. */
  feedback?: AnswerFeedback
  onSubmit: (textAnswer: string) => void
}

interface Tile {
  id: number
  char: string
}

/** ANAGRAM — unscramble letter tiles to form the answer. The scrambled
 *  tiles are provided by the server; the answer itself is never sent. */
export function AnagramQuestion({
  question,
  isAnswered,
  feedback,
  onSubmit,
}: AnagramQuestionProps) {
  const meta = (question.meta ?? {}) as Record<string, unknown>

  const tiles = useMemo<Tile[]>(() => {
    const raw = Array.isArray(meta.tiles) ? meta.tiles : []
    return raw
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
      .map((char, id) => ({ id, char }))
  }, [meta.tiles])

  const [usedTileIds, setUsedTileIds] = useState<number[]>([])

  const composed = usedTileIds.map((id) => tiles.find((t) => t.id === id)?.char ?? '').join('')

  const handleTile = (tile: Tile) => {
    if (isAnswered || usedTileIds.includes(tile.id)) return
    setUsedTileIds((prev) => [...prev, tile.id])
  }

  const handleBackspace = () => {
    if (isAnswered) return
    setUsedTileIds((prev) => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (!composed) return
    onSubmit(composed)
  }

  const wasCorrect = isAnswered && feedback?.isCorrect === true
  const primaryAnswer = feedback?.reveal.acceptedAnswers[0] ?? ''

  return (
    <div className="space-y-4">
      {/* Composed answer */}
      <div
        className={cn(
          'flex min-h-13 flex-wrap items-center gap-1.5 rounded-md border p-3',
          isAnswered && feedback
            ? wasCorrect
              ? 'border-emerald-500 bg-emerald-500/15'
              : 'border-destructive bg-destructive/10'
            : 'border-border bg-card'
        )}
        aria-live="polite"
        aria-label={`Your answer so far: ${composed || 'empty'}`}
      >
        {composed ? (
          composed.split('').map((char, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-background text-base font-bold"
            >
              {char}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">Tap the letters below…</span>
        )}
        {!isAnswered && composed && (
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Remove last letter"
            className="ml-auto rounded border border-border p-2 text-muted-foreground hover:text-destructive"
          >
            <Delete className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Letter tiles */}
      {!isAnswered && (
        <div className="flex flex-wrap gap-1.5">
          {tiles.map((tile) => {
            const used = usedTileIds.includes(tile.id)
            return (
              <button
                key={tile.id}
                type="button"
                onClick={() => handleTile(tile)}
                disabled={used}
                aria-label={`Letter ${tile.char}${used ? ' (used)' : ''}`}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-md border text-lg font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  used
                    ? 'border-border bg-muted/40 text-muted-foreground opacity-30'
                    : 'border-border bg-card hover:border-primary hover:bg-primary/5'
                )}
              >
                {tile.char}
              </button>
            )
          })}
        </div>
      )}

      {isAnswered && !wasCorrect && primaryAnswer && (
        <p className="text-sm">
          Correct answer: <span className="font-bold">{primaryAnswer}</span>
        </p>
      )}

      {!isAnswered && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            variant="accent"
            disabled={usedTileIds.length !== tiles.length}
          >
            Submit Answer
          </Button>
        </div>
      )}
    </div>
  )
}
