import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/site'

// AI-training / scraping crawlers — blocked site-wide since content is
// user-generated and monetized on-site, not for redistribution.
const AI_TRAINING_CRAWLERS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Bytespider',
  'Amazonbot',
  'FacebookBot',
  'Meta-ExternalAgent',
]

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
      ...AI_TRAINING_CRAWLERS.map((userAgent) => ({
        userAgent,
        disallow: ['/'],
      })),
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
