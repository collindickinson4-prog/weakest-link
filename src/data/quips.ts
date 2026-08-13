// The host's withering one-liners, grouped by show moment.
// Aimed at the group's performance, never at protected traits — mean, not cruel.

export type QuipMoment =
  | 'roundGood'
  | 'roundBad'
  | 'preVote'
  | 'elimination'
  | 'finalIntro'
  | 'winner'

export const QUIPS: Record<QuipMoment, string[]> = {
  roundGood: [
    'Competence. How refreshingly out of character.',
    "A respectable round. I'll assume it was an accident.",
    'Well, well — signs of intelligent life after all.',
    "Someone here has been reading books. Or guessing extremely well.",
  ],
  roundBad: [
    'That was the fastest anyone has ever lost money without visiting a casino.',
    "I've seen goldfish with better recall.",
    'Whose brain is in airplane mode tonight?',
    'You banked less than a broken vending machine.',
    'If ignorance paid, this would be the richest team in television.',
  ],
  preVote: [
    "Time to point fingers. Finally — something you're all qualified for.",
    'Someone here is dead weight. You know who it is. Vote.',
    "Choose wisely. Or don't — it's funnier for me either way.",
    'The chain is only as strong as its weakest link. Find it.',
  ],
  elimination: [
    'You leave with nothing. Fitting — you contributed nothing.',
    "Don't take it personally. Take it as a unanimous professional opinion.",
    "The exit is behind you. It's the one thing tonight you can't get wrong.",
    'A round of applause? No. Just go.',
  ],
  finalIntro: [
    'Two of you left. Statistically, one of you must be less useless.',
    'Head to head. Do try not to embarrass yourselves simultaneously.',
    'Five questions each. Even you can count that high. Probably.',
  ],
  winner: [
    'Congratulations. Somebody had to win — and against all odds, it was you.',
    'You are the strongest link. Tonight, that was a remarkably low bar.',
    "Take the money. You've earned it... relative to this lot, anyway.",
  ],
}

// avoid handing out the same line twice in a row per moment
const lastPick: Partial<Record<QuipMoment, number>> = {}

/**
 * Pick a quip. Pass a `seed` (e.g. round number, eliminated player id) to get a
 * deterministic pick — the host window and audience display share game state, so
 * the same seed keeps both windows showing (and speaking) the same line.
 */
export function pickQuip(moment: QuipMoment, seed?: string | number): string {
  const pool = QUIPS[moment]
  if (seed !== undefined) {
    let h = 0
    const str = moment + String(seed)
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
    return pool[h % pool.length]
  }
  let idx = Math.floor(Math.random() * pool.length)
  if (pool.length > 1 && idx === lastPick[moment]) {
    idx = (idx + 1) % pool.length
  }
  lastPick[moment] = idx
  return pool[idx]
}
