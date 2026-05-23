'use client'

import { type FormEvent, type RefObject, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false

  const tagName = target.tagName.toLowerCase()
  return (
    target.isContentEditable ||
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select'
  )
}

export function GlobalSearch() {
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)
  const currentQuery = searchParams.get('q') ?? ''

  return <GlobalSearchForm key={currentQuery} initialQuery={currentQuery} inputRef={inputRef} />
}

function GlobalSearchForm({
  initialQuery,
  inputRef,
}: {
  initialQuery: string
  inputRef: RefObject<HTMLInputElement | null>
}) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isShortcut =
        event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')

      if (!isShortcut || isEditableTarget(event.target)) {
        return
      }

      event.preventDefault()
      inputRef.current?.focus()
      inputRef.current?.select()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputRef])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuery = query.trim()
    router.push(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search')
  }

  return (
    <>
      <form role="search" onSubmit={handleSubmit} className="hidden w-full max-w-sm md:block">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search quizzes..."
            aria-label="Search quizzes"
            data-global-search="true"
            className="h-9 border-border/60 bg-background/80 pl-9 pr-14"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-border/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
            /
          </span>
        </div>
      </form>

      <Button variant="ghost" size="icon" asChild className="md:hidden">
        <Link href="/search" aria-label="Open search">
          <Search className="h-5 w-5" />
        </Link>
      </Button>
    </>
  )
}
