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
      <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-quiz-purple/40 hover:shadow-md">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-quiz-purple/5 transition-transform duration-500 group-hover:scale-150" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-quiz-purple/10 text-quiz-purple">
            <Swords className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black tracking-tight sm:text-xl">Duel Mode</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Challenge a friend in real-time 1v1 combat. Share a code and let the best brain win.
          </p>
          <div className="mt-3 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            ⚡ Average duel: 2 mins
          </div>
        </div>
        <Button
          asChild
          className="relative mt-4 w-full rounded-xl bg-quiz-purple font-bold text-white hover:bg-quiz-purple/90 active:scale-95 transition-all shadow-sm group-hover:shadow"
        >
          <Link href={currentUser ? '/duel' : '/sign-up'}>
            {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
          </Link>
        </Button>
      </div>

      {/* Daily Challenge */}
      <div className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-quiz-orange/40 hover:shadow-md">
        <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-quiz-orange/5 transition-transform duration-500 group-hover:scale-150" />
        <div className="relative flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-quiz-orange/10 text-quiz-orange">
            <Flame className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-black tracking-tight sm:text-xl">Daily Challenge</h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm line-clamp-2">
            {todayChallenge
              ? todayChallenge.title
              : 'A fresh brain-buster every 24 hours. Keep your streak alive.'}
          </p>
          <div className="mt-3 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {todayChallenge
              ? `${todayChallenge.categoryName} · ${todayChallenge.questionCount} Qs · ${todayChallenge.difficulty}`
              : '🔥 New challenge every 24h'}
          </div>
        </div>
        <Button
          asChild
          className="relative mt-4 w-full rounded-xl bg-quiz-orange font-bold text-white hover:bg-quiz-orange/90 active:scale-95 transition-all shadow-sm group-hover:shadow"
        >
          <Link
            href={
              todayChallenge
                ? `/play/${todayChallenge.id}`
                : currentUser
                  ? '/random-quiz'
                  : '/sign-up'
            }
          >
            {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
