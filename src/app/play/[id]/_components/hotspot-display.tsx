'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Target } from 'lucide-react'

export interface HotspotZone {
  id: string
  name: string
  x: number
  y: number
  radius: number
}

function useContainerWidth(ref: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setWidth(entry.contentRect.width)
    })
    observer.observe(el)
    setWidth(el.clientWidth)

    return () => observer.disconnect()
  }, [ref])

  return width
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
  const containerWidth = useContainerWidth(containerRef)
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null)

  const zoneToPixels = useCallback(
    (radiusPercent: number) => {
      return Math.round((radiusPercent / 100) * containerWidth)
    },
    [containerWidth]
  )

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

  const getZoneColors = useCallback(
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
          width={1200}
          height={675}
          unoptimized
          className="h-auto w-full object-contain"
        />

        {/* Zone indicators */}
        {zones.map((zone) => {
          const colors = getZoneColors(zone)
          const sizePx = zoneToPixels(zone.radius) * 2
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
                  width: `${sizePx}px`,
                  height: `${sizePx}px`,
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
        {showResult &&
          selectedZoneId &&
          (() => {
            const selectedZone = zones.find((z) => z.id === selectedZoneId)
            if (!selectedZone) return null
            return (
              <div
                className="absolute pointer-events-none"
                style={{
                  left: `${selectedZone.x}%`,
                  top: `${selectedZone.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Target className="h-6 w-6 text-red-500" />
              </div>
            )
          })()}
      </div>
    </div>
  )
}
