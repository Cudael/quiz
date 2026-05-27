'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import { scoreQuestion } from '@/domain/scoring'

interface DuelQuestionChoice {
  id: string
  text: string
}

interface DuelQuestion {
  id: string
  type: string
  prompt: string
  imageUrl: string | null
  choices: DuelQuestionChoice[]
}

interface DuelParticipant {
  id: string
  userId: string | null
  guestName: string | null
  score: number
  correctCount: number
  finished: boolean
  joinedAt: string
}

interface DuelStatePayload {
  duel: {
    id: string
    code: string
    hostId: string
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED'
    categoryId: string | null
    questionCount: number
    timeLimitSec: number
    finishedAt: string | null
  }
  participants: DuelParticipant[]
  questions: DuelQuestion[] | null
  viewerParticipantId: string | null
  isHost: boolean
}

interface DuelViewProps {
  duelId: string
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error ?? fallback
  } catch {
    return fallback
  }
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

function getOptimisticPoints(timeLimitSec: number, timeTakenMs: number) {
  const timeLimitMs = timeLimitSec * 1000
  const clampedTime = Math.min(Math.max(0, timeTakenMs), timeLimitMs)
  return scoreQuestion({
    correct: true,
    timeRemainingMs: timeLimitMs - clampedTime,
    timeLimitMs,
    streak: 0,
  })
}

export function DuelView({ duelId }: DuelViewProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [state, setState] = useState<DuelStatePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [submittingStart, setSubmittingStart] = useState(false)
  const [answers, setAnswers] = useState<
    Record<string, { choiceIds: string[]; timeTakenMs: number }>
  >({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)
  const [fillBlankValue, setFillBlankValue] = useState('')
  const [localScore, setLocalScore] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const questionStartRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = state?.questions?.[currentQuestionIndex] ?? null
  const participantCount = state?.participants.length ?? 0
  const hasAnsweredCurrent = currentQuestion ? Boolean(answers[currentQuestion.id]) : false

  const viewerParticipant = useMemo(
    () =>
      state?.participants.find((participant) => participant.id === state.viewerParticipantId) ??
      null,
    [state]
  )

  const fetchState = useCallback(async () => {
    const response = await fetch(`/api/duel/${duelId}`)
    if (!response.ok) {
      if (response.status === 404) {
        addToast('Duel not found.', 'error')
        router.push('/duel')
      }
      return
    }
    const payload = (await response.json()) as DuelStatePayload
    setState(payload)
    if (payload.duel.status !== 'IN_PROGRESS') {
      setSubmitted(false)
      setAnswers({})
      setCurrentQuestionIndex(0)
      setLocalScore(0)
    }
  }, [duelId, addToast, router])

  useEffect(() => {
    let active = true
    const bootstrapTimer = setTimeout(() => {
      fetchState()
        .catch(() => addToast('Could not load duel.', 'error'))
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)

    const interval = setInterval(() => {
      fetchState().catch(() => {})
    }, 2000)
    return () => {
      active = false
      clearTimeout(bootstrapTimer)
      clearInterval(interval)
    }
  }, [fetchState, addToast])

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (
      !state ||
      state.duel.status !== 'IN_PROGRESS' ||
      !currentQuestion ||
      hasAnsweredCurrent ||
      submitted
    ) {
      return
    }
    const limit = state.duel.timeLimitSec * 1000
    const setTimeTimer = setTimeout(() => setTimeRemainingMs(limit), 0)
    questionStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeRemainingMs((current) => {
        if (current <= 200) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          return 0
        }
        return current - 200
      })
    }, 200)

    return () => {
      clearTimeout(setTimeTimer)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [state, currentQuestion, hasAnsweredCurrent, submitted])

  const submitDuelAnswers = useCallback(async () => {
    if (submitted) return
    const serializedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      choiceIds: answer.choiceIds,
      timeTakenMs: answer.timeTakenMs,
    }))
    const response = await fetch(`/api/duel/${duelId}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ answers: serializedAnswers }),
    })

    if (!response.ok) {
      addToast(await readErrorMessage(response, 'Could not submit duel answers.'), 'error')
      return
    }

    setSubmitted(true)
    await fetchState()
  }, [submitted, answers, duelId, addToast, fetchState])

  useEffect(() => {
    if (!state || state.duel.status !== 'IN_PROGRESS' || submitted) return
    if (!state.questions || state.questions.length === 0) return
    if (Object.keys(answers).length >= state.questions.length) {
      const submitTimer = setTimeout(() => {
        submitDuelAnswers().catch(() => addToast('Could not submit duel answers.', 'error'))
      }, 0)
      return () => clearTimeout(submitTimer)
    }
  }, [state, submitted, answers, submitDuelAnswers, addToast])

  useEffect(() => {
    if (
      timeRemainingMs === 0 &&
      state?.duel.status === 'IN_PROGRESS' &&
      currentQuestion &&
      !hasAnsweredCurrent &&
      !submitted
    ) {
      const timeoutTimer = setTimeout(() => {
        setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: { choiceIds: [], timeTakenMs: state.duel.timeLimitSec * 1000 },
        }))
        setCurrentQuestionIndex((index) => index + 1)
        setFillBlankValue('')
      }, 0)
      return () => clearTimeout(timeoutTimer)
    }
  }, [timeRemainingMs, state, currentQuestion, hasAnsweredCurrent, submitted])

  if (loading || !state) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (state.duel.status === 'WAITING') {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-3xl tracking-widest">
              {state.duel.code}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Share this invite code. Players joined: {participantCount}
            </p>
            <ul className="space-y-2">
              {state.participants.map((participant) => (
                <li
                  key={participant.id}
                  className="rounded-md border border-border px-3 py-2 text-sm"
                >
                  {participant.guestName ||
                    (participant.userId ? 'Registered player' : 'Guest player')}
                </li>
              ))}
            </ul>
            {state.isHost ? (
              <Button
                className="w-full"
                variant="gradient"
                disabled={participantCount < 2 || submittingStart}
                onClick={async () => {
                  setSubmittingStart(true)
                  try {
                    const response = await fetch(`/api/duel/${duelId}/start`, { method: 'POST' })
                    if (!response.ok) {
                      addToast(await readErrorMessage(response, 'Could not start duel.'), 'error')
                      return
                    }
                    await fetchState()
                  } finally {
                    setSubmittingStart(false)
                  }
                }}
              >
                {submittingStart ? 'Starting…' : 'Start Duel'}
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (state.duel.status === 'FINISHED') {
    const sortedParticipants = [...state.participants].sort((a, b) => b.score - a.score)

    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-2">Player</th>
                    <th className="py-2 pr-2">Score</th>
                    <th className="py-2">Correct</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedParticipants.map((participant, index) => (
                    <tr
                      key={participant.id}
                      className={index === 0 ? 'bg-quiz-yellow/10 font-semibold' : undefined}
                    >
                      <td className="py-2 pr-2">
                        {participant.guestName ||
                          (participant.userId ? 'Registered player' : 'Guest player')}
                      </td>
                      <td className="py-2 pr-2">{participant.score}</td>
                      <td className="py-2">{participant.correctCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="gradient" className="flex-1">
                <Link href="/duel">Play Again</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">Go Home</Link>
              </Button>
            </div>
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
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Question {Math.min(currentQuestionIndex + 1, state.questions.length)} /{' '}
              {state.questions.length}
            </span>
            <span>Score: {localScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <CardTitle>{currentQuestion.prompt}</CardTitle>
            <span className="rounded-md border border-border px-2 py-1 text-sm font-semibold">
              {Math.ceil(timeRemainingMs / 1000)}s
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.type === 'FILL_BLANK' ? (
            <div className="space-y-3">
              <Input
                value={fillBlankValue}
                onChange={(event) => setFillBlankValue(event.target.value)}
                placeholder="Type your answer"
              />
              <Button
                className="w-full"
                disabled={fillBlankValue.trim().length === 0}
                onClick={() => {
                  const normalized = normalizeAnswer(fillBlankValue)
                  const choiceIds = currentQuestion.choices
                    .filter((choice) => normalizeAnswer(choice.text) === normalized)
                    .map((choice) => choice.id)
                  const elapsed = Date.now() - questionStartRef.current
                  const timeLimitMs = state.duel.timeLimitSec * 1000
                  const timeTakenMs = Math.min(Math.max(elapsed, 0), timeLimitMs)
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: { choiceIds, timeTakenMs },
                  }))
                  setCurrentQuestionIndex((index) => index + 1)
                  setFillBlankValue('')
                  setLocalScore(
                    (prev) => prev + getOptimisticPoints(state.duel.timeLimitSec, timeTakenMs)
                  )
                }}
              >
                Submit answer
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              {currentQuestion.choices.map((choice) => (
                <Button
                  key={choice.id}
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
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
                      setCurrentQuestionIndex((index) => index + 1)
                      setLocalScore(
                        (prev) => prev + getOptimisticPoints(state.duel.timeLimitSec, timeTakenMs)
                      )
                    }
                  }}
                >
                  {choice.text}
                </Button>
              ))}
              {currentQuestion.type === 'MULTIPLE' ? (
                <Button
                  onClick={() => {
                    const saved = answers[currentQuestion.id]
                    if (!saved || saved.choiceIds.length === 0) return
                    setCurrentQuestionIndex((index) => index + 1)
                    setLocalScore(
                      (prev) =>
                        prev + getOptimisticPoints(state.duel.timeLimitSec, saved.timeTakenMs)
                    )
                  }}
                >
                  Lock answer
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
