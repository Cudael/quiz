import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { createTransportMock, sendMailMock } = vi.hoisted(() => ({
  createTransportMock: vi.fn(),
  sendMailMock: vi.fn(),
}))

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock,
  },
}))

const originalEnv = process.env

describe('email helpers', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    process.env = { ...originalEnv }
    delete process.env.GMAIL_USER
    delete process.env.GMAIL_APP_PASSWORD
    delete process.env.EMAIL_ACCOUNTS_FROM
    delete process.env.EMAIL_GENERAL_FROM
    delete process.env.EMAIL_SUPPORT_REPLY_TO
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('logs verification placeholders in test when Gmail SMTP is not configured', async () => {
    process.env = { ...process.env, NODE_ENV: 'test' }
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { sendVerificationEmail } = await import('@/server/email')

    await sendVerificationEmail('player@example.com', 'https://busquiz.com/verify?token=abc')

    expect(createTransportMock).not.toHaveBeenCalled()
    expect(logSpy).toHaveBeenNthCalledWith(1, 'Verification email placeholder generated', {
      to: 'player@example.com',
    })
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      'Verification URL (dev/test only)',
      'https://busquiz.com/verify?token=abc'
    )
  })

  it('does not log or send when Gmail SMTP is missing in production', async () => {
    process.env = { ...process.env, NODE_ENV: 'production' }
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { sendPasswordResetEmail } = await import('@/server/email')

    await sendPasswordResetEmail('player@example.com', 'https://busquiz.com/reset?token=abc')

    expect(createTransportMock).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('sends through Gmail SMTP when credentials are configured', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      GMAIL_USER: 'mailer@example.com',
      GMAIL_APP_PASSWORD: 'app-password',
      EMAIL_ACCOUNTS_FROM: 'BusQuiz Accounts <accounts@example.com>',
      EMAIL_SUPPORT_REPLY_TO: 'BusQuiz Support <support@example.com>',
    }
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })
    const { sendPasswordResetEmail } = await import('@/server/email')

    await sendPasswordResetEmail('player@example.com', 'https://busquiz.com/reset?token=abc')

    expect(createTransportMock).toHaveBeenCalledWith({
      service: 'gmail',
      auth: {
        user: 'mailer@example.com',
        pass: 'app-password',
      },
    })
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'BusQuiz Accounts <accounts@example.com>',
      replyTo: 'BusQuiz Support <support@example.com>',
      to: 'player@example.com',
      subject: 'Reset your BusQuiz password',
      html: expect.stringContaining('Reset your BusQuiz password'),
      text: expect.stringContaining('https://busquiz.com/reset?token=abc'),
    })
  })

  it('sends weekly digests from the general address with support replies', async () => {
    process.env = {
      ...process.env,
      NODE_ENV: 'test',
      GMAIL_USER: 'hello@example.com',
      GMAIL_APP_PASSWORD: 'app-password',
      EMAIL_GENERAL_FROM: 'BusQuiz <hello@example.com>',
      EMAIL_SUPPORT_REPLY_TO: 'BusQuiz Support <support@example.com>',
    }
    createTransportMock.mockReturnValue({ sendMail: sendMailMock })
    const { sendWeeklyDigestEmail } = await import('@/server/email')

    await sendWeeklyDigestEmail('player@example.com', {
      name: 'Player',
      playsThisWeek: 2,
      bestScoreThisWeek: 90,
      streakDays: 3,
      trendingQuizzes: [],
      settingsUrl: 'https://busquiz.com/profile/settings',
    })

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'BusQuiz <hello@example.com>',
        replyTo: 'BusQuiz Support <support@example.com>',
        to: 'player@example.com',
      })
    )
  })
})
