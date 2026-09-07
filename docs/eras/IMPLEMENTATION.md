# What gets built, in what order

This is the document a developer opens on day one. It does not re-cost what [ARCHITECTURE.md](ARCHITECTURE.md)
already costs against the code, and it does not re-argue what [OVERVIEW.md](OVERVIEW.md),
[PROGRESSION.md](PROGRESSION.md), [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md), [ECONOMY.md](ECONOMY.md),
[THE-FRONTIER.md](THE-FRONTIER.md) and [OBSERVER-CORE.md](OBSERVER-CORE.md) have already settled. It
sequences the work those documents describe, names the file each piece actually touches, states how
each piece is proven and how it is backed out if it is wrong, and says where a six-scout pass that
checked every one of those documents against the real code found a claim that does not hold. Where a
scout contradicts a planning document, the scout is right, and this document says so rather than
quietly repeating the wrong claim a second time.

Orbit is being rebuilt to tell one story: **nodes begin as celestial phenomena and become knowledge
through orbit.** Every ambiguity below is decided by asking what that sentence requires and building
the smallest thing that satisfies it. A phenomenon is legible the instant it is on screen — position,
capture-region size, whatever a body's class demands for a trajectory to be judged. Its identity is
not legible until it is orbited, and how much of it is legible is a direct, continuous function of how
much of an orbit has been swept, never of how long a body has merely been sitting in the viewport, and
never a duration a body would earn simply by being looked at. Every other decision in this document —
which piece is built first, which piece is deferred, which claim in the standing plan turned out to be
wrong once checked against the code — is downstream of that one sentence.

## The order of work

Eight stages. The shape is: prove the reveal on one body in the game as it ships today, before any era
plumbing exists at all, because the reveal is the whole redesign and everything else is scaffolding
for it; then the Observer Core, which is nearly free and de-risks the player-tool question; then the
era as a runtime concept, proven with two eras live in one run; then the observation ledger and the
transition designation; then the ten-step transition itself; then the frontier's own per-era decay;
then endless mode; then the eras themselves, cheapest and best-sourced first. This departs from
[OVERVIEW.md](OVERVIEW.md)'s own coarser build order in one place worth arguing openly: OVERVIEW folds
the reveal retarget, the ledger and the designation into one "spine" stage and puts the Observer Core
after it. The scouts' findings say the era-as-a-runtime-concept work is harder and more foundational
than that framing credits — in particular, `drawPlayer()` cannot select a tool by era before an
`eraId()`-equivalent accessor exists anywhere in the codebase, which OVERVIEW's own item 2 assumes
without saying so — so this document pulls "the era exists and two of them run" out as its own stage,
proves it on the two renderers the game already half-has, and only then builds the ledger and the
designation on top of a thing that has been shown to actually switch.

### Stage 1 — The reveal, proven on one body, before any era exists

**What lands.** `player.orbitSweep` becomes the clock the three-state reveal actually runs on, for the
game exactly as it ships today — no `eraId()`, no economy row, no ledger, nothing new in `plates.js`.
Two things land together, because the second is not optional once the first is checked against the
code:

- `src/reveal.js`'s `revealNode()` (`:105–116`) is split into two independently-clocked halves. The
  **phenomenon** stage — the `ring` fraction alone — stays exactly as it is, keyed to view-entry through
  the existing `reveal.progress(n,NODE_REVEAL)` machinery, because the readability contract makes this
  non-negotiable: a trajectory must be flyable the instant a body is on screen, whether or not it has
  ever been orbited. The **observation** and **understood** stages — `keyline`, `hatch`, `wash`,
  `survey` — are recomputed from a second value, `active ? clamp(p.orbitSweep/SWEEP_FULL,0,1) :
  (n.documented||0)`, and that value is **not** routed through `reveal.progress()`. This matters enough
  to say twice: `reveal.progress()`'s `born` Map and its `REVEAL_CAP=3` concurrent-mark throttle
  (`reveal.js:26,50`) exist to limit how many freshly-scrolled-into-view marks animate at once, and have
  no business gating whether an already-earned documentation fraction is visible on a node that is not
  newly entering view. Routing the new clock through `progress()` would silently cap the observation
  stage to three concurrent nodes whenever four or more already-captured bodies are on screen together,
  which happens routinely as the chart scrolls, and nothing in `ARCHITECTURE.md`'s own item 8 flags
  this — it calls the change "a change to what `t` is computed from, not to the function's shape," which
  is true of the *phenomenon* stage and false of the other four.
- A new node field, written exactly once, closes the actual gap in the plan. `player.orbitSweep` lives
  only on `player`; it is unconditionally zeroed the instant any node is captured
  (`src/simulation.js:572`), and the only trace ever taken out of it for a node that has just been left
  is a transient copy into `p.launch.sweep` (`:550`) that is itself overwritten by the very next release
  and never written back onto the node. Every node on screen that has already been captured and
  released today carries **zero** persisted information about how much of its orbit was swept — this is
  a gap in the shipped code, not a detail, since `drawNode()` (`figures.js:635`) can name at most one
  node `active` and every other node on screen needs to keep reading *something*. `release()`
  (`simulation.js:545–553`) already holds the departing node in scope (`const p=this.player,n=p.node`)
  and never touches it; it gains one line, before `p.node=null`: `n.documented=clamp(p.orbitSweep/
  SWEEP_FULL,0,1)`. `SWEEP_FULL` is a new top-level constant, `TAU*2/3` — 240° in radians, matching
  `KNOWLEDGE-HORIZON.md`'s own "complete" checkpoint — declared once inside the `BEGIN`/`END SIMULATION`
  markers so `reveal.js`, loaded later in `index.html`'s script order (`simulation.js` at `:532`,
  `reveal.js` at `:541`), can read the same global rather than a second, duplicated constant.
- **The completion flourish's detection site, named here even though its per-era art is Stage 8's job.**
  `PROGRESSION.md`'s "one concession to legibility" fires a small, era-flavoured flourish the instant a
  body's live documentation reaches `1.0` — a one-shot event on the `<1→1` crossing, not a steady-state
  read of the clamped value the way `keyline`/`hatch`/`wash`/`survey` are. Nothing in the standing plan
  names where that crossing is caught, and it must be caught once, not every frame the value happens to
  read `1`. The natural site is `reveal.js`, beside the second-clock read this stage already adds: track
  the previous frame's `clamp(p.orbitSweep/SWEEP_FULL,0,1)` for the active node, and fire the flourish
  exactly when it steps from below `1` to `1`. This stage adds the tracked-previous-value plumbing and a
  no-op default flourish (so the site exists and is provably one-shot); each era's actual flourish — a
  seal pressed, a wash of pigment settling, a lock of focus — is drawn per era in Stage 8, keyed by
  `eraId()` the same way every other per-era paint call is.

**Why here, and not later.** This is the brief's own central mechanical change, and it is provable
against the shipped game with zero era plumbing: one field, one write site, one function's input
retargeted. Nothing about it depends on an era existing, and nothing later in this plan is worth
building if the checkpoint table this stage tunes turns out not to feel right at the one thing the
whole redesign is actually about. Building era plumbing first, as OVERVIEW's own "spine" framing
invites, would mean testing the reveal against a system built to serve it before the reveal itself is
known to work — backwards risk ordering for the single piece of work the brief calls "the most
important mechanical change."

**Files touched.** `src/simulation.js` (the `SWEEP_FULL` constant, `n.documented`, the write in
`release()`); `src/reveal.js` (`revealNode()`'s second clock, and the previous-value tracking that
catches the completion flourish's `<1→1` crossing). No render-side per-era table is needed yet — the
existing single-plate rendering (`planets.js`'s `glyph()`/`drawPlanet()`, already proven by
`renderedSpecimen()` to tolerate more than one painter behind the same cached-layer object) is what the
checkpoint table is tuned against, and the flourish's default is a no-op until Stage 8 gives each era
its own.

**How it is proven.** Visually, first: open `src/index.html`, fly a run, orbit a body partway, release,
and confirm the body on screen now reads its frozen fraction rather than resetting or continuing to
draw. Then in `scripts/verify.mjs`: a fixture that captures a node, orbits a known fraction (90° via a
fixed `p.speed`/`p.rad` and `update(dt)`), releases, and asserts `n.documented` equals the expected
clamped fraction and is untouched by capturing a second node afterward (proving the write is scoped to
the node it belongs to, not clobbered by the next capture's zeroing of `p.orbitSweep`); a fixture
confirming a node still held at death (`p.node` stays set — `die()` at `simulation.js:626–630` never
clears it) keeps reading live, unfrozen `p.orbitSweep` correctly, so no field write is needed on that
path, and a regression test exists so a future edit that starts nulling `p.node` on death does not
silently break it; a fixture confirming a never-captured node reads `n.documented` as falsy right up
until it is pruned; and one new fixture against the render harness (`verify.mjs`'s second `vm` context,
`:840`, which loads the full bundled script including `reveal.js`) that fills `REVEAL_CAP`'s concurrency
with three fresh marks and then asserts a fourth, already-fully-documented node's `keyline`/`hatch`/
`wash`/`survey` all read `1`, not `0` — the concrete, checkable form of the `REVEAL_CAP`-leak risk
above. A fixture confirms the flourish fires exactly once as a held orbit's live fraction crosses `1`
— not on every subsequent frame it continues to read `1` — and never fires for a node whose fraction
never reaches `1` at all. None of this touches `verify.mjs`'s two load-bearing invariants (`'One seed
deals one chart'`, `:684`; `'How a run is flown cannot change the chart it is dealt'`, `:693`) because
`n.documented` is computed from physics `this.random()` has already produced, never from a new call to
it — add a fixture that flies one seed two different ways and asserts the resulting node array is
byte-identical in position, type and order despite the two runs' `n.documented` values differing.

**Backing out.** Fully isolated. Revert `revealNode()`'s input and delete `n.documented` and its one
write site; the game returns to exactly the shipped view-entry-timed reveal. Nothing later in this plan
has been built against it yet, so this is the cheapest stage in the whole document to undo.

### Stage 2 — The Observer Core

**What lands, in two parts, because the second part cannot land until Stage 3 exists.**

**2a — argument-free, and the missing tool geometries, without touching era selection.**
`OBSERVER_MARKS` and `markHead()` (`effects.js:381–524`) already draw the moving point every mark in
the game shares; what they do not yet do is what `OBSERVER-CORE.md` requires: a paint call that
structurally cannot read world state. `markHead(boost,charge,inkHeld)` is rewritten to take no
arguments — a fixed disc, the same dark-keyline-then-bright-fill recipe, with the charge/ink-linked nib
ticks stripped out entirely — and `quill`, the one mark that currently draws its own equivalent point
inline and returns `true` to skip `markHead()` (`:416–431`), is rewritten to fall through to the shared
call like every other mark. This is not free the way `ARCHITECTURE.md`'s single "half a day" tool-
geometry line implies: the charge/ink flourish `markHead()` is losing today is shared by **four** marks
— comet, telescope, moth and saturn, not quill alone — and each of the four goes visually flat unless
its own flourish is rebuilt onto the *tool* geometry surrounding the point, which is four small
retrofits the existing cost table does not carry. The six missing tool geometries — the ochre crayon,
the rush brush, the armillary sighting tube, the alidade, the probe's sensor boresight, the replication
core — are built in this sub-stage as ordinary functions in the same shape as the five that ship, and
can be visually checked one at a time against a plate-boolean or a dev toggle; they do not yet need to
be *selected by era*, because nothing that can select by era exists yet.

**2b — keying the tool to the era, folded into Stage 3.** `drawPlayer()`'s `OBSERVER_MARKS[cosmetic
('mark')]` lookup (`effects.js:509`) cannot be replaced with an era-first lookup before an
`eraId()`-equivalent accessor exists anywhere in the codebase — confirmed by grep: there is none today.
This half of the Observer Core work is therefore not schedulable inside this stage at all; it moves
into Stage 3, immediately after `eraIndex` lands, and it carries with it a genuine persisted-state
migration `ARCHITECTURE.md` and `OBSERVER-CORE.md` do not name: a player who has already unlocked and
equipped `telescope` (`ledger.js:106–113,205–206`, today a flat, global, catalogue-wide choice) will
either see a spyglass drawn in the Palaeolithic, if `drawPlayer()` naively keeps reading `cosmetic
('mark')` unconditionally, or lose the ability to equip what they earned outside era V, if it does not
— both are real regressions to the already-shipped `orbit.cosmetics.v1` value. Per `CLAUDE.md`'s own
contract on persisted state, this is a migrate-forward job, not an in-place mutation: the stored value
is read once, `telescope` and `quill` are recognised as era defaults rather than catalogue choices, and
`comet`/`moth`/`saturn` are rescoped as era V's own cosmetic sub-choices, bumping and migrating
`orbit.cosmetics.v1` the way `ledger.js`'s `migrateRecords()` already does for the ledger.

**Why here, and not earlier or later.** Nearly all of 2a is independent render-layer work against a
cosmetic system that already exists, so it de-risks "can six new tool silhouettes be drawn and read at
speed, one-handed, at the chart's top speed" well before the harder era plumbing has to exist — and it
produces an asset, the reed brush, that Stage 3's Ceiling integration needs immediately. 2b cannot move
earlier because the accessor it needs does not exist before Stage 3, and it should not move later than
"immediately after `eraIndex` lands" because every stage after it (the ledger, the transition) assumes
a tool is already reading the correct era.

**Files touched.** `src/effects.js` (`markHead()`, `OBSERVER_MARKS`, the six new tool functions);
`src/ledger.js` (`COSMETIC_KINDS`, `cosmeticItems()`, `setCosmetic()`, the `orbit.cosmetics.v1`
migration, in 2b); `src/ui.js` (the catalogue's `mark` section, scoped to era V, in 2b).

**How it is proven.** A rendered-frame check (2a) that every mark ends by calling the exact same
argument-free `markHead()` — not a fifth reimplementation — and that `OBSERVER_MARKS.quill` no longer
returns `true` or draws a second point primitive. `verify.mjs:867`'s existing assertion, `'A refused
selection leaves the default in place'`, must keep passing through 2a unchanged (the selection mechanism
itself has not moved yet) and must be **rewritten**, not merely re-passed, once 2b lands, since the
default it protects becomes era-conditional rather than the fixed `'quill'` fallback. A new fixture
(2b) confirms an existing saved `cosmetics.mark:'telescope'` value survives the migration without
throwing and without silently granting a Palaeolithic spyglass.

**Backing out.** 2a is isolated to `effects.js`; reverting it restores the five shipped marks exactly as
they draw today. 2b touches persisted state, so backing it out after ship means a second migration step,
not a plain revert — which is itself a reason to get the `orbit.cosmetics.v1` migration right the first
time rather than iterating on it against real saved data.

### Stage 3 — The era as a runtime concept, proven with two eras live

**What lands.** Everything ARCHITECTURE.md calls "the spine" except the ledger and the designation,
proven end-to-end with the two renderers the game already half-owns: era VI (the Lens, the shipped
default plate) and era II (the Ceiling, `src/ceiling.js`, ~1,700 lines, shipped as an isolated sandbox).

- **`eraIndex`, one render-side count, and what its number means.** A `let eraIndex=1` beside
  `plateName`/`dailyOn`/`difficulty` in `plates.js`, plus an `eraId()`-style accessor. `OrbitWorld`
  itself never counts eras; per rule 1 it only ever holds the current era's economy row, ledger
  accumulator and one node flag — all three land in Stage 4, not here. `eraIndex` **is** the historical
  ordinal, I=1 through VIII=8, not an independent renderer-selection count: `DANGERS.md`'s decided
  resolution climbs the eight eras strictly in order for every run, starting at era I, so a count that
  begins at `1` and increments once per transition designation (`ARCHITECTURE.md` item 1) lands on the
  same number the ladder tables elsewhere (`PROGRESSION.md`, `ECONOMY.md`, the per-era files `01`–`08`)
  already use — Stage 4's per-era ledger thresholds and Stage 7's "reaching era VIII" check both read
  it this way, and this stage should say so rather than leave it implicit. For this stage, `eraIndex` is
  advanced by nothing automatic yet; a dev-only toggle flips it between `2` (II, the Ceiling) and `6`
  (VI, the Lens) — the two eras this stage actually proves, numbered as they will be for the rest of the
  ladder — so the switching machinery below can be tested before anything can trigger it during play,
  without the fixtures or the toggle needing renumbering once Stage 8 fills in the other six eras.
- **Ceiling wired out of its sandbox, in full, not just its scoring bypasses.** `ARCHITECTURE.md`'s item
  6 names four bypasses — `currentBest()` returns `0` outright whenever `ceilingPlate()` is true
  (`plates.js:113`); `recordBest()` early-returns (`:117`); `ledgerCommit()` is skipped in `ui.js`
  (`:468`); and `render()` takes a wholly separate branch to `renderCeiling()` (`frame.js:406–408`) that
  bypasses the ordinary draw sequence entirely. All four are removed here, and the fourth is the one the
  standing plan under-weights: it is not only scoring debt, it is a rendering-architecture blocker.
  `OBSERVER-CORE.md`'s own cross-dissolve transition technique — call the outgoing era's tool and the
  incoming era's tool in the same frame, at complementary alpha — cannot apply to any transition
  touching era II until `render()`'s early return is gone, because today the atlas's draw sequence and
  `renderCeiling()`'s draw sequence physically cannot run in the same frame. Folding Ceiling into the
  shared per-frame pipeline (branching on `eraId()` at each of the seams `ARCHITECTURE.md`'s three
  obstacles already name — `onPaper()`, hazard depiction, the burin primitives — rather than keeping a
  second full pipeline) is therefore load-bearing for Stage 5, not optional tidiness, and it belongs
  here rather than being deferred to "whenever someone gets to it."
- **A fourth seam `ARCHITECTURE.md`'s three obstacles miss: the player-draw seam.** `ceilingDrawPlayer()`
  (`ceiling.js:1350`) draws the solar night barque today and calls neither `OBSERVER_MARKS` nor
  `markHead()` — it is not a variant of the shared `drawPlayer()`, it is a wholly separate function. Per
  `OBSERVER-CORE.md`'s "The solar night barque, retired," the brief requires this function itself to be
  rewritten so a reed brush (Stage 2a's tool geometry) carries the Observer Core at its wet tip in place
  of the barque; the barque stays on the sheet as a mythological motif elsewhere, only the player-draw
  role moves. This branches `ceilingDrawPlayer()` by `eraId()` the same way the three seams above are
  branched, and it lands here, once `eraId()` exists and Stage 2a's tool geometries are built — not in
  Stage 2, which builds the geometry but has no accessor yet to select by era.
- **Every cache era-keyed, and the two singletons the standing plan miscounts.** `regionPlates`,
  `celestialPlates`, `ringSprites`, `glowSprites`, `flareSprites`, `nebulaSprites`, `figureLayers` and
  the `glyphs` LRU all fold an era id into their existing key string, exactly as `ARCHITECTURE.md`'s
  item 3 describes. Two more singletons need the same conversion and are not free the way item 3's
  framing implies: `laidTile`/`laidSheet` (`plates.js:430–465`) are single-slot caches with an equality
  check, structurally identical to `backdrop`, not the already-keyed, Map-like caches item 3 files them
  beside — and unlike `backdrop`, `laidPaper()`/`laidSheetFor()` run on the hot per-frame path
  (`drawLaidPaper()`, `frame.js:418`), so a two-era working set on a single-slot cache means a full
  rebuild every frame rather than a one-time conversion, which is a real, currently uncosted risk on a
  path that already runs sixty times a second. `grain`/`grainSheetCanvas` (`plates.js:371`,
  `celestial.js`) is a third singleton in the same family, also unpriced anywhere in the standing plan.
  All three become small maps, holding at most two entries, exactly as `backdrop` must.
- **`backdrop` becomes a map, and `pageTurn()`/`drawSheetEdge()` stop being called from here.** The
  two-sheet residency `backdrop` needs for a transition is the reused half of `ARCHITECTURE.md`'s item
  4; the compositing that used to draw through it — a slide — is retired in Stage 5, not here. This
  stage only needs both eras' backdrops able to exist in memory at once and to be selected correctly.
- **`data-era` DOM chrome.** `syncPlate()` gains `data-era`; `index.html` gains one `[data-era="…"]`
  rule per era carrying six colours and three `--face-*` tokens, exactly as `[data-plate-id="ceiling"]`
  (`index.html:27–31`) already proves works for one plate; `[data-plate-id]` narrows to mean a cosmetic
  variation *inside* the current era, never the era itself.
- **The daily's era, named here because nothing else in this document schedules it.** `DANGERS.md`'s
  decided resolution and `ARCHITECTURE.md` item 6 both commit the daily plate to naming a seed *and* an
  era, its era rotating through the ladder for every player on a given date — "its era is a second pure
  function of the date," beside the existing `dayStamp` seed function (`plates.js:61`). This needs
  `eraId()` to exist and nothing more, so it lands here rather than waiting on the ledger or the
  transition: a second pure function of the date in `plates.js`, read wherever the daily currently reads
  its seed. `orbit.dailyLog.v1` keeps its existing `{date:{best,plays}}` shape unchanged — a day has one
  era, so nothing new needs storing per date, only computing.

**The one risk this stage owes an honest answer, not a deferral.** The single global `ink` object
(`plates.js:302`, reassigned wholesale by `applyPlate()`/`setPlate()`) is read by roughly 220 call
sites across every render file. Keying a cache by era stops two eras' art from colliding once both are
baked, but it does not stop a cache-miss rebake from running under whichever era's `ink` happens to be
globally active at that instant — which, mid-transition, is required to already be the *incoming* era
while the *outgoing* era's own sheet may still need a rebake because its own bounded LRU evicted an
entry under exactly the doubled pressure a transition creates (both eras' working sets resident at
once, roughly doubling eviction pressure on every capped cache in the list above). That reproduces, as
a structural property of *every* bake function, the exact bug `ARCHITECTURE.md` warns about for
`glyphs` alone ("a body baked in the Astrolabe's brass... blitted onto the Lens's glass"). This stage's
answer, chosen because it is the smallest fix that is actually correct rather than the smallest fix
that is merely cheap: raise the capped LRUs' ceilings enough that an outgoing era's resident set
survives a transition window without eviction (a tuning number, not new architecture), and audit every
bake function's implicit `ink`/`plateName` read for whether it needs to become an explicit argument
only where a two-era transition can actually provoke a miss — which, per the code as it stands, is
every bake function that a transition's decay-to-completion (Stage 5) or growth-outward compositing can
call for the outgoing era after the incoming era's `ink` has already switched. Threading an explicit
era argument through all ~220 call sites is deliberately **not** done here — see "What is deliberately
not in v1" below — in favour of the narrower cap-raising fix, checked against the concrete regression
test named below.

**Why here, and not earlier or later.** You cannot test "does a designated capture correctly advance
`eraIndex` and swap the render tokens" (Stage 4) against an era system that has never been shown to
actually switch anything — that would be testing a transition mechanism against era plumbing that has
never rendered two different things side by side. Proving two real eras live in one run, manually
toggled, before building the automatic mechanism that switches between them is the same discipline
`ARCHITECTURE.md`'s own "prove it before drawing" passage already argues for. This is also, on the
strength of the scouts' findings, a bigger and more foundational stage than OVERVIEW's build order
credits it as — it is where the Ceiling stops being a sandbox in the rendering-architecture sense, not
merely the scoring sense, and Stage 5's transition technique is not buildable without that being true
first.

**Files touched.** `src/plates.js` (`eraIndex`, `eraId()`, the daily's date-to-era pure function, the
map conversions for `laidTile`, `laidSheet`, `grain`, `backdrop`, `syncPlate()`'s `data-era`);
`src/frame.js` (`render()`'s
`ceilingPlate()` early return, removed in favour of `eraId()` branches at the existing seams);
`src/ui.js` (`ledgerCommit()`'s skip, removed); `src/celestial.js`, `src/marks.js`, `src/figures.js`,
`src/planets.js` (cache keys); `src/ceiling.js` (`ceilingDrawPlayer()`, branched by `eraId()` to draw
the reed brush in place of the barque, per the fourth seam above); `src/index.html` (`[data-era]`
rules).

**How it is proven.** A run that flips the dev toggle mid-flight renders the Ceiling's wall and the
Lens's plate correctly on either side of the flip with no dropped frame, including the player craft
itself: the reed brush on the Ceiling side, the shipped `quill` default on the Lens side. New
`verify.mjs` assertions: two different eras' `regionPlate`/`celestialPlate`/`glyph` cache entries at the
same within-era index never collide (bake one under era A's tokens, one under B's, assert the keys and
the cached objects differ); `laidPaper()`/`laidSheetFor()`/`paintBackdrop()` each return a cache hit,
not a rebuild, when queried for two different eras' keys within the same simulated frame; `resize()`'s
existing unconditional `backdrop=paintBackdrop()` repaint is checked against the two-entry map (it now
repaints up to two canvases on a resize, not one — a real, previously unpriced cost on a path that
already existed, worth a fixture rather than a surprise). The existing `plateIds` loop
(`verify.mjs:842,1078`) is extended to loop era ids the same way, so a new era is smoke-tested the
moment it is registered. A fixture asserts the daily's date-to-era function is deterministic: two
independently constructed `OrbitWorld`s built for the same date pick the same seed and the same era.

**Backing out.** The most expensive stage in this document to reverse cleanly, precisely because so
much of the rest of the plan is built on top of it once it lands — the cache keys, the removed
`render()` bypass and the map conversions touch code that Stage 4 through Stage 8 all assume is already
in the shape this stage leaves it in. Land it in small, separately revertible commits (the `eraIndex`
accessor; the Ceiling-bypass removal; the cache-key folding; the singleton-to-map conversions) rather
than one large change, specifically so that if one piece is wrong it can be rolled back without taking
the others with it.

### Stage 4 — The observation ledger and the transition designation

**What lands.** The economy row (`ECONOMY.md`) and the observation ledger (`PROGRESSION.md`) as
construction options and a per-run accumulator on `OrbitWorld`; the release dividend's completeness
multiplier; and the designation search, corrected against three real gaps the scouts found in the
"search once, set a flag" framing both `ARCHITECTURE.md` item 2 and `PROGRESSION.md` state it in.

- **The `ECONOMY` row** sits beside `HAZARD_KINDS` inside the simulation markers. `OrbitWorld` takes it
  as a construction option and a setter used at a transition; `INK_REACH`, `INK_ORBIT_GAIN`,
  `INK_SLING_GAIN`, `INK_CAPTURE_GAIN` and `INK_PERFECT_GAIN` (`simulation.js:33–35`) become reads of
  `this.economy`, with the default row reproducing the shipped numbers exactly. **These two names stay
  bare top-level identifiers regardless of how the refactor is shaped**: `verify.mjs`'s sandbox
  construction (`:8`) destructures `INK_PERFECT_GAIN` and `INK_CAPTURE_GAIN` directly off the `vm`
  context, and `verify.mjs:408` uses them in its own assertion arithmetic — if either name stops
  existing as a top-level binding, `vm.runInContext` throws a `ReferenceError` before a single assertion
  runs, failing the entire suite with a low-level crash rather than a clear failure message. This is
  exactly the failure mode `CLAUDE.md`'s own instruction to update the destructuring list exists to
  prevent, and it is the easiest way to violate that instruction by accident, because the crash does not
  look like a missed update.
- **The release dividend's completeness multiplier**, read where the credit already happens
  (`capture()`, `simulation.js:578`) off `launch.sweep`, already written at `:550`:
  `dividend=(perfect?perfectGain:captureGain)×(1+skipped×0.5)×(RELEASE_FLOOR+(1−RELEASE_FLOOR)×
  releaseDocumented)`, `releaseDocumented=clamp(launch.sweep/SWEEP_FULL,0,1)` — deliberately **not**
  named `documented` bare, the way `ECONOMY.md:65–66` itself writes the formula: that source already
  commits the exact naming sin the next paragraph warns against, and this document should correct it
  here rather than repeat it uncritically. `SWEEP_FULL` is the **same** constant Stage 1 introduced,
  read from a **different** place (the just-departed orbit's carried `launch.sweep`, at the *next*
  capture) than Stage 1's `n.documented` (the just-released node's own frozen fraction, read by the
  renderer for as long as the node exists). These are two independently necessary computations that
  share one formula and one constant and must never be confused for one another or given names that
  invite the confusion — see "What is genuinely hard," below. `RELEASE_FLOOR`'s value is not settled —
  `ECONOMY.md:69` calls it provisional, echoing the ledger's own `0.35` as a starting point, and leaves
  the real number to the score-distribution probe — but it must land **strictly less than `1`** for this
  stage's own proof to hold: at `RELEASE_FLOOR=1` the multiplier collapses to `1` regardless of
  `releaseDocumented`, and both the `:392–411` fixture rewrite and the ~forty-site `.release()` audit
  below, which this document asserts will change behaviour, would in fact leave every one of those sites
  passing unchanged. `p.launch` can be `null` here: a direct `capture()` call with no prior `release()`
  — `verify.mjs`'s own "the three opening targets never turn a landing away" fixture (`~:269–273`) does
  exactly this on a `difficultyChoice` node — must not throw reading `l.sweep` off a null `l`; the fix is
  to treat `l===null` as `releaseDocumented=1`, preserving today's behaviour on that path exactly.
- **The observation ledger**, `world.era.ledger` or similarly named so it cannot be mistaken for the
  existing `OBSERVATIONS` feats table (`simulation.js:159`) — `PROGRESSION.md` names this trap
  explicitly and it is worth repeating here because it is the kind of mistake that compiles. Each
  capture contributes `0.35+0.65×releaseDocumented` (the same value the dividend just computed) to the
  current era's accumulator; crossing a per-era threshold arms the era.
- **The designation search, corrected.** Once armed, the simulation searches `this.nodes` for the
  lowest-row unvisited node satisfying `Number.isInteger(n.row) && n.type!=='gold' &&
  n.type!=='shield' && n.routeRole!=='star'` — mirroring `verify.mjs:663`'s own definition of a main
  node — **and, beyond what either planning document currently states, also excluding `n.type===
  'fading'` and any node carrying `n.difficultyChoice`.** A `fading` node dies after 4.5 seconds of
  orbit (`simulation.js:702`); if one were ever designated, `PROGRESSION.md`'s own ten-step transition,
  which requires staying safely orbiting the transition object through several animated steps, could end
  in the run dying mid-transition — a failure mode neither document currently flags, because both
  `verify.mjs:663`'s own main-node filter and the plan's "eligible" wording let `fading` through. The
  three difficulty-choice nodes at row 1 (`simulation.js:319–320`) pass the same filter and are excluded
  for the same reason, even though the ledger cannot practically arm before the very first capture makes
  it moot today — excluding them is one clause, and leaving the gap open invites a future edit to widen
  it without noticing. **The search is not one-shot.** Main-route nodes are routinely skipped by design
  — `capture()`'s own `skipped`/`skipBonus`/`skipFive` machinery (`:573,588,603`) exists to reward
  exactly this — and a skipped, uncaptured node is pruned permanently once the darkness passes it
  (`this.nodes=this.nodes.filter(n=>n===p.node||n.y<pruneY)`, `:744–746`), with no exemption for a
  flagged-but-uncaptured node and no way for `flightStep`'s collision loop (`:222`) to ever find it
  again. A one-shot "search once at arming, wait for capture" implementation strands the transition
  permanently for exactly the players most likely to trigger it — skip-optimising, high-score play,
  which the game explicitly rewards. The search therefore re-runs on every `generateRow()`/prune while
  armed-and-undesignated, and if the previously-flagged node is pruned before capture, the flag moves
  forward to whatever now-eligible node takes its place. A second, smaller correction: the look-ahead
  margin (`ensureAhead()`'s `350` units, `:518`) shrinks in row-count terms as a run deepens (row
  spacing grows, per `verify.mjs:668`'s own "a deep crossing must be far longer than an opening one"),
  so "the next eligible main node already dealt" can legitimately not exist yet at the instant of
  arming — the search must tolerate coming up empty and simply try again on the next row, not treat
  emptiness as an error.

**Why here, and not earlier.** This is the mechanism that moves a run from one era to the next, which
has no honest test until at least two eras exist and have been shown to switch cleanly — Stage 3's job.
Building it earlier would mean testing a transition trigger against era plumbing that had never
actually rendered two different things.

**Files touched.** `src/simulation.js` (`ECONOMY`, the ledger field, the designation search and its
re-run/carry-forward logic, the dividend's multiplier and null-guard); `scripts/verify.mjs`
(destructuring list gains `ECONOMY`, the ledger field name, the designation flag name).
`HARVEST_MATERIALS` is not this stage's to add — `ECONOMY.md` files it beside `ECONOMY` in the same
breath, but nothing in this stage's own scope defines a harvest, a material tally or a bill; it is the
Probe's own top-level const, and belongs in Stage 8's files-touched line (see the Probe item there),
declared and destructured only once the Probe's harvest-and-replicate machinery actually exists. Adding
it here before that const exists in `simulation.js` is exactly the silent-`ReferenceError` failure mode
the paragraph above warns about for `INK_PERFECT_GAIN`/`INK_CAPTURE_GAIN`.

**How it is proven.** The existing invariants at `verify.mjs:684` and `:693` need no change in shape —
neither serializes a new field — but need a fixture that actually crosses an era boundary mid-flight,
since both currently fly a single, era-blind chart to row 40. New fixtures: a run that deliberately
skips past the node that would have been designated (mirroring the shipped `skipFive`-style skip test)
still transitions on a later main node, never stranding the run; a run whose designation search lands at the
shallowest point of `ensureAhead()`'s frontier (immediately after a large skip) does not throw or
silently no-op when nothing eligible exists yet; a designated node is never `fading` and never carries
`n.difficultyChoice`; the direct-`capture()`-with-no-`release()` path (`~:269–273`) does not throw once
the dividend reads `l.sweep`. **`verify.mjs:392–411`'s existing "skipped orbit pays half the dividend"
fixture must be rewritten, not merely left to pass**: it calls `release()` immediately after `start()`
with no intervening `update()`, so `p.orbitSweep` — and therefore `l.sweep` — is exactly `0` at release,
and it currently asserts the full, unscaled dividend. Once the completeness multiplier lands, that
assertion is wrong by construction unless `releaseDocumented=0` is deliberately what the fixture now
checks for — which is only true once `RELEASE_FLOOR` is actually set below `1`; audit the other roughly
forty call sites in `verify.mjs` that call `.release()` for the same near-zero-sweep pattern before
trusting them unchanged. A new fixture asserts the default `ECONOMY` row's five fields equal today's
shipped `INK_*` constants exactly, catching an accidental default drift the same way `verify.mjs`
already catches other constant drift.

**Backing out.** Additive and isolated to the three fields rule 1 already names. Deleting the search
function, the ledger field and the `ECONOMY` construction option (leaving the default row as today's
bare constants) fully reverts this stage without touching Stage 3's plumbing underneath it.

### Stage 5 — The ten-step transition

**What lands.** The choreography `PROGRESSION.md` specifies in full: the world's forward scroll eases
independently of the frontier's own rate (a new pacing state — the two have always moved together
until now); the frontier's decay runs to completion across the whole outgoing sheet rather than to its
ordinary trailing shoreline; the transition object and the Observer Core are immune to it by
construction, since neither the decay's own painter nor any transition code ever names them; and the
new era's backdrop grows outward from the transition object's position rather than sliding up from
below the frame. `pageTurn()` and `drawSheetEdge()` (`celestial.js:703,705`) are **not deleted yet** —
they stay in the tree, simply uncalled from this new path, specifically so that if the growth
compositing below does not work, backing out this stage means flipping one call site back to the old
function rather than resurrecting deleted code.

**The largest piece of new render engineering in the plan, named plainly rather than folded into
"reuse" — though not, on inspection, built from nothing.** Stage 3's `backdrop`-as-a-map is genuinely
reused infrastructure; the *compositing that draws through it* mostly is not. `pageTurn(mix)`'s cubic
ease is a slide — a fresh sheet crossing the frame over the old one — and no code today grows the
*backdrop* outward from a point the way step 9 requires. But the underlying primitive is not
unprecedented: `landContour()` (`planets.js:8`) already draws an irregular closed contour at a given
radius from a seeded point, and `reveal.js` already animates it growing outward from a point over a
`0..1` progress value, twice — `revealPlanet()`'s wash bloom (`grow=core*2.2*pen.wash`, `reveal.js:186`)
and `revealHazard()`'s ink-drop spread (`r*1.4*drop`, `reveal.js:232`). That is structurally the exact
primitive step 9 needs — an expanding irregular clip driven by a progress fraction — just at planet and
hazard scale, not full-screen scale. The new work here is scaling that primitive to a full-screen,
multi-second, two-layer composite, and building the layering/timing choreography around it, not
inventing the growth mechanic itself from zero. That distinction does not change the verdict: by the
standing plan's own honest accounting and this document's agreement with it, this is still the single
largest piece of genuinely new render engineering in the whole redesign, and it should be spiked first,
against whatever placeholder decay technique already exists (Stage 3's two eras' shared, unstyled decay
is enough — the real eight-material table is Stage 6's job, not this one), so that a bug in the growth
compositing is never confused with a bug in a decay technique that has not been built yet.

**Why here, and not earlier or later.** Every one of the ten steps names the transition object or the
designation directly — there is nothing to animate a transition around until Stage 4's designation
exists to flag something. It must not wait for Stage 6's full per-era decay table, because the
choreography (the pause, the catch-up, the decay-to-completion timing, the growth outward) is orthogonal
to which material is decaying, and proving the mechanism against a placeholder is strictly cheaper than
proving it against eight not-yet-built techniques at once.

**Files touched.** `src/celestial.js` (the new growth compositing, replacing the call sites that used to
reach `pageTurn()`/`drawSheetEdge()`); `src/simulation.js` (the new pacing state that decouples the
world's scroll from the frontier's rate — a small addition, since the two quantities are already
separate in the simulation, per `THE-FRONTIER.md`'s own "what holds, unchanged").

**How it is proven.** Manually first: trigger a transition (via Stage 4's designation, on the two eras
Stage 3 proved) and confirm, frame by frame, that the transition object and the Observer Core never
flicker, dim, or get caught by the decay consuming everything around them, and that the new era's
backdrop is visibly growing from a point rather than arriving from an edge. `THE-FRONTIER.md`'s existing
simulation-level invariants — `'The reward must move visible darkness away'` (`verify.mjs:805`),
`'Pausing preserves the reprieve'` (`:807`), `'Darkness resumes after the reward'` (`:809`), and the
perfect-streak relief assertion (`~:1518`) — must all keep passing unchanged, since all four exercise
`OrbitWorld` directly and none of them can see a render-side transition; that is itself proof the
simulation half of this stage is inert to the render change, by construction, not merely by claim.

**Backing out.** Flip the call sites back to `pageTurn()`/`drawSheetEdge()`, which are still in the
tree. The new pacing state is a small, additive field in the simulation and can be left in place unused
without side effects if the render half is reverted.

### Stage 6 — The frontier's own decay, generalised

**What lands.** The shared call site `THE-FRONTIER.md`'s own "what it may cost, drawn" section already
proposes: an era-keyed table of decay *techniques* sitting beside `darknessPlate()`, in the same shape
`ARCHITECTURE.md`'s `STROKE_STYLES[era]` seam already takes for stroke primitives — one small
cache-filling routine per era, behind one shared call, rather than eight new things a frame has to pay
for. `darknessPlates` (keyed by `relief` alone today, `effects.js:526,587`) folds era into its key
alongside Stage 3's other cache conversions. Only as many techniques are actually authored here as eras
exist at this point in the plan — Ceiling's and Lens's, since those are the two eras Stage 3 proved —
and the table grows one row per era as Stage 8 builds each one, rather than all eight being written at
once.

**Two things the standing plan gets wrong about the one shipped precedent, corrected here rather than
repeated.** `darkMarginalia` (`leviathanSprite()`/`glossSprite()`, `effects.js:594–652`) is **not** the
"unkeyed singleton" `ARCHITECTURE.md`'s item 3 files it as — its cache keys already include `plateName`
(`:595,640`) alongside `relief`, `scale` and `DPR`; the real gap is that no shipped era has generalised
this motif at all, the one shipped second era simply **dropped** it, per `ceiling.js`'s own comment
(`:1548–1549`) declining to build a second serpent and repurposing an existing hazard instead. Second,
and more consequential: `ARCHITECTURE.md`'s claim that a new era's decay is "entirely a re-skin of
`drawDark()` ... branched on `eraId()` the way `onPaper()` branches ink today" is contradicted by its
own cited proof. `ceilingDrawDark()` (`ceiling.js:1575–1631`) is not a branch inside `drawDark()`,
`leviathanSprite()` or `glossSprite()` — it is a wholly separate top-level function with its own
edge-geometry (`ceilingFractureEdge()`, `:1565–1574`, computed live from scratch every frame rather than
baked once, unlike `darknessPlate()`'s cache-once-blit-many canvas) and its own debris table
(`CEILING_DEBRIS`, `:1552–1558`), sharing zero code and zero cache with the atlas's implementation. The
actual, honest precedent this stage should follow is therefore not "one more branch in the shared
function," but the model `ARCHITECTURE.md`'s own obstacle 3 already sets for the burin primitives: a
named technique per era behind one seam, where a materially different motif — a fracture instead of a
flood — is free to be its own function as long as it answers the same call site and respects the same
shoreline discipline. `ceilingFractureEdge()`'s own per-frame allocation should not be copied into the
new table's other rows; it is a discipline violation against the project's own stated principle that
nothing generative runs per frame, worth fixing when Ceiling's decay is folded into the shared system
rather than propagated to every era after it.

**A naming landmine, not a bug, worth flagging before someone hits it.** `darknessRelief` names two
unrelated things in one shared global scope: a render-side smoothed tint global (`plates.js`) and
`OrbitWorld.prototype.darknessRelief()` (`simulation.js:534`), a perfect-streak discount on
`darknessSpeed()`. They are already independently re-derived, not shared, in `effects.js:706` and
`ceiling.js:1577`. A third era's decay function is on track to either collide with the render-side name
or paste the same lerp a third time; give the render-side global a name that cannot be mistaken for the
simulation method when this stage's table is written.

**Why here, and not earlier.** Stage 5's transition needs *some* decay running to completion, but does
not need the real eight-material table to prove its choreography — a shared, unstyled decay is enough,
and building the table before the choreography exists would mean authoring content for a mechanism not
yet known to work. It comes after Stage 5 rather than being folded into it because the table's rows are,
in practice, authored one per era as Stage 8 proceeds — this stage is really "build the shared seam,"
not "author eight techniques."

**Files touched.** `src/effects.js` (`darknessPlate()`'s era-keyed technique table, `darknessPlates`'
cache key); `src/ceiling.js` (folding `ceilingDrawDark()` into the shared seam rather than leaving it a
second, fully separate implementation, once Stage 3's `render()`-bypass removal makes that possible).

**How it is proven.** No assertion in `scripts/verify.mjs` can see this at all — it never loads
`effects.js`, `ceiling.js`, `backdrop.js` or `celestial.js`; it extracts and runs only the slice
between `simulation.js`'s markers. This is a real gap this document states rather than papers over: the
render-side correctness of a per-era decay technique, and whether two eras' decay caches ever collide
mid-transition, can only be checked by eye in a browser, or by the kind of structural cache-key
assertion Stage 3 already adds against the render harness (`verify.mjs`'s second `vm` context). Extend
that harness's assertions to cover the decay caches the same way Stage 3 covers the body caches.

**Backing out.** Per-row and additive; removing one era's technique from the table reverts that era to
whatever shared/generic decay existed before it, with no structural change anywhere else.

### Stage 7 — Endless mode

**What lands.** Reaching era VIII's own transition (Stage 4's designation, run once more) ends the
historical progression permanently. The four-entry chapter cap is lifted — but not by raising the
number — at every site that reads it: `ui.js:402` writes `chapter=Math.min(3,Math.floor
(world.progress/8))`; `celestial.js:485`, `celestial.js:732` and `frame.js:393` each instead write
`clamp(Math.floor(world.progress/8),0,3)`, a call through the project's `clamp` helper rather than the
same `Math.min` literal — equivalent in value given `progress>=0`, but a different shape, so "lift the
cap" means touching both call shapes at all four sites, not grepping for one literal and finding only
one of them; and `ledger.js:78` writes the closure differently again, `Math.min(4,Math.floor
((world.progress||0)/8)+1)`. Once every era owns its own backdrop outright (Stage 3), the four-entry
chapter array stops needing to mean anything past whichever single era still wants a within-era region
drift (most naturally the Lens's own three registers), and the chapter announcement and `deepestChapter`
record are retired once the ladder ends in favour of a value that keeps meaning something arbitrarily
far into a run that never stops — `GEN`, the count of replications a run has completed.

**`GEN` cannot honestly be "already there" at this stage, and this stage must not pretend otherwise.**
Stage 8, not this one, builds the Probe's harvest-and-replicate mechanic that gives `GEN` its meaning —
it is item 5 in Stage 8's own build order, built last, after the Rock, the Scroll, the Astrolabe, the
Engraving and the Flyby (see Stage 8, below). Stage 7 runs before Stage 8 in this document's own build
order, so a fixture in this stage asserting "`GEN` is readable and increasing" would be testing a field
that, by Stage 8's own account, does not exist yet. The honest scope for this stage is narrower: `GEN`
is introduced *here*, as a bare counter on `OrbitWorld` that starts at `0` and is not yet incremented by
anything — the endless-mode escalation curves below are keyed on `row` alone, never on `GEN`, until
Stage 8's replication mechanic exists to advance it. Stage 8's Probe item is then responsible for the
only two things that actually make `GEN` mean something: incrementing it when a bill is met, and wiring
the closure medal. This stage's own proof is limited to what it actually ships: `deepestChapter`'s
retirement does not break any existing ledger read, and `GEN` exists, reads `0` on a fresh world, and is
never touched by anything in this stage — not that it is "increasing," which is Stage 8's claim to make.

**What the standing plan does not cost, and this stage must.** `ARCHITECTURE.md`'s item 11 correctly
observes that the formulas gating difficulty — `chartPace(row)`, `chartGrowth(row)`, `darknessSpeed()`,
the row-gated hazard rules — are already unbounded functions of raw `row` with no dependency on
`chapter` at all, and concludes the endless-mode engineering bill is mostly "lift a render bookkeeping
cap." That is true of the cap. It is not true of the curves underneath it, and the gap matters because
"escalate on machinery the game already owns" is the plan's own stated premise for why endless mode is
supposed to be cheap. `chartPace`'s own clamp, `(row-3)/25` to `[0,1]`, plateaus by design around row
28. `darknessSpeed()` carries a **second**, independent plateau `ARCHITECTURE.md` does not mention at
all: its wall-clock term, `Math.min(128,Math.max(0,this.elapsed-1.5)*.55)` (`simulation.js:539`),
saturates once elapsed time passes roughly 236 seconds regardless of row, and `darknessMult` — set once
at the difficulty choice and never touched again — is not a live escalation knob a run can turn during
play. Hazard radius's own row term caps at `k≈57` (`generateRow()`'s `Math.min(8,k*.14)`). Nebula radius
is hard-capped at `90` with no row term at all — only spawn cadence, never size, is row-gated. Wind's
reach and force, and the gravity pull coefficient, are pure constants with zero row dependence. A long
endless run therefore hits a **fully flat** escalation on most of the brief's own named dimensions
(stronger gravitational anomalies, higher speeds, larger gaps) well before an eight-era historical climb
even finishes, independent of which century the run has reached — this is new, unbounded, row-or-`GEN`-
keyed math this stage must actually write, for at least the pace clamp's ceiling, the darkness-speed
elapsed clamp, the hazard-radius term, the pull constant, `WIND_FORCE`, and the nebula radius cap, not a
cap this stage merely lifts.

**Why here, and not with Stage 8's Probe.** Endless mode is a statement about what happens once the
ladder runs out, so it has no object to operate on until era VIII exists as a concept the game can
finish — but most of the actual engineering above is independent of the Probe's own art and can be
validated against the *existing*, already-far-past-row-40 game the moment the ledger, designation and
transition machinery (Stages 4–5) are proven, well ahead of the Probe's signature sheet.

**Files touched.** `src/simulation.js` (the new unbounded post-VIII curves for pace, darkness speed,
hazard radius, wind and pull; the bare `GEN` counter on `OrbitWorld`, starting at `0`, not yet
incremented by anything); `src/ui.js`, `src/celestial.js`, `src/frame.js` (the chapter-cap retirement,
at each of the two call shapes named above); `src/ledger.js` (`deepestChapter`'s retirement). Per
`ARCHITECTURE.md`'s item 6, `orbit.ledger.v1` bumps its version suffix and `migrateRecords()`
(`ledger.js:38–44`) gains `deepestEra` and `maxGen` as new fields migrated forward from the old
`deepestChapter`/`deepestHardcoreChapter` shape — `deepestChapter`'s last recorded value seeds
`deepestEra` — rather than mutating the stored shape in place, the same discipline Stage 2b already
applies to `orbit.cosmetics.v1`. The closure medal itself is a Stage 8 field: it has nothing to record
until Stage 8's Probe defines what closure is, so it is named here only as a slot `migrateRecords()`
reserves, not one this stage populates.

**How it is proven.** Extend `scripts/verify.mjs`'s existing long-run courses (the sixty-seed,
row-48 tangent-seeking pilot already in the suite) well past row 48 into the post-VIII regime, and
assert the escalation curves are still visibly increasing at row 200 and row 500, not flat — the direct,
checkable form of the gap named above. A fixture confirming `deepestChapter`'s retirement does not break
any existing ledger read, that `GEN` exists and reads `0` on a fresh world (not that it increases — see
above), and that an old saved ledger record survives the `orbit.ledger.v1` migration with `deepestEra`
correctly seeded from its old `deepestChapter` value.

**Backing out.** The new curves are additive parallel math; if an unbounded post-Probe difficulty proves
unfun rather than merely hard to tune, clamp it back down to the existing pre-VIII ceilings — the risk
here is tuning, not architecture.

### Stage 8 — The eras themselves

**What lands, in order.** Per era, roughly what `ARCHITECTURE.md`'s own itemised cost table already
lists — an economy row and ledger threshold, token overrides for the fourteen registered sections, a
`data-era` DOM rule, a backdrop painter, a body painter (a point painter for eras I–V, a family painter
for VI's three registers and beyond), the three reveal cells (Stage 1's table extended per era), the
completion flourish (Stage 1's detection site, given this era's own seal/wash/lock-of-focus art), a tool
geometry (Stage 2's roster), a frontier decay technique (Stage 6's table gains a row), a stroke style, hazard
depictions, a figure hand, faces, the signature sheet — "by a comfortable margin the dominant cost" per
`ARCHITECTURE.md`, since the existing Ceiling renderer alone is ~1,700 lines — sound, and, once anything
ships, README prose. **One item that checklist is missing, named nowhere else in this document either:**
`PROGRESSION.md`'s "the era's knowledge structure" — the remembered sky, the decan table, the star
chart, the assembling astrolabe, the atlas page, the plate catalogue, the mission map, the Probe's own
assembling blueprint. That document is explicit that this artefact *is* the progress display, read live
off `world.era.ledger` every frame as it fills — not the signature sheet, which is a static full-bleed
illustration checked once by eye and never touched again at runtime. Per era, this stage owes one
knowledge-structure painter, in `src/celestial.js` beside the signature sheet but a distinct function,
proven the way the reveal cells are: by eye against a fixture that fast-forwards `world.era.ledger`
through several fill levels and confirms the artefact visibly grows rather than jumping or stalling. The
order:

1. **VI, the Lens** — already the shipped default plate; the work here is confirming its render-side
   reveal table and its cache keys under Stage 3's and Stage 6's machinery, not building a sheet from
   nothing.
2. **II, the Ceiling** — a renderer already exists at nearly the size of everything else in this list
   combined; its full removal from the sandbox lands in Stage 3. Its player tool does **not** land in
   Stages 2 or 3 as this document currently schedules them: Stage 2a builds the rush-brush *geometry* as
   one of the six new `OBSERVER_MARKS` functions, but `ceilingDrawPlayer()` (`ceiling.js:1350`) is a
   wholly separate function that today draws the solar night barque and never calls `OBSERVER_MARKS` or
   `markHead()` — grep confirms it only name-checks `OBSERVER_MARKS.quill` in a comment, for comparison.
   Neither Stage 2's nor Stage 3's files-touched lists name `src/ceiling.js`, and Stage 3's three named
   seams (`onPaper()`, hazard depiction, the burin primitives) do not include the player-draw seam. Per
   `OBSERVER-CORE.md`'s "The solar night barque, retired" and `OPEN-QUESTIONS.md`'s item 10, the brief
   requires `ceilingDrawPlayer()` itself to be rewritten so the reed brush carries the Observer Core at
   its wet tip in place of the barque — a concrete, load-bearing piece of work this document has not yet
   scheduled anywhere. It belongs in Stage 3, alongside Ceiling's other removal-from-sandbox work: branch
   `ceilingDrawPlayer()` by `eraId()` the same way the other three seams are branched, calling the reed
   brush's tool geometry (built in Stage 2a) in place of the barque draw. What remains here, once that
   line is added to Stage 3, is Ceiling's own per-era decay technique (Stage 6), its reveal-table entry
   (Stage 1), and its knowledge-structure painter (above).
3. **V, the Engraving, and VII, the Flyby** — the Engraving keeps the pre-telescopic atlas half already
   lettered under the old plan; the Flyby is wholly new construction but has its own dedicated research
   file (`research/space-age.md`) already written and carries no telescope-era three-register complexity.
4. **IV, the Astrolabe, then III, the Scroll, then I, the Rock** — three eras of one figure hand and one
   face each, in decreasing order of how much of their geometry already has a spike to build from. This
   ordering is chosen for engineering risk, not play order, and it is worth being explicit about the
   difference: the Rock is what every single run and every playtest of the whole ladder actually opens
   on, and its own file already flags an unresolved risk — whether its opening triad (the Moon, a bright
   star, a faint star, standing in for the pressures later eras show with a caption) reads at all on a
   sheet with no script to fall back on ([01-rock.md](01-rock.md)'s Risk section; [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)'s item on "the
   Rock's triad"). A full opening-to-endless playtest of the ladder is not possible until the Rock
   exists, so this stage should not wait until the Rock's full signature sheet is due to spike that one
   risk — pull a lightweight version of the opening triad forward, on the Rock's own already-Opus-verified
   prototype (`prototypes/rock.html`, per [PROTOTYPES.md](PROTOTYPES.md)), as soon as Stage 4's ledger needs a first era
   to arm out of, rather than treating "build order" and "when the ladder is first playable end to end"
   as the same date.
5. **VIII, the Probe** — last, because its harvest-and-replicate economy and the endless-mode escalation
   both need Stages 4 and 7 standing first, and because the ladder should close on the era it was built
   toward. Unlike the other seven eras on this list, the Probe is not a reskin of the generic per-era
   checklist above — `ECONOMY.md`'s own "Where it sits in the code" section commits it to real new
   simulation-side machinery: `HARVEST_MATERIALS`, declared beside `HAZARD_KINDS` and `ECONOMY` inside
   the simulation markers (this is where `HARVEST_MATERIALS` actually belongs — see Stage 4's
   files-touched note above, which corrects the standing plan's premature mention of it); `this.materials`,
   a four-slot tally on `OrbitWorld` filled only when a row's `harvest` flag is set; the replication bill
   and the `GEN` counter Stage 7 introduced at `0` — this item is what actually increments it, on a bill
   met, and records the closure medal the first time a bill is met at all; and the daughter's launch,
   reusing the constellation-completion event rather than a new one. This item also owes a HUD change
   (one aggregate ring in place of four gauges) and the two fixtures `ECONOMY.md` specifies, distinct
   from the generic per-era proof method below.

**Why this order, and where it departs from OVERVIEW.md.** This matches OVERVIEW.md's own stated order
almost exactly; the one addition is the explicit call above that build order and play order are
different axes, made because a scout's reading of [01-rock.md](01-rock.md) found a real, named, unresolved risk on
the one era every run and every playtest depends on first, and that risk should be spiked early rather
than discovered late.

**Files touched.** Per era: `src/celestial.js` (the signature sheet and the knowledge-structure
painter), `src/planets.js` (the body painter), `src/figures.js` (hazard depictions, the figure hand),
`src/effects.js` (Stage 6's decay row), `src/marks.js` (the stroke style), `assets/fonts.source.css` and
`scripts/glyphs.mjs`/`fonts.mjs` (faces), `src/audio.js` (the per-era note table), `src/index.html` (the
`[data-era]` rule); for II, the Ceiling, also `src/ceiling.js` (`ceilingDrawPlayer()`'s `eraId()`
branch, per Stage 3 above, if it has not already landed there). For VIII, the Probe, specifically —
distinct from the generic per-era list, and the reason item 5 above calls it out — `src/simulation.js`
(`HARVEST_MATERIALS`, `this.materials`, the replication bill, incrementing `GEN`, the closure medal),
`src/ui.js` (the aggregate-ring HUD replacing the four ink gauges), and `scripts/verify.mjs` (the two
fixtures `ECONOMY.md` specifies: a probe-row world and an ink-row world over the same seed producing
identical captures with different materials; a full-documentation run and a 90%-release run producing
the same chart with different ink totals).

**How it is proven.** `verify.mjs`'s `plateIds` loop already smoke-tests a new plate the moment it is
registered (`:842,1078`); Stage 3's era-id extension does the same for a new era. Each era's own
signature sheet is otherwise proven the way [PROTOTYPES.md](PROTOTYPES.md) already records — a standalone prototype,
checked by eye, against the painter budget that document sets. Each era's knowledge-structure painter is
proven the way the reveal cells are — by eye, against a fixture that fast-forwards `world.era.ledger`
through several fill levels and confirms the artefact visibly grows. The Probe's own harvest-and-replicate
machinery is proven separately, by the two `verify.mjs` fixtures named above, not by the generic per-era
checklist.

**Backing out.** Linear and per-era, exactly as `OVERVIEW.md`'s own cost model states: removing one
era's files does not touch any other era's, once the spine (Stages 1–7) is standing.

## The stop-and-check gates

This project's discipline is that nothing generative runs per frame, one seed deals one chart, and the
simulation stays DOM-free. The table below names the specific `verify.mjs` assertions each stage must
not break, quoted by name, and the new assertions each stage owes — collected here from the fuller
per-stage descriptions above so a reviewer has one place to check a change against.

| Stage | Must not break | New assertions owed |
|---|---|---|
| 1 · Reveal | `'One seed deals one chart'` (`:684`); `'How a run is flown cannot change the chart it is dealt'` (`:693`) | `n.documented` set correctly at release, untouched by later captures; a node held at death keeps reading live `orbitSweep`; a never-captured node reads `0`; a 4th already-documented node is not gated by `REVEAL_CAP`; the completion flourish fires exactly once on the `<1→1` crossing |
| 2 · Observer Core | `'A refused selection leaves the default in place'` (`:867`, through 2a only) | every mark ends at the one argument-free `markHead()`; `quill` no longer returns `true`; (2b) `:867` rewritten against an era-conditional default; a migrated `cosmetics.mark` value does not throw or grant a wrong-era tool |
| 3 · Era runtime | `plateIds` loop (`:842,1078`) | era ids loop the same way; two eras' cache entries at the same index never collide; `laidPaper()`/`laidSheetFor()`/`paintBackdrop()` hit, not rebuild, for two eras in one frame; `resize()` repaints both map entries |
| 4 · Ledger + designation | `:684`, `:693` (new fixture: crossing an era boundary mid-flight); `'no ink dividend is paid for a steep landing'`; the vm sandbox must not `ReferenceError` on `INK_PERFECT_GAIN`/`INK_CAPTURE_GAIN` | a skip-and-prune run still transitions later, never stranded; an empty-search moment does not throw; no `fading` or `difficultyChoice` node is ever designated; the null-`launch` capture path does not throw; `:392–411` rewritten, not left; default `ECONOMY` row matches shipped constants |
| 5 · Transition | `'The reward must move visible darkness away'` (`:805`); `'Pausing preserves the reprieve'` (`:807`); `'Darkness resumes after the reward'` (`:809`); the perfect-streak relief assertion (`~:1518`) | manual/visual only — the transition object and Core are never touched by the decay; the backdrop visibly grows from a point |
| 6 · Frontier decay | (render-only; no simulation assertion applies) | render-harness cache-key assertions extended to the decay caches |
| 7 · Endless mode | existing long-run courses (`~row 48` today) | escalation curves still rising at row 200 and row 500; `deepestChapter`'s retirement breaks no existing ledger read; `GEN` exists and reads `0` (Stage 8 owns "increasing"); an old saved ledger record migrates with `deepestEra` seeded correctly |
| 8 · Eras | `plateIds`/era-id loop | per-era prototype check against [PROTOTYPES.md](PROTOTYPES.md)'s painter budget |

Two contract items apply across every stage rather than to one: per `CLAUDE.md`, any new top-level name
the `BEGIN`/`END SIMULATION` slice exports and `verify.mjs` needs to see must be added to its
destructuring list (`:8–9`) — miss this and the failure is silent until a fixture that reads the new
name throws `undefined is not a function`, or, worse, is simply never written; and per rule 1
(`OVERVIEW.md`), any change that makes `HAZARD_KINDS`, `chartPace`, `chartGrowth`, `darknessSpeed` or
the row-gated spawn conditions consult era or chapter state anywhere is a rule violation regardless of
which stage introduces it, because it is exactly the change that would make two runs at the same row
stop meaning the same thing.

## What is genuinely hard, honestly ranked

1. **Where a half-documented body's state lives, given `orbitSweep` belongs to the player, not the
   node.** This is the central problem Stage 1 exists to solve, and it did not exist anywhere in the
   shipped code before this pass — not a detail ARCHITECTURE.md's "already exists, and is free" framing
   undersold, but a real gap. Made harder by the fact that the fix requires **two** independently
   necessary "documented" computations that share a formula and a constant but read different data at
   different times — Stage 1's `n.documented`, frozen once at release for the renderer's benefit, and
   Stage 4's `launch.sweep`-derived value, read once at the *next* capture for the ledger and the
   dividend — and giving them names or comments that let a future edit conflate them is the most likely
   way this whole mechanic quietly breaks after ship.
2. **The transition's growth compositing is the largest piece of new render engineering in the plan, at
   full-screen scale, though the underlying primitive already exists at smaller scale.** `pageTurn(mix)`'s
   cubic ease is a slide; no code today grows the *backdrop* outward from a point. But `landContour()`
   growing outward under a `0..1` progress fraction is already how `reveal.js` blooms a planet's wash and
   spreads a hazard's ink drop — the new work is scaling that primitive to a full-screen, multi-second,
   two-layer composite, not inventing the growth mechanic from nothing. This is still the single largest
   piece of genuinely new render engineering in the entire plan, and every planning document that touches
   it says so in the same words this document does — it is not a claim this pass is discovering, but it
   is the one piece of the plan least protected by precedent if the first implementation is wrong.
3. **Cache correctness during a live transition, because the global `ink` object is reassigned wholesale
   and read implicitly by ~220 call sites.** Keying a cache by era stops two eras' baked art from
   overwriting each other once both exist; it does not stop a cache-miss rebake, forced by the doubled
   eviction pressure a transition creates, from running under the wrong era's globally active tokens.
   Stage 3's chosen fix — raise the caps rather than thread an explicit era argument through every bake
   function — is the cheaper of two correct answers, not a guarantee; the regression test Stage 3 owes
   (two eras' cache entries at the same index, asserted to never collide) is what actually stands between
   this risk and a real, silent, hard-to-notice art bug.
4. **The designation's recovery path.** Main nodes are skippable by design, and the score system
   explicitly rewards skipping them; a skipped, uncaptured node is pruned and gone forever with no
   dangling-reference recovery anywhere in the collision loop. A "search once, wait for capture"
   implementation — which is what both `ARCHITECTURE.md` and `PROGRESSION.md` describe before this
   pass's correction — would permanently strand the era transition for exactly the players the game's
   own scoring rewards for playing well. This is the clearest case in the whole plan of a planning
   document being wrong in a way that would have shipped silently, since nothing in the existing test
   suite exercises a node after it is skipped and pruned.
5. **`frame.js`'s Ceiling bypass is a rendering-architecture blocker for the Observer Core's own
   transition technique, not merely scoring debt.** `ARCHITECTURE.md` item 6 names the four bypasses
   correctly but files them under "sandbox debt"; the cross-file dependency — that a cross-dissolve
   between two tools cannot run in the same frame until the two renderers share a frame at all — is real
   and is not stated anywhere in the standing plan.
6. **The Observer Core's persisted-state migration.** A player's already-shipped, already-equipped
   `telescope` cosmetic choice becomes meaningless the instant the tool is keyed to era rather than to
   player choice, and neither `ARCHITECTURE.md` nor `OBSERVER-CORE.md` names this as work. It is a real
   regression to real saved data if shipped without the migration Stage 2b specifies.
7. **Endless mode's escalation is mostly not free.** `chartPace`'s row clamp, `darknessSpeed()`'s
   *second*, independent elapsed-time clamp, the hazard-radius cap, the hard-capped nebula radius, and
   the constant wind/pull coefficients are all already flat well before an eight-era climb finishes,
   independent of era. "Lift the chapter cap" is not the engineering bill; new, unbounded, row-or-`GEN`-
   keyed curves for each of those are, and they did not exist in the standing plan's costing at all.
8. **Three specific claims the standing plan makes that do not hold, worth listing together so they are
   not repeated a second time by a future edit.** `ceilingDrawNode()` is not "the best existing model for
   the pre-capture/post-capture split" on the persistence question — it has no `orbitSweep` concept at
   all and is exactly as binary as `drawNode()`'s own `used` flag; `laidTile`/`laidSheet`/`grain` are not
   already-keyed, Map-like caches — they are single-slot singletons on the hot per-frame path, structurally
   identical to `backdrop`; `darkMarginalia` is not an "unkeyed singleton" — it is already keyed by
   `plateName`, and the real gap is that no shipped era has generalised the motif it caches, one simply
   dropped it.
9. **Smaller, real landmines.** The ledger/dividend formula must divide by `TAU*2/3`, never a literal
   `/240`, since `orbitSweep` accumulates in radians; renaming `INK_CAPTURE_GAIN`/`INK_PERFECT_GAIN`
   without keeping them as bare top-level identifiers fails the entire `verify.mjs` suite with a
   `ReferenceError` rather than a clear message; `darknessRelief` names two unrelated things in one
   shared global scope and a third era's decay function is on track to collide with it or re-derive its
   formula a third time; `ceilingFractureEdge()`'s per-frame allocation is a discipline violation against
   the project's own "nothing generative runs per frame" rule and should not be propagated into Stage 6's
   table.

## What is deliberately not in v1

- **"Open on" any era already reached.** Retired by `PROGRESSION.md` because an observation-gated ladder
  has no honest answer for designating a transition on an era whose ledger was never filled. Signal it
  is time to revisit: every era exists and a run's median pace through the whole ladder is actually
  known, per [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md).
- **An explicit era argument threaded through the ~220 call sites that implicitly read the global
  `ink`.** Stage 3 ships the narrower fix — raised LRU caps, checked by a collision regression test —
  rather than the structurally more complete one. Signal it is time to do the fuller threading: the
  regression test starts failing, or a transition is observed in the wild rendering an outgoing era's
  art in the incoming era's tokens.
- **A numeric progress gauge for `documented`.** Deliberately absent per the brief; the one concession
  is a small completion flourish. Signal it is time to add one: the flourish tests as insufficient
  feedback in real play, per [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)'s own open item on this.
- **The four bonus scoring dimensions the brief names** — observation completeness, a discovery streak,
  high-risk late release, the era transition itself — are named, not designed: no point value, trigger
  or formula for any of them exists anywhere in this pass. Signal it is time to design them: the
  score-distribution probe this document's own stage 4 and `PROGRESSION.md`'s ledger both already lean
  on exists and has real data to tune against.
- **A ninth or tenth era.** The ladder is declared finite at eight; the Disc, the Marble, the Babylonian
  planisphere and the Dresden Maya codex are retired candidates, not a roadmap. Signal it is time:
  nothing in this design — it would need a new brief, the way this one superseded the last.
- **Retrofitting Ceiling's independently reimplemented shield/reflector-ring overlay to share code with
  `drawPlayer()`'s.** Only the player-tool swap lands in Stage 2; the duplicated constants stay
  duplicated. Signal it is time: the two visibly drift out of sync during ordinary maintenance.
- **The Probe's manifest cadence** — arm once, or repeat indefinitely across an endless run. Explicitly
  unbuilt and unspiked per [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md); needs the same score-distribution probe as everything
  else in this list, once Stage 8 actually reaches the Probe and Stage 7's endless mode is live enough
  to observe a real bill-completion frequency.

## The first week

**Day 1.** Add `SWEEP_FULL=TAU*2/3` and `n.documented` to `src/simulation.js`; write it in `release()`
(`:545–553`). Add the two `scripts/verify.mjs` fixtures that need no render change to check: the
capture-orbit-release-recapture fixture asserting `n.documented`'s value and its survival across a
second capture, and the held-at-death fixture asserting `p.node` and `p.orbitSweep` are untouched by
`die()`. `npm test` green.

**Day 2.** Retarget `src/reveal.js`'s `revealNode()`: keep `ring` on view-entry through the existing
`reveal.progress()`; compute `keyline`/`hatch`/`wash`/`survey` from `active?clamp(p.orbitSweep/
SWEEP_FULL,0,1):(n.documented||0)`, read directly, never through `reveal.progress()`. Add the
`REVEAL_CAP`-concurrency fixture against `verify.mjs`'s render harness. Open `src/index.html`, fly a
run, and confirm by eye that a body's identity now builds up over the course of a held orbit rather than
over view-entry time, and that a released, partially-documented body keeps showing its frozen state
rather than resetting or continuing to render.

**Day 3.** Tune the checkpoint table (capture, ~90°, ~180°, ~240°) by eye against the existing shipped
plate's own body painter — no new art, just where each of `keyline`/`hatch`/`wash`/`survey`'s existing
spans should sit against the new clock. Confirm the readability contract holds throughout: the
phenomenon-stage ring and capture band must never look dimmer, smaller, or later than they do in the
game as shipped today.

**Day 4–5.** Begin Stage 2a: strip `markHead()`'s arguments, rewrite `quill` to fall through to the
shared call, and rebuild the charge/ink flourish that four marks (`comet`, `telescope`, `moth`,
`saturn`) are about to lose onto each mark's own tool geometry rather than the shared point. Confirm
`verify.mjs:867` (`'A refused selection leaves the default in place'`) still passes unchanged — the
selection mechanism itself has not moved yet, only `markHead()`'s signature.

**"It works," at the end of the week,** means: `npm test` passes with the new fixtures above, and
opening `src/index.html` shows a body's full identity being drawn in visibly, continuously, as the
orbit around it is held — not appearing over a fixed 1.25 seconds of wall-clock time the moment it
scrolls into view, which is what the game still does today — with no loss of legibility on the
phenomenon-stage ring, capture band, or any hazard a trajectory must be judged against. That is the
brief's own central sentence, working, on the game exactly as it ships, before a single era of
plumbing exists to serve it.
