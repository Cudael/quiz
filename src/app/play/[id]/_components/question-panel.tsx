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
  onLabelChange?: (positionId: string, value: string) => void
  onSubmit: () => void
  onNext: () => void
  // MATCHING
  pendingMatchId?: string
  matchedPairs?: Array<{ left: string; right: string }>
  // CATEGORIZE
  pendingItemId?: string
  assignments?: Array<{ itemId: string; categoryId: string }>
  // LABEL
  labelAnswers?: Record<string, string>
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
  onLabelChange,
  onSubmit,
  onNext,
  pendingMatchId,
  matchedPairs,
  pendingItemId,
  assignments,
  labelAnswers,
}: QuestionPanelProps) {
  const renderedPrompt =
    currentQuestion.type === 'FILL_BLANK'
      ? renderFillBlankPrompt(currentQuestion.prompt)
      : currentQuestion.prompt
  const questionImageSrc = getQuestionImageSrc(currentQuestion.imageUrl)
  // For LABEL questions, the image is shown inside LabelChoices with position markers
  const showHeaderImage = questionImageSrc && currentQuestion.type !== 'LABEL'

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
        ) : currentQuestion.type === 'ORDERING' ? (
          <OrderingChoices
            choices={currentQuestion.choices}
            selectedChoiceIds={selectedChoiceIds}
            isAnswered={isAnswered}
            onChoiceSelect={onChoiceSelect}
          />
        ) : currentQuestion.type === 'MATCHING' ? (
          <MatchingChoices
            choices={currentQuestion.choices}
            pendingMatchId={pendingMatchId}
            matchedPairs={matchedPairs ?? []}
            isAnswered={isAnswered}
            onChoiceSelect={onChoiceSelect}
          />
        ) : currentQuestion.type === 'CATEGORIZE' ? (
          <CategorizeChoices
            choices={currentQuestion.choices}
            pendingItemId={pendingItemId}
            assignments={assignments ?? []}
            isAnswered={isAnswered}
            onChoiceSelect={onChoiceSelect}
          />
        ) : currentQuestion.type === 'LABEL' ? (
          <LabelChoices
            choices={currentQuestion.choices}
            imageUrl={currentQuestion.imageUrl}
            labelAnswers={labelAnswers ?? {}}
            isAnswered={isAnswered}
            onLabelChange={onLabelChange ?? (() => undefined)}
          />
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

const TYPE_HINTS: Record<string, string> = {
  SINGLE: 'Choose one answer.',
  MULTIPLE: 'Select all answers that apply, then submit.',
  TRUEFALSE: 'Choose True or False.',
  FILL_BLANK: 'Type the missing word or phrase.',
  ORDERING: 'Click the choices in the correct order from first to last.',
  MATCHING: 'Select a left-hand item then select its matching right-hand item to pair them.',
  CATEGORIZE: 'Select each item and assign it to the correct category.',
  LABEL: 'Type the correct label for each marked position on the diagram.',
}

function QuestionTypeHint({ type, isAnswered }: { type: string; isAnswered: boolean }) {
  const hint = TYPE_HINTS[type]
  if (!hint || isAnswered) return null
  return <p className="mb-4 text-sm text-muted-foreground">{hint}</p>
}

// ---------------------------------------------------------------------------
// ORDERING (Timeline) UI
// ---------------------------------------------------------------------------

interface OrderingChoicesProps {
  choices: Question['choices']
  selectedChoiceIds: string[]
  isAnswered: boolean
  onChoiceSelect: (id: string) => void
}

function OrderingChoices({
  choices,
  selectedChoiceIds,
  isAnswered,
  onChoiceSelect,
}: OrderingChoicesProps) {
  return (
    <div className="space-y-2">
      {choices.map((choice) => {
        const seqIndex = selectedChoiceIds.indexOf(choice.id)
        const isSelected = seqIndex !== -1
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onChoiceSelect(choice.id)}
            disabled={isAnswered}
            className={cn(
              'flex w-full min-h-[52px] items-center gap-3 rounded-xl border p-4 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isAnswered
                ? isSelected
                  ? 'border-quiz-purple bg-quiz-purple/20 text-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                : isSelected
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
            )}
            aria-label={`${choice.text}${isSelected ? `, selected position ${seqIndex + 1}` : ''}`}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-current'
              )}
            >
              {isSelected ? seqIndex + 1 : '·'}
            </span>
            {choice.text}
          </button>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// MATCHING UI
// ---------------------------------------------------------------------------

interface MatchingChoicesProps {
  choices: Question['choices']
  pendingMatchId?: string
  matchedPairs: Array<{ left: string; right: string }>
  isAnswered: boolean
  onChoiceSelect: (id: string) => void
}

const PAIR_COLORS = [
  'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'border-purple-500 bg-purple-500/10 text-purple-700 dark:text-purple-300',
  'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300',
  'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300',
  'border-pink-500 bg-pink-500/10 text-pink-700 dark:text-pink-300',
  'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300',
]

function MatchingChoices({
  choices,
  pendingMatchId,
  matchedPairs,
  isAnswered,
  onChoiceSelect,
}: MatchingChoicesProps) {
  const leftChoices = choices.filter(
    (c) => (c.meta as { side?: string } | null | undefined)?.side === 'left'
  )
  const rightChoices = choices.filter(
    (c) => (c.meta as { side?: string } | null | undefined)?.side === 'right'
  )

  function getPairIndex(choiceId: string) {
    return matchedPairs.findIndex((p) => p.left === choiceId || p.right === choiceId)
  }

  function renderColumn(columnChoices: Question['choices']) {
    return columnChoices.map((choice) => {
      const pairIndex = getPairIndex(choice.id)
      const isPaired = pairIndex !== -1
      const isPending = pendingMatchId === choice.id
      const colorClass = isPaired ? PAIR_COLORS[pairIndex % PAIR_COLORS.length] : ''

      return (
        <button
          key={choice.id}
          type="button"
          onClick={() => onChoiceSelect(choice.id)}
          disabled={isAnswered}
          className={cn(
            'flex w-full min-h-[52px] items-center rounded-xl border p-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isAnswered
              ? isPaired
                ? colorClass
                : 'border-border bg-muted/30 text-muted-foreground opacity-60'
              : isPaired
                ? cn('cursor-pointer', colorClass)
                : isPending
                  ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary'
                  : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
          )}
          aria-label={choice.text}
          aria-pressed={isPaired || isPending}
        >
          {isPaired && (
            <span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/20 text-[10px] font-bold">
              {pairIndex + 1}
            </span>
          )}
          {choice.text}
        </button>
      )
    })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Left</p>
        {renderColumn(leftChoices)}
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Right</p>
        {renderColumn(rightChoices)}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// CATEGORIZE UI
// ---------------------------------------------------------------------------

interface CategorizeChoicesProps {
  choices: Question['choices']
  pendingItemId?: string
  assignments: Array<{ itemId: string; categoryId: string }>
  isAnswered: boolean
  onChoiceSelect: (id: string) => void
}

function CategorizeChoices({
  choices,
  pendingItemId,
  assignments,
  isAnswered,
  onChoiceSelect,
}: CategorizeChoicesProps) {
  const categories = choices.filter(
    (c) => (c.meta as { isHeader?: boolean } | null | undefined)?.isHeader
  )
  const items = choices.filter(
    (c) => !(c.meta as { isHeader?: boolean } | null | undefined)?.isHeader
  )

  function getAssignedCategory(itemId: string) {
    return assignments.find((a) => a.itemId === itemId)?.categoryId
  }

  function getCategoryLabel(categoryId: string) {
    return (
      categories.find(
        (c) => (c.meta as { category?: string } | null | undefined)?.category === categoryId
      )?.text ?? categoryId
    )
  }

  return (
    <div className="space-y-4">
      {/* Category buckets */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const catId = (cat.meta as { category?: string } | null | undefined)?.category ?? cat.id
          const assignedItems = assignments.filter((a) => a.categoryId === catId)
          const isPendingTarget = !!pendingItemId
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onChoiceSelect(cat.id)}
              disabled={isAnswered || !isPendingTarget}
              className={cn(
                'flex min-w-[100px] flex-col items-center gap-1 rounded-xl border-2 p-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isAnswered
                  ? 'border-border bg-muted/20 text-muted-foreground'
                  : isPendingTarget
                    ? 'cursor-pointer border-primary bg-primary/10 text-primary hover:bg-primary/20'
                    : 'border-border bg-muted/10 text-foreground'
              )}
              aria-label={`Category: ${cat.text} (${assignedItems.length} items)`}
            >
              {cat.text}
              {assignedItems.length > 0 && (
                <span className="text-xs font-normal opacity-70">
                  {assignedItems.length} item{assignedItems.length !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Items */}
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item) => {
          const assigned = getAssignedCategory(item.id)
          const isPending = pendingItemId === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChoiceSelect(item.id)}
              disabled={isAnswered}
              className={cn(
                'flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isAnswered
                  ? assigned
                    ? 'border-quiz-green/40 bg-quiz-green/10 text-foreground'
                    : 'border-border bg-muted/30 text-muted-foreground opacity-60'
                  : isPending
                    ? 'border-primary bg-primary/10 text-foreground ring-2 ring-primary'
                    : assigned
                      ? 'cursor-pointer border-quiz-green/40 bg-quiz-green/10 text-foreground hover:border-primary'
                      : 'cursor-pointer border-border bg-card hover:border-primary hover:bg-primary/5'
              )}
              aria-label={`${item.text}${assigned ? `, assigned to ${getCategoryLabel(assigned)}` : ''}`}
              aria-pressed={isPending}
            >
              <span>{item.text}</span>
              {assigned && (
                <span className="ml-2 shrink-0 rounded-full bg-quiz-green/20 px-2 py-0.5 text-xs text-quiz-green">
                  {getCategoryLabel(assigned)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// LABEL UI
// ---------------------------------------------------------------------------

interface LabelChoicesProps {
  choices: Question['choices']
  imageUrl?: string | null
  labelAnswers: Record<string, string>
  isAnswered: boolean
  onLabelChange: (positionId: string, value: string) => void
}

function LabelChoices({
  choices,
  imageUrl,
  labelAnswers,
  isAnswered,
  onLabelChange,
}: LabelChoicesProps) {
  const imageSrc = getQuestionImageSrc(imageUrl)

  return (
    <div className="space-y-4">
      {imageSrc && (
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-muted/20">
          <Image
            loader={imageLoader}
            unoptimized
            src={imageSrc}
            alt="Diagram to label"
            width={1200}
            height={675}
            sizes="(max-width: 768px) 100vw, 768px"
            className="h-auto max-h-[320px] w-full object-contain"
          />
          {choices.map((choice) => {
            const x = (choice.meta as { x?: number } | null | undefined)?.x ?? 50
            const y = (choice.meta as { y?: number } | null | undefined)?.y ?? 50
            return (
              <span
                key={choice.id}
                className="absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
                style={{ left: `${x}%`, top: `${y}%` }}
                aria-hidden="true"
              >
                ●
              </span>
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        {choices.map((choice, idx) => {
          const x = (choice.meta as { x?: number } | null | undefined)?.x ?? 0
          const y = (choice.meta as { y?: number } | null | undefined)?.y ?? 0
          return (
            <div key={choice.id} className="flex items-center gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {idx + 1}
              </span>
              {imageSrc && (
                <span className="text-xs text-muted-foreground">
                  ({Math.round(x)}%, {Math.round(y)}%)
                </span>
              )}
              <input
                type="text"
                value={labelAnswers[choice.id] ?? ''}
                onChange={(e) => onLabelChange(choice.id, e.target.value)}
                disabled={isAnswered}
                autoComplete="off"
                spellCheck={false}
                placeholder={`Label ${idx + 1}`}
                className={cn(
                  'flex-1 rounded-xl border bg-card px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isAnswered ? 'border-border bg-muted/30 text-muted-foreground' : 'border-border'
                )}
                aria-label={`Label for position ${idx + 1}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
