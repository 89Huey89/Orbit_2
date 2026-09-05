# Research — VII · The Observatory (1990– )

Deepens `docs/eras/05-observatory.md`, which is correct in its bones and wrong or thin in six
places noted inline below. That file already describes shipped code (`PLATE_STYLES.modern`,
`paintModernBackdrop()`, `renderedSpecimen()`) — this document does not repeat that inventory,
only adds to and corrects the historical/visual claims around it. Numbering follows the ladder in
`OVERVIEW.md`, where this era is row V/VII depending on which list is read; the file itself calls
it "V" and that is kept here.

## 1. The documents

- **Hester & Scowen's Eagle Nebula, "Pillars of Creation"** (Hubble WFPC2, 1 April 1995; STScI/
  NASA archive; three narrowband exposures composited). Made the SII/Hα/OIII assignment famous,
  though the Hubble Heritage Team did not formalise "the Hubble palette" as a name for it until the
  early 2000s — Hester and Scowen's own paper calls it a "chromatic ordering." Correction to the
  existing file: the colours are false and declared as such, but the *name* postdates this image by
  several years and belongs to the processing convention, not to this specific exposure.
- **The 2014 Hubble Pillars** (WFC3/UVIS, visible light) — a wider, sharper repeat with an upgraded
  instrument, still narrowband-to-RGB, showing a protostar only suggested (not resolved) in 1995.
- **The 2022 JWST Pillars** (NIRCam, near-infrared) — same field, a different false colour
  (wavelength-stretched IR, not emission-line chemistry): fewer obscuring dust silhouettes, many
  more embedded protostars glowing through the gas. ESA/Webb publish all three as one slider — the
  clearest "same subject, three passes of the same era" document available.
- **EHT M87\*** (Event Horizon Telescope Collaboration, released 10 April 2019, from 2017 VLBI
  data; *ApJL* 875, L1–L6). An asymmetric bright ring around a dark central depression, diameter
  42±3 μas, bright-to-faint ratio around the ring about 10:1, explained by relativistic beaming of
  plasma orbiting near light speed; the bright arc sits south.
- **EHT Sgr A\*** (released 12 May 2022, same 2017 campaign, reprocessed for the Milky Way's own
  centre; *ApJL* 930, L12–L17). A thick bright ring, diameter 51.8±2.3 μas, only modest asymmetry
  (seen closer to face-on, and the plasma orbits too fast to resolve the beaming pattern), dim
  interior. Same family as M87\* — amber ring on black, dark shadow — but visibly less lopsided; a
  chapter plate should show that difference rather than reuse one drawing for both.
- **SDO/AIA false-colour EUV imagery** (Solar Dynamics Observatory, 2010–) and the **SOHO/LASCO C2/
  C3 coronagraphs** (1995–) — the Sun's other face this era, an actively imaged, falsely coloured,
  instrument-annotated object rather than merely a body among the seven families.
- **Gaia's all-sky maps** (ESA, colour and density maps, first from EDR3 in December 2020, DR3 in
  2022) — built from parallaxes and photometry of upward of 1.8 billion sources, rendered as a
  smooth density field rather than discrete stars; the galactic plane reads as a bright band, the
  Sagittarius dwarf galaxy a faint smear beneath the core.

The era's *grammar* is pulled from the Pillars sequence and the EHT images together: the first
supplies the false-colour-and-says-so discipline and the instrument margin, the second the
"drawn exactly as astronomy actually drew it" standard the whole ladder holds itself to.

## 2. The grammar

Light, not line, exactly as the existing file says — nothing here is hatched, and every body is a
lit sphere with a terminator, limb darkening and an atmospheric rim. What the existing file
under-states: **the grammar is instrumentation, not illustration.** Every document above carries
the same furniture regardless of subject — a scale bar in arcseconds, a compass rose of two arrows
(N and E, not four points), a filter/wavelength label, an epoch, and, where false colour, a colour
bar mapping channel to filter. This is not decoration; it is the picture's *proof* — an image
without this margin is not trusted, and a release that omits it is the exception. The credit line
is part of the same discipline: Hubble images read "NASA, ESA" (sometimes "and the Hubble Heritage
Team (STScI/AURA)"); JWST images read "NASA, ESA, CSA, STScI," often with a named individual
credited "Image Processing." Nothing is anonymous — the opposite of an engraver's cartouche in
every way except that both exist to say who made this and stand behind it.

What is emphatically NOT present: hatching; a horizon or a ground; any mythological figure (the
constellation figures a Hevelius plate draws are entirely absent from a modern sky image — Gaia and
Pan-STARRS chart the same stars with no line between them); ornamental borders; hand lettering. The
one thing every document shares with the engraving it supersedes is *disclosure* — Bayer's plates
say which edition and printer made them, the way a FITS header says which telescope and filter.

## 3. Palette

Ground: `#04060b`, already shipped (`backdrop.js`, `paintModernBackdrop`). Ink: cool instrument
white shading to cyan, also already shipped as the `modern` tint's light stop `[233,242,250]`.

The narrowband ("Hubble palette") assignment, by channel:

| Line | Channel | Approx. hex |
|---|---|---|
| Sulphur-II (SII) | red | `#e8482f` |
| Hydrogen-alpha (Hα) | green | `#39c46a` |
| Oxygen-III (OIII) | blue | `#3aa0e8` |

Composited, an SII-heavy pillar reads gold-bronze rather than pure red or green, because Hα and SII
both register strongly across most of a real emission nebula — "Hubble palette" images of the Eagle
and Carina nebulae look amber and teal, not stoplight primaries; mix toward that amber.

SDO/AIA's false-colour table, one hue per EUV wavelength: 171 Å gold (`#f5c542`, confirmed against
SDO's gallery captions), 304 Å red (confirmed, `#ff4a2b`), 193 Å bronze/brown (`#b98a5e`), 211 Å
purple (`#8a5fc0`), 335 Å blue (`#2a4bb0`), 131 Å teal (`#158a8a`), 94 Å green (`#1f8a5e`). Only
171/304 are directly confirmed; the other five follow the same published table by reputation but
were not independently re-verified this session — check `sunpy`'s `color_tables.py`
(`create_aia_wave_dict`, which derives the ramps from Karel Schrijver's `aia_lct.pro`) before
locking a final palette.

EHT's black hole images use a warm amber-on-black ring, roughly `#ff8c3c` fading to near-black at
the shadow — legibility-driven, not physically meaningful (colormap name unconfirmed this session).

LASCO CME imagery is greyscale-to-gold in public release: pale gold-white corona (`#f0e4c8` to
`#c9a86a`), the occulting disc flat near-black with a thin white ring inked on it marking the Sun's
true photospheric edge — a real, attested convention (§7), not to be invented differently.

Gaia's density map runs black through deep blue to white at the plane's brightest core; its
companion colour map (star colour by temperature) runs blue-white through gold to deep red, closer
to the game's existing body palette and the better one to borrow from for any Gaia-styled layer.

## 4. Lettering and how people wrote

The existing file's "any OFL grotesque serves" is correct but under-specified — this era has a much
more exact model to write from than "a grotesque": **the FITS header.** A FITS file's metadata is a
sequence of fixed-width 80-character ASCII "cards," each an 8-character keyword, `= `, a value, and
an optional `/ comment`, packed into blocks of 2880 bytes with no lowercase in the keyword and no
hand in it at all — a machine wrote it. Confirmed keywords, straight off the FITS reserved-keyword
list: `SIMPLE` (conformance flag), `BITPIX` (bits per pixel / data type), `NAXIS`/`NAXIS1`/`NAXIS2`
(array dimensions), `OBJECT` (target name), `DATE-OBS` (UT of exposure start), `EXPTIME` (exposure
length, seconds), `FILTER`, `TELESCOP`, `INSTRUME`, and — not yet in the file — `RA`/`DEC` (target
coordinates) and `EQUINOX` (the coordinate epoch, conventionally `2000.0`). This is the era's script
in the same sense hieroglyphs are era I's: an exact, attested, fixed-format alphabet, and it should
be typeset verbatim rather than paraphrased.

The instrument carrying it is not a pen at all: it is a **terminal**, and the writing motion is a
teletype reveal — text appears whole-glyph by whole-glyph at a constant cadence with a blinking
block cursor, never a stroked line. `LETTERING.md` already specifies exactly this ("Typewriter (era
V): snap the clip to whole-glyph boundaries... swap `penNib()` for a block cursor that blinks") and
that a chapter's numerals should *update* rather than be written, "like an instrument readout." Both
of those match the FITS-card reveal precisely and need no new design, only the implementation.

Typefaces (all Google Fonts, all SIL Open Font License 1.1, so all embeddable under the project's
no-external-resources rule the same way the Fell faces are):

- **IBM Plex Mono** — the FITS-card face. Monospaced, four weights times italics, part of the wider
  IBM Plex family (Sans/Serif/Mono/Sans Condensed, eight weights, roman and true italic, released
  under OFL). Glyph coverage is broad (Latin, Cyrillic, Greek and more across the family; exact
  per-style count not confirmed this session) — cut it the same way `fonts.mjs` already cuts the
  Fell faces, to the literal ASCII the atlas's FITS cards and catalogue numbers use, which is a
  small subset.
- **JetBrains Mono** — an alternative monospace, designed by Philipp Nurullin and Konstantin
  Bulenkov at JetBrains, OFL, also on Google Fonts; more condensed, ligature-aware, a reasonable
  second choice if Plex Mono reads too soft for the HUD's tabular score.
- **Space Grotesk** — the margin/small-caps face, a proportional grotesque cut from Colophon
  Foundry's fixed-width Space Mono by Florian Karsten (2018), OFL v1.1, on Google Fonts. Reads as
  "instrument label" rather than "body text," which is exactly the job the existing small-caps
  margin captions need.
- **Inter** — a candidate body/UI face if the HUD wants something warmer than Plex Sans; designed
  by Rasmus Andersson (2017) specifically for on-screen legibility at small sizes, OFL, ubiquitous
  on Google Fonts.
- **B612** — genuinely worth naming even though it will likely lose to Plex Mono: designed for
  Airbus aircraft cockpit displays, released open-source by Airbus in 2017 into the Eclipse
  Foundation's PolarSys project. Confirmed dual/triple-licensed (Eclipse Public License v2.0 +
  Eclipse Distribution License v1.0 + SIL Open Font License v1.1), also mirrored on Google Fonts as
  both B612 and a B612 Mono variant. Its whole reason to exist is legibility under exactly the
  conditions this HUD wants — small, high-contrast, glanced-at-speed — and it is the one typeface
  on this list actually drawn for an instrument panel rather than adapted to one.

No shaping is needed: FITS cards, catalogue designations and Latin-script instrument labels are all
one-glyph-per-character, same as the shipped Fell faces. Numerals should be lining, tabular figures
set in the monospace face — not a separate "HUD numeral" face — because a FITS card's `EXPTIME` and
the game's score are typographically the same kind of object: a value in a labelled field.

## 5. Names for the game's things

This era has no constructed language to translate into — its vocabulary is the literal operational
language of telescope time, and that is a gift: almost everything below is attested rather than
invented, because the game's own mechanics were built to mirror how an observing run actually works.

| Game term | Era's word | Gloss | Attested? |
|---|---|---|---|
| ocean (family) | ocean world | a water-bearing body, NASA outreach's own term (Europa, Enceladus) | attested |
| crater (family) | rocky / airless world | a cratered body with no atmosphere to erase impacts | attested |
| ringed (family) | gas giant | standard planetary class | attested |
| ice (family) | ice giant | Uranus/Neptune-type body, volatile-rich mantle | attested |
| dune (family) | desert world | informal but common exoplanet-outreach term for an arid, sand-dominated body | attested (informal) |
| volcanic (family) | lava world | attested exoplanet class (e.g. 55 Cancri e coverage) | attested |
| storm (family) | hot Jupiter / storm-band giant | "hot Jupiter" attested; "storm-band giant" is descriptive, not a term of art | mixed |
| attractor | black hole | M87\*/Sgr A\*, imaged by the EHT | attested |
| repulsor | coronal mass ejection (CME) | SOHO/LASCO's own vocabulary | attested |
| crosswind | solar wind | Parker's term, now standard heliophysics usage | attested |
| nebula/obscurer | dust lane | an extinction feature; cf. the Lynds Dark Nebula (LDN) catalogue | attested |
| orbit | orbit | literally the unit HST time is allocated in — see §6 | attested |
| capture | acquisition | "guide star acquisition" / "target acquisition," standard telescope-ops term | attested |
| release | slew | the telescope slewing from one target to the next | attested |
| ink (currency) | exposure time / integration time | the resource an observer actually spends | attested |
| score | S/N (signal-to-noise) | the real figure of merit an exposure is judged by | attested |
| chapter / sheet | visit | HST's own scheduling unit: a group of exposures on one target | attested |
| the run | observing run | classic astronomical usage, pre-dates space telescopes | attested |
| personal best | record integration | no direct period equivalent | constructed |
| daily plate | Astronomy Picture of the Day (APOD) | NASA/GSFC's own daily-plate institution, running since 1995 | attested |
| catalogue | catalogue | NGC/IC/Messier/Gaia source-ID conventions | attested |
| "Orbit" (title) | orbit | stays exactly itself — the game's title is already this era's currency unit | attested |

The overlap between "orbit" as the game's title and "orbit" as HST's unit of allocated time is not
a coincidence worth manufacturing — it already exists, and §6 below is built entirely around it.

## 6. Currency and one rule

**The currency: telescope time, denominated in orbits.** This is real and specific, not a loose
metaphor. HST orbits Earth every 96 minutes; time on the telescope is proposed for and awarded in
whole and fractional *orbits*, not hours — confirmed across multiple Cycle Calls for Proposals: a
typical cycle offers roughly 3,000–3,500 orbits total to the entire world astronomical community
(Cycle 15: ~3,000 anticipated, up to 1,000 of them reserved for Large/Treasury programs; Cycle 27:
up to 3,400, split 1,700/700/1,000 across Small/Medium/Large-and-Treasury categories; one summary
figure puts a typical cycle at "3,500 orbits (3,100 hours)"). A scientist submits a Phase I proposal
requesting a number of orbits; a Time Allocation Committee (TAC) of working astronomers ranks every
proposal in the cycle and only the ones it approves get scheduled — this is the mechanism, not an
approximation of one. And an orbit is not 96 minutes of usable sky time: most targets are occulted
by the Earth for part of each 96-minute lap (up to about 44 minutes for a target in HST's orbital
plane), so a "used" orbit typically buys on the order of 50 minutes of actual exposure once guide-
star acquisition and other fixed overhead are subtracted — only targets inside the ~24°
Continuous Viewing Zone around the orbital poles get the full 96 minutes.

**That overhead is the twist.** Every real HST exposure pays a fixed tax off the top of its orbit
before a single photon is collected — the minutes spent occulted by the Earth, the minutes spent
re-acquiring guide stars — regardless of how long or short the actual exposure inside it is. Ink
today is spent purely by distance flown (`inkCost(distance)=distance/INK_REACH`); the one rule this
era adds is a **flat acquisition cost charged at the start of every transfer, before the distance
cost**, representing the guide-star lock a real exposure cannot skip. A short hop pays proportionally
more for it than a long one — exactly the real inefficiency that makes short HST exposures
expensive in practice — which nudges the existing tangent-seeking, long-transfer play the game
already rewards (perfect captures, skip bonuses) rather than fighting it. Concretely: something like
a flat 4–6% ink cost added to every `inkCost()` call, independent of `distance`, tuned so it barely
registers on a full-chart transfer but meaningfully taxes a nervous short dab between neighbouring
nodes.

That is a genuine gameplay change to `simulation.js`, not a re-skin, and it is worth being honest
about what that means: it is squarely the same category of decision `DANGERS.md` raises for
`HAZARD_KINDS` — a rule that differs by era stops being cosmetic, and the daily plate, comparable
scores and the ledger all assume one shared rule set. This should be built under whichever of
`DANGERS.md`'s options A/B/C the project actually adopts, not decided unilaterally here.

**The no-twist reading:** rename the currency only. Ink becomes "exposure" or "orbit fraction," full
charge reads `1 ORBIT` instead of a percentage bar, the dry-nib death message becomes something like
`THE ORBIT ENDED` in place of `THE NIB RAN DRY`, and the HUD's readout ticks like the numeral-update
idea in §4 rather than filling a bar. This costs nothing beyond strings, tokens and the FITS-styled
HUD, and is available immediately regardless of how the hazard-rule question above is resolved.

## 7. Dangers

- **Attractor — the black hole.** `DANGERS.md` already places it here and the existing era file is
  right that this is where it belongs. Draw it as the EHT images actually look: a black disc (the
  shadow), ringed by a thin, deformed bright arc that is visibly brighter on one side than the
  other (the ~10:1 asymmetry the M87\* paper reports), in the warm amber-on-black palette of §3 —
  not a rainbow accretion disc, not a flat ring. The asymmetry is free characterisation: it can lean
  toward whichever side the vortex's spin/pull direction already implies.
- **Repulsor — the coronal mass ejection, drawn as its own coronagraph.** The brief's instinct is
  exactly right and attested: a real CME image is not "a sun with a flare," it is a **LASCO
  occulting-disc image** — a flat, near-black disc physically blocking the photosphere (with a thin
  white ring inked onto the disc marking where the Sun's true edge actually is, a real and specific
  convention worth reproducing literally), the pale gold corona visible only outside it, and the
  CME itself a bright three-part structure breaking outward through that corona (a bright leading
  front, a darker cavity, a bright trailing core, per LASCO's own handbook). Drawing MACULA as this
  disc rather than as a sunspot turns the repulsor's own hitbox into the occulter it is haloed by —
  the hazard's "core" is already visually the blocked-out disc.
- **Crosswind — the solar wind, as a field rather than a figure.** Per `DANGERS.md`'s own framing.
  The concrete real-world form is the Parker spiral / heliospheric current sheet, popularly and
  accurately described (NASA's own phrase) as shaped like "a ballerina's skirt" — the sheet warping
  into wavy pleats because the Sun's magnetic axis is tilted from its rotation axis. For a 2D chart,
  the useful piece of that is the **spiral streamline**, not the 3D skirt: thin curved arcs bending
  outward from a source point, in the pale gold/white of the corona, with faint density-coloured
  specks drifting along them — closer to how space-weather forecast visualisations (e.g. the
  WSA-ENLIL model) render the wind than to a literal photograph, since the wind itself is invisible
  and every real image of it is already a model or a proxy.
- **Obscurer — the dust lane, already shipped.** `paintModernBackdrop()`'s dust lanes cut into the
  galactic band are already this danger's correct depiction; the only addition worth making is a
  catalogue-style caption on the largest one, in the spirit of the Lynds Dark Nebula (LDN) catalogue
  — a real, attested naming convention for exactly this kind of feature, and the modern-era
  equivalent of era IV's Barnard numbers.

## 8. The seven families

- **Ocean** — a deep blue-white marbled sphere with soft cloud swirl and a pale haze at the limb, in
  the vein of Cassini/Europa-Clipper-era icy-moon and ocean-world imagery: smooth gradients, no hard
  edges, brightest at the sub-solar point and softening evenly toward the terminator.
- **Crater** — high-contrast, low-sun-angle imaging of an airless body (Lunar Reconnaissance
  Orbiter, MESSENGER, New Horizons' Pluto): raking light throws every crater's far wall into deep
  shadow while its near rim catches full sun, so the terminator carries far more visible texture
  than the sub-solar face does.
- **Ringed** — soft banded gold-tan in natural Cassini-Saturn colour, a thin, sharply defined ring
  system casting a crisp shadow band across the globe — the ring's own shadow is the single most
  legible cue that this is a lit sphere and not a flat disc.
- **Ice** — flat, nearly featureless pastel cyan-blue in the manner of Voyager 2's Uranus/Neptune,
  or JWST's 2022 near-infrared Neptune image, which additionally showed the planet's rings and
  small moons directly (a striking, era-appropriate reference if the "ringed ice giant" case is ever
  drawn). Minimal banding, a soft uniform limb glow rather than a sharp rim.
- **Dune** — ochre-red dust in the vein of Mars orbital imagery (Mars Global Surveyor/HiRISE):
  visible darker dune fields as a texture over a lighter base, and a thin, hazy, dust-scattered limb
  rather than a crisp one.
- **Volcanic** — sulphur yellow-orange-black patchwork after Io (Galileo/New Horizons), active
  plumes as bright, hard-edged silhouettes breaking the limb, and no ice or cloud anywhere on it.
- **Storm** — Jupiter in JWST's 2022 NIRCam infrared imagery: bright bands, a luminous Great Red
  Spot (infrared makes high cloud tops bright rather than red), and glowing aurorae at the poles —
  a striking, attested, and genuinely different look from the ringed family's Saturn reference,
  which existing prose risks conflating since both are "banded giants."

## 9. Chart furniture, frame, HUD

Nothing at all survives from the engraved frame in the era's own documents — no cartouche, no wind-
heads, no double rule drawn by hand. In their place, exactly what §2 describes: a scale bar in
arcseconds, a two-arrow N/E compass (not a four-point rose), a filter/wavelength label, an epoch,
a colour bar where the image is false colour, and a credit line. The existing file already reaches
this conclusion in prose; concretely, the FITS-card block from §4 is the natural home for the HUD's
score, ink/orbit and difficulty readouts — a small stack of monospace `KEYWORD = value / comment`
lines down one margin, typewriter-revealed, with only the values changing over a run (`EXPTIME`
counting up, `OBJECT` naming the current constellation, `FILTER` naming the plate's danger state).
`MAGNITUDINES`, the star-magnitude legend, becomes the colour bar; the compass rose collapses from
four Latin wind names to two plain arrows; the plate-mark and RA/Dec tick frame the existing file
already describes as surviving genuinely does survive, because a modern astronomical image is
routinely gridded in celestial coordinates too — it is one of the only pieces of era III's chrome
this era does not have to replace.

## 10. Four chapter plates

1. **The Pillars**, in the SII/Hα/OIII grammar of the 1995/2014 Hubble images, amber-teal per §3 —
   the era's signature scene and the one every other narrowband composite is read against.
2. **Jupiter close, banded and aurorae-lit**, after JWST's July 2022 NIRCam imagery of the outer
   planets — a moon transiting and casting a shadow on the cloud deck, as the existing file already
   proposes, now grounded in a specific, named, dated document rather than a generic "gas giant."
3. **A solar scene built from both instruments at once** — an SDO/AIA 304 Å active region on the
   disc, and, breaking from behind the limb, a LASCO-style occulting-disc CME per §7's repulsor
   depiction, so the chapter carries its own danger drawn in the same hand as the hazard itself.
4. **A deep field** — thousands of galaxies at every redshift and a scale bar, after JWST's first
   deep field (SMACS 0723, July 2022), which is the single most legible "this is what this era's
   picture-making is for" document available: not a nearby object rendered beautifully, but a
   demonstration of how far the instrument can see at all.

## 11. Sound

- **Guide-star lock** — a short, clean two-tone chime, replacing the burin's wet-ink tick, marking
  an acquisition (capture) the way a real lock-confirmed tone would.
- **Shutter** — a single dry mechanical click for a released exposure (transfer/release), nothing
  sustained.
- **CCD readout** — a brief descending electronic whine or chatter under a capture's score gain, in
  place of the brush-noise accent; readout is real telescope-operations texture, not invented.
- **Slew motor** — a low continuous whir/servo hum while a transfer is in flight, replacing the
  quill-scratch grain the engraving era uses for the same moment.
- **Warning klaxon / safe-mode alarm** — a harder, more electronic tone than era III's descending
  death tones for a lethal hazard contact, evoking a spacecraft entering safe mode rather than a
  ship going down.
- **Telemetry beep** — a soft, regular background tick under the HUD's FITS-card reveal, underscoring
  the typewriter cadence described in §4.

## 12. Risks and open questions

- **The acquisition-tax currency rule is a simulation change, not a cosmetic one.** §6 says this
  plainly: it belongs to the same open question `DANGERS.md` raises for `HAZARD_KINDS`, and should
  not be built ahead of that decision. The "no-twist, rename only" reading is safe today; the tax is
  not.
- **The shipped modern plate draws only four-armed (Hubble-style) diffraction spikes.** The existing
  era file's claim that JWST's six-spike signature belongs to this era is correct as history but not
  yet true of the code — `paintModernBackdrop()`'s bright-star spikes are a single four-armed
  routine. If the era ever wants to read as "JWST-grade" rather than "Hubble-grade" in places, that
  needs a second spike routine, not a retint of the existing one.
- **Five of the seven SDO/AIA hex values in §3 are unverified this session** — 171 Å and 304 Å are
  directly confirmed against SDO's own gallery captions; 193/211/335/131/94 follow the same
  published colour table by reputation but their precise hex was not independently recovered here
  (the search budget for this session was exhausted mid-research). Check `sunpy`'s
  `color_tables.py` directly before locking a final palette.
- **The EHT colormap's exact hex and name are unverified** — the amber-on-black description is
  faithful to every released image but no source naming the specific colour ramp was confirmed this
  session.
- **The FITS-card HUD is a real typographic and layout undertaking**, not a small one — it replaces
  the compass rose, the magnitude key and arguably the whole margin, and needs a spike of its own to
  see whether monospace instrument text reads at the game's normal play distance/size before
  committing.
- **This era shares its danger rows with every other era by the ladder's own rule** (`OVERVIEW.md`
  rule 3) — the repulsor-as-coronagraph idea in §7 is a *depiction*, and must stay one unless and
  until `DANGERS.md`'s option B or C is adopted.

## 13. Sources

- https://aaa.org/2020/06/23/pillars-of-creation-using-the-hubble-palette/
- https://x-bit-astro-imaging.blogspot.com/2023/03/looking-at-hubble-palette.html
- http://hubble.stsci.edu/gallery/behind_the_pictures/meaning_of_color/eagle.php
- https://esawebb.org/images/comparisons/weic2216/
- https://www.stsci.edu/files/live/sites/www/files/home/hst/documentation/_documents/cp-primer/HST_cp_cycle15.pdf
- https://hst-docs.stsci.edu/hsp/past-hst-proposal-opportunities/hubble-space-telescope-call-for-proposals-for-cycle-27
- https://www.astronomy.com/observing/ask-astro-what-causes-the-pattern-of-diffraction-spikes/
- https://www.sciencefocus.com/space/diffraction-spikes-jwst
- https://fits.gsfc.nasa.gov/users_guide/users_guide/node22.html
- https://cdn.diffractionlimited.com/help/maximdl/FITS_File_Header_Definitions.htm
- https://arxiv.org/abs/1906.11238
- https://aasnova.org/2019/04/10/first-images-of-a-black-hole-from-the-event-horizon-telescope/
- https://ui.adsabs.harvard.edu/abs/2022ApJ...930L..12E/abstract
- https://cosmoquest.org/x/dailyspace/2022/05/13/event-horizon-telescope-releases-first-image-of-sgr-a/
- https://lasco-www.nrl.navy.mil/handbook/hndbk_3.html
- https://sci.esa.int/web/soho/-/47806-lasco-c2-image-of-a-cme
- https://sci.esa.int/web/gaia/-/the-density-of-stars-from-gaia-s-early-data-release-3
- https://en.wikipedia.org/wiki/Aladin_Sky_Atlas
- https://github.com/SAOImageDS9/SAOImageDS9
- https://www.nasa.gov/image-article/heliospheric-current-sheet/
- https://esahubble.org/copyright/
- https://www.nasaspaceflight.com/2022/07/webb-first-images/
- https://svs.gsfc.nasa.gov/31271
- https://fonts.google.com/specimen/IBM%2BPlex%2BMono
- https://fonts.google.com/specimen/IBM%2BPlex%2BSans
- https://github.com/IBM/plex
- https://www.jetbrains.com/lp/mono/
- https://fonts.google.com/specimen/Space%2BGrotesk
- https://github.com/floriankarsten/space-grotesk
- https://fonts.google.com/specimen/B612
- https://imjustcreative.com/b612-open-source-font-family/2019/01/25
- https://github.com/polarsys/b612
- https://www.gemini.edu/observing/phase-i/too
- https://www.eso.org/sci/observing/policies/too_policy.html
- https://jwst-docs.stsci.edu/methods-and-roadmaps/jwst-target-of-opportunity-observations
- https://beltoforion.de/en/astrophotography/stacking.php
- https://www.celestron.com/blogs/knowledgebase/the-ultimate-guide-to-calibration-frames-for-astrophotography
