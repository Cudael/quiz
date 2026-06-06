import { describe, expect, it } from 'vitest'
import {
  buildLeaderboardQuery,
  getPeriodStart,
  parseLeaderboardSearchParams,
  toggleCategory,
} from './params'

describe('leaderboard params', () => {
  it('parses modern and legacy URL params safely', () => {
    expect(
      parseLeaderboardSearchParams({
        range: 'week',
        mode: 'timed',
        sort: 'best',
        page: '3',
        category: ['science', 'science', 'history'],
        quizId: 'quiz-123',
      })
    ).toEqual({
      period: 'week',
      mode: 'ALL',
      sort: 'best',
      page: 3,
      categories: ['science', 'history'],
      quizId: 'quiz-123',
    })
  })

  it('builds URL params using the new period key', () => {
    expect(
      buildLeaderboardQuery({
        period: 'today',
        mode: 'ALL',
        sort: 'accuracy',
        page: 2,
        categories: ['science'],
        quizId: 'quiz-123',
      })
    ).toBe('period=today&sort=accuracy&page=2&quizId=quiz-123&category=science')
  })

  it('toggles category filters and computes supported periods', () => {
    expect(toggleCategory(['science', 'history'], 'science')).toEqual(['history'])
    expect(toggleCategory(['history'], 'science')).toEqual(['history', 'science'])
    expect(getPeriodStart('all')).toBeUndefined()
    expect(getPeriodStart('week')).toBeInstanceOf(Date)
    expect(getPeriodStart('today')).toBeInstanceOf(Date)
  })
})
