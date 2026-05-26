'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { createQuizAndReturnId } from '@/app/studio/actions/quiz-meta-actions'
import { saveDraft } from '@/app/studio/actions'
import { StepMeta } from './step-meta'
import { StepQuestions } from './step-questions'
import { StepPreview } from './step-preview'
import { StepPublish } from './step-publish'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

interface Category {
  id: string
  name: string
  color: string
}

interface InitialQuiz {
  id: string
  title: string
  description: string
  coverImage: string | null
  categoryId: string
  difficulty: string
  defaultTimeLimitSec: number | null
  isPublished: boolean
}

interface InitialQuizQuestion {
  id: string
  type: string
  prompt: string
  imageUrl?: string | null
  explanation: string | null
  timeLimitSec: number
  order: number
  choices: Array<{ id: string; text: string; isCorrect: boolean }>
}

interface InitialData {
  quiz: InitialQuiz
  questions: InitialQuizQuestion[]
}

interface QuizCreatorShellProps {
  mode: 'new' | 'edit'
  quizId?: string
  initialData?: InitialData
  categories: Category[]
}

const STEP_LABELS = ['Details', 'Questions', 'Preview', 'Publish']

export function QuizCreatorShell({
  mode,
  quizId: initialQuizId,
  initialData,
  categories,
}: QuizCreatorShellProps) {
  const router = useRouter()
  const store = useQuizCreatorStore()
  const [savingDraft, setSavingDraft] = React.useState(false)
  const initializedRef = React.useRef(false)

  // Initialize store on mount
  React.useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    if (mode === 'edit' && initialData) {
      const alreadyHasThisQuiz = store.quizId === initialData.quiz.id

      store.setQuizId(initialData.quiz.id)
      store.setMeta({
        title: initialData.quiz.title,
        description: initialData.quiz.description,
        categoryId: initialData.quiz.categoryId,
        difficulty: initialData.quiz.difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        isPublished: initialData.quiz.isPublished,
        imageUrl: initialData.quiz.coverImage ?? '',
        defaultTimeLimitSec: initialData.quiz.defaultTimeLimitSec,
      })

      // When redirected from new→edit after choosing a template, the server
      // has no questions yet but the store already holds the template questions.
      // Skip overwriting the store in that case.
      if (!(alreadyHasThisQuiz && initialData.questions.length === 0)) {
        const questions: DraftQuestion[] = initialData.questions.map((q) => ({
          localId: crypto.randomUUID(),
          dbId: q.id,
          type: q.type as DraftQuestion['type'],
          prompt: q.prompt,
          imageUrl: q.imageUrl ?? '',
          explanation: q.explanation ?? '',
          timeLimitSec: q.timeLimitSec,
          choices: q.choices.map(
            (c): DraftChoice => ({
              localId: crypto.randomUUID(),
              text: c.text,
              isCorrect: c.isCorrect,
            })
          ),
        }))
        store.setQuestions(questions)
      }
    } else if (mode === 'new' && initialQuizId) {
      store.setQuizId(initialQuizId)
    } else if (mode === 'new' && !initialQuizId) {
      store.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    quizId,
    currentStep,
    title,
    description,
    imageUrl,
    categoryId,
    difficulty,
    defaultTimeLimitSec,
    lastSavedAt,
    setStep,
  } = store

  const handleSaveDraft = async () => {
    setSavingDraft(true)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const safeCategoryId = categoryId || (categories[0]?.id ?? '')

    if (mode === 'new' && !quizId) {
      const fd = new FormData()
      fd.set('title', trimmedTitle)
      fd.set('description', trimmedDescription)
      fd.set('coverImage', imageUrl.trim())
      fd.set('categoryId', safeCategoryId)
      fd.set('difficulty', difficulty)
      if (defaultTimeLimitSec !== null) {
        fd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
      }
      const result = await createQuizAndReturnId(fd)
      if (result.ok) {
        store.setQuizId(result.quizId)
        store.setLastSaved(new Date())
        router.push(`/studio/quiz/${result.quizId}/edit`)
      }
    } else if (quizId) {
      const fd = new FormData()
      fd.set('quizId', quizId)
      fd.set('title', trimmedTitle)
      fd.set('description', trimmedDescription)
      fd.set('coverImage', imageUrl.trim())
      fd.set('categoryId', safeCategoryId)
      fd.set('difficulty', difficulty)
      if (defaultTimeLimitSec !== null) {
        fd.set('defaultTimeLimitSec', String(defaultTimeLimitSec))
      }
      const result = await saveDraft(fd)
      if (result.ok) {
        store.setLastSaved(new Date())
      }
    }

    setSavingDraft(false)
  }

  const handleBack = () => {
    if (currentStep > 1) setStep((currentStep - 1) as 1 | 2 | 3 | 4)
  }

  const handleContinue = () => {
    if (currentStep < 4) setStep((currentStep + 1) as 1 | 2 | 3 | 4)
  }

  const effectiveQuizId = quizId ?? initialQuizId ?? ''

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 border-b bg-card px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            {STEP_LABELS.map((label, i) => {
              const step = (i + 1) as 1 | 2 | 3 | 4
              const isActive = currentStep === step
              const isDone = currentStep > step
              return (
                <React.Fragment key={label}>
                  <button
                    type="button"
                    onClick={() => setStep(step)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                      isActive && 'bg-primary text-primary-foreground',
                      isDone && 'text-muted-foreground',
                      !isActive && !isDone && 'text-muted-foreground'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                        isActive
                          ? 'bg-primary-foreground text-primary'
                          : isDone
                            ? 'bg-quiz-green/20 text-quiz-green'
                            : 'bg-muted'
                      )}
                    >
                      {step}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                  {i < 3 && <div className="h-px flex-1 bg-border" />}
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          {currentStep === 1 && <StepMeta categories={categories} />}
          {currentStep === 2 && <StepQuestions quizId={effectiveQuizId} />}
          {currentStep === 3 && <StepPreview quizId={effectiveQuizId} categories={categories} />}
          {currentStep === 4 && effectiveQuizId && <StepPublish quizId={effectiveQuizId} />}
          {currentStep === 4 && !effectiveQuizId && (
            <p className="text-muted-foreground">Save a draft first to unlock publishing.</p>
          )}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20 border-t bg-card px-4 py-3">
        <div className="container mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={handleBack} disabled={currentStep === 1}>
            ← Back
          </Button>

          <div className="flex items-center gap-2">
            {lastSavedAt && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                Saved {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft && <Loader2 className="h-4 w-4 animate-spin" />}
              Save draft
            </Button>
            {currentStep < 4 && (
              <Button type="button" onClick={handleContinue}>
                Continue →
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
