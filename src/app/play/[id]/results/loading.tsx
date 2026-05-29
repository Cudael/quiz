import { Skeleton } from '@/components/ui/skeleton'

export default function ResultsLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      {/* Score emoji + heading */}
      <div className="mb-8 text-center">
        <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mb-2 h-9 w-48" />
        <Skeleton className="mx-auto h-5 w-40" />
      </div>
      {/* XP card */}
      <Skeleton className="mb-6 h-20 rounded-xl" />
      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      {/* Question breakdown */}
      <Skeleton className="mb-4 h-7 w-48" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      {/* CTA buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  )
}
