import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { pickQuip, type QuipMoment } from '../data/quips'
import { audio } from '../audio/audio'

/**
 * The host slides in from the wings with a withering one-liner.
 * Decorative only (pointer-events-none) so it never blocks host controls.
 */
export default function HostOverlay({
  moment,
  delay = 0.8,
  speak = false,
  seed,
  variant = 'corner',
}: {
  moment: QuipMoment
  delay?: number
  speak?: boolean
  /** shared value (round number, player id…) so host + audience windows show the same line */
  seed?: string | number
  /** 'corner' floats bottom-left (bubble beside); 'side' floats bottom-left as a
   *  narrow column (bubble above the portrait) that fits in a screen's side gutter;
   *  'bar' is an inline strip for tight layouts */
  variant?: 'corner' | 'bar' | 'side'
}) {
  // pick once per mount so re-renders don't reshuffle the line
  const [quip] = useState(() => pickQuip(moment, seed))

  useEffect(() => {
    if (!speak) return
    // speechSynthesis queues utterances, so this politely waits for any announcer line
    const t = window.setTimeout(
      () => audio.say(quip, { rate: 0.95, pitch: 1.05, hostVoice: true }),
      delay * 1000 + 300,
    )
    return () => clearTimeout(t)
  }, [quip, speak, delay])

  if (variant === 'bar') {
    return (
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay, type: 'spring', stiffness: 150, damping: 19 }}
        className="pointer-events-none mx-auto flex w-full max-w-3xl items-center gap-3 rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur"
      >
        <img
          src="/host.png"
          alt="The host"
          className="h-14 w-14 rounded-xl border border-wl-cyan/25 object-cover"
          style={{ objectPosition: '50% 12%' }}
        />
        <div className="min-w-0">
          <div className="font-cond text-[10px] uppercase tracking-[0.3em] text-wl-cyan/70">The Host</div>
          <p className="truncate font-cond text-lg leading-snug text-white">{quip}</p>
        </div>
      </motion.div>
    )
  }

  if (variant === 'side') {
    return (
      <motion.div
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay, type: 'spring', stiffness: 150, damping: 19 }}
        className="pointer-events-none fixed bottom-4 left-4 z-20 flex w-[230px] flex-col items-center gap-2"
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.35 }}
          className="relative w-full rounded-2xl border border-white/15 bg-black/75 p-3 backdrop-blur"
        >
          {/* speech-bubble tail pointing down at the host */}
          <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-black/75" />
          <div className="mb-0.5 font-cond text-[10px] uppercase tracking-[0.3em] text-wl-cyan/70">
            The Host
          </div>
          <p className="font-cond text-lg leading-snug text-white">{quip}</p>
        </motion.div>
        <img
          src="/host.png"
          alt="The host"
          className="h-44 w-auto rounded-2xl border border-wl-cyan/25 object-cover md:h-52"
          style={{ boxShadow: '0 0 44px rgba(30, 90, 180, 0.55)' }}
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay, type: 'spring', stiffness: 150, damping: 19 }}
      className="pointer-events-none fixed bottom-4 left-4 z-20 flex items-end gap-3"
    >
      <img
        src="/host.png"
        alt="The host"
        className="h-44 w-auto rounded-2xl border border-wl-cyan/25 object-cover md:h-52"
        style={{ boxShadow: '0 0 44px rgba(30, 90, 180, 0.55)' }}
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.35 }}
        className="relative mb-8 max-w-xs rounded-2xl border border-white/15 bg-black/75 p-3 backdrop-blur"
      >
        {/* speech-bubble tail */}
        <div className="absolute -left-2 bottom-4 h-4 w-4 rotate-45 border-b border-l border-white/15 bg-black/75" />
        <div className="mb-0.5 font-cond text-[10px] uppercase tracking-[0.3em] text-wl-cyan/70">
          The Host
        </div>
        <p className="font-cond text-lg leading-snug text-white">{quip}</p>
      </motion.div>
    </motion.div>
  )
}
