'use client'

import { useEffect, useRef, useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { X, Zap, SkipForward, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { usePlaySessionStore } from '@/store/play-session'
import { cn } from '@/lib/utils'
import { copy } from '@/lib/copy'

interface Choice {
  id: string
  text: string
}

interface Question {
  id: string
  type: string
  prompt: string
  timeLimitSec: number
  order: number
  choices: Choice[]
}

interface QuizData {
  id: string
  title: string
  difficulty: string
  category: { name: string; slug: string }
}

interface PlayViewProps {
  quizId: string
}

function CountdownRing({
  timeLimitSec,
  timeRemainingMs,
}: {
  timeLimitSec: number
  timeRemainingMs: number
}) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const ratio = Math.max(0, timeRemainingMs / (timeLimitSec * 1000))
  const offset = circumference * (1 - ratio)
  const secs = Math.ceil(timeRemainingMs / 1000)
  const isUrgent = secs <= 5

  return (
    <div className="relative flex items-center justify-center">
      <svg width="88" height="88" className="-rotate-90">
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-200',
            isUrgent ? 'stroke-destructive' : 'stroke-quiz-purple'
          )}
        />
      </svg>
      <span
        className={cn(
          'absolute text-xl font-bold',
          isUrgent ? 'text-destructive' : 'text-foreground'
        )}
      >
        {secs}
      </span>
    </div>
  )
}

export function PlayView({ quizId }: PlayViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToast } = useToast()
  const reduceMotion = useReducedMotion()

  const rawMode = searchParams.get('mode') ?? 'classic'
  const mode = (['classic', 'timed', 'survival', 'daily'] as const).includes(rawMode as 'classic')
    ? (rawMode as 'classic' | 'timed' | 'survival' | 'daily')
    : 'classic'

  const store = usePlaySessionStore()
  const [quiz, setQuiz] = useState<QuizData | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [playToken, setPlayToken] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [timeRemainingMs, setTimeRemainingMs] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const questionStartRef = useRef<number>(0)
  const [questionUI, setQuestionUI] = useState<{
    selectedChoiceIds: string[]
    hiddenChoiceIds: string[]
  }>({ selectedChoiceIds: [], hiddenChoiceIds: [] })
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
    }))
    try {
      const res = await fetch('/api/play/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playToken, quizId, mode, answers }),
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
  }, [store, playToken, quizId, mode, router, addToast, clearTimer])

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

  // handleAnswer — needs nothing above that's circular
  const handleAnswer = useCallback(
    (choiceIds: string[], timeout = false) => {
      if (!currentQuestion || isAnswered) return
      clearTimer()
      const elapsed = Date.now() - questionStartRef.current
      const timeTakenMs = Math.min(elapsed, currentQuestion.timeLimitSec * 1000)
      store.answer(currentQuestion.id, timeout ? [] : choiceIds, timeTakenMs)
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
  }, [currentQuestion?.id])

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
          setPlayToken(data.playToken)
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading quiz…</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const progress = ((store.currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div aria-live="polite" className="sr-only">
        {`Question ${store.currentQuestionIndex + 1} of ${questions.length}: ${currentQuestion.prompt}`}
      </div>
      <div aria-live="polite" className="sr-only">
        {timerAnnouncement}
      </div>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="purple">{quiz?.title}</Badge>
            <Badge variant="outline">{mode.toUpperCase()}</Badge>
            {mode === 'survival' && store.streak > 0 && (
              <Badge variant="warning">🔥 ×{store.streak}</Badge>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {store.currentQuestionIndex + 1} / {questions.length}
          </p>
        </div>
        {mode === 'timed' && store.globalTimerMs !== null && (
          <div
            className={cn(
              'font-mono text-xl font-bold',
              store.globalTimerMs < 10_000 ? 'text-destructive' : 'text-foreground'
            )}
          >
            {Math.ceil(store.globalTimerMs / 1000)}s
          </div>
        )}
        <div className="text-right">
          <p className="text-lg font-bold text-quiz-purple-light">{store.score}</p>
          <p className="text-xs text-muted-foreground">pts</p>
        </div>
        <button
          onClick={() => setShowQuitModal(true)}
          className="rounded-full p-2 hover:bg-muted transition-colors"
          aria-label="Quit quiz"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-6 flex items-center gap-4">
            <CountdownRing
              timeLimitSec={currentQuestion.timeLimitSec}
              timeRemainingMs={timeRemainingMs}
            />
            <p className="flex-1 text-xl font-semibold leading-snug">{currentQuestion.prompt}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.choices
              .filter((c) => !questionUI.hiddenChoiceIds.includes(c.id))
              .map((choice, idx) => {
                const isSelected = questionUI.selectedChoiceIds.includes(choice.id)
                return (
                  <button
                    key={choice.id}
                    onClick={() => !isAnswered && handleAnswer([choice.id])}
                    disabled={isAnswered}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[56px]',
                      isAnswered
                        ? isSelected
                          ? 'border-quiz-purple bg-quiz-purple/20 text-foreground'
                          : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                        : 'border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer'
                    )}
                    aria-label={`Choice ${idx + 1}: ${choice.text}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                      {idx + 1}
                    </span>
                    {choice.text}
                  </button>
                )
              })}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex justify-end"
              >
                <Button onClick={() => onNextRef.current?.()} variant="gradient">
                  {store.currentQuestionIndex >= questions.length - 1 ? 'Finish' : 'Next'}
                  <span className="text-xs opacity-70 ml-1">(Enter)</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {mode === 'survival' && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleFiftyFifty}
            disabled={store.lifelinesUsed.fiftyFifty || isAnswered}
            title="50/50 — Remove two wrong choices"
            className={cn(
              'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
              store.lifelinesUsed.fiftyFifty || isAnswered
                ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                : 'border-quiz-yellow text-quiz-yellow hover:bg-quiz-yellow/10'
            )}
          >
            <Zap className="h-3 w-3" /> 50/50
          </button>
          <button
            onClick={handleSkip}
            disabled={store.lifelinesUsed.skip || isAnswered}
            title="Skip — Skip this question without penalty"
            className={cn(
              'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
              store.lifelinesUsed.skip || isAnswered
                ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                : 'border-quiz-blue text-quiz-blue hover:bg-quiz-blue/10'
            )}
          >
            <SkipForward className="h-3 w-3" /> Skip
          </button>
          <button
            onClick={handleExtraTime}
            disabled={store.lifelinesUsed.extraTime || isAnswered}
            title="Extra Time — Add 10 seconds to this question"
            className={cn(
              'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
              store.lifelinesUsed.extraTime || isAnswered
                ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
                : 'border-quiz-green text-quiz-green hover:bg-quiz-green/10'
            )}
          >
            <Clock className="h-3 w-3" /> +10s
          </button>
        </div>
      )}

      <Modal
        open={showQuitModal}
        onClose={() => setShowQuitModal(false)}
        title="Quit Quiz?"
        description="Your progress will be lost."
        size="sm"
      >
        <div className="flex gap-3 justify-end mt-2">
          <Button variant="ghost" onClick={() => setShowQuitModal(false)}>
            Keep Playing
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              store.reset()
              router.push(`/quiz/${quizId}`)
            }}
          >
            <AlertTriangle className="h-4 w-4" /> Quit
          </Button>
        </div>
      </Modal>
    </div>
  )
}
