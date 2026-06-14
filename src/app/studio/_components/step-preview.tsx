'use client'

import Image from 'next/image'
import { useQuizCreatorStore } from '@/store/quiz-creator-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { QuestionTypeIcon } from './question-type-icon'
import { Image as ImageIcon } from 'lucide-react'

interface Category {
  id: string
  name: string
  color: string
}

interface StepPreviewProps {
  quizId?: string
  categories: Category[]
}

const DIFFICULTY_VARIANT: Record<string, 'success' | 'warning' | 'destructive'> = {
  EASY: 'success',
  MEDIUM: 'warning',
  HARD: 'destructive',
}

export function StepPreview({ categories }: StepPreviewProps) {
  const { title, description, categoryId, difficulty, imageUrl, questions, quizFormat, setStep } =
    useQuizCreatorStore()

  const category = categories.find((c) => c.id === categoryId)

  return (
    <div className="space-y-6">
      {/* Cover */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {imageUrl ? (
          <div className="relative aspect-video w-full">
            <Image
              src={imageUrl}
              alt={`${title || 'Untitled quiz'} cover preview`}
              fill
              unoptimized
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-muted">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold">{title || 'Untitled quiz'}</h2>
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {category && <Badge variant="secondary">{category.name}</Badge>}
            <Badge variant={DIFFICULTY_VARIANT[difficulty] ?? 'outline'}>{difficulty}</Badge>
            <Badge variant="outline">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      {/* Questions preview */}
      <div className="space-y-3">
        {questions.map((question, index) => {
          const usesClassicCorrectness = ['SINGLE', 'MULTIPLE'].includes(question.type)
          const hasCorrect = question.choices.some((c) => c.isCorrect)
          return (
            <div key={question.localId} className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-start gap-3">
                <span className="shrink-0 text-sm font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{question.prompt || 'Untitled question'}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <QuestionTypeIcon type={question.type} showLabel />
                    {usesClassicCorrectness && !hasCorrect && (
                      <Badge variant="destructive" className="text-xs">
                        No correct answer
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {question.imageUrl && (
                <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={question.imageUrl}
                    alt={`Illustration for question ${index + 1}`}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div
                className={quizFormat === 'IMAGE_CHOICE' ? 'grid grid-cols-2 gap-2' : 'space-y-1'}
              >
                {question.choices.map((choice) => (
                  <div
                    key={choice.localId}
                    className={`rounded-lg border ${
                      usesClassicCorrectness && choice.isCorrect
                        ? 'border-quiz-green/50 bg-quiz-green/10 text-quiz-green'
                        : 'border-border'
                    } ${quizFormat === 'IMAGE_CHOICE' ? 'flex aspect-square items-center justify-center overflow-hidden p-0' : 'px-3 py-2 text-sm'}`}
                  >
                    {quizFormat === 'IMAGE_CHOICE' && choice.imageUrl ? (
                      <Image
                        src={choice.imageUrl}
                        alt={`Choice ${choice.text || 'image'}`}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      choice.text || (quizFormat === 'IMAGE_CHOICE' ? 'No image' : '(empty)')
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Button type="button" onClick={() => setStep(4)}>
        Go to Publish
      </Button>
    </div>
  )
}
