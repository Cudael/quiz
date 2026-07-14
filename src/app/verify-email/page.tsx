import type { Metadata } from 'next'
import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VerificationEmailForm } from '@/components/auth/verification-email-form'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = '' } = await searchParams

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <MailCheck className="mx-auto h-10 w-10 text-primary" />
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            Enter the 6-digit code from the message BusQuiz Accounts sent you. Codes expire after 15
            minutes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive it? Check spam first, then request a fresh code.
          </p>
          <VerificationEmailForm initialEmail={email} />
          <p className="text-center text-sm text-muted-foreground">
            Already verified?{' '}
            <Link href="/sign-in" className="font-semibold underline underline-offset-4">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
