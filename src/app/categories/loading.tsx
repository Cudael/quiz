import { Skeleton } from '@/components/ui/skeleton'

export default function CategoriesLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header skeleton */}
      <div className="mb-8">
        <Skeleton className="mb-4 h-9 w-36 rounded-lg" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>

      {/* Category card grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border">
            {/* Card header */}
            <Skeleton className="h-11 w-full rounded-none" />
            {/* Quiz rows */}
            {Array.from({ length: 5 }).map((_, j) => (
              <div
                key={j}
                className="flex items-center justify-between gap-3 border-t border-border/50 px-4 py-2.5"
              >
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
            {/* Browse all footer */}
            <div className="border-t px-4 py-2.5">
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
