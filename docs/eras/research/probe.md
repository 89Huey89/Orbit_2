# VIII · The Probe — research

**The far future.** A self-replicating (von Neumann) interstellar probe, long after crewed
astronomy, long after even the Observatory's survey pipelines. No era file exists yet for this
row; this document is the first pass, to the research brief's template. A sibling document,
`docs/eras/research/probe-mechanics.md` (a separate agent's work), owns the replication rule in
depth — §6 here names the currency and stops there.

The brief's thesis, stated plainly because it is the reason this era is worth building: **the
ladder's two ends rhyme.** Era 0, the Rock, is marks struck into stone because that was the only
durable writing available. Era 8, the Probe, is a species that invented radio, lasers, machine
memory — and when it needed a message to survive a billion years in vacuum, it *still* chose a
metal plate and a burin-line drawing, because nothing else lasts. The Pioneer plaque and the
Voyager cover are, technically, engravings. §§1–4 below verify that the record already contains
this rhyme; the ladder only has to notice it.

## 1. The documents

- **Pioneer plaque** (Pioneer 10, 1972; Pioneer 11, 1973). Gold-anodized **6061-T6 aluminum**,
  6 × 9 in (15.2 × 22.9 cm), 0.05 in thick, bolted to the antenna support struts. Designed by
  Carl Sagan and Frank Drake in three weeks at NASA's invitation; the artwork itself — the
  human figures, the whole composition — was drawn by **Linda Salzman Sagan**, an artist, not
  by Sagan. Content, roughly left to right: the hydrogen atom's hyperfine (spin-flip)
  transition, top left, fixing the unit of length (21 cm) and time (1420 MHz) every other
  measurement on the plate uses; a radial "pulsar map" of 14 pulsars, periods given in binary
  as multiples of that hydrogen unit, letting a finder fix both the Sun's position and the
  launch date from pulsar spin-down (Drake's encoding); a man and a woman to scale against the
  spacecraft's silhouette, the woman's height marked in binary (8 × 21 cm ≈ 168 cm); and the
  solar system with Pioneer's outbound trajectory past Jupiter. Whether the plate was
  chemically etched or mechanically engraved is **unverified** and worth a dedicated check.
- **Voyager Golden Record and cover** (Voyager 1 and 2, 1977). Record: **gold-plated copper**,
  12 in (30.48 cm) diameter, 16⅔ rpm. Cover: gold-anodized aluminum, 1/16 × 12 in, bolted over
  the record against micrometeorites — and this is where the actual "writing" is. Engraved on
  it: a cartridge-and-stylus diagram showing correct playback position; the rotation rate given
  as **binary tick marks ringing the diagram** (one turn = 3.6 s, in the same hydrogen unit as
  Pioneer); the same 14-pulsar map, again Drake's; and an ultra-pure Uranium-238 source with its
  decay curve, so the cover is also a clock legible at any finding date. Sagan led the project;
  Jon Lomberg was design director and NASA credits him with most of the diagrams — where a
  claim below turns on Lomberg vs. Salzman Sagan specifically, treat it as **unverified**.
- **Arecibo message** (16 Nov 1974, toward globular cluster M13 at 2380 MHz). Not a plate — a
  **radio bitmap**, 1,679 bits, deliberately 23 × 73 (both prime) so a receiver has exactly one
  rectangular layout. Decoded: the numbers 1–10 in binary; the atomic numbers of H, C, N, O, P;
  DNA's nucleotide formulas and a double-helix schematic with a base-pair estimate; a human
  figure with height and population; the solar system marking Earth; the Arecibo dish itself.
  The ladder's cleanest example of **the sky as a bitmap** — a raster of cells that only
  becomes a picture once the receiver knows the rectangle's shape.
- **LAGEOS plaque** (1976, sealed in a brass sphere used for laser-ranged continental-drift
  measurement). Conceived by Sagan, drawn by Lomberg. Shows Earth's continents at three points:
  268 million years ago (Pangaea), at launch, and ~8.4 million years hence — near when the
  satellite's orbit is expected to decay and return it. Unlike Pioneer or Voyager, its addressee
  is **a future human, not an alien**, and its clock is the very phenomenon (plate tectonics)
  the satellite flew to measure — a distinction worth carrying into the game's framing.
- **Long Now Rosetta Disk** (Rosetta Project/Long Now; a duplicate flew on ESA's 2004 Rosetta
  orbiter as backup archive, not outbound message). A 3 in (7.5 cm) **micro-etched, electroformed
  nickel** disk, ~14,000 pages raised ~100 nm off the surface, each page 400 microns across,
  readable at 500–650× magnification, in roughly a thousand languages. A second precedent (with
  LAGEOS) for durability-by-metal-etching addressed to the future rather than to the stars.
- **Breakthrough Starshot's StarChip** (announced 2016, unflown, active R&D — **unverified as
  to final spec**). A gram-scale, centimeter wafer probe — camera, photon thrusters, power,
  comms — pushed by an Earth-based laser against a sail variously specced from a few square
  meters to ~10 m², under a gram, ~100 atoms thick, targeting roughly a fifth of light speed
  toward Alpha Centauri. No plaque exists for it; the 2017 "Golden Record 2.0"/One Earth Message
  project (Lomberg again) proposed *streaming* a message to New Horizons instead of engraving
  one — its funding and final disposition are **unverified**.
- **CCSDS telemetry transfer frame** — not a museum object but the era's real handwriting: a
  fixed-length frame prefixed by a 32-bit attached synchronization marker, hex `1ACFFC1D`, then
  a primary header (spacecraft ID, virtual channel ID, frame counter, data-field status) and a
  payload, usually closed with an error-control field. Fixed fields at a fixed cadence, not
  prose — the grammar's other half, next to the plaque's hand-drawn one (§2).

## 2. The grammar

Two grammars share this era, in visible tension, and the tension is the point.

**The telemetry half** does not draw the sky — it *instruments* it. A body is not rendered, it
is numbers: mass, mean density, a spectral class tag, a ΔV budget to reach it, a
periapsis/apoapsis pair. An orbit is a Keplerian element set, not a drawn ellipse traced by eye —
the same six numbers JPL's Horizons/"Eyes on the Solar System" use for every tracked object,
rendered as thin conic sections: black ground, monochrome vector lines, no shading, no
perspective beyond a top-down plot's own flattening. A hazard is a field, not a figure — a
contour mesh or a flux-vector overlay, the idiom era 7/Observatory already claims for its solar
wind, so this era needs a colder, more schematic register to avoid repeating that plate (§7, §12).

**The plaque half** is the opposite: a single continuous engraved line, uniform weight, drawn
once and never re-inked — literally the Pioneer plaque and the Voyager cover. This is where the
constellation figures, the chapter plates and the title lettering belong: a self-replicating
machine does not decorate, but it still carries — bolted to its hull, unread by anything it has
met — the same ancestral plaque every daughter copies along with its blueprint. The two halves
never merge; the HUD is instrument, the plaque is inheritance, and a player should be able to
tell which one they're looking at without a caption.

**Not present:** perspective, atmosphere, colour gradients outside §3's green/amber/white
convention, any painterly surface rendering, and — the hardest restraint here — no picture of
the sky *as seen*. The probe has no eye; everything shown is a measurement or an inheritance.

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

**Gold** is engraved-gold — the plaque, the cover, the one warm worked material aboard, standing
in for the game's existing gold-leaf/gold-accent role (Cellarius's gilt is the closest surviving
relative). **Ink** is telemetry green or amber by plate variant, mirroring the night/paper
split. **Ground** is interstellar black, unbroken but for the radiator's glow and starlight.
**Hex** is not a colour but a *texture* — scrolling hexadecimal, this era's down-and-right
hatching. The 2023 Voyager 1 flight-data-system fault, which returned a repeating pattern of
ones and zeros for months instead of readable telemetry, is real-world precedent for hex-as-
decoration-with-a-cause rather than invented wallpaper (unverified this pass — see §12).

## 4. Lettering and how people wrote

The probe writes in two registers, and unlike every earlier era neither one is a script in the
linguistic sense — both are engineering conventions, which is itself the era's answer to "how
people wrote": by the time a species sends a self-replicating machine to the stars, its
"handwriting" is a data format.

**The plaque hand** is the Pioneer/Voyager engraved line: single-stroke, uniform weight, cut
once, no serif, no shading — exactly what a burin or an engraving machine produces, and exactly
what the **Hershey fonts** are. Dr. Allen V. Hershey drew this vector family (Latin, Greek,
Cyrillic, Japanese, symbols) circa 1967 as stroke coordinate data for a pen-following device —
structurally engraving instructions, not a filled typeface. Not on Google Fonts, no OFL release;
the maintained reissue verified this pass, `kamalmostafa/hershey-fonts` on GitHub, ships the
glyph data under "a permissive use and redistribution license" (separate from the surrounding
library's GPLv2+), in the publisher's own `.jhf` coordinate format — public-domain-adjacent, not
OFL; re-read the exact terms before shipping. **The one genuinely free technical finding here**:
Hershey glyphs are *already* the game's stroke data, a generation before fontkit existed to
extract anything like it. The catch: the game's pipeline (`scripts/glyphs.mjs`) extracts filled
*contour outlines* via fontkit and both strokes and floods them; Hershey has no contours to
flood, only strokes, no closed counter to fill. The plaque hand should skip the flood step
entirely — closer to `writeText()`'s clip-reveal than to `penLettering()`'s stroke-then-flood —
via either a small `.jhf` parser bypassing fontkit, or a converted single-line TTF (hobbyist
plotter-font projects exist; none checked this pass). Spike this before committing to the face.

**The telemetry hand** wants a monospace face built for the job. Three verified this pass, all
Google Fonts/OFL: **B612 Mono** (Airbus, with ENAC and Université de Toulouse III, 2010–2012,
purpose-built for cockpit-display legibility under vibration and glare; released 2017 via
Polarsys/Eclipse Foundation, originally Eclipse Public License, now OFL on Google Fonts — the
single most on-theme face available); **Share Tech Mono** (Carrois Apostrophe, OFL since 2012,
generic tech-console character); **DSEG** (`keshikan/DSEG`, OFL-1.1, seven-/fourteen-segment
LCD/LED emulation, 50+ variants) — matching LETTERING.md's own era-V idea that "numerals should
update, not be written" even better here: a feedstock counter that ticks like an odometer suits
a machine with no hand to write with. **OCR-A/OCR-B** (ANSI X3.17-1977, 1968) are the right
period reference but their free digitizations live as CTAN packages, not Google Fonts entries;
this pass could not reach ctan.org or tug.org to confirm licence terms or to rule out confusion
with the commercial "OCR A Extended." **Mark OCR-A/B unverified**; B612/DSEG/Share Tech Mono are
the safe fallback trio.

No script needs shaping — both registers are Latin-alphabet, one stroke-only and one
monospace-block. Numerals are Arabic, set in DSEG or B612 Mono; when the plaque hand sets a
number (as the real plaques do) it draws binary tick marks as the Voyager cover does, not digits.

## 5. Names for the game's things

Constructed throughout — no attested "probe language" exists — but grounded in a real, attested
convention: CCSDS/JPL telemetry mnemonics, genuinely short, all-caps, built from clipped English
roots. No separate transliteration column: the mnemonic already sets in the Roman alphabet it's
read in. Where a term is the real name of a real spacecraft event or field it is marked attested;
the specific mnemonic string applied to this game's specific thing is always constructed.

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
as raw material for the next daughter probe. It is the one currency in the ladder not consumed
by use alone but also the literal substance of the *next generation* — the natural hook for the
mechanics doc's replication rule, and exactly why this document stops here rather than designing
it: `probe-mechanics.md` owns how mass is earned, spent, and converted into a spawned daughter.

**No-twist reading**, for completeness: rename `ink` to `FEED`, keep `inkCost(distance)` and
every existing gain bit-for-bit, and let the HUD read mass units instead of a bar — the era's
skin at zero simulation risk, per rule 1.

## 7. Dangers

All three rows keep their existing field/core/reach/lethality (rule 3); only depiction and
naming change, and this era must avoid re-drawing what era 7/Observatory already claims for the
same rows (a rendered black hole with a photon ring; an Hα coronal mass ejection; a solar-wind
vector field) — both sit at the technological end of the ladder and would otherwise repeat a plate.

- **Attractor — `WELL`.** Not a photographed black hole but an **equipotential mesh**: a warped
  grid converging on the mass, the diagnostic plot a navigation computer would actually draw,
  mass given as a number rather than a disc. A pulsar's presence marks as a rotating tick at the
  mesh's centre, tying it to the plaque's pulsar-map iconography without duplicating it.
- **Repulsor — `BEAM`.** A pulsar's swept beam or a flare's radiation-pressure front, a rotating
  sector wedge rather than era 7's rendered active-region loop — an instrument reading, not a
  photograph.
- **Crosswind — `ISM FLUX`.** The interstellar medium's particle flux as thin flux-vector arrows
  — the row most at risk of duplicating era 7's solar wind; the mitigation is register, not
  idiom: monochrome lines and a numeric readout, no colour gradient, no Hα.
- **Obscurer — `EXT`.** A dust cloud read the only way a probe can: as **extinction**, a shaded
  attenuation region with a logged magnitude of signal loss, not a rendered nebula.

## 8. The seven families

Each body is shown twice at once, per §2's two grammars, and an artist should draw both: a
Hershey-line **icon** (the plaque's own reductive style — the Pioneer plaque draws whole planets
as bare circles with a radial tick for identification) sitting beside a monospace **class
readout**.

- **Ocean (`CLASS-H2O`).** A plain circle with a single horizontal chord — the plaque's own
  shorthand for a surface state distinct from the bulk. Readout: low density, volatile-rich.
- **Crater (`CLASS-REG`).** A circle stippled with small unfilled rings — cratering as texture,
  never shaded relief; no terminator, no shadow, because this grammar never shades.
- **Ringed (`CLASS-RNG`).** A circle crossed by one or two thin ellipse arcs — the Pioneer
  plaque's own reduction of Saturn, a solved problem, borrowed directly.
- **Ice (`CLASS-CRYO`).** A circle with a fine crosshatch fill at low density — frost read as
  texture, never as a shaded surface.
- **Dune (`CLASS-AEOL`).** A circle crossed by parallel wave-lines — the one family allowed to
  imply motion (wind-formed ripples) without implying light or perspective.
- **Volcanic (`CLASS-IGN`).** A circle with a small radiating tick-cluster, reading "energetic"
  the way the plaque's hydrogen-transition diagram reads as a discrete emission — never flame or
  glow, which stays reserved for the radiator-heat palette accent.
- **Storm (`CLASS-ATM`).** A circle with one internal spiral stroke — a minimal weather motif,
  never a rendered cloud band.

Each icon sits beside a class readout carrying the numeric half of the grammar — mass number,
mean density, a periapsis/apoapsis pair where relevant — set in DSEG or B612 Mono.

## 9. Chart furniture, frame, HUD

No cartouche, no colophon, no engraver's credit in the era-III sense — the closest is the
plaque's own small identifying marks (a schematic Earth-to-launch-site locator on the Voyager
cover, functionally a maker's mark). The frame becomes a **CCSDS transfer-frame border**: a
header bar with the sync marker in hex (`1ACFFC1D`), a virtual-channel ID and a running frame
counter, closing on a checksum/error-control field — the wrapper real telemetry travels in,
doing the job era III's plate-mark and double rule did. A margin strip in the DSN-Now idiom
(one-way light time, signal strength, which antenna is locked) replaces the compass rose. HUD
numerals tick over (§4) rather than being inscribed; a chapter announces a `PHASE` change, not a
page turn.

## 10. Four chapter plates

1. **First light** — the Pioneer plaque's face, engraved gold, filling the frame at launch: the
   hydrogen-transition diagram, the pulsar map, the human figures, before departure.
2. **The instructions** — the Voyager cover's playback diagram, binary tick marks ringing a
   stylus-and-groove drawing, doubling as the chapter's own "how to read this chart" plate.
3. **Sail deployment** — a Starshot-scaled lightsail unfurling against interstellar black, sail
   film catching a laser's push, the hull reduced to a bright point at the sail's centre.
4. **The first daughter** — a second, smaller probe departing on an escape burn (`ESC`), the
   replication event `probe-mechanics.md` will define the rule for; the plaque motif repeats in
   miniature on the daughter's hull, the ancestral engraving copied along with everything else.

## 11. Sound

- **Reaction-wheel hum** — a steady low tone, rising in pitch under load, replacing the
  engraving era's quill-scratch (`scratch()`) as the continuous while-flying cue.
- **DSN carrier lock** — a pure held tone that only sounds while telemetry is getting through;
  its dropout (silence, not an effect) is the era's loss cue.
- **Plasma-wave sonification swell** — Voyager 1's Plasma Wave Subsystem did record real
  oscillations in the interstellar plasma near the 2012 heliopause crossing, released by NASA
  as frequency-shifted audible sound (**unverified this pass** — see §12/§13); a rising swell
  built from that idiom fits a capture or constellation-completion cue.
- **Frame sync chirp** — a short two-tone blip on every `OI`, standing in for `capture()`'s
  tone-plus-brush: a transfer frame locking onto its sync marker.
- **Escape-burn tone** — a tone climbing and cutting off cleanly, for `release()`.
- **A mechanical clock tick** — sparse, marking elapsed mission time, an ambient bed under
  `darkness`'s rising pursuit.

## 12. Risks and open questions

- **The ladder's numbering has moved.** `OVERVIEW.md`/`DANGERS.md` still describe the old
  five-era ladder (I Ceiling … V Observatory); reconcile it against this brief's nine before
  extending DANGERS.md's hazard table, not silently append to it.
- **§6 is deliberately incomplete** — the replication rule belongs to `probe-mechanics.md`;
  don't build this file's "no-twist reading" as the only one without checking that document.
- **Rule 3's hardest test in the ladder** — "same rows, only depicted differently" is hard to
  keep once a body stops being drawn and becomes a readout. §8's icon-plus-readout split is
  proposed, unprototyped, and should be spiked first.
- **Overlap with era 7/Observatory is the biggest visual risk** — both instrument-grammar, both
  eras' repulsor/crosswind rows naturally flare/wind-vector idioms. §3/§7's register choices
  (mesh/wedge/flux-arrow vs. rendered photon-ring/Hα-loop) attempt to keep them apart; check side
  by side once both plates exist.
- **The Hershey/fontkit mismatch (§4) is a pipeline risk, not a footnote** — the lettering
  pipeline assumes a filled, contoured glyph; a single-stroke face with no counters to flood
  needs a different code path, spiked end to end first.
- **OCR-A/OCR-B licensing is unverified** (ctan.org/tug.org blocked this pass) — confirm the
  licence text before shipping either, and don't confuse it with the commercial "OCR A Extended."
- **Several §1 claims carry an explicit unverified flag** (plaque manufacturing process, the
  Salzman Sagan/Lomberg division of labour, Golden Record 2.0's funding outcome, StarChip's
  settled spec) — none affect the buildable grammar, but none should ship as fact unchecked.
- **This era is speculative fiction resting on real objects**, unlike eras 0–7, which depict
  things that were drawn. The discipline that keeps it from becoming an "invented era" is keeping
  every choice traceable to §1, and flagging the places (§8's icon set, most of §6, §10.4's
  daughter-probe motif) proposed here rather than found.

## 13. Sources

Search-snippet verified (WebSearch; direct fetch was blocked by this session's network egress
policy in every case below unless marked "fetched"):

- Pioneer plaque: [Wikipedia](https://en.wikipedia.org/wiki/Pioneer_plaque), [The Planetary
  Society](https://www.planetary.org/articles/0120-the-pioneer-plaque-science-as-a-universal-language),
  [Smithsonian Magazine](https://www.smithsonianmag.com/smart-news/original-engraver-reproducing-replicas-iconic-pioneer-10-plaque-180963363/).
- Voyager cover: [Smithsonian Music](https://music.si.edu/object-day/spacecraft-voyager-sounds-earth-record-cover),
  [Smithsonian NASM](https://airandspace.si.edu/collection-objects/record-cover-voyager-duplicate/nasm_A19772740000),
  [NASA "Instructions for Aliens"](https://www.nasa.gov/image-article/instructions-for-aliens).
- Arecibo: [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/0019103575901165),
  [U. Oregon notes](https://pages.uoregon.edu/jimbrau/astr123/Notes/ch28/AreciboMessage.html),
  [Nat Geo](https://www.nationalgeographic.com/science/article/40-years-ago-earth-beamed-its-first-postcard-to-the-stars).
- LAGEOS: [NASA Goddard](https://earth.gsfc.nasa.gov/geo/missions/lageos/message), [Aeon
  Essays](https://aeon.co/essays/voyager-space-probes-the-easter-island-statues-of-our-times).
- Rosetta Disk: [Amusing Planet](https://www.amusingplanet.com/2017/04/the-rosetta-disk-preserving-worlds.html),
  [Rosetta Project](https://rosettaproject.org/disk/concept/), [ESA](https://sci.esa.int/web/rosetta/-/31242-rosetta-disk-goes-back-to-the-future).
- Earth Tapestry: [CMU news](https://www.cmu.edu/news/stories/archives/2015/april/message-to-future.html) (flight status unverified).
- Starshot/StarChip: [Breakthrough Initiatives](https://breakthroughinitiatives.org/concept/3),
  [Space.com](https://www.space.com/40512-breatkthrough-starshot-interstellar-sail-technology.html),
  [Sci. American](https://www.scientificamerican.com/article/building-sails-for-interstellar-probes-will-be-tough-but-not-impossible/).
- "Golden Record 2.0": [Space.com](https://www.space.com/37922-one-earth-message-new-horizons-golden-record.html),
  [NBC News Mach](https://www.nbcnews.com/mach/science/golden-record-2-0-could-let-space-probe-communicate-aliens-ncna796031).
- CCSDS frame/sync marker: [MathWorks](https://www.mathworks.com/help/satcom/ref/ccsdstmframesynchronizer-system-object.html),
  [ResearchGate](https://www.researchgate.net/figure/Structure-of-the-TM-Transfer-Frame-Primary-Header_fig6_254966725)
  (CCSDS 131.0-B itself not fetched).
- DSN Now/Eyes: [JPL](https://www.jpl.nasa.gov/deep-space-network-now/), [eyes.nasa.gov/apps/dsn-now](https://eyes.nasa.gov/apps/dsn-now/)
  (exact colour coding is general-knowledge, unverified — §3/§9).
- Fetched directly (primary read): [`kamalmostafa/hershey-fonts`](https://github.com/kamalmostafa/hershey-fonts)
  (origin, `.jhf` format, licence text, §4); Google Fonts metadata via
  `raw.githubusercontent.com/google/fonts` (`ofl/b612mono/METADATA.pb` + `DESCRIPTION.en_us.html`,
  `ofl/sharetechmono/METADATA.pb`: designer credits, licence, B612's Airbus/Polarsys origin);
  [`keshikan/DSEG`](https://github.com/keshikan/DSEG) (OFL-1.1 confirmed).

**Not verified this pass** (flagged in §4/§12, not asserted): OCR-A/OCR-B licensing — ctan.org
and tug.org were both blocked by this session's egress policy; the Voyager 1 2023–24
telemetry-fault incident and the plasma-wave sonifications — this session's WebSearch budget was
exhausted before either could be checked. Both are widely reported and consistent with general
knowledge but unconfirmed by a source read this session.
