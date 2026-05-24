import 'server-only'
import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/server/prisma'
import { generateUniqueUsername } from '@/lib/usernames'
import { verifyPassword } from '@/server/password'

const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(80),
})

const emailPasswordCredentialsSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1),
})

const providers = [
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
  Credentials({
    id: 'email-password',
    name: 'Email and Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async (rawCredentials) => {
      const parsed = emailPasswordCredentialsSchema.safeParse(rawCredentials)
      if (!parsed.success) {
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: parsed.data.email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          emailVerified: true,
          passwordHash: true,
        },
      })

      if (!user?.passwordHash) {
        return null
      }

      const isValid = await verifyPassword(parsed.data.password, user.passwordHash)
      if (!isValid) {
        return null
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        emailVerified: user.emailVerified,
      }
    },
  }),
  Credentials({
    id: 'credentials',
    name: 'Guest',
    credentials: {
      name: { label: 'Name', type: 'text' },
    },
    authorize: async (rawCredentials) => {
      const parsed = credentialsSchema.safeParse(rawCredentials)
      if (!parsed.success) {
        return null
      }

      const name = parsed.data.name

      return prisma.user.create({
        data: {
          name,
          username: await generateUniqueUsername(name),
          email: null,
          role: 'USER',
        },
      })
    },
  }),
]

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  pages: {
    signIn: '/sign-in',
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      const tokenWithProfile = token as typeof token & {
        id?: string
        role?: string
        username?: string | null
        xp?: number
        level?: number
        streakDays?: number
        emailVerified?: string | null
      }

      if (user) {
        tokenWithProfile.id = user.id
        tokenWithProfile.role = user.role
        tokenWithProfile.emailVerified = user.emailVerified
          ? new Date(user.emailVerified).toISOString()
          : null
      }

      if (tokenWithProfile.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: tokenWithProfile.id },
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
          tokenWithProfile.role = dbUser.role
          tokenWithProfile.username = dbUser.username
          tokenWithProfile.xp = dbUser.xp
          tokenWithProfile.level = dbUser.level
          tokenWithProfile.streakDays = dbUser.streakDays
          tokenWithProfile.emailVerified = dbUser.emailVerified
            ? dbUser.emailVerified.toISOString()
            : null
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        const tokenWithProfile = token as typeof token & {
          id?: string
          role?: string
          username?: string | null
          xp?: number
          level?: number
          streakDays?: number
          emailVerified?: string | null
        }
        session.user.id = tokenWithProfile.id as string
        session.user.role = (tokenWithProfile.role as string) ?? 'USER'
        session.user.username = tokenWithProfile.username ?? null
        session.user.xp = Number(tokenWithProfile.xp ?? 0)
        session.user.level = Number(tokenWithProfile.level ?? 1)
        session.user.streakDays = Number(tokenWithProfile.streakDays ?? 0)
        session.user.emailVerified = tokenWithProfile.emailVerified
          ? new Date(tokenWithProfile.emailVerified)
          : null
      }

      try {
        const guestKey = (await cookies()).get('qa_guest_id')?.value
        if (guestKey && session.user.id) {
          await prisma.playSession.updateMany({
            where: { userId: null, guestKey },
            data: { userId: session.user.id },
          })
        }
      } catch (error) {
        console.warn('Guest session migration skipped:', error)
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
