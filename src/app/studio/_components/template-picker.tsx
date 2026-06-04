'use client'

import { cn } from '@/lib/utils'
import type { QuizFormat } from '@/store/quiz-creator-store'

function FormatPreview({ format }: { format: QuizFormat }) {
  if (format === 'CLASSIC') {
    return (
      <div className="mb-3 flex h-[88px] flex-col gap-1.5 rounded-lg bg-muted/40 p-2">
        <div className="h-3 w-full rounded bg-muted-foreground/20" />
        <div className="mt-1 grid grid-cols-2 gap-1.5">
          <div className="h-7 rounded-md bg-muted-foreground/15" />
          <div className="h-7 rounded-md bg-quiz-green/25 ring-1 ring-quiz-green/40" />
          <div className="h-7 rounded-md bg-muted-foreground/15" />
          <div className="h-7 rounded-md bg-muted-foreground/15" />
        </div>
      </div>
    )
  }

  if (format === 'TIMELINE') {
    const rows = [
      { w: 'w-[85%]', offset: '' },
      { w: 'w-[65%]', offset: 'translate-x-1' },
      { w: 'w-[80%]', offset: '' },
      { w: 'w-[55%]', offset: 'translate-x-2' },
    ]
    return (
      <div className="mb-3 flex h-[88px] flex-col justify-center gap-1.5 rounded-lg bg-muted/40 p-2">
        {rows.map((row, i) => (
          <div key={i} className={cn('flex items-center gap-1.5', row.offset)}>
            <div className="flex h-3 w-3 shrink-0 flex-col items-center justify-center gap-[2px]">
              <div className="h-[2px] w-2 rounded bg-muted-foreground/40" />
              <div className="h-[2px] w-2 rounded bg-muted-foreground/40" />
            </div>
            <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-blue-500/20 text-[8px] font-bold text-blue-500">
              {i + 1}
            </div>
            <div className={cn('h-2.5 rounded bg-muted-foreground/20', row.w)} />
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
      <div className="mb-3 flex h-[88px] flex-col justify-center gap-2 rounded-lg bg-muted/40 p-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center justify-between gap-1">
            <div className={cn('h-5 flex-1 rounded-md', pair.lColor)} />
            <div className="flex items-center gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
              <div className="h-px w-4 bg-muted-foreground/30" />
              <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
            </div>
            <div className={cn('h-5 flex-1 rounded-md', pair.rColor)} />
          </div>
        ))}
      </div>
    )
  }

  if (format === 'CATEGORIZE') {
    return (
      <div className="mb-3 flex h-[88px] flex-col gap-1.5 rounded-lg bg-muted/40 p-2">
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-4 rounded bg-orange-400/30 text-center text-[8px] font-semibold leading-4 text-orange-600/70">
            Bin A
          </div>
          <div className="h-4 rounded bg-amber-400/30 text-center text-[8px] font-semibold leading-4 text-amber-600/70">
            Bin B
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-5 rounded-md bg-orange-400/20" />
          <div className="h-5 rounded-md bg-amber-400/20" />
          <div className="h-5 rounded-md bg-orange-400/20" />
          <div className="h-5 rounded-md bg-amber-400/20" />
        </div>
      </div>
    )
  }

  if (format === 'LABEL_DIAGRAM') {
    return (
      <div className="mb-3 flex h-[88px] items-center justify-center rounded-lg bg-muted/40 p-2">
        <div className="relative h-full w-full rounded bg-muted/60">
          <div className="absolute left-[25%] top-[35%] flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-4 bg-muted-foreground/40" />
            <div className="h-3.5 rounded bg-muted-foreground/20 px-1 text-[7px] leading-3.5">
              lbl
            </div>
          </div>
          <div className="absolute left-[50%] top-[55%] flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-4 bg-muted-foreground/40" />
            <div className="h-3.5 rounded bg-muted-foreground/20 px-1 text-[7px] leading-3.5">
              lbl
            </div>
          </div>
          <div className="absolute left-[62%] top-[20%] flex items-center gap-1">
            <div className="h-3 w-3 rounded-full border border-green-500/60 bg-green-500/40" />
            <div className="h-px w-4 bg-muted-foreground/40" />
            <div className="h-3.5 rounded bg-muted-foreground/20 px-1 text-[7px] leading-3.5">
              lbl
            </div>
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
  emoji: string
  name: string
  tagline: string
  description: string
  color: string
  timeLimitSec: number
  questionCount: number
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'classic',
    format: 'CLASSIC',
    emoji: '🎯',
    name: 'Classic Quiz',
    tagline: 'Multiple choice & more',
    description:
      'Standard questions with single-choice, multi-select, true/false, and fill-in-the-blank variants.',
    color: 'text-primary',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'timeline',
    format: 'TIMELINE',
    emoji: '📅',
    name: 'Timeline',
    tagline: 'Put events in order',
    description:
      'Players drag historical events, steps, or milestones into the correct chronological sequence.',
    color: 'text-blue-500',
    timeLimitSec: 30,
    questionCount: 3,
  },
  {
    id: 'matching',
    format: 'MATCHING',
    emoji: '🧩',
    name: 'Match the Pairs',
    tagline: 'Connect related items',
    description:
      'Match celebrities to quotes, countries to dishes, movies to years — connect left-column items to their right-column counterparts.',
    color: 'text-purple-500',
    timeLimitSec: 40,
    questionCount: 3,
  },
  {
    id: 'categorize',
    format: 'CATEGORIZE',
    emoji: '🪣',
    name: 'Sort It Out',
    tagline: 'This or That?',
    description:
      'Players sort cards into two labeled bins — Real vs Mythical, Fact vs Fiction, Science vs Art.',
    color: 'text-orange-500',
    timeLimitSec: 25,
    questionCount: 3,
  },
  {
    id: 'label-diagram',
    format: 'LABEL_DIAGRAM',
    emoji: '🌿',
    name: 'Label the Diagram',
    tagline: 'Spot & identify',
    description:
      'Upload an image and place labeled hotspots — World Map landmarks, famous paintings, constellation maps.',
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
  const formatBadge: Record<QuizFormat, string> = {
    CLASSIC: 'CLASSIC',
    TIMELINE: 'ORDERING',
    MATCHING: 'MATCHING',
    CATEGORIZE: 'CATEGORIZE',
    LABEL_DIAGRAM: 'LABEL',
  }
  const selectedBorderByTemplateId: Record<string, string> = {
    classic: 'border-primary ring-primary',
    timeline: 'border-blue-500 ring-blue-500',
    matching: 'border-purple-500 ring-purple-500',
    categorize: 'border-orange-500 ring-orange-500',
    'label-diagram': 'border-green-500 ring-green-500',
  }

  return (
    <div className="grid grid-cols-1 gap-3">{QUIZ_TEMPLATES.map((template) => {
        const isSelected = selectedId === template.id
        return (
          <button
            key={template.id}
            type="button"
            title={template.description}
            onClick={() => onSelect(template)}
            className={cn(
              'rounded-xl border p-4 text-left transition-all hover:border-primary/50',
              isSelected && 'ring-2',
              isSelected && selectedBorderByTemplateId[template.id]
            )}
          >
            <FormatPreview format={template.format} />
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={cn('text-xl', template.color)}>{template.emoji}</span>
                <p className="text-base font-semibold">{template.name}</p>
              </div>
              <span className="shrink-0 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {formatBadge[template.format]}
              </span>
            </div>
            <p className={cn('text-sm font-medium', template.color)}>{template.tagline}</p>
            <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
          </button>
        )
      })}
    </div>
  )
}
