import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { importQuestions } from '@/app/studio/actions'
import { Button } from '@/components/ui/button'

export default async function QuizImportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const { id } = await params
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    select: { id: true, title: true, authorId: true },
  })

  if (!quiz) {
    notFound()
  }

  if (quiz.authorId !== session.user.id && session.user.role !== 'ADMIN') {
    redirect('/studio')
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Import questions</h1>
      <p className="mt-2 text-muted-foreground">
        Append questions to “{quiz.title}” using CSV or JSON.
      </p>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline">
          <Link href="/templates/quiz-import.csv" download>
            Download CSV template
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/templates/quiz-import.json" download>
            Download JSON template
          </Link>
        </Button>
      </div>

      <form
        action={importQuestions as unknown as (formData: FormData) => Promise<void>}
        className="mt-6 space-y-4 rounded-md border p-6"
      >
        <input type="hidden" name="quizId" value={quiz.id} />
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Format</span>
          <select
            name="format"
            defaultValue="csv"
            className="w-full rounded-md border bg-background px-3 py-2 text-base md:text-sm"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Paste file contents</span>
          <textarea
            name="content"
            required
            className="min-h-64 w-full rounded-md border bg-background px-3 py-2 font-mono text-base md:text-xs"
          />
        </label>
        <Button type="submit">Import questions</Button>
      </form>
    </div>
  )
}
