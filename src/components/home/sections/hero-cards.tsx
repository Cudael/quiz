'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { HomeCurrentUser } from '../home-page-client.types'

export function HeroCards({ currentUser }: { currentUser: HomeCurrentUser | null }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Duel Mode */}
      <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card">
        {/* Background image */}
        <Image
          src="/duel.png"
          alt=""
          fill
          unoptimized
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
        {/* Content */}
        <div className="relative flex flex-col p-5">
          <h2 className="text-xl font-black tracking-tight">Duel Mode ⚔️</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-white">
            Think you&apos;re smart? Prove it in real-time 1v1 combat.
          </p>
          <Button asChild variant="gradient" className="mt-4 w-fit rounded-xl font-bold">
            <Link href={currentUser ? '/duel' : '/sign-up'}>
              {currentUser ? 'Start a Duel' : 'Sign Up to Duel'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-amber-500/5">
          <div className="absolute -right-6 -top-6 h-36 w-36 rounded-full bg-amber-500/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-28 w-28 rounded-full bg-orange-500/8 blur-2xl" />
        </div>
        {/* Decorative icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Flame className="h-20 w-20 text-orange-500/10" />
        </div>
        {/* Content */}
        <div className="relative flex flex-col p-5 pr-24">
          <h2 className="text-xl font-black tracking-tight">Daily Challenge 🔥</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            A fresh brain-buster every 24 hours. Earn bonus XP and bragging rights.
          </p>
          <Button asChild variant="gradient" className="mt-4 w-fit rounded-xl font-bold">
            <Link href={currentUser ? '/random-quiz' : '/sign-up'}>
              {currentUser ? 'Play Challenge' : 'Sign Up to Play'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
