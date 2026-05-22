import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteCategory, updateCategory } from '@/app/admin/categories/actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

type CategoryTransactionMock = {
  category: {
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  adminAction: {
    create: ReturnType<typeof vi.fn>
  }
}

const { authMock, prismaMock, txMock } = vi.hoisted(() => {
  const tx: CategoryTransactionMock = {
    category: {
      update: vi.fn(),
      delete: vi.fn(),
    },
    adminAction: {
      create: vi.fn(),
    },
  }

  return {
    authMock: vi.fn(),
    txMock: tx,
    prismaMock: {
      quiz: {
        count: vi.fn(),
      },
      $transaction: vi.fn(
        async (callback: (transaction: CategoryTransactionMock) => Promise<void>) => callback(tx)
      ),
    },
  }
})

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

describe('admin categories actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('stores blank image urls as null when updating', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })

    const formData = new FormData()
    formData.set('categoryId', 'c123456789012345678901234')
    formData.set('name', 'Science')
    formData.set('description', 'Science quizzes for curious minds')
    formData.set('icon', 'Flask')
    formData.set('color', '#00ffaa')
    formData.set('imageUrl', '')

    const result = await updateCategory(formData)

    expect(result).toEqual({ ok: true })
    expect(txMock.category.update).toHaveBeenCalledWith({
      where: { id: 'c123456789012345678901234' },
      data: expect.objectContaining({ imageUrl: null }),
    })
  })

  it('refuses to delete categories that still have quizzes', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })
    prismaMock.quiz.count.mockResolvedValue(2)

    const formData = new FormData()
    formData.set('categoryId', 'c123456789012345678901234')

    const result = await deleteCategory(formData)

    expect(result).toEqual({ ok: false, message: 'Cannot delete a category that has quizzes' })
    expect(txMock.category.delete).not.toHaveBeenCalled()
  })
})
