import 'server-only'
import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export type EmailDeliveryResult = 'sent' | 'not-configured' | 'failed'

export function isEmailDeliveryConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD)
}

type EmailKind = 'accounts' | 'general'

function getMailIdentity(kind: EmailKind) {
  const authenticatedUser = process.env.GMAIL_USER
  const from =
    (kind === 'accounts' ? process.env.EMAIL_ACCOUNTS_FROM : process.env.EMAIL_GENERAL_FROM) ||
    authenticatedUser
  const replyTo = process.env.EMAIL_SUPPORT_REPLY_TO

  return {
    from,
    ...(replyTo ? { replyTo } : {}),
  }
}

/**
 * Sends a verification code email to a newly registered user.
 * No-ops (with a dev log) when Gmail SMTP is not configured.
 */
export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<EmailDeliveryResult> {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Verification email placeholder generated', { to })
      console.log('Verification code (dev/test only)', code)
    }
    return 'not-configured'
  }

  try {
    await transporter.sendMail({
      ...getMailIdentity('accounts'),
      to,
      subject: `${code} is your BusQuiz verification code`,
      html: buildVerificationHtml(code),
      text: `Welcome to BusQuiz!\n\nYour verification code is: ${code}\n\nEnter it on the verification page to activate your account. The code expires in 15 minutes.\n\nIf you did not create a BusQuiz account, you can safely ignore this email.`,
    })
    return 'sent'
  } catch (error) {
    console.warn('Failed to send verification email:', error)
    return 'failed'
  }
}

/**
 * Sends a password-reset email.
 * No-ops (with a dev log) when Gmail SMTP is not configured.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Password reset email placeholder generated', { to })
      console.log('Reset URL (dev/test only)', resetUrl)
    }
    return
  }

  try {
    await transporter.sendMail({
      ...getMailIdentity('accounts'),
      to,
      subject: 'Reset your BusQuiz password',
      html: buildPasswordResetHtml(resetUrl),
      text: `Reset your BusQuiz password by visiting:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request a password reset, you can ignore this email.`,
    })
  } catch (error) {
    console.warn('Failed to send password reset email:', error)
  }
}

function buildVerificationHtml(code: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h1 style="font-size:24px;margin-bottom:8px">Welcome to BusQuiz!</h1>
  <p style="color:#555;margin-bottom:24px">Enter this code on the verification page to activate your account.</p>
  <p style="background:#f5f5ff;border-radius:8px;padding:16px 24px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;margin:0">${code}</p>
  <p style="color:#888;font-size:12px;margin-top:24px">This code expires in 15 minutes. If you did not create a BusQuiz account, you can safely ignore this email.</p>
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

export interface WeeklyDigestQuiz {
  title: string
  url: string
  categoryName: string
  playsThisWeek: number
}

export interface WeeklyDigestData {
  name: string | null
  playsThisWeek: number
  bestScoreThisWeek: number | null
  streakDays: number
  trendingQuizzes: WeeklyDigestQuiz[]
  settingsUrl: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Sends the weekly digest email. No-ops when Gmail SMTP is not configured.
 * Returns true when a send was attempted successfully.
 */
export async function sendWeeklyDigestEmail(to: string, data: WeeklyDigestData): Promise<boolean> {
  const transporter = getTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Weekly digest email placeholder generated', { to })
    }
    return false
  }

  const textQuizzes = data.trendingQuizzes
    .map((quiz) => `- ${quiz.title} (${quiz.categoryName}): ${quiz.url}`)
    .join('\n')

  try {
    await transporter.sendMail({
      ...getMailIdentity('general'),
      to,
      subject: 'Your BusQuiz weekly digest 🧠',
      html: buildWeeklyDigestHtml(data),
      text: `Hi ${data.name ?? 'there'}!\n\nYour week on BusQuiz: ${data.playsThisWeek} quizzes played${
        data.bestScoreThisWeek !== null ? `, best score ${data.bestScoreThisWeek}%` : ''
      }.\n\nTrending this week:\n${textQuizzes}\n\nManage email preferences: ${data.settingsUrl}`,
    })
    return true
  } catch (error) {
    console.warn('Failed to send weekly digest email:', error)
    return false
  }
}

function buildWeeklyDigestHtml(data: WeeklyDigestData): string {
  const quizRows = data.trendingQuizzes
    .map(
      (quiz) => `<tr>
    <td style="padding:8px 0;border-bottom:1px solid #eee">
      <a href="${quiz.url}" style="color:#6366f1;font-weight:600;text-decoration:none">${escapeHtml(quiz.title)}</a>
      <div style="color:#888;font-size:12px">${escapeHtml(quiz.categoryName)} · ${quiz.playsThisWeek} plays this week</div>
    </td>
  </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h1 style="font-size:24px;margin-bottom:8px">Your week on BusQuiz</h1>
  <p style="color:#555;margin-bottom:16px">Hi ${escapeHtml(data.name ?? 'there')}! Here's what happened this week.</p>
  <div style="background:#f5f5ff;border-radius:8px;padding:16px;margin-bottom:24px">
    <p style="margin:0 0 4px 0"><strong>${data.playsThisWeek}</strong> quizzes played</p>
    ${data.bestScoreThisWeek !== null ? `<p style="margin:0 0 4px 0"><strong>${data.bestScoreThisWeek}%</strong> best score</p>` : ''}
    ${data.streakDays > 0 ? `<p style="margin:0">🔥 <strong>${data.streakDays}-day</strong> streak — keep it going!</p>` : ''}
  </div>
  <h2 style="font-size:16px;margin-bottom:8px">Trending this week</h2>
  <table style="width:100%;border-collapse:collapse">${quizRows}</table>
  <p style="color:#888;font-size:12px;margin-top:24px">You're receiving this because weekly digests are enabled on your account. <a href="${data.settingsUrl}" style="color:#888">Manage email preferences</a>.</p>
</body>
</html>`
}
