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
import { GripVertical, Loader2, PlusCircle } from 'lucide-react'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

interface TimelineQuestionsEditorProps {
  quizId: string
}

function makeTimelineQuestion(timeLimitSec: number): DraftQuestion {
  return {
    localId: crypto.randomUUID(),
    dbId: null,
    type: 'ORDERING',
    prompt: 'Put these events in the correct order:',
    imageUrl: '',
    explanation: '',
    timeLimitSec,
    choices: Array.from({ length: 4 }, (_, index) => ({
      localId: crypto.randomUUID(),
      text: `Event ${index + 1}`,
      isCorrect: false,
      meta: { order: index },
    })),
  }
}

export function TimelineQuestionsEditor({ quizId }: TimelineQuestionsEditorProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const timelineQuestions = questions.filter((question) => question.type === 'ORDERING')

  const handleAddRound = () => {
    addQuestion(makeTimelineQuestion(defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC))
  }

  if (timelineQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-14 text-center">
        <Button type="button" size="lg" onClick={handleAddRound}>
          <PlusCircle className="h-5 w-5" />
          Add your first round
        </Button>
        <p className="text-sm text-muted-foreground">No timeline rounds yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleAddRound}>
          <PlusCircle className="h-4 w-4" />
          Add round
        </Button>
        <Badge variant="secondary">
          {timelineQuestions.length} round{timelineQuestions.length !== 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="space-y-3">
        {timelineQuestions.map((question, index) => (
          <TimelineRoundCard
            key={question.localId}
            question={question}
            index={index}
            quizId={quizId}
            onUpdate={(updates) => updateQuestion(question.localId, updates)}
            onRemove={() => removeQuestion(question.localId)}
          />
        ))}
      </div>
    </div>
  )
}

function TimelineRoundCard({
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const normalizedChoices = React.useMemo(
    () =>
      question.choices.map((choice, choiceIndex) => ({
        ...choice,
        meta: { ...(choice.meta ?? {}), order: choiceIndex },
      })),
    [question.choices]
  )

  const saveRound = async () => {
    setSaveState('saving')
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('type', 'ORDERING')
    formData.set('prompt', question.prompt)
    formData.set('imageUrl', question.imageUrl)
    formData.set('explanation', question.explanation)
    formData.set('timeLimitSec', String(question.timeLimitSec))
    formData.set('order', String(index))
    formData.set(
      'choices',
      JSON.stringify(
        normalizedChoices.map((choice) => ({
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
      return
    }

    setSaveState('idle')
  }

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIndex = question.choices.findIndex((choice) => choice.localId === active.id)
    const newIndex = question.choices.findIndex((choice) => choice.localId === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    const reordered = arrayMove(question.choices, oldIndex, newIndex).map((choice, itemIndex) => ({
      ...choice,
      meta: { ...(choice.meta ?? {}), order: itemIndex },
    }))
    onUpdate({ choices: reordered })
  }

  const addItem = () => {
    const nextOrder = question.choices.length
    onUpdate({
      choices: [
        ...question.choices,
        {
          localId: crypto.randomUUID(),
          text: `Event ${nextOrder + 1}`,
          isCorrect: false,
          meta: { order: nextOrder },
        },
      ],
    })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Timeline Round {index + 1}</p>
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

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={question.choices.map((choice) => choice.localId)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {question.choices.map((choice, choiceIndex) => (
                <TimelineChoiceRow
                  key={choice.localId}
                  choice={choice}
                  index={choiceIndex}
                  onChange={(updates) =>
                    onUpdate({
                      choices: question.choices.map((item) =>
                        item.localId === choice.localId ? { ...item, ...updates } : item
                      ),
                    })
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          + Add item
        </Button>

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

function TimelineChoiceRow({
  choice,
  index,
  onChange,
}: {
  choice: DraftChoice
  index: number
  onChange: (updates: Partial<DraftChoice>) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: choice.localId,
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-md border bg-background px-2 py-2"
    >
      <button type="button" {...listeners} className="cursor-grab text-muted-foreground">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-semibold">
        {index + 1}
      </span>
      <input
        type="text"
        value={choice.text}
        onChange={(event) => onChange({ text: event.target.value })}
        className="min-w-0 flex-1 rounded-md border bg-background px-2 py-1 text-sm"
      />
    </div>
  )
}

function formDataWithQuestionId(formData: FormData, questionId: string) {
  formData.set('questionId', questionId)
  return formData
}
