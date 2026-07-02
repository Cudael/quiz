'use client'

import { useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { PlayHeader } from './_components/play-header'
import { QuestionPanel } from './_components/question-panel'
import { QuitModal } from './_components/quit-modal'
import type { PlayViewProps } from './play-view.types'
import { usePlayRunner } from './use-play-runner'
import { copy } from '@/lib/copy'

export function PlayView({ quizId, mode }: PlayViewProps) {
  const reduceMotion = useReducedMotion()
  const {
    store,
    quiz,
    questions,
    loading,
    currentQuestion,
    isAnswered,
    timeRemainingMs,
    questionUI,
    soundEnabled,
    setSoundEnabled,
    showQuitModal,
    setShowQuitModal,
    timerAnnouncement,
    handleChoiceSelect,
    handleTextChange,
    handleTextSubmit,
    handleSubmitSelection,
    handleAnswer,
    goNext,
    quitToQuiz,
  } = usePlayRunner(quizId, mode)

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-md border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    )
  }

  if (!loading && questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🪹</p>
          <p className="text-muted-foreground">{copy.emptyStates.noQuestions}</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-md border bg-card p-8 text-center">
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Preparing question...</p>
        </div>
      </div>
    )
  }

  const progress = ((store.currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  const renderedPrompt = currentQuestion.prompt
  const canSubmitCurrentAnswer = (() => {
    if (currentQuestion.type === 'FILL_BLANK') {
      return questionUI.textAnswer.trim().length > 0
    }
    return questionUI.selectedChoiceIds.length > 0
  })()
  const isLastQuestion = store.currentQuestionIndex >= questions.length - 1

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div aria-live="polite" className="sr-only">
        {`Question ${store.currentQuestionIndex + 1} of ${questions.length}: ${renderedPrompt}`}
      </div>
      <div aria-live="polite" className="sr-only">
        {timerAnnouncement}
      </div>

      <PlayHeader
        quizTitle={quiz?.title}
        progress={progress}
        currentIndex={store.currentQuestionIndex}
        total={questions.length}
        score={store.score}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((enabled) => !enabled)}
        onOpenQuit={() => setShowQuitModal(true)}
      />

      <QuestionPanel
        currentQuestion={currentQuestion}
        reduceMotion={reduceMotion}
        timeRemainingMs={timeRemainingMs}
        quizTimeLimitSec={quiz?.timeLimitSec}
        selectedChoiceIds={questionUI.selectedChoiceIds}
        hiddenChoiceIds={questionUI.hiddenChoiceIds}
        isAnswered={isAnswered}
        canSubmit={canSubmitCurrentAnswer}
        isLastQuestion={isLastQuestion}
        submitting={store.status === 'submitting'}
        onChoiceSelect={handleChoiceSelect}
        onSubmit={handleSubmitSelection}
        onAnswer={handleAnswer}
        onNext={goNext}
        onTextSubmit={handleTextSubmit}
        textAnswer={questionUI.textAnswer}
        onTextChange={handleTextChange}
      />

      <QuitModal open={showQuitModal} onClose={() => setShowQuitModal(false)} onQuit={quitToQuiz} />
    </div>
  )
}
