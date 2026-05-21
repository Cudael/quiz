import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { updateQuiz } from '@/app/studio/actions'
import { Button } from '@/components/ui/button'

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
    },
  })

  if (!quiz) {
    notFound()
  }

  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/studio')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  })

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Edit quiz</h1>
      <form
        action={updateQuiz as unknown as (formData: FormData) => Promise<void>}
        className="space-y-4 rounded-lg border p-6"
      >
        <input type="hidden" name="quizId" value={quiz.id} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Title</span>
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={quiz.title}
            className="w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Description</span>
          <textarea
            name="description"
            required
            maxLength={500}
            defaultValue={quiz.description}
            className="min-h-28 w-full rounded-md border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Category</span>
          <select
            name="categoryId"
            required
            defaultValue={quiz.categoryId}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Difficulty</span>
          <select
            name="difficulty"
            required
            defaultValue={quiz.difficulty}
            className="w-full rounded-md border bg-background px-3 py-2"
          >
            <option value="EASY">EASY</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HARD">HARD</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={quiz.isPublished} />
          Published
        </label>
        <Button type="submit">Save changes</Button>
      </form>

      <div className="mt-8 rounded-lg border p-6">
        <h2 className="mb-2 text-xl font-semibold">Questions</h2>
        {quiz.questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No questions yet. Use import to append questions.
          </p>
        ) : (
          <ol className="space-y-2 text-sm">
            {quiz.questions.map((question) => (
              <li key={question.id} className="rounded-md border p-3">
                <p className="font-medium">
                  {question.order + 1}. {question.prompt}
                </p>
                <p className="text-xs text-muted-foreground">
                  {question.type} • {question.timeLimitSec}s
                </p>
              </li>
            ))}
          </ol>
        )}
        <Button asChild variant="outline" className="mt-4">
          <Link href={`/studio/quiz/${quiz.id}/import`}>Bulk import questions</Link>
        </Button>
      </div>
    </div>
  )
}
