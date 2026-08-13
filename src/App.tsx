import { useEffect, useState } from 'react'
import { useGame } from './store/gameStore'
import { audio } from './audio/audio'
import { startBroadcast } from './lib/displaySync'
import TitleScreen from './components/TitleScreen'
import SetupScreen from './components/SetupScreen'
import IntroScreen from './components/IntroScreen'
import RoundScreen from './components/RoundScreen'
import RoundStatsScreen from './components/RoundStatsScreen'
import VotingScreen from './components/VotingScreen'
import EliminationScreen from './components/EliminationScreen'
import FinalRoundScreen from './components/FinalRoundScreen'
import WinnerScreen from './components/WinnerScreen'

export default function App() {
  const phase = useGame((s) => s.phase)
  const muted = useGame((s) => s.settings.muted)
  const setState = useGame.setState
  const [fs, setFs] = useState(false)

  // keep the audio manager in sync with the saved mute setting
  useEffect(() => {
    audio.setMuted(muted)
  }, [muted])

  // prime speech voices (some browsers populate them lazily)
  useEffect(() => {
    window.speechSynthesis?.getVoices()
  }, [])

  // mirror game state to any audience display windows
  useEffect(() => {
    startBroadcast()
  }, [])

  const openDisplay = () => {
    window.open('?display', 'wl-display', 'width=1280,height=720')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.()
      setFs(true)
    } else {
      document.exitFullscreen?.()
      setFs(false)
    }
  }

  const toggleMute = () => {
    const next = !muted
    audio.setMuted(next)
    setState((s) => ({ settings: { ...s.settings, muted: next } }))
  }

  let screen: React.ReactNode
  switch (phase) {
    case 'title': screen = <TitleScreen />; break
    case 'setup': screen = <SetupScreen />; break
    case 'intro': screen = <IntroScreen />; break
    case 'round': screen = <RoundScreen />; break
    case 'roundStats': screen = <RoundStatsScreen />; break
    case 'voting': screen = <VotingScreen />; break
    case 'elimination': screen = <EliminationScreen />; break
    case 'final': screen = <FinalRoundScreen />; break
    case 'winner': screen = <WinnerScreen />; break
    default: screen = <TitleScreen />
  }

  return (
    <div className="relative h-full w-full">
      {screen}

      {/* persistent corner controls */}
      <div className="absolute right-2 top-2 z-30 flex gap-1">
        <button
          onClick={openDisplay}
          title="Open audience display (question-free window for screen sharing)"
          className="rounded-lg bg-black/40 px-2 py-1 text-sm text-white/70 backdrop-blur hover:text-white"
        >
          📺
        </button>
        <button
          onClick={toggleMute}
          title="Mute / unmute"
          className="rounded-lg bg-black/40 px-2 py-1 text-sm text-white/70 backdrop-blur hover:text-white"
        >
          {muted ? '🔇' : '🔊'}
        </button>
        <button
          onClick={toggleFullscreen}
          title="Toggle fullscreen"
          className="rounded-lg bg-black/40 px-2 py-1 text-sm text-white/70 backdrop-blur hover:text-white"
        >
          {fs ? '🡼' : '⛶'}
        </button>
      </div>
    </div>
  )
}
