# Linking the eras — how the previews become one climb

`JOURNEY.md` stays the controlling document. This file settles the questions it left open about how
the five shipped preview doors (I, II, III, IV, VI) and the atlas itself (V) join into it, now that
they exist and turn out to disagree about their own shape: three of them are told as a story with an
ending at row 36, three are endless. Decided 2026-09-24.

## What the previews are today

| Era | Told as | Ends | Keeps |
|---|---|---|---|
| I Rock | four chambers of eight rows | never — only a loss | `orbit.rock.v1`: the cave, the animals |
| II Ceiling | twelve hours of the Amduat, three rows each | sunrise at row 36 | nothing |
| III Scroll | four palaces of eight rows, the twenty-eight mansions | never | nothing |
| IV Astrolabe | six cities, the instrument built a part a city | the Zij at row 36 | `orbit.astrolabe.v1`, `orbit.fihrist.v1` |
| V Atlas | four chapters of eight rows | never | the ledger and its catalogue |
| VI Lens | six chapters in three registers | Saturn resolved at row 36 | `orbit.lens.v1` |

Every one of them runs on the same `OrbitWorld`; the ending is nothing but the `goalRow` option.

## The decisions

**1 · Both shapes are kept, and each gets a mode.** Neither "everything endless" nor "a story for
everything" is right, because the two answer different wishes. In **Free Play** every era offers two
readings of itself: the **Chronicle**, its story flown to an ending in one run, and **Endless**, the
same era flown on the shared driver of `JOURNEY.md` §1.8 for a record of its own. The three endless
eras are given an ending out of material they already carry (I and III landed, row 32 each, with the
reading chosen on the era's own frontispiece and kept in `orbit.reading.v1`; *II, IV, VI and VII landed
2026-09-27*: the Ceiling's night comes round again, the others hold their last chapter):

- **I** — the fourth chamber is already Newgrange; the Chronicle ends when the winter-solstice light
  comes down the passage into it.
- **III** — the Chronicle ends with the fourth palace, the Vermilion Bird, at row 32, and the scroll
  is rolled up. (The circuit of the twenty-eight mansions was the first idea, but the band measures the
  climb in world units, not rows, and closes its circle somewhere near row 23 to 25 depending on pace;
  a finish line has to be a row.)
- **V** — the atlas printed. *Landed at row 32* (the fourth chapter engraved), not at the construction's
  ten stages, which are bought in the first ten landings and would end the Chronicle before it had begun.
  Endless stays the atlas's default reading; the Chronicle is chosen, and never under the daily.

**2 · A chapter is a milestone.** `JOURNEY.md` §1.5 asked for three to five named knowledge
structures per era and left most of them unnamed. The previews have already named them: the chapters
each one is told in are exactly the structures the era's own knowledge is built out of, and several
of them already draw that structure growing (the astrolabe assembled part by part, Saturn resolved
stage by stage).

| Era | Milestones |
|---|---|
| I Rock | Hall of the Bulls · Shaft Scene · Panel of Hand Dots · Newgrange |
| II Ceiling | the four watches of the night: hours I–III · IV–VI · VII–IX · X–XII |
| III Scroll | Azure Dragon · Black Tortoise · White Tiger · Vermilion Bird |
| IV Astrolabe | mater · limb · plate · rete · pointers · rule |
| V Atlas | The Quiet · The Drift · The Eclipse · The Deep |
| VI Lens | eyepiece · glass plate · sensor |
| VII, VIII | open, as `JOURNEY.md` §9 already says |

The Astrolabe keeps six because the instrument has six parts; that is the one place this table is
outside §1.5's three to five, on purpose.

**3 · The milestones are the gate; knowledge only paces them.** This answers `JOURNEY.md` §9's third
open question. An era is transition-ready when all its milestones stand, and nothing else is asked.
Knowledge — §1.4's observed fraction, summed over a Journey run's encounters and kept across runs —
opens them: an era of *k* milestones opens one for every `ERA_THRESHOLD / k` of knowledge banked,
so §1.6's shape (about five typical runs an era) is unchanged and the player sees what is still
missing rather than a counter. Knowledge past the threshold is not banked: a ready era waits for its
transition, which is where a strong run's surplus goes (§1.3). The one curated condition §1.5 allows
per era is still open and will be an extra milestone when it comes, not a second gate.

**4 · In the Journey, the Chronicle's ending is the transition.** Sunrise, the finished Zij, the
resolved Saturn, Newgrange's light: each is the moment §1.3 describes — the old medium recedes, the
body stays, the next era's hand takes the traveller up without the run stopping. In the Chronicle it
ends the run; in the Journey it is never reached by row at all, because the chapters are opened by
knowledge across runs and `goalRow` does not apply.

**5 · The era records stay the era's own.** `orbit.rock.v1`, `orbit.astrolabe.v1` and
`orbit.lens.v1` are written by play that is, under §1.1, Free Play, and Free Play must never feed the
Journey. They are not migrated into `orbit.journey.v1`; they stay what they are, each era's own
record, and become the per-era record of §1.7.

**6 · The daily stays with the atlas** (`JOURNEY.md` §2). Free Play is what opens the other eras.

## Endless, later

Decided 2026-09-27, after playtesting the Rock. Its chasms — long cracks across the wall that kill a
free flight crossing them — were taken out of the base game: wide cracks and the rising dark together
left runs with no way out, on the first sheet a new player sees, and nothing later on the ladder ever
repeats that. The mechanism is kept whole (`chasmsOn` in `src/simulation.js`, the drawing in
`src/rock.js`, `taskChasmRoute60`'s fairness pilot) and the Rock simply no longer asks for it.

That points at what a harder Endless reading could be for every century, beyond the shared driver of
`JOURNEY.md` §1.8: one danger of the era's own, too harsh for the Chronicle or the Journey, switched on
only when a player has chosen the harder way. The Rock's is the chasm. The others are still to be found
in each era's own material, and each has to keep the one promise the chasm's generation already keeps —
a way through always left standing — so that it is hard and never hopeless. A first reading for all eight is drafted in
[ENDLESS-HARD.md](ENDLESS-HARD.md).

## Unlocks, later

Not built by the first stage and recorded here so it is not lost:

- **Each era a catalogue of its own**, cut from the atlas's categories (ground, observer mark, trail,
  figure style, feats) in that era's own materials — ten to fifteen entries an era, not fifty-two.
  The conditions carry over unchanged, since the ledger's counters are era-neutral.
- **Each era's collection is its catalogue page**: the Rock's twelve animals, the Ceiling's decans,
  the Scroll's mansions, the Astrolabe's named rete stars, the Lens's worlds and fields.
- **Links between eras**, the real point of the ladder: a rete star named on the Astrolabe letters
  under its Arabic name on the atlas (as the atlas's star names really came down through al-Ṣūfī);
  the Lascaux bull drawn faint under Taurus; the Ceiling's decans earning the Dendera zodiac as a
  sphere on the atlas; every completed era leaving one heirloom in the atlas's own catalogue.
- **Door access**: the preview doors stay open until the Journey ships; after that an era is open in
  Free Play once reached, and the first chapter of one not yet reached stays open as a proof. *The gate
  is built and on* (`JOURNEY_GATES_DOORS` in `src/journey.js`, 2026-10-01), with the proof chapter
  (`eraProof()`). *Confirmed
  by the author (2026-09-30, [JOURNEY.md](JOURNEY.md) §9.1): the Journey gates Free Play this way, and the
  gate goes on once the proof chapter exists.*

## The order of work

1. **`src/journey.js`** — the persisted document, `runMode`, the knowledge fold, the milestone rule
   above, `journeyReset()`. Invisible to a player: nothing enters `'journey'` yet. *Landed with this
   file.*
2. The Chronicle endings for I and III, and the reading switch. *Landed.*
3. A Journey door on the frontispiece that starts a run at the frontier, and the milestones drawn in
   each era's own art. *The door landed*, with the milestones named in each era's own voice and said as a
   line on the frontispiece and the leaf, and drawn above that line by each era's own `journeyMark` painter
   in its own materials (see the root README's "The eras"). Until stage 5
   exists, a known era is turned over **between** runs: the leaf says so and the next tap opens the next
   century's frontispiece (`journeyAdvance()`), which stage 5 replaces with the in-run transition. The
   frontier never climbs onto a century that has no plate yet; every century from I to VIII now has one,
   so the whole ladder is climbable between runs.
4. `JOURNEY.md` stage 4, the shared endless driver, which Endless in Free Play needs. *Landed*: every run
   with no row it is won at is dealt under it (`world.driven`).
5. `JOURNEY.md` stage 5, the transition. *Its first step landed inside one century*: the Lens's registers no
   longer arrive as an edge but grow out of the body landed on past rows 12 and 24 (the simulation's
   `transition` event and `TRANSITION_GRACE`, which holds the dark for three seconds and holds no input).
   *Landed across centuries* (JOURNEY.md stage 5): once an era is known the next ordinary landing grows the
   next century out of that body inside the run, the old one held as a still outside the circle. The page
   turn between runs stays for a run that ends before it lands.
6. The per-era catalogues and the links between eras. *Landed 2026-09-28* (`src/centuries.js`): a leaf per century and its heirloom in the atlas's catalogue; the heirlooms are not yet drawn on the atlas's own chart.
