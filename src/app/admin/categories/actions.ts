'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

type AdminActionResult = { ok: true } | { ok: false; message: string }

const imageUrlSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.url().optional()
)

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

export async function updateCategory(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      categoryId: z.string().cuid(),
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().min(5).max(200),
      icon: z.string().trim().min(1).max(40),
      color: z
        .string()
        .trim()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
      imageUrl: imageUrlSchema,
    })
    .safeParse({
      categoryId: formData.get('categoryId'),
      name: formData.get('name'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color: formData.get('color'),
      imageUrl: formData.get('imageUrl'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid category update payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  await prisma.$transaction(async (tx) => {
    await tx.category.update({
      where: { id: parsed.data.categoryId },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        color: parsed.data.color,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    })

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'CATEGORY_UPDATE',
        targetType: 'Category',
        targetId: parsed.data.categoryId,
        meta: JSON.stringify({
          name: parsed.data.name,
          icon: parsed.data.icon,
          color: parsed.data.color,
          imageUrl: parsed.data.imageUrl ?? null,
        }),
      },
    })
  })

  revalidatePath('/admin/categories')
  return { ok: true }
}

export async function deleteCategory(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      categoryId: z.string().cuid(),
    })
    .safeParse({
      categoryId: formData.get('categoryId'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid category delete payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  const quizCount = await prisma.quiz.count({ where: { categoryId: parsed.data.categoryId } })
  if (quizCount > 0) {
    return { ok: false, message: 'Cannot delete a category that has quizzes' }
  }

  await prisma.$transaction(async (tx) => {
    await tx.category.delete({ where: { id: parsed.data.categoryId } })
    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'CATEGORY_DELETE',
        targetType: 'Category',
        targetId: parsed.data.categoryId,
        meta: '{}',
      },
    })
  })

  revalidatePath('/admin/categories')
  return { ok: true }
}
