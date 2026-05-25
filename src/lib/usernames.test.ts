import { beforeEach, describe, expect, it, vi } from 'vitest'
import { generateUniqueUsername } from '@/lib/usernames'

function makeClient(existingUsernames: string[]) {
  return {
    user: {
      findUnique: vi.fn(({ where }: { where: { username: string } }) => {
        const found = existingUsernames.includes(where.username)
        return Promise.resolve(found ? { id: 'some-id' } : null)
      }),
    },
  }
}

describe('generateUniqueUsername', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the slugified base when no conflicts exist', async () => {
    const client = makeClient([])
    const result = await generateUniqueUsername('Alice Chen', client as never)
    expect(result).toBe('alice-chen')
  })

  it('appends a numeric suffix when the base is taken', async () => {
    const client = makeClient(['alice-chen'])
    const result = await generateUniqueUsername('Alice Chen', client as never)
    expect(result).toBe('alice-chen-2')
  })

  it('increments suffix until finding a free slot', async () => {
    const client = makeClient(['alice-chen', 'alice-chen-2', 'alice-chen-3'])
    const result = await generateUniqueUsername('Alice Chen', client as never)
    expect(result).toBe('alice-chen-4')
  })

  it('generates a fallback player-XXXX slug for empty raw names', async () => {
    const client = makeClient([])
    const result = await generateUniqueUsername('', client as never)
    expect(result).toMatch(/^player-[a-f0-9]{8}$/)
  })

  it('throws after 100 failed attempts', async () => {
    const taken = ['base', ...Array.from({ length: 99 }, (_, i) => `base-${i + 2}`)]
    const client = makeClient(taken)
    await expect(generateUniqueUsername('Base', client as never)).rejects.toThrow(
      'Unable to generate a unique username after 100 attempts'
    )
  })
})
