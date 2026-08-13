import { useGame } from '../store/gameStore'
import { audio } from '../audio/audio'
import { useHotkeys } from '../lib/useHotkeys'
import Avatar from './Avatar'
import NamePlate from './NamePlate'
import Button from './Button'

const BASE = 5

function Disc({ state, label }: { state: 'pending' | 'correct' | 'wrong' | 'active'; label: string }) {
  const styles: Record<typeof state, React.CSSProperties> = {
    pending: {
      background: 'radial-gradient(ellipse at 50% 30%, #4a6fa5 0%, #25406e 55%, #16263f 100%)',
      border: '2px solid #6f93c8',
      color: '#cdddf5',
    },
    active: {
      background: 'radial-gradient(ellipse at 50% 30%, #7fdcff 0%, #2f8fd6 55%, #134a7e 100%)',
      border: '2px solid #bdeaff',
      color: '#fff',
      boxShadow: '0 0 22px rgba(127,220,255,0.8)',
    },
    correct: {
      background: 'radial-gradient(ellipse at 50% 30%, #6ee7a8 0%, #1f9e5a 55%, #0c6336 100%)',
      border: '2px solid #b6f5d2',
      color: '#fff',
      boxShadow: '0 0 18px rgba(60,220,130,0.6)',
    },
    wrong: {
      background: 'radial-gradient(ellipse at 50% 30%, #ff8a8a 0%, #c81f33 55%, #6e0f1c 100%)',
      border: '2px solid #ffc2c2',
      color: '#fff',
      boxShadow: '0 0 18px rgba(255,80,80,0.5)',
    },
  }
  return (
    <div
      className="relative grid h-16 w-16 place-items-center rounded-[50%] font-display text-2xl md:h-20 md:w-20"
      style={styles[state]}
    >
      <div
        className="pointer-events-none absolute left-[12%] right-[12%] top-[12%] h-[28%] rounded-[50%]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0))' }}
      />
      <span className="relative">{label}</span>
    </div>
  )
}

export function FinalistRow({ id, isTurn }: { id: string; isTurn: boolean }) {
  const players = useGame((s) => s.players)
  const scores = useGame((s) => s.finalScores[id] ?? [])
  const p = players.find((x) => x.id === id)
  const total = Math.max(BASE, scores.length + (scores.length >= BASE ? 1 : 0))
  const correctCount = scores.filter(Boolean).length

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border p-3 transition ${
        isTurn ? 'border-wl-cyan bg-wl-cyan/10' : 'border-white/10 bg-white/5'
      }`}
    >
      <Avatar photo={p?.photo} name={p?.name ?? ''} size={72} pos={p?.photoPos} />
      <div className="w-48 shrink-0">
        <NamePlate name={p?.name ?? ''} size="sm" />
        <div className="mt-1 text-center font-cond text-sm text-emerald-300">{correctCount} correct</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }, (_, i) => {
          if (i < scores.length) {
            return <Disc key={i} state={scores[i] ? 'correct' : 'wrong'} label={scores[i] ? String(i + 1) : '✕'} />
          }
          const isActiveSlot = isTurn && i === scores.length
          return <Disc key={i} state={isActiveSlot ? 'active' : 'pending'} label={String(i + 1)} />
        })}
      </div>
    </div>
  )
}

export default function FinalRoundScreen() {
  const finalists = useGame((s) => s.finalists)
  const finalTurnId = useGame((s) => s.finalTurnId)
  const suddenDeath = useGame((s) => s.finalSuddenDeath)
  const q = useGame((s) => s.currentQuestion)
  const finalAnswer = useGame((s) => s.finalAnswer)
  const players = useGame((s) => s.players)

  const turnName = players.find((p) => p.id === finalTurnId)?.name ?? ''

  const onCorrect = () => { audio.play('correct'); finalAnswer(true) }
  const onWrong = () => { audio.play('wrong'); finalAnswer(false) }

  useHotkeys({
    c: onCorrect,
    x: onWrong,
  })

  return (
    <div className="wl-stage grid h-full w-full grid-rows-[auto_1fr_auto] overflow-hidden">
      <div className="p-6 text-center">
        <h1 className="font-display text-5xl text-white">Head To Head</h1>
        <p className="font-cond text-wl-cyan/80">
          {suddenDeath ? 'Sudden death!' : 'Five questions each.'} {turnName && `${turnName} to answer.`}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-5 px-6">
        {finalists.map((id) => (
          <FinalistRow key={id} id={id} isTurn={id === finalTurnId} />
        ))}
      </div>

      {/* host panel */}
      <div className="px-6 pb-6">
        <div className="rounded-2xl border border-white/15 bg-black/50 p-4 backdrop-blur">
          <div className="mb-1 font-cond text-xs uppercase tracking-[0.25em] text-wl-cyan/70">
            Host panel · read aloud · {q?.category} · {turnName}'s question
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-cond text-2xl text-white">{q?.question}</p>
              <p className="mt-1.5 font-cond text-xl text-emerald-300">{q?.answer}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="correct" size="lg" onClick={onCorrect}>
                ✓ Correct <kbd className="ml-1 text-xs opacity-70">C</kbd>
              </Button>
              <Button variant="wrong" size="lg" onClick={onWrong}>
                ✗ Wrong <kbd className="ml-1 text-xs opacity-70">X</kbd>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
