'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

type AdminActionResult = { ok: true } | { ok: false; message: string }

async function assertAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false as const, message: 'Please sign in.' }
  }
  if (session.user.role !== 'ADMIN') {
    return { ok: false as const, message: 'Admin only.' }
  }
  return { ok: true as const, userId: session.user.id }
}

export async function toggleUserRole(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      userId: z.string(),
      newRole: z.enum(['USER', 'ADMIN']),
    })
    .safeParse({
      userId: formData.get('userId'),
      newRole: formData.get('newRole'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid role change payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  if (parsed.data.userId === guard.userId) {
    return { ok: false, message: 'You cannot change your own role.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true },
  })

  if (!user) {
    return { ok: false, message: 'User not found.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: parsed.data.userId },
      data: { role: parsed.data.newRole },
    })

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'ROLE_CHANGE',
        targetType: 'User',
        targetId: parsed.data.userId,
        meta: JSON.stringify({ newRole: parsed.data.newRole }),
      },
    })
  })

  revalidatePath('/admin/users')
  return { ok: true }
}

export async function deleteUser(formData: FormData): Promise<{ ok: boolean; message?: string }> {
  const parsed = z.object({ userId: z.string() }).safeParse({ userId: formData.get('userId') })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid user delete payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  if (parsed.data.userId === guard.userId) {
    return { ok: false, message: 'You cannot delete your own account.' }
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
    select: { id: true },
  })

  if (!user) {
    return { ok: false, message: 'User not found.' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.delete({ where: { id: parsed.data.userId } })
    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'USER_DELETE',
        targetType: 'User',
        targetId: parsed.data.userId,
        meta: '{}',
      },
    })
  })

  revalidatePath('/admin/users')
  return { ok: true }
}
