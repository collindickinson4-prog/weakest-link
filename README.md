# The Weakest Link — Party Edition

A TV-friendly app that runs the game show *The Weakest Link* for you and your friends:
ESPN-style player intros, the money ladder with banking, a round timer, the statistical
Strongest/Weakest Link reveal, voting, an elimination, and the final head-to-head — all
controlled by you (the host) from one screen.

Local use only. Original art and audio (no copyrighted show assets).

## First time setup (once)

1. Install **Node.js** (LTS) from <https://nodejs.org> — just click through the installer.
2. Double-click **`Weakest Link.bat`**. The first run installs everything (one minute), then
   launches the game and opens your browser. Press **F11** for fullscreen on the TV.

After that, every game night is just: **double-click `Weakest Link.bat`**.

> Prefer the terminal? Run `npm install` once, then `npm run dev`.

## How to play / host

1. **Set Up** — add each player's photo, name, optional nickname, and their strengths &
   weaknesses. Drag order with the ↑/↓ arrows (line order = answering order). Click **Build Game**.
2. **Intros** — step through each player's poster with **Next**.
3. **Round** — press **Start the Clock**, then judge each answer:
   - **C** = correct (climbs the money ladder)
   - **X** = wrong (breaks the chain, loses unbanked money)
   - **B** = bank (locks the chain value into the pot, resets the chain)
   - **Space** = pause/resume · **Ctrl+Z** = undo · **Enter** = start the clock
   - The red rung is the next-correct target; the bottom **BANK** oval shows the running pot.
4. **Statistics** — see each player's totals, then reveal the Strongest & Weakest Link.
5. **Vote** — tap each player's choice, reveal the tally, then the elimination.
6. Repeat until two players remain → **Head-to-Head** (5 questions each, sudden death) → **Winner**.

## Notes

- Money accumulates into one **grand total**; the winner takes the whole bank.
- Your roster and settings are saved in the browser between sessions.
- Add or edit questions in `src/data/questions.ts` (format: `{ question, answer, category }`).
- Adjust round time on the Setup screen.

## Tech

Vite + React + TypeScript, Tailwind CSS, Framer Motion, Zustand. Audio is synthesized with the
Web Audio API; the announcer uses the browser's Web Speech voice.
