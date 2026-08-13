# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**The Weakest Link — Party Edition**: a host-controlled React + TypeScript + Vite web app
that runs the game show for a room of friends. One person (the host) drives everything from
a single screen — there are no player devices, no answer matching, and no server. The host
judges every answer by ear and presses a key.

Local-first: it runs from `npm run dev` on the host's laptop, plugged into a TV. It is also
deployed to Vercel so it can be opened from any browser.

All art and audio are original. No copyrighted show assets are used — sound effects are
synthesized live with the Web Audio API and the announcer is Web Speech (`src/audio/audio.ts`).

---

## Commands

```bash
npm install              # once
npm run dev              # Vite dev server, opens the browser automatically
npm run build            # tsc -b && vite build  -> dist/
npm run preview          # serve the production build locally
npx vercel --prod        # deploy to production
```

Non-technical entry point: double-clicking `Weakest Link.bat` installs deps on first run,
then launches `npm run dev`. Don't break that script — it is how the game actually gets
started on game night.

**Always run `npm run build` before claiming a change works.** `tsc -b` is part of the build,
so it is the typecheck too. There is no test suite.

---

## Architecture

Everything is client-side. There is no backend, no API, and no network dependency at runtime
other than the Google Fonts link in `index.html`.

```
src/
  main.tsx              Entry. Reads ?display to decide host app vs audience app.
  App.tsx               Host app. Phase switch + corner controls (display / mute / fullscreen).
  AudienceApp.tsx       Read-only mirror app for the second screen.
  store/gameStore.ts    Zustand store. ALL game state and every rule lives here.
  data/questions.ts     The question bank (QUESTIONS) + CATEGORIES.
  data/ladder.ts        Money ladder + securedValue/targetValue/money helpers.
  data/quips.ts         Host one-liners.
  audio/audio.ts        AudioManager singleton — Web Audio SFX + Web Speech announcer.
  lib/displaySync.ts    BroadcastChannel bridge, host window -> audience windows.
  lib/useHotkeys.ts     Keyboard binding hook.
  components/           Screens (one per phase) + shared UI.
  components/audience/  Audience-window counterparts of the screens.
```

### The store is the single source of truth

`src/store/gameStore.ts` (~630 lines) holds the entire game: roster, round state, stats,
votes, finalists, and undo history. Components read via `useGame(...)` selectors and call
actions — they do not compute game rules themselves. **Put new rules in the store, not in a
component.**

Game flow is a `Phase` enum, and `App.tsx` is a switch over it:

```
title -> setup -> intro -> round -> roundStats -> voting -> elimination -> (round | final) -> winner
```

### Undo

`correct` / `wrong` / `bank` push a `ScoreSnapshot` onto `history` before mutating. `undo()`
pops it. If you add an action that changes score, chain, pot, stats, or the drawn question,
it must push a snapshot too — otherwise Ctrl+Z silently corrupts the game mid-round.

### Persistence

`zustand/middleware` `persist` with `partialize` saving **only** `players` and `settings`.
Transient game state is deliberately not persisted, so a mid-game reload restarts the game
but keeps the roster. Keep it that way unless asked — a half-restored game is worse than none.

### Audience display

`window.open('?display')` opens a second window that mirrors the host over a same-origin
`BroadcastChannel` (`lib/displaySync.ts`). It is one-way: host broadcasts, audience listens
and applies with `useGame.setState`.

`SHARED_KEYS` is a deliberate allowlist. **`currentQuestion`, `usedQuestionKeys`, and
`history` are intentionally excluded** — the audience must never see the question or the
draw pile. When you add a state field that the audience screen needs, add it to `SHARED_KEYS`;
when you add anything host-secret, leave it out and say so in a comment.

Anything the audience must see also needs its own flag in the store rather than local
component state — `statsRevealed` and `votesRevealed` exist for exactly this reason.

### Hotkeys

`useHotkeys` maps single keys and `ctrl+key` combos, and ignores keystrokes inside
inputs/textareas. Host round controls: `C` correct, `X` wrong, `B` bank, `Space` pause,
`Enter` start clock, `Ctrl+Z` undo.

---

## Question bank

`src/data/questions.ts` — currently **711** questions across 11 categories, written in the
voice of the real show rather than as generic trivia. Read the comment at the top of the file
before adding or editing any; the conventions there are load-bearing:

- `"In [subject], ..."` formal setups.
- Letter clues put the hint **last** (`"..., starting with the letter M?"`) so the player
  hears the whole question before the help.
- Wordplay links connecting two unrelated things.
- Difficulty deliberately mixed roughly 60/30/10 (gettable / sweat / stumper). The goal of a
  round is a **chain**, so easy questions are load-bearing, not filler.
- Every answer must be short and unambiguous. The host judges by ear — there is no string
  matching — so anything with two defensible answers is a bug.
- No date-fragile questions ("most-followed on Instagram").

`pickQuestion` draws at random, excluding `usedQuestionKeys`, and resets the pool when
exhausted. Questions are keyed by their **question text**, so editing a question's wording
resets its used-state.

If you bulk-edit the bank, verify with a script rather than by eye — past passes caught
letter clues whose hint letter didn't match the answer, and unfinished drafts.

---

## Conventions

- Tailwind v4 via `@tailwindcss/vite` — no `tailwind.config.js`; theme lives in
  `src/index.css`.
- `framer-motion` for screen and reveal animation.
- Styling is TV-first: large type, high contrast, designed to be read from a couch at
  1080p fullscreen. Don't optimize for mobile.
- Player photos are stored as data URLs inside the persisted store. Keep them small.

---

## Deployment

Vercel project `niche-command-center-weakest-link` (linked via `.vercel/`, which is
gitignored). Production: <https://niche-command-center-weakest-link.vercel.app>

Known local quirk: `vercel --prod` can exit with a `spawn UNKNOWN` telemetry error on this
machine **after** the deploy has already succeeded. Don't trust the exit code — check
`vercel ls` or the live URL.

GitHub: <https://github.com/collindickinson4-prog/weakest-link>
