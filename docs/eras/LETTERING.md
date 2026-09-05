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
It draws the finished text **clipped to a growing box**, with a nib riding the leading edge.

**This is already 90% of a typewriter.** It computes `shownGlyphs` and measures the substring
width to place the clip. A per-era variant needs only:

- **Typewriter (era V):** snap the clip to whole-glyph boundaries instead of the smooth measured
  width — the value is already computed — and swap `penNib()` for a block cursor that blinks.
  Roughly twenty lines.
- **Develop-in (era IV):** no writing at all. A darkroom annotation does not get *written*, it
  *appears* — fade the whole string up from nothing with a little grain, over the same duration.
  Even cheaper: it is one `globalAlpha` ramp and an early return.
- **Brush (era I):** the clip grows, but the leading edge carries a loaded-brush blot that pools
  where the stroke began and dry-brushes where it ends.
- **Qalam (era II):** right-to-left, so the clip grows from the other side. That is a one-line
  change and also the *only* correct behaviour — a left-to-right reveal of Arabic is simply wrong.

Structurally: one `reveal` token per plate naming the mode, dispatched at the top of `writeText`.
`definePlate('reveal', ...)` already exists as a section.

### `penLettering()` — the large hand (`reveal.js`)

The chapter names, written from the real outlines in `glyphs.js`: each glyph's contours stroked on
by dash offset with a wet bead at the nib, then the counters flooded with ink, about 120 ms a
letter and overlapping.

Per era this genuinely varies, and two of them are almost free:

- **Era I, Egypt:** stroke the outline, then flood — which is *exactly* what Egyptian painting
  does (red outline, flat fill, final black outline) and *exactly* what this function already
  does. Change the ink colours and add a second outline pass after the flood. Nearly free.
- **Era II, the qalam:** the stroke order of Arabic is the whole art — the pen never lifts within a
  joined run, and the dots go on afterward. Stroking contour-by-contour would look wrong. This is
  the one era where the large hand needs real new work.
- **Era III:** shipped.
- **Era IV:** skip it entirely and use the develop-in fade. A photographic plate has no chapter
  calligraphy.
- **Era V:** skip the contour stroking; use the typewriter at a larger size. And a genuinely nice
  idea for this era specifically: **the numerals should not be written at all, they should
  update** — a score that ticks over like an instrument readout rather than being inscribed.

`letteringTime()` already centralises the pacing, so each mode can declare its own duration
without anything else changing.

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

### Problem three: shaping

Latin and hieroglyphs place one glyph per character and need nothing. **Arabic does not** — it
joins, and glyph form depends on position in the word. `textAlongArc` sets glyph by glyph and would
have to be taught either to shape a run before placing it or to accept pre-shaped runs. Era II
should spike this before anything else in it is designed.

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
   and not needed until a second era's faces exist.
