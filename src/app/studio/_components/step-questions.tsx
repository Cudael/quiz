'use client'

import * as React from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'
import { QuestionCard, makeDefaultChoices } from './question-card'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { QuestionType } from '@/store/quiz-creator-store'

interface StepQuestionsProps {
  quizId: string
}

const QUESTION_TYPES: Array<{ type: QuestionType; label: string }> = [
  { type: 'SINGLE', label: 'Single choice' },
  { type: 'MULTIPLE', label: 'Multiple choice' },
  { type: 'TRUEFALSE', label: 'True / False' },
  { type: 'FILL_BLANK', label: 'Fill in the blank' },
]

export function StepQuestions({ quizId }: StepQuestionsProps) {
  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setQuestions: replaceQuestions,
  } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const { addToast } = useToast()

  const [reorderMode, setReorderMode] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const [reorderPending, setReorderPending] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddQuestion = (type: QuestionType) => {
    addQuestion({
      localId: crypto.randomUUID(),
      dbId: null,
      type,
      prompt: '',
      imageUrl: '',
      explanation: '',
      timeLimitSec: defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC,
      choices: makeDefaultChoices(type),
    })
    setShowDropdown(false)
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((question) => question.localId === active.id)
    const newIndex = questions.findIndex((question) => question.localId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const nextQuestions = arrayMove(questions, oldIndex, newIndex)
    replaceQuestions(nextQuestions)

    const persistedQuestions = nextQuestions.reduce<Array<{ id: string; order: number }>>(
      (items, question, index) => {
        if (question.dbId) {
          items.push({ id: question.dbId, order: index })
        }
        return items
      },
      []
    )

    if (persistedQuestions.length === 0 || !quizId) return

    setReorderPending(true)
    const response = await fetch(`/api/studio/quizzes/${quizId}/questions/reorder`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ questions: persistedQuestions }),
    })
    setReorderPending(false)

    if (!response.ok) {
      addToast('Could not save question order.', 'error')
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <Button type="button" size="sm" onClick={() => setShowDropdown((v) => !v)}>
            <PlusCircle className="h-4 w-4" />
            Add question
          </Button>
          {showDropdown && (
            <div className="absolute left-0 top-full z-10 mt-1 w-52 rounded-lg border bg-card p-1 shadow-md">
              {QUESTION_TYPES.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddQuestion(type)}
                  className="w-full rounded px-3 py-2 text-left text-sm hover:bg-accent"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <Badge variant="secondary">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </Badge>

        <Button
          type="button"
          variant={reorderMode ? 'default' : 'outline'}
          size="sm"
          className="ml-auto"
          onClick={() => setReorderMode((v) => !v)}
        >
          {reorderPending ? 'Saving order…' : reorderMode ? 'Done reordering' : 'Reorder'}
        </Button>
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
          <PlusCircle className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No questions yet. Add your first question above.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={reorderMode ? handleDragEnd : undefined}
        >
          <SortableContext
            items={questions.map((question) => question.localId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {reorderMode && (
                <p className="text-sm text-muted-foreground">
                  Drag with the handle or use keyboard sorting to rearrange questions.
                </p>
              )}
              {questions.map((question, index) => (
                <SortableQuestionItem
                  key={question.localId}
                  questionId={question.localId}
                  disabled={!reorderMode}
                >
                  <QuestionCard
                    question={question}
                    index={index}
                    quizId={quizId}
                    reorderMode={reorderMode}
                    onUpdate={(updates) => updateQuestion(question.localId, updates)}
                    onRemove={() => removeQuestion(question.localId)}
                  />
                </SortableQuestionItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableQuestionItem({
  questionId,
  disabled,
  children,
}: {
  questionId: string
  disabled: boolean
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: questionId,
    disabled,
  })
  const sortableProps = {
    ...attributes,
    ...(disabled ? {} : listeners),
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...sortableProps}
    >
      {children}
    </div>
  )
}
