import { Skeleton } from '@/components/ui/skeleton'

export default function PlayLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Progress bar */}
      <Skeleton className="mb-6 h-3 w-full rounded-full" />
      {/* Question card */}
      <Skeleton className="mb-6 h-40 rounded-2xl" />
      {/* Answer choices */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
