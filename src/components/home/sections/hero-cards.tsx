'use client'

import Link from 'next/link'
import { Swords, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser } from '../home-page-client.types'

export function HeroCards({ currentUser }: { currentUser: HomeCurrentUser | null }) {
  return (
    <div className="flex h-full flex-row gap-4">
      {/* Duel Mode */}
      <div className="group flex flex-1 flex-col justify-between rounded-xl border-2 border-foreground/15 border-l-4 border-l-quiz-purple bg-quiz-purple/5 p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Swords className="h-5 w-5 text-quiz-purple" />
            <span className="text-xs font-bold uppercase tracking-wider text-quiz-purple">
              Multiplayer
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Duel Mode</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Think you&apos;re smart? Challenge a friend in real-time 1v1 combat. Share a code and
            let the best brain win.
          </p>
        </div>
        <Button asChild variant="gradient" className="mt-4 w-full rounded-lg font-bold">
          <Link href={currentUser ? '/duel' : '/sign-up'}>
            {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
          </Link>
        </Button>
      </div>

      {/* Daily Challenge */}
      <div className="group flex flex-1 flex-col justify-between rounded-xl border-2 border-foreground/15 border-l-4 border-l-amber-500 bg-amber-500/5 p-5">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Daily</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">Daily Challenge</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            A fresh brain-buster every 24 hours. Keep your streak alive, earn bonus XP, and collect
            bragging rights.
          </p>
        </div>
        <Button asChild variant="gradient" className="mt-4 w-full rounded-lg font-bold">
          <Link href={currentUser ? '/random-quiz' : '/sign-up'}>
            {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
