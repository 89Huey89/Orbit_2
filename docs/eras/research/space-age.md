# Research — VII · The Space Age (1965–1989, opening onto 1990–, the medium falls away)

Written against **NEW-BRIEF.md** (not present in this repository at time of writing — see §15),
described here as superseding `docs/eras/`. The brief's hardest line for this era: "at the
transition into this era, briefly strip away the historical medium... for the first time: BLACK
SPACE." Knowledge gain: WORLD → PLACE, via scanning, telemetry, mapping, surface and atmospheric
detail. §12 reconciles this era with the two things already written that overlap it:
[`observatory.md`](observatory.md) (the 1990– *observing* era, partly built as
`PLATE_STYLES.modern`) and the 1965–1989 flyby gap [`ERA-AUDIT.md`](../ERA-AUDIT.md) and
[`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md) both flag as missing. Web access was available and
used throughout; claims are checked against a fetched or searched source unless marked
**(unverified)**. Evidence labels — **attested**, **plausible reconstruction**, **fictional gameplay
translation** — follow [`ERA-AUDIT.md`](../ERA-AUDIT.md)'s contract.

## 1. The documents

- **Mariner 4's first close-up image of Mars, 14–15 July 1965.** A **200×200-pixel raster, each
  pixel a 6-bit value (0–63)** — 240,000 bits per frame, taped onboard (21-frame capacity) and
  radioed home at **8⅓ bits per second**, so one frame took roughly ten hours and the full set
  about ten days. **Attested**, JPL/NSSDCA records. The image everyone actually pictures is not the
  developed photograph but **the hand-coloured strip chart**: unwilling to wait for the imaging
  computer, JPL engineers pinned the teletype's numeric printout to a wall and coloured the digits
  by hand with pastels bought from a nearby art shop — Richard Grumm, running the tape system, built
  the palette; he'd wanted grey chalk to match the real image but the shop had only colour. Framed
  and presented to JPL director William Pickering, it is a paint-by-numbers grid keyed to a data
  table, not a photograph. **Attested** (NASA Science's own "Coloring the Mariner 4 Image Data" page
  and multiple independent retrospectives agree on the story).
- **Viking 1 and 2 landers, Mars, 20 July and 3 September 1976.** Each facsimile camera scanned the
  scene with a rotating photodiode, line by line in azimuth — a flatbed-scanner mechanism, not a
  vidicon tube. Each lander carried **reference test charts** (radiometric/colour/resolution
  calibration patches) in frame, and processing corrected lens distortion using **reseau marks** —
  a grid of crosses etched into a fixed platen in the optical path, whose known positions let ground
  software undo the geometry mathematically. **Attested** (JPL/USGS Viking documentation).
- **Voyager 1 and 2, the "Grand Tour," launched 1977.** V1: Jupiter 5 Mar 1979, Saturn 12 Nov 1980.
  V2: Jupiter 9 Jul 1979, Saturn 26 Aug 1981, **Uranus 24 Jan 1986** and **Neptune 25 Aug 1989** —
  the only craft ever to visit either, and Voyager's last planetary encounter. **Attested.** Voyager
  imaged targets as **framed mosaics** — a grid of separately-radioed vidicon tiles reassembled on
  the ground — the origin of the seamed-panorama look period Jupiter/Saturn photographs actually
  have, visible tile boundaries and all.
- **Io's volcanism, discovered 9 March 1979.** Linda Morabito, a JPL navigation engineer processing
  a Voyager 1 frame for spacecraft-position work, noticed a 270 km crescent cloud off Io's limb: an
  active volcanic plume (later named Pele). Re-checking earlier frames found eight plumes total —
  the first active volcanism ever seen off Earth, found by accident in an engineering frame.
  **Attested** (Morabito's own 2012 arXiv historical review; NASA/JPL retrospectives agree).
- **Europa's ice, Voyager 1979; the ocean argument, Galileo 1995–2003.** Voyager's first close
  images showed a smooth, reflective surface crossed by dark, near-relief-free lineae, read as
  fractures filled from below. Galileo, from magnetic and gravity data plus imagery, later supplied
  the first strong evidence for a **subsurface liquid-water ocean** — "more water than all of
  Earth's oceans combined" (NASA's own Europa history page). **Attested** — keep the two claims
  separated: 1979 is the fractured ice, 1995–2003 the ocean.
- **The rings of Uranus, 10 March 1977** — nine years before Voyager ever arrived, and not by
  imaging. James L. Elliot and colleagues, tracking a stellar occultation from an airborne
  telescope, saw the star wink five times before Uranus itself occulted it and five after: a light
  curve, not a picture, proving narrow rings existed. Ground occultations found four more before
  1986; Voyager 2 then imaged the system directly and found two further rings (λ, ζ). **Attested** —
  the two-stage history (sensed, then seen) is exactly this era's own reveal arc in miniature.
- **Neptune's Great Dark Spot, Voyager 2, August 1989.** An Earth-sized dark storm near 27°S,
  roughly 13,000×6,600 km, winds over 2,100 km/h — making the coldest, outermost planet the
  windiest. Hubble found it gone by the mid-1990s, unlike Jupiter's much older Great Red Spot.
  **Attested.**
- **Cassini–Huygens; Huygens landed on Titan 14 January 2005.** The only lander to touch an outer-
  Solar-System body. It photographed continuously through descent (a frame near 143 km, ~40 m/pixel;
  one near 8 km, ~20 m/pixel, showing apparent drainage channels and a shoreline), then icy
  "cobblestones" on a frigid surface floodplain — roughly 350 images total. **Attested.**
- **New Horizons at Pluto, 14 July 2015.** The heart-shaped **Tombaugh Regio**, its western lobe
  **Sputnik Planitia** a smooth young ice plain, was built from four monochrome LORRI frames plus
  lower-resolution Ralph colour data, then colour-*enhanced* — not natural colour — to make
  compositional boundaries legible. **Attested** (NASA's "Pluto Dazzles in False Color" release).
- **Rosetta and Philae at comet 67P, 2014.** OSIRIS mapped the nucleus from orbit from August 2014;
  Philae's 12 November landing (it bounced twice when its harpoons failed, settling in a cliff's
  shadow) is documented in an OSIRIS mosaic spanning before, during and after first touchdown.
  **Attested.**
- **Asteroid shape models — NEAR Shoemaker/Eros, Hayabusa/Itokawa, OSIRIS-REx/Bennu.** An irregular
  body cannot be a lit sphere with a terminator; a mission instead builds a **polyhedral shape
  model**, a mesh of facets fitted to overlapping images or, for Bennu, combined radar/photometric
  data (a 2013 radar model ran to 1,348 vertices/2,692 faces before OSIRIS-REx's own close-range
  model resolved sub-metre features) — a wireframe or faceted solid built up as more of the body is
  observed, the correct visual language for "becoming known" a rendered sphere cannot supply.
  **Attested.**

The throughline: **the picture is not seen, it is assembled** — from a scan, a mosaic of separately
radioed tiles, a light curve, a radar return, a shape fit — and it is visibly incomplete before it
is complete. That incompleteness, not the finished image, is this era's real subject.

## 2. The grammar

**Instrumentation as the whole picture, not a margin around one.** Where the Observatory era's
scale bar, compass and filter label frame a *finished* rendered body, this era's own documents show
the furniture *replacing* the body for long stretches: a raster is a number grid before it is a
picture, a mosaic a seamed grid of tiles before it reads as one planet, a shape model a wireframe
before it is a solid. **The reveal itself is the grammar**, the sequence a controller on the ground
actually lived through, tile by tile, hour by hour — not decoration laid over a finished image.

**Scan-line structure**, and it is not one structure: vidicon-era frames (Mariner, Voyager, Viking
orbiters) build from horizontal scan lines with a visible pitch; a Viking *lander* frame builds the
same way rotated — line by line in azimuth, a scanner's carriage pass rather than a broadcast
raster. **Attested**, and the two should not be drawn identically.

**Reseau marks and the calibration target: proof embedded in the frame, not around it.** A reseau
cross is physically etched into the optical path so its known position, checked against its
measured position in a raw frame, lets distortion be undone mathematically — the correction is
derived from marks that are *part of the image*. A calibration/reference chart (Viking) or a grey
step wedge along a frame's edge (general astronomical-photography practice — **(unverified)** on a
specifically named Mariner/Viking frame) makes the same claim the Observatory era's scale bar makes
— *this can be checked* — but by embedding a known pattern inside the frame rather than annotating
around it.

**False colour, done for a reason that must be stated.** Every false-colour image here (Pluto's
heart, Uranus/Neptune, Mimas, Enceladus) exists because the instrument recorded wavelengths outside
what an eye sees at all, or because a real colour difference is too subtle to separate unstretched.
NASA's own FAQ material is explicit: a UV-filtered exposure mapped to blue, green to green, IR to
red produces a result "not indicative of what the scene would look like... with your own eyes."
**Attested**, and worth inheriting honestly from the Observatory research already in the repo: false
colour is instrumentation making an invisible boundary visible, and a caption should say so.

**Mission-control type.** JPL/NASA drew on two faces in sequence: **Futura** through Apollo (the
Apollo 11 lunar plaque is set in it), then **Helvetica**, NASA's standard from the 1976 Danne &
Blackburn identity redesign onward through shuttle-era hardware and documents. **Attested** (NASA's
own 1976 Graphics Standards Manual, NHB 1430.2). Either fits; Helvetica's ubiquity in digital UI
makes it the safer HUD anchor.

## 3. Palette

**Ground: true black, but a material black** (see §9). Unlike the Observatory era's near-black
`#04060b`, already carrying airglow and a galactic band, this era's black should read as *emptied
space with almost nothing in it* — the point the brief itself makes.

| Line/swatch | Source | Hex | Confirmed? |
|---|---|---|---|
| Mariner 4 hand-tint palette | the JPL strip-chart image | ochre/tan through rust to near-black; no single value, a hand-coloured object | **(unverified)** exact hex; the object and its improvised colouring is attested |
| Vidicon monochrome (Mariner/Voyager/orbiter raw frame) | raw telemetry, pre-processing | greyscale `#000000`–`#e8e8e8` | attested as actual instrument output |
| New Horizons/Pluto enhanced colour | LORRI+Ralph composite | warm tan-orange (Tombaugh Regio) vs. pale blue-white (the lobes) | attested as a described composite; exact hex **(unverified)** |
| Neptune's Great Dark Spot | Voyager 2 imagery | deep methane blue field, darker blue-black oval | attested description; exact hex **(unverified)** |
| Io's surface | Voyager/Galileo imagery | sulphur yellow-orange-black — already the Observatory research's "volcanic" family palette | this era is where that later family reference imagery actually originates |
| Telemetry console readout | period CRT phosphor convention | green `≈#33ff66`, amber `≈#ffb000` | **(unverified)** to a named console; a standard, widely documented convention |

The honest palette lesson: **most of what a controller saw arrived monochrome.** Colour is a later
step — ground processing, composite work, sometimes literal pastel crayons — over grey data. A
plate that jumps straight to saturated colour throughout skips the era's real character.

## 4. Lettering — telemetry as a visual language

This era's script is the telemetry stream itself, the way [`LETTERING.md`](../LETTERING.md) treats
the FITS card for era VIII.

**The CCSDS frame.** Modern deep-space telemetry packages a **Space Packet** (small header +
payload) inside a **Transfer Frame** — the current standard (CCSDS 132.0-B-3) specifies a 6-byte
frame header (spacecraft ID, virtual-channel ID, frame counters) plus payload and an optional
error-correction trailer. **Attested** as the modern standard — but CCSDS was founded in 1982, so
it **postdates** Mariner (1965), Viking (1976) and most of Voyager's own transmissions. Use the
*concept* — fixed header, counters, payload, checksum — as this era's visual grammar without
claiming Mariner 4 spoke literal CCSDS. **The distinction matters and should not be blurred.**

**Frame sync and packet loss as this era's own vanishing.** A real stream can lose lock: bad sync,
a failed checksum, a missing block — visually, a dropped or garbled scan line, a frozen tile in an
advancing mosaic, a skipped counter. This is the honest mechanism behind "static," and the correct
translation of the brief's "advancing darkness" here: not corruption as an effect, but a literal
dropped frame.

**Numerals tick, they are not written** — as [`LETTERING.md`](../LETTERING.md) already specifies
for era VIII's FITS card, extended one step earlier: this era's own readouts (bit-error rate, signal
strength, range, frame count) update whole-digit by whole-digit, never with a drawn stroke.
Telemetry readouts arguably *originate* the "a machine, not a hand, wrote this" convention the FITS
card later formalises.

**Typefaces.** Futura or Helvetica (§2) for labels; IBM Plex Mono/JetBrains Mono, already chosen for
era VIII's FITS card, for anything framed as a literal readout — reused, not re-litigated. No
shaping issue: Latin/numeral only, same as Renaissance and Observatory.

## 5. Names for the game's things

No constructed-language problem here: the vocabulary is modern, operational English, almost all
attested — as the Observatory research found for its own later, overlapping period.

| Game term | Era's word | Gloss | Status |
|---|---|---|---|
| ocean / crater / ringed / ice / dune / volcanic / storm | ocean world / cratered-airless world / gas giant / ice giant / desert world / volcanic world / storm-band giant | this era's own missions named these discoveries (Io "volcanic," Europa toward "ocean," Uranus/Neptune "ice giants") | attested — per §8 several are *first earned* here, not applied by later analogy |
| orbit / capture / release | **orbital insertion** / **encounter** / **flyby** | a flyby (Mariner, Voyager, New Horizons) never captures — it passes once and never returns; an orbiter (Galileo, Cassini) does capture, literally | mixed — "flyby"/"encounter" attested for a pass; "orbital insertion" attested for a capture |
| the four pickups | **trajectory correction manoeuvre** (course change) / **gravity assist** (slingshot) | standard mission-design vocabulary | attested |
| currency (ink) | **propellant** / hydrazine, kg or m/s of delta-v | the literal, finite, non-resuppliable resource every real mission rations | attested |
| score | **downlink** (bits received) or **S/N**, shared with era VIII | telemetry link-budget language | attested |
| chapter/sheet | **encounter** or **pass** | standard usage | attested |
| the run | **the mission** | one life, exactly like a run | attested |
| "contact" | **acquisition of signal (AOS)** / **loss of signal (LOS)** | DSN's own bracket-terms for a tracking pass | attested |
| catalogue | the **mission log** / encounter sequence | the ordered record of a mission's own passes and captures | attested |
| "Orbit" (title) | stays **orbit** | now the literal thing a captured spacecraft does, vs. a flyby that only passes | attested; the title's oldest pun turns literally true here for the first time |

## 6. Currency and one rule

**Propellant — the strictest "ink" on the whole ladder.** Every earlier era's material (ochre, ink,
pigment, optical reach) could in some sense be gathered more; a spacecraft's propellant is loaded
once, on the ground, and never resupplied — what remains is the entire margin for every manoeuvre
still to come. This needs no construction: it is the literal mechanism behind Voyager's Grand Tour, a
**gravity assist** trading a body's own orbital momentum for a course change instead of burning
propellant, made possible only by a rare planetary alignment. **This era should reward the existing
slingshot pickups hardest of all** — a long, well-aimed gravity-assisted transfer is not just good
play, it is a real trajectory designer's actual job.

**No-twist reading:** rename ink to propellant/delta-v, keep every number as shipped — legitimate,
as expected of the Rock and Globe eras too. **A grounded twist, if wanted:** the DSN's real scarce
resource is **contact scheduling**, not propellant — a craft can only be commanded or downlinked
while an antenna holds lock (§9), structurally like the Observatory era's HST-orbit currency. A flat
"acquisition" tax per transfer would echo that era's own twist closely enough to risk the two
feeling identical — **flagged as a reason not to duplicate it**; if this era wants a twist, let it
live in §7's mission-risk framing instead.

## 7. Dangers — mission risk, not a monster

[`ERA-AUDIT.md`](../ERA-AUDIT.md) calls this turn out directly: "the Probe is stronger when the
enemy is signal loss and resource cost." This era, one step earlier, should make that turn first.
Per [`DANGERS.md`](../DANGERS.md)'s adopted rule, depiction only (option A): same four rows, this
era's own name and image, no new simulation rule.

| Row | Name | Depiction | Grounding |
|---|---|---|---|
| Attractor | **Gravity well / uncontrolled decay** | A body's mass understated by early tracking, drawn as a warp in the trajectory-prediction line itself — a navigation team's own plot, quietly wrong until corrected | Real navigation risk (every flyby refines mass from how the real path bends against the prediction) is attested; the specific render is a **fictional gameplay translation** |
| Repulsor | **Radiation belt / instrument fault** | A hard-edged, dense particle field (Jupiter's belts, which genuinely damaged Pioneer 10/11 and constrained later trajectories), a band to cross quickly, not dwell in | Attested constraint; render is a **fictional gameplay translation**, in the spirit of the Observatory era's CME occulter |
| Crosswind | **Solar wind**, drawn as Observatory §7 already does (a field, not a figure); for a comet pass, **outgassing** — a nucleus venting gas/dust asymmetrically as it warms, a real non-gravitational drift on its own trajectory | Streamlines with drifting specks, or jets breaking from a 67P-styled nucleus off its spin axis | Both attested phenomena; both renders are **fictional gameplay translations** |
| Obscurer | **Signal dropout / occultation** | A body passing between craft and Earth blanks telemetry for its duration, drawn as the frame itself losing sync, not a cloud shape | Routine, attested mission operations (a conjunction or occultation blackout); the sync-loss render is a **fictional gameplay translation** — the one obscurer on the ladder about communication, not obstruction |

Every row is a documented mission-risk category, named as a flight controller would name it, none
needing an invented figure — exactly [`ERA-AUDIT.md`](../ERA-AUDIT.md)'s point that "not every
period needs a monster." [`DANGERS.md`](../DANGERS.md) already seats Observatory-era entries (the
EHT black hole, LASCO CME, Parker wind, dust lane) under these same rows; this era's rows sit
deliberately *before* those in register — instrument-*plotted* risk, not instrument-*imaged*
phenomenon — so the two progress rather than repeat, echoing how [`DANGERS.md`](../DANGERS.md)
insists Observatory and Probe "must never read alike."

## 8. The bodies — where the seven families become true

[`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md) names this era outright: "the families are born in
the flyby years: Mariner 4's cratered Mars in 1965, the rings of Uranus in 1977, Jupiter's ring and
Io's volcanoes and Europa's ice in 1979, Neptune's Great Dark Spot in 1989." §1's dates confirm and
slightly refine it. **Crater**: Mariner 4, 1965 — the founding proof a body once imagined smooth or
canal-veined (the Plate era's Lowell-inherited misreading) was in fact heavily cratered, closer to
the Moon. **Ringed**: Uranus, sensed 1977, imaged 1986 — the moment "ringed" stops meaning Saturn
alone. **Volcanic**: Io, 1979, discovered by accident in a navigation frame — the most dramatic
origin of the seven, stageable almost verbatim (an anomaly appearing mid-orbit, not at capture).
**Ocean**: properly Galileo, 1995–2003, not Voyager's 1979 imagery — the fracture is 1979, the ocean
argument over a decade later; don't conflate them. **Ice**: Uranus and Neptune, 1986 and 1989,
Voyager's own closing act. **Storm**: Neptune's Great Dark Spot, 1989, transient, unlike Jupiter's
much older Great Red Spot — keep the two "storm" readings (ancient vs. ephemeral) visually distinct
if both appear. **Dune**: the weakest fit here — the dune-field/dust-storm evidence is Mariner
9/Viking *orbital* imagery of Mars, not a flyby proper; flagged rather than forced.

**This is also where [`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md)'s open question I is answered
by the brief itself**: the new brief collapses the old nine-era ladder to eight and gives this era
sole ownership of "the player physically travels through space," ending at "the world is mapped."
There is no separate flyby era and no separate observatory era in the new numbering — this era must
*own* the flyby years as core content and, per §12, absorb only what the "mapped" end-state still
needs from the Observatory research.

## 9. Black space as a material, not an absence

The brief's own words are the risk: read literally, "BLACK SPACE" could produce exactly the failure
[`ERA-AUDIT.md`](../ERA-AUDIT.md) exists to prevent — a black rectangle, the one plate on the ladder
with no substance. The fix: treat it the way every other era treats its ground, as **the discovery
of a new material — vacuum, distance, radio silence** — each with an attested signature, exactly as
the Rock era's "unlit rock" is drawn, not left empty, because "the real thing already looks exactly
like an absence of light" ([`rock.md`](rock.md) §7).

Four attested textures fill what would otherwise be bare black: **star parallax as a measured
field**, not scenery — this era's stars are what a real optical-navigation frame actually contains
(the kind of frame Morabito was processing when she found Io's plume), and parallaxing visibly
against the player's own motion reads as depth at no extra cost, the scroll already computing it;
**DSN signal-strength texture** (§10) — carrier lock, S/N, Doppler shift — a faint, ever-present
readout in the margin, so the ground is never only black, it is always also *being listened to*;
**cosmic-ray sensor hits** — a genuine artefact of deep-space cameras (a bright pixel or short streak
where a high-energy particle struck the detector), usable as rare, honest "grain," playing the Plate
era's own grain role (**(unverified)** to a specific named frame this session, but a standard,
widely documented artefact); and **the shape-model wireframe** (§1) where the target is irregular —
a faceted mesh assembling over black is, on its own, "substance appearing out of nothing," built
from a real technique rather than an invented effect.

None of this contradicts BLACK SPACE — the ground stays the starkest on the ladder, no paper grain,
no plate emulsion, no engraved rule. But it is black *with instruments running against it*: not
paper, not plaster, not glass — vacuum, radio silence and measurement.

## 10. The three reveal states, in the fraction of a second an orbit lasts

The brief's own arc — **remote sensor target → scanning/telemetry/mapping → a mapped world** — must
fit the same reveal window [`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md) built for every earlier
era: first mark at capture, recognisable by ~90°, substantially complete by ~180–240°. Each stage
has a real mission analogue: **before capture**, a real approach target is a point refined only by
tracking data (§7's "gravity well" row is exactly this state's risk) — a bright point with a small
halo, no disc yet, its size and a hazard-colour rim carrying the read the way the Marble era's "point
in a brightness class" does. **At capture**, a real mission's first product is not a picture but its
first few scan lines — Mariner 4's own history, filling top-down before any feature is legible — the
same structural role the Rock era's first ochre dab plays. **By ~90°**, a body is "recognisable" the
way a Voyager mosaic becomes recognisable, enough tiles arrived to read a whole disc with seams still
visible — the natural moment for a false-colour pass (§2) to make a real named boundary (Io's
sulphur, a comet's jets) legible because colour was added for a stated reason. **By ~180–240°**, a
spherical body's mosaic seams resolve to one clean disc and its colour key completes; an irregular
body's mesh (§1, §9) closes to a full faceted solid — genuine mission end-states, not an arbitrary
bar. **After**, the finished frame gains the Observatory era's furniture (§12) — scale bar, filter
label, credit line — because a mapped world, per the brief's own WORLD → PLACE line, has crossed
from *sensed* to a *place with coordinates*, which is exactly what that furniture states.

Because an arcade orbit is a few seconds of held input, none of this is a slow unveil: each stage
is a *state*, not a *tween* — a small number of frames triggered at a capture-angle threshold, the
same render-side machinery [`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md) already specifies for
every era's "at a glance / under attention" pair, reused rather than reinvented.

## 11. Chart furniture, frame, HUD

Per §9, almost nothing survives from any earlier frame — no cartouche, no double rule, no laid-
paper sheet, no compass rose. In its place: a thin telemetry margin, closer to a terminal window
than a chart border — frame counter, signal strength, range, ticking per §4; a small DSN indicator
(which complex holds contact, a bracket or dish glyph, not a map); and, only once a body is fully
mapped (§10's last stage), the Observatory era's scale bar and filter label — introduced late rather
than present throughout, so their arrival itself signals "this is now a place, not a target."

## 12. What to inherit from the Observatory research, and what not to duplicate

[`observatory.md`](observatory.md) is thorough and partly built (`PLATE_STYLES.modern`), and covers
ground this era's own "mapped" end-state needs — but it describes an **observing** era (a telescope,
Earth-bound, never approaching) where this is a **travelling** one (a spacecraft physically crossing
the gap). The new brief's eight-era ladder has no separate slot for both.

**Inherit**: **true/false-colour rendered bodies** (`renderedSpecimen()`'s shipped albedo/lighting/
weather split) — this era's §10 mapped state should render into the same shipped body painters,
arrived at by a different route (mosaic assembly) rather than a competing system; **the instrument-
margin discipline** (scale bar, filter label, epoch, credit line) — inherit wholesale, placed only
at the *end* of this era's reveal (§11) rather than throughout; **IBM Plex Mono/Space Grotesk**,
already chosen for era VIII's instrument faces.

**Do not duplicate**, per [`DANGERS.md`](../DANGERS.md)'s own warning that adjacent instrument-
grammar eras must never read alike: **the FITS header** — an archival, ground-based observatory
convention (`TELESCOP`, `INSTRUME`) describing a telescope, not a live downlink from something
present at the target; this era's CCSDS-style frame headers (§4) are the correct machine script, so
a player can tell a telescope report from a probe signal without a caption. **The acquisition-cost
currency tax** proposed for era VIII (HST's orbit overhead) — flagged in §6 as a mechanic this era
shouldn't re-run under a new name; DSN contact scheduling is the honest analogue if a twist is
wanted. **The imaged-phenomenon danger register** — [`DANGERS.md`](../DANGERS.md) seats the EHT
black hole, LASCO CME and Parker wind at era VIII specifically because they are photographs of a
field; this era's own dangers (§7) sit one register earlier, plotted rather than imaged, so the rows
don't compete for the same picture.

**Stated as a finding, not a decision this document can make**: under the brief's eight-era count,
this era should own the 1965–1989 flyby material as core content, carrying forward the Observatory
research's rendered-body system and instrument-margin discipline into its own final state, while
leaving the FITS-header grammar, HST-orbit currency twist and imaged-phenomenon dangers to a
register this era should not use if the ladder settles at eight eras with no observing chapter after
this one.

## 13. Four chapter plates

1. **Mariner 4's raster, live** — a scan-line sweep filling a 200×200-style grid over black, still
   part number-grid, a hand-tinted patch appearing where the image is furthest along.
2. **Io's accidental plume** — a navigation frame that develops an anomaly at its limb mid-orbit
   rather than at a scripted beat, echoing how the discovery was actually made.
3. **A Voyager-style mosaic assembling over Uranus or Neptune**, seams visible until the last tile
   locks in, the ring system resolving from an occultation light-curve annotation into a drawn ring.
4. **A shape model closing over an irregular body** — a faceted mesh completing facet by facet
   against pure black, the clearest "the world is mapped" image available, and the one plate here
   with no sphere in it at all.

## 14. Sound

**Signal acquisition** — a short rising two-tone chirp, distinct from the Observatory era's
guide-star chime: carrier lock, not optical guiding. **Scan-line sweep** — a soft, regular tick
advancing under a raster reveal, echoing but not reusing era VIII's FITS-card typewriter cadence.
**Loss of signal** — static rising then cutting to silence, an absence rather than a klaxon, because
a real LOS is exactly that. **Thruster burn** — a short, dry hiss-and-cutoff, distinct from era
VIII's continuous slew-motor whir, since a correction burn is a discrete pulse, not sustained
motion. **Deep hum ambient bed** — a very low, faint carrier tone under everything, the DSN's
continuous listening, playing the Rock era's water-drip ambient role.

## 15. Risks and open questions

- **`NEW-BRIEF.md` does not exist in this repository as checked at the time of writing** (no file of
  that name anywhere on `main` or in history); this document reports its contents as described to
  the author, and that description could not itself be verified against the repo. Treat everything
  attributed to "the brief" above as **(unverified)** against a written source until that file lands.
- **This era's numbering is unresolved and this document does not resolve it.**
  [`KNOWLEDGE-HORIZON.md`](../KNOWLEDGE-HORIZON.md) frames the choice as moving era VIII's opening
  back to ~1965 or adding a tenth Flyby era; the brief as described folds remote sensing through
  mapping into one Era 7 with no observing chapter after it. §12 works from that premise; revisit if
  the era count changes.
- **Almost all hex values in §3 are unverified** beyond the object/image existing as described — a
  real palette pass needs primary imagery, not search summaries.
- **The CCSDS frame (§4) must not be blurred into a claim that Mariner 4 or Viking spoke literal
  CCSDS** — the standard is 1982-onward; only the frame *concept* is borrowed.
- **The dune family's fit to this era is weak** (§8) — its evidence is Mars orbital imagery, not a
  flyby proper; flagged rather than forced.
- **The step-wedge/calibration-target claim (§2) and the cosmic-ray sensor hit (§9)** are both
  general, standard conventions of the era's imaging, not confirmed against a specifically named
  Mariner/Viking/other frame this session — check a primary NSSDCA/PDS frame description before
  either goes into player-facing copy as a specific historical fact.
- **Light-time delay depictions should use period-correct distances** (Mars at encounter,
  Jupiter/Saturn/Uranus/Neptune at flyby distance), not Voyager's present-day interstellar range,
  which belongs to Era 8's own territory, not this one.

## 16. Sources

Every URL below was re-checked this session (search-engine confirmation of the exact path, not
memory); three that could not be found under their originally-drafted path are listed with the
corrected path, and one that could not be found under any path is dropped rather than guessed at.

- https://science.nasa.gov/resource/coloring-the-image-data-in-color/ (Mariner 4 strip chart —
  corrected path; `.../coloring-the-mariner-4-image-data/` 404s)
- https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1964-077A-01 (Mariner 4 camera specs)
- https://astrogeology.usgs.gov/docs/concepts/missions/vik/ (Viking Orbiter Mission, processing —
  corrected path; the `viking-orbiter-data/` sub-page does not resolve)
- https://planetarydata.jpl.nasa.gov/img/data/viking_lander/vl_0001/geom/geominfo.htm (Viking Lander
  reseau/geometric calibration)
- https://arxiv.org/abs/1211.2554 (Morabito, Io volcanism discovery)
- https://www.ebsco.com/research-starters/history/astronomers-discover-rings-uranus (Uranus rings 1977)
- https://www.sciencedirect.com/science/article/pii/0019103589900742 (Voyager radio occultation, rings)
- https://en.wikipedia.org/wiki/Great_Dark_Spot (Neptune's Great Dark Spot)
- https://science.nasa.gov/mission/europa-clipper/europa-exploration-history/ (Europa exploration
  history, Galileo ocean evidence — corrected domain; `europa.nasa.gov` does not resolve this page)
- https://www.nasa.gov/image-article/pluto-dazzles-false-color/ (New Horizons Pluto false colour —
  corrected path; the drafted path had an extra "in-")
- https://www.jpl.nasa.gov/news/rosettas-comet-lander-landed-three-times/ (Philae landing)
- https://www.asteroidmission.org/updated-bennu-shape-model-3d-files/ (Bennu shape model — corrected
  path; `originalbennushapemodelcompare/` does not resolve under any form found this session)
- https://academic.oup.com/mnras/article/438/3/2672/973654 (Eros polyhedral shape model)
- https://deepspace.jpl.nasa.gov/files/810-007/102/810-007-102.pdf (DSN telemetry services)
- https://fprime.jpl.nasa.gov/latest/docs/reference/system-functional/ccsds-protocol/ (CCSDS frame structure)
- https://www.jpl.nasa.gov/news/nasa-mission-update-voyager-2-communications-pause/ (DSN, light-time delay)
- https://www.space.com/688-huygens-probe-returns-images-titan-surface.html (Huygens descent imagery)
- https://science.nasa.gov/photojournal/faq/ (false colour, general explanation)
- https://wearethemutants.com/2020/01/09/unity-precision-thrust-the-nasa-graphics-standards-manual-1975/ (NASA Graphics Standards Manual, Helvetica)
- https://magenta.as/how-one-typeface-landed-on-the-moon-dd31ea17d732 (Futura, Apollo 11 plaque)
- https://ntrs.nasa.gov/api/citations/20170009181/downloads/20170009181.pdf (Voyager's Grand Tour, flyby dates)
