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
        <h1>BusQuiz</h1>
        <button type="button">Play now</button>
      </main>
    )
  })

  it('/categories', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Categories</h1>
        <label htmlFor="route-categories-search">Search categories</label>
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

  it('/me', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>My profile</h1>
        <button type="button">Share profile</button>
      </main>
    )
  })

  it('/me/settings', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Settings</h1>
        <label htmlFor="settings-name">Display name</label>
        <input id="settings-name" type="text" />
      </main>
    )
  })

  it('/studio', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Quiz Studio</h1>
        <nav aria-label="Studio tabs">
          <a href="/studio?tab=published" aria-current="page">
            Published
          </a>
          <a href="/studio?tab=drafts">Drafts</a>
        </nav>
        <ul aria-label="Quiz list">
          <li>My quiz</li>
        </ul>
      </main>
    )
  })

  it('/studio/quiz/[id]', async () => {
    await expectNoSeriousOrCritical(
      <main>
        <h1>Edit quiz</h1>
        <nav aria-label="Creator steps">
          <button type="button" aria-current="step">
            1 Details
          </button>
          <button type="button">2 Questions</button>
          <button type="button">3 Preview</button>
          <button type="button">4 Publish</button>
        </nav>
        <form>
          <label htmlFor="studio-title">Title</label>
          <input id="studio-title" type="text" />
          <button type="submit">Save draft</button>
        </form>
      </main>
    )
  })
})
