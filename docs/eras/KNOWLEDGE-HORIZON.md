# The knowledge horizon — the three states a body is drawn through

This file was a discussion draft, marked "proposed, not built," arguing for two readings of a
body — what an era saw on approach and what its best instrument found under a held orbit. The
brief settles the argument by taking it further than the draft asked for: **every node in the
game now carries three states, not two, and every era draws all three, without exception.** This
file is no longer proposing that. It is the specification for it: what each state guarantees, the
clock it runs on, the checkpoints on that clock, and the table — eight eras, three readings per
body, rebuilt in full for the new roster — that is the mechanic's actual content. Where this file
touches another document the change is made there too:
[OVERVIEW.md](OVERVIEW.md)'s rule 3, [PROGRESSION.md](PROGRESSION.md)'s ledger and transition,
[ECONOMY.md](ECONOMY.md)'s completeness-scaled refill, [ARCHITECTURE.md](ARCHITECTURE.md)'s
render-side table, and each era file's own bodies section. The dates below are to be read against
[research/knowledge-horizon.md](research/knowledge-horizon.md), and against
[research/china.md](research/china.md), [research/instruments.md](research/instruments.md) and
[research/space-age.md](research/space-age.md) for the three eras that did not exist when that
first research pass was written.

## The three states, and what each guarantees

| State | When | What it guarantees |
|---|---|---|
| **Phenomenon** | before capture | position, capture-region size, and any gameplay-critical class — drifter, fader, sling, a hazardous neighbour — are fully legible. Identity is not. |
| **Observation** | while the orbit is held | the era's own recording process runs, visibly, on the body: the mark being struck, painted, brushed, engraved, exposed, scanned or read out, in that era's own hand |
| **Understood** | at completion | the body as that century could actually know it — no more, and, where the history has a mistake to offer, sometimes something less |

**The readability contract is hard, not a preference.** A phenomenon must never be dimmer or
smaller than the orbit ring it announces. The vocabulary a player flies by — rings, rims, capture
bands, release ticks, hazard fields, the guide, the frontier's shoreline — is identical on every
sheet and is never staged, never withheld, never a function of which century is showing. Only
*identity* is withheld: what a body turns out to be once it is orbited, never whether it is safe
to approach or how big a target it offers. A run is lost to a bad transfer, never to information
the game chose not to give. This is rule 3 in [OVERVIEW.md](OVERVIEW.md) and it does not bend for
any era's aesthetic, including the one — the Rock — that used to be excused from the mechanic
entirely. That exemption is withdrawn below.

## The clock is the swept arc, and it already exists

The reveal runs on `player.orbitSweep`: the radians actually swept since capture, not a duration.
`OrbitWorld` already tracks it — initialised at `0` in the player's own state
(`src/simulation.js:309`), reset to `0` at every capture (`:572`), and accumulated every frame an
orbit is held (`:689–690`). Today it has exactly one reader: `charge()` (`:525`) divides it by
`TAU` to give a slingshot node its charge fraction. Nothing about the number changes to make it
also drive the reveal; a second reader is added to a value the game already keeps.

**Swept angle, not elapsed time, because ninety degrees is ninety degrees on every ring the game
will ever draw.** A time-based clock could not promise that: a small body orbited fast and a large
one orbited slow would reach "recognisable" at wildly different moments if the clock ran on
seconds, because orbital period depends on radius and speed and neither is held constant across
the game's bodies. Swept arc is independent of both. A quarter-orbit is a quarter-orbit whether
the ring is a sling's tight fast circle or a drifter's wide slow one, which is the only clock that
lets one checkpoint table apply to every body in every era without a size or speed correction
folded into it. `src/reveal.js`'s existing staged-drawing machinery — the birth-and-duration
timers behind `reveal.progress()`, today keyed to `world.time` — is retargeted to read this clock
instead; the substitution is in the argument each mark's progress is computed from, not a new
system built beside the one that already draws every mark on the chart as it is reached.

## The checkpoints

Provisional, and stated as such: to be tuned once a built sheet exists, the way
[PROGRESSION.md](PROGRESSION.md) already flags its own ledger constants as needing the same
`verify.mjs` probe.

| Swept | What happens |
|---|---|
| capture, 0° | the first mark: one contour, one measurement, one dab, one scan line — the era's opening gesture, whatever material it is made in |
| ~90° | the body is *recognisable* as its kind |
| ~180° | substantially documented — the brief's own "roughly half an orbit" |
| ~240° | complete. Nothing further is gained past this point, however much longer the orbit is held. |

This is the same fraction [PROGRESSION.md](PROGRESSION.md)'s observation ledger and
[ECONOMY.md](ECONOMY.md)'s release dividend both read — `documented = clamp(orbitSweep/240°,0,1)`
— so a body's reveal state, the era's own progress toward its next transition, and how much of the
traversal resource a release recovers are three readings of one computed value, not three clocks
that could ever drift out of step with each other.

**No progress bar.** Completion reads off the artwork the way the brief asks: a player who has
watched a scale sharpen from tick marks into gilt, or a raster fill from a hand-tinted patch into a
full frame, knows exactly how far the body has come without a gauge telling them so, and a skilled
player may deliberately leave a partially documented body behind — that is a real decision, not a
failure state. **The one concession** is that the moment `documented` reaches `1.0` may carry a
small flourish in the era's own kind — a seal pressed, a wash of pigment settling, a lock of focus
— because a player needs to know the well is dry without reading a number, and one honest instant
of feedback earns that without becoming a HUD.

## The dab is struck: the old exemption is withdrawn

The earlier draft let one era off the mechanic entirely: "on the Rock a dab stays a dab," on the
reasoning that a Palaeolithic mark-maker had nothing to escalate to, so the glance and the held
orbit could honestly be the same picture. **That exemption is withdrawn, in full, for every era
the ladder now has — including the Rock.** The reasoning does not survive contact with the brief's
own central sentence: *nodes begin as celestial phenomena and become knowledge through orbit*, and
that sentence carries no clause exempting antiquity. What changes is not whether the Rock's dab
escalates, but what escalation means with no telescope and no catalogue to escalate *toward*: the
dab is not merely bigger or smaller depending on class, it is *struck in stages*. At capture, one
scratch or one dab of ochre. By recognisable, a scatter of repeated dabs and tallies around the
ring, the marks a hand actually leaves circling a thing it is watching. By complete, those marks
have closed into one of this era's own attested sign-forms — a simple ring, a row of ticks, a
cup-and-ring — not a picture of the body, a record that it was seen and returned to. The body's
*understood* state is not a bigger dab; it is a **remembered pattern**, which is exactly what
[OVERVIEW.md](OVERVIEW.md)'s knowledge-gain line for era I already says the era ends on:
phenomenon to memory. The old exemption was quietly making the Rock the one era where orbiting a
body changed nothing about it, in a game whose new premise is that orbiting is the only thing that
ever does.

## Space and time, and the honest cost of the redrawn sky

The old argument survives in its bones: the run flies outward through rows, climbs forward through
centuries, and those are the sheet's two axes — the vertical is space, the stack is time. The
Earth is not a node; it is the bottom edge the run flies away from, the place the frontier still
rises from behind the player exactly as it always has, and the place the traveller was standing
when the run began. None of that changes, because none of it depends on how an era transition is
drawn — it describes the ordinary flight, which [THE-FRONTIER.md](THE-FRONTIER.md) leaves
untouched.

What does not survive intact is the specific image the old file built for the *transition itself*:
"the new sheet is pushed up from the Earth at a page turn," and with it, "at a page turn the
observer returns to the Earth." Both described `pageTurn()` and `drawSheetEdge()` — a new sheet
sliding up from below the frame, from the same edge the Earth sits on, so a new century could be
pictured as a fresh pair of eyes looking up from the ground at the same chart. [PROGRESSION.md](PROGRESSION.md)'s
ten-step transition retires exactly this device, and it is worth stating plainly rather than
quietly carrying the old picture forward: **there is no second sheet, and nothing rises from the
Earth any more.** The old world does not get covered, it decays where it stands, consumed by the
same frontier that has been chasing the player all era, run now to completion instead of to a
shoreline. The new world does not arrive from below; per the brief's own step 9, it *grows
outward from the transition object* — and the transition object is, by construction, the next
main body already dealt ahead of the player, on the far side of the frontier from the Earth, never
behind it. Read literally, the new era now grows from the direction opposite the one the old
metaphor assigned it: not up from the ground the observer stands on, but outward from the point
furthest from that ground the player has yet reached.

The honest reconciliation is this. What the old argument was really protecting — *the observer's
standpoint changes and the traveller's does not* — is kept, verbatim, as [PROGRESSION.md](PROGRESSION.md)
now states it: nothing in `src/simulation.js` resets, pauses meaningfully, or is told an era has
changed, so the flight is unbroken across every transition exactly as it always was. What is lost
is the *picture* that used to make that claim visible rather than merely asserted: there is no
longer a moment where a new sheet's own bottom edge stands for a century returning to the ground
to look up. The claim is now true by construction of the simulation's state rather than true by
the geometry of what is drawn, and those are not the same kind of true. There is a second, smaller
casualty worth naming honestly: the old file made era IX's turn special precisely because it broke
the Earth-rising rule — "the first sheet not drawn from the Earth" — as the ladder's one deliberate
rhyme-breaker at its close. Under the ten-step transition every era's turn now grows outward from
the traveller rather than rising from the Earth, so the gesture that used to be reserved for the
ladder's very last turn is now how all eight of them work, and the final turn can no longer claim
that particular distinction for itself. Whatever marks the Probe's turn as the ladder's true close
now has to be found elsewhere — in what decays, in what the frontier is made of, in the fact that
nothing grows after it — not in being the one turn that does not rise from the ground. This is
carried to [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) rather than resolved here by fiat.

One thing is not in tension at all and is worth keeping separate from the above: the brief's own
constant, [OBSERVER-CORE.md](OBSERVER-CORE.md)'s point, at the working end of whatever tool
survives from era to era. Where the old file located the traveller's continuity in "the game
already draws the player as a pen," that was only ever true of one era's shipped tool. What
actually continues, across all eight, is the point the pen, brush, pointer, alidade, quill, lens,
sensor and replication core all carry at their tip — which is a stronger, more literal claim than
a pen ever was, and it is the thing the brief actually asks the player to recognise as themselves
turn after turn.

## The brightness class and the opening triad, unchanged

**A brightness class per node** remains the only differentiation eras I to V draw among bodies.
Each main node carries a magnitude class, seeded on the same six-class distribution the
background stars already use (`src/plates.js`'s `mag` assignment and its engraved glyph set), and
it is what a phenomenon's *size and prominence* communicate before an era has anything else to say
about it — brighter reads bigger and more central to the plan a player is making, exactly as it
would to a naked eye with no instrument at all.

**The opening triad on the Rock** stays three bodies in three brightnesses — the Moon for Tiro, a
bright star for Adeptus, a faint star for Magister — standing in for the ocean, ringed and
volcanic worlds later eras use to make the same three pressures legible before any caption can.
"Open on" is retired from this pass entirely ([PROGRESSION.md](PROGRESSION.md)), so the triad is
no longer a special case needing reconciliation with a run that might start somewhere else on the
ladder: every run opens on the Rock, so this is simply where the run, and the families, begin.
`DIFFICULTY_FAMILY` still applies from era VI onward, once a body has a family to apply it to.

## The table

Rebuilt in full for the eight-era roster. "Point" or "disc" means a body carrying only the era's
brightness-class grammar, with no surface; a family name in the Understood column is drawn with
that family's own painter, in the era's own hand.

| Era | Phenomenon | Observation | Understood | The Moon | Caption | Wrong belief kept |
|---|---|---|---|---|---|---|
| I · [The Rock](01-rock.md) | an ochre dab in one of three brightnesses | struck in stages: one scratch or dab, then repeated dabs and tallies circling the ring, then a closed sign-form — a ring, a row of ticks, a cup-and-ring | a remembered pattern, held rather than named | a kaolin-pale disc with a few manganese dabs — the one body this era's naked eye can differentiate at all | none; no script exists | — |
| II · [The Ceiling](02-ceiling.md) | a faint star, or a dim disc — a ghost of a register position | a contour is painted, pigment fills it, a register line or a decan marker takes shape around it | a named, ordered element of the cosmic order: a decan seated in its hour, or one of four deities in a barque | a flat painted disc among the decans, placed in the order but given no face | the hieroglyph name column — "Horus who bounds the Two Lands" beside Jupiter's barque, on the ceiling's own evidence | — |
| III · [The Scroll](03-scroll.md) | an isolated point, unnamed, joined to nothing | a disc is placed against its neighbours first, never a silhouette; a brush-line then joins it to its asterism; the enclosure or mansion's own boundary line and a school-colour close around it | a cataloged member of a named asterism (a "star office"), seated in its enclosure or mansion, coloured to the school whose observation it descends from | 月, the one point the twenty-eight mansions exist to measure the Sun and the five wanderers against | a kaishu caption naming the asterism and the school, set once per run the first time that school's colour is drawn | — |
| IV · [The Astrolabe](04-astrolabe.md) | an unadorned point of light, unsighted | a thin engraved arc grows around it, ticked and unlit at first, filling into a genuine partial scale as the alidade sweeps through it | a precisely measured phenomenon: the closed ring's ticks in gilt, an abjad-numeral value lettered beside it in naskh, the manuscript disc nested inside | the crescent, whose sighting sets the calendar this era actually keeps | naskh beside the closed ring — `964 · ṢUWAR AL-KAWĀKIB AL-THĀBITA` for the catalogue this era measures into | — |
| V · [The Engraving](05-engraving.md) | a point marked only by a faint construction circle | thin contour lines and hatching accumulate into a lettered figure, a Greek letter fixed to it as it resolves | a documented illustration: a Bayer letter, a name, a magnitude given by the size of the printed dot alone | a plain disc carrying its naked-eye blotches, read as Plutarch's hollows and heights — the reading Galileo's own telescope is about to overturn | the Bayer letter and Latin name, dated | the outer sphere of fixed stars as literally unchanging — breaking within this era's own span, at Tycho's parallax of the nova of 1572 and the comet of 1577 *(general history of astronomy, not run through this pass's own research file)* |
| VI · [The Lens](06-lens.md) | a blurred point, or an unresolved disc | *the era's richest cell — three registers, below* | a resolved world: a ring, a terminator, a band, a cap, a patch, named and dated to the observation that first drew it | Galileo's terminator, mountains and craters, 1610; Riccioli's *maria*, named in 1651 though they hold no water | Fell italic, dated — `1610 · SIDEREUS NUNCIUS` | Saturn's handles, 1610–1659; Herschel's three lunar volcanoes, 1787, and his solid, inhabited Sun, 1795; Lowell's canals, 1894–1909; Vulcan, 1859–1915 |
| VII · [The Flyby](07-flyby.md) | a bright point with a small halo, its size and rim carrying the read tracking alone can give | scan lines fill top-down from capture; by recognisable, a mosaic's tiles lock and a stated false-colour pass names a real boundary; by complete, the seams resolve to one disc or a shape-model mesh closes whole | a mapped world: sensed becomes a place with coordinates, gaining an instrument margin — scale bar, filter label, credit line — only now, on arrival | Apollo's photographed, landed-on surface — the first body in the game a human actually stood on | a mission label, dated — `1965 · MARINER 4` for the first cratered Mars | — this is the era that corrects the Lens's wrong beliefs, Mariner 4's cratered Mars chief among them, not one that keeps a new one of its own |
| VIII · [The Probe](08-probe.md) | a sensed mass, its class unconfirmed | the readout ticks in digit by digit — mass, density, a periapsis pair — as the class icon resolves around it | the sensed mass, the readout and the material at once: a body autonomously catalogued and priced for the harvest | no privileged body; the Moon's old exception — the one face this ladder always differentiated — is finally retired, because every body is read the same class-first way | a frame counter and a class tag, not a year — the far future keeps no calendar a caption would set a date against | — |

## Where the Lens needs three cells, not one

The Lens absorbs three of the old ladder's eras — the resolving telescope, the plate, the rendered
measurement — and it is, by a wide margin, the richest and most staged cell in the table, and the
one carrying the most wrong beliefs of any era on the ladder. Its Observation column earns its own
paragraph rather than a phrase.

**Register one, the resolving telescope (1610–1887).** At capture the tube's focus is still soft;
by recognisable, it has thrown off whichever first reading the century actually saw — Galileo's
handles on Saturn, a terminator and craters on the Moon, a spot on Jupiter, a cap at a Martian
pole; by complete, that first reading has resolved into its better answer where one exists within
the register — Huygens's ring in 1656–59, Cassini's spot tracked to 1713 — and stays an open
reading where it does not.

**Register two, the plate (1887–1958).** A body appears as a bare point on the glass; a held
orbit brings up successive rings of density exactly as a tray print develops, highlights first,
the faint outer wash last. This register carries the era's single richest story: the dune family
develops, at a glance, as Lowell's canals, ruled straight across the disc and dated `1895`; under
the held orbit those same canals resolve into Antoniadi's irregular patches of 1909, and the sheet
corrects itself in ink beside the first annotation rather than erasing it, exactly as the plate era
corrected itself in the historical record.

**Register three, the rendered measurement (closing the era in 1990).** A composite assembles
filtered channel by filtered channel into the rendered sphere the game already ships as
`PLATE_STYLES.modern`; the instrument margin — scale bar, filter label, epoch — arrives only once
the composite is complete, the same discipline [research/observatory.md](research/observatory.md)
documents for the material this register inherits. Exactly how this register's own capture and
recognisable beats are keyed is [06-lens.md](06-lens.md)'s own work to settle once it is revised
past its current, still-titled-for-the-old-plan draft; this file states only that it exists as a
third stage between the plate and the Flyby's own black space, not that its render-side beats are
finished.

## Where the pattern holds and where it breaks

The "wrong belief kept" column stays empty for eras I through IV, and for most of V, for the same
reason the earlier draft found: a culture has nothing to be wrong about on a body's *surface*
until it claims to have seen one, and before the telescope every claim on the ladder is about a
body's position, its name, or its place in an order, not its face. The Engraving's one entry is a
claim about the *heavens*, not a body, and is kept distinct from the Lens's five for exactly that
reason — it is the hinge era, still counting stars by eye, already capable of proving the sky
itself can change. The column carries real weight twice more after that: full for the Lens, which
resolves points into worlds and sometimes resolves them wrong; corrective rather than mistaken for
the Flyby, which spends its own entry undoing the Lens's canals rather than adding a fresh error of
its own. It falls silent for good at the Probe, whose vocabulary — sensed mass, a readout, a
material — is simply what its own instruments say in the moment they say it, with no dated history
behind it left to have gotten wrong.

## Still open

Carried to [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md): the checkpoint angles and the ledger constants
they share with [PROGRESSION.md](PROGRESSION.md), both pending the `verify.mjs` probe; whether the
completion flourish is enough feedback without a gauge; the Lens's third register's own beats,
left to [06-lens.md](06-lens.md); the Scroll's caption layout, vertical column against a horizontal
HUD line, per [research/china.md](research/china.md) §4; and the space/time argument's own open
wound above — what, if not rising from the Earth, now marks the Probe's turn as the ladder's true
close.
