'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { auth } from '@/server/auth'
import { prisma } from '@/server/prisma'

type FeedbackResult =
  | { ok: true }
  | {
      ok: false
      error: 'UNAUTHORIZED' | 'VALIDATION_ERROR'
      message: string
    }

const feedbackSchema = z.object({
  type: z.enum(['BUG_REPORT', 'FEATURE_REQUEST', 'GENERAL_FEEDBACK', 'CONTENT_ISSUE']),
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(5000),
  email: z.string().email().optional().or(z.literal('')),
})

export async function submitFeedback(formData: FormData): Promise<FeedbackResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false, error: 'UNAUTHORIZED', message: 'Please sign in to leave feedback.' }
  }

  const parsed = feedbackSchema.safeParse({
    type: formData.get('type'),
    message: formData.get('message'),
    email: formData.get('email') || undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: 'VALIDATION_ERROR', message: 'Please check your input.' }
  }

  await prisma.feedback.create({
    data: {
      userId: session.user.id,
      type: parsed.data.type,
      message: parsed.data.message,
      email: parsed.data.email || null,
    },
  })

  revalidatePath('/feedback')
  return { ok: true }
}
