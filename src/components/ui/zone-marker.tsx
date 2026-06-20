export const HOTSPOT_RADIUS_SCALE = 10

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
  const isSmall = radius <= 1.5
  // Small: radius * 8px solid square | Large: radius * SCALE pixels bordered circle
  const sizePx = isSmall ? radius * 8 : radius * HOTSPOT_RADIUS_SCALE

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable || !onDragEnd) return
    e.stopPropagation()

    const container = (e.currentTarget as HTMLElement).closest('[data-zone-container]')
    if (!container) return

    let lastX = x
    let lastY = y

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault()
      const rect = container.getBoundingClientRect()
      lastX = ((moveEvent.clientX - rect.left) / rect.width) * 100
      lastY = ((moveEvent.clientY - rect.top) / rect.height) * 100
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      onDragEnd(lastX, lastY)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      className={`absolute ${draggable ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'} transition-opacity duration-700 ${fading ? 'opacity-0' : 'opacity-100'}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={isSmall ? '' : `rounded-full ${borderClass} ${bgClass}`}
        style={{
          width: `${sizePx}px`,
          height: `${sizePx}px`,
          ...(isSmall ? { backgroundColor: '#f97316' } : {}),
        }}
      />
      {showLabel && name && (
        <span
          className={`absolute top-full left-1/2 -translate-x-1/2 mt-0.5 text-xs font-semibold whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded ${labelClass}`}
        >
          {name}
        </span>
      )}
      {children}
    </div>
  )
}
