'use client'

import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question } from '../play-view.types'

interface GroupsQuestionProps {
  question: Question
  isAnswered: boolean
  onSubmit: (groups: string[][]) => void
}

interface GroupDef {
  key: string
  label: string
}

const GROUP_COLORS = [
  'border-quiz-green/60 bg-quiz-green/15',
  'border-primary/60 bg-primary/15',
  'border-warning/60 bg-warning/15',
  'border-quiz-orange/60 bg-quiz-orange/15',
]

function metaOf(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

/** GROUPS (Connections) — find the groups of related tiles. */
export function GroupsQuestion({ question, isAnswered, onSubmit }: GroupsQuestionProps) {
  const groups = useMemo<GroupDef[]>(() => {
    const raw = metaOf(question.meta).groups
    if (!Array.isArray(raw)) return []
    return raw
      .map((g) => {
        const record = metaOf(g)
        return {
          key: typeof record.key === 'string' ? record.key : '',
          label: typeof record.label === 'string' ? record.label : '',
        }
      })
      .filter((g) => g.key)
  }, [question.meta])

  const groupSize = groups.length > 0 ? Math.floor(question.choices.length / groups.length) : 4
  const maxMistakes = (() => {
    const raw = metaOf(question.meta).maxMistakes
    return typeof raw === 'number' && raw >= 1 ? raw : 4
  })()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [solved, setSolved] = useState<Array<{ key: string; ids: string[] }>>([])
  const [mistakes, setMistakes] = useState(0)
  const [shake, setShake] = useState(false)
  const submittedRef = useRef(false)

  const solvedIds = useMemo(() => new Set(solved.flatMap((s) => s.ids)), [solved])
  const remainingChoices = question.choices.filter((c) => !solvedIds.has(c.id))

  const groupKeyOf = (choiceId: string) => {
    const choice = question.choices.find((c) => c.id === choiceId)
    const key = metaOf(choice?.meta).groupKey
    return typeof key === 'string' ? key : null
  }

  const finish = (finalSolved: Array<{ key: string; ids: string[] }>) => {
    if (submittedRef.current) return
    submittedRef.current = true
    const solvedGroups = finalSolved.map((s) => s.ids)
    const leftoverIds = question.choices
      .map((c) => c.id)
      .filter((id) => !finalSolved.some((s) => s.ids.includes(id)))
    // Chunk leftovers so partial progress is preserved in the submission
    const leftoverGroups: string[][] = []
    for (let i = 0; i < leftoverIds.length; i += groupSize) {
      leftoverGroups.push(leftoverIds.slice(i, i + groupSize))
    }
    onSubmit([...solvedGroups, ...leftoverGroups])
  }

  const toggleTile = (choiceId: string) => {
    if (isAnswered || submittedRef.current) return
    setSelectedIds((prev) =>
      prev.includes(choiceId)
        ? prev.filter((id) => id !== choiceId)
        : prev.length < groupSize
          ? [...prev, choiceId]
          : prev
    )
  }

  const checkGroup = () => {
    if (selectedIds.length !== groupSize || submittedRef.current) return
    const keys = selectedIds.map(groupKeyOf)
    const allSame = keys.every((k) => k !== null && k === keys[0])
    if (allSame) {
      const nextSolved = [...solved, { key: keys[0]!, ids: selectedIds }]
      setSolved(nextSolved)
      setSelectedIds([])
      if (nextSolved.length === groups.length) finish(nextSolved)
    } else {
      const nextMistakes = mistakes + 1
      setMistakes(nextMistakes)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setSelectedIds([])
      if (nextMistakes >= maxMistakes) finish(solved)
    }
  }

  const labelForKey = (key: string) => groups.find((g) => g.key === key)?.label || 'Group'
  const colorForKey = (key: string) => {
    const index = groups.findIndex((g) => g.key === key)
    return GROUP_COLORS[index % GROUP_COLORS.length]
  }

  return (
    <div className="space-y-4">
      {/* Solved groups */}
      {solved.map((entry) => (
        <div
          key={entry.key}
          className={cn('rounded-md border p-3 text-sm', colorForKey(entry.key))}
        >
          <p className="font-bold">{labelForKey(entry.key)}</p>
          <p className="text-muted-foreground">
            {entry.ids
              .map((id) => question.choices.find((c) => c.id === id)?.text)
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      ))}

      {/* Reveal unsolved groups after the round ends */}
      {isAnswered &&
        groups
          .filter((g) => !solved.some((s) => s.key === g.key))
          .map((group) => (
            <div
              key={group.key}
              className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm"
            >
              <p className="font-bold">{group.label || 'Group'} (missed)</p>
              <p className="text-muted-foreground">
                {question.choices
                  .filter((c) => metaOf(c.meta).groupKey === group.key)
                  .map((c) => c.text)
                  .join(', ')}
              </p>
            </div>
          ))}

      {/* Tile grid */}
      {!isAnswered && remainingChoices.length > 0 && (
        <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-4', shake && 'animate-pulse')}>
          {remainingChoices.map((choice) => {
            const selected = selectedIds.includes(choice.id)
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => toggleTile(choice.id)}
                aria-pressed={selected}
                className={cn(
                  'min-h-14 rounded-md border p-2 text-center text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:border-primary'
                )}
              >
                {choice.text}
              </button>
            )
          })}
        </div>
      )}

      {!isAnswered && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground" aria-live="polite">
            Mistakes: {mistakes} / {maxMistakes}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={selectedIds.length === 0}
              onClick={() => setSelectedIds([])}
            >
              Deselect
            </Button>
            <Button
              variant="accent"
              size="sm"
              disabled={selectedIds.length !== groupSize}
              onClick={checkGroup}
            >
              Check Group ({selectedIds.length}/{groupSize})
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
