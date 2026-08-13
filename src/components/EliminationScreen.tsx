import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGame, selectActive } from '../store/gameStore'
import { audio } from '../audio/audio'
import Avatar from './Avatar'
import Button from './Button'
import HostOverlay from './HostOverlay'

export default function EliminationScreen() {
  const players = useGame((s) => s.players)
  const eliminatedId = useGame((s) => s.lastEliminatedId)
  const afterElimination = useGame((s) => s.afterElimination)
  const active = useGame(selectActive)

  const eliminated = players.find((p) => p.id === eliminatedId)
  const remaining = active.length
  const goesToFinal = remaining <= 2

  useEffect(() => {
    audio.play('eliminate')
    const t = window.setTimeout(() => {
      audio.say(`${eliminated?.name ?? ''}. You are the weakest link. Goodbye.`, { rate: 0.85, pitch: 0.7 })
    }, 500)
    return () => clearTimeout(t)
  }, [eliminated])

  return (
    <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
      {/* crossing blue spotlight beams */}
      <div className="wl-beams pointer-events-none absolute inset-0" />
      {/* the host arrives to twist the knife (speech queues after the goodbye line) */}
      <HostOverlay moment="elimination" delay={2.4} speak seed={eliminatedId ?? ''} />
      {/* floor glow */}
      <div
        className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-[80%] -translate-x-1/2 rounded-[50%]"
        style={{ background: 'radial-gradient(ellipse, rgba(150,210,255,0.45), transparent 70%)' }}
      />

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <Button size="lg" onClick={() => { audio.play('click'); afterElimination() }}>
            {goesToFinal ? 'To The Final Head-To-Head →' : 'Next Round →'}
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
