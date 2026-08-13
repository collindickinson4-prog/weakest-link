import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame, selectActive, type Player } from '../store/gameStore'
import { money } from '../data/ladder'
import { audio } from '../audio/audio'
import Avatar from './Avatar'
import Button from './Button'
import HostOverlay from './HostOverlay'

export default function RoundStatsScreen() {
  const active = useGame(selectActive)
  const stats = useGame((s) => s.roundStats)
  const strongestId = useGame((s) => s.strongestId)
  const weakestId = useGame((s) => s.weakestId)
  const roundPot = useGame((s) => s.roundPot)
  const roundNumber = useGame((s) => s.roundNumber)
  const goToVoting = useGame((s) => s.goToVoting)
  const players = useGame((s) => s.players)
  const revealed = useGame((s) => s.statsRevealed)
  const revealStats = useGame((s) => s.revealStats)

  const strongest = players.find((p) => p.id === strongestId)
  const weakest = players.find((p) => p.id === weakestId)

  useEffect(() => {
    if (revealed) {
      audio.play('reveal')
      const s = strongest ? `Statistically, the strongest link is ${strongest.name}.` : ''
      const w = weakest ? `And the weakest link is ${weakest.name}.` : ''
      audio.say(`${s} ${w}`)
    }
  }, [revealed, strongest, weakest])

  return (
    <div className="wl-stage h-full w-full overflow-y-auto wl-scrollbar">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col px-6 py-8">
        <h1 className="text-center font-display text-4xl text-white">Round Statistics</h1>
        <p className="mb-6 text-center font-cond text-amber-300">
          Banked this round: {money(roundPot)}
        </p>

        {/* per-player table */}
        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full font-cond">
            <thead className="bg-white/10 text-left text-sm uppercase tracking-wide text-wl-cyan">
              <tr>
                <th className="px-4 py-2">Player</th>
                <th className="px-4 py-2 text-center">Correct</th>
                <th className="px-4 py-2 text-center">Wrong</th>
                <th className="px-4 py-2 text-right">Banked</th>
              </tr>
            </thead>
            <tbody>
              {active
                .slice()
                .sort((a, b) => (stats[b.id]?.banked ?? 0) - (stats[a.id]?.banked ?? 0))
                .map((p) => {
                  const st = stats[p.id] ?? { correct: 0, wrong: 0, banked: 0, lost: 0 }
                  return (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="flex items-center gap-2 px-4 py-2 font-semibold text-white">
                        <Avatar photo={p.photo} name={p.name} size={32} pos={p.photoPos} />
                        {p.name}
                      </td>
                      <td className="px-4 py-2 text-center text-emerald-300">{st.correct}</td>
                      <td className="px-4 py-2 text-center text-rose-300">{st.wrong}</td>
                      <td className="px-4 py-2 text-right text-amber-300">{money(st.banked)}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {/* strongest / weakest reveal */}
        <div className="mt-8 flex flex-1 flex-col items-center justify-center">
          {!revealed ? (
            <Button size="lg" onClick={revealStats}>
              Reveal Strongest & Weakest →
            </Button>
          ) : (
            <div className="grid w-full max-w-3xl grid-cols-2 gap-6">
              <RevealCard
                title="The Strongest Link"
                player={strongest}
                tone="good"
              />
              <RevealCard title="The Weakest Link" player={weakest} tone="bad" />
            </div>
          )}
        </div>

        {revealed && (
          <div className="mt-8 mb-6 flex justify-center">
            <Button size="lg" onClick={() => { audio.play('click'); goToVoting() }}>
              Time To Vote →
            </Button>
          </div>
        )}
      </div>
      {revealed && (
        <HostOverlay
          variant="side"
          moment={roundPot >= 1000 ? 'roundGood' : 'roundBad'}
          delay={1.2}
          speak
          seed={roundNumber}
        />
      )}
    </div>
  )
}

function RevealCard({
  title,
  player,
  tone,
}: {
  title: string
  player?: Pick<Player, 'name' | 'photo' | 'photoPos'>
  tone: 'good' | 'bad'
}) {
  const ring = tone === 'good' ? 'ring-emerald-400' : 'ring-rose-400'
  const color = tone === 'good' ? 'text-emerald-300' : 'text-rose-300'
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: tone === 'good' ? 0.1 : 0.5 }}
      className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <div className={`rounded-full ring-4 ${ring}`}>
        <Avatar photo={player?.photo} name={player?.name ?? ''} size={140} pos={player?.photoPos} />
      </div>
      <div className="text-center">
        <div className={`font-display text-2xl uppercase ${color}`}>{title}</div>
        <div className="font-display text-3xl text-white">{player?.name ?? '—'}</div>
      </div>
    </motion.div>
  )
}
