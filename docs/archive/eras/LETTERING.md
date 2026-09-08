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

**II · Ceiling — the four-step outline-flood-outline. Built.** Hangs off `penLettering()`. The
wall's real order is sketch (red) → correct (black) → flood (colour) → outline (black), one pass
more than the shipped stroke-then-flood. It was nearly free, as predicted: a plate token,
`reveal.mode`, names the hand — `'pen'` for the atlas, `'wall'` for the Ceiling — and the wall
branch runs the same contours four times at four staged alphas. The small hand forked with it:
`writeText()`'s clipped box and riding nib are a pen's, so in wall mode each letter instead fades
up whole in place, set from the finished string's own measurement so nothing shifts as it dries.
The Ceiling's hieroglyph outlines come from the same `glyphs.mjs` pipeline as the Fell faces; its
English HUD layer, kept out of every historical column so it never poses as a translated
inscription, uses the same pipeline under the key `slab`, for Zilla Slab.

**III · The Scroll — the dot, the joining line, the boundary; a caption whose stroke order is
still unconfirmed.** The chart's own build-up needs no new primitive at all: a disc at capture, a
joining line by roughly a quarter-turn, a closed enclosure or mansion boundary and its school
colour by half a turn, a kaishu caption or a cinnabar seal by two-thirds — a sequence of shapes
appearing and colouring in stages, which every era's reveal already knows how to do. The caption
itself is the open question. Kaishu has real, codified stroke order (筆順: top to bottom, left to
right, horizontal before vertical, outside before inside) — a hand to draw, unlike the Rock's
silence — but whether that order maps onto `penLettering()`'s existing contour-stroke-then-flood,
needs a genuinely new per-stroke primitive, or fits neither, is unconfirmed against the current
source; [03-scroll.md](03-scroll.md) leaves the question exactly as open as this file does. What
is settled is that the pipeline itself is the easiest shape on the ladder to cut glyphs for:
Chinese is logographic and monospaced, every character sitting in one notional square (方塊字)
regardless of stroke count, so there is no shaping engine to build and no joining, unlike the
Astrolabe's naskh — `scripts/glyphs.mjs`'s existing per-character extraction is already the right
tool. See **Subsetting the Scroll**, below, for the real risk this era carries, which is not this
one.

**IV · The Astrolabe — the struck division, then the qalam's RTL run and dots.** Real new work,
more of it than the era's old manuscript-primary draft needed. [04-astrolabe.md](04-astrolabe.md)'s
reframe swapped which grammar leads — engraved brass now leads, the painted page demoted to a
colophon vignette — and for most of an orbit what the reveal draws is not lettering at all: a
limb's degree scale is a **struck division**, a tick stepped off with dividers from a constructed
reference circle, geometrically exact rather than penned, and neither `writeText()` nor
`penLettering()` supply it — a genuinely new primitive this era needs before either hand is drawn.
Naskh and kufic only enter once a reading is complete enough to letter beside it: an abjad-numeral
*qadr* value cut beside the closed ring, in the small, cut, angular register brass wants rather
than the book-scale flow the same script keeps on paper. The demoted manuscript vignette in the
corner keeps the qalam's own two-part motion exactly as the old draft specified it, untouched by
the reframe because the vignette is small and nothing about which grammar leads the sheet changes
the motion inside it. `writeText()`: right-to-left is a one-line change — the clip grows from the
other side — and it is also the *only* correct behaviour, since a left-to-right reveal of Arabic is
simply wrong. `penLettering()`: the pen never lifts within a joined run, so stroke a whole
connected run as one continuous line, then sweep the disambiguating dots on afterward in a second
pass; stroking contour-by-contour would look wrong here.

**V · The Engraving — shipped.** Both hands as built: `writeText()`'s clipped-box reveal with a
riding nib, `penLettering()`'s stroke-then-flood at ~120 ms/letter. Nothing outstanding.

**VI · The Lens — three registers, three hands, and the first era where none of the reveal work is
new.** Register one inherits [The Engraving](05-engraving.md)'s hand outright: the same
`writeText()` clipped-box reveal, the same `penLettering()` stroke-then-flood — a Huygens or
Herschel caption is set in the same period-Latin convention as any other atlas page of its century,
so `1610 · SIDEREUS NUNCIUS` costs nothing this era has to build; it is era V's hand run again.
Register two — develop-in, and the typewriter strike. `writeText()` carries two modes here. For the
Harvard hand's ink-on-glass annotation: develop-in — no writing at all, the whole string fades up
from nothing with a little grain, one `globalAlpha` ramp and an early return, the cheapest reveal on
the ladder. For plate jackets and logbooks: a typewriter strike — each glyph lands on one mechanical
thump rather than a constant cadence, Special Elite's own deliberately irregular register a free
excuse for per-glyph jitter, reusing the whole-glyph snap spec'd below for register three rather
than the smooth measured clip. Register three — the FITS teletype, ticking numerals.
`writeText()`'s "already 90% of a typewriter" claim cashes in here: snap the clip to whole-glyph
boundaries at a constant cadence, swap `penNib()` for a blinking block cursor — about twenty lines.
Numerals update rather than being written, like an instrument readout; both match the FITS-card
grammar exactly and need no new design, only implementation. Which register a given capture plays
in is read off the era's own observation ledger, a render-side fraction rather than a second clock,
per [06-lens.md](06-lens.md) — so what used to be two separate eras' worth of reveal work is now
one era's three registers, unchanged in substance from what each register already specified apart.

**VII · The Flyby — the scan line, the mosaic tile, the ticking downlink.** Wholly new
construction, and the easiest lettering problem the ladder has produced since the Engraving:
[07-flyby.md](07-flyby.md) is explicit that no shaping problem exists anywhere in this era's
script, Latin letterforms and Arabic numerals only. Neither of the two things that need drawing is
a stroke. A body's own reveal is not text at all — scan lines filling top-down at capture, a
mosaic's tiles locking into place by a quarter-turn, seams closing for good by two-thirds — a
genuinely new set of non-text primitives with nothing in `src/reveal.js` to generalise from,
[07-flyby.md](07-flyby.md)'s own first flagged risk. Once a body is mapped, its instrument margin —
a scale bar, a filter label, a mission caption dated `1965 · MARINER 4` — borrows the Lens's own
register-three teletype wholesale: whole-glyph snap at a constant cadence, numerals ticking rather
than writing, because this era's telemetry frame is the same instrumentation grammar one register
further on. The one thing this era adds that the Lens does not need is the frame itself: a fixed
header, virtual-channel and frame counters, a payload, a checksum, all ticking whole-digit by
whole-digit — a convention this era arguably originates on the ladder rather than merely sharing it
with [The Probe](08-probe.md)'s own instrument readout.

**VIII · The Probe — inherits its own plaque.** For the first time on the ladder, neither of this
era's two registers is authored fresh here. The self-log hand is genuinely its own: a feedstock
counter that ticks like an odometer, no stroke anywhere, suiting a machine with no hand left to
write with. The plaque hand is not — [08-probe.md](08-probe.md) is explicit that the plaque is
[The Flyby](07-flyby.md)'s own document now, the single continuous engraved line that era actually
cuts, inherited unchanged and copied unread into every daughter probe rather than redrawn or
re-lettered here. That leaves the Hershey stroke-path spike below formally the Flyby's to resolve
before the Probe can draw its own copy of it — a real dependency [08-probe.md](08-probe.md) itself
flags and [07-flyby.md](07-flyby.md) does not yet discharge; see Risk, below.

**Verdict: the reveals are a small, well-seamed job.** Do them per era as each era lands.

### The dated caption

The knowledge horizon ([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) adds one kind of
inscription and no new hand: a body's discovery caption, written once per family per era per
run through the inscription system, in the era's own small hand with its date. The Rock has
none — no script survives to set one in. The Ceiling's is the deity's name in a hieroglyph
column. The Scroll's is a kaishu caption naming the asterism and the school whose observation it
descends from, struck beside the closed boundary. The Astrolabe's is an abjad-numeral *qadr*
value lettered in naskh beside the closed ring. The Engraving's is the Fell italic with a year,
`1603 · URANOMETRIA`, the atlas's own publication date rather than a discovery date. The Lens
carries three, one per register: the Fell italic again, but dated to an observation this time —
`1610 · SIDEREUS NUNCIUS` — in register one; ink on the glass back, `LOWELL 1895`, and later
`ANTONIADI 1909` beside the same body, in register two; a FITS card in register three. The
Flyby's is a mission label dated exactly as the mission itself was, `1965 · MARINER 4`. The
Probe's is a telemetry line in its own self-log hand — its plaque carries no caption of this
kind at all, because the plaque is not this era's document to date (see Risk, below). Each uses
the reveal its era already has above.

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

The full set the eight era files settle on — every face this ladder actually needs, its licence,
what its block covers or leaves out, and whether it needs anything beyond one glyph per codepoint.
The Disc and the Marble held rows here under the old nine-era ladder; both are retired, along with
their eras, to [CANDIDATES.md](CANDIDATES.md), and their font research goes with them rather than
surviving as dead rows in this table.

| Era | Face(s) | Licence | Block/coverage note | Shaping needed? |
|---|---|---|---|---|
| I Rock | none | — | commercial "petroglyph" novelty faces explicitly rejected (not OFL, and the wrong move anyway — a font implies a fixed sign-to-sound alphabet this era never had) | n/a |
| II Ceiling | Noto Sans Egyptian Hieroglyphs (historical layer); Zilla Slab (English HUD layer, face token `slab`) | OFL 1.1 (both) | hieroglyphs: 1,079 glyphs, U+13000–1342F; Zilla Slab: Latin only, kept out of every historical column so it never poses as a translated inscription | No glyph shaping, but **quadrat stacking** (layout, not glyph substitution) is unsolved — no renderer performs it |
| III The Scroll | Noto Serif TC (kaishu-style caption face); Ma Shan Zheng (display, wrong register for a caption) | OFL 1.1 (both, SIL) | CJK Unified Ideographs, U+4E00–U+9FFF, 20,000+ codepoints — the atlas needs only the few dozen a chart actually names; **traditional forms (繁體字)**, not simplified — Noto Serif SC, the obvious first pick, sets the wrong century's character forms | No glyph shaping — logographic, monospaced, no joining — but see **Subsetting the Scroll**, below: the real risk is which few dozen characters and which variant of the face, not shaping |
| IV The Astrolabe | Amiri, Noto Naskh Arabic (naskh); Scheherazade New (naskh, diacritics); Reem Kufi (kufic); Aref Ruqaa (*ruqʿah*) | OFL (Amiri, Noto, Reem Kufi, Aref Ruqaa, all Google Fonts); SIL (Scheherazade New, not on Google Fonts) | Arabic block U+0600–06FF floor + Presentation Forms-A/B (U+FB50–FDFF, U+FE70–FEFF); Amiri ~6,000+ glyphs "everything the font can produce," narrower ~535 unique outlines; **no genuine thuluth display face found**; abjad numerals cut into brass sit beside Eastern Arabic-Indic digits in manuscript prose, a legibility pairing worth its own spike | **Yes — the one script in the ladder that needs it, carried over unchanged from the era's old name** |
| V The Engraving | IM Fell English, IM Fell English SC | SIL OFL | cut to 110 glyphs via `npm run fonts` (36% off the served stylesheet) | None |
| VI The Lens | Register 1: IM Fell English, IM Fell English SC, inherited from era V unchanged. Register 2: Special Elite (label only); Courier Prime (primary); Libre Franklin (grotesque margins). Register 3: IBM Plex Mono (primary); JetBrains Mono, Space Grotesk, Inter, B612 (alternates/roles) | Apache 2.0 (Special Elite); OFL 1.1 or SIL OFL (everything else); B612 also carries EPL v2.0 + EDL v1.0 alongside OFL | Latin only, across all three registers | None in any register — the easiest row on the ladder despite carrying three of them |
| VII The Flyby | mission-control labels: Futura (Apollo years), Helvetica (NASA's 1976 graphics standard onward); downlink figures: IBM Plex Mono, JetBrains Mono | **Futura and Helvetica are commercial faces, neither OFL — a real licence gap that [research/space-age.md](research/space-age.md) and [07-flyby.md](07-flyby.md) both name without flagging, caught here rather than at build time.** Candidate open substitutes, unverified this pass: **Jost** (OFL 1.1), an explicit geometric-sans revival citing Futura as its reference, for the Apollo-years register; **Arimo** (Apache 2.0, the same licence class already accepted for Special Elite above), a Helvetica-metric grotesque, for the 1976-onward register. The mono faces are already OFL and already cut for other eras. | Latin only, ASCII-heavy | None — the same easy case as the Engraving, the Lens and the Probe, once a licensed face is actually chosen in place of the two named above |
| VIII The Probe | self-log: B612 Mono (primary), Share Tech Mono, DSEG (fallbacks); plaque: Hershey fonts, inherited from [The Flyby](07-flyby.md), not authored here | self-log: OFL (all, DSEG specifically OFL-1.1); Hershey: "a permissive use and redistribution license," **explicitly NOT OFL — re-read exact terms before shipping** | self-log: Latin only, ASCII-heavy; Hershey: Latin/Greek/Cyrillic/Japanese/symbols, stroke-only, no contours; OCR-A/OCR-B named as period-correct but licence unverified | None for the self-log; the plaque needs a **new code path** — no closed counters to fill — and, per [08-probe.md](08-probe.md), its ownership now sits with an era that has not yet built it |

Four pipeline problems fall out of that table, each real enough to spike before the era that needs
it is built.

### Grouping quadrats

Hieroglyphic text is genuinely laid out in quadrats — two, three or four small signs sharing the
square footprint of one full-size glyph — and Unicode's own Egyptian Hieroglyph Format Controls
block describes the stacking, but no font and no canvas text engine performs it; the control
characters render as their own near-invisible code points at best. There is no shortcut: the
pipeline has to **fake stacking by hand**, grouping source characters into one sign's footprint at
authoring time (half-height side by side, or quarter-height 2×2) and laying each group's glyphs
into a shared cell, the same way `textAlongArc` already places glyphs individually. New layout
work; no font fixes it.

### Subsetting the Scroll

Egyptian and the Astrolabe both need a shaping or layout step beyond one glyph per codepoint; the
Scroll needs neither — kaishu is logographic and monospaced, no joining, no contextual forms,
arguably the simplest script on the whole ladder to lay out. Its risk is not shaping. It is that
CJK Unified Ideographs is enormous, 20,000-plus code points in the block alone, while the game
embeds every face it ships and fetches nothing at runtime — a face cut to even a generous "common
characters" subset would dwarf every other era's font bill combined. The fix is the one already
proven twice over in **Problem two**, above: `npm run fonts` already reads the charset a face needs
off `src/` itself rather than off a fixed list, so this era's own subset is not a font, it is the
few dozen characters [research/china.md](research/china.md) actually names — asterism and enclosure
names, the three schools, the four danger rows, a handful of HUD words. Cut to that set the same
way IM Fell English was cut to 110 glyphs, and measure the result before assuming it: nothing in
this file's own earlier measurement of the Fell faces licenses assuming a CJK face behaves the same
way under the same cut, because a modulated Latin serif carrying 230 glyphs and a face carrying
20,000-plus discrete drawn ideographs are not the same shape of problem, even once both are cut
down to what a caption actually sets. The trap sits one step earlier than the cut itself: choosing
the wrong *character set* before `npm run fonts` ever runs. This era predates the 1950s–60s
simplification reform by over a millennium, so a Tang or Song chart used traditional forms
(繁體字); **Noto Serif SC**, the obvious first Google-Fonts pick, sets Simplified Chinese — the
wrong forms on their face, and the family name gives no warning of it. **Noto Serif TC** is the
traditional-forms sibling under the same OFL terms and is the face this era actually wants, checked
before a single glyph is cut rather than after. This is a fourth spike beside the three around it,
not a fourth pipeline rewrite: the mechanism that makes it cheap already exists and has already
shipped once; the work is choosing the right forty-odd characters and the right variant of the
face, and confirming, the way Problem two's own measurement did for Fell English, that the saving
is real rather than assumed.

### Shaping Arabic

Egyptian quadrat stacking is layout, and Latin, Greek and Chinese need neither — but naskh joins,
and glyph form depends on position in the word, so `textAlongArc` placing one glyph at a time is
the wrong primitive as it stands. `fontkit` ships its own OpenType layout engine and a dedicated
`ArabicShaper` implementing real GSUB/GPOS joining, ligatures and mark positioning — not a
hand-rolled approximation. Recommendation: **pre-shape each caption at build time** with
`font.layout(caption)`, the same moment `scripts/glyphs.mjs` already extracts a closed character
set out of `src/`, and store the *already-shaped* glyph sequence in `src/glyphs.js` exactly as Latin
glyphs are stored today. `textAlongArc` and the reveal functions then place a pre-resolved
right-to-left run and never see a raw Arabic character — a change to iteration direction only, no
shaping logic at runtime. This work was already planned under the era's old name and carries over
unchanged by the reframe to an instrument-primary grammar: the manuscript vignette that still needs
it is smaller now, not different.

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
**not OFL** — re-read the exact terms before shipping, not after. This spike now belongs to
[The Flyby](07-flyby.md) rather than [The Probe](08-probe.md): per [08-probe.md](08-probe.md), the
plaque is the Flyby's own document, cut once and copied unread into every daughter probe, so
whichever era actually engraves it is the one that has to answer this section, and
[07-flyby.md](07-flyby.md) does not yet do so — a real, unresolved handover, not a formality.

### Numerals, era by era

| Era | Numerals |
|---|---|
| I Rock | None — no positional system, no zero; one notch per unit, tallies |
| II Ceiling | Egyptian numerals (stacked strokes) for small HUD counts and counts the wall itself makes; Hindu-Arabic digits, in the hieroglyph caption face, for the score itself |
| III The Scroll | Plain logographic numerals (一二三四五六七八九十, 百/千 for hundreds/thousands) for HUD counts, per [research/china.md](research/china.md); counting rods (算籌) existed for this era's own ephemeris arithmetic but were never a caption system and are not proposed as one here |
| IV The Astrolabe | Split by surface, not by convention, per [04-astrolabe.md](04-astrolabe.md): manuscript prose sets Eastern Arabic-Indic digits (٠١٢٣٤٥٦٧٨٩); an engraved graduation — a limb, a shadow square, a completed ring — is cut in abjad numerals instead, the twenty-eight Arabic letters each carrying a fixed value; the two systems sharing one frame is a legibility risk worth its own spike |
| V The Engraving | Roman numerals (chapters, shipped); Arabic digits (score) |
| VI The Lens | Register 1: Roman numerals and Arabic digits, inherited from era V unchanged. Register 2: Arabic digits, set in Courier Prime — typed, not stroked, resolving instantly rather than ticking. Register 3: lining, tabular figures in IBM Plex Mono — ticking, not written, like an instrument readout |
| VII The Flyby | Arabic digits, ticking whole-digit by whole-digit in a monospace face (IBM Plex Mono, JetBrains Mono) for any literal downlink figure — a convention this era arguably originates on the ladder rather than merely sharing it with the Lens's third register or the Probe |
| VIII The Probe | DSEG or B612 Mono digits, ticking like an odometer; the inherited plaque hand draws binary tick marks instead of digits, as the Voyager cover does — not authored here, carried unchanged from The Flyby |

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
   `docs/archive/eras/prototypes/fonts/` are full, uncut faces, kept there as reference and porting sources —
   run them through `npm run fonts` to cut them to the atlas's actual charset before any of them are
   embedded in the shipped game.
