import Image from 'next/image'
import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Question } from '../play-view.types'
import { getQuestionImageSrc, imageLoader } from '../play-view.utils'
import { CountdownRing } from './countdown-ring'
import { MapDisplay } from './map-display'
import { HotspotDisplay } from './hotspot-display'
import type { HotspotZone } from './hotspot-display'

interface QuestionPanelProps {
  currentQuestion: Question
  reduceMotion: boolean | null
  timeRemainingMs: number
  selectedChoiceIds: string[]
  hiddenChoiceIds: string[]
  isAnswered: boolean
  canSubmit: boolean
  isLastQuestion: boolean
  submitting: boolean
  onChoiceSelect: (choiceId: string) => void
  onSubmit: () => void
  onAnswer: (choiceIds: string[], timeout?: boolean, textAnswer?: string) => void
  onNext: () => void
  onTextSubmit?: (text: string) => void
  textAnswer?: string
  onTextChange?: (text: string) => void
}

export function QuestionPanel({
  currentQuestion,
  reduceMotion,
  timeRemainingMs,
  selectedChoiceIds,
  hiddenChoiceIds,
  isAnswered,
  canSubmit,
  isLastQuestion,
  submitting,
  onChoiceSelect,
  onSubmit,
  onAnswer,
  onNext,
  onTextSubmit,
  textAnswer,
  onTextChange,
}: QuestionPanelProps) {
  const renderedPrompt = currentQuestion.prompt
  const questionImageSrc = getQuestionImageSrc(currentQuestion.imageUrl)
  const showHeaderImage = !!questionImageSrc && currentQuestion.type !== 'HOTSPOT'
  const isImageChoice = currentQuestion.choices.some((c) => c.imageUrl)
  const isMapQuestion = currentQuestion.type === 'MAP_SELECT'
  const isHotspotQuestion = currentQuestion.type === 'HOTSPOT'

  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null)
  const [selectedHotspotZoneId, setSelectedHotspotZoneId] = useState<string | null>(null)

  const mapRegion = (currentQuestion.meta as Record<string, string>)?.mapRegion ?? 'europe'

  const handleCountryClick = useCallback(
    (countryId: string) => {
      if (isAnswered) return
      setSelectedCountryId(countryId)
      const matchingChoice = currentQuestion.choices.find(
        (c) => (c.meta as Record<string, string>)?.regionId === countryId
      )
      if (matchingChoice) {
        onChoiceSelect(matchingChoice.id)
      }
    },
    [isAnswered, currentQuestion.choices, onChoiceSelect]
  )

  const handleHotspotZoneClick = useCallback(
    (zoneId: string) => {
      if (isAnswered) return
      setSelectedHotspotZoneId(zoneId)
      // Find the choice whose meta.zoneId matches the clicked zone
      const matchingChoice = currentQuestion.choices.find(
        (c) => (c.meta as Record<string, string>)?.zoneId === zoneId
      )
      if (matchingChoice) {
        // Auto-submit immediately — no need for Submit button
        onAnswer([matchingChoice.id])
      }
    },
    [isAnswered, currentQuestion.choices, onAnswer]
  )

  // Get hotspot data
  const hotspotMeta = currentQuestion.meta as { zones?: HotspotZone[] } | undefined
  const hotspotZones = hotspotMeta?.zones ?? []
  const hotspotImageUrl = currentQuestion.imageUrl ?? ''

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.id}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-6 space-y-4">
          {showHeaderImage ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
              <Image
                loader={imageLoader}
                unoptimized
                src={questionImageSrc!}
                alt={`Question illustration: ${renderedPrompt}`}
                width={1200}
                height={675}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-auto max-h-[320px] w-full object-contain"
              />
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <CountdownRing
              timeLimitSec={currentQuestion.timeLimitSec}
              timeRemainingMs={timeRemainingMs}
            />
            <p className="flex-1 text-xl font-semibold leading-snug">{renderedPrompt}</p>
          </div>
        </div>

        <QuestionTypeHint type={currentQuestion.type} isAnswered={isAnswered} />

        {currentQuestion.type === 'FILL_BLANK' ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="fill-blank-input" className="sr-only">
                Your answer
              </label>
              <input
                id="fill-blank-input"
                type="text"
                aria-label="Your answer"
                value={textAnswer ?? ''}
                onChange={(e) => onTextChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && textAnswer?.trim()) {
                    onTextSubmit?.(textAnswer)
                  }
                }}
                disabled={isAnswered}
                placeholder="Type your answer…"
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              />
            </div>
          </div>
        ) : isMapQuestion ? (
          <div className="space-y-4">
            <MapDisplay
              mapRegion={mapRegion}
              selectedCountryId={selectedCountryId}
              disabled={isAnswered}
              onCountryClick={handleCountryClick}
              className="max-w-lg mx-auto"
            />
            {selectedCountryId && !isAnswered && (
              <p className="text-center text-sm text-muted-foreground">
                You selected:{' '}
                <span className="font-semibold text-foreground">
                  {currentQuestion.choices.find(
                    (c) => (c.meta as Record<string, string>)?.regionId === selectedCountryId
                  )?.text ?? selectedCountryId}
                </span>
              </p>
            )}
          </div>
        ) : isHotspotQuestion ? (
          <div className="space-y-4">
            <HotspotDisplay
              imageUrl={hotspotImageUrl}
              zones={hotspotZones}
              correctZoneId={null}
              selectedZoneId={selectedHotspotZoneId}
              showResult={isAnswered}
              showMarkers={true}
              showNames={false}
              disabled={isAnswered}
              onZoneClick={handleHotspotZoneClick}
              className="mx-auto"
            />
            {selectedHotspotZoneId && !isAnswered && (
              <p className="text-center text-sm text-muted-foreground">
                You selected:{' '}
                <span className="font-semibold text-foreground">
                  {hotspotZones.find((z) => z.id === selectedHotspotZoneId)?.name ??
                    selectedHotspotZoneId}
                </span>
              </p>
            )}
          </div>
        ) : isImageChoice ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.choices
              .filter((c) => !hiddenChoiceIds.includes(c.id))
              .map((choice, idx) => {
                const isSelected = selectedChoiceIds.includes(choice.id)
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => onChoiceSelect(choice.id)}
                    disabled={isAnswered}
                    className={cn(
                      'relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isAnswered
                        ? isSelected
                          ? 'border-quiz-purple bg-quiz-purple/20'
                          : 'border-border bg-muted/30 opacity-60'
                        : isSelected
                          ? 'border-primary bg-primary/10'
                          : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
                    )}
                    aria-label={`Choice ${idx + 1}`}
                    aria-pressed={isSelected}
                  >
                    {choice.imageUrl ? (
                      <Image
                        loader={imageLoader}
                        unoptimized
                        src={choice.imageUrl}
                        alt={`Choice ${idx + 1}`}
                        width={200}
                        height={150}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center rounded-lg bg-muted/30">
                        <span className="text-xs text-muted-foreground">No image</span>
                      </div>
                    )}
                    {choice.text ? (
                      <span className="text-sm font-medium">{choice.text}</span>
                    ) : null}
                  </button>
                )
              })}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {currentQuestion.choices
              .filter((c) => !hiddenChoiceIds.includes(c.id))
              .map((choice, idx) => {
                const isSelected = selectedChoiceIds.includes(choice.id)
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => onChoiceSelect(choice.id)}
                    disabled={isAnswered}
                    className={cn(
                      'flex min-h-[56px] items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      isAnswered
                        ? isSelected
                          ? 'border-quiz-purple bg-quiz-purple/20 text-foreground'
                          : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                        : isSelected
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
                    )}
                    aria-label={`Choice ${idx + 1}: ${choice.text}`}
                    aria-pressed={isSelected}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold">
                      {idx + 1}
                    </span>
                    {choice.text}
                  </button>
                )
              })}
          </div>
        )}

        <AnimatePresence>
          {/* Hotspot: no Submit button, auto-submits on click */}
          {/* Non-hotspot, not answered: show Submit button */}
          {!isHotspotQuestion && !isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end"
            >
              <Button onClick={onSubmit} variant="gradient" disabled={!canSubmit}>
                Submit Answer
                <span className="ml-1 text-xs opacity-70">(Enter / Space)</span>
              </Button>
            </motion.div>
          )}

          {/* Answered: show Next/Finish button */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end"
            >
              <Button onClick={onNext} variant="gradient" disabled={submitting}>
                {isLastQuestion ? 'Finish' : 'Next'}
                <span className="text-xs opacity-70 ml-1">(Enter)</span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

const TYPE_HINTS: Record<string, string> = {
  SINGLE: 'Choose one answer.',
  TRUEFALSE: 'True or false?',
  FILL_BLANK: 'Type your answer below.',
  MAP_SELECT: 'Look at the map and choose the correct answer.',
  HOTSPOT: 'Click on a zone on the image to answer.',
}

function QuestionTypeHint({ type, isAnswered }: { type: string; isAnswered: boolean }) {
  const hint = TYPE_HINTS[type]
  if (!hint || isAnswered) return null
  return <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
}
