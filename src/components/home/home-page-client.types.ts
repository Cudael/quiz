import type { QuizCardData } from '@/components/ui/quiz-card'

export interface HomeFeaturedCategory {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  description: string
  quizCount: number
}

export interface CategoryWithQuizzes {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizzes: QuizCardData[]
}

export interface HomeTopPlayer {
  userId: string
  name: string
  image: string | null
  totalScore: number
}

export interface HomeStats {
  totalPlayers: number
  totalQuizzes: number
  totalQuestions: number
  totalCategories: number
}

export interface HomeCurrentUser {
  name: string | null
  xp: number
  level: number
  streakDays: number
}

export interface HomePageClientProps {
  featuredCategories: HomeFeaturedCategory[]
  categoriesWithQuizzes: CategoryWithQuizzes[]
  topPlayers: HomeTopPlayer[]
  stats: HomeStats
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
}
