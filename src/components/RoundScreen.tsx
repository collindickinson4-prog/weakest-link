import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGame, selectCurrentPlayer } from '../store/gameStore'
import { money } from '../data/ladder'
import { audio } from '../audio/audio'
import { useHotkeys } from '../lib/useHotkeys'
import MoneyLadder from './MoneyLadder'
import RoundTimer from './RoundTimer'
import NamePlate from './NamePlate'
import Avatar from './Avatar'
import HostPanel from './HostPanel'
import PlayerLineup from './PlayerLineup'
import Button from './Button'
import ManualEdit from './ManualEdit'

export default function RoundScreen() {
  const roundNumber = useGame((s) => s.roundNumber)
  const chainIndex = useGame((s) => s.chainIndex)
  const roundPot = useGame((s) => s.roundPot)
  const grandTotal = useGame((s) => s.grandTotal)
  const timeRemaining = useGame((s) => s.timeRemaining)
  const timerRunning = useGame((s) => s.timerRunning)
  const tick = useGame((s) => s.tick)
  const setTimerRunning = useGame((s) => s.setTimerRunning)
  const togglePause = useGame((s) => s.togglePause)
  const endRound = useGame((s) => s.endRound)
  const correct = useGame((s) => s.correct)
  const wrong = useGame((s) => s.wrong)
  const bank = useGame((s) => s.bank)
  const undo = useGame((s) => s.undo)
  const player = useGame(selectCurrentPlayer)

  const [started, setStarted] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const timeUp = timeRemaining <= 0 && started

  // 1-second clock
  useEffect(() => {
    if (!timerRunning) return
    const id = window.setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [timerRunning, tick])

  // tension pulse while the clock runs; speeds up in the final 20s
  const fast = timeRemaining <= 20
  useEffect(() => {
    if (timerRunning) audio.startPulse(fast ? 132 : 100)
    else audio.stopPulse()
    return () => audio.stopPulse()
  }, [timerRunning, fast])

  useEffect(() => {
    if (timeUp) {
      audio.stopPulse()
      audio.say("Time's up.")
    }
  }, [timeUp])

  const startClock = () => {
    setStarted(true)
    setTimerRunning(true)
    audio.say('Start the clock!')
  }

  // keyboard shortcuts
  useHotkeys({
    c: () => { if (!timeUp && started) { audio.play('correct'); correct() } },
    x: () => { if (!timeUp && started) { audio.play('wrong'); wrong() } },
    b: () => { if (!timeUp && started) { audio.play('bank'); bank() } },
    ' ': () => { if (started && !timeUp) togglePause() },
    'ctrl+z': () => undo(),
    enter: () => { if (!started) startClock() },
  })

  return (
    <div className="wl-stage relative grid h-full w-full grid-rows-[1fr_auto] overflow-hidden">
      <div className="grid grid-cols-[150px_1fr] gap-4 p-4 md:grid-cols-[180px_1fr]">
        {/* LEFT: money ladder */}
        <div className="h-full">
          <MoneyLadder chainIndex={chainIndex} roundPot={roundPot} />
        </div>

        {/* CENTER/RIGHT */}
        <div className="relative flex flex-col">
          {/* top bar */}
          <div className="flex items-start justify-between">
            <div className="font-cond">
              <div className="text-sm uppercase tracking-[0.3em] text-wl-cyan/70">Round {roundNumber}</div>
              <div className="font-display text-3xl text-amber-300">
                {money(grandTotal)} <span className="text-base text-white/50">grand total</span>
              </div>
            </div>
            {/* mr-28 keeps these clear of the fixed corner controls (display/mute/fullscreen) */}
            <div className="mr-28 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowEdit(true)}>Edit</Button>
              <Button variant="ghost" size="sm" onClick={togglePause} disabled={!started || timeUp}>
                {timerRunning ? '⏸ Pause' : '▶ Resume'}
              </Button>
            </div>
          </div>

          {/* current player */}
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={player?.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center gap-3"
              >
                <Avatar photo={player?.photo} name={player?.name ?? ''} size={150} pos={player?.photoPos} />
                <NamePlate name={player?.name ?? ''} size="lg" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* lineup — right padding keeps the last player clear of the corner timer */}
          <div className="mb-2 pr-[220px]">
            <PlayerLineup />
          </div>

          {/* timer lower-right */}
          <div className="absolute bottom-2 right-2">
            <RoundTimer seconds={timeRemaining} size="lg" />
          </div>
        </div>
      </div>

      {/* host control bar */}
      <div className="px-4 pb-4">
        <HostPanel />
      </div>

      {/* Start-the-clock overlay */}
      {!started && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-display text-5xl text-white">Round {roundNumber}</h2>
            <p className="font-cond text-xl text-wl-cyan">
              {player ? `${player.name} starts.` : ''} {Math.floor(timeRemaining / 60)}:
              {(timeRemaining % 60).toString().padStart(2, '0')} on the clock.
            </p>
            <Button size="lg" onClick={startClock}>
              ▶ Start The Clock <kbd className="ml-2 text-sm opacity-70">Enter</kbd>
            </Button>
          </div>
        </div>
      )}

      {/* Time's up overlay */}
      <AnimatePresence>
        {timeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur"
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <motion.h2
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                className="font-display text-7xl text-rose-400"
              >
                TIME'S UP
              </motion.h2>
              <p className="font-cond text-2xl text-white">
                Banked this round: <span className="text-amber-300">{money(roundPot)}</span>
              </p>
              <Button size="lg" onClick={() => { audio.play('reveal'); endRound() }}>
                See The Statistics →
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showEdit && <ManualEdit onClose={() => setShowEdit(false)} />}
    </div>
  )
}
