import { Skeleton } from '@/components/ui/skeleton'

export default function BlogLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="mb-8 h-10 w-48" />
      <div className="space-y-8">
        <div className="overflow-hidden rounded-xl border border-border/40">
          <Skeleton className="aspect-[2/1] w-full" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border/40">
              <Skeleton className="aspect-[3/2] w-full" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
