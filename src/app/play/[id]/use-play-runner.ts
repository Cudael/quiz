'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import { usePlaySessionStore } from '@/store/play-session'
import type { PlayMode } from '@/store/play-session'
import { copy } from '@/lib/copy'
import type { Question, QuizData } from './play-view.types'
import {
  getSoundPreference,
  normalizeBlankAnswer,
  SOUND_PREFERENCE_STORAGE_KEY,
} from './play-view.utils'

const PLAY_MODES = ['classic', 'timed', 'survival', 'daily'] as const

/**
 * Owns all stateful logic for the quiz runner: data fetching, timers,
 * keyboard shortcuts, lifelines, answer handling and submission. The
 * presentational `PlayView` component consumes the returned state/handlers.
 */
export function usePlayRunner(quizId: string) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const rawMode = searchParams.get('mode') ?? 'classic'
  const mode: PlayMode = PLAY_MODES.includes(rawMode as PlayMode)
    ? (rawMode as PlayMode)
    : 'classic'

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
  }>({ selectedChoiceIds: [], hiddenChoiceIds: [] })
  const [fillBlankValue, setFillBlankValue] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(getSoundPreference)
  const [showQuitModal, setShowQuitModal] = useState(false)
  // Ref avoids render loops here; we only need to track previous question id without re-rendering.
  const prevQuestionIdRef = useRef<string | null>(null)
  const globalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
    if (globalTimerRef.current) clearInterval(globalTimerRef.current)
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
        body: JSON.stringify({ playToken: playTokenRef.current, quizId, mode, answers }),
      })
      if (!res.ok) {
        const err = await res.json()
        if (res.status === 409) {
          addToast('You already played the daily quiz today!', 'warning')
          router.push(`/quiz/${quizId}`)
          return
        }
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

  // handleNext — needs handleFinish
  const handleNext = useCallback(
    (totalQ: number) => {
      if (store.currentQuestionIndex >= totalQ - 1 || mode === 'survival') {
        onFinishRef.current?.()
      } else {
        store.nextQuestion()
      }
    },
    [store, mode]
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
      const extraMs = store.extraTimeSec * 1000
      const limit = timeLimitSec * 1000 + extraMs
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
    [clearTimer, store.extraTimeSec]
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

        return { ...prev, selectedChoiceIds: [choiceId] }
      })
    },
    [currentQuestion, isAnswered]
  )

  const handleSubmitSelection = useCallback(() => {
    if (!currentQuestion || isAnswered) return

    if (currentQuestion.type === 'FILL_BLANK') {
      handleAnswer(getFillBlankChoiceIds(fillBlankValue), false, fillBlankValue)
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

  // Global timed mode timer
  useEffect(() => {
    if (mode !== 'timed' || store.status !== 'playing') return
    globalTimerRef.current = setInterval(() => {
      store.tickGlobalTimer(500)
    }, 500)
    return () => {
      if (globalTimerRef.current) clearInterval(globalTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, store.status])

  useEffect(() => {
    if (mode === 'timed' && store.globalTimerMs === 0 && store.status === 'playing') {
      onFinishRef.current?.()
    }
    // mode and store.status are stable during an active game session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.globalTimerMs])

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
          let qs: Question[] = data.questions
          if (mode === 'daily') {
            const dailyRes = await fetch(`/api/daily/${quizId}`)
            if (dailyRes.ok) {
              const { questionIds } = await dailyRes.json()
              const qMap = Object.fromEntries(qs.map((q: Question) => [q.id, q]))
              qs = (questionIds as string[]).map((id: string) => qMap[id]).filter(Boolean)
            }
          }
          setQuestions(qs)
          store.start(quizId, mode)
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

  // Lifelines
  const handleFiftyFifty = useCallback(() => {
    if (store.lifelinesUsed.fiftyFifty || !currentQuestion || isAnswered) return
    store.useLifeline('fiftyFifty')
    const toHide = currentQuestion.choices.slice(-2).map((c) => c.id)
    setQuestionUI((prev) => ({ ...prev, hiddenChoiceIds: toHide }))
  }, [store, currentQuestion, isAnswered])

  const handleSkip = useCallback(() => {
    if (store.lifelinesUsed.skip || !currentQuestion || isAnswered) return
    store.useLifeline('skip')
    store.answer(currentQuestion.id, [], 0)
    store.nextQuestion()
  }, [store, currentQuestion, isAnswered])

  const handleExtraTime = useCallback(() => {
    if (store.lifelinesUsed.extraTime || !currentQuestion || isAnswered) return
    store.useLifeline('extraTime')
    store.addExtraTime(10)
    setTimeRemainingMs((prev) => prev + 10_000)
  }, [store, currentQuestion, isAnswered])

  useEffect(() => {
    if (store.status !== 'playing') return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (showQuitModal) {
        if (event.key === 'Escape') {
          event.preventDefault()
        }
        return
      }

      const target = event.target as HTMLElement | null
      const isEditableTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable === true

      if (event.key === 'Escape') {
        event.preventDefault()
        return
      }

      if (isEditableTarget) {
        if (currentQuestion?.type === 'FILL_BLANK' && event.key === 'Enter' && !isAnswered) {
          event.preventDefault()
          handleSubmitSelection()
        }
        return
      }

      if (isAnswered) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onNextRef.current?.()
        }
        return
      }

      const visibleChoices = currentQuestion?.choices.filter(
        (choice) => !questionUI.hiddenChoiceIds.includes(choice.id)
      )

      const normalizedKey = event.key.toLowerCase()
      const shortcutMap: Record<string, number> = {
        '1': 0,
        a: 0,
        '2': 1,
        b: 1,
        '3': 2,
        c: 2,
        '4': 3,
        d: 3,
      }
      const shortcutIndex = shortcutMap[normalizedKey]
      if (visibleChoices && shortcutIndex !== undefined) {
        const choice = visibleChoices[shortcutIndex]
        if (choice) {
          event.preventDefault()
          handleChoiceSelect(choice.id)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleSubmitSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    currentQuestion,
    handleChoiceSelect,
    handleSubmitSelection,
    isAnswered,
    questionUI.hiddenChoiceIds,
    showQuitModal,
    store.status,
  ])

  const goNext = useCallback(() => {
    onNextRef.current?.()
  }, [])

  const quitToQuiz = useCallback(() => {
    store.reset()
    router.push(`/quiz/${quizId}`)
  }, [store, router, quizId])

  return {
    mode,
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
    handleSubmitSelection,
    handleFiftyFifty,
    handleSkip,
    handleExtraTime,
    goNext,
    quitToQuiz,
  }
}
