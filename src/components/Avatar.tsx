import type { PhotoPos } from '../store/gameStore'

interface Props {
  photo?: string
  name: string
  size?: number
  duotone?: boolean
  className?: string
  pos?: PhotoPos
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase()
}

/** A player photo (or initials fallback) framed in the show's blue ring. */
export default function Avatar({ photo, name, size = 96, duotone = false, className = '', pos }: Props) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: '3px solid #7fdcff',
        boxShadow: '0 0 24px rgba(74,166,255,0.5)',
        background: 'linear-gradient(160deg, #143a78, #0a1f44)',
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="h-full w-full object-cover"
          style={{
            objectPosition: pos ? `${pos.x}% ${pos.y}%` : undefined,
            transform: pos && pos.zoom !== 1 ? `scale(${pos.zoom})` : undefined,
            ...(duotone ? { filter: 'grayscale(1) contrast(1.05) brightness(0.95)' } : undefined),
          }}
        />
      ) : (
        <div
          className="grid h-full w-full place-items-center font-display text-white"
          style={{ fontSize: size * 0.4 }}
        >
          {initials(name)}
        </div>
      )}
    </div>
  )
}
