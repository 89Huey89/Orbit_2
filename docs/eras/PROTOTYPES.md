# The prototypes, and how each fared

One standalone canvas page sits in [prototypes/](prototypes/) for most, not all, of the eight-era
roster's slots, self-contained, with the faces it needs in [prototypes/fonts/](prototypes/fonts/)
and a screenshot of each in [prototypes/shots/](prototypes/shots/). They are reference art and
porting sources, not shipped code: each is written as one painter per concern over a named stroke
primitive, so that the rows of [ARCHITECTURE.md](ARCHITECTURE.md)'s cost table each have something
to port from. Open any of them in a browser; press `L` for a legend naming each element by the
game's own term.

Every prototype was held to the shipped game — `shots/standard-night.jpg` and
`shots/standard-paper.jpg` — under the critique in the box below, and painted first by the
smaller model, then repainted by the larger one where the first pass fell short. The verdicts
here are what to budget for when each era is built for real, now read against the eight-era
roster rather than the nine-era ladder every one of these pages was actually painted for. Where a
prototype no longer maps onto an era, or maps onto a different one than it was drawn for, that is
stated plainly below rather than quietly carried forward.

> **What "finished" means on an Orbit sheet.** The ground is a material, not a colour. Every mark
> comes from a tool. The bodies are specimens, each carried by the era's own surface vocabulary.
> Composition is a page, not a row. Typography is a system of three hands. Layering makes depth.
> Nothing is a placeholder. Look at it, and iterate.

## Verdicts

| Prototype | Now serves | First pass | Verdict | Painter to budget for |
|---|---|---|---|---|
| `rock.html` | [I · The Rock](01-rock.md) — unchanged | Sonnet: a flat pale wash, scattered clip-art, no torchlight, no relief — failed | **Opus reached the standard.** A six-octave limestone height field shaded from its own gradient against one torch held low-left; pigment multiplied into the rock and lit with it, so ochre pools in the hollows and starves over the bulges; a hand stencil as title and maker's mark; the Hall of the Bulls aurochs with its six shoulder dots, three ringed for the game; cup-marks and spirals cut as scratches with a lit lip; no writing, no frame, the torch's reach as the only edge. The aurochs' muzzle is the weakest drawing on the sheet, and the best-score tally sits so deep in the failing light it barely reads — the honest cost of one torch, and a UX risk the era file carries. | Opus |
| `ceiling.html`; playable extraction in `src/ceiling.js` | [II · The Ceiling](02-ceiling.md) — unchanged | Sonnet: the register composition and the flat discs were right; the plaster, the painted line, the figure and an out-of-era HUD (a green bar, modern digits) were not | **The standalone drawing study reached prototype standard; the integrated renderer is now the colour authority.** Direct comparison with TT353 corrected the scene to a dominant light-plaster field, fine black structure, sparse red/mineral accents and no Nut arch. The local hieroglyph face, hour circles, flat barque, body signs and four danger painters are playable from the main menu. A second integration pass then answered the standing complaint that the sheet was thin on Egyptian symbolism and clean in its lettering: kheker frieze, polychrome block borders, star bands, the painter's snapped red canon grid, painted month circles, Meskhetiu with its seven stars and Reret with her crocodile and post, quadrat-stacked decan columns, Egyptian numerals and a cartouche around the score; the signs are painted in the wall's four passes rather than set as type, and the modern Latin layer moved off a screen serif onto a slab. Per [OBSERVER-CORE.md](OBSERVER-CORE.md), the barque this file draws as the player craft is retired from that role — only `ceilingDrawPlayer()` is replaced, by a rush brush carrying the Core at its wet tip; the barque stays on the sheet as the mythological motif it always should have been. | Opus (Sonnet for layout) |
| `globe.html` | [IV · The Astrolabe](04-astrolabe.md) — but only as a prototype of the era's **signature sheet and colophon vignette**, not of its in-play grammar | Sonnet: a flat cream rectangle, empty gold-ringed discs, stick figures — failed | **Opus reached the standard, for a grammar the era reframe has since inverted.** Sized paper with fibre, chain lines and foxing; a red-and-gold jadwal with corner pieces; leaf with bole line, burnish and cracks; lapis with granulation; seven gilt roundels carried by textile geometry; al-Jabbār drawn twice, facing across the gutter, with gold-disc stars and magnitudes on top; naskh and kufic in the real faces. Shaping is the browser's here; the build pre-shapes with fontkit. All of that is real, reusable work — but it is manuscript-primary throughout, the instrument appearing only once, small, as a colophon vignette, and [04-astrolabe.md](04-astrolabe.md) now builds this era the other way around: the brass mater/limb/rete assembly and the alidade avatar carry the in-play grammar, with the manuscript relegated to the signature sheet this prototype actually is a good study of. **No prototype of the instrument-primary grammar exists**, and this is a real, unclosed gap — 04-astrolabe.md names it, in its own words, as "this era's own largest open risk, not a settled one." | Opus, for the signature sheet only; the instrument grammar is unspiked and unbudgeted |
| `plate.html` | [VI · The Lens](06-lens.md), register two (the plate, 1887–1958) | Sonnet: the negative, the réseau, the ink notes and the typed label were right; the material was flat and the specimens were seven identical blobs | **Opus reached the standard.** One gelatin-on-glass negative on a light table: mottled emulsion, pooled developer, grain, dust, a scratch, a frilled edge and a chipped corner; seven distinct photographic recordings; the void as a real tear with islands of emulsion still holding stars; halation with its back-surface ring. This was painted as a whole era's sheet on the old nine-era ladder; it now covers one of three registers the Lens carries, and [06-lens.md](06-lens.md) still calls this the register "nearest to finished... the lowest risk of any register on the ladder." | Opus (Sonnet for structure) |
| `observatory.html` | [VI · The Lens](06-lens.md), register three (the rendered measurement, 1958–1990) | Sonnet: the FITS header, the instrument margin, orbits allocated and used, the EHT ring, the coronagraph occulter, lit bodies with a terminator | **Sonnet reached the standard,** on the strength of the shipped modern plate it builds on. The nebula pillars are faint and the Parker-spiral crosswind reads as a fan; both are polish. This sheet held a whole era, the Observatory, on the old nine-era ladder; that era is retired and its material — the FITS card, the instrument margin, the rendered bodies, the true-colour discipline — is absorbed whole into the Lens's third register, exactly as painted here. Its allocation-tax *rule* does not survive with it ([ECONOMY.md](ECONOMY.md)); its depiction does. | Sonnet |
| `probe.html` | [VIII · The Probe](08-probe.md) — unchanged, still the ladder's final era | Sonnet: the telemetry frame with its sync marker, the plaque border and single-stroke title, the pulsar-map constellation, the potential-mesh well, the bill of materials, a daughter on an escape burn | **Sonnet reached a prototype standard.** It reads as an instrument, which is the point, and the two registers (plaque and display) are both present. The sensed masses are deliberately plain and could carry more of their spectra; the plaque register is thin. Its treatment of the plaque as this era's own document has since been superseded: [08-probe.md](08-probe.md) hands the plaque, in full, to [VII, The Flyby](07-flyby.md), so the plaque border, single-stroke title and hand-built polyline glyphs this prototype draws are no longer this era's to finish. The self-log hand, the class-icon-plus-readout bodies and the instrument-white (not telemetry-green) palette survive that handover untouched and are this era's own to build from. | Sonnet for what remains here; the Opus pass once budgeted for "the plaque hand" is VII's to spend now, not VIII's |
| `disc.html` | none — retired with its era to [candidates/disc.md](candidates/disc.md), **The Disc** | Sonnet: a brown gradient rectangle with flat gold clip-art discs — failed | **Opus reached the standard.** The sheet is a cast bronze object seen close, the horizon arcs and the barge as its frame, every gold element inlaid with a groove and a lit edge, the families carried by chased Bronze Age ornament. One fidelity note for the port: the small italic captions show reconstructed Proto-Germanic words the research says must never appear as if the culture wrote them; on the built sheet there are no words at all. This era never reaches a built sheet: the eight-era roster has room for one prehistoric era, not two, and the Disc is named in [CANDIDATES.md](CANDIDATES.md) rather than on the ladder. | Opus, if the Disc is ever built from `candidates/disc.md` |
| `marble.html` | none — retired with its era to [candidates/marble.md](candidates/marble.md), **The Marble** | Sonnet: marble relief lit from one side, Greek and Roman capitals in the chosen faces, Ptolemy's *megethos* key, the dangers named — creditable | **Acceptable from Sonnet, with a polish pass.** The ground reads more as veined paper than as stone, the relief is shallow, and the Lyra figure is a thin outline. The grammar is right; the depth is not there yet. This era never reaches a built sheet: the roster has no Graeco-Roman era, and the Marble is named in [CANDIDATES.md](CANDIDATES.md) rather than on the ladder. | Sonnet, then an Opus polish, if the Marble is ever built from `candidates/marble.md` |

Two eras on the roster have no prototype of any kind. [V, The Engraving](05-engraving.md), by
design: its own file states the absence is deliberate, because this era's renderer *is* the shipped
game, so a spike would test nothing the game does not already prove at production quality. [III,
The Scroll](03-scroll.md) and [VII, The Flyby](07-flyby.md) have none for a different and less
comfortable reason — both are wholly new construction with no prior sheet to inherit from
([OVERVIEW.md](OVERVIEW.md)'s build order names both as such) — and neither has ever been spiked in
any form, not even to the finished-body standard every other era in this table was checked against.
They are the two least-tested eras on the ladder, not merely the two newest.

## What the escalations taught

- **Sonnet gets grammar and structure; Opus gets material.** Every Sonnet first pass on a
  hand-made era put the right things in the right places and drew them as diagrams. The
  repaints changed almost nothing about *what* was on the sheet and everything about what it was
  made of: bronze, plaster, leaf, gelatin.
- **The two instrument eras are the exception.** The observatory and the probe have no material
  in the same sense — a sensor and a display are already diagrams — and Sonnet reached them.
- **The shipped standard is a material standard.** The paper plate's laid wires, chain lines,
  foxing and plate-mark are what the eras are being measured against, more than its figures.
- **Neither model needed the largest.** No era required a Fable pass; Opus reached every
  hand-made era on its second or third iteration when given the critique above and told what
  the first pass got wrong.

## The Rock's readability spike

`rock-read.html` is not a signature sheet and is not held to the standard above. It is
[JOURNEY.md](JOURNEY.md)'s stage 2: the Rock is now the front door, a new player's first run is era I,
and before anything expensive is drawn the era owed an answer to one question — with no conventional
text anywhere, can a player read the target phenomenon, the capture region, a weak body against a
bright one, their own position, their trajectory, danger, and how far an observation has got? So the
page is a **loop**, not a panel: a traveller flies, is taken into orbit, sweeps, and releases on a tap
onto the tangent that orbit was building, with `positionPlayer()`'s own tangent formula, `SWEEP_FULL`
and `n.documented` copied verbatim from `src/`, because a still frame cannot answer a question about
reading something while the world will not wait. Press `L` for the legend and `D` for a diagnostic
overlay that redraws the same seven signals in plain modern shapes, so the pre-literate language can be
read against a modern one saying the same thing. The screenshot is
[shots/rock-read.jpg](prototypes/shots/rock-read.jpg).

Each signal is a distinct prehistoric mark rather than a scaled version of one: the next unvisited body
is the only one drawn in full inside the torch's reach; the capture region is a dot-ring struck at the
real `cap` radius, never staged wider or narrower than the truth the code will test; magnitude is three
flat tiers, each a different mark — an ochre dab, a red-ochre cluster ringed with struck sparks, a pale
kaolin disc with a manganese face; the traveller is the crayon's lit tip, the one hot-cored mark on the
wall; the trajectory is a dust-line that warms from charcoal to red-ochre as it comes to thread the next
capture region; danger is the Shaft, a true black void with a pecked rim, and the Flare, deep red-orange
under soot; and the observation is dabs pressed into the capture ring as the sweep accumulates, sealing
into a closed ring at `SWEEP_FULL` and freezing there when the orbit is let go.

**What the spike got wrong first, and what that taught.** Its first finding was that the window in
which a release connects is about one frame wide, that this reproduces
[JOURNEY.md](JOURNEY.md) §3, and that no drawing style can widen it. The measurement was real — a
frame-exact oracle connected on eleven frames out of twelve hundred — but the conclusion was not.
§3's one frame is the *perfect* window, not the window in which a release lands at all, and the
reason this page had only one frame was a geometry mistake of its own: it spaced bodies three to
five hundred units apart behind a capture radius of forty, a tenth of the gap, where the shipped
chart cuts every transfer to a short flight and gives a body a capture radius of roughly a third of
it. It also tested only the one body it was aiming at, with a point test at the end of each step,
where the shipped game sweeps the whole step against every orbit on the chart — and that
forgiveness, that a tap a little early or a little late still finds *something*, is most of what
makes an ordinary release landable. With the ratio and the test corrected the window is six to nine
frames, about a seventh of a second, measured the same way. **The lesson is worth more than the
first finding was: a spike that gets a ratio wrong will report a design problem that does not
exist**, and this one nearly wrote "the Rock cannot be flown" into the record.

**What a hand actually aims at.** The first pass gave the player only a warming dust-line, which
asks a hand to *react* to an instant. The shipped game does something else entirely: it draws the
run of the orbit a transfer threads the next one from, with the tangent struck brighter inside it,
so nobody reacts to an instant — they arrive at a mark they can already see. That affordance is now
on this sheet in its own language, a row of pressed dabs along the ring with one struck deeper at
the middle of each run, and a line that would carry the traveller through a vortex or a flare is not
marked at all, so danger is read in the same mark that carries the trajectory. The warmth ramp is
kept beside it, and between them the release stopped being a reflex test.

**And one the spike had to be rebuilt to ask at all.** The first pass drew every mark on a near-black
rectangle, which quietly answers an easier question than the era poses: whether ochre reads is not in
doubt, whether ochre reads *on lit limestone* is the whole risk, and a black ground hides it. The page
now carries a wall — six octaves of height field baked at full resolution and shaded from its own
gradient against one torch held low and left, tiling so it can scroll, with the dark biting in from
every edge as the era says its frame must. That is what [What the escalations taught](#what-the-escalations-taught)
predicted almost exactly: the first pass put the right marks in the right places and drew them as a
diagram, and what it was missing was the material. The sheet is also sized to the viewport rather than to a
fixed landscape panel, and carries the viewport meta a phone needs to lay it out at the width of the
glass instead of at 980 pixels, because the judgement this stage is waiting on is one made with the
page in a hand.

**What it reads like, and what is still open.** Against the wall, the traveller reads at once — it is
the only pure light on the sheet — and so do the Shaft and the closed dot-ring. What the rebuild
exposed is that the marks and the ground now share a hue: red ochre survives on warm limestone by being
*regular*, a made pattern against a natural one, rather than by being a different colour, which is a
real constraint on every mark this era will ever draw. Three things are unresolved and are a
judgement rather than a measurement: whether the three magnitude tiers separate at speed and in
peripheral vision or only when looked at, now that the Moon has been brought down from a white cloud
to a disc with a face; whether the Flare still reads as danger rather than as a
bright body, now that both sit in the same warm light; and whether a body outside the torch's reach
being invisible is this era's finest idea or its worst, which is the UX risk [01-rock.md](01-rock.md)
already carries in its own words. **The verdict on those is the author's to give against the running
page, and is deliberately not recorded here.**

## The prototypes and the three-state reveal

All nine pages in this folder — the eight single-body sheets above and the transition study below
— were painted before the three-state reveal was decided, back when a body meant one finished
picture rather than a phenomenon that only becomes knowledge under a held orbit. Every one of them
paints a body already resolved: `rock.html`'s aurochs is whole and lit the first frame it appears;
`disc.html`'s punched gold sits already struck; `plate.html`'s negative already carries seven
distinct photographic recordings; `probe.html`'s spheres are already wrapped in their data.
**None of them animates a body climbing from phenomenon to observation to understood across the
swept arc that [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) now specifies, and neither does
`turn-rock-disc.html`** — its three sizes of dab and its single moon-face are a finished picture of
what an era's naked eye already knows, painted to study a page turn, not a held orbit.

This is not a small gap to note in passing. The reveal state a body is drawn in, the era's own
progress toward arming its transition, and how much of the traversal resource a release recovers
are, per [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md), [PROGRESSION.md](PROGRESSION.md) and
[ECONOMY.md](ECONOMY.md), three readings of one computed value —
`documented = clamp(orbitSweep/240°,0,1)` — and that value has never been drawn moving, on any
sheet, for any era. **The single most valuable prototype now missing from this folder is one that
takes one body, on one era's sheet, and animates it through all three states against the
checkpoints [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) proposes: the opening mark at capture,
recognisable by roughly ninety degrees of swept arc, complete by roughly two-forty.** Every verdict
in the table above answers a narrower question — whether a ground reads as material, whether a
hand is convincing, which model reaches which standard — and every one of those questions is
downstream of a mechanic that, as of this pass, has never once been drawn in motion.

### The page-turn study

The one page in this folder painted with any version of the knowledge horizon already in mind is
`turn-rock-disc.html`: the Rock's bodies drawn as three sizes of dab and the Moon's face, the
Disc's as one punch always, a new sheet rising from the bottom edge, the flown route re-struck from
the ground up, the held body the first thing the new century sees. Its screenshots are
`shots/turn-rock-disc.1.jpg` through `.4.jpg`, at t = 0.08, 0.40, 0.70 and 0.97.

**What it now is.** It was painted to study one specific pairing — era I handing off to the Nebra
disc as era II — and that pairing is retired: the Disc holds no rung on the eight-era ladder and is
not era I's transition object ([CANDIDATES.md](CANDIDATES.md); [OVERVIEW.md](OVERVIEW.md)'s "eras
considered and not taken"). What survives is narrower than the file was built to show, and still
real: a working mechanical study of the page-turn itself — the inherited route re-struck in a new
hand, the old ground going dark beneath the new one's leading edge, the held body arriving last
with the new era's own ring chased around it. Every one of those beats was, at the time this was
painted, meant to demonstrate `pageTurn()` and `drawSheetEdge()`, and those two functions are
exactly the ones [PROGRESSION.md](PROGRESSION.md)'s ten-step transition retires from this role: the
new transition decays the old world in place and grows the new one outward from the transition
object, rather than sliding a second sheet up from below. `turn-rock-disc.html` is therefore a
prototype of a mechanism the game no longer uses for era transitions, painted for a pairing the
ladder no longer has — and it remains, despite both of those specifics being retired, the only page
in this folder that has ever animated anything at all about a change of century, which is why the
verdict below is still worth keeping.

| Sheet | Prototype | Verdict |
|---|---|---|
| the page turn, studied as I → II (that specific pairing is retired) | `turn-rock-disc.html` | **Reads, at prototype standard, as a study of the turn itself.** Both grounds are the ones already accepted — the lit limestone relief and the hammered bronze — and the turn is the sheet's argument: the disc's pierced rim is the leading edge, the rock goes dark beneath it, the route is re-struck from the floor upward with the punch's flash, and the held body is struck last with its ring chased around it, the barge already on it when the gloss arrives. What reads well: the inheritance of the route (a flint line becoming a run of taps is legible without the legend), the one-punch grammar against the rock's three sizes, the crescent for the Moon. What is weak: the rock's *faint* class reads as a smudge rather than a body, and the Moon's face is small enough to need the legend; the disc's ground is darker than `disc.jpg` under its flood and vignette together, and the horizon arcs dominate the still; and "the bottom edge is the Earth" is carried by the motion and the gloss more than by any frame. Painted by Fable from the two Opus prototypes; the Opus polish once budgeted for the rock's bodies here still applies to the turn's *mechanics* wherever they are next used, though not to any I-to-II hand-off, which will not be built. |

## What the prototypes are not

They do not run the game's stroke pipeline, its shaping, its caches or its simulation. A
prototype's `paintBody(family)` is a porting source for a third body painter beside the engraved
and rendered ones, not a drop-in. The faces in `prototypes/fonts/` are full TTFs to be cut with
`npm run fonts` before any embed; the Arabic is shaped by the browser here and by fontkit in the
build. Their screenshots in `shots/` are the record of what each era looked like on the day its
plan was written, kept beside the plan so the next session can see the target.
