import { Skeleton } from '@/components/ui/skeleton'

export default function StudioLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="mb-2 h-10 w-48" />
      <Skeleton className="mb-6 h-5 w-72" />
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}
