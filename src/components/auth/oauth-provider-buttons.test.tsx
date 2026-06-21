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
      <OauthProviderButtons callbackUrl="/profile" googleEnabled={false} githubEnabled={false} />
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('renders Google as outline with inline logo', () => {
    render(
      <OauthProviderButtons callbackUrl="/profile" googleEnabled={true} githubEnabled={false} />
    )

    const googleButton = screen.getByRole('button', { name: 'Continue with Google' })
    expect(googleButton).toHaveAttribute('data-variant', 'outline')
    expect(screen.getByTestId('google-oauth-icon')).toBeInTheDocument()
  })

  it('renders GitHub icon and triggers sign-in', () => {
    render(
      <OauthProviderButtons callbackUrl="/profile" googleEnabled={true} githubEnabled={true} />
    )

    const githubButton = screen.getByRole('button', { name: 'Continue with GitHub' })
    expect(githubButton).toHaveAttribute('data-variant', 'outline')
    expect(screen.getByTestId('github-oauth-icon')).toBeInTheDocument()

    fireEvent.click(githubButton)
    expect(signInMock).toHaveBeenCalledWith('github', { callbackUrl: '/profile' })
  })

  it('renders GitHub as default when it is the only provider', () => {
    render(
      <OauthProviderButtons callbackUrl="/profile" googleEnabled={false} githubEnabled={true} />
    )

    expect(screen.getByRole('button', { name: 'Continue with GitHub' })).toHaveAttribute(
      'data-variant',
      'default'
    )
  })
})
