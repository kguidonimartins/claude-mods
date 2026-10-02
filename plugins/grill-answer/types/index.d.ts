export type GrillQuestion = {
  n: number
  title: string
  body: string
  recommendation: string
}

export type GrillRound = { id: string; questions: GrillQuestion[] }

declare module 'claude-code' {
  interface PluginState {
    'grill-answer': {
      round: GrillRound | null
      answers: Record<string, string>
    }
  }
}
