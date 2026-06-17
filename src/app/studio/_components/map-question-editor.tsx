'use client'

import { useState, useCallback, useMemo } from 'react'
import { PlusCircle, Trash2, Pencil } from 'lucide-react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { getRegionById, getCountryName } from '@/lib/map-regions'
import type { DraftQuestion, DraftChoice } from '@/store/quiz-creator-store'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

const REGION_CONFIG: Record<string, { center: [number, number]; zoom: number }> = {
  world: { center: [0, 20], zoom: 1 },
  europe: { center: [15, 50], zoom: 3.5 },
  africa: { center: [20, 0], zoom: 2.5 },
  americas: { center: [-80, 10], zoom: 2 },
  asia: { center: [90, 30], zoom: 2.5 },
  oceania: { center: [145, -25], zoom: 3 },
}

export function MapQuestionEditor() {
  const { questions, addQuestion, updateQuestion, removeQuestion } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)

  const mapRegion = (questions[0]?.meta as Record<string, string>)?.mapRegion || 'europe'
  const region = getRegionById(mapRegion)
  const regionConfig = REGION_CONFIG[mapRegion] ?? REGION_CONFIG.europe

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)

  const usedIds = useMemo(
    () =>
      new Set(questions.map((q) => (q.meta as Record<string, string>)?.regionId).filter(Boolean)),
    [questions]
  )

  const handleCountryClick = useCallback(
    (geoId: string) => {
      if (usedIds.has(geoId)) return
      setSelectedCountryId((prev) => (prev === geoId ? null : geoId))
    },
    [usedIds]
  )

  const getFill = useCallback(
    (geoId: string) => {
      if (geoId === selectedCountryId) return '#f97316'
      if (usedIds.has(geoId)) return '#a1a1aa'
      return '#d4d4d8'
    },
    [selectedCountryId, usedIds]
  )

  const handleAddQuestion = useCallback(() => {
    if (!selectedCountryId || !region) return

    const countryName = getCountryName(region.id, selectedCountryId) ?? selectedCountryId

    const choices: DraftChoice[] = region.countries.map((country) => ({
      localId: crypto.randomUUID(),
      text: country.name,
      imageUrl: '',
      isCorrect: country.id === selectedCountryId,
      meta: { regionId: country.id },
    }))

    const newQuestion: DraftQuestion = {
      localId: crypto.randomUUID(),
      dbId: null,
      type: 'MAP_SELECT',
      prompt: `Find ${countryName}`,
      imageUrl: '',
      explanation: '',
      timeLimitSec: defaultTimeLimitSec ?? 20,
      choices,
      meta: {
        mapRegion: region.id,
        regionId: selectedCountryId,
        countryName,
      },
    }

    addQuestion(newQuestion)
    setSelectedCountryId(null)
  }, [selectedCountryId, region, defaultTimeLimitSec, addQuestion])

  const handleDeleteQuestion = useCallback(
    (localId: string) => {
      removeQuestion(localId)
    },
    [removeQuestion]
  )

  const handlePromptChange = useCallback(
    (localId: string, newPrompt: string) => {
      updateQuestion(localId, { prompt: newPrompt })
    },
    [updateQuestion]
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-primary">Map Quiz</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Click on a country in the map to add it as a question. Players will need to find and click
          that country to answer correctly.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Map */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">
              {region?.name ?? 'Map'} — Click a country to select it
            </p>
            {selectedCountryId && (
              <Badge variant="secondary" className="text-xs">
                Selected: {getCountryName(mapRegion, selectedCountryId) ?? selectedCountryId}
              </Badge>
            )}
          </div>

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
                      const isUsed = usedIds.has(geoId)
                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onClick={() => handleCountryClick(geoId)}
                          style={{
                            default: {
                              fill: getFill(geoId),
                              stroke: '#71717a',
                              strokeWidth: 0.5,
                              outline: 'none',
                              cursor: isUsed ? 'not-allowed' : 'pointer',
                              opacity: isUsed ? 0.4 : 1,
                            },
                            hover: {
                              fill: isUsed ? getFill(geoId) : '#a1a1aa',
                              stroke: '#71717a',
                              strokeWidth: 1,
                              outline: 'none',
                              cursor: isUsed ? 'not-allowed' : 'pointer',
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

          {selectedCountryId && (
            <div className="mt-3 flex justify-center">
              <Button type="button" onClick={handleAddQuestion} className="rounded-lg">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add &ldquo;{getCountryName(mapRegion, selectedCountryId) ?? selectedCountryId}
                &rdquo; as question
              </Button>
            </div>
          )}
        </div>

        {/* Right: Question list */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium">Questions ({questions.length})</p>
            <Badge variant="secondary" className="text-xs">
              {region?.countries.length
                ? `${questions.length} / ${region.countries.length} countries`
                : `${questions.length} added`}
            </Badge>
          </div>

          {questions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
              <PlusCircle className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click a country on the map to add your first question.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((q, idx) => {
                const meta = q.meta as Record<string, string> | undefined
                const countryName = meta?.countryName ?? 'Unknown'
                const regionId = meta?.regionId ?? ''
                const isEditing = editingPromptId === q.localId

                return (
                  <div key={q.localId} className="rounded-lg border border-border/50 bg-card p-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => handlePromptChange(q.localId, e.target.value)}
                            onBlur={() => setEditingPromptId(null)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') setEditingPromptId(null)
                            }}
                            autoFocus
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        ) : (
                          <p className="text-sm font-medium">{q.prompt || 'No prompt'}</p>
                        )}
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Answer: {countryName}
                          {regionId ? ` (${regionId})` : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingPromptId(isEditing ? null : q.localId)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          aria-label="Edit prompt"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.localId)}
                          className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Delete question"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
