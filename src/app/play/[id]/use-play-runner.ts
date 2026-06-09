'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { usePlaySessionStore } from '@/store/play-session'
import { copy } from '@/lib/copy'
import type { Question, QuizData } from './play-view.types'
import {
  getSoundPreference,
  normalizeBlankAnswer,
  SOUND_PREFERENCE_STORAGE_KEY,
} from './play-view.utils'

/**
 * Owns all stateful logic for the quiz runner: data fetching, timers,
 * answer handling and submission. The
 * presentational `PlayView` component consumes the returned state/handlers.
 */
export function usePlayRunner(quizId: string) {
  const router = useRouter()
  const { addToast } = useToast()

  const store = usePlaySessionStore()
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const playTokenRef = useRef<string>('')
  const [loading, setLoading] = useState(true)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionStartRef = useRef<number>(0)
  const [questionUI, setQuestionUI] = useState<{
    selectedChoiceIds: string[]
    hiddenChoiceIds: string[]
    // MATCHING: the choice ID of the first item selected (waiting for a matching pair)
    pendingMatchId?: string
    // MATCHING: confirmed pairs [{ left: choiceId, right: choiceId }]
    matchedPairs?: Array<{ left: string; right: string }>
    // CATEGORIZE: the item choice ID currently selected, waiting for a category pick
    pendingItemId?: string
    // CATEGORIZE: confirmed assignments [{ itemId, categoryId }]
    assignments?: Array<{ itemId: string; categoryId: string }>
    // LABEL: positionChoiceId → user-typed label
    labelAnswers?: Record<string, string>
  }>({ selectedChoiceIds: [], hiddenChoiceIds: [] })
  const [fillBlankValue, setFillBlankValue] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(getSoundPreference)
  const [showQuitModal, setShowQuitModal] = useState(false)
  // Ref avoids render loops here; we only need to track previous question id without re-rendering.
  const prevQuestionIdRef = useRef<string | null>(null)

  // Stable refs for callbacks used inside effects
  const onFinishRef = useRef<(() => void) | null>(null)
  const onAnswerRef = useRef<((ids: string[], timeout?: boolean) => void) | null>(null)
  const onNextRef = useRef<(() => void) | null>(null)

  const currentQuestion = questions[store.currentQuestionIndex]
  const isAnswered = currentQuestion ? !!store.answers[currentQuestion.id] : false

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // handleFinish — defined first
  const handleFinish = useCallback(async () => {
    clearTimer()
    store.setStatus('submitting')
    const answers = Object.entries(store.answers).map(([questionId, ans]) => ({
      questionId,
      choiceIds: ans.choiceIds,
      timeTakenMs: ans.timeTakenMs,
      textAnswer: ans.textAnswer,
    }))
    try {
      const res = await fetch('/api/play/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playToken: playTokenRef.current, quizId, answers }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Submit failed')
      }
      const result = await res.json()
      store.finish()
      const resultParams = new URLSearchParams({
        session: result.sessionId,
        xpEarned: String(result.xpEarned ?? 0),
        leveledUp: result.leveledUp ? '1' : '0',
        newLevel: String(result.newLevel ?? 1),
        newBadges: Array.isArray(result.newlyAwardedBadges)
          ? result.newlyAwardedBadges
              .map((badge: { name: string }) => encodeURIComponent(badge.name))
              .join('|')
          : '',
      })
      router.push(`/play/${quizId}/results?${resultParams.toString()}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed'
      addToast(msg, 'error')
      store.setStatus('playing')
    }
  }, [store, quizId, router, addToast, clearTimer])

  useEffect(() => {
    onFinishRef.current = handleFinish
  }, [handleFinish])

  // handleNext — needs handleFinish
  const handleNext = useCallback(
    (totalQ: number) => {
      if (store.currentQuestionIndex >= totalQ - 1) {
        onFinishRef.current?.()
      } else {
        store.nextQuestion()
      }
    },
    [store]
  )

  useEffect(() => {
    onNextRef.current = () => handleNext(questions.length)
  }, [handleNext, questions.length])

  const getFillBlankChoiceIds = useCallback(
    (rawValue: string) => {
      if (!currentQuestion) return []
      const normalizedInput = normalizeBlankAnswer(rawValue)
      if (!normalizedInput) return []
      return currentQuestion.choices
        .filter((choice) => normalizeBlankAnswer(choice.text) === normalizedInput)
        .map((choice) => choice.id)
    },
    [currentQuestion]
  )

  // handleAnswer — needs nothing above that's circular
  const handleAnswer = useCallback(
    (choiceIds: string[], timeout = false, textAnswer?: string) => {
      if (!currentQuestion || isAnswered) return
      clearTimer()
      const elapsed = Date.now() - questionStartRef.current
      const timeTakenMs = Math.min(elapsed, currentQuestion.timeLimitSec * 1000)
      store.answer(currentQuestion.id, timeout ? [] : choiceIds, timeTakenMs, textAnswer)
      setQuestionUI((prev) => ({ ...prev, selectedChoiceIds: timeout ? [] : choiceIds }))
    },
    [currentQuestion, isAnswered, clearTimer, store]
  )

  useEffect(() => {
    onAnswerRef.current = handleAnswer
  }, [handleAnswer])

  const startQuestionTimer = useCallback(
    (timeLimitSec: number) => {
      clearTimer()
      const limit = timeLimitSec * 1000
      setTimeRemainingMs(limit)
      questionStartRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setTimeRemainingMs((prev) => {
          if (prev <= 200) {
            clearTimer()
            return 0
          }
          return prev - 200
        })
      }, 200)
    },
    [clearTimer]
  )

  // Auto-submit on timeout
  useEffect(() => {
    if (timeRemainingMs === 0 && currentQuestion && !isAnswered && store.status === 'playing') {
      addToast(copy.quiz.timeout, 'info')
      onAnswerRef.current?.([], true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemainingMs])

  useEffect(() => {
    const currentQuestionId = currentQuestion?.id ?? null
    if (currentQuestionId === prevQuestionIdRef.current) return
    prevQuestionIdRef.current = currentQuestionId
    setQuestionUI({ selectedChoiceIds: [], hiddenChoiceIds: [] })
    setFillBlankValue('')
  }, [currentQuestion?.id])

  useEffect(() => {
    localStorage.setItem(SOUND_PREFERENCE_STORAGE_KEY, String(soundEnabled))
  }, [soundEnabled])

  const handleChoiceSelect = useCallback(
    (choiceId: string) => {
      if (!currentQuestion || isAnswered) return
      setQuestionUI((prev) => {
        if (currentQuestion.type === 'MULTIPLE') {
          const selectedChoiceIds = prev.selectedChoiceIds.includes(choiceId)
            ? prev.selectedChoiceIds.filter((id) => id !== choiceId)
            : [...prev.selectedChoiceIds, choiceId]
          return { ...prev, selectedChoiceIds }
        }

        if (currentQuestion.type === 'ORDERING') {
          const selectedChoiceIds = prev.selectedChoiceIds.includes(choiceId)
            ? prev.selectedChoiceIds.filter((id) => id !== choiceId)
            : [...prev.selectedChoiceIds, choiceId]
          return { ...prev, selectedChoiceIds }
        }

        if (currentQuestion.type === 'MATCHING') {
          const choice = currentQuestion.choices.find((c) => c.id === choiceId)
          const side = (choice?.meta as { side?: string } | null | undefined)?.side
          const existingPairs = prev.matchedPairs ?? []

          // Clicking an already-paired item unmatches that pair
          const alreadyPaired = existingPairs.find(
            (p) => p.left === choiceId || p.right === choiceId
          )
          if (alreadyPaired) {
            const newPairs = existingPairs.filter((p) => p !== alreadyPaired)
            const allPairedIds = newPairs.flatMap((p) => [p.left, p.right])
            return {
              ...prev,
              pendingMatchId: undefined,
              matchedPairs: newPairs,
              selectedChoiceIds: allPairedIds,
            }
          }

          // Clicking the same pending item deselects it
          if (prev.pendingMatchId === choiceId) {
            return { ...prev, pendingMatchId: undefined }
          }

          if (!prev.pendingMatchId) {
            // First click: select the item as pending
            return { ...prev, pendingMatchId: choiceId }
          }

          // Second click: attempt to form a pair
          const pendingChoice = currentQuestion.choices.find((c) => c.id === prev.pendingMatchId)
          const pendingSide = (pendingChoice?.meta as { side?: string } | null | undefined)?.side
          if (pendingSide && side && pendingSide !== side) {
            // Different sides — form a pair
            const newPair =
              pendingSide === 'left'
                ? { left: prev.pendingMatchId, right: choiceId }
                : { left: choiceId, right: prev.pendingMatchId }
            const newPairs = [...existingPairs, newPair]
            const allPairedIds = newPairs.flatMap((p) => [p.left, p.right])
            return {
              ...prev,
              pendingMatchId: undefined,
              matchedPairs: newPairs,
              selectedChoiceIds: allPairedIds,
            }
          }
          // Same side — swap pending selection to the new item
          return { ...prev, pendingMatchId: choiceId }
        }

        if (currentQuestion.type === 'CATEGORIZE') {
          const choice = currentQuestion.choices.find((c) => c.id === choiceId)
          const isHeader = (choice?.meta as { isHeader?: boolean } | null | undefined)?.isHeader
          const existingAssignments = prev.assignments ?? []

          if (isHeader) {
            // A category was clicked — assign the pending item to this category if one is pending
            if (prev.pendingItemId) {
              const categoryId =
                (choice?.meta as { category?: string } | null | undefined)?.category ?? ''
              const newAssignments = [
                ...existingAssignments.filter((a) => a.itemId !== prev.pendingItemId),
                { itemId: prev.pendingItemId, categoryId },
              ]
              return { ...prev, pendingItemId: undefined, assignments: newAssignments }
            }
            return prev
          } else {
            // An item was clicked — set it as pending (or deselect if already pending)
            if (prev.pendingItemId === choiceId) {
              return { ...prev, pendingItemId: undefined }
            }
            return { ...prev, pendingItemId: choiceId }
          }
        }

        return { ...prev, selectedChoiceIds: [choiceId] }
      })
    },
    [currentQuestion, isAnswered]
  )

  const handleLabelChange = useCallback(
    (positionId: string, value: string) => {
      if (isAnswered) return
      setQuestionUI((prev) => ({
        ...prev,
        labelAnswers: { ...(prev.labelAnswers ?? {}), [positionId]: value },
      }))
    },
    [isAnswered]
  )

  const handleSubmitSelection = useCallback(() => {
    if (!currentQuestion || isAnswered) return

    if (currentQuestion.type === 'FILL_BLANK') {
      handleAnswer(getFillBlankChoiceIds(fillBlankValue), false, fillBlankValue)
      return
    }

    if (currentQuestion.type === 'ORDERING') {
      if (questionUI.selectedChoiceIds.length !== currentQuestion.choices.length) return
      handleAnswer(questionUI.selectedChoiceIds)
      return
    }

    if (currentQuestion.type === 'MATCHING') {
      const pairs = questionUI.matchedPairs ?? []
      if (pairs.length * 2 !== currentQuestion.choices.length) return
      handleAnswer(questionUI.selectedChoiceIds)
      return
    }

    if (currentQuestion.type === 'CATEGORIZE') {
      const assignments = questionUI.assignments ?? []
      const items = currentQuestion.choices.filter(
        (c) => !(c.meta as { isHeader?: boolean } | null | undefined)?.isHeader
      )
      if (assignments.length !== items.length) return
      const assignmentMap = Object.fromEntries(assignments.map((a) => [a.itemId, a.categoryId]))
      handleAnswer([], false, JSON.stringify(assignmentMap))
      return
    }

    if (currentQuestion.type === 'LABEL') {
      const labelAnswers = questionUI.labelAnswers ?? {}
      const allFilled = currentQuestion.choices.every(
        (c) => (labelAnswers[c.id] ?? '').trim().length > 0
      )
      if (!allFilled) return
      handleAnswer([], false, JSON.stringify(labelAnswers))
      return
    }

    if (questionUI.selectedChoiceIds.length === 0) return
    handleAnswer(questionUI.selectedChoiceIds)
  }, [
    currentQuestion,
    fillBlankValue,
    getFillBlankChoiceIds,
    handleAnswer,
    isAnswered,
    questionUI.assignments,
    questionUI.labelAnswers,
    questionUI.matchedPairs,
    questionUI.selectedChoiceIds,
  ])

  const timerAnnouncement = useMemo(() => {
    const seconds = Math.ceil(timeRemainingMs / 1000)
    if (seconds === 10 || seconds === 5 || seconds === 0) {
      return `${seconds} seconds remaining`
    }
    return ''
  }, [timeRemainingMs])

  // Start per-question timer when question changes.
  useEffect(() => {
    if (currentQuestion && store.status === 'playing') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startQuestionTimer(currentQuestion.timeLimitSec)
    }
    return clearTimer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    store.currentQuestionIndex,
    store.status,
    currentQuestion?.id,
    startQuestionTimer,
    clearTimer,
  ])

  // Fetch quiz data
  useEffect(() => {
    let cancelled = false
    async function fetchQuiz() {
      try {
        const res = await fetch(`/api/quiz/${quizId}/play`)
        if (!res.ok) throw new Error('Failed to load quiz')
        const data = await res.json()
        if (!cancelled) {
          setQuiz(data.quiz)
          playTokenRef.current = data.playToken
          setQuestions(data.questions)
          store.start(quizId)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          addToast('Failed to load quiz. Please try again.', 'error')
          router.push('/categories')
        }
      }
    }
    fetchQuiz()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId])

  const goNext = useCallback(() => {
    onNextRef.current?.()
  }, [])

  const quitToQuiz = useCallback(() => {
    store.reset()
    router.push(`/quiz/${quizId}`)
  }, [store, router, quizId])

  return {
    store,
    quiz,
    questions,
    loading,
    currentQuestion,
    isAnswered,
    timeRemainingMs,
    questionUI,
    fillBlankValue,
    setFillBlankValue,
    soundEnabled,
    setSoundEnabled,
    showQuitModal,
    setShowQuitModal,
    timerAnnouncement,
    handleChoiceSelect,
    handleLabelChange,
    handleSubmitSelection,
    goNext,
    quitToQuiz,
  }
}
