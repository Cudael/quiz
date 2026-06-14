'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser } from '../home-page-client.types'

export function HeroCards({ currentUser }: { currentUser: HomeCurrentUser | null }) {
  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Duel Mode */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card">
          {/* Background image */}
          <Image
            src="/duel.png"
            alt=""
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
          {/* Content */}
          <div className="relative flex flex-col p-6">
            <h2 className="text-2xl font-black tracking-tight">Duel Mode ⚔️</h2>
            <p className="mt-2 text-sm leading-relaxed text-white">
              Think you&apos;re smart? Prove it in real-time 1v1 combat. Challenge a friend, share a
              code, and let the best brain win.
            </p>
            <Button asChild variant="gradient" className="mt-5 w-fit rounded-xl font-bold">
              <Link href={currentUser ? '/duel' : '/sign-up'}>
                {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
              </Link>
            </Button>
            <p className="mt-2 text-xs text-white/60">
              Takes ~2 minutes · No sign-up needed to try
            </p>
          </div>
        </div>

        {/* Daily Challenge */}
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card">
          {/* Decorative background area — placeholder for future image */}
          <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-yellow-500/5">
            <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-amber-500/20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-orange-500/15 blur-2xl" />
          </div>
          {/* Right-side decorative icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Flame className="h-24 w-24 text-orange-500/10" />
          </div>
          {/* Content */}
          <div className="relative flex flex-col p-6 pr-28">
            <h2 className="text-2xl font-black tracking-tight">Daily Challenge 🔥</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A fresh brain-buster every 24 hours. Keep your streak alive, earn bonus XP, and
              bragging rights included.
            </p>
            <Button asChild variant="gradient" className="mt-5 w-fit rounded-xl font-bold">
              <Link href={currentUser ? '/random-quiz' : '/sign-up'}>
                {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
              </Link>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground/60">New challenge daily at midnight</p>
          </div>
        </div>
      </div>
    </section>
  )
}
