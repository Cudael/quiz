import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/studio',
          '/admin',
          '/auth',
          '/sign-in',
          '/sign-up',
          '/forgot-password',
          '/reset-password',
          '/random-quiz',
          '/r/',
          '/duel/',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
