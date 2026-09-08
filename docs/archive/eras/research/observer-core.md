# Research — The Observer Core and the player tool through the eras

Deepens [ERA-AUDIT.md](../ERA-AUDIT.md)'s player through-line for the new brief's own roster of
eras (a draft brief outside this repository, referred to here only as "the brief," which supersedes
the shipped nine-era plan under [OVERVIEW.md](../OVERVIEW.md)), and answers the
invariant that brief adds and the audit's ladder never had: one constant point of view riding at the
working end of eight otherwise-unrelated historical tools. Historical claims below draw on general
knowledge and search results gathered in an earlier research pass; this pass's own network egress is
restricted and could not re-fetch or re-verify any external URL as currently resolving, so §5 cites
every external source by title and publisher only, with no live link, rather than assert a URL this
pass cannot stand behind. Several claims — spacecraft instrument layout, the shipped
telescope/quill marks' exact intent — rest on this document's own reading of the repository or on
general technical knowledge rather than a checked source, and are flagged **(unverified)** in place
rather than smoothed into the attested material around them, per house style.

## 1. What the engine already does — the base this design stands on

Before inventing anything, the codebase already half-answers the brief. `src/effects.js`'s
`drawPlayer()` translates the canvas to the player's exact simulated `(x,y)`, rotates it to the
current heading (`Math.atan2(p.vy,p.vx)`), and only then calls one of `OBSERVER_MARKS` — the
catalogue's five interchangeable glyphs (comet, quill, telescope, moth, Saturn-with-handles). Every
mark is drawn in that same local frame: heading along `+x`, **the moving point at the origin**. The
file's own comment states the rule outright: "every mark is cut in the same local space — the
heading along `+x`, the moving point at the origin — and every one ends with the same head, so the
actual position stays legible over a pale planet whatever is chosen." The shipped quill goes
further and states the identity explicitly: "the nib leads, cut to a point at **the traveller's
exact position**." **Attested** (verified by reading `src/effects.js` and `README.md` this
session): the origin of that local frame is not a decorative choice, it is already `world.player`'s
real coordinate. A per-era Observer Core does not require a new field in `simulation.js` — which
`CLAUDE.md` requires to stay DOM-free — because the point the brief wants to keep constant is
already the one point every mark is built around. The work is: stop treating that point as merely
where the marks happen to converge, and start drawing something there on purpose, on top of and
independent of whichever tool silhouette currently surrounds it.

Two more existing patterns matter directly. First, **head and trail are already separate systems**:
`OBSERVER_MARKS` paints the instrument every frame from `world.player`'s velocity and the chosen
cosmetic, while `drawTrail()`/`drawInkPath()`/`trailInk()` paint the flown route from an independent
`trail`/`inkPath` buffer, coloured by a separately-registered `inks` plate token
(`sanguine`, `goldleaf`, `bistre`, …). Whatever a tool's "medium" is — ochre dust, wet pigment, ink,
engraved geometry, exposure, telemetry — can keep changing every era without touching how the head
itself is drawn, because the game already does not conflate the two. Second, **legibility is
already solved by a keyline-then-fill recipe**, used on both the shared `markHead()` and the quill's
own custom head: a dark keyline shape, then a mid-tone fill, then a small bright highlight, plus, on
the paper plate specifically, "a ring of reserved, unprinted sheet" left bare around the mark so ink
never has to fight ink. That three-layer recipe — dark ring, coloured body, bright accent — is the
one piece of rendering grammar in this file that is reused rather than reinvented for the Observer
Core (§3.5).

## 2. The eight tools

| # | Era | Player tool | Real active end | Orientation to tangent | Trail medium (brief) |
|---|---|---|---|---|---|
| 1 | Prehistory | ochre crayon | the ground, faceted point | point leads | ochre/charcoal trace |
| 2 | Egypt | rush/reed brush | the frayed bristle fan | fan leads, flat-on | painted pigment stroke |
| 3 | China | armillary sighting tube | the forward sight aperture | barrel lies along tangent | ink |
| 4 | Islamic Golden Age | alidade | the forward sighting pinnule | the whole rule *is* the tangent | measurement line / engraved geometry |
| 5 | Renaissance | quill | the nib point (shipped) | point leads | quill ink |
| 6 | Telescopic | refracting telescope | the eyepiece/focal point | tube leads, objective forward | optical clarity / exposure |
| 7 | Space Age | probe/orbiter | the sensor boresight | instrument face forward | propellant / telemetry |
| 8 | Autonomous | von Neumann probe | the replication core | omnidirectional; forward by convention | energy / autonomous mapping |

### 2.1 Prehistoric marking implement — the ochre crayon

The real object is not the flint burin the era's engraved tallies imply but a shaped lump of ochre
itself. **Attested**: pieces of ochre "bearing several heavily ground facets converging into a
point are often described as 'ochre crayons'"; at Blombos Cave, South Africa (Still Bay layers,
c. 90,000–70,000 years old), such a crayon was used to produce cross-hatching directly on a silcrete
flake, the contact facet 1.3–2.9 mm wide — the c. 73,000-year-old drawing itself is published in
Henshilwood et al., *Nature* 2018, "An abstract drawing from the 73,000-year-old levels at Blombos
Cave." One source notes the terminology is contested in the other direction from the game's own
caution: "the term crayon can incorrectly suggest these were used as utensils to mark surfaces when
their intended use is often unclear" — so the object's *shape* (a ground stone point) is attested,
its exclusively mark-making *use* is a **plausible reconstruction** at best, exactly the standard
[rock.md](rock.md) already holds every claim from this era to.

The active end is the worn facet itself — not a fine point like a quill's nib, but a small flat
plane narrowing to a rounded apex, the record of the stone being dragged and rotated against a hard
surface. Orientated forward along the tangent, it should read, at arcade scale, as a short, blunt,
irregular wedge — no aerodynamic vane, no feather, no barrel: this era's tool is a fist-sized mineral
lump, not an instrument, and should look heavier and less resolved than every later tool. It has no
attested trailing analogue to a feather or a vane, so a trailing element must be invented outright:
a **fictional gameplay translation** proposal, grounded in the material rather than borrowed from a
later era's grammar, is a crumbling dust-streak — flecks of ochre powder shed by a soft stone dragged
at speed — which also answers [rock.md](rock.md)'s and the brief's own darkness language ("ochre fades,
scratches crumble, rock surface flakes away") with the same particle system already used for the
crumbling boundary, rather than a new one.

### 2.2 Egyptian reed brush (not the solar barque)

The brief is explicit that the barque is demoted to a level motif; the player tool is the writing
implement of the astronomical-ceiling tradition itself. **Attested**: before the Roman period,
Egyptian scribes wrote with thin rush stems — *Juncus maritimus*, not true reed (*Phragmites*) — cut
to length (surviving specimens 16–23 cm), the tip cut on a diagonal and then bruised and chewed so
its own fibres frayed into a small chisel-shaped brush, used through the New Kingdom, roughly
1567–1085 BCE; palettes carrying this equipment survive from the tombs of Tutankhamun and Ramesses
II. That bracket safely covers both ceilings the brief cites by name — Senenmut's TT353 and Seti I's
tomb — placing the rush-brush, not the later cut-and-slit reed *pen* (the *qalam*), as the
period-correct object. This is worth stating as a small correction in the house style of
[globe.md](globe.md)'s Marsh-144 note: **the Egyptian reed brush and the Islamic-era reed pen are not the same
technology**, even though both are casually "a reed" in English — a brush holds and lays down
pigment by capacity and dabbing, a slit pen draws ink by capillary flow along a cut channel — and
Orbit should not let era 2's and era 4's tools converge on one silhouette just because both stems
are cut from a hollow plant.

The active end is the frayed fan of fibres at the tip, not a point. At arcade scale this is the
tool's whole visual argument: where the quill (era 5) and the crayon (era 1) both converge on a
single leading point, the brush should read as a small blunt fan of three to five short diverging
strokes, flat rather than needle-shaped — a silhouette difference cheap to hold at a dozen pixels and
one that also matches the era's own grammar ([ERA-AUDIT.md](../ERA-AUDIT.md)'s "flat colour, no
chiaroscuro" and the brief's "matte pigments, subtle relief only"). Orientated fan-first along the
tangent, trailing a plain, unbarbed reed shaft with no feather — the New Kingdom rush has no vane to
flex, so the "breath"/flex animation the quill's vane currently uses is not available to this era and
should not be borrowed; the fan's own bristle-lines fraying and re-settling in flight is the correct,
attested-in-shape substitute.

### 2.3 Chinese armillary-inspired pointer

**Attested**: Chinese armillary spheres carried a hollow sighting tube — 窺管, *kuīguǎn*, "peering/
viewing tube" — mounted in the innermost ring, used to point directly at a target star; Guo
Shoujing's 1276 *jiǎnyí* (簡儀, "simplified instrument") is the best-documented example, and earlier
Song-dynasty spheres (associated with Su Song's astronomical clock tower) combined the same tube
with an outer graduated ring system; a documented refinement even adds a "front sight" to the tube
to improve pointing accuracy — functionally a foresight, the same idea an alidade's forward pinnule
serves (§2.4), embodied as a barrel instead of a flat rule. The brief is right to worry that a fine
brush alone would make this era feel like "another brush era"; the sighting tube gives it a wholly
different silhouette-class object while still letting the *trail* stay brushed ink, exactly because
the engine already keeps head-mark and trail-medium in separate systems (§1) — the tool can be a
rigid metal cylinder while the route it leaves behind is inked, with no conflict.

The active end is the tube's forward sighting aperture — the open muzzle end that is literally
pointed at the observed star, the direct astronomical equivalent of a modern gunsight or scope. It
should be orientated with its long axis exactly along the flight tangent, the same convergence an
alidade gets in era 4, but differentiated in silhouette by keeping the tube visibly nested inside one
or two thin concentric graduated rings — a small ring-and-tube reading, distinct from era 4's flat
double-vaned rule and distinct from the "ringed" planet family's own cup-and-ring motif by being
metal-toned and mechanically rigid rather than a body's surface pattern. At arcade size this reads
as: a short barrel, capped by one or two fine encircling arcs, brush-marked ink ticks along the
ring's rim standing in for the sphere's own graduated divisions — three shape primitives, matching
the two-to-four-primitive ceiling the shipped `telescope()` and `saturn()` marks already hold to.

### 2.4 Alidade

Deepened already by [globe.md](globe.md) §2's instrument grammar; this section adds only
what the *player-tool* framing needs. **Attested**: an alidade is a straight rotating rule fitted
with two pinnules (sighting vanes) at its ends, each pierced with a hole or slit; the user rotates it
until a target lines up through both vanes, or — for the sun, sighted indirectly for safety — until
one vane's shadow falls precisely on the other. Mounted on an astrolabe's back, it is the instrument
that turns a flat brass disc into a measuring device; [globe.md](globe.md) separately documents the
rete — the astrolabe's pierced star-map — as a related but distinct object, "a pierced, openwork map
of it," which should not be confused with the alidade itself.

The active end is the forward sighting pinnule — conventionally whichever vane the observer's eye is
not pressed against. Its orientation is the one genuine convergence in this whole roster: an
alidade's entire function *is* to be a straight line laid exactly along a sightline, which makes it
the one tool whose real-world geometry is already isomorphic to Orbit's own pricked aim-guide line.
That is a legibility risk worth naming rather than only an elegant coincidence: if the alidade's own
drawn length approaches the guide-line's length, the two will visually fuse into one line at arcade
scale, and the player will lose the guide's function of showing the *predicted* path versus the
tool's function of showing the *current heading*. The mitigation is to keep the drawn alidade
markedly shorter and visibly metallic — an engraved brass rule with two small pierced roundels at
its ends — so it reads as an object riding on the guide line rather than as an extension of it, the
same way the shipped quill's ~16–43-unit body is already far shorter than any drawn transfer line.

### 2.5 Quill

Already shipped and already fully attested by the game's own documentation: `README.md` describes
"an engraved quill whose nib leads, cut to a point at the traveller's exact position and turned
along the flight, with the barrel and feather trailing behind it," flexing back "as the flight
quickens" with a "bead of wet ink at the point." The real object — a flight feather, historically
goose or swan, cut to a nib and split so ink is drawn along the split by capillary action — needs no
further research; what this document adds is only the observation that this is the one tool whose
code (`OBSERVER_MARKS.quill` in `src/effects.js`) is the existing, working demonstration of "active
end sits at local origin, tool trails behind it" that every other era's tool in this roster is being
asked to match. Era 5 costs the Observer Core project nothing new on the tool side; it is the
control case the other seven are checked against.

### 2.6 Optical instrument / focal marker

Also partly shipped: `OBSERVER_MARKS.telescope` already draws a three-section tapering tube with a
faint projected line of sight. The real object is Galileo's refracting telescope — two of his
surviving instruments are held by the Museo Galileo, Florence, and his own account in *Sidereus
Nuncius* (1610) describes an instrument magnifying roughly thirtyfold through a narrow-aperture
objective **(unverified this session against a primary optical-history source; standard figure)**.
The brief's own phrase, "in the optical focus of a telescope," settles a real ambiguity the object
itself raises: a refractor has two candidate "active ends" — the wide objective lens at the front,
where light is gathered, and the narrow eyepiece at the back, where the image is actually resolved
for a human eye. Because the Observer Core is defined as the *point that wants to know*, not the
point that gathers light, it belongs at the eyepiece — the position a viewing eye would occupy — which
in the shipped code sits near local origin, just behind the tube's own leading, wide end. This is a
**fictional gameplay translation** of where "the player" sits relative to a historically accurate
instrument, but a deliberate and defensible one: it is the same choice era 8 will need to make again
for a sensor with no eye at all (§2.7–2.8).

Orientation follows the shipped convention: tube leads objective-first along the tangent, sightline
projecting slightly ahead of it. At arcade scale the telescope's whole legible argument is already
proven by the shipped mark — three narrowing rings plus a faint forward line — and needs no revision;
what changes for this document's purposes is only that the Observer Core itself, not the shared
`markHead()` bead, now occupies the eyepiece position the tube's back end already implies.

### 2.7 Spacecraft

General engineering knowledge rather than a single checked source **(unverified — no primary source
fetched this session; drawn from the well-known configuration of deep-space probes such as Voyager
and Cassini)**: an uncrewed interplanetary probe typically separates its "speaking" apparatus — a
dish antenna aimed at Earth for telemetry — from its "looking" apparatus — a remote-sensing
instrument package or scan platform aimed at the target body, carrying cameras and spectrometers on
a boresight distinct from the antenna's boresight. This duality maps cleanly onto Orbit's existing
ink/observation split: the dish is the tool's connection to the resource economy (telemetry, the
brief's named era-7 currency) while the sensor boresight is where *seeing* actually happens. The
Observer Core belongs at the sensor boresight — the instrument's aim point — not at the dish, exactly
the same "looking end, not telling end" choice era 6 made between eyepiece and objective. This is a
**fictional gameplay translation** of a generic, unnamed spacecraft rather than a documented mission
craft, consistent with the brief's own framing of era 7 as "a real spacecraft / scientific probe"
without naming one; naming a real mission (Voyager, Cassini, Pioneer) would invite exactly the kind
of specific, checkable claim this document has not verified and should not assert.

Orientation: the sensor face points forward along the tangent, matching every other era's convention,
while the dish — if drawn at all — trails or sits to one side, subordinate in the silhouette the way
the quill's barrel and feather are subordinate to its nib. At arcade scale this should resolve to a
compact angular body, one flat instrument face forward, one small dish or boom offset behind it — a
silhouette deliberately more rectilinear and mechanical than any tool before it, marking era 7's
"first major conceptual break" (the brief's own words) at the level of pure shape as well as of
setting.

### 2.8 Von Neumann probe

No real object exists; the concept is theoretical. **Attested**: John von Neumann's work on
self-reproducing automata, formalised as "universal assemblers," was published posthumously in 1966
(*Theory of Self-Reproducing Automata*, ed. Arthur Burks) — von Neumann himself never applied it to
spacecraft, a link later theorists made. **Attested**, and the closest thing to a concrete
engineering design this idea has ever received: NASA's 1980 study *Advanced Automation for Space
Missions* (ed. Robert Freitas and William Zachary) described a self-replicating lunar factory built
from a roughly hundred-tonne landed "seed" package containing mining equipment, chemical processors,
fabrication tools and assembly robots, alongside Robert Freitas's own 1980 *JBIS* paper estimating
the size and composition of a self-reproducing interstellar probe. Neither source describes a small,
single, mobile "probe" of the kind Orbit needs to draw — both are factory-scale industrial concepts —
so almost every visual detail of era 8's tool is necessarily a **fictional gameplay translation**;
what is attested is only the underlying structural idea, that such a machine's essential, irreducible
part is a self-contained replication "seed" that must survive intact in every copy the machine makes
of itself.

That structural idea gives era 8 its cleanest possible answer to "active end." The brief's own
phrase — "at the heart of the final von Neumann probe" — should be read literally: the Observer Core
sits at the probe's replication core, the one component every daughter probe must inherit unchanged,
because a copy that lost or corrupted it would stop being the same lineage. This is the strongest
thematic closure available anywhere in the roster: the fiction's own logic (a self-replicating
machine's core must survive every copy) and the brief's mechanical requirement (the Observer Core
must survive every era transition) are, at this final step, literally the same statement. A probe
whose outer silhouette incorporates fragments of whatever body it last harvested — mismatched,
scavenged, no two probes drawn quite alike — would dramatise "the tool changes, the core does not"
more completely at this era than at any other, though that scavenged-parts silhouette is itself
proposed here, not attested anywhere.

## 3. The Observer Core, concretely

### 3.1 The shape

**The Observer Core is a bare point: a small filled disc, rendered with the same dark-keyline-then-
bright-fill recipe the shipped head already uses, and nothing else.** Argued against each
alternative the brief itself names:

- **A spark.** A spark implies transience and directionality — a brief flare with a trailing streak —
  which both overstates the Core's presence (it is meant to be the one thing that is *always* there,
  not an event) and risks being read as a particle effect, a category the engine already has a great
  many of (release blots, ripple bursts, screen flashes) that are explicitly bounded, faded, and
  reduced-motion-suppressed. A permanent identity marker should not share a visual vocabulary with
  disposable effects that the reduced-motion path is allowed to delete.
- **A four-pointed star.** Rejected for a concrete rendering reason, not a taste preference: every
  mark is drawn inside `ctx.rotate(Math.atan2(p.vy,p.vx))` (§1). A four-pointed star fixed to the
  local axes would visibly spin with every orbit the player holds — and Orbit's whole loop is holding
  orbits — which both looks busy at the exact moment the player most needs a stable thing to track,
  and starts to function as an unwanted direction indicator, precisely the failure mode the brief
  names explicitly ("a direction indicator that duplicates the aim guide"). Counter-rotating just the
  Core to keep it upright is *possible* but adds a second transform path the simplest option does not
  need, for a shape whose extra points buy no information a rotation-invariant disc doesn't already
  give.
- **A cross.** Rejected on the same rotational grounds as the star, plus a content reason a renderer
  can't fix: a cross is a loaded sign in several of the exact cultures this roster passes through —
  running it unaltered through an Islamic-era alidade and a Chinese armillary pointer risks reading as
  a specific religious symbol smuggled into eras that have their own, different, attested sign
  systems ([rock.md](rock.md)'s dot/spiral vocabulary, [globe.md](globe.md)'s naskh/kufic captions).
  A shape with no prior cultural charge is the safer constant to run underneath eight different
  cultures' own iconography.
- **A ring.** Rejected because the game already has a ring economy: orbit rims, capture-band
  ripples, the Scutum shield's pulsing ring, the Repulsa charge's broken wider ring (`drawPlayer()`'s
  own `p.shielded`/`p.reflectorArmed` arcs, §3.4). A ring-shaped Core sitting at the same scale as
  those existing rings would either get lost among them or be mistaken for one — exactly the "HUD
  anchor" and "duplicated state" failure the brief warns against, because every ring already drawn in
  this codebase carries a meaning (a shield charge, a capture event) the Core must not.
- **A bare point.** What is left, and what is chosen: a point is rotation-invariant by construction
  (no orientation to counter-rotate, ever), carries no prior iconographic charge to collide with any
  era's own sign system, and does not compete with any shape class the engine already uses for
  stateful UI. It is also, simply, the most literal rendering of the brief's own closing sentence —
  "the player is the point that wants to know what comes next" is already a description of a dot, not
  a spark, star, cross or ring.

### 3.2 Size

Relative to the tool, small enough to read as a point rather than a shape at every scale the tool
itself uses. The shipped player body already ranges roughly 16 local units (orbiting) to 43 local
units (full-boost flight, `length=flight?23+boost*20:16` in `src/effects.js`), and the shared head's
own keyline ellipse spans roughly 10–11 units across. The Core should sit at roughly 15–20% of the
tool's own resting length and well under half the head's own diameter — in the same register as the
existing nib bead's radius (`(1+charge*.5)*(.4+inkHeld*.6)`, roughly 0.4–1.5 units before the global
`scale` multiplier), but **fixed** rather than charge-modulated (§3.3). At the game's typical
viewport scale this puts the Core at only a few screen pixels across — smaller than the tool's own
silhouette, exactly the relationship a focal point should have to the instrument built around it: a
telescope's eyepiece is a small fraction of the tube, an alidade's pinnule-hole a small fraction of
the rule, a probe's core a small fraction of its hull.

### 3.3 Behaviour, and the rule that keeps it honest

The cleanest guarantee a renderer can give that the Core never leaks game state (§3.6) is
architectural, not a drawing convention someone has to remember: **the Core's paint function should
take no arguments describing world state — no charge, no ink level, no speed, no shield — only a
size and its two fixed colours.** Every other mark in `OBSERVER_MARKS` already takes `(length, boost,
breath, charge, inkHeld)`; the Core function should take none of it. That single signature difference
is what makes the four required moments trivial to define:

- **During flight**, the Core does not pulse with speed or boost — the surrounding tool may flex,
  taper, or trail exactly as it does today, but the Core's own draw call is identical at the opening
  pace and at the chart's top speed.
- **On capture**, nothing changes about the Core at all, because nothing about the local origin
  changes at capture — `world.player`'s position is continuous across the capture event by
  construction, and the Core is drawn at that position every frame regardless of orbiting state.
- **On release**, likewise nothing: the existing release effects (the ink bead pooling, the ripple at
  the vacated rim) belong to the *tool* and the *trail*, both of which already have their own,
  separate draw paths (§1); the Core has no release-specific behaviour to add, and adding one would
  be the first crack in the "no state" guarantee.
- **At an era transition**, the Core is the one draw call that must not even be conditional on which
  era is active. The transition is implemented entirely on the *tool* side: call the old era's
  `OBSERVER_MARKS` entry and the new era's entry in the same frame with complementary alpha,
  crossfading one silhouette into the other over roughly a second or two — the same technique the
  game already uses for a chapter's page turn — while the Core's own unconditional draw call sits
  underneath or on top of both, unchanged, for the whole dissolve. The player's eye keeps exactly one
  thing to hold onto while everything else around it rebuilds itself, which is the entire point of
  the brief's "no cut" requirement: the Core does not survive the transition because it was specially
  protected during it, it survives because it was never touched by transition logic in the first
  place.

### 3.4 Reading against eight grounds

Night indigo, cream laid paper, torchlit limestone, painted plaster, an ink-washed scroll ground,
cream manuscript vellum or engraved brass, photographic dark-glass, and finally unrelieved black
space: the Core has to read against all eight without being re-themed per era, because re-theming it
is exactly what would make it stop being constant. The fix already exists in the codebase in two
independent places and only needs generalising: the shared head's dark keyline ("keylined
light-on-dark so the moving point stays legible over a pale planet") and the paper plate's separate
"ring of reserved, unprinted sheet" around the same mark are the same idea solved twice for two
different grounds. Register the Core as its own plate colour pair — a dark ring token and a bright
fill token — and pin every era's definition of that pair to the same *relationship* (a near-black
ring, a near-white or near-maximum-brightness fill) rather than letting it drift with each era's
palette the way every other colour in the game correctly does. This keeps the engineering convention
`CLAUDE.md` states — colour is a plate token, never hard-coded at the draw site — while making the
Core the one token in the whole game whose *appearance* is deliberately pinned near-constant across
every plate that defines it, which is the render-side expression of "the Observer Core does not
change."

### 3.5 What must never be drawn on it

- **No HUD anchor.** Nothing — a score note, a leader line, a caption — should terminate specifically
  at the Core's own coordinates as a UI element. The survey system already letters constructions
  beside orbit rims and release points (`surveyLetter`, `surveyNumeral` in `src/effects.js`); those
  anchor to the *geometry of the flight*, not to the Core, and that distinction should hold exactly as
  it does today.
- **No health or resource value.** The nib's existing wet-ink bead already brightens with `charge`
  and dims with `inkHeld`; that behaviour belongs to the *tool's* charge indicator, a separate, nearby
  paint call, and must never be merged into the Core's own draw call — precisely the merge the
  no-arguments rule in §3.3 makes structurally impossible rather than merely discouraged.
- **No direction indicator.** No wedge, notch, or asymmetric mark on the Core pointing anywhere. Two
  systems in this game already carry direction unambiguously — the tool's own asymmetric silhouette
  (nib leading, tube leading, sensor face leading) and the pricked aim/release guide — and a third,
  redundant arrow on the Core would not add information, would break the rotation-invariance argument
  in §3.1, and is the literal negative case the brief names.

## 4. Risks and open questions

- **The alidade/guide-line convergence (§2.4) is a real legibility risk**, not a hypothetical one: it
  is the one era where the tool's own geometry and the existing pricked preview line want to occupy
  the same visual role. Build one alidade sprite early and check it against a live transfer preview
  before committing the era's full art, the way [`docs/archive/eras/02-ceiling.md`](../02-ceiling.md)
  recommends spiking its own quadrats first.
- **Pinning the Core's colour pair near-constant across every plate (§3.4) is a deliberate exception
  to an otherwise strict rule** — every other colour in the game is free to vary per era/plate. Flag
  this exception explicitly wherever the plate tokens are documented, so a future contributor does not
  "fix" the Core to match its era's palette and quietly undo the one thing it is for.
- **The von Neumann probe's scavenged-parts silhouette (§2.8) is proposed, not attested**, and is the
  single largest art commitment in this document with no historical object to check it against; it
  should be validated as a prototype before the ladder's final era is built, exactly as
  [`docs/archive/eras/prototypes/`](../prototypes/) already does for the shipped nine-era plan's own late
  entries.
- **The Egyptian rush-brush vs. Islamic reed-pen distinction (§2.2) is easy to lose in production**
  if both are ever described in shorthand as "a reed" — the two objects differ in mechanism (paint
  held and dabbed vs. ink drawn by capillary flow) as well as in date, and collapsing them would
  quietly undo the very differentiation the brief asks era 3 to have from "another brush era" one
  level up.
- **Spacecraft and probe sections are the least independently checked** in this document (§2.7,
  §2.8) — general configuration knowledge rather than a session-verified primary source. Treat any
  specific mission or instrument name introduced later against these sections as needing its own
  check, not as inheriting verification from this pass.

## 5. Sources

None of the URLs originally gathered for these sources could be re-fetched or confirmed resolving
from this pass — this environment's network egress is restricted and every fetch attempt during
verification failed at the proxy, for domains including Nature, Science.org, Wikipedia, Royal
Museums Greenwich, and daviddarling.info. Rather than assert links this pass cannot stand behind, or
risk one drifting or fabricated among them, every external source below is cited by title, author,
and publisher only, with no URL attached. A contributor with working web access should re-run these
searches and restore links once confirmed live.

- Henshilwood, Christopher S. et al., "An abstract drawing from the 73,000-year-old levels at
  Blombos Cave, South Africa," *Nature*, 2018.
- "Unveiling the multifunctional use of ochre in the Middle Stone Age: Specialized ochre retouchers
  from Blombos Cave," *Science Advances*.
- "Early example of ancient ochre crayon discovered near prehistoric lake," HeritageDaily.
- "Egyptian Reed Pen," on *Juncus maritimus* preparation and Brooklyn Museum specimens (Amanda
  Eckard).
- Wikipedia, *Juncus maritimus*.
- "Scribal Palette," Institute of Egyptian Art & Archaeology, Memphis.
- "simplified armillary," China Digital Science and Technology Museum, on Guo Shoujing's 1276
  *jiǎnyí* and its sighting tube.
- Wikipedia, *Guo Shoujing*.
- "Armillary Sphere (Part 1)," Hong Kong Space Museum, Curator's Blog.
- "Comparison of Armillary Sphere in Ancient China and Western World," MDPI.
- Wikipedia, *Alidade*.
- Royal Museums Greenwich, "What is a mariner's astrolabe?"
- Wikipedia, *Mariner's astrolabe*.
- "A Self-Reproducing Interstellar Probe," R. Freitas, *JBIS*, 1980 — title and abstract found via
  an earlier search pass; the full page could not be fetched even in that pass, per this document's
  original note, so its content beyond the title/abstract is not relied on here.
- "Near-term self-replicating probes – A concept design," *Acta Astronautica*, ScienceDirect.
- "von Neumann probe," summary of the 1966 *Theory of Self-Reproducing Automata* and the 1980 NASA
  study *Advanced Automation for Space Missions*, daviddarling.info.
- Repository sources read directly this session: [`README.md`](../../../README.md),
  [`src/effects.js`](../../../src/effects.js), [`src/marks.js`](../../../src/marks.js),
  [`docs/archive/eras/ERA-AUDIT.md`](../ERA-AUDIT.md), [`docs/archive/eras/OVERVIEW.md`](../OVERVIEW.md),
  [`docs/archive/eras/research/globe.md`](globe.md), [`docs/archive/eras/research/rock.md`](rock.md).
