'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { usePlaySessionStore } from '@/store/play-session'
import { copy } from '@/lib/copy'
import { getQuizPath } from '@/lib/quiz-url'
import type { Question, QuizData } from './play-view.types'
import { getSoundPreference, SOUND_PREFERENCE_STORAGE_KEY } from './play-view.utils'

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
  const quizTimerStartedRef = useRef(false)
  const [questionUI, setQuestionUI] = useState<{
    selectedChoiceIds: string[]
    hiddenChoiceIds: string[]
    textAnswer: string
  }>({ selectedChoiceIds: [], hiddenChoiceIds: [], textAnswer: '' })
  const [soundEnabled, setSoundEnabled] = useState(getSoundPreference)
  const [showQuitModal, setShowQuitModal] = useState(false)
  const prevQuestionIdRef = useRef<string | null>(null)

  // Stable refs for callbacks used inside effects
  const onFinishRef = useRef<(() => void) | null>(null)
  const onAnswerRef = useRef<((ids: string[], timeout?: boolean) => void) | null>(null)
  const onNextRef = useRef<(() => void) | null>(null)

  const currentQuestion = questions[store.currentQuestionIndex]
  const isAnswered = currentQuestion ? !!store.answers[currentQuestion.id] : false

  // Is quiz-level timer active?
  const hasQuizTimer = quiz?.timeLimitSec != null && quiz.timeLimitSec > 0

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // handleFinish
  const handleFinish = useCallback(async () => {
    if (store.status !== 'playing') return
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

  // handleNext
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

  // handleAnswer
  const handleAnswer = useCallback(
    (choiceIds: string[], timeout = false, textAnswer?: string) => {
      if (!currentQuestion || isAnswered) return
      // Don't clear the quiz-level timer on answer
      if (!hasQuizTimer) clearTimer()
      const elapsed = Date.now() - questionStartRef.current
      const timeTakenMs = Math.min(elapsed, currentQuestion.timeLimitSec * 1000)
      store.answer(currentQuestion.id, timeout ? [] : choiceIds, timeTakenMs, textAnswer)
      setQuestionUI((prev) => ({ ...prev, selectedChoiceIds: timeout ? [] : choiceIds }))
    },
    [currentQuestion, isAnswered, clearTimer, store, hasQuizTimer]
  )

  useEffect(() => {
    onAnswerRef.current = handleAnswer
  }, [handleAnswer])

  // Start a per-question timer
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

  // Start a quiz-level timer
  const startQuizTimer = useCallback(
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
    if (timeRemainingMs === 0 && store.status === 'playing') {
      if (hasQuizTimer) {
        // Quiz-level timeout: auto-submit current answer (if any) and finish
        if (currentQuestion && !isAnswered) {
          addToast(copy.quiz.timeout, 'info')
          onAnswerRef.current?.([], true)
        }
        // Finish the quiz after a short delay to allow the answer to be recorded
        setTimeout(() => {
          onFinishRef.current?.()
        }, 100)
      } else {
        // Per-question timeout: auto-submit current answer
        if (currentQuestion && !isAnswered) {
          addToast(copy.quiz.timeout, 'info')
          onAnswerRef.current?.([], true)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemainingMs])

  // Start timer based on mode
  useEffect(() => {
    if (store.status !== 'playing') return
    if (!currentQuestion) return

    if (hasQuizTimer && !quizTimerStartedRef.current) {
      // Quiz-level timer: start once at quiz start
      quizTimerStartedRef.current = true
      startQuizTimer(quiz!.timeLimitSec!)
    } else if (!hasQuizTimer) {
      // Per-question timer: start when question changes
      // eslint-disable-next-line react-hooks/set-state-in-effect
      startQuestionTimer(currentQuestion.timeLimitSec)
    }

    return () => {
      // Only clear per-question timer on cleanup
      if (!hasQuizTimer) clearTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestionIndex, store.status, currentQuestion?.id, hasQuizTimer])

  useEffect(() => {
    const currentQuestionId = currentQuestion?.id ?? null
    if (currentQuestionId === prevQuestionIdRef.current) return
    prevQuestionIdRef.current = currentQuestionId
    setQuestionUI({ selectedChoiceIds: [], hiddenChoiceIds: [], textAnswer: '' })
  }, [currentQuestion?.id])

  useEffect(() => {
    localStorage.setItem(SOUND_PREFERENCE_STORAGE_KEY, String(soundEnabled))
  }, [soundEnabled])

  const handleChoiceSelect = useCallback(
    (choiceId: string) => {
      if (!currentQuestion || isAnswered) return
      setQuestionUI((prev) => ({
        ...prev,
        selectedChoiceIds: [choiceId],
      }))
    },
    [currentQuestion, isAnswered]
  )

  const handleTextChange = useCallback(
    (text: string) => {
      if (!currentQuestion || isAnswered) return
      setQuestionUI((prev) => ({ ...prev, textAnswer: text }))
    },
    [currentQuestion, isAnswered]
  )

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!currentQuestion || isAnswered) return
      const trimmed = text.trim().toLowerCase()
      if (!trimmed) return
      const matchedChoice = currentQuestion.choices.find(
        (c) => c.text.trim().toLowerCase() === trimmed
      )
      const choiceIds = matchedChoice ? [matchedChoice.id] : []
      handleAnswer(choiceIds, false, text)
    },
    [currentQuestion, isAnswered, handleAnswer]
  )

  const handleSubmitSelection = useCallback(() => {
    if (!currentQuestion || isAnswered) return
    if (questionUI.selectedChoiceIds.length === 0) return
    handleAnswer(questionUI.selectedChoiceIds)
  }, [currentQuestion, handleAnswer, isAnswered, questionUI.selectedChoiceIds])

  const timerAnnouncement = useMemo(() => {
    const seconds = Math.ceil(timeRemainingMs / 1000)
    if (seconds === 10 || seconds === 5 || seconds === 0) {
      return `${seconds} seconds remaining`
    }
    return ''
  }, [timeRemainingMs])

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
    router.push(getQuizPath({ id: quizId, slug: quiz?.slug ?? null }))
  }, [store, router, quizId, quiz?.slug])

  return {
    store,
    quiz,
    questions,
    loading,
    currentQuestion,
    isAnswered,
    timeRemainingMs,
    questionUI,
    soundEnabled,
    setSoundEnabled,
    showQuitModal,
    setShowQuitModal,
    timerAnnouncement,
    handleChoiceSelect,
    handleTextChange,
    handleTextSubmit,
    handleSubmitSelection,
    handleAnswer,
    goNext,
    quitToQuiz,
  }
}
