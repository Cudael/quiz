import { Volume2, VolumeX, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
  return (
    <div className="mb-6 flex items-center justify-between gap-2 sm:gap-4">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Badge variant="purple" className="max-w-[8rem] truncate sm:max-w-none">
            {quizTitle}
          </Badge>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {currentIndex + 1} / {total}
        </p>
      </div>
      <div className="text-right">
        <p className="text-base font-bold text-primary sm:text-lg">{score}</p>
        <p className="text-xs text-muted-foreground">pts</p>
      </div>
      <button
        type="button"
        onClick={onToggleSound}
        className="rounded-full p-1.5 transition-colors hover:bg-muted sm:p-2"
        aria-pressed={!soundEnabled}
        aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
      >
        {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={onOpenQuit}
        className="rounded-full p-1.5 transition-colors hover:bg-muted sm:p-2"
        aria-label="Quit quiz"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}
