'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Copy, ExternalLink, FileDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'

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
  questions: QuestionData[]
}

interface ReviewDraftsClientProps {
  drafts: DraftData[]
}

function getCorrectAnswer(q: QuestionData): string {
  switch (q.type) {
    case 'ORDER':
      return q.choices
        .filter((c) => c.meta?.position != null)
        .sort((a, b) => Number(a.meta!.position) - Number(b.meta!.position))
        .map((c) => c.text)
        .join(' \u2192 ')
    case 'MATCH': {
      const pairs: string[] = []
      const lChoices = q.choices.filter((c) => c.meta?.side === 'L')
      const rByKey = new Map(
        q.choices.filter((c) => c.meta?.side === 'R').map((c) => [c.meta?.matchKey as string, c])
      )
      for (const l of lChoices) {
        const key = l.meta?.matchKey as string
        const r = rByKey.get(key)
        pairs.push(`${l.text} \u2194 ${r?.text ?? '?'}`)
      }
      return pairs.join('; ')
    }
    case 'GROUPS': {
      const groups = new Map<string, string[]>()
      for (const c of q.choices) {
        const key = (c.meta?.groupKey as string) ?? 'default'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(c.text)
      }
      const groupLabels = (q.meta?.groups as string[]) ?? [...groups.keys()]
      return groupLabels.map((g) => `${g}: [${groups.get(g)?.join(', ') ?? ''}]`).join(' | ')
    }
    case 'NUMBER_GUESS':
      return String(q.meta?.answer ?? '?')
    case 'FILL_BLANK':
      return (q.meta?.acceptedAnswers as string[])?.join(' / ') ?? '?'
    default:
      return q.choices.find((c) => c.isCorrect)?.text ?? 'No correct answer set'
  }
}

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

export function ReviewDraftsClient({ drafts }: ReviewDraftsClientProps) {
  const { addToast } = useToast()
  const [copied, setCopied] = React.useState(false)

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
        <div className="flex gap-2">
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
        {drafts.map((draft) => (
          <Card key={draft.id} id={`draft-${draft.id}`}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">{draft.title}</CardTitle>
                  <CardDescription className="mt-1">{draft.description}</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/studio/quiz/${draft.id}/edit`}>
                    Edit
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
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

            <CardContent className="space-y-6">
              {draft.questions.map((q) => (
                <div key={q.id} className="rounded-md border border-border bg-muted/30 p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                      Q{q.order + 1}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {getQuestionLabel(q)}
                    </span>
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
                          Range: {String(q.meta.min)}\u2013{String(q.meta.max)} \u00b7 Tolerance:
                          \u00b1{String(q.meta.tolerance ?? 0)}
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
                    <div className="space-y-1">
                      {q.choices.map((c) => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm ${
                            c.isCorrect
                              ? 'bg-quiz-green/10 font-medium text-quiz-green'
                              : 'text-muted-foreground'
                          }`}
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs ${
                              c.isCorrect
                                ? 'bg-quiz-green text-primary-foreground'
                                : 'border border-muted-foreground/30'
                            }`}
                          >
                            {c.isCorrect ? '\u2713' : ''}
                          </span>
                          <span>{c.text}</span>
                          {c.isCorrect && (
                            <span className="ml-auto text-xs font-semibold">CORRECT</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.explanation && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      {'\uD83D\uDCA1'} {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}
