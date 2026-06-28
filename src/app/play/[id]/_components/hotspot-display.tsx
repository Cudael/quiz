'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { ZoneMarker, HOTSPOT_RADIUS_SCALE } from '@/components/ui/zone-marker'
import type { HotspotZone } from '@/store/quiz-creator-store'

interface HotspotDisplayProps {
  imageUrl: string
  zones: HotspotZone[]
  correctZoneId: string | null
  selectedZoneId?: string | null
  showResult?: boolean
  showMarkers?: boolean
  showNames?: boolean
  fadingZoneIds?: string[]
  disabled?: boolean
  onZoneClick?: (zoneId: string) => void
  className?: string
}

export type { HotspotZone }

export function HotspotDisplay({
  imageUrl,
  zones,
  correctZoneId,
  selectedZoneId,
  showResult = false,
  showMarkers = true,
  showNames = false,
  fadingZoneIds = [],
  disabled = false,
  onZoneClick,
  className,
}: HotspotDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [clickOutside, setClickOutside] = useState(false)

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Scale the distance by the same factor used for display
      let closestZone: HotspotZone | null = null
      let closestDist = Infinity

      for (const zone of zones) {
        const dx = x - zone.x
        const dy = y - zone.y
        const distPercent = Math.sqrt(dx * dx + dy * dy)
        const hitRadiusPercent = ((zone.radius * HOTSPOT_RADIUS_SCALE) / rect.width) * 100
        if (distPercent <= hitRadiusPercent && distPercent < closestDist) {
          closestDist = distPercent
          closestZone = zone
        }
      }

      if (closestZone && onZoneClick) {
        onZoneClick(closestZone.id)
      } else if (!closestZone) {
        // Click outside all zones — show brief feedback
        setClickOutside(true)
        setTimeout(() => setClickOutside(false), 400)
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

      if (zone.id === selectedZoneId) {
        const isCorrect = selectedZoneId === correctZoneId
        return isCorrect
          ? {
              border: 'border-quiz-green',
              bg: 'bg-quiz-green/25',
              text: 'text-quiz-green',
            }
          : {
              border: 'border-destructive',
              bg: 'bg-destructive/25',
              text: 'text-destructive',
            }
      }

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
        data-zone-container
        className={`relative overflow-hidden rounded-xl border-2 transition-colors duration-200 bg-card ${
          disabled ? 'cursor-default' : 'cursor-crosshair'
        } ${clickOutside ? 'border-destructive' : 'border-border/40'}`}
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
            const isFading = fadingZoneIds.includes(zone.id)
            return (
              <ZoneMarker
                key={zone.id}
                x={zone.x}
                y={zone.y}
                radius={zone.radius}
                name={zone.name}
                showLabel={showLabel}
                borderClass={`border-2 ${colors.border}`}
                bgClass={colors.bg}
                labelClass={colors.text}
                fading={isFading}
              />
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
              <ZoneMarker
                x={selectedZone.x}
                y={selectedZone.y}
                radius={selectedZone.radius}
                bgClass={isCorrect ? 'bg-quiz-green/30' : 'bg-destructive/30'}
              />
            )
          })()}
      </div>
    </div>
  )
}
