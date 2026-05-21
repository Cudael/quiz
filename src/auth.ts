import NextAuth, { type DefaultSession } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

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
  session: { strategy: 'jwt' },
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }

      try {
        const guestKey = (await cookies()).get('qa_guest_id')?.value
        if (guestKey && session.user.id) {
          await prisma.playSession.updateMany({
            where: { userId: null, guestKey },
            data: { userId: session.user.id },
          })
        }
      } catch {
        // Ignore cookie migration if request cookies are not available in this context.
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
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}
