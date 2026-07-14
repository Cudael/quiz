import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const { email = '' } = await searchParams

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <ForgotPasswordForm initialEmail={email} />
    </div>
  )
}
