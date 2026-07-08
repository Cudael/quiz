import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Tag } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { getAllBlogPosts } from '@/content/blog-posts'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Quiz tips, tutorials, platform news, and insights on quiz-based learning. Stay updated with the BusQuiz blog.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'BusQuiz Blog',
    description: 'Quiz tips, tutorials, platform news, and insights on quiz-based learning.',
    url: absoluteUrl('/blog'),
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BusQuiz Blog',
    description: 'Quiz tips, tutorials, platform news, and insights on quiz-based learning.',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const [featured, ...rest] = posts

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">
      <PageHeader
        className="mb-10"
        eyebrow="News & tips"
        accent="blue"
        title="Blog"
        description="Quiz tips, tutorials, platform news, and insights on quiz-based learning."
      />

      {posts.length === 0 ? (
        <div className="rounded-md border border-dashed bg-accent/20 p-12 text-center">
          <p className="text-muted-foreground">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Featured post */}
          {featured && (
            <article className="group rounded-md border border-border/50 bg-card p-6 md:p-8 transition-shadow hover:shadow-md">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(featured.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.ceil(featured.content.length / 1500)} min read
                </span>
              </div>

              <Link href={`/blog/${featured.slug}`} className="block">
                <h2 className="text-2xl font-extrabold tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                  {featured.title}
                </h2>
              </Link>

              <p className="mt-3 text-base leading-relaxed text-foreground/70">
                {featured.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {featured.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-sm bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/60"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5">
                <Link
                  href={`/blog/${featured.slug}`}
                  className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Read more →
                </Link>
              </div>
            </article>
          )}

          {/* Remaining posts in grid */}
          {rest.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2">
              {rest.map((post) => (
                <article
                  key={post.slug}
                  className="group rounded-md border border-border/50 bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.ceil(post.content.length / 1500)} min read
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`} className="block">
                    <h3 className="text-lg font-bold tracking-tight transition-colors group-hover:text-primary">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="mt-2 text-sm leading-relaxed text-foreground/70 line-clamp-3">
                    {post.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-sm bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/60"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      Read more →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
