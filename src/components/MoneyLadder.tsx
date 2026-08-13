import { motion } from 'framer-motion'
import { LADDER, money } from '../data/ladder'

interface Props {
  chainIndex: number // 0 = nothing secured; the RED target rung is LADDER[chainIndex]
  roundPot: number
}

type RungState = 'target' | 'secured' | 'dim'

function Rung({ label, state }: { label: string; state: RungState }) {
  const base =
    'relative grid place-items-center font-display tracking-wide select-none rounded-[50%]'
  const styleByState: Record<RungState, React.CSSProperties> = {
    target: {
      background: 'radial-gradient(ellipse at 50% 30%, #ff5a5a 0%, #d4142a 45%, #8a0a1a 100%)',
      border: '2px solid #ff9a9a',
      boxShadow: '0 0 26px 4px rgba(212,20,42,0.75), inset 0 2px 6px rgba(255,255,255,0.4)',
      color: '#fff',
    },
    secured: {
      background: 'radial-gradient(ellipse at 50% 30%, #e8f0ff 0%, #9fb6d6 38%, #5d7299 100%)',
      border: '2px solid #dfe9f7',
      boxShadow: '0 0 18px 2px rgba(150,190,250,0.5), inset 0 2px 6px rgba(255,255,255,0.6)',
      color: '#11203a',
    },
    dim: {
      background: 'radial-gradient(ellipse at 50% 30%, #5d6b82 0%, #3a465c 45%, #222b3b 100%)',
      border: '2px solid #5a6680',
      boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.15)',
      color: '#b7c2d6',
    },
  }
  return (
    <div
      className={base}
      style={{
        height: 'clamp(28px, 5.2vh, 52px)',
        width: '100%',
        fontSize: 'clamp(14px, 2.4vh, 24px)',
        textShadow: state === 'dim' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
        ...styleByState[state],
      }}
    >
      {/* glossy highlight */}
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-[12%] h-[30%] rounded-[50%]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0))' }}
      />
      <span className="relative">{label}</span>
    </div>
  )
}

/** Vertical ladder: $1,000 at top down to the dynamic BANK pot at the bottom. */
export default function MoneyLadder({ chainIndex, roundPot }: Props) {
  // render top (highest) to bottom (lowest)
  const rungs = [...LADDER].map((value, i) => ({ value, index: i })).reverse()
  const targetIndex = Math.min(chainIndex, LADDER.length - 1)

  return (
    <div className="flex h-full flex-col justify-between gap-[0.6vh] py-1">
      {rungs.map(({ value, index }) => {
        let state: RungState = 'dim'
        if (index === targetIndex) state = 'target'
        else if (index < chainIndex) state = 'secured'
        return (
          <motion.div
            key={value}
            animate={state === 'target' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: state === 'target' ? Infinity : 0, repeatDelay: 0.4 }}
          >
            <Rung label={money(value)} state={state} />
          </motion.div>
        )
      })}
      {/* BANK rung shows the running pot */}
      <div className="mt-[0.4vh]">
        <div
          className="relative grid place-items-center rounded-[50%] font-display"
          style={{
            height: 'clamp(34px, 6vh, 62px)',
            background: 'radial-gradient(ellipse at 50% 30%, #cfdaee 0%, #8ea2c2 40%, #4a5b78 100%)',
            border: '2px solid #e6eefc',
            boxShadow: '0 0 22px rgba(150,190,250,0.45), inset 0 2px 6px rgba(255,255,255,0.6)',
            color: '#0e1c34',
          }}
        >
          <div className="relative flex flex-col items-center leading-none">
            <span style={{ fontSize: 'clamp(15px, 2.6vh, 26px)' }}>{money(roundPot)}</span>
            <span style={{ fontSize: 'clamp(10px, 1.6vh, 15px)', letterSpacing: '0.15em' }}>BANK</span>
          </div>
        </div>
      </div>
    </div>
  )
}
