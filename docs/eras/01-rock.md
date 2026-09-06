# I · The Rock

**Franco-Cantabrian Europe, c. 40,000–3,000 BCE (centred on Lascaux's Hall of the Bulls, c. 17,000 BCE).** The sky before there was a sky to draw: marks on a cave wall or scored bone, by people who left no writing and, on the best evidence, no confirmed astronomy at all until one uncontested solstice alignment closes the era.

## The documents

- **Lascaux, the Hall of the Bulls** — four monumental aurochs, no frame, no ground line; one
  bull carries a six-dot cluster, controversially read as the Pleiades.
- **Lascaux, the Shaft Scene** — a disembowelled bison, a fallen bird-headed man, a bird on a
  staff; controversially read as the Summer Triangle.
- **Chauvet, the Panel of Hand Dots** — red-ochre hand stencils and dot clusters, palm-loaded and
  pressed, not blown: the era's clearest attested mark-making.
- **El Castillo** — a red disc and hand stencil, uranium-series dated to a minimum
  40,800/37,290 years, the era's oldest secured mark-making.
- **Newgrange and Knowth**, c. 3200 BCE — pecked kerbstone spirals; Newgrange's roofbox is
  genuinely aligned to winter-solstice sunrise, the era's one uncontested astronomical fact.

## The grammar

There is no chart. A cave wall is found, not laid out: painters worked the rock's own bulges and hollows, giving figures modelled relief without a shaded stroke. No ground line, no horizon, no coordinate system — figures float and overlap at whatever scale the rock demands, and major panels are genuinely overpainted across centuries, a real palimpsest. Three registers of mark stay distinct: painted figures (animals, never constellation-figures), engraved lines, and non-figurative marks (dots, stencils, flutings, Lascaux's ~50 unread signs). The megalithic close layers pecked relief on exposed stone under open sky, a ring around a threshold rather than a picture on a wall.

## Palette

| Material | Hex | Role |
|---|---|---|
| Red ochre (haematite) | `#9C3B22` | the era's most reserved colour — its nearest "gold" |
| Yellow ochre | `#C9962E` | softer, more common secondary fill |
| Manganese black | `#211F1E` | cooler, blue-black line |
| Charcoal black | `#2C2622` | warmer line — chosen per panel, never mixed with manganese |
| Kaolin white | `#EAE1CF` | rarest pigment, sparing highlight |
| Torchlit limestone, Lascaux | `#C7BC9E` | this era's chosen ground |
| Torchlit limestone, Chauvet | `#D6D0BF` | named but not mixed with Lascaux's |
| Kerbstone (Newgrange) | `#A9A79C` | unpainted, reads by pecked shadow |

There is no gold — the reddest ochre stands in, used as sparingly. Black (charcoal or manganese, never both on one panel) is the era's ink.

## Lettering and the hand

No script survives. What stood in for one: dots palm-loaded with wet ochre and pressed repeatedly, no stroke or leading edge; hand stencils, pigment blown around a hand held flat; positive handprints, the opposite gesture; and engraved burin tallies (Abri Blanchard, Ishango, Lebombo), one incision per unit. `writeText()`/`penLettering()` assume a stroke order this era lacks, so the reveal uses three primitives instead: a **dab** (opacity ramps in, no direction), a **stencil bloom** (a silhouette fades from the outside in), and a **burin tally** (one stroke per unit, left to right). None needs a glyph outline. No OFL face is loaded — commercial "petroglyph" novelty faces are rejected outright, both not-OFL and the same fantasy-rune move this era's script-lessness should refuse.

## Names

No word survives; the table swaps "the era's word" for "the era's mark" — attested where the motif itself is, constructed where the meaning is (almost always).

| Game term | The era's mark | Status |
|---|---|---|
| A star | a dab of ochre, in one of three sizes for the three brightnesses a naked eye sorts | mark attested, the sizing constructed |
| The Moon | a kaolin-pale disc with a few manganese dabs for the face everyone has always seen in it | pigments attested, composition constructed |
| A cluster | a group of dots, as the six over the bull's shoulder | mark attested, meaning contested |
| A wandering star | — | not drawn: no secure evidence this era told a planet from a star |
| Slingshot | a struck spark-cluster | fully constructed |
| Shield | Newgrange's pecked triple spiral | mark attested, application constructed |
| Reflector | a hand stencil turned the opposite way | fully constructed |
| Inkwell | a raw ochre nodule | attested, no reskin needed |
| Orbit | a dot-ring | mark class attested, composition constructed |
| Capture | a hand stencil laid down | fully constructed |
| Release | the hand lifted, pigment settling | fully constructed |
| Currency | ochre | attested |
| Score | the tally (notch count) | attested |
| Chapter | the chamber | modern speleology label, not period vocabulary |
| Best | how deep the torch carried you | constructed, on an attested fact |
| Daily | — | not attempted — a genuine mismatch (months, not days) |
| Title | the dot-ring or spiral, undressed | deliberately untranslated |

## Currency and the rule

Currency is **ochre**, no renaming needed: mined, ground, and carried kilometres into darkness by a torch burning down as the carrier worked — already the shipped resource's shape. Rule (class A, render-side): **the torch breathes** — the aim guide's reach contracts as ink drains and pulses outward on capture; no hazard, cost, or scoring number changes. Deferred: the plain no-twist reading (ochre renamed, every number untouched) is the safe fallback if a spike shows the torch needs simulation state.

## Dangers

| Row | Name | Depiction |
|---|---|---|
| Attractor | **The Shaft** | A dark vertical drop rimmed by a pecked spiral; the eye is drawn down into it, not a whirlpool. |
| Repulsor | **The Flare** | A soot-blackened halo around an ember-red core — a guttering torch's scorch. |
| Crosswind | **The Draught** | A streaked charcoal smear, dragged sideways, a torch-flame bent by real cave airflow. |
| Obscurer | **Unlit rock** | Nothing drawn at all — the one hazard this era depicts with total fidelity. |

## The bodies

Under the knowledge horizon ([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) this era draws no family at all, because no one on this wall could tell one kind of body from another. A body is a dab of ochre in one of three sizes — the bright, the middle and the faint, the one thing a naked eye can sort — inside its dot-ring orbit, and both readings, at a glance and under the held orbit, are the same dab, which is honest. The Moon is the one body with a face: a kaolin-pale disc with a few manganese dabs for the blotches everyone has always seen in it, the pigment laid over the light as the reserve is. The constellation is a cluster of dots, six with three ringed, exactly as ambiguous as the bull's shoulder dots are. No planet is drawn as anything but a dab, since there is no secure evidence this era told a wanderer from a star; no caption is written, since there is no script to write it in.

**The opening triad.** Every run opens on this sheet, so the three pressures cannot be an ocean, a ringed and a volcanic world here. They are three bodies in three brightnesses — the Moon for Tiro, a bright star for Adeptus, a faint star for Magister — and the choice still reads before any caption could, on a sheet that has none. `DIFFICULTY_FAMILY` applies from era VI, for a run that opens there.

The earlier seven-family reading of this sheet — an undulating line, a cup mark, a cup-and-ring, the kaolin reserve, finger-combed flutings, scored veins, comma-strokes — survives in `prototypes/rock.html` as a record of attested marks every one of whose *meanings* was constructed; the marks themselves remain the era's vocabulary for the dangers, the pickups and the orbit.

## Frame and furniture

Nothing surrounds this sky: no border, cartouche, colophon or maker's mark — a figure's edge is wherever rock or torchlight stops. The plate-mark dissolves into a pulsing vignette of warmth against unlit dark; compass rose and RA/declination ticks don't exist. HUD numbers become burin-tally clusters where counts are small, and a density-coded dot-field where they are large — nobody tallied into the hundreds by single notches. Named feats have no script; a small pictogram or attested sign substitutes.

## The signature sheet

**The Hall of the Bulls** — four aurochs on bare rock, the six-dot cluster over the black bull's shoulder rendered exactly as ambiguous as it is, not claimed as a confirmed star map. Later enrichment adds: the Shaft Scene, Chauvet's shaded horses beside the Panel of Hand Dots, and Newgrange at solstice dawn.

## Sound

Stone-peck (capture), breath-huff (release), a low resonant tone after Reznikoff's cave-resonance research (perfect), a dry charcoal scrape (graze), a guttering torch-hiss into drip and echo (loss).

## The prototype

`docs/eras/prototypes/rock.html` exists and paints the Hall of the Bulls at load. Its header comment records: every mark routes through three primitives (dab, hand stencil, engraved line/arc — pecked marks are engraved lines composed into pits); the ground is one relief baked once to an offscreen sprite and lit from a fixed torch bearing, with only the flicker/reach overlay, ember comet, aim guide and ochre-smear currency redrawn live; Lascaux's `#C7BC9E` ground is used, Chauvet's paler tone deliberately not mixed in; the six-dot Pleiades reading is drawn honestly ambiguous, three dots warmed and three left ordinary; pickups are reskinned per the Names table, each flagged where constructed; score is bundled per-ten-per-stroke in fives, a called-out compromise between the tally instruction and legibility at three digits. Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md). The prototype predates the knowledge horizon and paints seven families; `prototypes/turn-rock-disc.html` paints this sheet's bodies as the horizon asks — three sizes of dab and the Moon's face — on the way into era II.

## Risk

The torch twist is Rule 1's hardest test: confirm in a spike it needs no simulation state, or it becomes B/C-shaped. The tally/dot-field HUD is a genuine legibility risk, unspiked beyond the prototype's own compromise. No frame at all is the era's strongest and riskiest idea at once. The star-map claims — Pleiades, Summer Triangle, Adorant-as-Orion, Knowth-as-lunar-map, Göbekli Tepe Pillar 43-as-zodiac — are contested minority readings, several disputed by the excavating archaeologists, and must never be asserted as fact. Absolute dates throughout are approximate and debated; torch relight/wipe-mark evidence for run-length is unverified this pass. The triad in three brightnesses is unspiked: whether Tiro, Adeptus and Magister read off the Moon and two dabs alone, on a sheet with no caption to fall back on, is open question K.