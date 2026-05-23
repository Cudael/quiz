export const copy = {
  quiz: {
    wrongAnswer: (correctAnswer: string) =>
      `Not quite — the right answer was ${correctAnswer}. Onwards!`,
    timeout: `Out of time on that one — let's keep going.`,
    streakReset: `Streak reset. Today's a fresh start 🔥`,
  },
  emptyStates: {
    leaderboard: `No one's claimed this corner yet — be the first.`,
    noBadges: 'No badges yet — your first unlock is one great run away.',
    noPublishedQuizzes: 'No published quizzes yet — hit publish and show the world what you made.',
    noSessions: 'No sessions yet — your next quiz run could be your breakout moment.',
    noCategoryResults: 'No quizzes match this search yet — try another filter and keep exploring.',
  },
}
