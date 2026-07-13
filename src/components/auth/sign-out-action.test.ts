import { beforeEach, describe, expect, it, vi } from 'vitest'

const { signOutMock } = vi.hoisted(() => ({ signOutMock: vi.fn() }))

vi.mock('@/server/auth', () => ({ signOut: signOutMock }))

import { signOutAction } from '@/components/auth/sign-out-action'

describe('signOutAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invalidates the session and redirects home', async () => {
    await signOutAction()

    expect(signOutMock).toHaveBeenCalledOnce()
    expect(signOutMock).toHaveBeenCalledWith({ redirectTo: '/' })
  })
})
