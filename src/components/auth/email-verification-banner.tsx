'use client'

import { useSession } from 'next-auth/react'
import { VerificationEmailForm } from '@/components/auth/verification-email-form'

export function EmailVerificationBanner() {
  const { data: session, status } = useSession()

  if (status !== 'authenticated' || !session.user.email || session.user.emailVerified) {
    return null
  }

  return (
    <div className="border-b border-border/40 bg-muted/40">
      <div className="container mx-auto space-y-2 px-4 py-3 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Email verification required.</strong> Verify{' '}
          {session.user.email} to continue using account features. Check your inbox and spam folder,
          then sign in again after verification.
        </p>
        <VerificationEmailForm initialEmail={session.user.email} compact />
      </div>
    </div>
  )
}
