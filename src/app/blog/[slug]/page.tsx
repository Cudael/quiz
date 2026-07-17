import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import { getAllBlogPosts, getBlogPost, getRelatedPosts } from '@/content/blog-posts'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'
import { seoDescription, seoTitle } from '@/lib/seo-metadata'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  return {
    title: seoTitle(post.title),
    description: seoDescription(post.description, 'Read the latest quiz tips from BusQuiz.'),
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/blog/${post.slug}`),
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const relatedPosts = getRelatedPosts(slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      '@id': absoluteUrl('/#organization'),
      name: 'BusQuiz',
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/google-logo.png'),
      },
    },
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    url: absoluteUrl(`/blog/${post.slug}`),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: absoluteUrl(`/blog/${post.slug}`),
              },
            ],
          }),
        }}
      />

      <article className="container mx-auto px-4 py-10 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {Math.ceil(post.content.length / 1500)} min read
              </span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{post.title}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{post.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-sm bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div
            className="prose prose-neutral max-w-none dark:prose-invert
              prose-headings:font-extrabold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-p:leading-relaxed prose-p:text-foreground/85
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <aside className="mt-10 rounded-md border border-border/50 bg-muted/30 p-5">
            <h2 className="text-lg font-bold">Keep exploring BusQuiz</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Put these ideas into practice with curated trivia and popular community quizzes.
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/collections" className="text-primary hover:underline">
                Browse curated quiz collections
              </Link>
              <Link href="/categories" className="text-primary hover:underline">
                Explore quizzes by topic
              </Link>
              <Link href="/trending" className="text-primary hover:underline">
                Play trending quizzes
              </Link>
            </div>
          </aside>

          {relatedPosts.length > 0 && (
            <footer className="mt-16 border-t border-border/50 pt-8">
              <h2 className="text-xl font-extrabold tracking-tight mb-4">Related Posts</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group rounded-md border border-border/50 bg-card p-4 transition-shadow hover:shadow-sm"
                  >
                    <h3 className="font-bold transition-colors group-hover:text-primary">
                      {related.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">{related.description}</p>
                  </Link>
                ))}
              </div>
            </footer>
          )}
        </div>
      </article>
    </>
  )
}
