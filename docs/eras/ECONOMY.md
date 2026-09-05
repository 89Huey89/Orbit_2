# One currency per era, one rule per century

Ink is era VI's word. Every century rationed the thing its sky was made of, and each era of the
ladder names that thing and, in a few cases, adds one rule beside the name. The last era changes
the rule: the probe harvests and replicates. This file is the table, the rules, and the reason the
score still means one thing when they differ.

## Why a table

The vortex commit turned every hazard into one row of `HAZARD_KINDS` and said why: *a later
chart's black hole is this first row under another name, which is why the shape here is a table it
can be added to rather than a condition it would have to be threaded through.* The economy takes
the same shape. `ECONOMY` is a table in the simulation slice, one row per era, and `OrbitWorld`
is constructed with — and, at each page turn, handed — the row for the era it is in. Rows I–VII
carry the shipped numbers under other names. Row VIII adds a tax. Row IX adds a harvest.

| Column | Meaning | Shipped value |
|---|---|---|
| `currency` | the era's word, read by the HUD and the inscriptions | `ink` |
| `captureGain` | dividend on a hard-turn landing | `INK_CAPTURE_GAIN = 0.05` |
| `perfectGain` | dividend on a clean tangent landing | `INK_PERFECT_GAIN = 0.12` |
| `orbitGain` | per second holding an orbit | `INK_ORBIT_GAIN = 0.13` |
| `slingGain` | per second on a slingshot lap | `INK_SLING_GAIN = 0.85` |
| `reach` | distance one full nib buys | `INK_REACH = 2000` |
| `tax` | flat cost on every transfer, before distance | `0` |
| `harvest` | whether gains are read a second time into materials | `false` |
| `darkness` | the era's name for the pursuit; its rate is never changed | `the dark` |

## The rows

| Era | Currency · gloss | The rule | Class |
|---|---|---|---|
| I · The Rock | **ochre** · the pigment itself | **The torch.** The aim guide's reach contracts as the ochre drains and pulses back at each capture: the firelight is the nib. Render-side; the numbers are the shipped ones. | A |
| II · The Disc | **gold foil** · rationed by heft | **The arcs.** The perfect-transfer window is drawn on the sheet as the disc's two gold horizon arcs, so the era that teaches the ascent shows its hand. Render-side. | A |
| III · The Ceiling | ***khar*** · the grain ration paid to the tomb painters | Rename only. The inkwell pickup is the ration; the tutorial century plays straight. | A |
| IV · The Marble | ***acies*** · the chisel's edge, dulling as it cuts | Rename only; nodes carry Ptolemy's α′–ϛ′ classes as depiction. *Deferred:* a brighter class narrows the perfect window. | A |
| V · The Globe | **gold and lapis** · by the *mithqal* | Rename only. *Deferred:* the twice-drawn rule — a completed fork spawns its mirrored twin later in the chapter, its own +60, as al-Ṣūfī drew every figure twice. | A |
| VI · The Engraving | **ink** | Shipped. | — |
| VII · The Plate | **exposure** · time on the plate | **Hold to develop.** A held orbit already earns; the body under it develops from a bare point to full detail on that same clock, and overholding fogs it. Render-side threshold on gain already tracked. | A |
| VIII · The Observatory | **telescope time** · allocated in orbits, as HST's is | **The allocation.** A flat acquisition overhead on every transfer before the distance cost, as a real orbit buys fifty minutes of exposure after occultation and guide-star lock; the HUD counts orbits allocated and used. | **B** |
| IX · The Probe | **mass** · feedstock | **Harvest and replicate.** Below. | **B** |

Class A is depiction only — the shipped numbers, drawn another way — and is what every era ships
under first. Class B is a rule the century adds. Two eras carry one; the score gate is what makes
them safe.

## Why the score gate makes B rules safe

[DANGERS.md](DANGERS.md) set out what breaks the moment an era changes a rule: the daily's
premise that one seed deals one chart, comparable personal bests, and the ledger's rule-linked
figures. The score gate dissolves the second and the daily's own era-per-day fixes the first: if
the era is a function of the score, then every run that reached 1,500 has met the allocation at
1,500, and every run that reached 2,400 has begun to harvest at 2,400. A best of 3,000 means one
thing again. The daily names a seed and an era, so its chart is the same for everyone by
construction. The ledger's hazard-linked figures are untouched because the hazards are.

What the gate does *not* license is a rule that changes the chart — a hazard roster, a spawn rule,
a row layout. Those stay in the simulation's row-based chapter, which never hears of the era.

## The probe's rule

**Harvest.** In era IX every gain the ink rules already pay — the capture dividend, the perfect
dividend, the per-second orbit gain, the slingshot lap — is read a second time into the material
of the body it came from. It is not a new formula; it is the existing one read twice, and the
author's brief was exactly this: the probe *uses orbits* to harvest. A held orbit around an ice
world fills the volatiles bar at `orbitGain`; a perfect capture on a volcanic world pays
`perfectGain` in metals. Nothing gates a route and `this.random()` is never called again, so one
seed still deals one chart.

| Material | Yielded by | Needed for |
|---|---|---|
| volatiles | ocean, ice, ringed | propellant and shielding |
| silicates | crater, dune | structure |
| metals | volcanic | electronics and the reflector |
| fusion fuel | storm | the reactor |

The four pickups become finished parts rather than raw stock: the slingshot a drive core, the
shield a shield plate, the reflector a sail segment, the inkwell an isotope cache. Material choice
is a read of the body's family and never a player decision, which is what keeps a one-button game
one button.

**Replicate.** A daughter probe costs a bill of the four materials — four of each, provisionally,
tuned so the first bill completes about as often as a constellation does today. When the bill is
met the daughter launches: a second craft leaves the chart on an escape hyperbola, the score takes
a flat bonus scaled by generation, and the darkness — here called the flux — grants the same four
seconds of grace a constellation does. `GEN` rises by one. Every bill after the first is larger.
The first bill met is *closure*, recorded once as a medal, after Freitas and the NASA lunar-factory
study, in which a replicator is closed when it can make every one of its parts. The run never
forks: one traveller, one score, always.

**The flux.** The rising darkness keeps its timing and is renamed. A probe is not chased by night
but by its own ageing — radiation damage, thermal budget, the reactor's half-life — and the sheet
says so.

## Where it sits in the code

- `ECONOMY` and its threshold table live inside the `// BEGIN SIMULATION` markers beside
  `HAZARD_KINDS`; `verify.mjs`'s destructuring list gains them, plus `HARVEST_MATERIALS`.
- `OrbitWorld` takes the row as a construction option and accepts a new one at a capture. The ink
  constants become reads of the row; the shipped numbers are the default row, so every existing
  test passes unchanged.
- `this.materials` is a four-slot tally on the world, filled only when the row's `harvest` is set;
  the bill and `GEN` sit beside it; the daughter's launch reuses the constellation-completion event.
- The HUD reads `currency` and, in era IX, the four bars. The ledger gains `maxGen` and the closure
  medal. `verify.mjs` asserts what it asserts today — one seed deals one chart, the same courses
  complete — and adds: a world constructed with the probe row over a fixed seed produces the same
  captures as one constructed with the ink row, and different materials.

## What could make it unfun, and the simplest version that still feels like harvesting

Inventory management in a one-button game. The defences are that material is read off the family,
that the HUD shows one aggregate ring with four segments rather than four gauges, and that the
bill is small enough to complete from ordinary play. If even that is too much, the fallback is a
single material — mass — filled by every gain, and a daughter every N units. Build the four-material
version and be ready to collapse it.
