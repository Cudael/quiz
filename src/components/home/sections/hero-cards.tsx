'use client'

import Link from 'next/link'
import { Swords, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser, TodayChallengeQuiz } from '../home-page-client.types'

export function HeroCards({
  currentUser,
  todayChallenge,
}: {
  currentUser: HomeCurrentUser | null
  todayChallenge: TodayChallengeQuiz | null
}) {
  return (
    <div className="flex h-full flex-col sm:flex-row gap-4">
      {/* Duel Mode */}
      <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-md border border-border bg-surface-1 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-quiz-purple/40 hover:shadow-hard-sm">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-quiz-purple opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-quiz-purple/10 text-quiz-purple">
            <Swords className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">Duel Mode</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Challenge a friend in real-time 1v1 combat. Share a code and let the best brain win.
          </p>
          <div className="mt-3 rounded-sm bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ⚡ Average duel: 2 mins
          </div>
        </div>
        <Button asChild variant="accent" className="relative mt-4 w-full font-bold">
          <Link href={currentUser ? '/duel' : '/sign-up'}>
            {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
          </Link>
        </Button>
      </div>

      {/* Daily Challenge */}
      <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-md border border-border bg-surface-1 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-quiz-orange/40 hover:shadow-hard-sm">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 bg-quiz-orange opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-quiz-orange/10 text-quiz-orange">
            <Flame className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-extrabold tracking-tight sm:text-xl">Daily Challenge</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm line-clamp-2">
            {todayChallenge
              ? todayChallenge.title
              : 'A fresh brain-buster every 24 hours. Keep your streak alive.'}
          </p>
          <div className="mt-3 rounded-sm bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {todayChallenge
              ? `${todayChallenge.categoryName} · ${todayChallenge.questionCount} Qs · ${todayChallenge.difficulty}`
              : '🔥 New challenge every 24h'}
          </div>
        </div>
        <Button asChild variant="warm" className="relative mt-4 w-full font-bold">
          <Link href={todayChallenge ? `/play/${todayChallenge.id}` : '/daily'}>
            {currentUser ? 'Play Challenge' : 'Play Daily Quiz'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
