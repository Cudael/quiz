'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, LayoutGrid, List } from 'lucide-react'
import { deleteQuiz, togglePublish } from '@/app/studio/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'studio-quiz-layout'

type StudioLayout = 'table' | 'grid'

interface StudioQuiz {
  id: string
  title: string
  coverImage: string | null
  difficulty: string
  playCount: number
  avgScore: number
  updatedAt: string
  isPublished: boolean
  questionCount: number
  category: {
    name: string
    color: string
  }
}

interface StudioQuizBrowserProps {
  quizzes: StudioQuiz[]
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

function getStoredLayout(): StudioLayout {
  if (typeof window === 'undefined') {
    return 'table'
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'grid' || stored === 'table' ? stored : 'table'
}

export function StudioQuizBrowser({ quizzes }: StudioQuizBrowserProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [layout, setLayout] = React.useState<StudioLayout>(() => getStoredLayout())
  const [duplicatingQuizId, setDuplicatingQuizId] = React.useState<string | null>(null)

  const handleLayoutChange = (nextLayout: StudioLayout) => {
    setLayout(nextLayout)
    localStorage.setItem(STORAGE_KEY, nextLayout)
  }

  const handleDuplicate = async (quizId: string) => {
    setDuplicatingQuizId(quizId)
    const response = await fetch(`/api/studio/quizzes/${quizId}/duplicate`, {
      method: 'POST',
    })
    setDuplicatingQuizId(null)

    if (!response.ok) {
      addToast(await readErrorMessage(response, 'Could not duplicate quiz.'), 'error')
      return
    }

    const body = (await response.json()) as { quizId: string }
    addToast('Quiz duplicated.', 'success')
    router.push(`/studio/quiz/${body.quizId}/edit`)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant={layout === 'table' ? 'default' : 'outline'}
          size="icon"
          aria-label="Show table view"
          onClick={() => handleLayoutChange('table')}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={layout === 'grid' ? 'default' : 'outline'}
          size="icon"
          aria-label="Show grid view"
          onClick={() => handleLayoutChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
      </div>

      {layout === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="overflow-hidden">
              <div className="relative h-40 border-b bg-muted">
                {quiz.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={quiz.coverImage}
                    alt={quiz.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg, ${quiz.category.color}, transparent)`,
                    }}
                  />
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{quiz.category.name}</Badge>
                  <Badge variant="secondary">{quiz.difficulty}</Badge>
                </div>
                <CardTitle className="line-clamp-2 text-lg">{quiz.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Questions</span>
                  <span>{quiz.questionCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Plays</span>
                  <span>{quiz.playCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Avg score</span>
                  <span>{quiz.avgScore.toFixed(1)}</span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2">
                <QuizActions
                  quiz={quiz}
                  duplicatingQuizId={duplicatingQuizId}
                  onDuplicate={handleDuplicate}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left">Cover</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Difficulty</th>
                <th className="px-4 py-3 text-left">Questions</th>
                <th className="px-4 py-3 text-left">Plays</th>
                <th className="px-4 py-3 text-left">Avg score</th>
                <th className="px-4 py-3 text-left">Updated</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-t">
                  <td className="px-4 py-3">
                    {quiz.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={quiz.coverImage}
                        alt={quiz.title}
                        className="h-10 w-16 rounded-md border object-cover"
                      />
                    ) : (
                      <div
                        className="h-6 w-6 rounded-full border"
                        style={{
                          background: quiz.category.color,
                        }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3">{quiz.category.name}</td>
                  <td className="px-4 py-3">{quiz.difficulty}</td>
                  <td className="px-4 py-3">{quiz.questionCount}</td>
                  <td className="px-4 py-3">{quiz.playCount}</td>
                  <td className="px-4 py-3">{quiz.avgScore.toFixed(1)}</td>
                  <td className="px-4 py-3">{new Date(quiz.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <QuizActions
                      quiz={quiz}
                      duplicatingQuizId={duplicatingQuizId}
                      onDuplicate={handleDuplicate}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function QuizActions({
  quiz,
  duplicatingQuizId,
  onDuplicate,
}: {
  quiz: StudioQuiz
  duplicatingQuizId: string | null
  onDuplicate: (quizId: string) => Promise<void>
}) {
  return (
    <div className={cn('flex flex-wrap gap-2')}>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/studio/quiz/${quiz.id}/edit`}>Edit</Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/quiz/${quiz.id}`}>Preview</Link>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void onDuplicate(quiz.id)}
        disabled={duplicatingQuizId === quiz.id}
      >
        <Copy className="mr-2 h-4 w-4" />
        {duplicatingQuizId === quiz.id ? 'Duplicating…' : 'Duplicate'}
      </Button>
      <form action={togglePublish as unknown as (formData: FormData) => Promise<void>}>
        <input type="hidden" name="quizId" value={quiz.id} />
        <Button variant="outline" size="sm" type="submit">
          {quiz.isPublished ? 'Unpublish' : 'Publish'}
        </Button>
      </form>
      <form action={deleteQuiz as unknown as (formData: FormData) => Promise<void>}>
        <input type="hidden" name="quizId" value={quiz.id} />
        <Button variant="destructive" size="sm" type="submit">
          Delete
        </Button>
      </form>
    </div>
  )
}
