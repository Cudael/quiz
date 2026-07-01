import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import SignUpPage from '@/app/sign-up/page'

vi.mock('@/components/auth/sign-up-form', () => ({
  SignUpForm: ({ callbackUrl }: { callbackUrl: string }) => (
    <div data-testid="callback-url">{callbackUrl}</div>
  ),
}))

describe('SignUpPage', () => {
  it('passes through a safe relative callbackUrl', async () => {
    const element = await SignUpPage({
      searchParams: Promise.resolve({ callbackUrl: '/profile' }),
    })
    render(element)

    expect(screen.getByTestId('callback-url')).toHaveTextContent('/profile')
  })

  it('falls back to / for unsafe callbackUrl values', async () => {
    const element = await SignUpPage({
      searchParams: Promise.resolve({ callbackUrl: 'https://evil.example/phish' }),
    })
    render(element)

    expect(screen.getByTestId('callback-url')).toHaveTextContent('/')
  })
})
