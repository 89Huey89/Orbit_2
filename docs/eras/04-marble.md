# IV · The Marble

**Greco-Roman, c. 300 BCE – 150 CE, with a Carolingian afterlife to c. 816 CE.** The sky stopped
being paint on a page and became a shadow cut into stone — no colour, no stars on its own central
document, a coordinate grid of engraved circles standing in for both.

## The documents

- **The Farnese Atlas** (Naples, MANN, inv. 6374) — a 2nd-c. CE Roman marble copy of a lost
  Hellenistic original, a kneeling Titan shouldering a 65 cm globe, 41–42 of the 48 classical
  constellations in low relief crossed by engraved great circles (equator, tropics, colures,
  ecliptic), the sphere's only coordinate system. **No stars at all** — never given any. The
  document this era's grammar is pulled from; a hard constraint on the whole era.
- **The Antikythera mechanism**, c. 150–100 BCE — a geared bronze calculator whose covers carry a
  parapegma down to 1.2 mm, legible only under raking light and CT, the source for tiny bronze
  lettering.
- **The Mainz Globe**, one of only three complete ancient celestial globes, bronze/silver, Roman,
  c. 150–220 CE — the era's only attested example of stars actually marked (dimensions/inlay
  unverified).
- **Aratus's *Phaenomena*** and **Ptolemy's *Almagest*** — text, not image; used only for §Names
  and the magnitude scale, never grammar, the caution this era was originally deferred over.
- **The Leiden Aratea** (c. 816 CE, Carolingian), 39 full-page miniatures, among the first
  surviving *pictures* rather than reliefs of these figures — the bridge toward era V's page.

**Why it's on the ladder after all.** `OVERVIEW.md` deferred this era because the *Almagest* is
textual and shares a constellation tradition with the eras now numbered V and VI (Globe and
Engraving). True, but sharing a *tradition* — everyone agreeing which figure is Orion — is not
sharing a *grammar*: unpainted relief, no stars, circles as the only coordinate marks, overlaps
neither the globe's colour nor the engraving's cross-hatching. It duplicates content, as every era
after the first must, but no neighbour's look.

## The grammar

Three grammars, since the surviving media never overlap: **stone relief** (Farnese), **engraved
metal** (Mainz, Antikythera), **painted parchment** (the Aratea). The core identity is the first —
modelling by light and shadow on an unpainted surface, with no stars: a figure is a raised contour
cut by chisel and drill, its volume read entirely by how relief catches raking light, no line, only
the edge where cut stone meets shadow. The sphere's only marks are compass-drawn great circles; no
frame, no register bands, no ground/sky split. Metal supplies fine incised line and, on Mainz, the
only attested stars. No object shows figures, stars and colour together; the one invention here is
**figures and circles from the marble, stars from the bronze**, done openly.

## Palette

Two grounds, not blended: unpainted stone, and the Aratea's purple-to-blue parchment with gold.

| Swatch | Hex | Role |
|---|---|---|
| Pentelic/Carrara white | `#EDE6D6` | ground |
| Deep relief shadow | `#4A463E` | "ink" — the only dark stone has |
| Weathered ochre patina | `#C9A66B` | age/wear accent |
| Bronze, unpolished | `#6B5A3E` | metal ground |
| Verdigris (shipped plate name) | `#5B8A72` | metal accent/age |
| Struck silver | `#C7C4B8` | this era's metal "gold" |
| Tyrian purple | `#4B2E52` | Aratea ground |
| Gold leaf | `#D4AF37` | true gold, Aratea only |
| Lamp-black / iron-gall | `#2A2620` | ink, manuscript half only |

## Lettering and the hand

Two scripts, both left-to-right — a contrast with era V's Arabic, a saving for the reveal engine,
which already assumes LTR. **Greek epigraphic capitals**, cut from ruled guidelines with point and
chisel (no brush underdrawing attested), carry anything "spoken" by the sculpture. **Roman square
capitals**, the Trajan's Column hand, are cut in a two-stage motion (Catich's rubbing studies): a
flat brush paints the letterform, then a mason cuts a V-section groove along the guide — the same
"wet lead, then commit" motion `penLettering()` performs for era I, the flood step becoming the
V-cut's shadow; the reveal is the brush pass preceding and overshooting the chisel. Numerals: Roman
for chapter/row/rank only, exactly as shipped; the score sets in plain digits. No shaping pipeline
needed — one glyph per codepoint, no joining, in either script.

| Face | Use | Licence |
|---|---|---|
| Cinzel | Roman capitals — HUD, titles, frame | OFL 1.1 |
| GFS Didot | Greek display capitals | OFL, GFS |
| GFS Porson | Greek body text, polytonic accents | OFL, GFS |

Trajan itself is commercial and unusable by name; Cinzel is its free substitute.

## Names

Attested unless marked constructed; Greek given first, Latin where the game already ships Latin.

| Game term | Era's word | Gloss | Status |
|---|---|---|---|
| ocean / crater | Ὠκεανός / κρατήρ | Titan-river / mixing-bowl | attested |
| ringed / ice | στεφάνη / κρύσταλλος | circlet-band / ice, rock-crystal | constructed / attested |
| dune / volcanic | θίς-θῖνες / Ἡφαίστου | sand-ridge / "of Hephaestus" | attested / constructed |
| storm / slingshot | θύελλα / σφενδόνη | whirlwind / a sling | attested |
| shield / reflector / inkwell | Scutum / Repulsa / atramentarium | shipped / shipped / ink-pot | unchanged / attested |
| orbit / capture / release | κύκλος / captura / ἄφεσις | circle / seizing / letting-go | attested/constructed/attested |
| ink (currency) | *acies* | a cutting edge | constructed, see below |
| score / chapter | ἀριθμός / *tabula* | number / tablet | attested / shipped |
| best / daily / title | ἄριστον / *Tabula diei* / *orbita* | "the best" / day's tablet / wheel-rut | constructed / shipped / attested |

## Currency and the rule

Rename `ink` to **the edge** (*acies*), same 0–1 gauge, spent by distance flown — a correction, not
dressing. "Ink" presumes a stylus-and-fluid medium; this era's grammar is subtractive, stone or
metal cut away, nothing added. A depleting chisel-edge, dulling with use and restored by pausing to
hone it (the existing orbit-hold gain mechanic), is the era's real rationed resource. Class A: no
simulation change, a rename and a redraw.

*Deferred:* the six-class Ptolemaic *megethos* scale (`α′ β′ γ′ δ′ ε′ ϛ′`) on main nodes — brighter
pays more but shrinks `rimWindow` — held back as class-B under DECISIONS.md §2.

## Dangers

Depiction only, same four rows, this era's name and image over each.

| Danger | Name | Depiction |
|---|---|---|
| Attractor | Charybdis | a deep drilled spiral, running-drill undercut hair, tightening toward a punched centre |
| Repulsor | *Hēliou harma* | a radiate solar disc, a falling chariot-wheel motif — not *Phaethōn*, which also names Jupiter |
| Crosswind | the Anemoi | winged wind-figures per the Tower of the Winds (Athens, c. 50 BCE), likely but *(unverified)* ancestor of the engraving era's own wind-heads |
| Obscurer | *galaxias* | the Milky Way as Hera's spilled milk, a soft diffuse band — the ancient name is also the modern one |

## The seven families

Modelled by relief and drill-work, never colour or line. Ocean: a broad unbroken dome, polished
smooth, a faint burnished highlight only. Crater: rasped point-chisel stipple, deep drill punctures
pooling hard shadow. Ringed: concentric bands cut by flat chisel and compass, the technique that
cuts the globe's own celestial circles. Ice: smooth and burnished, fine comb-line facets; Dune
shares its claw-chisel stroke but left ridged, unsmoothed. Volcanic: broken rustic-finish stone,
deep undercut drill-work for vents. Storm: the most heavily drilled family, Roman curled-hair
channels for a turbulent, light-swallowing texture with no single edge.

## Frame and furniture

The Farnese globe carries no border, cartouche or colophon — its only marks are the circles giving
it a coordinate system, so the frame becomes the circles. The shipped RA-hour/declination ticks
re-skin as the globe's own equator/tropic/colure/ecliptic lines; corner wind-heads become the
Anemoi; HUD readouts move to a *tabula ansata*, the winged tablet Roman inscriptions were framed
in; a colophon credit can use **FECIT** ("made this"), matching the shipped game's Latin names.

## The signature sheet

First build: **the Farnese Atlas globe, close** — a figure crossing an engraved circle, drill-worked
shadow standing in for a constellation's line, lit by one raking light. Later enrichment adds the
other three: the Antikythera mechanism opened; the Mainz globe on its sundial gnomon, the chapter
that finally shows stars; a Leiden Aratea opening, gold-point stars, the bridge forward to era V.

## Sound

A dry mallet-on-chisel tap for capture, a fine abrasive hiss for an orbit held, a stone-dust scrape
for release, a second higher harmonic joining the tap for a perfect transfer, a single low crack
with no ringing tail for a loss — stone doesn't sustain the shipped descending tones.

## The prototype

`docs/eras/prototypes/marble.html` is built as marble relief throughout — white/grey ground modelled
by raking light, no outline anywhere, as the Farnese globe is cut — with every star mark carried
instead by gilded drilled-and-inlaid points standing in for the Mainz bronze. Its header records
choices made where research offered options: the repulsor captioned *Hēliou harma*, not *Phaethōn*
(also Jupiter's Greek name); the crosswind Βορέας over Ζέφυρος; the constellation drawn is Λύρα,
both attested and the game's own "THE LYRE." Fonts are Cinzel and GFS Didot, awaited via
`document.fonts.ready` before first paint — GFS Didot alone covers both the epigraphic capitals and
Ptolemy's magnitude ranks, so no second Greek face is used.

Painter verdict: _to be recorded in PROTOTYPES.md_.

## Risk

The three-grammar problem is unresolved: no object gives figures, stars and colour together, so the
plate composites marble, the bronze globes and the Aratea — spike one test node early to see
whether marble-relief and manuscript-gold read as one plate, or whether the era needs two variants
as night/paper split the engraving. The Farnese globe's total absence of stars is the sharpest
engine mismatch here and should probably become the plate's own reveal, stars appearing only as
drilled points cut *through* the relief at capture. Schaefer's 2005 claim that the Farnese figures
encode Hipparchus's lost catalogue is disputed and unproven. The Mainz globe's exact dimensions and
the Kugel Globe throughout are (unverified), as is the Tower of the Winds lineage to the engraving
era's corner wind-heads. Greek shaping is cheap next to era V's Arabic, but its polytonic accent
set still adds real inventory to `glyphs.mjs`.
