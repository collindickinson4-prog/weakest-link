import { useGame } from '../../store/gameStore'
import IntroCard from '../IntroCard'

/** Mirrors the host's full introduction poster, driven by the shared introIndex. */
export default function AudienceIntro() {
  const players = useGame((s) => s.players)
  const introIndex = useGame((s) => s.introIndex)
  const player = players[introIndex]
  if (!player) return null

  return (
    <div className="wl-stage relative h-full w-full overflow-hidden">
      <IntroCard player={player} index={introIndex} total={players.length} />
    </div>
  )
}
