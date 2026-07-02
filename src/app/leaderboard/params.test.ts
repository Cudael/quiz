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
        sort: 'best',
        page: '3',
        category: ['science', 'science', 'history'],
        quizId: 'quiz-123',
      })
    ).toEqual({
      period: 'week',
      sort: 'best',
      scope: 'global',
      page: 3,
      categories: ['science', 'history'],
      quizId: 'quiz-123',
    })
  })

  it('parses the friends scope and season period', () => {
    expect(parseLeaderboardSearchParams({ scope: 'friends', period: 'season' })).toEqual({
      period: 'season',
      sort: 'total',
      scope: 'friends',
      page: 1,
      categories: [],
      quizId: undefined,
    })
    expect(parseLeaderboardSearchParams({ scope: 'bogus' }).scope).toBe('global')
  })

  it('builds URL params using the new period key', () => {
    expect(
      buildLeaderboardQuery({
        period: 'today',
        sort: 'accuracy',
        page: 2,
        categories: ['science'],
        quizId: 'quiz-123',
      })
    ).toBe('period=today&sort=accuracy&page=2&quizId=quiz-123&category=science')
    expect(
      buildLeaderboardQuery({ period: 'all', sort: 'total', scope: 'friends', categories: [] })
    ).toBe('period=all&scope=friends')
  })

  it('toggles category filters and computes supported periods', () => {
    expect(toggleCategory(['science', 'history'], 'science')).toEqual(['history'])
    expect(toggleCategory(['history'], 'science')).toEqual(['history', 'science'])
    expect(getPeriodStart('all')).toBeUndefined()
    expect(getPeriodStart('week')).toBeInstanceOf(Date)
    expect(getPeriodStart('today')).toBeInstanceOf(Date)
    expect(getPeriodStart('season')).toBeInstanceOf(Date)
    expect(getPeriodStart('season')?.getUTCDate()).toBe(1)
  })
})
