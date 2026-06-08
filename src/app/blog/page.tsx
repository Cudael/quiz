import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, Tag } from 'lucide-react'
import { getAllBlogPosts } from '@/content/blog-posts'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Blog — BusQuiz',
  description:
    'Quiz tips, tutorials, platform news, and insights on quiz-based learning. Stay updated with the BusQuiz blog.',
  openGraph: {
    title: 'BusQuiz Blog',
    description: 'Quiz tips, tutorials, platform news, and insights on quiz-based learning.',
    url: absoluteUrl('/blog'),
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="container mx-auto px-4 py-10 md:px-6 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight">Blog</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Quiz tips, tutorials, platform news, and insights on quiz-based learning.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-accent/20 p-12 text-center">
            <p className="text-muted-foreground">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group rounded-2xl border border-border/50 bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
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
                  <h2 className="text-xl font-black tracking-tight transition-colors group-hover:text-primary">
                    {post.title}
                  </h2>
                </Link>

                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {post.description}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-4">
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
    </div>
  )
}
