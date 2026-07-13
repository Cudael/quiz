import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { pushMock } = vi.hoisted(() => ({ pushMock: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

import { VerificationEmailForm } from './verification-email-form'

describe('VerificationEmailForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    pushMock.mockClear()
  })

  it('verifies a code and redirects to sign-in by default', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<VerificationEmailForm initialEmail="player@example.com" />)

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'player@example.com', code: '123456' }),
      })
    })
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/sign-in?verified=1')
    })
  })

  it('calls onVerified instead of redirecting when provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    const onVerified = vi.fn()
    render(
      <VerificationEmailForm initialEmail="player@example.com" lockEmail onVerified={onVerified} />
    )

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '654321' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))

    await waitFor(() => {
      expect(onVerified).toHaveBeenCalledOnce()
    })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('shows the server error for a rejected code', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Incorrect code. Check the email and try again.' }), {
        status: 400,
      })
    )
    render(<VerificationEmailForm initialEmail="player@example.com" />)

    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '111111' } })
    fireEvent.click(screen.getByRole('button', { name: 'Verify email' }))

    expect(
      await screen.findByText('Incorrect code. Check the email and try again.')
    ).toBeInTheDocument()
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('requests a new code and shows a generic success message', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<VerificationEmailForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'player@example.com' }),
      })
    })
    expect(
      await screen.findByText(
        'If this account still needs verification, a new code has been sent. Any previous code is now invalid.'
      )
    ).toBeInTheDocument()
  })

  it('shows delivery configuration errors returned by the server', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Verification email is temporarily unavailable.' }), {
        status: 503,
      })
    )
    render(<VerificationEmailForm initialEmail="player@example.com" compact />)

    fireEvent.click(screen.getByRole('button', { name: 'Resend code' }))

    expect(
      await screen.findByText('Verification email is temporarily unavailable.')
    ).toBeInTheDocument()
  })
})
