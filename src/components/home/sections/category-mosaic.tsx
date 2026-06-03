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
        <div className="rounded-2xl border border-dashed border-primary/30 bg-gradient-to-br from-accent/20 to-accent/5 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
            🎯
          </div>
          <h3 className="text-lg font-semibold text-foreground">Categories Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            We're preparing exciting topics for you to explore!
          </p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <SectionHeader 
        title="Explore by topic" 
        href="/categories"
      />
      
      <div className="space-y-6">
        {/* Pill Categories - Horizontal Scroller */}
        <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featuredCategories.map((category) => (
            <Link
              key={`pill-${category.slug}`}
              href={`/categories/${category.slug}`}
              className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-bold transition-all duration-200 hover:border-primary/30 hover:bg-accent/40 hover:shadow-sm"
            >
              <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                {category.icon}
              </span>
              <span>{category.name}</span>
              <span className="ml-1 rounded-full bg-muted/80 px-2 py-0.5 text-xs font-semibold text-muted-foreground transition-colors group-hover:bg-primary/20 group-hover:text-primary">
                {category.quizCount}
              </span>
            </Link>
          ))}
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCategories.slice(0, 6).map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative block overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {/* Gradient Background */}
              <div
                className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
                style={{
                  background: `radial-gradient(circle at 30% 20%, ${category.color}15, ${category.color}05)`,
                }}
              />
              
              {/* Content */}
              <div className="relative p-5">
                {/* Icon */}
                <div className="text-4xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {category.icon}
                </div>
                
                {/* Title and Stats */}
                <div className="mt-4">
                  <h3 className="text-xl font-black tracking-tight transition-colors group-hover:text-primary">
                    {category.name}
                  </h3>
                  
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5">
                      <svg
                        className="h-3 w-3 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span className="text-xs font-semibold">
                        {category.quizCount} {category.quizCount === 1 ? 'quiz' : 'quizzes'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {category.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
                      {category.description}
                    </p>
                  )}
                </div>
                
                {/* Arrow indicator on hover */}
                <div className="absolute bottom-5 right-5 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Bottom border animation */}
              <div
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: category.color }}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
