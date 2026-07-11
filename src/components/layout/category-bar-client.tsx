'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { categoryIcons, ChevronLeft, ChevronRight } from '@/lib/category-icons'
import { cn, withAlphaColor } from '@/lib/utils'

export interface CategoryBarItem {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizCount: number
}

const SCROLL_AMOUNT = 200
const PILL_HOVER_ALPHA = 0.12

function CategoryIcon({ name }: { name: string }) {
  const Icon = categoryIcons[name]
  if (Icon) {
    return <Icon className="h-3.5 w-3.5" />
  }
  return <span className="text-[11px] leading-none">{name}</span>
}

export function CategoryBarClient({ categories }: { categories: CategoryBarItem[] }) {
  const pathname = usePathname()
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftGradient, setShowLeftGradient] = React.useState(false)
  const [showRightGradient, setShowRightGradient] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftGradient(scrollLeft > 10)
    setShowRightGradient(scrollLeft + clientWidth < scrollWidth - 10)
  }, [])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScroll()
    container.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)

    return () => {
      container.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scroll('left')
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scroll('right')
    }
  }

  if (categories.length === 0) return null

  return (
    <div className="relative w-full border-b border-border/30 bg-surface-1/50">
      <div className="container mx-auto px-4 py-2 md:px-6">
        {/* Left gradient fade */}
        {showLeftGradient && (
          <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
        )}

        {/* Right gradient fade */}
        {showRightGradient && (
          <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
        )}

        {showLeftGradient && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-md transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {showRightGradient && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-background/90 shadow-md transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide py-0.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onKeyDown={handleKeyDown}
        >
          <nav
            role="navigation"
            aria-label="Popular categories"
            className="flex min-w-max items-center gap-2 lg:min-w-0 lg:w-full lg:justify-between"
          >
            {categories.map((category) => {
              const isActive = pathname.startsWith(`/categories/${category.slug}`)
              const hoverTint = withAlphaColor(category.color, PILL_HOVER_ALPHA)

              return (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  title={`${category.name} - ${category.quizCount} quizzes`}
                  className={cn(
                    'group relative flex h-9 items-center gap-2 rounded-md border border-transparent px-3 py-2 text-sm font-semibold transition-colors duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    isActive
                      ? 'border-primary/30 bg-primary/15 text-primary'
                      : 'text-foreground/70 hover:text-foreground hover:[background-color:var(--pill-hover)]'
                  )}
                  style={
                    !isActive ? ({ '--pill-hover': hoverTint } as React.CSSProperties) : undefined
                  }
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="relative flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full">
                    {category.imageUrl ? (
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="20px"
                        className="object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <CategoryIcon name={category.icon} />
                    )}
                  </div>

                  <span className="max-w-[110px] truncate">{category.name}</span>
                  <div className="rounded-sm bg-muted/80 px-2 py-0.5 text-[11px] font-semibold text-foreground/60">
                    {category.quizCount}
                  </div>

                  {isActive && (
                    <div className="absolute inset-x-4 -bottom-[10px] border-b-2 border-primary" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
