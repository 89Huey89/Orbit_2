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

**Status: open.** See [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md). Nothing below assumes an answer — every
roster is written as *depictions of the existing rows*, so it is buildable under A today and can be
extended under B or C later.

---

## The rows, and what each era calls them

Three rows exist: the **attractor** (draws inward, lethal to the drawn edge), the **repulsor**
(pushes outward, only its smaller core kills), and the **crosswind** (blows one steady way, cannot
kill). Nebulae sit apart as an obscurer.

### The attractor — today's VORAGO

| Era | Name | Drawn as |
|---|---|---|
| I · Ceiling | **Apep** (Apophis) | The serpent of the underworld that swallows the sun each night, coiled flat in the register — the one Egyptian danger that is unambiguously a danger |
| II · Globe | **al-Ghūl / the tinnīn** | The dragon of the lunar nodes, *ra's al-jawzahar*, whose head and tail devour sun and moon at eclipse; the star Algol still carries the name |
| III · Engraving | **VORAGO** | *shipped* — the whirlpool in the aether the old charts engrave at the edge of the world, and Descartes' own account of what the heavens are made of |
| IV · Plate | **Emulsion void** | A dead patch where the silver lifted off the glass — stars simply stop, and the plate's own annotation says so |
| V · Observatory | **The black hole** | The one the vortex commit deliberately left unspent. Lensing, photon ring, accretion disc — three centuries too early for era III and exactly right here |

That last line is the argument for the whole ladder in miniature: **the black hole was not deleted,
it was moved to the century it belongs to.**

### The repulsor — today's MACULA

| Era | Name | Drawn as |
|---|---|---|
| I · Ceiling | **The Eye of Ra** | The disc that scorches; sun-disc with radiating uraei |
| II · Globe | **al-Shams' burning** | A gilt disc throwing lines of heat, as an astrolabe's sun is figured |
| III · Engraving | **MACULA** | *shipped* — Galileo's sunspot with its hatched penumbra |
| IV · Plate | **Halation** | The bloom an overexposed star burns into the emulsion, spreading past its own disc |
| V · Observatory | **Coronal mass ejection** | An Hα active region and the loop leaving it |

### The crosswind — today's VENTUS

| Era | Name | Drawn as |
|---|---|---|
| I · Ceiling | **Shu** | The god of air himself, holding the sky apart from the earth |
| II · Globe | **al-Rīḥ** | The wind named on the rose of a portolan, in the margin |
| III · Engraving | **VENTUS** | *shipped* — the cheek-blown wind-head, the same head already cut into the frame's four corners |
| IV · Plate | **Tracking drift** | The plate's own failure: everything near it trails one way, as a guiding error smears a field |
| V · Observatory | **Solar wind** | A charged stream, drawn as a vector field rather than a figure |

Note how well era III's wind-head already sits: **the frame has had four of them in its corners since
long before VENTUS existed.** The theme did not invent a hazard, it promoted an ornament. That is the
standard the other eras' dangers should be held to — find the thing the era already draws, and give it
a rule.

### The obscurer — today's nebula

Least era-bound of the four, because a cloud is a cloud. Era I would make it the primordial waters of
**Nun**; era IV would make it a genuine dark nebula with a Barnard number; era V a dust lane in false
colour. Era II is the hardest: Islamic astronomy did record nebulae — al-Ṣūfī describes the Andromeda
"little cloud" and the Large Magellanic Cloud — so the name is available even though the drawing
tradition is not.

## The cheapest possible first step

Under option A, an era's dangers are **three drawing functions and three captions**. `drawHazard()`
already branches on kind; it would branch on plate first. No simulation change, no test change, no
migration — and the modern plate could have its black hole back this week.
