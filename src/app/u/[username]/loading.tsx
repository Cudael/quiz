import { Skeleton } from '@/components/ui/skeleton'

export default function ProfileLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Profile card */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton circle className="h-16 w-16" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-36" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Skeleton className="h-36 rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        </div>
        {/* Recent sessions */}
        <div className="rounded-xl border border-border bg-card p-6">
          <Skeleton className="mb-4 h-6 w-36" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      {/* Badges */}
      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-20" />
        <div className="grid gap-3 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
