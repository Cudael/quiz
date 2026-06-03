import Link from 'next/link'
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
        <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
          <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {featuredCategories.map((category) => (
              <Link
                key={`pill-${category.slug}`}
                href={`/categories/${category.slug}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-2.5 text-sm font-bold transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span aria-hidden="true">{category.icon}</span>
                <span>{category.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {category.quizCount}
                </span>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCategories.slice(0, 6).map((category) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group relative rounded-2xl border border-border/50 p-5 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div
                  style={{
                    background: `linear-gradient(135deg, ${category.color}24, ${category.color}88)`,
                  }}
                  className="absolute inset-0 rounded-2xl opacity-90"
                ></div>
                <div className="relative">
                  <div className="text-3xl leading-none" aria-hidden="true">
                    {category.icon}
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-black tracking-tight">{category.name}</div>
                    <div className="mt-1.5 text-xs font-semibold opacity-80">
                      {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                    </div>
                    {category.description ? (
                      <div className="mt-2 line-clamp-2 text-sm font-medium opacity-85">
                        {category.description}
                      </div>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground bg-accent/20">
          Categories will appear here soon.
        </div>
      )}
    </section>
  )
}
