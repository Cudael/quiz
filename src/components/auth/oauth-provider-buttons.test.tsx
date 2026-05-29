import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const { signInMock } = vi.hoisted(() => ({
  signInMock: vi.fn(),
}))

vi.mock('next-auth/react', () => ({
  signIn: signInMock,
}))

import { OauthProviderButtons } from '@/components/auth/oauth-provider-buttons'

describe('OauthProviderButtons', () => {
  it('renders nothing when no providers are enabled', () => {
    const { container } = render(
      <OauthProviderButtons callbackUrl="/me" googleEnabled={false} githubEnabled={false} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders Google as outline with inline logo', () => {
    render(<OauthProviderButtons callbackUrl="/me" googleEnabled={true} githubEnabled={false} />)

    const googleButton = screen.getByRole('button', { name: 'Continue with Google' })
    expect(googleButton).toHaveClass('border-input')
    expect(googleButton).toHaveClass('bg-background')
    expect(googleButton.querySelector('path[fill="#4285F4"]')).not.toBeNull()
  })

  it('renders GitHub icon and triggers sign-in', () => {
    render(<OauthProviderButtons callbackUrl="/me" googleEnabled={true} githubEnabled={true} />)

    const githubButton = screen.getByRole('button', { name: 'Continue with GitHub' })
    expect(githubButton).toHaveClass('border-input')
    expect(githubButton.querySelector('.lucide-github')).not.toBeNull()

    fireEvent.click(githubButton)
    expect(signInMock).toHaveBeenCalledWith('github', { callbackUrl: '/me' })
  })
})
