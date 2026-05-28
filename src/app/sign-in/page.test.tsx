import { describe, expect, it, vi } from 'vitest'
import SignInPage from '@/app/sign-in/page'
import { auth } from '@/server/auth'
import { redirect } from 'next/navigation'

vi.mock('@/components/auth/sign-in-form', () => ({
  SignInForm: () => null,
}))

vi.mock('@/server/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(() => {
    throw new Error('NEXT_REDIRECT')
  }),
}))

describe('SignInPage', () => {
  it('redirects authenticated users to callbackUrl (default /me)', async () => {
    ;(auth as unknown as { mockResolvedValueOnce: (value: unknown) => void }).mockResolvedValueOnce(
      {
        user: { id: 'user-1' },
      }
    )

    await expect(
      SignInPage({
        searchParams: Promise.resolve({ callbackUrl: '/me' }),
      })
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/me')
  })
})
