'use client'

import * as React from 'react'
import Link from 'next/link'
import { Sparkles, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { bulkGenerateQuizzes } from '../actions'
import type { BulkAiGenerateResult } from '../actions'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
] as const

const QUIZ_COUNTS = [2, 3, 4, 5] as const

const QUESTION_COUNTS = [5, 10, 15] as const

const FORMATS: { value: string; label: string }[] = [
  { value: 'TEXT_CHOICE', label: 'Text Choice' },
  { value: 'IMAGE_CHOICE', label: 'Image Choice' },
  { value: 'MAP_CHOICE', label: 'Map Choice' },
  { value: 'IMAGE_HOTSPOT', label: 'Image Hotspot' },
  { value: 'IMAGE_REVEAL', label: 'Image Reveal' },
  { value: 'AUDIO_CHOICE', label: 'Audio Choice' },
  { value: 'MEMORY_FLASH', label: 'Memory Flash' },
  { value: 'ORDER', label: 'Order / Ranking' },
  { value: 'MATCH', label: 'Match Pairs' },
  { value: 'CONNECTIONS', label: 'Connections' },
  { value: 'ODD_ONE_OUT', label: 'Odd One Out' },
  { value: 'VERSUS', label: 'Versus' },
  { value: 'TYPE_ANSWER', label: 'Type Answer' },
  { value: 'ANAGRAM', label: 'Anagram' },
  { value: 'NUMBER_GUESS', label: 'Number Guess' },
]

interface CategoryNode {
  id: string
  name: string
  slug: string
  parentSlug: string | null
}

interface BulkAiGenerateClientProps {
  categories: CategoryNode[]
}

// ---------------------------------------------------------------------------
// Category tree helpers
// ---------------------------------------------------------------------------

function buildCategoryTree(categories: CategoryNode[]) {
  const parents: CategoryNode[] = []
  const childrenByParent = new Map<string, CategoryNode[]>()

  for (const cat of categories) {
    if (cat.parentSlug === null) {
      parents.push(cat)
    } else {
      const list = childrenByParent.get(cat.parentSlug) ?? []
      list.push(cat)
      childrenByParent.set(cat.parentSlug, list)
    }
  }

  return { parents, childrenByParent }
}

function subTopicDescription(quizCount: number): string {
  const variants = [
    'fundamentals and basics',
    'advanced concepts',
    'history and origins',
    'famous examples',
    'common misconceptions',
  ]
  return variants.slice(0, quizCount).join(', ')
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BulkAiGenerateClient({ categories }: BulkAiGenerateClientProps) {
  const { addToast } = useToast()

  const tree = React.useMemo(() => buildCategoryTree(categories), [categories])

  const [generating, setGenerating] = React.useState(false)
  const [topic, setTopic] = React.useState('')
  const [parentCategoryId, setParentCategoryId] = React.useState(tree.parents[0]?.id ?? '')
  const [subcategoryId, setSubcategoryId] = React.useState('')
  const [quizCount, setQuizCount] = React.useState(3)
  const [questionsPerQuiz, setQuestionsPerQuiz] = React.useState(10)
  const [difficulty, setDifficulty] = React.useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [format, setFormat] = React.useState('TEXT_CHOICE')
  const [result, setResult] = React.useState<BulkAiGenerateResult | null>(null)

  const handleParentChange = React.useCallback((id: string) => {
    setParentCategoryId(id)
    setSubcategoryId('')
  }, [])

  const effectiveCategoryId = subcategoryId || parentCategoryId

  const parentSlug = tree.parents.find((p) => p.id === parentCategoryId)?.slug ?? ''
  const subcategories = tree.childrenByParent.get(parentSlug) ?? []

  async function handleGenerate() {
    if (!topic.trim() || !effectiveCategoryId) return

    setGenerating(true)
    setResult(null)

    try {
      const fd = new FormData()
      fd.set('topic', topic.trim())
      fd.set('categoryId', effectiveCategoryId)
      fd.set('quizCount', String(quizCount))
      fd.set('questionsPerQuiz', String(questionsPerQuiz))
      fd.set('difficulty', difficulty)
      fd.set('format', format)

      const res = await bulkGenerateQuizzes(fd)
      setResult(res)

      if (res.ok) {
        addToast(`Generated ${res.quizzes.length} quiz drafts!`, 'success')
      } else if (res.partialQuizzes?.length) {
        addToast(res.message, 'warning')
      } else {
        addToast(res.message, 'error')
      }
    } catch {
      addToast('Something went wrong. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const formatLabel = FORMATS.find((f) => f.value === format)?.label ?? format

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* --- Form card --- */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Bulk AI Generation</CardTitle>
          </div>
          <CardDescription>
            Generate multiple quizzes at once. Each quiz explores a different angle of your topic
            and is saved as an unpublished draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Topic */}
          <div className="space-y-1.5">
            <label htmlFor="bulk-topic" className="text-sm font-medium">
              Topic
            </label>
            <textarea
              id="bulk-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder='e.g., "World War II", "JavaScript", "Space exploration", "Famous painters"'
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Category + Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="bulk-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="bulk-category"
                value={parentCategoryId}
                onChange={(e) => handleParentChange(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {tree.parents.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bulk-subcategory" className="text-sm font-medium">
                Subcategory
              </label>
              <select
                id="bulk-subcategory"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                disabled={subcategories.length === 0}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
              >
                <option value="">
                  — All {tree.parents.find((p) => p.id === parentCategoryId)?.name ?? 'Category'} —
                </option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-1.5">
            <label htmlFor="bulk-format" className="text-sm font-medium">
              Format
            </label>
            <select
              id="bulk-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz count + Questions per quiz */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="bulk-count" className="text-sm font-medium">
                Quizzes to generate
              </label>
              <select
                id="bulk-count"
                value={quizCount}
                onChange={(e) => setQuizCount(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {QUIZ_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n} quizzes
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="bulk-qcount" className="text-sm font-medium">
                Questions per quiz
              </label>
              <select
                id="bulk-qcount"
                value={questionsPerQuiz}
                onChange={(e) => setQuestionsPerQuiz(Number(e.target.value))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {QUESTION_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n} questions
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <span className="text-sm font-medium">Difficulty</span>
            <div className="flex gap-1">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 rounded-md border px-2 py-2 text-xs font-semibold transition-colors ${
                    difficulty === d.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Info banner */}
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-700 dark:text-amber-400">
            <strong>What will happen:</strong> {quizCount} separate {formatLabel} quizzes will be
            generated about different angles of{' '}
            <strong>&ldquo;{topic || 'your topic'}&rdquo;</strong> —{' '}
            {subTopicDescription(quizCount)}. Each quiz will have {questionsPerQuiz} questions. All
            quizzes are saved as <strong>unpublished drafts</strong>. Review and edit each one
            before publishing — AI-generated content may contain errors.
          </div>

          {/* Generate button */}
          <div className="flex gap-3 justify-end">
            <Button
              onClick={handleGenerate}
              disabled={generating || !topic.trim() || !effectiveCategoryId}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generating
                ? `Generating ${quizCount} quiz${quizCount > 1 ? 'zes' : ''}…`
                : `Generate ${quizCount} Quiz${quizCount > 1 ? 'zes' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* --- Sidebar --- */}
      <div className="space-y-6">
        {/* Category reference */}
        <Card>
          <CardHeader>
            <CardTitle>Available Categories</CardTitle>
            <CardDescription>Quizzes will be assigned to the selected category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {tree.parents.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span>{cat.name}</span>
                  <Badge variant="info">{cat.slug}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results panel */}
        {result ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                {result.ok ? (
                  <CheckCircle2 className="h-5 w-5 text-quiz-green" />
                ) : result.partialQuizzes?.length ? (
                  <AlertTriangle className="h-5 w-5 text-quiz-orange" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                )}
                <CardTitle>
                  {result.ok
                    ? 'Generation complete'
                    : result.partialQuizzes?.length
                      ? 'Partial success'
                      : 'Generation failed'}
                </CardTitle>
              </div>
              <CardDescription>
                {result.ok
                  ? `${result.quizzes.length} quiz${result.quizzes.length === 1 ? '' : 'zes'} created successfully.`
                  : result.message}
              </CardDescription>
            </CardHeader>
            {(result.ok || result.partialQuizzes?.length) && (
              <CardContent className="space-y-3">
                <p className="text-sm font-medium">
                  Generated {(result.ok ? result.quizzes : result.partialQuizzes!).length} quiz
                  {(result.ok ? result.quizzes : result.partialQuizzes!).length === 1 ? '' : 'zes'}:
                </p>
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {(result.ok ? result.quizzes : result.partialQuizzes!).map((quiz) => (
                    <div
                      key={quiz.quizId}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <span className="truncate">{quiz.title}</span>
                      <Button asChild variant="outline" size="sm" className="shrink-0">
                        <Link href={`/studio/quiz/${quiz.quizId}/edit`}>
                          Edit
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/studio?tab=drafts">View all drafts</Link>
                </Button>
              </CardContent>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  )
}
