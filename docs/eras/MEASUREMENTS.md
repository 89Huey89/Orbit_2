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

`ledger` is the run's whole observation total under `PROGRESSION.md`'s provisional
`0.35 + 0.65 × documented` over a 240° completion arc.

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
