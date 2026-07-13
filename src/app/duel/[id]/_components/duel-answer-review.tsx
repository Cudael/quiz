import { CheckCircle2, Circle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DuelStatePayload } from '../duel-view.types'

export function DuelAnswerReview({ review }: { review: NonNullable<DuelStatePayload['review']> }) {
  const answersByQuestion = new Map(review.answers.map((answer) => [answer.questionId, answer]))

  return (
    <section aria-labelledby="duel-answer-review-title">
      <Card>
        <CardHeader>
          <CardTitle id="duel-answer-review-title">Answer review</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compare your answers with the correct choices from this duel.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {review.questions.map((question, index) => {
            const answer = answersByQuestion.get(question.id)
            const selectedIds = new Set(answer?.choiceIds ?? [])
            const correctIds = question.choices
              .filter((choice) => choice.isCorrect)
              .map((choice) => choice.id)
            const isCorrect =
              selectedIds.size === correctIds.length &&
              correctIds.every((choiceId) => selectedIds.has(choiceId))

            return (
              <article key={question.id} className="rounded-md border p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      Question {index + 1}
                    </p>
                    <h3 className="mt-1 font-bold leading-snug">{question.prompt}</h3>
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-1 text-xs font-bold',
                      isCorrect
                        ? 'border-quiz-green/40 bg-quiz-green/10 text-quiz-green-dark dark:text-quiz-green'
                        : 'border-destructive/40 bg-destructive/10 text-destructive'
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                    )}
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <ul className="space-y-2">
                  {question.choices.map((choice) => {
                    const selected = selectedIds.has(choice.id)
                    const correct = choice.isCorrect === true
                    return (
                      <li
                        key={choice.id}
                        className={cn(
                          'flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-sm',
                          correct
                            ? 'border-quiz-green/40 bg-quiz-green/10'
                            : selected
                              ? 'border-destructive/40 bg-destructive/10'
                              : 'border-border bg-card text-muted-foreground'
                        )}
                      >
                        {correct ? (
                          <CheckCircle2
                            className="h-4 w-4 shrink-0 text-quiz-green-dark dark:text-quiz-green"
                            aria-hidden="true"
                          />
                        ) : selected ? (
                          <XCircle
                            className="h-4 w-4 shrink-0 text-destructive"
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0" aria-hidden="true" />
                        )}
                        <span className="flex-1">{choice.text}</span>
                        <span className="text-xs font-semibold">
                          {correct && selected
                            ? 'Your answer · Correct'
                            : correct
                              ? 'Correct answer'
                              : selected
                                ? 'Your answer'
                                : ''}
                        </span>
                      </li>
                    )
                  })}
                </ul>

                {!answer || answer.choiceIds.length === 0 ? (
                  <p className="mt-3 text-xs font-semibold text-destructive">
                    You didn&apos;t answer this question.
                  </p>
                ) : null}
              </article>
            )
          })}
        </CardContent>
      </Card>
    </section>
  )
}
