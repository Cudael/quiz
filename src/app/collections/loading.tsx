import { Skeleton } from '@/components/ui/skeleton'

export default function CollectionsLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="mb-2 h-10 w-56" />
      <Skeleton className="mb-8 h-5 w-80" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-5 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
