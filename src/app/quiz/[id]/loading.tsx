import { Skeleton } from '@/components/ui/skeleton'

export default function QuizDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Skeleton className="mb-6 h-9 w-40" />
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-40 rounded-xl" />
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
