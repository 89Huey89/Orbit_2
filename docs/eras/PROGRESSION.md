# The run is the progression

How a single run climbs the ladder, what a held orbit earns, and how the sky is redrawn without a
new sheet being laid over the old one.

## The shape

Every run opens on the Rock and climbs. That much survives from the first version of this plan.
What does not survive is the gate: the old plan advanced an era on total score, a number the
player never sees change shape and that has nothing to do with what the player just did in orbit.
The new gate is **observation** — the thing [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) already
asks every era to do, which is show a body only as far as its century could know it, through three
states (phenomenon, observation, understood) staged on the arc actually swept in orbit. The run's
progression is now built from the same clock the reveal already runs on, rather than from a second
number kept beside it. An era ends not because a threshold in an invisible ledger was crossed by
some run of good landings anywhere on the chart, but because the player kept looking — captured
bodies, and held some of those orbits long enough to see them documented.

Score still exists, is still recorded, and still drives the catalogue's unlocks exactly as it does
today; [ECONOMY.md](ECONOMY.md) covers what changes there, which is one multiplier at release, not
the meaning of the number. What score no longer does is decide the century. That job belongs to
the observation ledger below.

## The observation ledger

Each era carries its own accumulator, held on the world alongside the economy row `ECONOMY.md`
already gives it, reset to zero the moment the era it belongs to opens. Per `CLAUDE.md`'s and rule
1's own constraint, it lives in `src/simulation.js`, not in a render file: an era reaches the
simulation in exactly three places now, the economy row, this ledger, and the transition
designation below, and nothing else.

A body captured in the current era contributes, once, at the moment of capture:

```
0.35 + 0.65 × documented        documented = clamp(orbitSweep / 240°, 0, 1)
```

`orbitSweep` is not a new number. `OrbitWorld` already tracks it — set to zero at every capture
(`src/simulation.js:309,572`) and accumulated every frame an orbit is held (`:689–690`) — and today
it reads out as nothing but the slingshot's charge fraction. `documented` is the same fraction the
release dividend will read once [ECONOMY.md](ECONOMY.md)'s completeness-scaled refill lands, so the
ledger and the resource share one computed value rather than two clocks drifting apart. A tap-and-
run capture always banks the floor, `0.35`; a body held to full documentation, past about 240° of
swept arc — [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)'s own "complete, nothing further is
gained" checkpoint — banks the full `1.0`, a touch under three times as much. The floor exists so a
hurried run is still climbing the ladder, not stalled on it; the multiplier exists so the ladder
rewards the game's new central mechanic, holding an orbit to watch a body come into focus, rather
than a parallel one it has to be reconciled against.

When an era's ledger crosses its own threshold, the era is **armed**. Armed is not the same event
as the transition: it is the signal that the next eligible body in the chart already dealt ahead of
the player is to be drawn and treated as the transition object, covered next.

**These numbers are provisional, stated as such, and are not a design the ladder is committed to.**
`0.35`, `0.65` and 240° are chosen to match the checkpoints
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) already proposes and to keep a rushed capture
meaningful without making a lingered one mandatory; the per-era thresholds that this ledger is
compared against are not chosen at all yet. They are exactly the kind of number the old score
thresholds were, and they fail the same way if fixed by feel: `scripts/verify.mjs` already flies
sixty seeded courses through row 48 with a tangent-seeking pilot (the loop that opens with "A
tangent-seeking pilot uses the stars and follows the generated main route"), and that loop is the
instrument to tune against, not a guess. Extend it to sum this ledger at every capture and log the
curve — the ledger's value at each row, across all sixty seeds — the same way the old plan proposed
printing the score at each row. Read the curve, place each era's threshold where the median run
would reach it at a defensible pace, and only then hold the median run's first few eras to
[OVERVIEW.md](OVERVIEW.md)'s own pacing goal for antiquity. Nothing about the shape of the ledger
depends on where the thresholds land; only the thresholds do.

One naming trap is worth flagging before it is built: `src/simulation.js` already has an
`OBSERVATIONS` table (the named feats — `THREE PERFECT TRANSFERS`, `THE FORTIETH ROW`, and the
rest, `:159`). The era's per-run accumulator is a different thing entirely and must not be given
that name or a variable that shadows it; call it something the feats table cannot be mistaken for,
such as `world.era.ledger` or `p.eraDocumented`, when it is built.

## The transition object is a designation, not a spawn

This is the single most important engineering decision in this pass, and no future rewrite of this
document may weaken it.

Once an era is armed, the game does not create anything. It **designates**: the next eligible main
node already dealt in the chart ahead of the player — a body `OrbitWorld`'s deterministic,
seed-driven generation was always going to place there, on the main route rather than on one of the
chart's optional three-star detours — is flagged as the transition object and drawn with that
object's own treatment. It is captured exactly as any other node is captured: same rings, same
capture band, same release tick, same tangent geometry. The brief's requirement that it be "a
normal gameplay target" is met literally, because it is one.

The alternative this rejects is a **spawn**: creating a new node, positioned and timed by whatever
moment the ledger happened to cross its threshold, and inserting it into the chart the player is
mid-flight through. That moment depends on how well the run has been played — how many bodies were
held for a full documentation, how many were tapped and left, how fast the player is moving through
the chart when the threshold falls. A spawned object's position would therefore be a function of
play, not of seed, and two identical seeds flown two different ways would face the transition body
in two different places, at two different times, possibly mid-transfer with no rim to aim at. That
breaks both of `scripts/verify.mjs`'s load-bearing invariants at once: `'One seed deals one chart'`
(`scripts/verify.mjs:684`) stops being true the instant a node's existence depends on anything but
the seed, and the checklist's own "one seed deals one chart however it is flown" stops being true
the instant a node's *position* depends on how the seed was flown. A spawn would also mean calling
`this.random()` at a point in the run no longer fixed by the chart's own generation order, which is
precisely the thing the daily plate's premise — the same date deals the same chart to everyone
([DANGERS.md](DANGERS.md)) — cannot survive.

Designation calls `this.random()` nowhere it was not already going to be called. The chart the
player is flying was always going to have a next main node at that row; the only thing arming adds
is a flag on data that already exists, read once by the renderer that draws it and once by whatever
names the era's completion. Fly the same seed twice, once briskly and once holding every body to
full documentation, and the *set of bodies in the chart, their positions, their order* are
identical in both playthroughs — only *when* the ledger arms, and so which of them ends up carrying
the flag, can differ, and that is a difference in when the story of the run turns a page, never a
difference in the page itself. That is what "how a run is flown cannot change the chart it is
dealt" means for a mechanic that has to fire at a moment play itself decides.

"Eligible" is this document's own judgement call, not yet spelled out anywhere else: a main node,
never a pickup and never a node whose only route to it is an optional detour. A detour node cannot
be designated, because a player who skips the fork must still meet the transition on schedule, and
two players who fork differently must still meet the *same* transition body — which only the
guaranteed main route can promise regardless of which detours either of them took to reach it.

## The era's knowledge structure

Every era fills a second thing besides the ledger's number, and the second thing is the one the
player actually sees: a background artefact, built once per era, that grows as the ledger grows and
*is* the progress display. There is no bar, no percentage, no counter. What is on the sheet is the
only account of how far the era has come, exactly as the brief asks and exactly as
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) already argues completion should read off the artwork
rather than a gauge.

- **[The Rock](01-rock.md)** — the remembered sky: struck marks accumulating into the era's own
  memory of what has been seen, not a chart in any modern sense, closer to the tally its lettering
  section already describes.
- **[The Ceiling](02-ceiling.md)** — the decan table filling in, register by register, in the hand
  Senenmut's ceiling already lays out.
- **[The Scroll](03-scroll.md)** — the star chart becoming complete, asterism by asterism, in the
  diagrammatic order [research/china.md](research/china.md) documents.
- **[The Astrolabe](04-astrolabe.md)** — the instrument's own geometry assembling, ring by ring,
  toward the catalogue it was built to read.
- **[The Engraving](05-engraving.md)** — the atlas page becoming populated, plate by plate, the
  way Bayer's own *Uranometria* fills a folio one constellation at a time.
- **[The Lens](06-lens.md)** — the catalogue forming across whichever of its three registers the
  run is passing through: the resolving telescope's log, the survey plate's grid, or the rendered
  measurement's table.
- **[The Flyby](07-flyby.md)** — the mission map completing, frame by frame, the way a real flyby's
  own image mosaic was assembled from a single spacecraft's pass.
- **[The Probe](08-probe.md)** — the daughter's own blueprint assembling from the ancestral plaque,
  filling toward the moment it is complete enough to be copied and launched. Nothing in the brief
  or the decision register names this one; it is this document's own choice, made because the
  probe already carries a plaque and a replication cycle that a filling schematic sits naturally
  beside, and it should be checked against whatever [08-probe.md](08-probe.md) settles once it is
  revised.

**One concession to legibility, and only one.** The moment a body's observation completes —
`documented` reaching `1.0` — may carry a small flourish of the era's own kind: a seal pressed, a
wash of pigment settling, a lock of focus. A player needs to know the well is dry without reading a
gauge, and one honest instant of feedback earns that without becoming a HUD.

## The ten-step transition

The brief specifies the transition as ten ordered steps, and they are adopted here verbatim as the
specification the game is built to, translated into this project's own vocabulary and machinery
where each has an existing home.

1. **The transition object is completed in the visual language of the current era.** It runs the
   same three-state reveal every body runs — phenomenon, observation, understood — finishing as
   whatever "fully documented" already means on this sheet, with no separate treatment marking it
   as special until the steps that follow.
2. **The scrolling movement briefly slows or pauses.** This eases the world's forward advance, the
   camera's own climb through the rows — not the frontier's rate, which [THE-FRONTIER.md](THE-FRONTIER.md)
   holds fixed per era and which this transition does not touch. The two are already separate
   quantities in the simulation, so easing one without the other costs a pacing state, not a new
   physical rule.
3. **The destructive boundary approaches.** Because the frontier's own rate was never eased, easing
   only the world's forward advance lets it visibly close the gap it has always been chasing at.
   This is the transition's one held breath: the player watches the thing that has been pursuing
   them the whole era finally catch up, on purpose, for the first time.
4. **The old visual world disappears.** Not by a sheet being drawn over it — see below — but by the
   frontier's own decay, the same material dissolution [THE-FRONTIER.md](THE-FRONTIER.md) specifies
   for that era, running to completion across everything still on the sheet rather than only the
   band behind the player.
5. **The transition object remains.** It is immune to the decay that is consuming everything else,
   because it is the one thing the new era is about to grow outward from.
6. **The Observer Core remains.** [OBSERVER-CORE.md](OBSERVER-CORE.md) names this as one of the two
   things a transition never touches, and this is where that invariant is spent: the tool around it
   is about to change completely, and the tiny point at its working end is the visible proof that
   nothing about *who* is watching has changed with it.
7. **The same celestial phenomenon is reinterpreted in the next era's visual language.** The body
   under the transition object does not vanish and reappear as something else; it is redrawn, on
   the spot, the way a captured body always is — the same staged reveal every node runs, only run
   once more, this time by the incoming era's own hand.
8. **The player's surrounding tool transforms into the new era's instrument.** The burin becomes
   the reed brush, the sighting pointer, the alidade, the quill, the telescope, the sensor, the
   replication core — [OBSERVER-CORE.md](OBSERVER-CORE.md)'s roster — while the Observer Core at
   its tip, per step 6, does not.
9. **The next visual world grows outward from that body.** Not a new sheet arriving from anywhere;
   the new era's own art direction is generated starting at the transition object's position and
   extends from there as the run continues, the way the chart already generates outward ahead of
   the player rather than being laid down all at once.
10. **Gameplay resumes with the player already safely orbiting the first body of the new era.** The
    transition object *is* that first body — nothing is added, nothing is skipped, and the player
    never stops being in orbit around something real between steps 1 and 10.

## What the transition inherits, and the one thing it does not

Three things this project already animates for a change of century survive the move from a page
turn to a designation, because the brief asks for the same three things in different words.

**The held body is the first thing the new era sees.** Under the old page turn, the body under the
pen at the moment of the transition was the first thing redrawn by the incoming century's painter,
because the turn happened at a capture and the capture was already in progress. Under the ten-step
transition this is stronger, not weaker: the held body is not merely the first thing redrawn, it
*is* the transition object by construction, so step 7's redraw and step 10's resumption are the
same body the player has been orbiting continuously since before the transition began. There is no
moment where the player is in orbit around one body and resumes play around a different one.

**The route is inherited and re-inked in the new hand.** The dried route a run has flown stays on
the chart, registered per plate, so a change of era's rendering re-inks it in the incoming
century's own line without the simulation being told anything happened. That was true of the page
turn and stays true of the designation: nothing about how the route is stored changes, only what
draws it.

**The observer's standpoint changes; the traveller's does not.** [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)
established that a page turn returns the *observer* to the Earth — a new century looking up from
the ground at the same chart — while the traveller's flight, row, position and score run on
unbroken. The ten-step transition keeps exactly this asymmetry: nothing in `src/simulation.js`
resets, pauses meaningfully, or is told an era has changed beyond the three places rule 1 already
names. What changes is only ever the *rendering* of a standpoint, never the state of a flight.

**What is not inherited is the sheet itself.** Under the page turn, a new sheet slid up from below
the frame and covered the old one — two art directions, briefly both on screen, one physically
replacing the other. Step 4 through step 9 above describe something categorically different: there
is no second sheet arriving from anywhere. The old world does not get covered; it decays away,
consumed by the same frontier that has been consuming the trailing rows all era, running now to
completion rather than to a shoreline behind the player. The new world does not arrive fully
formed; it grows outward from the one point that survived the decay, the transition object, exactly
as the ordinary chart already grows outward ahead of the player rather than being laid down whole.
This is the brief's step 9 in full, and it is the one place this document parts ways with
everything the old `PROGRESSION.md` said about page turns: `pageTurn()` and `drawSheetEdge()`
(`src/celestial.js:703,705`) are the two functions that made the old metaphor work, and they are
retired from this role. Whatever replaces them animates a dissolve and a growth, not a slide.

## Endless mode

Human history is finite, and the ladder says so by having eight rungs and nothing above them.
Reaching era VIII's own transition — captured as any other, per the ten steps — ends the historical
progression permanently: no ninth era, no invented future century, no further arming. From there
the run continues exactly as an arcade run always has, until it fails, on machinery the game
already owns rather than anything new: `world.row` already scales darkness speed, chart growth and
hazard density through the same seeded generation that has been running since row one. The one
change endless mode requires of the code is removing a ceiling, not adding a system:
`chapter=Math.min(3,Math.floor(world.progress/8))` (`src/ui.js:402`, and its siblings in
`src/celestial.js:697,736`) caps the escalation that today expresses itself as the four shipped
chapter plates, and that cap has to lift past era VIII or a run that reaches the probe stalls on a
number tuned for a nine-era ladder that no longer exists.

What escalates from there matches the brief's own list and nothing more: larger transfer gaps, more
complex orbital configurations, stronger gravitational anomalies, higher speeds, stranger objects,
more exotic environments — all of it parameter scaling on the spawn rules era VIII already runs
under, never a new hazard rule and never a new era's worth of art. This is where the run's real
length lives and where high-score play has always belonged; the historical climb is the argument,
the endless tail after it is the game.

## What it costs, honestly

- **"Open on" is retired, and not kept as a fallback.** The old plan let a run open on any era
  already reached, to protect the engraving's own work from being passed through in a fraction of a
  run's length. Under an observation-gated ladder that concern is real but the fix is wrong: opening
  on an era mid-ladder would mean designating a transition object for an era whose ledger was never
  filled, in a chart the player never flew the earlier rungs of, which has no answer that keeps the
  designation argument above true. The concern is answered instead by pacing — the engraving's own
  band is tuned to be generous, per [OVERVIEW.md](OVERVIEW.md) — and by the daily, which already
  fixes one seed and one era for everyone and remains the way to spend a whole run inside one
  century. Recorded as a reversible post-ship option in [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md), not
  as part of this design.
- **The six catalogue plates remain [The Engraving](05-engraving.md)'s.** Cellarius, Verdigris,
  Foxed, Proof, Carta azzurra and Sepia are treatments of a printed atlas page, which is what era V
  now is under the split [OVERVIEW.md](OVERVIEW.md) describes; they keep their unlocks and their
  place in the catalogue and do nothing on any other century's sheet. The five catalogue marks
  become era V's tool variants on the same footing — a cosmetic choice inside one era, never a
  choice of Observer Core.
- **`src/reveal.js` is retargeted from `world.time` to `orbitSweep`,** as rule 2 already requires
  for every era's three-state reveal to be readable off the swept arc rather than the clock; this
  document's ledger reuses the same quantity once that retargeting has happened, not a new one.
- **`pageTurn()` and `drawSheetEdge()` lose their old job.** The slide they animate is not what a
  designation does; a decay-and-grow transition is new render work, not a reuse, and is the
  single largest piece of genuinely new engineering this document asks for.
- **The pause in step 2 is a new pacing state.** Nothing in the shipped game today eases the world's
  forward advance independently of the frontier's rate; the two have always moved together. Keeping
  them separate for the length of one transition is small but is not free.
- **`scripts/verify.mjs`'s destructuring list must gain every new simulation-side name** — the
  ledger field, the designation flag, whatever `documented` is called once it is shared with
  `ECONOMY.md`'s refill — per `CLAUDE.md`'s own contract, or the suite silently stops checking them.
- **The score-threshold table is gone, entirely, with nothing standing in for it as a fallback.**
  A run's era is now a question the ledger and the designation answer together; no code path should
  ever again ask what score a player has and answer with a century.
