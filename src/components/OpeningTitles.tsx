import { useEffect, useRef, useState } from 'react'

const CLIPS = ['/intro/intro-1.mp4', '/intro/intro-2.mp4', '/intro/intro-3.mp4']

interface Props {
  onDone: () => void
  /** keep cycling the three shots until the host clicks through */
  loop?: boolean
  label?: string
}

/** The cold open: three generated shots played back to back on one <video> element,
 *  fullscreen over everything, with the score baked into the clips. Esc exits. */
export default function OpeningTitles({ onDone, loop = false, label = 'Skip' }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [index, setIndex] = useState(0)
  const [blocked, setBlocked] = useState(false)

  const next = () => {
    if (index < CLIPS.length - 1) setIndex(index + 1)
    else if (loop) setIndex(0)
    else onDone()
  }

  // load and play whichever shot is current
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.src = CLIPS[index]
    // the browser blocks sound-on playback without a gesture in some contexts;
    // fall back to a click-to-start plate instead of silently skipping the titles
    v.play().then(() => setBlocked(false), () => setBlocked(true))
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDone()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster="/intro/intro-poster.png"
        playsInline
        onEnded={next}
        onError={onDone}
      />

      {blocked && (
        <button
          onClick={() => videoRef.current?.play().then(() => setBlocked(false), () => {})}
          className="absolute inset-0 grid place-items-center bg-black/60 font-cond text-3xl uppercase tracking-[0.3em] text-white/80 hover:text-white"
        >
          ▶ Play Titles
        </button>
      )}

      <button
        onClick={onDone}
        className="absolute bottom-6 right-6 rounded-lg bg-black/50 px-4 py-2 font-cond text-sm uppercase tracking-[0.2em] text-white/60 backdrop-blur hover:text-white"
      >
        {label}
      </button>
    </div>
  )
}
