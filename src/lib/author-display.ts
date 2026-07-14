export interface AuthorDisplay {
  username: string | null
  role: string
  image?: string | null
}

/**
 * Resolves the display name for a quiz author.
 * Admin users always show as "BusQuiz".
 */
export function getDisplayAuthorName(author: AuthorDisplay): string {
  return author.role === 'ADMIN' ? 'BusQuiz' : (author.username ?? 'Player')
}

export const BUSQUIZ_DISPLAY_NAME = 'BusQuiz'
