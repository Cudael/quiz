'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const DISMISS_KEY = 'qa_guest_upgrade_prompt_dismissed'

interface GuestUpgradePromptProps {
  variant?: 'strong' | 'subtle'
}

export function GuestUpgradePrompt({ variant = 'subtle' }: GuestUpgradePromptProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [dismissed, setDismissed] = useState(
    () => typeof window !== 'undefined' && window.sessionStorage.getItem(DISMISS_KEY) === '1'
  )

  const callbackUrl = pathname

  if (status === 'loading') return null
  if (dismissed) return null

  const shouldShow = !session?.user || session.user.email == null
  if (!shouldShow) return null

  return (
    <Card
      className={
        variant === 'strong'
          ? 'mb-8 border-quiz-purple/50 bg-quiz-purple/10'
          : 'mb-4 border-border/70 bg-muted/40'
      }
    >
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">Playing as a guest.</p>
          <p className="text-sm text-muted-foreground">
            Sign up to save your XP, level, streak, and badges.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" asChild>
            <Link href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign up</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Sign in</Link>
          </Button>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.sessionStorage.setItem(DISMISS_KEY, '1')
              }
              setDismissed(true)
            }}
          >
            Dismiss
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
