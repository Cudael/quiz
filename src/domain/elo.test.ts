import { describe, expect, it } from 'vitest'
import { computeEloUpdates, DEFAULT_ELO_RATING, MIN_ELO_RATING } from './elo'

describe('computeEloUpdates', () => {
  it('returns no updates for fewer than two participants', () => {
    expect(computeEloUpdates([])).toEqual([])
    expect(computeEloUpdates([{ id: 'a', rating: 1200, score: 10 }])).toEqual([])
  })

  it('awards ~K/2 for an even 1v1 win and keeps the system zero-sum', () => {
    const updates = computeEloUpdates([
      { id: 'winner', rating: DEFAULT_ELO_RATING, score: 500 },
      { id: 'loser', rating: DEFAULT_ELO_RATING, score: 300 },
    ])
    const winner = updates.find((u) => u.id === 'winner')!
    const loser = updates.find((u) => u.id === 'loser')!
    expect(winner.delta).toBe(16)
    expect(loser.delta).toBe(-16)
    expect(winner.newRating).toBe(1216)
    expect(loser.newRating).toBe(1184)
  })

  it('gives the underdog more points for an upset win', () => {
    const updates = computeEloUpdates([
      { id: 'underdog', rating: 1000, score: 900 },
      { id: 'favorite', rating: 1400, score: 100 },
    ])
    const underdog = updates.find((u) => u.id === 'underdog')!
    expect(underdog.delta).toBeGreaterThan(16)
    expect(underdog.delta).toBeLessThanOrEqual(32)
  })

  it('treats equal scores as a tie', () => {
    const updates = computeEloUpdates([
      { id: 'a', rating: 1200, score: 400 },
      { id: 'b', rating: 1200, score: 400 },
    ])
    expect(updates.every((u) => u.delta === 0)).toBe(true)
  })

  it('splits K across opponents in multiplayer lobbies', () => {
    const updates = computeEloUpdates([
      { id: 'first', rating: 1200, score: 900 },
      { id: 'second', rating: 1200, score: 600 },
      { id: 'third', rating: 1200, score: 300 },
    ])
    const first = updates.find((u) => u.id === 'first')!
    const third = updates.find((u) => u.id === 'third')!
    expect(first.delta).toBe(16)
    expect(third.delta).toBe(-16)
    expect(updates.reduce((total, u) => total + u.delta, 0)).toBe(0)
  })

  it('never drops a rating below the floor', () => {
    const updates = computeEloUpdates([
      { id: 'low', rating: MIN_ELO_RATING + 5, score: 0 },
      { id: 'high', rating: 2000, score: 100 },
    ])
    const low = updates.find((u) => u.id === 'low')!
    expect(low.newRating).toBeGreaterThanOrEqual(MIN_ELO_RATING)
  })
})
