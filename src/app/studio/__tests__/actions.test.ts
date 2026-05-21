import { beforeEach, describe, expect, it, vi } from 'vitest'
import { togglePublish } from '@/app/studio/actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

const { authMock, prismaMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  prismaMock: {
    quiz: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/auth', () => ({
  auth: authMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

describe('studio actions auth checks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects non-author non-admin togglePublish', async () => {
    authMock.mockResolvedValue({
      user: { id: 'user_a', role: 'USER' },
    })
    prismaMock.quiz.findUnique
      .mockResolvedValueOnce({ id: 'quiz_1', authorId: 'user_b' })
      .mockResolvedValueOnce({ isPublished: false })

    const formData = new FormData()
    formData.set('quizId', 'c123456789012345678901234')
    const result = await togglePublish(formData)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('FORBIDDEN')
    }
    expect(prismaMock.quiz.update).not.toHaveBeenCalled()
  })
})
