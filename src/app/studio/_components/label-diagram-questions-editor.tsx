'use client'

import * as React from 'react'
import Image from 'next/image'
import { Loader2, PlusCircle } from 'lucide-react'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'
import { ImageUpload } from './image-upload'

interface LabelDiagramQuestionsEditorProps {
  quizId: string
}

function makeLabelQuestion(timeLimitSec: number): DraftQuestion {
  return {
    localId: crypto.randomUUID(),
    dbId: null,
    type: 'LABEL',
    prompt: 'Label the diagram:',
    imageUrl: '',
    explanation: '',
    timeLimitSec,
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

export function LabelDiagramQuestionsEditor({ quizId }: LabelDiagramQuestionsEditorProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const labelQuestions = questions.filter((question) => question.type === 'LABEL')
  const addRound = () =>
    addQuestion(makeLabelQuestion(defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC))

  return (
    <div className="space-y-4">
      {labelQuestions.length > 0 && (
        <div className="flex items-center gap-3">
          <Button type="button" onClick={addRound}>
            <PlusCircle className="h-4 w-4" />
            Add round
          </Button>
          <Badge variant="secondary">
            {labelQuestions.length} round{labelQuestions.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}

      {labelQuestions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-14 text-center">
          <Button type="button" size="lg" onClick={addRound}>
            <PlusCircle className="h-5 w-5" />
            Add your first round
          </Button>
          <p className="text-sm text-muted-foreground">No label rounds yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {labelQuestions.map((question, index) => (
            <LabelRoundCard
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

function LabelRoundCard({
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

  const saveRound = async () => {
    setSaveState('saving')
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('type', 'LABEL')
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

  const addLabel = () => {
    onUpdate({
      choices: [
        ...question.choices,
        {
          localId: crypto.randomUUID(),
          text: '',
          isCorrect: false,
          meta: { x: 0.5, y: 0.5, label: '' },
        },
      ],
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Label Round {index + 1}</p>
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

        <ImageUpload
          value={question.imageUrl}
          onChange={(value) => onUpdate({ imageUrl: value })}
        />

        <div className="space-y-2">
          {question.choices.map((choice, choiceIndex) => {
            const x = Number(choice.meta?.x ?? 0.5)
            const y = Number(choice.meta?.y ?? 0.5)
            const label = String(choice.meta?.label ?? choice.text ?? '')

            return (
              <div
                key={choice.localId}
                className="grid gap-2 rounded-lg border p-2 md:grid-cols-[1fr_120px_120px]"
              >
                <input
                  type="text"
                  value={label}
                  onChange={(event) =>
                    updateChoice(choice.localId, {
                      text: event.target.value,
                      meta: { ...(choice.meta ?? {}), label: event.target.value },
                    })
                  }
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  placeholder={`Label ${choiceIndex + 1}`}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(x * 100)}
                  onChange={(event) =>
                    updateChoice(choice.localId, {
                      meta: {
                        ...(choice.meta ?? {}),
                        x: Math.max(0, Math.min(100, Number(event.target.value))) / 100,
                      },
                    })
                  }
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  placeholder="X %"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(y * 100)}
                  onChange={(event) =>
                    updateChoice(choice.localId, {
                      meta: {
                        ...(choice.meta ?? {}),
                        y: Math.max(0, Math.min(100, Number(event.target.value))) / 100,
                      },
                    })
                  }
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  placeholder="Y %"
                />
              </div>
            )
          })}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addLabel}>
          + Add label
        </Button>

        {question.imageUrl && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Preview</p>
            <div className="relative overflow-hidden rounded-lg border">
              <div className="relative aspect-video w-full">
                <Image
                  src={question.imageUrl}
                  alt="Diagram preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
                {question.choices.map((choice) => {
                  const x = Number(choice.meta?.x ?? 0.5)
                  const y = Number(choice.meta?.y ?? 0.5)
                  const label = String(choice.meta?.label ?? choice.text ?? '').trim() || 'Label'
                  return (
                    <div
                      key={choice.localId}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                    >
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-quiz-green" />
                      <span className="ml-1 rounded bg-background/90 px-1 text-xs">{label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

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
