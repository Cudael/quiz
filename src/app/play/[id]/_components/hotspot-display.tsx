'use client'

import { useCallback, useRef } from 'react'
import Image from 'next/image'

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
  showMarkers?: boolean
  showNames?: boolean
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
  showMarkers = true,
  showNames = false,
  disabled = false,
  onZoneClick,
  className,
}: HotspotDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Find which zone was clicked
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

      // Only submit if a zone was clicked — clicking outside does nothing
      if (closestZone && onZoneClick) {
        onZoneClick(closestZone.id)
      }
    },
    [disabled, zones, onZoneClick]
  )

  const getZoneColors = useCallback(
    (zone: HotspotZone) => {
      if (!showResult) {
        return {
          border: 'border-quiz-orange',
          bg: 'bg-quiz-orange/10',
          text: 'text-quiz-orange',
        }
      }

      // Only color the selected zone — don't reveal the correct answer
      if (zone.id === selectedZoneId) {
        const isCorrect = selectedZoneId === correctZoneId
        return isCorrect
          ? {
              border: 'border-green-500',
              bg: 'bg-green-500/25',
              text: 'text-green-600',
            }
          : {
              border: 'border-red-500',
              bg: 'bg-red-500/25',
              text: 'text-red-600',
            }
      }

      // All other zones stay orange (default)
      return {
        border: 'border-quiz-orange',
        bg: 'bg-quiz-orange/10',
        text: 'text-quiz-orange',
      }
    },
    [showResult, correctZoneId, selectedZoneId]
  )

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className={`relative overflow-hidden rounded-xl border border-border/40 bg-card ${
          disabled ? 'cursor-default' : 'cursor-crosshair'
        }`}
        onClick={handleImageClick}
      >
        <Image
          src={imageUrl}
          alt="Quiz image"
          width={1200}
          height={675}
          unoptimized
          className="h-auto w-full object-contain"
        />

        {/* Zone markers */}
        {showMarkers &&
          zones.map((zone) => {
            const colors = getZoneColors(zone)
            const showLabel = showNames || (showResult && zone.id === selectedZoneId)
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
                    width: `${zone.radius * 20}px`,
                    height: `${zone.radius * 20}px`,
                  }}
                />
                {showLabel && (
                  <span
                    className={`absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-xs font-semibold whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded ${colors.text}`}
                  >
                    {zone.name}
                  </span>
                )}
              </div>
            )
          })}

        {/* Result indicator on selected zone */}
        {showResult &&
          selectedZoneId &&
          (() => {
            const selectedZone = zones.find((z) => z.id === selectedZoneId)
            if (!selectedZone) return null
            const isCorrect = selectedZoneId === correctZoneId
            return (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${selectedZone.x}%`,
                  top: `${selectedZone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={`rounded-full ${isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}`}
                  style={{
                    width: `${selectedZone.radius * 20}px`,
                    height: `${selectedZone.radius * 20}px`,
                  }}
                />
              </div>
            )
          })()}
      </div>
    </div>
  )
}
