# The Observer Core

The player was never really the burin, the reed brush, the sighting tube, the alidade, the quill,
the telescope, the sensor, or the replication core. Each of those is what a century put in the
player's hand, and each of them is discarded at the next transition. What is not discarded is the
point the brief names directly: "the player is the point that wants to know what comes next." That
point has a name in this plan — the Observer Core — and it is the fifth rule
[OVERVIEW.md](OVERVIEW.md) adds to the four the game already answered to, because it is an
invariant the old plan never had to state: *whatever else an era changes, the point at the tool's
working end does not.*

This document is the plan drawn from [research/observer-core.md](research/observer-core.md), which
is the design authority for every historical claim below and for the argument, made once and in
full there, against each rejected shape. Read it before touching this file. What follows states
what was decided, not why in the same depth.

## What it concretely is

**The Observer Core is a bare point: a small filled disc, drawn with the same dark-keyline-then-
bright-fill recipe the shipped head already uses, and nothing else.**

**Shape.** A disc, chosen over a spark, a four-pointed star, a cross, and a ring — the four
alternatives the brief itself gestures at by naming a "small bright star, spark, cross, glowing
point." A spark reads as an event, not an identity, and shares a visual class with the game's own
disposable particle effects (release blots, ripple bursts), which is the wrong company for the one
mark that must never look temporary. A star or a cross fixed to the local frame would visibly spin
through every orbit the player holds — which is to say, through most of the game — turning the one
thing meant to hold still into an unwanted direction indicator, the exact failure the brief names
by name. A cross additionally carries a specific religious charge in several of the cultures this
ladder actually passes through, which a shape with no prior iconographic weight avoids by
construction. A ring collides with an economy the game already runs — orbit rims, capture bands,
the shield's pulsing arc, the reflector's broken one — every one of which already means something a
Core must not borrow. A disc is rotation-invariant, culturally inert, and shares no shape-class
with any other stateful mark in the game. It is also, read plainly, the most literal rendering
available of the brief's own sentence: a point that wants to know is a dot, not an event.

**Size.** Small enough, against every tool that will ever surround it, to read as a point and never
as a shape. Fixed at roughly 15–20% of the tool's own resting length and well under half the
diameter of the shared head's existing keyline ellipse — the register the nib's own wet-ink bead
already occupies (`(1+charge*.5)*(.4+inkHeld*.6)` local units in `src/effects.js`), except fixed
rather than charge-modulated, for the reason below. At the game's ordinary viewport scale this is a
few screen pixels across on every tool from the crayon to the probe: smaller than the instrument
built around it, which is the correct relationship between an eyepiece and a tube, a pinnule-hole
and a rule, a replication seed and a hull.

**Behaviour.** One rule makes every case below fall out for free rather than needing to be
remembered separately: *the Core's paint call takes no arguments describing world state — no
charge, no ink level, no speed, no shield.* Every other mark in `OBSERVER_MARKS` takes
`(length,boost,breath,charge,inkHeld)`; the Core's does not. A function that cannot read state
cannot leak it, which is a stronger guarantee than a drawing convention someone has to remember.

- **In flight**, the Core does not pulse with speed or boost. The tool around it may flex, taper,
  or trail exactly as it does today; the Core's own draw call is identical at the opening pace and
  at the chart's top speed.
- **On capture**, nothing changes, because nothing about the local origin changes at capture:
  `world.player`'s position is continuous across the event by construction, and the Core is drawn
  at that position every frame regardless of orbiting state.
- **On release**, likewise nothing. The ink bead pooling, the ripple at the vacated rim — these
  belong to the tool and the trail, which already have their own separate draw paths (below); the
  Core has no release-specific behaviour to add, and giving it one would be the first crack in the
  no-state guarantee.
- **When the era's capacity runs low**, the tool shows it — the nib's bead dims as `inkHeld` falls,
  and every other era's own currency depletion reads the same way on its own tool, per
  [ECONOMY.md](ECONOMY.md). The Core does not dim, brighten, or otherwise register the resource
  reading empty. A starved point is legible on the instrument holding it, never on the point itself.
- **At a transition, the Core is one of exactly two things that survive it**, the transition object
  being the other. It survives not because transition logic specially protects it, but because
  transition logic never touches it in the first place — see below.

**The argument against the alternatives**, restated at the altitude this plan needs: every rejected
shape fails for a reason specific to what already exists in this codebase, not on taste. A spark
fails against the particle system. A star or a cross fails against `ctx.rotate` and against the
brief's own warning. A ring fails against the shield, the reflector, and the capture band. A disc
fails against nothing the game already draws, which is exactly why it is the one shape available to
be the constant.

## The eight tools

| Era | Tool | Active end | Orientation to the flight tangent | Evidence |
|---|---|---|---|---|
| I · [The Rock](01-rock.md) | ochre crayon | the worn, faceted contact point of the ground stone | point leads, blunt and irregular — no aerodynamic vane | shape: attested (Blombos ground-ochre crayons); mark-making use: plausible reconstruction |
| II · [The Ceiling](02-ceiling.md) | rush brush | the frayed fan of bruised fibre at the tip | fan leads, flat-on, no point | attested (New Kingdom rush-stem brushes, c. 1567–1085 BCE) |
| III · [The Scroll](03-scroll.md) | armillary sighting tube | the forward sighting aperture, nested inside one or two thin graduated rings | barrel lies exactly along the tangent | shape: attested (窺管 *kuīguǎn*, Guo Shoujing's 1276 *jiǎnyí* and earlier Song instruments — the best-documented form, but Song and Yuan, three to six centuries after this era's own 649–684 CE window); use in this era: plausible reconstruction |
| IV · [The Astrolabe](04-astrolabe.md) | alidade | the forward sighting pinnule | the whole rule *is* the tangent — kept visibly shorter than the aim guide so the two never fuse into one line | attested (standard astrolabe alidade) |
| V · [The Engraving](05-engraving.md) | quill | the nib point (shipped) | point leads | attested — the shipped control case |
| VI · [The Lens](06-lens.md) | refracting telescope | the eyepiece, near the tube's trailing end, not the objective | tube leads objective-first, sightline projecting ahead | object: attested (Galileo's refractor); eyepiece-not-objective as the Core's seat: fictional gameplay translation |
| VII · [The Flyby](07-flyby.md) | probe / orbiter | the sensor boresight, not the antenna dish | instrument face forward; the dish trails or sits offset, subordinate in the silhouette | unverified — generic deep-space probe configuration, no named mission |
| VIII · [The Probe](08-probe.md) | von Neumann probe | the replication core | omnidirectional; forward by convention only | structural idea attested (von Neumann self-reproducing automata, 1966; NASA's 1980 *Advanced Automation for Space Missions*); the probe's own form: fictional gameplay translation |

Two placements above are decisions, not transcriptions, and are stated as such rather than smoothed
into the attested material beside them. A refracting telescope has two candidate active ends — the
objective, where light is gathered, and the eyepiece, where an image is actually resolved for an
eye — and the Core is defined as the point that wants to know, not the point that gathers light, so
it sits at the eyepiece. A deep-space probe has the same duality between a dish that speaks to
Earth and a sensor that looks at the target; the Core sits at the sensor for the identical reason.
Era VIII's answer is not a choice at all in the same sense: the brief's own phrase, "at the heart of
the final von Neumann probe," is read literally, and the fiction's own logic — a self-replicating
machine's core must survive every copy — and the brief's mechanical requirement — the Core must
survive every era transition — are, at this last tool, the same statement rather than two that
happen to agree.

One legibility risk is named rather than deferred: the alidade (era IV) is the one tool whose
real-world geometry is already a straight line laid along a sightline, which is also what Orbit's
own pricked aim guide already is. Build that sprite early and check it against a live transfer
preview before committing the era's full art, the way [`prototypes/`](prototypes/) already asks
other spikes to be checked.

## The code base it stands on

This is not new engineering, and stating that plainly is part of the plan. `src/effects.js:381–524`
already defines `OBSERVER_MARKS`, five interchangeable marks — comet, quill, telescope, moth,
Saturn — each drawn in one local frame: the canvas translated to `world.player`'s exact simulated
`(x,y)`, rotated to the current heading (`Math.atan2(p.vy,p.vx)`), heading along `+x`, the moving
point at the origin. Every mark that does not cut its own point ends by calling the shared
`markHead()`, and the shipped quill states outright, in its own comment, that its nib is "cut to a
point at the traveller's exact position." **`markHead()` is the Observer Core, already written.**

Two consequences follow directly, and both matter to `CLAUDE.md`'s contract for this codebase.

First, **no new field in `src/simulation.js` is needed.** The point the brief wants held constant
is already the one point every mark is built around; nothing about a per-era Observer Core requires
the simulation to know anything new. `src/simulation.js` stays exactly as DOM-free as
[OVERVIEW.md](OVERVIEW.md)'s rule 1 already requires, and the Core is entirely a render-layer
decision sitting on data the simulation was already producing.

Second, **head and trail are already separate systems**, and the Core rides that separation rather
than needing a new one: `OBSERVER_MARKS` paints the instrument every frame from `world.player`'s
velocity and the chosen cosmetic, while `drawTrail()`/`drawInkPath()`/`trailInk()` paint the flown
route from an independent buffer, coloured by whichever `inks` plate token the era or unlock
selects. Whatever a tool's medium is — ochre dust, wet pigment, ink, engraved geometry, exposure,
telemetry — can keep changing every era without the Core's own draw call ever needing to know about
it.

The work this plan actually adds, against that base, is threefold: key the tool to the era instead
of to player cosmetic choice (below); draw the six tool geometries the game does not yet have
(the crayon, the brush, the sighting tube, the alidade, the sensor probe, the replication core —
the quill and the telescope already ship); and **stop `markHead()` varying**
— give it the fixed, argument-free signature §"Behaviour" above requires, so it is structurally the
same call on every plate rather than a shared default that happens to look constant today.

## The catalogue marks become era V's tool variants

`OBSERVER_MARKS`'s five shipped marks are not five eras' worth of tool. The brief's roster gives
each of the first four a distinct historical instrument (§"The eight tools"), which leaves the
comet, the moth, and Saturn — none of which is any era's historically grounded tool — without a
slot on the ladder as anything other than what they already are: cosmetic choices inside one era.

They become **era V's tool variants**, on exactly the footing [OVERVIEW.md](OVERVIEW.md) already
gives the six catalogue plates as treatments of one printed atlas page: a cosmetic unlock inside the
Engraving, never a choice between eras and never a choice of core. The quill remains era V's default
tool; the comet, the moth, and Saturn become alternate cuts of the same era's instrument, unlocked
the way the plate treatments already are, each one still ending at the same unconditional
`markHead()` call regardless of which cut is showing. A cosmetic unlock may choose the quill's cut.
**It may never choose the Core.** There is no unlock, achievement, or plate treatment anywhere in
the catalogue that substitutes a different shape, size, or behaviour for the disc — that is the one
thing about the player's tool that stays outside the cosmetic system entirely, for the same reason
it stays outside the era system.

## How a tool transforms at a transition without a cut

[PROGRESSION.md](PROGRESSION.md)'s ten-step transition names the Core twice — step 6, "the Observer
Core remains," and step 8, "the player's surrounding tool transforms into the new era's
instrument" — and the render-side answer to both is the same technique already in the codebase for
a change of century, applied to the tool rather than to the sheet behind it: **cross-dissolve, not
a cut.** Call the outgoing era's `OBSERVER_MARKS` entry and the incoming era's entry in the same
frame, at complementary alpha, over roughly the second or two a transition already takes to ease the
world's forward advance per [PROGRESSION.md](PROGRESSION.md) step 2. The burin fades as the reed
brush fades in; the alidade fades as the quill fades in; and so on down the ladder. Underneath or
astride both silhouettes for the whole dissolve, the Core's own unconditional draw call runs once,
unchanged, exactly as it does on an ordinary flight.

This is the entire mechanical content of "the Core does not survive the transition because it was
specially protected during it" (`research/observer-core.md` §3.3): there is no transition-specific
branch in the Core's own code to write, because the Core was never conditional on era in the first
place. The only new work is the tool-side crossfade; the Core's contribution to a transition is to
keep doing exactly what it does on every other frame of the game.

## What must never be drawn on the core

- **No HUD anchor.** No score note, no caption, no leader line may terminate at the Core's own
  coordinates as a UI element. The survey system already anchors its lettering to the geometry of a
  flight — orbit rims, release points — never to the Core, and that distinction holds exactly as it
  does today.
- **No capacity value.** The tool's own charge or ink indicator — the nib's bead brightening with
  charge and dimming with `inkHeld` is the shipped example — is a separate, nearby paint call
  belonging to the instrument, never merged into the Core's draw call. The no-arguments rule under
  "Behaviour" makes this impossible to do by accident, not merely discouraged.
- **No direction indicator duplicating the aim guide.** No wedge, notch, or asymmetric mark
  anywhere on the Core pointing anywhere. Direction is already carried, unambiguously, by two other
  systems — the tool's own asymmetric silhouette (nib leading, tube leading, sensor face forward)
  and the pricked aim/release guide itself — and a third arrow on the Core would add no information
  while breaking the rotation-invariance the whole shape argument rests on. This is the brief's own
  named failure case, stated as a rule rather than left as a warning.

## The solar night barque, retired

The old era II renderer, `src/ceiling.js`, draws the player as the solar night barque — Ra's vessel,
rowed and steered, its heading eased frame to frame in `ceilingDrawPlayer()` (`src/ceiling.js:1350`).
The brief is explicit that this is wrong for what the player now represents: "the previously
designed solar barque should NOT be the player." It is retired as the player character in full, per the brief — only `ceilingDrawPlayer()` itself is
replaced; the roughly 1,700 remaining lines of `src/ceiling.js` are untouched.

It does not disappear from the era. The barque is a real and specific object in the astronomical
tradition this era is built from — the vessel that carries the sun and the circumpolar gods across
the night sky in Egyptian funerary cosmology — and that is exactly the register the brief asks it to
keep: **a motif in the level and in the sky, which is what it always was before it was mistakenly
given the wheel.** Apep, the Eye of Ra, Shu, Nun, and the barque itself belong to the wider set of
mythological figures this era already carries as gameplay furniture — hazards, backdrop, the wider
astronomical register `research/ceiling.md` documents — never as the vessel the player is flying.

In its place: a rush brush, per §"The eight tools", carrying the Observer Core at the wet tip of its
frayed fan. The brush is what a New Kingdom astronomer-priest actually held; the barque is what the
sky itself was understood to be carrying. Keeping both, in their correct roles, is a small
correction with a large payoff — it is also the first concrete instance, at the very first fully
built era, of the whole document's central claim: the tool the player holds is what history put in
their hand, and the sky the player is watching is never the same thing as that tool.
