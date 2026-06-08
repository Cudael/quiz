'use client'

import { useState, useOptimistic, useTransition } from 'react'
import { StarRating } from '@/components/ui/star-rating'
import { rateQuiz } from './actions'

interface RateQuizFormProps {
  quizId: string
  userRating: number | null
  avgRating: number
  ratingCount: number
}

export function RateQuizForm({
  quizId,
  userRating: initialUserRating,
  avgRating,
  ratingCount,
}: RateQuizFormProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticRating, setOptimisticRating] = useOptimistic<number | null>(
    initialUserRating,
    (_state, newRating: number) => newRating
  )
  const [error, setError] = useState<string | null>(null)

  function handleRate(stars: number) {
    setError(null)
    startTransition(async () => {
      setOptimisticRating(stars)
      const formData = new FormData()
      formData.set('quizId', quizId)
      formData.set('stars', String(stars))
      const result = await rateQuiz(formData)
      if (!result.ok) {
        setError(result.message)
      }
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <StarRating value={optimisticRating ?? 0} onChange={handleRate} size="lg" />
        {isPending && <span className="text-xs text-muted-foreground animate-pulse">Saving…</span>}
      </div>
      <p className="text-sm text-muted-foreground">
        {avgRating > 0 ? (
          <>
            <span className="font-semibold text-foreground">{avgRating.toFixed(1)}</span> avg •
            {ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'}
          </>
        ) : (
          'No ratings yet — be the first!'
        )}
        {optimisticRating && (
          <span className="ml-2 text-quiz-yellow">
            {optimisticRating === 1
              ? 'Poor'
              : optimisticRating === 2
                ? 'Fair'
                : optimisticRating === 3
                  ? 'Good'
                  : optimisticRating === 4
                    ? 'Great'
                    : 'Excellent!'}
          </span>
        )}
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
