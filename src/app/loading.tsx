import { Skeleton } from '@/components/ui/skeleton'

export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero skeleton */}
      <div className="py-24 md:py-32">
        <div className="container mx-auto space-y-6 px-4 text-center">
          <Skeleton className="mx-auto h-8 w-64 rounded-full" />
          <Skeleton className="mx-auto h-16 w-3/4 rounded-xl" />
          <Skeleton className="mx-auto h-12 w-1/2 rounded-xl" />
          <Skeleton className="mx-auto h-6 w-2/3" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-14 w-48 rounded-xl" />
            <Skeleton className="h-14 w-40 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-8 pt-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 text-center">
                <Skeleton className="mx-auto h-10 w-24" />
                <Skeleton className="mx-auto h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Categories grid skeleton */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
