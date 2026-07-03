'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { Minus, Plus, PlusCircle, RotateCcw, Trash2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from './image-upload'
import { ZoneMarker, zoneDiameterPercent } from '@/components/ui/zone-marker'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { HotspotZone } from '@/store/quiz-creator-store'
import type { DraftChoice } from '@/store/quiz-creator-store'

interface ZoneFormState {
  name: string
  radius: number
}

export function HotspotQuestionEditor() {
  const { questions, sharedImageUrl, addQuestion, updateQuestion, setMeta, setQuestions } =
    useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)

  const [selectedZone, setSelectedZone] = useState<{ x: number; y: number } | null>(null)
  const [zoneForm, setZoneForm] = useState<ZoneFormState>({
    name: '',
    radius: 4,
  })
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const imageNaturalRef = useRef<{ width: number; height: number } | null>(null)
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const allZones = useMemo(() => {
    const zoneOwnerMap = new Map<string, string>()
    for (const q of questions) {
      const correctChoice = q.choices.find((c) => c.isCorrect)
      if (correctChoice) {
        const zoneId = (correctChoice.meta as { zoneId?: string })?.zoneId
        if (zoneId) zoneOwnerMap.set(zoneId, q.localId)
      }
    }

    const seen = new Set<string>()
    const zones: Array<HotspotZone & { questionId: string }> = []
    for (const q of questions) {
      const meta = q.meta as { zones?: HotspotZone[] } | undefined
      if (meta?.zones) {
        for (const zone of meta.zones) {
          if (!seen.has(zone.id)) {
            seen.add(zone.id)
            const ownerQuestionId = zoneOwnerMap.get(zone.id) ?? q.localId
            zones.push({ ...zone, questionId: ownerQuestionId })
          }
        }
      }
    }
    return zones
  }, [questions])

  /** Convert a screen (client) point to image-space percentage coordinates. */
  const screenToPercent = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!imageContainerRef.current || !imageNaturalRef.current) return null
      const rect = imageContainerRef.current.getBoundingClientRect()
      const imgWidth = imageNaturalRef.current.width
      const imgHeight = imageNaturalRef.current.height
      const relX = clientX - rect.left
      const relY = clientY - rect.top
      const imgX = (relX - panOffset.x) / zoom
      const imgY = (relY - panOffset.y) / zoom
      return {
        x: (imgX / imgWidth) * 100,
        y: (imgY / imgHeight) * 100,
      }
    },
    [zoom, panOffset]
  )

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isPanning) return
      const pct = screenToPercent(e.clientX, e.clientY)
      if (!pct) return
      setSelectedZone({ x: pct.x, y: pct.y })
      setZoneForm((f) => ({ name: '', radius: f.radius }))
    },
    [screenToPercent, isPanning]
  )

  /** Wheel zoom — zoom toward cursor position. */
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      if (!imageContainerRef.current || !imageNaturalRef.current) return
      const rect = imageContainerRef.current.getBoundingClientRect()
      const cursorX = e.clientX - rect.left
      const cursorY = e.clientY - rect.top
      const newZoom = Math.min(5, Math.max(1, zoom - e.deltaY * 0.005))
      const ratio = newZoom / zoom
      const newPanX = cursorX - ratio * (cursorX - panOffset.x)
      const newPanY = cursorY - ratio * (cursorY - panOffset.y)
      setZoom(newZoom)
      setPanOffset({ x: newPanX, y: newPanY })
    },
    [zoom, panOffset]
  )

  const handlePanStart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (zoom <= 1) return
      const target = e.target as HTMLElement
      if (target.closest('[data-zone-marker]')) return
      setIsPanning(true)
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: panOffset.x, panY: panOffset.y }
    },
    [zoom, panOffset]
  )

  const handlePanMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isPanning) return
      const dx = e.clientX - panStartRef.current.x
      const dy = e.clientY - panStartRef.current.y
      setPanOffset({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      })
    },
    [isPanning]
  )

  const handlePanEnd = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }, [])

  const handleZoomStep = useCallback(
    (step: number) => {
      if (!imageContainerRef.current || !imageNaturalRef.current) return
      const rect = imageContainerRef.current.getBoundingClientRect()
      const newZoom = Math.min(5, Math.max(1, zoom + step))
      const cx = rect.width / 2
      const cy = rect.height / 2
      const ratio = newZoom / zoom
      const newPanX = cx - ratio * (cx - panOffset.x)
      const newPanY = cy - ratio * (cy - panOffset.y)
      setZoom(newZoom)
      setPanOffset({ x: newPanX, y: newPanY })
    },
    [zoom, panOffset]
  )

  /** Set or replace the shared image and keep every question in sync. */
  const handleSharedImageChange = useCallback(
    (url: string) => {
      setMeta({ sharedImageUrl: url })
      if (url && questions.length > 0) {
        setQuestions(questions.map((q) => ({ ...q, imageUrl: url })))
      }
    },
    [setMeta, questions, setQuestions]
  )

  const handleAddZone = useCallback(() => {
    if (!selectedZone || !zoneForm.name.trim()) return

    const newZone: HotspotZone = {
      id: crypto.randomUUID(),
      name: zoneForm.name.trim(),
      x: selectedZone.x,
      y: selectedZone.y,
      radius: zoneForm.radius,
    }

    const allZonesForChoice = [...allZones, newZone]
    const choices: DraftChoice[] = allZonesForChoice.map((z) => ({
      localId: crypto.randomUUID(),
      text: z.name,
      imageUrl: '',
      isCorrect: z.id === newZone.id,
      meta: { zoneId: z.id },
    }))

    // Create new question with ALL zones in meta.zones (not just the new one)
    addQuestion({
      localId: crypto.randomUUID(),
      dbId: null,
      type: 'HOTSPOT',
      prompt: `Click on ${newZone.name}`,
      imageUrl: sharedImageUrl,
      explanation: '',
      timeLimitSec: defaultTimeLimitSec ?? 20,
      choices,
      meta: {
        zones: allZonesForChoice,
      },
    })

    // Backfill: add new zone as a non-correct choice to all existing questions
    for (const existingQ of questions) {
      const existingMeta = existingQ.meta as { zones?: HotspotZone[] } | undefined

      const existingZoneIds = new Set(
        existingQ.choices.map((c) => (c.meta as { zoneId?: string })?.zoneId)
      )
      if (existingZoneIds.has(newZone.id)) continue

      const updatedChoices = [
        ...existingQ.choices,
        {
          localId: crypto.randomUUID(),
          text: newZone.name,
          imageUrl: '',
          isCorrect: false,
          meta: { zoneId: newZone.id },
        },
      ]
      const updatedZones = [...(existingMeta?.zones ?? []), newZone]
      updateQuestion(existingQ.localId, {
        choices: updatedChoices,
        meta: { ...(existingMeta ?? {}), zones: updatedZones },
      })
    }

    setSelectedZone(null)
    setZoneForm((f) => ({ name: '', radius: f.radius }))
  }, [
    selectedZone,
    zoneForm,
    allZones,
    sharedImageUrl,
    defaultTimeLimitSec,
    addQuestion,
    questions,
    updateQuestion,
  ])

  const handleZoneReposition = useCallback(
    (zoneId: string, newX: number, newY: number) => {
      setQuestions(
        questions.map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          if (!meta?.zones) return q
          const hasZone = meta.zones.some((z) => z.id === zoneId)
          if (!hasZone) return q

          const updatedZones = meta.zones.map((z) =>
            z.id === zoneId ? { ...z, x: newX, y: newY } : z
          )
          return { ...q, meta: { ...meta, zones: updatedZones } }
        })
      )
    },
    [questions, setQuestions]
  )

  /**
   * Delete a zone everywhere: remove its question AND strip the zone from
   * every remaining question's zone list and choices, so no orphan zones
   * are left clickable during play.
   */
  const handleDeleteZone = useCallback(
    (questionId: string, zoneId: string) => {
      const remaining = questions
        .filter((q) => q.localId !== questionId)
        .map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          return {
            ...q,
            meta: {
              ...(meta ?? {}),
              zones: (meta?.zones ?? []).filter((z) => z.id !== zoneId),
            },
            choices: q.choices.filter(
              (c) => (c.meta as { zoneId?: string } | undefined)?.zoneId !== zoneId
            ),
          }
        })
      setQuestions(remaining)
    },
    [questions, setQuestions]
  )

  const handlePromptChange = useCallback(
    (localId: string, newPrompt: string) => {
      updateQuestion(localId, { prompt: newPrompt })
    },
    [updateQuestion]
  )

  const handleTimeLimitChange = useCallback(
    (localId: string, seconds: number) => {
      updateQuestion(localId, {
        timeLimitSec: Math.min(120, Math.max(5, Math.round(seconds) || 20)),
      })
    },
    [updateQuestion]
  )

  const handleZoneNameChange = useCallback(
    (questionId: string, zoneId: string, newName: string) => {
      setQuestions(
        questions.map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          if (!meta?.zones) return q
          const oldZone = meta.zones.find((z) => z.id === zoneId)
          if (!oldZone) return q

          const updatedZones = meta.zones.map((z) =>
            z.id === zoneId ? { ...z, name: newName } : z
          )

          const updatedChoices = q.choices.map((c) => {
            const choiceMeta = c.meta as { zoneId?: string } | undefined
            if (choiceMeta?.zoneId === zoneId) {
              return { ...c, text: newName }
            }
            return c
          })

          // Only refresh the prompt if the author hasn't customized it
          const hasDefaultPrompt = q.prompt === `Click on ${oldZone.name}`
          return {
            ...q,
            ...(q.localId === questionId && hasDefaultPrompt
              ? { prompt: `Click on ${newName}` }
              : {}),
            meta: { ...meta, zones: updatedZones },
            choices: updatedChoices,
          }
        })
      )
    },
    [questions, setQuestions]
  )

  const handleRadiusChange = useCallback(
    (questionId: string, zoneId: string, newRadius: number) => {
      setQuestions(
        questions.map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          if (!meta?.zones) return q
          const hasZone = meta.zones.some((z) => z.id === zoneId)
          if (!hasZone) return q

          const updatedZones = meta.zones.map((z) =>
            z.id === zoneId ? { ...z, radius: newRadius } : z
          )
          return { ...q, meta: { ...meta, zones: updatedZones } }
        })
      )
    },
    [questions, setQuestions]
  )

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-quiz-orange/20 bg-quiz-orange/5 px-4 py-3">
        <p className="text-sm font-semibold text-quiz-orange">Image Hotspot Quiz</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Upload an image and click on it to place zones. Drag existing zones to reposition them.
          Each zone becomes a question where players must click that area of the image.
        </p>
      </div>

      {!sharedImageUrl ? (
        <div className="space-y-3">
          <p className="text-sm font-medium">Upload a shared image for all questions</p>
          <ImageUpload
            value={sharedImageUrl}
            onChange={handleSharedImageChange}
            label="Quiz image"
            aspectRatio="16/9"
          />
          <p className="text-xs text-muted-foreground">
            This image will be shown for all questions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Image section — full width */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Click to place a zone, drag to reposition</p>
              <div className="flex items-center gap-2">
                {selectedZone && (
                  <Badge variant="secondary" className="text-xs">
                    Selected: ({selectedZone.x.toFixed(1)}, {selectedZone.y.toFixed(1)})
                  </Badge>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMeta({ sharedImageUrl: '' })}
                >
                  Change image
                </Button>
              </div>
            </div>

            {/* Zoom controls */}
            <div className="mb-2 flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleZoomStep(-0.5)}
                disabled={zoom <= 1}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="min-w-[3.5rem] text-center text-xs font-medium tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleZoomStep(0.5)}
                disabled={zoom >= 5}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
              {zoom !== 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={handleResetZoom}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
              <span className="ml-2 text-xs text-muted-foreground">
                Scroll to zoom &middot; Drag to pan
              </span>
            </div>

            <div
              ref={imageContainerRef}
              data-zone-container
              className="relative overflow-hidden rounded-md border border-border/40 bg-card"
              style={
                isPanning
                  ? { cursor: 'grabbing' }
                  : zoom > 1
                    ? { cursor: 'grab' }
                    : { cursor: 'crosshair' }
              }
              onClick={handleImageClick}
              onWheel={handleWheel}
              onMouseDown={handlePanStart}
              onMouseMove={handlePanMove}
              onMouseUp={handlePanEnd}
              onMouseLeave={handlePanEnd}
            >
              <div
                className="relative origin-top-left"
                style={{
                  transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
                }}
              >
                <Image
                  src={sharedImageUrl}
                  alt="Quiz image"
                  width={1200}
                  height={675}
                  unoptimized
                  className="h-auto w-full object-contain"
                  onLoad={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    imageNaturalRef.current = {
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    }
                  }}
                />

                {/* Existing zones — draggable */}
                {allZones.map((zone) => (
                  <ZoneMarker
                    key={zone.id}
                    x={zone.x}
                    y={zone.y}
                    radius={zone.radius}
                    name={zone.name}
                    showLabel
                    borderClass="border-2 border-quiz-orange"
                    labelClass="text-quiz-orange"
                    draggable={!isPanning}
                    onDragEnd={(newX, newY) => handleZoneReposition(zone.id, newX, newY)}
                  />
                ))}

                {/* Selected placement marker */}
                {selectedZone && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: `${selectedZone.x}%`,
                      top: `${selectedZone.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${zoneDiameterPercent(zoneForm.radius)}%`,
                    }}
                  >
                    <div className="aspect-square w-full min-h-2 min-w-2 animate-pulse rounded-full border-2 border-quiz-orange bg-quiz-orange/30" />
                    <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-quiz-orange" />
                  </div>
                )}
              </div>
            </div>

            {/* Zone form — below image */}
            {selectedZone && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px_auto] items-end rounded-md border border-border/50 bg-card p-3">
                <div className="space-y-1">
                  <label htmlFor="zone-name" className="text-xs font-medium">
                    Zone name
                  </label>
                  <input
                    id="zone-name"
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Latvia"
                    autoFocus
                    className="w-full rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="zone-radius" className="text-xs font-medium">
                      Zone size
                    </label>
                    <span className="text-xs text-muted-foreground">
                      {zoneForm.radius < 4 ? 'Small' : zoneForm.radius < 12 ? 'Medium' : 'Large'}
                    </span>
                  </div>
                  <input
                    id="zone-radius"
                    type="range"
                    min={1}
                    max={30}
                    step={0.5}
                    value={zoneForm.radius}
                    onChange={(e) =>
                      setZoneForm((f) => ({ ...f, radius: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" onClick={handleAddZone} disabled={!zoneForm.name.trim()}>
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Add zone
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSelectedZone(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Zone list — below image, full width */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Zones ({allZones.length})</p>
              <Badge variant="secondary" className="text-xs">
                {allZones.length} zone{allZones.length !== 1 ? 's' : ''} placed
              </Badge>
            </div>

            {allZones.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-md border border-dashed py-12 text-center">
                <PlusCircle className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click on the image to place your first zone.
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {allZones.map((zone, idx) => {
                  const question = questions.find((q) => q.localId === zone.questionId)
                  const prompt = question?.prompt ?? `Click on ${zone.name}`
                  const questionId = zone.questionId

                  return (
                    <div key={zone.id} className="rounded-md border border-border/50 bg-card p-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-muted text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="space-y-1">
                            <label
                              htmlFor={`zone-prompt-${zone.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Question prompt
                            </label>
                            <input
                              id={`zone-prompt-${zone.id}`}
                              type="text"
                              value={prompt}
                              onChange={(e) => handlePromptChange(questionId, e.target.value)}
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`zone-name-${zone.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Name:
                            </label>
                            <input
                              id={`zone-name-${zone.id}`}
                              type="text"
                              value={zone.name}
                              onChange={(e) =>
                                handleZoneNameChange(questionId, zone.id, e.target.value)
                              }
                              className="w-24 min-w-0 flex-1 rounded border border-input bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`zone-radius-${zone.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Size:
                            </label>
                            <input
                              id={`zone-radius-${zone.id}`}
                              type="range"
                              min={1}
                              max={30}
                              step={0.5}
                              value={zone.radius}
                              onChange={(e) =>
                                handleRadiusChange(questionId, zone.id, parseFloat(e.target.value))
                              }
                              className="w-20"
                            />
                            <span className="w-14 text-xs text-muted-foreground">
                              {zone.radius < 4 ? 'Small' : zone.radius < 12 ? 'Medium' : 'Large'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label
                              htmlFor={`zone-time-${zone.id}`}
                              className="text-xs text-muted-foreground"
                            >
                              Time:
                            </label>
                            <input
                              id={`zone-time-${zone.id}`}
                              type="number"
                              min={5}
                              max={120}
                              value={question?.timeLimitSec ?? 20}
                              onChange={(e) =>
                                handleTimeLimitChange(questionId, Number(e.target.value))
                              }
                              className="w-16 rounded border border-input bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <span className="text-xs text-muted-foreground">seconds</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteZone(questionId, zone.id)}
                          className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete zone ${zone.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
