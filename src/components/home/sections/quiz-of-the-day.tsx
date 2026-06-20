import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { Calendar, Play, Trophy, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { prisma } from '@/server/prisma'

const QOTD_TAG = 'quiz-of-the-day'

const difficultyVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

function dateSeed(): number {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

const getQuizOfTheDay = unstable_cache(
  async () => {
    const total = await prisma.quiz.count({ where: { isPublished: true } })
    if (total === 0) return null

    const seed = dateSeed()
    const skip = seed % total

    const quiz = await prisma.quiz.findFirst({
      where: { isPublished: true },
      orderBy: { createdAt: 'asc' },
      skip,
      select: {
        id: true,
        title: true,
        description: true,
        coverImage: true,
        difficulty: true,
        playCount: true,
        category: { select: { name: true, color: true } },
      },
    })

    return quiz
  },
  [QOTD_TAG],
  {
    revalidate: 3600,
    tags: [QOTD_TAG],
  }
)

export async function QuizOfTheDay() {
  const quiz = await getQuizOfTheDay()
  if (!quiz) return null

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">📅 Quiz of the Day</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            A fresh challenge hand-picked just for today
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="flex flex-col sm:flex-row">
          {/* Color bar */}
          {quiz.coverImage ? (
            <div
              className="relative h-32 w-full shrink-0 sm:h-auto sm:w-48"
              style={{
                background: `url(${quiz.coverImage}) center/cover, linear-gradient(135deg, ${quiz.category.color} 0%, #111827 100%)`,
              }}
              aria-hidden="true"
            />
          ) : (
            <div
              className="h-24 w-full shrink-0 sm:h-auto sm:w-48"
              style={{
                background: `linear-gradient(135deg, ${quiz.category.color} 0%, #111827 100%)`,
              }}
              aria-hidden="true"
            />
          )}

          {/* Content */}
          <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="purple">{quiz.category.name}</Badge>
                <Badge variant={difficultyVariant[quiz.difficulty] ?? 'outline'}>
                  {quiz.difficulty}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </span>
              </div>

              <h3 className="text-lg font-extrabold leading-tight sm:text-xl">{quiz.title}</h3>

              {quiz.description && (
                <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                  {quiz.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  {quiz.playCount.toLocaleString()} plays
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="gradient" size="sm" className="rounded-xl">
                <Link href={`/play/${quiz.id}`}>
                  <Zap className="mr-1.5 h-4 w-4" />
                  Play Now
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href={`/quiz/${quiz.id}`}>
                  <Trophy className="mr-1.5 h-4 w-4" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
