import { useRef } from 'react'
import { useGame, type Player, type PhotoPos } from '../store/gameStore'
import { audio } from '../audio/audio'
import Avatar from './Avatar'
import Button from './Button'

const DEFAULT_POS: PhotoPos = { x: 50, y: 50, zoom: 1 }

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v))
}

/** Circular preview you can drag to frame the face, plus a zoom slider. */
function PhotoAdjuster({ player }: { player: Player }) {
  const updatePlayer = useGame((s) => s.updatePlayer)
  const pos = player.photoPos ?? DEFAULT_POS
  const circleRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startX: e.clientX, startY: e.clientY, ox: pos.x, oy: pos.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !circleRef.current) return
    const size = circleRef.current.offsetWidth
    // dragging the photo right shifts the visible window left (lower x%)
    const dx = ((e.clientX - drag.current.startX) / size) * 100
    const dy = ((e.clientY - drag.current.startY) / size) * 100
    updatePlayer(player.id, {
      photoPos: {
        ...pos,
        x: clamp(drag.current.ox - dx, 0, 100),
        y: clamp(drag.current.oy - dy, 0, 100),
      },
    })
  }
  const endDrag = () => {
    drag.current = null
  }

  const adjusted = pos.x !== 50 || pos.y !== 50 || pos.zoom !== 1

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={circleRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="cursor-grab touch-none active:cursor-grabbing"
        title="Drag to frame the face"
      >
        <Avatar photo={player.photo} name={player.name} size={110} pos={pos} />
      </div>
      <input
        type="range"
        min={1}
        max={3}
        step={0.05}
        value={pos.zoom}
        onChange={(e) => updatePlayer(player.id, { photoPos: { ...pos, zoom: +e.target.value } })}
        className="w-24 accent-wl-cyan"
        title="Zoom"
      />
      <div className="flex gap-2 font-cond text-xs text-white/40">
        <span>drag · zoom</span>
        {adjusted && (
          <button
            onClick={() => updatePlayer(player.id, { photoPos: DEFAULT_POS })}
            className="text-wl-cyan/70 hover:text-wl-cyan"
          >
            reset
          </button>
        )}
      </div>
    </div>
  )
}

function listToText(list: string[]): string {
  return list.join(', ')
}
function textToList(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function PlayerCard({ player, index, total }: { player: Player; index: number; total: number }) {
  const updatePlayer = useGame((s) => s.updatePlayer)
  const removePlayer = useGame((s) => s.removePlayer)
  const movePlayer = useGame((s) => s.movePlayer)
  const fileRef = useRef<HTMLInputElement>(null)

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    // fresh photo starts with a neutral crop
    reader.onload = () => updatePlayer(player.id, { photo: reader.result as string, photoPos: DEFAULT_POS })
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col items-center gap-2">
        {player.photo ? (
          <>
            <PhotoAdjuster player={player} />
            <button
              onClick={() => fileRef.current?.click()}
              className="font-cond text-xs uppercase tracking-wide text-white/50 hover:text-white"
            >
              Change photo
            </button>
          </>
        ) : (
          <button onClick={() => fileRef.current?.click()} title="Upload photo" className="group relative">
            <Avatar photo={player.photo} name={player.name} size={88} />
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-xs font-cond uppercase tracking-wide text-white opacity-0 transition group-hover:opacity-100">
              Upload
            </span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        <div className="flex gap-1">
          <button
            onClick={() => movePlayer(player.id, -1)}
            disabled={index === 0}
            className="rounded bg-white/10 px-2 text-sm disabled:opacity-30"
            title="Move up in line"
          >
            ↑
          </button>
          <span className="grid w-7 place-items-center font-display text-wl-cyan">{index + 1}</span>
          <button
            onClick={() => movePlayer(player.id, 1)}
            disabled={index === total - 1}
            className="rounded bg-white/10 px-2 text-sm disabled:opacity-30"
            title="Move down in line"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-2">
        <div className="flex gap-2">
          <input
            value={player.name}
            onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
            placeholder="Name"
            className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-cond text-lg outline-none focus:border-wl-cyan"
          />
          <input
            value={player.nickname}
            onChange={(e) => updatePlayer(player.id, { nickname: e.target.value })}
            placeholder='Nickname (optional, e.g. "The Closer")'
            className="flex-1 rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-cond outline-none focus:border-wl-cyan"
          />
        </div>
        <input
          defaultValue={listToText(player.strengths)}
          onBlur={(e) => updatePlayer(player.id, { strengths: textToList(e.target.value) })}
          placeholder="Strengths (comma separated, e.g. History, Sports, Quick recall)"
          className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 font-cond text-sm outline-none focus:border-emerald-400"
        />
        <input
          defaultValue={listToText(player.weaknesses)}
          onBlur={(e) => updatePlayer(player.id, { weaknesses: textToList(e.target.value) })}
          placeholder="Weaknesses (comma separated, e.g. Geography, Math under pressure)"
          className="rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2 font-cond text-sm outline-none focus:border-rose-400"
        />
      </div>

      <button
        onClick={() => removePlayer(player.id)}
        className="self-start rounded-lg bg-white/5 px-2 py-1 text-rose-300 hover:bg-rose-900/40"
        title="Remove player"
      >
        ✕
      </button>
    </div>
  )
}

export default function SetupScreen() {
  const players = useGame((s) => s.players)
  const addPlayer = useGame((s) => s.addPlayer)
  const startGame = useGame((s) => s.startGame)
  const settings = useGame((s) => s.settings)
  const updateSettings = useGame.setState
  const setPhase = useGame((s) => s.setPhase)

  const namedCount = players.filter((p) => p.name.trim()).length
  const canStart = players.length >= 2 && namedCount >= 2

  const begin = () => {
    audio.play('reveal')
    audio.startPad()
    startGame()
  }

  return (
    <div className="wl-stage h-full w-full overflow-y-auto wl-scrollbar">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl text-white">Set Up The Contestants</h1>
            <p className="font-cond text-wl-cyan/70">
              Add each player's photo, name, strengths and weaknesses. Line order = answering order.
            </p>
          </div>
          <button onClick={() => setPhase('title')} className="font-cond text-white/50 hover:text-white">
            ← Title
          </button>
        </div>

        <div className="grid gap-3">
          {players.map((p, i) => (
            <PlayerCard key={p.id} player={p} index={i} total={players.length} />
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="ghost" onClick={addPlayer}>
            + Add Player
          </Button>
          <span className="font-cond text-sm text-white/40">{players.length} players</span>
        </div>

        {/* Round settings */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-3 font-display text-2xl text-white">Round Settings</h2>
          <div className="flex flex-wrap gap-6 font-cond">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Round 1 time (seconds)</span>
              <input
                type="number"
                value={settings.startSeconds}
                onChange={(e) => updateSettings((s) => ({ settings: { ...s.settings, startSeconds: +e.target.value } }))}
                className="w-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-wl-cyan"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Less time each round (seconds)</span>
              <input
                type="number"
                value={settings.decrementSeconds}
                onChange={(e) =>
                  updateSettings((s) => ({ settings: { ...s.settings, decrementSeconds: +e.target.value } }))
                }
                className="w-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-wl-cyan"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-white/60">Minimum time (seconds)</span>
              <input
                type="number"
                value={settings.minSeconds}
                onChange={(e) => updateSettings((s) => ({ settings: { ...s.settings, minSeconds: +e.target.value } }))}
                className="w-28 rounded-lg border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-wl-cyan"
              />
            </label>
            <label className="flex items-end gap-2 pb-2">
              <input
                type="checkbox"
                checked={settings.muted}
                onChange={(e) => {
                  audio.setMuted(e.target.checked)
                  updateSettings((s) => ({ settings: { ...s.settings, muted: e.target.checked } }))
                }}
              />
              <span className="text-white/70">Mute all audio</span>
            </label>
          </div>
        </div>

        <div className="mt-8 mb-12 flex items-center justify-center">
          <Button size="lg" onClick={begin} disabled={!canStart}>
            Build Game →
          </Button>
          {!canStart && (
            <span className="ml-4 font-cond text-rose-300/80">Add at least 2 named players.</span>
          )}
        </div>
      </div>
    </div>
  )
}
