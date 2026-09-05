# Dangers per era

The vortex commit on `main` did something more important than replace a black hole. It turned every
hazard into **one row of a table** — `HAZARD_KINDS` in `simulation.js`: which way the field turns a
flight, how much of the drawn radius kills, how far it reaches, and the loss it reports — and it said
so out loud: *"A later chart's black hole is this first row under another name, which is why the shape
here is a table it can be added to rather than a condition it would have to be threaded through."*

That is the seam the whole per-era danger idea hangs on. But it also exposes the one place where the
ladder's founding rule breaks, and that has to be faced before any era is designed around it.

## The rule that breaks

`OVERVIEW.md` rule 1 says **the simulation never learns about the era** — every era is cosmetic,
exactly as every plate is today. That rule is what makes the ladder cheap and safe.

`HAZARD_KINDS` **is inside the `// BEGIN SIMULATION` / `// END SIMULATION` markers.** Hazards are
gameplay. So the moment an era changes which dangers a chart carries, an era stops being cosmetic and
three things break:

1. **The daily plate.** Its entire premise is that one seed deals one chart to everyone, and
   `verify.mjs` asserts it (`'One seed deals one chart'`). Two players on the same day standing in
   different centuries would be dealt different courses.
2. **Comparable scores.** Personal bests per difficulty stop meaning one thing if the hazards
   underneath them differ by era.
3. **The ledger's hazard-linked figures** — `grazes`, `PERICULUM`, the vortex-only graze test at
   `figures.js:764` and `ui.js:322`.

The recent PR in fact did **two different things at once**, and separating them is the whole design
question:

| | What it did | Cosmetic? |
|---|---|---|
| Black hole → **VORAGO** | The *same row* under another name, drawn another way | ✅ yes — free, safe |
| Adding **VENTUS** | A *new row*: a new field, a new rule, a new thing to learn | ❌ no — this is gameplay |

## Three ways forward

### A. Dangers are depiction only *(safe, cheap, and available today)*

The table's rows are fixed for every era. Each era **draws and names** them in its own language. The
field, the core, the reach and the lethality are identical, so the same seed deals the same course on
every plate and nothing about the daily, the ledger or the record changes.

This costs nothing but drawing, because `drawHazard()` already dispatches on kind on the render side
and the vortex is its fallback. It is the same shape as the era's bodies: **the seven families never
change, only how they are depicted.**

### B. Dangers are era rules

Each era carries its own roster — VENTUS on the engraving, something else on the ceiling. Richest,
and breaks all three things above.

### C. The roster is per era, and the seed contract is widened to match

The daily plate names **a seed and an era**, so everyone still plays the same chart on the same day;
personal bests are kept per era, which is open question 3 answered a particular way. Each era then
genuinely *plays* differently rather than only looking different.

This is coherent and it is the most interesting version of the ladder, but it is a real change:
`HAZARD_KINDS` and the spawn rules stop being module constants and become something the world is
constructed with, `verify.mjs`'s simulation slice has to be handed an era, the daily gains a field,
and `orbit.ledger.v1` gains a version.

**Status: decided, and A ships first everywhere.** `DECISIONS.md` §1 makes the era a pure function of
total score — the boundary is armed when score crosses it, so two runs at any given score have
necessarily climbed the same eras in the same order to get there. That is exactly what dissolves
objection 2 above: comparable scores no longer require every era's hazards to be identical, only that
reaching a given score means having faced the same hazards along the way, which the score gate
guarantees by construction rather than by keeping the roster frozen. The daily plate (one seed and
one era, the era rotating through the ladder for everyone) and the ledger (`deepestEra` beside
`deepestChapter`, no per-era records) are built on the same guarantee, so objections 1 and 3 fall the
same way. That leaves **B, and even C, genuinely safe to adopt later, one era at a time** — the score
gate is what makes a B rule safe: everyone who reaches an era has met the same score to get there.
`DECISIONS.md` §3 nonetheless calls it plainly: **depiction only (option A) at every era first.** No
era earns a hazard roster of its own — a B — until it has shipped under A. Nothing below assumes
more than that. See [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for what a later per-era roster would
still have to answer.

---

## The rows, and what each era calls them

Three rows exist: the **attractor** (draws inward, lethal to the drawn edge), the **repulsor**
(pushes outward, only its smaller core kills), and the **crosswind** (blows one steady way, cannot
kill). Nebulae sit apart as an obscurer. Nine eras now fill each row, `DECISIONS.md` §3's I–IX; the
five this table used to carry (I·Ceiling … V·Observatory) are the same rows, renumbered III, V, VI,
VII, VIII below, with Rock, Disc, Marble and Probe added at the ends and the middle.

### The attractor — today's VORAGO

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Shaft** | A dark vertical drop rimmed by a pecked spiral, after Lascaux's own *Puits* — the pull drawn as the eye being drawn down into it, not as a whirlpool |
| II · Disc | **The Spiral** | Tightening bronze-dark rings with a gold-foil thread spiralling into the core — the spiral is engraved on both faces of the Nebra disc itself and repeated across razor handles and Bohuslän rock art, the best-attested depiction in this table |
| III · Ceiling | **Apep** (Apophis) | The serpent of the underworld that swallows the sun each night, coiled flat in the register — the one Egyptian danger that is unambiguously a danger |
| IV · Marble | **Charybdis** | The *Odyssey*'s whirlpool cut as a deep drilled spiral tightening toward a punched centre, the running-drill technique Roman workers used for undercut hair and drapery, turned on the sky |
| V · Globe | **al-Ghūl / *raʾs al-tinnīn*** | The dragon of the lunar nodes, whose head and tail devour sun and moon at eclipse; the star Algol still carries the name |
| VI · Engraving | **VORAGO** | *shipped* — the whirlpool in the aether the old charts engrave at the edge of the world, and Descartes' own account of what the heavens are made of |
| VII · Plate | **Emulsion void** | A dead patch where the silver lifted off the glass — stars simply stop, and the plate's own annotation says so |
| VIII · Observatory | **The black hole** (EHT ring) | A black disc ringed by a thin, deformed bright arc, visibly brighter on one side — the EHT's own image, and the black hole the vortex commit deliberately left unspent |
| IX · Probe | **WELL** | Not a photographed ring but a warped equipotential mesh converging on the mass, a pulsar where present marked as a rotating tick at its centre — the plot a navigation computer would actually draw |

That is the argument for the whole ladder in miniature: **the black hole was not deleted, it was
moved to the century it belongs to** — and IX draws the same underlying pull as a mesh, not a ring,
precisely so the two eras never share one image. See "Two eras that must never read alike" below.

### The repulsor — today's MACULA

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Flare** | A soot-blackened halo around an ember-red core — the scorch a guttering, over-fed torch leaves on a low ceiling |
| II · Disc | **The Sun-wheel** | Hammered-gold spokes bursting outward from a bronze disc — the wheeled sun-cross is one of the single most repeated motifs in Scandinavian rock art and Kaul's razor corpus |
| III · Ceiling | **The Eye of Ra** | The disc that scorches; sun-disc with radiating uraei, or Sekhmet unleashed and rampaging until placated — either reading fits "pushes outward, small lethal core" |
| IV · Marble | **Phaethon's fall** | A radiate solar disc with a falling chariot-wheel motif at its rim — Phaethon losing control of the sun's chariot, struck down before he could set the world alight; gloss the caption *Hēliou harma* ("the Sun's chariot") to keep it apart from Phaethon as this era's own name for Jupiter |
| V · Globe | **al-Shams' burning** | A gilt disc throwing lines of heat, as an astrolabe's sun is figured |
| VI · Engraving | **MACULA** | *shipped* — Galileo's sunspot with its hatched penumbra |
| VII · Plate | **Halation** | The bloom an overexposed star burns into the emulsion, spreading past its own disc |
| VIII · Observatory | **CME** (occulter) | Its own coronagraph: a LASCO occulting disc with a thin white ring marking the Sun's true edge, the CME breaking through as leading front, dark cavity, bright trailing core |
| IX · Probe | **BEAM** | A pulsar's swept beam or a flare's radiation-pressure front, drawn as a rotating sector wedge — an instrument reading, not a photograph |

### The crosswind — today's VENTUS

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Draught** | A streaked charcoal smear, dragged sideways, echoing a torch-flame bent by a real cave airflow — the same airflow cavers still follow to find hidden passages |
| II · Disc | **The Oar-strokes** *(weak)* | A run of short parallel gold strokes fringing the disc's ship, read by most scholars as oars propelling the barge — but that reading is disputed, so this is the weakest-attested row on the ladder |
| III · Ceiling | **Shu** | The god of air himself, holding the sky apart from the earth |
| IV · Marble | **The Anemoi** | Winged wind-gods carved on the octagonal Tower of the Winds, each on the face its wind blows from |
| V · Globe | ***al-Rīḥ*** | The wind named on the rose of a portolan, in the margin; the specific violent hot wind is *sammūm*, worth glossing alongside the general term |
| VI · Engraving | **VENTUS** | *shipped* — the cheek-blown wind-head, the same head already cut into the frame's four corners |
| VII · Plate | **Tracking drift** | The plate's own failure: everything near it trails one way, as a guiding error smears a field |
| VIII · Observatory | **Solar wind** (Parker) | A charged stream, drawn as a vector field rather than a figure |
| IX · Probe | **ISM FLUX** | The interstellar medium's particle flux as thin flux-vector arrows — monochrome, numeric, no colour gradient, the row closest to repeating VIII's |

Note how well era VI's wind-head already sits: **the frame has had four of them in its corners since
long before VENTUS existed.** The theme did not invent a hazard, it promoted an ornament. That is the
standard the other eras' dangers should be held to — find the thing the era already draws, and give it
a rule.

**The wind-heads' lineage.** The Anemoi carved on the octagonal Tower of the Winds (Athens, c. 50
BCE) are very likely the typological ancestor of every corner wind-head on a Renaissance map, since
Vitruvius's account of the tower is exactly the kind of text Renaissance cartographers had to hand —
but no source traces a direct citation chain from that tower to era VI's own four corner heads, so
the lineage stays plausible, not confirmed *(unverified)*.

### The obscurer — today's nebula

Least era-bound of the four, because a cloud is a cloud. Era V is the hardest: Islamic astronomy did
record nebulae — al-Ṣūfī describes the Andromeda "little cloud" and the Large Magellanic Cloud — so
the name is available even though the drawing tradition is not.

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **Unlit rock** | Nothing drawn at all — the one hazard this era can depict with total fidelity, because the real thing already looks exactly like an absence of light |
| II · Disc | **The cup-mark swarm** | A cloud of small dark pecked hollows overtaking part of the chart, after cup-and-ring marks that thicken into obscuring clusters across Atlantic-European and Scandinavian rock art |
| III · Ceiling | **Nun** | The formless waters before creation, everywhere and nowhere — the natural fit for an inert fog patch that hides rather than harms |
| IV · Marble | ***Galaxias*** | A soft, diffuse band — the Milky Way as Hera's spilled milk, the one era whose own name for this hazard is also the modern one |
| V · Globe | ***al-shayʾ al-saḥābī*** | Al-Ṣūfī's own words for the Andromeda "little cloud" and the Large Magellanic Cloud — name attested, drawing invented, because no period image of a nebula as a hazard-shape exists |
| VI · Engraving | **Nebula** | *shipped* — patches at the margins |
| VII · Plate | **Dark nebula** (B-number) | A genuinely star-free patch with a soft, uneven edge, optionally flagged with a hand-written Barnard number, after Barnard's and Wolf's photographic proof that some "holes" are nearby dust clouds, not gaps |
| VIII · Observatory | **Dust lane** | `paintModernBackdrop()`'s dust lanes, already shipped and already correct, with a catalogue-style caption in the spirit of the Lynds Dark Nebula catalogue |
| IX · Probe | **EXT** | A dust cloud read the only way a probe can — a shaded attenuation region with a logged magnitude of signal loss, not a rendered nebula |

## Two eras that must never read alike

VIII and IX sit at the technological end of the ladder and would otherwise repeat a plate — both
instrument-grammar eras whose repulsor and crosswind rows naturally reach for the same flare and
wind-vector idioms. `DECISIONS.md` §3 already draws the line for the attractor: "the black hole stays
in VIII; IX's WELL is a mesh, not a ring, so the two never read alike." The same split carries the
other two rows: VIII's CME is a coronagraph image (a LASCO occulting disc, a rendered corona, an
Hα-style loop) and its solar wind a rendered Parker-spiral streamline; IX's BEAM and ISM FLUX are
instrument output — a sector wedge, a set of flux-vector arrows, a numeric readout — with no colour
gradient and no photograph standing behind either. The fix is **register, not idiom**: VIII draws
what a telescope saw, IX draws what a navigation computer plots from what it senses. Neither era
should borrow the other's rendering vocabulary to make its point, and the pairing is untested side by
side — worth a look once both are built.

## The cheapest possible first step

Under option A, an era's dangers are three drawing functions and three captions — nine eras' worth
now, not five, but the shape hasn't changed. `drawHazard()` already branches on kind; it would branch
on era first, then kind. No simulation change, no test change, no migration — and the Observatory's
plate (VIII) could have its black hole back this week.
