export interface DuelQuestionChoice {
  id: string
  text: string
}

export interface DuelQuestion {
  id: string
  type: string
  prompt: string
  imageUrl: string | null
  choices: DuelQuestionChoice[]
}

export interface DuelParticipant {
  id: string
  userId: string | null
  name: string | null
  score: number
  correctCount: number
  finished: boolean
  joinedAt: string
}

export interface DuelStatePayload {
  duel: {
    id: string
    code: string
    hostId: string
    status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED'
    categoryId: string | null
    questionCount: number
    timeLimitSec: number
    maxPlayers: number
    finishedAt: string | null
  }
  participants: DuelParticipant[]
  questions: DuelQuestion[] | null
  viewerParticipantId: string | null
  isHost: boolean
}

export interface DuelViewProps {
  duelId: string
}

export interface DuelAnswer {
  choiceIds: string[]
  timeTakenMs: number
}
