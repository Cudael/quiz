'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DuelLobby } from './_components/duel-lobby'
import { DuelQuestionPanel } from './_components/duel-question-panel'
import { DuelResults } from './_components/duel-results'
import type { DuelViewProps } from './duel-view.types'
import { useDuelSession } from './use-duel-session'

export type { DuelViewProps } from './duel-view.types'

export function DuelView({ duelId }: DuelViewProps) {
  const {
    state,
    loading,
    submittingStart,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    timeRemainingMs,
    localScore,
    setLocalScore,
    submitted,
    currentQuestion,
    participantCount,
    hasAnsweredCurrent,
    viewerParticipant,
    questionStartRef,
    startDuel,
  } = useDuelSession(duelId)

  if (loading || !state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (state.duel.status === 'WAITING') {
    return (
      <DuelLobby
        state={state}
        participantCount={participantCount}
        submittingStart={submittingStart}
        onStart={() => {
          startDuel().catch(() => {})
        }}
      />
    )
  }

  if (state.duel.status === 'FINISHED') {
    return <DuelResults state={state} />
  }

  if (viewerParticipant?.finished || submitted) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Waiting for other players…</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You finished with {viewerParticipant?.score ?? localScore} points.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!state.questions || state.questions.length === 0 || !currentQuestion) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Preparing questions…</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <DuelQuestionPanel
      state={state}
      currentQuestion={currentQuestion}
      currentQuestionIndex={currentQuestionIndex}
      localScore={localScore}
      timeRemainingMs={timeRemainingMs}
      answers={answers}
      setAnswers={setAnswers}
      setCurrentQuestionIndex={setCurrentQuestionIndex}
      setLocalScore={setLocalScore}
      hasAnsweredCurrent={hasAnsweredCurrent}
      questionStartRef={questionStartRef}
    />
  )
}
