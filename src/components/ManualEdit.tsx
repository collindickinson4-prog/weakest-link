import { useGame, selectActive, type RoundStat } from '../store/gameStore'
import { money } from '../data/ladder'
import Button from './Button'

const fields: (keyof RoundStat)[] = ['correct', 'wrong', 'banked', 'lost']
const steps: Record<keyof RoundStat, number> = { correct: 1, wrong: 1, banked: 50, lost: 50 }

/** Host override: hand-correct a player's stats, the team pot, and the clock. */
export default function ManualEdit({ onClose }: { onClose: () => void }) {
  const active = useGame(selectActive)
  const stats = useGame((s) => s.roundStats)
  const adjustStat = useGame((s) => s.adjustStat)
  const timeRemaining = useGame((s) => s.timeRemaining)
  const setTimeRemaining = useGame((s) => s.setTimeRemaining)
  const roundPot = useGame((s) => s.roundPot)
  const grandTotal = useGame((s) => s.grandTotal)
  const setState = useGame.setState

  const adjustPot = (delta: number) =>
    setState((s) => ({
      roundPot: Math.max(0, s.roundPot + delta),
      grandTotal: Math.max(0, s.grandTotal + delta),
    }))

  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-black/80 p-6 backdrop-blur">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto wl-scrollbar rounded-2xl border border-white/15 bg-wl-bg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-3xl text-white">Manual Edit</h2>
          <button onClick={onClose} className="font-cond text-white/60 hover:text-white">✕ Close</button>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-6 font-cond">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Clock:</span>
            <button onClick={() => setTimeRemaining(timeRemaining - 5)} className="rounded bg-white/10 px-2">−5s</button>
            <span className="font-display text-xl text-wl-cyan">
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </span>
            <button onClick={() => setTimeRemaining(timeRemaining + 5)} className="rounded bg-white/10 px-2">+5s</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60">Team pot:</span>
            <button onClick={() => adjustPot(-50)} className="rounded bg-white/10 px-2">−50</button>
            <span className="font-display text-xl text-amber-300">{money(roundPot)}</span>
            <button onClick={() => adjustPot(50)} className="rounded bg-white/10 px-2">+50</button>
            <span className="ml-3 text-white/40">grand {money(grandTotal)}</span>
          </div>
        </div>

        <table className="w-full font-cond text-sm">
          <thead>
            <tr className="text-left text-white/50">
              <th className="py-1">Player</th>
              {fields.map((f) => (
                <th key={f} className="py-1 capitalize">{f}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {active.map((p) => {
              const st = stats[p.id] ?? { correct: 0, wrong: 0, banked: 0, lost: 0 }
              return (
                <tr key={p.id} className="border-t border-white/10">
                  <td className="py-2 font-semibold text-white">{p.name}</td>
                  {fields.map((f) => (
                    <td key={f} className="py-2">
                      <div className="flex items-center gap-1">
                        <button onClick={() => adjustStat(p.id, f, -steps[f])} className="rounded bg-white/10 px-2">−</button>
                        <span className="w-12 text-center text-white">
                          {f === 'banked' || f === 'lost' ? money(st[f]) : st[f]}
                        </span>
                        <button onClick={() => adjustStat(p.id, f, steps[f])} className="rounded bg-white/10 px-2">+</button>
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  )
}
