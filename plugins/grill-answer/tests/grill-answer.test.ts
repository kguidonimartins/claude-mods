import { expect, test } from 'claude-code/testing'

import { parseRound } from '../hooks/parse'

const ROUND = `Here is the first round.

❓ **Q1** - **Where the mod lives**: In the dotfiles repo or only in ~/.claude?

Options: (a) repo, (b) local.

➡️ (a) repo, versioned with stow.

---

❓ **Q2** - **Shortcut**: Which command opens the pane?

➡️ \`/grill-answer\`
`

const PANE_PROPS = {
  title: 'Grill',
  isFocused: true,
  bodyColumns: 80,
  placement: 'inline',
  scroll: { offset: 0, bodyRows: 30 },
  view: {},
} as const

test('reads the questions and recommendations of a round', () => {
  const questions = parseRound(ROUND)

  expect(questions.length).toBe(2)
  expect(questions[0]?.title).toBe('Where the mod lives')
  expect(questions[0]?.body).toContain('Options')
  expect(questions[0]?.recommendation).toBe('(a) repo, versioned with stow.')
  expect(questions[1]?.recommendation).toBe('`/grill-answer`')
  expect(parseRound('a plain reply, no questions').length).toBe(0)
})

test('answers the round in the pane and sends it as a prompt', async ($, on) => {
  const sent: string[] = []
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.status', () => ({ value: undefined }))
  on('turn.complete', ($, e) => ({ text: e.answer }))
  on('prompt.submit', ($, e) => {
    sent.push(e.text)
    return { text: e.text }
  })

  await $.turn.complete({
    answer: ROUND,
    durationMs: 1,
    isAborted: false,
    turnId: 't1',
    reason: 'answer',
  })

  for (const surface of ['terminal', 'desktop'] as const) {
    sent.length = 0
    if (surface === 'desktop') {
      await $.turn.complete({
        answer: ROUND,
        durationMs: 1,
        isAborted: false,
        turnId: 't2',
        reason: 'answer',
      })
    }

    const ui = await $.ui.mount({
      plugin: 'grill-answer',
      surface,
      component: 'Pane',
      requestId: 'grill-answer',
      props: PANE_PROPS,
    })

    expect(await ui.find({ text: /Where the mod lives/ })).toBeDefined()
    await ui.press({ key: 'accept-1' })
    await ui.input({ key: 'answer-2', text: 'I prefer /grill' })
    await ui.press({ key: 'send' })

    expect(sent.length).toBe(1)
    expect(sent[0]).toContain('**Q1** - Where the mod lives: I accept the recommendation')
    expect(sent[0]).toContain('**Q2** - Shortcut: I prefer /grill')
    await ui.unmount()
  }
})
