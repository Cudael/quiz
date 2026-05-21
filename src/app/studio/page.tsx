import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'
import { deleteQuiz, togglePublish } from './actions'

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/studio')
  }

  const { tab } = await searchParams
  const activeTab = tab === 'published' ? 'published' : 'drafts'

  const quizzes = await prisma.quiz.findMany({
    where: {
      authorId: session.user.id,
      isPublished: activeTab === 'published',
    },
    include: {
      category: { select: { name: true } },
      questions: { select: { id: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/studio/quiz/new">
            <Plus className="mr-2 h-4 w-4" />
            New Quiz
          </Link>
        </Button>
      </div>
      <h1 className="mb-2 text-3xl font-extrabold">Quiz Studio</h1>
      <p className="mb-6 text-muted-foreground">
        Manage your drafts and published quizzes in one place.
      </p>

      <div className="mb-6 flex gap-2">
        <Button variant={activeTab === 'drafts' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=drafts">Drafts</Link>
        </Button>
        <Button variant={activeTab === 'published' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=published">Published</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-lg font-semibold">No quizzes yet in this tab.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Start from scratch or use a sample template to move faster.
          </p>
          <Button asChild className="mt-4">
            <Link href="/templates/quiz-import.json">View sample template</Link>
          </Button>
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
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{
                        background:
                          quiz.category.name === 'Science'
                            ? 'linear-gradient(135deg,#7C3AED,#EC4899)'
                            : 'linear-gradient(135deg,#3B82F6,#22C55E)',
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{quiz.title}</td>
                  <td className="px-4 py-3">{quiz.category.name}</td>
                  <td className="px-4 py-3">{quiz.difficulty}</td>
                  <td className="px-4 py-3">{quiz.questions.length}</td>
                  <td className="px-4 py-3">{quiz.playCount}</td>
                  <td className="px-4 py-3">{Math.round(quiz.avgScore)}</td>
                  <td className="px-4 py-3">{quiz.updatedAt.toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/studio/quiz/${quiz.id}/edit`}>Edit</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/quiz/${quiz.id}`}>Preview</Link>
                      </Button>
                      <form
                        action={togglePublish as unknown as (formData: FormData) => Promise<void>}
                      >
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
