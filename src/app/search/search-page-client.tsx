'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { PageHeader } from '@/components/ui/page-header'
import { QuizCard, type QuizCardData } from '@/components/ui/quiz-card'

interface SearchResult extends QuizCardData {
  description: string
  author: {
    name: string | null
  }
}

export function SearchPageClient({ initialQuery }: { initialQuery: string }) {
  return <SearchPageContent key={initialQuery} initialQuery={initialQuery} />
}

function SearchPageContent({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(initialQuery))

  useEffect(() => {
    if (!initialQuery) {
      return
    }

    const controller = new AbortController()

    async function loadResults() {
      setIsLoading(true)

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(initialQuery)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          setResults([])
          return
        }

        const payload = (await response.json()) as SearchResult[]
        setResults(payload)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setResults([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadResults()

    return () => controller.abort()
  }, [initialQuery])

  const resultSummary = useMemo(() => {
    if (!initialQuery) {
      return 'Search by quiz title or description.'
    }

    if (isLoading) {
      return 'Searching...'
    }

    return `${results.length} result${results.length === 1 ? '' : 's'} for “${initialQuery}”`
  }, [initialQuery, isLoading, results.length])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search')
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader title="Search" description={resultSummary} />

      <form role="search" onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search quizzes"
              aria-label="Search quizzes"
              className="pl-9"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>

      {isLoading ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching quizzes...
          </div>
        </div>
      ) : results.length > 0 ? (
        <div
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          aria-live="polite"
          aria-label="Search results"
        >
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
      ) : initialQuery ? (
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
