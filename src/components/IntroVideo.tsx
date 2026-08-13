import { useEffect, useRef, useState } from 'react'
import { useGame } from '../store/gameStore'

/** Plays once per page load, not every time the game returns to the title. */
let hasPlayed = false
export const introAlreadyPlayed = () => hasPlayed

interface Props {
  onDone: () => void
}

/** Full-screen pre-roll over the title screen. Any key or click skips it.
 *  Browsers block autoplay with sound until the page has been interacted with,
 *  so if play() is refused we fall back to a click-to-start poster. If the file
 *  is missing or fails to decode we bail straight to the title. */
export default function IntroVideo({ onDone }: Props) {
  const muted = useGame((s) => s.settings.muted)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [needsClick, setNeedsClick] = useState(false)

  const finish = () => {
    hasPlayed = true
    onDone()
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = muted
    v.play().catch(() => setNeedsClick(true))
  }, [muted])

  // while it is rolling, any key skips; clicks are handled on the container
  useEffect(() => {
    if (needsClick) return
    const onKey = () => finish()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [needsClick])

  const start = () => {
    const v = videoRef.current
    if (!v) return finish()
    v.muted = muted
    setNeedsClick(false)
    v.play().catch(() => finish())
  }

  return (
    <div
      className="fixed inset-0 z-20 grid place-items-center bg-black"
      onClick={() => (needsClick ? undefined : finish())}
    >
      <video
        ref={videoRef}
        src="intro.mp4"
        poster="intro-poster.png"
        playsInline
        preload="auto"
        onEnded={finish}
        onError={finish}
        className="h-full w-full object-contain"
      />

      {needsClick && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            start()
          }}
          className="absolute grid place-items-center gap-3 rounded-2xl bg-black/50 px-10 py-8 backdrop-blur transition hover:bg-black/60"
        >
          <span className="text-6xl text-wl-cyan">▶</span>
          <span className="font-cond text-sm uppercase tracking-[0.3em] text-white/70">
            Play intro
          </span>
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation()
          finish()
        }}
        className="absolute bottom-6 right-6 rounded-lg bg-black/40 px-3 py-1.5 font-cond text-sm uppercase tracking-widest text-white/50 backdrop-blur hover:text-white"
      >
        Skip ▸
      </button>
    </div>
  )
}
