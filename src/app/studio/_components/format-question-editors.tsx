'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageUpload } from './image-upload'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

/**
 * Format-specific question editor bodies used inside QuestionCard.
 * Each editor mutates the draft via onUpdate(Partial<DraftQuestion>).
 */

interface EditorProps {
  question: DraftQuestion
  onUpdate: (updates: Partial<DraftQuestion>) => void
}

function makeChoice(overrides?: Partial<DraftChoice>): DraftChoice {
  return { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false, ...overrides }
}

function metaOf(question: DraftQuestion): Record<string, unknown> {
  return question.meta ?? {}
}

function updateMeta(question: DraftQuestion, patch: Record<string, unknown>) {
  return { meta: { ...metaOf(question), ...patch } }
}

const inputClass = 'w-full rounded-md border bg-background px-3 py-1.5 text-sm'
const labelClass = 'block text-sm font-medium'
const hintClass = 'text-xs text-muted-foreground'

// ---------------------------------------------------------------------------
// ORDER — items listed in the correct order
// ---------------------------------------------------------------------------

export function OrderChoicesEditor({ question, onUpdate }: EditorProps) {
  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= question.choices.length) return
    const next = [...question.choices]
    ;[next[index], next[target]] = [next[target], next[index]]
    onUpdate({ choices: next })
  }

  const updateText = (localId: string, text: string) => {
    onUpdate({
      choices: question.choices.map((c) => (c.localId === localId ? { ...c, text } : c)),
    })
  }

  return (
    <div className="space-y-2">
      <div>
        <p className={labelClass}>Items (in the correct order)</p>
        <p className={hintClass}>
          Top item = first. Items are shuffled automatically when the quiz is played.
        </p>
      </div>
      {question.choices.map((choice, index) => (
        <div key={choice.localId} className="flex items-center gap-2">
          <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">
            {index + 1}
          </span>
          <input
            type="text"
            value={choice.text}
            onChange={(e) => updateText(choice.localId, e.target.value)}
            placeholder={`Item ${index + 1}`}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => move(index, -1)}
            disabled={index === 0}
            aria-label={`Move item ${index + 1} up`}
            className="shrink-0 rounded border p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => move(index, 1)}
            disabled={index === question.choices.length - 1}
            aria-label={`Move item ${index + 1} down`}
            className="shrink-0 rounded border p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          {question.choices.length > 3 && (
            <button
              type="button"
              onClick={() =>
                onUpdate({ choices: question.choices.filter((c) => c.localId !== choice.localId) })
              }
              aria-label={`Remove item ${index + 1}`}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {question.choices.length < 8 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onUpdate({ choices: [...question.choices, makeChoice()] })}
        >
          + Add item
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MATCH — pair rows
// ---------------------------------------------------------------------------

export function MatchPairsEditor({ question, onUpdate }: EditorProps) {
  const pairKeys = Array.from(
    new Set(
      question.choices
        .map((c) => c.meta?.matchKey)
        .filter((k): k is string => typeof k === 'string')
    )
  )

  const choiceFor = (key: string, side: 'L' | 'R') =>
    question.choices.find((c) => c.meta?.matchKey === key && c.meta?.side === side)

  const updatePairText = (key: string, side: 'L' | 'R', text: string) => {
    onUpdate({
      choices: question.choices.map((c) =>
        c.meta?.matchKey === key && c.meta?.side === side ? { ...c, text } : c
      ),
    })
  }

  const addPair = () => {
    const key = `p${Date.now()}`
    onUpdate({
      choices: [
        ...question.choices,
        makeChoice({ meta: { side: 'L', matchKey: key } }),
        makeChoice({ meta: { side: 'R', matchKey: key } }),
      ],
    })
  }

  const removePair = (key: string) => {
    onUpdate({ choices: question.choices.filter((c) => c.meta?.matchKey !== key) })
  }

  return (
    <div className="space-y-2">
      <div>
        <p className={labelClass}>Pairs</p>
        <p className={hintClass}>
          Each row is one matching pair. The right column is shuffled during play.
        </p>
      </div>
      {pairKeys.map((key, index) => (
        <div key={key} className="flex items-center gap-2">
          <input
            type="text"
            value={choiceFor(key, 'L')?.text ?? ''}
            onChange={(e) => updatePairText(key, 'L', e.target.value)}
            placeholder={`Left ${index + 1} (e.g. country)`}
            aria-label={`Pair ${index + 1} left item`}
            className={inputClass}
          />
          <span className="shrink-0 text-muted-foreground" aria-hidden>
            ↔
          </span>
          <input
            type="text"
            value={choiceFor(key, 'R')?.text ?? ''}
            onChange={(e) => updatePairText(key, 'R', e.target.value)}
            placeholder={`Right ${index + 1} (e.g. capital)`}
            aria-label={`Pair ${index + 1} right item`}
            className={inputClass}
          />
          {pairKeys.length > 3 && (
            <button
              type="button"
              onClick={() => removePair(key)}
              aria-label={`Remove pair ${index + 1}`}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          )}
        </div>
      ))}
      {pairKeys.length < 8 && (
        <Button type="button" variant="outline" size="sm" onClick={addPair}>
          + Add pair
        </Button>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CONNECTIONS — group labels + tiles
// ---------------------------------------------------------------------------

export function GroupsBoardEditor({ question, onUpdate }: EditorProps) {
  const groups = Array.isArray(metaOf(question).groups)
    ? (metaOf(question).groups as Array<{ key: string; label?: string }>)
    : []

  const updateGroupLabel = (key: string, label: string) => {
    onUpdate(
      updateMeta(question, {
        groups: groups.map((g) => (g.key === key ? { ...g, label } : g)),
      })
    )
  }

  const updateTileText = (localId: string, text: string) => {
    onUpdate({
      choices: question.choices.map((c) => (c.localId === localId ? { ...c, text } : c)),
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className={labelClass}>Groups & tiles</p>
        <p className={hintClass}>
          Name each group and fill in its tiles. Tiles from all groups are mixed into one board
          during play.
        </p>
      </div>
      {groups.map((group, groupIndex) => {
        const tiles = question.choices.filter((c) => c.meta?.groupKey === group.key)
        return (
          <div key={group.key} className="space-y-2 rounded-md border p-3">
            <input
              type="text"
              value={group.label ?? ''}
              onChange={(e) => updateGroupLabel(group.key, e.target.value)}
              placeholder={`Group ${groupIndex + 1} name (e.g. "Shades of blue")`}
              aria-label={`Group ${groupIndex + 1} name`}
              className={`${inputClass} font-semibold`}
            />
            <div className="grid grid-cols-2 gap-2">
              {tiles.map((tile, tileIndex) => (
                <input
                  key={tile.localId}
                  type="text"
                  value={tile.text}
                  onChange={(e) => updateTileText(tile.localId, e.target.value)}
                  placeholder={`Tile ${tileIndex + 1}`}
                  aria-label={`Group ${groupIndex + 1} tile ${tileIndex + 1}`}
                  className={inputClass}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// NUMBER_GUESS — numeric fields
// ---------------------------------------------------------------------------

export function NumberGuessFields({ question, onUpdate }: EditorProps) {
  const meta = metaOf(question)
  const numberValue = (key: string) => {
    const value = meta[key]
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
  }
  const setNumber = (key: string, raw: string) => {
    const parsed = Number(raw)
    onUpdate(
      updateMeta(question, { [key]: raw === '' || !Number.isFinite(parsed) ? undefined : parsed })
    )
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>Answer & range</p>
        <p className={hintClass}>
          Players guess on a slider between min and max. Guesses within ± tolerance earn full
          points; closer guesses earn more partial credit.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ['answer', 'Correct answer'],
            ['min', 'Slider min'],
            ['max', 'Slider max'],
            ['tolerance', 'Tolerance (±)'],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <label htmlFor={`${key}-${question.localId}`} className="text-xs font-medium">
              {label}
            </label>
            <input
              id={`${key}-${question.localId}`}
              type="number"
              value={numberValue(key)}
              onChange={(e) => setNumber(key, e.target.value)}
              className={inputClass}
            />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label htmlFor={`unit-${question.localId}`} className="text-xs font-medium">
          Unit (optional, e.g. &quot;km&quot;, &quot;kg&quot;)
        </label>
        <input
          id={`unit-${question.localId}`}
          type="text"
          maxLength={20}
          value={typeof meta.unit === 'string' ? meta.unit : ''}
          onChange={(e) => onUpdate(updateMeta(question, { unit: e.target.value || undefined }))}
          className={`${inputClass} max-w-40`}
        />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// TYPE_ANSWER / ANAGRAM — accepted answers
// ---------------------------------------------------------------------------

export function TypeAnswerFields({ question, onUpdate }: EditorProps) {
  const meta = metaOf(question)
  const isAnagram = meta.anagram === true
  const accepted = Array.isArray(meta.acceptedAnswers)
    ? (meta.acceptedAnswers as unknown[]).filter((a): a is string => typeof a === 'string')
    : []

  if (isAnagram) {
    return (
      <div className="space-y-1">
        <label htmlFor={`answer-${question.localId}`} className={labelClass}>
          Solution
        </label>
        <p className={hintClass}>
          The letters of this word or phrase are scrambled into tiles during play.
        </p>
        <input
          id={`answer-${question.localId}`}
          type="text"
          maxLength={40}
          value={accepted[0] ?? ''}
          onChange={(e) =>
            onUpdate(
              updateMeta(question, {
                acceptedAnswers: e.target.value.trim() ? [e.target.value] : [],
              })
            )
          }
          placeholder="e.g. Elephant"
          className={inputClass}
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div>
        <label htmlFor={`accepted-${question.localId}`} className={labelClass}>
          Accepted answers
        </label>
        <p className={hintClass}>
          One per line. Matching ignores case, accents and punctuation — add common alternative
          spellings.
        </p>
      </div>
      <textarea
        id={`accepted-${question.localId}`}
        rows={3}
        value={accepted.join('\n')}
        onChange={(e) =>
          onUpdate(
            updateMeta(question, {
              acceptedAnswers: e.target.value.split('\n').filter((line) => line.trim().length > 0),
            })
          )
        }
        placeholder={'Mount Everest\nEverest'}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={meta.fuzzy === true}
          onChange={(e) => onUpdate(updateMeta(question, { fuzzy: e.target.checked }))}
        />
        Forgive small typos (one-letter mistakes in longer answers)
      </label>
    </div>
  )
}

// ---------------------------------------------------------------------------
// VERSUS — two options with values
// ---------------------------------------------------------------------------

export function VersusChoicesEditor({ question, onUpdate }: EditorProps) {
  const updateChoice = (localId: string, patch: { text?: string; value?: number | undefined }) => {
    const nextChoices = question.choices.map((c) =>
      c.localId === localId
        ? {
            ...c,
            ...(patch.text !== undefined ? { text: patch.text } : {}),
            ...(patch.value !== undefined || 'value' in patch
              ? { meta: { ...c.meta, value: patch.value } }
              : {}),
          }
        : c
    )
    // Auto-mark the option with the higher value as correct
    const values = nextChoices.map((c) =>
      typeof c.meta?.value === 'number' && Number.isFinite(c.meta.value) ? c.meta.value : null
    )
    const allSet = values.every((v) => v !== null) && values[0] !== values[1]
    const maxValue = allSet ? Math.max(...(values as number[])) : null
    onUpdate({
      choices: nextChoices.map((c, i) => ({
        ...c,
        isCorrect: maxValue !== null && values[i] === maxValue,
      })),
    })
  }

  return (
    <div className="space-y-2">
      <div>
        <p className={labelClass}>The two options</p>
        <p className={hintClass}>
          Enter each option and its value. The higher value is automatically the correct answer;
          both values are revealed after the player answers.
        </p>
      </div>
      {question.choices.map((choice, index) => (
        <div key={choice.localId} className="flex items-center gap-2">
          <input
            type="text"
            value={choice.text}
            onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
            placeholder={`Option ${index + 1}`}
            aria-label={`Option ${index + 1} name`}
            className={inputClass}
          />
          <input
            type="number"
            value={
              typeof choice.meta?.value === 'number' && Number.isFinite(choice.meta.value)
                ? String(choice.meta.value)
                : ''
            }
            onChange={(e) => {
              const parsed = Number(e.target.value)
              updateChoice(choice.localId, {
                value: e.target.value === '' || !Number.isFinite(parsed) ? undefined : parsed,
              })
            }}
            placeholder="Value"
            aria-label={`Option ${index + 1} value`}
            className={`${inputClass} max-w-32`}
          />
          {choice.isCorrect && (
            <span className="shrink-0 text-xs font-medium text-quiz-green">✓ higher</span>
          )}
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// AUDIO_CHOICE — audio clip URL
// ---------------------------------------------------------------------------

export function AudioUrlField({ question, onUpdate }: EditorProps) {
  const meta = metaOf(question)
  const audioUrl = typeof meta.audioUrl === 'string' ? meta.audioUrl : ''

  return (
    <div className="space-y-1">
      <label htmlFor={`audio-${question.localId}`} className={labelClass}>
        Audio clip URL
      </label>
      <p className={hintClass}>Direct link to an MP3/OGG file that plays with this question.</p>
      <input
        id={`audio-${question.localId}`}
        type="url"
        value={audioUrl}
        onChange={(e) => onUpdate(updateMeta(question, { audioUrl: e.target.value }))}
        placeholder="https://…/clip.mp3"
        className={inputClass}
      />
      {audioUrl.trim() ? <audio controls src={audioUrl} className="mt-1 h-9 w-full" /> : null}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MEMORY_FLASH — study material fields
// ---------------------------------------------------------------------------

export function MemoryFlashFields({ question, onUpdate }: EditorProps) {
  const meta = metaOf(question)
  const studyDurationMs = typeof meta.studyDurationMs === 'number' ? meta.studyDurationMs : 5000

  return (
    <div className="space-y-3">
      <div>
        <p className={labelClass}>Study material</p>
        <p className={hintClass}>
          Shown briefly before the question. Add a text, an image, or both. The study time counts
          toward the question timer, so keep the time limit generous.
        </p>
      </div>
      <textarea
        rows={2}
        maxLength={300}
        value={typeof meta.studyText === 'string' ? meta.studyText : ''}
        onChange={(e) => onUpdate(updateMeta(question, { studyText: e.target.value }))}
        placeholder="Text to memorize (optional if you add an image)…"
        aria-label="Study text"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <ImageUpload
        compact
        value={typeof meta.studyImageUrl === 'string' ? meta.studyImageUrl : ''}
        onChange={(url) => onUpdate(updateMeta(question, { studyImageUrl: url }))}
        label="Study image (optional)"
      />
      <div className="space-y-1">
        <p className="text-xs font-medium">Study time</p>
        <div className="flex gap-2">
          {[3000, 5000, 10000].map((ms) => (
            <button
              key={ms}
              type="button"
              onClick={() => onUpdate(updateMeta(question, { studyDurationMs: ms }))}
              className={`rounded-sm border px-3 py-1 text-xs font-medium transition-colors ${
                studyDurationMs === ms
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// IMAGE_REVEAL — question image + reveal style
// ---------------------------------------------------------------------------

export function ImageRevealFields({ question, onUpdate }: EditorProps) {
  const meta = metaOf(question)
  const reveal = typeof meta.reveal === 'string' ? meta.reveal : 'blur'

  return (
    <div className="space-y-3">
      <ImageUpload
        value={question.imageUrl}
        onChange={(url) => onUpdate({ imageUrl: url })}
        label="Question image (starts obscured)"
        aspectRatio="16/9"
      />
      <div className="space-y-1">
        <p className="text-xs font-medium">Reveal style</p>
        <div className="flex gap-2">
          {(
            [
              ['blur', 'Blur'],
              ['pixelate', 'Pixelate'],
              ['zoom', 'Zoom out'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdate(updateMeta(question, { reveal: value }))}
              className={`rounded-sm border px-3 py-1 text-xs font-medium transition-colors ${
                reveal === value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
