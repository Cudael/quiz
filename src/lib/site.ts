export const siteConfig = {
  name: 'BusQuiz',
  title: 'BusQuiz — Play, Create & Compete',
  description:
    'Play free quizzes across a growing range of topics. Create quizzes, compete on leaderboards, and earn badges.',
  taglines: [
    'Play. Learn. Conquer.',
    'Your daily brain workout.',
    'Where curiosity meets competition.',
    'Fresh quizzes. Zero boredom.',
    'Flex those brain muscles.',
    'Knowledge is the ultimate power-up.',
  ],
}

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export function absoluteUrl(path = '') {
  const normalizedSiteUrl = siteUrl.replace(/\/$/, '')
  if (!path) {
    return normalizedSiteUrl
  }
  if (path === '/') {
    return `${normalizedSiteUrl}/`
  }
  const normalizedPath = `/${path.replace(/^\/+/, '')}`
  return `${normalizedSiteUrl}${normalizedPath}`
}
