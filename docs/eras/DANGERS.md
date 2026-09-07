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
and the vortex is its fallback. It is the same shape as the era's orbit rings: **the rows never
change, only how they are depicted.** (The bodies are the one place the ladder now shows *less*
than the shipped game rather than the same thing differently — see the note at the head of the
next section.)

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

**Status: decided, and A ships first everywhere.** [OVERVIEW.md](OVERVIEW.md) and
[PROGRESSION.md](PROGRESSION.md) settle the ladder's gate: an era is armed by its own observation
ledger, not by total score, and the eight eras are climbed strictly in order for every run — the
next era's transition object is *designated* from the chart already dealt, never spawned, so
`this.random()` is never called again mid-run. That is exactly what dissolves objection 2 above:
comparable scores no longer require every era's hazards to be identical, only that reaching a given
era means having climbed every era before it in the same order, which the ladder's strict sequence
guarantees by construction rather than by keeping the roster frozen. The daily plate (one seed and
one era, the era rotating through the ladder for everyone) and the ledger (`deepestEra` beside
`deepestChapter`, no per-era records) are built on the same guarantee, so objections 1 and 3 fall the
same way. That leaves **B, and even C, genuinely safe to adopt later, one era at a time** — the
strict order is what makes a B rule safe: everyone who reaches an era has climbed the same eras to
get there. This file calls it plainly: **depiction only (option A) at every era first.** No era
earns a hazard roster of its own — a B — until it has shipped under A. Nothing below assumes more
than that. See [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for what a later per-era roster would still
have to answer.

---

## The rows, and what each era calls them

**The knowledge horizon does not reach the dangers.** [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)
limits what an era may show of a *body* to what its astronomy could know of a surface; a danger
is not a claim about a surface but a figure for a force, and every era on the ladder had figures
for pulling, burning, blowing and hiding. Yínghuò shǒu xīn is not asserted to be an astronomical
object any more than VORAGO is. So the tables below stand as they are, and the standard they are
held to is the one already stated: find the thing the era already draws, and give it a rule.

Three rows exist: the **attractor** (draws inward, lethal to the drawn edge), the **repulsor**
(pushes outward, only its smaller core kills), and the **crosswind** (blows one steady way, cannot
kill). Nebulae sit apart as an obscurer. Eight eras fill each row, [OVERVIEW.md](OVERVIEW.md)'s
ladder — the five this table used to carry (I·Ceiling … V·Observatory) recompose into I·Rock,
II·Ceiling, IV·Astrolabe, V·Engraving and VI·Lens below; III·Scroll and VII·Flyby are added as new
eras with no forebear in the old table; and the Observatory no longer stands as its own era — its
material becomes the Lens's third register (VI, below). The Disc and the Marble are retired from
the spine; their dangers stand as they always did, at
[`candidates/disc.md`](candidates/disc.md) and [`candidates/marble.md`](candidates/marble.md).

### The attractor — today's VORAGO

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Shaft** | A dark vertical drop rimmed by a pecked spiral, after Lascaux's own *Puits* — the pull drawn as the eye being drawn down into it, not as a whirlpool |
| II · Ceiling | **Apep** (Apophis) | The serpent of the underworld that swallows the sun each night, coiled flat in the register — the one Egyptian danger that is unambiguously a danger |
| III · Scroll | **熒惑守心** (*Yínghuò shǒu xīn*, "Mars lingering at the Heart") | A baleful reddish point the eye is drawn toward and held at, not released — Mars's own dreaded retrograde station near the Heart asterism (containing Antares), attested across multiple historical episodes (e.g. Lord Jing of Song, 480 BCE) as the omen most associated with an emperor's death or a state's fall; "guarding" read visually as a pull that refuses to let go |
| IV · Astrolabe | ***raʾs al-tinnīn* (al-jawzahar)** | The Moon's ascending orbital node, the point where eclipses become possible — a load-bearing term in every *zīj*'s eclipse tables, inherited from a Middle Persian *gōzihr* — drawn as a knotted, tail-in-mouth dragon engraved fine around the throne or shackle, its head marking the pull; the coiled form is attested Seljuk/Ilkhanid dragon iconography, its placement on an astrolabe's own throne a plausible reconstruction |
| V · Engraving | **VORAGO** | *shipped* — the whirlpool in the aether the old charts engrave at the edge of the world, and Descartes' own account of what the heavens are made of |
| VI · Lens — the plate | **Emulsion void** | A dead patch where the silver lifted off the glass — stars simply stop, and the plate's own annotation says so |
| VI · Lens — the rendered sphere | **The black hole** (EHT ring) | A black disc ringed by a thin, deformed bright arc, visibly brighter on one side — the EHT's own image, and the black hole the vortex commit deliberately left unspent |
| VII · Flyby | **Gravity well / uncontrolled decay** | A body's mass understated by early tracking, drawn as a warp in the trajectory-prediction line itself — a navigation team's own plot, quietly wrong until corrected; every flyby genuinely refines a body's mass from how its real path bends against the prediction |
| VIII · Probe | **WELL** | Not a photographed ring but a warped equipotential mesh converging on the mass, a pulsar where present marked as a rotating tick at its centre — the plot a navigation computer would actually draw |

That is the argument for the whole ladder in miniature: **the black hole was not deleted, it was
moved to the century it belongs to** — and VIII draws the same underlying pull as a mesh, not a
ring, precisely so the two eras never share one image. See "Three eras that must never read alike"
below. (Era VI's telescope register, 1610–1887, has no attractor render of its own yet; nothing
below assumes one.)

### The repulsor — today's MACULA

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Flare** | A soot-blackened halo around an ember-red core — the scorch a guttering, over-fed torch leaves on a low ceiling |
| II · Ceiling | **The Eye of Ra** | The disc that scorches; sun-disc with radiating uraei, or Sekhmet unleashed and rampaging until placated — either reading fits "pushes outward, small lethal core" |
| III · Scroll | **彗星** (*huìxīng*, "broom star") | A tailed comet, terminologically and observationally distinct from a guest star by its tail alone; the tail itself is the pushing shape — a trailing brush-stroke sweeping outward from the body, the opposite gesture from the attractor's held point. The Mawangdui silk atlas names 29 such forms |
| IV · Astrolabe | **al-Shams' burning** | The sun, whose position and heat an alidade's shadow-square is built to measure without ever sighting it directly — drawn as a gilt disc with fine incised lines struck outward from it at even angles, echoing the shadow square's own ruled divisions rather than a painted sunburst |
| V · Engraving | **MACULA** | *shipped* — Galileo's sunspot with its hatched penumbra |
| VI · Lens — the plate | **Halation** | The bloom an overexposed star burns into the emulsion, spreading past its own disc |
| VI · Lens — the rendered sphere | **CME** (occulter) | Its own coronagraph: a LASCO occulting disc with a thin white ring marking the Sun's true edge, the CME breaking through as leading front, dark cavity, bright trailing core |
| VII · Flyby | **Radiation belt / instrument fault** | A hard-edged, dense particle field — Jupiter's belts, which genuinely damaged Pioneer 10/11 and constrained later trajectories — a band to cross quickly, not dwell in |
| VIII · Probe | **BEAM** | A pulsar's swept beam or a flare's radiation-pressure front, drawn as a rotating sector wedge — an instrument reading, not a photograph |

### The crosswind — today's VENTUS

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **The Draught** | A streaked charcoal smear, dragged sideways, echoing a torch-flame bent by a real cave airflow — the same airflow cavers still follow to find hidden passages |
| II · Ceiling | **Shu** | The god of air himself, holding the sky apart from the earth |
| III · Scroll | **風角** (*fēngjiǎo*, "wind angle") *(weak)* | An attested class of Han-dynasty military and court divination reading the compass direction, strength and quality of wind for omens, catalogued among the *fangshi*'s (方士) techniques in the *Book of Later Han* — no single quotable incident anchors this row the way *Yínghuò shǒu xīn* anchors the attractor, so it stands beside the Disc's oar-strokes as the ladder's other attested-practice-general row rather than one named event |
| IV · Astrolabe | ***al-Rīḥ* (*sammūm*)** | The specific violent hot desert wind named in period texts, distinct from the general word for wind; drawn as a short compass-rose fragment on the instrument itself — a few engraved rhumb-line ticks radiating from a point, the same drafting mark an azimuth line already uses — not a portolan-style wind figure sitting in a margin, since no period astrolabe carries a decorative wind-figure the way a portolan chart's own margin does |
| V · Engraving | **VENTUS** | *shipped* — the cheek-blown wind-head, the same head already cut into the frame's four corners |
| VI · Lens — the plate | **Tracking drift** | The plate's own failure: everything near it trails one way, as a guiding error smears a field |
| VI · Lens — the rendered sphere | **Solar wind** (Parker) | A charged stream, drawn as a vector field rather than a figure |
| VII · Flyby | **Solar wind / outgassing** | Drawn as the Lens's rendered register already does — a field, not a figure; for a comet pass, outgassing instead: a nucleus venting gas and dust asymmetrically as it warms, a real non-gravitational drift on its own trajectory, drawn as streamlines with drifting specks or jets breaking from a 67P-styled nucleus off its spin axis |
| VIII · Probe | **ISM FLUX** | The interstellar medium's particle flux as thin flux-vector arrows — monochrome, numeric, no colour gradient, the row closest to repeating the Lens's rendered register and the Flyby's |

Note how well era V's wind-head already sits: **the frame has had four of them in its corners since
long before VENTUS existed.** The theme did not invent a hazard, it promoted an ornament. That is the
standard the other eras' dangers should be held to — find the thing the era already draws, and give it
a rule.

**The wind-heads' lineage.** The Anemoi carved on the octagonal Tower of the Winds (Athens, c. 50
BCE) are very likely the typological ancestor of every corner wind-head on a Renaissance map, since
Vitruvius's account of the tower is exactly the kind of text Renaissance cartographers had to hand —
but no source traces a direct citation chain from that tower to era V's own four corner heads, so
the lineage stays plausible, not confirmed *(unverified)*.

### The obscurer — today's nebula

Least era-bound of the four, because a cloud is a cloud. Era IV is the hardest: Islamic astronomy did
record nebulae — al-Ṣūfī describes the Andromeda "little cloud" and the Large Magellanic Cloud — so
the name is available even though the drawing tradition is not.

| Era | Name | Drawn as |
|---|---|---|
| I · Rock | **Unlit rock** | Nothing drawn at all — the one hazard this era can depict with total fidelity, because the real thing already looks exactly like an absence of light |
| II · Ceiling | **Nun** | The formless waters before creation, everywhere and nowhere — the natural fit for an inert fog patch that hides rather than harms |
| III · Scroll | **日食 / 月食** (*rìshí* / *yuèshí*, literally "sun-eating" / "moon-eating") | The plain classical terms for a solar or lunar eclipse — the word for the event *is* the omen, describing something visibly being consumed. Depict as a literal bite taken out of a disc; the etymology needs no translation into a new image at all |
| IV · Astrolabe | ***al-shayʾ al-saḥābī*** | Al-Ṣūfī's own words for the Andromeda "little cloud" and the Large Magellanic Cloud — name attested, drawn as a loose scatter of small unengraved, unlit dots, the one hazard depicted by the *absence* of this sheet's own engraving discipline rather than by a drawn shape, since no period image of a nebula as a hazard-form exists |
| V · Engraving | **Nebula** | *shipped* — patches at the margins |
| VI · Lens — the plate | **Dark nebula** (B-number) | A genuinely star-free patch with a soft, uneven edge, optionally flagged with a hand-written Barnard number, after Barnard's and Wolf's photographic proof that some "holes" are nearby dust clouds, not gaps |
| VI · Lens — the rendered sphere | **Dust lane** | `paintModernBackdrop()`'s dust lanes, already shipped and already correct, with a catalogue-style caption in the spirit of the Lynds Dark Nebula catalogue |
| VII · Flyby | **Signal dropout / occultation** | A body passing between craft and Earth blanks telemetry for its duration, drawn as the frame itself losing sync, not a cloud shape — the one obscurer on the ladder about communication, not obstruction |
| VIII · Probe | **EXT** | A dust cloud read the only way a probe can — a shaded attenuation region with a logged magnitude of signal loss, not a rendered nebula |

## Three eras that must never read alike

The Lens's rendered register, the Flyby and the Probe sit at the technological end of the ladder
and would otherwise repeat a plate — three eras whose attractor, repulsor and crosswind rows all
reach for the same pull, flare and wind-vector idioms. [OVERVIEW.md](OVERVIEW.md) draws the line
for the attractor by construction: the black hole stays in the Lens's rendered register (VI); the
Probe's WELL is a mesh, not a ring, so the two never read alike. The same split carries the other
two rows, now across three eras rather than two. The Lens *images* a phenomenon — a telescope's or
a coronagraph's own photograph: the EHT ring, a LASCO occulting disc, a rendered Parker-spiral
streamline. The Flyby *plots* a mission risk — a navigation team's trajectory-prediction line
warping against a body's true mass, a particle-field band to cross quickly, streamlines with
drifting specks off a comet's spin axis — attested operational categories, named the way a flight
controller would name them, with no photograph standing behind any of them. The Probe reads an
*instrument output* with nothing imaged or hand-plotted behind it at all: WELL as a warped
equipotential mesh, BEAM as a rotating sector wedge, ISM FLUX as thin flux-vector arrows,
monochrome, no colour gradient. The fix is **register, not idiom**: the Lens draws what a telescope
saw, the Flyby draws what a navigation team plotted, the Probe draws what its own instruments
compute. No era should borrow another's rendering vocabulary to make its point, and the ordering —
imaged, then plotted, then computed, a step further from a human eye at an eyepiece each time —
stays untested side by side across all three; worth a look once each is built.
[`research/space-age.md`](research/space-age.md) states the same discipline from the Flyby's own
side: "this era's rows sit deliberately before [the Lens's] in register — instrument-*plotted*
risk, not instrument-*imaged* phenomenon."

## After era VIII: what the four rows escalate into

[PROGRESSION.md](PROGRESSION.md) is explicit that reaching the Probe's own transition ends the
historical climb permanently — no ninth era, no further arming, nothing left for this file to hand
a fifth row of depiction to. What continues past that point is the run, not the ladder, and it
continues on machinery the game already owns: `world.row` already scales darkness speed, chart
growth and hazard density through the same seeded generation that has been running since row one,
with the one hard ceiling that used to stop it, `chapter = Math.min(3, Math.floor(world.progress/8))`,
lifted so the escalation simply keeps climbing instead of plateauing where era VIII used to end the
story. Per [PROGRESSION.md](PROGRESSION.md)'s own list, what an endless run escalates is **larger
transfer gaps, more complex orbital configurations, stronger gravitational anomalies, higher speeds,
stranger objects, more exotic environments** — and every one of those is a description of how often
and in what combination `HAZARD_KINDS`' four existing rows are dealt into a chart at extreme row,
never a fifth row, a new field, or a new rule added to the table this file specifies.

Concretely, and without inventing anything the table above does not already carry: the attractor
stays WELL past the Probe's own transition, its field wider and its pull stronger as row climbs; the
repulsor stays BEAM, its reach and lethal core scaled the same way; the crosswind stays ISM FLUX,
its vector field denser and less forgiving to cross; the obscurer stays EXT. "Stranger objects" and
"more complex configurations" are read honestly as *density and combination*, not *kind* — two or
three of the existing rows dealt into one constellation where a historical-era chart dealt one, a
wider field overlapping a longer reach, never a hazard this file has not already named. This is
**parameter scaling on existing spawn rules**, in exactly the sense [PROGRESSION.md](PROGRESSION.md)
states it, and it is exactly why endless mode does not weaken this file's own settled decision that
dangers are depiction only. The decision survives because it never depended on the ladder ending at
eight rows of art — it depended on `HAZARD_KINDS` staying one table with a fixed roster that every
era, and now every row past the last era, draws in its own hand. An endless run has no era of its
own left to diverge into, so there is nothing left for a per-era roster (option B or C, above) to
compete with past this point: turning a dial on rows the whole ladder already shares is a different
kind of change from giving one era a hazard the others do not have, and only the second kind was ever
the risk this file exists to manage.

## The cheapest possible first step

Under option A, an era's dangers are three drawing functions and three captions — eight eras' worth
now, not five, plus the Lens's own extra two registers, but the shape hasn't changed. `drawHazard()`
already branches on kind; it would branch on era (and, for the Lens, register) first, then kind. No
simulation change, no test change, no migration — and the Lens's rendered register could have its
black hole back this week.
