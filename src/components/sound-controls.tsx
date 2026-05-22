'use client'

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, Settings2 } from 'lucide-react'
import { useSound } from '@/lib/use-sound'
import { Button } from '@/components/ui/button'

export function SoundControls() {
  const { enabled, volume, setEnabled, setVolume } = useSound()
  const [open, setOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!popoverRef.current) return
      if (!popoverRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return (
    <div className="relative" ref={popoverRef}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setEnabled(!enabled)}
          aria-label={enabled ? 'Mute sound effects' : 'Enable sound effects'}
          title={enabled ? 'Sound on' : 'Sound off'}
        >
          {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Open sound settings"
          title="Sound settings"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </div>

      {open && (
        <div
          className="absolute right-0 top-12 z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-xl"
          role="dialog"
          aria-label="Sound settings"
        >
          <label
            className="mb-2 block text-xs font-semibold text-muted-foreground"
            htmlFor="sound-volume"
          >
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            id="sound-volume"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full"
            aria-label="Sound effect volume"
          />
        </div>
      )}
    </div>
  )
}
