import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteUser, toggleUserRole } from '@/app/admin/users/actions'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

type UserTransactionMock = {
  user: {
    update: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }
  adminAction: {
    create: ReturnType<typeof vi.fn>
  }
}

const { authMock, prismaMock, txMock } = vi.hoisted(() => {
  const tx: UserTransactionMock = {
    user: {
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
      user: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (callback: (transaction: UserTransactionMock) => Promise<void>) =>
        callback(tx)
      ),
    },
  }
})

vi.mock('@/server/auth', () => ({ auth: authMock }))
vi.mock('@/server/prisma', () => ({ prisma: prismaMock }))

describe('admin users actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects changing the current admin role', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })

    const formData = new FormData()
    formData.set('userId', 'admin_1')
    formData.set('newRole', 'USER')

    const result = await toggleUserRole(formData)

    expect(result).toEqual({ ok: false, message: 'You cannot change your own role.' })
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('logs role changes for other users', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user_2' })

    const formData = new FormData()
    formData.set('userId', 'user_2')
    formData.set('newRole', 'ADMIN')

    const result = await toggleUserRole(formData)

    expect(result).toEqual({ ok: true })
    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user_2' },
      data: { role: 'ADMIN' },
    })
    expect(txMock.adminAction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'ROLE_CHANGE',
          targetId: 'user_2',
        }),
      })
    )
  })

  it('rejects deleting the current admin account', async () => {
    authMock.mockResolvedValue({ user: { id: 'admin_1', role: 'ADMIN' } })

    const formData = new FormData()
    formData.set('userId', 'admin_1')

    const result = await deleteUser(formData)

    expect(result).toEqual({ ok: false, message: 'You cannot delete your own account.' })
    expect(txMock.user.delete).not.toHaveBeenCalled()
  })
})
