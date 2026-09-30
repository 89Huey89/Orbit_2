# What a run actually measures

[PROGRESSION.md](PROGRESSION.md) says the observation ledger's thresholds must be read off the
simulation rather than guessed at, and [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) carries them as newly
open. This file is the first reading. It records what `scripts/probe.mjs` measures, how far that
measurement can be trusted, and the one number the whole eight-era ladder now has to answer for.
It changes no decision in any other document; it only puts numbers where those documents left
blanks, and names the question those numbers raise.

## Why the suite's own pilot could not answer this

`scripts/verify.mjs`'s tangent-seeking pilot releases on the frame its own oracle first reports a
clean transfer. Flown to death rather than to row 48, that pilot reaches **row 437 in fifteen
minutes without dying**, which tells us nothing about the length of a run a person plays and quite a
lot about how flat the escalation curves are past the point anybody reaches — the second finding
below. The pilot is not a player and was never built to be one; it is a correctness instrument, and
`verify.mjs` is right to keep it.

`scripts/probe.mjs` is that same pilot with one faculty removed. It commits to a release the instant
the oracle likes the shot, and the release itself lands a set number of milliseconds later, by which
time the orbit has carried the heading off the line it aimed at. Everything else — the ink refusal,
the row preference, the patience rule — is the suite's own pilot unchanged.

**The model's honest limits.** Lateness is only half of a hand's error: a player who anticipates is
also sometimes *early*, which this cannot represent, so any single lateness reads as the pessimistic
end of the hand it stands for. And the scale saturates — past about 16 ms every hand has stopped
landing perfect transfers altogether and falls back on the same patience rule, so the rungs below
that are one regime, not a gradient. What the probe measures well is the boundary between those two
regimes and the shape of the saturated one; what it cannot do is rank two mediocre hands.

## The calibration

One real data point anchors this: the author reports ordinarily reaching **about row 20**. The
16–25 ms hands give a median of row 16, with 39–43 % of runs reaching row 20 — the closest match on
the ladder, and the reason those rows are read as the human ones below. It is one data point from
one player, and every conclusion here is only as good as that anchor.

## What a typical run is

150 seeds per hand, patience 1.5 turns, cut off at row 120 or 300 s.

| hand | row p10 | median | p90 | captures | seconds | reach r20 | reach r40 | ledger |
|---|---|---|---|---|---|---|---|---|
| oracle | 120 | 120 | 120 | 98 | 226 | 100 % | 99 % | 72 |
| 4 ms | 14 | 31 | 55 | 22 | 58 | 79 % | 28 % | 15 |
| 8 ms | 10 | 26 | 54 | 18 | 52 | 71 % | 21 % | 12 |
| **16 ms** | 7 | **16** | 38 | **11** | **35** | **43 %** | 8 % | **7** |
| **25 ms** | 7 | **16** | 40 | **10** | **35** | **39 %** | 13 % | **7** |
| 40 ms | 5 | 13 | 29 | 8 | 28 | 26 % | 3 % | 6 |
| 100 ms | 2 | 10 | 23 | 8 | 23 | 15 % | 0 % | 7 |

`ledger` is the run's whole observation total. **The table above was measured under the older
`0.35 + 0.65 × documented`.** [JOURNEY.md](JOURNEY.md) §1.4 has since retired both the floor and the
quality term, so a run's knowledge is now the observed fraction alone. Re-measured under that
formula, the same hands bank:

| hand | knowledge p10 | median | p90 | mean per encounter |
|---|---|---|---|---|
| oracle | 52 | 58 | 64 | 0.60 |
| 4 ms | 4 | 10 | 23 | 0.50 |
| **16–25 ms (human)** | **3** | **5** | **13** | **0.44** |
| 100 ms | 2 | 5 | 10 | 0.58 |

Retiring the floor cost roughly 30 % of the yield. The row depths, capture counts and death causes
are unchanged by the formula — only the knowledge columns move. Re-run either shape with
`--floor` and `--span`.

**The release window is about one frame wide.** This was found by accident and is the most
load-bearing thing here: a pilot that decides and lets go in the same frame survives to the cap,
and the *same* pilot costed a single 8 ms frame collapses to a median of row 26. Every failure
follows from there — 57–80 % of runs die by leaving the star chart, not by the darkness catching up.
Whatever else the era work does, it must not narrow that window further, and the reveal's own
checkpoint tuning (Stage 1) should be checked against it rather than against the oracle.

## The number the ladder has to answer for

Spread a finite eight-era ladder evenly across the run it is actually flown in:

| hand | ledger per era | captures per era | seconds per era |
|---|---|---|---|
| oracle | 9.0 | 12.3 | 28 |
| 8 ms | 1.5 | 2.3 | 6 |
| **16–25 ms (human)** | **0.9** | **1.3** | **4** |

**A century would be on screen for about four seconds, and would be armed by roughly one capture.**
Since a single capture banks between 0.35 and 1.0, a threshold low enough to fit eight eras into a
median run is a threshold barely distinguishable from "every body you land on turns the page" — and
[OVERVIEW.md](OVERVIEW.md)'s own cost model prices an era at a signature sheet, a reveal
implementation and a tool geometry each.

The inverse setting is no better. A threshold generous enough that an era is worth its own art —
say 9 ledger, the oracle's own per-era share — puts era III out of reach of well over half of all
runs, and eras V through VIII out of reach of essentially all of them.

**And the two ends are a factor of ten apart.** A median run banks 7; the oracle banks 72 on the
same constants. No single set of thresholds serves both: tuned to the median, a strong run finishes
the whole of human history inside its first minute and spends the rest of a fifteen-minute run in
endless mode; tuned to a strong run, the median player never leaves antiquity. This is the real
tension the ledger's constants have to resolve, it is not resolved anywhere in the plan, and it is
now measurable rather than arguable.

Nothing here says the ladder is wrong. It says the ladder's shape — eight eras, finite, climbed
within a single run, each era carrying a sheet's worth of art — has a pacing problem that has to be
answered before that art is commissioned, and it names the axes an answer could move along: fewer
eras per run, eras that persist across runs, thresholds that scale with the hand actually playing,
or a run that is simply much longer than it is today.

**Resolved, on the second axis.** [JOURNEY.md](JOURNEY.md) takes the ladder out of the single run
entirely: knowledge persists, a run starts at the frontier it left off at, and an era is climbed over
about five runs rather than four seconds. The whole table above is therefore a record of the problem
that forced that decision, not a live constraint — the four-seconds-per-century arithmetic only ever
applied to a ladder that had to fit inside one run. What survives from it into the new design is the
factor-of-ten spread, which stops being a contradiction to resolve and becomes the mechanism by which
skill shortens the climb.

## The second finding, in passing

The oracle surviving to row 437 is direct evidence for
[IMPLEMENTATION.md](IMPLEMENTATION.md)'s Stage 7 claim that the escalation curves are already flat.
They are: a hand good enough not to mistime a release is never afterwards threatened by anything the
chart generates. Endless mode is not "lift the chapter cap" — the curves under it have to be written.

## Running it again

```
node scripts/probe.mjs                                  # the table above
node scripts/probe.mjs --seeds=300 --patience=1.0       # more seeds, a hastier hand
node scripts/probe.mjs --json                           # the same, for a spreadsheet
```

`--seeds`, `--patience` (turns held before settling for any transfer), `--rows` and `--seconds` (the
cut-offs) and `--json`. The probe makes no assertions and is not run by `npm test`; it prints numbers
to read. The ledger constants it reads the curve against are at the top of the file and are meant to
be edited when those constants move.

## The second reading: a hand that errs both ways, and the release grace

The lateness model above is never early, so it cannot say what a grace either side of a tap is worth.
The probe's default hand is now a *spread* hand (`--model=late` still flies the first reading's). It
reads the guide over the next six tenths of a second of orbit, exactly as the drawn ticks and perfect
arcs show it to a player, and aims at the middle of a perfect band. If no band has at least one σ of
room before a miss, it takes the middle of the widest landing on offer instead. It then lets go with a
Gaussian error of σ either side. Releases still land only on the 120 Hz simulation tick.

That reading found the shape of the problem the first one could only see the edge of. A perfect band
is where the flight skims the rim, so it sits on the edge of the landing window and one side of it is
a miss. At depth the band is a single tick wide. A hand with *no* timing error, held to the tick grid
alone, reached only a median of row 25 without the grace.

60 seeds per hand, patience 1.5 turns, cut off at row 120 or 300 s. Each cell reads median row (p90),
then the share reaching rows 20 and 40, then the share of landings that were perfect transfers.

| hand | no grace | ±12 ms (shipped) | ±20 ms |
|---|---|---|---|
| σ 0 | 25 (49) · 70 % · 20 % · 89 % | 120 (121) · 100 % · 97 % · 98 % | 120 (121) · 100 % · 97 % · 99 % |
| σ 10 ms | 15 (29) · 37 % · 3 % · 72 % | 65 (120) · 88 % · 68 % · 91 % | 120 (121) · 98 % · 92 % · 97 % |
| **σ 20 ms** | **18 (40) · 45 % · 10 % · 50 %** | **26 (54) · 67 % · 17 % · 79 %** | 38 (111) · 85 % · 48 % · 92 % |
| σ 30 ms | 13 (29) · 32 % · 0 % · 44 % | 21 (40) · 57 % · 10 % · 69 % | 23 (69) · 63 % · 20 % · 84 % |
| σ 45 ms | 10 (25) · 23 % · 0 % · 35 % | 13 (28) · 28 % · 2 % · 66 % | 18 (38) · 43 % · 5 % · 77 % |
| σ 70 ms | 8 (16) · 5 % · 0 % · 34 % | 8 (19) · 8 % · 0 % · 53 % | 9 (23) · 20 % · 0 % · 64 % |

σ 20 ms without the grace is the row that matches the author's "about row 20", so it is read as the
human hand. The grace was chosen against targets set before it was measured. At the human hand the
median should rise from about row 18 into the low-to-mid twenties, not past 40. The share reaching row
40 should rise from about 10 % to 15–20 %. Imprecise hands (45 ms and worse) should barely move, since
the grace forgives a device's noise and not a player's error. ±12 ms meets all three. ±20 ms
overshoots at the human hand (median 38, 48 % reaching row 40). A ±20 ms grace that only rescued
misses, never upgrading a landing to a perfect one, overshot as well (median 36, 43 % reaching row 40),
because misses are what end runs.

**What the grace does not fix.** Missed landings and a dry nib still account for more than nine
deaths in ten at every hand, and a hand precise enough to use the grace fully (σ 10 ms) now often
reaches the cap. That is the escalation curve being flat past row 24, which the first reading already
named. A fair release makes that flat curve the next thing a strong player meets, and it is the next
thing to write.

```
node scripts/probe.mjs --seeds=60 --rows=120 --seconds=300 --grace=0      # before the grace
node scripts/probe.mjs --seeds=60 --rows=120 --seconds=300                # as shipped
node scripts/probe.mjs --model=late                                       # the first reading's hand
```

### The grace by pressure

The grace is now set per pressure (`RELEASE_GRACE_BY` in `src/plates.js`), and the probe flies a
pressure's real multipliers with `--pressure=relaxed|classic|hardcore`. Same seeds and cut-offs as
above. Each cell reads median row (p90) · share reaching row 20 · share reaching row 40.

| hand | Tiro, no grace | Tiro ±20 ms | **Tiro ±30 ms (shipped)** | Tiro ±45 ms | **Adeptus ±12 ms** | **Magister, none** |
|---|---|---|---|---|---|---|
| σ 20 ms | 17 (33) · 45 % · 2 % | 50 (120) · 78 % · 60 % | 97 (121) · 92 % · 78 % | 120 · 98 % · 95 % | 26 (54) · 67 % · 17 % | 17 (30) · 40 % · 2 % |
| σ 30 ms | 15 (25) · 33 % · 2 % | 24 (45) · 68 % · 18 % | 34 (89) · 75 % · 45 % | 78 (120) · 88 % · 73 % | 21 (40) · 57 % · 10 % | 13 (27) · 30 % · 0 % |
| σ 45 ms | 12 (24) · 20 % · 0 % | 20 (39) · 52 % · 7 % | 23 (52) · 62 % · 20 % | 34 (102) · 80 % · 42 % | 13 (28) · 28 % · 2 % | 10 (24) · 20 % · 0 % |
| σ 70 ms | 8 (22) · 10 % · 0 % | 10 (26) · 23 % · 3 % | 14 (34) · 30 % · 3 % | 16 (37) · 35 % · 8 % | 8 (19) · 8 % · 0 % | 8 (16) · 2 % · 0 % |

**Without a grace, the pressures barely differed.** Ungraced Tiro reached a median of row 17 at the
human hand, Adeptus 18 and Magister 17. Their other multipliers (a slower or faster dark, a cheaper or
dearer nib, wider bands on Tiro) act on losses that end few runs, while missed landings end most of
them. The grace acts on exactly that loss, so it is now the lever that actually separates the three.

Tiro's ±30 ms roughly doubles a beginner's run (σ 45 ms: row 10 → 23, and 62 % now reach row 20),
where ±20 ms moved it much less and ±45 ms made even a middling hand nearly unending. It also carries a
strong hand a long way, which is what the easiest pressure is for. Magister with no grace plays as the
game did before the grace existed, with its harsher dark and nib on top.

## The third reading: the ladder with the signature feats

*2026-09-30.* A century is left only once its chapters stand and its own signature feat has been flown on
it in a Journey run (JOURNEY.md §9, `SIGNATURES` in `src/centuries.js`). The ladder of stage 6 was read on
knowledge alone, so it could not say what the feats cost. `probe.mjs --ladder` now asks both. It reads
each feat off the game's own detectors, which it cuts out of `src/` by name rather than copying, and it
flies three charts per seed: the atlas's, the Rock's, and the Lens's, whose registers each buy a breath of
grace from the dark.

**The plain pilot never flies Linea Pura.** It never leaves the main line for a figure's stars (they are
`gold` bodies), so it had never completed a constellation at all. Era V is therefore flown by a hand that
goes after a clean figure. It aims for the figure's entry and stars on perfect transfers only, and only
with a σ of room beside the band. With such a body in reach, it circles for the next window instead of
landing roughly, until its patience runs out. Every landing on the figure's route counts, the entry on the
main line included: one rough one spoils the figure (`route.pure` in `simulation.js`). That hand survives
about as deep as the plain one (median row 27 against 29 at σ 20 ms), so going for the feat costs a run
little.

40 runs per hand on each chart, 400 players, era threshold 50 as shipped, default pressure, endless driver
on. The first block is the share of runs on each century's chart that fly its feat.

| hand | I | II | III | IV | V | VI | VII | VIII |
|---|---|---|---|---|---|---|---|---|
| σ 10 ms | 100 % | 98 % | 93 % | 93 % | 80 % | 75 % | 100 % | 95 % |
| σ 20 ms | 100 % | 83 % | 83 % | 75 % | 20 % | 53 % | 100 % | 98 % |
| σ 30 ms | 98 % | 93 % | 85 % | 83 % | 10 % | 40 % | 98 % | 100 % |
| σ 45 ms | 98 % | 73 % | 53 % | 53 % | 0 % | 15 % | 93 % | 83 % |
| σ 70 ms | 90 % | 63 % | 20 % | 33 % | 0 % | 3 % | 75 % | 80 % |

Runs each century holds a player for with the feats. The last two columns compare the whole climb with
and without them; "done" is the share of players who climb all eight within 400 runs.

| hand | I | II | III | IV | V | VI | VII | VIII | climb | done | on knowledge alone |
|---|---|---|---|---|---|---|---|---|---|---|---|
| σ 10 ms | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 2 | 16 | 100 % | 16 |
| σ 20 ms | 4 | 4 | 4 | 4 | 5 | 4 | 4 | 4 | 35 | 100 % | 33 |
| σ 30 ms | 5 | 5 | 5 | 5 | 7 | 5 | 5 | 5 | 44 | 100 % | 40 |
| σ 45 ms | 7 | 7 | 7 | 7 | — | — | — | — | — | **0 %** | 60 |
| σ 70 ms | 11 | 10 | 11 | 11 | — | — | — | — | — | **0 %** | 82 |

**At the author's hand the feats cost little.** Six of the eight are flown in most runs, so they cost a
century nothing beyond its chapters. The climb grows by two runs at σ 20 ms and four at σ 30 ms, nearly
all of it in era V. §1.6's shape (about five runs a century, about forty for the ladder) holds, and
`ERA_THRESHOLD` does not need to move for it.

**Linea Pura is a wall for a rough hand.** A clean figure takes four perfect landings in a row: the entry
and the three stars. Below about σ 30 ms that almost never happens. At σ 45 ms and σ 70 ms not one of the
40 runs flew it, so no player climbed past era V in the table. Read again on 200 further seeds with the
figure-seeking hand, σ 45 ms flew it in 5 runs (2.5 %) and σ 70 ms in none. At σ 45 ms that is a stall
rather than a wall: about forty runs in era V for the feat alone, against seven for its chapters. At
σ 70 ms it is a wall: under 1.5 % a run, if at all. The Rock's
Struck Ring and the Flyby's Gravity Assist are the opposite case: nearly free, because the pilot always
holds a sling body to full charge anyway. They read as an upper bound, since a player who lets go early
would miss them. Saturn in One Sitting (VI) is the next hardest (3 % of runs at σ 70 ms) but still passes
within the cap.

What this measures and what it does not:

- It models only a hand that goes after the figure. A player who never tries will never fly Linea Pura,
  and the leaf names the feat so that they do.
- The turn still comes between runs. The game now turns the page inside a run (stage 5), so a run that
  became ready early and flew on is counted here as one more run in the century it left.
- The feats of centuries II, III, IV, VII and VIII are read off the same atlas flight. That is correct
  for every century whose simulation is the atlas's, and each century keeps its own run state.

```
node scripts/probe.mjs --ladder --seeds=40                    # the tables above, one process
node scripts/probe.mjs --ladder --seeds=40 --hands=20         # one hand; fly several side by side
```
