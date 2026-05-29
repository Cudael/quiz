import { Clock, SkipForward, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Lifelines } from '@/store/play-session'

interface LifelineBarProps {
  lifelinesUsed: Lifelines
  isAnswered: boolean
  onFiftyFifty: () => void
  onSkip: () => void
  onExtraTime: () => void
}

export function LifelineBar({
  lifelinesUsed,
  isAnswered,
  onFiftyFifty,
  onSkip,
  onExtraTime,
}: LifelineBarProps) {
  return (
    <div className="mt-6 flex gap-3">
      <button
        onClick={onFiftyFifty}
        disabled={lifelinesUsed.fiftyFifty || isAnswered}
        title="50/50 — Remove two wrong choices"
        className={cn(
          'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
          lifelinesUsed.fiftyFifty || isAnswered
            ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
            : 'border-quiz-yellow text-quiz-yellow hover:bg-quiz-yellow/10'
        )}
      >
        <Zap className="h-3 w-3" /> 50/50
      </button>
      <button
        onClick={onSkip}
        disabled={lifelinesUsed.skip || isAnswered}
        title="Skip — Skip this question without penalty"
        className={cn(
          'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
          lifelinesUsed.skip || isAnswered
            ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
            : 'border-quiz-blue text-quiz-blue hover:bg-quiz-blue/10'
        )}
      >
        <SkipForward className="h-3 w-3" /> Skip
      </button>
      <button
        onClick={onExtraTime}
        disabled={lifelinesUsed.extraTime || isAnswered}
        title="Extra Time — Add 10 seconds to this question"
        className={cn(
          'flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors',
          lifelinesUsed.extraTime || isAnswered
            ? 'border-border text-muted-foreground opacity-50 cursor-not-allowed'
            : 'border-quiz-green text-quiz-green hover:bg-quiz-green/10'
        )}
      >
        <Clock className="h-3 w-3" /> +10s
      </button>
    </div>
  )
}
