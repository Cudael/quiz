'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/components/theme/theme-provider'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { useToast } from '@/components/ui/toast'
import { REDUCED_MOTION_STORAGE_KEY } from '@/lib/preferences'
import type { z } from 'zod'
import { userPreferencesSchema } from '@/schemas'

type UserPreferences = z.infer<typeof userPreferencesSchema>

interface SettingsClientProps {
  initialProfile: {
    name: string
    username: string
    bio: string
    image: string
    bannerImage: string
  }
  email: string | null
  hasPassword: boolean
  providers: string[]
  preferences: UserPreferences
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = (await response.json()) as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

function isValidImageUrl(value: string) {
  if (!value.trim()) {
    return false
  }

  try {
    const url = new URL(value)
    return Boolean(url.protocol && url.hostname)
  } catch {
    return false
  }
}

export function SettingsClient({
  initialProfile,
  email,
  hasPassword,
  providers,
  preferences,
}: SettingsClientProps) {
  const { addToast } = useToast()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState(initialProfile)
  const [defaultMode, setDefaultMode] = useState(preferences.defaultMode ?? 'CLASSIC')
  const [defaultDifficulty, setDefaultDifficulty] = useState(preferences.defaultDifficulty ?? 'ANY')
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return preferences.reducedMotion ?? false
    const stored = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY)
    if (stored === 'true') return true
    if (stored === 'false') return false
    return preferences.reducedMotion ?? false
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [confirmUsername, setConfirmUsername] = useState('')
  const usernameForDelete = `@${profile.username}`

  const savePreferences = async () => {
    const response = await fetch('/api/me/preferences', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        preferences: {
          defaultMode,
          defaultDifficulty,
          reducedMotion,
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
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, account, and gameplay defaults.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Profile</h2>
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const response = await fetch('/api/me/profile', {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                ...profile,
                bio: profile.bio.trim() || null,
                image: profile.image.trim() || null,
                bannerImage: profile.bannerImage.trim() || null,
              }),
            })

            if (!response.ok) {
              addToast(await readErrorMessage(response, 'Could not update profile.'), 'error')
              return
            }

            addToast('Profile updated.', 'success')
          }}
        >
          <div className="space-y-1">
            <label htmlFor="settings-name" className="text-sm font-medium">
              Display name
            </label>
            <Input
              id="settings-name"
              value={profile.name}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              required
              maxLength={80}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-username" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="settings-username"
              value={profile.username}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, username: event.target.value }))
              }
              required
              maxLength={32}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-bio" className="text-sm font-medium">
              Bio
            </label>
            <textarea
              id="settings-bio"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={profile.bio}
              onChange={(event) => setProfile((prev) => ({ ...prev, bio: event.target.value }))}
              maxLength={280}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-image" className="text-sm font-medium">
              Avatar URL
            </label>
            <Input
              id="settings-image"
              type="url"
              placeholder="https://example.com/avatar.png"
              value={profile.image}
              onChange={(event) => setProfile((prev) => ({ ...prev, image: event.target.value }))}
            />
          </div>
          {isValidImageUrl(profile.image) ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Avatar preview</p>
              <Avatar src={profile.image} fallback={profile.name} size="xl" />
            </div>
          ) : null}
          <div className="space-y-1">
            <label htmlFor="settings-banner-image" className="text-sm font-medium">
              Banner image URL
            </label>
            <Input
              id="settings-banner-image"
              type="url"
              placeholder="https://example.com/banner.png"
              value={profile.bannerImage}
              onChange={(event) =>
                setProfile((prev) => ({ ...prev, bannerImage: event.target.value }))
              }
            />
          </div>
          {isValidImageUrl(profile.bannerImage) ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Banner preview</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.bannerImage}
                alt="Profile banner preview"
                className="h-28 w-full rounded-lg border border-border object-cover"
              />
            </div>
          ) : null}
          <Button type="submit">Save profile</Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          Email: <span className="font-medium">{email ?? 'Not set'}</span>
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Linked providers:{' '}
          <span className="font-medium">
            {providers.length ? providers.join(', ') : 'None linked'}
          </span>
        </p>

        {hasPassword && (
          <form
            className="mt-4 space-y-3"
            onSubmit={async (event) => {
              event.preventDefault()
              if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                addToast('New password confirmation does not match.', 'error')
                return
              }

              const response = await fetch('/api/me/password', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                  currentPassword: passwordForm.currentPassword,
                  newPassword: passwordForm.newPassword,
                }),
              })

              if (!response.ok) {
                addToast(await readErrorMessage(response, 'Could not change password.'), 'error')
                return
              }

              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
              addToast('Password updated.', 'success')
            }}
          >
            <div className="space-y-1">
              <label htmlFor="settings-current-password" className="text-sm font-medium">
                Current password
              </label>
              <Input
                id="settings-current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="settings-new-password" className="text-sm font-medium">
                New password
              </label>
              <Input
                id="settings-new-password"
                type="password"
                minLength={8}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="settings-confirm-password" className="text-sm font-medium">
                Confirm new password
              </label>
              <Input
                id="settings-confirm-password"
                type="password"
                minLength={8}
                value={passwordForm.confirmPassword}
                onChange={(event) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                }
                required
              />
            </div>
            <Button type="submit" variant="outline">
              Change password
            </Button>
          </form>
        )}
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Appearance</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label htmlFor="settings-theme" className="text-sm font-medium">
              Theme
            </label>
            <select
              id="settings-theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value as 'light' | 'dark' | 'system')}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Reduced motion
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold">Gameplay</h2>
        {/* TODO: prefill mode/difficulty selectors in all quiz-start entry points from saved preferences. */}
        <p className="mb-3 text-sm text-muted-foreground">
          Defaults are saved now. Wiring defaults into all quiz start surfaces remains a follow-up.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="settings-default-mode" className="text-sm font-medium">
              Default mode
            </label>
            <select
              id="settings-default-mode"
              value={defaultMode}
              onChange={(event) => setDefaultMode(event.target.value as typeof defaultMode)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="CLASSIC">Classic</option>
              <option value="TIMED">Timed</option>
              <option value="SURVIVAL">Survival</option>
              <option value="DAILY">Daily</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="settings-default-difficulty" className="text-sm font-medium">
              Default difficulty
            </label>
            <select
              id="settings-default-difficulty"
              value={defaultDifficulty}
              onChange={(event) =>
                setDefaultDifficulty(event.target.value as typeof defaultDifficulty)
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="ANY">Any</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
        </div>
        <Button className="mt-4" onClick={() => void savePreferences()}>
          Save preferences
        </Button>
      </section>

      <section className="rounded-xl border border-destructive/40 bg-card p-6">
        <h2 className="mb-2 text-lg font-semibold text-destructive">Danger zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Delete your account permanently. Type {usernameForDelete} to confirm.
        </p>
        <Button variant="destructive" onClick={() => setDeleteModalOpen(true)}>
          Delete account
        </Button>
      </section>

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete account"
        description={`Type ${usernameForDelete} to confirm.`}
      >
        <form
          className="space-y-3"
          onSubmit={async (event) => {
            event.preventDefault()
            const response = await fetch('/api/me', {
              method: 'DELETE',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ confirmUsername }),
            })

            if (!response.ok) {
              addToast(await readErrorMessage(response, 'Could not delete account.'), 'error')
              return
            }

            await signOut({ callbackUrl: '/' })
          }}
        >
          <div className="space-y-1">
            <label htmlFor="settings-delete-confirmation" className="text-sm font-medium">
              Confirmation
            </label>
            <Input
              id="settings-delete-confirmation"
              value={confirmUsername}
              onChange={(event) => setConfirmUsername(event.target.value)}
              placeholder={usernameForDelete}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive">
              Permanently delete
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
