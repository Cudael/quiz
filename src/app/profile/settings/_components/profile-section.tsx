'use client'

import type { Dispatch, SetStateAction } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/toast'
import type { SettingsProfile } from '../settings-client.types'
import { isValidImageUrl, readErrorMessage, trimOrNull } from '../settings-client.utils'

interface ProfileSectionProps {
  profile: SettingsProfile
  setProfile: Dispatch<SetStateAction<SettingsProfile>>
}

export function ProfileSection({ profile, setProfile }: ProfileSectionProps) {
  const { addToast } = useToast()

  return (
    <section className="rounded-md border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Profile</h2>
      <form
        className="space-y-3"
        onSubmit={async (event) => {
          event.preventDefault()
          const response = await fetch('/api/profile/profile', {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              ...profile,
              bio: trimOrNull(profile.bio),
              image: trimOrNull(profile.image),
              bannerImage: trimOrNull(profile.bannerImage),
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
            onChange={(event) => setProfile((prev) => ({ ...prev, username: event.target.value }))}
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
              className="h-28 w-full rounded-md border border-border object-cover"
            />
          </div>
        ) : null}
        <Button type="submit">Save profile</Button>
      </form>
    </section>
  )
}
