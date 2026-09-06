# The knowledge horizon — a decision proposal

**Status: proposed, not built.** This file began as a discussion draft and is now the plan it
argued for, written as a decision so it can be accepted or refused on purpose. It changes nothing
shipped. Where it touches another document the change is made there too — rule 3 in
[OVERVIEW.md](OVERVIEW.md), the transition in [PROGRESSION.md](PROGRESSION.md), the tables in
[ARCHITECTURE.md](ARCHITECTURE.md), the bodies section of every era file — so the plan is
consistent from any door in. The history it rests on is sourced in
[research/knowledge-horizon.md](research/knowledge-horizon.md); every date below is to be read
against that file, which is the one that cites.

## The question, and the finding that shrinks it

Rule 3 said every era keeps the same seven families and changes only how they are depicted, so the
player reads the chart the same way on any sheet. That made every pre-modern family an
**analogy** — the Ceiling's ringed world a winged sun-disc "applied by analogy," the Rock's a
cup-and-ring mark with a "constructed" meaning — and it made the question this file asks: what
would each era look like if it showed only what its own moment in the history of astronomy could
actually know about a body's *surface*, as opposed to its position?

The finding that shrinks the question is in the code. `family` does not appear in
`src/simulation.js`. The seven families live in `src/planets.js` and nowhere else: they choose a
surface painter, and *planet appearance is separate from the orbit's behaviour*. What the player
must read to fly — the orbit ring, the blue rim of a drifter and the copper rim of a fader, the
capture band, the release ticks, the slingshot's inner band, a hazard's field ring, the cut in the
guide at a nebula, the flood's shoreline — is not carried by any family. Rule 3 protects the
readability of the chart, and the families carry none of it.

Two things do read a family: the opening triad, whose three pressures are drawn as an ocean, a
ringed and a volcanic world so the choice reads before its caption does (`DIFFICULTY_FAMILY`),
and era IX's harvest, which reads the family of the body a gain came from. Both are answered
below. Nothing else is touched by letting an era show less than seven kinds of body.

## The decision

**The horizon is the progression's own content.** The climb through the eras is epistemic as
well as aesthetic: every run re-enacts what humanity could see of a body, and when. Before the
telescope a body is a point in a brightness class and the Moon is the one body with a face; the
telescope ties each family to one named body and one dated observation, and misreads two of them
for decades; the photograph believes in canals; the observatory and the probe are the only two
eras whose vocabulary is simply what their astronomy says. The player learns the real dates by
flying through them.

Rule 3 is rewritten to say so. Its new text, in [OVERVIEW.md](OVERVIEW.md):

> **Every era keeps the same orbit and hazard rows, and shows of a body only what its century
> could know.** Rings, rims, bands, ticks, fields and the flood are the vocabulary the player
> reads, and they are identical on every sheet, so the chart is read the same way on any sheet.
> The seven families are not part of that vocabulary. They are a discovery of era VI, tied there
> to named bodies and dated, misread where the century misread them, and literally true only from
> era VIII. Before the telescope a body is a point in a brightness class, and the Moon is the one
> body with a face. In era IX the families gain a second reading, the material each yields,
> without losing the first.

Neither of the draft's two shapes is taken as written. Shape A dropped rule 3 for the early eras
and accepted that the chart would read differently until the engraving; it does not, because the
chart was never read through the families. Shape B laid a modern colour ring over each blank
body to say what it "really" was; the ring is dropped, because it carried no information the
player uses and it is exactly the modern overlay that would break the fiction of a cave wall.

## Space and time: the vertical of the sheet is space, the stack of sheets is time

The run flies outward through rows and climbs forward through centuries, and the two are the two
axes of the page. The Earth is not a node. **The Earth is the bottom edge of every sheet**: the
place of the observer, the place the flood rises from, and the place the new sheet is pushed up
from at a page turn — which is already the shipped animation, only without this meaning. The
traveller is not a ship. It is the gaze, the pen, the line drawn from the Earth up into the sky,
and the game already draws the player as a pen.

That is what makes the transition safe. **At a page turn the observer returns to the Earth; the
traveller does not.** The flight, the rows, the position and the score run on unbroken and the
simulation, as rule 1 requires, hears nothing. What returns is the standpoint: a new century
looks up from the Earth at the same chart and draws it again in its own hand. Historically that
is exactly right — every culture on the ladder inherited the record of the one before it and
carried it on, Babylonian tablets into Ptolemy, Ptolemy into al-Ṣūfī, Tycho into Bayer — and the
game already has the inheritance built: the whole route a run has flown stays on the chart as
dried ink, and its ink is registered per plate. A page turn is a plate change, so the old route
reappears in the new era's hand of its own accord. The earlier culture wrote the way down; the
new one reads it and flies on. The flood, in this reading, is what a culture does not keep: the
forgetting the traveller must stay ahead of.

The ladder's close pays this off without a new rule. **Era IX's sheet is the first not drawn
from the Earth.** The probe's page turn is the one turn where the observer actually leaves — the
incoming sheet does not rise from the bottom edge but forms at the traveller — and the two ends
of the ladder rhyme once more: the first sheet is a wall lit from the ground, the last is a
plaque that has left it.

The frame can say how far each century could *measure*, as decoration rather than claim. The
Rock, the Disc and the Ceiling have no distance at all; the Marble's scale reads in Earth radii,
as Ptolemy gave the Moon's and the Sun's; the Engraving's, after Cassini and Richer's Mars
parallax of 1672, in astronomical units; the Plate's, after Bessel's parallax of 1838, in
light-years; the Observatory's in parsecs; the Probe's in distance actually flown. The chart
never claims to be the real Solar System — its constellations are invented in the manner of
Hevelius today and stay so — and a scale in the era's unit does not change that. What is real is
the class, the hand, the date and the mistake, never the geometry.

## The mechanics: one table, two readings per body

The horizon is a render-side table in the project's own idiom, beside `HAZARD_KINDS` and
`ECONOMY`: **`KNOWLEDGE`**, one row per era, one column per family, three things in every cell.

- **At a glance** — what the era saw on approach: the body as it is drawn when the cartographer
  reaches it. Rock through Globe: a point in a brightness class. Engraving: Galileo's handles for
  the ringed body, a terminator and craters for the cratered one. Plate: Lowell's canals for the
  dune world.
- **Under attention** — what the era's best instrument knew: the body as it develops while the
  orbit is held. Handles become Huygens's rings; canals become Antoniadi's irregular patches. In
  the Marble the class letter and, for a reddish body, Ptolemy's one colour word appear. On the
  Rock a dab stays a dab, which is honest.
- **The caption** — a dated line, set once per run the first time a family is captured in an
  era whose cell carries one, through the inscription system the game already has: a leader from
  the rim, the era's small hand, the date. `1610 · SIDEREUS NUNCIUS` beside the first cratered
  body of the engraving; nothing at all on the Rock, which has no script.

**Attention is the held orbit.** This is the Plate's "hold to develop" laid over the whole
ladder: the era's second reading develops from the first on the clock the held orbit already
pays ink on, and the reveal machinery that stages a planet "as a colourist works" already draws
in stages. No number is added to the simulation, `this.random()` is never called again, the
daily and the ledger stay comparable because the era, and so the state of knowledge, is a
function of the score. The Plate's own row keeps the one thing it adds: overholding fogs.

**The page turn is the strongest moment and costs almost nothing.** The page turns at a capture,
so the body just captured is the first thing the new century sees. Entering the Engraving with a
plain point under the pen, the point develops a terminator and craters on the spot: the moment of
1610, met in orbit rather than read in a caption. The announcement names the era's numeral, name
and year, as planned; the route is re-inked by the plate change, as above.

**A brightness class per node.** Each main node carries a magnitude class, seeded exactly as the
background stars' six classes are, and it is the only differentiation eras I to V draw. It is the
same class the Marble's deferred B rule reads (a brighter body pays more and narrows the perfect
window), so when that rule is taken it changes a number the sheet has shown all along.

**The opening triad on the Rock** is three bodies in three brightnesses — the Moon, a bright
star, a faint star — in place of an ocean, a ringed and a volcanic world. The pressure still reads
before its caption does. A run that opens on era VI or later keeps the families it has.

**What the chart never claims** is a real sky. Nodes are not named after real stars, decans are
not mapped to modern constellations, the Ceiling's four or five barques are not placed where the
planets stood in 1479 BCE. The prototypes' honesty about attested motifs and constructed meanings
is kept and sharpened: an era draws what its documents show, and where the document is silent the
sheet is too.

## The table

The raw form, to be keyed into `KNOWLEDGE` and checked cell by cell against
[research/knowledge-horizon.md](research/knowledge-horizon.md). "Point" means a body of the
era's own brightness grammar with no surface; a family named in a cell is drawn with that family's
painter in the era's hand.

| Era | At a glance | Under attention | The Moon | Caption | Wrong belief kept |
|---|---|---|---|---|---|
| I · Rock | an ochre dab in one of three sizes | the same | a kaolin disc with a few dark dabs: the face | none, no script | — |
| II · Disc | one gold punch, always | the same | the gold crescent, or the full disc | a museum gloss only | — |
| III · Ceiling | a flat painted disc among the decans | the deity's barque and name column for the four wanderers the ceiling carries, and the empty barque where Mars is not | the flat disc | the hieroglyph column | — |
| IV · Marble | a point in one of six classes | the class letter α′–ϛ′; *ὑπόκιρρος* on a reddish body | the one imperfect body: Plutarch's hollows and heights | the Greek class | — |
| V · Globe | a gold disc sized to its class | al-Ṣūfī's re-observed class; the little cloud, where the obscurer stands | the crescent | naskh, the class | — |
| VI · Engraving | crater, storm and ice bodies as their named originals; ringed as **handles**; ocean as the Moon's *maria*; volcanic as **a sunspot**; dune a bare disc with one dusky patch | handles → **rings**; the patch → Syrtis Major; the caps → **snow** | Galileo's terminator | Fell italic, dated | Saturn's handles 1610–1659; Herschel's lunar volcanoes 1787; his cool inhabited Sun 1795 |
| VII · Plate | knots of silver by density and size; dune as **canals** | canals → Antoniadi's patches 1909; the rest photographed | a photographed Moon | ink on the glass, dated | Lowell's canals 1894–1909; Vulcan 1859–1915 |
| VIII · Observatory | the seven families as rendered bodies | spectrum and FITS card | rendered | a FITS card | — |
| IX · Probe | the seven families as sensed masses | the readout and the material | sensed | telemetry | — |

Three cells want a word. **Volcanic in VI** is drawn as a sunspot only because the sunspot is the
one "fire" the century drew; Herschel's three lunar volcanoes of 1787 are the better hook and a
mistake besides, and the cell should be keyed from the research file's verdict on them. **Dune in
VI** is not yet a family: Huygens's Syrtis Major of 1659 is one dusky patch on a bare disc, and
the desert arrives with Lowell in VII. **Ocean in VI** is Riccioli's naming of 1651, seas that are
not seas, which is the honest kind of ocean the century had.

## Where the families become true: the gap on the ladder

As a *typology* the families are not born with the exoplanets of 1995. They are born in the
flyby years: Mariner 4's cratered Mars in 1965, the rings of Uranus in 1977, Jupiter's ring and
Io's volcanoes and Europa's ice in 1979, Neptune's Great Dark Spot in 1989. That is when
"ringed" stops meaning Saturn. Those years are exactly the gap between era VII, which ends in
1958, and era VIII, which begins in 1990 — and era IX's own documents, the Pioneer plaque of
1972 and the Voyager record of 1977, are pulled from inside it.

The ladder has to answer this one way or the other. Either era VIII's opening date moves back
to about 1965, so the Observatory owns the flyby years as its first chapter, or a tenth era, the
Flyby — Voyager's image mosaics, JPL's pressroom prints, the Golden Record — goes onto the
candidate list beside the Babylonian planisphere and the Dunhuang chart. Recorded as an open
question; the Observatory's own file notes it.

## The early cultures: a shortage of kinds, not of bodies

The objection that a cave or a Bronze Age hill knew "extremely few celestial bodies" mistakes
what was scarce. Every culture on the ladder saw thousands of stars; what it lacked was
differentiation and depth. So the main nodes of eras I to V are not planets, they are what the
era had:

- **The Rock**: stars in three brightnesses and the Moon, the one body with a face. Two or three
  captures, so perhaps the Moon and two stars.
- **The Disc**: the Sun, the Moon, the Pleiades. The Pleiades are the natural figure behind this
  era's three-star route.
- **The Ceiling**: decan stars as the main nodes, as its file already planned, and the
  barque-borne wanderers as named special nodes with no surface at all. Mars is absent from
  Senenmut's northern panel — Neugebauer and Parker make its absence the mark of the whole
  "Senmut family" of ceilings, and one reading has it as the empty barque in the west — so the
  ceiling draws four barques and an empty one, and says so.
- **The Marble and the Globe**: six classes and a colour, and the Moon as the one imperfect body.

The eras are short anyway — about forty-five seconds of a median run for all five. What is lost is
seven constructed analogies per era; what is gained is that nothing on those sheets is a claim the
culture could not have made.

## What it costs, honestly

- **Rule 3 is rewritten**, above and in OVERVIEW.md.
- **The bodies sections of eras I to V are rewritten**, and their Names tables lose seven rows
  each. The five prototypes were painted before this decision and still carry seven families;
  they are body painters awaiting one point painter each, not sheets to be repainted.
  [PROTOTYPES.md](PROTOTYPES.md) says which.
- **Era VI gains work.** Its file said nothing in it was outstanding; under the horizon it owns
  two readings for the ringed and dune bodies and seven dated captions. Small, and the model for
  every other era's captions.
- **The `KNOWLEDGE` table, the node's class, the caption and the redraw at the turn** are the
  spine's new render-side pieces, itemised in [ARCHITECTURE.md](ARCHITECTURE.md). None touches
  the simulation.
- **The triad on the Rock** is three brightnesses; `DIFFICULTY_FAMILY` applies from era VI.
- **The harvest in IX, the daily, the ledger and "open on"** are untouched.

## Still open

Carried to [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md): the flyby gap; whether the first cycle of
families inside era VI should follow the order of discovery or the run's own; the shape of the
Rock's triad on the built sheet; and the verification debt of every date in the table above,
which is the research file's to clear.
