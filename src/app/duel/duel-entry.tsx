'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'

interface DuelEntryProps {
  categories: Array<{ id: string; name: string }>
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string }
    return payload.error ?? fallback
  } catch {
    return fallback
  }
}

export function DuelEntry({ categories }: DuelEntryProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const [categoryId, setCategoryId] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [timeLimitSec, setTimeLimitSec] = useState(20)
  const [code, setCode] = useState('')
  const [submittingCreate, setSubmittingCreate] = useState(false)
  const [submittingJoin, setSubmittingJoin] = useState(false)

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Swords className="h-3.5 w-3.5" />
          Duel Mode
        </p>
        <h1 className="text-3xl font-bold">Challenge your friends ⚔️</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Think faster than your opponent. Every second counts. Glory awaits.
        </p>
      </div>

      {/* How it Works */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            step: '1',
            title: 'Create',
            description: 'Pick a category and set your rules',
            emoji: '🎮',
          },
          { step: '2', title: 'Share', description: 'Send the code to your opponent', emoji: '📤' },
          {
            step: '3',
            title: 'Battle',
            description: 'Answer fast — every second counts',
            emoji: '⚡',
          },
          { step: '4', title: 'Win', description: 'Highest score takes the glory', emoji: '🏆' },
        ].map((item) => (
          <div
            key={item.step}
            className="rounded-xl border border-border/50 bg-card p-3 text-center"
          >
            <p className="text-2xl mb-1">{item.emoji}</p>
            <p className="text-sm font-bold">{item.title}</p>
            <p className="text-xs text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a Duel</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setSubmittingCreate(true)
              try {
                const response = await fetch('/api/duel/create', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    categoryId: categoryId || undefined,
                    questionCount,
                    timeLimitSec,
                  }),
                })

                if (!response.ok) {
                  addToast(await readErrorMessage(response, 'Could not create duel.'), 'error')
                  return
                }

                const payload = (await response.json()) as { duelId: string }
                router.push(`/duel/${payload.duelId}`)
              } finally {
                setSubmittingCreate(false)
              }
            }}
          >
            <div className="space-y-1">
              <label htmlFor="duel-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="duel-category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Random (all categories)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="duel-question-count" className="text-sm font-medium">
                  Questions
                </label>
                <select
                  id="duel-question-count"
                  value={questionCount}
                  onChange={(event) => setQuestionCount(Number(event.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="duel-time-limit" className="text-sm font-medium">
                  Time per question
                </label>
                <select
                  id="duel-time-limit"
                  value={timeLimitSec}
                  onChange={(event) => setTimeLimitSec(Number(event.target.value))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value={10}>10 seconds</option>
                  <option value={20}>20 seconds</option>
                  <option value={30}>30 seconds</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="gradient" className="w-full" disabled={submittingCreate}>
              {submittingCreate ? 'Creating…' : 'Create Duel'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Join a Duel</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault()
              setSubmittingJoin(true)
              try {
                const response = await fetch('/api/duel/join', {
                  method: 'POST',
                  headers: { 'content-type': 'application/json' },
                  body: JSON.stringify({
                    code: code.trim().toUpperCase(),
                  }),
                })

                if (!response.ok) {
                  addToast(await readErrorMessage(response, 'Could not join duel.'), 'error')
                  return
                }

                const payload = (await response.json()) as { duelId: string }
                router.push(`/duel/${payload.duelId}`)
              } finally {
                setSubmittingJoin(false)
              }
            }}
          >
            <Input
              value={code}
              onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 6))}
              placeholder="Enter invite code"
              maxLength={6}
              required
            />
            <Button type="submit" variant="outline" className="w-full" disabled={submittingJoin}>
              {submittingJoin ? 'Joining…' : 'Join Duel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
