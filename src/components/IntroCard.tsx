import { AnimatePresence, motion } from 'framer-motion'
import type { Player } from '../store/gameStore'
import Avatar from './Avatar'

/**
 * The player-introduction poster (photo left, name + traits right, progress dots).
 * Purely presentational — used by the host IntroScreen (which adds speech and
 * Back/Next controls) and by the audience display's mirrored intro.
 */
export default function IntroCard({
  player,
  index,
  total,
}: {
  player: Player
  index: number
  total: number
}) {
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45 }}
          className="grid h-full grid-cols-[45%_55%]"
        >
          {/* LEFT: duotone photo bleeding to the edge */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Photo player={player} />
            </div>
            {/* blue duotone overlay + fade into the right panel */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(2,8,30,0.15) 0%, rgba(2,8,30,0.1) 60%, rgba(2,8,30,0.95) 100%), linear-gradient(0deg, rgba(20,70,160,0.35), rgba(10,30,80,0.25))',
                mixBlendMode: 'normal',
              }}
            />
          </div>

          {/* RIGHT: name + nickname + strengths/weaknesses */}
          <div className="relative flex flex-col justify-center px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              {player.nickname && (
                <div className="mb-1 font-cond text-2xl uppercase tracking-[0.3em] text-wl-cyan">
                  {player.nickname}
                </div>
              )}
              <h1
                className="break-words font-display uppercase leading-[0.85] text-white"
                style={{ fontSize: 'clamp(48px, 8vw, 110px)' }}
              >
                {player.name.split(' ').map((w, i) => (
                  <span key={i} className={i === 0 ? 'block text-white' : 'block text-wl-blue-bright'}>
                    {w}
                  </span>
                ))}
              </h1>
            </motion.div>

            <div className="mt-8 grid grid-cols-2 gap-6">
              <TraitList title="Strengths" items={player.strengths} tone="good" />
              <TraitList title="Weaknesses" items={player.weaknesses} tone="bad" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* progress dots */}
      <div className="absolute bottom-6 left-10 flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-2 rounded-full transition-all ${i === index ? 'w-8 bg-wl-cyan' : 'w-2 bg-white/25'}`}
          />
        ))}
      </div>
    </>
  )
}

function Photo({ player }: { player: Player }) {
  if (player.photo) {
    return (
      <img
        src={player.photo}
        alt={player.name}
        className="h-full w-full object-cover"
        style={{
          filter: 'grayscale(0.85) contrast(1.1) brightness(0.95)',
          objectPosition: player.photoPos ? `${player.photoPos.x}% ${player.photoPos.y}%` : undefined,
        }}
      />
    )
  }
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-wl-blue/40 to-black">
      <Avatar name={player.name} size={240} />
    </div>
  )
}

function TraitList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'bad' }) {
  const color = tone === 'good' ? 'text-emerald-300' : 'text-rose-300'
  const bar = tone === 'good' ? 'bg-emerald-400' : 'bg-rose-400'
  return (
    <div>
      <h3 className={`mb-2 font-display text-xl uppercase tracking-wide ${color}`}>{title}</h3>
      {items.length === 0 ? (
        <p className="font-cond text-white/30">—</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex items-center gap-2 font-cond text-lg text-white/90">
              <span className={`h-1.5 w-1.5 rounded-full ${bar}`} />
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
