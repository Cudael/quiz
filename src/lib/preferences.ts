import type { Prisma } from '@prisma/client'
import { userPreferencesSchema } from '@/schemas'

export const REDUCED_MOTION_STORAGE_KEY = 'reducedMotion'

export function parseUserPreferences(value: Prisma.JsonValue | null | undefined) {
  if (value == null) return {}
  try {
    const validated = userPreferencesSchema.safeParse(value)
    return validated.success ? validated.data : {}
  } catch {
    return {}
  }
}
