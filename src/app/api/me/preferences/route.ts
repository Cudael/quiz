import { NextResponse } from 'next/server'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { mePreferencesSchema } from '@/schemas'
import { parseUserPreferences } from '@/lib/preferences'

const GENERIC_ERROR = 'Unable to update preferences.'

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const parsed = mePreferencesSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: GENERIC_ERROR }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mergedPreferences = {
    ...parseUserPreferences(user.preferences),
    ...parsed.data.preferences,
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      preferences: JSON.stringify(mergedPreferences),
    },
  })

  return NextResponse.json({ ok: true, preferences: mergedPreferences })
}
