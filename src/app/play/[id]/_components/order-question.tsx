'use client'

import { useState } from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Choice } from '../play-view.types'

interface OrderQuestionProps {
  choices: Choice[]
  isAnswered: boolean
  /** Correct 1-based position per choice id — server reveal, post-answer. */
  positions?: Record<string, number>
  onSubmit: (orderedChoiceIds: string[]) => void
}

/** ORDER — arrange items into the correct sequence using move buttons. */
export function OrderQuestion({ choices, isAnswered, positions, onSubmit }: OrderQuestionProps) {
  const [ordered, setOrdered] = useState<Choice[]>(choices)

  const move = (index: number, delta: -1 | 1) => {
    if (isAnswered) return
    const target = index + delta
    if (target < 0 || target >= ordered.length) return
    const next = [...ordered]
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrdered(next)
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-2">
        {ordered.map((choice, index) => {
          const correctPosition = positions?.[choice.id] ?? null
          const isExact = isAnswered && correctPosition === index + 1
          return (
            <li
              key={choice.id}
              className={cn(
                'flex items-center gap-3 rounded-md border p-3 text-sm font-medium transition-colors',
                isAnswered && positions
                  ? isExact
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                    : 'border-destructive bg-destructive/10 text-destructive'
                  : 'border-border bg-card'
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-xs font-bold">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">{choice.text}</span>
              {isAnswered ? (
                !isExact && correctPosition !== null ? (
                  <span className="shrink-0 text-xs font-semibold">→ #{correctPosition}</span>
                ) : null
              ) : (
                <span className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move "${choice.text}" up`}
                    className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === ordered.length - 1}
                    aria-label={`Move "${choice.text}" down`}
                    className="rounded border border-border p-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {!isAnswered && (
        <div className="flex justify-end">
          <Button onClick={() => onSubmit(ordered.map((c) => c.id))} variant="accent">
            Submit Order
          </Button>
        </div>
      )}
    </div>
  )
}
