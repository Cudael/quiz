import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ForgotPasswordForm } from './forgot-password-form'

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('swaps to a confirmation state showing the submitted email', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }))
    render(<ForgotPasswordForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByText('Check your inbox')).toBeInTheDocument()
    expect(screen.getByText('player@example.com')).toBeInTheDocument()
    // The entry form is gone; the header no longer asks for an email.
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'player@example.com' }),
    })
    // Resend starts on cooldown so the rate limit cannot be burned by accident.
    expect(screen.getByRole('button', { name: /Send again \(\d+s\)/ })).toBeDisabled()
  })

  it('returns to the form when choosing a different email', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    )
    render(<ForgotPasswordForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Use a different email' }))

    expect(screen.getByLabelText('Email')).toHaveValue('player@example.com')
    expect(screen.getByRole('button', { name: 'Send reset link' })).toBeInTheDocument()
  })

  it('shows an error and stays on the form when the request fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('network down'))
    render(<ForgotPasswordForm initialEmail="player@example.com" />)

    fireEvent.click(screen.getByRole('button', { name: 'Send reset link' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Could not send the reset link')
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Send reset link' })).toBeEnabled()
    })
  })
})
