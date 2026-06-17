'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getRegionById } from '@/lib/map-regions'

interface MapDisplayProps {
  mapRegion: string
  selectedCountryId?: string | null
  correctCountryId?: string | null
  showResult?: boolean
  disabled?: boolean
  onCountryClick?: (countryId: string) => void
  className?: string
}

export function MapDisplay({
  mapRegion,
  selectedCountryId,
  correctCountryId,
  showResult = false,
  disabled = false,
  onCountryClick,
  className,
}: MapDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const region = getRegionById(mapRegion)

  const loadMap = useCallback(async () => {
    if (!region) {
      setError(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(region.svgPath)
      if (!response.ok) throw new Error('Failed to load map')
      const text = await response.text()
      setSvgContent(text)
      setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [region])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch requires setState in effect
    loadMap()
  }, [loadMap])

  useEffect(() => {
    if (!svgContent || !containerRef.current) return

    // Inject the SVG content
    containerRef.current.innerHTML = svgContent

    const svg = containerRef.current.querySelector('svg')
    if (!svg) return

    // Make SVG responsive
    svg.removeAttribute('width')
    svg.removeAttribute('height')
    svg.style.width = '100%'
    svg.style.height = 'auto'
    svg.style.maxHeight = '400px'

    // Style all country paths
    const allPaths = svg.querySelectorAll('.country')
    allPaths.forEach((el) => {
      const path = el as SVGPathElement
      const countryId = path.id

      // Reset classes
      path.classList.remove('highlighted', 'selected', 'correct', 'incorrect')

      if (showResult && correctCountryId) {
        // Show results: green for correct, red for incorrect selection
        if (countryId === correctCountryId) {
          path.classList.add('correct')
        } else if (countryId === selectedCountryId) {
          path.classList.add('incorrect')
        }
      } else if (countryId === selectedCountryId) {
        // Show selection
        path.classList.add('selected')
      }

      // Add click handler
      if (!disabled && onCountryClick) {
        path.style.cursor = 'pointer'
        path.addEventListener('click', () => onCountryClick(countryId))
      } else {
        path.style.cursor = 'default'
      }
    })
  }, [svgContent, selectedCountryId, correctCountryId, showResult, disabled, onCountryClick])

  if (loading) {
    return (
      <div className={className}>
        <div className="flex h-64 items-center justify-center rounded-xl border border-border/40 bg-muted/20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    )
  }

  if (error || !region) {
    return (
      <div className={className}>
        <div className="flex h-64 items-center justify-center rounded-xl border border-border/40 bg-muted/20">
          <p className="text-sm text-muted-foreground">Could not load map.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={containerRef}
        className="rounded-xl border border-border/40 bg-card p-4 [&_svg]:mx-auto"
      />
    </div>
  )
}
