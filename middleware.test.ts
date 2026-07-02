import { describe, expect, it, vi } from 'vitest'

vi.mock('next-auth', () => ({
  default: () => ({
    auth: (middleware: (req: unknown) => Response | Promise<Response>) => middleware,
  }),
}))

import middleware from './middleware'

type MiddlewareRequest = {
  headers: Headers
  nextUrl: {
    pathname: string
    origin: string
    href: string
  }
  auth?: {
    user?: {
      id: string
      role: 'USER' | 'ADMIN'
    }
  }
}

function createRequest(pathname: string, hasUser: boolean): MiddlewareRequest {
  const origin = 'http://localhost'
  return {
    headers: new Headers(),
    nextUrl: {
      pathname,
      origin,
      href: `${origin}${pathname}`,
    },
    auth: hasUser ? { user: { id: 'user-1', role: 'USER' } } : undefined,
  }
}

describe('middleware guest-only auth redirects', () => {
  it('redirects authenticated users away from /sign-in to /profile', async () => {
    const response = (await middleware(
      createRequest('/sign-in', true) as never,
      {} as never
    )) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/profile')
  })

  it('redirects authenticated users away from /sign-up to /profile', async () => {
    const response = (await middleware(
      createRequest('/sign-up', true) as never,
      {} as never
    )) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/profile')
  })
})
