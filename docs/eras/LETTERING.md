# Typefaces and reveal animations per era

Short answer: **yes to both, and they are not the same size of problem.** The reveal animations
are cheap and mostly already built and none of them exist yet. The typefaces *were* the expensive
half — but not for the reason expected, and both of the things that made them expensive have since
been fixed, so per-era type now costs three values.

---

## Reveal animations: cheap, and half of one is already there

There are two separate lettering animations in the game, and they want different things per era.

### `writeText()` — the small hand (`reveal.js`)

Used for node captions, HUD lines, constellation names, run inscriptions — about eight call sites.
It draws the finished text **clipped to a growing box**, with a nib riding the leading edge. It is
already 90% of a typewriter: it computes `shownGlyphs` and measures the substring width to place
the clip, so a per-era variant is usually a swap of that measurement, not a rewrite.

### `penLettering()` — the large hand (`reveal.js`)

The chapter names, written from the real outlines in `glyphs.js`: each glyph's contours stroked on
by dash offset with a wet bead at the nib, then the counters flooded with ink, about 120 ms a
letter and overlapping. `letteringTime()` already centralises the pacing, so each mode can declare
its own duration without anything else changing, and `definePlate('reveal', ...)` already exists as
a section for a per-plate token naming the mode, dispatched at the top of `writeText()`.

### Per era, ladder order

**I · Rock — dab, stencil bloom, burin tally.** No script exists, so retire both `writeText()` and
`penLettering()` for chart content rather than adapting either, and replace them with three
primitives: a dab (opacity ramps in on contact, no clip), a stencil bloom (a soft-edged silhouette
fades up from the outside in), and a burin tally (one short stroke per unit, left to right — the
one place a real stroke order survives). None needs a glyph outline from `glyphs.js` or a new face;
call it free.

**II · Disc — the punch.** No script here either, so this is a new mode rather than a variant of
Latin's: a mark appears struck into place with one percussive beat, an audible "settle" as foil
seats into its groove, paced by the punch rather than by handwriting speed — closer in shape to
VII's develop-in than to any stroke-order hand. HUD numbers are grouped identical marks, not
digits. Cheap: it's develop-in's alpha ramp retimed to discrete strikes.

**III · Ceiling — the four-step outline-flood-outline.** Hangs off `penLettering()`. The wall's
real order is sketch (red) → correct (black) → flood (colour) → outline (black), one pass more
than the shipped stroke-then-flood — swap the ink colours per pass and add the black correction
pass before the flood and a second outline after it. Nearly free: the shape `penLettering()`
already has, one extra pass and a palette swap.

**IV · Marble — brush-then-chisel.** Also `penLettering()`, and also nearly free: Catich's
two-stage motion (a flat chisel-edged brush paints the letterform, then a V-section groove is cut
along the painted guide) is the same "wet lead, then commit" shape III's outline-then-flood already
performs — the flood step becomes the V-cut's shadow gradient instead of a colour fill, and the
brush pass should visibly precede and slightly overshoot the chisel pass.

**V · Globe — the qalam's RTL run, then dots.** Touches both hands. `writeText()`: right-to-left is
a one-line change — the clip grows from the other side — and it is also the *only* correct
behaviour, since a left-to-right reveal of Arabic is simply wrong. `penLettering()`: real new
work, the one large hand that genuinely needs it — the pen never lifts within a joined run, so
stroke a whole connected run as one continuous line, then sweep the disambiguating dots on
afterward in a second pass; stroking contour-by-contour would look wrong here.

**VI · Engraving — shipped.** Both hands as built: `writeText()`'s clipped-box reveal with a riding
nib, `penLettering()`'s stroke-then-flood at ~120 ms/letter. Nothing outstanding.

**VII · Plate — develop-in, and the typewriter strike.** `writeText()` carries two modes here. For
the Harvard hand's ink-on-glass annotation: develop-in — no writing at all, the whole string fades
up from nothing with a little grain, one `globalAlpha` ramp and an early return, the cheapest
reveal on the ladder. For plate jackets and logbooks: a typewriter strike — each glyph lands on one
mechanical thump rather than a constant cadence, Special Elite's own deliberately irregular
register a free excuse for per-glyph jitter — cheap, reusing the whole-glyph snap spec'd below for
VIII rather than the smooth measured clip.

**VIII · Observatory — the FITS teletype, ticking numerals.** `writeText()`'s "already 90% of a
typewriter" claim cashes in here: snap the clip to whole-glyph boundaries at a constant cadence,
swap `penNib()` for a blinking block cursor — about twenty lines. Numerals should update rather
than be written, like an instrument readout; both match the FITS-card grammar exactly and need no
new design, only implementation.

**IX · Probe — the plaque's clip-reveal, the telemetry frame.** Two registers, two hands. The
plaque (Hershey stroke data, no contours to flood) skips `penLettering()`'s flood step entirely and
reveals closer to `writeText()`'s clip growth than to a stroke-then-flood — a genuinely new code
path (a `.jhf` parser bypassing fontkit, or a converted single-line TTF), spike before committing to
the face. The telemetry frame reuses VIII's ticking numerals: a feedstock counter that ticks like an
odometer suits a machine with no hand to write with.

**Verdict: the reveals are a small, well-seamed job.** Do them per era as each era lands.

---

## Typefaces: the pipeline is easy, the payload and the hardcoding are not

### What is easy

`scripts/glyphs.mjs` is a generic `FACES` table over the faces embedded in `assets/fonts.css`.
Adding a face to the *outline* pipeline is: embed the woff2, add one row, `npm run glyphs`. The
generated `src/glyphs.js` is ~20 KB for the two current faces at 39 characters each, committed, so
neither the runtime nor CI ever needs `fontkit`. This part is genuinely solved.

### Problem one: the family name was hardcoded in 65 places — **done**

`'IM Fell English'` and `'IM Fell English SC'` were string literals inside `ctx.font` assignments in
six files and inside `font-family` declarations in the stylesheet. That, not the glyph pipeline, was
what blocked per-era typefaces.

Now: the three faces are a plate token registered by `definePlate('type', ...)` like any colour, the
canvas builds every font through `plateFace(size, variant, style)`, and the stylesheet reads
`var(--face-text)`, `var(--face-sc)` and `var(--face-body)`. **An era sets its captions in its own
type by naming three values.** Nothing else has to be touched.

### Problem two: the payload — smaller than it looked, and not a real constraint

Two corrections to what this file first claimed.

**The fonts were never inlined.** `dist/index.html` is the single script; `dist/assets/fonts.css` is
a *sibling* file loaded beside it. So the earlier "233 KB against a 513 KB build" was a conflation —
they are separate downloads, fetched in parallel and cached separately.

**And the single-file build is a convenience, not the point.** It is what makes GitHub Pages testing
easy; it is not a property the game is obliged to keep. That removes the budget as a hard constraint,
and it opens the option that actually dissolves the problem: **since the faces are already a separate
stylesheet, an era's faces need only load when that era's plate is on the press.** A player who never
leaves the engraving never downloads a hieroglyph. Per-era fonts cost per-era, not up front.

**What was done anyway, because it pays regardless:** `assets/fonts.source.css` now holds the faces
as their publisher drew them and is never served; `scripts/fonts.mjs` (`npm run fonts`) writes
`assets/fonts.css` with the same three faces cut to the characters the atlas can actually set. The
charset is **read off `src/` rather than kept as a list here**, so it cannot drift out of step with
the captions.

Result: 230 glyphs to 110, 171 KB of woff2 to 109 KB, and the served stylesheet from 233 KB to
149 KB — **36% off, for a sheet that renders identically.** The source stylesheet stays in the
repository because a subset cannot be widened back out, and `scripts/glyphs.mjs` reads it rather
than the cut one, so `src/glyphs.js` still regenerates byte-identical.

One thing the measurement taught: the Fell faces carry only 230 glyphs, so a generous character range
saved almost nothing (15%). The saving is entirely in cutting to what is *used*. Any future era's
faces should be cut the same way and measured, not assumed.

### Faces, era by era

The full set the nine research files settled on — every face this ladder actually needs, its
licence, what its block covers or leaves out, and whether it needs anything beyond one glyph per
codepoint:

| Era | Face(s) | Licence | Block/coverage note | Shaping needed? |
|---|---|---|---|---|
| I Rock | none | — | commercial "petroglyph" novelty faces explicitly rejected (not OFL, and the wrong move anyway — a font implies a fixed sign-to-sound alphabet this era never had) | n/a |
| II Disc | none | — | Noto Sans Linear B (OFL 1.1, real, on Google Fonts) considered and explicitly declined as culturally wrong for the Únětice/Nordic world | n/a |
| III Ceiling | Noto Sans Egyptian Hieroglyphs | OFL 1.1 | 1,079 glyphs, U+13000–1342F | No glyph shaping, but **quadrat stacking** (layout, not glyph substitution) is unsolved — no renderer performs it |
| IV Marble | Cinzel (Latin); GFS Didot, GFS Porson (Greek) | OFL 1.1 (Cinzel, Google Fonts); OFL (GFS, via GFS/CTAN) | GFS Didot: Greek+Coptic U+0370–03FF, capitals only; GFS Porson: Greek Extended U+1F00–1FFF for polytonic accents | None — one glyph per codepoint for both scripts |
| V Globe | Amiri, Noto Naskh Arabic (naskh); Scheherazade New (naskh, diacritics); Reem Kufi (kufic); Aref Ruqaa (*ruqʿah*) | OFL (Amiri, Noto, Reem Kufi, Aref Ruqaa, all Google Fonts); SIL (Scheherazade New, not on Google Fonts) | Arabic block U+0600–06FF floor + Presentation Forms-A/B (U+FB50–FDFF, U+FE70–FEFF); Amiri ~6,000+ glyphs "everything the font can produce," narrower ~535 unique outlines; **no genuine thuluth display face found** | **Yes — the one script in the ladder that needs it** |
| VI Engraving | IM Fell English, IM Fell English SC | SIL OFL | cut to 110 glyphs via `npm run fonts` (36% off the served stylesheet) | None |
| VII Plate | Special Elite (label only); Courier Prime (primary); Libre Franklin (grotesque margins) | Apache 2.0 (Special Elite); OFL 1.1 (Courier Prime, Libre Franklin) | Latin only | None |
| VIII Observatory | IBM Plex Mono (primary); JetBrains Mono, Space Grotesk, Inter, B612 (alternates/roles) | OFL (all); B612 also carries EPL v2.0 + EDL v1.0 alongside OFL | Latin only, ASCII-heavy (FITS cards) | None |
| IX Probe | Hershey fonts (plaque); B612 Mono, Share Tech Mono, DSEG (telemetry) | Hershey: "a permissive use and redistribution license," **explicitly NOT OFL — re-read exact terms before shipping**; B612 Mono/Share Tech Mono/DSEG: OFL (DSEG specifically OFL-1.1) | Hershey: Latin/Greek/Cyrillic/Japanese/symbols, stroke-only, no contours; OCR-A/OCR-B named as period-correct but licence unverified | None for shaping, but Hershey needs a **new code path** — no closed counters to fill |

Three pipeline problems fall out of that table, each real enough to spike before the era that needs
it is built.

### Shaping Arabic

Egyptian quadrat stacking is layout, and Latin and Greek need neither — but naskh joins, and glyph
form depends on position in the word, so `textAlongArc` placing one glyph at a time is the wrong
primitive as it stands. `fontkit` ships its own OpenType layout engine and a dedicated
`ArabicShaper` implementing real GSUB/GPOS joining, ligatures and mark positioning — not a
hand-rolled approximation. Recommendation: **pre-shape each caption at build time** with
`font.layout(caption)`, the same moment `scripts/glyphs.mjs` already extracts a closed character
set out of `src/`, and store the *already-shaped* glyph sequence in `src/glyphs.js` exactly as Latin
glyphs are stored today. `textAlongArc` and the reveal functions then place a pre-resolved
right-to-left run and never see a raw Arabic character — a change to iteration direction only, no
shaping logic at runtime.

### Grouping quadrats

Hieroglyphic text is genuinely laid out in quadrats — two, three or four small signs sharing the
square footprint of one full-size glyph — and Unicode's own Egyptian Hieroglyph Format Controls
block describes the stacking, but no font and no canvas text engine performs it; the control
characters render as their own near-invisible code points at best. There is no shortcut: the
pipeline has to **fake stacking by hand**, grouping source characters into one sign's footprint at
authoring time (half-height side by side, or quarter-height 2×2) and laying each group's glyphs
into a shared cell, the same way `textAlongArc` already places glyphs individually. New layout
work; no font fixes it.

### Stroke faces

Hershey glyphs are stroke coordinate data, drawn for a pen-following device — the game's own
stroke data, a generation before `fontkit` existed to extract anything like it, and structurally
closer to what `writeText()` and `penLettering()` already draw than any filled typeface is. But the
pipeline's flood step assumes a filled contour outline extracted by `fontkit`, and Hershey glyphs
have none — only strokes, no closed counter to fill. The plaque hand has to skip the flood step
entirely and take a path closer to `writeText()`'s clip-reveal than to `penLettering()`'s
stroke-then-flood, via either a small `.jhf` parser bypassing `fontkit` or a converted single-line
TTF. And the licence needs a second look before any of that is built: Hershey's maintained reissue
ships under "a permissive use and redistribution license," which is public-domain-adjacent but is
**not OFL** — re-read the exact terms before shipping, not after.

### Numerals, era by era

| Era | Numerals |
|---|---|
| I Rock | None — no positional system, no zero; one notch per unit, tallies |
| II Disc | None — grouped punch-marks / gold-hat-style bands, read by counting, not digits |
| III Ceiling | Egyptian numerals (stacked strokes) for small HUD counts; Hindu-Arabic digits, in the hieroglyph caption face, for the score itself |
| IV Marble | Greek alphabetic (α′–ϛ′) for magnitude; Roman numerals for chapter/row (already shipped); plain digits for the score |
| V Globe | Eastern Arabic-Indic, ٠١٢٣٤٥٦٧٨٩ |
| VI Engraving | Roman numerals (chapters, shipped); Arabic digits (score) |
| VII Plate | Arabic digits, set in Courier Prime — typed, not stroked, resolving instantly rather than ticking |
| VIII Observatory | Lining, tabular figures in IBM Plex Mono — ticking, not written, like an instrument readout |
| IX Probe | DSEG or B612 Mono digits, ticking like an odometer; the plaque hand draws binary tick marks instead of digits, as the Voyager cover does |

---

## Recommendation

1. ~~Do the `face()` refactor~~ — **done.** Every font in the game goes through `plateFace()` or a
   `--face-*` custom property.
2. ~~Subset the existing fonts~~ — **done.** `npm run fonts`, 36% off the served stylesheet.
3. **Build the reveal modes per era, as each era lands.** They are small and they are where a
   surprising amount of an era's character lives — a typewriter says "instrument" faster than any
   palette does. Nothing here is built yet.
4. **Load an era's faces with its plate, not up front.** The stylesheet is already a separate file,
   so this is the shape that keeps the ladder affordable however many eras it grows to. Not built,
   and not needed until a second era's faces exist. The prototypes' local TTFs in
   `docs/eras/prototypes/fonts/` are full, uncut faces, kept there as reference and porting sources —
   run them through `npm run fonts` to cut them to the atlas's actual charset before any of them are
   embedded in the shipped game.
