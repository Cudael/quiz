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
}

const CATEGORY_ICON_BG_ALPHA = 0.19

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

  if (categories.length === 0) return null

  return (
    <div className="sticky top-[57px] z-30 w-full border-b border-border/20 bg-background/80 py-2.5 backdrop-blur-sm">
      <div className="container mx-auto px-4 md:px-6">
        <div
          role="navigation"
          aria-label="Popular categories"
          className="flex gap-2 overflow-x-auto scrollbar-none"
        >
          {categories.map((category) => {
            const isActive = pathname.startsWith(`/categories/${category.slug}`)
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={cn(
                  'group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="relative flex h-4 w-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="16px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-4 w-4 items-center justify-center rounded-sm"
                      style={{
                        backgroundColor: withAlphaColor(category.color, CATEGORY_ICON_BG_ALPHA),
                      }}
                    >
                      <DynamicIcon name={category.icon} className="h-3.5 w-3.5" />
                    </span>
                  )}
                </span>
                <span className="whitespace-nowrap leading-none">{category.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
