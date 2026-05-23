export const FILL_BLANK_PLACEHOLDER = '{{blank}}'
export const DEFAULT_GUEST_NAME = 'Guest'
export const DEFAULT_TIME_LIMIT_SEC = 20
export const IMPORT_QUESTION_BATCH_SIZE = 50

export function renderFillBlankPrompt(prompt: string, blank = '_____') {
  return prompt.replace('{{blank}}', blank)
}
