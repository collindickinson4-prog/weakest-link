import { useGame, selectCurrentPlayer, securedValue } from '../store/gameStore'
import { money } from '../data/ladder'
import { audio } from '../audio/audio'
import Button from './Button'

export default function HostPanel() {
  const q = useGame((s) => s.currentQuestion)
  const correct = useGame((s) => s.correct)
  const wrong = useGame((s) => s.wrong)
  const bank = useGame((s) => s.bank)
  const undo = useGame((s) => s.undo)
  const canUndo = useGame((s) => s.history.length > 0)
  const chainIndex = useGame((s) => s.chainIndex)
  const timerRunning = useGame((s) => s.timerRunning)
  const timeRemaining = useGame((s) => s.timeRemaining)
  const setTimerRunning = useGame((s) => s.setTimerRunning)
  const player = useGame(selectCurrentPlayer)

  const bankValue = securedValue(chainIndex)
  const live = timeRemaining > 0

  const ensureClock = () => {
    if (!timerRunning && timeRemaining > 0) {
      setTimerRunning(true)
    }
  }

  const onCorrect = () => {
    if (!live) return
    ensureClock()
    audio.play('correct')
    correct()
  }
  const onWrong = () => {
    if (!live) return
    ensureClock()
    audio.play('wrong')
    wrong()
  }
  const onBank = () => {
    if (!live || bankValue <= 0) return
    ensureClock()
    audio.play('bank')
    audio.say('Bank')
    bank()
  }

  return (
    <div className="rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-cond text-xs uppercase tracking-[0.25em] text-wl-cyan/70">
          Host panel · read aloud · {q?.category}
        </span>
        <span className="font-cond text-xs uppercase tracking-widest text-white/40">
          {player ? `${player.name}'s turn` : ''}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="font-cond text-2xl leading-tight text-white">{q?.question}</p>
          <p className="mt-1.5 font-cond text-xl text-emerald-300">{q?.answer}</p>
        </div>

        <div className="flex flex-col items-stretch gap-2">
          <div className="flex gap-2">
            <Button variant="correct" size="lg" onClick={onCorrect} disabled={!live} title="Key: C">
              ✓ Correct <kbd className="ml-1 text-xs opacity-70">C</kbd>
            </Button>
            <Button variant="wrong" size="lg" onClick={onWrong} disabled={!live} title="Key: X">
              ✗ Wrong <kbd className="ml-1 text-xs opacity-70">X</kbd>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="bank"
              size="lg"
              onClick={onBank}
              disabled={!live || bankValue <= 0}
              className="flex-1"
              title="Key: B"
            >
              Bank {bankValue > 0 ? money(bankValue) : ''} <kbd className="ml-1 text-xs opacity-70">B</kbd>
            </Button>
            <Button variant="ghost" onClick={() => { audio.play('click'); undo() }} disabled={!canUndo} title="Ctrl+Z">
              ↶ Undo
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
