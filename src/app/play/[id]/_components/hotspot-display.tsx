'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { Target } from 'lucide-react'

export interface HotspotZone {
  id: string
  name: string
  x: number
  y: number
  radius: number
}

interface HotspotDisplayProps {
  imageUrl: string
  zones: HotspotZone[]
  correctZoneId: string | null
  selectedZoneId?: string | null
  showResult?: boolean
  disabled?: boolean
  onZoneClick?: (zoneId: string) => void
  className?: string
}

export function HotspotDisplay({
  imageUrl,
  zones,
  correctZoneId,
  selectedZoneId,
  showResult = false,
  disabled = false,
  onZoneClick,
  className,
}: HotspotDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setClickPos({ x, y })

      // Find which zone was clicked (if any)
      let closestZone: HotspotZone | null = null
      let closestDist = Infinity

      for (const zone of zones) {
        const dx = x - zone.x
        const dy = y - zone.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= zone.radius && dist < closestDist) {
          closestDist = dist
          closestZone = zone
        }
      }

      if (closestZone && onZoneClick) {
        onZoneClick(closestZone.id)
      }
    },
    [disabled, zones, onZoneClick]
  )

  const getZoneColor = useCallback(
    (zone: HotspotZone) => {
      if (!showResult) {
        return {
          border: 'border-quiz-orange',
          bg: 'bg-quiz-orange/20',
          text: 'text-quiz-orange',
        }
      }

      if (zone.id === correctZoneId) {
        return {
          border: 'border-green-500',
          bg: 'bg-green-500/20',
          text: 'text-green-600',
        }
      }

      if (zone.id === selectedZoneId && zone.id !== correctZoneId) {
        return {
          border: 'border-red-500',
          bg: 'bg-red-500/20',
          text: 'text-red-600',
        }
      }

      return {
        border: 'border-muted-foreground/30',
        bg: 'bg-muted/20',
        text: 'text-muted-foreground',
      }
    },
    [showResult, correctZoneId, selectedZoneId]
  )

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border border-border/40 bg-card cursor-crosshair"
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt="Quiz image"
          width={800}
          height={450}
          unoptimized
          className="h-auto w-full object-contain"
        />

        {/* Zone indicators */}
        {zones.map((zone) => {
          const colors = getZoneColor(zone)
          return (
            <div
              key={zone.id}
              className="absolute pointer-events-none"
              style={{
                left: `${zone.x}%`,
                top: `${zone.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className={`rounded-full border-2 ${colors.border} ${colors.bg}`}
                style={{
                  width: `${zone.radius * 2}%`,
                  height: `${zone.radius * 2}%`,
                  minWidth: '20px',
                  minHeight: '20px',
                }}
              />
              {showResult && (
                <span
                  className={`absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-xs font-semibold whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded ${colors.text}`}
                >
                  {zone.name}
                </span>
              )}
            </div>
          )
        })}

        {/* Click position indicator */}
        {clickPos && !showResult && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${clickPos.x}%`,
              top: `${clickPos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Target className="h-6 w-6 text-primary animate-pulse" />
          </div>
        )}

        {/* Result overlay click indicator */}
        {showResult && selectedZoneId && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${zones.find((z) => z.id === selectedZoneId)?.x ?? 0}%`,
              top: `${zones.find((z) => z.id === selectedZoneId)?.y ?? 0}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Target className="h-6 w-6 text-red-500" />
          </div>
        )}
      </div>
    </div>
  )
}
