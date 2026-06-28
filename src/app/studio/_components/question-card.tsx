'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ImageUpload } from './image-upload'
import { useQuestionCard } from './use-question-card'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftQuestion, DraftChoice } from '@/store/quiz-creator-store'

interface QuestionCardProps {
  question: DraftQuestion
  index: number
  quizId: string
  reorderMode: boolean
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onRemove: () => void
}

export function makeDefaultChoices(): DraftChoice[] {
  return [
    { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: true },
    { localId: crypto.randomUUID(), text: '', imageUrl: '', isCorrect: false },
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
  const quizFormat = useQuizCreatorStore((state) => state.quizFormat)
  const {
    open,
    setOpen,
    deleteModalOpen,
    setDeleteModalOpen,
    showExplanation,
    setShowExplanation,
    handleDeleteClick,
    handleConfirmDelete,
    updateChoice,
    addChoice,
    removeChoice,
    setCorrect,
  } = useQuestionCard({ question, index, quizId, onUpdate, onRemove })

  return (
    <div className="rounded-md border bg-card">
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
          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
          title="Delete question"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      {open && (
        <div className="space-y-4 border-t px-4 py-4">
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
              placeholder="Enter your question..."
            />
          </div>

          {/* Choices */}
          <div className="space-y-2">
            <div>
              <p className="block text-sm font-medium">Choices</p>
              <p className="text-xs text-muted-foreground">
                {quizFormat === 'IMAGE_CHOICE'
                  ? 'Upload an image for each choice, then select the correct one.'
                  : 'Fill in all the choices, then select the radio button next to the correct one.'}
              </p>
            </div>

            <div className={quizFormat === 'IMAGE_CHOICE' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
              {question.choices.map((choice, i) => (
                <div
                  key={choice.localId}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-2 py-1 transition-colors',
                    choice.isCorrect
                      ? 'border-quiz-green/40 bg-quiz-green/10'
                      : quizFormat === 'IMAGE_CHOICE'
                        ? 'border-border'
                        : 'border-transparent'
                  )}
                >
                  <input
                    type="radio"
                    name={`correct-${question.localId}`}
                    checked={choice.isCorrect}
                    onChange={() => setCorrect(choice.localId)}
                    title="Mark as correct answer"
                  />
                  {quizFormat === 'IMAGE_CHOICE' ? (
                    <ImageUpload
                      compact
                      value={choice.imageUrl}
                      onChange={(url) => updateChoice(choice.localId, { imageUrl: url })}
                    />
                  ) : (
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
                      placeholder={`Choice ${i + 1}`}
                      className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
                    />
                  )}
                  {choice.isCorrect && (
                    <span className="shrink-0 text-xs font-medium text-quiz-green">✓</span>
                  )}
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
        </div>
      )}

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete question?"
        description="All its content will be lost."
        size="sm"
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
