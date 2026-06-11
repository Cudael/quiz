import 'server-only'
import NextAuth, { type DefaultSession } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/server/prisma'
import { authorizeEmailPassword } from '@/server/authorize-email-password'
import { authConfig, buildOAuthProviders } from '@/server/auth.config'
import { generateUniqueUsername } from '@/lib/usernames'

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
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      if (!account?.provider || account.provider === 'credentials') {
        return true
      }

      const normalizedEmail = user.email?.trim().toLowerCase()
      if (!normalizedEmail) {
        return true
      }

      const now = new Date()

      // Wrap user+account operations in a transaction to prevent inconsistent
      // state if the account upsert fails after user creation.
      const dbUser = await prisma.$transaction(async (tx) => {
        let foundUser = await tx.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true, emailVerified: true },
        })

        if (!foundUser) {
          const emailLocalPart = normalizedEmail.split('@')[0] || normalizedEmail
          const profileName = user.name?.trim() || emailLocalPart
          const username = await generateUniqueUsername(profileName)
          foundUser = await tx.user.create({
            data: {
              name: profileName,
              email: normalizedEmail,
              image: user.image,
              emailVerified: now,
              role: 'USER',
              username,
            },
            select: { id: true, emailVerified: true },
          })
        } else if (!foundUser.emailVerified) {
          foundUser = await tx.user.update({
            where: { id: foundUser.id },
            data: { emailVerified: now },
            select: { id: true, emailVerified: true },
          })
        }

        await tx.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          update: {
            userId: foundUser.id,
          },
          create: {
            userId: foundUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token,
            access_token: account.access_token,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token,
            session_state: account.session_state ? String(account.session_state) : null,
          },
        })

        return foundUser
      })

      user.id = dbUser.id
      return true
    },
    async jwt({ token, user }) {
      const t = token as typeof token & ProfileToken

      if (user) {
        t.id = user.id
        t.role = user.role
        t.emailVerified = user.emailVerified ? new Date(user.emailVerified).toISOString() : null
        // Force an immediate DB refresh on the next jwt() call so all profile
        // fields (username, xp, etc.) are populated right after sign-in.
        t.profileRefreshedAt = 0
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
        } else {
          // User no longer exists — clear the token to force re-auth
          delete t.id
          delete t.role
          delete t.username
          delete t.xp
          delete t.level
          delete t.streakDays
          delete t.emailVerified
          delete t.profileRefreshedAt
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
