# STATUS - niche-command-center

## Now
- Question bank replaced and shipped: 495 questions written in the real show's voice.
  Verified end-to-end (typecheck, build, dev server, 600-draw game-loop sim).
- **Live in production:** https://niche-command-center-weakest-link.vercel.app
  (Vercel project `niche-command-center-weakest-link`; deploy with `npx vercel --prod`.)

## Next
- Play a real game night; note any question that lands badly (too easy/hard/ambiguous)
  and cut it from `src/data/questions.ts`.
- Consider more wordplay-link questions - the most distinctive Weakest Link device,
  currently the scarcest at 17 of 495.

## Blocked
- **This project has never been committed to git.** It lives in the HQ repo (not a nested
  repo, not gitignored) but has no history, so there is no undo for any change here -
  including the old 344-question bank, which is gone. Needs a first commit.

## Log
- 2026-07-16 - Deployed the new bank to Vercel production
  (https://niche-command-center-weakest-link.vercel.app). Verified live: bundle serves all
  495, `Internet & Gaming` present, old questions gone. Note: `vercel --prod` exits with a
  `spawn UNKNOWN` telemetry error on this machine AFTER the deploy succeeds - ignore it and
  check `vercel ls` / the live URL rather than trusting the exit code.
- 2026-07-16 - Replaced the 344 fifth-grade-level questions with 495 new ones (45 x 11
  categories; added `Internet & Gaming`). Written from research into real NBC episode
  transcripts, not generic trivia: the show's DNA is puzzle-shaped questions, not fact
  recall. Devices used - "In [subject]" setups, letter clues, wordplay links.
  Per Collin: letter clues put the hint LAST ("..., starting with the letter M?") so the
  player hears the question before the help; This-or-That binaries cut entirely (37 of
  them, backfilled with 37 new).
  Difficulty mixed 58/31/11 (gettable/sweat/stumper) - the round's goal is a CHAIN, so
  easy questions are load-bearing.
  Filtering was script-enforced, not eyeballed: caught 22 letter clues whose hint letter
  didn't match the answer, 14 unfinished drafts, plus ambiguous ("football field vs soccer
  pitch") and date-fragile ("most-followed Instagram") questions.
  Review artifact: https://claude.ai/code/artifact/d6aa93d4-04d3-4c59-a5bf-47514b959c02
- 2026-07-10 - Added favicon (public/favicon.svg + favicon-192.png) matching the intro-screen logo; linked in index.html.
- 2026-07-09 - Moved into HQ from Collin's AI Projects; scaffolded status files.
