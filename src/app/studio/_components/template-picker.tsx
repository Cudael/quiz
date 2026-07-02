'use client'

import {
  ArrowDownUp,
  Brain,
  CircleSlash2,
  Grid3x3,
  Keyboard,
  Link2,
  Scale,
  ScanEye,
  Shuffle,
  SlidersHorizontal,
  Volume2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuizFormat } from '@/store/quiz-creator-store'

const FORMAT_ICONS: Partial<Record<QuizFormat, LucideIcon>> = {
  ORDER: ArrowDownUp,
  MATCH: Link2,
  ODD_ONE_OUT: CircleSlash2,
  TYPE_ANSWER: Keyboard,
  NUMBER_GUESS: SlidersHorizontal,
  IMAGE_REVEAL: ScanEye,
  AUDIO_CHOICE: Volume2,
  VERSUS: Scale,
  CONNECTIONS: Grid3x3,
  ANAGRAM: Shuffle,
  MEMORY_FLASH: Brain,
}

function FormatPreview({ format }: { format: QuizFormat }) {
  const Icon = FORMAT_ICONS[format]
  if (Icon) {
    return (
      <div className="flex h-18 items-center justify-center rounded-md bg-muted/40 p-2">
        <Icon className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
    )
  }

  if (format === 'TEXT_CHOICE') {
    return (
      <div className="flex h-18 flex-col gap-1.5 rounded-md bg-muted/40 p-2">
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

  if (format === 'IMAGE_HOTSPOT') {
    return (
      <div className="flex h-18 flex-col gap-1 rounded-md bg-muted/40 p-2">
        <div className="h-2 w-2/3 rounded bg-muted-foreground/20" />
        <div className="relative flex-1 rounded bg-muted-foreground/10 overflow-hidden">
          {/* Zone circles */}
          <div className="absolute top-1 left-2 h-4 w-4 rounded-full border-2 border-quiz-orange bg-quiz-orange/20" />
          <div className="absolute top-3 left-8 h-3 w-3 rounded-full border-2 border-quiz-orange bg-quiz-orange/20" />
          <div className="absolute bottom-1 right-3 h-5 w-5 rounded-full border-2 border-quiz-orange bg-quiz-orange/20" />
        </div>
      </div>
    )
  }

  // IMAGE_CHOICE
  return (
    <div className="flex h-18 flex-col gap-1.5 rounded-md bg-muted/40 p-2">
      <div className="h-2.5 w-3/4 rounded bg-muted-foreground/20" />
      <div className="mt-0.5 grid grid-cols-2 gap-1 flex-1">
        <div className="rounded bg-muted-foreground/15 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div className="rounded bg-quiz-green/20 ring-1 ring-quiz-green/40 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-quiz-green/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="rounded bg-muted-foreground/15 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <div className="rounded bg-muted-foreground/15 flex items-center justify-center">
          <svg
            className="h-3 w-3 text-muted-foreground/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      </div>
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
    color: 'text-quiz-orange',
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
  {
    id: 'hotspot-choice',
    format: 'IMAGE_HOTSPOT',
    name: 'Image Hotspot',
    color: 'text-quiz-orange',
    timeLimitSec: 20,
    questionCount: 0,
  },
  {
    id: 'order',
    format: 'ORDER',
    name: 'Put in Order',
    color: 'text-quiz-green',
    timeLimitSec: 30,
    questionCount: 5,
  },
  {
    id: 'match',
    format: 'MATCH',
    name: 'Matching Pairs',
    color: 'text-primary',
    timeLimitSec: 40,
    questionCount: 5,
  },
  {
    id: 'odd-one-out',
    format: 'ODD_ONE_OUT',
    name: 'Odd One Out',
    color: 'text-warning',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'type-answer',
    format: 'TYPE_ANSWER',
    name: 'Type the Answer',
    color: 'text-quiz-orange',
    timeLimitSec: 25,
    questionCount: 5,
  },
  {
    id: 'number-guess',
    format: 'NUMBER_GUESS',
    name: 'Number Guess',
    color: 'text-primary',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'image-reveal',
    format: 'IMAGE_REVEAL',
    name: 'Image Reveal',
    color: 'text-purple-500',
    timeLimitSec: 20,
    questionCount: 5,
  },
  {
    id: 'audio-choice',
    format: 'AUDIO_CHOICE',
    name: 'Audio Quiz',
    color: 'text-quiz-green',
    timeLimitSec: 30,
    questionCount: 5,
  },
  {
    id: 'versus',
    format: 'VERSUS',
    name: 'Higher or Lower',
    color: 'text-warning',
    timeLimitSec: 15,
    questionCount: 5,
  },
  {
    id: 'connections',
    format: 'CONNECTIONS',
    name: 'Connections',
    color: 'text-primary',
    timeLimitSec: 120,
    questionCount: 1,
  },
  {
    id: 'anagram',
    format: 'ANAGRAM',
    name: 'Anagram',
    color: 'text-quiz-orange',
    timeLimitSec: 30,
    questionCount: 5,
  },
  {
    id: 'memory-flash',
    format: 'MEMORY_FLASH',
    name: 'Memory Flash',
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
    'hotspot-choice': 'border-quiz-orange ring-quiz-orange',
  }
  const selectedBorderFor = (templateId: string) =>
    selectedBorderByTemplateId[templateId] ?? 'border-primary ring-primary'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {QUIZ_TEMPLATES.map((template) => {
          const isSelected = selectedId === template.id
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className={cn(
                'rounded-md border p-2 text-left transition-all hover:border-primary/50',
                isSelected && 'ring-2',
                isSelected && selectedBorderFor(template.id)
              )}
            >
              <FormatPreview format={template.format} />
              <p className={cn('mt-2 text-xs font-semibold', template.color)}>{template.name}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
