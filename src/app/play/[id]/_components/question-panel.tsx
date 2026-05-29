import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { renderFillBlankPrompt } from '@/domain/quiz-constants'
import { cn } from '@/lib/utils'
import type { Question } from '../play-view.types'
import { getQuestionImageSrc, imageLoader } from '../play-view.utils'
import { CountdownRing } from './countdown-ring'

interface QuestionPanelProps {
  currentQuestion: Question
  reduceMotion: boolean | null
  timeRemainingMs: number
  selectedChoiceIds: string[]
  hiddenChoiceIds: string[]
  fillBlankValue: string
  onFillBlankChange: (value: string) => void
  isAnswered: boolean
  canSubmit: boolean
  isLastQuestion: boolean
  onChoiceSelect: (choiceId: string) => void
  onSubmit: () => void
  onNext: () => void
}

export function QuestionPanel({
  currentQuestion,
  reduceMotion,
  timeRemainingMs,
  selectedChoiceIds,
  hiddenChoiceIds,
  fillBlankValue,
  onFillBlankChange,
  isAnswered,
  canSubmit,
  isLastQuestion,
  onChoiceSelect,
  onSubmit,
  onNext,
}: QuestionPanelProps) {
  const renderedPrompt =
    currentQuestion.type === 'FILL_BLANK'
      ? renderFillBlankPrompt(currentQuestion.prompt)
      : currentQuestion.prompt
  const questionImageSrc = getQuestionImageSrc(currentQuestion.imageUrl)

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
          {questionImageSrc ? (
            <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
              <Image
                loader={imageLoader}
                unoptimized
                src={questionImageSrc}
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

        {currentQuestion.type === 'FILL_BLANK' ? (
          <div className="space-y-3">
            <label htmlFor={`fill-blank-${currentQuestion.id}`} className="text-sm font-medium">
              Your answer
            </label>
            <input
              id={`fill-blank-${currentQuestion.id}`}
              type="text"
              value={fillBlankValue}
              onChange={(event) => onFillBlankChange(event.target.value)}
              disabled={isAnswered}
              autoComplete="off"
              spellCheck={false}
              className={cn(
                'w-full rounded-xl border bg-card px-4 py-3 text-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isAnswered ? 'border-border bg-muted/30 text-muted-foreground' : 'border-border'
              )}
              placeholder="Type your answer"
              aria-describedby={`fill-blank-help-${currentQuestion.id}`}
            />
            <p
              id={`fill-blank-help-${currentQuestion.id}`}
              className="text-xs text-muted-foreground"
            >
              Press Enter to submit your answer.
            </p>
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
          {!isAnswered && (
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

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 flex justify-end"
            >
              <Button onClick={onNext} variant="gradient">
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
