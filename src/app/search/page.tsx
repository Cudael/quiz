import { headers } from 'next/headers'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCard, type QuizCardData } from '@/components/ui/quiz-card'
import { absoluteUrl } from '@/lib/site'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''

  const headerList = await headers()
  const host = headerList.get('host')
  const protocol =
    headerList.get('x-forwarded-proto') ??
    (host?.includes('localhost') || host?.startsWith('127.0.0.1') ? 'http' : 'https')
  const baseUrl = host ? `${protocol}://${host}` : absoluteUrl()

  const results = query
    ? ((await fetch(`${baseUrl}/api/search?q=${encodeURIComponent(query)}`, {
        cache: 'no-store',
      }).then((response) => response.json())) as SearchResult[])
    : []

  const description = query
    ? `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`
    : 'Search by quiz title or description.'

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader title="Search" description={description} />

      <form role="search" action="/search" className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search quizzes"
              aria-label="Search quizzes"
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {results.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4" aria-label="Search results">
          {results.map((result) => (
            <div key={result.id} className="space-y-3">
              <QuizCard quiz={result} />
              <div className="space-y-1">
                <p className="line-clamp-2 text-sm text-muted-foreground">{result.description}</p>
                <p className="text-xs text-muted-foreground">
                  {result.category.name} · by {result.author.name ?? 'Unknown author'}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : query ? (
        <EmptyState icon="🔎" title="No results found" description="Try a different search term." />
      ) : (
        <EmptyState
          icon="🔍"
          title="Search quizzes"
          description="Find published quizzes by title or description."
        />
      )}
    </div>
  )
}

interface SearchResult extends QuizCardData {
  description: string
  author: {
    name: string | null
  }
}
