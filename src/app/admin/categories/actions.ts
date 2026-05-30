'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { slugify } from '@/lib/slugify'
import { CATEGORY_BAR_TAG } from '@/components/layout/category-bar'

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
        meta: {
          name: parsed.data.name,
          icon: parsed.data.icon,
          color: parsed.data.color,
          imageUrl: parsed.data.imageUrl ?? null,
        },
      },
    })
  })

  revalidatePath('/admin/categories')
  revalidateTag(CATEGORY_BAR_TAG, 'max')
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
        meta: {},
      },
    })
  })

  revalidatePath('/admin/categories')
  revalidateTag(CATEGORY_BAR_TAG, 'max')
  return { ok: true }
}

export async function createCategory(
  formData: FormData
): Promise<{ ok: boolean; message?: string }> {
  const parsed = z
    .object({
      name: z.string().trim().min(2).max(80),
      description: z.string().trim().min(5).max(200),
      icon: z.string().trim().min(1).max(40),
      color: z
        .string()
        .trim()
        .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/),
      imageUrl: imageUrlSchema,
      parentSlug: z.preprocess(
        (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
        z.string().trim().nullable().optional()
      ),
    })
    .safeParse({
      name: formData.get('name'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color: formData.get('color'),
      imageUrl: formData.get('imageUrl'),
      parentSlug: formData.get('parentSlug'),
    })

  if (!parsed.success) {
    return { ok: false, message: 'Invalid category create payload.' }
  }

  const guard = await assertAdmin()
  if (!guard.ok) return guard satisfies AdminActionResult

  const slug = slugify(parsed.data.name)

  await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({
      data: {
        slug,
        name: parsed.data.name,
        description: parsed.data.description,
        icon: parsed.data.icon,
        color: parsed.data.color,
        imageUrl: parsed.data.imageUrl ?? null,
        parentSlug: parsed.data.parentSlug ?? null,
      },
    })

    await tx.adminAction.create({
      data: {
        actorId: guard.userId,
        action: 'CATEGORY_CREATE',
        targetType: 'Category',
        targetId: category.id,
        meta: {
          name: parsed.data.name,
          slug,
          icon: parsed.data.icon,
          color: parsed.data.color,
          parentSlug: parsed.data.parentSlug ?? null,
        },
      },
    })
  })

  revalidatePath('/admin/categories')
  revalidateTag(CATEGORY_BAR_TAG, 'max')
  return { ok: true }
}
