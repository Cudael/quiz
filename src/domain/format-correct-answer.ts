interface FormatChoiceLike {
  text: string
  isCorrect: boolean
  meta?: Record<string, unknown> | null
}

interface FormatQuestionLike {
  type: string
  meta?: Record<string, unknown> | null
  choices: FormatChoiceLike[]
}

/** Human-readable rendering of a question's correct answer, across all question types. */
export function formatCorrectAnswer(q: FormatQuestionLike): string {
  switch (q.type) {
    case 'ORDER':
      return q.choices
        .filter((c) => c.meta?.position != null)
        .sort((a, b) => Number(a.meta!.position) - Number(b.meta!.position))
        .map((c) => c.text)
        .join(' → ')
    case 'MATCH': {
      const pairs: string[] = []
      const lChoices = q.choices.filter((c) => c.meta?.side === 'L')
      const rByKey = new Map(
        q.choices.filter((c) => c.meta?.side === 'R').map((c) => [c.meta?.matchKey as string, c])
      )
      for (const l of lChoices) {
        const key = l.meta?.matchKey as string
        const r = rByKey.get(key)
        pairs.push(`${l.text} ↔ ${r?.text ?? '?'}`)
      }
      return pairs.join('; ')
    }
    case 'GROUPS': {
      const groups = new Map<string, string[]>()
      for (const c of q.choices) {
        const key = (c.meta?.groupKey as string) ?? 'default'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(c.text)
      }
      const groupLabels = (q.meta?.groups as string[]) ?? [...groups.keys()]
      return groupLabels.map((g) => `${g}: [${groups.get(g)?.join(', ') ?? ''}]`).join(' | ')
    }
    case 'NUMBER_GUESS':
      return String(q.meta?.answer ?? '?')
    case 'FILL_BLANK':
      return (q.meta?.acceptedAnswers as string[])?.join(' / ') ?? '?'
    default:
      return q.choices.find((c) => c.isCorrect)?.text ?? 'No correct answer set'
  }
}
