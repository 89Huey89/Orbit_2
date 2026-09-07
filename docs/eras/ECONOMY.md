# One traversal rule, eight skins

The old file's organising idea was one currency per era, one rule per century: rows I–VII shipped
under other names, rows VIII and IX each added a rule beside the name. This pass kills the rule
half outright — "internally it may be one mechanic," the brief says, and that is taken literally
now, not as a floor under eight variations. The Observatory's allocation tax dies with
its era, folded into the Lens as depiction only. The Marble's magnitude rule dies with its era,
retired to [candidates/marble.md](candidates/marble.md). The Globe's twice-drawn fork dies too,
though its era survives, reframed and renamed as the Astrolabe. What is left, once those three
rules are gone, is exactly what every one of this pass's own research files already offered as
its safe fallback: **rename the currency, touch no number.** Read `ECONOMY` now and every row but
one says the same thing in a different hand — the rows below are each era's own "no-twist
reading," because that reading is now the only reading. The one genuine change, the release
dividend scaling with observation completeness, is described in full below and is not one of
those renames: it is the single new number this pass adds to the whole economy.

## Why a table

The vortex commit turned every hazard into one row of `HAZARD_KINDS` and said why: a later chart's
black hole is the first row under another name, which is why the shape is a table it can be added
to rather than a condition threaded through the flight code. `ECONOMY` keeps that shape for the
same reason, even though it now carries less difference between its rows than `HAZARD_KINDS` ever
did: `OrbitWorld` is constructed with, and at each era transition handed, the row for the era it is
entering, and every row but the Probe's differs from the shipped one in exactly one field, its
`currency` string. That is worth keeping as a table anyway — if a future era ever earns back a
genuine rule, the row is where it goes, and nothing about `flightStep` or `capture()` has to learn
the era exists to receive it.

| Column | Meaning | Shipped value |
|---|---|---|
| `currency` | the era's word, read by the HUD and the inscriptions | `ink` |
| `captureGain` | dividend on a hard-turn landing, before the completeness multiplier | `INK_CAPTURE_GAIN = 0.05` |
| `perfectGain` | dividend on a clean tangent landing, before the completeness multiplier | `INK_PERFECT_GAIN = 0.12` |
| `orbitGain` | per second holding an orbit — unmultiplied, unchanged | `INK_ORBIT_GAIN = 0.13` |
| `slingGain` | per second on a slingshot lap | `INK_SLING_GAIN = 0.85` |
| `reach` | distance one full nib buys | `INK_REACH = 2000` |
| `harvest` | whether gains are read a second time into materials | `false` |
| `darkness` | the era's name for the pursuit; its rate is never changed | `the dark` |

## The rows

| Era | Currency · gloss |
|---|---|
| I · The Rock | **ochre** — the pigment itself, needing no translation: sourced, ground, carried into the dark, spent by the mark it makes ([research/rock.md](research/rock.md) §6). The one surviving depiction, not a rule: the aim guide's own reach contracts as ink drains and pulses outward on capture, a torch relighting — cosmetic by the architecture's own definition, unchanged since the old file. |
| II · The Ceiling | **the *khar*** (ḫꜣr) — grain, not the brief's own shorthand of pigment: the fixed monthly ration paid to the Deir el-Medina tomb painters, the best-documented wage in the era's own record and a truer economic fit than the paint itself, which the record barely prices at all ([research/ceiling.md](research/ceiling.md) §6). |
| III · The Scroll | **the *mò*** (墨) — the ink-stick itself, ground fresh against the inkstone immediately before use, wasted if over-ground and dry-brushed if under: a consumed-by-labour resource in the most literal sense on the whole ladder ([research/china.md](research/china.md) §6). |
| IV · The Astrolabe | **the *ḥibr*** (حبر) — lamp-black scribal ink, rationed like the gold leaf weighed beside it on the page. The brief's own shorthand, "the measured line," describes this era's *depiction* — the alidade, the struck limb, the abjad-numeral reading — not its economy: nothing in the archival record prices a sighting by the degree, but a calligrapher's wage and a folio's gold are both priced, in ink and metal, by weight ([research/globe.md](research/globe.md) §6, left standing by [research/instruments.md](research/instruments.md) §1). |
| V · The Engraving | **ink** — the shipped baseline, unrenamed: iron-gall on the astronomer's own draft page before a plate is ever cut, the number every other row is measured against. |
| VI · The Lens | **exposure** — held attention on a guide star, whether at an eyepiece, on a photographic plate, or budgeted in HST orbits after occultation and guide-lock; three centuries of the same rationed quantity, one name ([research/plate.md](research/plate.md) §6). |
| VII · The Flyby | **propellant** (Δv) — loaded once on the ground and never resupplied, the strictest ink on the whole ladder: what remains is the entire margin for every manoeuvre still to come ([research/space-age.md](research/space-age.md) §6). |
| VIII · The Probe | **mass** — feedstock, not the brief's own guess of "energy": the harvest below already commits this era to four materials, not one abstract unit, and mass is also, uniquely on this ladder, the literal substance of the next generation ([research/probe.md](research/probe.md) §6). |

## The one change: the release dividend

Every other row above is a name. This is a number, and it is the only one this pass adds.

`captureGain` and `perfectGain` are credited where they always have been, at the moment a body is
captured (`src/simulation.js:578`), keyed off how the *incoming* transfer was flown. What changes
is that the credit is now scaled by how documented the *departing* orbit was left — the brief's own
"release for a difficult transfer, or remain slightly longer... to receive a larger resource
refill," made literal, and exactly the number [PROGRESSION.md](PROGRESSION.md)'s observation ledger
already promises this file: "`documented` is the same fraction the release dividend will read."

```
documented = clamp(orbitSweep / (TAU*2/3), 0, 1)   // PROGRESSION.md's own ledger clock, unaltered
dividend   = (perfect ? perfectGain : captureGain) × (1 + skipped×0.5) × (RELEASE_FLOOR + (1−RELEASE_FLOOR) × documented)
```

`RELEASE_FLOOR` is provisional — it echoes the observation ledger's own `0.35` as a starting point,
not because the two must match, but because both answer the same question, "how much does an early
release cost," and a shared starting guess is cheaper to tune from than two unrelated ones. It
needs its own pass regardless: the ledger only paces which era a run is in, the release floor
throttles the resource that keeps a run alive at all, and the two settling on the same value would
be a coincidence worth distrusting, not evidence they should be one constant.

**Nothing new is tracked to compute this.** `orbitSweep` is zeroed at every capture
(`src/simulation.js:309,572`) and accumulated every frame an orbit is held (`:689–690`); its value
at release is already carried forward as `launch.sweep` (`:550`) for the slingshot's own charge
read. The dividend reads that same carried value a beat later than usual; it does not ask the
simulation for anything it did not already know, and it is the same value the ledger sums.

**Interaction with `orbitGain`.** The per-second gain while an orbit is held is untouched, and
stays untouched on purpose: it already rises with time held, which already correlates with sweep,
so scaling it too would double-count the same incentive on two clocks. The total ink a held orbit
returns is `orbitGain × secondsHeld` (continuous, as shipped) plus the scaled dividend (once, at
release) — leaving early forfeits only the second term, never the first, which is why the decision
stays legible: a player who bails at 90° still banked every second they held, and loses only the
size of the parting gift.

**The honest cost.** This is the change most likely to need balancing, and for a specific reason:
the brief is explicit that a long, skilled transfer must never be punished for its length, but a
long transfer usually means releasing *before* full documentation, to catch a distant body while
the geometry is still good — exactly the play this multiplier taxes. If `RELEASE_FLOOR` is set too
low, the game quietly starts rewarding patience over the ambitious slingshot the brief wants
rewarded; if set too high, the whole mechanic reads as cosmetic and the "leave capacity on the
table" decision stops being a decision. There is no way to know the right value without a built
sheet and the score-distribution probe `verify.mjs` already has the machinery for, the same probe
[PROGRESSION.md](PROGRESSION.md) proposes for its own ledger thresholds — `RELEASE_FLOOR` belongs
beside those constants in [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md), not decided here.

## The harvest is not a second economy

The Probe's harvest reads every gain the table already pays — `captureGain`, `perfectGain`,
`orbitGain`, `slingGain` — a second time into the material of the body that paid it. It is not a
parallel formula: it is a second write at the same credit sites, and it therefore inherits the
completeness multiplier for free. A half-documented ice world yields half the volatiles a fully
documented one would, for the same reason it now yields half the ink — because the harvest reads
the number after the multiplier, not before it. Nothing gates a route, `this.random()` is never
called again, and one seed still deals one chart.

| Material | Yielded by | Needed for |
|---|---|---|
| volatiles | ocean, ice, ringed | propellant and shielding |
| silicates | crater, dune | structure |
| metals | volcanic | electronics and the reflector |
| fusion fuel | storm | the reactor |

The four pickups become finished parts rather than raw stock: the slingshot a drive core, the
shield a shield plate, the reflector a sail segment, the inkwell an isotope cache. Material choice
is a read of the body's family, never a player decision — what keeps a one-button game one button.

**Replicate.** A daughter probe costs a bill of the four materials — four of each, provisionally,
tuned so the first bill completes about as often as a constellation does today. When the bill is
met the daughter launches: a second craft leaves the chart on an escape hyperbola, the score takes a
flat bonus scaled by generation, and the darkness — here called the flux — grants the same four
seconds of grace a constellation does. `GEN` rises by one. Every bill after the first is larger. The
first bill met is *closure*, recorded once as a medal, after Freitas and the NASA lunar-factory
study, in which a replicator is closed when it can make every one of its own parts. The run never
forks: one traveller, one score, always.

**The flux.** The rising darkness keeps its timing and is renamed. A probe is not chased by night
but by its own ageing — radiation damage, thermal budget, the reactor's half-life — and the sheet
says so.

## Where it sits in the code

- `ECONOMY` lives inside the `// BEGIN SIMULATION` markers beside `HAZARD_KINDS`; `verify.mjs`'s
  destructuring list gains it, plus `HARVEST_MATERIALS`.
- `OrbitWorld` takes the row as a construction option and accepts a new one at each era transition
  (the designated node's capture, [PROGRESSION.md](PROGRESSION.md) — no longer a page turn). The
  ink constants become reads of the row; the shipped numbers are the default row, so every existing
  test passes unchanged.
- The release dividend's multiplier is a pure function read at `src/simulation.js:578` off
  `launch.sweep`, already written at `:550` — no new field on `OrbitWorld`, no new call into
  `this.random()`, so it cannot touch which node spawns where or which route closes.
- `this.materials` is a four-slot tally, filled only when the row's `harvest` is set; the bill and
  `GEN` sit beside it; the daughter's launch reuses the constellation-completion event.
- The HUD reads `currency` and, in era VIII, one aggregate ring rather than four gauges. The ledger
  gains `maxGen` and the closure medal. `verify.mjs` keeps asserting what it asserts today — one
  seed deals one chart, the same courses complete — and adds two cases: a world built on the probe
  row over a fixed seed produces the same captures as one built on the ink row, with different
  materials; and a run flown identically to full documentation versus one releasing every body at
  90° produces the same chart with different ink totals, never a different route.

## What could make it unfun, and the simplest version that still feels like harvesting

Inventory management in a one-button game. The defences are that material is read off the family,
that the HUD shows one aggregate ring with four segments rather than four gauges, and that the bill
is small enough to complete from ordinary play. If even that is too much, the fallback is a single
material — mass — filled by every gain, and a daughter every N units. Build the four-material
version and be ready to collapse it.
