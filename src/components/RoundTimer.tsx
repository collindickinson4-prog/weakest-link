interface Props {
  seconds: number
  size?: 'md' | 'lg'
}

function fmt(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Brushed silver/blue metallic pill with a beveled M:SS face — the "2:55" emblem. */
export default function RoundTimer({ seconds, size = 'md' }: Props) {
  const danger = seconds <= 10 && seconds > 0
  const dims = size === 'lg' ? { w: 200, h: 84, font: 44 } : { w: 150, h: 62, font: 32 }
  return (
    <div
      className={`relative grid place-items-center rounded-[50%] ${danger ? 'wl-pulse-red' : ''}`}
      style={{
        width: dims.w,
        height: dims.h,
        background: danger
          ? 'radial-gradient(ellipse at 50% 30%, #ff7a7a 0%, #c81f33 60%, #6e0f1c 100%)'
          : 'radial-gradient(ellipse at 50% 30%, #d7e1f0 0%, #93a6c4 45%, #4c5d7a 100%)',
        border: `2px solid ${danger ? '#ffb3b3' : '#e6eefc'}`,
        boxShadow: '0 0 24px rgba(150,190,250,0.4), inset 0 2px 6px rgba(255,255,255,0.6)',
      }}
    >
      <div
        className="pointer-events-none absolute left-[10%] right-[10%] top-[12%] h-[28%] rounded-[50%]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0))' }}
      />
      <span
        className="relative font-display tabular-nums"
        style={{
          fontSize: dims.font,
          color: danger ? '#fff' : '#0e1c34',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
          lineHeight: 1,
        }}
      >
        {fmt(Math.max(0, seconds))}
      </span>
    </div>
  )
}
