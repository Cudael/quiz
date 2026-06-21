import type { z } from 'zod'
import type { userPreferencesSchema } from '@/schemas'

export type UserPreferences = z.infer<typeof userPreferencesSchema>

export type DefaultDifficulty = NonNullable<UserPreferences['defaultDifficulty']>

export interface SettingsProfile {
  name: string
  username: string
  bio: string
  image: string
  bannerImage: string
}

export interface SettingsClientProps {
  initialProfile: SettingsProfile
  email: string | null
  hasPassword: boolean
  providers: string[]
  preferences: UserPreferences
}
