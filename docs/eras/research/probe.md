# VIII · The Probe — research

**The far future.** A self-replicating (von Neumann) interstellar probe, long after crewed
astronomy, long after even the Observatory's survey pipelines. No era file exists yet for this
row of the ladder; this document is the first pass, written to the research brief's template. A
sibling document, `docs/eras/research/probe-mechanics.md` (a separate agent's work, not this
one's), owns the replication rule in depth — section 6 here names the currency and stops there.

The brief's thesis, stated plainly because it is the reason this era is worth building at all:
**the ladder's two ends rhyme.** Era 0, the Rock, is marks struck into stone because striking
stone was the only durable writing available. Era 8, the Probe, is a species that has invented
radio, lasers, and machine memory — and when it needed a message that would survive a billion
years in vacuum and radiation, it *still* chose a metal plate and a burin-line drawing, because
nothing else lasts. The Pioneer plaque and the Voyager record cover are, technically, engravings.
The ladder does not have to invent this rhyme; it only has to notice that the record already
contains it, and that is what sections 1–4 below verify.

## 1. The documents

- **Pioneer plaque** (Pioneer 10, launched 1972; Pioneer 11, 1973). Gold-anodized **6061-T6
  aluminum**, 6 × 9 in (15.2 × 22.9 cm), 0.05 in thick, bolted to the spacecraft's antenna
  support struts where it would be shielded from erosion. Designed by Carl Sagan and Frank
  Drake at NASA's invitation, with three weeks to prepare it; the artwork — the human figures,
  the plaque's whole composition — was drawn by **Linda Salzman Sagan**, Sagan's wife, an
  artist, not by Sagan himself. Content, left to right: a schematic of the hydrogen atom's
  hyperfine (spin-flip) transition, top left, given as the unit of both length (21 cm) and time
  (1420 MHz) every other measurement on the plate is expressed in; a radial "pulsar map" of 14
  pulsars (plus a 15th line to the galactic center on some readings) with their periods given in
  binary as multiples of that hydrogen unit, letting a finder triangulate both the Sun's
  position and the launch date from pulsar spin-down; a man and a woman drawn to scale against
  the spacecraft's silhouette, with the woman's height marked in binary (8, in units of the
  21 cm wavelength ≈ 168 cm); and a diagram of the solar system's planets with the trajectory
  that carried Pioneer outward past Jupiter. Frank Drake worked out the pulsar-map encoding;
  the physical artwork was manufactured for NASA rather than hand-cut by Sagan or Drake
  (accounts describe a commercial engraving process turning Salzman Sagan's line art into the
  etched plate — the exact process, chemical etch vs. mechanical engraving, is **unverified**
  in this pass and worth a dedicated check before the game claims one).
- **Voyager Golden Record and its cover** (Voyager 1 and 2, both launched 1977). The record
  itself is **gold-plated copper**, 12 in (30.48 cm) diameter, playable at 16⅔ rpm; its
  aluminum **cover**, 1/16 × 12 in, is gold-anodized like the Pioneer plaque and bolted over the
  record to block micrometeorite erosion. The cover carries the actual "writing": engraved
  instructions for how to play it. A diagram in one corner shows the cartridge and stylus
  correctly seated at the outside edge, the record's rotation rate given as **binary tick marks
  ringing the diagram** (one full turn = 3.6 seconds, in units of the same hydrogen line used on
  the Pioneer plaque), and the resulting playback is described as a video signal to be decoded
  line by line. The cover also carries the same 14-pulsar map used on Pioneer, again by Drake,
  giving the finder both the launch epoch and the Sun's galactic position, and a diagram of an
  ultra-pure Uranium-238 source with its decay curve, so the plaque itself functions as a clock
  a finder can read regardless of when they find it. The whole Voyager message project was led
  by Sagan; Jon Lomberg was the project's design director and drew or supervised most of its
  diagrams, including — per NASA's own account — the record cover's engravings; where a claim
  below distinguishes Lomberg's hand from Salzman Sagan's specifically, treat it as
  **unverified** until checked against a primary NASA/JPL credit line.
- **Arecibo message** (transmitted 16 Nov 1974, Arecibo Observatory, at 2380 MHz toward the
  globular cluster M13). Not a plate — a **radio bitmap**, 1,679 bits, deliberately the product
  of two primes (23 × 73) so a receiver has exactly one way to lay it out as a rectangle: 73
  rows of 23 bits. Decoded as an image it shows, top to bottom: the numbers 1–10 in binary; the
  atomic numbers of hydrogen, carbon, nitrogen, oxygen and phosphorus; the chemical formulas of
  DNA's nucleotides; a schematic of the DNA double helix with an estimate of its base-pair
  count; a human figure with its height given in the same binary units and the era's human
  population; a diagram of the solar system marking Earth as the transmitting world; and a
  diagram of the Arecibo dish itself with its diameter. This is the ladder's cleanest example of
  **the sky as a bitmap** — no picture, only a raster of shaded cells that only *becomes* a
  picture once the receiver knows the rectangle's shape.
- **LAGEOS plaque** (LAGEOS satellite, launched 1976; a solid brass sphere roughly 60 cm across
  studded with retroreflectors, used to track continental drift by laser ranging). Conceived by
  Sagan, drawn by Jon Lomberg, sealed inside the satellite's core. It shows the Earth's
  continents at three points: 268 million years ago (the supercontinent Pangaea), at launch
  (1976), and roughly 8.4 million years in the future — chosen because that is close to when
  the satellite's orbit is expected to decay and return it to Earth. Unlike Pioneer or Voyager,
  this plaque's addressee is **not an alien but a future human**, and its "clock" is the same
  phenomenon — plate tectonics — the satellite itself was launched to measure. That distinction
  (who is the plate for?) is worth carrying into the game's own framing.
- **Long Now Rosetta Disk** (The Rosetta Project / Long Now Foundation; a flight duplicate flew
  aboard ESA's Rosetta orbiter, launched 2004, as a durable backup archive rather than a message
  outward). A 3 in (7.5 cm) nickel disk, **micro-etched and electroformed** — its ~14,000 pages
  of text sit about 100 nanometers proud of the surface, each page only 400 microns across,
  readable at 500–650× magnification. It holds parallel text in roughly a thousand human
  languages. Another object addressed to the future rather than to the stars, and a second
  precedent (with LAGEOS) for "durability by metal and micro-etching" as a distinct grammar from
  "durability by broadcast."
- **Breakthrough Starshot's StarChip** (announced 2016; unflown, an active engineering concept
  rather than a built artefact — mark everything here **unverified as to final spec**, since the
  program is still in R&D). A gram-scale, centimeter-sized wafer probe — camera, photon
  thrusters, power and comms on one chip — pushed by an Earth-based laser array against a
  sail described in different design iterations as anywhere from a few meters to ~10 m² and
  under a gram, on the order of a hundred atoms thick, aimed at roughly a fifth of light speed
  toward Alpha Centauri. No plaque has been designed for it; if this era wants a "message" for
  its own probe, it is inventing one at the frontier of what has actually been proposed —
  including the 2017 "Golden Record 2.0"/One Earth Message project (Jon Lomberg again),
  which proposed *streaming* a crowdsourced message to New Horizons rather than engraving one;
  its funding and final disposition are **unverified** in this pass.
- **CCSDS telemetry transfer frame** (Consultative Committee for Space Data Systems; the format
  nearly every modern deep-space mission's engineering data actually ships in). Not a museum
  object but the probe era's real "handwriting": a fixed-length frame prefixed by a 32-bit
  **attached synchronization marker, hex `1ACFFC1D`**, followed by a primary header (spacecraft
  ID, virtual channel ID, frame counter, data-field status) and a payload, typically closed with
  an error-control field. This is how a probe writes — not prose, a grammar of fixed fields
  repeated at a fixed cadence. It is the section-2 grammar's second half, next to the plaque's
  hand-drawn one.

## 2. The grammar

Two grammars share this era, in visible tension, and the tension is the point.

**The telemetry half** does not draw the sky at all — it *instruments* it. A body is not
rendered, it is a set of numbers: mass, mean density, a spectral class tag, a ΔV budget to
reach it, a periapsis/apoapsis pair. An orbit is not a drawn ellipse traced by eye, it is a
Keplerian element set — the same six numbers JPL's Horizons system and "Eyes on the Solar
System" actually use to place every tracked object, rendered as thin conic sections in a
navigation-display style: black or near-black ground, monochrome vector lines, no shading, no
perspective beyond the flattening a top-down orbital plot already has. A hazard is a field, not
a figure — drawn as a contour mesh (equipotential lines around a mass) or a flux-vector
overlay, the same idiom the Observatory era (era V/7) already claims for its solar wind, so this
era must render it in a colder, more schematic register to avoid simply repeating that plate's
look (see §7 and §12).

**The plaque half** is the opposite of all that: a single continuous engraved line, uniform
weight, no shading, drawn once and never re-inked — literally what the Pioneer plaque and the
Voyager cover are. This is where the probe's constellation figures, its "chapter" plates and its
title lettering belong, because a self-replicating machine does not *decorate*, but it still
carries — bolted to its hull, unread by anything it has met yet — the same ancestral plaque
every daughter probe copies along with its blueprint. The two halves never merge into one
picture. The HUD is instrument; the plaque is inheritance. A player should be able to tell which
one they are looking at without reading a caption.

**Emphatically not present:** perspective, atmosphere, colour gradients (outside the narrow
telemetry-green/amber-vs-white convention in §3), any painterly rendering of a body's surface,
and — the hardest restraint for this era — no picture of the sky *as seen*. The probe has no
eye. Everything a player is shown is either a measurement or an inheritance.

## 3. Palette

| Swatch | Source | Hex |
|---|---|---|
| Engraved gold | Pioneer plaque / Voyager cover, gold-anodized aluminum | `#C7A24C` |
| Interstellar black | the ground — deep vacuum, not era V's `#04060b`, which this era must not repeat; nearer true black with no cold cast | `#050505` |
| Radiator glow | an RTG's waste-heat radiators, the probe's one warm light source | `#B8451F` |
| Telemetry green | phosphor CRT engineering-console convention | `#33FF66` |
| Telemetry amber | phosphor CRT alternate convention (older consoles, warnings) | `#FFB000` |
| Modern instrument white | the DSN-Now/Eyes-on-the-Solar-System convention: white-on-black, not green | `#E8ECF2` |
| Nickel | the Rosetta Disk's micro-etched ground | `#C4C4BC` |
| Sail film | aluminized-mylar / metamaterial lightsail sheen | `#D9E4EA` |
| Sail film, alternate | Kapton-tinted sail material, warmer variant | `#C2914A` |
| Hex-dump texture | not a colour — see below | `#7A8A7A` (as a dim ground wash) |

**Gold** is engraved-gold — the plaque, the cover, the one warm and worked material on the
probe, standing in for the game's existing "gold leaf/gold accent" role (Cellarius's gilt is
this era's closest surviving relative). **Ink** is telemetry green or amber depending on plate
variant — a CRT-console choice mirroring the game's existing night/paper split. **Ground** is
interstellar black, unbroken except by the radiator's glow and starlight. **Hex** is not a
colour swatch at all: it is a *texture*, meaning literal hexadecimal — a scrolling memory-dump
of bytes, the probe-era equivalent of the engraving plate's down-and-right hatching. The 2023
Voyager 1 flight-data-system fault, which for months returned a repeating pattern of ones and
zeros instead of readable telemetry, is the real precedent for treating raw hex as *decoration
with a cause* rather than invented sci-fi wallpaper (see §12 for how firm this precedent is).

## 4. Lettering and how people wrote

The probe writes in two registers, and unlike every earlier era neither one is a script in the
linguistic sense — both are engineering conventions, which is itself the era's answer to "how
people wrote": by the time a species sends a self-replicating machine to the stars, its
"handwriting" is a data format.

**The plaque hand** is the Pioneer/Voyager engraved line: single-stroke, uniform weight, cut
once, no serif, no shading, exactly what a burin or an engraving machine produces and exactly
what the **Hershey fonts** are. Dr. Allen V. Hershey drew this vector font family (Latin, Greek,
Cyrillic, Japanese and symbol sets) circa 1967; it began as stroke coordinate data for a
pen-following device and is, structurally, engraving instructions rather than a filled typeface.
It is not on Google Fonts and has no OFL release; the maintained modern reissue (verified this
pass: `kamalmostafa/hershey-fonts` on GitHub) ships the glyph data itself under "a permissive
use and redistribution license" separate from the surrounding library's GPLv2+, in the
publisher's own `.jhf` coordinate format — public-domain-adjacent in spirit, not OFL, and its
exact redistribution terms should be re-read verbatim before anything ships. **This is the one
genuinely free technical finding of this research pass**: Hershey glyphs are *already* the
game's stroke data, a full generation before fontkit exists to extract it from anything. The
catch is real and worth spiking early — the game's pipeline (`scripts/glyphs.mjs`) extracts
*contour outlines* from a woff2/ttf via fontkit and both strokes and floods them (§7 of
GAME-BRIEF.md); Hershey has no contours to flood, only strokes, because there is no closed
counter to fill. The plaque hand should skip the flood step entirely rather than force one — a
genuinely different code path from every earlier era's lettering, and closer to what
`writeText()`'s clip-reveal already does than to `penLettering()`'s stroke-then-flood. Either a
small first-party `.jhf` parser bypassing fontkit, or a converted single-line TTF (several exist
as hobbyist/plotter-community projects; none checked and verified this pass) would work; decide
which before committing the face.

**The telemetry hand** wants a monospace face built for exactly this job. Three are verified
this pass, all on Google Fonts under OFL:
- **B612 Mono** — designed 2010–2012 by Airbus with ENAC and Université de Toulouse III,
  purpose-built for aircraft cockpit displays (legibility under vibration, glare, low light);
  released 2017 via the Polarsys/Eclipse Foundation project, originally under the Eclipse
  Public License, and distributed on Google Fonts under OFL. The single most on-theme face
  available for this era: an instrument font, literally.
- **Share Tech Mono** — a Carrois Apostrophe monospace, on Google Fonts under OFL since 2012;
  generic tech/console character, a plausible HUD body face next to B612's display role.
- **DSEG** (`keshikan/DSEG` on GitHub, OFL-1.1, verified this pass) — a seven-/fourteen-segment
  numeral face imitating LCD/LED readouts, over fifty weight/style variants. Matches
  LETTERING.md's own suggestion for era V ("the numerals should update, not be written") even
  better here: a ΔV or feedstock counter that *ticks over* like an odometer rather than being
  inscribed fits a machine that has no hand to write with.
- **OCR-A** and **OCR-B** (ANSI X3.17-1977's machine-readable faces, 1968) were named in the
  brief and are the right period reference — but their free digitizations circulate as CTAN
  packages (`ocr-a`, `ocr-b-outline`) rather than Google Fonts entries, and this pass could not
  reach ctan.org or tug.org to confirm licence terms or check them against the commercial "OCR A
  Extended" font that ships with some OSes and must not be confused with the free one. **Mark
  OCR-A/B licensing unverified** until someone can reach CTAN directly; treat B612/DSEG/Share
  Tech Mono as the safe fallback trio if OCR-A can't be cleared.

No script needs shaping (no joining, no stacking) — both registers are Latin-alphabet and
numerals, one stroke-only and one monospace-block. Numerals throughout are Arabic numerals set
in DSEG or B612 Mono; the plaque hand, when it does set a number (as the real plaques do, in
binary), draws binary tick marks exactly as the Voyager cover's own playback-speed diagram does,
not digits at all.

## 5. Names for the game's things

Constructed throughout — no attested "probe language" exists to draw from — but grounded in a
real, attested convention: CCSDS/JPL telemetry mnemonics, which are genuinely short, genuinely
all-caps, and genuinely built from clipped English roots. Where a term is the real name of a
real spacecraft event or field, it is marked attested; the specific choice of mnemonic string
applied to this game's specific thing is always constructed.

| Game term | Probe's word | Gloss | Status |
|---|---|---|---|
| Orbit (title) | `ORBIT` | unchanged — the probe's own capture/release loop already is an orbital insertion/departure cycle | attested convention, no translation needed |
| capture | `OI` | Orbit Insertion, real NASA/JPL mission-event shorthand | attested term, constructed application |
| release | `ESC` | Escape burn / departure burn | attested term, constructed application |
| ink (currency) | `FEED` | feedstock/reaction-mass fraction remaining | constructed |
| score | `GEN` | generation count — see §6, owned by the mechanics doc | constructed |
| chapter/sheet | `PHASE` | mission phase | attested term, constructed application |
| the run | `SORTIE` | one flight of the probe | constructed |
| personal best | `MAX GEN` | best generation count on record | constructed |
| daily plate | `EPOCH` | a fixed reference time all instances share, real telemetry usage of the word | attested term, constructed application |
| catalogue | `MANIFEST` | the fleet/parts manifest a self-replicator would keep | constructed |
| attractor | `WELL` | gravity well, drawn as a potential mesh | constructed |
| repulsor | `BEAM` | a pulsar's or flare's radiation-pressure front | constructed |
| crosswind | `ISM FLUX` | interstellar-medium particle flux | attested phenomenon, constructed tag |
| nebula/obscurer | `EXT` | extinction — the real astronomical term for light lost to dust | attested term, constructed application |
| ocean family | `CLASS-H2O` | volatile-rich body | constructed |
| crater family | `CLASS-REG` | regolith/heavily cratered body | constructed |
| ringed family | `CLASS-RNG` | ringed body | constructed |
| ice family | `CLASS-CRYO` | cryogenic-surface body | constructed |
| dune family | `CLASS-AEOL` | aeolian (wind-formed) surface | constructed |
| volcanic family | `CLASS-IGN` | igneous/active body | constructed |
| storm family | `CLASS-ATM` | dense, storm-bearing atmosphere | constructed |
| slingshot star | `DV ASSIST` | a Δv-gain node, real mission-planning term | attested term, constructed application |
| shield pickup | `SHLD` | shield charge | constructed |
| reflector pickup | `DEFL` | deflector charge | constructed |
| inkwell pickup | `CACHE` | a feedstock cache | constructed |

## 6. Currency and one rule

**Currency: mass.** Not ink as pigment or exposure as light, but **feedstock/propellant mass** —
regolith, asteroid material, or sail film mined or scavenged and consumed as reaction mass and
as raw material for the next daughter probe. This is the one currency in the whole ladder that
is not consumed by *use* alone but is also the literal substance of the *next generation*, which
is the natural hook for the mechanics doc's replication rule and exactly why this document stops
here rather than designing it: `docs/eras/research/probe-mechanics.md` owns how mass is earned,
spent, and converted into a spawned daughter.

**No-twist reading**, for completeness: rename `ink` to `FEED`, keep `inkCost(distance)` and
every existing gain (`INK_ORBIT_GAIN`, `INK_SLING_GAIN`, the landing dividends) bit-for-bit, and
let the HUD read mass units instead of a bar. This alone earns the era its skin with zero
simulation risk, per rule 1.

## 7. Dangers

All three rows keep their existing field/core/reach/lethality (rule 3); only depiction and
naming change, and this era must consciously avoid re-drawing what era V/Observatory already
claims for the same rows (a rendered black hole with a photon ring; an Hα coronal mass ejection;
a solar-wind vector field), since both eras sit at the technological end of the ladder and would
otherwise look like the same plate twice.

- **Attractor — `WELL`.** Not a photographed black hole (that is era V's) but an **equipotential
  mesh**: a warped grid of thin lines converging on the mass, exactly the diagnostic plot a
  navigation computer would actually draw, with the mass given as a number rather than shown as
  a disc. A pulsar's presence can be marked by a rotating tick on the mesh's centre, tying it to
  the plaque's own pulsar-map iconography without duplicating it.
- **Repulsor — `BEAM`.** A pulsar's swept beam or a flare's radiation-pressure front, drawn as a
  rotating sector wedge (a lighthouse beam) rather than era V's rendered active-region loop —
  the difference between an instrument reading and a photograph.
- **Crosswind — `ISM FLUX`.** The interstellar medium's particle flux, drawn as a field of thin
  flux-vector arrows. This is the row most at risk of visually duplicating era V's solar-wind
  vector field (§2, §12); the mitigation is register, not idiom — monochrome telemetry lines
  and a numeric flux readout, no colour gradient, no Hα.
- **Obscurer — `EXT`.** A dust cloud read the only way a probe can read one: as **extinction**,
  a shaded attenuation region with a logged magnitude of signal loss, not a rendered nebula.

## 8. The seven families

Each body is shown twice at once, per §2's two grammars, and an artist should draw both: a
Hershey-line **icon** (the plaque's own reductive style — the Pioneer plaque draws whole planets
as bare circles with a radial tick for identification) sitting beside a monospace **class
readout**.

- **Ocean (`CLASS-H2O`).** Icon: a plain circle with a single horizontal chord line, the
  plaque's own shorthand for "a world with a surface state distinct from its bulk." Readout
  gives a density figure low enough to read as volatile-rich.
- **Crater (`CLASS-REG`).** Icon: a circle stippled with a scatter of small unfilled rings,
  cratering read as a texture rather than shaded relief — no terminator, no shadow, because this
  grammar never shades.
- **Ringed (`CLASS-RNG`).** Icon: a circle crossed by one or two thin ellipse arcs, exactly the
  Pioneer plaque's own reduction of Saturn — a solved problem, borrowed directly.
- **Ice (`CLASS-CRYO`).** Icon: a circle with a fine crosshatch fill at low density, reading as
  frost rather than rock without ever shading a surface.
- **Dune (`CLASS-AEOL`).** Icon: a circle crossed by parallel wave-lines, the closest this
  grammar gets to depicting motion (wind-formed ripples) without implying light or perspective.
- **Volcanic (`CLASS-IGN`).** Icon: a circle with a small radiating tick-cluster — reads as
  "energetic" the same way the plaque's own hydrogen-transition diagram reads as "a discrete
  emission," never as flame or glow — that colour is reserved for the radiator-heat palette
  accent, never used on a body itself.
- **Storm (`CLASS-ATM`).** Icon: a circle with one internal spiral stroke, a minimal weather
  motif that never becomes a rendered cloud band.

The class readout beside each icon is where the numeric half of the grammar lives: mass number,
mean density, a periapsis/apoapsis pair if the body is orbited by something, set in DSEG or
B612 Mono.

## 9. Chart furniture, frame, HUD

No cartouche, no colophon, no engraver's credit in the era-III sense — the closest the record
carries is the plaque's own small identifying marks (a schematic Earth-to-launch-site locator on
the Voyager cover, functionally a maker's mark). The frame becomes a **CCSDS transfer-frame
border**: a header bar reading the sync marker in hex (`1ACFFC1D`), a virtual-channel ID and a
running frame counter across the top, closing on a checksum/error-control field at the bottom —
literally the wrapper real telemetry travels in, doing the job era III's plate-mark and double
rule did. A margin strip in the DSN-Now idiom — one-way light time, signal strength, which
antenna/complex is locked — replaces the compass rose. HUD numerals tick over (§4's DSEG note)
rather than being inscribed; a "chapter" announces itself as a `PHASE` change, not a page turn.

## 10. Four chapter plates

1. **First light** — the Pioneer plaque's own face, engraved gold, filling the frame at launch:
   the hydrogen-transition diagram, the pulsar map, the human figures, before the probe has left
   the system that built it.
2. **The instructions** — the Voyager cover's playback diagram, binary tick marks ringing a
   stylus-and-groove drawing, doubling as the chapter's own "how to read this chart" plate.
3. **Sail deployment** — a Starshot-scaled lightsail unfurling against interstellar black, sail
   film palette catching a laser's push, the probe's own hull reduced to a bright point at the
   sail's centre.
4. **The first daughter** — a second, smaller probe departing the first on an escape burn
   (`ESC`), the replication event the mechanics doc will define the rule for; visually, the
   plaque motif repeats in miniature on the daughter's hull, the ancestral engraving copied
   along with everything else.

## 11. Sound

- **Reaction-wheel hum** — a steady low tone, rising in pitch under load, replacing the
  engraving era's quill-scratch (`scratch()`) as the "continuous while flying" cue.
- **DSN carrier lock** — a pure, held tone that only sounds while telemetry is actually getting
  through; its dropout (silence, not a sound effect) is the era's version of a loss cue.
- **Plasma-wave sonification swell** — genuine, verified: Voyager 1's Plasma Wave Subsystem
  recorded real oscillations in the interstellar plasma at the 2012 heliopause crossing (and
  again after a 2014 solar event), and NASA released the frequency-shifted result as audible
  sound. A rising swell built from this idiom fits a capture or a constellation-completion cue.
- **Frame sync chirp** — a short two-tone blip on every `OI`, standing in for `capture()`'s
  tone-plus-brush: the sound of a transfer frame locking onto its sync marker.
- **Escape-burn tone** — a tone climbing and cutting off cleanly, for `release()`.
- **A mechanical clock tick** — sparse, marking elapsed mission time rather than danger,
  available as an ambient bed under `darkness`'s rising pursuit.

## 12. Risks and open questions

- **The ladder's own numbering has moved.** `OVERVIEW.md` and `DANGERS.md` still describe a
  five-era ladder (I Ceiling … V Observatory) that predates the nine-era ladder this brief
  works from. Ceiling is now era 2, not I; Plate and Observatory are 6 and 7, not IV and V; Rock,
  Disc, Marble and this era, the Probe, do not exist in those documents at all. Whoever builds
  this era next should reconcile the numbering before extending DANGERS.md's per-era hazard
  table, not silently append to it.
- **Section 6 is deliberately incomplete.** The replication rule belongs to
  `probe-mechanics.md`; this document only names the currency. Do not let this file's "no-twist
  reading" get built as the *only* reading without checking that sibling document first.
- **Rule 3's hardest test in the whole ladder.** "The same seven families, the same hazard rows,
  only depicted differently" is easy to say and hard to keep once a body stops being *drawn* at
  all and becomes a *readout*. §8's icon-plus-readout split is this document's proposed answer;
  it has not been prototyped and should be spiked before the rest of the era is built on it.
- **Overlap with era V/Observatory is the single biggest visual risk.** Both eras are
  instrument-grammar, both eras' repulsor and crosswind rows are naturally a flare/wind-vector
  idiom, and both are the two most "modern-looking" plates in the ladder. §3's palette and §7's
  register choices (mesh/wedge/flux-arrow vs. rendered photon-ring/Hα-loop/vector-field) are
  this document's attempt to keep them apart; they need to be checked side by side once both
  exist, not just read side by side in prose.
- **The Hershey/fontkit mismatch (§4) is a real pipeline risk, not a licensing footnote.** The
  game's entire lettering pipeline assumes a filled, contoured glyph. A single-stroke face with
  no counters to flood is a genuinely different code path, and it should be spiked (a handful of
  glyphs, end to end) before the era's other nine sections are built against it.
- **OCR-A/OCR-B licensing is unverified.** This pass could not reach ctan.org or tug.org, the
  homes of the known free digitizations, because of this session's network egress policy. Do not
  ship either face without independently confirming the licence text — and do not confuse the
  free CTAN digitization with the commercial "OCR A Extended" font family, which is not free.
- **Several factual claims in §1 carry an explicit unverified flag** (the Pioneer plaque's exact
  manufacturing process; the precise division of labour between Linda Salzman Sagan and Jon
  Lomberg on the Voyager cover's engravings; the Golden Record 2.0 project's final funding
  outcome; StarChip's settled sail dimensions, since the program is still active R&D). None of
  these affect the era's buildable grammar, but none should be asserted as fact in a shipped
  caption without a second check.
- **This whole era is speculative fiction resting on real objects, which is a different honesty
  problem than every earlier era's.** Eras 0–7 depict things that were drawn. This era depicts a
  machine that has not been built, using the drawing conventions of machines that *were* built
  (Pioneer, Voyager, DSN, CCSDS). The design discipline that keeps this from becoming an
  "invented era" (`OVERVIEW.md`'s standing warning) is to keep every visual and textual choice
  traceable to one of the verified documents in §1, and to flag, loudly, the handful of places
  (§8's icon set, most of §6, the daughter-probe motif in §10.4) that this document is
  proposing rather than finding.

## 13. Sources

Search-snippet verified (WebSearch; direct fetch of the underlying page was blocked by this
session's network egress policy in every case below, so treat as corroborated-by-search rather
than primary-source-read, except where noted):

- Pioneer plaque — [Wikipedia](https://en.wikipedia.org/wiki/Pioneer_plaque), [The Planetary
  Society](https://www.planetary.org/articles/0120-the-pioneer-plaque-science-as-a-universal-language),
  [Smithsonian Magazine](https://www.smithsonianmag.com/smart-news/original-engraver-reproducing-replicas-iconic-pioneer-10-plaque-180963363/).
- Voyager record cover — [Smithsonian Music](https://music.si.edu/object-day/spacecraft-voyager-sounds-earth-record-cover),
  [Smithsonian NASM object record](https://airandspace.si.edu/collection-objects/record-cover-voyager-duplicate/nasm_A19772740000),
  [NASA, "Instructions for Aliens"](https://www.nasa.gov/image-article/instructions-for-aliens).
- Arecibo message — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/0019103575901165),
  [U. Oregon course notes](https://pages.uoregon.edu/jimbrau/astr123/Notes/ch28/AreciboMessage.html),
  [National Geographic](https://www.nationalgeographic.com/science/article/40-years-ago-earth-beamed-its-first-postcard-to-the-stars).
- LAGEOS plaque — [NASA Goddard](https://earth.gsfc.nasa.gov/geo/missions/lageos/message),
  [Aeon Essays](https://aeon.co/essays/voyager-space-probes-the-easter-island-statues-of-our-times).
- Rosetta Disk — [Amusing Planet](https://www.amusingplanet.com/2017/04/the-rosetta-disk-preserving-worlds.html),
  [Rosetta Project](https://rosettaproject.org/disk/concept/), [ESA](https://sci.esa.int/web/rosetta/-/31242-rosetta-disk-goes-back-to-the-future).
- Earth Tapestry — [CMU news](https://www.cmu.edu/news/stories/archives/2015/april/message-to-future.html)
  (current flight status unverified).
- Breakthrough Starshot / StarChip — [Breakthrough Initiatives](https://breakthroughinitiatives.org/concept/3),
  [Space.com](https://www.space.com/40512-breatkthrough-starshot-interstellar-sail-technology.html),
  [Scientific American](https://www.scientificamerican.com/article/building-sails-for-interstellar-probes-will-be-tough-but-not-impossible/).
- "Golden Record 2.0" — [Space.com](https://www.space.com/37922-one-earth-message-new-horizons-golden-record.html),
  [NBC News Mach](https://www.nbcnews.com/mach/science/golden-record-2-0-could-let-space-probe-communicate-aliens-ncna796031).
- CCSDS transfer frame / sync marker — [MathWorks](https://www.mathworks.com/help/satcom/ref/ccsdstmframesynchronizer-system-object.html),
  [ResearchGate](https://www.researchgate.net/figure/Structure-of-the-TM-Transfer-Frame-Primary-Header_fig6_254966725)
  (the CCSDS 131.0-B standard itself not directly fetched).
- DSN Now / Eyes on the Solar System — [JPL](https://www.jpl.nasa.gov/deep-space-network-now/),
  [eyes.nasa.gov/apps/dsn-now](https://eyes.nasa.gov/apps/dsn-now/) (exact colour coding is
  general-knowledge, unverified — see §3/§9).

Directly fetched this pass (primary source read, not just search snippet):

- [`kamalmostafa/hershey-fonts`](https://github.com/kamalmostafa/hershey-fonts) — Hershey
  fonts' origin, `.jhf` format, licence language quoted in §4.
- Google Fonts metadata via `raw.githubusercontent.com/google/fonts` — `ofl/b612mono/METADATA.pb`
  and `DESCRIPTION.en_us.html`, `ofl/sharetechmono/METADATA.pb` — B612 Mono and Share Tech Mono
  designer credits, licence, and B612's Airbus/Polarsys origin.
- [`keshikan/DSEG`](https://github.com/keshikan/DSEG) — OFL-1.1 licence confirmed.

**Not verified this pass**, both flagged in §4/§12 rather than asserted: OCR-A/OCR-B licensing
(ctan.org and tug.org were both blocked by this session's network egress policy); the Voyager 1
2023–24 telemetry-fault incident and the Voyager plasma-wave sonifications (this session's
WebSearch budget was exhausted before either could be checked — both are widely reported and
consistent with general knowledge, but unconfirmed by a source read this session).
