import type {
  DraftChoice,
  DraftQuestion,
  QuestionType,
  QuizFormat,
} from '@/store/quiz-creator-store'

/**
 * Shared per-format defaults for the Quiz Studio editor:
 * question skeletons, banners, and publish-completeness rules.
 */

export interface FormatInfo {
  name: string
  bannerTitle: string
  bannerDescription: string
  /** Default per-question time limit for new questions of this format. */
  timeLimitSec: number
  /** Number of skeleton questions a fresh template starts with. */
  templateQuestionCount: number
  /** Minimum complete questions required to publish. */
  minQuestions: number
}

export const FORMAT_INFO: Record<QuizFormat, FormatInfo> = {
  TEXT_CHOICE: {
    name: 'Text Choice',
    bannerTitle: 'Text Choice Quiz',
    bannerDescription:
      'Add single-choice questions. For each question, write the question text, fill in all the answer choices, and mark the correct answer using the radio button.',
    timeLimitSec: 20,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  IMAGE_CHOICE: {
    name: 'Image Choice',
    bannerTitle: 'Image Choice Quiz',
    bannerDescription:
      'Add single-choice questions where each answer is an image. Upload an image for each choice and mark the correct one.',
    timeLimitSec: 30,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  IMAGE_HOTSPOT: {
    name: 'Image Hotspot',
    bannerTitle: 'Image Hotspot Quiz',
    bannerDescription: 'Players click zones on a shared image to answer each question.',
    timeLimitSec: 20,
    templateQuestionCount: 0,
    minQuestions: 5,
  },
  ORDER: {
    name: 'Put in Order',
    bannerTitle: 'Ordering Quiz',
    bannerDescription:
      'Players arrange items into the correct sequence. Enter 3–8 items per question in the correct order — they are shuffled automatically during play.',
    timeLimitSec: 30,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  MATCH: {
    name: 'Matching Pairs',
    bannerTitle: 'Matching Quiz',
    bannerDescription:
      'Players match items from two columns. Enter 3–8 pairs per question — the right column is shuffled during play.',
    timeLimitSec: 40,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  ODD_ONE_OUT: {
    name: 'Odd One Out',
    bannerTitle: 'Odd One Out Quiz',
    bannerDescription:
      'Players spot the item that does not belong. Add 4+ choices and mark the odd one as correct. Use the explanation field to reveal the connection.',
    timeLimitSec: 20,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  TYPE_ANSWER: {
    name: 'Type the Answer',
    bannerTitle: 'Type-the-Answer Quiz',
    bannerDescription:
      'Players type the answer freely. List every accepted spelling (one per line) — matching ignores case, accents and punctuation.',
    timeLimitSec: 25,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  NUMBER_GUESS: {
    name: 'Number Guess',
    bannerTitle: 'Number Guess Quiz',
    bannerDescription:
      'Players guess a number on a slider. Full points within the tolerance, partial credit for close guesses.',
    timeLimitSec: 20,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  IMAGE_REVEAL: {
    name: 'Image Reveal',
    bannerTitle: 'Image Reveal Quiz',
    bannerDescription:
      'The question image starts obscured and gradually clears as the timer runs. Answering early earns a bigger speed bonus. Each question needs an image.',
    timeLimitSec: 20,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  AUDIO_CHOICE: {
    name: 'Audio Quiz',
    bannerTitle: 'Audio Quiz',
    bannerDescription:
      'Players listen to an audio clip and pick the right answer. Paste a direct audio URL (MP3/OGG) for each question.',
    timeLimitSec: 30,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  VERSUS: {
    name: 'Higher or Lower',
    bannerTitle: 'Higher-or-Lower Quiz',
    bannerDescription:
      'Two options face off — players pick which one has the higher value. Enter the value for each side; the correct answer is set automatically and values are revealed after answering.',
    timeLimitSec: 15,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  CONNECTIONS: {
    name: 'Connections',
    bannerTitle: 'Connections Board',
    bannerDescription:
      'Players find groups of related tiles (like NYT Connections). Each question is one board: name each group and fill in its tiles.',
    timeLimitSec: 120,
    templateQuestionCount: 1,
    minQuestions: 1,
  },
  ANAGRAM: {
    name: 'Anagram',
    bannerTitle: 'Anagram Quiz',
    bannerDescription:
      'Players unscramble letter tiles to form the answer. Enter the solution word or phrase for each question.',
    timeLimitSec: 30,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
  MEMORY_FLASH: {
    name: 'Memory Flash',
    bannerTitle: 'Memory Flash Quiz',
    bannerDescription:
      'Players memorize a text or image for a few seconds before it disappears — then answer a question about it. The study time counts toward the question timer.',
    timeLimitSec: 30,
    templateQuestionCount: 5,
    minQuestions: 5,
  },
}

export function questionTypeForFormat(format: QuizFormat): QuestionType {
  switch (format) {
    case 'IMAGE_HOTSPOT':
      return 'HOTSPOT'
    case 'ORDER':
      return 'ORDER'
    case 'MATCH':
      return 'MATCH'
    case 'NUMBER_GUESS':
      return 'NUMBER_GUESS'
    case 'CONNECTIONS':
      return 'GROUPS'
    case 'TYPE_ANSWER':
    case 'ANAGRAM':
      return 'FILL_BLANK'
    default:
      return 'SINGLE'
  }
}

function makeChoice(overrides?: Partial<DraftChoice>): DraftChoice {
  return {
    localId: crypto.randomUUID(),
    text: '',
    imageUrl: '',
    isCorrect: false,
    ...overrides,
  }
}

export const CONNECTIONS_GROUP_KEYS = ['A', 'B', 'C', 'D'] as const
export const CONNECTIONS_GROUP_SIZE = 4

/** Build a fresh question skeleton for the given quiz format. */
export function makeQuestionForFormat(format: QuizFormat, timeLimitSec?: number): DraftQuestion {
  const info = FORMAT_INFO[format]
  const base: DraftQuestion = {
    localId: crypto.randomUUID(),
    dbId: null,
    type: questionTypeForFormat(format),
    prompt: '',
    imageUrl: '',
    explanation: '',
    timeLimitSec: timeLimitSec ?? info.timeLimitSec,
    choices: [],
  }

  switch (format) {
    case 'ORDER':
      return {
        ...base,
        choices: Array.from({ length: 4 }, () => makeChoice()),
      }
    case 'MATCH':
      return {
        ...base,
        choices: ['p1', 'p2', 'p3'].flatMap((key) => [
          makeChoice({ meta: { side: 'L', matchKey: key } }),
          makeChoice({ meta: { side: 'R', matchKey: key } }),
        ]),
      }
    case 'CONNECTIONS':
      return {
        ...base,
        prompt: 'Find the groups!',
        meta: {
          groups: CONNECTIONS_GROUP_KEYS.map((key) => ({ key, label: '' })),
          maxMistakes: 4,
        },
        choices: CONNECTIONS_GROUP_KEYS.flatMap((key) =>
          Array.from({ length: CONNECTIONS_GROUP_SIZE }, () =>
            makeChoice({ meta: { groupKey: key } })
          )
        ),
      }
    case 'NUMBER_GUESS':
      return { ...base, meta: { answer: 0, min: 0, max: 100, tolerance: 0 } }
    case 'TYPE_ANSWER':
      return { ...base, meta: { acceptedAnswers: [], fuzzy: true } }
    case 'ANAGRAM':
      return { ...base, meta: { acceptedAnswers: [], anagram: true } }
    case 'VERSUS':
      return {
        ...base,
        prompt: 'Which one is higher?',
        choices: [makeChoice({ meta: { value: 0 } }), makeChoice({ meta: { value: 0 } })],
      }
    case 'IMAGE_REVEAL':
      return {
        ...base,
        meta: { reveal: 'blur' },
        choices: [makeChoice({ isCorrect: true }), makeChoice()],
      }
    case 'AUDIO_CHOICE':
      return {
        ...base,
        meta: { audioUrl: '' },
        choices: [makeChoice({ isCorrect: true }), makeChoice()],
      }
    case 'MEMORY_FLASH':
      return {
        ...base,
        meta: { studyDurationMs: 5000, studyText: '', studyImageUrl: '' },
        choices: [makeChoice({ isCorrect: true }), makeChoice()],
      }
    case 'ODD_ONE_OUT':
      return {
        ...base,
        choices: [makeChoice({ isCorrect: true }), makeChoice(), makeChoice(), makeChoice()],
      }
    default:
      return {
        ...base,
        choices: [makeChoice({ isCorrect: true }), makeChoice()],
      }
  }
}

function metaOf(question: DraftQuestion): Record<string, unknown> {
  return question.meta ?? {}
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/** Publish-readiness check for a single question, per quiz format. */
export function isQuestionCompleteForFormat(question: DraftQuestion, format: QuizFormat): boolean {
  if (!question.prompt.trim()) return false
  const meta = metaOf(question)

  switch (format) {
    case 'IMAGE_HOTSPOT': {
      const zones = (meta as { zones?: unknown[] }).zones
      return Array.isArray(zones) && zones.length > 0
    }
    case 'ORDER':
      return (
        question.choices.length >= 3 &&
        question.choices.length <= 8 &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    case 'MATCH': {
      const left = question.choices.filter((c) => c.meta?.side === 'L')
      const right = question.choices.filter((c) => c.meta?.side === 'R')
      return (
        left.length >= 3 &&
        left.length <= 8 &&
        left.length === right.length &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    }
    case 'CONNECTIONS': {
      const groups = Array.isArray(meta.groups) ? (meta.groups as Array<{ label?: unknown }>) : []
      return (
        groups.length >= 2 &&
        groups.every((g) => typeof g.label === 'string' && g.label.trim().length > 0) &&
        question.choices.length > 0 &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    }
    case 'NUMBER_GUESS': {
      const answer = meta.answer
      const min = meta.min
      const max = meta.max
      return (
        isFiniteNumber(answer) &&
        isFiniteNumber(min) &&
        isFiniteNumber(max) &&
        min < max &&
        answer >= min &&
        answer <= max
      )
    }
    case 'TYPE_ANSWER':
    case 'ANAGRAM': {
      const accepted = Array.isArray(meta.acceptedAnswers) ? meta.acceptedAnswers : []
      return accepted.some((a) => typeof a === 'string' && a.trim().length > 0)
    }
    case 'VERSUS':
      return (
        question.choices.length === 2 &&
        question.choices.every((c) => c.text.trim().length > 0 && isFiniteNumber(c.meta?.value)) &&
        question.choices.some((c) => c.isCorrect)
      )
    case 'IMAGE_REVEAL':
      return (
        question.imageUrl.trim().length > 0 &&
        question.choices.length >= 2 &&
        question.choices.some((c) => c.isCorrect) &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    case 'AUDIO_CHOICE':
      return (
        typeof meta.audioUrl === 'string' &&
        meta.audioUrl.trim().length > 0 &&
        question.choices.length >= 2 &&
        question.choices.some((c) => c.isCorrect) &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    case 'MEMORY_FLASH': {
      const hasStudyMaterial =
        (typeof meta.studyText === 'string' && meta.studyText.trim().length > 0) ||
        (typeof meta.studyImageUrl === 'string' && meta.studyImageUrl.trim().length > 0)
      return (
        hasStudyMaterial &&
        question.choices.length >= 2 &&
        question.choices.some((c) => c.isCorrect) &&
        question.choices.every((c) => c.text.trim().length > 0)
      )
    }
    case 'IMAGE_CHOICE':
      return (
        question.choices.length >= 2 &&
        question.choices.some((c) => c.isCorrect) &&
        !question.choices.some((c) => !c.imageUrl.trim())
      )
    default:
      // TEXT_CHOICE, ODD_ONE_OUT
      return (
        question.choices.length >= 2 &&
        question.choices.some((c) => c.isCorrect) &&
        !question.choices.some((c) => !c.text.trim())
      )
  }
}
