'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DuelStatePayload } from '../duel-view.types'

interface DuelLobbyProps {
  state: DuelStatePayload
  participantCount: number
  submittingStart: boolean
  submittingJoin: boolean
  onStart: () => void
  onJoin: () => void
}

export function DuelLobby({
  state,
  participantCount,
  submittingStart,
  submittingJoin,
  onStart,
  onJoin,
}: DuelLobbyProps) {
  const [copied, setCopied] = React.useState(false)
  // A viewer who isn't the host and hasn't joined yet is just spectating a
  // link — this is the path that used to dead-end forever (see the "Start
  // Duel" button below only ever rendering for the host).
  const canJoin = !state.isHost && !state.viewerParticipantId

  const getShareUrl = () => {
    if (typeof window === 'undefined') return `/duel/${state.duel.id}`
    return `${window.location.origin}/duel/${state.duel.id}`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getShareUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-3xl tracking-widest">{state.duel.code}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            Share the invite link below, or give out the code above. Players joined:{' '}
            {participantCount} / {state.duel.maxPlayers}
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={getShareUrl()}
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"
            />
            <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
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
          {canJoin ? (
            <Button className="w-full" variant="accent" disabled={submittingJoin} onClick={onJoin}>
              {submittingJoin ? 'Joining…' : 'Join Duel'}
            </Button>
          ) : null}
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
