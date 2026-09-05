# VII · The Plate

**1887–1958.** The era the figures were abandoned and the sky was photographed instead. The
cheapest full era to build, and possibly the most beautiful: a duotone over the paper plate the
game already has, inverting every convention the ladder has used so far for almost nothing.

## The documents

- **The Carte du Ciel / Astrographic Catalogue** (agreed 1887; 22,000+ plates at twenty matched
  observatories into the 1940s). Before exposure a **réseau** — 27×27 photographically-printed
  grid lines at 5 mm spacing — was printed onto the emulsion, so positions survived whatever the
  emulsion later did. No other document in the ladder carries a machine-ruled lattice baked into
  the picture itself; this grid is the era's fingerprint.
- **E. E. Barnard, *A Photographic Atlas of Selected Regions of the Milky Way*** (negatives
  1889–1905, published 1927, ~700 copies). Shot on the Bruce refractors at Yerkes and Mount
  Wilson, reproduced in photogravure as negatives, uninverted — dark stars on a pale ground, the
  one place that grammar is attested in print, not only on glass.
- **The Palomar Observatory Sky Survey (POSS-I)**, 1949–58, the 48-inch Schmidt: paired
  blue/red-sensitive plates (O/E) per field. **The Franklin-Adams Charts** (1913–14, posthumous),
  206 sections at 15° square, the first photographic atlas of the *whole* sky.
- **The Harvard Plate Stacks** (1880s–1989, 500,000+ plates), the era's labour: the "Harvard
  Computers" annotated plates by hand, **in ink on the glass back**, not the emulsion (correcting
  the earlier file's "on the emulsion," which would have damaged the image). **Argelander's
  *Bonner Durchmusterung*** (1859–62) is folded in as an idea, not a method: not photographic, but
  the moment figures gave way to a grid of numbered dots.

## The grammar

**The negative is the primary document.** A star is a growing knot of black metallic silver on an
otherwise clear pane — brightness becomes literal opacity, not drawn light. Composition is not a
projection of the whole sky but a **grid of rectangular fields**, tiled edge to edge the way
survey plates tile the sky, each its own small negative with its own réseau or fiducial marks.
Figures are entirely gone. What replaces them, in descending order of how much frame they occupy:
the réseau grid, catalogue numbers and fiducial crosses, the plate's own stamped or written
identity, emulsion defects, and ink laid on afterward by a human hand. Every mark is either
physics or bookkeeping — nothing is drawn from imagination or inherited tradition, the sharpest
contrast to every era below it in the ladder.

## Palette

One channel, silver on glass, but not one grey. The ground is the clear emulsion itself,
transparent rather than tinted, and the "gold" is silver, reversed from every earlier plate's
leaf or ochre accent.

| Swatch | Source | Hex |
|---|---|---|
| Clear emulsion (ground) | unexposed silver-gelatin | `#e8e4da` |
| Dense silver (bright star) | fully built-up deposit | `#1a1714` |
| Mid-grey (faint star) | thin deposit | `#8a8378` |
| Sepia print tone | warm toning, older prints | `#5c4530` |
| Cold blue-grey | mid-century print stock | `#5a626b` |
| Blue-sensitive cast | the emulsion's own tint, unprinted | `#c9d6d2` |
| Ink annotation, black | India ink, glass back | `#141210` |
| Ink annotation, red | grease pencil / red flag | `#8a2318` |
| Réseau grid line | printed silver hairline | `#3a3630` |

## Lettering and the hand

**Courier Prime** (SIL OFL 1.1) is the primary numeral and log face, a redrawn descendant of IBM
Courier — this is the one era where the score itself plausibly reads as a typed log entry, so the
HUD's numerals resolve **typed, not stroked**: no `penNib()` build-up, a value replaced whole in
one instant, per `LETTERING.md`'s own suggestion here. **Special Elite** (Apache 2.0, compatible
but not OFL) models a real Smith-Corona machine and is reserved for one dramatic plate-jacket
label, not dense text. **Libre Franklin** (SIL OFL 1.1), an open revival of Franklin Gothic
contemporary with the Carte du Ciel within a decade, sets the printed grotesque — réseau labels and
catalogue margins. The ink-on-glass annotation is not a formal script: the exact Harvard hand is
unverified, so it is written as a single continuous, faster, looser line than era VI's engraving
hand — someone circling a star through a loupe, not composing a caption — with the body's
**develop-in reveal** (a `globalAlpha` ramp, no stroke) standing in for a tray bringing up a print.

## Names

Catalogue designation is the era's whole voice; nothing is invented where a real convention
exists.

| Game term | Era's word | Status |
|---|---|---|
| the seven families | — (distinguished by density/size + a bracketed annotation, not named) | n/a |
| the four pickups | — (no period pickup vocabulary; none individually named) | n/a |
| orbit / capture / release | orbit unnamed; a plate is **exposed**, an object **recovered**; release ends the **exposure** | constructed |
| currency (ink) | **exposure** (time) | attested concept, renamed |
| score | closest equivalent: limiting magnitude reached, or objects catalogued | constructed |
| chapter/sheet | **plate** / **field** | attested |
| personal best / daily plate | no equivalent / **the night's plate** | constructed / attested framing |
| title "Orbit" / catalogue | no equivalent, nearest is **plate** itself / **catalogue**, *durchmusterung* | constructed / attested (German) |

## Currency and the rule

**Currency: EXPOSURE, time on the plate.** Telescope time was rationed by clear, steady nights and,
within a night, by how long a person could hold a guide star on a crosshair without a break —
guiding was manual, so an exposure's real cost was unbroken attention.

**The rule: hold to develop (class A).** A held orbit already pays the game's resource over time
(`INK_ORBIT_GAIN` per second); this era reads that existing clock a second way. On capture a body
appears only as a bare point, and continued holding brings up successive rings of detail —
highlights first, then midtones, then the faint outer wash last, exactly as a tray print develops.
No new number is added to the simulation, only a render-side threshold read off ink-gain progress
already tracked. Overholding risks fogging the body itself, reusing halation rather than adding a
new danger. *Deferred:* the research's "no-twist" reading (rename only) was set aside in favour of
this, since the fit to `INK_ORBIT_GAIN` costs nothing beyond render code.

## Dangers

Depiction only (option A); field, core, reach and lethality are the shared rows, drawn and named
in this era's own hand:

| Row | Name | Depiction |
|---|---|---|
| Attractor | **Emulsion void** | Ragged pale island where silver lifted off the glass — stars simply absent inside its border |
| Repulsor | **Halation** | Soft concentric bloom past an overexposed star's disc, lethal core, decorative outer halo |
| Crosswind | **Tracking drift** | Short parallel comet trails all one way, density fading with distance — a field, not a body |
| Obscurer | **Dark nebula** (Barnard number, e.g. B33) | Star-free patch, soft uneven edge, optionally a hand-written flag |

## The seven families

Every body is an overexposed disc with a soft halo and no internal detail — distinguished by
**size, density, and a bracketed annotation**, never by drawn surface: Ocean a small, dense, round
knot; Crater a knot with a faint double-density edge standing in for relief; Ringed an elongated
oval smear, not a resolved ring; Ice smaller and fainter, near the plate's own fog level; Dune
warm-toned against the sepia base but identical in shape to Ocean; Volcanic the densest, largest
knot, verging on halation without crossing it; Storm elongated like Ringed but with soft internal
banding. No diffraction spikes: the refractors this era's key documents were shot on have no
spider vanes to cause them — a Palomar body (a Schmidt, not a pure refractor) should not inherit
this claim uncritically.

## Frame and furniture

A plain rectangular border — the plate's own physical edge, with an un-exposed margin for writing
— replaces the cartouche. The réseau grid, where present, is ruled straight through the whole
field, not confined to a border. A stamped or written plate-identity block (series letter, running
number, date, exposure length) sits in one corner. The four corner wind-heads drop to plain
fiducial crosses; the compass rose becomes a small printed N/E/S/W if kept at all. The HUD reads as
margin data: exposure as `<n>h <n>m`, score as a growing catalogue number, best as a limiting
magnitude reached.

## The signature sheet

**Chosen: a Carte du Ciel field**, its full réseau grid ruled through the star field, a stamped
plate number and exposure note in the margin — the single most legible "this is definitely a
photographic-astrometric plate" image, and the era's fingerprint in one sheet. Later enrichment: a
Barnard Milky Way field in Sagittarius, negative-style, a hand-inked Barnard number; the Horsehead
(B33) against IC 434 as a 1900s plate first caught it; a plate spoiled by uniform tracking drift,
with a hand-written guiding-failure note.

## Sound

A single mechanical shutter clack opening the exposure, a softer one closing it; a faint tick or
creak from a micrometer screw under a held orbit; a crisp, fast blink-comparator click (about
three a second) for anything comparative; a fine dry scratch, distinct from era VI's wet nib, for
the ink-on-glass reveal; a soft liquid swish for the develop-in; and, for a run-ending failure, a
single sharp crack of glass — darker and more final than the engraving's ink-blot loss.

## The prototype

`docs/eras/prototypes/plate.html` opens on a seeded 1280×800 sheet, loading Courier Prime, Special
Elite and Libre Franklin from a local `fonts/` folder rather than a network the headless rig
cannot reach, and states its one honest compromise up front: no cursive face models the unverified
Harvard hand, so the ink-on-glass annotations are Libre Franklin Italic with per-glyph jitter
(`roundHand()`) rather than a claimed period script. Its token set matches this file's palette
exactly, proof the duotone reasoning above ports cleanly. Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md).

## Risk

Lowest of any unbuilt era. It is a duotone, a grid, a blur and a set of annotations, all over
machinery that already exists — the one open engineering question is whether the near-white,
transparent-ground palette above behaves under the existing duotone colour-transform the way every
other era's tinted ground does, worth a small spike before committing. **Build this one first.**
