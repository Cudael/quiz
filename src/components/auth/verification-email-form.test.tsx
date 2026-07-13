import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { VerificationEmailForm } from './verification-email-form'

describe('VerificationEmailForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('requests a new verification link and shows a generic success message', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<VerificationEmailForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'player@example.com' }),
      })
    })
    expect(
      await screen.findByText(
        'If this account still needs verification, a new email has been sent. Any previous verification link is now invalid.'
      )
    ).toBeInTheDocument()
  })

  it('shows delivery configuration errors returned by the server', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'Verification email is temporarily unavailable.' }), {
        status: 503,
      })
    )
    render(<VerificationEmailForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Resend verification email' }))

    expect(
      await screen.findByText('Verification email is temporarily unavailable.')
    ).toBeInTheDocument()
  })
})
