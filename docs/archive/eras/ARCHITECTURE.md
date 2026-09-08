# What an era costs, and what the spine costs

Written against the code as it stands on `main`, one era shipped in full (the Lens, under its
current, still-nine-era name) and one shipped in part as an isolated sandbox (the Ceiling,
`src/ceiling.js`). Line references are indicative, not load-bearing. This version costs the
eight-era ladder [OVERVIEW.md](OVERVIEW.md) sets out: what the plate system already gives away for
free, the twelve pieces of new engineering a run that visits several eras actually needs — paid
once, not per era — the three obstacles an era still meets on the way in, and what one new era
costs once the spine is standing.

## What already exists, and is free

The plate system is not a palette — it is most of a theme engine, and six of the ten shipped
plates are proof that a new sheet can cost almost nothing.

- **`definePlate(section, variants)`** (`plates.js:314`) — fourteen sections registered across
  the render files: `base`, `type`, `planets`, `underdrawing`, `plates`, `atmosphere`, `dark`,
  `inks`, `figures`, `field`, `frame`, `inscription`, `marks`, `reveal`. Draw code reads
  `ink.section.token` and never asks which plate is on the press. A plate may name itself in a
  `definePlate` call and give the tokens it keeps for itself, folded over the transformed ones;
  that is how `PLATE_STYLES.ceiling` (`plates.js:255–259`) keeps its own lime-and-carbon palette
  instead of a tinted paper.
- **`PLATE_STYLES`** (`plates.js:236`) — cellarius, verdigris, foxed, azzurra, sepia and proof are
  pure colour transforms over the night or paper base, and cost a `duotone()` call and a row in
  `index.html`'s CSS. `modern` and `ceiling` are the other two: each names `render:'…'` and takes
  its own painter (`renderedSpecimen()` for the one, the whole of `src/ceiling.js` for the other),
  which is the exact precedent this plan leans on — a plate, and by extension an era, selecting its
  own body painter and its own render path rather than only its own colours.
- **`plateFace(size, variant, style)`** (`plates.js:366`) — the only place a font is assembled.
  An era's faces are three tokens in `definePlate('type', …)`, and `[data-plate-id="ceiling"]`
  (`index.html:27`) already proves the DOM half of this: it sets `--face-text`, `--face-sc` and
  `--face-body` to Zilla Slab beside its six colour variables, so a plate already changes the
  running type of the whole page, not just the canvas.
- **`invalidateArt()`** (`plates.js:367`) — tears down eleven caches and rebuilds the grain, the
  laid tile, the backdrop and the frame, on a footer click.
- **`scripts/glyphs.mjs`** — a `FACES` table over the faces in `assets/fonts.source.css`. A new
  face is: embed, add a row, extend `CHARS`, `npm run glyphs`. `scripts/fonts.mjs` cuts the served
  stylesheet to the characters `src/` actually sets.
- **`scripts/verify.mjs`** — loops every id in `PLATES` (`plateIds`, `verify.mjs:842,1078`) and
  asserts each boots, builds a frame and renders. A new era's plate is covered the moment it is
  registered.
- **`simulation.js` stays DOM-free, plate-free, chapter-free.** The spine adds three fields to it
  and nothing else — see rule 1 in [OVERVIEW.md](OVERVIEW.md) and item 1 below.

Two more things are already built, and neither was built for this plan, which is exactly why they
are worth stating plainly before anything else.

- **`player.orbitSweep` already exists and is already the clock the reveal needs.** It is
  initialised to `0` in the player's own state (`simulation.js:309`), zeroed at every capture
  (`:572`), and accumulated every frame an orbit is held (`:689–690`): `p.orbitSweep+=turn`, where
  `turn` is the angle actually swept that frame. Today it has exactly one reader, `charge()`
  (`:525`), which divides it by `TAU` for a slingshot node's charge fraction, and one place it is
  carried out of the simulation, `launch.sweep` (`:550`), for the same purpose at release. Nothing
  about the number changes to make it drive the three-state reveal; a second reader is added to a
  value the game already keeps, at zero cost to `OrbitWorld`. See item 8.
- **`OBSERVER_MARKS` and `markHead()` are already the Observer Core, built as a cosmetic system.**
  `effects.js:381–524` defines the moving point the traveller is drawn as: `markHead(boost, charge,
  inkHeld)` (`:381–388`) paints a small keylined head — halo, keyline, mid tone, highlight, four nib
  ticks that brighten with the ink held — in a local frame where the heading runs along `+x` and
  the moving point sits at the origin. `OBSERVER_MARKS` (`:390–499`) is a table of five interchangeable
  marks — `quill`, `comet`, `telescope`, `moth`, `saturn` — each cut in that same frame, and
  `drawPlayer()` (`:500–524`) picks one by `cosmetic('mark')` (`ledger.js:236`, a player-chosen,
  catalogue-unlocked selection, `ledger.js:106–113,205–206`) and calls it; if the mark's own function
  returns falsy, `markHead()` draws the shared point on top. Four of the five marks lean on the
  shared head this way. The exception is `quill`, which draws its own equivalent point inline
  (`:416–431`) and returns `true` to skip `markHead()` — visually close, but a second, separately
  maintained drawing of what is supposed to be one constant thing. This is the whole of the Observer
  Core's engineering already done: a moving-point primitive, cut once, reused by every tool, needing
  no new field anywhere in `simulation.js`. What is not yet done, per
  [OBSERVER-CORE.md](OBSERVER-CORE.md), is stronger than making the call unconditional — see item
  9 — and six more tool geometries are still needed, not seven: `quill` (era V) and `telescope`
  (era VI) already ship as real historical instruments, and only `comet`, `moth` and `saturn` are
  left over as era V's own cosmetic variants.

## The spine: several eras live in one run

Era is no longer a score threshold, so the spine is not "collapse five copies of a chapter
formula," which is what this document asked for under the old plan. It is twelve pieces of new
engineering, each paid once, each reused by every era after the first two are built.

**1. The era is a count, not a formula, and it needs one home.** Under the retired plan an era was
`eraFor(score)`, a derived lookup exactly like the chapter formula it sat beside. Under the
observation ledger ([PROGRESSION.md](PROGRESSION.md)) an era is not a function of anything the
world already tracks — it is a piece of history, incremented once per transition designation, and
a formula cannot produce that, only an event can. The natural home is beside `plateName`,
`dailyOn` and `difficulty` in `plates.js`: a render-side `let eraIndex=1` (or a small object
carrying the index and the era's own table row), incremented in the `'capture'` handler exactly
when the captured node carries the designation flag item 2 sets. `OrbitWorld` itself never counts
eras; per rule 1 it only ever holds the *current* era's economy row, the current era's ledger
accumulator, and the flag on whichever node is designated — three fields, not a fourth for "which
era number this is." The four tables that assumed four chapters — `chapters`, `numerals`,
`atlasRegions` (`plates.js:173–174`, `celestial.js:404+`) and `PLATE_REGISTRATION`
(`celestial.js:695`) — stay exactly what they are: the **chapter** axis, an existing, orthogonal,
row-driven escalation inside whichever era is showing (see item 11), never a stand-in for the era
axis again.

**2. The transition is a designation, and it must never call `this.random()`.** Once an era's
ledger arms, nothing is spawned. The simulation searches `this.nodes` for the next *eligible* main
node already dealt ahead of the player — on the main route, never behind a detour fork — and sets a
flag on it, read once by the renderer that draws it as the transition object and once by the
`'capture'` handler that advances `eraIndex`. This is deliberate to the point of being the single
most load-bearing decision in the whole plan, and it is why it belongs in `simulation.js` rather
than a render file despite touching *what an era is*: only the simulation holds the deterministic
node list a search like this can run over without inventing anything. Because the search only reads
data `this.random()` already produced when the row was generated, and writes a boolean onto an
existing node rather than creating one, `verify.mjs`'s two load-bearing invariants — `'One seed
deals one chart'` (`:684`) and `'How a run is flown cannot change the chart it is dealt'` (`:693`) —
survive the whole progression system by construction, not by care taken while building it. No
rewrite of the designation search may add a call to `this.random()` inside it, ever, for any reason,
including breaking a tie between two equally eligible nodes: break ties by row order, which is
already deterministic.

**3. Key every cache by era.** Today the caches split three ways: chapter-scoped by construction
(`regionPlates`, keyed `index:near:p`, `celestial.js:621,658`; `celestialPlates`, keyed by `index`,
`:114,342`), plate-scoped (`ringSprites` `marks.js:194,208`, `glowSprites` `figures.js:619–632`,
`flareSprites` `:812–846`, `nebulaSprites` `:964–986`, `figureLayers` `:519,522`, `laidTile` and
`laidSheet` `plates.js:430–465`, keyed by `plateName` already), and unkeyed singletons (`backdrop`,
`darknessPlates` by relief only, `effects.js:526,587`; `darkMarginalia`, `:593–652`). Fold an era id
into every key string the way `plateName` is folded in today, so `regionPlates` becomes
`era:index:near:p` and `ringSprites` becomes `era:plateName:scale`. The `glyphs` LRU (24 entries,
`planets.js:513`, keyed by `glyphKey()` at `:284`) needs the era folded into its key too, or a body
baked in the Astrolabe's brass is blitted onto the Lens's glass the moment two eras share a seed and
a row. Nothing calls `invalidateArt()` on an era boundary today, and nothing should: keyed caches,
not a bigger clear, because the outgoing era's sheet is still on screen decaying while the incoming
one grows (item 10) and both need their own art resident at once.

**4. The backdrop becomes a small map, and the page turn it used to feed is retired.**
`paintBackdrop()` (`backdrop.js:4`) is a three-way branch into one canvas today. A transition needs
two sheets resident — the decaying one and the growing one — so `backdrop` becomes a map keyed by
era, painted lazily, holding at most two, which is the same residency problem `drawAtmosphere()`
(`celestial.js:730–751`) already solves for two adjacent *chapters* mid page-turn. What does not
carry over is the compositing: `pageTurn(mix)` and `drawSheetEdge()` (`celestial.js:703,705`)
animate a fresh sheet sliding up from below the frame over the old one, and
[PROGRESSION.md](PROGRESSION.md) retires that device outright — there is no second sheet arriving
from anywhere in the ten-step transition, only the old one decaying in place (item 10) and the new
one growing outward from the transition object's position. The two-sheet residency is reused
infrastructure; the two-sheet *mixing function* is new render work, and by a comfortable margin the
largest single piece of new engineering in this document. See "The transition between eras," below.

**5. The `ECONOMY` row** ([ECONOMY.md](ECONOMY.md)) sits inside the simulation markers beside
`HAZARD_KINDS`. `OrbitWorld` gains a construction option carrying the row and a setter used at a
transition; the ink constants (`INK_REACH`, `INK_ORBIT_GAIN`, `INK_SLING_GAIN`,
`INK_CAPTURE_GAIN`, `INK_PERFECT_GAIN`, `simulation.js:33–35`) become reads of `this.economy`. The
default row reproduces the shipped numbers exactly, so every fixture in `verify.mjs` that asserts a
`gain` passes unchanged. The release dividend's one new multiplier — scaling `captureGain` and
`perfectGain` by how documented the departing orbit was left — is a pure function read where the
credit already happens (`:578`) off `launch.sweep`, already written at `:550`; it adds no field and
no call to `this.random()`. `verify.mjs`'s destructuring list gains `ECONOMY` and
`HARVEST_MATERIALS`.

**6. The ledger and the daily, and a debt this pass has to pay off honestly.** `orbit.ledger.v1`
gains `deepestEra`, `maxGen` and the closure medal, added as new fields and migrated forward by
`migrateRecords()` (`ledger.js:38–44`) rather than mutating the shape in place. The daily's seed
stays a pure function of the date (`dayStamp`, `plates.js:61`) and its era is a second pure function
of the date, so `orbit.dailyLog.v1` keeps `{date:{best,plays}}` because a day has one era. The debt:
`src/ceiling.js` today is not an era inside a run, it is a **sandbox bolted onto the plate
switcher**, and the code says so itself — `recordBest()`'s own comment reads "the era preview is
deliberately a sandbox: its run is playable, but it cannot rewrite the atlas record while the
historical progression and scoring are still being wired" (`plates.js:114–117`). Concretely:
`currentBest()` returns `0` outright whenever `ceilingPlate()` is true (`:113`); `recordBest()`
early-returns and never touches `orbit.best.v1` (`:117`); `render()` takes an entirely separate
branch straight to `renderCeiling()` (`frame.js:405–408`) that bypasses the ordinary draw pipeline;
and `ledgerCommit()` is skipped outright while the Ceiling plate is active (`ui.js:468`). None of
this is a bug — it is exactly what a standalone prototype should do — but it means the one era with
a shipped renderer today contributes nothing to the ledger, the daily, or a run's score, and turning
it into era II proper means removing all four of those bypasses, not adding new plumbing beside
them.

**7. The DOM chrome moves from plate-id to era-id, keeping plate-id for what it still owns.**
`syncPlate()` stamps `data-plate` and `data-plate-id`; `index.html` already carries one
`[data-plate-id="…"]` rule per plate, including `[data-plate-id="ceiling"]` (`:27–31`) setting six
colour variables and the three `--face-*` faces, which is the exact mechanism the other seven eras
need — proven once, not hypothetical. What changes is the key: `data-plate-id` today conflates "which
era" with "which cosmetic treatment of that era," which was fine while there was one plate per
century and stops being fine the moment an era owns several cosmetic plates of its own the way the
Engraving owns six (item 9). `syncPlate()` gains `data-era`, `index.html` gains one `[data-era="…"]`
rule per era carrying the era's own six colours and three faces, and `[data-plate-id="…"]` narrows
to what it should always have meant: a cosmetic variation *within* whichever era is current,
exactly as Cellarius and Verdigris already are within the one plate they both derive from.

**8. The three-state reveal, retargeted from `world.time` to `orbitSweep`.** `src/reveal.js`'s
`reveal.progress(key, duration, urgent)` (`:46–57`) is a birth-and-duration timer keyed by object
identity, read against `clock()` (`:28`), which returns `world.time`. `revealNode()` (`:105–116`)
already turns that single `0..1` into five graded stages — `ring`, `keyline`, `hatch`, `wash`,
`survey` — for every node, drawn as it scrolls into view over `NODE_REVEAL` seconds regardless of
whether the player has ever captured it. That is the entire gap this item closes: today a body's
*full identity* is drawn in over `1.25` s of wall-clock time purely by entering the viewport, with
zero relationship to orbiting it, which is the opposite of the brief's central mechanic. The fix
keeps the machinery and splits what it drives. The **phenomenon** stage — position, ring, capture
band — is cheap, immediate, and stays keyed to view-entry exactly as it is today, because the
readability contract ([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) makes it non-negotiable that a
trajectory is always flyable the instant a body is on screen. The **observation** and **understood**
stages — everything `keyline` through `survey` currently draw — only begin advancing once a body is
captured, on a clock read off `orbitSweep/TAU` rather than `clock()`'s elapsed seconds, so the
checkpoints at 90°, 180° and 240° land at the same fraction of an orbit on a sling's tight fast
ring and a drifter's wide slow one alike, which a duration ever could. `revealNode()`'s five-way
split does not need to become three; it needs a second clock feeding its later stages, which is
a change to what `t` is computed from, not to the function's shape. The render-side table this
drives — which painter draws the phenomenon, which the observation, which the understood, per era,
per body family — is [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)'s table, not a new structure this
file invents; it sits beside `PLATE_STYLES`, keyed by era, and reaches `simulation.js` never.
`ceiling.js`'s own reveal (below) is the best existing model for the pre-capture and post-capture
split, because it already draws that boundary, just on the wrong clock.

**9. The era-keyed tool, and making the shared point argument-free rather than merely unconditional.**
`cosmetic('mark')` picks a player-chosen skin from a flat five-item catalogue with no notion of
era. The fix keys the tool to the current era by default and demotes the catalogue to a cosmetic
choice *inside* one era rather than across all of them — which is not a new idea, it is exactly
what [PROGRESSION.md](PROGRESSION.md), [ECONOMY.md](ECONOMY.md) and, in the fullest and most
precise account, [OBSERVER-CORE.md](OBSERVER-CORE.md) already settle for the catalogue: `quill`
(era V) and `telescope` (era VI) are real historical instruments and stay each era's own default
tool as shipped; `comet`, `moth` and `saturn` have no historical grounding on the ladder at all and
become cosmetic cuts of era V's tool, never a second era's tool in disguise. That leaves six of the
eight eras (I, II, III, IV, VII, VIII) needing a genuinely new tool geometry — the ochre crayon, the
rush brush, the armillary sighting tube, the alidade, the probe's sensor boresight, the replication
core — while V and VI already ship theirs. The fix to `markHead()` itself is stronger than making
its call unconditional. Today it is skipped whenever a mark's own function draws an equivalent
point and returns `true` (`quill` alone does this), and even where it does run it takes
`(boost, charge, inkHeld)` and lets the nib ticks and the wet-ink bead brighten and lengthen with
them — both of which [OBSERVER-CORE.md](OBSERVER-CORE.md) rules out by name: *"the Core's paint
call takes no arguments describing world state — no charge, no ink level, no speed, no shield."*
The correct fix is a new, smaller, argument-free primitive — one fixed-size disc, the same
dark-keyline-then-bright-fill recipe `markHead()` already uses, stripped of the nib ticks and the
charge/ink modulation entirely — with every existing resource-linked flourish (the bead that dims as
ink runs low, the ticks that brighten on a charge) kept, but moved onto the *tool* geometry
surrounding the point rather than the point itself. This is more than skip-proofing an existing
call: it is replacing `markHead()`'s body, once, with something that structurally cannot read
`world` at all, which is the only guarantee strong enough to survive six new tool geometries being
written by six different future edits without one of them quietly reaching for `charge` because the
function signature still offers it.

**10. The per-era decay of the frontier is render-only, and the rate never moves.**
[THE-FRONTIER.md](THE-FRONTIER.md) reinterprets what the boundary destroys, not how fast:
`darknessSpeed()` (`simulation.js:539`) and the line that advances `floorY`
(`:736–738`) are read by every render file and written by none, so an era's decay motif — ochre
fading, plaster flaking, ink bleeding, geometry tarnishing, paper burning, an image washing to
grain, telemetry breaking to static, mapped space corrupting — is entirely a re-skin of
`drawDark()` (`effects.js:701–739`) and its sprite functions, `leviathanSprite()` and
`glossSprite()` (`:594–652`, cached in `darkMarginalia`), branched on `eraId()` the way `onPaper()`
branches ink today. `darknessPlates`, cached today by `relief` alone (`:526,587`), folds era into
its key alongside item 3's other caches. The one place this touches the transition rather than
ordinary play: step 4 of the ten-step transition runs this same decay to *completion* across the
whole outgoing sheet rather than only the trailing band behind the player, which the shipped code
has never been asked to do and is genuinely new work, not a re-skin of existing work.

**11. Lifting the chapter cap costs less than it sounds like, and less than one hardcoded number
suggests.** The formulas that actually gate difficulty — `chartPace(row)` and `chartGrowth(row)`
(`simulation.js:56,59`), `darknessSpeed()` (`:539`), and the row-gated hazard rules
(`HAZARD_CLOSES_ROUTE=12`, `WIND_FROM_ROW=20`, `:45,49`, and the `k%3`/`k%5` spawn conditions,
`:421–486`) — are already unbounded functions of raw `row`, with no dependency on the `chapter`
variable at all; they need no cap lifted, because they were never capped. What *is* hard-capped at
`3` (or `4`) is purely render bookkeeping: `chapter=Math.min(3,Math.floor(world.progress/8))`
(`ui.js:402`, and its siblings at `celestial.js:485,732`, `frame.js:393`, and `ledger.js:78`'s own
`Math.min(4,…)`) selects which of the four `atlasRegions`/`PLATE_REGISTRATION` entries to blend
toward and which of the four named chapters — QUIET, DRIFT, ECLIPSE, DEEP — to announce and record.
Once every era owns its own backdrop outright (item 4), that four-entry array stops needing to mean
anything past whichever single era still wants a within-era region drift — most naturally the
Lens's own three registers — and every other era can simply not consult it. What genuinely must
not survive unexamined is the literal ceiling once history is exhausted: once a run is past era
VIII there is no ninth backdrop to index into and no fifth chapter name to print, so the honest fix
is not "raise 3 to some bigger number" but retire the chapter announcement and `deepestChapter`
record once the ladder ends, in favour of a value that keeps meaning something arbitrarily far into
a run that never stops — `GEN`, the Probe's own replication count ([ECONOMY.md](ECONOMY.md)), is
already exactly that value and already exists for this purpose. One more honest note for whoever
tunes endless mode: `chartPace`'s own clamp (`(row-3)/25` to `[0,1]`) means the pace and the
darkness it drives already *plateau* by design around row 28, which is correct for a bounded
eight-era climb and works directly against "the run continues indefinitely, escalating" once
history is finished — a genuinely unbounded post-Probe difficulty curve is new row-keyed math, not
a cap to lift, and it is the one piece of endless mode this document cannot cost as free.

**12. `verify.mjs`'s destructuring list gains every new simulation-side name**, per `CLAUDE.md`'s
own contract: `ECONOMY`, `HARVEST_MATERIALS`, and whatever the observation ledger's field and the
transition's designation flag end up called (`PROGRESSION.md` flags the naming trap already —
not `OBSERVATIONS`, which the feats table already owns at `simulation.js:159`). The two invariant
tests at `:684` and `:693` need no change in shape, only new fixtures exercising a run that crosses
an era boundary mid-flight, since today both only fly a single, era-blind chart to row 40.

**Prove it before drawing.** Wire era II out of its sandbox (item 6) and stand era VI's shipped
plate beside it as a second real era, key the caches (item 3), and watch a run cross from the
Ceiling to the Lens at a designated capture with no dropped frame and a ledger entry that actually
counts. Only then draw a third sheet.

## The three obstacles an era meets

### 1. `onPaper()` is a boolean

`plateBase()` returns `'night'` or `'paper'`, and `onPaper()` is consulted in 56 places —
`celestial.js` 19, `planets.js` 8, `frame.js` 7, `plates.js` 6, `effects.js` 6, `figures.js` 6,
`marks.js` 2, `backdrop.js` 1, `ui.js` 1. Most of those forks are about ink-on-dark versus
ink-on-light and stay right on a bronze disc, a lime-plastered wall or a glass negative alike,
since `ceiling`'s own base is `'paper'` and inherits every one of them for free. **Leave the
boolean, add an accessor.** `eraId()` beside `plateName`, consulted only where an era's depiction
genuinely differs — the backdrop, the body painter, the hazard painter, the stroke primitives, the
frame, the frontier's decay (item 10). Generalise to a style id only after three or four eras
stand and the shape of the differences is known, rather than guessing it now.

### 2. `HAZARD_KINDS` is inside the simulation

Depicting a hazard per era is free: `drawHazard()` (`figures.js:1074`) early-outs on `nebula`,
`flare` and `wind` and falls through to the vortex; a branch on `eraId()` before those early-outs
is the whole change. Changing a hazard's *rule* per era is not on the table and rule 1
([OVERVIEW.md](OVERVIEW.md)) says so explicitly: `HAZARD_KINDS` (`simulation.js:180–185`) and the
spawn and escalation it feeds (`:421–486`) are keyed by raw row, never by era, and stay so, for the
same reason item 2's designation search never calls `this.random()` — a hazard rule that read the
era would mean two runs at the same row no longer meaning the same thing depending on which century
happened to be showing. [DANGERS.md](DANGERS.md).

### 3. Everything is an engraving

Every stroke goes through `burinArc`, `burinSegment` and `burinRect` (`marks.js:57,109,133`),
which deliberately swell, taper, wobble and skip — 78 call sites across `effects.js` (25),
`frame.js` (28), `marks.js` (11), `figures.js` (10) and `planets.js` (4). This is a chokepoint, not
a spread. `figStyle`'s `FIGURE_STYLES` (`figures.js:52`) already varies weight, jag and breaks by
an object the primitives consult; give the burins the same — a `STROKE_STYLES[era]` naming the
primitive (dab, punch, reed, chisel, qalam, burin, hairline, plotter) and its parameters — and one
edit re-inks orbit rings, keylines, capture ripples, hazard edges, constellation lines and the
frame's rule on every era at once. `src/ceiling.js` already proves the payoff at scale: it does not
touch `burinArc` at all, and instead cuts its own four-stage primitive —
`ceilingPolygon()`/`ceilingSign()` (`:192–206,270–293`), a red setting-out laid off register, a
thin black correction, the flat colour flood, and a black closing line with its own wet-edge
bloom — reused for every figure, hieroglyph and wheel on the wall. That is not a fifth burin
variant to fold in; it is the proof that a wholly different mark-making process can sit behind the
same `STROKE_STYLES[era]` seam without the seam itself changing shape.

## The itemised cost of one era

| Piece | Where | Cost |
|---|---|---|
| Era entry: economy row, ledger threshold, name, numeral, date | the era table | trivial |
| Token overrides for the fourteen sections | wherever each is registered | data, half a day |
| DOM chrome | `index.html`, one `[data-era]` rule | trivial |
| Backdrop painter | `backdrop.js`, one branch, keyed by era | half a day to a day |
| Body painter | `planets.js`, a third alternative beside the engraved and rendered ones, producing the same layer object. Eras I–V want one **point painter** each (a body in a brightness class, plus the Moon), not a full surface; VI wants its three registers | **half a day (a point painter) to 1–2 days (a family painter)** |
| Three-state reveal cells | the render-side table beside `PLATE_STYLES`; phenomenon, observation, understood, per family | half a day |
| Tool geometry | `effects.js`, one `OBSERVER_MARKS`-shaped function ending in the argument-free Core primitive | half a day |
| Frontier decay motif | `effects.js`, one branch each in `drawDark()`, `leviathanSprite()`, `glossSprite()` | half a day to a day |
| Stroke style | `STROKE_STYLES` row | half a day; a day for a new primitive |
| Hazard depictions | `figures.js`, four painters | half a day to a day |
| Figure hand | `figures.js`, one `FIGURE_STYLES`-shaped object | a day |
| Faces | `assets/fonts.source.css`, a `FACES` row, `CHARS`, `npm run glyphs`, `npm run fonts` | an hour; plus a spike for shaping, quadrats or strokes where [LETTERING.md](LETTERING.md) says so |
| Signature sheet | `celestial.js` | **the dominant cost — the existing renderer is ~1,700 lines** |
| Sound | `audio.js`, a per-era note table and timbre | half a day |
| README prose | root `README.md`, in the game's own voice, once anything ships | not to be underestimated |

**Roughly the size of the Lens's own plate, plus one signature sheet — for every era but the
Ceiling, which already has one.** Linear, incremental, never a rewrite, once the twelve-item spine
above is standing once. The prototypes in [prototypes/](prototypes/) were written with one painter
per concern and a named stroke primitive precisely so each row above has a porting source; see
[PROTOTYPES.md](PROTOTYPES.md) for which painter reached which prototype.

## Why bodies are cheap and sheets are dear

`glyph()` (`planets.js:516`) bakes each body into offscreen layers — `{back, surface, front,
weather, embers, core, tilt, family, spin, phase}` — and `drawPlanet()` (`:591`) only blits them.
`renderedSpecimen()` (`:499`) already proves an alternative painter can produce the same object;
an era's bodies are a third such painter, selected by `eraId()` rather than by `modernPlate()`'s
boolean. Nothing downstream changes and nothing is computed per frame. The three-state reveal
makes the early eras cheaper still: a body that is a point in a brightness class
([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) is one painter shared by five eras and re-inked per
plate, and the Lens's own richer registers are `glyph()`'s existing stages selected by the
knowledge-horizon cell rather than a second body.

The signature sheets have no such seam. They are bespoke full-bleed illustrations, and they are
what makes an era a place rather than a palette. `src/ceiling.js`, at roughly 1,700 lines, is the
existing proof of both halves of that claim at once: it is the single most expensive thing this
plan has to build seven more of, and — with the exception named below — it is also the strongest
existing evidence that the reveal item 8 asks for is buildable, because it already ships one.
`ceilingDrawNode()` (`:1240–1270`) drives a body's reveal through the same three-part progression
the atlas's `revealNode()` runs — red setting-out ring, a black correcting ring, then the wheel
itself — timed against view-entry exactly like the atlas is, which is the model item 8 generalises
away from `world.time` and onto `orbitSweep`, not a mechanic to invent from nothing.
`ceilingDrawPlayer()` (`:1350–1450`, about a hundred lines) is the one part of the file that
contradicts the brief outright: it draws the solar night barque as the player, whole and literal,
where every other era needs a tool with the Observer Core at its working end. Everything else in
the file — the wall, the figures, the star signs, the decan wheels, the four-stage mark, the
sistrum, the drying blot — stands. The fix is not a rewrite; it is deleting one function and
writing a reed brush with a bright point at its wet tip in its place.

## Lettering, in brief

`penLettering` and `writeText` count UTF-16 code units and `textAlongArc` places one glyph per
code point with no shaping. Latin, Greek, Roman capitals and hieroglyphs place one glyph per
character and need nothing; Arabic must be pre-shaped at build time; hieroglyph quadrats and
Chinese characters must be grouped by hand at authoring time; the Probe's plaque hand is stroke
data with no contours to flood and takes a new path closer to `writeText`'s clip. `CHARS` in
`glyphs.mjs` is hand-kept and must grow per era; the served stylesheet is cut automatically. The
faces load one stylesheet today; per-era stylesheets added at the transition keep the ladder
affordable however long it grows. [LETTERING.md](LETTERING.md).

## Audio, in brief

`OrbitAudio` (`audio.js`) is a handful of imperative methods over three primitives — `tone`,
`brush`, `scratch` — and it already forks per plate: `capture()`, `death()` and `medal()` each
branch on `ceilingPlate()` today (`audio.js:68–101`) to swap a scale-note chime for a wet dab, a
dying chord for a dropped stone, a rising fanfare for a sistrum shake. That fork generalises
directly to `eraId()` with seven more branches rather than two; the smallest per-era change is a
new note table and timbre threaded the way `capture()`'s scale array already is, the fuller one is
a per-era config object threaded the way `FIGURE_STYLES` is. Each era file names its own cues.

## The transition between eras

The old model — a fresh sheet sliding up over the old one, `pageTurn()` and `drawSheetEdge()`
(`celestial.js:703,705`) — is retired from this role entirely, and not merely renamed.
[PROGRESSION.md](PROGRESSION.md)'s ten steps describe something categorically different: nothing
new arrives from anywhere. The old sheet decays where it stands, run to completion rather than to
a shoreline (item 10, at full speed rather than only behind the player); the transition object and
the Observer Core are immune to that decay by construction, since they are the two things a
transition never touches; and the new era's art grows outward from the transition object's own
position, the way the chart already grows outward ahead of the player rather than being laid down
all at once. Three things are genuinely new engineering here, not reuse wearing a new name: a pause
that eases the world's forward advance without easing the frontier's rate, which the simulation has
never been asked to decouple before; running the frontier's decay to full-sheet completion instead
of its ordinary trailing-edge shoreline; and a *growth* compositing — the new backdrop revealed
outward from a point rather than cross-faded across the frame — which has no shipped precedent at
all, `pageTurn(mix)`'s cubic ease being a slide, not a growth. Item 4's backdrop-as-a-map is the
one piece of this transition that is reused infrastructure; the compositing that draws through it
is not.
