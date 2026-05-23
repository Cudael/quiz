'use client'

import { useSession } from 'next-auth/react'

export function EmailVerificationBanner() {
  const { data: session, status } = useSession()

  if (status !== 'authenticated' || !session.user.email || session.user.emailVerified) {
    return null
  }

  return (
    <div className="border-b border-border/40 bg-muted/40">
      <div className="container mx-auto px-4 py-2 text-sm text-muted-foreground">
        Please verify your email address ({session.user.email}). Check your inbox for the
        verification link and refresh this page after verification.
      </div>
    </div>
  )
}
