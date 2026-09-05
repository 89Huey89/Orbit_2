# I · The Rock

**Franco-Cantabrian Europe, c. 40,000–3,000 BCE (the grammar's centre of gravity is Lascaux's
Hall of the Bulls, commonly dated c. 17,000 BCE).** The sky before there was a sky to draw: marks
made on a cave wall or scored into bone by people who left no writing, and, on the record's best
evidence, no confirmed astronomy at all beyond one uncontested solstice alignment at the era's
very close.

## The documents

- **Lascaux, the Hall of the Bulls**, Dordogne — four monumental black aurochs (one over 5 m, the
  largest animal figure known from Palaeolithic art), no frame, no ground line, figures scaled to
  the rock's own relief. One bull carries a six-dot cluster over its shoulder, controversially
  read as the Pleiades.
- **Lascaux, the Shaft Scene** — a disembowelled bison, a fallen bird-headed man, a bird on a
  staff, a departing rhinoceros, down a real vertical drop; controversially read as the Summer
  Triangle.
- **Chauvet Cave, the Panel of Hand Dots** — three red-ochre hand stencils and two dot clusters,
  the dots palm-loaded with wet pigment and pressed to the wall, not blown: the era's clearest
  attested mark-making, its meaning openly unknown.
- **El Castillo Cave** — a red disc and a hand stencil, uranium-series dated to a minimum
  40,800/37,290 years: the era's oldest secured mark-making, non-figurative before any animal is
  painted at all.
- **Newgrange and Knowth**, Boyne Valley — Neolithic passage tombs, c. 3200 BCE, the era's
  closing edge. Newgrange's pecked kerbstone spirals and its roofbox, genuinely and
  uncontroversially aligned to winter-solstice sunrise, are the strongest bridge from cave to
  open sky the era has.

## The grammar

There is no chart. A cave wall is not laid out, it is found: painters worked the rock's own
bulges and hollows so a boss becomes a shoulder and a crack a horn, giving the figure modelled
relief without a shaded stroke. No ground line, no horizon, no coordinate system — figures float
and overlap at whatever scale the rock demands, and major panels are genuinely overpainted across
what may be centuries, a real palimpsest rather than a design choice. Three registers of mark
stay distinct because the record keeps them distinct: painted figures (animals, never
constellation-figures in the Greek sense), engraved lines (flint-scored, sometimes pigment-rubbed
after), and non-figurative marks (dots, stencils, flutings, roughly fifty unread geometric signs
at Lascaux alone). The megalithic close layers a second grammar on top: pecked relief on exposed
stone under open sky, a ring around a threshold rather than a picture on a wall.

## Palette

| Material | Hex | Role |
|---|---|---|
| Red ochre (haematite) | `#9C3B22` | the era's most reserved colour — its nearest "gold" |
| Yellow ochre (goethite/limonite) | `#C9962E` | softer, more common secondary fill |
| Manganese black | `#211F1E` | cooler, blue-black line |
| Charcoal black | `#2C2622` | warmer, softer-edged line — chosen per panel, never mixed with manganese |
| Kaolin white | `#EAE1CF` | rarest pigment, sparing highlight |
| Torchlit limestone, Lascaux ground | `#C7BC9E` | this era's chosen ground |
| Torchlit limestone, Chauvet ground | `#D6D0BF` | named but deliberately not mixed with Lascaux's |
| Open-air kerbstone (Newgrange) | `#A9A79C` | unpainted, reads by pecked shadow, not colour |

There is no gold. The reddest ochre stands in for it, used as sparingly as every other era's gold
leaf. Black — charcoal or manganese, never both on one panel — is the era's ink.

## Lettering and the hand

No script survives, and this era's honest answer to "how people wrote" is what marks stood in
for one: dots palm- or fingertip-loaded with wet ochre and pressed to the wall, repeatedly, no
stroke and no leading edge; hand stencils, pigment blown around a hand held flat to the wall;
positive handprints, the opposite gesture, contact leaving the mark rather than protecting the
rock from it; and engraved tallies, cut with a flint burin into bone, antler or ivory — the Abri
Blanchard plaque's 69 marks, the Ishango and Lebombo bones — one incision per unit, grouped only
by a change of tool or sitting. `writeText()`/`penLettering()` assume a stroke order this era has
none of, so the reveal is built from three primitives instead: a **dab** (opacity ramps in on
contact, no clip, no direction), a **stencil bloom** (a soft silhouette fades up from the outside
in), and a **burin tally** (one short stroke per unit, left to right, no ligature). None needs a
glyph outline. No OFL face is loaded — commercial "petroglyph"/"primitive" novelty faces
(P22 Petroglyphs and kin) are explicitly rejected, not OFL and, worse, exactly the fantasy-rune
move an unscripted era should refuse: a font implies a fixed sign-to-sound alphabet this era
never had.

## Names

No word from this era survives, spoken or written. The table swaps "the era's own word" for
"the era's own mark" — a motif attested in period, its game-meaning laid over it and marked as
constructed where (almost everywhere) the true meaning is not recovered.

| Game term | The era's mark | Gloss | Status |
|---|---|---|---|
| Ocean world | an undulating engraved line | a widely attested "serpentiform" sign | mark attested, meaning constructed |
| Crater world | a cup mark | pecked hollow; a pitted disc is already a crater | mark attested, meaning constructed |
| Ringed world | a cup-and-ring mark | already, literally, a ringed disc | mark attested, meaning constructed |
| Ice world | bare kaolin-washed rock, the "reserve" | withheld pigment as unmarked-and-cold | technique attested, application constructed |
| Dune world | finger-combed ochre flutings | the "macaroni" fluting technique | mark attested, application constructed |
| Volcanic world | red ochre ground, scored black fissure-veins | the most saturated body, from the most reserved pigment | palette attested, composition constructed |
| Storm world | a cluster of short comma-strokes | one of Lascaux's ~50 unread geometric signs | sign-class attested, meaning constructed |
| Slingshot | a struck spark-cluster | echoes the ember-comet's own vehicle | fully constructed |
| Shield (Scutum) | Newgrange's pecked triple spiral | an attested threshold/ward motif | mark attested, application constructed |
| Reflector (Repulsa) | a hand stencil turned the opposite way | pigment settling back in as the hand lifts | fully constructed |
| Inkwell | a raw ochre nodule | the currency's material, undressed | attested, no reskin needed |
| Orbit | a dot-ring | a circle of dab-marks around a point | mark class attested, composition constructed |
| Capture | a hand stencil laid down | contact claims the spot | fully constructed |
| Release | the hand lifted, pigment settling | the blown cloud disperses once the hand is gone | fully constructed |
| Currency (ink) | ochre | the pigment itself — no translation needed | attested |
| Score | the tally | the notch count on a bone or plaquette | attested |
| Chapter / sheet | the chamber | a cave's named gallery (Rotunda, Nave, Shaft) | modern speleology label, not period vocabulary |
| Personal best | how deep the torch carried you | distance from daylight, a real measure of risk | constructed application of an attested fact |
| Daily plate | — | the era counted months, not days; no equivalent forced | not attempted — a genuine mismatch |
| Title "Orbit" | the dot-ring or spiral, undressed | no word exists to give it | deliberately left untranslated |

## Currency and the rule

Currency is **ochre** — no renaming needed, only naming correctly. It was mined (a worked
haematite mine at Bomvu Ridge/Lion Cave is commonly cited among the oldest known mines),
ground, and carried, often kilometres, into total darkness by a torch burning down as the
carrier worked: already the shape of the shipped resource, scarce, physically carried, spent by
the act of making a mark. Rule (class A, render-side only): **the torch breathes** — the aim
guide's own reach contracts as ink drains and pulses outward for a second on every capture, a
torch relighting; no `HAZARD_KINDS`, cost or scoring number changes. Deferred: the research's
plain no-twist reading — ochre renamed, every number untouched, no contracting reach — is the
safe fallback if a spike shows the torch twist ever needs simulation state.

## Dangers

| Row | Name | Depiction |
|---|---|---|
| Attractor | **The Shaft** | A dark vertical drop rimmed by a pecked spiral; the pull is drawn as the eye being drawn down into it, not as a whirlpool. |
| Repulsor | **The Flare** | A soot-blackened halo around an ember-red core — the scorch a guttering, over-fed torch leaves on a low ceiling. |
| Crosswind | **The Draught** | A streaked charcoal smear, dragged sideways, echoing a torch-flame bent by a real cave airflow. |
| Obscurer | **Unlit rock** | Nothing drawn at all — the one hazard this era can depict with total fidelity, since the real thing already looks like an absence of light. |

## The seven families

**Ocean** is an undulating engraved line filled with a thin, dilute manganese wash, its edge one
scored contour rather than a keyline. **Crater** is a rounded, ochre-washed disc pocked with
pecked cup marks, each catching torchlight on one edge and shadow on the other. **Ringed** is a
cup-and-ring motif taken whole: a central pecked cup with one to three concentric pecked rings.
**Ice** is bare stone, kaolin-pale, deliberately under-marked — a rim of white chalk stipple and
nothing else. **Dune** is an ochre wash raked by finger-combed flutings, texture carrying the
family rather than a drawn silhouette. **Volcanic** is the reddest ochre the palette allows,
veined with scored black fissures following the disc's curve. **Storm** is a dense, directionless
cluster of short comma-strokes cut fast with the burin, drawn from Lascaux's own catalogue of
unread signs.

## Frame and furniture

Nothing surrounds this era's sky: no border, cartouche, colophon, scale or maker's mark — a
figure's edge is wherever the rock or the torchlight stops. The plate-mark and double rule
dissolve into a soft vignette, a pool of warmth against unlit dark, contracting and pulsing with
the torch; compass rose and RA/declination ticks do not exist. HUD numbers become tallies where
counts are small and fast-changing (a short burin-tally cluster, one stroke per unit) and a
density-coded dot-field where they are large and slow-changing (score, personal best) — nobody
tallied into the hundreds by single notches. Named feats and constellation names have no script
to be set in; the honest substitute is a small pictogram or attested sign.

## The signature sheet

**The Hall of the Bulls** — four aurochs overlapping on bare rock, the six-dot cluster over the
black bull's shoulder rendered exactly as ambiguous as it really is: present, real, and not
claimed by the game as a confirmed star map. Later enrichment adds the other three from the
research: the Shaft Scene (attractor chapter), Chauvet's shaded horses beside the Panel of Hand
Dots, and Newgrange at solstice dawn.

## Sound

Stone-peck (capture), breath-huff (release), a low resonant tone (perfect landing, after
Reznikoff's cave-resonance research), a dry charcoal scrape (graze), a guttering torch-hiss into
water-drip and echo (loss).

## The prototype

`docs/eras/prototypes/rock.html` exists and paints the Hall of the Bulls scene at load. Its
header comment records: every mark routes through exactly three primitives (dab, hand stencil,
engraved line/arc — pecked marks are engraved lines composed into pits, not a fourth primitive);
the ground is one relief, baked once to an offscreen sprite and lit from a fixed torch bearing,
with only the flicker/reach overlay, ember comet, aim guide and ochre-smear currency redrawn live
("animate the light, not the drawing"); Lascaux's own `#C7BC9E` ground is used, Chauvet's paler
`#D6D0BF` deliberately not mixed in; the six-dot Pleiades reading is drawn honestly ambiguous
(three dots warmed to "star" ochre, three left as ordinary dabs, the doubt kept out of the art
itself); pickups are reskinned per the Names table above, each flagged where constructed; score
is bundled per-ten-per-stroke in fives rather than one notch per point, a called-out compromise
between the tally instruction and legibility at three digits. Painter verdict: _to be recorded in
PROTOTYPES.md_.

## Risk

The highest test of Rule 1 in the ladder: the torch twist must be confirmed in a spike to need
no simulation state, or it becomes a B/C-shaped change. The tally/dot-field HUD is a genuine
legibility risk, unspiked beyond the prototype's own compromise. No frame at all is the era's
strongest and riskiest idea at once, removing chrome every other era relies on to judge the
chart's edge. The star-map readings — Lascaux-as-Pleiades, Lascaux-as-Summer-Triangle, the
Adorant-as-Orion, Knowth-as-lunar-map, Göbekli Tepe Pillar 43-as-zodiac — are contested minority
readings, several disputed by the excavating archaeologists themselves, and must never be
asserted as fact in-game. Lascaux/Chauvet absolute dates are approximate and debated; the
Lebombo bone's age is approximate; torch relight/wipe-mark evidence for run-length is
unverified this pass.
