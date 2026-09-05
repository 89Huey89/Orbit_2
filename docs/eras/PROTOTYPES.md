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
| I · The Rock | `rock.html` | Sonnet: a flat pale wash, scattered clip-art, no torchlight, no relief — failed | see below | Opus |
| II · The Disc | `disc.html` | Sonnet: a brown gradient rectangle with flat gold clip-art discs — failed | **Opus reached the standard.** The sheet is a cast bronze object seen close, the horizon arcs and the barge as its frame, every gold element inlaid with a groove and a lit edge, the families carried by chased Bronze Age ornament. One fidelity note for the port: the small italic captions show reconstructed Proto-Germanic words the research says must never appear as if the culture wrote them; on the built sheet there are no words at all. | Opus |
| III · The Ceiling | `ceiling.html` | Sonnet: the register composition and the flat discs were right; the plaster, the painted line, the figure and an out-of-era HUD (a green bar, modern digits) were not | **Opus reached the standard.** Plaster with crazing and the painter's snapped red grid, every shape in the four attested passes, Sah and Sopdet in the canon, the month-circle as the magnitude key, the HUD entirely in Egyptian numerals, quadrats grouped by hand. | Opus (Sonnet for layout) |
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

## What the prototypes are not

They do not run the game's stroke pipeline, its shaping, its caches or its simulation. A
prototype's `paintBody(family)` is a porting source for a third body painter beside the engraved
and rendered ones, not a drop-in. The faces in `prototypes/fonts/` are full TTFs to be cut with
`npm run fonts` before any embed; the Arabic is shaped by the browser here and by fontkit in the
build. Their screenshots in `shots/` are the record of what each era looked like on the day its
plan was written, kept beside the plan so the next session can see the target.
