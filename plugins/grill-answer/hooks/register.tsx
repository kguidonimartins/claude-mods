import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { GrillRound } from '../types'
import { composeAnswers, parseRound } from './parse'

const PANE = 'grill-answer'
const ACCEPT = 'aceito a recomendação'

const round = atom({ plugin: 'grill-answer', key: 'round' } as const, null)
const answers = atom({ plugin: 'grill-answer', key: 'answers' } as const, {})

// Rascunho do que foi digitado sem Enter: não redesenha a cada tecla.
const drafts = new Map<number, string>()

function openPane($: EngineInterface, questions: number) {
  return $.ui.open({
    id: PANE,
    title: `Grill: ${questions} pergunta(s)`,
    focus: true,
    rows: Math.min(40, 6 + questions * 6),
  })
}

function setAnswer($: EngineInterface, n: number, text: string) {
  return update($, answers, all => ({ ...all, [n]: text }))
}

// Depois do Enter, leva o cursor ao próximo campo pendente (ou ao "enviar").
async function focusNext(
  $: EngineInterface,
  current: GrillRound,
  given: Record<string, string>,
  after: number,
) {
  const order = [
    ...current.questions.filter(q => q.n > after),
    ...current.questions.filter(q => q.n < after),
  ]
  const next = order.find(q => !given[q.n]?.trim() && !drafts.get(q.n)?.trim())
  const key = next === undefined ? 'send' : `answer-${next.n}`
  try {
    const moved = await $.ui.focus({ requestId: PANE, key })
    if (moved.deny !== undefined) $.ui.log(`grill-answer: foco não moveu (${moved.deny})`)
  } catch (error) {
    $.ui.log(`grill-answer: foco não moveu (${String(error)})`)
  }
}

async function send($: EngineInterface, current: GrillRound) {
  const given = { ...(await read($, answers)) }
  for (const [n, draft] of drafts) {
    if (!given[n]?.trim() && draft.trim()) given[n] = draft
  }

  drafts.clear()
  await update($, round, () => null)
  await update($, answers, () => ({}))
  $.ui.status(undefined)
  await $.ui.close({ id: PANE })
  await $.prompt.submit({
    text: composeAnswers(current.questions, given),
    asUser: true,
  })
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'grill-answer',
      description: 'Abre o painel para responder a última rodada do grilling',
    })

    return next(e)
  })

  on('command.run', { command: 'grill-answer' }, async $ => {
    const current = await read($, round)
    if (current === null) {
      return { text: 'Nenhuma rodada do grilling pendente.' }
    }

    await openPane($, current.questions.length)

    return { text: 'Painel do grilling aberto.' }
  })

  on('turn.complete', async ($, e, next) => {
    const isMain = e.agentId === undefined && e.reason === 'answer'
    const questions = isMain ? parseRound(e.answer) : []

    if (questions.length > 0) {
      drafts.clear()
      await update($, round, () => ({ id: e.turnId, questions }))
      await update($, answers, () => ({}))
      $.ui.status(`grill: ${questions.length} pergunta(s) — /grill-answer`)

      const opened = await openPane($, questions.length)
      if (!opened.isPlaced) {
        $.ui.toast('grill: /grill-answer para responder as perguntas')
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Text, Button, Markdown } = elements
    // mobile não tem Input: lá só dá para aceitar a recomendação.
    const Input = 'Input' in elements ? elements.Input : undefined
    const current = await read($, round)
    const given = await read($, answers)

    if (current === null) {
      return <Text dimColor>Nenhuma rodada do grilling pendente.</Text>
    }

    const pending = current.questions.filter(q => !given[q.n]?.trim())

    return (
      <Box flexDirection="column" gap={1}>
        {!e.props.isFocused && (
          <Text color="yellow">
            Painel sem o teclado: ctrl+x tab (ou clique) para responder.
          </Text>
        )}
        {current.questions.map(q => {
          const answer = given[q.n]

          return (
            <Box key={`q${q.n}`} flexDirection="column">
              <Text bold>
                Q{q.n} · {q.title}
              </Text>
              {q.body !== '' && (
                <Markdown dimColor text={q.body.slice(0, 2000)} />
              )}
              {q.recommendation !== '' && (
                <Text color="green">➡ {q.recommendation}</Text>
              )}
              <Box flexDirection="row" gap={1}>
                {Input !== undefined && (
                  <Box flexGrow={1}>
                    <Input
                      key={`answer-${q.n}`}
                      label="resposta: "
                      placeholder="digite e Enter para gravar"
                      submitLabel="gravar"
                      autoFocus={q === pending[0] ? true : undefined}
                      value={answer ?? drafts.get(q.n) ?? ''}
                      onInput={(value: string) => drafts.set(q.n, value)}
                      onSubmit={async (value: string) => {
                        await setAnswer($, q.n, value)
                        await focusNext($, current, { ...given, [q.n]: value }, q.n)
                      }}
                    />
                  </Box>
                )}
                <Button
                  key={`accept-${q.n}`}
                  label="aceitar"
                  hotkey={q.n < 10 ? String(q.n) : undefined}
                  dimColor={answer === ACCEPT}
                  onPress={() => setAnswer($, q.n, ACCEPT)}
                />
              </Box>
              {answer !== undefined && answer.trim() !== '' && (
                <Text dimColor>✔ {answer}</Text>
              )}
            </Box>
          )
        })}
        <Box flexDirection="row" gap={1}>
          <Button
            key="accept-all"
            label={`aceitar pendentes (${pending.length})`}
            hotkey="a"
            onPress={() =>
              update($, answers, all => {
                const next = { ...all }
                for (const q of current.questions) {
                  if (!next[q.n]?.trim() && !drafts.get(q.n)?.trim()) {
                    next[q.n] = ACCEPT
                  }
                }
                return next
              })
            }
          />
          <Button
            key="send"
            label="enviar respostas"
            variant="primary"
            hotkey="e"
            onPress={() => send($, current)}
          />
          <Button
            key="dismiss"
            label="fechar"
            role="dismiss"
            onPress={() => $.ui.close({ id: PANE })}
          />
        </Box>
      </Box>
    )
  })
}
