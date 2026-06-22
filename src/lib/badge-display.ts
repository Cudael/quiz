const BADGE_EMOJIS: Record<string, string> = {
  'first-win': '🏆',
  'perfect-score': '💯',
  'streak-7': '🔥',
  'streak-30': '🌟',
  'quiz-author': '✏️',
  'category-master-science': '🔬',
  'speed-demon': '⚡',
  'night-owl': '🦉',
  centurion: '💎',
  'daily-devotee': '📅',
}

export function getBadgeEmoji(slug: string) {
  return BADGE_EMOJIS[slug] ?? '🎖️'
}
