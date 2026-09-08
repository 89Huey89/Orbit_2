# The Ceiling · polish audit

The Ceiling ships as a playable Era II preview (`src/ceiling.js`, entered from the frontispiece),
and it is the only era besides the engraved atlas that anyone can actually fly. Held beside the
atlas it is plainly the weaker sheet, and the gap is not a matter of taste: the atlas is a
*performance* — a chart being drawn, measured, turned and annotated while the player flies over
it — and the Ceiling is a *picture* with a game on top of it. This file records what was measured,
what causes the gap, and the order the gap should be closed in.

**Status: the original nine ranks below are built** (branch `claude/ceiling-preview-polish-jhk1g2`).
What remained of that pass is recorded under "What is still open" at the foot of this file. The
findings are kept in their original form rather than rewritten as a changelog, because the
reasoning is what makes the build order defensible; each now carries what was actually done.

A second, later pass — the brief that retires the barque as the player — retires two of those
built items (§5) and opens three more (§9–§11, rows 10–12 of the same table), none of them built
yet. Both passes stand in this one file because both are true of the same renderer at different
times, and the second could not have been written without the first: it is the first pass's own
reasoning, read against a document the first pass did not have.

## How this was checked

Both sheets were run in a browser at 1100×760 and driven through the opening rows: the
frontispiece, the first watch, a staged row carrying one of each hazard, and the end leaf. The
render paths were then read side by side — `render()` in `src/frame.js:405` against
`renderCeiling()` in `src/ceiling.js:539` — and the plate-token tables in `definePlate()` compared
key by key.

## The verdict in one line

**Count the clocks.** `world.time` appears **three** times in the whole of `src/ceiling.js` — twice
in the darkness's two sine waves (`src/ceiling.js:510`, `:514`) and once in the screen shake
(`:542`). In the atlas's four render files it appears twenty-three times. Everything else the
Ceiling draws is frozen: the wall, the figures, the serpent, the Eye, the water, the barque. The
player is flying over a still image with a reveal timer on it.

That is the whole of the "die Animationen passen nicht" feeling, and it is fixable without adding
one gram of the depth, glow or modelling the era file forbids — because the atlas's motion is not
cinematic either. The atlas moves because a *hand is working on it*. The Ceiling has the same
conceit available to it, better documented than the atlas's, and does not use it: a wall is
plastered, snapped out in red, corrected in black, flooded, closed in black, and it dries. Four of
those five are already in the code as a static four-stage function. None of them is ever *seen
happening* by a hand.

*The darkness's two sine waves are resolved: the boundary is drawn as a faceted stone break now,
not a waterline, keyed on world-space position and the break's own advance rather than on
`world.time`, so this no longer counts toward the clock tally above — see `ceilingDrawDark()`,
`src/ceiling.js`.*

---

## 1 · The wall does not move

`ceilingBuildWall()` (`src/ceiling.js:300`) keys its cache on `W+'x'+H+'x'+DPR` and nothing else,
and `renderCeiling()` blits it at `0,0` every frame. So:

- The kheker frieze, the block rules, the star bands, the twelve month circles, the decan columns,
  Meskhetiu and Reret are **nailed to the viewport**. The player climbs forty rows and the wall
  behind them is the same wall, in the same place, pixel for pixel.
- The **four watches look identical**. The atlas gives each of its four chapters its own celestial
  scene and region plate and turns a fresh sheet up from below the frame between them
  (`pageTurn()`, `src/celestial.js:691`; `drawAtmosphere()`, `:730`). The Ceiling's hour changes a
  string in the running head and nothing else.
- The only thing tied to the camera at all is `ceilingDrawRegisterGrid()` (`:354`) — horizontal
  hairlines at 9% alpha every 207 world units. In the screenshots they are invisible.

**P1 · Carry the wall with the climb.** Bake the wall as a strip taller than the view, keyed to the
watch as well as the size, and blit it at a camera-derived offset so the frieze, the star bands and
the columns pass. This is the era's own reading of the vertical: the doc says the camera's upward
movement is *passage through the night watches*, so the room should pass, not stand.

**P2 · Give each watch its own register.** Four baked walls, not one: the decan columns advance
through `CEILING_COLUMNS` instead of always printing the same three; the month circles belong to
one watch, the circumpolar pair to another. The transition is the Ceiling's page turn — but painted,
not turned: a band of fresh plaster is laid across, the block rule is drawn over it, and the new
register's furniture is set out in red and closed in black behind the flight. `reveal.js`'s
`mode:'wall'` already describes exactly this order and is only used for lettering today.

**P3 · Retire the flat lime chapter card.** `ceilingDrawRunningHead()` (`:516`) announces the hour
by filling `W*.18 … W*.82` with opaque lime and stamping two block rules on it. It covers the nodes
the player is aiming at, and it is the crudest single element on the sheet — compare
`drawChapterReveal()` (`src/celestial.js:576`). If P2 lands, the hour announces itself by the new
register arriving, and the card can go entirely; short of that it should at least be a translucent
plaster patch that the hour is painted onto in strokes, largest first, using the
`ceilingNumber()` machinery that already exists.

## 2 · There is no painter

The atlas's identity is the visible nib: `penNib()` and `penBead()` (`src/reveal.js:126`, `:147`)
ride the leading end of every stroke, spatter a little, and are backed by a quiet scratch of sound
(`:38`). The Ceiling reveals in four passes (`ceilingSign()`, `ceilingPolygon()`) but draws no tool
at all. Stages simply cross-fade. That is why the reveal reads as an opacity ramp rather than as
painting.

**P4 · Give the wall its hand.** A `wallBrush()` sprite — a loaded reed at the leading end of the
stroke being laid, wetter and fatter at the start of a pass, dragging out at the end — and a
`wallWet()` bead behind it that dries back toward the pigment's own value over the following second.
This is the highest-value single change in this file: it costs one small function, it is the same
architecture the atlas already proves, and it converts every existing four-stage reveal on the
sheet at once.

**P5 · Let the red survive.** The wall's setting-out is already drawn off-register under every mark,
then covered. On the real wall it survives wherever the later paint fell away. Keep a per-mark
fraction of the red uncovered, seeded from the mark, so no two figures are finished to the same
degree — the cheapest possible source of the variation the era file asks for.

## 3 · The flight has lost three of its four marks

The atlas draws four separate records of a transfer. The Ceiling draws one and collapses the rest.

| The atlas | The Ceiling |
|---|---|
| `drawInkPath()` — the dried route in three line weights, heavier where the flight was faster (`src/effects.js:125`) | `ceilingDrawRoute()` — two flat lines, no speed reading (`src/ceiling.js:360`) |
| `drawTrail()` — the live tail behind the traveller (`src/effects.js:336`) | *nothing behind the barque* |
| `drawSurveys()` — every departure and every landing measured, with arcs, ticks and numerals (`src/effects.js:146–335`) | *nothing* |
| `drawTransferMark()` / `drawInkSplat()` / the drying blot / `burinArc()` (`src/effects.js:800–868`) | one flat red ellipse and one plain `ctx.arc` for **all four** ring kinds (`src/ceiling.js:496`) |

**P6 · The route is dabs, not a line.** `02-ceiling.md` says in as many words that "the route is a
sequence of brush dabs," the frontispiece copy promises "the painted dabs," and the aim guide
already draws dabs — but the *flown* route is a continuous double line. Lay it as discrete loaded
dabs, spaced by speed so the fast stretches thin out, which restores the speed reading the atlas
gets from its three weights.

**P7 · The setting-out cord is the Ceiling's survey.** This is the strongest single idea available
here, and it is already documented: the wall's own measuring instrument is the *snapped red cord*
and the eighteen-square canon, and the canon grid is already drawn under everything. So on release,
snap a red cord along the departure; on landing, drop a plumb from the circle and write the arrival
in Egyptian numerals with `ceilingNumber()`. The atlas's most admired flourish, in the era's own
tool, with no new vocabulary invented.

**P8 · A capture is a wet dab.** Give `rings` their four kinds back: a loaded dab that blooms and
dries at a capture, a burnish at a perfect landing, red spatter at a graze, and the pooled bead at
a release. Today all four are the same red ellipse.

**P9 · Set the floaters in the margin.** `+5` currently floats up from the event in red
(`src/ceiling.js:500`), the one wholly modern-arcade gesture on the sheet, and it ignores
`reducedMotion`, which the atlas's equivalent honours. Write them as marginal notes beside the
column with a leader pointing back in, the way `drawEffects()` does with its manicule.

## 4 · The dangers are still lifes

`ceilingDrawApep()`, `ceilingDrawEye()` and `ceilingDrawShu()` (`:439`, `:449`, `:456`) all read
`h.phase`, which is seeded once at spawn and never advances. The Eye's uraei rays are laid at
`h.phase*.08` — a constant. Nothing pulses, nothing reacts to the player. The atlas's hazards
breathe on `world.time` and *whirl inward as the traveller is pulled* (`drawHazard()`,
`src/figures.js:1079–1091`).

**P10 · Three motions, all inside the grammar.** Apep's coil turns slowly and his body undulates as
a travelling wave — a serpent is drawn as a wave, so animating the wave adds no depth and no
modelling. The Eye's rays lengthen and shorten on a slow breath and flare as the player closes.
Shu's blue currents drift along their own axis, which is the only way a crosswind reads at a
glance. Nun's water lines already exist as a hatch and want the same drift.

**P11 · Read the pull.** Give at least Apep the atlas's `pull` term, so the coil tightens as the
barque is taken. It is the one place the still image is actively costing the player information.

## 5 · The barque stands on its stern — retired as a description of the player

**Retired.** Both findings below, and the "built" row they earned in the table at the foot of this
file, described the player's own avatar, and the player's own avatar is no longer the barque. The
brief is explicit — "the previously designed solar barque should NOT be the player" — and
[OBSERVER-CORE.md](OBSERVER-CORE.md) carries that out: `ceilingDrawPlayer()` stops drawing Ra's
vessel and starts drawing a rush brush, the fan of it leading, the Observer Core sitting as a bare
point at the wet tip of its frayed fibres. The barque itself does not leave the sheet — it returns
to the register the brief and the tomb both actually give it, a real object in the astronomical and
funerary tradition this era is drawn from, a motif the level and the sky may carry wherever
`research/ceiling.md` already places it, never again standing in for the hand doing the observing.
§9 below is what replaces this section as engineering.

The reasoning that follows is kept rather than deleted because it does not stop being true merely
because its subject changed hulls. Both P12 and P13 are about the same underlying fact — a small
painted object must read clearly at arcade size while its heading sweeps through every angle of an
orbit, over a light plaster ground, without the rotation itself turning into noise — and that fact
does not belong to the barque. It belongs to whatever the player is drawn as next, and is exactly
the constraint §9 opens with.

**P12 · Keep the barque level; let the *course* turn.** *(Retired with the barque; superseded by
§9.)* Hold the hull upright (or level it toward horizontal with a small heel), mirror it to face
the direction of travel, and carry the heading in the water and the dabs instead of in the hull.
The comment above the function proudly says "no banking" — good — but not banking and not being
upside down are the same discipline. `ceilingDrawPlayer()` (`:476`) rotates the hull by
`Math.atan2(p.vy,p.vx)`. In orbit that is the tangent, so for half of every circle the boat is
vertical or upside down. An Egyptian barque is drawn in profile, level, and this is not a
stylistic preference — a boat on its stern is exactly what the grammar refuses. At orbit scale it
reads as a yellow banana with a red dot on it.

**P13 · Let the crew do something.** *(Retired with the barque; superseded by §9.)* One oar
sweeping, or the solar disc's own slow travel along the deck, gives the player object the single
moving part the atlas's quill gets from its flexing vane — and unlike the vane it is documented:
the disc crosses the sky, that is the whole point of the barque.

## 6 · The furniture reads as clip-art at the size it is drawn

- **Twelve identical wheels.** `ceilingBuildWall()` sets the month circles in a rigid 3×4 block at
  one radius with one spoke pattern (`:342`). At the size drawn they read as wagon wheels, and they
  are the most eye-catching thing in the lower left. On TT353 they are large, separated, and each
  carries its month's name. Vary the divisions, give them their names, and spread them.
- **Meskhetiu and Reret are the reason this wall is Egyptian, and they are thumbnails.** Drawn at
  `s=20`/`s=19` and 46–50% alpha (`:336`, `:338`), the bull is a red box with stick legs and the
  hippopotamus is a blue sack — the era file's own note that the prototype "cut Reret to a bare post
  for want of room" has come back in a different form. Draw them large, at full strength, in the
  register that belongs to them (see P2), and let the seven stars of the Foreleg be the wall's
  signature drawing rather than a row of yellow asterisks.
- **The plaster is smudge, not surface.** 180 broad soft ellipses (`:305`) read as clouds under the
  drawing. Fewer, harder-edged patches plus a crack network that follows the snapped grid would
  read as lime instead of as a filter.

## 7 · It sounds exactly like the atlas

`src/audio.js` is shared wholesale and nothing in the Ceiling path touches it: flying the barque
across a painted wall plays a **quill scratching on paper** (`audio.scratch`, called unconditionally
from `src/ui.js:545`), and captures play the atlas's glass tones. `02-ceiling.md` already specifies
the era's five sounds — a pigment grind on the orbit hold, a wet dab at a capture, a dry brush-flick
at a perfect release, a low stone thud at death, a sistrum rattle at a completed course.

**P14 · Give the era its five sounds.** The existing `OrbitAudio` primitives (`tone`, `brush`,
`scratch`) cover four of the five with parameter changes alone; only the sistrum wants a new
method. This is a small change with a large effect, because sound is currently the loudest single
thing telling the player they never left the atlas.

## 8 · Loose ends and outright defects

| | Where | What |
|---|---|---|
| a | `src/ceiling.js:417` | The three opening circles are captioned **TIRO · ADEPTUS · MAGISTER** — Latin, on an Egyptian wall, while `src/ui.js` has already renamed everything around them ("COURSE SET", "DECAN COURSE"). Either transliterate or use the sheet's own words. |
| b | `src/inscriptions.js:13` | `definePlate('inscription', …)` has no `ceiling` entry, so every inscription written onto the wall — the standing instructions, the named events — is lettered in the **paper atlas's ochre** (`caps:'150,100,32'`), not in carbon black and red ochre. A four-value token block fixes it. |
| c | `src/ceiling.js:516` | The running head is drawn at `H − bottom`, which by mid-run is **inside the risen darkness**: dark brown on dark brown. The atlas puts a gradient scrim under its own running head (`runningHeadGradient()`, `src/frame.js:381`). |
| d | `src/ceiling.js:501` | Floaters ignore `reducedMotion`; the atlas's do not. |
| e | `src/ceiling.js:413`, `:485` | The target ring, the capture band and both charge rings are **dashed circles** — an atlas convention carried over unexamined. A painted wall marks a boundary with a block border, a star band or a doubled line. |
| f | `src/ui.js:184–185`, `src/simulation.js:160–167` | The end leaf still reports "*n* constellations traced" and prints the observations' **Latin** names (`TRES PERFECTI`, `VELOCITAS SUMMA`) on the Ceiling's colophon. |
| g | `src/ceiling.js:496` | `blot` and `splat` are handled by the same branch, so a released bead and a graze look identical. |

## 9 · The reed brush and the constant Core

This is what §5 retires into. The brief's instrument for this era is a reed brush, and
[OBSERVER-CORE.md](OBSERVER-CORE.md)'s tool table gives it a specific, attested shape: "the frayed
fan of bruised fibre at the tip," New Kingdom rush-stem brushes (c. 1567–1085 BCE), the fan leading
flat-on rather than a point, with the Observer Core sitting as a bare, argument-free disc at its wet
tip. `ceilingDrawPlayer()` becomes, in full, a function that translates to `world.player`'s exact
position, rotates to `Math.atan2(p.vy,p.vx)` with no leveling, no mirror, and no eased angle — the
whole apparatus at `src/ceiling.js:83–90,1364–1367` (`ceilingFacing`, `ceilingAngle`, the eased
turn) is deleted along with the hull it existed to keep upright, because a brush has no deck-side
to protect. This is the one respect in which the reed brush is a strictly easier build than the
barque it replaces: every other tool on [OBSERVER-CORE.md](OBSERVER-CORE.md)'s table — the burin,
the sighting tube, the alidade, the quill, the eyepiece — already just turns with the heading the
way the shipped quill and telescope do, and the brush joins them rather than needing its own
special case.

What the brush does not get easier on is legibility, and this is exactly the fact P12 and P13 were
actually testing, stated now in its true and permanent form: a small asymmetric object must read at
arcade size while its heading sweeps through every angle of an orbit, over a light plaster ground,
without the constant rotation blurring into noise or the fibres vanishing into the wall's own tone.
A frayed fan is, if anything, a harder silhouette to hold onto through a full turn than a hull was —
a boat at least keeps a long axis a player's eye can anchor to; bristles read as a direction only if
the wet core at their tip stays the brightest, sharpest thing in the cluster at every angle.

That core is not new work. `ceilingReed(g,x,y,angle,alpha,rgb)` and `ceilingWet(g,x,y,size,alpha,rgb)`
(`src/ceiling.js:151–178`) already draw exactly this pairing — a wedge of frayed fibre laid along a
heading, and a dark wet core with a fainter bloom drying outward around it — and they already do it
at the working end of a mark, not idly: they are the sprite riding the leading edge of the setting-out
and correcting passes in `ceilingDrawNode()` (`:1250–1251,1255–1256`) and the closing stroke of
`ceilingPolygon()` (`:214–215`). The wall invented the Observer Core's own dark-keyline-then-bright-
fill recipe for its own hand three items ago, under a different name, for a different purpose. Building
the player's tool is substantially reusing `ceilingReed()` for the bristle fan and `ceilingWet()` for
the point at its tip, called at fixed, non-world-derived arguments for the Core itself — no `boost`,
no `ink`, no shield state passed in, per [OBSERVER-CORE.md](OBSERVER-CORE.md)'s "Behaviour" rule —
while the fan's own spread, wetness and this era's pigment-currency bloom (per
[ECONOMY.md](ECONOMY.md)) are free to answer to `ink` exactly as the nib's bead does today, on the
tool's geometry and never on the Core's own call.

**P15 · Build the reed brush from the wall's own reed-and-wet-core primitives.** Delete
`ceilingDrawPlayer()`'s hull, the block-band decoration, the naos, the crossed oars, the leveling
and mirroring state; keep the shield and reflector ring treatment, which describe a held charge, not
a hull, and reattach unchanged. Draw the fan with `ceilingReed()` at a size scaled to read at arcade
scale (larger than the ordinary mark-head instance, the way the barque's own hull was larger than
an ordinary wet dab), cap it with a fixed-argument call standing in for `markHead()`, and let the
fan's density or wetness answer to `ink` the way the nib already does. Small in code, because most
of the drawing already exists; the open risk is purely visual — confirm the fan reads as a direction
at every angle before committing final proportions, the same discipline
[OBSERVER-CORE.md](OBSERVER-CORE.md) already asks of the alidade.

## 10 · The reveal generalizes past this wall

[ARCHITECTURE.md](ARCHITECTURE.md) item 8 names `ceilingDrawNode()` as "the best existing model" for
the universal three-state reveal every era now owes
([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)), and reading the function against that claim, it is
right to. `ceilingDrawNode()` (`:1240–1274`) already computes three graded stages from one clock —
`red=clamp(t/.25,0,1)` (the setting-out ring, a reed dab riding its leading end), `correct=clamp
((t-.22)/.28,0,1)` (a black correcting ring), `finish=clamp((t-.68)/.32,0,1)` (the wheel or sign
painted in full) — and those three stages are already, structurally, phenomenon, observation and
understood in every particular except one: `t` comes from `reveal.progress(n,NODE_REVEAL,y>0&&y<H)`
(`:1242`), which reads `clock()`'s elapsed wall-clock seconds since the node entered the viewport
(`src/reveal.js:24,46–57`), not whether the player has ever captured it. A body sitting untouched on
screen for `NODE_REVEAL`'s 1.25 seconds fully documents itself, wheel and all, which is the precise
failure the brief's central mechanic exists to close, and this file's own §1–§2 findings never
caught it because they were reading the sheet for motion, not for what the motion was keyed to.

The fix this doc's own P1–P9 already half-anticipated — carry the wall with the climb, give the wall
its hand — turns out to be one clock away from also being the fix for this. Per
[ARCHITECTURE.md](ARCHITECTURE.md) item 8 and [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md), the
readability contract keeps `red` exactly as it is — position and the capture ring must stay legible
the instant a body is on screen, phenomenon or not — so only `correct` and `finish` move, onto
`player.orbitSweep/TAU` gated on capture, with `correct` and `finish`'s existing thresholds retuned
to land near the swept-arc checkpoints [PROGRESSION.md](PROGRESSION.md) and
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) set out — roughly 90° for recognisable, roughly 240°
for complete — rather than at fractions of a fixed 1.25-second window. This is not a new function to
invent, and it is not a rewrite of `ceilingDrawNode()`'s shape: it is `t`'s source splitting in two,
exactly as [ARCHITECTURE.md](ARCHITECTURE.md) item 8 already specifies for `revealNode()` in
`src/reveal.js`, applied here to the sheet that already proves the split is drawable.

**P16 · Retarget `ceilingDrawNode()`'s `correct`/`finish` clock from view-entry time to
post-capture `orbitSweep`.** Keep `red` keyed to `reveal.progress(n,NODE_REVEAL,…)` as the
phenomenon stage; compute a second value — 0 while uncaptured, `orbitSweep/TAU` while the player
holds this node — and feed `correct`/`finish` from it instead of `t`. Medium effort, because the
thresholds want tuning against a built sheet rather than carried over verbatim, and because every
other node-family reveal on every future era answers to the same fix; low risk, because
`OrbitWorld` already tracks `orbitSweep` for the sling charge and nothing about this reads or writes
the simulation.

## 11 · The frontier — how close the wall already is to breaking correctly

[THE-FRONTIER.md](THE-FRONTIER.md) gives this era a specific, corrected mechanism, not the brief's
own "paint flaking from plaster, pigment powdering away" verbatim: groundwater salts blister the
plaster from its support in flakes, the secco binder fails on its own and lets pigment powder away
independently, and successive plaster campaigns crack and drop whole facets at once — drawn, per
that document, as "pale efflorescent bloom first, then flat matte voids in blocky, faceted shapes
where plaster has detached — lifting in flakes, not soaking like a wash."

`ceilingDrawDark()` (`:1575–1631`) was built and tuned before that document existed, to fix a
different, purely technical complaint — this file's own "count the clocks" verdict, that the
darkness read as two sine waves rather than a boundary with a material — and it is already close to
right for reasons that had nothing to do with plaster conservation. It cuts pre-crack hairlines
biting a little way into intact stone ahead of the break (`:1593–1601`, "the tell: short carbon
hairlines biting a little way up into stone that is still intact, so the player reads where the
break is headed before it arrives there") — this is cracks spreading, drawn correctly. It sets a
handful of `CEILING_PALETTE.plaster` rectangles tilting loose above the line before they fall
(`:1602–1614`) — this is a facet about to drop, drawn as the doc asks, a shape rather than a
gradient. It sheds small chip particles falling behind the break and a slower lift of pale dust off
it (`:1616–1630`) — flakes lifting away, and pigment powdering, both already separately drawn and
already separately named in the code's own comments. Three of the frontier's stated mechanisms are
already on the sheet, and none of them were built to satisfy this document.

Two things are not yet right, read against [THE-FRONTIER.md](THE-FRONTIER.md) rather than against
this file's original, narrower complaint. First, there is no efflorescent bloom: the fresh upper lip
at the break (`:1589–1591`) is a pale hairline riding the fracture's own edge, not a preceding pale
patch that spreads ahead of the crack the way a salt bloom would, and the two are visually distinct
beats the document asks for in a specific order. Second, the fill behind the break itself is
`CEILING_PALETTE.duatDeep` (`:1582`) — a flat near-black standing for the underworld this era's own
cosmology puts behind the sky, which is a legitimate and era-true choice under
[OVERVIEW.md](OVERVIEW.md) rule 2's mandate that no era borrow another's language, but is worth
naming as a choice rather than an oversight: it reads as *what lies behind the wall* rather than as
*the plaster's own bare support once the paint is gone*, and the two are different images even
though both are, correctly, not "the universe ending." Neither gap changes what must be built for
`ceilingDrawDark()` to satisfy [THE-FRONTIER.md](THE-FRONTIER.md) in full; both are small.

**P17 · Add the efflorescent bloom, and confirm Duat is the intended reading rather than an
inherited one.** A pale, soft-edged patch preceding the hairline cracks by a short distance —
smaller in area than the crack network it precedes, brighter than the plaster around it, gone once
the facet beneath it has dropped — closes the one drawn beat this era's decay is missing. The second
half of this item is not a drawing task: confirm with whoever owns the era's cosmology that Duat is
the wanted image behind a flaked wall and not a holdover from when this function's only job was to
stop reading as a waterline; either answer is a one-line note here, not a rebuild. Small effort,
no risk — nothing here touches `floorY`, `darknessSpeed()`, or the rate [THE-FRONTIER.md](THE-FRONTIER.md)
holds fixed.

## What to build, in order

The first four are what closes the gap the player actually feels; the rest is finishing.

| | Proposal | Effort | Risk | |
|---|---|---|---|---|
| 1 | **P4** the visible brush and wet edge | small | none — the atlas proves the pattern | built |
| 2 | **P1** carry the wall with the climb | medium | needs a taller cache; watch memory on mobile | built |
| 3 | **P10/P11** three hazard motions and the pull | small | keep them flat; no glow | built |
| 4 | **P14** the era's five sounds | small | none | built |
| 5 | **P12/P13** level the barque, one moving part | small | none | built, then retired — §5, §9 |
| 6 | **P7** the snapped cord and the plumb as the survey | medium | must not clutter the play channel | built |
| 7 | **P2/P3** a register per watch, retire the lime card | large | the biggest win after P1, and the most work | built |
| 8 | **P6/P8/P9** dabs, four capture marks, marginal floaters | medium | none | built |
| 9 | **§6** furniture at a legible size; **§8** the seven defects | medium | a-g are mostly one-liners | built |
| 10 | **P15** the reed brush and the constant Core | small | mostly reused primitives; the risk is legibility through a full turn, not code | open |
| 11 | **P16** retarget the node reveal to `orbitSweep` | medium | thresholds want tuning against a built sheet | open |
| 12 | **P17** the efflorescent bloom; confirm Duat | small | none | open |

## What must not be "fixed"

The Ceiling is not under-designed because it is flat. Flatness is the era's thesis and the
comparison to make is never "does it look as deep as the atlas."

- No atmospheric depth, no parallax **layers**, no cast shadow, no shaded limb, no bloom. P1 carries
  one wall at one rate; it is a room passing, not a space.
- No lamplight gradient. A tomb is lit by lamps and Era I's torch is a precedent, but the Met
  facsimile is the colour authority here and it is flat — a warm falloff over the plaster is the
  most tempting and most rule-breaking idea on this list. If it is ever tried, it is tried against
  the facsimile first.
- No modelled bodies. A node stays a star sign, a disc or a light in a barque, at every scale.
- Motion is licensed by the *hand* and by *gameplay legibility*, and by nothing else. The atlas
  earns its movement by being a chart under a pen; the Ceiling earns its movement by being a wall
  under a brush, drying, by lamp, through four watches. Anything that cannot be argued from one of
  those two does not go on the sheet.

---

## The second pass, and where it came from

Everything above was built against the code and against the era file. A second pass then ran against
photographs of the facsimile itself, supplied one crop at a time, and it is the more instructive
half: the wall was rebuilt from a document rather than from a reading of one. That pass corrected
the star's shape and the band's density, undid an invented variation, replaced both circumpolar
figures with traced contours, packed the decan columns and put stars back inside them, laid the
procession across the foot as a register, gave the divider its lines of marks, and took the stamp
out of every repeated unit on the sheet.

Two lessons from it are worth more than the changes. **A plausible reading of a photograph is not a
source** — three of the corrections below overturned confident readings, two of them written in this
file's own voice. And **dense and irregular are two properties**: taking the regularity out of the
star band without checking its density made the sheet worse, not better, because a band of scattered
stars reads as randomness while the wall's reads as a mat.

## How the facsimile came to be read

The photographs this section rests on were supplied part-way through the build, after most of it was
already standing. That order is the finding: everything below was caught by looking at the document,
and none of it by looking at the code. Three separate crops were needed — the whole sheet settled the
furniture, a figure-scale crop of Reret made tracing possible at all, and only a closer crop of
Meskhetiu showed the legs that overturned a confident reading of the first. Each closer look
overturned something the previous one had seemed to settle, which is the argument for going to the
document early rather than at the end.

## What the facsimile corrected

Partway through the build a high-resolution photograph of the Wilkinson facsimile of TT353 — the
document `02-ceiling.md` already named as "the visual test for every decision on the built sheet" —
was read directly against the built wall for the first time. It overturned three things, and two of
them were instructions given in this file's own voice. They are recorded here because the pattern
matters more than the three fixes: a plausible reading of a photograph is not a source, and the
sheet had been drifting on plausible readings.

- **The star band.** A blue ground carrying yellow stars was inferred from a *different* Theban
  ceiling and nearly written into this one — exactly the compositing `02-ceiling.md` forbids. TT353's
  own bands are three staggered rows of five-lobed outlined stars over the red canon, framing every
  panel on all four sides. The band is now the sheet's main framing device, as it is on the wall.
- **The twelve month circles.** This file complained that they read as "twelve identical wagon
  wheels" and had per-wheel variation invented to break them up. On the facsimile they *are* twelve
  identical wheels: uniform, roughly twenty-four plain spokes, a small hub, no colour. What
  distinguishes them is a ruled box, a caption line beneath, and the red construction rules through
  their centres. The invented variation was removed and the real differentiators put in.
- **Meskhetiu.** Read at low resolution as a detached foreleg — "no legs, no rump, no tail" — and
  corrected on a closer crop: the animal has four short legs, so it is a bull, drawn far more
  schematically than the modelled quadruped the sheet had been drawing. Two details are worth
  carrying: the body is **contoured in ink and not flooded**, while the **legs are painted in red
  ochre** (sampled, not eyeballed: a red excess of ~50 against the contour's ~29), which is the
  reverse of what `ceilingPaintBull` does; and the crop carries **three** stars, not the seven of the
  Big Dipper association. Draw what the sheet shows.

## What is still open

- **The two circumpolar figures are traced now, but not yet good at thumbnail size.** Meskhetiu and
  Reret come off the facsimile through `scripts/figures.mjs` into `src/figures-tt353.js` and are
  drawn by the wall's own painter, so what is on the sheet is what the wall carries — three stars
  rather than seven, red legs against an ink-contoured body, the crocodile and the tether. What is
  not solved is legibility: at the `s=13` the narrow layout uses, both are still little more than
  dark marks, exactly as the invented drawings were. A traced contour also carries the pixel mask's
  staircase, which one Chaikin pass at bake time softens but does not remove; a finer trace, or a
  second simplified contour kept for small sizes, is the honest fix.
- **The four watches differ, but weakly.** Each carries a different reach of the same furniture —
  more columns, a rotating slice of the vocabulary, a different circumpolar figure — rather than
  furniture of its own. A player reads "another register", not "another hour".
- **The procession is structurally right and lighter than the wall's.** On the facsimile the foot
  register is a substantial band of large figures; ours is thin, and it thins further still where it
  crosses the play channel, which is the price of running a full-width element across a sheet
  somebody is flying through. The gap it opens in the middle is abrupt. That trade is deliberate and
  is the sort of thing only play can settle.
- **The red canon now runs through the play channel.** It is faithful — it does so on the facsimile
  too — but nobody flies across the facsimile. If it competes with the flight it should be eased in
  the centre column only, and that is a playability decision, not a research one.
- **The sheet's density now comes from the wall's own marks, and that has a boundary worth keeping
  in view.** The decan columns are packed and carry stars among their signs; the procession is a
  horizontal register at the foot; the divider is a star band, ruled lines of marks, a star band.
  Most of that content is *traced* — reproduced as drawing from the facsimile, asserting nothing
  about what any sign says — because the checked vocabulary spells fourteen words and a wall this
  dense would otherwise have needed an invented one. The rule that keeps it honest is small and
  absolute: a column or a line is either spelled from the checked table or set from the traced bank,
  **never both**, so a mark can never be read as part of a word. Anything added here later has to
  keep that separation or the whole bank stops being a facsimile and becomes decoration.
- **A dark-ground plate is wanted, and it needs its own document.** Noted, not built. The reference
  offered for it is the astronomical ceiling of **Seti I (KV17)**
  ([Wikimedia Commons, `StarsSeti1.jpg`](https://commons.wikimedia.org/wiki/File:StarsSeti1.jpg) —
  licence not verified from here, the egress policy blocks the host). Its scheme is the inverse of
  this sheet's: a deep blue ground, figures in pale cream, outline and detail dots in red, a plain
  ochre band beneath, and a register of signs in gold under that. Sampled off the image supplied:
  ground `#35416F`, figures `#EDE1C4`, detail `#B98C7A`, band `#E4D19B`.

  The thing to hold on to is that **KV17 is a different document, not more of this one.** It is
  Nineteenth Dynasty, roughly 1290 BCE — about a hundred and seventy years after TT353 — a different
  tomb and a different reign, and its blue ground is exactly the reading `02-ceiling.md` rejects for
  *this* sheet. This file already records one instance of a blue star band being inferred from
  another Theban ceiling and nearly composited in. So if a dark mode is built it is a **second plate
  pulled from a second document and named as such**, the way the atlas carries a night plate and a
  paper plate — never a night version of the TT353 sheet.
- **A frontispiece in the concept-art register** is agreed but only begun: the block border,
  ornament and plaster panel are in, the four hour-plates are not.
