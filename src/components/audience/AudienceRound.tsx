import { AnimatePresence, motion } from 'framer-motion'
import { useGame, selectCurrentPlayer } from '../../store/gameStore'
import { money } from '../../data/ladder'
import MoneyLadder from '../MoneyLadder'
import RoundTimer from '../RoundTimer'
import NamePlate from '../NamePlate'
import Avatar from '../Avatar'
import PlayerLineup from '../PlayerLineup'

/** The shared-screen round view: money, players, timer — never the question. */
export default function AudienceRound() {
  const roundNumber = useGame((s) => s.roundNumber)
  const chainIndex = useGame((s) => s.chainIndex)
  const roundPot = useGame((s) => s.roundPot)
  const grandTotal = useGame((s) => s.grandTotal)
  const timeRemaining = useGame((s) => s.timeRemaining)
  const timerRunning = useGame((s) => s.timerRunning)
  const settings = useGame((s) => s.settings)
  const player = useGame(selectCurrentPlayer)

  // infer round state without host-only local flags
  const initialSecs = Math.max(
    settings.minSeconds,
    settings.startSeconds - (roundNumber - 1) * settings.decrementSeconds,
  )
  const untouched = chainIndex === 0 && roundPot === 0 && timeRemaining === initialSecs
  const standby = !timerRunning && timeRemaining > 0 && untouched
  const paused = !timerRunning && timeRemaining > 0 && !untouched
  const timeUp = timeRemaining <= 0

  return (
    <div className="wl-stage relative grid h-full w-full overflow-hidden">
      <div className="grid grid-cols-[150px_1fr] gap-4 p-4 md:grid-cols-[180px_1fr]">
        {/* LEFT: money ladder */}
        <div className="h-full">
          <MoneyLadder chainIndex={chainIndex} roundPot={roundPot} />
        </div>

        {/* CENTER/RIGHT */}
        <div className="relative flex flex-col">
          <div className="flex items-start justify-between">
            <div className="font-cond">
              <div className="text-sm uppercase tracking-[0.3em] text-wl-cyan/70">Round {roundNumber}</div>
              <div className="font-display text-3xl text-amber-300">
                {money(grandTotal)} <span className="text-base text-white/50">grand total</span>
              </div>
            </div>
            {paused && (
              <span className="rounded-lg bg-black/50 px-3 py-1 font-cond text-sm uppercase tracking-[0.3em] text-wl-cyan">
                Paused
              </span>
            )}
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
                <Avatar photo={player?.photo} name={player?.name ?? ''} size={170} pos={player?.photoPos} />
                <NamePlate name={player?.name ?? ''} size="lg" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* right padding keeps the last player clear of the corner timer */}
          <div className="mb-2 pr-[220px]">
            <PlayerLineup />
          </div>

          <div className="absolute bottom-2 right-2">
            <RoundTimer seconds={timeRemaining} size="lg" />
          </div>
        </div>
      </div>

      {/* standby before the host starts the clock */}
      {standby && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-display text-6xl text-white">Round {roundNumber}</h2>
            <p className="font-cond text-2xl text-wl-cyan">
              {player ? `${player.name} starts. ` : ''}
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} on the clock.
            </p>
          </div>
        </div>
      )}

      {/* time's up */}
      <AnimatePresence>
        {timeUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 grid place-items-center bg-black/80 backdrop-blur"
          >
            <div className="flex flex-col items-center gap-5 text-center">
              <motion.h2 initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="font-display text-8xl text-rose-400">
                TIME'S UP
              </motion.h2>
              <p className="font-cond text-3xl text-white">
                Banked this round: <span className="text-amber-300">{money(roundPot)}</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
