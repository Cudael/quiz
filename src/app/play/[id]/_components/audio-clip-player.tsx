'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AudioClipPlayerProps {
  src: string
  className?: string
}

/** AUDIO_CHOICE — playback control for a question's audio clip. */
export function AudioClipPlayer({ src, className }: AudioClipPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setProgress(audio.duration > 0 ? audio.currentTime / audio.duration : 0)
    }
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      void audio.play()
      setPlaying(true)
    }
  }

  const replay = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    void audio.play()
    setPlaying(true)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-border bg-card p-3',
        className
      )}
    >
      <audio ref={audioRef} src={src} preload="auto" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause audio clip' : 'Play audio clip'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
      </button>
      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <button
        type="button"
        onClick={replay}
        aria-label="Replay audio clip"
        className="shrink-0 rounded border border-border p-2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="h-4 w-4" />
      </button>
    </div>
  )
}
