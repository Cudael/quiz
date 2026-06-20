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
        // Scale hit-test to match visual size: visual_radius_px = radius * HOTSPOT_RADIUS_SCALE
        // hit_radius_percent = (visual_radius_px / container_width_px) * 100
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
        } ${clickOutside ? 'border-red-500' : 'border-border/40'}`}
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
                bgClass={isCorrect ? 'bg-green-500/30' : 'bg-red-500/30'}
              />
            )
          })()}
      </div>
    </div>
  )
}
