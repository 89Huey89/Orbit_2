# The prototypes, and how each fared

One standalone canvas page per era sits in [prototypes/](prototypes/), self-contained, with the
faces it needs in [prototypes/fonts/](prototypes/fonts/) and a screenshot of each in
[prototypes/shots/](prototypes/shots/). They are reference art and porting sources, not shipped
code: each is written as one painter per concern over a named stroke primitive, so that the rows
of [ARCHITECTURE.md](ARCHITECTURE.md)'s cost table each have something to port from. Open any of
them in a browser; press `L` for a legend naming each element by the game's own term.

Every prototype was held to the shipped game — `shots/standard-night.jpg` and
`shots/standard-paper.jpg` — under the critique in the box below, and painted first by the
smaller model, then repainted by the larger one where the first pass fell short. The verdicts
here are what to budget for when each era is built for real.

> **What "finished" means on an Orbit sheet.** The ground is a material, not a colour. Every mark
> comes from a tool. The bodies are specimens, each carried by the era's own surface vocabulary.
> Composition is a page, not a row. Typography is a system of three hands. Layering makes depth.
> Nothing is a placeholder. Look at it, and iterate.

## Verdicts

| Era | Prototype | First pass | Verdict | Painter to budget for |
|---|---|---|---|---|
| I · The Rock | `rock.html` | Sonnet: a flat pale wash, scattered clip-art, no torchlight, no relief — failed | **Opus reached the standard.** A six-octave limestone height field shaded from its own gradient against one torch held low-left; pigment multiplied into the rock and lit with it, so ochre pools in the hollows and starves over the bulges; a hand stencil as title and maker's mark; the Hall of the Bulls aurochs with its six shoulder dots, three ringed for the game; cup-marks and spirals cut as scratches with a lit lip; no writing, no frame, the torch's reach as the only edge. The aurochs' muzzle is the weakest drawing on the sheet, and the best-score tally sits so deep in the failing light it barely reads — the honest cost of one torch, and a UX risk the era file carries. | Opus |
| II · The Disc | `disc.html` | Sonnet: a brown gradient rectangle with flat gold clip-art discs — failed | **Opus reached the standard.** The sheet is a cast bronze object seen close, the horizon arcs and the barge as its frame, every gold element inlaid with a groove and a lit edge, the families carried by chased Bronze Age ornament. One fidelity note for the port: the small italic captions show reconstructed Proto-Germanic words the research says must never appear as if the culture wrote them; on the built sheet there are no words at all. | Opus |
| III · The Ceiling | `ceiling.html`; playable extraction in `src/ceiling.js` | Sonnet: the register composition and the flat discs were right; the plaster, the painted line, the figure and an out-of-era HUD (a green bar, modern digits) were not | **The standalone drawing study reached prototype standard; the integrated renderer is now the colour authority.** Direct comparison with TT353 corrected the scene to a dominant light-plaster field, fine black structure, sparse red/mineral accents and no Nut arch. The local hieroglyph face, hour circles, flat barque, body signs and four danger painters are playable from the main menu. A second integration pass then answered the standing complaint that the sheet was thin on Egyptian symbolism and clean in its lettering: kheker frieze, polychrome block borders, star bands, the painter's snapped red canon grid, painted month circles, Meskhetiu with its seven stars and Reret with her crocodile and post, quadrat-stacked decan columns, Egyptian numerals and a cartouche around the score; the signs are painted in the wall's four passes rather than set as type, and the modern Latin layer moved off a screen serif onto a slab. | Opus (Sonnet for layout) |
| IV · The Marble | `marble.html` | Sonnet: marble relief lit from one side, Greek and Roman capitals in the chosen faces, Ptolemy's *megethos* key, the dangers named — creditable | **Acceptable from Sonnet, with a polish pass.** The ground reads more as veined paper than as stone, the relief is shallow, and the Lyra figure is a thin outline. The grammar is right; the depth is not there yet. | Sonnet, then an Opus polish |
| V · The Globe | `globe.html` | Sonnet: a flat cream rectangle, empty gold-ringed discs, stick figures — failed | **Opus reached the standard.** Sized paper with fibre, chain lines and foxing; a red-and-gold jadwal with corner pieces; leaf with bole line, burnish and cracks; lapis with granulation; seven gilt roundels carried by textile geometry; al-Jabbār drawn twice, facing across the gutter, with gold-disc stars and magnitudes on top; naskh and kufic in the real faces. Shaping is the browser's here; the build pre-shapes with fontkit. | Opus |
| VI · The Engraving | the game | — | The standard itself. | — |
| VII · The Plate | `plate.html` | Sonnet: the negative, the réseau, the ink notes and the typed label were right; the material was flat and the specimens were seven identical blobs | **Opus reached the standard.** One gelatin-on-glass negative on a light table: mottled emulsion, pooled developer, grain, dust, a scratch, a frilled edge and a chipped corner; seven distinct photographic recordings; the void as a real tear with islands of emulsion still holding stars; halation with its back-surface ring. | Opus (Sonnet for structure) |
| VIII · The Observatory | `observatory.html` | Sonnet: the FITS header, the instrument margin, orbits allocated and used, the EHT ring, the coronagraph occulter, lit bodies with a terminator | **Sonnet reached the standard,** on the strength of the shipped modern plate it builds on. The nebula pillars are faint and the Parker-spiral crosswind reads as a fan; both are polish. | Sonnet |
| IX · The Probe | `probe.html` | Sonnet: the telemetry frame with its sync marker, the plaque border and single-stroke title, the pulsar-map constellation, the potential-mesh well, the bill of materials, a daughter on an escape burn | **Sonnet reached a prototype standard.** It reads as an instrument, which is the point, and the two registers (plaque and display) are both present. The sensed masses are deliberately plain and could carry more of their spectra; the plaque register is thin. Budget an Opus pass for the plaque hand when the Hershey stroke path is built. | Sonnet, then Opus for the plaque |

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

## The prototypes and the knowledge horizon

All nine prototypes were painted before [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) was
decided, and the five hand-made ones paint seven families each. Their grounds, dangers, pickups,
frames and hands are unchanged by the horizon and remain the porting sources; their bodies are
not. Under the horizon eras I–V want one point painter each — a body in a brightness class, and
the Moon — and VI and VII want a second reading for the bodies their century misread. The first
sheet painted under the horizon is `turn-rock-disc.html`, the page turn from era I to era II:
the Rock's bodies as three sizes of dab and the Moon's face, the Disc's as one punch always, the
new sheet rising from the bottom edge, the route re-struck from the ground up, the held body the
first thing the new century sees. Its screenshots are `shots/turn-rock-disc.1.jpg` to `.4.jpg`,
and its verdict is in the table below.

| Sheet | Prototype | Verdict |
|---|---|---|
| I → II, the turn | `turn-rock-disc.html` | **Reads, at prototype standard.** Both grounds are the ones already accepted — the lit limestone relief and the hammered bronze — and the turn itself is the sheet's argument: the disc's pierced rim is the leading edge, the rock goes dark beneath it, the route is re-struck from the floor upward with the punch's flash, and the held body is struck last with its ring chased around it, the barge already on it when the gloss arrives. What reads well: the inheritance of the route (a flint line becoming a run of taps is legible without the legend), the one-punch grammar against the rock's three sizes, the crescent for the Moon. What is weak: the rock's *faint* class reads as a smudge rather than a body, and the Moon's face is small enough to need the legend; the disc's ground is darker than `disc.jpg` under its flood and vignette together, and the horizon arcs dominate the still; and "the bottom edge is the Earth" is carried by the motion and the gloss more than by any frame. The four stills are t = 0.08, 0.40, 0.70 and 0.97. Painted by Fable from the two Opus prototypes; budget an Opus polish for the rock's bodies when the era is built. |

## What the prototypes are not

They do not run the game's stroke pipeline, its shaping, its caches or its simulation. A
prototype's `paintBody(family)` is a porting source for a third body painter beside the engraved
and rendered ones, not a drop-in. The faces in `prototypes/fonts/` are full TTFs to be cut with
`npm run fonts` before any embed; the Arabic is shaped by the browser here and by fontkit in the
build. Their screenshots in `shots/` are the record of what each era looked like on the day its
plan was written, kept beside the plan so the next session can see the target.
