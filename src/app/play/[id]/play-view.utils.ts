export const SOUND_PREFERENCE_STORAGE_KEY = 'quiz-sound-enabled'

export function getSoundPreference() {
  if (typeof window === 'undefined') {
    return true
  }

  const storedPreference = localStorage.getItem(SOUND_PREFERENCE_STORAGE_KEY)
  return storedPreference === null ? true : storedPreference === 'true'
}

// Question images can come from arbitrary quiz-authored URLs, so this loader intentionally
// bypasses Next's remote-pattern restrictions while still using the <Image> component layout API.
export function imageLoader({ src }: { src: string }) {
  return src
}

export function getQuestionImageSrc(imageUrl?: string | null) {
  if (!imageUrl) return null
  if (imageUrl.startsWith('/')) return imageUrl

  try {
    const parsedUrl = new URL(imageUrl)
    return parsedUrl.protocol === 'https:' ? imageUrl : null
  } catch {
    return null
  }
}
