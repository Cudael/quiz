'use client'

import Link from 'next/link'
import { Swords, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser } from '../home-page-client.types'

export function HeroCards({ currentUser }: { currentUser: HomeCurrentUser | null }) {
  return (
    <div className="flex h-full flex-row gap-4">
      {/* Duel Mode */}
      <div className="group flex flex-1 flex-col items-center justify-between rounded-xl border-2 border-foreground bg-surface-1 p-5 text-center">
        <div className="flex flex-col items-center">
          <Swords className="mb-2 h-6 w-6 text-foreground/60" />
          <h2 className="text-xl font-black tracking-tight">Duel Mode</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Challenge a friend in real-time 1v1 combat. Share a code and let the best brain win.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">⚡ Average duel: 2 minutes</p>
        </div>
        <Button
          asChild
          className="mt-4 w-full rounded-lg bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
        >
          <Link href={currentUser ? '/duel' : '/sign-up'}>
            {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
          </Link>
        </Button>
      </div>

      {/* Daily Challenge */}
      <div className="group flex flex-1 flex-col items-center justify-between rounded-xl border-2 border-foreground bg-surface-1 p-5 text-center">
        <div className="flex flex-col items-center">
          <Flame className="mb-2 h-6 w-6 text-foreground/60" />
          <h2 className="text-xl font-black tracking-tight">Daily Challenge</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            A fresh brain-buster every 24 hours. Keep your streak alive and earn bonus XP.
          </p>
          <p className="mt-2 text-xs text-muted-foreground/60">🔥 New challenge every 24 hours</p>
        </div>
        <Button
          asChild
          className="mt-4 w-full rounded-lg bg-orange-500 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
        >
          <Link href={currentUser ? '/random-quiz' : '/sign-up'}>
            {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
          </Link>
        </Button>
      </div>
    </div>
  )
}
