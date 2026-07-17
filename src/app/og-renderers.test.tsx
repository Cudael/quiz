import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderQuizOgCard } from '@/app/quiz/[id]/opengraph-image'
import { renderUserOgCard } from '@/app/u/[username]/opengraph-image'
import { renderLeaderboardOgCard } from '@/app/leaderboard/opengraph-image'

describe('OG renderers', () => {
  it('renders deterministic JSX cards', () => {
    const markup = {
      quiz: renderToStaticMarkup(
        renderQuizOgCard({
          title: 'Science Sprint',
          category: 'Science',
          difficulty: 'HARD',
          author: 'Ada',
        })
      ),
      user: renderToStaticMarkup(
        renderUserOgCard({ username: 'ada', level: 12, xp: 4200, badges: 7 })
      ),
      leaderboard: renderToStaticMarkup(renderLeaderboardOgCard(['Ada', 'Grace', 'Linus'])),
    }

    expect(markup.quiz).toContain('Science Sprint')
    expect(markup.user).toContain('@ada')
    expect(markup.leaderboard).toContain('BusQuiz Leaderboard')
  })
})
