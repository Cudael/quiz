'use client'

import { useState, useCallback } from 'react'
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

  const handleSelect = useCallback(
    (starValue: number) => {
      if (interactive) {
        onChange(starValue)
      }
    },
    [interactive, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!interactive) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault()
        onChange(Math.min(count, value + 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault()
        onChange(Math.max(1, value - 1))
      }
    },
    [interactive, onChange, count, value]
  )

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
      <span
        key={starValue}
        role="radio"
        aria-checked={starValue === value}
        aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
        tabIndex={interactive && starValue === value ? 0 : -1}
        className="inline-flex"
        onMouseEnter={() => interactive && setHoverIndex(starValue)}
        onMouseLeave={() => interactive && setHoverIndex(null)}
        onClick={() => handleSelect(starValue)}
        onKeyDown={handleKeyDown}
      >
        <Star className={starClasses} aria-hidden="true" />
      </span>
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
