'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import type { DuelAnswer, DuelStatePayload } from './duel-view.types'
import { readErrorMessage } from './duel-view.utils'

export function useDuelSession(duelId: string) {
  const router = useRouter()
  const { addToast } = useToast()
  const [state, setState] = useState<DuelStatePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [submittingStart, setSubmittingStart] = useState(false)
  const [answers, setAnswers] = useState<Record<string, DuelAnswer>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null)
  const [fillBlankValue, setFillBlankValue] = useState('')
  const [localScore, setLocalScore] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const questionStartRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const currentQuestion = state?.questions?.[currentQuestionIndex] ?? null
  const participantCount = state?.participants.length ?? 0
  const hasAnsweredCurrent = currentQuestion ? Boolean(answers[currentQuestion.id]) : false

  const viewerParticipant = useMemo(
    () =>
      state?.participants.find((participant) => participant.id === state.viewerParticipantId) ??
      null,
    [state]
  )

  const fetchState = useCallback(async (includeQuestions = false) => {
    const url = includeQuestions
      ? `/api/duel/${duelId}?includeQuestions=true`
      : `/api/duel/${duelId}`
    const response = await fetch(url)
    if (!response.ok) {
      if (response.status === 404) {
        addToast('Duel not found.', 'error')
        router.push('/duel')
      }
      return
    }
    const payload = (await response.json()) as DuelStatePayload
    setState((prevState) => {
      if (payload.questions === null) {
        return { ...payload, questions: prevState?.questions ?? null }
      }
      return payload
    })
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
      fetchState(true)
        .catch(() => addToast('Could not load duel.', 'error'))
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 0)

    const interval = setInterval(() => {
      if (stateRef.current?.duel.status === 'FINISHED') return
      fetchState(false).catch(() => {})
    }, 5000)
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
    // Setting state directly in the effect body (rather than via a setTimeout) is intentional:
    // it ensures timeRemainingMs is initialised to the full limit synchronously as part of the
    // same React batch, preventing the timeout effect from seeing a stale 0 value and
    // immediately advancing the question before the timer has a chance to start.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeRemainingMs(limit)
    questionStartRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setTimeRemainingMs((current) => {
        if (current === null || current <= 200) {
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
        setTimeRemainingMs(null)
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

  // For single-choice questions, show the selected answer briefly before advancing.
  useEffect(() => {
    if (
      !hasAnsweredCurrent ||
      !currentQuestion ||
      currentQuestion.type === 'MULTIPLE' ||
      currentQuestion.type === 'FILL_BLANK' ||
      submitted
    )
      return
    const advanceTimer = setTimeout(() => {
      setCurrentQuestionIndex((index) => index + 1)
    }, 400)
    return () => clearTimeout(advanceTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAnsweredCurrent, currentQuestion?.id, currentQuestion?.type, submitted])

  const startDuel = useCallback(async () => {
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
  }, [duelId, addToast, fetchState])

  return {
    state,
    loading,
    submittingStart,
    answers,
    setAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    timeRemainingMs,
    fillBlankValue,
    setFillBlankValue,
    localScore,
    setLocalScore,
    submitted,
    currentQuestion,
    participantCount,
    hasAnsweredCurrent,
    viewerParticipant,
    questionStartRef,
    startDuel,
  }
}
