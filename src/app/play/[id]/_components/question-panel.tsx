import Image from 'next/image'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AnswerFeedback, Question } from '../play-view.types'
import { getQuestionImageSrc, imageLoader } from '../play-view.utils'
import { CountdownRing } from './countdown-ring'
import { HotspotDisplay } from './hotspot-display'
import type { HotspotZone } from './hotspot-display'
import { OrderQuestion } from './order-question'
import { MatchQuestion } from './match-question'
import { NumberGuessQuestion } from './number-guess-question'
import { GroupsQuestion } from './groups-question'
import { AnagramQuestion } from './anagram-question'
import { AudioClipPlayer } from './audio-clip-player'
import { ImageReveal } from './image-reveal'
import { MemoryFlashStudy } from './memory-flash-study'

interface QuestionPanelProps {
  currentQuestion: Question
  reduceMotion: boolean | null
  timeRemainingMs: number
  quizTimeLimitSec?: number | null
  selectedChoiceIds: string[]
  hiddenChoiceIds: string[]
  isAnswered: boolean
  /** Server feedback for the current question; undefined while in flight. */
  feedback?: AnswerFeedback
  canSubmit: boolean
  isLastQuestion: boolean
  submitting: boolean
  onChoiceSelect: (choiceId: string) => void
  onSubmit: () => void
  onAnswer: (
    choiceIds: string[],
    timeout?: boolean,
    extras?: {
      textAnswer?: string
      numberAnswer?: number
      pairs?: Array<{ leftId: string; rightId: string }>
      groups?: string[][]
    }
  ) => void
  onProbeGroup: (choiceIds: string[]) => Promise<{ match: boolean; label: string | null }>
  onNext: () => void
  onTextSubmit?: (text: string) => void
  textAnswer?: string
  onTextChange?: (text: string) => void
}

export function QuestionPanel({
  currentQuestion,
  reduceMotion,
  timeRemainingMs,
  quizTimeLimitSec,
  selectedChoiceIds,
  hiddenChoiceIds,
  isAnswered,
  feedback,
  canSubmit,
  isLastQuestion,
  submitting,
  onChoiceSelect,
  onSubmit,
  onAnswer,
  onProbeGroup,
  onNext,
  onTextSubmit,
  textAnswer,
  onTextChange,
}: QuestionPanelProps) {
  const reveal = feedback?.reveal
  const renderedPrompt = currentQuestion.prompt
  const questionImageSrc = getQuestionImageSrc(currentQuestion.imageUrl)
  const showHeaderImage = !!questionImageSrc && currentQuestion.type !== 'HOTSPOT'
  const isImageChoice = currentQuestion.choices.some((c) => c.imageUrl)
  const isHotspotQuestion = currentQuestion.type === 'HOTSPOT'

  const questionMeta = (currentQuestion.meta ?? {}) as Record<string, unknown>
  const isOrderQuestion = currentQuestion.type === 'ORDER'
  const isMatchQuestion = currentQuestion.type === 'MATCH'
  const isNumberGuessQuestion = currentQuestion.type === 'NUMBER_GUESS'
  const isGroupsQuestion = currentQuestion.type === 'GROUPS'
  const isAnagramQuestion = currentQuestion.type === 'FILL_BLANK' && questionMeta.anagram === true
  const hasOwnSubmit =
    isOrderQuestion ||
    isMatchQuestion ||
    isNumberGuessQuestion ||
    isGroupsQuestion ||
    isAnagramQuestion
  const audioUrl = typeof questionMeta.audioUrl === 'string' ? questionMeta.audioUrl : null
  const revealMode = typeof questionMeta.reveal === 'string' ? questionMeta.reveal : null
  const studyDurationMs =
    typeof questionMeta.studyDurationMs === 'number' && questionMeta.studyDurationMs > 0
      ? questionMeta.studyDurationMs
      : null

  const [studyDoneForQuestionId, setStudyDoneForQuestionId] = useState<string | null>(null)
  const inStudyPhase =
    studyDurationMs !== null && !isAnswered && studyDoneForQuestionId !== currentQuestion.id

  const [selectedHotspotZoneId, setSelectedHotspotZoneId] = useState<string | null>(null)
  const [completedZoneIds, setCompletedZoneIds] = useState<string[]>([])
  const [fadingZoneIds, setFadingZoneIds] = useState<string[]>([])

  const handleHotspotZoneClick = useCallback(
    (zoneId: string) => {
      if (isAnswered) return
      setSelectedHotspotZoneId(zoneId)
      const matchingChoice = currentQuestion.choices.find(
        (c) => (c.meta as Record<string, string>)?.zoneId === zoneId
      )
      if (matchingChoice) {
        onAnswer([matchingChoice.id])
      }
    },
    [isAnswered, currentQuestion.choices, onAnswer]
  )

  // Correct-pick fade runs once server feedback confirms the click was right.
  const hotspotFeedbackHandledRef = useRef<string | null>(null)
  useEffect(() => {
    if (currentQuestion.type !== 'HOTSPOT' || !isAnswered || !reveal) return
    if (hotspotFeedbackHandledRef.current === currentQuestion.id) return
    hotspotFeedbackHandledRef.current = currentQuestion.id
    const correctZone = reveal.correctZoneId
    if (correctZone && selectedHotspotZoneId === correctZone) {
      // Scheduled as timeouts (not synchronous setState) so the effect body
      // never triggers a cascading render.
      setTimeout(() => {
        setFadingZoneIds((prev) => (prev.includes(correctZone) ? prev : [...prev, correctZone]))
      }, 0)
      setTimeout(() => {
        setFadingZoneIds((prev) => prev.filter((id) => id !== correctZone))
        setCompletedZoneIds((prev) => (prev.includes(correctZone) ? prev : [...prev, correctZone]))
      }, 800)
    }
  }, [currentQuestion.type, currentQuestion.id, isAnswered, reveal, selectedHotspotZoneId])

  // Get hotspot data — exclude completed zones (fading zones are still visible)
  const hotspotMeta = currentQuestion.meta as { zones?: HotspotZone[] } | undefined
  const allHotspotZones = useMemo(() => hotspotMeta?.zones ?? [], [hotspotMeta?.zones])
  const hotspotZones = useMemo(
    () => allHotspotZones.filter((z) => !completedZoneIds.includes(z.id)),
    [allHotspotZones, completedZoneIds]
  )
  const hotspotImageUrl = currentQuestion.imageUrl ?? ''

  // Derive effective selected zone — only valid if it exists in current question
  const effectiveSelectedZoneId = useMemo(() => {
    if (!selectedHotspotZoneId) return null
    return hotspotZones.some((z) => z.id === selectedHotspotZoneId) ? selectedHotspotZoneId : null
  }, [selectedHotspotZoneId, hotspotZones])

  // Correct zone comes from server feedback, revealed only after answering.
  const correctZoneId = reveal?.correctZoneId ?? null

  // Use quiz-level time limit if available, otherwise per-question
  const effectiveTimeLimitSec = quizTimeLimitSec ?? currentQuestion.timeLimitSec

  // Hotspot: image stays static, prompt/zones update instantly
  if (isHotspotQuestion) {
    return (
      <div>
        {/* Static image — stays mounted across questions */}
        <div className="mb-4">
          <HotspotDisplay
            imageUrl={hotspotImageUrl}
            zones={hotspotZones}
            correctZoneId={correctZoneId}
            selectedZoneId={effectiveSelectedZoneId}
            showResult={isAnswered}
            showMarkers={true}
            showNames={false}
            fadingZoneIds={fadingZoneIds}
            disabled={isAnswered}
            onZoneClick={handleHotspotZoneClick}
            className="mx-auto"
          />
        </div>

        {/* Prompt + timer — updates instantly */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-4">
            <CountdownRing timeLimitSec={effectiveTimeLimitSec} timeRemainingMs={timeRemainingMs} />
            <p className="flex-1 text-xl font-semibold leading-snug">{renderedPrompt}</p>
          </div>
        </div>

        {/* Zone hint */}
        {!isAnswered && (
          <p className="mb-4 text-sm text-muted-foreground">
            Click on a zone on the image to answer.
          </p>
        )}

        {/* Result feedback — waits for the server reveal */}
        {isAnswered && !reveal && (
          <p className="mb-4 text-center text-sm text-muted-foreground" aria-live="polite">
            Checking…
          </p>
        )}
        {isAnswered && reveal && (
          <p className="mb-4 text-center text-sm font-medium" aria-live="polite">
            {selectedHotspotZoneId === correctZoneId ? (
              <span className="text-emerald-700 dark:text-emerald-400">
                Correct! {allHotspotZones.find((z) => z.id === correctZoneId)?.name ?? ''}
              </span>
            ) : (
              <span className="text-destructive">
                {selectedHotspotZoneId
                  ? `You clicked ${allHotspotZones.find((z) => z.id === selectedHotspotZoneId)?.name ?? 'a zone'} — `
                  : 'Time ran out — '}
                the correct answer was{' '}
                <span className="font-semibold">
                  {allHotspotZones.find((z) => z.id === correctZoneId)?.name ?? 'another zone'}
                </span>
                .
              </span>
            )}
          </p>
        )}

        {/* Next/Finish button */}
        {isAnswered && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onNext} variant="accent" disabled={submitting}>
              {isLastQuestion ? 'Finish' : 'Next'}
              <span className="text-xs opacity-70 ml-1">(Enter)</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Non-hotspot questions: use AnimatePresence as before
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentQuestion.id}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40 }}
        transition={{ duration: 0.25 }}
      >
        {inStudyPhase ? (
          <MemoryFlashStudy
            studyText={
              typeof questionMeta.studyText === 'string' ? questionMeta.studyText : undefined
            }
            studyImageUrl={
              typeof questionMeta.studyImageUrl === 'string'
                ? questionMeta.studyImageUrl
                : undefined
            }
            studyDurationMs={studyDurationMs!}
            onDone={() => setStudyDoneForQuestionId(currentQuestion.id)}
          />
        ) : (
          <>
            <div className="mb-6 space-y-4">
              {showHeaderImage ? (
                revealMode ? (
                  <ImageReveal
                    src={questionImageSrc!}
                    alt={`Question illustration: ${renderedPrompt}`}
                    mode={revealMode}
                    progress={
                      1 - Math.min(1, Math.max(0, timeRemainingMs / (effectiveTimeLimitSec * 1000)))
                    }
                    revealed={isAnswered}
                  />
                ) : (
                  <div className="relative overflow-hidden rounded-md border border-border/60 bg-muted/20">
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
                )
              ) : null}

              <div className="flex items-center gap-4">
                <CountdownRing
                  timeLimitSec={effectiveTimeLimitSec}
                  timeRemainingMs={timeRemainingMs}
                />
                <p className="flex-1 text-xl font-semibold leading-snug">{renderedPrompt}</p>
              </div>

              {audioUrl ? <AudioClipPlayer src={audioUrl} /> : null}
            </div>

            <QuestionTypeHint
              type={isAnagramQuestion ? 'ANAGRAM' : currentQuestion.type}
              isAnswered={isAnswered}
            />

            {isOrderQuestion ? (
              <OrderQuestion
                choices={currentQuestion.choices}
                isAnswered={isAnswered}
                positions={reveal?.positions}
                onSubmit={(orderedIds) => onAnswer(orderedIds)}
              />
            ) : isMatchQuestion ? (
              <MatchQuestion
                choices={currentQuestion.choices}
                isAnswered={isAnswered}
                correctPairs={reveal?.correctPairs}
                onSubmit={(pairs) => onAnswer([], false, { pairs })}
              />
            ) : isNumberGuessQuestion ? (
              <NumberGuessQuestion
                question={currentQuestion}
                isAnswered={isAnswered}
                feedback={feedback}
                onSubmit={(value) => onAnswer([], false, { numberAnswer: value })}
              />
            ) : isGroupsQuestion ? (
              <GroupsQuestion
                question={currentQuestion}
                isAnswered={isAnswered}
                revealGroups={reveal?.groups}
                onProbe={onProbeGroup}
                onSubmit={(groups) => onAnswer([], false, { groups })}
              />
            ) : isAnagramQuestion ? (
              <AnagramQuestion
                question={currentQuestion}
                isAnswered={isAnswered}
                feedback={feedback}
                onSubmit={(text) => onAnswer([], false, { textAnswer: text })}
              />
            ) : currentQuestion.type === 'FILL_BLANK' ? (
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
                    className="w-full rounded-md border border-border bg-card px-4 py-3 text-base font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 md:text-sm"
                  />
                </div>
                {isAnswered ? <FillBlankResult feedback={feedback} /> : null}
              </div>
            ) : isImageChoice ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {currentQuestion.choices
                  .filter((c) => !hiddenChoiceIds.includes(c.id))
                  .map((choice, idx) => {
                    const isSelected = selectedChoiceIds.includes(choice.id)
                    const isCorrect = reveal?.correctChoiceIds.includes(choice.id) === true
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => onChoiceSelect(choice.id)}
                        disabled={isAnswered}
                        className={cn(
                          'relative flex flex-col items-center gap-2 overflow-hidden rounded-md border p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isAnswered
                            ? reveal
                              ? isSelected
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-semibold'
                                  : 'border-destructive bg-destructive/15 text-destructive font-semibold'
                                : isCorrect
                                  ? 'border-emerald-500/70 border-dashed bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold'
                                  : 'border-border bg-muted/40 opacity-40 text-muted-foreground'
                              : isSelected
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-muted/40 opacity-60'
                            : isSelected
                              ? 'border-primary bg-primary/10'
                              : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
                        )}
                        aria-label={
                          choice.text ? `Choice ${idx + 1}: ${choice.text}` : `Choice ${idx + 1}`
                        }
                        aria-pressed={isSelected}
                      >
                        {choice.imageUrl ? (
                          <Image
                            loader={imageLoader}
                            unoptimized
                            src={choice.imageUrl}
                            alt={choice.text || `Choice ${idx + 1}`}
                            width={200}
                            height={150}
                            className="h-32 w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-32 w-full items-center justify-center rounded-md bg-muted/30">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                        {choice.text ? (
                          <span className="text-sm font-medium">{choice.text}</span>
                        ) : null}
                        {isAnswered && reveal && (isCorrect || isSelected) ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold">
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                            )}
                            {isCorrect ? 'Correct answer' : 'Your answer'}
                          </span>
                        ) : null}
                        {isAnswered && reveal?.choiceValues[choice.id] ? (
                          <span className="rounded-sm bg-background/70 px-2 py-0.5 text-xs font-bold tabular-nums">
                            {reveal.choiceValues[choice.id]}
                          </span>
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
                    const isCorrect = reveal?.correctChoiceIds.includes(choice.id) === true
                    return (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => onChoiceSelect(choice.id)}
                        disabled={isAnswered}
                        className={cn(
                          'flex min-h-[56px] items-center gap-3 rounded-md border p-4 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          isAnswered
                            ? reveal
                              ? isSelected
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 font-semibold'
                                  : 'border-destructive bg-destructive/15 text-destructive font-semibold'
                                : isCorrect
                                  ? 'border-emerald-500/70 border-dashed bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 font-semibold'
                                  : 'border-border bg-muted/40 text-muted-foreground opacity-40'
                              : isSelected
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border bg-muted/40 opacity-60'
                            : isSelected
                              ? 'border-primary bg-primary/10 text-foreground'
                              : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
                        )}
                        aria-label={`Choice ${idx + 1}: ${choice.text}`}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border text-xs font-bold transition-colors',
                            isAnswered && reveal
                              ? isSelected
                                ? isCorrect
                                  ? 'border-emerald-500 bg-emerald-500 text-primary-foreground'
                                  : 'border-destructive bg-destructive text-destructive-foreground'
                                : isCorrect
                                  ? 'border-emerald-500/70 text-emerald-600 dark:text-emerald-400'
                                  : 'border-border text-muted-foreground'
                              : isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border'
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="min-w-0 flex-1">{choice.text}</span>
                        {isAnswered && reveal && (isCorrect || isSelected) ? (
                          <span
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold"
                            aria-label={isCorrect ? 'Correct answer' : 'Your incorrect answer'}
                          >
                            {isCorrect ? (
                              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <XCircle className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="hidden md:inline">
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </span>
                        ) : null}
                        {isAnswered && reveal?.choiceValues[choice.id] ? (
                          <span className="shrink-0 rounded-sm bg-background/70 px-2 py-0.5 text-xs font-bold tabular-nums">
                            {reveal.choiceValues[choice.id]}
                          </span>
                        ) : null}
                      </button>
                    )
                  })}
              </div>
            )}

            <AnimatePresence>
              {!isAnswered && !hasOwnSubmit && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-end"
                >
                  <Button onClick={onSubmit} variant="accent" disabled={!canSubmit}>
                    Submit Answer
                    <span className="ml-1 hidden text-xs opacity-70 sm:inline">
                      (Enter / Space)
                    </span>
                  </Button>
                </motion.div>
              )}

              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-end"
                >
                  <Button onClick={onNext} variant="accent" disabled={submitting}>
                    {isLastQuestion ? 'Finish' : 'Next'}
                    <span className="ml-1 hidden text-xs opacity-70 sm:inline">(Enter)</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

/** Post-answer feedback for FILL_BLANK questions, driven by server reveal. */
function FillBlankResult({ feedback }: { feedback?: AnswerFeedback }) {
  if (!feedback) {
    return <p className="text-sm text-muted-foreground">Checking…</p>
  }

  const answerText = feedback.reveal.acceptedAnswers[0]
  return (
    <div
      className={cn(
        'rounded-md border p-3 text-sm font-medium',
        feedback.isCorrect
          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
          : 'border-destructive bg-destructive/10 text-destructive'
      )}
    >
      {feedback.isCorrect ? (
        'Correct!'
      ) : answerText ? (
        <>
          Correct answer: <span className="font-bold">{answerText}</span>
        </>
      ) : (
        'Not quite.'
      )}
    </div>
  )
}

const TYPE_HINTS: Record<string, string> = {
  SINGLE: 'Choose one answer.',
  TRUEFALSE: 'True or false?',
  FILL_BLANK: 'Type your answer below.',
  HOTSPOT: 'Click on a zone on the image to answer.',
  ORDER: 'Arrange the items in the correct order (top = first).',
  MATCH: 'Match each item on the left with its partner on the right.',
  NUMBER_GUESS: 'Take your best guess — the closer you are, the more points you earn.',
  GROUPS: 'Find the groups of related items.',
  ANAGRAM: 'Unscramble the letters to form the answer.',
}

function QuestionTypeHint({ type, isAnswered }: { type: string; isAnswered: boolean }) {
  const hint = TYPE_HINTS[type]
  if (!hint || isAnswered) return null
  return <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
}
