/**
 * Text answer normalization + matching for FILL_BLANK (type-the-answer / anagram)
 * questions. Pure, framework-free.
 */

/** Normalize a free-text answer for comparison. */
export function normalizeTextAnswer(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[\u2018\u2019\u0060\u00B4]/g, "'") // curly quotes / backticks → apostrophe
    .replace(/[^a-z0-9' ]+/g, ' ') // punctuation → space
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^the /, '')
}

/** True when the Levenshtein edit distance between a and b is at most 1. */
export function isWithinOneEdit(a: string, b: string): boolean {
  if (a === b) return true
  const lenDiff = Math.abs(a.length - b.length)
  if (lenDiff > 1) return false

  // Ensure a is the shorter (or equal) string
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  let i = 0
  let j = 0
  let edits = 0
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++
      j++
      continue
    }
    edits++
    if (edits > 1) return false
    if (short.length === long.length) {
      // substitution
      i++
      j++
    } else {
      // insertion in the longer string
      j++
    }
  }
  edits += long.length - j + (short.length - i)
  return edits <= 1
}

/**
 * Check a given free-text answer against a list of accepted answers.
 * When `fuzzy` is enabled, accepted answers of 6+ characters also match
 * within one typo (edit distance ≤ 1).
 */
export function matchesAcceptedAnswer(
  given: string,
  acceptedAnswers: string[],
  fuzzy = false
): boolean {
  const normalizedGiven = normalizeTextAnswer(given)
  if (!normalizedGiven) return false
  for (const accepted of acceptedAnswers) {
    const normalizedAccepted = normalizeTextAnswer(accepted)
    if (!normalizedAccepted) continue
    if (normalizedGiven === normalizedAccepted) return true
    if (
      fuzzy &&
      normalizedAccepted.length >= 6 &&
      isWithinOneEdit(normalizedGiven, normalizedAccepted)
    ) {
      return true
    }
  }
  return false
}
