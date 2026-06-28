'use client'

import * as React from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, FileJson, Loader2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { importBulkQuizDrafts, validateBulkQuizImport } from '../actions'
import type { BulkQuizImportActionResult } from '../actions'

interface CategoryOption {
  slug: string
  name: string
}

interface BulkQuizImportClientProps {
  categories: CategoryOption[]
}

const SAMPLE_JSON = `[
  {
    "title": "Beginner World Capitals",
    "description": "A quick quiz about famous national capitals.",
    "categorySlug": "geography",
    "difficulty": "EASY",
    "tags": ["geography", "capitals"],
    "questions": [
      {
        "prompt": "What is the capital of Canada?",
        "explanation": "Ottawa is Canada's capital.",
        "timeLimitSec": 20,
        "choices": [
          { "text": "Toronto", "isCorrect": false },
          { "text": "Ottawa", "isCorrect": true },
          { "text": "Vancouver", "isCorrect": false },
          { "text": "Montreal", "isCorrect": false }
        ]
      }
    ]
  }
]`

export function BulkQuizImportClient({ categories }: BulkQuizImportClientProps) {
  const { addToast } = useToast()
  const [content, setContent] = React.useState('')
  const [result, setResult] = React.useState<BulkQuizImportActionResult | null>(null)
  const [validating, setValidating] = React.useState(false)
  const [importing, setImporting] = React.useState(false)

  const preview = result?.preview
  const canImport = Boolean(content.trim() && preview && preview.validCount > 0)

  const updateContent = (nextContent: string) => {
    setContent(nextContent)
    setResult(null)
  }

  const buildFormData = () => {
    const formData = new FormData()
    formData.set('content', content)
    return formData
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    const fileText = await file.text()
    updateContent(fileText)
  }

  const handleValidate = async () => {
    setValidating(true)
    const nextResult = await validateBulkQuizImport(buildFormData())
    setResult(nextResult)
    setValidating(false)
    addToast(nextResult.message, nextResult.ok ? 'success' : 'warning')
  }

  const handleImport = async () => {
    setImporting(true)
    const nextResult = await importBulkQuizDrafts(buildFormData())
    setResult(nextResult)
    setImporting(false)
    addToast(nextResult.message, nextResult.ok ? 'success' : 'error')
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Import JSON</CardTitle>
          </div>
          <CardDescription>
            Use an array of quizzes with category slugs, difficulty, tags, and at least five
            multiple-choice questions per quiz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Upload JSON file</span>
            <input
              accept="application/json,.json"
              className="block w-full rounded-lg border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
              onChange={(event) => void handleFileChange(event)}
              type="file"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Paste JSON</span>
            <textarea
              className="min-h-115 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
              onChange={(event) => updateContent(event.target.value)}
              placeholder={SAMPLE_JSON}
              value={content}
            />
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <Button disabled={validating || importing || !content.trim()} onClick={handleValidate}>
              {validating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {validating ? 'Validating...' : 'Validate'}
            </Button>
            <Button disabled={!canImport || validating || importing} onClick={handleImport}>
              {importing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {importing
                ? 'Importing...'
                : `Import ${preview?.validCount ?? 0} valid draft${preview?.validCount === 1 ? '' : 's'}`}
            </Button>
            {result?.ok && result.importedCount ? (
              <Button asChild variant="outline">
                <Link href="/studio?tab=drafts">Open drafts</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Accepted Categories</CardTitle>
            <CardDescription>
              Use these `categorySlug` values in generated quiz JSON.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
              {categories.map((category) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                  key={category.slug}
                >
                  <span>{category.name}</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">{category.slug}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {preview ? (
          <Card>
            <CardHeader>
              <CardTitle>Validation Preview</CardTitle>
              <CardDescription>
                {preview.validCount} valid, {preview.invalidCount} invalid, {preview.errorCount}{' '}
                issue{preview.errorCount === 1 ? '' : 's'}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {preview.errors.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                    Issues
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {preview.errors.map((error, index) => (
                      <div
                        className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm"
                        key={`${error.quizIndex ?? 'root'}-${error.path}-${index}`}
                      >
                        <p className="font-medium">
                          {error.quizIndex ? `Quiz ${error.quizIndex}` : 'Payload'} - {error.path}
                        </p>
                        <p className="mt-1 text-muted-foreground">{error.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {preview.quizzes.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-quiz-green">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready drafts
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/40 text-left text-muted-foreground">
                        <tr>
                          <th className="px-3 py-2">Title</th>
                          <th className="px-3 py-2">Category</th>
                          <th className="px-3 py-2">Difficulty</th>
                          <th className="px-3 py-2">Questions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {preview.quizzes.map((quiz) => (
                          <tr
                            className="border-t border-border"
                            key={`${quiz.quizIndex}-${quiz.title}`}
                          >
                            <td className="px-3 py-2 font-medium">{quiz.title}</td>
                            <td className="px-3 py-2">{quiz.categorySlug}</td>
                            <td className="px-3 py-2">
                              <Badge variant="outline">{quiz.difficulty}</Badge>
                            </td>
                            <td className="px-3 py-2">{quiz.questionCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
