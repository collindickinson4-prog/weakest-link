import { motion } from 'framer-motion'
import { useGame, selectActive } from '../../store/gameStore'
import Avatar from '../Avatar'
import HostOverlay from '../HostOverlay'

/** Suspense while votes are entered; the tally animates in once the host reveals. */
export default function AudienceVoting() {
  const active = useGame(selectActive)
  const votes = useGame((s) => s.votes)
  const revealed = useGame((s) => s.votesRevealed)

  const tally: Record<string, number> = {}
  Object.values(votes).forEach((t) => (tally[t] = (tally[t] ?? 0) + 1))
  const maxVotes = Math.max(0, ...Object.values(tally))
  const votesIn = Object.keys(votes).length

  if (!revealed) {
    return (
      <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
        <div className="wl-beams pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <motion.h1
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="font-display uppercase text-white"
            style={{ fontSize: 'clamp(40px, 6vw, 84px)', textShadow: '0 4px 18px rgba(0,0,0,0.9)' }}
          >
            The Players Are Voting…
          </motion.h1>
          <p className="font-cond text-2xl text-wl-cyan">
            {votesIn} of {active.length} votes cast
          </p>
        </div>
        <HostOverlay moment="preVote" delay={0.6} seed={active.length} />
      </div>
    )
  }

  return (
    <div className="wl-stage h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-[3vh]">
        <h1 className="text-center font-display text-white" style={{ fontSize: 'clamp(28px, 5.5vh, 52px)' }}>
          The Votes Are In
        </h1>
        <div className="mx-auto mt-[3vh] flex w-full max-w-2xl min-h-0 flex-1 flex-col justify-center gap-[1.6vh]">
          {active
            .slice()
            .sort((a, b) => (tally[b.id] ?? 0) - (tally[a.id] ?? 0))
            .map((p) => {
              const n = tally[p.id] ?? 0
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar photo={p.photo} name={p.name} size={44} pos={p.photoPos} />
                  <span
                    className="w-44 font-cond font-semibold text-white"
                    style={{ fontSize: 'clamp(13px, 2.3vh, 19px)' }}
                  >
                    {p.name}
                  </span>
                  <div className="h-[3.4vh] max-h-8 flex-1 overflow-hidden rounded bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${maxVotes ? (n / maxVotes) * 100 : 0}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full ${n === maxVotes && n > 0 ? 'bg-rose-500' : 'bg-wl-blue'}`}
                    />
                  </div>
                  <span className="w-10 text-right font-display text-white" style={{ fontSize: 'clamp(16px, 3vh, 26px)' }}>
                    {n}
                  </span>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
