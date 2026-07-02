export interface EloParticipant {
  /** Stable identifier (userId) for the rated player. */
  id: string
  rating: number
  score: number
}

export interface EloUpdate {
  id: string
  newRating: number
  delta: number
}

export const DEFAULT_ELO_K = 32
export const DEFAULT_ELO_RATING = 1200
export const MIN_ELO_RATING = 100

function expectedScore(rating: number, opponentRating: number) {
  return 1 / (1 + 10 ** ((opponentRating - rating) / 400))
}

/**
 * Multiplayer Elo: each player is compared pairwise against every opponent.
 * A win counts 1, a tie 0.5, a loss 0. The K factor is split across the
 * number of opponents so lobby size does not inflate rating swings.
 */
export function computeEloUpdates(participants: EloParticipant[], k = DEFAULT_ELO_K): EloUpdate[] {
  if (participants.length < 2) return []

  const opponentCount = participants.length - 1
  return participants.map((player) => {
    let sum = 0
    for (const opponent of participants) {
      if (opponent.id === player.id) continue
      const actual = player.score > opponent.score ? 1 : player.score === opponent.score ? 0.5 : 0
      sum += actual - expectedScore(player.rating, opponent.rating)
    }
    const delta = Math.round((k / opponentCount) * sum)
    const newRating = Math.max(MIN_ELO_RATING, player.rating + delta)
    return { id: player.id, newRating, delta: newRating - player.rating }
  })
}
