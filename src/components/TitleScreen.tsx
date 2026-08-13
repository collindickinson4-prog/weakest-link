import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../store/gameStore'
import { audio } from '../audio/audio'
import Logo from './Logo'
import Button from './Button'
import IntroVideo, { introAlreadyPlayed } from './IntroVideo'

export default function TitleScreen() {
  const setPhase = useGame((s) => s.setPhase)
  const players = useGame((s) => s.players)
  const [introDone, setIntroDone] = useState(introAlreadyPlayed)

  const start = () => {
    audio.play('reveal')
    setPhase('setup')
  }

  return (
    <div className="wl-stage relative grid h-full w-full place-items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="grid place-items-center"
      >
        <Logo size={0.9} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <Button size="lg" onClick={start}>
            Start Game
          </Button>
          <p className="font-cond text-sm uppercase tracking-[0.3em] text-wl-cyan/70">
            {players.length} players set up
          </p>
        </motion.div>
      </motion.div>
      <p className="absolute bottom-4 left-0 right-0 text-center font-cond text-xs uppercase tracking-widest text-white/30">
        Party edition · for home play
      </p>
      {!introDone && <IntroVideo onDone={() => setIntroDone(true)} />}
    </div>
  )
}
