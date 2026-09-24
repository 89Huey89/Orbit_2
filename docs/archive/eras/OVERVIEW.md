# The ascent through time

> **Superseded in part.** The progression system this file describes — a ladder climbed inside a
> single run — is not the design being built. [JOURNEY.md](JOURNEY.md) is the controlling document;
> its "What this overrides" table names exactly which claims below are now stale. What this file
> says about the eras themselves still stands.

Orbit is a star atlas, and the history of the star atlas *is* the history of astronomy, which
means the game already owns the subject a progression through time would be about: it does not
have to invent a fiction to justify changing its look, only to admit which century a body was
last drawn in. What that history now says, taken in full, is that a node was never a picture
waiting to be skinned — it is a phenomenon, and orbiting it is the act that turns it into
knowledge, in the hand of whichever century is currently held. The player is not the tool that
century puts around them, not the burin, the brush, the pointer, the quill, the lens, the hull or
the replicator; the player is the small constant point of curiosity those tools carry at their
working end, and across eight eras the tool is replaced eight times while that point never is.
This document sets out the ladder those eras stand on, the decisions that make it one game rather
than eight, the five rules every era answers to, and the order to build them in.

The game today ships almost entirely inside what is now era VI, the Lens — the six catalogue
plates, the Latin captions, the lettered hands — and era II, the Ceiling, already has a working
renderer, `src/ceiling.js`, whose player-drawing alone is stale. Nothing else on the ladder exists
in code. Nothing in this document describes shipped behaviour except where it says so.

## The decisions that shape everything

**Nodes are phenomena first, knowledge second, and orbiting is what changes that.** Every body a
run meets now carries three states rather than one picture: a *phenomenon*, legible only as a
position, a capture-region size, and whatever a body's class demands for gameplay planning
(drifter, fader, sling, a dangerous neighbour); an *observation*, in which the era's own recording
process runs, visibly, on the body while the orbit is held; and an *understood* object, the body
as that century could actually know it. The clock this runs on is `player.orbitSweep`, the radians
already swept since capture and already tracked by `src/simulation.js` — the right clock because
ninety degrees is ninety degrees on every ring the game will ever draw, independent of a body's
size or speed, which a time-based reveal could never promise. Nothing that a trajectory depends on
is ever staged or withheld; only identity is. This is the flip side of the boundary behind the
player, which no longer erases a universe — it erases a *representation* of one, in the material
of whatever era drew it, which is why the player can never go back and why the game does not
pretend to simulate a persistent solar system. See [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)
for the states and [THE-FRONTIER.md](THE-FRONTIER.md) for the boundary that follows them.

**The era is reached by observing, not by scoring.** The old plan gated eras on total score; that
gate is retired because it rewarded a number instead of the mechanic the whole plan is now built
on. Each era instead carries its own observation ledger: every capture contributes a share of a
threshold, weighted so a completed observation counts roughly three times a bare one, and once the
ledger passes it the era is *armed*. The next main node the run has already dealt — never a new
spawn, never a second call to the seed — is then *designated* the transition object and drawn as
one; it is captured exactly like any other body. This is deliberate to the point of being the
single most load-bearing engineering decision in the plan: because nothing is inserted into the
chart and `this.random()` is never called again mid-run, the two invariants `verify.mjs` already
holds the game to — one seed deals one chart, and how a run is flown cannot change the chart it is
dealt — survive the whole progression system by construction. The ten-step transition itself, and
what the ledger's constants are provisionally set to, are in [PROGRESSION.md](PROGRESSION.md).

**The run is two nested structures: a finite civilizational climb opening onto an infinite one.**
Human history is finite, and the ladder respects that literally — reaching era VIII, the Probe,
ends the historical progression permanently. No ninth era, no invented future century, no further
transition of any kind. From that point the run does not stop; it escalates on machinery the game
already has, the same row-driven scaling that already governs darkness speed, chart growth and
hazard density, turned up rather than replaced: larger transfer gaps, stranger configurations,
higher speeds, more exotic fields. This is where high-score play actually lives, and it is the
run's real length. [PROGRESSION.md](PROGRESSION.md) covers what has to give for it, which is
smaller than it sounds.

## The rule that makes this affordable

**An era is a plate. A chapter is a scene inside the run.** These stay two axes and they never
merge. The **era** is the art direction *and* the economy row: global, cached, armed by the
observation ledger, entered at the next capture through the ten-step transition. Eight exist on
the ladder now, two of them shipped in part. The **chapter** is the simulation's own row-based
escalation — which hazards a row may carry, which constellation is dealt next — and it never
learns anything about the era, so one seed still deals one chart on every sheet regardless of
which century is holding it.

The payoff is what happens once the ladder runs out. After era VIII there is no era IX to reach,
so the era axis simply stops moving — it is pinned, permanently, at the Probe — and the chapter
axis is the only one left standing. Endless mode therefore costs nothing new to invent: it is the
chapter escalation the game already runs, with its one hard ceiling,
`chapter = Math.min(3, Math.floor(world.progress/8))`, lifted past the point era VIII used to be
the end of the story. That is the entire engineering bill for a run that never has to stop.

## The ladder

| | Era | When | Controlling document | Currency | Knowledge gain |
|---|---|---|---|---|---|
| **I** | [The Rock](01-rock.md) | c. 40,000–3,000 BCE | Lascaux, the Hall of the Bulls | ochre | phenomenon → memory |
| **II** | [The Ceiling](02-ceiling.md) | c. 1473–1458 BCE | Senenmut's astronomical ceiling, TT353 | the *khar* | phenomenon → named, ordered element |
| **III** | [The Scroll](03-scroll.md) | c. 649–684 CE | the Dunhuang star chart, BL Or.8210/S.3326 | the *mò*, the brush | individual light → catalogued relationship |
| **IV** | [The Astrolabe](04-astrolabe.md) | 964–1437 CE | al-Ṣūfī's catalogue, read through the instrument | the *ḥibr* | visible object → measurable object |
| **V** | [The Engraving](05-engraving.md) | c. 1540–1610 | Bayer's *Uranometria*; the atlas page | ink, the quill | observation → recorded knowledge |
| **VI** | [The Lens](06-lens.md) | 1610–1990 | Galileo → the Carte du Ciel → the rendered sphere | exposure | light → world |
| **VII** | [The Flyby](07-flyby.md) | 1965– | Mariner 4, Voyager, the mission mosaic | propellant | world → place |
| **VIII** | [The Probe](08-probe.md) | the far future | the von Neumann probe | mass | place → autonomously explored world |

Era VI carries three registers rather than one sheet — the resolving telescope, the photographic
plate, the rendered measurement — because all three are one epistemology, resolving a point at a
distance into a world, and its climax is the shipped `PLATE_STYLES.modern` renderer. Era V inherits
the pre-telescopic half of what used to be drawn under the old sixth era: the hand-drawn atlas
page, lettered but not yet resolved into anything the eye alone could not have composed. Neither
file is finished under this plan; both carry real shipped fragments.

The two ends still rhyme, but not the way they used to. The first era marks a rock because nothing
else in its century would last long enough to be found; the last sends out a machine built to
outlive the civilization that made it. Both are the same gesture — commit the sky to a medium that
survives its author — aimed in opposite directions across the whole span of the ladder.

Each era's own file carries its documents, grammar, palette, lettering, currency, dangers, its
bodies — what its century could know of them — and its signature sheet. Beneath each sits a longer
research file in [research/](research/); beneath most of them, though not yet the two newest, a
standalone art prototype in [prototypes/](prototypes/). [PROTOTYPES.md](PROTOTYPES.md) records how
each existing prototype fared against the shipped standard and which painter reached it.
[ERA-AUDIT.md](ERA-AUDIT.md) carries the missing contract for every era — universe model,
controlled-object ontology, body horizon, feared sky, evidence boundary — and
[CANDIDATES.md](CANDIDATES.md) holds the traditions that were considered for the spine and did not
make it onto this ladder.

## The five rules every era answers to

An era that breaks any of these is a different game, not another plate.

1. **The simulation stays DOM-free and era-light.** `src/simulation.js` learns about the era in
   exactly three places: the economy row, the observation ledger, and the one node designation a
   transition needs. Hazard rules, spawn rules and row escalation never consult it, because the
   moment any of them did, two runs at the same row could stop meaning the same thing depending on
   which era happened to be showing — and the game would owe two explanations for every number
   instead of one.
2. **Every era speaks in its own hand, and never borrows another's lettering.** The rock has no
   words and says so with dots and tallies; the ceiling letters in hieroglyph columns; the scroll
   writes in brush-drawn Chinese characters keyed to its three schools of stars; the astrolabe
   engraves Arabic star names into brass; the atlas page sets Bayer's Latin captions by hand; the
   lens prints a mission label or a FITS header depending on its register; the flyby logs telemetry
   in a mission's own typeface; the probe engraves a single stroke and reports in a data frame. An
   era that reaches for another era's type has not actually been built yet, whatever else it does
   correctly. [LETTERING.md](LETTERING.md).
3. **Every era keeps the same orbit and hazard vocabulary, and reveals a body only as far as its
   century could know it.** Rings, rims, capture bands, release ticks, hazard fields and the
   frontier's shoreline read identically on every sheet, because that vocabulary is how a
   trajectory is judged and judging a trajectory can never depend on which century is showing. What
   changes, and only this, is what a body looks like once it is orbited — driven by the swept arc,
   never by a clock, and never withholding anything the player needs to fly.
   [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md).
4. **No dependencies, no external resources.** The build fails outright if the bundled page
   references anything over the network. Every era's faces are embedded and cut to what its atlas
   actually sets; every era's art is generated, not fetched.
5. **The Observer Core is constant.** Whatever else an era changes about the tool surrounding it —
   its silhouette, its material, its motion — the point at that tool's working end does not change:
   not its shape, its size, or its behaviour, across all eight eras. It is one of exactly two things
   a transition carries across the boundary uncut; the transition object is the other.
   [OBSERVER-CORE.md](OBSERVER-CORE.md).

## Build order

Build the spine before any new sheet, then outward from the eras nearest to what already exists,
then the eras that ask for the most invention.

What follows is the shape of the climb. The stage-by-stage order the work is actually done in —
each stage costed against the code, with the assertions it must not break and the ones it owes —
is [IMPLEMENTATION.md](IMPLEMENTATION.md), which corrects this list in two places where scouting
the code contradicted the plan.

1. **The spine, with no new art.** Retarget `src/reveal.js` from `world.time` to `orbitSweep`,
   generalising the Ceiling's existing four-stage reveal rather than inventing a new one. Add the
   observation ledger and the era-arming threshold; add the transition designation exactly as
   described above, calling `this.random()` nowhere new. Extend `scripts/verify.mjs`'s
   destructuring list for every simulation-side name this introduces, per `CLAUDE.md`'s contract.
   Prove two eras live in one run before a single new sheet is drawn.
2. **Generalise the Observer Core.** `src/effects.js`'s `OBSERVER_MARKS` already draws every
   cosmetic mark in one local frame ending at a shared `markHead()` — that head is the core,
   already built. The work is to key the surrounding tool to the era rather than to player choice,
   add the missing tool geometries, and stop `markHead()` varying at all.
3. **VI, the Lens** — nearest to finished: assemble its three registers around the renderer that
   already ships, and let the Observatory's instrument margin and FITS discipline become its third
   register rather than a ninth era.
4. **II, the Ceiling** — a renderer already exists; only `ceilingDrawPlayer()` needs replacing, the
   night barque stepping aside for a reed brush carrying the core at its wet tip.
5. **V, the Engraving, and VII, the Flyby** — the Engraving keeps the pre-telescopic atlas half the
   old plan already lettered; the Flyby is wholly new construction, the one era built from a fresh
   research file with no prior sheet to inherit from.
6. **IV, the Astrolabe, then III, the Scroll, then I, the Rock** — three eras of one figure hand
   and one face each, in decreasing order of how much of their geometry already has a spike to
   build from.
7. **VIII, the Probe** — last, because its harvest-and-replicate economy and the endless-mode
   chapter-cap lift both need the spine standing first, and because the ladder should close on the
   era it was built toward.

## What an era costs, honestly

Roughly the size of one signature sheet, one reveal implementation keyed to the swept arc, and one
tool geometry for the Observer Core to sit inside — substantial, ordinary work, done once per era
and never revisited as a rewrite. The spine is the only piece of genuinely new engineering in the
whole plan and it is paid exactly once; [ARCHITECTURE.md](ARCHITECTURE.md) itemises it against the
code as it stands. [ECONOMY.md](ECONOMY.md) is smaller than the old plan's version of it: one
traversal rule now covers all eight currencies, so what remains to write per era is a name, a
number and a depiction, not a rule of its own.

## Eras considered and not taken

The Disc (the Nebra sky disc, Bronze Age Europe) and the Marble (the Farnese Atlas, Graeco-Roman)
held slots on the old nine-era ladder and do not hold one on this one — the brief's roster has room
for one prehistoric era, not two, and no Graeco-Roman era at all. Both are retired to
[CANDIDATES.md](CANDIDATES.md) with their research and their prototypes intact, alongside the
Babylonian planisphere and the Dresden Maya codex as the strongest candidates for a ninth or tenth
era should the ladder ever grow past eight again. The Disc's punch-and-foil grammar was also
proposed and refused as a costume for era I's transition object: a culture may not appear as
decoration inside another culture's sheet, and the Bronze Age is not Palaeolithic vocabulary. The
mechanical prototype that pairing produced, `prototypes/turn-rock-disc.html`, survives as a study
of the page turn itself, not of that costume.
