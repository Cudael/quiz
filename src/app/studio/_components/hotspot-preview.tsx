'use client'

import Image from 'next/image'

interface HotspotZone {
  id: string
  name: string
  x: number
  y: number
  radius: number
}

interface HotspotPreviewProps {
  imageUrl: string
  zones: HotspotZone[]
}

export function HotspotPreview({ imageUrl, zones }: HotspotPreviewProps) {
  if (!imageUrl) return null

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg border border-border/40 bg-card">
      <Image
        src={imageUrl}
        alt="Hotspot quiz preview"
        width={1200}
        height={675}
        unoptimized
        className="h-auto w-full object-contain"
      />

      {/* Zone circles with names */}
      {zones.map((zone) => (
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
            className="rounded-full border-2 border-quiz-orange bg-quiz-orange/10"
            style={{
              width: `${zone.radius * 20}px`,
              height: `${zone.radius * 20}px`,
            }}
          />
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-xs font-semibold text-quiz-orange whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded">
            {zone.name}
          </span>
        </div>
      ))}
    </div>
  )
}
