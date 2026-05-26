'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { QuestionType } from '@/store/quiz-creator-store'

export interface QuizTemplate {
  id: string
  emoji: string
  name: string
  description: string
  type: QuestionType
  timeLimitSec: number
  questionCount: number
  defaultPrompt: string
}

export const QUIZ_TEMPLATES: QuizTemplate[] = [
  {
    id: 'classic-trivia',
    emoji: '🎯',
    name: 'Classic Trivia',
    description: 'Standard multiple-choice questions with a single correct answer.',
    type: 'SINGLE',
    timeLimitSec: 20,
    questionCount: 5,
    defaultPrompt: '',
  },
  {
    id: 'true-false',
    emoji: '⚖️',
    name: 'True or False',
    description: 'Quick true/false questions for fast-paced rounds.',
    type: 'TRUEFALSE',
    timeLimitSec: 15,
    questionCount: 8,
    defaultPrompt: '',
  },
  {
    id: 'multi-select',
    emoji: '✅',
    name: 'Multi-Select',
    description: 'Pick all that apply — multiple correct answers per question.',
    type: 'MULTIPLE',
    timeLimitSec: 30,
    questionCount: 4,
    defaultPrompt: '',
  },
  {
    id: 'fill-blank',
    emoji: '✏️',
    name: 'Fill in the Blank',
    description: 'Complete the sentence — great for vocabulary and definitions.',
    type: 'FILL_BLANK',
    timeLimitSec: 25,
    questionCount: 5,
    defaultPrompt: 'Question {{blank}} here',
  },
  {
    id: 'speed-round',
    emoji: '⚡',
    name: 'Speed Round',
    description: 'Race against the clock with rapid-fire single-answer questions.',
    type: 'SINGLE',
    timeLimitSec: 8,
    questionCount: 10,
    defaultPrompt: '',
  },
  {
    id: 'image-quiz',
    emoji: '🖼️',
    name: 'Image Quiz',
    description: 'Visual questions — paste image URLs to challenge players.',
    type: 'SINGLE',
    timeLimitSec: 30,
    questionCount: 5,
    defaultPrompt: 'What is shown?',
  },
]

const TYPE_VARIANT: Record<QuestionType, 'purple' | 'info' | 'success' | 'warning'> = {
  SINGLE: 'purple',
  MULTIPLE: 'info',
  TRUEFALSE: 'success',
  FILL_BLANK: 'warning',
}

const TYPE_LABEL: Record<QuestionType, string> = {
  SINGLE: 'Single',
  MULTIPLE: 'Multiple',
  TRUEFALSE: 'True/False',
  FILL_BLANK: 'Fill Blank',
}

function TemplatePreview({ id }: { id: string }) {
  if (id === 'blank') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="h-2 w-3/4 rounded bg-muted" />
        <div className="h-2 w-1/2 rounded bg-muted" />
        <div className="h-2 w-2/3 rounded bg-muted" />
      </div>
    )
  }

  if (id === 'classic-trivia' || id === 'speed-round') {
    const isSpeed = id === 'speed-round'
    return (
      <div className="flex flex-col gap-1.5 py-1">
        {!isSpeed && <div className="h-2 w-full rounded bg-muted" />}
        <div className={cn('grid grid-cols-2 gap-1', isSpeed && 'mt-0.5')}>
          <div className={cn('rounded bg-muted', isSpeed ? 'h-3' : 'h-5')} />
          <div className={cn('rounded bg-muted', isSpeed ? 'h-3' : 'h-5')} />
          <div className={cn('rounded bg-muted', isSpeed ? 'h-3' : 'h-5')} />
          <div className={cn('rounded bg-muted', isSpeed ? 'h-3' : 'h-5')} />
          {isSpeed && (
            <>
              <div className="h-3 rounded bg-muted" />
              <div className="h-3 rounded bg-muted" />
            </>
          )}
        </div>
      </div>
    )
  }

  if (id === 'true-false') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-5 w-full rounded bg-muted" />
        <div className="h-5 w-full rounded bg-muted" />
      </div>
    )
  }

  if (id === 'multi-select') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="h-2 w-full rounded bg-muted" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-3 w-3 flex-shrink-0 rounded-sm bg-muted" />
            <div className="h-2 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    )
  }

  if (id === 'fill-blank') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="flex items-center gap-1">
          <div className="h-2 w-1/3 rounded bg-muted" />
          <div className="h-2 w-1/4 rounded border border-dashed border-muted-foreground/40 bg-muted/30" />
          <div className="h-2 w-1/3 rounded bg-muted" />
        </div>
        <div className="h-6 w-full rounded border border-muted-foreground/20 bg-muted" />
      </div>
    )
  }

  if (id === 'image-quiz') {
    return (
      <div className="flex flex-col gap-1.5 py-1">
        <div className="h-8 w-full rounded bg-muted" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
        </div>
      </div>
    )
  }

  return null
}

interface TemplatePickerProps {
  selectedId: string | null
  onSelect: (template: QuizTemplate) => void
}

export function TemplatePicker({ selectedId, onSelect }: TemplatePickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Start from a template</p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {/* Blank option */}
        <button
          type="button"
          title="Start fresh with no template."
          onClick={() =>
            onSelect({
              id: 'blank',
              emoji: '📄',
              name: 'Blank',
              description: 'Start fresh with no template.',
              type: 'SINGLE',
              timeLimitSec: 20,
              questionCount: 0,
              defaultPrompt: '',
            })
          }
          className={cn(
            'flex flex-col gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50',
            selectedId === 'blank' && 'ring-2 ring-primary border-primary'
          )}
        >
          <TemplatePreview id="blank" />
          <span className="text-sm font-semibold">📄 Blank</span>
        </button>

        {QUIZ_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            title={template.description}
            onClick={() => onSelect(template)}
            className={cn(
              'flex flex-col gap-1 rounded-lg border p-3 text-left transition-all hover:border-primary/50',
              selectedId === template.id && 'ring-2 ring-primary border-primary'
            )}
          >
            <TemplatePreview id={template.id} />
            <span className="text-sm font-semibold">
              {template.emoji} {template.name}
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <Badge variant={TYPE_VARIANT[template.type]} className="text-xs">
                {TYPE_LABEL[template.type]}
              </Badge>
              <span className="text-xs text-muted-foreground">{template.timeLimitSec}s</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
