'use client'

import { cn } from '@/lib/utils'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { ImageUpload } from './image-upload'
import { TemplatePicker } from './template-picker'
import type { QuizTemplate } from './template-picker'
import type { DraftQuestion, DraftChoice } from '@/store/quiz-creator-store'

interface Category {
  id: string
  slug: string
  name: string
  color: string
  parentSlug: string | null
}

interface StepMetaProps {
  categories: Category[]
}

const DIFFICULTY_CONFIG: Array<{
  value: 'EASY' | 'MEDIUM' | 'HARD'
  label: string
  activeClass: string
}> = [
  {
    value: 'EASY',
    label: 'Easy',
    activeClass: 'bg-primary/10 text-primary border-primary/30',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    activeClass: 'bg-warning/15 text-warning border-warning/40',
  },
  {
    value: 'HARD',
    label: 'Hard',
    activeClass: 'bg-destructive/20 text-destructive border-destructive/50',
  },
]

function buildTemplateQuestions(template: QuizTemplate): DraftQuestion[] {
  if (template.questionCount === 0) return []

  const makeTextChoices = (): { type: DraftQuestion['type']; choices: DraftChoice[] } => {
    return {
      type: 'SINGLE',
      choices: [
        { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: true },
        { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
      ],
    }
  }

  return Array.from({ length: template.questionCount }, () => {
    if (template.format === 'IMAGE_CHOICE') {
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'SINGLE' as const,
        prompt: '',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: [
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: true },
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
        ],
      }
    }

    if (template.format === 'MAP_CHOICE') {
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'SINGLE' as const,
        prompt: '',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: [
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: true },
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
          { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
        ],
        meta: { mapRegion: '', highlightedId: '' },
      }
    }

    const textChoice = makeTextChoices()
    return {
      localId: crypto.randomUUID(),
      dbId: null,
      type: textChoice.type,
      prompt: '',
      imageUrl: '',
      explanation: '',
      timeLimitSec: template.timeLimitSec,
      choices: textChoice.choices,
    }
  })
}

export function StepMeta({ categories }: StepMetaProps) {
  const {
    title,
    description,
    categoryId,
    difficulty,
    imageUrl,
    defaultTimeLimitSec,
    selectedTemplateId,
    setMeta,
    applyTemplate,
  } = useQuizCreatorStore()

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
      {/* Left column — details form */}
      <div className="space-y-5">
        {/* Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="quiz-title" className="text-sm font-medium">
              Title
            </label>
            <span className="text-xs text-muted-foreground">{title.length}/120</span>
          </div>
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => setMeta({ title: e.target.value })}
            maxLength={120}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="quiz-description" className="text-sm font-medium">
              Description
            </label>
            <span className="text-xs text-muted-foreground">{description.length}/500</span>
          </div>
          <textarea
            id="quiz-description"
            value={description}
            onChange={(e) => setMeta({ description: e.target.value })}
            maxLength={500}
            rows={4}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label htmlFor="quiz-category" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="quiz-category"
            value={categoryId}
            onChange={(e) => setMeta({ categoryId: e.target.value })}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Select a category…</option>
            {(() => {
              const parents = categories.filter((c) => c.parentSlug === null)
              const children = categories.filter((c) => c.parentSlug !== null)
              return parents.map((parent) => {
                const subs = children.filter((c) => c.parentSlug === parent.slug)
                if (subs.length > 0) {
                  return (
                    <optgroup key={parent.id} label={parent.name}>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </optgroup>
                  )
                }
                return (
                  <option key={parent.id} value={parent.id}>
                    {parent.name}
                  </option>
                )
              })
            })()}
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-1">
          <p className="block text-sm font-medium">Difficulty</p>
          <div className="flex gap-2">
            {DIFFICULTY_CONFIG.map(({ value, label, activeClass }) => (
              <button
                key={value}
                type="button"
                onClick={() => setMeta({ difficulty: value })}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  difficulty === value
                    ? activeClass
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cover image */}
        <ImageUpload
          value={imageUrl}
          onChange={(v) => setMeta({ imageUrl: v })}
          label="Cover image (optional)"
          aspectRatio="16/9"
        />

        <div className="space-y-1">
          <p className="block text-sm font-medium">Quiz time limit</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '1 min', value: 60 },
              { label: '2 min', value: 120 },
              { label: '3 min', value: 180 },
              { label: '5 min', value: 300 },
              { label: '10 min', value: 600 },
              { label: 'No limit', value: null },
            ].map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setMeta({ defaultTimeLimitSec: value })}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  defaultTimeLimitSec === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/50'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right column — format picker (static, does not follow scroll) */}
      <div className="lg:self-start">
        <div className="space-y-2">
          <div>
            <p className="text-sm font-semibold">Format</p>
            <p className="text-xs text-muted-foreground">Choose a quiz type</p>
          </div>
          <TemplatePicker
            selectedId={selectedTemplateId}
            onSelect={(template) => {
              const questions = buildTemplateQuestions(template)
              applyTemplate(template.id, template.format, questions)
            }}
          />
          <p className="text-xs text-muted-foreground">You can change this later.</p>
        </div>
      </div>
    </div>
  )
}
