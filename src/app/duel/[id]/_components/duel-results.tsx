'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DuelStatePayload } from '../duel-view.types'

interface DuelResultsProps {
  state: DuelStatePayload
}

export function DuelResults({ state }: DuelResultsProps) {
  const sortedParticipants = [...state.participants].sort((a, b) => b.score - a.score)

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
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
            <Button asChild variant="accent" className="flex-1">
              <Link href="/duel">Play Again</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
