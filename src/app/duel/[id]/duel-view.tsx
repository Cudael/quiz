'use client'

import { Loader2 } from 'lucide-react'
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
    submittingJoin,
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
    joinDuel,
  } = useDuelSession(duelId)

  if (loading || !state) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              Loading duel...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Fetching match details and players.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.duel.status === 'WAITING') {
    return (
      <DuelLobby
        state={state}
        participantCount={participantCount}
        submittingStart={submittingStart}
        submittingJoin={submittingJoin}
        onStart={() => {
          startDuel().catch(() => {})
        }}
        onJoin={() => {
          joinDuel().catch(() => {})
        }}
      />
    )
  }

  if (state.duel.status === 'FINISHED') {
    return <DuelResults state={state} />
  }

  // A visitor who arrived after the duel already started (e.g. a stale link)
  // was never added as a participant and has nothing to play — show a clear
  // message instead of falling through to a broken question panel.
  if (!state.isHost && !state.viewerParticipantId) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>This duel has already started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You&apos;ll need to join before the next round begins, or create a new duel to play.
            </p>
          </CardContent>
        </Card>
      </div>
    )
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
