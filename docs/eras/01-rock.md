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

Before a hand ever reaches it, a body on this sheet is only a light that keeps coming back: a faint recurring glow, in one of three sizes for the three brightnesses a naked eye sorts without help, sitting inside a dot-ring orbit drawn at its full, legible size from the moment it enters torch-reach. That ring, its size, and whatever it takes to fly a transfer to it are never staged and never withheld — a run is lost to a bad transfer on this sheet exactly as on any other, never to a light the game chose not to show. What the phenomenon withholds is identity alone: whether the return to this one patch of wall is worth anything, which is a question this era answers by hand, not by instrument, and answers slowly.

The hand that answers it is the era's own tool, not the player's fist or a spear-thrower's grip. What the game actually renders around the moving point is an **ochre crayon** — a lump of ground haematite worked down to a working edge, the shape Blombos Cave's own ochre crayons are attested in — held to the rock point-first, blunt and irregular, no vane, no aerodynamic taper, because nothing about a piece of mined stone needs to look like it is flying. The **Observer Core sits at the crayon's own worn, faceted contact point** — the one small bright spot on the whole tool where pigment is actually being transferred to rock — and the rest of the lump is dead weight around it, exactly as [OBSERVER-CORE.md](OBSERVER-CORE.md)'s table sets this era's tool. It is the first and plainest instance of the game's own rule on this: the player was never really the crayon. The player is the point on it that is actually touching the wall.

That point is what strikes the dab, and the striking happens in the stages the wall's own palimpsest already teaches: at capture, one scratch or one dab of wet ochre lands where the light has been circling — indistinguishable, on its own, from any other mark already on the rock, exactly as any first mark on a heavily reworked panel would be. By a quarter-turn the hand has come back to the same spot enough times that a scatter of repeated dabs and tallies has grown up around the ring — not a bigger dab, more dabs, the actual residue of a hand checking on something it has decided to keep watching. By half a turn the marks have begun to close on themselves: a ring nearly unbroken, a run of tallies counted most of the way out, a cup starting to deepen where the same spot has been struck again and again. By two-thirds of a turn they close into one of this era's own attested sign-forms — a finished ring, a full row of ticks, a cup-and-ring — sealed, not enlarged, by one further dab pressed a shade darker than the rest, the small flourish a player needs to know the wall has nothing further to give without a number telling them so.

What results is not a picture of the body. It is a **remembered pattern**, held rather than named — a mark that says *this was seen, and returned to*, which is the entire epistemic content this era is capable of offering and the whole of its knowledge gain, phenomenon to memory. The Moon is the one body granted a face inside that limit: a kaolin-pale disc with a few manganese dabs laid over it for the blotches everyone has always seen there, the one body a naked eye can differentiate from every other light at all. The constellation is a cluster of dots, six with three ringed, kept exactly as ambiguous as the bull's shoulder dots that license it — the reveal closes the ring around them; it does not resolve what they mean. No planet is drawn as anything other than a dab, because there is no secure evidence this era told a wanderer from a star, and no caption is ever set beside any of it, because there is no script to set one in.

**The opening triad.** Every run opens on this sheet, so the three pressures cannot be an ocean, a ringed and a volcanic world here. They are three bodies in three brightnesses — the Moon for Tiro, a bright star for Adeptus, a faint star for Magister — and the choice still reads before any caption could, on a sheet that has none. `DIFFICULTY_FAMILY` applies from era VI, once a body has a family for it to apply to.

The earlier seven-family reading of this sheet — an undulating line, a cup mark, a cup-and-ring, the kaolin reserve, finger-combed flutings, scored veins, comma-strokes — survives in `prototypes/rock.html` as a record of attested marks every one of whose *meanings* was constructed; the marks themselves remain the era's vocabulary for the dangers, the pickups and the orbit, never for a body's own three-state reveal above, which draws on brightness and the struck dab alone.

## The frontier

This era's word for the boundary is **the forgetting**, kept in plain English because the era it names has no script of its own to hold a word in ([OVERVIEW.md](OVERVIEW.md) rule 2) — a fitting silence, since a mark that is not held in memory is exactly what this era's own knowledge gain says a lost mark reverts to. Nothing about the boundary's rate, its grace or its shoreline changes from what [THE-FRONTIER.md](THE-FRONTIER.md) fixes for every era; what changes is only what is failing behind the player, and on this sheet it is not one failure but two.

Ochre does not fade the way a dye does; it is a mineral, and it does not chemically bleach in the dark. What actually gives way is *adhesion* — the thin film that ever held the pigment to the stone lets go, and the dab powders away or is sealed under a calcite skin left by water moving through the rock, a skin that can later spall and take the pigment with it when it goes. The engraved lines fail by an entirely separate and more total mechanism: the limestone itself exfoliates in scales under moisture and the freeze-thaw cycle, a complete loss of the support rather than a fading of a film sitting on top of it. Drawn render-side, this reads as broken-edged, blotchy erasure with hard, sharp-lipped spall margins rather than a soft wash, small chip particles drifting free of the surface as the loss actually happens — **plausible reconstruction**, general rock-art conservation science, not sourced from [research/rock.md](research/rock.md), which does not cover it.

The star behind a forgotten dab was there before the ochre ever found it and stays there after the ochre is gone; what the forgetting erases is only ever this wall's account of having noticed it, which is the reason the flight can never turn back to a patch of rock already passed.

## The remembered sky

The background artefact this era fills, in place of a chart, is **the remembered sky**: not a coordinate system and not a catalogue, closer to what a tally bone already is — a surface a hand keeps returning to, whose only order is which patches have been struck and how many times. Empty, it is bare torchlit rock, unbroken by a single mark. Half filled, it reads exactly as a real Palaeolithic panel reads: a scatter of dabs, stencils and tallies accumulating unevenly, overlapping where the hand came back to a favoured spot and leaving long stretches of stone untouched where it did not — a genuine palimpsest, not a progress bar dressed as one. Complete, once this era's own ledger has armed, the wall carries enough closed sign-forms — rings, tally-rows, cup-and-rings — that it reads, at a glance, as a sky remembered rather than a sky merely noticed: a record that specific lights were seen, watched, and returned to, again and again, by hands working the same stretch of stone.

Once armed, per [PROGRESSION.md](PROGRESSION.md)'s own ledger and designation, the next main body the run has already been dealt is designated the transition object and drawn exactly as any other node is drawn on this sheet — struck in the same three stages, captured the same way. What follows at that capture is the forgetting run to completion rather than to a shoreline: every other mark on the wall, every dab, tally and closed ring this era ever struck, is consumed by the same failure named above, all at once, while the transition object and the Observer Core at the crayon's tip are the two things that failure is never allowed to touch. The crayon itself then gives way to [The Ceiling](02-ceiling.md)'s rush brush, the Core carried over unchanged at the new tool's wet tip, and the body under it is not replaced but redrawn: the same light that was, a moment before, a closed ring of ochre dabs becomes a painted contour taking its place in a decan's hour, understood the Egyptian way rather than a new light appearing in its stead. Nothing borrowed from the Nebra sky disc belongs anywhere in this turn — the Disc held this slot on an earlier ladder and does not on this one; it is retired, with its own research and prototype intact, to [candidates/disc.md](candidates/disc.md), and no era's transition object may wear another culture's costume regardless.

This is not a lesser rehearsal for the writing eras that follow it. It is the one era on the whole ladder that proves a mark can hold real knowledge with no name, no register and no catalogue standing behind it at all — every later era's script and archive is a way of doing more with less effort than this one had, not a way of doing something this one could not do at all. The sky over the Hall of the Bulls is the same sky Senenmut's ceiling will name in the next era and Bayer's plate will letter three eras after that; only the hand changes.

## Frame and furniture

Nothing surrounds this sky: no border, cartouche, colophon or maker's mark — a figure's edge is wherever rock or torchlight stops. The plate-mark dissolves into a pulsing vignette of warmth against unlit dark; compass rose and RA/declination ticks don't exist. HUD numbers become burin-tally clusters where counts are small, and a density-coded dot-field where they are large — nobody tallied into the hundreds by single notches. Named feats have no script; a small pictogram or attested sign substitutes.

## The signature sheet

**The Hall of the Bulls** — four aurochs on bare rock, the six-dot cluster over the black bull's shoulder rendered exactly as ambiguous as it is, not claimed as a confirmed star map. Later enrichment adds: the Shaft Scene, Chauvet's shaded horses beside the Panel of Hand Dots, and Newgrange at solstice dawn.

## Sound

Stone-peck (capture), breath-huff (release), a low resonant tone after Reznikoff's cave-resonance research (perfect), a dry charcoal scrape (graze), a guttering torch-hiss into drip and echo (loss).

## The prototype

`docs/eras/prototypes/rock.html` exists and paints the Hall of the Bulls at load. Its header comment records: every mark routes through three primitives (dab, hand stencil, engraved line/arc — pecked marks are engraved lines composed into pits); the ground is one relief baked once to an offscreen sprite and lit from a fixed torch bearing, with only the flicker/reach overlay, ember comet, aim guide and ochre-smear currency redrawn live; Lascaux's `#C7BC9E` ground is used, Chauvet's paler tone deliberately not mixed in; the six-dot Pleiades reading is drawn honestly ambiguous, three dots warmed and three left ordinary; pickups are reskinned per the Names table, each flagged where constructed; score is bundled per-ten-per-stroke in fives, a called-out compromise between the tally instruction and legibility at three digits. Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md). The prototype predates the knowledge horizon and paints seven families; `prototypes/turn-rock-disc.html` paints this sheet's bodies as the horizon now asks — three sizes of dab and the Moon's face — and studies the mechanics of a page turn out of this sheet. It was built pairing this era with the Nebra sky disc as the next sheet up, a pairing the reconciliation pass refused outright: the Disc does not hold era II on this ladder, is not this era's transition object, and is retired to [candidates/disc.md](candidates/disc.md) with its own research and prototype intact. What survives here is a study of the turn itself — the page-turn machinery `pageTurn()` and `drawSheetEdge()` animate — not a claim about what era I actually turns into, which is [The Ceiling](02-ceiling.md), reached by the growth-from-the-transition-object described above, never by a second sheet sliding up from below.

## Risk

The torch twist is Rule 1's hardest test: confirm in a spike it needs no simulation state, or it becomes B/C-shaped. The tally/dot-field HUD is a genuine legibility risk, unspiked beyond the prototype's own compromise. No frame at all is the era's strongest and riskiest idea at once. The star-map claims — Pleiades, Summer Triangle, Adorant-as-Orion, Knowth-as-lunar-map, Göbekli Tepe Pillar 43-as-zodiac — are contested minority readings, several disputed by the excavating archaeologists, and must never be asserted as fact. Absolute dates throughout are approximate and debated; torch relight/wipe-mark evidence for run-length is unverified this pass. The triad in three brightnesses is unspiked: whether Tiro, Adeptus and Magister read off the Moon and two dabs alone, on a sheet with no caption to fall back on, is open question K.