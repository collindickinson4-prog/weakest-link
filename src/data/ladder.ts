// The classic Weakest Link money chain, in dollars.
// A correct answer advances one rung; banking locks the secured value into the pot
// and drops the chain back to the bottom.

export const CURRENCY = '$'

export const LADDER = [20, 50, 100, 200, 300, 450, 600, 800, 1000] as const

export const LADDER_MAX = LADDER[LADDER.length - 1] // 1000

/** Format a number as a currency string, e.g. 1500 -> "$1,500". */
export function money(value: number): string {
  return CURRENCY + value.toLocaleString('en-US')
}

/**
 * The value SECURED by the current chain position.
 * chainIndex 0 => nothing secured yet (next correct answer wins LADDER[0]).
 */
export function securedValue(chainIndex: number): number {
  if (chainIndex <= 0) return 0
  return LADDER[Math.min(chainIndex, LADDER.length) - 1]
}

/**
 * The value of the NEXT correct answer — the rung that lights up RED on screen.
 * When the chain is maxed out, the next correct answer banks LADDER_MAX automatically.
 */
export function targetValue(chainIndex: number): number {
  return LADDER[Math.min(chainIndex, LADDER.length - 1)]
}
