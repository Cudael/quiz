'use client'

import * as React from 'react'
import Image from 'next/image'
import { Image as ImageIcon, Loader2, Search, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'

interface ImageResult {
  id: string
  thumbnail: string
  full: string
  alt: string
  photographer: string
  photographerUrl: string
}

interface ImageSearchDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (imageUrl: string) => void
  defaultQuery: string
  description?: string
}

export function ImageSearchDialog({
  open,
  onClose,
  onSelect,
  defaultQuery,
  description,
}: ImageSearchDialogProps) {
  const { addToast } = useToast()
  const [query, setQuery] = React.useState(defaultQuery)
  const [searching, setSearching] = React.useState(false)
  const [results, setResults] = React.useState<ImageResult[]>([])
  const [aiQuery, setAiQuery] = React.useState<string | null>(null)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)

  // Auto-search on mount when dialog opens
  React.useEffect(() => {
    if (defaultQuery) {
      void handleSearch(1, defaultQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(searchPage: number, searchQuery?: string) {
    const q = searchQuery ?? query
    if (!q.trim()) return

    setSearching(true)
    setResults([])
    setAiQuery(null)

    try {
      const params = new URLSearchParams({ q: q.trim(), page: String(searchPage) })
      if (description) params.set('description', description)

      const res = await fetch(`/api/images/search?${params}`)
      const data = (await res.json()) as {
        query?: string
        originalQuery?: string
        results: ImageResult[]
        totalPages: number
        error?: string
      }

      if (data.error) {
        addToast(data.error, 'error')
      } else {
        setResults(data.results)
        setTotalPages(data.totalPages)
        setPage(searchPage)
        if (data.query && data.query !== data.originalQuery) {
          setAiQuery(data.query)
        }
      }
    } catch {
      addToast('Failed to search images', 'error')
    } finally {
      setSearching(false)
    }
  }

  function handleSelect(image: ImageResult) {
    onSelect(image.full)
    addToast('Image selected!', 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Find free image" size="xl">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(1)}
              placeholder="Search free images..."
              className="w-full rounded-md border border-input bg-background py-2 pl-10 pr-3 text-base focus:outline-none focus:ring-2 focus:ring-primary md:text-sm"
            />
          </div>
          <Button onClick={() => handleSearch(1)} disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        {aiQuery && !searching && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            AI optimized search:{' '}
            <span className="font-medium text-foreground">&ldquo;{aiQuery}&rdquo;</span>
          </p>
        )}

        {searching ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <ImageIcon className="mb-3 h-10 w-10" />
            <p>No images found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => handleSelect(img)}
                  className="group relative overflow-hidden rounded-md border border-border transition-all hover:ring-2 hover:ring-primary"
                >
                  <div className="relative aspect-video w-full bg-muted">
                    <Image
                      src={img.thumbnail}
                      alt={img.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 transition-colors group-hover:bg-foreground/20" />
                    <div className="absolute bottom-0 left-0 right-0 translate-y-full px-2 py-1.5 text-[10px] text-primary-foreground transition-transform group-hover:translate-y-0 bg-foreground/60">
                      {img.photographer}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => handleSearch(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => handleSearch(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        <p className="text-[10px] text-muted-foreground">
          Images from{' '}
          <a
            href="https://unsplash.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Unsplash
          </a>
          . Free to use &mdash; no attribution required.
        </p>
      </div>
    </Modal>
  )
}
