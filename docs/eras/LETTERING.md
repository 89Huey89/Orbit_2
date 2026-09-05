# Typefaces and reveal animations per era

Short answer: **yes to both, and they are not the same size of problem.** The reveal animations
are cheap and mostly already built. The typefaces are the expensive half — but not for the reason
you would expect, and the expensive part is not the glyph pipeline.

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

### Problem one: the family name is hardcoded 93 times

`'IM Fell English'` appears 62 times and `'IM Fell English SC'` 31 times, as string literals inside
`ctx.font` assignments across eight files:

```js
ctx.font = `${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
```

**This, not the glyph pipeline, is what blocks per-era typefaces.** The fix is mechanical and
should be done once, before any era needs it: register the faces as a plate section and read them
through one helper, so every call site becomes `ctx.font = face(size,'sc')`. It is a large,
boring, low-risk change and it wants to happen on its own commit, uncoupled from any era.

### Problem two: the payload

`assets/fonts.css` is **233 KB of base64 for three faces** — roman, italic and small caps at about
57 KB of woff2 each. The whole built game is 513 KB.

Five eras at two or three faces each would add somewhere around **600–850 KB**, more than doubling
the game, for a page whose entire pitch is that it is one self-contained file with no network
access. This is the real constraint on the ladder and it should be treated as a hard budget, not
discovered late.

Three things bring it down, and they are cumulative:

1. **Subset the faces to the characters actually set.** The embedded fonts appear to carry their
   full character sets; the game sets Latin, digits and a handful of punctuation. Subsetting is the
   single biggest saving available and is worth doing to the *existing* fonts regardless of whether
   the ladder is ever built.
2. **One face per era, not three.** Era III has three because it is the game's home era and sets
   body copy, italic asides and small caps. An era that only has to caption a chart needs one.
3. **Let some eras carry no webfont at all.** Era IV's annotations are a grotesque and a
   typewriter face — both of which the system stack provides adequately, and a photographic plate's
   annotation is *supposed* to look mechanical rather than designed. Era V is the same. **The two
   cheapest eras to build are also the two that need no font payload**, which is a good reason to
   build them first, and a good reason the ladder's expensive end is its ancient end.

### Problem three: shaping

Latin and hieroglyphs place one glyph per character and need nothing. **Arabic does not** — it
joins, and glyph form depends on position in the word. `textAlongArc` sets glyph by glyph and would
have to be taught either to shape a run before placing it or to accept pre-shaped runs. Era II
should spike this before anything else in it is designed.

---

## Recommendation

1. **Do the `face()` refactor now**, on its own, decoupled from the ladder. Ninety-three literals
   into one helper. It is worth doing even if no era is ever built, and every era needs it.
2. **Subset the existing fonts** at the same time. Pure win today.
3. **Build the reveal modes per era, as each era lands.** They are small and they are where a
   surprising amount of an era's character lives — a typewriter says "instrument" faster than any
   palette does.
4. **Treat the font budget as a hard constraint from the start**, and let it inform which eras get
   built: the ones needing no webfont are the cheap ones.
