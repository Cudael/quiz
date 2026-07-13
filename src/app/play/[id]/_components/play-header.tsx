import { Volume2, VolumeX, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { copy } from '@/lib/copy'

interface PlayHeaderProps {
  quizTitle?: string
  progress: number
  currentIndex: number
  total: number
  score: number
  soundEnabled: boolean
  onToggleSound: () => void
  onOpenQuit: () => void
}

export function PlayHeader({
  quizTitle,
  progress,
  currentIndex,
  total,
  score,
  soundEnabled,
  onToggleSound,
  onOpenQuit,
}: PlayHeaderProps) {
  const questionNum = currentIndex + 1
  const encouragement =
    progress >= 80
      ? copy.play.progressEncouragements[4]
      : progress >= 50
        ? copy.play.progressEncouragements[0]
        : progress >= 25
          ? copy.play.progressEncouragements[2]
          : null

  return (
    <div className="mb-6 flex items-center justify-between gap-2 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge variant="purple" className="max-w-[8rem] truncate sm:max-w-none">
            {quizTitle}
          </Badge>
          {questionNum === total && (
            <span className="text-xs font-semibold text-quiz-yellow">Last one! 🏁</span>
          )}
        </div>
        <div className="h-2 w-full rounded-sm bg-muted overflow-hidden">
          <div
            className="h-full bg-quiz-orange transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {questionNum} / {total}
            {questionNum === Math.ceil(total / 2) && total > 2 ? ' — halfway there!' : ''}
          </p>
          {encouragement && <p className="text-xs font-medium text-quiz-green">{encouragement}</p>}
        </div>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-quiz-orange sm:text-lg">{score}</p>
        <p className="text-xs text-muted-foreground">pts</p>
      </div>
      <button
        type="button"
        onClick={onToggleSound}
        className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted sm:flex"
        aria-pressed={!soundEnabled}
        aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
      >
        {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={onOpenQuit}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Quit quiz"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
