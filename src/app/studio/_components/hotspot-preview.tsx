'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface HotspotZone {
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

interface HotspotPreviewProps {
  imageUrl: string
  zones: HotspotZone[]
}

export function HotspotPreview({ imageUrl, zones }: HotspotPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const containerWidth = useContainerWidth(containerRef)

  const zoneToPixels = useCallback(
    (radiusPercent: number) => {
      return Math.round((radiusPercent / 100) * containerWidth)
    },
    [containerWidth]
  )

  if (!imageUrl) return null

  return (
    <div
      ref={containerRef}
      className="relative mb-3 overflow-hidden rounded-lg border border-border/40 bg-card"
    >
      <Image
        src={imageUrl}
        alt="Hotspot quiz preview"
        width={1200}
        height={675}
        unoptimized
        className="h-auto w-full object-contain"
      />

      {/* Zone circles with names */}
      {zones.map((zone) => {
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
              className="rounded-full border-2 border-quiz-orange bg-quiz-orange/20"
              style={{
                width: `${sizePx}px`,
                height: `${sizePx}px`,
              }}
            />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-xs font-semibold text-quiz-orange whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded">
              {zone.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}
