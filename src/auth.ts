import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateUniqueUsername } from '@/lib/usernames'

const credentialsSchema = z.object({
  name: z.string().trim().min(1).max(80),
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
  adapter: PrismaAdapter(prisma),
  providers,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-only-secret',
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
      }

      if (user) {
        tokenWithProfile.id = user.id
        tokenWithProfile.role = user.role
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
          },
        })

        if (dbUser) {
          tokenWithProfile.role = dbUser.role
          tokenWithProfile.username = dbUser.username
          tokenWithProfile.xp = dbUser.xp
          tokenWithProfile.level = dbUser.level
          tokenWithProfile.streakDays = dbUser.streakDays
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
        }
        session.user.id = tokenWithProfile.id as string
        session.user.role = (tokenWithProfile.role as string) ?? 'USER'
        session.user.username = tokenWithProfile.username ?? null
        session.user.xp = Number(tokenWithProfile.xp ?? 0)
        session.user.level = Number(tokenWithProfile.level ?? 1)
        session.user.streakDays = Number(tokenWithProfile.streakDays ?? 0)
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
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}
