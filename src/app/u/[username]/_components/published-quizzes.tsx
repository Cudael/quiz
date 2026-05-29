import Link from 'next/link'
import { copy } from '@/lib/copy'

interface PublishedQuiz {
  id: string
  title: string
  difficulty: string
  category: { name: string }
}

interface PublishedQuizzesProps {
  quizzes: PublishedQuiz[]
}

export function PublishedQuizzes({ quizzes }: PublishedQuizzesProps) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Published Quizzes</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.id}
            href={`/quiz/${quiz.id}`}
            className="rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
          >
            <p className="font-medium">{quiz.title}</p>
            <p className="text-xs text-muted-foreground">
              {quiz.category.name} • {quiz.difficulty}
            </p>
          </Link>
        ))}
        {quizzes.length === 0 && (
          <p className="text-sm text-muted-foreground">{copy.emptyStates.noPublishedQuizzes}</p>
        )}
      </div>
    </section>
  )
}
