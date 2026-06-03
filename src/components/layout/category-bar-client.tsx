'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import * as LucideIcons from 'lucide-react'
import { cn, withAlphaColor } from '@/lib/utils'

export interface CategoryBarItem {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizCount: number
  totalPlayCount: number // Added for sorting weight
}

const CATEGORY_ICON_BG_ALPHA = 0.15
const SCROLL_AMOUNT = 200

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Icon = (LucideIcons as any)[name] as
    | React.ComponentType<{
        className?: string
        'aria-hidden'?: string
      }>
    | undefined
  if (!Icon) return null
  return <Icon className={className} aria-hidden="true" />
}

export function CategoryBarClient({ categories }: { categories: CategoryBarItem[] }) {
  const pathname = usePathname()
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)
  const [showLeftGradient, setShowLeftGradient] = React.useState(false)
  const [showRightGradient, setShowRightGradient] = React.useState(false)
  const [isHovering, setIsHovering] = React.useState(false)

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
    <div 
      className="relative w-full border-b border-border/20 bg-background/95 backdrop-blur-sm"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onKeyDown={handleKeyDown}
    >
      {/* Left gradient fade */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none" />
      )}

      {/* Right gradient fade */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
      )}

      {/* Scroll buttons - only show on hover */}
      {isHovering && showLeftGradient && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/90 p-1.5 shadow-lg backdrop-blur-sm transition-all hover:bg-accent hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/50"
          aria-label="Scroll left"
        >
          <LucideIcons.ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {isHovering && showRightGradient && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-background/90 p-1.5 shadow-lg backdrop-blur-sm transition-all hover:bg-accent hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-border/50"
          aria-label="Scroll right"
        >
          <LucideIcons.ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide px-4 md:px-6 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <nav
          role="navigation"
          aria-label="Categories"
          className="flex gap-3 min-w-max"
        >
          {categories.map((category) => {
            const isActive = pathname.startsWith(`/categories/${category.slug}`)
            const popularityScore = category.totalPlayCount
            const isPopular = popularityScore > 1000 // Adjust threshold as needed

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                title={`${category.name} - ${category.quizCount} quizzes, ${category.totalPlayCount} total plays`}
                className={cn(
                  'group relative flex flex-col items-center gap-2 px-3 py-2 transition-all duration-200 rounded-2xl',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground',
                  isPopular && !isActive && 'hover:scale-105'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Popular badge */}
                {isPopular && !isActive && (
                  <div className="absolute -top-1 -right-1 z-10">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[8px] font-bold text-white shadow-sm">
                      🔥
                    </div>
                  </div>
                )}

                {/* Icon/Image container */}
                <div className="relative h-12 w-12 overflow-hidden rounded-xl shrink-0 transition-transform duration-200 group-hover:scale-105">
                  {category.imageUrl ? (
                    <>
                      <Image
                        src={category.imageUrl}
                        alt={category.name}
                        fill
                        sizes="48px"
                        className="object-cover transition-all duration-300 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </>
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center transition-all duration-200 group-hover:scale-105"
                      style={{
                        backgroundColor: withAlphaColor(category.color, CATEGORY_ICON_BG_ALPHA),
                      }}
                    >
                      <DynamicIcon 
                        name={category.icon} 
                        className={cn(
                          "h-6 w-6 transition-all duration-200",
                          isActive ? "text-primary" : "group-hover:scale-110"
                        )}
                      />
                    </span>
                  )}
                </div>

                {/* Text content */}
                <div className="text-center">
                  <p className="max-w-[80px] truncate text-xs font-semibold leading-tight">
                    {category.name}
                  </p>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <LucideIcons.BookOpen className="h-2.5 w-2.5 opacity-60" />
                    <p className="text-[10px] text-muted-foreground leading-none">
                      {category.quizCount}
                    </p>
                  </div>
                </div>

                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute -bottom-3 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Scroll hint for mobile */}
      {!showLeftGradient && !showRightGradient && categories.length > 5 && (
        <div className="absolute right-2 bottom-1 z-10 md:hidden">
          <div className="flex animate-bounce items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[9px] text-muted-foreground backdrop-blur-sm">
            <LucideIcons.ChevronRight className="h-3 w-3" />
            scroll
          </div>
        </div>
      )}
    </div>
  )
}
