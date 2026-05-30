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
    <div className="w-full border-b border-border/20 bg-background py-4">
      <div className="container mx-auto px-4 md:px-6">
        <nav
          role="navigation"
          aria-label="Popular categories"
          className="grid grid-flow-col auto-cols-fr gap-2"
        >
          {categories.map((category) => {
            const isActive = pathname.startsWith(`/categories/${category.slug}`)
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                title={category.name}
                className={cn(
                  'group flex flex-col items-center gap-1.5 py-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative h-14 w-14 overflow-hidden rounded-xl shrink-0">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        backgroundColor: withAlphaColor(category.color, CATEGORY_ICON_BG_ALPHA),
                      }}
                    >
                      <DynamicIcon name={category.icon} className="h-7 w-7" />
                    </span>
                  )}
                </div>
                <p className="w-full truncate text-xs font-semibold leading-tight">
                  {category.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-none">
                  {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                </p>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
