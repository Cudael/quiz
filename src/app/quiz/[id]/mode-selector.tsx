'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Clock, Swords, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type PlayMode = 'classic' | 'timed' | 'survival' | 'daily'

interface ModeOption {
  id: PlayMode
  label: string
  description: string
  icon: React.ReactNode
}

const modes: ModeOption[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Answer all questions at your own pace',
    icon: <Play className="h-5 w-5" />,
  },
  {
    id: 'timed',
    label: 'Timed',
    description: '60 seconds for the whole quiz',
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: 'survival',
    label: 'Survival',
    description: "One wrong answer and it's over",
    icon: <Swords className="h-5 w-5" />,
  },
  {
    id: 'daily',
    label: 'Daily',
    description: 'One attempt per day — same for everyone',
    icon: <Calendar className="h-5 w-5" />,
  },
]

export function ModeSelector({ quizId }: { quizId: string }) {
  const [selected, setSelected] = useState<PlayMode>('classic')
  const router = useRouter()

  const handleStart = () => {
    router.push(`/play/${quizId}?mode=${selected}`)
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Choose Mode</h2>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => setSelected(mode.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              selected === mode.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
            title={mode.description}
          >
            {mode.icon}
            <span className="font-semibold">{mode.label}</span>
            <span className="text-xs text-center leading-tight opacity-70">{mode.description}</span>
          </button>
        ))}
      </div>

      <Button variant="gradient" size="xl" onClick={handleStart} className="w-full sm:w-auto">
        <Play className="h-5 w-5" />
        Start Quiz
      </Button>
    </div>
  )
}
