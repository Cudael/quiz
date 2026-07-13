'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import type { DuelStatePayload } from '../duel-view.types'
import { readErrorMessage } from '../duel-view.utils'
import { DuelAnswerReview } from './duel-answer-review'

interface DuelResultsProps {
  state: DuelStatePayload
}

export function DuelResults({ state }: DuelResultsProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [requestingRematch, setRequestingRematch] = useState(false)
  const sortedParticipants = [...state.participants].sort((a, b) => b.score - a.score)
  const viewerParticipant = state.participants.find(
    (participant) => participant.id === state.viewerParticipantId
  )
  const canRematch = Boolean(viewerParticipant?.userId)

  async function requestRematch() {
    setRequestingRematch(true)
    try {
      const response = await fetch(`/api/duel/${state.duel.id}/rematch`, { method: 'POST' })
      if (!response.ok) {
        addToast(await readErrorMessage(response, 'Could not create rematch.'), 'error')
        return
      }
      const payload = (await response.json()) as { duelId: string }
      addToast('Rematch created — opponents have been notified.', 'success')
      router.push(`/duel/${payload.duelId}`)
    } finally {
      setRequestingRematch(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="py-2 pr-2">Player</th>
                  <th className="py-2 pr-2">Score</th>
                  <th className="py-2">Correct</th>
                </tr>
              </thead>
              <tbody>
                {sortedParticipants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    className={index === 0 ? 'bg-quiz-yellow/10 font-semibold' : undefined}
                  >
                    <td className="py-2 pr-2">{participant.name || 'Unknown player'}</td>
                    <td className="py-2 pr-2">{participant.score}</td>
                    <td className="py-2">{participant.correctCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {canRematch ? (
              <Button
                variant="accent"
                className="flex-1"
                disabled={requestingRematch}
                onClick={() => {
                  requestRematch().catch(() => {})
                }}
              >
                {requestingRematch ? 'Creating rematch…' : 'Rematch'}
              </Button>
            ) : null}
            <Button asChild variant={canRematch ? 'outline' : 'accent'} className="flex-1">
              <Link href="/duel">Play Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
      {state.review ? <DuelAnswerReview review={state.review} /> : null}
    </div>
  )
}
