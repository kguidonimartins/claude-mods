import { expect, test } from 'claude-code/testing'

import { parseRound } from '../hooks/parse'

const ROUND = `Vamos à primeira rodada.

❓ **Q1** - **Onde o mod vive**: No repo de dotfiles ou só em ~/.claude?

Opções: (a) repo, (b) local.

➡️ (a) repo, versionado com stow.

---

❓ **Q2** - **Atalho**: Qual comando abre o painel?

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

test('lê as perguntas e recomendações de uma rodada', () => {
  const questions = parseRound(ROUND)

  expect(questions.length).toBe(2)
  expect(questions[0]?.title).toBe('Onde o mod vive')
  expect(questions[0]?.body).toContain('Opções')
  expect(questions[0]?.recommendation).toBe('(a) repo, versionado com stow.')
  expect(questions[1]?.recommendation).toBe('`/grill-answer`')
  expect(parseRound('resposta comum, sem perguntas').length).toBe(0)
})

test('responde a rodada pelo painel e envia como prompt', async ($, on) => {
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

    expect(await ui.find({ text: /Onde o mod vive/ })).toBeDefined()
    await ui.press({ key: 'accept-1' })
    await ui.input({ key: 'answer-2', text: 'prefiro /grill' })
    await ui.press({ key: 'send' })

    expect(sent.length).toBe(1)
    expect(sent[0]).toContain('**Q1** - Onde o mod vive: aceito a recomendação')
    expect(sent[0]).toContain('**Q2** - Atalho: prefiro /grill')
    await ui.unmount()
  }
})
