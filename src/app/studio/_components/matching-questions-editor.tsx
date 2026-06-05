'use client'

import * as React from 'react'
import { Loader2, PlusCircle } from 'lucide-react'
import { addQuestion, updateQuestion } from '@/app/studio/actions/question-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DEFAULT_TIME_LIMIT_SEC } from '@/domain/quiz-constants'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { DraftChoice, DraftQuestion } from '@/store/quiz-creator-store'

interface MatchingQuestionsEditorProps {
  quizId: string
}

function makePair(index: number) {
  const pairKey = crypto.randomUUID()
  return [
    {
      localId: crypto.randomUUID(),
      text: `Left ${index + 1}`,
      isCorrect: false,
      meta: { pairKey, side: 'left' },
    },
    {
      localId: crypto.randomUUID(),
      text: `Right ${index + 1}`,
      isCorrect: false,
      meta: { pairKey, side: 'right' },
    },
  ] satisfies DraftChoice[]
}

function makeMatchingQuestion(timeLimitSec: number): DraftQuestion {
  return {
    localId: crypto.randomUUID(),
    dbId: null,
    type: 'MATCHING',
    prompt: 'Match each item on the left to its pair on the right:',
    imageUrl: '',
    explanation: '',
    timeLimitSec,
    choices: Array.from({ length: 4 }, (_, index) => makePair(index)).flat(),
  }
}

export function MatchingQuestionsEditor({ quizId }: MatchingQuestionsEditorProps) {
  const { questions, addQuestion, updateQuestion, removeQuestion } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)
  const matchingQuestions = questions.filter((question) => question.type === 'MATCHING')

  const addRound = () =>
    addQuestion(makeMatchingQuestion(defaultTimeLimitSec ?? DEFAULT_TIME_LIMIT_SEC))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button type="button" onClick={addRound}>
          <PlusCircle className="h-4 w-4" />
          Add round
        </Button>
        <Badge variant="secondary">
          {matchingQuestions.length} round{matchingQuestions.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {matchingQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
          No match rounds yet.
        </div>
      ) : (
        <div className="space-y-3">
          {matchingQuestions.map((question, index) => (
            <MatchingRoundCard
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

function MatchingRoundCard({
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
  const pairs = getPairs(question.choices)

  const saveRound = React.useCallback(async () => {
    if (!quizId) return
    setSaveState('saving')
    const formData = new FormData()
    formData.set('quizId', quizId)
    formData.set('type', 'MATCHING')
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
  }, [quizId, question, index, onUpdate])

  // Auto-save with debounce whenever round data changes
  const saveRoundRef = React.useRef(saveRound)
  React.useEffect(() => {
    saveRoundRef.current = saveRound
  }, [saveRound])

  const autoSaveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRenderRef = React.useRef(true)

  React.useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    if (!quizId) return
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      saveRoundRef.current()
    }, 1500)
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.prompt, question.timeLimitSec, question.choices, quizId])

  const updatePair = (pairKey: string, side: 'left' | 'right', text: string) => {
    onUpdate({
      choices: question.choices.map((choice) =>
        choice.meta?.pairKey === pairKey && choice.meta?.side === side
          ? { ...choice, text }
          : choice
      ),
    })
  }

  const addPair = () => {
    onUpdate({ choices: [...question.choices, ...makePair(pairs.length)] })
  }

  const removePair = (pairKey: string) => {
    onUpdate({ choices: question.choices.filter((choice) => choice.meta?.pairKey !== pairKey) })
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-medium">Match Round {index + 1}</p>
        <div className="flex items-center gap-3">
          {saveState === 'saving' && (
            <span className="text-xs text-muted-foreground">
              <Loader2 className="mr-1 inline h-3 w-3 animate-spin" />
              Saving…
            </span>
          )}
          {saveState === 'saved' && (
            <span className="text-xs text-quiz-green">Saved</span>
          )}
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-destructive"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={question.prompt}
          onChange={(event) => onUpdate({ prompt: event.target.value })}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Round title / instruction"
        />

        <p className="border-l-2 border-muted-foreground/40 pl-3 text-sm text-muted-foreground">
          Each left item will be matched to the right item in the same row. Edit both sides to set
          the correct pairs.
        </p>

        <div className="rounded-lg border">
          <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 border-b px-3 py-2 text-xs font-semibold text-muted-foreground">
            <span>Left column</span>
            <span />
            <span>Right column</span>
            <span />
          </div>
          <div className="space-y-2 p-3">
            {pairs.map((pair, pairIndex) => (
              <div
                key={pair.pairKey}
                className="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-2"
              >
                <input
                  type="text"
                  value={pair.left?.text ?? ''}
                  onChange={(event) => updatePair(pair.pairKey, 'left', event.target.value)}
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  placeholder={`Left ${pairIndex + 1}`}
                />
                <span className="font-semibold text-primary">↔</span>
                <input
                  type="text"
                  value={pair.right?.text ?? ''}
                  onChange={(event) => updatePair(pair.pairKey, 'right', event.target.value)}
                  className="rounded-md border bg-background px-2 py-1 text-sm"
                  placeholder={`Right ${pairIndex + 1}`}
                />
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => removePair(pair.pairKey)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addPair}>
          + Add pair
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
      </div>
    </div>
  )
}

function getPairs(choices: DraftChoice[]) {
  const pairMap = new Map<string, { pairKey: string; left?: DraftChoice; right?: DraftChoice }>()
  for (const choice of choices) {
    const pairKey = String(choice.meta?.pairKey ?? '')
    if (!pairKey) continue
    const existing = pairMap.get(pairKey) ?? { pairKey }
    if (choice.meta?.side === 'left') existing.left = choice
    if (choice.meta?.side === 'right') existing.right = choice
    pairMap.set(pairKey, existing)
  }
  return Array.from(pairMap.values())
}

function formDataWithQuestionId(formData: FormData, questionId: string) {
  formData.set('questionId', questionId)
  return formData
}
