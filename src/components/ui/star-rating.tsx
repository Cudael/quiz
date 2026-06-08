'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (stars: number) => void
  count?: number
  size?: 'sm' | 'md' | 'lg'
  readonly?: boolean
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
} as const

export function StarRating({
  value,
  onChange,
  count = 5,
  size = 'md',
  readonly = false,
}: StarRatingProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const interactive = !!onChange && !readonly
  const displayValue = hoverIndex ?? value

  const stars = Array.from({ length: count }, (_, i) => {
    const starValue = i + 1
    const filled = starValue <= displayValue

    const starClasses = cn(
      sizeClasses[size],
      'transition-colors duration-100',
      interactive && 'cursor-pointer',
      filled ? 'fill-quiz-yellow text-quiz-yellow' : 'fill-none text-muted-foreground/40'
    )

    return (
      <Star
        key={starValue}
        className={starClasses}
        onMouseEnter={() => interactive && setHoverIndex(starValue)}
        onMouseLeave={() => interactive && setHoverIndex(null)}
        onClick={() => {
          if (interactive) {
            onChange(starValue)
          }
        }}
        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
      />
    )
  })

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of ${count} stars`}
    >
      {stars}
    </div>
  )
}
