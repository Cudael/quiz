import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CONSENT_STORAGE_KEY, openConsentSettings } from '@/lib/consent'
import { ConsentManager } from './consent-manager'

const { pathnameMock } = vi.hoisted(() => ({ pathnameMock: vi.fn(() => '/') }))

vi.mock('next/script', () => ({
  default: ({ src }: { src: string }) => <script data-testid="analytics-script" data-src={src} />,
}))

vi.mock('next/navigation', () => ({
  usePathname: pathnameMock,
}))

describe('ConsentManager', () => {
  beforeEach(() => {
    localStorage.clear()
    pathnameMock.mockReturnValue('/')
    document.cookie = '_ga=; Max-Age=0; path=/'
  })

  it('does not request Google Analytics before consent', async () => {
    render(<ConsentManager measurementId="G-TEST123" />)

    expect(await screen.findByRole('region', { name: 'Cookie consent' })).toBeInTheDocument()
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
  })

  it('loads Analytics only after explicit acceptance', async () => {
    render(<ConsentManager measurementId="G-TEST123" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Accept analytics' }))

    expect(await screen.findByTestId('analytics-script')).toHaveAttribute(
      'data-src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST123'
    )
    expect(JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      analytics: true,
    })
  })

  it('keeps Analytics blocked when optional storage is rejected', async () => {
    render(<ConsentManager measurementId="G-TEST123" />)

    fireEvent.click(await screen.findByRole('button', { name: 'Reject optional' }))

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument()
    })
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      analytics: false,
    })
  })

  it('allows consent to be withdrawn from reopened settings', async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        necessary: true,
        analytics: true,
        updatedAt: new Date().toISOString(),
      })
    )
    render(<ConsentManager measurementId="G-TEST123" />)
    expect(await screen.findByTestId('analytics-script')).toBeInTheDocument()

    openConsentSettings()
    const analyticsToggle = await screen.findByRole('checkbox', { name: /Analytics/ })
    fireEvent.click(analyticsToggle)
    fireEvent.click(screen.getByRole('button', { name: 'Save preferences' }))

    await waitFor(() => {
      expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
    })
    expect(JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      analytics: false,
    })
  })

  it('does not show a consent banner when optional analytics is not configured', async () => {
    render(<ConsentManager />)

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument()
    })
  })

  it('does not show consent UI or load Analytics inside embeds', async () => {
    pathnameMock.mockReturnValue('/embed/quiz/quiz-1')
    render(<ConsentManager measurementId="G-TEST123" />)

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Cookie consent' })).not.toBeInTheDocument()
    })
    expect(screen.queryByTestId('analytics-script')).not.toBeInTheDocument()
  })
})
