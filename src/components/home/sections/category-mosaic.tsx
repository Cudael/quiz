import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { HomeFeaturedCategory } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'

export function CategoryMosaic({
  featuredCategories,
}: {
  featuredCategories: HomeFeaturedCategory[]
}) {
  return (
    <section>
      <SectionHeader title="Explore by topic" href="/categories" />
      {featuredCategories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featuredCategories.slice(0, 8).map((category, index) => {
            const isLarge = index === 0
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className={cn(
                  isLarge ? 'col-span-2 row-span-2' : 'col-span-1',
                  'group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl block hover:z-10'
                )}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}20, ${category.color}85)`,
                  }}
                  className="relative flex h-full min-h-[8rem] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-border/30 p-5 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-[1.01]"
                >
                  {/* Subtle glow on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${category.color}15, transparent 70%)`,
                    }}
                  />
                  <div
                    className={cn(
                      'relative leading-none drop-shadow-sm',
                      isLarge ? 'text-5xl' : 'text-3xl'
                    )}
                    aria-hidden="true"
                  >
                    {category.icon}
                  </div>
                  <div className="relative mt-4">
                    <div
                      className={cn(
                        'font-black tracking-tight',
                        isLarge ? 'text-2xl md:text-3xl' : 'text-base'
                      )}
                    >
                      {category.name}
                    </div>
                    {isLarge && category.description ? (
                      <div className="mt-1.5 line-clamp-2 text-sm opacity-85 font-medium">
                        {category.description}
                      </div>
                    ) : null}
                    <div className="mt-1.5 text-xs opacity-70 font-semibold">
                      {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                    </div>
                  </div>
                </div>
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
