'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'
import { categorySuggestionSchema } from '@/schemas'
import { type ActionResult } from './_shared'

export async function suggestCategory(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in.' }
  }

  const parsed = categorySuggestionSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    icon: formData.get('icon'),
    color: formData.get('color'),
  })
  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Invalid category suggestion.' }
  }

  await prisma.categorySuggestion.create({
    data: {
      ...parsed.data,
      suggestedById: session.user.id,
    },
  })

  revalidatePath('/studio/quiz/new')
  return { ok: true }
}
