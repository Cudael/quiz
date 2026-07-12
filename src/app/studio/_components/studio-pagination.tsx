import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StudioPaginationProps {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
  className?: string
}

export function StudioPagination({
  currentPage,
  totalPages,
  buildHref,
  className,
}: StudioPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Quiz list pagination"
      className={cn('flex items-center justify-between gap-3 text-sm', className)}
    >
      <PageLink
        direction="prev"
        href={currentPage > 1 ? buildHref(currentPage - 1) : undefined}
        label="Previous"
      />
      <span className="text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>
      <PageLink
        direction="next"
        href={currentPage < totalPages ? buildHref(currentPage + 1) : undefined}
        label="Next"
      />
    </nav>
  )
}

function PageLink({
  href,
  label,
  direction,
}: {
  href?: string
  label: string
  direction: 'prev' | 'next'
}) {
  const content = (
    <>
      {direction === 'prev' && <ChevronLeft className="h-4 w-4 shrink-0" />}
      {label}
      {direction === 'next' && <ChevronRight className="h-4 w-4 shrink-0" />}
    </>
  )

  const classes = cn(
    'inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 font-medium transition-colors',
    href ? 'hover:bg-muted' : 'cursor-not-allowed text-muted-foreground/50'
  )

  if (!href) {
    return (
      <span className={classes} aria-disabled="true">
        {content}
      </span>
    )
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  )
}
