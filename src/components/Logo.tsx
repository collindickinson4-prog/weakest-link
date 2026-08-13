interface Props {
  size?: number
}

/** Recreated WEAKEST LINK wordmark: metallic blue beveled type with an atom/orbit ring
 *  and a radial starburst behind it. Original art (no trademarked logo files). */
export default function Logo({ size = 1 }: Props) {
  return (
    <div
      className="pointer-events-none relative grid place-items-center"
      style={{ transform: `scale(${size})` }}
    >
      {/* radial starburst */}
      <div
        className="absolute"
        style={{
          width: 720,
          height: 720,
          background:
            'repeating-conic-gradient(from 0deg at 50% 50%, rgba(120,180,255,0.12) 0deg, rgba(120,180,255,0.12) 4deg, transparent 4deg, transparent 12deg)',
          maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
          animation: 'spin 60s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* orbit ring */}
      <div
        className="absolute rounded-full"
        style={{
          width: 460,
          height: 320,
          border: '4px solid rgba(150,210,255,0.7)',
          boxShadow: '0 0 30px rgba(80,160,255,0.6), inset 0 0 30px rgba(80,160,255,0.3)',
          transform: 'rotate(-18deg)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          width: 360,
          height: 420,
          border: '2px solid rgba(150,210,255,0.35)',
          transform: 'rotate(22deg)',
        }}
      />

      {/* wordmark */}
      <div className="relative grid place-items-center leading-[0.82]">
        <span className="wl-metal font-display" style={{ fontSize: 92 }}>
          WEAKEST
        </span>
        <span className="wl-metal font-display" style={{ fontSize: 116 }}>
          LINK
        </span>
      </div>

      <style>{`
        .wl-metal {
          background: linear-gradient(to bottom, #eaf3ff 0%, #bcd6ff 18%, #4f8fe0 52%, #2a5fb0 60%, #87b6f0 78%, #e8f2ff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: 0.02em;
          filter: drop-shadow(0 3px 4px rgba(0,0,0,0.6));
          -webkit-text-stroke: 1.5px rgba(10,30,70,0.6);
        }
      `}</style>
    </div>
  )
}
