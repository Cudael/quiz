'use client'

import { cn } from '@/lib/utils'
import type { QuizFormat } from '@/store/quiz-creator-store'

function FormatPreview({ format }: { format: QuizFormat }) {
  if (format === 'CLASSIC') {
    return (
      <div className="flex h-[72px] flex-col gap-1.5 rounded-md bg-muted/40 p-2">
        <div className="h-2.5 w-3/4 rounded bg-muted-foreground/20" />
        <div className="mt-0.5 grid grid-cols-2 gap-1">
          <div className="h-6 rounded bg-muted-foreground/15" />
          <div className="h-6 rounded bg-quiz-green/25 ring-1 ring-quiz-green/40" />
          <div className="h-6 rounded bg-muted-foreground/15" />
          <div className="h-6 rounded bg-muted-foreground/15" />
        </div>
      </div>
    )
  }

  if (format === 'TIMELINE') {
    const rows = [
      { w: 'w-[80%]' },
      { w: 'w-[60%]' },
      { w: 'w-[75%]' },
      { w: 'w-[50%]' },
    ]
    return (
      <div className="flex h-[72px] flex-col justify-center gap-1.5 rounded-md bg-muted/40 p-2">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="flex h-2.5 w-2.5 shrink-0 flex-col items-center justify-center gap-[2px]">
              <div className="h-[2px] w-2 rounded bg-muted-foreground/40" />
              <div className="h-[2px] w-2 rounded bg-muted-foreground/40" />
            </div>
            <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded bg-blue-500/20 text-[7px] font-bold text-blue-500">
              {i + 1}
            </div>
            <div className={cn('h-2 rounded bg-muted-foreground/20', row.w)} />
          </div>
        ))}
      </div>
    )
  }

  if (format === 'MATCHING') {
    const pairs = [
      { lColor: 'bg-purple-400/50', rColor: 'bg-purple-400/50' },
      { lColor: 'bg-blue-400/50', rColor: 'bg-blue-400/50' },
      { lColor: 'bg-pink-400/50', rColor: 'bg-pink-400/50' },
    ]
    return (
      <div className="flex h-[72px] flex-col justify-center gap-1.5 rounded-md bg-muted/40 p-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center justify-between gap-1">
            <div className={cn('h-4 flex-1 rounded', pair.lColor)} />
            <div className="flex items-center gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              <div className="h-px w-3 bg-muted-foreground/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            </div>
            <div className={cn('h-4 flex-1 rounded', pair.rColor)} />
          </div>
        ))}
      </div>
    )
  }

  if (format === 'CATEGORIZE') {
    return (
      <div className="flex h-[72px] flex-col gap-1 rounded-md bg-muted/40 p-2">
        <div className="grid grid-cols-2 gap-1">
          <div className="h-3.5 rounded bg-orange-400/30 text-center text-[7px] font-semibold leading-[14px] text-orange-600/70">
            A
          </div>
          <div className="h-3.5 rounded bg-amber-400/30 text-center text-[7px] font-semibold leading-[14px] text-amber-600/70">
            B
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          <div className="h-4 rounded bg-orange-400/20" />
          <div className="h-4 rounded bg-amber-400/20" />
          <div className="h-4 rounded bg-orange-400/20" />
          <div className="h-4 rounded bg-amber-400/20" />
        </div>
      </div>
    )
  }

  if (format === 'LABEL_DIAGRAM') {
    return (
      <div className="flex h-[72px] items-center justify-center rounded-md bg-muted/40 p-2">
        <div className="relative h-full w-full rounded bg-muted/60">
          <div className="absolute left-[20%] top-[30%] flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-3 bg-muted-foreground/40" />
            <div className="h-3 w-5 rounded bg-muted-foreground/20" />
          </div>
          <div className="absolute left-[45%] top-[58%] flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-3 bg-muted-foreground/40" />
            <div className="h-3 w-5 rounded bg-muted-foreground/20" />
          </div>
          <div className="absolute left-[63%] top-[18%] flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-3 bg-muted-foreground/40" />
            <div className="h-3 w-5 rounded bg-muted-foreground/20" />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export interface QuizTemplate {
  id: string
  format: QuizFormat
  name: string
  color: string
  timeLimitSec: number
  questionCount: number
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'classic',
    format: 'CLASSIC',
    name: 'Classic Quiz',
    color: 'text-primary',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'timeline',
    format: 'TIMELINE',
    name: 'Timeline',
    color: 'text-blue-500',
    timeLimitSec: 30,
    questionCount: 3,
  },
  {
    id: 'matching',
    format: 'MATCHING',
    name: 'Match the Pairs',
    color: 'text-purple-500',
    timeLimitSec: 40,
    questionCount: 3,
  },
  {
    id: 'categorize',
    format: 'CATEGORIZE',
    name: 'Sort It Out',
    color: 'text-orange-500',
    timeLimitSec: 25,
    questionCount: 3,
  },
  {
    id: 'label-diagram',
    format: 'LABEL_DIAGRAM',
    name: 'Label the Diagram',
    color: 'text-green-500',
    timeLimitSec: 45,
    questionCount: 3,
  },
]

interface TemplatePickerProps {
  selectedId: string | null
  onSelect: (template: QuizTemplate) => void
}

export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  const selectedBorderByTemplateId: Record<string, string> = {
    classic: 'border-primary ring-primary',
    timeline: 'border-blue-500 ring-blue-500',
    matching: 'border-purple-500 ring-purple-500',
    categorize: 'border-orange-500 ring-orange-500',
    'label-diagram': 'border-green-500 ring-green-500',
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {QUIZ_TEMPLATES.map((template) => {
        const isSelected = selectedId === template.id
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className={cn(
              'rounded-lg border p-2 text-left transition-all hover:border-primary/50',
              isSelected && 'ring-2',
              isSelected && selectedBorderByTemplateId[template.id]
            )}
          >
            <FormatPreview format={template.format} />
            <p className={cn('mt-2 text-xs font-semibold', template.color)}>{template.name}</p>
          </button>
        )
      })}
    </div>
  )
}
