'use client'

import { useReducedMotion } from 'framer-motion'
import { PlayHeader } from './_components/play-header'
import { QuestionPanel } from './_components/question-panel'
import { QuitModal } from './_components/quit-modal'
import type { PlayViewProps } from './play-view.types'
import { usePlayRunner } from './use-play-runner'

export function PlayView({ quizId }: PlayViewProps) {
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
    handleSubmitSelection,
    goNext,
    quitToQuiz,
  } = usePlayRunner(quizId)

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading quiz…</p>
        </div>
      </div>
    )
  }

  if (!loading && questions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">This quiz has no questions yet.</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const progress = ((store.currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100
  const renderedPrompt = currentQuestion.prompt
  const canSubmitCurrentAnswer = (() => {
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
        selectedChoiceIds={questionUI.selectedChoiceIds}
        hiddenChoiceIds={questionUI.hiddenChoiceIds}
        isAnswered={isAnswered}
        canSubmit={canSubmitCurrentAnswer}
        isLastQuestion={isLastQuestion}
        onChoiceSelect={handleChoiceSelect}
        onSubmit={handleSubmitSelection}
        onNext={goNext}
      />

      <QuitModal open={showQuitModal} onClose={() => setShowQuitModal(false)} onQuit={quitToQuiz} />
    </div>
  )
}
