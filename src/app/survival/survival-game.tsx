'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart, Skull, Timer, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'

const QUESTION_TIME_MS = 15_000
const TICK_MS = 100

interface Choice {
  id: string
  text: string
}

interface SurvivalQuestion {
  id: string
  prompt: string
  choices: Choice[]
}

interface AnswerRecord {
  questionId: string
  choiceIds: string[]
}

type Phase = 'idle' | 'loading' | 'playing' | 'feedback' | 'over' | 'submitting'

export function SurvivalGame({ categories }: { categories: { slug: string; name: string }[] }) {
  const { addToast } = useToast()
  const router = useRouter()

  const [phase, setPhase] = useState<Phase>('idle')
  const [categorySlug, setCategorySlug] = useState('')
  const [queue, setQueue] = useState<SurvivalQuestion[]>([])
  const [current, setCurrent] = useState<SurvivalQuestion | null>(null)
  const [streak, setStreak] = useState(0)
  const [timeLeftMs, setTimeLeftMs] = useState(QUESTION_TIME_MS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Correct choice ids for the current question — revealed by the server
  // only after an answer is locked in.
  const [correctIds, setCorrectIds] = useState<string[] | null>(null)
  const [result, setResult] = useState<{
    correctCount: number
    bestForYou: number
    isPersonalBest: boolean
  } | null>(null)

  const answersRef = useRef<AnswerRecord[]>([])
  const seenIdsRef = useRef<string[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fetchingRef = useRef(false)

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const fetchBatch = useCallback(async (): Promise<SurvivalQuestion[]> => {
    const params = new URLSearchParams()
    if (categorySlug) params.set('category', categorySlug)
    if (seenIdsRef.current.length > 0) {
      params.set('exclude', seenIdsRef.current.slice(-400).join(','))
    }
    const res = await fetch(`/api/survival/questions?${params.toString()}`)
    if (!res.ok) throw new Error('Failed to load questions')
    const data = await res.json()
    return data.questions as SurvivalQuestion[]
  }, [categorySlug])

  const finishRun = useCallback(async () => {
    clearTimer()
    setPhase('submitting')
    try {
      const res = await fetch('/api/survival/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(categorySlug ? { categorySlug } : {}),
          answers: answersRef.current,
        }),
      })
      if (!res.ok) throw new Error('Failed to save run')
      const data = await res.json()
      setResult(data)
      router.refresh()
    } catch {
      addToast('Could not save your run, but nice streak anyway!', 'error')
      setResult({ correctCount: streak, bestForYou: streak, isPersonalBest: false })
    }
    setPhase('over')
  }, [addToast, categorySlug, clearTimer, router, streak])

  const advance = useCallback(
    async (remaining: SurvivalQuestion[]) => {
      let nextQueue = remaining
      if (nextQueue.length <= 3 && !fetchingRef.current) {
        fetchingRef.current = true
        try {
          const batch = await fetchBatch()
          const known = new Set([...seenIdsRef.current, ...nextQueue.map((q) => q.id)])
          nextQueue = [...nextQueue, ...batch.filter((q) => !known.has(q.id))]
        } catch {
          // ignore — run ends when the queue is exhausted
        }
        fetchingRef.current = false
      }
      const [next, ...rest] = nextQueue
      if (!next) {
        // Question pool exhausted — treat as a completed run.
        await finishRun()
        return
      }
      seenIdsRef.current.push(next.id)
      setCurrent(next)
      setQueue(rest)
      setSelectedId(null)
      setCorrectIds(null)
      setTimeLeftMs(QUESTION_TIME_MS)
      setPhase('playing')
    },
    [fetchBatch, finishRun]
  )

  const start = useCallback(async () => {
    setPhase('loading')
    setStreak(0)
    setResult(null)
    answersRef.current = []
    seenIdsRef.current = []
    try {
      const batch = await fetchBatch()
      if (batch.length === 0) {
        addToast('No questions available for this category yet.', 'error')
        setPhase('idle')
        return
      }
      await advance(batch)
    } catch {
      addToast('Failed to start. Please try again.', 'error')
      setPhase('idle')
    }
  }, [addToast, advance, fetchBatch])

  const handleAnswer = useCallback(
    async (choiceId: string | null) => {
      if (!current || phase !== 'playing') return
      clearTimer()
      setSelectedId(choiceId)
      setPhase('feedback')
      answersRef.current.push({
        questionId: current.id,
        choiceIds: choiceId ? [choiceId] : [],
      })

      // The answer key never reaches the client — ask the server.
      let isCorrect = false
      try {
        const res = await fetch('/api/survival/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: current.id, choiceId }),
        })
        if (!res.ok) throw new Error('check failed')
        const data = (await res.json()) as { isCorrect: boolean; correctChoiceIds: string[] }
        isCorrect = data.isCorrect === true
        setCorrectIds(Array.isArray(data.correctChoiceIds) ? data.correctChoiceIds : [])
      } catch {
        addToast('Connection hiccup — ending the run here.', 'error')
        void finishRun()
        return
      }

      if (isCorrect) {
        setStreak((s) => s + 1)
        setTimeout(() => {
          void advance(queue)
        }, 900)
      } else {
        setTimeout(() => {
          void finishRun()
        }, 1200)
      }
    },
    [addToast, advance, clearTimer, current, finishRun, phase, queue]
  )

  // Question timer
  useEffect(() => {
    if (phase !== 'playing') return
    timerRef.current = setInterval(() => {
      setTimeLeftMs((ms) => {
        if (ms <= TICK_MS) {
          return 0
        }
        return ms - TICK_MS
      })
    }, TICK_MS)
    return clearTimer
  }, [phase, current, clearTimer])

  // Timeout = wrong answer. Scheduled as a timeout (not derived state) so we
  // never call setState synchronously inside an effect body.
  const handleAnswerRef = useRef(handleAnswer)
  useEffect(() => {
    handleAnswerRef.current = handleAnswer
  }, [handleAnswer])
  useEffect(() => {
    if (phase !== 'playing') return
    const timeout = setTimeout(() => void handleAnswerRef.current(null), QUESTION_TIME_MS)
    return () => clearTimeout(timeout)
  }, [phase, current])

  useEffect(() => clearTimer, [clearTimer])

  if (phase === 'idle') {
    return (
      <div className="rounded-md border bg-card p-6 text-center">
        <label htmlFor="survival-category" className="mb-1.5 block text-sm font-semibold">
          Category
        </label>
        <select
          id="survival-category"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className="mx-auto mb-4 block w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-base md:text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <Button size="lg" variant="accent" className="font-bold" onClick={start}>
          <Zap className="mr-2 h-5 w-5" />
          Start run
        </Button>
      </div>
    )
  }

  if (phase === 'loading') {
    return (
      <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
        Loading questions…
      </div>
    )
  }

  if (phase === 'over' || phase === 'submitting') {
    return (
      <div className="rounded-md border bg-card p-8 text-center">
        <Skull className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-3 text-2xl font-extrabold">Run over!</h2>
        {phase === 'submitting' ? (
          <p className="mt-2 text-sm text-muted-foreground">Saving your run…</p>
        ) : (
          <>
            <p className="mt-2 text-lg">
              You survived <span className="font-extrabold">{result?.correctCount ?? streak}</span>{' '}
              question{(result?.correctCount ?? streak) === 1 ? '' : 's'}.
            </p>
            {result?.isPersonalBest ? (
              <p className="mt-1 text-sm font-semibold text-quiz-green">New personal best! 🎉</p>
            ) : result && result.bestForYou > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">Your best: {result.bestForYou}</p>
            ) : null}
            <div className="mt-5 flex justify-center gap-2">
              <Button variant="accent" className="font-bold" onClick={start}>
                Play again
              </Button>
              <Button variant="outline" onClick={() => setPhase('idle')}>
                Change category
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  // playing / feedback
  const secondsLeft = Math.ceil(timeLeftMs / 1000)
  return (
    <div className="rounded-md border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold">
        <span className="inline-flex items-center gap-1.5">
          <Heart className="h-4 w-4 text-destructive" />
          Streak: {streak}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 ${secondsLeft <= 5 ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          <Timer className="h-4 w-4" />
          {secondsLeft}s
        </span>
      </div>

      <div className="mb-2 h-1.5 overflow-hidden rounded-sm bg-muted">
        <div
          className={`h-full transition-all ${secondsLeft <= 5 ? 'bg-destructive' : 'bg-quiz-purple'}`}
          style={{ width: `${(timeLeftMs / QUESTION_TIME_MS) * 100}%` }}
        />
      </div>

      {current ? (
        <>
          <h2 className="my-4 text-lg font-bold leading-snug">{current.prompt}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {current.choices.map((choice) => {
              const isSelected = selectedId === choice.id
              // Neutral while the server check is in flight (correctIds null)
              const showFeedback = phase === 'feedback' && correctIds !== null
              const highlight = showFeedback
                ? correctIds.includes(choice.id)
                  ? 'border-quiz-green bg-quiz-green/10'
                  : isSelected
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border opacity-60'
                : isSelected
                  ? 'border-quiz-purple bg-muted/50'
                  : 'border-border hover:border-quiz-purple hover:bg-muted/50'
              return (
                <button
                  key={choice.id}
                  type="button"
                  disabled={phase !== 'playing'}
                  onClick={() => void handleAnswer(choice.id)}
                  className={`min-h-14 rounded-md border p-3.5 text-left text-sm font-medium transition-all ${highlight}`}
                >
                  {choice.text}
                </button>
              )
            })}
          </div>
        </>
      ) : null}
    </div>
  )
}
