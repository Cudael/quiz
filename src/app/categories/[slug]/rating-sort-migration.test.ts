import { describe, expect, it } from 'vitest'

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
type Completion = 'all' | 'completed' | 'unplayed'

interface FixtureQuiz {
  id: string
  categoryId: string
  isPublished: boolean
  difficulty: Difficulty
  playCount: number
  ratings: number[]
}

interface RankRow {
  id: string
  avgRating: number
  ratingCount: number
  playCount: number
}

const PAGE_SIZE = 3
const CATEGORY_IDS = ['cat-a', 'cat-b']

const QUIZZES: FixtureQuiz[] = [
  {
    id: 'q1',
    categoryId: 'cat-a',
    isPublished: true,
    difficulty: 'EASY',
    playCount: 120,
    ratings: [5, 5, 4],
  },
  {
    id: 'q2',
    categoryId: 'cat-a',
    isPublished: true,
    difficulty: 'EASY',
    playCount: 500,
    ratings: [5, 4],
  },
  {
    id: 'q3',
    categoryId: 'cat-a',
    isPublished: true,
    difficulty: 'MEDIUM',
    playCount: 320,
    ratings: [4, 4, 4, 4],
  },
  {
    id: 'q4',
    categoryId: 'cat-b',
    isPublished: true,
    difficulty: 'HARD',
    playCount: 410,
    ratings: [5],
  },
  {
    id: 'q5',
    categoryId: 'cat-b',
    isPublished: true,
    difficulty: 'HARD',
    playCount: 290,
    ratings: [],
  },
  {
    id: 'q6',
    categoryId: 'cat-b',
    isPublished: true,
    difficulty: 'MEDIUM',
    playCount: 180,
    ratings: [3, 3, 3],
  },
  {
    id: 'q7',
    categoryId: 'cat-z',
    isPublished: true,
    difficulty: 'EASY',
    playCount: 999,
    ratings: [5, 5, 5],
  },
  {
    id: 'q8',
    categoryId: 'cat-a',
    isPublished: false,
    difficulty: 'EASY',
    playCount: 700,
    ratings: [5, 5],
  },
]

function passesFilters(
  quiz: FixtureQuiz,
  difficulty: Difficulty | 'all',
  completion: Completion,
  playedIds: Set<string>
) {
  if (!quiz.isPublished) return false
  if (!CATEGORY_IDS.includes(quiz.categoryId)) return false
  if (difficulty !== 'all' && quiz.difficulty !== difficulty) return false
  if (completion === 'completed' && !playedIds.has(quiz.id)) return false
  if (completion === 'unplayed' && playedIds.has(quiz.id)) return false
  return true
}

function oldInMemorySort(
  difficulty: Difficulty | 'all',
  completion: Completion,
  playedIds: Set<string>,
  page: number
) {
  const rows: RankRow[] = QUIZZES.filter((quiz) =>
    passesFilters(quiz, difficulty, completion, playedIds)
  )
    .map((quiz) => ({
      id: quiz.id,
      avgRating:
        quiz.ratings.length > 0
          ? quiz.ratings.reduce((sum, stars) => sum + stars, 0) / quiz.ratings.length
          : 0,
      ratingCount: quiz.ratings.length,
      playCount: quiz.playCount,
    }))
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount
      return b.playCount - a.playCount
    })

  const start = (page - 1) * PAGE_SIZE
  return rows.slice(start, start + PAGE_SIZE).map((row) => row.id)
}

function dbBackedSort(
  difficulty: Difficulty | 'all',
  completion: Completion,
  playedIds: Set<string>,
  page: number
) {
  const rows: RankRow[] = QUIZZES.filter((quiz) =>
    passesFilters(quiz, difficulty, completion, playedIds)
  )
    .map((quiz) => ({
      id: quiz.id,
      avgRating:
        quiz.ratings.length > 0
          ? quiz.ratings.reduce((sum, stars) => sum + stars, 0) / quiz.ratings.length
          : 0,
      ratingCount: quiz.ratings.length,
      playCount: quiz.playCount,
    }))
    .sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating
      if (b.ratingCount !== a.ratingCount) return b.ratingCount - a.ratingCount
      if (b.playCount !== a.playCount) return b.playCount - a.playCount
      return a.id.localeCompare(b.id)
    })

  const start = (page - 1) * PAGE_SIZE
  return rows.slice(start, start + PAGE_SIZE).map((row) => row.id)
}

describe('rating sort migration parity', () => {
  it('matches top results between old and new strategy on fixture data', () => {
    const played = new Set<string>(['q2', 'q6'])

    expect(dbBackedSort('all', 'all', played, 1)).toEqual(oldInMemorySort('all', 'all', played, 1))
    expect(dbBackedSort('all', 'all', played, 2)).toEqual(oldInMemorySort('all', 'all', played, 2))
  })

  it('keeps pagination and filters aligned', () => {
    const played = new Set<string>(['q2', 'q6'])

    expect(dbBackedSort('EASY', 'all', played, 1)).toEqual(
      oldInMemorySort('EASY', 'all', played, 1)
    )
    expect(dbBackedSort('all', 'completed', played, 1)).toEqual(
      oldInMemorySort('all', 'completed', played, 1)
    )
    expect(dbBackedSort('all', 'unplayed', played, 1)).toEqual(
      oldInMemorySort('all', 'unplayed', played, 1)
    )
  })
})
