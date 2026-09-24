# The Ceiling · overhaul plan

Era II ships as a playable preview (`src/ceiling.js`), and on the phone it reads as beige graph paper
with a game on top rather than as Egypt. This file is the plan agreed on 2026-09-23 to change that
in art, HUD and play. It is live work, not archive: it is separate from the eight-era progression,
and nothing here builds toward that ladder. Era II stays a standalone door on the frontispiece that
keeps its own record.

The mockups the direction was chosen from are an artifact outside the repo; what they decided is
recorded here so the repository does not depend on them.

## What was measured

Flown at 430×932 by a pilot built on `world.aim()` (the same one `scripts/probe.mjs` flies):

- **The ground is a notebook.** A red canon grid runs across the whole play channel, with grey
  plaster-loss blotches over it. At phone size that reads as squared paper.
- **The colour has gone out of it.** Lapis, gold, carnelian and faience appear only as thin strips;
  the barque is the one coloured thing on the sheet.
- **The frame is noise.** Two columns of grey star rosettes read as thorn hedges, and the kheker
  frieze runs behind the score and collides with it.
- **The HUD leaks the atlas.** `ANGULUS +10` is the atlas's Latin (`src/ui.js`'s gain line), the
  floating captions overlap one another (`DECAN COURSE 1/3` over `ANGULUS`), and `WNWT` is a
  transliteration no player can read.
- **Every hour-circle is the same grey wagon wheel**, low in contrast against the plaster.
- **No rule is Egyptian.** The four watches are the atlas's four chapters re-captioned.

## Decisions

1. **Art: direction C, Nut's body.** The sky goddess arches over the phone as the frame: her
   star-covered body forms the top and both sides, the HUD sits inside the arch, the ground inside
   her is night lapis with a sparse field of five-pointed stars, and the hour-circles become gold
   discs that hold contrast on blue. The rising dark becomes the waters of Nun climbing in water
   zigzags; Geb lies green along the foot. The sun is swallowed at her mouth at dusk and born at her
   thighs at dawn, which is the run's own arc.
2. **Accuracy: Egypt as a whole, credited honestly.** The strict TT353-only rule of
   `archive/eras/02-ceiling.md` (light plaster, no blue ground, no Nut arch) is lifted for this sheet.
   It now draws on the New Kingdom repertoire at large — the Book of Nut (Seti I's cenotaph at
   Abydos, Ramesses IV), the blue star ceilings of the Ramesside tombs (KV17), the Amduat — and the
   frontispiece and colophon say which source each element comes from, as they do today for TT353.
   The research and traced marks already in the code (decan columns, the vocabulary table, the
   figures in `src/figures-tt353.js`) are kept and reused, not thrown away.
3. **Play: G1, the twelve hours of the night.** The four watches become the Amduat's twelve hours.
   Each hour ends at a pylon gate the barque passes through, and each hour carries its own name and
   colour. Surviving the twelfth hour is **sunrise**: the barque becomes Khepri pushing the sun, and
   the run ends as a win — the one ending the atlas does not have. G2 (Eye of Horus combo), G3 (Ma'at's
   feather) and G4 (Apep who moves, special nodes) are not in scope unless asked for later.
4. **Pace: phase by phase**, each phase checked at 430×932 and shown before the next one starts.

## Phases

Status (2026-09-23): all five phases are built on `claude/egyptian-deck-overhaul-7aj1yi`; the sound
is a harp, a frame drum, water and the sistrum on one D pentatonic scale, and the capitals are set in
Limelight. The hour is three rows and dawn is row thirty-six, read off `scripts/probe.mjs`:
a hand releasing 16 ms late reaches row thirty in about a fifth of runs, so the dawn is an achievement
without being out of reach. Sunrise ends the run as a win (`goalRow` on `OrbitWorld`, the `sunrise`
event), not a lap.

| Phase | What | Notes |
| --- | --- | --- |
| 1 · Clean-up | Latin leaks out of the Ceiling's captions; floating captions stop overlapping; score clear of the frieze; the canon grid out of the play channel | Independent of direction; removes most of the "basic" feel on its own |
| 2 · Look | Nut's body as frame, lapis ground and star field, gold hour-discs, Nun's waters as the dark, Geb at the foot, the frontispiece redrawn in the same hand | The wall bake (`ceilingBakeWall`) and the frame painters are replaced, not layered over |
| 3 · HUD | Score in a cartouche with Egyptian numerals and the number small beneath; a row of twelve hour-stars in the arch; stela-shaped end leaf | Needs phase 2's palette |
| 4 · Play | Twelve hours with pylon gates; sunrise as a win state | Touches `simulation.js`: new state, `verify.mjs` coverage, replay safety, and the plate-gating so the atlas is unchanged |
| 5 · Sound | Harp or lyre for captures, sistrum and frame drum at the gates, a sunrise chord | Through `defineHand('ceiling', …)` and `audio.js`'s existing voices |

## Open questions for phase 4

- **Is sunrise the end of the run, or a lap?** A win that ends the run is the clean reading of the
  myth; a lap (dawn, then night again, faster) keeps it an endless arcade game. The default is a
  win, with the score and time recorded.
- **How long is an hour?** Today a watch is eight rows (`ceilingWatch()`), so four watches are 32
  rows. Twelve hours at eight rows is 96 rows, which few hands reach (`scripts/probe.mjs`). Hours of
  three or four rows keep dawn reachable; the probe should settle the number.
