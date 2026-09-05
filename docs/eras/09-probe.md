# IX · The Probe

**The far future.** A self-replicating interstellar probe, long after crewed astronomy, long
after even the Observatory's survey pipelines. The ladder's end, and the one era whose *rule*
changes rather than only its name: a von Neumann probe does not spend a nib of ink flying between
stars, it mines them.

## The two ends rhyme

Era I is marks struck into stone because that was the only durable writing available. Era IX is a
species that has invented radio, lasers, machine memory — and when it needed a message to survive
a billion years in vacuum, it *still* chose a metal plate and a burin-line drawing, because nothing
else lasts. The Pioneer plaque and the Voyager cover are, technically, engravings: a single
continuous line, cut once, never re-inked. The ladder's two ends are the same act at opposite
extremes of technology — marks struck into rock, marks engraved on the plaque — and this era only
has to notice the rhyme, not invent it.

## The documents

- **Pioneer plaque** (1972/73). Gold-anodized aluminum, 6×9 in, artwork by Linda Salzman Sagan:
  the hydrogen hyperfine transition fixing a unit of length and time, a radial 14-pulsar map in
  binary, a man and woman to scale, the solar system with Pioneer's outbound trajectory.
- **Voyager Golden Record cover** (1977). Gold-anodized aluminum over a gold-plated copper record:
  a cartridge-and-stylus playback diagram, the rotation rate given as **binary tick marks ringing
  the diagram** (one turn = 3.6 s), the same 14-pulsar map, a Uranium-238 decay curve making the
  cover its own clock.
- **Arecibo message** (1974) — a 1,679-bit radio bitmap, 23×73 so a receiver has exactly one
  rectangular layout: the sky as a raster that only becomes a picture once the shape is known.
- **LAGEOS plaque** (1976) — addressed to a future human, not an alien, its clock the very
  phenomenon (plate tectonics) the satellite flew to measure.
- **CCSDS telemetry transfer frame** — the era's real handwriting: a fixed-length frame prefixed
  by a 32-bit sync marker (`1ACFFC1D`), a primary header, a payload, an error-control field.

## The grammar

Two grammars share this era and never merge. **The telemetry half** does not draw the sky, it
*instruments* it: a body is numbers — mass, density, a spectral-class tag, a ΔV budget — an orbit
a Keplerian element set plotted as a thin conic section, black ground, monochrome vector lines, no
shading, no perspective. **The plaque half** is the opposite: a single continuous engraved line,
uniform weight, drawn once and never re-inked — where the constellation figures, the signature
sheet and the title lettering belong, the same ancestral plaque every daughter copies along with
its blueprint, unread by anything it has met. A player should be able to tell which half they are
looking at without a caption. Not present: perspective, atmosphere, painterly rendering, or any
picture of the sky *as seen* — the probe has no eye; everything shown is a measurement or an
inheritance.

## Palette

| Swatch | Source | Hex |
|---|---|---|
| Engraved gold | Pioneer plaque / Voyager cover | `#C7A24C` |
| Interstellar black (ground) | deep vacuum — not era VIII's `#04060b`, nearer true black | `#050505` |
| Radiator glow | an RTG's waste-heat radiators, the one warm light source | `#B8451F` |
| Telemetry green | phosphor-CRT convention | `#33FF66` |
| Telemetry amber | phosphor-CRT warning convention | `#FFB000` |
| Modern instrument white | DSN-Now/Eyes-on-the-Solar-System convention | `#E8ECF2` |
| Sail film | aluminized-mylar sheen | `#D9E4EA` |

Gold is the one warm worked material aboard, standing in for the game's gold-leaf/gold-accent role
(Cellarius's gilt is the closest surviving relative). Ink is telemetry green or amber by plate
variant, mirroring the night/paper split; ground is interstellar black, unbroken but for the
radiator's glow and starlight.

## Lettering and the hand

The probe writes in two registers, and neither is a script in the linguistic sense — by the time a
species sends a self-replicating machine to the stars, its handwriting is a data format. **The
plaque hand** is the Pioneer/Voyager engraved line, and the **Hershey fonts** are structurally
that line: single-stroke vector data drawn circa 1967 as engraving instructions for a
pen-following device, not a filled typeface — under "a permissive use and redistribution license,"
explicitly **not OFL; re-read the exact terms before shipping.** The catch: `scripts/glyphs.mjs`
extracts filled contour outlines and floods them, but Hershey glyphs have no contours, only
strokes. **The plaque hand needs a new code path that skips the flood step entirely** — closer to
`writeText()`'s clip-reveal than to `penLettering()`'s stroke-then-flood — via a small `.jhf`
parser or a converted single-line TTF, spiked before committing to the face. **The telemetry
hand** wants a monospace face built for the job: **B612 Mono** (OFL, designed for Airbus cockpit
displays, "the single most on-theme face available"), **Share Tech Mono** and **DSEG** (OFL,
seven-segment LCD/LED) as fallbacks — a feedstock counter that ticks like an odometer suits a
machine with no hand to write with. OCR-A/OCR-B are the right period reference but unverified for
licence. When the plaque hand sets a number, as the real plaques do, it draws binary tick marks,
not digits.

## Names

Wholly constructed, grounded in real CCSDS/JPL telemetry mnemonic convention — short, all-caps,
clipped English roots.

| Game term | Probe's word | Status |
|---|---|---|
| ocean / crater / ringed / ice / dune / volcanic / storm | `CLASS-H2O` / `CLASS-REG` / `CLASS-RNG` / `CLASS-CRYO` / `CLASS-AEOL` / `CLASS-IGN` / `CLASS-ATM` | constructed |
| slingshot / shield / reflector / inkwell | `DV ASSIST` / `SHLD` / `DEFL` / `CACHE` | attested term (slingshot) / constructed |
| orbit / capture / release | `ORBIT`, unchanged / `OI` (Orbit Insertion) / `ESC` (escape burn) | attested convention / attested term, constructed use |
| currency (ink) | `FEED` — feedstock/reaction-mass fraction | constructed |
| score | `GEN` — generation count | constructed |
| chapter/sheet | `PHASE` — mission phase | attested term, constructed use |
| personal best / daily plate | `MAX GEN` / `EPOCH` | constructed / attested term, constructed use |
| title "Orbit" / catalogue | `ORBIT`, unchanged / `MANIFEST` | attested / constructed |

## Currency and the rule

**Currency: mass**, feedstock and propellant mined or scavenged from a body and consumed both as
reaction mass and as raw material for the next daughter probe. It sorts into four materials, few
enough to hold in your head: **volatiles** (water ice, from ocean/ice/ringed), **silicates**
(Al/Si/Ti, from crater/dune), **metals** (Ni–Fe and platinum-group, from volcanic), and **fusion
fuel** (He-3/H₂, from storm) — a 3/2/1/1 split because the source literature is lopsided that way:
water ice is the single most commonly attested space resource, exotic metals and fusion fuel each
tied to one kind of body. The four pickups become finished parts rather than raw stock: the
slingshot star a salvaged drive core, the shield a pre-fab radiation-shield plate, the reflector a
sail segment, the inkwell a concentrated isotope cache — each already reads as its subsystem
before it is renamed.

**Harvest is every gain the ink rules already pay, read a second time into the body's material.**
`probe-mechanics.md` proposed a capture-gated harvest only, deliberately excluding the held-orbit
gain on the reasoning that tying harvest to time-on-orbit would decouple it from score, the trap
`OPEN-QUESTIONS.md` warns row-gating into. This document widens that: the `ECONOMY` table's
harvest cell reads capture, perfect, *and* held-orbit gain alike (DECISIONS.md §2), because the
author's brief for this era is plainly that **orbits harvest** — a probe mining the body it
circles, the Daedalus aerostat image the research itself reaches for. The widening is safe for the
same reason the narrower version was argued safe: `INK_ORBIT_GAIN` is already a per-second read of
a clock every era shares, gated by the same darkness pressure for every player, so two runs at the
same score have, in expectation, harvested comparably regardless of which gain financed it.

**The bill of four and the daughter's departure.** A daughter probe costs four of each material,
chosen to land roughly once every few main-node rows — the cadence a constellation completes on
today. No new node type, no new fork: the tally accrues automatically from ordinary play, and the
departure itself is **the constellation-completion beat, reused, not reinvented** — a second
sprite peels from the traveller's own line toward the frame's top, the same flash and
`darknessGrace` pause a completed constellation grants, and a **GENERATION** counter prints the
way `FLOW ×N` already does, incremented once per bill met. **Closure — the first bill met — is
recorded once per run as a medal**, exactly as `OBSERVATIONS` records a named feat; every bill
after is replication proper, each larger than the last, paying a flat bonus scaled up modestly by
generation. The run never forks: one traveller, one score, always.

**The flux is darkness, renamed and nothing more** — `darknessSpeed()`'s formula, multipliers and
timing unchanged, only its depiction: accumulated radiation dose and structural fatigue over
centuries in transit, catching the traveller because time itself is the cost.

**Where it sits in the code.** The `ECONOMY` row gains a `harvest` field; a new
`HARVEST_MATERIALS` lookup keyed by `planetFamily`, the way `HAZARD_KINDS` is keyed by `h.kind`;
and a running `this.materials` tally on `OrbitWorld`, alongside `this.captures`/`this.perfects` —
both add to `verify.mjs`'s destructuring list (`scripts/verify.mjs:8-9`), the same one-line
addition `CONSTELLATIONS` already got. The tally never calls `this.random()` again and never gates
a route, so it cannot break "one seed deals one chart," the daily plate's premise and the test at
`verify.mjs:964`.

## Dangers

All three rows keep their existing field/core/reach/lethality; only depiction and naming change,
and this era must not repeat era VIII's rendered instrument grammar for the same rows:

| Row | Name | Depiction |
|---|---|---|
| Attractor | **WELL** | Equipotential mesh, a warped grid converging on the mass, given as a number not a disc. **A mesh, not a ring — era VIII's black hole and this row never read alike.** |
| Repulsor | **BEAM** | A pulsar's swept beam or flare radiation front, a rotating sector wedge — a reading, not era VIII's rendered active-region loop |
| Crosswind | **ISM FLUX** | Thin monochrome flux-vector arrows, no colour gradient — most at risk of duplicating era VIII's solar wind; the fix is register, not idiom |
| Obscurer | **EXT** | A shaded attenuation region with a logged magnitude of signal loss, not a rendered nebula |

## The seven families

Each body is shown twice at once — a Hershey-line icon beside a monospace class readout, mass
number, mean density and a periapsis/apoapsis pair where relevant, set in DSEG or B612 Mono. Ocean
(`CLASS-H2O`): a plain circle with one horizontal chord. Crater (`CLASS-REG`): a circle stippled
with small unfilled rings, no shading. Ringed (`CLASS-RNG`): a circle crossed by one or two thin
ellipse arcs, the Pioneer plaque's own reduction of Saturn, borrowed directly. Ice (`CLASS-CRYO`):
a fine crosshatch fill at low density. Dune (`CLASS-AEOL`): parallel wave-lines, the one family
allowed to imply motion without implying light. Volcanic (`CLASS-IGN`): a small radiating
tick-cluster, never flame or glow (reserved for the radiator-heat accent). Storm (`CLASS-ATM`):
one internal spiral stroke.

## Frame and furniture

No cartouche, no colophon, no engraver's credit — the closest equivalent is the plaque's own
identifying marks. The frame becomes a **CCSDS transfer-frame border**: a header bar with the sync
marker in hex (`1ACFFC1D`), a virtual-channel ID and a running frame counter, closing on a checksum
field, doing the job the plate-mark and double rule did. A margin strip in the DSN-Now idiom
(one-way light time, signal strength, which antenna is locked) replaces the compass rose. HUD
numerals tick over rather than being inscribed; a chapter announces a `PHASE` change, not a page
turn.

## The signature sheet

**Chosen: first light** — the Pioneer plaque's face, engraved gold, filling the frame at launch:
the hydrogen-transition diagram, the pulsar map, the human figures, before departure. Later
enrichment: the instructions (the Voyager cover's playback diagram, binary tick marks ringing a
stylus-and-groove drawing); sail deployment (a Starshot-scaled lightsail unfurling against
interstellar black); the first daughter (a second probe departing on an `ESC` burn, the ancestral
plaque motif repeated in miniature on its hull).

## Sound

A steady low reaction-wheel hum, rising under load, replacing the quill-scratch while flying; a
pure held DSN carrier-lock tone that sounds only while telemetry is getting through, its dropout
the loss cue; a short two-tone frame-sync chirp on every `OI`; a tone climbing and cutting off for
`ESC`; a sparse clock tick marking elapsed mission time under the flux's rising pursuit.

## The prototype

`docs/eras/prototypes/probe.html` draws bodies as low-detail lit spheres wrapped in their data
rather than the research's untested icon-plus-readout pair, spikes the plaque hand as hand-built
single-stroke polyline glyphs rather than loaded Hershey data (licence and pipeline mismatch both
still open), and chooses instrument white over telemetry green, the brief's own "no CRT-green
cliché" call. It loads B612 Mono (OFL) locally and draws THE ARGO as its constellation, a ship apt
for a probe under sail. Painter verdict: _to be recorded in PROTOTYPES.md_.

## Risk

The Hershey/`glyphs.mjs` mismatch is a pipeline risk, not a footnote, and needs an end-to-end spike
before the plaque hand is trusted. Overlap with era VIII is the biggest visual risk — both
instrument-grammar, both eras' repulsor/crosswind rows reaching for flare/wind-vector idioms — and
the register choices above are untested side by side. The harvest widening above has been checked
only in reasoning, not in code, and should be spiked against `verify.mjs`'s daily-chart test before
being trusted. Build this one last.
