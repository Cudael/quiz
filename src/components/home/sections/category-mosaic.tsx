import Link from 'next/link'
import type { HomeFeaturedCategory } from '../home-page-client.types'
import { SectionHeader } from './section-primitives'

export function CategoryMosaic({
  featuredCategories,
}: {
  featuredCategories: HomeFeaturedCategory[]
}) {
  if (featuredCategories.length === 0) {
    return (
      <section>
        <SectionHeader title="Explore by topic" href="/categories" />
        <div className="rounded-xl border border-border/30 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">Categories will appear here soon.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeader title="Browse topics" href="/categories" />
      
      <div className="space-y-5">
        {/* Quick filter pills - minimal horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredCategories.map((category) => (
            <Link
              key={`pill-${category.slug}`}
              href={`/categories/${category.slug}`}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium transition-all hover:border-primary/40 hover:bg-accent/50 hover:shadow-sm"
            >
              <span className="text-base">{category.icon}</span>
              <span>{category.name}</span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {category.quizCount}
              </span>
            </Link>
          ))}
        </div>

        {/* Category cards - clean grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-border/40 bg-card p-3 transition-all hover:border-primary/30 hover:bg-accent/30 hover:shadow-sm"
            >
              {/* Icon */}
              <div 
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl transition-all group-hover:scale-105"
                style={{ backgroundColor: `${category.color}15` }}
              >
                {category.icon}
              </div>
              
              {/* Text content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                    {category.name}
                  </h3>
                  <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                    {category.quizCount}
                  </span>
                </div>
                {category.description && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
              
              {/* Chevron indicator */}
              <svg
                className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
