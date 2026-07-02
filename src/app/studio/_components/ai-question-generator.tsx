'use client'

import { useState, useTransition } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { generateQuestionsWithAi } from '@/app/studio/actions/ai-generate'

interface AiQuestionGeneratorProps {
  quizId: string
}

export function AiQuestionGenerator({ quizId }: AiQuestionGeneratorProps) {
  const [topic, setTopic] = useState('')
  const [count, setCount] = useState('5')
  const [difficulty, setDifficulty] = useState('MEDIUM')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.set('quizId', quizId)
      if (topic.trim()) formData.set('topic', topic.trim())
      formData.set('count', count)
      formData.set('difficulty', difficulty)
      const result = await generateQuestionsWithAi(formData)
      if (result.ok) {
        // Full reload so the editor shell picks up the newly created questions.
        window.location.reload()
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <section className="rounded-md border bg-card p-4">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-quiz-purple-light" />
        <h2 className="text-sm font-bold">AI question ideas</h2>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Generate draft questions matching this quiz&apos;s format. For image-based formats, image
        fields will be left empty. Review every question before publishing — AI can make mistakes.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          className="sm:max-w-xs"
          disabled={isPending}
          maxLength={200}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Topic (defaults to quiz title)"
          value={topic}
        />
        <select
          aria-label="Number of questions"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          disabled={isPending}
          onChange={(event) => setCount(event.target.value)}
          value={count}
        >
          {['3', '5', '8', '10'].map((n) => (
            <option key={n} value={n}>
              {n} questions
            </option>
          ))}
        </select>
        <select
          aria-label="Difficulty"
          className="h-9 rounded-md border bg-background px-2 text-sm"
          disabled={isPending}
          onChange={(event) => setDifficulty(event.target.value)}
          value={difficulty}
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <Button disabled={isPending} onClick={handleGenerate} type="button" variant="outline">
          {isPending ? 'Generating…' : 'Generate'}
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
    </section>
  )
}
