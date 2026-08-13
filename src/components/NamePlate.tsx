interface Props {
  name: string
  size?: 'sm' | 'md' | 'lg'
  dim?: boolean
}

const sizes = {
  sm: { w: 150, h: 52, font: 20 },
  md: { w: 230, h: 78, font: 30 },
  lg: { w: 340, h: 118, font: 46 },
}

/** The glowing blue lit oval name emblem, like the on-podium "RACHAEL"/"CHRIS" plate. */
export default function NamePlate({ name, size = 'md', dim = false }: Props) {
  const s = sizes[size]
  // shrink type for long names so the whole name fits inside the oval (floor 50%)
  const fontSize = Math.round(s.font * Math.max(0.5, Math.min(1, 10 / Math.max(1, name.length))))
  return (
    <div
      className="relative grid place-items-center select-none"
      style={{ width: s.w, height: s.h, opacity: dim ? 0.55 : 1 }}
    >
      {/* outer glow */}
      <div
        className="absolute inset-0 rounded-[50%]"
        style={{
          boxShadow: '0 0 40px 6px rgba(74,166,255,0.55), inset 0 0 30px rgba(0,0,0,0.5)',
          background:
            'radial-gradient(ellipse at 50% 35%, #4aa6ff 0%, #1d63c0 45%, #0b2c66 78%, #061a3d 100%)',
          border: '3px solid #9fd6ff',
        }}
      />
      {/* glossy top highlight */}
      <div
        className="absolute left-[8%] right-[8%] top-[10%] h-[35%] rounded-[50%]"
        style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(255,255,255,0))' }}
      />
      <span
        className="relative font-display uppercase tracking-wide text-white"
        style={{
          fontSize,
          textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(120,200,255,0.6)',
          lineHeight: 1,
          padding: '0 10px',
          whiteSpace: 'nowrap',
          maxWidth: '92%',
        }}
      >
        {name || '—'}
      </span>
    </div>
  )
}
