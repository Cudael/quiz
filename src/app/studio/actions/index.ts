// Barrel for studio server actions. Import paths such as `@/app/studio/actions`
// resolve here so consumers keep stable imports while the implementation is
// split into focused, single-responsibility modules.
export type { ActionResult } from './_shared'

export { togglePublish, deleteQuiz, createQuiz, updateQuiz, saveDraft } from './quiz-actions'
export { importQuestions } from './import-actions'
export { suggestCategory } from './category-actions'
export { generateQuizWithAi } from './ai-generate'

export { createQuizAndReturnId, type QuizMetaActionResult } from './quiz-meta-actions'
export {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  type QuestionActionResult,
} from './question-actions'
