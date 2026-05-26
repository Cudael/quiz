'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, GripVertical, Loader2, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FILL_BLANK_PLACEHOLDER } from '@/domain/quiz-constants'
import { ImageUpload } from './image-upload'
import { QuestionTypeIcon } from './question-type-icon'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import type { DraftQuestion, DraftChoice } from '@/store/quiz-creator-store'

interface QuestionCardProps {
  question: DraftQuestion
  index: number
  quizId: string
  reorderMode: boolean
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onRemove: () => void
}

export function makeDefaultChoices(type: DraftQuestion['type']): DraftChoice[] {
  if (type === 'TRUEFALSE') {
    return [
      { localId: crypto.randomUUID(), text: 'True', isCorrect: true },
      { localId: crypto.randomUUID(), text: 'False', isCorrect: false },
    ]
  }
  if (type === 'FILL_BLANK') {
    return [{ localId: crypto.randomUUID(), text: '', isCorrect: true }]
  }
  return [
    { localId: crypto.randomUUID(), text: '', isCorrect: true },
    { localId: crypto.randomUUID(), text: '', isCorrect: false },
  ]
}

export function QuestionCard({
  question,
  index,
  quizId,
  reorderMode,
  onUpdate,
  onRemove,
}: QuestionCardProps) {
  const [open, setOpen] = React.useState(question.dbId === null)
  const [deleteCount, setDeleteCount] = React.useState(0)
  const [saveState, setSaveState] = React.useState<'idle' | 'saving' | 'saved'>('idle')
  const [showExplanation, setShowExplanation] = React.useState(!!question.explanation)

  const handleDeleteClick = () => {
    if (deleteCount === 0) {
      setDeleteCount(1)
      setTimeout(() => setDeleteCount(0), 2000)
    } else {
      onRemove()
    }
  }

  const handleSave = async () => {
    setSaveState('saving')

    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('type', question.type)
    formData.set('prompt', question.prompt)
    formData.set('imageUrl', question.imageUrl)
    formData.set('explanation', question.explanation)
    formData.set('timeLimitSec', String(question.timeLimitSec))
    formData.set('order', String(index))
    formData.set(
      'choices',
      JSON.stringify(question.choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })))
    )

    let result
    if (question.dbId) {
      formData.set('questionId', question.dbId)
      result = await updateQuestion(formData)
    } else {
      result = await addQuestion(formData)
    }

    if (result.ok) {
      if ('questionId' in result) {
        onUpdate({ dbId: result.questionId })
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } else {
      setSaveState('idle')
    }
  }

  const updateChoice = (localId: string, updates: Partial<DraftChoice>) => {
    onUpdate({
      choices: question.choices.map((c) => (c.localId === localId ? { ...c, ...updates } : c)),
    })
  }

  const addChoice = () => {
    onUpdate({
      choices: [...question.choices, { localId: crypto.randomUUID(), text: '', isCorrect: false }],
    })
  }

  const removeChoice = (localId: string) => {
    onUpdate({ choices: question.choices.filter((c) => c.localId !== localId) })
  }

  const setCorrect = (localId: string, isCorrect: boolean) => {
    if (question.type === 'SINGLE' || question.type === 'TRUEFALSE') {
      onUpdate({
        choices: question.choices.map((c) => ({ ...c, isCorrect: c.localId === localId })),
      })
    } else {
      updateChoice(localId, { isCorrect })
    }
  }

  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        {reorderMode && (
          <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-muted-foreground" />
        )}
        <span className="shrink-0 text-sm font-semibold text-muted-foreground">#{index + 1}</span>
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block truncate text-sm font-medium">
            {question.prompt || 'New question'}
          </span>
        </button>
        <QuestionTypeIcon type={question.type} showLabel />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 text-muted-foreground"
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          className={cn(
            'shrink-0 rounded p-1 transition-colors',
            deleteCount === 1
              ? 'text-destructive bg-destructive/10'
              : 'text-muted-foreground hover:text-destructive'
          )}
          title={deleteCount === 1 ? 'Click again to confirm delete' : 'Delete question'}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="space-y-4 border-t px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1">
              <label htmlFor={`prompt-${question.localId}`} className="block text-sm font-medium">
                Question
              </label>
              <textarea
                id={`prompt-${question.localId}`}
                value={question.prompt}
                onChange={(e) => onUpdate({ prompt: e.target.value })}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={
                  question.type === 'FILL_BLANK'
                    ? `Include ${FILL_BLANK_PLACEHOLDER} exactly once, e.g. The capital of France is ${FILL_BLANK_PLACEHOLDER}.`
                    : 'Enter your question...'
                }
              />
              {question.type === 'FILL_BLANK' && (
                <p className="text-xs text-muted-foreground">
                  Include {FILL_BLANK_PLACEHOLDER} exactly once in the prompt so players know where
                  to type the missing answer.
                </p>
              )}
            </div>
            <div className="sm:w-48">
              <ImageUpload
                compact
                value={question.imageUrl}
                onChange={(v) => onUpdate({ imageUrl: v })}
              />
            </div>
          </div>

          {/* Choices */}
          <div className="space-y-2">
            <p className="block text-sm font-medium">
              {question.type === 'FILL_BLANK' ? 'Correct answer' : 'Choices'}
            </p>

            {question.type === 'TRUEFALSE' ? (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <div key={choice.localId} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${question.localId}`}
                      checked={choice.isCorrect}
                      onChange={() => setCorrect(choice.localId, true)}
                    />
                    <span className="text-sm">{choice.text}</span>
                  </div>
                ))}
              </div>
            ) : question.type === 'FILL_BLANK' ? (
              <div className="space-y-2">
                {question.choices.map((choice) => (
                  <input
                    key={choice.localId}
                    type="text"
                    value={choice.text}
                    onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
                    placeholder="Correct answer"
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {question.choices.map((choice, i) => (
                  <div key={choice.localId} className="flex items-center gap-2">
                    {question.type === 'SINGLE' ? (
                      <input
                        type="radio"
                        name={`correct-${question.localId}`}
                        checked={choice.isCorrect}
                        onChange={() => setCorrect(choice.localId, true)}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={choice.isCorrect}
                        onChange={(e) => setCorrect(choice.localId, e.target.checked)}
                      />
                    )}
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
                      placeholder={`Choice ${i + 1}`}
                      className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
                    />
                    {question.choices.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeChoice(choice.localId)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addChoice}>
                  + Add choice
                </Button>
              </div>
            )}
          </div>

          {/* Explanation toggle */}
          <div className="space-y-2">
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => setShowExplanation((v) => !v)}
            >
              {showExplanation ? 'Hide explanation' : 'Add explanation (optional)'}
            </button>
            {showExplanation && (
              <textarea
                value={question.explanation}
                onChange={(e) => onUpdate({ explanation: e.target.value })}
                rows={2}
                maxLength={500}
                placeholder="Explain the correct answer..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            )}
          </div>

          {/* Save button */}
          <Button type="button" onClick={handleSave} disabled={saveState === 'saving'} size="sm">
            {saveState === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {saveState === 'saved' && <Check className="h-4 w-4" />}
            {saveState === 'idle' && null}
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save question'}
          </Button>
        </div>
      )}
    </div>
  )
}
