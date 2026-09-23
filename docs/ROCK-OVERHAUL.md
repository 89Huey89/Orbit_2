# Era I · The Rock — overhaul plan

Status: **in progress (2026-09-23).** The forks below are marked **DECIDED**, with the option that was
chosen; see [Progress](#progress) for what is built and what is left. This is a complete redesign of the era's look, not a
retune of the current wall.

This is a polish pass on a door that already ships (`src/rock.js`, entered from the frontispiece),
not a resumption of the postponed eight-era progression. It needs nothing from that plan and adds no
plumbing toward it.

## Measured against the atlas

The atlas works because it is **a dark ground with crisp, bright line work, drawn live by a hand**:
navy plate, ivory and gold lines, thin marks, and every one of them seen being drawn. The Rock does
the opposite. It fills the screen with a bright, busy raster, and its marks are soft blobs, so beside
the atlas it reads as a texture with a game on top. The redesign takes the atlas's rules across:

| The atlas | The Rock, redesigned |
|---|---|
| Navy plate | Near-black rock, seen only where the torch reaches |
| Ivory line | Kaolin and charcoal line, crisp at phone size |
| Gold, spent sparingly | Red ochre, spent sparingly |
| The pen that draws the chart live | The hand that paints the wall live, by the torch it carries |
| Frame and marginalia | None: the edge of the torchlight is the frame |

## Where the wall stands today

Flown at 430×932 (the reference sheet) through the opening rows, the frontispiece and the end leaf:

| Area | What the player actually sees | Why it fails "Stone Age" |
|---|---|---|
| Ground | Sandy, low-contrast, yellow-green torch pool; black fissures laid over it | Reads as old parchment or plaster, not a cave. There is no depth and no dark. |
| Light | One fixed glow in view space, plus a fixed "fire" in the corner | A cave is defined by the one light that *moves*. Here nothing flickers and nothing follows the hand. |
| Bodies | Soft red and yellow blotches with a faint outline | Look like ink stains or blood spatter, not deliberately pressed dots. |
| Ring | 28 faint red dots, often lost against the wall | Hard to read at phone size. |
| Hazards | Blurred glows and a round black hole | Hard to tell apart from the bodies, and nothing about them says cave. |
| Traveller | A small beige leaf with a glow | Hardly visible. Gives no sense of a hand, a torch or a crayon. |
| Aim guide, trail, route | The atlas's pricked line and quill trail, recoloured | Foreign to the wall (already acknowledged in the README). |
| Forgetting | A zig-zag black polygon | Reads as a mountain skyline. |
| Constellations | Not drawn at all | The era's best subject, animals, is missing. |
| HUD | `ORBIT`, `SPEED ×1`, `FLOW ×3`, `DEEPEST 0`, a modern bar | Identical to the atlas in a slab face. |
| Captions | `PRESSURE SET · MAGISTER`, `PERFECT · MOMENTUM KEPT`, `ANGULUS +10`, "Tap when the pricked line skims…" | Atlas vocabulary. `defineVoice('rock')` sets 5 keys; the Ceiling sets about 15. |
| Frontispiece | No title, the atlas's *Modus operandi* list overlaid on the wall, a ghost `FOLD` button | Nothing welcomes you into a cave. |
| End leaf | A flat dark modern box: "LEFT THE STAR CHART / One more orbit." | Fully the atlas's. |
| Sound | The atlas's chimes | The design (01-rock.md) names five cave sounds; none are built. |

## Art

### A1 · Art direction — **DECIDED: (a) torch in the dark**

* **(a) Torchlit painted panel: Lascaux and Chauvet (recommended).** Warm limestone that falls off to
  real black. Ochre and charcoal animals and signs, lit by the torch you carry. It builds on the
  existing wall bake, and it is the image everyone recognises as "cave painting".
* (b) Pecked petroglyph on dark varnished rock (Twyfelfontein, Valcamonica, Newgrange kerbstones).
  Pale stipple on a dark ground reads very well on a phone. It would, however, throw away most of
  the current bake and move the era's centre away from Lascaux.
* (c) Charcoal only, Chauvet style. Pale wall, black line animals. Elegant but monochrome, and it
  gives up the ochre that the currency is named after.

The rest of this plan is written for (a). Because it is a full redesign, the bright full-bleed wall
goes. Most of the screen is black rock, and the wall bake is only ever seen through the torch.

### A2 · The torch moves with the hand

The single largest atmosphere gain. The torch pool follows the traveller, lagged and smoothed, and
flickers from two incommensurate sine terms plus seeded noise. Reduced motion freezes the flicker.
Beyond its reach the wall falls to near-black (`ambient` drops hard). Bodies and rings stay legible
at every distance, as the rule in 01-rock.md requires: a ring is **never** withheld. Rings far from
the torch still show as faint dots that catch the light. Implemented as a re-centred multiply pass,
so the torch stays one small bake and costs the same per frame.

### A3 · A wall that is a cave, not paper

* Retune the bake: stronger relief shading, deeper hollows, warmer and more saturated limestone,
  and no green cast. Target the doc's `#C7BC9E` only where the torch is closest.
* Large forms: bulges and recesses at body scale. Painters used them, and the bodies already sit on
  a `rockRelief`, so make that relief read.
* Fissures: fewer, and softer at the ends, so they read as cut into the rock rather than laid on it
  as rope.
* **The palimpsest.** Earlier hands' work, faded into the rock and seeded in world space: animal
  silhouettes (aurochs, horse, bison, ibex, deer, mammoth), red hand stencils, finger flutings, rows
  of dots and tectiform signs. This is the one change that makes the wall say "Stone Age" at a
  glance. Everything stays low contrast and out of the flight's way, with the same placement rule the
  fissures already use (it stops at the opening plane).

### A4 · Bodies that look pressed, not spilled

* Tighter dabs with a dry, broken edge instead of a soft gradient, in visible clusters rather than
  one merged blot. The stages on the observation clock stay as they are.
* **Capture = a hand stencil** (from the Names table). A blown-ochre halo around a hand shape blooms
  at the moment of capture and settles into the wall.
* A finished observation seals into one attested sign form: a closed dot ring, a row of tally
  notches, or a cup-and-ring. It is not simply "more dabs".
* The Moon: a kaolin disc with manganese blotches, crisper than today.

### A5 · Constellations become animals

Each of the twelve catalogue figures gets a Palaeolithic animal or sign: aurochs, horse, bison, ibex,
stag, mammoth, cave lion, bear, rhinoceros, the bird-headed man, salmon and owl. The figure is drawn
through its stars in charcoal contour, with ochre wash dabbed in afterwards, and revealed by the
existing living pen. The six-dot cluster over the bull's shoulder is kept as ambiguous as the real
one. This fills the `figure` painter, which is a no-op today.

### A6 · Dangers with silhouettes of their own

* **The Shaft:** a vertical crevice with a pecked rim, not a round hole. It should read as a drop.
* **The Flare:** real fire, with a flame shape, sparks and a soot bloom above it. Kept red-orange and
  clearly distinct from the traveller.
* **The Draught:** smoke streaks and finger flutings dragged across the wall in the wind's direction,
  slowly drifting.
* Unlit rock stays as nothing, by design.

### A7 · The traveller, the guide and the trail in the era's own hand

* Traveller: the ochre crayon drawn larger and warmer, with the glowing contact point. The torch pool
  from A2 is centred on it, so the player *is* the light.
* Aim guide: a row of blown ochre spray dots that thins at the far end, in place of the pricked line.
* Wet trail: a finger-smeared ochre stroke that dries into the route, in place of the quill.
* Charge (slingshot): a spark cluster. Shield: a pecked Newgrange triple spiral. Reflector: a
  reversed hand stencil. Inkwell: a raw ochre nodule. (All from the Names table.)

### A8 · The forgetting

Replace the zig-zag polygon with darkness rising as the torch loses the wall. It is soot and water,
and its edge breaks into flakes and spalls along the rock's own fissure field, so it follows the
wall rather than a sawtooth. Chips fall away and do not float up. Position, rate and grace are
unchanged.

### A9 · Particles and sound

* Particles: torch sparks, an ochre dust puff at capture, charcoal flakes at a graze.
* Sound (all five are specified in 01-rock.md, and `audio.js` already takes per-era rows the way
  the Ceiling uses them): a stone peck at capture, a breath huff at release, a low cave-resonance
  tone on a perfect, a dry charcoal scrape on a graze, a torch hiss into a drip and an echo at loss.

## HUD and screens

### H1 · Numbers — **DECIDED: (a) tallies with a small numeral**

* **(a) Tallies with a small curator's numeral (recommended).** Score is scratched as tally notches
  bundled in fives on a strip of bone or stone at the top. Past 50, bundles collapse into dots, the
  way the prototype does it. A small slab numeral sits beside it as the gloss. The number stays
  exactly readable and the look stays Palaeolithic.
* (b) Pure tallies and dots, with no numerals at all. The most authentic, but a score in the
  hundreds becomes unreadable at a glance.
* (c) Keep numerals and restyle them only. The cheapest, and the weakest.

### H2 · The rest of the HUD

* Drop the `ORBIT` wordmark on this wall. A small pecked spiral stands in its place.
* **Ochre (ink) = the torch's fuel**, shown as a stone fat lamp or a shell palette whose fill drains.
  The torch pool's radius (A2) breathes with it: this is the era's documented rule, "the torch
  breathes", and it is render-only.
* Flow is shown as 1–5 pressed handprints. Speed is shown as a row of sparks, or dropped where flow
  says enough.
* **Deepest:** a faded hand stencil pressed on the wall, in world space, at the row your best run
  reached. You see your old hand as you climb past it, and there is no number in the corner.

### H3 · Words

Fill `defineVoice('rock')` to the Ceiling's coverage: `pressureSet`, `losses` (including "LEFT THE
STAR CHART" → e.g. "THE TORCH LOST THE WALL"), `observations`, `pressures` (three brightnesses
instead of TIRO/ADEPTUS/MAGISTER), `tips`, `held`, `hud`, `opening`, `unrecorded` and
`chrome.instructions`. Where a pictogram can say it (a perfect = a kaolin handprint), the caption is
dropped, not translated.

### H4 · Frontispiece, pause and end

* **Frontispiece:** a composed panel. The title is a large dot ring or spiral in ochre, a hand stencil
  stands beside it, and the three opening bodies are marked with one, two and three dots. There are
  three short curator's lines instead of the atlas's *Modus operandi*, and no ghost `FOLD` button.
* **Pause:** already partly done ("THE HAND IS STAYED"). Give it the same panel treatment.
* **End:** replace the modern dark box with a lit slab of rock. The run's tally is scratched on it,
  and the curator's numerals sit beneath. Your hand stencil is the signature, and the button reads
  "Strike again".

## Gameplay

The simulation is shared. Everything in G1 is render-side and needs no change to `OrbitWorld`.

### G1 · Render-side (in every option)

* The torch breathes (H2 + A2): visible reach tracks ochre, which makes the resource felt.
* The pickups reskinned with their attested marks (A7).
* Constellations as animal hunts (A5). The mechanics are unchanged, but finishing one now *paints an
  animal*, a reward the player can see.

### G2 · Era-only mechanics — **DECIDED: (b) relighting**

* **(a) None beyond G1 (recommended for the first pass).** Ship the look, then measure.
* (b) **Relighting:** fire hazards double as places to relight. Skimming a Flare's outer field tops
  up the torch, but its core still kills. This needs a simulation flag, gated exactly like Newton
  mode's (the flag is inert elsewhere, and `verify.mjs` proves both) so the atlas's numbers never
  move.

Relighting, as it will be built:

* The torch's fuel **is** the existing ochre (ink) charge. No second resource is added.
* While the traveller is inside a Flare's field, but outside its lethal core, the charge refills at a
  fixed rate. The core still kills exactly as it does now. Flying close to fire becomes a
  risk-for-reward choice, just as slingshot stars are.
* The field refills only while the traveller is in flight, so the rule cannot be farmed from an orbit.
* It is a world option, off by default and set only by this era, in the same way `newton` is gated.
  `verify.mjs` proves it is inert when off: the atlas's 60-seed routes give identical results. It
  also proves that it refills inside the band, never inside the core, and that `replayRun()`
  reproduces a run that used it.
* The Flare is drawn as the fire it now is (A6), and the guide shows the refill band, so the rule is
  visible before it matters.
* Open to tuning with `scripts/probe.mjs`: the refill rate, and whether Flares need to appear a little
  more often in this era.

* (c) **The torch as a hard sight limit:** rows past the torch's reach are not generated visibly
  until approached. This is riskier, because it conflicts with "never withhold a ring".

### G3 · A cave of your own — **DECIDED: yes**

Each run leaves a mark on a persistent panel shown on the era's frontispiece: your hand stencil for
every run, and an animal for every constellation ever finished. Over many runs you paint your own
Hall of the Bulls. It is stored in its own versioned key (`orbit.rock.v1`) and never touches the
atlas's ledger.

This is progression *inside* era I only, not the postponed eight-era ladder, but it is new
persistent state, so it is your call: **yes** (recommended, as it gives the door a reason to come
back) or **no**.

## Order of work

Each step is one PR, checked at 430×932 and passing `npm test`. The direction is proven on one frame
before anything else is built on it:

0. **Look test.** Light and wall only (A2, A3 without the palimpsest): the black cave and the moving
   torch, with today's marks left in place. Screenshots go back for sign-off before step 1.
1. **Words** (H3) plus the end and pause leaves (H4). This removes every atlas leak.
2. **The forgetting** (A8).
3. **Bodies, ring and traveller** (A4, A7), with guide and trail in the era's hand.
4. **HUD** (H1, H2).
5. **Palimpsest and animals** (A3 palimpsest, A5). This is the most drawing work: about twelve
   animal paths plus the sign vocabulary.
6. **Dangers, particles and sound** (A6, A9).
7. **Frontispiece** (H4) and **your cave** (G3).
8. **Relighting** (G2). It comes last because it is the only step that touches `simulation.js`.

## Decisions taken while building

- **Bodies are prehistoric sky marks, not plain dabs** (supersedes A4's "dot only" reading). Stars are
  the Iberian schematic estrelliform (a pressed dot with rays); bright bodies the soliform /
  cup-and-ring (a disc with a ring walked round it and rays); the Moon a kaolin crescent with tally
  notches (after the Laussel horn and the Blanchard plaque). Every "this is a star" reading is marked
  in the README as contested. An unreached body is its light alone, a breathing point.
- **Holes you can fall into.** The Shaft is drawn as a real hole whose black is exactly the lethal
  core. A new era-only hazard, the **chasm** (a lethal capsule you must not fly across, from row 5,
  roughly every 3–4 rows, never touching an orbit, always leaving a way through), sits behind the
  `chasmsOn` world option the Rock plate turns on; the atlas and Era II never generate one.
- **Safe depth is always shallow and never black.** Niches (seeded hollows) always show their back,
  so a harmless pocket is never read as a drop.
- **Moving shadows, level A.** Holes, chasms and niches are shaded live from the carried torch
  (shadow under the lip nearest the flame, the far wall lit), capped well short of black.
- **A hazard breaks open from the rock** instead of the atlas's ink-drop reveal (`hazardReveal`
  hand hook).

## Progress

Built and pushed on `claude/stone-age-deck-overhaul-ibtaij`:

| Step | State |
|---|---|
| 0 · Look test: carried torch, dark cave | Done |
| Wall material: creases, large forms, bedding, colour zones, flowstone | Done |
| Bodies, ring, release marks, unreached glints (A4, part of A7) | Done |
| Shaft as a real hole (A6, part) | Done |
| Chasm hazard: simulation, tests, art (new) | Done |
| Niches, hole polish, live torch shading (new) | Done |
| Face rebake speed (≈70 ms → ≈15 ms) | Done |

Left for this era, in the planned order:

1. **Words and leaves** (H3, H4): every atlas string still on this wall — "LEFT THE STAR CHART",
   "pricked line", TIRO/ADEPTUS/MAGISTER, "PRESSURE SET", "PERFECT · MOMENTUM KEPT", ANGULUS,
   "SPEED/FLOW" labels, "no clusters traced", "RETURN TO THE ATLAS" — through `defineVoice('rock')`;
   the end leaf and pause leaf as a lit slab of rock rather than the atlas's dark box.
2. **The forgetting** (A8): still the zig-zag polygon at the foot.
3. **The rest of the traveller's hand** (A7): the crayon itself, the aim guide (still the atlas's
   chevrons), the wet trail and the dried route (still the quill), and the pickups' attested marks.
4. **HUD** (H1, H2): tally score with a small numeral, the torch-fuel lamp for ochre, flow as
   handprints, "deepest" as a hand stencil on the wall; drop the `ORBIT` wordmark.
5. **Palimpsest and animals** (A3, A5): the faded older paintings on the wall, and the twelve
   constellations as animals.
6. **Flare and Draught, particles, sound** (A6, A9): the Flare as real fire, the Draught as smoke and
   flutings, torch sparks and dust, the five cave sounds.
7. **Frontispiece and your cave** (H4, G3).
8. **Relighting at the Flare** (G2), behind its own era-only simulation flag like the chasm's.
9. **Level B lighting** — see below.

## Later: a shared relit surface (WebGL)

Documented only; not scheduled beyond step 9 above.

Level A shades the hollows live but leaves the wall's own relief lit from a fixed lamp. Level B would
light the whole wall per pixel from the carried torch's real position, so every crease, boss, ledge,
niche and rim casts a shadow that stretches and turns as the torch moves (a short height-field ray
march toward the flame per pixel). That needs a GPU pass: WebGL, which is built into every browser
and adds no dependency or external resource. It would be built as a **generic relit surface** — a
height map, a colour map and a light supplied by each plate, one shader — drawn into the 2D canvas,
with today's Canvas 2D drawing kept as the fallback wherever WebGL is missing (the test suite among
them).

What the same layer could later give the other eras:

| Era | What it would add | Fit |
|---|---|---|
| I · The Rock | Moving torch shadows from all of the wall's relief | First user |
| II · The Ceiling | Plaster relief, tool marks and raised figures under a moving lamp; gold stars glinting | Strong |
| V · The Atlas | Paper grain, plate-mark emboss and laid lines under a soft raking light; gold leaf catching it; the rising dark as a living ink wash | Real gain, but it is the shipped main game: prototype and sign-off first, ideally behind a toggle |

Order if it is built: the shared layer with the Rock, then the Ceiling, then an atlas prototype for
review. Technical plumbing (shader, fallback, tests) by Sonnet; each surface's look by the art lead.
Frame rate is checked on the reference iPhone for every era before anything ships.

Tests to add along the way, all in `verify.mjs`: the rock voice covers every key the atlas voice
has; every catalogue figure has a rock animal; the torch pass never drops a ring's alpha below a
floor; `orbit.rock.v1` round-trips and migrates; and the relighting flag is inert outside the era.
