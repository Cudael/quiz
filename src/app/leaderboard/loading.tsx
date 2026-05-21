export default function LeaderboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mb-4 h-10 w-full animate-pulse rounded bg-muted" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    </div>
  )
}
