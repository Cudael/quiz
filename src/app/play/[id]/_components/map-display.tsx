'use client'

import { useCallback } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const REGION_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  world: { center: [0, 20], zoom: 1 },
  europe: { center: [15, 50], zoom: 3.5 },
  africa: { center: [20, 0], zoom: 2.5 },
  americas: { center: [-80, 10], zoom: 2 },
  asia: { center: [90, 30], zoom: 2.5 },
  oceania: { center: [145, -25], zoom: 3 },
}

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
  const regionConfig = REGION_CONFIG[mapRegion] ?? REGION_CONFIG.world

  const handleClick = useCallback(
    (geoId: string) => {
      if (!disabled && onCountryClick) {
        onCountryClick(geoId)
      }
    },
    [disabled, onCountryClick]
  )

  const getFill = useCallback(
    (geoId: string) => {
      if (showResult && correctCountryId) {
        if (geoId === correctCountryId) return '#22c55e'
        if (geoId === selectedCountryId) return '#ef4444'
        return '#d4d4d8'
      }
      if (geoId === selectedCountryId) return '#f97316'
      return '#d4d4d8'
    },
    [showResult, correctCountryId, selectedCountryId]
  )

  const getStroke = useCallback(
    (geoId: string) => {
      if (showResult && correctCountryId && geoId === correctCountryId) return '#16a34a'
      if (showResult && selectedCountryId && geoId === selectedCountryId) return '#dc2626'
      if (geoId === selectedCountryId) return '#ea580c'
      return '#71717a'
    },
    [showResult, correctCountryId, selectedCountryId]
  )

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-xl border border-border/40 bg-card">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 100, center: regionConfig.center }}
          style={{ width: '100%', height: 'auto' }}
        >
          <ZoomableGroup center={regionConfig.center} zoom={regionConfig.zoom}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoId = geo.id as string
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => handleClick(geoId)}
                      style={{
                        default: {
                          fill: getFill(geoId),
                          stroke: getStroke(geoId),
                          strokeWidth: 0.5,
                          outline: 'none',
                          cursor: disabled ? 'default' : 'pointer',
                        },
                        hover: {
                          fill: disabled ? getFill(geoId) : '#a1a1aa',
                          stroke: getStroke(geoId),
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: disabled ? 'default' : 'pointer',
                        },
                        pressed: {
                          fill: '#f97316',
                          stroke: '#ea580c',
                          strokeWidth: 1,
                          outline: 'none',
                        },
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  )
}
