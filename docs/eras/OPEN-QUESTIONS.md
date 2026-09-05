# Open questions

Decisions the ladder cannot be built without, none of them settled. Each names the tension
honestly rather than pretending there is an obvious answer.

---

## 1. Where does the progression actually happen? *(the big one)*

**The tension, in the author's words:** the Renaissance style is the work that has been put in
and is not to be given up — which it would be if every run started at the beginning of history.
But leaning entirely into unlockables loses the sense of progression *during* a run.

Both halves of that are right, and they pull against each other. A third pressure — whether a score
still means one thing once the dangers differ by era (question 2) — turns out to be what separates
the shapes:

| | Progression during a run | Renaissance keeps its place | Scores stay comparable |
|---|---|---|---|
| **Eras as chapters, gated on rows** | ✅ | ❌ era III is a passing phase | ❌ if the dangers differ |
| **Eras as unlockables** — earned and selected | ❌ nothing changes as you climb | ✅ you start and stay there | ❌ if the dangers differ |
| **Eras as chapters, gated on score** | ✅ | ⚠️ only if the bands are tuned for it | ✅ **by construction** |
| **The run drifts forward from your era** | ✅ | ✅ | ❌ if the dangers differ |

### The strongest shape so far: **the run *is* the progression, gated on score**

The ages are the run. Era boundaries sit at **total-score thresholds**, not at rows and not at
anything the player chooses.

**Why score, specifically, and why this settles the comparability problem.** The era becomes a pure
*function of* the score. Two runs that reached 4,000 have passed through exactly the same eras in
exactly the same order and met exactly the same hazard rosters, whoever flew them. Score means one
thing again, *even though the dangers differ between eras* — which is the thing every other shape
had to give up. Note that row-gating would **not** do this: rows and score decouple, since a careful
player scores more per row than a fast sloppy one, so two runs at the same score could have seen
different centuries. And the difficulty knobs (`DARKNESS_MULT`, `INK_MULT`, `PERFECT_MULT`,
`CAP_MULT`) do not touch score, so it holds across pressures too.

**It also collapses the plan rather than extending it.** The era axis and the chapter axis become one
axis. And the game already has that axis: `chapter = Math.min(3, Math.floor(world.progress/8))` at
`ui.js:346`, with the page turn, the cross-fade, the chapter plates, the announcement and the
ledger's `deepestChapter` all hanging off it. This is a **retarget of a system that exists**, not a
new one — the expression and a threshold table.

**The daily becomes better than it is now.** Fixed to one era per day, filterable by era in the
calendar: the seed and the era are both shared, so it stays comparable, *and* it becomes the way to
spend a whole run inside one century. Extended a little — free play in any unlocked era — it is also
the complete answer to the Renaissance problem below.

#### What it costs, honestly

- **It reverses the concern that opened this question.** Every run now does start at the beginning,
  and era III — where the Fell types, the Latin, the burin, twelve figures, six shipped plates and
  essentially all the existing art live — becomes perhaps a fifth of a run's runtime. This is the
  real price and it should be paid deliberately, not discovered.
- **Weak runs see the least variety.** Score is superlinear in skill, so a strong player may cross
  three eras in ninety seconds while a struggling one never leaves the first. That is the exact
  opposite of who needs variety. The fix is unequal bands: a *tight* first threshold so nobody is
  stranded in antiquity, and a wide era III so the median run lives where the game's art is. Tune the
  bands against the real score distribution rather than spacing them evenly.
- **The six unlockable plates are orphaned.** Cellarius, Verdigris, Foxed, Proof, Carta azzurra and
  Sepia are all *Renaissance* plates. If the eras are the run's spine, a chosen plate would only be
  visible for one band of it. Some generalise as treatments that any century can take — Proof before
  letters is "no captions", Sepia is a duotone — and some do not: Carta azzurra is a specific
  Florentine blue paper and means nothing on a photographic plate. **The catalogue needs a new spine
  under this shape**, and that is unresolved.
- **The cache problem gets worse, not better.** Under every other shape a run sees one or two eras;
  here every run traverses several, so several must be live at once. Prototype that before drawing
  any era's art.
- **One implementation detail worth fixing early:** score can cross a threshold mid-flight. Arm the
  boundary at the threshold and *turn the page at the next capture*, or the century changes while the
  player is between orbits with no say in it.

### A further shape: **the run drifts forward from wherever you stand**

The era you have chosen is the era the run *opens* on, and the chart advances a century or two as
you climb — chapter I on your era, chapter IV two eras later. A player who has chosen the
engraving opens on the engraving every single time and reaches the photographic plate near the
top of a good run. A player who has earned nothing opens on the engraving and stays there,
because there is nowhere yet to drift to.

This resolves both halves rather than trading them off:

- You never start "from the beginning" — you start where you chose to stand.
- Era III remains the game's ground state and its identity, permanently.
- Something genuinely changes as you climb, and it is the thing the game is about.
- Unlocking an era makes runs *longer-feeling* rather than just differently coloured, because it
  extends how far forward the chart can travel before the run ends.
- The fiction is good: the higher you climb the further you see, and the chart catches up with
  the instrument that is drawing it.

**What it costs.** Two or three eras have to be live within a single run, which is the one thing
`ARCHITECTURE.md` warns about: `ink` is a single global pointed at one plate, and
`invalidateArt()` clears rather than keys. The fix is known — key each cache by era as well as
chapter, as `regionPlates` already keys by plate — but it is the one piece of genuinely new
engineering in the whole ladder, and it should be prototyped with two eras before the ladder is
committed to.

**Also unresolved within it:** does the drift go forward only, and what happens on a run long
enough to run out of earned eras — does it stop at the last one, or loop, or is the last era
simply where very good runs live?

**Status: open, but converging on the score-gated shape.** Nothing should be built against any of
them yet; the piece that is safe to build under all of them is the multi-era cache keying, which is
the one thing every shape needs and the one thing none of them can avoid.

---

## 2. Do the dangers change per era, or only their depiction?

Set out in full in [DANGERS.md](DANGERS.md). The short of it: `HAZARD_KINDS` sits inside the
simulation slice, so this is the one axis where an era stops being cosmetic. Three shapes —
**A** depiction only (free, safe, buildable today), **B** era-specific rules (richest, breaks the
daily plate and comparable scores), **C** per-era rosters with the daily widened to name an era and
the ledger kept per era (coherent, and the largest change in the plan).

**The score-gated shape in question 1 dissolves this question rather than answering it.** If the era
is a function of the score, then every run has met the same dangers by the time it reaches a given
score, so option B — genuinely different rules per era — becomes safe, and the daily stays comparable
because it is fixed to one era. That is the strongest argument for the score gate, and it is why
questions 1 and 2 should be settled together rather than one at a time.

Worth noticing that the vortex PR already did both halves without separating them: replacing the
black hole with VORAGO was A, and adding VENTUS was B. The first cost nothing; the second is a new
rule every player has to learn, on every plate.

## 3. What earns an era?

Every existing plate is earned on a lifetime figure (1,000 captures, 100 runs, 25 grazes). An era
ladder may instead want each era opened by the one before it — a shape of condition `UNLOCKS` has
no example of today. Sequential unlocking makes the ladder read as a campaign; lifetime figures
keep it consistent with everything already in the catalogue.

## 4. One ledger, or one per era?

Sharing is simpler and is what the catalogue does now. Per-era records would make each era feel
like its own campaign, but needs `orbit.ledger.v1` bumped and migrated forward. Note that question 2
can force this one: if the dangers differ by era then scores across eras are not comparable, and the
records have to be kept apart whether or not that was wanted for its own sake.

## 5. Does the frame change per era?

The engraved frame — wind-heads, compass rose, MAGNITUDINES key, RA/dec scale — is era III's.
Era V wants a thin instrument margin, era I wants none at all. `plainPlate()` already proves that
omitting a whole class of drawing works. Unresolved because the observatory plate as built keeps
era III's frame and **reads better than expected doing so**: rendered bodies inside atlas
furniture looks deliberate. That may be an accident worth keeping.

## 6. Typefaces and reveal animations per era

Answered and largely closed in [LETTERING.md](LETTERING.md): the typefaces are done — every font in
the game now goes through one plate token — and the reveal modes remain, cheap and unbuilt.
