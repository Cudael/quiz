import Link from 'next/link'
import type { CSSProperties } from 'react'
import type { HomeFeaturedCategory } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'
import { withAlphaColor } from '@/lib/utils'

const DEFAULT_CATEGORY_COLOR = '#7c3aed'

function getCategoryColor(color: string) {
  return /^#([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/.test(color) ? color : DEFAULT_CATEGORY_COLOR
}

export function CategoryMosaic({
  featuredCategories,
}: {
  featuredCategories: HomeFeaturedCategory[]
}) {
  return (
    <section>
      <SectionHeader title="Browse by Category" href="/categories" />
      {featuredCategories.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {featuredCategories.map((category) => {
            const categoryColor = getCategoryColor(category.color)

            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl p-3 text-center transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:[background-color:var(--tile-hover-bg)]"
                style={
                  {
                    '--tile-hover-bg': withAlphaColor(categoryColor, 0.25),
                    backgroundColor: withAlphaColor(categoryColor, 0.15),
                    border: `1px solid ${withAlphaColor(categoryColor, 0.25)}`,
                  } as CSSProperties
                }
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                  aria-hidden="true"
                />
                <span className="max-w-full truncate text-sm font-semibold">{category.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                </span>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Categories will appear here soon.
        </div>
      )}
    </section>
  )
}
