import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-12">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="space-y-4 rounded-3xl border border-border/70 p-6 md:p-8">
        <Skeleton className="h-10 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-5 w-72" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/70 p-4">
              <Skeleton className="mb-3 h-5 w-36" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-24" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
