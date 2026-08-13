import { useEffect, useState } from 'react'
import { useGame } from '../store/gameStore'
import { audio } from '../audio/audio'
import IntroCard from './IntroCard'
import OpeningTitles from './OpeningTitles'
import Button from './Button'

export default function IntroScreen() {
  const players = useGame((s) => s.players)
  const introIndex = useGame((s) => s.introIndex)
  const introPrev = useGame((s) => s.introPrev)
  const startRound = useGame((s) => s.startRound)
  const setState = useGame.setState

  // the cold open runs first and cycles until the host clicks through to the posters
  const [titles, setTitles] = useState(true)

  const player = players[introIndex]
  const isLast = introIndex >= players.length - 1

  // The titles carry their own score, so the synth pad from Setup stands down
  // until the host clicks through to the posters.
  useEffect(() => {
    if (titles) audio.stopPad()
    else audio.startPad()
  }, [titles])

  // Announcer reads each player as their poster appears.
  useEffect(() => {
    if (!player || titles) return
    // cancel any in-flight line first so the name isn't spoken twice
    // (e.g. React StrictMode double-mount, or quickly clicking Next)
    audio.stopSpeech()
    const line = player.nickname
      ? `Introducing ${player.name}. ${player.nickname}.`
      : `Introducing ${player.name}.`
    const id = window.setTimeout(() => audio.say(line), 60)
    return () => window.clearTimeout(id)
  }, [introIndex, player, titles])

  const next = () => {
    audio.play('click')
    if (isLast) {
      audio.stopPad()
      audio.stopSpeech()
      startRound() // moves to phase 'round' and initializes round 1
    } else {
      setState((s) => ({ introIndex: s.introIndex + 1 }))
    }
  }

  if (titles)
    return <OpeningTitles loop label="Start Intros →" onDone={() => setTitles(false)} />

  if (!player) return null

  return (
    <div className="wl-stage relative h-full w-full overflow-hidden">
      <IntroCard player={player} index={introIndex} total={players.length} />

      {/* host controls */}
      <div className="absolute bottom-6 right-10 flex gap-3">
        <Button variant="ghost" onClick={() => { audio.play('click'); introPrev() }} disabled={introIndex === 0}>
          ← Back
        </Button>
        <Button onClick={next}>{isLast ? 'Start The Game →' : 'Next →'}</Button>
      </div>
    </div>
  )
}
