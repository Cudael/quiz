'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { AnswerFeedback, Question } from '../play-view.types'

interface NumberGuessQuestionProps {
  question: Question
  isAnswered: boolean
  /** Server feedback — carries the target number and earned credit. */
  feedback?: AnswerFeedback
  onSubmit: (value: number) => void
}

/** NUMBER_GUESS — pick a value on a slider; closest wins, ±tolerance = full credit. */
export function NumberGuessQuestion({
  question,
  isAnswered,
  feedback,
  onSubmit,
}: NumberGuessQuestionProps) {
  const meta = (question.meta ?? {}) as Record<string, unknown>
  const min = typeof meta.min === 'number' ? meta.min : 0
  const max = typeof meta.max === 'number' ? meta.max : 100
  const answer = feedback?.reveal.numberAnswer ?? null
  const unit = typeof meta.unit === 'string' ? meta.unit : ''
  const step = useMemo(() => {
    const range = max - min
    if (range <= 10) return 0.1
    if (range <= 1000) return 1
    return Math.pow(10, Math.floor(Math.log10(range)) - 2)
  }, [min, max])

  const [value, setValue] = useState<number>(Math.round((min + max) / 2))
  const [submittedValue, setSubmittedValue] = useState<number | null>(null)

  const format = (v: number) => `${v.toLocaleString()}${unit ? ` ${unit}` : ''}`

  const creditPct = isAnswered && feedback ? Math.round(feedback.credit * 100) : null

  const handleSubmit = () => {
    const clamped = Math.min(max, Math.max(min, value))
    setSubmittedValue(clamped)
    onSubmit(clamped)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-card p-4">
        <div className="mb-3 text-center">
          <span className="text-2xl font-bold tabular-nums">{format(value)}</span>
        </div>
        <input
          type="range"
          aria-label="Your guess"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={isAnswered}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-(--primary)"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label htmlFor={`number-guess-${question.id}`} className="text-sm text-muted-foreground">
            Or type it:
          </label>
          <input
            id={`number-guess-${question.id}`}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={isAnswered}
            onChange={(e) => {
              const parsed = Number(e.target.value)
              if (Number.isFinite(parsed)) setValue(parsed)
            }}
            className="w-40 rounded-md border border-border bg-background px-3 py-1.5 text-base tabular-nums disabled:opacity-60 md:text-sm"
          />
        </div>
      </div>

      {isAnswered && answer !== null && (
        <div className="rounded-md border border-border bg-muted/30 p-4 text-sm">
          <p>
            Correct answer: <span className="font-bold text-foreground">{format(answer)}</span>
          </p>
          {submittedValue !== null && (
            <p className="mt-1 text-muted-foreground">
              Your guess: {format(submittedValue)} (off by{' '}
              {Math.abs(submittedValue - answer).toLocaleString()}
              {unit ? ` ${unit}` : ''})
              {creditPct !== null && (
                <span className="ml-2 font-semibold text-foreground">{creditPct}% credit</span>
              )}
            </p>
          )}
        </div>
      )}

      {!isAnswered && (
        <div className="flex justify-end">
          <Button onClick={handleSubmit} variant="accent">
            Lock In Guess
          </Button>
        </div>
      )}
    </div>
  )
}
