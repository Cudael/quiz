import type { Metadata } from 'next'
import Link from 'next/link'
import { Lightbulb, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Trivia Facts | BusQuiz',
  description:
    'Fascinating trivia facts that will blow your mind. Learn something new every day with BusQuiz.',
  alternates: { canonical: '/trivia-facts' },
  openGraph: {
    title: 'Mind-Blowing Trivia Facts | BusQuiz',
    description:
      'Discover fascinating trivia facts across science, history, nature, and pop culture.',
    url: absoluteUrl('/trivia-facts'),
  },
}

const TRIVIA_FACTS = [
  {
    category: 'Science',
    emoji: '🔬',
    fact: 'A teaspoon of neutron star material would weigh about 6 billion tons — roughly the weight of Mount Everest.',
    source: 'NASA Astrophysics',
  },
  {
    category: 'History',
    emoji: '🏛️',
    fact: 'Cleopatra lived closer in time to the invention of the iPhone than to the building of the Great Pyramid of Giza.',
    source: 'Historical Timeline Analysis',
  },
  {
    category: 'Nature',
    emoji: '🌿',
    fact: 'There are more trees on Earth than stars in the Milky Way galaxy — approximately 3 trillion trees vs 100-400 billion stars.',
    source: 'Nature Journal, 2015',
  },
  {
    category: 'Language',
    emoji: '📚',
    fact: "The word 'set' has the most definitions in the English language — over 430 different meanings in the Oxford English Dictionary.",
    source: 'Oxford English Dictionary',
  },
  {
    category: 'Space',
    emoji: '🚀',
    fact: 'If you could fold a piece of paper 42 times, it would reach the Moon. 103 folds would make it as thick as the observable universe.',
    source: 'Exponential Growth Mathematics',
  },
  {
    category: 'Animals',
    emoji: '🐙',
    fact: 'Octopuses have three hearts, blue blood, and their brain is donut-shaped with their esophagus running through the middle.',
    source: 'Marine Biology Studies',
  },
  {
    category: 'Technology',
    emoji: '💻',
    fact: 'The first computer bug was an actual moth found trapped in a relay of the Harvard Mark II computer in 1947.',
    source: 'Computer History Museum',
  },
  {
    category: 'Geography',
    emoji: '🌍',
    fact: "Australia is wider than the Moon. The Moon''s diameter is 3,474 km, while Australia spans nearly 4,000 km east to west.",
    source: 'NASA / Geoscience Australia',
  },
  {
    category: 'Food',
    emoji: '🍕',
    fact: 'Honey never spoils. Archaeologists have found 3,000-year-old pots of honey in Egyptian tombs that are still perfectly edible.',
    source: 'National Geographic',
  },
  {
    category: 'Sports',
    emoji: '⚽',
    fact: 'In 1998, a soccer match in the Democratic Republic of Congo was struck by lightning, killing an entire team of 11 players. The opposing team walked away unharmed.',
    source: 'Guinness World Records',
  },
  {
    category: 'Music',
    emoji: '🎵',
    fact: 'Listening to music triggers the same pleasure centers in the brain as eating chocolate, having sex, or taking certain drugs.',
    source: 'Nature Neuroscience, McGill University',
  },
  {
    category: 'Human Body',
    emoji: '🧠',
    fact: 'Your brain generates about 12-25 watts of electricity — enough to power a small LED light bulb.',
    source: 'MIT Neuroscience',
  },
  {
    category: 'Oceans',
    emoji: '🌊',
    fact: "We have better maps of Mars than we do of Earth''s ocean floor. More than 80% of the ocean remains unmapped.",
    source: 'NOAA Ocean Exploration',
  },
  {
    category: 'Art',
    emoji: '🎨',
    fact: "Van Gogh only sold one painting during his lifetime — 'The Red Vineyard'. After his death, his work became among the most valuable in history.",
    source: 'Van Gogh Museum, Amsterdam',
  },
  {
    category: 'Psychology',
    emoji: '🧩',
    fact: "The 'spotlight effect': people consistently overestimate how much others notice their appearance and behavior. Everyone is too busy worrying about themselves.",
    source: 'Journal of Personality and Social Psychology',
  },
  {
    category: 'Inventions',
    emoji: '💡',
    fact: 'The microwave oven was invented by accident when an engineer named Percy Spencer noticed that a radar wave had melted the chocolate bar in his pocket.',
    source: 'IEEE History Center',
  },
  {
    category: 'Weather',
    emoji: '⛈️',
    fact: 'A single lightning bolt contains enough energy to toast 100,000 slices of bread.',
    source: 'National Weather Service',
  },
  {
    category: 'Literature',
    emoji: '📖',
    fact: "The world''s longest sentence in a published novel is 13,955 words long, found in 'The Rotter''s Club'' by Jonathan Coe.",
    source: 'Literary Guinness Records',
  },
  {
    category: 'Dinosaurs',
    emoji: '🦕',
    fact: 'The Tyrannosaurus rex lived closer in time to humans (66 million years ago) than to the Stegosaurus (150 million years ago).',
    source: 'Natural History Museum, London',
  },
  {
    category: 'Internet',
    emoji: '🌐',
    fact: 'Every minute, 500 hours of video are uploaded to YouTube, 6 million people shop online, and 350,000 tweets are posted.',
    source: 'Data Never Sleeps Annual Report',
  },
]

export default function TriviaFactsPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 md:py-16">
      {/* Hero */}
      <div className="mb-10 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-sm border bg-card px-3 py-1 text-xs font-bold text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" />
          Did You Know?
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Trivia Facts</h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Fascinating facts from across the universe — science, history, nature, and everything in
          between. Impress your friends at the next dinner party.
        </p>
      </div>

      {/* Daily featured fact */}
      <div className="relative mb-12 overflow-hidden rounded-md border border-t-4 border-t-quiz-orange bg-card p-6 md:p-8">
        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm bg-quiz-orange/15 px-2.5 py-0.5 text-xs font-bold text-quiz-orange">
              <Sparkles className="h-3 w-3" />
              Featured Fact
            </span>
          </div>
          <p className="text-lg sm:text-xl font-bold leading-relaxed">
            “{TRIVIA_FACTS[new Date().getDate() % TRIVIA_FACTS.length].fact}”
          </p>
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <span>{TRIVIA_FACTS[new Date().getDate() % TRIVIA_FACTS.length].emoji}</span>
            <span>{TRIVIA_FACTS[new Date().getDate() % TRIVIA_FACTS.length].category}</span>
            <span>·</span>
            <span>{TRIVIA_FACTS[new Date().getDate() % TRIVIA_FACTS.length].source}</span>
          </div>
        </div>
      </div>

      {/* Fact grid */}
      <div className="mb-10">
        <h2 className="mb-5 text-2xl font-extrabold tracking-tight">Explore All Facts</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRIVIA_FACTS.map((item, i) => (
            <div
              key={i}
              className="group flex flex-col gap-3 rounded-md border border-border/50 bg-card p-5 transition-all hover:-translate-y-1 hover:border-quiz-purple/30 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.emoji}</span>
                <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {item.category}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{item.fact}</p>
              <p className="mt-auto text-[10px] text-muted-foreground/60">Source: {item.source}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-md border border-border/40 bg-card p-6 text-center md:p-8">
        <h2 className="text-xl font-extrabold">Think you know your trivia?</h2>
        <p className="mt-2 text-muted-foreground">
          Put your knowledge to the test with thousands of quizzes.
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
