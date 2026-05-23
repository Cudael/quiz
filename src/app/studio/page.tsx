import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { auth } from '@/server/auth'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { prisma } from '@/server/prisma'
import { StudioQuizBrowser } from './_components/studio-quiz-browser'

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
        <StudioQuizBrowser
          quizzes={quizzes.map((quiz) => ({
            ...quiz,
            updatedAt: quiz.updatedAt.toISOString(),
            questionCount: quiz.questions.length,
          }))}
        />
      )}
    </div>
  )
}
