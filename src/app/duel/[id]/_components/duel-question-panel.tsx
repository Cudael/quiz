'use client'

import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DuelAnswer, DuelQuestion, DuelStatePayload } from '../duel-view.types'
import { getOptimisticPoints } from '../duel-view.utils'

interface DuelQuestionPanelProps {
  state: DuelStatePayload
  currentQuestion: DuelQuestion
  currentQuestionIndex: number
  localScore: number
  timeRemainingMs: number | null
  answers: Record<string, DuelAnswer>
  setAnswers: Dispatch<SetStateAction<Record<string, DuelAnswer>>>
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>
  setLocalScore: Dispatch<SetStateAction<number>>
  hasAnsweredCurrent: boolean
  questionStartRef: MutableRefObject<number>
}

export function DuelQuestionPanel({
  state,
  currentQuestion,
  currentQuestionIndex,
  localScore,
  timeRemainingMs,
  answers,
  setAnswers,
  setCurrentQuestionIndex,
  setLocalScore,
  hasAnsweredCurrent,
  questionStartRef,
}: DuelQuestionPanelProps) {
  const totalQuestions = state.questions?.length ?? 0

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {Math.min(currentQuestionIndex + 1, totalQuestions)} / {totalQuestions}
            </span>
            <span>Score: {localScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle>{currentQuestion.prompt}</CardTitle>
            <span className="rounded-md border border-border px-2 py-1 text-sm font-semibold">
              {Math.ceil((timeRemainingMs ?? 0) / 1000)}s
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            {currentQuestion.choices.map((choice) => {
              const isSelected = (answers[currentQuestion.id]?.choiceIds ?? []).includes(choice.id)
              return (
                <Button
                  key={choice.id}
                  variant="outline"
                  className={cn('justify-start', isSelected && 'border-primary bg-primary/10')}
                  disabled={currentQuestion.type !== 'MULTIPLE' && hasAnsweredCurrent}
                  onClick={() => {
                    if (currentQuestion.type !== 'MULTIPLE' && hasAnsweredCurrent) return
                    const elapsed = Date.now() - questionStartRef.current
                    const timeLimitMs = state.duel.timeLimitSec * 1000
                    const timeTakenMs = Math.min(Math.max(elapsed, 0), timeLimitMs)
                    const choiceIds =
                      currentQuestion.type === 'MULTIPLE'
                        ? (answers[currentQuestion.id]?.choiceIds ?? []).includes(choice.id)
                          ? (answers[currentQuestion.id]?.choiceIds ?? []).filter(
                              (id) => id !== choice.id
                            )
                          : [...(answers[currentQuestion.id]?.choiceIds ?? []), choice.id]
                        : [choice.id]

                    setAnswers((prev) => ({
                      ...prev,
                      [currentQuestion.id]: { choiceIds, timeTakenMs },
                    }))

                    if (currentQuestion.type !== 'MULTIPLE') {
                      // Question advances automatically after a 400ms highlight delay
                      // via the useEffect in useDuelSession.
                      setLocalScore(
                        (prev) => prev + getOptimisticPoints(state.duel.timeLimitSec, timeTakenMs)
                      )
                    }
                  }}
                >
                  {choice.text}
                </Button>
              )
            })}
            {currentQuestion.type === 'MULTIPLE' ? (
              <Button
                onClick={() => {
                  const saved = answers[currentQuestion.id]
                  if (!saved || saved.choiceIds.length === 0) return
                  setCurrentQuestionIndex((index) => index + 1)
                  setLocalScore(
                    (prev) => prev + getOptimisticPoints(state.duel.timeLimitSec, saved.timeTakenMs)
                  )
                }}
              >
                Lock answer
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
