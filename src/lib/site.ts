export const siteConfig = {
  name: 'QuizArena',
  title: 'QuizArena — Play, Create & Compete',
  description:
    'Test your knowledge across hundreds of categories. Create quizzes, compete on leaderboards, and earn badges.',
}

export const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export function absoluteUrl(path = '') {
  return `${siteUrl}${path}`
}
