import { describe, expect, it } from 'vitest'
import { parseCsvQuizImport, parseJsonQuizImport } from '@/domain/quiz-import'

describe('parseCsvQuizImport', () => {
  it('parses valid CSV rows', () => {
    const csv = `type,prompt,explanation,timeLimitSec,choices
SINGLE,"What is 2+2?","Basic math",15,"3;*4;5;6"
SINGLE,"The sky is blue.","",10,"*True;False"`

    const result = parseCsvQuizImport(csv)
    expect(result.errors).toEqual([])
    expect(result.questions).toHaveLength(2)
    expect(result.questions[0].choices.find((choice) => choice.isCorrect)?.text).toBe('4')
  })

  it('handles quoted commas in prompt', () => {
    const csv = `type,prompt,explanation,timeLimitSec,choices
SINGLE,"Who said, ""I think, therefore I am""?","",20,"*Descartes;Plato"`
    const result = parseCsvQuizImport(csv)
    expect(result.errors).toEqual([])
    expect(result.questions[0].prompt).toContain('I think, therefore I am')
  })

  it('returns validation errors for unknown type and missing correct answer', () => {
    const csv = `type,prompt,explanation,timeLimitSec,choices
UNKNOWN,"Bad type","",20,"*A;B"
SINGLE,"No correct choice","",20,"A;B"`
    const result = parseCsvQuizImport(csv)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})

describe('parseJsonQuizImport', () => {
  it('parses valid JSON', () => {
    const json = JSON.stringify([
      {
        type: 'SINGLE',
        prompt: 'The sky is blue.',
        choices: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
      },
    ])
    const result = parseJsonQuizImport(json)
    expect(result.errors).toEqual([])
    expect(result.questions).toHaveLength(1)
  })

  it('rejects invalid JSON payload shape', () => {
    const result = parseJsonQuizImport('{"type":"SINGLE"}')
    expect(result.errors[0]?.message).toContain('array')
  })
})
