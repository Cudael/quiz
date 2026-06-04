'use client'

import { cn } from '@/lib/utils'
import type { QuizFormat } from '@/store/quiz-creator-store'

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {QUIZ_TEMPLATES.map((template) => {
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
            <div className="mb-3 flex items-start justify-between gap-3">
              <span
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl',
                  template.color
                )}
              >
                {template.emoji}
              </span>
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                {formatBadge[template.format]}
              </span>
            </div>
            <p className="text-base font-semibold">{template.name}</p>
            <p className={cn('text-sm font-medium', template.color)}>{template.tagline}</p>
            <p className="mt-2 text-sm text-muted-foreground">{template.description}</p>
          </button>
        )
      })}
    </div>
  )
}
