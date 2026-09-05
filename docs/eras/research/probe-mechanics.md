# The Probe: harvest and replication

Era 8 of the ladder set out in `RESEARCH-BRIEF.md` breaks the one rule every earlier era keeps:
every era from The Rock to The Observatory renames the currency and leaves the arithmetic alone —
ink under another word. The probe is the one era where the *rule* changes, because the fiction
demands it: a von Neumann probe does not spend a nib of ink flying between stars, it mines them.
This document is the research and the design for that change, aimed to cost the engine as little
as the ladder's other seven eras cost it. Read `GAME-BRIEF.md` before this — every number below is
a rename or a light reuse of a number already shipped in `src/simulation.js`, and the brief is
where those numbers live.

## 1. The literature

Eight sources, each pulled for one piece of the mechanic rather than for atmosphere:

- **Freitas, "A Self-Reproducing Interstellar Probe"** (*JBIS* 33, 251–264, 1980). REPRO is the
  namesake of the whole idea: a probe roughly 1,000× the mass of Daedalus (about 10 billion kg)
  that arrives at a target star, drops a **SEED**, and SEED spends roughly 500 years growing into
  a **FACTORY** capable of mining the system and building a second REPRO in a further ~500 years.
  The reproductive apparatus is not one machine but thirteen specialised robot species — miners,
  metallurgists, fabricators, assemblers — mirroring an assembly line rather than a single von
  Neumann "replicator." That division of labour is the source for this document's material set:
  a probe is not built from one stuff, it is built from what mining, refining and fabricating
  separately produce.
- **NASA/ASEE, "Advanced Automation for Space Missions"** (1980 Santa Clara summer study, NASA CP
  2255, 1982). The self-replicating lunar factory chapter is the nearest thing to a costed,
  peer-reviewed bill of materials in this literature: a 100-ton seed factory landed from Earth,
  thereafter closing on lunar regolith for its own aluminium, silicon, iron and titanium, with a
  target doubling time of about one year for a large monolithic version. The paper's own honesty
  matters more than its numbers: it does not claim full **closure** (the factory being able to
  build every one of its own parts) is reached on the first pass, only that most of the mass
  closes and a residual import fraction remains — closure is a *process*, gated by how many of the
  factory's own subsystems it can already fabricate, not a single flag that flips.
- **Bracewell (1960) and von Neumann's universal constructor.** Von Neumann's own version of the
  idea, worked out in cellular automata rather than hardware, specifies a self-replicator as four
  parts: a factory that gathers and processes material, a copier for the instruction tape, a
  controller that reads the tape, and the tape itself. Bracewell's variant swaps exploration for
  contact — a probe that waits at a star and talks, rather than one that builds. Between them they
  give the era its two poles: REPRO explores by making more of itself: Bracewell's probe explores
  by *listening*. This document follows REPRO; Bracewell's variant is a plausible late-run event
  (a probe that goes quiet and starts transmitting) rather than the core loop.
- **Tipler (1980), "Extraterrestrial Intelligent Beings Do Not Exist," and Sagan & Newman's 1983
  reply, "The Solipsist Approach to Extraterrestrial Intelligence."** Tipler's argument is the
  danger, not the mechanic: exponential replication is fast enough that a single probe fills a
  galaxy in on the order of 10⁸–10⁹ years, so if replicators were common the galaxy would already
  be saturated with them; since it visibly is not, he argued they don't exist. Sagan & Newman's
  rebuttal does not dispute the arithmetic of growth, it disputes the premise that growth continues
  unchecked — finite resources, finite motive, and probes that choose not to replicate indefinitely
  all cap the curve. For the game this is the one clean, attested **danger**: an era whose currency
  is *unbounded* growth needs its own reason the growth cannot simply run away, and the
  Tipler/Sagan-Newman argument is exactly that reason, ready-made. See §7.
- **Project Daedalus** (BIS, 1973–1978) and its 2009 revival **Project Icarus**. Daedalus's second
  stage is fuelled by helium-3 mined from Jupiter's atmosphere by a fleet of aerostat (balloon)
  mining platforms over roughly a twenty-year campaign before the burn — the one design in this
  literature where the *mining itself is the mission's own gravity well*: the miner orbits the gas
  giant it is harvesting from. That is this document's closest real-world analogue to "an orbit
  that harvests." Icarus keeps the He-3/deuterium fusion-pulse architecture but has, at various
  points in its own open literature, weighed onboard fuel over further Jovian mining; both remain
  fusion-fuel designs, not chemical or antimatter ones, so He-3/H₂ stands as the attested fuel
  pair for this document's reactor material.
- **Breakthrough Starshot** (2016–). A gram-scale chip probe on a laser-driven lightsail, built to
  reach Alpha Centauri in decades rather than centuries. It carries no mining or replication
  apparatus at all — it is the opposite design philosophy, mass minimised rather than mass grown —
  and is cited here only for the sail: its lightsail is the attested real-world analogue for a
  reflector/sail subsystem, material-wise a metallised polymer film, vanishingly thin and almost
  pure reflective coating by mass.
- **The asteroid-mining and ISRU literature** (surveyed broadly; no single paper, the consensus is
  consistent across NASA, ESA and commercial mining-company technical reports). Asteroids sort
  into three compositional classes that recur throughout this literature: **C-type** (carbonaceous,
  water- and organic-rich, the most common by number), **S-type** (silicaceous, a nickel-iron/
  silicate mix), and **M-type** (metallic, nickel-iron and platinum-group metals, believed to be
  exposed cores of larger differentiated bodies). Ice moons (Europa, Enceladus) and Saturn's rings
  are separately and consistently reported as overwhelmingly water ice. In-situ resource
  utilisation (ISRU) studies on lunar and Martian regolith consistently name aluminium, silicon,
  iron/titanium oxides and oxygen as the extractable, structurally useful fraction.
- **The Oberth effect, gravitational slingshots, and aerobraking.** Textbook orbital mechanics
  rather than a single citable paper. The Oberth effect: a rocket burn delivers more kinetic energy
  the faster the vehicle is already moving, so the same propellant burned at periapsis (deepest in
  a gravity well) buys more speed than the same burn anywhere else on the orbit. A gravitational
  slingshot trades a planet's own orbital momentum for a course change at no propellant cost at
  all. Aerobraking trades heat and time for propellant, shedding velocity against a planet's
  atmosphere instead of firing an engine. All three are, in the plainest sense, orbits that *pay*
  rather than *cost* — which is the whole thesis of §3 below.

## 2. The material set

The design brief for this document allows 3–5 materials, "so the player can hold it in their head."
Four is enough to cover structure, propellant, electronics and reactor without inventing a fifth
just to give volcanic bodies something to say. The mapping below sends more than one family to the
same material — exactly as the shipped game already sends more than one family through the same
node geometry, per `OVERVIEW.md`'s rule 3 that a family changes depiction, never behaviour. The
row-cycle in `planetFamily(row, runSeed)` (`GAME-BRIEF.md` §3) already guarantees all seven
families are met roughly evenly across a run, so an ordinary run naturally gathers all four
materials without the player ever choosing to seek one out.

| Material | Families it comes from | Attested by | Subsystem it builds |
|---|---|---|---|
| **Volatiles** (water ice → LH₂/LOX) | ocean, ice, ringed | C-type asteroids and ice moons run overwhelmingly to water; Saturn's rings are reported as ~90%+ water ice | Propellant, and radiation shielding (a water jacket is a standard, attested spacecraft shield) |
| **Silicates** (Al, Si, Ti from regolith) | crater, dune | S-type asteroid and lunar/Martian ISRU literature, consistently: aluminium and titanium for structure, silicon for cells | Structure |
| **Metals** (Ni–Fe, platinum-group, sulfide ores) | volcanic | M-type asteroids (exposed differentiated cores); volcanism on a body like Io concentrates sulfide-metal ore to the surface by the same differentiation process | Electronics, and the reflector/sail coating (a thin metal film, as Starshot's own sail is) |
| **Fusion fuel** (He-3, H₂/D) | storm | Daedalus's Jovian aerostat mining, the one design in this literature where the miner's own orbit is the harvest | Reactor, and propellant (Daedalus burns what it mines) |

Two families (ocean/ice vs. ringed) share volatiles, two (crater/dune) share silicates, one
(volcanic) alone yields metals, one (storm) alone yields fuel — a 3/2/1/1 split rather than an
even 7-way division, because the source literature itself is lopsided this way: water ice is the
single most commonly attested space resource, exotic metals and fusion fuel are each tied to one
kind of body.

**The four pickups become finished parts, not raw stock** — rare, and each already reads as its
subsystem before it is renamed:

| Pickup (shipped) | Probe reading | Why it already fits |
|---|---|---|
| Slingshot star (`sling`) | A salvaged drive core | It already *is* a gravity-assist mechanic (orbit it, gain speed) — nothing about its behaviour changes, only its label |
| Scutum (shield) | A pre-fab radiation-shield plate | It already absorbs one lethal hit; a finished shield component absorbing damage needs no new fiction |
| Repulsa (reflector) | A sail segment | It already turns the traveller back from the edge — a sail rejecting a flight it cannot afford is exactly what a solar sail does to light |
| Inkwell | A concentrated isotope cache | It already pays out only on a reckless streak — a rare, high-yield find rather than an ordinary vein |

## 3. The harvest rule

**Every capture harvests one unit of the material its body's family maps to, at exactly the ink
gain that capture already pays** — `INK_CAPTURE_GAIN` (0.05) for an ordinary landing,
`INK_PERFECT_GAIN` (0.12) for a perfect one, each ×(1 + skipped×0.5) for orbits flown past, and
zero for a steep landing, unchanged (`GAME-BRIEF.md` §2). This is not a new formula, it is the
existing one read twice: once into the flight-fuel gauge exactly as shipped, once more into a
per-material tally that never touches flight. Two things follow from re-using the exact ink
formula rather than inventing a harvest-specific one:

- **The Oberth effect is already in the game and did not need naming.** A perfect capture — the
  tightest, most tangent-precise landing the geometry allows — already earns 2.4× the ordinary ink
  dividend. That *is* Oberth's claim: the deepest, most efficient pass through a well pays out more
  than a shallow one for the same manoeuvre. The probe era does not add an Oberth bonus, it notices
  the one the perfect-capture bonus already is, and lets the harvest ride along on it.
- **The slingshot star is already a gravity assist, and a graze is already free.** Orbiting a
  slingshot star to charge speed, at no ink cost, is a slingshot by definition; grazing a lethal
  hazard's outer field without dying already pays a flat +5 score bonus at no cost at all
  (`GAME-BRIEF.md` §2, §4) — the free-delta-v case the aerobraking and slingshot literature
  describes. Nothing needs to change here either. What changes is only the caption: a graze reads
  as skimming a gas giant's cloud tops for a free correction rather than skirting a whirlpool.

**Why capture-gated and not time-gated.** The design brief asks whether harvest should be per
orbit, per capture, per time held, or per perfect. Tying it to *time on an orbit* would decouple it
from score exactly the way `OPEN-QUESTIONS.md` #1 warns row-gating decouples from score: a run that
dawdles on easy orbits would out-harvest a fast, skilled run at the same score, breaking the
comparability the score-gated era ladder depends on. Tying harvest to captures — the same events
that already generate score — keeps a run's material total a function of the same thing its score
already is a function of, so two runs at the same score have (in expectation) harvested comparably,
whichever century they are standing in when they do it.

## 4. Replication as score

**The bill.** A daughter probe costs a small fixed count of each of the four materials — proposed
at 4 of each for the first daughter, chosen to land roughly once every few main-node rows at
ordinary play, the same cadence a constellation completes on today. No new node type, no new fork,
no player decision: the tally accrues automatically from ordinary captures exactly as described in
§3, and is met or not met by how the run has actually gone rather than by seeking out any
particular family.

**Closure.** The NASA lunar-factory literature treats closure as a threshold crossed once — the
point at which the factory can, for the first time, build every part of itself rather than
importing some fraction from Earth. In-game, **closure is the first bill met**, recorded once per
run exactly as `OBSERVATIONS` records a named feat (§6, `simulation.js:159`): a medal, not a repeatable
event. Every bill after the first is *replication proper*.

**What launching a daughter looks like.** A second comet sprite peels from the traveller's own line
and departs toward the top of the frame — a visual echo of a constellation's completion flash
(`chart.flash=2.4`, `GAME-BRIEF.md` §3), reusing the same beat rather than inventing a new one. The
run keeps a **GENERATION** counter, printed the way `FLOW ×N` already is, incremented once per
bill met. Score is what actually rises: a flat bonus on the completed bill (proposed in line with
the existing constellation bonus, `chart.bonus=60`), scaled up modestly by generation so a later
daughter is worth more than the first — the game's one concession to real replicative growth being
exponential, expressed as a multiplier on a single running score rather than as an actual second
probe to fly. **The run does not fork.** One traveller, one input, one score, always — a second
flyable probe is explicitly out of scope; see §7.

**Does the run continue, and does it get harder?** Yes to both, and by the mechanism the game
already has: completing a bill grants a `darknessGrace` pause (the same 4-second full stop a
constellation grants today), then resumes with the very next bill larger than the last — a rising
cost for a rising payout, which is both the cheapest way to build it and an honest reading of the
literature's own point that reproduction accelerates *after* the first, harder-won closure, not
before it.

## 5. Darkness, renamed

Nothing about `darknessSpeed()`'s formula, its multiplier knobs, or its timing needs to change for
the probe era (`GAME-BRIEF.md` §2, `simulation.js:539`) — only its name and its depiction, exactly
as every other era's hazard rows are asked to be renamed and redrawn rather than rebuilt
(`DANGERS.md`). What the rising dark *is*, fictionally, for a probe that does not age the way a
body does: accumulated radiation dose and the slow thermal/structural fatigue of running a reactor
and a hull for centuries between stars — a flux front rather than a flood, catching the traveller
not because ink was spent carelessly but because time in transit is itself the cost, exactly as
elapsed time already drives the shipped formula's own rise. The margin gloss this era prints in
place of `HIC SUNT DRACONES` is a naming-and-lettering question for the era's own document, not
this one; this document's claim is only that the *numbers* travel unchanged.

## 6. The economy table, and the seam it lands on

`HAZARD_KINDS` (`simulation.js:180`) is the model this table follows: every hazard is one row —
which way its field turns a flight, how much of its drawn radius kills, how far it reaches, and the
loss it reports — rather than a condition threaded through the flight code. `ECONOMY` proposed
below is the same shape for the resource layer: one row per era, naming what the shipped ink
constants are called and what they do, with everything but era 8's row an unrenamed copy of the
numbers already shipped.

| Era | Currency | Capture pays | Perfect pays | Graze pays | Darkness | `harvest` |
|---|---|---|---|---|---|---|
| 0 The Rock | *(TBD by that era's doc)* | = `INK_CAPTURE_GAIN` | = `INK_PERFECT_GAIN` | = flat +5 | = `darknessSpeed()`, renamed | — |
| 1 The Disc | *(TBD)* | same | same | same | same | — |
| 2 The Ceiling | *(TBD)* | same | same | same | same | — |
| 3 The Marble | *(TBD)* | same | same | same | same | — |
| 4 The Globe | *(TBD)* | same | same | same | same | — |
| 5 The Engraving | **ink** *(shipped)* | 0.05 | 0.12 | +5 score | the rising dark | — |
| 6 The Plate | *(TBD)* | same | same | same | same | — |
| 7 The Observatory | *(TBD)* | same | same | same | same | — |
| 8 **The Probe** | **mass** | 0.05 | 0.12 | +5 score | the flux (§5) | one material unit per capture, by family (§2, §3) |

Only two things are new in the whole table: era 8's name for the resource, and era 8's `harvest`
field. Every other cell in row 8 is the unrenamed shipped number, and every cell in rows 0–7 is
"same" by construction — a row with nothing filled in is a row this document was not asked to
research, not a row with different rules. That is deliberate: this document owns era 8's
*mechanic*, not the other eight eras' *names*, which belong to their own research documents in
this directory.

**What `verify.mjs` needs.** The suite runs only the `// BEGIN SIMULATION` / `// END SIMULATION`
slice in a sandbox and pulls named globals off it — currently `OrbitWorld, segmentCircle,
tangentPaths, orbitTangents, transferContact, nodeMotion, pointSegment, gravityRadius, hazardCore,
hazardKind, bendVelocity, flightStep, CONSTELLATIONS, OBSERVATIONS, BASE_SPEED, MAX_SPEED,
STAR_GAIN, GRAZE_MINIMUM, INK_PERFECT_GAIN, INK_CAPTURE_GAIN` (`scripts/verify.mjs:8-9`). A
material-per-family lookup (call it `HARVEST_MATERIALS`, keyed by `planetFamily` the way
`HAZARD_KINDS` is keyed by `h.kind`) and a running tally on `OrbitWorld` (call it
`this.materials`, alongside `this.captures`/`this.perfects`) would both need adding to that
destructuring list the same way `CONSTELLATIONS` was — a one-line addition, not a new sandbox.

**Why this cannot break "one seed deals one chart."** The daily plate's whole premise, and the test
at `verify.mjs:964` ("Everyone plays the same daily chart"), rests on node and hazard generation —
`generateRow()`'s geometry, spawn rows, and RNG draw order — being identical for a given seed
regardless of anything cosmetic layered on top. A material tally keyed off `n.type`/family and
folded in inside `capture()` reads a value that is already fully determined by the seed; it does
not call `this.random()` again, does not change which node spawns where, and does not gate a route
the way a hazard can. It is safer than `DANGERS.md`'s own "depiction only" option A for hazards,
because it never has to be checked against route-closing rules at all — it is pure bookkeeping on
top of a chart that was already going to be drawn exactly the same way. The same reasoning is what
keeps the score-gated era shape in `OPEN-QUESTIONS.md` #1 coherent for this mechanic specifically:
because replication's score bonus is paid through the *same* `this.score` every other era's score
threshold reads, and because harvest is capture-gated rather than time-gated (§3), two runs that
reach the era-8 threshold have done so through directly comparable play, whatever their material
totals happened to look like along the way.

## 7. Risks, and the simplest version

- **Inventory management is the one thing a one-button game cannot afford**, and the four-material
  table above is designed around never asking the player to manage one. Material choice is not a
  decision — it is read off the family of whichever body a run happens to be crossing, the way
  planet family already is purely cosmetic today. The HUD owes the player exactly one new gauge: a
  single aggregate "bill progress" ring (reusing `charge()`'s 0..1 pattern from the slingshot star,
  `simulation.js:525`), not four counters competing for space with ink, score, combo and darkness.
- **The richer alternative — routing materials through a constellation-style fork, so gathering a
  bill feels like a deliberate detour — was considered and set aside.** It would mean a second kind
  of route-fork competing with the twelve constellations already in the chart, doubling the number
  of things a player has to recognise at a glance, and re-opens exactly the geometry-safety argument
  §6 closes for free. The version above earns "harvest" from ordinary play with no new geometry at
  all; it is the version worth building first, and the fork variant is worth naming as a later,
  optional escalation rather than a should before this document is signed off.
- **Replication must not become a second progression gate stacked on the score-gated era ladder.**
  `OPEN-QUESTIONS.md` #1 already spends the run's one progression axis on score thresholds between
  eras; a bill of materials that also had to be met to *advance* would be a second axis fighting the
  first. Keeping replication as a repeatable, score-paying event *within* era 8 — never a condition
  for leaving it — avoids that entirely.
- **The real timelines are absurdly mismatched to a 90-second run** — REPRO's SEED-to-FACTORY step
  alone is 500 years, the lunar factory's own doubling time is a year even in its most optimistic
  telling. The game already compresses "an orbital transfer" to 1.28 seconds and "a century" to a
  handful of rows; compressing "half a millennium of factory-building" to a few captures is the same
  move at a larger ratio, not a new kind of dishonesty, and does not need excusing beyond saying so.
- **The Tipler/Sagan-Newman tension (§1) is a real danger this document has not spent** — an
  unbounded-growth currency wants a reason growth cannot simply run away, the way `HAZARD_KINDS`
  gives ink a reason it can run out. The generation-scaled rising bill in §4 is a first answer
  (each daughter costs more, so growth is bounded by the same rising darkness every era already
  has) but a sharper version — closer to Sagan & Newman's actual rebuttal, where finite resources
  or a probe's own choice to stop cap the curve rather than an external clock — is left open for
  whoever writes `08-probe.md` in full.

## 8. Sources

- Freitas, R. A. (1980). *A Self-Reproducing Interstellar Probe*. JBIS 33, 251–264. https://www.rfreitas.com/Astro/ReproJBISJuly1980.htm
- Freitas, R. A. / NASA (1980/1982). *Advanced Automation for Space Missions* (NASA CP 2255), self-replicating lunar factory chapter. https://nss.org/wp-content/uploads/1982-Self-Replicating-Lunar-Factory.pdf ; https://en.wikisource.org/wiki/Advanced_Automation_for_Space_Missions
- Bracewell probe / von Neumann probe overview and universal-constructor structure. https://en.wikipedia.org/wiki/Bracewell_probe ; https://en.wikipedia.org/wiki/Self-replicating_spacecraft
- Tipler, F. J. (1980). *Extraterrestrial Intelligent Beings Do Not Exist*. QJRAS 21; and Sagan, C. & Newman, W. (1983), *The Solipsist Approach to Extraterrestrial Intelligence*, QJRAS 24, 113. https://ui.adsabs.harvard.edu/abs/1983QJRAS..24..113S ; https://adsabs.harvard.edu/full/1983QJRAS..24..113S
- Project Daedalus (BIS, 1978) and Project Icarus — Jovian He-3 aerostat mining and the fusion-pulse second stage. (Established BIS/Icarus Interstellar literature; not independently re-fetched this session — see note below.)
- Breakthrough Starshot — gram-scale lightsail probe design. (Established public-record project; not independently re-fetched this session.)
- Asteroid-mining/ISRU consensus on C-/S-/M-type composition, ice-moon and ring-ice composition, and lunar/Martian regolith ISRU extraction targets (Al, Si, Fe/Ti, O). (Established, cross-source consensus; not independently re-fetched this session.)
- Oberth effect, gravitational slingshot (gravity assist), and aerobraking — standard orbital-mechanics results, not tied to one paper.

**A note on verification.** The four items above marked "not independently re-fetched this
session" are long-established, frequently-corroborated public results, stated here from broad
training knowledge: the session's web-search budget was exhausted and direct fetches of
`rfreitas.com`, Wikipedia and `nss.org` were blocked by this environment's network policy, after
the four searches above (Freitas/REPRO, the NASA lunar factory, Bracewell/von Neumann, and
Tipler/Sagan-Newman) had already returned and been used. Re-verify the four unfetched items against
a primary source before the era ships, per the "mark anything you could not verify" standard
`RESEARCH-BRIEF.md` sets for the rest of this directory.
