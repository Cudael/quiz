'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DuelStatePayload } from '../duel-view.types'

interface DuelLobbyProps {
  state: DuelStatePayload
  participantCount: number
  submittingStart: boolean
  onStart: () => void
}

export function DuelLobby({ state, participantCount, submittingStart, onStart }: DuelLobbyProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl tracking-widest">{state.duel.code}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Share this invite code. Players joined: {participantCount} / {state.duel.maxPlayers}
          </p>
          <ul className="space-y-2">
            {state.participants.map((participant) => (
              <li
                key={participant.id}
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                {participant.name || 'Unknown player'}
              </li>
            ))}
          </ul>
          {state.isHost ? (
            <Button
              className="w-full"
              variant="accent"
              disabled={participantCount < 2 || submittingStart}
              onClick={onStart}
            >
              {submittingStart ? 'Starting…' : 'Start Duel'}
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
