import { Skeleton } from '@/components/ui/skeleton'

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8 md:px-6">
      {/* Hero */}
      <Skeleton className="h-72 w-full rounded-3xl md:h-80" />

      {/* Quiz grid */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Horizontal scroller */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-44 w-52 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Category mosaic */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Horizontal scroller */}
      <div className="space-y-3">
        <Skeleton className="h-7 w-36 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-44 w-52 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>

      {/* Leaderboard section */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  )
}
