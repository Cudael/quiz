import type { QuizCardData } from '@/components/ui/quiz-card'

export interface CategoryWithQuizzes {
  slug: string
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizzes: QuizCardData[]
}

export interface HomeCurrentUser {
  name: string | null
  xp: number
  level: number
  streakDays: number
}

export interface BadgePreview {
  slug: string
  name: string
  description: string
  emoji: string
  earnedCount: number
}

export interface HomePageClientProps {
  categoriesWithQuizzes: CategoryWithQuizzes[]
  popularQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
  badgePreviews: BadgePreview[]
  totalQuizCount: number
}
