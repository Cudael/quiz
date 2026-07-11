'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileDown,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { formatCorrectAnswer } from '@/domain/format-correct-answer'
import { formatRelativeTime } from '@/lib/time'
import { factCheckQuiz } from '../../actions'
import { FactCheckBadge } from '../../_components/fact-check-badge'
import type { FactCheckVerdict, LatestFactCheck } from '@/server/fact-check-utils'

/** Drafts with more questions than this are collapsed by default. */
const AUTO_COLLAPSE_QUESTION_THRESHOLD = 8
/** Choices beyond this count are hidden behind a "show more" toggle per question. */
const CHOICE_PREVIEW_LIMIT = 8

interface ChoiceData {
  id: string
  text: string
  isCorrect: boolean
  meta: Record<string, unknown> | null
}

interface QuestionData {
  id: string
  prompt: string
  type: string
  explanation: string | null
  timeLimitSec: number
  order: number
  meta: Record<string, unknown> | null
  choices: ChoiceData[]
}

interface DraftData {
  id: string
  title: string
  slug: string | null
  description: string
  difficulty: string
  format: string
  authorName: string
  categoryName: string
  categorySlug: string
  updatedAt: string
  lastFactCheck?: LatestFactCheck
  questions: QuestionData[]
}

interface ReviewDraftsClientProps {
  drafts: DraftData[]
}

const getCorrectAnswer = formatCorrectAnswer

function getQuestionLabel(q: QuestionData): string {
  const typeLabel: Record<string, string> = {
    SINGLE: 'Multiple Choice',
    ORDER: 'Order',
    MATCH: 'Match',
    GROUPS: 'Groups',
    NUMBER_GUESS: 'Number Guess',
    FILL_BLANK: 'Type Answer',
  }
  return typeLabel[q.type] ?? q.type
}

function formatDifficulty(d: string): string {
  return d.charAt(0) + d.slice(1).toLowerCase()
}

function buildPlainTextExport(drafts: DraftData[]): string {
  const lines: string[] = []
  lines.push(`=== DRAFT QUIZ REVIEW \u2014 ${new Date().toLocaleDateString()} ===`)
  lines.push(`Total drafts: ${drafts.length}`)
  lines.push('')

  for (const draft of drafts) {
    lines.push('='.repeat(70))
    lines.push(`QUIZ: ${draft.title}`)
    lines.push(
      `Category: ${draft.categoryName} | Difficulty: ${formatDifficulty(draft.difficulty)} | Format: ${draft.format} | Questions: ${draft.questions.length}`
    )
    lines.push(`Description: ${draft.description}`)
    lines.push(
      `Author: ${draft.authorName} | Last updated: ${new Date(draft.updatedAt).toLocaleDateString()}`
    )
    lines.push('-'.repeat(70))

    for (const q of draft.questions) {
      lines.push('')
      lines.push(`Q${q.order + 1} [${getQuestionLabel(q)}]: ${q.prompt}`)

      if (q.type === 'NUMBER_GUESS') {
        lines.push(`  Answer: ${getCorrectAnswer(q)}`)
        if (q.meta?.unit) lines.push(`  Unit: ${q.meta.unit}`)
        if (q.meta?.min != null && q.meta?.max != null) {
          lines.push(
            `  Range: ${q.meta.min}\u2013${q.meta.max} (tolerance: \u00b1${q.meta.tolerance ?? 0})`
          )
        }
      } else if (q.type === 'FILL_BLANK') {
        lines.push(`  Accepted: ${getCorrectAnswer(q)}`)
      } else {
        for (const c of q.choices) {
          const marker = c.isCorrect ? '\u2713' : ' '
          lines.push(`  [${marker}] ${c.text}${c.isCorrect ? '  \u2190 CORRECT' : ''}`)
        }
      }

      if (q.explanation) {
        lines.push(`  Explanation: ${q.explanation}`)
      }
    }

    lines.push('')
  }

  return lines.join('\n')
}

/** Choice list for a question, truncated behind a toggle once it gets long
 *  (e.g. Image Hotspot questions with one choice per clickable zone). */
function QuestionChoices({ choices }: { choices: ChoiceData[] }) {
  const [expanded, setExpanded] = React.useState(false)
  const isLong = choices.length > CHOICE_PREVIEW_LIMIT
  const visibleChoices = expanded || !isLong ? choices : choices.slice(0, CHOICE_PREVIEW_LIMIT)
  const hiddenCount = choices.length - visibleChoices.length

  return (
    <div className="space-y-1">
      {visibleChoices.map((c) => (
        <div
          key={c.id}
          className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm ${
            c.isCorrect ? 'bg-quiz-green/10 font-medium text-quiz-green' : 'text-muted-foreground'
          }`}
        >
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${
              c.isCorrect
                ? 'bg-quiz-green text-primary-foreground'
                : 'border border-muted-foreground/30'
            }`}
          >
            {c.isCorrect ? '✓' : ''}
          </span>
          <span>{c.text}</span>
          {c.isCorrect && <span className="ml-auto text-xs font-semibold">CORRECT</span>}
        </div>
      ))}
      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full rounded px-3 py-1.5 text-left text-xs font-medium text-primary hover:underline"
        >
          + {hiddenCount} more choice{hiddenCount === 1 ? '' : 's'}
        </button>
      )}
      {expanded && isLong && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full rounded px-3 py-1.5 text-left text-xs font-medium text-muted-foreground hover:underline"
        >
          Show fewer
        </button>
      )}
    </div>
  )
}

export function ReviewDraftsClient({ drafts }: ReviewDraftsClientProps) {
  const { addToast } = useToast()
  const [copied, setCopied] = React.useState(false)
  const [collapsedIds, setCollapsedIds] = React.useState<Set<string>>(
    () =>
      new Set(
        drafts.filter((d) => d.questions.length > AUTO_COLLAPSE_QUESTION_THRESHOLD).map((d) => d.id)
      )
  )

  const toggleDraft = React.useCallback((id: string) => {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const [factChecking, setFactChecking] = React.useState<Set<string>>(new Set())
  const [factCheckResults, setFactCheckResults] = React.useState<
    Record<string, FactCheckVerdict[]>
  >({})
  const [lastChecks, setLastChecks] = React.useState<Record<string, LatestFactCheck>>(() => {
    const initial: Record<string, LatestFactCheck> = {}
    for (const draft of drafts) {
      if (draft.lastFactCheck) initial[draft.id] = draft.lastFactCheck
    }
    return initial
  })

  const handleFactCheck = React.useCallback(
    async (draft: DraftData) => {
      setFactChecking((current) => new Set(current).add(draft.id))
      try {
        const result = await factCheckQuiz(draft.id)
        if (!result.ok) {
          addToast(result.message, 'error')
          return
        }
        setFactCheckResults((current) => ({ ...current, [draft.id]: result.verdicts }))
        setLastChecks((current) => ({
          ...current,
          [draft.id]: {
            checkedAt: new Date().toISOString(),
            flaggedCount: result.flaggedCount,
            totalQuestions: result.questions.length,
          },
        }))
        if (result.flaggedCount === 0) {
          addToast(`"${draft.title}": all answers look correct.`, 'success')
        } else {
          addToast(
            `"${draft.title}": ${result.flaggedCount} question${result.flaggedCount === 1 ? '' : 's'} flagged for review — filed as a report.`,
            'warning'
          )
        }
      } catch {
        addToast('Fact-check failed. Please try again.', 'error')
      } finally {
        setFactChecking((current) => {
          const next = new Set(current)
          next.delete(draft.id)
          return next
        })
      }
    },
    [addToast]
  )

  const handleCopy = React.useCallback(async () => {
    const text = buildPlainTextExport(drafts)
    await navigator.clipboard.writeText(text)
    setCopied(true)
    addToast('Copied all drafts to clipboard', 'success')
    setTimeout(() => setCopied(false), 2000)
  }, [drafts, addToast])

  const handleDownload = React.useCallback(() => {
    const text = buildPlainTextExport(drafts)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `draft-review-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    addToast('Downloaded draft review file', 'success')
  }, [drafts, addToast])

  const totalQuestions = drafts.reduce((sum, d) => sum + d.questions.length, 0)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {drafts.length} draft{drafts.length === 1 ? '' : 's'} \u00b7 {totalQuestions} question
          {totalQuestions === 1 ? '' : 's'} total
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setCollapsedIds(new Set())}>
            <ChevronDown className="h-4 w-4" />
            Expand all
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCollapsedIds(new Set(drafts.map((d) => d.id)))}
          >
            <ChevronUp className="h-4 w-4" />
            Collapse all
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy all as text'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <FileDown className="h-4 w-4" />
            Download .txt
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {drafts.map((draft) => {
          const collapsed = collapsedIds.has(draft.id)
          return (
            <Card key={draft.id} id={`draft-${draft.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDraft(draft.id)}
                    className="flex flex-1 items-start gap-2 text-left"
                    aria-expanded={!collapsed}
                  >
                    {collapsed ? (
                      <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle className="text-xl">{draft.title}</CardTitle>
                      <CardDescription className="mt-1">{draft.description}</CardDescription>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={factChecking.has(draft.id)}
                        onClick={() => {
                          handleFactCheck(draft).catch(() => {})
                        }}
                      >
                        {factChecking.has(draft.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {factChecking.has(draft.id) ? 'Checking…' : 'Fact-check with AI'}
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/studio/quiz/${draft.id}/edit`}>
                          Edit
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                    {lastChecks[draft.id] && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        {lastChecks[draft.id].flaggedCount === 0 ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-quiz-green" />
                            Fact-checked
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                            {lastChecks[draft.id].flaggedCount} flagged
                          </>
                        )}
                        <span>· {formatRelativeTime(lastChecks[draft.id].checkedAt)}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="info">{draft.categoryName}</Badge>
                  <Badge
                    variant={
                      draft.difficulty === 'EASY'
                        ? 'success'
                        : draft.difficulty === 'HARD'
                          ? 'destructive'
                          : 'warning'
                    }
                  >
                    {formatDifficulty(draft.difficulty)}
                  </Badge>
                  <Badge variant="purple">{draft.format.replace(/_/g, ' ')}</Badge>
                  <span>
                    {draft.questions.length} question{draft.questions.length === 1 ? '' : 's'}
                  </span>
                  <span>by {draft.authorName}</span>
                </div>
              </CardHeader>

              {!collapsed && (
                <CardContent className="space-y-6">
                  {draft.questions.map((q) => {
                    const verdict = factCheckResults[draft.id]?.find(
                      (v) => v.questionOrder === q.order
                    )
                    return (
                      <div key={q.id} className="rounded-md border border-border bg-muted/30 p-4">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                              Q{q.order + 1}
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              {getQuestionLabel(q)}
                            </span>
                          </div>
                          {verdict && <FactCheckBadge verdict={verdict.verdict} />}
                        </div>

                        <p className="mb-3 font-medium">{q.prompt}</p>

                        {q.type === 'NUMBER_GUESS' && (
                          <div className="rounded bg-quiz-green/5 px-3 py-2 text-sm">
                            <span className="font-semibold text-quiz-green">Answer: </span>
                            <span>{getCorrectAnswer(q)}</span>
                            {typeof q.meta?.unit === 'string' && q.meta.unit && (
                              <span className="ml-1 text-muted-foreground">
                                ({q.meta.unit as string})
                              </span>
                            )}
                            {q.meta?.min != null && q.meta?.max != null && (
                              <span className="ml-2 text-xs text-muted-foreground">
                                Range: {String(q.meta.min)}\u2013{String(q.meta.max)} \u00b7
                                Tolerance: \u00b1{String(q.meta.tolerance ?? 0)}
                              </span>
                            )}
                          </div>
                        )}

                        {q.type === 'FILL_BLANK' && (
                          <div className="rounded bg-quiz-green/5 px-3 py-2 text-sm">
                            <span className="font-semibold text-quiz-green">Accepted: </span>
                            <span>{getCorrectAnswer(q)}</span>
                          </div>
                        )}

                        {q.type !== 'NUMBER_GUESS' && q.type !== 'FILL_BLANK' && (
                          <QuestionChoices choices={q.choices} />
                        )}

                        {q.explanation && (
                          <p className="mt-2 text-xs text-muted-foreground italic">
                            {'\uD83D\uDCA1'} {q.explanation}
                          </p>
                        )}

                        {verdict && verdict.verdict !== 'correct' && (
                          <div className="mt-2 rounded border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs">
                            <span className="font-semibold text-destructive">AI reasoning: </span>
                            {verdict.reasoning}
                            {verdict.suggestedAnswer && (
                              <span className="mt-1 block">
                                <span className="font-semibold">Suggested answer: </span>
                                {verdict.suggestedAnswer}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </>
  )
}
