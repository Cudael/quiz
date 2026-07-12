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

function createRequest(
  pathname: string,
  hasUser: boolean,
  role: 'USER' | 'ADMIN' = 'USER'
): MiddlewareRequest {
  const origin = 'http://localhost'
  return {
    headers: new Headers(),
    nextUrl: {
      pathname,
      origin,
      href: `${origin}${pathname}`,
    },
    auth: hasUser ? { user: { id: 'user-1', role } } : undefined,
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

describe('middleware route protection and security headers', () => {
  it.each(['/studio', '/admin'])('redirects anonymous access to %s', async (pathname) => {
    const response = (await middleware(
      createRequest(pathname, false) as never,
      {} as never
    )) as Response

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location')!)
    expect(location.pathname).toBe('/api/auth/signin')
    expect(location.searchParams.get('callbackUrl')).toBe(`http://localhost${pathname}`)
  })

  it('rewrites a non-admin away from admin pages', async () => {
    const response = (await middleware(
      createRequest('/admin/users', true, 'USER') as never,
      {} as never
    )) as Response

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost/admin/forbidden')
  })

  it('allows an admin through to admin pages', async () => {
    const response = (await middleware(
      createRequest('/admin/users', true, 'ADMIN') as never,
      {} as never
    )) as Response

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('allows public pages and applies a nonce-based CSP', async () => {
    const response = (await middleware(
      createRequest('/categories', false) as never,
      {} as never
    )) as Response
    const csp = response.headers.get('content-security-policy')

    expect(response.status).toBe(200)
    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toContain("frame-ancestors 'self'")
  })

  it('allows third-party framing only for embed pages', async () => {
    const response = (await middleware(
      createRequest('/embed/quiz/quiz-1', false) as never,
      {} as never
    )) as Response

    expect(response.headers.get('content-security-policy')).toContain('frame-ancestors *')
  })
})
