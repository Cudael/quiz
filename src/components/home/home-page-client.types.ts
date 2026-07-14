import type { QuizCardData } from '@/components/ui/quiz-card'

export interface CategoryWithQuizzes {
  slug: string | null
  name: string
  icon: string
  color: string
  imageUrl?: string
  quizzes: QuizCardData[]
}

export interface HomeCurrentUser {
  username: string | null
  xp: number
  level: number
  streakDays: number
}

export interface BadgePreview {
  slug: string | null
  name: string
  description: string
  emoji: string
  earnedCount: number
}

export interface TodayChallengeQuiz {
  id: string
  title: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  categoryName: string
  questionCount: number
}

export interface HomePageClientProps {
  categoriesWithQuizzes: CategoryWithQuizzes[]
  popularQuizzes: QuizCardData[]
  hallOfFameQuizzes: QuizCardData[]
  trendingQuizzes: QuizCardData[]
  newestQuizzes: QuizCardData[]
  personalizedQuizzes: QuizCardData[]
  recentlyPlayed: QuizCardData[]
  currentUser: HomeCurrentUser | null
  badgePreviews: BadgePreview[]
  totalQuizCount: number
  todayChallenge: TodayChallengeQuiz | null
}
