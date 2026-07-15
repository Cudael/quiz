import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Lightbulb, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Trivia Facts',
  description:
    'Explore carefully sourced trivia facts from NASA, NOAA, the Smithsonian, and other authoritative references.',
  alternates: { canonical: '/trivia-facts' },
  openGraph: {
    title: 'Carefully Sourced Trivia Facts | BusQuiz',
    description: 'Discover sourced facts across science, nature, space, and technology.',
    url: absoluteUrl('/trivia-facts'),
  },
}

const TRIVIA_FACTS = [
  {
    category: 'Space',
    emoji: '🪐',
    fact: 'A complete rotation of Venus takes 243 Earth days, while one orbit around the Sun takes about 225 Earth days.',
    source: 'NASA Science',
    sourceUrl: 'https://science.nasa.gov/venus/venus-facts/',
  },
  {
    category: 'Animals',
    emoji: '🐙',
    fact: 'Octopuses and other cephalopods have three hearts and blue blood. Copper-based hemocyanin gives the blood its color.',
    source: 'Smithsonian Ocean',
    sourceUrl: 'https://ocean.si.edu/ocean-life/invertebrates/octopuses-squids-and-relatives',
  },
  {
    category: 'Technology',
    emoji: '💻',
    fact: 'In 1947, engineers found a moth caught in a relay of the Harvard Mark II and recorded it as the first actual computer bug found.',
    source: 'Computer History Museum',
    sourceUrl: 'https://www.computerhistory.org/tdih/September/09/',
  },
  {
    category: 'Weather',
    emoji: '⛈️',
    fact: 'Lightning can heat the surrounding air to about 30,000°C, roughly five times the temperature of the Sun’s surface.',
    source: 'NOAA',
    sourceUrl:
      'https://www.nesdis.noaa.gov/about/k-12-education/severe-weather/what-causes-lightning-and-thunder',
  },
  {
    category: 'Moon',
    emoji: '🌕',
    fact: 'The Moon has no atmosphere, wind, or rain to sweep away astronaut tracks, allowing them to remain visible decades later.',
    source: 'NASA Science',
    sourceUrl: 'https://science.nasa.gov/moon/lunar-craters/why-study-craters/',
  },
  {
    category: 'Oceans',
    emoji: '🌊',
    fact: 'As of April 2026, 28.7% of the global seafloor had been mapped with modern high-resolution technology.',
    source: 'NOAA Ocean Exploration',
    sourceUrl: 'https://oceanexplorer.noaa.gov/ocean-fact/explored/',
  },
  {
    category: 'Earth',
    emoji: '🌍',
    fact: 'Light from the Sun takes about eight minutes to reach Earth.',
    source: 'NASA Science',
    sourceUrl: 'https://science.nasa.gov/earth/facts/',
  },
  {
    category: 'Calendar',
    emoji: '📅',
    fact: 'Earth takes about 365.2422 days to orbit the Sun, which is why calendars periodically add a leap day.',
    source: 'NASA Jet Propulsion Laboratory',
    sourceUrl: 'https://www.jpl.nasa.gov/edu/news/doing-the-math-on-why-we-have-leap-day/',
  },
] as const

export default function TriviaFactsPage() {
  const featuredFact = TRIVIA_FACTS[new Date().getDate() % TRIVIA_FACTS.length]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-sm border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" />
          Did You Know?
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Trivia Facts</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          A small collection of fascinating facts checked against authoritative sources. Follow any
          source link to explore the subject in more depth.
        </p>
      </div>

      <div className="relative mb-12 overflow-hidden rounded-md border border-t-4 border-t-quiz-orange bg-card p-6 md:p-8">
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-sm bg-quiz-orange/15 px-2.5 py-0.5 text-xs font-bold text-quiz-orange">
            <Sparkles className="h-3 w-3" />
            Featured Fact
          </span>
        </div>
        <p className="text-lg font-bold leading-relaxed sm:text-xl">“{featuredFact.fact}”</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{featuredFact.emoji}</span>
          <span>{featuredFact.category}</span>
          <span aria-hidden="true">·</span>
          <a
            href={featuredFact.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-4"
          >
            {featuredFact.source}
          </a>
        </div>
      </div>

      <section className="mb-10" aria-labelledby="all-facts-heading">
        <h2 id="all-facts-heading" className="mb-5 text-2xl font-extrabold tracking-tight">
          Explore All Facts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRIVIA_FACTS.map((item) => (
            <article
              key={item.fact}
              className="group flex flex-col gap-3 rounded-md border border-border/50 bg-card p-5 transition-all hover:-translate-y-1 hover:border-quiz-purple/30 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{item.fact}</p>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto text-xs font-semibold text-primary underline underline-offset-4"
              >
                Source: {item.source}
              </a>
            </article>
          ))}
        </div>
      </section>

      <div className="rounded-md border border-border/40 bg-card p-6 text-center md:p-8">
        <h2 className="text-xl font-extrabold">Think you know your trivia?</h2>
        <p className="mt-2 text-muted-foreground">
          Put your knowledge to the test with free quizzes across a growing range of topics.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="rounded-md font-bold">
            <Link href="/random-quiz">
              Take a Random Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md">
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
