# What an era costs

Written against the code as it stands. Line references are indicative, not load-bearing.

## What already exists, and is free

The plate system is not a palette — it is most of a theme engine, and four of the six shipped
plates are proof that a new sheet can cost almost nothing.

- **`definePlate(section, variants)`** (`src/plates.js`) — thirteen sections registered across
  the render files: `base`, `planets`, `figures`, `marks`, `frame`, `dark`, `inks`,
  `atmosphere`, `plates`, `reveal`, `inscription`, `field`, `underdrawing`. Draw code reads
  `ink.section.token` and never asks which plate is on the press. There are 282 such reads.
- **`PLATE_STYLES`** — a derived plate is one colour transform over a base plate's tokens.
  A plate that differs only in colour costs one line. A plate may also now name itself in a
  `definePlate` call and give the tokens it keeps for itself, which are folded over the
  transformed ones; that is how the observatory plate gets true-colour bodies.
- **`invalidateArt()`** — tears down and rebuilds all eleven caches, the grain, the laid tile,
  the backdrop and the frame. One-off on a footer click.
- **`syncPlate()`** — stamps `data-plate` and `data-plate-id` on `#game`; DOM chrome is about
  six CSS custom properties per plate.
- **`scripts/glyphs.mjs`** — a generic `FACES` table over the faces embedded in
  `assets/fonts.css`. **A new era typeface is: embed the woff2, add a row, `npm run glyphs`.**
  The pen-lettering system then writes it stroke by stroke for free. This is the single biggest
  piece of good news in the whole plan.
- **`scripts/verify.mjs`** — already loops every id in `PLATES` and asserts each one boots,
  prints all four chapter plates, builds a frame and renders. **A new era is covered by the
  existing suite the moment it is registered.**
- **`simulation.js`** — DOM-free, plate-free, chapter-free. No era touches it. Zero gameplay risk.

## The two obstacles

### 1. `onPaper()` is a boolean

`plateBase()` returns `'night'` or `'paper'`, and `onPaper()` is consulted in about 55 places —
`celestial.js` 19, `planets.js` 8, `frame.js` 7, `effects.js` and `figures.js` 6 each, the rest
scattered. A genuine third base needs a third answer at every one of them, and a third variant
in all thirteen `definePlate` calls.

**Do not generalise this first.** Build two new eras against the existing boolean by deriving
them from `night` — they answer `onPaper() === false` and every existing fork stands — and only
then replace the boolean with a style id, once there is real evidence of what the third and
fourth answers actually want to be.

### 2. Everything is an engraving

Every stroke goes through `burinArc` / `burinSegment` / `burinRect` (`src/marks.js`), which
deliberately swell, taper, wobble and skip. There are about 80 call sites. This is a chokepoint,
not a spread: **dispatching those three functions per era re-inks orbit rings, planet keylines,
capture ripples, black-hole edges, constellation lines and the frame's double rule in one edit.**
Era V wants a clean instrument hairline; era I wants a brush-loaded reed pen; era IV wants no
line at all in places. All three are one function each.

## The itemised cost of one era

| Piece | Where | Cost |
|---|---|---|
| Style entry and colour transform | `plates.js` `PLATE_STYLES` | trivial |
| Token overrides | wherever that section is registered | data, half a day |
| DOM chrome | `index.html`, one `[data-plate-id]` rule | trivial |
| Ledger entry | `ledger.js` `UNLOCKS`, one array element | trivial |
| Backdrop painter | `backdrop.js`, one branch in `paintBackdrop()` | half a day |
| Body painter | `planets.js`, one alternative to `glyph()`'s engraved path | **1–2 days** |
| Burin dispatch | `marks.js`, three functions | half a day |
| Four chapter plates | `celestial.js` | **the dominant cost — the existing four are ~170 dense lines each** |
| Typeface | `assets/fonts.css` + a `FACES` row + `npm run glyphs` | an hour, if an OFL face exists |
| Figure hand | `figures.js`, one object the four primitives consult | 1 day |
| README prose | root `README.md`, in the game's own voice | not to be underestimated |

**Roughly the size of the paper plate.** Linear, incremental, never a rewrite.

## Why bodies are the cheap part and chapter plates are the dear part

`glyph()` bakes each body into offscreen layers — `{back, surface, front, weather, embers, core,
tilt, family, spin, phase}` — and `drawPlanet()` only blits them. **An era's bodies are an
alternative painter producing the same object.** Nothing downstream changes, nothing is computed
per frame, and the split between a turning `surface` and a still `front` is what lets era V put
lighting on one layer and albedo on the other so the terminator stays where the sun is while the
world rotates under it.

The chapter plates have no such seam. They are four bespoke full-bleed illustrations per era,
and they are what actually makes an era feel like a place rather than a palette.

## The transition between eras

Do not cross-fade two art directions. `regionBlend` cross-fades *colour regions* cheaply because
they are colours; blending two engraving styles means rendering both and dissolving, at twice the
cost, for a result that reads as mud.

Use what is already there: `pageTurn(mix)` and `drawSheetEdge()` (`celestial.js`) already animate
a new sheet sliding over the old one, with its shadow, cut edge and plate-mark. **A change of era
is a page turn, and a page turn is a hard cut with a flourish** — which is also the honest
metaphor, since these really are different sheets from different centuries.

## Open questions

- **Do eras share a ledger, or does each era keep its own record?** Sharing is simpler and is
  what the catalogue does today. Per-era records would make the ladder feel like a campaign but
  would need `orbit.ledger.v1` bumped and migrated.
- **What earns an era?** The existing plates are earned on lifetime figures. An era ladder may
  want the eras earned in sequence instead — each opened by the one before it — which is a
  different shape of condition than anything in `UNLOCKS` today.
- **Does the frame change per era?** The engraved frame with its wind-heads and compass rose is
  era III's. Era V wants a thin instrument margin; era I wants none at all. `plainPlate()` already
  proves that omitting a whole class of drawing works.
