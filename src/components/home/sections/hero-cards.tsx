'use client'

import Link from 'next/link'
import { Flame, Swords, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser } from '../home-page-client.types'

export function HeroCards({ currentUser }: { currentUser: HomeCurrentUser | null }) {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Duel Mode */}
        <div className="rounded-2xl border border-quiz-purple/25 bg-quiz-purple/5 p-5">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-quiz-purple/10 border border-quiz-purple/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-quiz-purple">
            <Swords className="h-3 w-3" />
            Head-to-Head
          </div>
          <h2 className="mt-2 text-xl font-black tracking-tight">Duel Mode</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Challenge a friend and see who comes out on top!
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-4 w-full rounded-xl border-quiz-purple/40 font-bold text-quiz-purple hover:bg-quiz-purple/10"
          >
            <Link href={currentUser ? '/duel' : '/sign-up'}>
              <Swords className="h-4 w-4" />
              {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
            </Link>
          </Button>
        </div>

        {/* Daily Challenge */}
        <div className="rounded-2xl border border-orange-500/25 bg-orange-500/5 p-5">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            <Flame className="h-3 w-3" />
            {currentUser && currentUser.streakDays > 0
              ? `${currentUser.streakDays}d streak`
              : 'Daily'}
          </div>
          <h2 className="mt-2 text-xl font-black tracking-tight">Daily Challenge</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your streak alive and earn bonus XP!
          </p>
          <Button
            asChild
            size="lg"
            className="mt-4 w-full rounded-xl bg-orange-500 font-bold text-white hover:bg-orange-600"
          >
            <Link href={currentUser ? '/random-quiz' : '/sign-up'}>
              <Zap className="h-4 w-4" />
              {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
