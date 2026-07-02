'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { copy } from '@/lib/copy'
import { imageLoader } from '../../play-view.utils'
import type { ResultAnswer, ResultChoice, ResultQuestion } from '../results.types'

interface QuestionBreakdownProps {
  questions: ResultQuestion[]
  answers: ResultAnswer[]
}

/** Question types whose answers are not a plain choice selection. */
const SUMMARY_TYPES = new Set(['ORDER', 'MATCH', 'GROUPS', 'NUMBER_GUESS', 'FILL_BLANK'])

function metaRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
}

function choiceTextById(question: ResultQuestion, id: string): string {
  return question.choices.find((c) => c.id === id)?.text ?? '?'
}

/** Human-readable "correct answer" line for format-specific question types. */
function correctSummaryFor(question: ResultQuestion): string {
  const meta = metaRecord(question.meta)
  switch (question.type) {
    case 'ORDER':
      return [...question.choices]
        .sort(
          (a, b) =>
            (Number(metaRecord(a.meta).position) || 0) - (Number(metaRecord(b.meta).position) || 0)
        )
        .map((c) => c.text)
        .join(' → ')
    case 'MATCH': {
      const left = question.choices.filter((c) => metaRecord(c.meta).side === 'L')
      return left
        .map((l) => {
          const partner = question.choices.find(
            (c) =>
              metaRecord(c.meta).side === 'R' &&
              metaRecord(c.meta).matchKey === metaRecord(l.meta).matchKey
          )
          return `${l.text} ↔ ${partner?.text ?? '?'}`
        })
        .join(', ')
    }
    case 'GROUPS': {
      const groups = Array.isArray(meta.groups) ? meta.groups : []
      return groups
        .map((g) => {
          const group = metaRecord(g)
          const tiles = question.choices
            .filter((c) => metaRecord(c.meta).groupKey === group.key)
            .map((c) => c.text)
            .join(', ')
          return `${typeof group.label === 'string' && group.label ? group.label : 'Group'}: ${tiles}`
        })
        .join(' • ')
    }
    case 'NUMBER_GUESS': {
      const answer = meta.answer
      const unit = typeof meta.unit === 'string' && meta.unit ? ` ${meta.unit}` : ''
      return typeof answer === 'number' ? `${answer.toLocaleString()}${unit}` : ''
    }
    case 'FILL_BLANK': {
      const accepted = Array.isArray(meta.acceptedAnswers)
        ? meta.acceptedAnswers.filter((a): a is string => typeof a === 'string')
        : question.choices.filter((c) => c.isCorrect).map((c) => c.text)
      const list = Array.isArray(meta.answers)
        ? meta.answers
            .map((entry) => metaRecord(entry).label)
            .filter((l): l is string => typeof l === 'string')
        : []
      return list.length > 0 ? list.join(', ') : accepted.join(', ')
    }
    default:
      return ''
  }
}

/** Player's submitted answer, decoded from the persisted chosenIds encoding. */
function givenSummaryFor(question: ResultQuestion, chosenIds: string[]): string {
  switch (question.type) {
    case 'ORDER':
      return chosenIds.map((id) => choiceTextById(question, id)).join(' → ')
    case 'MATCH':
      return chosenIds
        .map((encoded) => {
          const [leftId, rightId] = encoded.split('::')
          return `${choiceTextById(question, leftId)} ↔ ${choiceTextById(question, rightId)}`
        })
        .join(', ')
    case 'GROUPS':
      return chosenIds
        .map((encoded) =>
          encoded
            .split('|')
            .map((id) => choiceTextById(question, id))
            .join(', ')
        )
        .join(' • ')
    case 'NUMBER_GUESS': {
      const guess = Number(chosenIds[0])
      const unit =
        typeof metaRecord(question.meta).unit === 'string'
          ? ` ${metaRecord(question.meta).unit}`
          : ''
      return Number.isFinite(guess) ? `${guess.toLocaleString()}${unit}` : '—'
    }
    case 'FILL_BLANK':
      return chosenIds.join(', ') || '—'
    default:
      return ''
  }
}

/** Determine per-choice correctness for format-specific types using meta fields. */
function isChoiceCorrect(
  choice: ResultChoice,
  allChoices: ResultChoice[],
  questionType: string
): boolean {
  // Classic types use the isCorrect flag directly
  if (!['ORDERING', 'MATCHING', 'CATEGORIZE', 'LABEL'].includes(questionType)) {
    return choice.isCorrect
  }

  const meta = choice.meta

  if (questionType === 'ORDERING') {
    const sorted = [...allChoices].sort(
      (a, b) =>
        ((a.meta as { order?: number } | null)?.order ?? 0) -
        ((b.meta as { order?: number } | null)?.order ?? 0)
    )
    const choiceIndex = allChoices.indexOf(choice)
    const sortedIndex = sorted.indexOf(choice)
    return choiceIndex === sortedIndex
  }

  if (questionType === 'MATCHING') {
    const m = meta as { pairKey?: string; side?: string } | null
    return !!m?.pairKey
  }

  if (questionType === 'CATEGORIZE') {
    const m = meta as { isHeader?: boolean } | null
    return !!m?.isHeader
  }

  if (questionType === 'LABEL') {
    return true
  }

  return choice.isCorrect
}

export function QuestionBreakdown({ questions, answers }: QuestionBreakdownProps) {
  const [filter, setFilter] = useState<'all' | 'incorrect'>('all')
  const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]))
  const incorrectCount = questions.filter((question) => {
    const answer = answersByQuestionId.get(question.id)
    return answer && !answer.isCorrect
  }).length
  const visibleQuestions =
    filter === 'incorrect'
      ? questions.filter((question) => {
          const answer = answersByQuestionId.get(question.id)
          return answer && !answer.isCorrect
        })
      : questions

  return (
    <Card className="mb-8">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Question Breakdown</CardTitle>
        {incorrectCount > 0 && (
          <div className="flex rounded-md border bg-background p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                filter === 'all' ? 'bg-foreground text-background' : 'text-muted-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('incorrect')}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                filter === 'incorrect' ? 'bg-foreground text-background' : 'text-muted-foreground'
              }`}
            >
              Incorrect ({incorrectCount})
            </button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleQuestions.map((q) => {
          const idx = questions.findIndex((question) => question.id === q.id)
          const isSummaryType = SUMMARY_TYPES.has(q.type)
          const correctText = isSummaryType
            ? correctSummaryFor(q)
            : q.choices
                .filter((c) => isChoiceCorrect(c, q.choices, q.type))
                .map((c) => c.text || (c.imageUrl ? 'Image' : ''))
                .filter(Boolean)
                .join(', ')
          const isImageChoice = q.choices.some((c) => c.imageUrl)
          const displayPrompt = q.prompt
          const answer = answersByQuestionId.get(q.id) ?? null
          const chosenIds = new Set(answer?.chosenIds ?? [])
          const hasAnswerData = answer !== null
          const isCorrectAnswer = answer?.isCorrect === true
          const statusIcon = !hasAnswerData ? (
            <MinusCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : isCorrectAnswer ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-quiz-green" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          )
          const containerClassName = !hasAnswerData
            ? 'border-border'
            : isCorrectAnswer
              ? 'border-quiz-green/40 bg-quiz-green/5'
              : 'border-destructive/40 bg-destructive/5'

          return (
            <div key={q.id} className={`rounded-md border p-3 ${containerClassName}`}>
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-muted text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                {statusIcon}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium leading-snug">{displayPrompt}</p>
                    {hasAnswerData ? (
                      <span
                        className={`text-xs font-semibold ${
                          isCorrectAnswer ? 'text-quiz-green' : 'text-destructive'
                        }`}
                      >
                        {isCorrectAnswer ? 'Correct' : 'Incorrect'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        Legacy session
                      </span>
                    )}
                  </div>

                  {hasAnswerData ? (
                    isSummaryType ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Your answer:{' '}
                        <span className="font-medium text-foreground">
                          {givenSummaryFor(q, answer?.chosenIds ?? [])}
                        </span>
                      </p>
                    ) : isImageChoice ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {q.choices.map((choice, choiceIdx) => {
                          const isChosen = chosenIds.has(choice.id)
                          const correct = isChoiceCorrect(choice, q.choices, q.type)

                          return (
                            <div
                              key={choice.id}
                              className={`relative flex flex-col overflow-hidden rounded-md border text-xs ${
                                correct
                                  ? 'border-quiz-green/40 bg-quiz-green/10'
                                  : isChosen
                                    ? 'border-destructive/40 bg-destructive/10'
                                    : 'border-border bg-background/80'
                              }`}
                            >
                              {choice.imageUrl ? (
                                <Image
                                  loader={imageLoader}
                                  unoptimized
                                  src={choice.imageUrl}
                                  alt={`Choice ${choiceIdx + 1}`}
                                  width={200}
                                  height={150}
                                  className="aspect-[4/3] w-full object-cover"
                                />
                              ) : (
                                <div className="flex aspect-[4/3] w-full items-center justify-center bg-muted/30">
                                  <span className="text-muted-foreground">No image</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                                {choice.text ? (
                                  <span className="truncate">{choice.text}</span>
                                ) : (
                                  <span />
                                )}
                                <span className="shrink-0 font-semibold">
                                  {isChosen && correct && (
                                    <span className="text-quiz-green">Selected • Correct</span>
                                  )}
                                  {isChosen && !correct && (
                                    <span className="text-destructive">Wrong</span>
                                  )}
                                  {!isChosen && correct && (
                                    <span className="text-quiz-green">Correct</span>
                                  )}
                                  {!isChosen && !correct && (
                                    <span className="text-muted-foreground">Incorrect</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {q.choices.map((choice) => {
                          const isChosen = chosenIds.has(choice.id)
                          const correct = isChoiceCorrect(choice, q.choices, q.type)

                          return (
                            <div
                              key={choice.id}
                              className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs ${
                                correct
                                  ? 'border-quiz-green/40 bg-quiz-green/10'
                                  : isChosen
                                    ? 'border-destructive/40 bg-destructive/10'
                                    : 'border-border bg-background/80'
                              }`}
                            >
                              <span>{choice.text}</span>
                              <span className="shrink-0 font-semibold">
                                {isChosen && correct && (
                                  <span className="text-quiz-green">Selected • Correct</span>
                                )}
                                {isChosen && !correct && (
                                  <span className="text-destructive">Wrong</span>
                                )}
                                {!isChosen && correct && (
                                  <span className="text-quiz-green">Correct</span>
                                )}
                                {!isChosen && !correct && (
                                  <span className="text-muted-foreground">Incorrect</span>
                                )}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Answer details are unavailable for this session.
                    </p>
                  )}
                </div>
              </div>
              <p className="pl-7 text-xs text-muted-foreground">
                {hasAnswerData && !isCorrectAnswer
                  ? copy.quiz.wrongAnswer(correctText)
                  : `Accepted answer${correctText.includes(',') ? 's' : ''}: ${correctText}`}
              </p>
              {q.explanation && (
                <p className="mt-1 pl-7 text-xs italic text-muted-foreground">{q.explanation}</p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
