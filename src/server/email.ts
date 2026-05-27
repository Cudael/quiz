import 'server-only'
import { Resend } from 'resend'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@busquiz.com'

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  if (!process.env.RESEND_FROM_EMAIL) {
    console.warn(
      'RESEND_FROM_EMAIL is not set. Emails will be sent from the fallback address which may not be verified in Resend.'
    )
  }
  return new Resend(apiKey)
}

/**
 * Sends a verification email to a newly registered user.
 * No-ops (with a dev log) when `RESEND_API_KEY` is not configured.
 */
export async function sendVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  const resend = getResendClient()

  if (!resend) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Verification email placeholder generated', { to })
      console.log('Verification URL (dev/test only)', verifyUrl)
    }
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Verify your BusQuiz email',
      html: buildVerificationHtml(verifyUrl),
      text: `Welcome to BusQuiz!\n\nVerify your email address by visiting:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    })
  } catch (error) {
    console.warn('Failed to send verification email:', error)
  }
}

/**
 * Sends a password-reset email.
 * No-ops (with a dev log) when `RESEND_API_KEY` is not configured.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const resend = getResendClient()

  if (!resend) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Password reset email placeholder generated', { to })
      console.log('Reset URL (dev/test only)', resetUrl)
    }
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your BusQuiz password',
      html: buildPasswordResetHtml(resetUrl),
      text: `Reset your BusQuiz password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, you can ignore this email.`,
    })
  } catch (error) {
    console.warn('Failed to send password reset email:', error)
  }
}

function buildVerificationHtml(verifyUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h1 style="font-size:24px;margin-bottom:8px">Welcome to BusQuiz!</h1>
  <p style="color:#555;margin-bottom:24px">Click the button below to verify your email address and activate your account.</p>
  <a href="${verifyUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Verify Email</a>
  <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 24 hours. If you did not create a BusQuiz account, you can safely ignore this email.</p>
</body>
</html>`
}

function buildPasswordResetHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h1 style="font-size:24px;margin-bottom:8px">Reset your BusQuiz password</h1>
  <p style="color:#555;margin-bottom:24px">Click the button below to set a new password for your account.</p>
  <a href="${resetUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
  <p style="color:#888;font-size:12px;margin-top:24px">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
</body>
</html>`
}
