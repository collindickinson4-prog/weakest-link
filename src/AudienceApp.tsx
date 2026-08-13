import { useEffect } from 'react'
import { useGame } from './store/gameStore'
import { audio } from './audio/audio'
import AudienceWaiting from './components/audience/AudienceWaiting'
import AudienceIntro from './components/audience/AudienceIntro'
import AudienceRound from './components/audience/AudienceRound'
import AudienceStats from './components/audience/AudienceStats'
import AudienceVoting from './components/audience/AudienceVoting'
import AudienceElimination from './components/audience/AudienceElimination'
import AudienceFinal from './components/audience/AudienceFinal'
import AudienceWinner from './components/audience/AudienceWinner'

/**
 * Read-only audience display (opened with ?display): mirrors the host window's
 * game state but never shows questions. Silent — all audio comes from the host
 * window (share your screen with system audio).
 */
export default function AudienceApp() {
  const phase = useGame((s) => s.phase)

  useEffect(() => {
    audio.setMuted(true)
    document.title = 'The Weakest Link — Audience Display'
  }, [])

  let screen: React.ReactNode
  switch (phase) {
    case 'intro': screen = <AudienceIntro />; break
    case 'round': screen = <AudienceRound />; break
    case 'roundStats': screen = <AudienceStats />; break
    case 'voting': screen = <AudienceVoting />; break
    case 'elimination': screen = <AudienceElimination />; break
    case 'final': screen = <AudienceFinal />; break
    case 'winner': screen = <AudienceWinner />; break
    default: screen = <AudienceWaiting /> // title / setup
  }

  return <div className="relative h-full w-full">{screen}</div>
}
