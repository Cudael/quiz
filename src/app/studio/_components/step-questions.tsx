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
import { HotspotQuestionEditor } from './hotspot-question-editor'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'

interface StepQuestionsProps {
  quizId: string
}

export function StepQuestions({ quizId }: StepQuestionsProps) {
  const quizFormat = useQuizCreatorStore((state) => state.quizFormat)

  if (quizFormat === 'IMAGE_CHOICE') {
    return (
      <div className="space-y-6">
        <FormatBanner
          title="Image Choice Quiz"
          description="Add single-choice questions where each answer is an image. Upload an image for each choice and mark the correct one."
        />
        <ClassicQuestionsEditor quizId={quizId} />
      </div>
    )
  }

  if (quizFormat === 'IMAGE_HOTSPOT') {
    return <HotspotQuestionEditor />
  }

  return (
    <div className="space-y-6">
      <FormatBanner
        title="Text Choice Quiz"
        description="Add single-choice questions. For each question, write the question text, fill in all the answer choices, and mark the correct answer using the radio button."
      />
      <ClassicQuestionsEditor quizId={quizId} />
    </div>
  )
}

function FormatBanner({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function ClassicQuestionsEditor({ quizId }: StepQuestionsProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion, setQuestions } =
    useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const { addToast } = useToast()

  const [reorderMode, setReorderMode] = React.useState(false)
  const [reorderPending, setReorderPending] = React.useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleAddQuestion = () => {
    addQuestion({
      localId: crypto.randomUUID(),
      dbId: null,
      type: 'SINGLE',
      prompt: '',
      imageUrl: '',
      explanation: '',
      timeLimitSec: defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC,
      choices: makeDefaultChoices(),
    })
  }

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return

    const oldIndex = questions.findIndex((question) => question.localId === active.id)
    const newIndex = questions.findIndex((question) => question.localId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const nextQuestions = arrayMove(questions, oldIndex, newIndex)
    setQuestions(nextQuestions)

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
        <Button type="button" size="sm" onClick={handleAddQuestion}>
          <PlusCircle className="h-4 w-4" />
          Add question
        </Button>

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
          accessibility={{
            announcements: {
              onDragStart({ active }) {
                const idx = questions.findIndex((q) => q.localId === active.id)
                return `Picked up question ${idx + 1} of ${questions.length}.`
              },
              onDragOver({ active, over }) {
                if (!over) return
                const fromIdx = questions.findIndex((q) => q.localId === active.id)
                const toIdx = questions.findIndex((q) => q.localId === over.id)
                if (fromIdx !== toIdx) {
                  return `Question ${fromIdx + 1} is over position ${toIdx + 1}.`
                }
              },
              onDragEnd({ active, over }) {
                if (!over) {
                  return `Question was dropped and returned to its original position.`
                }
                const fromIdx = questions.findIndex((q) => q.localId === active.id)
                const toIdx = questions.findIndex((q) => q.localId === over.id)
                if (fromIdx !== toIdx) {
                  return `Question ${fromIdx + 1} was moved to position ${toIdx + 1}.`
                }
                return `Question ${fromIdx + 1} was dropped in place.`
              },
              onDragCancel({ active }) {
                const idx = questions.findIndex((q) => q.localId === active.id)
                return `Reordering cancelled. Question ${idx + 1} was returned to its original position.`
              },
            },
          }}
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
