'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import Image from 'next/image'
import { PlusCircle, Trash2, Pencil, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageUpload } from './image-upload'
import { ZoneMarker, HOTSPOT_RADIUS_SCALE } from '@/components/ui/zone-marker'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import type { HotspotZone } from '@/store/quiz-creator-store'
import type { DraftChoice } from '@/store/quiz-creator-store'

interface ZoneFormState {
  name: string
  radius: number
  style: 'circle' | 'dot'
}

export function HotspotQuestionEditor() {
  const {
    questions,
    sharedImageUrl,
    addQuestion,
    updateQuestion,
    removeQuestion,
    setMeta,
    setQuestions,
  } = useQuizCreatorStore()
  const defaultTimeLimitSec = useQuizCreatorStore((state) => state.defaultTimeLimitSec)

  const [selectedZone, setSelectedZone] = useState<{ x: number; y: number } | null>(null)
  const [zoneForm, setZoneForm] = useState<ZoneFormState>({
    name: '',
    radius: 1.5,
    style: 'circle',
  })
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

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

  const handleImageClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSelectedZone({ x, y })
    setZoneForm({ name: '', radius: 1.5, style: 'circle' })
  }, [])

  const handleAddZone = useCallback(() => {
    if (!selectedZone || !zoneForm.name.trim()) return

    const newZone: HotspotZone = {
      id: crypto.randomUUID(),
      name: zoneForm.name.trim(),
      x: selectedZone.x,
      y: selectedZone.y,
      radius: zoneForm.radius,
      style: zoneForm.style,
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
        imageWidth: 0,
        imageHeight: 0,
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
    setZoneForm({ name: '', radius: 1.5, style: 'circle' })
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

  const handleDeleteZone = useCallback(
    (questionId: string) => {
      removeQuestion(questionId)
    },
    [removeQuestion]
  )

  const handlePromptChange = useCallback(
    (localId: string, newPrompt: string) => {
      updateQuestion(localId, { prompt: newPrompt })
    },
    [updateQuestion]
  )

  const handleZoneNameChange = useCallback(
    (questionId: string, zoneId: string, newName: string) => {
      setQuestions(
        questions.map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          if (!meta?.zones) return q
          const hasZone = meta.zones.some((z) => z.id === zoneId)
          if (!hasZone) return q

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

          return {
            ...q,
            ...(q.localId === questionId ? { prompt: `Click on ${newName}` } : {}),
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

  const handleStyleChange = useCallback(
    (questionId: string, zoneId: string, newStyle: 'circle' | 'dot') => {
      setQuestions(
        questions.map((q) => {
          const meta = q.meta as { zones?: HotspotZone[] } | undefined
          if (!meta?.zones) return q
          const hasZone = meta.zones.some((z) => z.id === zoneId)
          if (!hasZone) return q

          const updatedZones = meta.zones.map((z) =>
            z.id === zoneId ? { ...z, style: newStyle } : z
          )
          return { ...q, meta: { ...meta, zones: updatedZones } }
        })
      )
    },
    [questions, setQuestions]
  )

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
        <p className="text-sm font-semibold text-primary">Image Hotspot Quiz</p>
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
            onChange={(v) => setMeta({ sharedImageUrl: v })}
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

            <div
              ref={imageContainerRef}
              data-zone-container
              className="relative overflow-hidden rounded-xl border border-border/40 bg-card cursor-crosshair"
              onClick={handleImageClick}
            >
              <Image
                src={sharedImageUrl}
                alt="Quiz image"
                width={1200}
                height={675}
                unoptimized
                className="h-auto w-full object-contain"
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
                  draggable
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
                  }}
                >
                  <div
                    className="rounded-full border-2 border-primary bg-primary/30 animate-pulse"
                    style={{
                      width: `${zoneForm.radius * HOTSPOT_RADIUS_SCALE}px`,
                      height: `${zoneForm.radius * HOTSPOT_RADIUS_SCALE}px`,
                    }}
                  />
                  <Target className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                </div>
              )}
            </div>

            {/* Zone form — below image */}
            {selectedZone && (
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_200px_auto] items-end rounded-lg border border-border/50 bg-card p-3">
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
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-medium">Style</span>
                    </div>
                    <div className="flex rounded-md border border-border/50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setZoneForm((f) => ({ ...f, style: 'circle' }))}
                        className={`px-2 py-0.5 text-xs font-medium transition-colors ${zoneForm.style === 'circle' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Circle
                      </button>
                      <button
                        type="button"
                        onClick={() => setZoneForm((f) => ({ ...f, style: 'dot' }))}
                        className={`px-2 py-0.5 text-xs font-medium border-l border-border/50 transition-colors ${zoneForm.style === 'dot' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        Dot
                      </button>
                    </div>
                  </div>
                  {zoneForm.style === 'circle' && (
                    <div className="flex items-center justify-between">
                      <label htmlFor="zone-radius" className="text-xs text-muted-foreground">
                        Radius
                      </label>
                      <span className="text-xs text-muted-foreground">{zoneForm.radius}</span>
                    </div>
                  )}
                  {zoneForm.style === 'circle' && (
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
                  )}
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
              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
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
                  const isEditing = editingPromptId === questionId

                  return (
                    <div key={zone.id} className="rounded-lg border border-border/50 bg-card p-3">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={prompt}
                              onChange={(e) => handlePromptChange(questionId, e.target.value)}
                              onBlur={() => setEditingPromptId(null)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') setEditingPromptId(null)
                              }}
                              autoFocus
                              className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          ) : (
                            <p className="text-sm font-medium">{prompt || 'No prompt'}</p>
                          )}

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
                              className="w-24 rounded border border-input bg-background px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Style:</span>
                            <div className="flex rounded border border-border/50 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleStyleChange(questionId, zone.id, 'circle')}
                                className={`px-1.5 py-0.5 text-[10px] font-medium transition-colors ${(zone.style ?? 'circle') === 'circle' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                Circle
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStyleChange(questionId, zone.id, 'dot')}
                                className={`px-1.5 py-0.5 text-[10px] font-medium border-l border-border/50 transition-colors ${zone.style === 'dot' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                              >
                                Dot
                              </button>
                            </div>
                          </div>

                          {(zone.style ?? 'circle') === 'circle' && (
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`zone-radius-${zone.id}`}
                                className="text-xs text-muted-foreground"
                              >
                                Radius:
                              </label>
                              <input
                                id={`zone-radius-${zone.id}`}
                                type="range"
                                min={1}
                                max={30}
                                step={0.5}
                                value={zone.radius}
                                onChange={(e) =>
                                  handleRadiusChange(
                                    questionId,
                                    zone.id,
                                    parseFloat(e.target.value)
                                  )
                                }
                                className="w-20"
                              />
                              <span className="text-xs text-muted-foreground w-12">
                                {zone.radius}
                              </span>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground">
                            Position: ({zone.x.toFixed(1)}, {zone.y.toFixed(1)})
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingPromptId(isEditing ? null : questionId)}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Edit prompt"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteZone(questionId)}
                            className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            aria-label="Delete zone"
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
      )}
    </div>
  )
}
