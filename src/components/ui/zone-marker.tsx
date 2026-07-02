'use client'

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
  onDragEnd,
  children,
}: ZoneMarkerProps) {
  const diameter = zoneDiameterPercent(radius)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!draggable || !onDragEnd) return
    e.stopPropagation()
    e.preventDefault()

    const container = (e.currentTarget as HTMLElement).closest('[data-zone-container]')
    if (!container) return

    let lastX = x
    let lastY = y

    const handlePointerMove = (moveEvent: PointerEvent) => {
      moveEvent.preventDefault()
      const rect = container.getBoundingClientRect()
      lastX = Math.min(100, Math.max(0, ((moveEvent.clientX - rect.left) / rect.width) * 100))
      lastY = Math.min(100, Math.max(0, ((moveEvent.clientY - rect.top) / rect.height) * 100))
    }

    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('pointercancel', handlePointerUp)
      onDragEnd(lastX, lastY)
    }

    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointercancel', handlePointerUp)
  }

  return (
    <div
      className={`absolute ${draggable ? 'pointer-events-auto cursor-grab touch-none active:cursor-grabbing' : 'pointer-events-none'} transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        // Percentage width resolves against the positioned container,
        // so markers scale with the rendered image
        width: `${diameter}%`,
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
