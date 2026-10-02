import type { GrillQuestion } from '../types'

// One round of the grilling skill:
//   ❓ **Q1** - **<title>**: <body>
//
//   ➡️ <recommendation>
//
//   ---
const HEAD = /^\*\*Q(\d+)\*\*\s*[-–—:]\s*\*\*(.+?)\*\*\s*:?\s*/
const ARROW = /^\s*➡️?\s*/m

export const parseRound = (answer: string): GrillQuestion[] => {
  const questions: GrillQuestion[] = []

  for (const chunk of answer.split(/^\s*❓️?\s*/m).slice(1)) {
    const head = HEAD.exec(chunk)
    if (head === null) continue

    const rest = chunk.slice(head[0].length)
    const arrow = ARROW.exec(rest)
    const body = arrow === null ? rest : rest.slice(0, arrow.index)
    const recommendation =
      arrow === null ? '' : rest.slice(arrow.index + arrow[0].length)

    questions.push({
      n: Number(head[1]),
      title: head[2]!.trim(),
      body: tidy(body),
      recommendation: tidy(recommendation),
    })
  }

  return questions
}

// Cuts the `---` separator and whatever follows the last question.
const tidy = (text: string) => text.split(/^\s*---\s*$/m)[0]!.trim()

export const composeAnswers = (
  questions: GrillQuestion[],
  answers: Record<string, string>,
): string => {
  const lines = questions.map(q => {
    const answer = answers[q.n]?.trim()

    return answer
      ? `**Q${q.n}** - ${q.title}: ${answer}`
      : `**Q${q.n}** - ${q.title}: (no answer yet)`
  })

  return lines.join('\n\n')
}
