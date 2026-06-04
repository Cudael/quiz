'use client'

import * as React from 'react'
import { Loader2, PlusCircle } from 'lucide-react'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

interface CategorizeQuestionsEditorProps {
  quizId: string
}

function makeCategorizeQuestion(timeLimitSec: number): DraftQuestion {
  return {
    localId: crypto.randomUUID(),
    dbId: null,
    type: 'CATEGORIZE',
    prompt: 'Sort each item into the correct category:',
    imageUrl: '',
    explanation: '',
    timeLimitSec,
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
      { localId: crypto.randomUUID(), text: 'Item 1', isCorrect: false, meta: { category: 'A' } },
      { localId: crypto.randomUUID(), text: 'Item 2', isCorrect: false, meta: { category: 'B' } },
    ],
  }
}

export function CategorizeQuestionsEditor({ quizId }: CategorizeQuestionsEditorProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const categorizeQuestions = questions.filter((question) => question.type === 'CATEGORIZE')
  const addRound = () =>
    addQuestion(makeCategorizeQuestion(defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button type="button" onClick={addRound}>
          <PlusCircle className="h-4 w-4" />
          Add round
        </Button>
        <Badge variant="secondary">
          {categorizeQuestions.length} round{categorizeQuestions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {categorizeQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No sort rounds yet.
        </div>
      ) : (
        <div className="space-y-3">
          {categorizeQuestions.map((question, index) => (
            <CategorizeRoundCard
              key={question.localId}
              question={question}
              index={index}
              quizId={quizId}
              onUpdate={(updates) => updateQuestion(question.localId, updates)}
              onRemove={() => removeQuestion(question.localId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CategorizeRoundCard({
  question,
  index,
  quizId,
  onUpdate,
  onRemove,
}: {
  question: DraftQuestion
  index: number
  quizId: string
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onRemove: () => void
}) {
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const headers = question.choices.filter((choice) => choice.meta?.isHeader)
  const categoryAHeader = headers.find((choice) => choice.meta?.category === 'A')
  const categoryBHeader = headers.find((choice) => choice.meta?.category === 'B')
  const categoryAItems = question.choices.filter(
    (choice) => !choice.meta?.isHeader && choice.meta?.category === 'A'
  )
  const categoryBItems = question.choices.filter(
    (choice) => !choice.meta?.isHeader && choice.meta?.category === 'B'
  )

  const saveRound = async () => {
    setSaveState('saving')
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('type', 'CATEGORIZE')
    formData.set('prompt', question.prompt)
    formData.set('imageUrl', question.imageUrl)
    formData.set('explanation', question.explanation)
    formData.set('timeLimitSec', String(question.timeLimitSec))
    formData.set('order', String(index))
    formData.set(
      'choices',
      JSON.stringify(
        question.choices.map((choice) => ({
          text: choice.text,
          isCorrect: false,
          meta: choice.meta,
        }))
      )
    )

    const result = question.dbId
      ? await updateQuestion(formDataWithQuestionId(formData, question.dbId))
      : await addQuestion(formData)
    if (result.ok) {
      if ('questionId' in result && result.questionId) {
        onUpdate({ dbId: result.questionId })
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1500)
    } else {
      setSaveState('idle')
    }
  }

  const updateChoice = (localId: string, updates: Partial<DraftChoice>) => {
    onUpdate({
      choices: question.choices.map((choice) =>
        choice.localId === localId ? { ...choice, ...updates } : choice
      ),
    })
  }

  const addItem = (category: 'A' | 'B') => {
    onUpdate({
      choices: [
        ...question.choices,
        { localId: crypto.randomUUID(), text: '', isCorrect: false, meta: { category } },
      ],
    })
  }

  const removeItem = (localId: string) => {
    onUpdate({ choices: question.choices.filter((choice) => choice.localId !== localId) })
  }

  const moveItem = (localId: string, nextCategory: 'A' | 'B') => {
    onUpdate({
      choices: question.choices.map((choice) =>
        choice.localId === localId
          ? { ...choice, meta: { ...(choice.meta ?? {}), category: nextCategory } }
          : choice
      ),
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Sort Round {index + 1}</p>
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={question.prompt}
          onChange={(event) => onUpdate({ prompt: event.target.value })}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Round title / instruction"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 rounded-lg border p-3">
            <input
              type="text"
              value={categoryAHeader?.text ?? ''}
              onChange={(event) =>
                categoryAHeader &&
                updateChoice(categoryAHeader.localId, { text: event.target.value })
              }
              className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              placeholder="Category A name"
            />
            {categoryAItems.map((item) => (
              <div key={item.localId} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(event) => updateChoice(item.localId, { text: event.target.value })}
                  className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  onClick={() => moveItem(item.localId, 'B')}
                >
                  Move to B
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.localId)}
                >
                  Remove
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addItem('A')}>
              + Add item to A
            </Button>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <input
              type="text"
              value={categoryBHeader?.text ?? ''}
              onChange={(event) =>
                categoryBHeader &&
                updateChoice(categoryBHeader.localId, { text: event.target.value })
              }
              className="w-full rounded-md border bg-background px-2 py-1 text-sm"
              placeholder="Category B name"
            />
            {categoryBItems.map((item) => (
              <div key={item.localId} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(event) => updateChoice(item.localId, { text: event.target.value })}
                  className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
                  onClick={() => moveItem(item.localId, 'A')}
                >
                  Move to A
                </button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.localId)}
                >
                  Remove
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => addItem('B')}>
              + Add item to B
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Time limit (sec)</span>
          <input
            type="number"
            min={5}
            max={120}
            value={question.timeLimitSec}
            onChange={(event) => onUpdate({ timeLimitSec: Number(event.target.value) || 5 })}
            className="w-24 rounded-md border bg-background px-2 py-1 text-sm"
          />
        </div>

        <Button type="button" size="sm" onClick={saveRound} disabled={saveState === 'saving'}>
          {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
          {saveState === 'saved' ? 'Saved' : 'Save round'}
        </Button>
      </div>
    </div>
  )
}

function formDataWithQuestionId(formData: FormData, questionId: string) {
  formData.set('questionId', questionId)
  return formData
}
