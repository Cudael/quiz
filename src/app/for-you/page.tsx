import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { auth } from '@/server/auth'
import { getForYouFeed } from '@/server/for-you'
import { QuizCard } from '@/components/ui/quiz-card'

export const metadata: Metadata = {
  title: 'For You',
  description: 'Quizzes picked for you based on what you play and who you follow.',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

const REASON_STYLES: Record<string, string> = {
  following: 'bg-quiz-purple-light/15 text-quiz-purple-light',
  category: 'bg-quiz-green/15 text-quiz-green',
  fresh: 'bg-quiz-orange/15 text-quiz-orange',
}

export default async function ForYouPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/api/auth/signin?callbackUrl=/for-you')
  }

  const items = await getForYouFeed(session.user.id)

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-quiz-purple-light" />
          <h1 className="text-2xl font-extrabold">For You</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Picked from your favourite categories, creators you follow, and the newest quizzes on
          BusQuiz.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing to recommend yet — play a few quizzes and check back!
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.quiz.id} className="flex flex-col gap-1.5">
              <span
                className={`self-start rounded-sm px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  REASON_STYLES[item.reason] ?? REASON_STYLES.fresh
                }`}
              >
                {item.reasonLabel}
              </span>
              <QuizCard quiz={item.quiz} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
