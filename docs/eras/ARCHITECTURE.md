# What an era costs, and what the spine costs

Written against the code as it stands on `main`. Line references are indicative, not load-bearing.
The first version of this file costed one era at a time; this version also costs the thing every
era now needs and none can avoid — several eras live in one run — and says where each new table
goes.

## What already exists, and is free

The plate system is not a palette — it is most of a theme engine, and four of the six shipped
plates are proof that a new sheet can cost almost nothing.

- **`definePlate(section, variants)`** (`plates.js:306`) — fourteen sections registered across
  the render files: `base`, `type`, `planets`, `underdrawing`, `plates`, `atmosphere`, `dark`,
  `inks`, `figures`, `field`, `frame`, `inscription`, `marks`, `reveal`. Draw code reads
  `ink.section.token` and never asks which plate is on the press. A plate may name itself in a
  `definePlate` call and give the tokens it keeps for itself, folded over the transformed ones;
  that is how the observatory plate keeps true-colour bodies.
- **`PLATE_STYLES`** (`plates.js:233`) — a derived plate is one colour transform over a base's
  tokens, plus optional `plain`, `pixels` and `render` flags. `render:'modern'` already selects a
  second body painter; it is the precedent for an era selecting its own.
- **`plateFace(size, variant, style)`** (`plates.js:341`) — the only place a font is assembled.
  An era's faces are three tokens in `definePlate('type', …)`.
- **`invalidateArt()`** (`plates.js:342`) — tears down eleven caches and rebuilds the grain, the
  laid tile, the backdrop and the frame, on a footer click.
- **`scripts/glyphs.mjs`** — a `FACES` table over the faces in `assets/fonts.source.css`. A new
  face is: embed, add a row, extend `CHARS`, `npm run glyphs`. `scripts/fonts.mjs` cuts the served
  stylesheet to the characters `src/` actually sets.
- **`scripts/verify.mjs`** — loops every id in `PLATES` and asserts each boots, prints all four
  chapter plates, builds a frame and renders. A new era is covered the moment it is registered.
- **`simulation.js`** — DOM-free, plate-free, chapter-free. The spine adds two tables to it and
  nothing else.

## The spine: several eras live in one run

Under the score-gated run ([PROGRESSION.md](PROGRESSION.md)) a strong run traverses four or five
eras, so the art of more than one era must be resident and switchable at a capture without a
rebuild. This is the one piece of new engineering in the plan, paid once. Itemised:

**1. One lookup for the chapter, and one for the era.** The chapter is computed from
`world.progress` in five places (`celestial.js:485,732`, `ui.js:346`, `frame.js:393`,
`ledger.js:78`), each clamped to four. Collapse them into `chapterFor(progress)` and add
`eraFor(score)` beside it, backed by the threshold table. The tables that assume four chapters —
`chapters`, `numerals`, `atlasRegions` (`plates.js:170–171, 377–386`) and `PLATE_REGISTRATION`
(`celestial.js:695`) — become lookups by era id.

**2. The page turns at a capture — and already does.** `OrbitWorld.capture()` is the only writer
of `this.progress` (`simulation.js:598`) and fires `'capture'` right after. Compute the era
transition there or in that event's consumer, never in a per-frame read; then the announcement,
the currency swap and the `ECONOMY` row hand-off each fire exactly once, between transfers.

**3. Key every cache by era.** Today the caches split three ways: chapter-scoped by construction
(`regionPlates`, keyed `index:near:p`; `celestialPlates`, keyed by `index`; `figureLayers`, keyed
by fork and plate), plate-scoped (`ringSprites`, `glowSprites`, `flareSprites`, `nebulaSprites`,
the hazard sprites, `laidTile`, `laidSheet`, `chapterRevealLeaves`, keyed by `plateName`), and
unkeyed singletons (`backdrop`, `darknessPlates` by relief only). Fold an era id into every key
string the way `plateName` is folded in today, so that `regionPlates` becomes `era:index:near:p`
and `ringSprites` becomes `era:plateName:scale`. The `glyphs` LRU (24 entries, `planets.js:513`)
is keyed by seed and row and needs the era in its key too, or a body baked in the globe's gold
is blitted onto the plate's glass. Nothing calls `invalidateArt()` on an era boundary today, and
nothing should: keyed caches, not a bigger clear.

**4. The backdrop is the one singleton that must become two.** `paintBackdrop()` is a three-way
branch (`backdrop.js:4`) into one canvas. The page turn needs the outgoing and incoming sheets at
once, so `backdrop` becomes a small map keyed by era, painted lazily, holding at most two.

**5. The `ECONOMY` table** ([ECONOMY.md](ECONOMY.md)) sits inside the simulation markers beside
`HAZARD_KINDS`. `OrbitWorld` gains a construction option carrying the row and a setter used at a
capture; the ink constants become reads of `this.economy`. The default row reproduces the shipped
numbers exactly, so every fixture in `verify.mjs` that asserts a `gain` passes unchanged. Two
constants, `INK_ORBIT_GAIN` and `INK_SLING_GAIN` (`simulation.js:34`), are declared but not read
anywhere in the slice today; the row gives them a home and the plate's "hold to develop" and the
probe's harvest are what finally spend them. The row must never consume `this.random()`, so that
`'One seed deals one chart'` and `'How a run is flown cannot change the chart it is dealt'`
(`verify.mjs:684,693`) stay true by construction. `verify.mjs`'s destructuring list gains
`ECONOMY`, `ERA_THRESHOLDS` and `HARVEST_MATERIALS`.

**6. The ledger and the daily.** `orbit.ledger.v1` gains `deepestEra`, the "open on" choice,
`maxGen` and the closure medal, added as new fields and migrated forward by `migrateRecords`
(`ledger.js:38`). The daily's seed stays a pure function of the date (`dayStamp`, `plates.js:61`)
and its era is a second pure function of the date, so no store changes shape; `orbit.dailyLog.v1`
keeps `{date:{best,plays}}` because a day has one era.

**7. The chrome.** `syncPlate()` stamps `data-plate` and `data-plate-id`; it stamps `data-era`
too, and `index.html` gains one `[data-era]` rule per era beside the `[data-plate-id]` ones,
setting the six colour variables and the three `--face-*` variables.

**Prove it before drawing.** Register era VIII as a real era beside era VI, key the caches, and
watch a run turn the page from the engraving to the observatory at a capture with no rebuild and
no dropped frame. Only then draw a sheet.

## The three obstacles an era meets

### 1. `onPaper()` is a boolean

`plateBase()` returns `'night'` or `'paper'`, and `onPaper()` is consulted in about 55 places —
`celestial.js` 19, `planets.js` 8, `frame.js` 7, `plates.js` 6, `effects.js` 6, `figures.js` 6,
`marks.js` 2, `backdrop.js` 1, `ui.js` 1. Most of those forks are about ink-on-dark versus
ink-on-light and stay right on a bronze disc or a glass negative. **Leave the boolean, add an
accessor.** `eraId()` beside `plateName`, consulted only where an era's depiction genuinely
differs — the backdrop, the body painter, the hazard painter, the stroke primitives, the frame.
Generalise to a style id only after three eras stand and the shape of the third and fourth
answers is known.

### 2. `HAZARD_KINDS` is inside the simulation

Depicting a hazard per era is free: `drawHazard()` (`figures.js:1074`) early-outs on `nebula`,
`flare` and `wind` and falls through to the vortex; a branch on `eraId()` before those early-outs
is the whole change. Changing a hazard's *rule* per era is not on the table; spawn and
escalation (`simulation.js:421–484`) are keyed by raw row, not by chapter or era, and stay so.
[DANGERS.md](DANGERS.md).

### 3. Everything is an engraving

Every stroke goes through `burinArc`, `burinSegment` and `burinRect` (`marks.js:57,109,133`),
which deliberately swell, taper, wobble and skip — 78 call sites across `effects.js`, `figures.js`,
`frame.js`, `marks.js` and `planets.js`. This is a chokepoint, not a spread. `figPen`'s
`FIGURE_STYLES` (`figures.js:52`) already varies weight, jag and breaks by an object the primitives
consult; give the burins the same — a `STROKE_STYLES[era]` naming the primitive (dab, punch,
reed, chisel, qalam, burin, hairline, plotter) and its parameters — and one edit re-inks orbit
rings, keylines, capture ripples, hazard edges, constellation lines and the frame's rule on every
era at once.

## The itemised cost of one era

| Piece | Where | Cost |
|---|---|---|
| Era entry: thresholds, names, numeral, year | the era table | trivial |
| `ECONOMY` row | `simulation.js` | trivial (a name) to a day (a rule) |
| Token overrides for the fourteen sections | wherever each is registered | data, half a day |
| DOM chrome | `index.html`, one `[data-era]` rule | trivial |
| Backdrop painter | `backdrop.js`, one branch | half a day to a day |
| Body painter | `planets.js`, a third alternative beside the engraved and rendered ones, producing the same layer object | **1–2 days** |
| Stroke style | `STROKE_STYLES` row | half a day; a day for a new primitive |
| Hazard depictions | `figures.js`, four painters | half a day to a day |
| Figure hand | `figures.js`, one `FIGURE_STYLES`-shaped object | a day |
| Faces | `assets/fonts.source.css`, a `FACES` row, `CHARS`, `npm run glyphs`, `npm run fonts` | an hour; plus a spike for shaping, quadrats or strokes where LETTERING.md says so |
| Reveal mode | `reveal.js`, one branch in `writeText`/`penLettering` | half a day |
| Signature sheet | `celestial.js` | **the dominant cost — the existing four are ~170 dense lines each** |
| Sound | `audio.js`, a per-era note table and timbre | half a day |
| README prose | root `README.md`, in the game's own voice | not to be underestimated |

**Roughly the size of the paper plate, plus one signature sheet.** Linear, incremental, never a
rewrite. The prototypes in [prototypes/](prototypes/) were written with one painter per concern
and a named stroke primitive precisely so each row above has a porting source.

## Why bodies are cheap and sheets are dear

`glyph()` (`planets.js:516`) bakes each body into offscreen layers — `{back, surface, front,
weather, embers, core, tilt, family, spin, phase}` — and `drawPlanet()` only blits them.
`renderedSpecimen()` (`planets.js:499`) already proves an alternative painter can produce the same
object; an era's bodies are a third such painter, selected by `eraId()` rather than by the
`modernPlate()` boolean. Nothing downstream changes and nothing is computed per frame.

The signature sheets have no such seam. They are bespoke full-bleed illustrations, and they are
what makes an era a place rather than a palette. One per era first; the other three later.

## Lettering, in brief

`penLettering` and `writeText` count UTF-16 code units and `textAlongArc` places one glyph per
code point with no shaping. Latin, Greek, Roman capitals and hieroglyphs place one glyph per
character and need nothing; Arabic must be pre-shaped at build time; hieroglyph quadrats must be
grouped by hand at authoring time; the probe's plaque hand is stroke data with no contours to
flood and takes a new path closer to `writeText`'s clip. `CHARS` in `glyphs.mjs` is hand-kept
and must grow per era; the served stylesheet is cut automatically. The faces load one stylesheet
today; per-era stylesheets added at the page turn keep the ladder affordable however long it
grows. [LETTERING.md](LETTERING.md).

## Audio, in brief

`OrbitAudio` (`audio.js`) is four imperative methods over three primitives, with the capture scale
inlined as a seven-note array. The smallest per-era change is that array; the fuller one is a
per-era config (notes, waveform, timbre) threaded in the way `FIGURE_STYLES` is. Each era file
names its cues.

## The transition between eras

Do not cross-fade two art directions. `pageTurn(mix)` and `drawSheetEdge()` (`celestial.js:703,
705`) already animate a new sheet sliding over the old one with its shadow, cut edge and
plate-mark. A change of era is a page turn, and a page turn is a hard cut with a flourish. With
the backdrop map above holding two sheets, the turn between eras is the turn between chapters
with a different incoming sheet, and nothing else.
