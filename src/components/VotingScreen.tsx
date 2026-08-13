import { motion } from 'framer-motion'
import { useGame, selectActive } from '../store/gameStore'
import { audio } from '../audio/audio'
import Avatar from './Avatar'
import Button from './Button'
import HostOverlay from './HostOverlay'

export default function VotingScreen() {
  const active = useGame(selectActive)
  const votes = useGame((s) => s.votes)
  const castVote = useGame((s) => s.castVote)
  const resolveVotes = useGame((s) => s.resolveVotes)
  const players = useGame((s) => s.players)
  const nameOf = (id: string) => players.find((p) => p.id === id)?.name ?? ''
  const revealed = useGame((s) => s.votesRevealed)
  const revealVotes = useGame((s) => s.revealVotes)

  const allVoted = active.every((p) => votes[p.id])

  const tally: Record<string, number> = {}
  Object.values(votes).forEach((t) => (tally[t] = (tally[t] ?? 0) + 1))
  const maxVotes = Math.max(0, ...Object.values(tally))

  return (
    <div className="wl-stage h-full w-full overflow-y-auto wl-scrollbar">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="text-center font-display text-4xl text-white">Time To Vote</h1>
        <p className="mb-6 text-center font-cond text-wl-cyan/80">
          {revealed ? 'The votes are in…' : "Tap each player's choice for the Weakest Link."}
        </p>

        {!revealed ? (
          <div className="grid gap-3">
            {active.map((voter) => (
              <div
                key={voter.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div className="flex w-44 shrink-0 items-center gap-2">
                  <Avatar photo={voter.photo} name={voter.name} size={48} pos={voter.photoPos} />
                  <span className="font-cond font-semibold text-white">{voter.name}</span>
                  <span className="font-cond text-white/40">votes →</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {active
                    .filter((c) => c.id !== voter.id)
                    .map((c) => {
                      const chosen = votes[voter.id] === c.id
                      return (
                        <button
                          key={c.id}
                          onClick={() => { audio.play('click'); castVote(voter.id, c.id) }}
                          className={`rounded-lg border px-3 py-1.5 font-cond uppercase tracking-wide transition ${
                            chosen
                              ? 'border-rose-300 bg-rose-600 text-white'
                              : 'border-white/15 bg-black/30 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {c.name}
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {active
              .slice()
              .sort((a, b) => (tally[b.id] ?? 0) - (tally[a.id] ?? 0))
              .map((p) => {
                const n = tally[p.id] ?? 0
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <Avatar photo={p.photo} name={p.name} size={44} pos={p.photoPos} />
                    <span className="w-40 font-cond font-semibold text-white">{p.name}</span>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${maxVotes ? (n / maxVotes) * 100 : 0}%` }}
                        transition={{ duration: 0.6 }}
                        className={`h-full ${n === maxVotes && n > 0 ? 'bg-rose-500' : 'bg-wl-blue'}`}
                      />
                    </div>
                    <span className="w-8 text-right font-display text-xl text-white">{n}</span>
                  </div>
                )
              })}
            <p className="pt-2 text-center font-cond text-white/50">
              Most votes: {(() => {
                const leaders = active.filter((p) => (tally[p.id] ?? 0) === maxVotes && maxVotes > 0)
                return leaders.map((p) => nameOf(p.id)).join(', ') || '—'
              })()}
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          {!revealed ? (
            <Button size="lg" disabled={!allVoted} onClick={() => { audio.play('reveal'); revealVotes() }}>
              Reveal The Votes →
            </Button>
          ) : (
            <Button size="lg" variant="danger" onClick={() => { audio.play('eliminate'); resolveVotes() }}>
              Reveal The Weakest Link →
            </Button>
          )}
        </div>
        {!allVoted && !revealed && (
          <p className="mt-3 text-center font-cond text-white/40">Every player must cast a vote.</p>
        )}
      </div>
      {!revealed && <HostOverlay moment="preVote" delay={0.6} seed={active.length} />}
    </div>
  )
}
