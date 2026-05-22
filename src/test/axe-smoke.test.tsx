import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import type React from 'react'

async function expectNoSeriousOrCritical(element: React.ReactElement) {
  const { container } = render(element)
  const results = await axe(container)
  const serious = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical'
  )
  expect(serious).toHaveLength(0)
}

describe('axe smoke routes', () => {
  it('/', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>QuizArena</h1>
        <button type="button">Play now</button>
      </main>
    )
  })

  it('/categories', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Categories</h1>
        <label htmlFor="route-categories-search">Search quizzes</label>
        <input id="route-categories-search" type="search" />
      </main>
    )
  })

  it('/quiz/[id]', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Quiz detail</h1>
        <button type="button">Start quiz</button>
      </main>
    )
  })

  it('/play/[id]', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Play quiz</h1>
        <p aria-live="polite">10 seconds remaining</p>
        <button type="button">Choice 1</button>
      </main>
    )
  })

  it('/leaderboard', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Leaderboard</h1>
        <label htmlFor="route-leaderboard-sort">Sort</label>
        <select id="route-leaderboard-sort" defaultValue="total">
          <option value="total">Total</option>
        </select>
      </main>
    )
  })

  it('/u/[username]', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>@player profile</h1>
        <button type="button">Follow</button>
      </main>
    )
  })
})
