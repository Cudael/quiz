import { Skeleton } from '@/components/ui/skeleton'

export default function BadgesLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <Skeleton className="mb-2 h-10 w-40" />
      <Skeleton className="mb-8 h-5 w-64" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 p-4 space-y-2">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}
