import { Skeleton } from '@/components/ui/skeleton'

export default function QuizDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Back button skeleton */}
      <div className="mb-6">
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex flex-col sm:flex-row">
              {/* Image skeleton */}
              <div className="h-48 w-full shrink-0 sm:h-44 sm:w-56 md:w-64">
                <Skeleton className="h-full w-full rounded-none" />
              </div>

              {/* Content skeleton */}
              <div className="flex flex-col justify-between gap-3 p-4 sm:p-5 md:p-6">
                <div className="space-y-3">
                  <div className="flex gap-1.5">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-7 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-11 w-40 rounded-xl" />
              </div>
            </div>

            {/* Stats strip skeleton */}
            <div className="grid grid-cols-5 border-t">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 border-r border-border px-2 py-2.5 last:border-r-0"
                >
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-2 w-8" />
                </div>
              ))}
            </div>
          </div>

          {/* Rating skeleton */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>

          {/* Report skeleton */}
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Sidebar skeleton */}
        <div className="lg:col-span-1">
          <div className="mb-4 flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="overflow-hidden rounded-2xl border bg-card">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <Skeleton className="h-2.5 w-2.5 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
