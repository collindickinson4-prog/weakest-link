import { motion } from 'framer-motion'
import { useGame } from '../../store/gameStore'
import { money } from '../../data/ladder'
import Avatar from '../Avatar'
import HostOverlay from '../HostOverlay'

/** Mirrors the winner celebration. */
export default function AudienceWinner() {
  const players = useGame((s) => s.players)
  const winnerId = useGame((s) => s.winnerId)
  const grandTotal = useGame((s) => s.grandTotal)
  const winner = players.find((p) => p.id === winnerId)

  return (
    <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
      <div className="wl-beams pointer-events-none absolute inset-0 opacity-60" />
      <HostOverlay moment="winner" delay={2.6} seed={winnerId ?? ''} />
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ left: `${(i * 37) % 100}%`, top: '-5%', background: i % 2 ? '#ffcf4a' : '#7fdcff' }}
          animate={{ y: ['-5vh', '105vh'], opacity: [1, 1, 0] }}
          transition={{ duration: 3 + (i % 5), repeat: Infinity, delay: (i % 7) * 0.3, ease: 'linear' }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center gap-5"
      >
        <div className="font-display text-3xl uppercase tracking-[0.3em] text-wl-cyan">The Winner</div>
        <div className="rounded-full ring-4 ring-amber-300" style={{ boxShadow: '0 0 70px rgba(255,207,74,0.7)' }}>
          <Avatar photo={winner?.photo} name={winner?.name ?? ''} size={240} pos={winner?.photoPos} />
        </div>
        <h1
          className="max-w-[90vw] text-center font-display text-white"
          style={{ fontSize: `clamp(36px, ${Math.min(9, 110 / Math.max(1, winner?.name.length ?? 1))}vw, 72px)` }}
        >
          {winner?.name}
        </h1>
        <div className="font-display text-5xl text-amber-300">{money(grandTotal)}</div>
        <p className="font-cond text-xl text-white/70">Takes home the whole bank.</p>
      </motion.div>
    </div>
  )
}
