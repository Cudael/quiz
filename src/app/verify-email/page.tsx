import type { Metadata } from 'next'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationEmailForm } from '@/components/auth/verification-email-form'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; delivery?: string }>
}) {
  const { email = '', delivery } = await searchParams

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Open the message from BusQuiz Accounts and select the verification link before signing
            in. The link expires after 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {delivery === 'failed' ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              We couldn&apos;t send the first email. Check the address below and try again, or
              contact support if the problem continues.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive it? Check spam first, then request a fresh link.
            </p>
          )}
          <VerificationEmailForm initialEmail={email} />
          <p className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link href="/sign-in" className="font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
