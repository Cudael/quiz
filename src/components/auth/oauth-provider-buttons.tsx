'use client'

import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface OauthProviderButtonsProps {
  callbackUrl: string
  googleEnabled: boolean
  githubEnabled: boolean
}

const oauthProviders = [
  { id: 'google', label: 'Continue with Google' },
  { id: 'github', label: 'Continue with GitHub' },
] as const

export function OauthProviderButtons({
  callbackUrl,
  googleEnabled,
  githubEnabled,
}: OauthProviderButtonsProps) {
  const enabled = oauthProviders.filter((provider) =>
    provider.id === 'google' ? googleEnabled : githubEnabled
  )

  if (enabled.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      {enabled.map((provider) => (
        <Button
          key={provider.id}
          type="button"
          variant={enabled.length === 1 ? 'default' : 'outline'}
          className="w-full"
          onClick={() => signIn(provider.id, { callbackUrl })}
        >
          {provider.label}
        </Button>
      ))}
    </div>
  )
}
