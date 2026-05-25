import { NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

const markNotificationsReadSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
})

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let rawBody: unknown = {}
  try {
    const bodyText = await request.text()
    rawBody = bodyText.trim().length > 0 ? (JSON.parse(bodyText) as unknown) : {}
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = markNotificationsReadSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const ids = parsed.data.ids?.filter((id) => id.trim().length > 0) ?? []
  const where =
    ids.length > 0
      ? { userId: session.user.id, isRead: false, id: { in: ids } }
      : { userId: session.user.id, isRead: false }

  const result = await prisma.notification.updateMany({
    where,
    data: { isRead: true },
  })

  return NextResponse.json({ updated: result.count })
}
