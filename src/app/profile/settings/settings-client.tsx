'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/toast'
import { REDUCED_MOTION_STORAGE_KEY } from '@/lib/preferences'
import { AccountSection } from './_components/account-section'
import { AppearanceSection } from './_components/appearance-section'
import { DangerZoneSection } from './_components/danger-zone-section'
import { GameplaySection } from './_components/gameplay-section'
import { ProfileSection } from './_components/profile-section'
import { readErrorMessage } from './settings-client.utils'
import type { SettingsClientProps } from './settings-client.types'

export type { SettingsClientProps } from './settings-client.types'

export function SettingsClient({
  initialProfile,
  email,
  hasPassword,
  providers,
  preferences,
}: SettingsClientProps) {
  const { addToast } = useToast()
  const [profile, setProfile] = useState(initialProfile)
  const [defaultDifficulty, setDefaultDifficulty] = useState(preferences.defaultDifficulty ?? 'ANY')
  const [weeklyDigest, setWeeklyDigest] = useState(preferences.weeklyDigest ?? true)
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return preferences.reducedMotion ?? false
    const stored = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return preferences.reducedMotion ?? false
  })

  const savePreferences = async () => {
    const response = await fetch('/api/profile/preferences', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        preferences: {
          defaultDifficulty,
          reducedMotion,
          weeklyDigest,
        },
      }),
    })

    if (!response.ok) {
      addToast(await readErrorMessage(response, 'Could not save preferences.'), 'error')
      return
    }

    localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, String(reducedMotion))
    addToast('Preferences updated.', 'success')
  }

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
      <section className="rounded-md border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, account, and gameplay defaults.
        </p>
      </section>

      <ProfileSection profile={profile} setProfile={setProfile} />

      <AccountSection email={email} hasPassword={hasPassword} providers={providers} />

      <AppearanceSection reducedMotion={reducedMotion} setReducedMotion={setReducedMotion} />

      <GameplaySection
        defaultDifficulty={defaultDifficulty}
        setDefaultDifficulty={setDefaultDifficulty}
        weeklyDigest={weeklyDigest}
        setWeeklyDigest={setWeeklyDigest}
        onSave={() => void savePreferences()}
      />

      <DangerZoneSection username={profile.username} />
    </div>
  )
}
