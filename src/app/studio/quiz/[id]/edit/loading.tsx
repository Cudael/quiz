import { Skeleton } from '@/components/ui/skeleton'

export default function StudioEditLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Step progress bar */}
      <div className="sticky top-0 z-20 border-b bg-card px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-1 items-center gap-2">
                <Skeleton className="h-7 w-20 rounded-full" />
                {i < 3 && <div className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Step content */}
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20 border-t bg-card px-4 py-3">
        <div className="container mx-auto flex max-w-4xl items-center justify-between">
          <Skeleton className="h-9 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}
