'use client'

import Image from 'next/image'
import { ZoneMarker } from '@/components/ui/zone-marker'
import type { HotspotZone } from '@/store/quiz-creator-store'

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

      {zones.map((zone) => (
        <ZoneMarker
          key={zone.id}
          x={zone.x}
          y={zone.y}
          radius={zone.radius}
          name={zone.name}
          showLabel
          borderClass="border-2 border-quiz-orange"
          bgClass="bg-quiz-orange/10"
          labelClass="text-quiz-orange"
        />
      ))}
    </div>
  )
}
