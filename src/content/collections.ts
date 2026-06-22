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
]

export function getQuizCollection(slug: string) {
  return quizCollections.find((collection) => collection.slug === slug) ?? null
}
