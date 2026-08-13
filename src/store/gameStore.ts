import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LADDER, LADDER_MAX, securedValue, targetValue } from '../data/ladder'
import { QUESTIONS, type Question } from '../data/questions'

export type Phase =
  | 'title'
  | 'setup'
  | 'intro'
  | 'round'
  | 'roundStats'
  | 'voting'
  | 'elimination'
  | 'final'
  | 'winner'

export interface PhotoPos {
  x: number // object-position %, 0–100
  y: number // object-position %, 0–100
  zoom: number // 1–3
}

export interface Player {
  id: string
  name: string
  nickname: string
  photo: string // dataURL or ''
  photoPos?: PhotoPos // pan/zoom so faces aren't cut off by the circular crop
  strengths: string[]
  weaknesses: string[]
  isEliminated: boolean
}

export interface RoundStat {
  correct: number
  wrong: number
  banked: number // money this player personally banked this round
  lost: number // money lost to broken chains on this player's turn
}

export interface Settings {
  startSeconds: number
  decrementSeconds: number
  minSeconds: number
  muted: boolean
}

interface ScoreSnapshot {
  chainIndex: number
  roundPot: number
  grandTotal: number
  currentPlayerId: string | null
  roundStats: Record<string, RoundStat>
  currentQuestion: Question | null
  usedQuestionKeys: string[]
  timeRemaining: number
}

export interface GameState {
  phase: Phase
  players: Player[]
  settings: Settings

  // round state
  roundNumber: number
  chainIndex: number
  roundPot: number
  grandTotal: number
  currentPlayerId: string | null
  timeRemaining: number
  timerRunning: boolean
  roundStats: Record<string, RoundStat>
  currentQuestion: Question | null
  usedQuestionKeys: string[]

  // intro
  introIndex: number

  // stats / voting / elimination
  strongestId: string | null
  weakestId: string | null
  statsRevealed: boolean // strongest/weakest cards shown (shared so the audience display stays in sync)
  votes: Record<string, string> // voterId -> targetId
  votesRevealed: boolean // vote tally shown (shared so the audience display stays in sync)
  lastEliminatedId: string | null

  // final round
  finalists: string[] // [id, id]
  finalTurnId: string | null
  finalScores: Record<string, boolean[]> // playerId -> per-question correct flags
  finalSuddenDeath: boolean
  winnerId: string | null

  // undo
  history: ScoreSnapshot[]

  // ----- actions -----
  setPhase: (p: Phase) => void
  resetGame: () => void

  addPlayer: () => void
  updatePlayer: (id: string, patch: Partial<Player>) => void
  removePlayer: (id: string) => void
  movePlayer: (id: string, dir: -1 | 1) => void

  startGame: () => void
  introNext: () => void
  introPrev: () => void

  startRound: () => void
  correct: () => void
  wrong: () => void
  bank: () => void
  tick: () => void
  setTimerRunning: (running: boolean) => void
  togglePause: () => void
  setCurrentPlayer: (id: string) => void
  endRound: () => void
  adjustStat: (id: string, field: keyof RoundStat, delta: number) => void
  setTimeRemaining: (s: number) => void

  revealStats: () => void
  goToVoting: () => void
  castVote: (voterId: string, targetId: string) => void
  revealVotes: () => void
  resolveVotes: () => void
  afterElimination: () => void

  // final
  finalAnswer: (correct: boolean) => void

  undo: () => void
}

const STORAGE_KEY = 'weakest-link-store'

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function emptyStat(): RoundStat {
  return { correct: 0, wrong: 0, banked: 0, lost: 0 }
}

function makePlayer(name = ''): Player {
  return {
    id: uid(),
    name,
    nickname: '',
    photo: '',
    photoPos: { x: 50, y: 50, zoom: 1 },
    strengths: [],
    weaknesses: [],
    isEliminated: false,
  }
}

function defaultPlayers(): Player[] {
  // pre-seed 8 slots sized for a typical 6-8 player group
  return Array.from({ length: 8 }, (_, i) => makePlayer(`Player ${i + 1}`))
}

function activePlayers(players: Player[]): Player[] {
  return players.filter((p) => !p.isEliminated)
}

function pickQuestion(used: string[]): { q: Question; used: string[] } {
  let pool = QUESTIONS.filter((q) => !used.includes(q.question))
  let nextUsed = used
  if (pool.length === 0) {
    pool = QUESTIONS
    nextUsed = []
  }
  const q = pool[Math.floor(Math.random() * pool.length)]
  return { q, used: [...nextUsed, q.question] }
}

function snapshot(s: GameState): ScoreSnapshot {
  return {
    chainIndex: s.chainIndex,
    roundPot: s.roundPot,
    grandTotal: s.grandTotal,
    currentPlayerId: s.currentPlayerId,
    roundStats: JSON.parse(JSON.stringify(s.roundStats)),
    currentQuestion: s.currentQuestion,
    usedQuestionKeys: [...s.usedQuestionKeys],
    timeRemaining: s.timeRemaining,
  }
}

function ensureStat(stats: Record<string, RoundStat>, id: string): Record<string, RoundStat> {
  if (!stats[id]) return { ...stats, [id]: emptyStat() }
  return stats
}

/** Strongest/Weakest score: reward correct answers + personal banking, penalize wrong/lost. */
function performanceScore(st: RoundStat): number {
  return st.correct * 2 - st.wrong * 2 + st.banked / 100 - st.lost / 200
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      phase: 'title',
      players: defaultPlayers(),
      settings: { startSeconds: 180, decrementSeconds: 15, minSeconds: 60, muted: false },

      roundNumber: 0,
      chainIndex: 0,
      roundPot: 0,
      grandTotal: 0,
      currentPlayerId: null,
      timeRemaining: 0,
      timerRunning: false,
      roundStats: {},
      currentQuestion: null,
      usedQuestionKeys: [],

      introIndex: 0,

      strongestId: null,
      weakestId: null,
      statsRevealed: false,
      votes: {},
      votesRevealed: false,
      lastEliminatedId: null,

      finalists: [],
      finalTurnId: null,
      finalScores: {},
      finalSuddenDeath: false,
      winnerId: null,

      history: [],

      setPhase: (p) => set({ phase: p }),

      resetGame: () =>
        set((s) => ({
          phase: 'setup',
          players: s.players.map((p) => ({ ...p, isEliminated: false })),
          roundNumber: 0,
          chainIndex: 0,
          roundPot: 0,
          grandTotal: 0,
          currentPlayerId: null,
          timeRemaining: 0,
          timerRunning: false,
          roundStats: {},
          currentQuestion: null,
          usedQuestionKeys: [],
          introIndex: 0,
          strongestId: null,
          weakestId: null,
          statsRevealed: false,
          votes: {},
          votesRevealed: false,
          lastEliminatedId: null,
          finalists: [],
          finalTurnId: null,
          finalScores: {},
          finalSuddenDeath: false,
          winnerId: null,
          history: [],
        })),

      addPlayer: () => set((s) => ({ players: [...s.players, makePlayer(`Player ${s.players.length + 1}`)] })),

      updatePlayer: (id, patch) =>
        set((s) => ({ players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),

      removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

      movePlayer: (id, dir) =>
        set((s) => {
          const idx = s.players.findIndex((p) => p.id === id)
          const target = idx + dir
          if (idx < 0 || target < 0 || target >= s.players.length) return {}
          const players = [...s.players]
          ;[players[idx], players[target]] = [players[target], players[idx]]
          return { players }
        }),

      startGame: () =>
        set((s) => ({
          phase: 'intro',
          introIndex: 0,
          players: s.players.map((p) => ({ ...p, isEliminated: false })),
          roundNumber: 0,
          grandTotal: 0,
        })),

      introNext: () =>
        set((s) => {
          if (s.introIndex >= s.players.length - 1) {
            return { phase: 'round' as Phase, introIndex: s.introIndex }
          }
          return { introIndex: s.introIndex + 1 }
        }),

      introPrev: () => set((s) => ({ introIndex: Math.max(0, s.introIndex - 1) })),

      startRound: () =>
        set((s) => {
          const active = activePlayers(s.players)
          const roundNumber = s.roundNumber + 1
          const secs = Math.max(
            s.settings.minSeconds,
            s.settings.startSeconds - (roundNumber - 1) * s.settings.decrementSeconds,
          )
          // round 1 starts with first in line; later rounds start with previous Strongest Link if still active
          let starterId = active[0]?.id ?? null
          if (roundNumber > 1 && s.strongestId && active.some((p) => p.id === s.strongestId)) {
            starterId = s.strongestId
          }
          const stats: Record<string, RoundStat> = {}
          active.forEach((p) => (stats[p.id] = emptyStat()))
          const { q, used } = pickQuestion(s.usedQuestionKeys)
          return {
            phase: 'round' as Phase,
            roundNumber,
            chainIndex: 0,
            roundPot: 0,
            currentPlayerId: starterId,
            timeRemaining: secs,
            timerRunning: false,
            roundStats: stats,
            currentQuestion: q,
            usedQuestionKeys: used,
            strongestId: null,
            weakestId: null,
            history: [],
          }
        }),

      correct: () =>
        set((s) => {
          if (!s.currentPlayerId || s.timeRemaining <= 0) return {}
          const hist = [...s.history, snapshot(s)]
          const stats = ensureStat(s.roundStats, s.currentPlayerId)
          const cur = stats[s.currentPlayerId]
          const atMax = s.chainIndex >= LADDER.length - 1
          let chainIndex = s.chainIndex
          let roundPot = s.roundPot
          let grandTotal = s.grandTotal
          let banked = cur.banked
          if (atMax) {
            // topping out auto-banks the max and resets the chain
            roundPot += LADDER_MAX
            grandTotal += LADDER_MAX
            banked += LADDER_MAX
            chainIndex = 0
          } else {
            chainIndex = s.chainIndex + 1
          }
          const newStats = {
            ...stats,
            [s.currentPlayerId]: { ...cur, correct: cur.correct + 1, banked },
          }
          return {
            history: hist,
            chainIndex,
            roundPot,
            grandTotal,
            roundStats: newStats,
            currentPlayerId: nextPlayerId(s),
            ...drawNext(s),
          }
        }),

      wrong: () =>
        set((s) => {
          if (!s.currentPlayerId || s.timeRemaining <= 0) return {}
          const hist = [...s.history, snapshot(s)]
          const stats = ensureStat(s.roundStats, s.currentPlayerId)
          const cur = stats[s.currentPlayerId]
          const lostNow = securedValue(s.chainIndex)
          const newStats = {
            ...stats,
            [s.currentPlayerId]: { ...cur, wrong: cur.wrong + 1, lost: cur.lost + lostNow },
          }
          return {
            history: hist,
            chainIndex: 0, // break the chain
            roundStats: newStats,
            currentPlayerId: nextPlayerId(s),
            ...drawNext(s),
          }
        }),

      bank: () =>
        set((s) => {
          if (!s.currentPlayerId || s.timeRemaining <= 0) return {}
          const value = securedValue(s.chainIndex)
          if (value <= 0) return {} // nothing to bank
          const hist = [...s.history, snapshot(s)]
          const stats = ensureStat(s.roundStats, s.currentPlayerId)
          const cur = stats[s.currentPlayerId]
          const newStats = {
            ...stats,
            [s.currentPlayerId]: { ...cur, banked: cur.banked + value },
          }
          return {
            history: hist,
            chainIndex: 0, // bank resets the chain; same player still answers
            roundPot: s.roundPot + value,
            grandTotal: s.grandTotal + value,
            roundStats: newStats,
          }
        }),

      tick: () =>
        set((s) => {
          if (!s.timerRunning || s.timeRemaining <= 0) return {}
          const t = s.timeRemaining - 1
          if (t <= 0) {
            return { timeRemaining: 0, timerRunning: false }
          }
          return { timeRemaining: t }
        }),

      setTimerRunning: (running) => set({ timerRunning: running }),
      togglePause: () => set((s) => ({ timerRunning: !s.timerRunning })),
      setCurrentPlayer: (id) => set({ currentPlayerId: id }),

      endRound: () =>
        set((s) => {
          const active = activePlayers(s.players)
          let strongestId: string | null = null
          let weakestId: string | null = null
          let best = -Infinity
          let worst = Infinity
          active.forEach((p) => {
            const sc = performanceScore(s.roundStats[p.id] ?? emptyStat())
            if (sc > best) {
              best = sc
              strongestId = p.id
            }
            if (sc < worst) {
              worst = sc
              weakestId = p.id
            }
          })
          return {
            phase: 'roundStats' as Phase,
            timerRunning: false,
            strongestId,
            weakestId,
            statsRevealed: false,
          }
        }),

      adjustStat: (id, field, delta) =>
        set((s) => {
          const stats = ensureStat(s.roundStats, id)
          const cur = stats[id]
          const next = Math.max(0, cur[field] + delta)
          return { roundStats: { ...stats, [id]: { ...cur, [field]: next } } }
        }),

      setTimeRemaining: (sec) => set({ timeRemaining: Math.max(0, Math.round(sec)) }),

      revealStats: () => set({ statsRevealed: true }),

      goToVoting: () => set({ phase: 'voting', votes: {}, votesRevealed: false }),

      castVote: (voterId, targetId) => set((s) => ({ votes: { ...s.votes, [voterId]: targetId } })),

      revealVotes: () => set({ votesRevealed: true }),

      resolveVotes: () =>
        set((s) => {
          const tally: Record<string, number> = {}
          Object.values(s.votes).forEach((t) => (tally[t] = (tally[t] ?? 0) + 1))
          let max = -1
          let leaders: string[] = []
          Object.entries(tally).forEach(([id, n]) => {
            if (n > max) {
              max = n
              leaders = [id]
            } else if (n === max) {
              leaders.push(id)
            }
          })
          // tie-break: the Strongest Link is immune; otherwise keep first leader (host can override by re-voting)
          let eliminatedId = leaders[0] ?? null
          if (leaders.length > 1 && s.strongestId) {
            const others = leaders.filter((id) => id !== s.strongestId)
            if (others.length) eliminatedId = others[0]
          }
          return {
            phase: 'elimination' as Phase,
            lastEliminatedId: eliminatedId,
            players: s.players.map((p) => (p.id === eliminatedId ? { ...p, isEliminated: true } : p)),
          }
        }),

      afterElimination: () =>
        set((s) => {
          const active = activePlayers(s.players)
          if (active.length <= 2) {
            const finalists = active.map((p) => p.id)
            const scores: Record<string, boolean[]> = {}
            finalists.forEach((id) => (scores[id] = []))
            // previous round's strongest chooses who goes first; default to strongest if available
            const starter =
              s.strongestId && finalists.includes(s.strongestId) ? s.strongestId : finalists[0]
            const drawn = pickQuestion(s.usedQuestionKeys)
            return {
              phase: 'final' as Phase,
              finalists,
              finalScores: scores,
              finalTurnId: starter,
              finalSuddenDeath: false,
              currentQuestion: drawn.q,
              usedQuestionKeys: drawn.used,
            }
          }
          // otherwise start the next round
          get().startRound()
          return {}
        }),

      finalAnswer: (correct) =>
        set((s) => {
          if (!s.finalTurnId) return {}
          const [a, b] = s.finalists
          const scores = {
            ...s.finalScores,
            [s.finalTurnId]: [...(s.finalScores[s.finalTurnId] ?? []), correct],
          }
          const aAns = scores[a]?.length ?? 0
          const bAns = scores[b]?.length ?? 0
          const aCorrect = (scores[a] ?? []).filter(Boolean).length
          const bCorrect = (scores[b] ?? []).filter(Boolean).length

          const baseRounds = 5
          // who answers next: alternate
          const nextTurn = s.finalTurnId === a ? b : a

          // Determine if the game is decided.
          if (!s.finalSuddenDeath) {
            // During the first 5-each, check for an insurmountable lead after each answer.
            const aRemaining = baseRounds - aAns
            const bRemaining = baseRounds - bAns
            // If both have answered all 5
            if (aAns >= baseRounds && bAns >= baseRounds) {
              if (aCorrect !== bCorrect) {
                return {
                  ...drawFinalQuestion(s),
                  finalScores: scores,
                  winnerId: aCorrect > bCorrect ? a : b,
                  phase: 'winner' as Phase,
                }
              }
              // tie -> sudden death
              return {
                ...drawFinalQuestion(s),
                finalScores: scores,
                finalSuddenDeath: true,
                finalTurnId: nextTurn,
              }
            }
            // insurmountable lead check
            if (aCorrect > bCorrect + bRemaining) {
              return { ...drawFinalQuestion(s), finalScores: scores, winnerId: a, phase: 'winner' as Phase }
            }
            if (bCorrect > aCorrect + aRemaining) {
              return { ...drawFinalQuestion(s), finalScores: scores, winnerId: b, phase: 'winner' as Phase }
            }
            return { ...drawFinalQuestion(s), finalScores: scores, finalTurnId: nextTurn }
          } else {
            // sudden death: decide only when both have answered an equal number of extra questions
            if (aAns === bAns && aAns > baseRounds) {
              if (aCorrect !== bCorrect) {
                return {
                  ...drawFinalQuestion(s),
                  finalScores: scores,
                  winnerId: aCorrect > bCorrect ? a : b,
                  phase: 'winner' as Phase,
                }
              }
            }
            return { ...drawFinalQuestion(s), finalScores: scores, finalTurnId: nextTurn }
          }
        }),

      undo: () =>
        set((s) => {
          if (s.history.length === 0) return {}
          const prev = s.history[s.history.length - 1]
          return {
            ...prev,
            roundStats: prev.roundStats,
            history: s.history.slice(0, -1),
          }
        }),
    }),
    {
      name: STORAGE_KEY,
      // Persist the roster + settings so they survive reloads; transient game state is not persisted.
      partialize: (s) => ({ players: s.players, settings: s.settings }) as unknown as GameState,
    },
  ),
)

// ---- helpers that need access to a snapshot of state ----
function nextPlayerId(s: GameState): string | null {
  const active = activePlayers(s.players)
  if (active.length === 0) return null
  const idx = active.findIndex((p) => p.id === s.currentPlayerId)
  const next = active[(idx + 1) % active.length]
  return next.id
}

function drawNext(s: GameState): Partial<GameState> {
  const { q, used } = pickQuestion(s.usedQuestionKeys)
  return { currentQuestion: q, usedQuestionKeys: used }
}

function drawFinalQuestion(s: GameState): Partial<GameState> {
  const { q, used } = pickQuestion(s.usedQuestionKeys)
  return { currentQuestion: q, usedQuestionKeys: used }
}

// selectors
export const selectActive = (s: GameState) => activePlayers(s.players)
export const selectCurrentPlayer = (s: GameState) =>
  s.players.find((p) => p.id === s.currentPlayerId) ?? null
export { securedValue, targetValue }
