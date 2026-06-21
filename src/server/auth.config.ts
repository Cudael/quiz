import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'

/**
 * Builds the OAuth provider list from environment variables.
 * Edge-safe — no Prisma or Node.js-only imports.
 * Shared by auth.config.ts (middleware/edge) and auth.ts (Node.js runtime).
 */
export function buildOAuthProviders() {
  return [
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ]
}

/**
 * Edge-safe auth config — no Prisma, no Node.js-only imports.
 * Used by middleware and as the base for the full auth.ts config.
 */
export const authConfig: NextAuthConfig = {
  providers: [
    ...buildOAuthProviders(),
    // Credentials providers are declared here for typing but
    // their `authorize` logic lives in auth.ts (Node.js runtime only).
    Credentials({ id: 'email-password', name: 'Email and Password', credentials: {} }),
  ],
  pages: {
    signIn: '/sign-in',
  },
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    authorized({ auth }) {
      // Used by middleware to check if a session exists.
      // Actual route protection logic stays in middleware.ts.
      return !!auth
    },
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && typeof token.role === 'string') {
        session.user.role = token.role
      }
      return session
    },
    redirect({ url, baseUrl }) {
      const base = new URL(baseUrl)
      const destination = new URL(url, baseUrl)

      if (destination.origin !== base.origin) {
        return baseUrl
      }

      if (destination.pathname === '/sign-in' || destination.pathname === '/sign-up') {
        const callbackUrl = destination.searchParams.get('callbackUrl')
        if (callbackUrl) {
          try {
            const callbackDestination = new URL(callbackUrl, baseUrl)
            if (callbackDestination.origin === base.origin) {
              return callbackDestination.toString()
            }
          } catch {
            // Ignore invalid callbackUrl and fall back to /profile.
          }
        }
        return new URL('/profile', baseUrl).toString()
      }

      return destination.toString()
    },
  },
}
