import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '@/server/password'

describe('password helpers', () => {
  it('hashes and verifies password values', async () => {
    const password = 'super-secret-password'
    const passwordHash = await hashPassword(password)

    expect(passwordHash).not.toBe(password)
    await expect(verifyPassword(password, passwordHash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', passwordHash)).resolves.toBe(false)
  })
})
