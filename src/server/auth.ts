import 'server-only'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { cookies } from 'next/headers'
import { prisma } from '@/server/prisma'
import { authorizeEmailPassword } from '@/server/authorize-email-password'
import { authorizeGuest } from '@/server/authorize-guest'
import { authConfig, buildOAuthProviders } from '@/server/auth.config'

/** Profile fields cached inside the JWT. */
interface ProfileToken {
  id?: string
  role?: string
  username?: string | null
  xp?: number
  level?: number
  streakDays?: number
  emailVerified?: string | null
  /** Unix-ms timestamp of the last DB profile refresh. */
  profileRefreshedAt?: number
}

/** How long profile data is cached inside the JWT before a DB re-fetch (5 minutes). */
const PROFILE_TTL_MS = 5 * 60 * 1000

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...buildOAuthProviders(),
    Credentials({
      id: 'email-password',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: authorizeEmailPassword,
    }),
    Credentials({
      id: 'credentials',
      name: 'Guest',
      credentials: {
        name: { label: 'Name', type: 'text' },
      },
      authorize: (rawCredentials, request) => authorizeGuest(rawCredentials, request),
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      const t = token as typeof token & ProfileToken

      if (user) {
        t.id = user.id
        t.role = user.role
        t.emailVerified = user.emailVerified ? new Date(user.emailVerified).toISOString() : null
        // Force an immediate DB refresh on the next jwt() call so all profile
        // fields (username, xp, etc.) are populated right after sign-in.
        t.profileRefreshedAt = undefined
      }

      const now = Date.now()
      const needsRefresh =
        t.id && (!t.profileRefreshedAt || now - t.profileRefreshedAt > PROFILE_TTL_MS)

      if (needsRefresh) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.id },
          select: {
            role: true,
            username: true,
            xp: true,
            level: true,
            streakDays: true,
            emailVerified: true,
          },
        })

        if (dbUser) {
          t.role = dbUser.role
          t.username = dbUser.username
          t.xp = dbUser.xp
          t.level = dbUser.level
          t.streakDays = dbUser.streakDays
          t.emailVerified = dbUser.emailVerified ? dbUser.emailVerified.toISOString() : null
          t.profileRefreshedAt = now
        }
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        const t = token as typeof token & ProfileToken
        session.user.id = t.id as string
        session.user.role = (t.role as string) ?? 'USER'
        session.user.username = t.username ?? null
        session.user.xp = Number(t.xp ?? 0)
        session.user.level = Number(t.level ?? 1)
        session.user.streakDays = Number(t.streakDays ?? 0)
        session.user.emailVerified = t.emailVerified ? new Date(t.emailVerified) : null
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Migrate any anonymous play sessions to the newly-signed-in user account.
      // Running this in the signIn event means it executes once per sign-in
      // rather than on every session read.
      try {
        const guestKey = (await cookies()).get('qa_guest_id')?.value
        if (guestKey && user.id) {
          await prisma.playSession.updateMany({
            where: { userId: null, guestKey },
            data: { userId: user.id },
          })
        }
      } catch (error) {
        console.warn('Guest session migration skipped:', error)
      }
    },
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      username: string | null
      xp: number
      level: number
      streakDays: number
      emailVerified: Date | null
    } & DefaultSession['user']
  }

  interface User {
    role: string
    emailVerified?: Date | null
  }
}
