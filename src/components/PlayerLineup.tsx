import { useGame, selectActive } from '../store/gameStore'
import { money } from '../data/ladder'
import Avatar from './Avatar'

interface Props {
  onPick?: (id: string) => void
  compact?: boolean
}

/** Strip of all active contestants (photo-2 style), highlighting whose turn it is
 *  and showing each player's personal banked total this round. */
export default function PlayerLineup({ onPick, compact = false }: Props) {
  const active = useGame(selectActive)
  const currentId = useGame((s) => s.currentPlayerId)
  const stats = useGame((s) => s.roundStats)
  // auto-compact with a big roster so the strip never collides with the corner timer
  const size = compact || active.length > 6 ? 56 : 76

  return (
    <div className="flex flex-wrap items-end justify-center gap-3">
      {active.map((p) => {
        const isCurrent = p.id === currentId
        const banked = stats[p.id]?.banked ?? 0
        return (
          <button
            key={p.id}
            onClick={() => onPick?.(p.id)}
            className={`group flex flex-col items-center gap-1 rounded-xl px-2 py-1 transition ${
              onPick ? 'cursor-pointer hover:bg-white/10' : 'cursor-default'
            }`}
          >
            <div
              className={`rounded-full transition ${isCurrent ? 'ring-4 ring-wl-cyan' : ''}`}
              style={isCurrent ? { boxShadow: '0 0 26px rgba(127,220,255,0.8)' } : undefined}
            >
              <Avatar photo={p.photo} name={p.name} size={size} pos={p.photoPos} />
            </div>
            <span
              className={`font-cond text-sm uppercase tracking-wide ${
                isCurrent ? 'text-wl-cyan' : 'text-white/70'
              }`}
            >
              {p.name}
            </span>
            <span className="font-display text-xs text-amber-300">{money(banked)}</span>
          </button>
        )
      })}
    </div>
  )
}
