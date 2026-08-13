import { useGame, type GameState } from '../store/gameStore'

// Mirrors game state from the host window into read-only audience display
// windows (opened with ?display) over a same-origin BroadcastChannel.

const CHANNEL = 'wl-display'

// Everything the audience window is allowed to see. The current question,
// the draw pile, and undo history never leave the host window.
const SHARED_KEYS = [
  'phase',
  'players',
  'settings',
  'roundNumber',
  'chainIndex',
  'roundPot',
  'grandTotal',
  'currentPlayerId',
  'timeRemaining',
  'timerRunning',
  'roundStats',
  'introIndex',
  'strongestId',
  'weakestId',
  'statsRevealed',
  'votes',
  'votesRevealed',
  'lastEliminatedId',
  'finalists',
  'finalTurnId',
  'finalScores',
  'finalSuddenDeath',
  'winnerId',
] as const

type SharedState = Pick<GameState, (typeof SHARED_KEYS)[number]>

function snapshot(s: GameState): SharedState {
  const out: Record<string, unknown> = {}
  for (const k of SHARED_KEYS) out[k] = s[k]
  return out as SharedState
}

let broadcasting = false

/** Host window: publish every store change; answer late-joining displays. */
export function startBroadcast() {
  if (broadcasting || typeof BroadcastChannel === 'undefined') return
  broadcasting = true
  const ch = new BroadcastChannel(CHANNEL)
  ch.onmessage = (e) => {
    if (e.data === 'hello') ch.postMessage(snapshot(useGame.getState()))
  }
  useGame.subscribe((s) => ch.postMessage(snapshot(s)))
}

/** Audience window: request current state, then mirror everything that arrives. */
export function startListening() {
  if (typeof BroadcastChannel === 'undefined') return
  const ch = new BroadcastChannel(CHANNEL)
  ch.onmessage = (e) => {
    if (e.data && typeof e.data === 'object') {
      useGame.setState(e.data as Partial<GameState>)
    }
  }
  ch.postMessage('hello')
}
