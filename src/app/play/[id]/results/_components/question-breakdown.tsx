import { CheckCircle2, MinusCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { copy } from '@/lib/copy'
import { renderFillBlankPrompt } from '@/domain/quiz-constants'
import type { ResultAnswer, ResultQuestion } from '../results.types'

interface QuestionBreakdownProps {
  questions: ResultQuestion[]
  answers: ResultAnswer[]
}

export function QuestionBreakdown({ questions, answers }: QuestionBreakdownProps) {
  const answersByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]))

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Question Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {questions.map((q, idx) => {
          const correctText = q.choices
            .filter((c) => c.isCorrect)
            .map((c) => c.text)
            .join(', ')
          const displayPrompt = q.type === 'FILL_BLANK' ? renderFillBlankPrompt(q.prompt) : q.prompt
          const answer = answersByQuestionId.get(q.id) ?? null
          const chosenIds = new Set(answer?.chosenIds ?? [])
          const hasAnswerData = answer !== null
          const isCorrectAnswer = answer?.isCorrect === true
          const statusIcon = !hasAnswerData ? (
            <MinusCircle
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          ) : isCorrectAnswer ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-quiz-green" aria-hidden="true" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          )
          const containerClassName = !hasAnswerData
            ? 'border-border'
            : isCorrectAnswer
              ? 'border-quiz-green/40 bg-quiz-green/5'
              : 'border-destructive/40 bg-destructive/5'

          return (
            <div key={q.id} className={`rounded-lg border p-3 ${containerClassName}`}>
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {idx + 1}
                </span>
                {statusIcon}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium leading-snug">{displayPrompt}</p>
                    {hasAnswerData ? (
                      <span
                        className={`text-xs font-semibold ${
                          isCorrectAnswer ? 'text-quiz-green' : 'text-destructive'
                        }`}
                      >
                        {isCorrectAnswer ? 'Correct' : 'Incorrect'}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        Legacy session
                      </span>
                    )}
                  </div>

                  {hasAnswerData ? (
                    <div className="mt-3 space-y-2">
                      {q.choices.map((choice) => {
                        const isChosen = chosenIds.has(choice.id)
                        const isCorrect = choice.isCorrect

                        return (
                          <div
                            key={choice.id}
                            className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-xs ${
                              isCorrect
                                ? 'border-quiz-green/40 bg-quiz-green/10'
                                : isChosen
                                  ? 'border-destructive/40 bg-destructive/10'
                                  : 'border-border bg-background/80'
                            }`}
                          >
                            <span>{choice.text}</span>
                            <span className="shrink-0 font-semibold text-muted-foreground">
                              {isChosen ? 'Selected' : null}
                              {isChosen && isCorrect ? ' • ' : null}
                              {isCorrect ? 'Correct' : null}
                            </span>
                          </div>
                        )
                      })}
                      {!isCorrectAnswer && chosenIds.size === 0 && q.type === 'FILL_BLANK' ? (
                        <p className="text-xs text-muted-foreground">
                          No accepted answer was recorded for this response.
                        </p>
                      ) : null}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Answer details are unavailable for this session.
                    </p>
                  )}
                </div>
              </div>
              <p className="pl-7 text-xs text-muted-foreground">
                {hasAnswerData && !isCorrectAnswer
                  ? copy.quiz.wrongAnswer(correctText)
                  : `Accepted answer${correctText.includes(',') ? 's' : ''}: ${correctText}`}
              </p>
              {q.explanation && (
                <p className="mt-1 pl-7 text-xs italic text-muted-foreground">{q.explanation}</p>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
