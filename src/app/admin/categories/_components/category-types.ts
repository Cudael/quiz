export interface CategoryRecord {
  id: string
  name: string
  description: string
  icon: string
  color: string
  imageUrl: string | null
  parentSlug: string | null
  _count: {
    quizzes: number
  }
}
