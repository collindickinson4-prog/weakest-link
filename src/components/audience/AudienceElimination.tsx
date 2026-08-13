import { motion } from 'framer-motion'
import { useGame } from '../../store/gameStore'
import Avatar from '../Avatar'
import HostOverlay from '../HostOverlay'

/** Mirrors the goodbye moment (audio comes from the host window). */
export default function AudienceElimination() {
  const players = useGame((s) => s.players)
  const eliminatedId = useGame((s) => s.lastEliminatedId)
  const eliminated = players.find((p) => p.id === eliminatedId)

  return (
    <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
      <div className="wl-beams pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-[50%]"
        style={{ background: 'radial-gradient(ellipse, rgba(150,210,255,0.45), transparent 70%)' }}
      />
      <HostOverlay moment="elimination" delay={2.4} seed={eliminatedId ?? ''} />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center gap-6"
      >
        <div className="rounded-full ring-4 ring-rose-400 grayscale" style={{ boxShadow: '0 0 60px rgba(255,80,80,0.6)' }}>
          <Avatar photo={eliminated?.photo} name={eliminated?.name ?? ''} size={220} duotone pos={eliminated?.photoPos} />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center font-display uppercase leading-tight text-white"
          style={{ fontSize: 'clamp(36px, 5.5vw, 76px)', textShadow: '0 4px 18px rgba(0,0,0,0.9)' }}
        >
          You Are The Weakest Link
          <span className="block text-rose-400">Goodbye</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="font-display text-3xl text-white"
        >
          {eliminated?.name}
        </motion.div>
      </motion.div>
    </div>
  )
}
