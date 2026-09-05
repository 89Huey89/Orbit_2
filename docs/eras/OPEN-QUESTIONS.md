# Open questions

Decisions the ladder cannot be built without, none of them settled. Each names the tension
honestly rather than pretending there is an obvious answer.

---

## 1. Where does the progression actually happen? *(the big one)*

**The tension, in the author's words:** the Renaissance style is the work that has been put in
and is not to be given up — which it would be if every run started at the beginning of history.
But leaning entirely into unlockables loses the sense of progression *during* a run.

Both halves of that are right, and they pull against each other:

| | Progression during a run | The Renaissance stays the game's identity |
|---|---|---|
| **Eras as chapters** — every run climbs the centuries | ✅ | ❌ every run starts in Egypt; era III becomes a passing phase |
| **Eras as unlockables** — an era is a plate you earn and select | ❌ nothing changes as you climb | ✅ era III is where you start and stay |

### A third shape worth considering: **the run drifts forward from wherever you stand**

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

**Status: open. Nothing should be built against any of the three shapes yet.**

---

## 2. What earns an era?

Every existing plate is earned on a lifetime figure (1,000 captures, 100 runs, 25 grazes). An era
ladder may instead want each era opened by the one before it — a shape of condition `UNLOCKS` has
no example of today. Sequential unlocking makes the ladder read as a campaign; lifetime figures
keep it consistent with everything already in the catalogue.

## 3. One ledger, or one per era?

Sharing is simpler and is what the catalogue does now. Per-era records would make each era feel
like its own campaign, but needs `orbit.ledger.v1` bumped and migrated forward.

## 4. Does the frame change per era?

The engraved frame — wind-heads, compass rose, MAGNITUDINES key, RA/dec scale — is era III's.
Era V wants a thin instrument margin, era I wants none at all. `plainPlate()` already proves that
omitting a whole class of drawing works. Unresolved because the observatory plate as built keeps
era III's frame and **reads better than expected doing so**: rendered bodies inside atlas
furniture looks deliberate. That may be an accident worth keeping.

## 5. Typefaces and reveal animations per era

Answered in [LETTERING.md](LETTERING.md), which finds that the reveal animations are cheap and
already half-built, and the typefaces are the expensive half — not for the reason expected.
