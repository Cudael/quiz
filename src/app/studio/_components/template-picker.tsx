'use client'

import { cn } from '@/lib/utils'
import type { QuizFormat } from '@/store/quiz-creator-store'

function FormatPreview({ format }: { format: QuizFormat }) {
  if (format === 'TEXT_CHOICE') {
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

  return (
    <div className="flex h-[72px] items-center justify-center gap-1.5 rounded-md bg-muted/40 p-2">
      <div className="h-10 w-10 rounded bg-purple-400/30 ring-1 ring-purple-400/50" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
      <div className="h-10 w-10 rounded bg-muted-foreground/15" />
    </div>
  )
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
    id: 'text-choice',
    format: 'TEXT_CHOICE',
    name: 'Text Choice',
    color: 'text-primary',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'image-choice',
    format: 'IMAGE_CHOICE',
    name: 'Image Choice',
    color: 'text-purple-500',
    timeLimitSec: 30,
    questionCount: 5,
  },
]

interface TemplatePickerProps {
  selectedId: string | null
  onSelect: (template: QuizTemplate) => void
}

export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  const selectedBorderByTemplateId: Record<string, string> = {
    'text-choice': 'border-primary ring-primary',
    'image-choice': 'border-purple-500 ring-purple-500',
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
