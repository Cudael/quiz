'use client'

import * as React from 'react'
import { ChevronDown, ChevronUp, GripVertical, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { ImageSearchDialog } from './image-search-dialog'
import { ImageUpload } from './image-upload'
import { useQuestionCard } from './use-question-card'
import {
  AudioUrlField,
  GroupsBoardEditor,
  ImageRevealFields,
  MatchPairsEditor,
  MemoryFlashFields,
  NumberGuessFields,
  OrderChoicesEditor,
  TypeAnswerFields,
  VersusChoicesEditor,
} from './format-question-editors'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftQuestion } from '@/store/quiz-creator-store'

interface QuestionCardProps {
  question: DraftQuestion
  index: number
  quizId: string
  reorderMode: boolean
  onUpdate: (updates: Partial<DraftQuestion>) => void
  onRemove: () => void
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
  const [imageSearchChoiceId, setImageSearchChoiceId] = React.useState<string | null>(null)
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
  const imageSearchChoice = question.choices.find(
    (choice) => choice.localId === imageSearchChoiceId
  )

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
              className="w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
              placeholder="Enter your question..."
            />
          </div>

          {/* Format-specific extras above the answers section */}
          {quizFormat === 'IMAGE_REVEAL' && (
            <ImageRevealFields question={question} onUpdate={onUpdate} />
          )}
          {quizFormat === 'AUDIO_CHOICE' && (
            <AudioUrlField question={question} onUpdate={onUpdate} />
          )}
          {quizFormat === 'MEMORY_FLASH' && (
            <MemoryFlashFields question={question} onUpdate={onUpdate} />
          )}
          {(quizFormat === 'TEXT_CHOICE' ||
            quizFormat === 'IMAGE_CHOICE' ||
            quizFormat === 'ODD_ONE_OUT') && (
            <div className="space-y-1">
              <p className="text-xs font-medium">Question image (optional)</p>
              <ImageUpload
                compact
                value={question.imageUrl}
                onChange={(url) => onUpdate({ imageUrl: url })}
              />
            </div>
          )}

          {/* Answers section — dispatched by quiz format */}
          {quizFormat === 'ORDER' ? (
            <OrderChoicesEditor question={question} onUpdate={onUpdate} />
          ) : quizFormat === 'MATCH' ? (
            <MatchPairsEditor question={question} onUpdate={onUpdate} />
          ) : quizFormat === 'CONNECTIONS' ? (
            <GroupsBoardEditor question={question} onUpdate={onUpdate} />
          ) : quizFormat === 'NUMBER_GUESS' ? (
            <NumberGuessFields question={question} onUpdate={onUpdate} />
          ) : quizFormat === 'TYPE_ANSWER' || quizFormat === 'ANAGRAM' ? (
            <TypeAnswerFields question={question} onUpdate={onUpdate} />
          ) : quizFormat === 'VERSUS' ? (
            <VersusChoicesEditor question={question} onUpdate={onUpdate} />
          ) : (
            <div className="space-y-2">
              <div>
                <p className="block text-sm font-medium">Choices</p>
                <p className="text-xs text-muted-foreground">
                  {quizFormat === 'IMAGE_CHOICE'
                    ? 'Upload or find an Unsplash image for each choice, then select the correct one.'
                    : quizFormat === 'ODD_ONE_OUT'
                      ? 'Add the items, then mark the odd one out as the correct answer.'
                      : 'Fill in all the choices, then select the radio button next to the correct one.'}
                </p>
              </div>

              <div
                className={quizFormat === 'IMAGE_CHOICE' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}
              >
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
                      <div className="min-w-0 flex-1 space-y-1">
                        <ImageUpload
                          compact
                          value={choice.imageUrl}
                          onChange={(url) => updateChoice(choice.localId, { imageUrl: url })}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setImageSearchChoiceId(choice.localId)}
                          aria-label={`Find Unsplash image for choice ${i + 1}`}
                        >
                          <Search className="h-3.5 w-3.5" />
                          Find on Unsplash
                        </Button>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
                          placeholder="Caption (optional)"
                          aria-label={`Choice ${i + 1} caption`}
                          className="w-full rounded-md border bg-background px-2 py-1 text-base md:text-xs"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(choice.localId, { text: e.target.value })}
                        placeholder={`Choice ${i + 1}`}
                        className="min-w-0 flex-1 rounded-md border bg-background px-3 py-1.5 text-base md:text-sm"
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

              {imageSearchChoice && (
                <ImageSearchDialog
                  open
                  onClose={() => setImageSearchChoiceId(null)}
                  onSelect={(url) => updateChoice(imageSearchChoice.localId, { imageUrl: url })}
                  defaultQuery={imageSearchChoice.text.trim() || question.prompt.trim()}
                  description={question.prompt.trim() || undefined}
                />
              )}
            </div>
          )}

          {/* Time limit */}
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor={`time-${question.localId}`} className="text-xs font-medium">
              Time limit
            </label>
            <div className="flex gap-1">
              {[10, 20, 30, 60].map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => onUpdate({ timeLimitSec: seconds })}
                  className={cn(
                    'rounded-sm border px-2.5 py-1 text-xs font-medium transition-colors',
                    question.timeLimitSec === seconds
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground hover:border-primary/50'
                  )}
                >
                  {seconds}s
                </button>
              ))}
            </div>
            <input
              id={`time-${question.localId}`}
              type="number"
              min={5}
              max={120}
              value={question.timeLimitSec}
              onChange={(e) => {
                const parsed = Math.round(Number(e.target.value))
                if (Number.isFinite(parsed)) {
                  onUpdate({ timeLimitSec: Math.min(120, Math.max(5, parsed)) })
                }
              }}
              aria-label="Custom time limit in seconds"
              className="w-16 rounded-md border bg-background px-2 py-1 text-base md:text-xs"
            />
            <span className="text-xs text-muted-foreground">seconds per question</span>
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
                className="w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
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
