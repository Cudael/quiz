import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { quizCollections } from '@/content/collections'
import { absoluteUrl } from '@/lib/site'
import { serializeJsonLd } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Quiz Collections',
  description: 'Browse curated quiz collections for focused trivia practice and quick challenges.',
  alternates: { canonical: '/collections' },
  openGraph: {
    title: 'Quiz Collections | BusQuiz',
    description:
      'Browse curated quiz collections for focused trivia practice and quick challenges.',
    url: absoluteUrl('/collections'),
  },
}

export default function CollectionsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Quiz Collections',
    description: metadata.description,
    url: absoluteUrl('/collections'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: quizCollections.map((collection, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: collection.title,
        description: collection.description,
        url: absoluteUrl(`/collections/${collection.slug}`),
      })),
    },
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-12 md:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <section className="max-w-2xl">
        <PageHeader
          className="mb-0"
          eyebrow="Curated paths"
          accent="green"
          title="Quiz Collections"
          description="Pick a focused set when you want a quick challenge, a warmup, or a cleaner way to explore BusQuiz."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quizCollections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group flex min-h-56 flex-col justify-between rounded-md border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">{collection.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
            </div>
            <span className="mt-6 inline-flex items-center text-sm font-bold text-primary">
              Browse collection
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
