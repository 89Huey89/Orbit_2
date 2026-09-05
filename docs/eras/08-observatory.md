# VIII · The Observatory

**1990– .** The era where the picture stopped being a drawing of the sky and became a *rendering*
of measurements taken from it. **Partly built**: the observatory plate exists in the source as
`PLATE_STYLES.modern`, with rendered bodies, its own sheet and its own chrome, but is not yet
wired into the catalogue and still carries era VI's frame and lettering. See *What is built / What
is not* below.

## The documents

- **Hester & Scowen's Eagle Nebula, "Pillars of Creation"** (Hubble WFPC2, 1 April 1995) made the
  SII/Hα/OIII assignment famous, though the Hubble Heritage Team did not formalise **the Hubble
  palette** as a name for it until the early 2000s — the name postdates this specific exposure by
  several years and belongs to the processing convention, not to it.
- **The 2014 Hubble Pillars** (WFC3/UVIS, visible) and **the 2022 JWST Pillars** (NIRCam,
  near-infrared) — same field, two different false colours, published by ESA/Webb as one slider.
- **EHT M87\*** (2019): an asymmetric bright ring, diameter 42±3 μas, bright-to-faint ratio ~10:1.
  **EHT Sgr A\*** (2022, same campaign): a thicker, only modestly asymmetric ring, diameter
  51.8±2.3 μas. Same family — amber ring on black, dark shadow — but visibly less lopsided; the two
  should never share one drawing.
- **SDO/AIA false-colour EUV imagery**, the **SOHO/LASCO C2/C3 coronagraphs** — the Sun as an
  actively imaged, instrument-annotated object — and **Gaia's all-sky maps**, a smooth density
  field from 1.8 billion sources, not discrete stars.

## The grammar

Light, not line: every body is a lit sphere with a terminator, limb darkening and an atmospheric
rim, nothing hatched. What the earlier file understates: **the grammar is instrumentation, not
illustration.** Every document above carries the same furniture regardless of subject — a scale
bar in arcseconds, a two-arrow N/E compass, a filter label, an epoch, and, where false colour, a
colour bar. This is not decoration, it is the picture's proof — an image without this margin is
not trusted. The credit line belongs to the same discipline ("NASA, ESA, CSA, STScI," often a named
individual credited "Image Processing") — nothing is anonymous, the opposite of a cartouche in
every way except that both exist to say who made this and stand behind it. Absent: hatching, a
horizon, any mythological figure, ornamental borders, hand lettering.

## Palette

Ground `#04060b`, already shipped. Ink cool instrument white shading to cyan, already shipped as
the `modern` tint's light stop.

| Line/swatch | Channel or source | Hex | Confirmed? |
|---|---|---|---|
| Sulphur-II (SII) | red | `#e8482f` | yes |
| Hydrogen-alpha (Hα) | green | `#39c46a` | yes |
| Oxygen-III (OIII) | blue | `#3aa0e8` | yes |
| SDO/AIA 171 Å | gold | `#f5c542` | yes |
| SDO/AIA 304 Å | red | `#ff4a2b` | yes |
| SDO/AIA 193/211/335/131/94 Å | bronze/purple/blue/teal/green | see research §3 | (unverified) |
| EHT ring | amber | `#ff8c3c` | (unverified colormap name) |
| LASCO corona | pale gold-white to warm gold | `#f0e4c8`–`#c9a86a` | yes |

A composited SII-heavy pillar reads gold-bronze, not stoplight red/green — mix toward that amber,
not the primaries the raw channel list suggests.

## Lettering and the hand

The era's exact model is **the FITS header card**: fixed-width 80-character ASCII, `KEYWORD =
value / comment`, no lowercase, no hand in it — a machine wrote it. Confirmed keywords: `SIMPLE`,
`BITPIX`, `NAXIS`/`NAXIS1`/`NAXIS2`, `OBJECT`, `DATE-OBS`, `EXPTIME`, `FILTER`, `TELESCOP`,
`INSTRUME`, `RA`/`DEC`, `EQUINOX` — typeset verbatim, not paraphrased, this era's script in the
same sense hieroglyphs are era I's. The instrument carrying it is a terminal, not a pen: a
**teletype reveal**, whole-glyph by whole-glyph at a constant cadence with a blinking block
cursor, numerals that **tick, not write**, exactly as `LETTERING.md` already specifies. **IBM Plex
Mono** (OFL) is the FITS-card face, cut to the literal ASCII a card uses; **Space Grotesk** (OFL)
sets margin small-caps; JetBrains Mono, Inter and **B612** (OFL/EPL, drawn for Airbus cockpit
displays) stand as alternates. No shaping needed; numerals are lining, tabular figures.

## Names

Almost everything is attested, because the game's mechanics already mirror how an observing run
works.

| Game term | Era's word | Status |
|---|---|---|
| ocean / crater / ringed / ice / dune / volcanic / storm | ocean world / rocky-airless world / gas giant / ice giant / desert world / lava world / hot Jupiter (storm-band giant) | attested (storm mixed) |
| the four pickups | slingshot = `DV ASSIST` reading; no observatory-specific pickup names given | n/a |
| orbit / capture / release | **orbit** (the HST unit itself) / **acquisition** / **slew** | attested |
| currency (ink) | **exposure time** / integration time | attested |
| score | **S/N**, signal-to-noise | attested |
| chapter/sheet | **visit**, HST's own scheduling unit | attested |
| personal best / daily plate | **record integration** / **APOD**, running since 1995 | constructed / attested |
| title "Orbit" / catalogue | stays **orbit** — the title is already this era's currency unit / NGC/IC/Messier/Gaia conventions | attested |

## Currency and the rule

**The currency: telescope time, denominated in orbits.** This is real, not a loose metaphor. HST
orbits Earth every 96 minutes; time is proposed for and awarded in whole and fractional *orbits*,
confirmed across multiple Cycle Calls for Proposals (a typical cycle: ~3,000–3,500 orbits to the
whole world community). A Time Allocation Committee ranks every proposal and only approved ones
fly. An orbit is not 96 minutes of usable sky either: most targets are Earth-occulted part of each
lap, so a "used" orbit typically buys only ~50 minutes of real exposure once guide-star acquisition
is subtracted.

**The rule (class B): the allocation.** Every real HST exposure pays a fixed tax off the top of its
orbit before a photon is collected, win or lose. The one rule this era adds is a **flat acquisition
overhead charged at the start of every transfer, before the distance cost** — a flat 4–6% ink cost
added to every `inkCost()` call, tuned to barely register on a full-chart transfer but meaningfully
tax a nervous short dab. The HUD counts orbits allocated and used. This is a genuine
`simulation.js` change, this era's own B rule in the `ECONOMY` table (DECISIONS.md §2) — the one
place before the Probe where a rule, not only a name, changes. *Deferred:* the research's
"no-twist" reading (rename the currency only) was set aside; it costs zero risk but does not honour
orbits as the era's real mechanism the way the tax does.

## Dangers

Depiction only (option A), the black hole staying exactly where the vortex commit left it:

| Row | Name | Depiction |
|---|---|---|
| Attractor | **The black hole** (EHT ring) | A black disc (the shadow) ringed by a thin, deformed bright arc, visibly brighter on one side (M87\*'s ~10:1 asymmetry), amber on black — not a rainbow accretion disc |
| Repulsor | **CME** (LASCO occulter) | A flat near-black occulting disc, a thin white ring marking the Sun's true edge, pale gold corona outside it, the CME breaking through as leading front / dark cavity / bright trailing core |
| Crosswind | **Solar wind** (Parker spiral) | Thin curved arcs bending outward from a source, pale gold/white, faint density-coloured specks drifting along them — a field, not a figure |
| Obscurer | **Dust lane** | Already shipped in `paintModernBackdrop()`; add only a Lynds-Dark-Nebula-style catalogue caption on the largest one |

M87\* and Sgr A\* are the same family but must not share one drawing: M87\*'s ring is thinner and
more lopsided, Sgr A\*'s thicker and closer to face-on.

## The seven families

Ocean deep blue-white marbled, soft cloud swirl, pale limb haze. Crater high-contrast, low-sun-angle
airless imaging, far crater walls in deep shadow. Ringed soft banded gold-tan, a thin ring casting a
crisp shadow band — the clearest cue this is a sphere. Ice flat, nearly featureless pastel
cyan-blue, minimal banding. Dune ochre-red dust, darker dune fields as texture, hazy limb. Volcanic
sulphur yellow-orange-black patchwork, plumes as hard-edged silhouettes. Storm bright bands, a
luminous Great Red Spot, glowing polar aurorae — genuinely distinct from Ringed's Saturn reference,
which existing prose risks conflating since both are "banded giants." **The shipped code draws only
four-armed diffraction spikes**; a JWST-style six-armed claim needs a second spike routine, not a
retint.

## Frame and furniture

Nothing survives from the engraved frame: no cartouche, no wind-heads, no hand-drawn double rule.
In their place: a scale bar in arcseconds, a two-arrow N/E compass (not a four-point rose), a
filter/wavelength label, an epoch, a colour bar where the image is false colour, and a credit line.
The FITS-card block is the natural home for the HUD's score, ink/orbit and difficulty readouts — a
small stack of monospace `KEYWORD = value / comment` lines down one margin, typewriter-revealed,
with only the values changing (`EXPTIME` counting up, `OBJECT` naming the constellation). The RA/Dec
tick frame the shipped file already carries genuinely does survive — one of the only pieces of era
VI's chrome this era does not have to replace.

## The signature sheet

**Chosen: the Pillars**, in the SII/Hα/OIII grammar of the 1995/2014 Hubble images, amber-teal —
explicitly "the era's signature scene and the one every other narrowband composite is read
against." Later enrichment: Jupiter close, banded and aurorae-lit, after JWST's 2022 NIRCam
imagery, a moon transiting and casting a shadow; a solar scene built from both instruments at
once, an SDO/AIA 304 Å active region and a LASCO-style CME breaking from the limb; a deep field
after JWST's SMACS 0723, thousands of galaxies and a scale bar.

## Sound

A short, clean two-tone chime for guide-star lock (capture), replacing the burin's wet-ink tick; a
single dry mechanical click for the shutter on release; a brief descending electronic whine for CCD
readout under a capture's score gain; a low continuous whir/servo hum for a slew in flight; a
harder, more electronic warning klaxon for safe mode in place of the engraving's descending death
tones; and a soft regular tick under the FITS-card reveal's typewriter cadence.

## What is built

`PLATE_STYLES.modern` (base `night`, `render:'modern'`); per-plate token overrides so bodies keep
true colour; `modernPlate()` with the laid-paper sheet suppressed; `paintModernBackdrop()` —
airglow, galactic band, narrowband nebulae, a graded star field, bloom, four-armed spikes, vignette;
`renderedSpecimen()`'s albedo/lighting/weather split for all seven families and pickups; chapter
plates held to 22% so era VI's engravings read as a faint deep-sky field; the
`data-plate-id="modern"` chrome in `index.html`.

## What is not

Not in `UNLOCKS`; no catalogue selection or unlock condition chosen. Still carries era VI's engraved
frame, wind-heads, compass rose and Fell/Latin lettering — a hybrid that reads better than expected
but is not yet the instrument margin above. The burin primitives are unchanged, so orbit rings and
capture ripples are still engraved. The acquisition tax is unbuilt; no era-specific signature sheet
yet, it borrows era VI's four.

## The prototype

`docs/eras/prototypes/observatory.html` loads IBM Plex Mono and Space Grotesk (both OFL) from a
local `fonts/` folder for a network-free headless rig, and names its tokens exactly as
`definePlate()` would — sensor-black ground, the SII/Hα/OIII triad, EHT amber, a cyan/gold/legend
ink family — matching this file's palette table directly. Painter verdict: _to be recorded in
PROTOTYPES.md_.

## Risk

The FITS-card HUD is a real typographic undertaking, not a small one: it replaces the compass
rose, the magnitude key and arguably the whole margin, and needs a spike to see whether monospace
instrument text reads at normal play size before committing. The acquisition-tax rule is a genuine
simulation change and should not be built ahead of the score-gated era spine landing first. Five of
the seven SDO/AIA hex values above are unverified by reputation only; check `sunpy`'s
`color_tables.py` before locking a final palette.
