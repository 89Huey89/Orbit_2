# IV · The Marble

**Greco-Roman, c. 300 BCE – 150 CE, with a Carolingian afterlife to c. 816 CE.** The sky stopped
being a page's paint and became a shadow cut into stone — no colour, no stars on its own central
document, and a coordinate grid of engraved circles standing in for both.

## The documents

- **The Farnese Atlas** (Naples, MANN, inv. 6374) — a 2nd-c. CE Roman marble copy of a lost
  Hellenistic original, a kneeling Titan shouldering a 65 cm globe. The document this era's grammar
  is pulled from: 41–42 of the 48 classical constellations in low relief, crossed by engraved great
  circles (equator, tropics, colures, ecliptic), the sphere's only coordinate system. **No stars at
  all** — never given any, not faded or lost. A hard constraint on the whole era.
- **The Antikythera mechanism**, c. 150–100 BCE — a geared bronze calculator whose covers carry the
  era's densest surviving Greek lettering, a parapegma down to 1.2 mm, legible today only under
  raking light and CT — the source for how tiny worked bronze lettering should look.
- **The Mainz Globe**, one of only three complete ancient celestial globes. Bronze/silver, Roman,
  c. 150–220 CE, showing all 48 constellations and the earliest known full Milky Way on a globe —
  the era's only attested example of stars actually marked. Dimensions and inlay (unverified).
- **Aratus's *Phaenomena*** and **Ptolemy's *Almagest*** — text, not image; used only for §Names
  and the magnitude scale, never grammar, the caution this era was originally deferred over.
- **The Leiden Aratea** (c. 816 CE, Carolingian) — a copy of Germanicus's Latin Aratus, 39
  full-page miniatures, among the first surviving *pictures* rather than reliefs of these figures.
  Not this era's own century, but its afterlife: the bridge toward era V's page.

**Why this era is on the ladder after all.** `OVERVIEW.md` deferred it because the *Almagest* is
textual and "the constellation tradition it fixes is the one era II and era III both already
inherit." The first holds, and the *Almagest* stays out of the grammar entirely here. The second
undersells the case: sharing a constellation *tradition* — everyone agreeing which figure is Orion
— is not sharing a *grammar*. Unpainted relief modelled by chisel-cut shadow, circles as the only
coordinate marks, no stars on the primary document, overlaps neither the globe era's gold-on-paper
colour nor the engraving's cross-hatching. It duplicates a neighbour's content, as every era after
the first must, but no neighbour's look.

## The grammar

Three grammars, because the surviving media never overlap: **stone relief** (Farnese), **engraved
metal** (Mainz, Antikythera), **painted parchment** (the Aratea). The core identity is the first —
modelling by light and shadow on an unpainted surface, with no stars. A figure is a raised contour
cut by point-chisel, claw-chisel and drill, its volume read entirely by how the relief catches
raking light: no line, only the edge where cut stone meets its own shadow. The sphere carries the
only non-figural marks — a handful of compass-drawn great circles. Composition is a sphere, not a
page: no frame, no register bands, no ground/sky split. The engraved-metal grammar supplies fine
incised line and, on the Mainz globe, the era's only attested stars. No Greco-Roman object shows
figures, stars and colour together; this era's one necessary invention is building across that
seam — **figures and circles from the marble, stars from the bronze** — done openly.

## Palette

Two grounds, deliberately not blended: unpainted stone, and the Aratea's purple-to-blue parchment
with gold. No source claims the Farnese globe itself carried paint.

| Swatch | Hex | Role |
|---|---|---|
| Pentelic/Carrara white | `#EDE6D6` | ground |
| Deep relief shadow | `#4A463E` | "ink" — the only dark stone has |
| Weathered ochre patina | `#C9A66B` | age/wear accent |
| Bronze, unpolished | `#6B5A3E` | metal ground |
| Verdigris (already a shipped plate name) | `#5B8A72` | metal accent/age |
| Struck silver | `#C7C4B8` | this era's metal "gold" |
| Tyrian purple | `#4B2E52` | Aratea ground |
| Gold leaf | `#D4AF37` | this era's true gold, Aratea only |
| Lamp-black / iron-gall | `#2A2620` | written ink, manuscript half only |

## Lettering and the hand

Two scripts, both left-to-right — a real contrast with era V's right-to-left Arabic, and a saving
for the reveal engine, which already assumes LTR. **Greek epigraphic capitals**, cut straight from
ruled guidelines with point and chisel, no brush underdrawing attested, carry anything "spoken" by
the sculpture and the tiny Antikythera inscriptions. **Roman square capitals**, the Trajan's Column
hand, are cut in a genuine two-stage motion per Catich's rubbing studies: a flat chisel-edged brush
paints the letterform first, then a mason cuts a V-section groove along the painted guide — the
same "wet lead, then commit" motion `penLettering()` already performs for era I's outline-then-flood
hand, the flood step becoming the V-cut's shadow gradient. Reveal motion: brush pass visibly
precedes and overshoots the chisel pass. Numerals: Roman for chapter/row/rank only, exactly as
shipped (`numerals=['I','II','III','IV']`, `src/plates.js`); the score itself sets in plain digits,
unreadable in Roman numerals at five figures. No shaping pipeline is needed — one glyph per
codepoint, no joining, in either script.

| Face | Use | Licence |
|---|---|---|
| Cinzel | Roman capitals — HUD, titles, frame | OFL 1.1 |
| GFS Didot | Greek display capitals | OFL, GFS |
| GFS Porson | Greek body text, full polytonic accents | OFL, GFS |

Trajan itself is commercial and must not be used or imitated by name; Cinzel is its free
substitute.

## Names

Attested unless marked constructed; Greek given first, Latin where the game already ships Latin.

| Game term | Era's word | Gloss | Status |
|---|---|---|---|
| ocean | Ὠκεανός (*Okeanos*) | the Titan/river encircling the world | attested |
| crater | κρατήρ (*kratēr*) | mixing-bowl | attested |
| ringed | στεφάνη (*stephanē*) | circlet, wreath-band | constructed (rings unknown to antiquity) |
| ice | κρύσταλλος (*krystallos*) | ice, also rock-crystal | attested |
| dune | θίς / θῖνες (*this/thines*) | sand-ridge (Homeric) | attested |
| volcanic | Ἡφαίστου (*Hēphaistou*) | "of Hephaestus," the forge under Etna | constructed epithet |
| storm | θύελλα (*thuella*) | whirlwind (Homeric) | attested |
| slingshot | σφενδόνη (*sphendonē*) | a sling | attested |
| shield / reflector | Scutum / Repulsa | shield / a repulse | shipped already, unchanged |
| inkwell | atramentarium | ink-pot | attested |
| orbit / capture / release | κύκλος / captura / ἄφεσις | circle / a seizing / a letting-go | attested / constructed / attested |
| ink (currency) | *acies* | a cutting edge | constructed rename, see below |
| score / chapter / best | ἀριθμός / *tabula* / ἄριστον | number / tablet (shipped) / "the best" | attested / shipped / constructed |
| daily plate / title | *Tabula diei* / *orbita* | "tablet of the day" (shipped) / wheel-rut | shipped / attested, anachronistic |

## Currency and the rule

Rename `ink` to **the edge** (*acies*), same 0–1 gauge, spent by distance flown, restored the same
ways — a correction, not just dressing. "Ink" presumes a stylus-and-fluid medium; this era's
grammar is subtractive, stone or metal cut away, nothing added. A depleting chisel-edge, dulling
with use and restored by pausing to hone it (the existing orbit-hold gain mechanic), is the era's
real rationed resource — carving was metered by tool wear and stamina, not a poured fluid. Class A:
no simulation change, a rename and a redraw.

*Deferred:* the six-class Ptolemaic *megethos* scale (`α′ β′ γ′ δ′ ε′ ϛ′`) given to main nodes
themselves — a brighter node pays more but shrinks `rimWindow`, a narrower perfect window, Ptolemy's
own idea. Held back as a gameplay-parameter change under DECISIONS.md §2's class-B caution.

## Dangers

Depiction only, same four rows, this era's name and image over each.

| Danger | Name | Depiction |
|---|---|---|
| Attractor | Charybdis | a deep drilled spiral, the running-drill technique for undercut hair, tightening toward a punched centre |
| Repulsor | Phaethon's fall (*Hēliou harma*) | a radiate solar disc, a falling chariot-wheel motif at its rim — captioned *Hēliou harma* since *Phaethōn* alone is also the attested Greek name for Jupiter |
| Crosswind | the Anemoi | winged wind-figures per the Tower of the Winds (Athens, c. 50 BCE) — likely but *(unverified)* ancestor of the engraving era's own corner wind-heads |
| Obscurer | *galaxias* | the Milky Way as Hera's spilled milk, a soft diffuse band — the era's own name is also the modern one |

## The seven families

Modelled by relief and drill-work, never colour or line — the rule that must hold across all seven.
Ocean: a broad unbroken low dome, polished smooth, a faint burnished highlight only. Crater: rasped
point-chisel stipple with deep running-drill punctures pooling hard shadow. Ringed: concentric
low-relief bands cut by flat chisel and compass, the same technique that cuts the globe's own
celestial circles. Ice: smooth and burnished with fine comb-line facets; Dune shares its claw-chisel
stroke but left ridged and unsmoothed. Volcanic: broken rustic-finish stone, deep undercut
drill-work for vents. Storm: the most heavily drilled family, borrowing Roman drill-worked curled
hair for a turbulent, light-swallowing texture with no single edge.

## Frame and furniture

The Farnese globe carries no border, cartouche or colophon — its only non-figural marks are the
circles that give it a coordinate system at all. That is this era's frame: the frame becomes the
circles. The shipped RA-hour/declination ticks re-skin almost without translation as the globe's
own equator/tropic/colure/ecliptic lines. Corner wind-heads become the Anemoi (see Dangers). HUD
readouts move to a *tabula ansata*, the winged tablet Roman inscriptions were framed in; a colophon
credit can use **FECIT** ("made this"), matching the shipped game's habit of Latin unlock names.

## The signature sheet

First build: **the Farnese Atlas globe, close** — a figure crossing an engraved circle, drill-worked
shadow standing in for a constellation's line, lit by one raking light. Later enrichment adds the
other three: the Antikythera mechanism opened, its parapegma picked out by raking light; the Mainz
globe on its sundial gnomon, the chapter that finally shows stars; a Leiden Aratea opening,
purple-to-blue ground, gold-point stars, the bridge forward to era V.

## Sound

A dry mallet-on-chisel tap for capture, a fine abrasive hiss for an orbit held, a stone-dust scrape
for release, a second higher harmonic joining the tap for a perfect transfer, a single low crack
with no ringing tail for a loss — stone doesn't sustain the way the shipped descending tones do.

## The prototype

`docs/eras/prototypes/marble.html` is built as marble relief throughout — a white/grey ground
modelled by raking light, no outline anywhere, exactly as the Farnese globe is cut — with every
star mark instead carried by gilded drilled-and-inlaid points standing in for the Mainz bronze's
grammar, gilded rather than silvered to read against white stone. Its header records the choices
made where research offered options: the repulsor captioned *Hēliou harma* over *Phaethōn* to avoid
the Jupiter collision; the crosswind Βορέας over Ζέφυρος as the default named wind; the
constellation drawn is Λύρα, both attested and the game's own "THE LYRE"; corner wind-heads drawn as
the Anemoi. Fonts are Cinzel and GFS Didot, loaded locally and awaited via `document.fonts.ready`
before first paint; GFS Didot alone was found to cover both the epigraphic capitals and Ptolemy's
lowercase-with-keraia magnitude ranks, so no second Greek face was needed.

Painter verdict: _to be recorded in PROTOTYPES.md_.

## Risk

The three-grammar problem is real and unresolved: no single object gives figures, stars and colour
together, so the plate composites marble, the bronze globes and the Aratea — spike one test node
early to see whether marble-relief and manuscript-gold read as one plate, or whether this era needs
two variants the way night/paper split the engraving. The Farnese globe's total absence of stars is
the sharpest engine mismatch in the ladder and should probably become the plate's own reveal — stars
appearing only as drilled points cut *through* the relief at capture. Schaefer's 2005 claim that the
Farnese figures encode Hipparchus's lost catalogue is disputed and unproven. The Mainz globe's exact
dimensions and inlay, and the Kugel Globe throughout, are (unverified). The wind-head lineage to the
engraving era's corner wind-heads is plausible but not traced to a confirmed source (unverified).
Greek shaping is cheap next to era V's Arabic, but the polytonic accent set still adds real
inventory to `glyphs.mjs`.
