import { cn } from '@/lib/utils'

export function CountdownRing({
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
