'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Zone geometry is stored as percentages of the image box:
 * x/y = center position (0–100), radius = editor size unit.
 *
 * Markers are sized as a percentage of the container width (the stored
 * radius maps to `radius × HOTSPOT_RADIUS_SCALE` pixels at the reference
 * width), so the editor preview, the play view, and hit-testing stay
 * consistent across every viewport size.
 */
export const HOTSPOT_RADIUS_SCALE = 10
export const HOTSPOT_REFERENCE_WIDTH = 800

/** Zone diameter as a percentage of the container width. */
export function zoneDiameterPercent(radius: number): number {
  return ((radius * HOTSPOT_RADIUS_SCALE) / HOTSPOT_REFERENCE_WIDTH) * 100
}

export interface ZoneMarkerProps {
  x: number
  y: number
  radius: number
  name?: string
  showLabel?: boolean
  borderClass?: string
  bgClass?: string
  labelClass?: string
  draggable?: boolean
  fading?: boolean
  /** Inverse zoom scale so markers stay proportionally sized when parent is zoomed. */
  scale?: number
  /** When provided, used to convert client coords to image-space percentages (zoom-aware). */
  getCoords?: (clientX: number, clientY: number) => { x: number; y: number } | null
  onDragEnd?: (x: number, y: number) => void
  children?: React.ReactNode
}

export function ZoneMarker({
  x,
  y,
  radius,
  name,
  showLabel = false,
  borderClass = 'border-quiz-orange',
  bgClass = 'bg-quiz-orange/10',
  labelClass = 'text-quiz-orange',
  draggable = false,
  fading = false,
  scale = 1,
  getCoords,
  onDragEnd,
  children,
}: ZoneMarkerProps) {
  const diameter = zoneDiameterPercent(radius)

  // While dragging, render at the live cursor-tracked position instead of the
  // (stale, until the parent re-renders on drop) x/y props, so the marker
  // follows the cursor in real time rather than jumping on release.
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null)
  const isDragging = dragPos !== null
  const displayX = dragPos?.x ?? x
  const displayY = dragPos?.y ?? y

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable || !onDragEnd) return
    e.stopPropagation()
    e.preventDefault()

    const markerEl = e.currentTarget as HTMLElement
    const container = markerEl.closest('[data-zone-container]')

    // Capture the pointer so move/up events keep targeting this marker (and
    // its `cursor-grabbing` style keeps applying) no matter where the cursor
    // ends up on screen — otherwise the cursor reverts as soon as it leaves
    // the marker's original spot, which is what made dragging feel clunky.
    markerEl.setPointerCapture(e.pointerId)

    let lastX = x
    let lastY = y
    setDragPos({ x: lastX, y: lastY })

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault()
      let pct: { x: number; y: number } | null = null
      if (getCoords) {
        pct = getCoords(moveEvent.clientX, moveEvent.clientY)
      } else if (container) {
        const rect = container.getBoundingClientRect()
        pct = {
          x: ((moveEvent.clientX - rect.left) / rect.width) * 100,
          y: ((moveEvent.clientY - rect.top) / rect.height) * 100,
        }
      }
      if (pct) {
        lastX = Math.min(100, Math.max(0, pct.x))
        lastY = Math.min(100, Math.max(0, pct.y))
        setDragPos({ x: lastX, y: lastY })
      }
    }

    const endDrag = () => {
      markerEl.releasePointerCapture(e.pointerId)
      markerEl.removeEventListener('pointermove', handlePointerMove)
      markerEl.removeEventListener('pointerup', endDrag)
      markerEl.removeEventListener('pointercancel', endDrag)
      setDragPos(null)
      onDragEnd(lastX, lastY)
    }

    markerEl.addEventListener('pointermove', handlePointerMove)
    markerEl.addEventListener('pointerup', endDrag)
    markerEl.addEventListener('pointercancel', endDrag)
  }

  return (
    <div
      data-zone-marker
      className={cn(
        'absolute rounded-full',
        draggable
          ? 'pointer-events-auto cursor-pointer touch-none hover:ring-2 hover:ring-quiz-orange/50'
          : 'pointer-events-none',
        isDragging
          ? 'z-20 cursor-grabbing ring-2 ring-quiz-orange transition-[transform_150ms]'
          : 'transition-[opacity_700ms,left_150ms,top_150ms,transform_150ms]',
        fading ? 'opacity-0' : 'opacity-100'
      )}
      style={{
        left: `${displayX}%`,
        top: `${displayY}%`,
        transform: `translate(-50%, -50%) scale(${isDragging ? scale * 1.15 : scale})`,
        // Percentage width resolves against the positioned container, so
        // markers scale with the rendered image. Draggable (editor) markers
        // get a pixel floor so small zones stay easy to grab; play-mode
        // markers are left at their true configured size.
        width: `${diameter}%`,
        ...(draggable ? { minWidth: 22, minHeight: 22 } : {}),
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        className={`aspect-square w-full min-h-2 min-w-2 rounded-full border-2 ${borderClass} ${bgClass}`}
      />
      {showLabel && name && (
        <span
          className={`absolute top-full left-1/2 mt-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-background/90 px-1.5 py-0.5 text-xs font-semibold ${labelClass}`}
        >
          {name}
        </span>
      )}
      {children}
    </div>
  )
}
