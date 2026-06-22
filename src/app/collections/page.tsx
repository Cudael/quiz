import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Boxes } from 'lucide-react'
import { quizCollections } from '@/content/collections'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Quiz Collections | BusQuiz',
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
  return (
    <div className="container mx-auto space-y-8 px-4 py-12 md:px-6">
      <section className="max-w-2xl">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <Boxes className="h-3.5 w-3.5" />
          Curated paths
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">Quiz Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Pick a focused set when you want a quick challenge, a warmup, or a cleaner way to explore
          BusQuiz.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quizCollections.map((collection) => (
          <Link
            key={collection.slug}
            href={`/collections/${collection.slug}`}
            className="group flex min-h-56 flex-col justify-between rounded-2xl border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <div>
              <h2 className="text-xl font-black tracking-tight">{collection.title}</h2>
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
