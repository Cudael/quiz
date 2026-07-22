'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { usePlaySessionStore } from '@/store/play-session'
import type { AnswerExtras } from '@/store/play-session'
import { copy } from '@/lib/copy'
import { getQuizPath } from '@/lib/quiz-url'
import { scoreQuestion } from '@/domain/scoring'
import type { AnswerFeedback, Question, QuizData } from './play-view.types'
import { getSoundPreference, SOUND_PREFERENCE_STORAGE_KEY } from './play-view.utils'

export function usePlayRunner(quizId: string, mode?: 'DAILY' | 'PRACTICE' | 'BLITZ') {
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
  // Per-question server feedback (correct answers revealed post-answer).
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<Record<string, AnswerFeedback>>({})

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
      textAnswers: ans.textAnswers,
      numberAnswer: ans.numberAnswer,
      pairs: ans.pairs,
      groups: ans.groups,
    }))
    try {
      const res = await fetch('/api/play/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playToken: playTokenRef.current,
          quizId,
          answers,
          ...(mode ? { mode } : {}),
        }),
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
  }, [store, quizId, mode, router, addToast, clearTimer])

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
    (choiceIds: string[], timeout = false, extras?: AnswerExtras) => {
      if (!currentQuestion || isAnswered) return
      // Don't clear the quiz-level timer on answer
      if (!hasQuizTimer) clearTimer()
      const elapsed = Date.now() - questionStartRef.current
      const timeTakenMs = Math.min(elapsed, currentQuestion.timeLimitSec * 1000)
      const effectiveChoiceIds = timeout ? [] : choiceIds
      const effectiveExtras = timeout ? undefined : extras
      store.answer(currentQuestion.id, effectiveChoiceIds, timeTakenMs, effectiveExtras)
      setQuestionUI((prev) => ({ ...prev, selectedChoiceIds: effectiveChoiceIds }))

      // The answer key never reaches the client — fetch feedback from the
      // server now that the answer is locked in. Fire-and-forget: feedback
      // renders when it arrives; final scoring happens at submit regardless.
      const questionId = currentQuestion.id
      fetch('/api/play/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playToken: playTokenRef.current,
          quizId,
          questionId,
          answer: { choiceIds: effectiveChoiceIds, ...effectiveExtras },
        }),
      })
        .then(async (res) => {
          if (!res.ok) return
          const data = (await res.json()) as AnswerFeedback
          // Guard against malformed responses (and simplified test mocks).
          if (typeof data?.credit !== 'number' || typeof data.reveal !== 'object' || !data.reveal) {
            return
          }
          setFeedbackByQuestion((prev) => ({ ...prev, [questionId]: data }))
          store.addScore(
            scoreQuestion({
              credit: data.credit,
              timeTakenMs,
              timeLimitMs: currentQuestion.timeLimitSec * 1000,
              mode: mode ?? 'STANDARD',
            })
          )
        })
        .catch(() => {
          // Feedback stays hidden; the results page still shows the full
          // server-scored breakdown.
        })
    },
    [currentQuestion, isAnswered, clearTimer, store, hasQuizTimer, quizId]
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
    questionStartRef.current = Date.now()
    setQuestionUI({ selectedChoiceIds: [], hiddenChoiceIds: [], textAnswer: '' })
  }, [currentQuestion?.id])

  useEffect(() => {
    localStorage.setItem(SOUND_PREFERENCE_STORAGE_KEY, String(soundEnabled))
  }, [soundEnabled])

  // GROUPS mid-question probe — validates one tile selection server-side
  // without locking in the answer.
  const probeGroup = useCallback(
    async (choiceIds: string[]): Promise<{ match: boolean; label: string | null }> => {
      if (!currentQuestion) return { match: false, label: null }
      try {
        const res = await fetch('/api/play/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playToken: playTokenRef.current,
            quizId,
            questionId: currentQuestion.id,
            probeGroup: choiceIds,
          }),
        })
        if (!res.ok) return { match: false, label: null }
        const data = (await res.json()) as { probeMatch: boolean; label: string | null }
        return { match: data.probeMatch === true, label: data.label ?? null }
      } catch {
        return { match: false, label: null }
      }
    },
    [currentQuestion, quizId]
  )

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
      handleAnswer(choiceIds, false, { textAnswer: text })
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
        const res = await fetch(
          `/api/quiz/${quizId}/play${
            mode === 'PRACTICE'
              ? '?mode=practice'
              : mode === 'BLITZ'
                ? '?mode=blitz'
                : mode === 'DAILY'
                  ? '?mode=daily'
                  : ''
          }`
        )
        if (!res.ok) throw new Error('Failed to load quiz')
        const data = await res.json()
        if (!cancelled) {
          setQuiz(data.quiz)
          playTokenRef.current = data.playToken
          setQuestions(data.questions)
          setFeedbackByQuestion({})
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
  }, [quizId, mode])

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
    currentFeedback: currentQuestion ? feedbackByQuestion[currentQuestion.id] : undefined,
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
    probeGroup,
    goNext,
    quitToQuiz,
  }
}
