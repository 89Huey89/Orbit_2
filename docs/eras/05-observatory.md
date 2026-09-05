# V · The Observatory

**1990– .** The era where the picture stopped being a drawing of the sky and became a
*rendering* of measurements taken from it.

**Partly built.** The observatory plate exists in the source as `PLATE_STYLES.modern`, with
rendered bodies, its own sheet, and its own chrome. It is not yet wired into the catalogue, has
no unlock condition, and still carries era III's frame and lettering. See *What is built* below.

## The documents

- **Narrowband composites** — the "Hubble palette" assigns sulphur-II to red, hydrogen-alpha to
  green and oxygen-III to blue. **These colours are not what the eye would see**; they are a
  deliberate mapping of chemistry onto channels. The era's whole visual identity rests on the
  fact that its images are *false colour by design and say so in the caption*.
- **Diffraction spikes** are an instrument signature: four from the vanes of a Hubble-like
  reflector, six from JWST's hexagonal segments plus vanes. Getting the spike count right is
  the cheapest possible authenticity in the whole ladder.
- **Gaia** (DR2 2018, DR3 2022) — an all-sky map built from more than a billion parallaxes,
  usually shown as an integrated density field rather than as discrete stars.
- **Survey pipelines** — SDSS, Pan-STARRS, Rubin/LSST. Their published images carry a compass
  rose of their own (N and E arrows), a scale bar in arcseconds, a filter set, and a colour bar.

## The grammar

Light, not line. Bodies are **lit spheres**: a terminator, limb darkening, a specular return
where there is something to return it, and an atmospheric rim where there is air. Nothing is
hatched. The sky is not a sheet but a **sensor** — black, with airglow, dust lanes, and stars
carrying the small bloom an optic puts around anything bright.

The chart furniture inverts too: no cartouche, no wind-heads, no engraver's credit. In their
place, an instrument margin — scale bar in arcseconds, N/E orientation arrows, filter set,
epoch, and a colour bar for the false-colour mapping.

## Palette

Ground: near-black with a cold cast (`#04060b`). Ink: a cool instrument white shading to cyan.
Accents in the narrowband assignments — SII red, Hα green-gold, OIII teal. **The bodies keep
their own colour and are not tinted by the plate at all**, which is the point of the era and the
reason `definePlate` learned to take per-plate token overrides.

## Lettering

A grotesque, lining figures, wide tracking, small caps for margin labels. Any OFL grotesque
serves; the game's existing pen can write it once it is embedded and run through
`scripts/glyphs.mjs`.

## Names

Catalogue designations and instrument metadata, set plainly:

- `NGC 3372 · Hα/OIII/SII · 2.4m · 1800s`
- `Gaia DR3 4116423645055496192`
- `RA 10 45 08.9 · Dec −59 41 04`
- `N ↑ E ← · 30″`

## How the seven families are depicted

Rendered spheres, lit from one quarter. The implementation splits the work across the cached
layers the engine already blits:

- **`back`** — the far half of a ring system, and nothing else.
- **`surface`** — the albedo alone: continents, craters, belts, fractures, dunes, basalt. This
  layer **turns**, so nothing on it may imply a light direction.
- **`front`** — the lighting, and it **does not turn**: the falloff away from the sun, limb
  darkening, the crescent on the lit edge, the specular return, the ring shadow, and the
  atmospheric scatter past the limb. This is why the terminator stays where the sun is while the
  world rotates beneath it.
- **`weather`** — cloud decks, scrolled across the body and wrapped.

## Dangers

**The black hole belongs here.** The vortex commit on `main` did not delete it — it moved it to the
century it belongs to and said so: *"The black hole is left unspent for a later, modern plate."* This
is that plate. Lensing, a photon ring and an accretion disc, over the same hazard row VORAGO occupies
on the engraving. **Coronal mass ejection** for the repulsor and **solar wind** for the crosswind.
See [DANGERS.md](DANGERS.md) — under option A this is three drawing functions and three captions, and
could be built now.

## Chapter plates

1. A rendered gas giant close, its moon transiting and casting a shadow on the cloud deck.
2. A narrowband pillar field — the Eagle-nebula grammar, in SII/Hα/OIII.
3. A solar disc in Hα with an active region and a limb prominence.
4. A deep field: nothing but galaxies at every redshift, and a scale bar.

## What is built

- `PLATE_STYLES.modern` in `plates.js` — base `night`, `render:'modern'`, its own transform.
- `definePlate` takes per-plate token overrides, so the plate keeps true-colour bodies.
- `modernPlate()`, and the laid-paper sheet suppressed for it.
- `paintModernBackdrop()` in `backdrop.js` — airglow, galactic band with dust lanes, narrowband
  nebulae, a graded star field, bloom and diffraction spikes on the bright stars, vignette.
- `renderedSpecimen()` in `planets.js` — the albedo/lighting/weather split described above, for
  all seven families and the four pickups.
- Chapter plates held back to 22% on this plate, so era III's engravings read as a faint
  deep-sky field rather than as printed globes.
- `#game[data-plate-id="modern"]` chrome in `index.html`.

## What is not

- Not in `UNLOCKS`; there is no way to select it in the catalogue and no unlock condition chosen.
- Still carries era III's engraved frame, wind-heads, compass rose and Fell/Latin lettering. The
  hybrid reads better than expected — rendered bodies inside the atlas furniture — and is worth
  keeping as a deliberate look, but it is not yet the instrument margin described above.
- The burin primitives are unchanged, so orbit rings and capture ripples are still engraved.
- No era-specific chapter plates; it borrows era III's four.
