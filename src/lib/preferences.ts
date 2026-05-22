import { userPreferencesSchema } from '@/schemas'

export const REDUCED_MOTION_STORAGE_KEY = 'reducedMotion'

export function parseUserPreferences(value: string | null | undefined) {
  if (!value) return {}
  try {
    const parsed = JSON.parse(value)
    const validated = userPreferencesSchema.safeParse(parsed)
    return validated.success ? validated.data : {}
  } catch {
    return {}
  }
}
