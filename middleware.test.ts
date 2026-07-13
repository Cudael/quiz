import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getTokenMock } = vi.hoisted(() => ({ getTokenMock: vi.fn() }))

vi.mock('next-auth/jwt', () => ({ getToken: getTokenMock }))

import middleware from './middleware'

type MiddlewareRequest = {
  headers: Headers
  nextUrl: {
    pathname: string
    origin: string
    href: string
    protocol: string
  }
}

function createRequest(pathname: string): MiddlewareRequest {
  const origin = 'http://localhost'
  return {
    headers: new Headers(),
    nextUrl: {
      pathname,
      origin,
      href: `${origin}${pathname}`,
      protocol: 'http:',
    },
  }
}

function authenticateAs(role: 'USER' | 'ADMIN') {
  getTokenMock.mockResolvedValue({ id: 'user-1', role })
}

beforeEach(() => {
  vi.clearAllMocks()
  getTokenMock.mockResolvedValue(null)
})

describe('middleware guest-only auth redirects', () => {
  it('redirects authenticated users away from /sign-in to /profile', async () => {
    authenticateAs('USER')

    const response = (await middleware(createRequest('/sign-in') as never)) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/profile')
  })

  it('redirects authenticated users away from /sign-up to /profile', async () => {
    authenticateAs('USER')

    const response = (await middleware(createRequest('/sign-up') as never)) as Response

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost/profile')
  })
})

describe('middleware route protection and security headers', () => {
  it.each(['/studio', '/admin'])('redirects anonymous access to %s', async (pathname) => {
    const response = (await middleware(createRequest(pathname) as never)) as Response

    expect(response.status).toBe(307)
    const location = new URL(response.headers.get('location')!)
    expect(location.pathname).toBe('/api/auth/signin')
    expect(location.searchParams.get('callbackUrl')).toBe(`http://localhost${pathname}`)
  })

  it('rewrites a non-admin away from admin pages', async () => {
    authenticateAs('USER')

    const response = (await middleware(createRequest('/admin/users') as never)) as Response

    expect(response.headers.get('x-middleware-rewrite')).toBe('http://localhost/admin/forbidden')
  })

  it('allows an admin through to admin pages', async () => {
    authenticateAs('ADMIN')

    const response = (await middleware(createRequest('/admin/users') as never)) as Response

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-rewrite')).toBeNull()
  })

  it('allows public pages and applies a nonce-based CSP', async () => {
    const response = (await middleware(createRequest('/categories') as never)) as Response
    const csp = response.headers.get('content-security-policy')

    expect(response.status).toBe(200)
    expect(csp).toContain("script-src 'self' 'nonce-")
    expect(csp).toContain("frame-ancestors 'self'")
  })

  it('allows third-party framing only for embed pages', async () => {
    const response = (await middleware(createRequest('/embed/quiz/quiz-1') as never)) as Response

    expect(response.headers.get('content-security-policy')).toContain('frame-ancestors *')
  })

  it('never reads the session on public pages and never sets cookies', async () => {
    const response = (await middleware(createRequest('/categories') as never)) as Response

    // Sign-out correctness depends on middleware responses never carrying a
    // re-issued session cookie that could clobber the deletion.
    expect(getTokenMock).not.toHaveBeenCalled()
    expect(response.headers.get('set-cookie')).toBeNull()
  })
})
