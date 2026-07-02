import {
  addQuestion,
  deleteRemovedQuestions as deleteRemovedQuestionsAction,
  updateQuestion,
  type QuestionActionResult,
} from '@/app/studio/actions/question-actions'
import type { DraftQuestion } from '@/store/quiz-creator-store'

interface SaveQuestionsForQuizOptions {
  quizId: string
  questions: DraftQuestion[]
  deleteRemovedQuestionsAfterSave?: boolean
}

export interface SaveQuestionsForQuizResult {
  ok: boolean
  questions: DraftQuestion[]
  failedCount: number
  message?: string
}

export function buildQuestionFormData(quizId: string, question: DraftQuestion, order: number) {
  const formData = new FormData()
  formData.set('quizId', quizId)
  formData.set('type', question.type)
  formData.set('prompt', question.prompt)
  formData.set('timeLimitSec', String(question.timeLimitSec))
  formData.set('order', String(order))
  if (question.imageUrl) formData.set('imageUrl', question.imageUrl)
  if (question.explanation) formData.set('explanation', question.explanation)
  if (question.meta) formData.set('meta', JSON.stringify(question.meta))
  formData.set(
    'choices',
    JSON.stringify(
      question.choices.map((choice, choiceIndex) => {
        // ORDER questions: the editor keeps choices in the correct order —
        // derive the authoritative position from the array index.
        const meta =
          question.type === 'ORDER' ? { ...choice.meta, position: choiceIndex + 1 } : choice.meta
        return {
          text: choice.text,
          imageUrl: choice.imageUrl || undefined,
          isCorrect: choice.isCorrect,
          ...(meta ? { meta } : {}),
        }
      })
    )
  )
  return formData
}

function failureMessage(result: QuestionActionResult) {
  return result.ok ? undefined : result.message
}

export async function saveQuestionsForQuiz({
  quizId,
  questions,
  deleteRemovedQuestionsAfterSave = false,
}: SaveQuestionsForQuizOptions): Promise<SaveQuestionsForQuizResult> {
  let updatedQuestions = questions
  let failedCount = 0
  let firstFailureMessage: string | undefined

  for (const [index, question] of questions.entries()) {
    const formData = buildQuestionFormData(quizId, question, index)
    let result: QuestionActionResult

    if (question.dbId) {
      formData.set('questionId', question.dbId)
      result = await updateQuestion(formData)
    } else {
      result = await addQuestion(formData)
    }

    if (!result.ok) {
      failedCount += 1
      firstFailureMessage ??= failureMessage(result)
      continue
    }

    const questionId = result.questionId
    if (!question.dbId && questionId) {
      updatedQuestions = updatedQuestions.map((candidate) =>
        candidate.localId === question.localId ? { ...candidate, dbId: questionId } : candidate
      )
    }
  }

  if (failedCount > 0) {
    return {
      ok: false,
      questions: updatedQuestions,
      failedCount,
      message:
        firstFailureMessage ??
        `${failedCount} question${failedCount === 1 ? '' : 's'} could not be saved.`,
    }
  }

  if (deleteRemovedQuestionsAfterSave) {
    const keepIds = updatedQuestions
      .map((question) => question.dbId)
      .filter((id): id is string => !!id)
    const deleteResult = await deleteRemovedQuestionsAction(quizId, keepIds)
    if (!deleteResult.ok) {
      return {
        ok: false,
        questions: updatedQuestions,
        failedCount: 0,
        message: deleteResult.message || 'Could not delete removed questions.',
      }
    }
  }

  return { ok: true, questions: updatedQuestions, failedCount: 0 }
}
