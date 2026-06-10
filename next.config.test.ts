import { describe, expect, it, vi } from 'vitest'

async function loadConfig() {
  vi.resetModules()
  return (await import('./next.config')).default
}

describe('next.config images.remotePatterns', () => {
  it('adds the R2 public hostname when R2_PUBLIC_URL is valid', async () => {
    vi.stubEnv('R2_PUBLIC_URL', 'https://images.busquiz.com')

    const config = await loadConfig()

    expect(config.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
        { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
        { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
        { protocol: 'https', hostname: 'images.busquiz.com', pathname: '/**' },
      ])
    )
    expect(config.images?.remotePatterns).not.toEqual(
      expect.arrayContaining([
        {
          protocol: 'https',
          hostname: '*.public.blob.vercel-storage.com',
          pathname: '/**',
        },
      ])
    )
  })

  it('skips the R2 hostname when R2_PUBLIC_URL is invalid', async () => {
    vi.stubEnv('R2_PUBLIC_URL', 'not-a-valid-url')

    const config = await loadConfig()

    expect(config.images?.remotePatterns).toEqual(
      expect.arrayContaining([
        { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
        { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
        { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      ])
    )
    expect(config.images?.remotePatterns).not.toEqual(
      expect.arrayContaining([{ protocol: 'https', hostname: 'not-a-valid-url', pathname: '/**' }])
    )
  })
})
