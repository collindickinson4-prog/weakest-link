import { motion } from 'framer-motion'
import { useGame, selectActive, type Player } from '../../store/gameStore'
import { money } from '../../data/ladder'
import Avatar from '../Avatar'
import HostOverlay from '../HostOverlay'

/** Mirrors the round statistics; compact vh-scaled layout that never scrolls. */
export default function AudienceStats() {
  const active = useGame(selectActive)
  const stats = useGame((s) => s.roundStats)
  const strongestId = useGame((s) => s.strongestId)
  const weakestId = useGame((s) => s.weakestId)
  const roundPot = useGame((s) => s.roundPot)
  const roundNumber = useGame((s) => s.roundNumber)
  const revealed = useGame((s) => s.statsRevealed)
  const players = useGame((s) => s.players)

  const strongest = players.find((p) => p.id === strongestId)
  const weakest = players.find((p) => p.id === weakestId)

  return (
    <div className="wl-stage h-full w-full overflow-hidden">
      <div className="mx-auto flex h-full max-w-5xl flex-col px-6 py-[2vh]">
        <h1 className="text-center font-display text-white" style={{ fontSize: 'clamp(22px, 4.5vh, 40px)' }}>
          Round Statistics
        </h1>
        <p className="mb-[1.5vh] text-center font-cond text-amber-300" style={{ fontSize: 'clamp(13px, 2.2vh, 20px)' }}>
          Banked this round: {money(roundPot)}
        </p>

        <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full font-cond" style={{ fontSize: 'clamp(12px, 2.1vh, 18px)' }}>
            <thead className="bg-white/10 text-left uppercase tracking-wide text-wl-cyan">
              <tr>
                <th className="px-3 py-[0.5vh]">Player</th>
                <th className="px-3 py-[0.5vh] text-center">Correct</th>
                <th className="px-3 py-[0.5vh] text-center">Wrong</th>
                <th className="px-3 py-[0.5vh] text-right">Banked</th>
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
                      <td className="flex items-center gap-2 px-3 py-[0.4vh] font-semibold text-white">
                        <Avatar photo={p.photo} name={p.name} size={26} pos={p.photoPos} />
                        {p.name}
                      </td>
                      <td className="px-3 py-[0.4vh] text-center text-emerald-300">{st.correct}</td>
                      <td className="px-3 py-[0.4vh] text-center text-rose-300">{st.wrong}</td>
                      <td className="px-3 py-[0.4vh] text-right text-amber-300">{money(st.banked)}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center pt-[1.5vh]">
          {!revealed ? (
            <motion.p
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-cond uppercase tracking-[0.3em] text-wl-cyan/80"
              style={{ fontSize: 'clamp(14px, 2.5vh, 22px)' }}
            >
              Who was the weakest link?
            </motion.p>
          ) : (
            <div className="grid w-full max-w-3xl grid-cols-2 gap-5">
              <RevealCard title="The Strongest Link" player={strongest} tone="good" />
              <RevealCard title="The Weakest Link" player={weakest} tone="bad" />
            </div>
          )}
        </div>
      </div>

      {/* narrow side column (bubble above portrait) fits the left gutter — never overlaps the cards */}
      {revealed && (
        <HostOverlay
          variant="side"
          moment={roundPot >= 1000 ? 'roundGood' : 'roundBad'}
          delay={1.2}
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
      className="flex flex-col items-center gap-[1vh] rounded-2xl border border-white/10 bg-white/5 p-[1.6vh]"
    >
      <div className={`rounded-full ring-4 ${ring}`}>
        <Avatar photo={player?.photo} name={player?.name ?? ''} size={100} pos={player?.photoPos} />
      </div>
      <div className="text-center">
        <div className={`font-display uppercase ${color}`} style={{ fontSize: 'clamp(14px, 2.4vh, 22px)' }}>
          {title}
        </div>
        <div className="font-display text-white" style={{ fontSize: 'clamp(16px, 2.9vh, 27px)' }}>
          {player?.name ?? '—'}
        </div>
      </div>
    </motion.div>
  )
}
