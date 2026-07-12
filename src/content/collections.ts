export interface QuizCollection {
  slug: string
  title: string
  description: string
  categorySlugs?: string[]
  difficulties?: Array<'EASY' | 'MEDIUM' | 'HARD'>
  sort: 'popular' | 'newest' | 'rating'
}

export const quizCollections: QuizCollection[] = [
  {
    slug: 'geography-starter-pack',
    title: 'Geography Starter Pack',
    description: 'Map, country, and place-name quizzes that are friendly for new players.',
    categorySlugs: ['geography'],
    difficulties: ['EASY', 'MEDIUM'],
    sort: 'popular',
  },
  {
    slug: 'science-warmups',
    title: 'Science Warmups',
    description: 'Quick science quizzes for building momentum before harder challenges.',
    categorySlugs: ['science'],
    difficulties: ['EASY', 'MEDIUM'],
    sort: 'popular',
  },
  {
    slug: 'hard-trivia-challenge',
    title: 'Hard Trivia Challenge',
    description: 'A tougher set for players chasing big scores, badges, and bragging rights.',
    difficulties: ['HARD'],
    sort: 'popular',
  },
  {
    slug: 'five-minute-quiz-break',
    title: '5 Minute Quiz Break',
    description: 'Short, popular quizzes for a fast burst of trivia between tasks.',
    difficulties: ['EASY', 'MEDIUM'],
    sort: 'newest',
  },
  {
    slug: 'history-deep-dives',
    title: 'History Quiz Deep Dives',
    description:
      'Explore civilizations, conflicts, leaders, and turning points through challenging history quizzes.',
    categorySlugs: ['history'],
    sort: 'popular',
  },
  {
    slug: 'world-geography-challenge',
    title: 'World Geography Challenge',
    description:
      'Test your knowledge of countries, capitals, flags, landmarks, and physical geography.',
    categorySlugs: ['geography'],
    difficulties: ['MEDIUM', 'HARD'],
    sort: 'popular',
  },
  {
    slug: 'technology-trivia',
    title: 'Technology Trivia Collection',
    description:
      'Quiz yourself on computing, software, hardware, inventions, and the history of technology.',
    categorySlugs: ['technology'],
    sort: 'newest',
  },
  {
    slug: 'sports-trivia-challenge',
    title: 'Sports Trivia Challenge',
    description:
      'Take on quizzes about athletes, teams, tournaments, records, and unforgettable sporting moments.',
    categorySlugs: ['sports'],
    sort: 'popular',
  },
]

export function getQuizCollection(slug: string) {
  return quizCollections.find((collection) => collection.slug === slug) ?? null
}
