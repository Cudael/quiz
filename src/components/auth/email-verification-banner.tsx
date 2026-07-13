'use client'

import Link from 'next/link'
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
          <strong className="text-foreground">Email verification required.</strong> Enter the
          6-digit code we sent to {session.user.email} on the{' '}
          <Link href="/verify-email" className="font-semibold underline underline-offset-4">
            verification page
          </Link>{' '}
          to continue using account features.
        </p>
        <VerificationEmailForm initialEmail={session.user.email} compact />
      </div>
    </div>
  )
}
