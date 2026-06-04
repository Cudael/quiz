'use client'

import { cn } from '@/lib/utils'
import { slugify } from '@/lib/slugify'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { ImageUpload } from './image-upload'
import { TemplatePicker, QUIZ_TEMPLATES } from './template-picker'
import type { QuizTemplate } from './template-picker'
import type { DraftQuestion, DraftChoice } from '@/store/quiz-creator-store'

interface Category {
  id: string
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
    activeClass: 'bg-quiz-green/20 text-quiz-green border-quiz-green/50',
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    activeClass: 'bg-quiz-orange/20 text-quiz-orange border-quiz-orange/50',
  },
  {
    value: 'HARD',
    label: 'Hard',
    activeClass: 'bg-destructive/20 text-destructive border-destructive/50',
  },
]

function buildTemplateQuestions(template: QuizTemplate): DraftQuestion[] {
  if (template.questionCount === 0) return []

  const makeClassicChoices = (
    index: number
  ): { type: DraftQuestion['type']; choices: DraftChoice[] } => {
    const typeCycle: DraftQuestion['type'][] = ['SINGLE', 'TRUEFALSE', 'MULTIPLE', 'FILL_BLANK']
    const type = typeCycle[index % typeCycle.length]

    if (type === 'TRUEFALSE') {
      return {
        type,
        choices: [
          { localId: crypto.randomUUID(), text: 'True', isCorrect: true },
          { localId: crypto.randomUUID(), text: 'False', isCorrect: false },
        ],
      }
    }
    if (type === 'FILL_BLANK') {
      return {
        type,
        choices: [{ localId: crypto.randomUUID(), text: '', isCorrect: true }],
      }
    }

    return {
      type,
      choices: [
        { localId: crypto.randomUUID(), text: '', isCorrect: true },
        { localId: crypto.randomUUID(), text: '', isCorrect: false },
      ],
    }
  }

  return Array.from({ length: template.questionCount }, (_, templateIndex) => {
    if (template.format === 'TIMELINE') {
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'ORDERING',
        prompt: 'Put these events in the correct order:',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: Array.from({ length: 4 }, (_, index) => ({
          localId: crypto.randomUUID(),
          text: `Event ${index + 1}`,
          isCorrect: false,
          meta: { order: index },
        })),
      }
    }

    if (template.format === 'MATCHING') {
      const pairs = Array.from({ length: 4 }, (_, index) => ({
        pairKey: crypto.randomUUID(),
        index,
      }))
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'MATCHING',
        prompt: 'Match each item on the left to its pair on the right:',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: [
          ...pairs.map(({ pairKey, index }) => ({
            localId: crypto.randomUUID(),
            text: `Left ${index + 1}`,
            isCorrect: false,
            meta: { pairKey, side: 'left' },
          })),
          ...pairs.map(({ pairKey, index }) => ({
            localId: crypto.randomUUID(),
            text: `Right ${index + 1}`,
            isCorrect: false,
            meta: { pairKey, side: 'right' },
          })),
        ],
      }
    }

    if (template.format === 'CATEGORIZE') {
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'CATEGORIZE',
        prompt: 'Sort each item into the correct category:',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: [
          {
            localId: crypto.randomUUID(),
            text: 'Category A',
            isCorrect: false,
            meta: { category: 'A', isHeader: true },
          },
          {
            localId: crypto.randomUUID(),
            text: 'Category B',
            isCorrect: false,
            meta: { category: 'B', isHeader: true },
          },
          {
            localId: crypto.randomUUID(),
            text: 'Item 1',
            isCorrect: false,
            meta: { category: 'A' },
          },
          {
            localId: crypto.randomUUID(),
            text: 'Item 2',
            isCorrect: false,
            meta: { category: 'B' },
          },
          {
            localId: crypto.randomUUID(),
            text: 'Item 3',
            isCorrect: false,
            meta: { category: 'A' },
          },
          {
            localId: crypto.randomUUID(),
            text: 'Item 4',
            isCorrect: false,
            meta: { category: 'B' },
          },
        ],
      }
    }

    if (template.format === 'LABEL_DIAGRAM') {
      return {
        localId: crypto.randomUUID(),
        dbId: null,
        type: 'LABEL',
        prompt: 'Label the diagram:',
        imageUrl: '',
        explanation: '',
        timeLimitSec: template.timeLimitSec,
        choices: [
          {
            localId: crypto.randomUUID(),
            text: '',
            isCorrect: false,
            meta: { x: 0.3, y: 0.4, label: '' },
          },
          {
            localId: crypto.randomUUID(),
            text: '',
            isCorrect: false,
            meta: { x: 0.5, y: 0.55, label: '' },
          },
          {
            localId: crypto.randomUUID(),
            text: '',
            isCorrect: false,
            meta: { x: 0.7, y: 0.3, label: '' },
          },
        ],
      }
    }

    const classic = makeClassicChoices(templateIndex)

    return {
      localId: crypto.randomUUID(),
      dbId: null,
      type: classic.type,
      prompt: '',
      imageUrl: '',
      explanation: '',
      timeLimitSec: template.timeLimitSec,
      choices: classic.choices,
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
    quizFormat,
    setMeta,
    setQuizFormat,
    applyTemplate,
  } = useQuizCreatorStore()

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Choose a format</h2>
        <p className="text-sm text-muted-foreground">You can change this later.</p>
        <TemplatePicker
          selectedId={selectedTemplateId}
          onSelect={(template) => {
            const questions = buildTemplateQuestions(template)
            setQuizFormat(template.format)
            applyTemplate(template.id, template.format, questions)
          }}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column */}
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
                  const subs = children.filter((c) => c.parentSlug === slugify(parent.name))
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
        {/* Right column */}
        <div className="space-y-5">
          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Current format</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {QUIZ_TEMPLATES.find((template) => template.format === quizFormat)?.name ??
                'Classic Quiz'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
