import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/server/prisma'
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
    select: {
      id: true,
      title: true,
      coverImage: true,
      difficulty: true,
      playCount: true,
      avgScore: true,
      updatedAt: true,
      isPublished: true,
      category: { select: { name: true, color: true } },
      questions: { select: { id: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        title="Quiz Studio"
        description="Manage your drafts and published quizzes in one place."
        actions={
          <Button asChild>
            <Link href="/studio/quiz/new">
              <Plus className="mr-2 h-4 w-4" />
              New Quiz
            </Link>
          </Button>
        }
      />

      <div className="mb-6 flex gap-2">
        <Button variant={activeTab === 'drafts' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=drafts">Drafts</Link>
        </Button>
        <Button variant={activeTab === 'published' ? 'default' : 'outline'} asChild>
          <Link href="/studio?tab=published">Published</Link>
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon="✏️"
          title="No quizzes yet in this tab."
          description="Start from scratch or use a sample template to move faster."
          action={{ label: 'View sample template', href: '/templates/quiz-import.json' }}
        />
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
                      <Image
                        src={quiz.coverImage}
                        alt={`${quiz.title} cover image`}
                        width={64}
                        height={40}
                        unoptimized
                        className="rounded-md border object-cover"
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
                  <td className="px-4 py-3">{quiz.questions.length}</td>
                  <td className="px-4 py-3">{quiz.playCount}</td>
                  <td className="px-4 py-3">{quiz.avgScore.toFixed(1)}</td>
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
