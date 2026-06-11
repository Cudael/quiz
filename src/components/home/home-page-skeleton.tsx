import { Skeleton } from '@/components/ui/skeleton'
import {
  QuizCardGridSkeleton,
  QuizCardScrollerSkeleton,
  QuizCardCategoryRowSkeleton,
} from '@/components/ui/quiz-card'

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
      {/* Hero */}
      <Skeleton className="h-72 w-full rounded-3xl md:h-80" />

      {/* Quiz grid — 2 cols mobile, 3 cols lg */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <QuizCardGridSkeleton key={i} />
          ))}
        </div>
      </div>

      {/* Horizontal scroller — matching the 6-col scroller */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <QuizCardScrollerSkeleton count={6} />
      </div>

      {/* Category mosaic — category row scroller */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <QuizCardCategoryRowSkeleton count={12} />
      </div>

      {/* Horizontal scroller */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-36 rounded-xl" />
        <QuizCardScrollerSkeleton count={6} />
      </div>

      {/* Leaderboard section */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  )
}
