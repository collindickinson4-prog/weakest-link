import { useGame } from '../../store/gameStore'
import { FinalistRow } from '../FinalRoundScreen'

/** Head-to-head scoreboard without the question panel. */
export default function AudienceFinal() {
  const finalists = useGame((s) => s.finalists)
  const finalTurnId = useGame((s) => s.finalTurnId)
  const suddenDeath = useGame((s) => s.finalSuddenDeath)
  const players = useGame((s) => s.players)
  const turnName = players.find((p) => p.id === finalTurnId)?.name ?? ''

  return (
    <div className="wl-stage grid h-full w-full grid-rows-[auto_1fr] overflow-hidden">
      <div className="p-8 text-center">
        <h1 className="font-display text-6xl text-white">Head To Head</h1>
        <p className="mt-1 font-cond text-2xl text-wl-cyan/80">
          {suddenDeath ? 'Sudden death!' : 'Five questions each.'} {turnName && `${turnName} to answer.`}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-6 px-6 pb-10">
        {finalists.map((id) => (
          <FinalistRow key={id} id={id} isTurn={id === finalTurnId} />
        ))}
      </div>
    </div>
  )
}
