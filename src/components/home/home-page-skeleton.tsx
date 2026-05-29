import { Skeleton } from '@/components/ui/skeleton'

export function HomePageSkeleton() {
  return (
    <div className="container mx-auto space-y-8 px-4 md:px-6 py-8">
      <Skeleton className="h-52 w-full rounded-3xl" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Skeleton className="col-span-2 row-span-2 h-56 rounded-2xl" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-44 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-3xl md:h-80" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-44 w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-52 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-7 w-40 rounded-xl" />
        <div className="flex gap-4 overflow-hidden">
          {[0, 1, 2, 3].map((j) => (
            <Skeleton key={j} className="h-44 w-64 shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    </div>
  )
}
