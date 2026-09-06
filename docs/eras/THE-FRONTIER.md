# The frontier destroys the representation, not the universe

The rising darkness is the oldest mechanic in this game and the brief does not touch its numbers.
What it rewrites is what the darkness *is*. Under the shipped game it read, honestly, as an
absolute limit on the universe itself — climb fast enough or the sky itself runs out behind you.
Under the brief it reads as something narrower and, on inspection, truer to what the game has
always actually deleted: **the player exists at the frontier of knowledge, and what advances behind
them is not the loss of the sky but the loss of *this era's account of it*.** Ochre does not un-happen
when it flakes off a cave wall; the star was there before Dunhuang's chart named it and stays there
after the chart is lost. What is finite, era by era, is only ever the record — the mark, the
plaster, the ink, the plate, the frame, the bit — and the record is exactly what a one-directional,
never-repeating arcade climb was always throwing away behind the player regardless of the fiction
laid over it. The brief's reinterpretation does not ask the mechanic to do anything new. It asks
the mechanic to be honest about what it was already doing.

This is also the reason the game cannot be, and was never trying to be, a simulation of a
persistent solar system. A persistent solar system is a thing you could fly back into. This game
simulates a *moving frontier of understanding* — a single advancing edge past which one era's
account of the sky has already failed and the next has not yet been drawn — and a frontier, by
definition, does not leave anything behind it to return to. The distinction is not scenery. It is
the load-bearing reason a run only ever goes up.

## What holds, unchanged

**The rate.** `darknessSpeed()` (`src/simulation.js:539`) is untouched by any of this: 22 world
units per second after a 1.5-second opening grace, accelerating by 0.55 units per second of active
play to a ceiling of 150, with a further quarter of the chart's own growth folded on top so the
fully developed pursuit reaches roughly 191 deep in a run rather than plateauing at 150. A run of
consecutive perfect transfers slows it by up to 15% (`darknessRelief()`, `:534`); pausing freezes it
outright. None of this reads era, currency, or knowledge state. It is one function of elapsed time,
row growth, and streak, and every one of the eight eras is chased by exactly the same curve.

**The grace.** Completing a three-body constellation still sets `darknessGrace=4`
(`src/simulation.js:617`), and for those four seconds the frontier does not merely pause — it
retreats, at a flat 48 units per second (`:736`), before resuming its ordinary advance. This is the
only place in the whole mechanic where the boundary moves backward, and the brief's reinterpretation
does not touch it: the record you just finished making has, for four seconds, bought itself room.

**The shoreline.** The literal threshold a flight is measured against — `p.y>this.floorY-4` — has
always needed a legible edge, and the shipped game gives it one: a thin, high-contrast line at the
true loss threshold, rendered above the decorative flood behind it and drawn to become clearer, not
softer, as it nears the player. What changes across eras is the material that line is drawn in —
copper for an engraved plate is one era's answer, not the whole mechanic's — never its function:
somewhere in every era's decayed field there is one boundary that reads more sharply than everything
else in it, because that is the one line a run is actually lost to.

**The price of a long orbit.** Nothing about the reinterpretation touches the trade the shipped game
already states: dwelling on a ring buys the current era's currency and spends the time the frontier
is counting. A body held past its own completion earns nothing further from the ledger
([PROGRESSION.md](PROGRESSION.md)) and nothing further from the economy
([ECONOMY.md](ECONOMY.md)'s release dividend, itself capped at full documentation) while the
frontier keeps closing at its own unbothered rate. The record is not free to make, in any era.

**The simulation hears nothing.** This is true in the way the brief means it — `OrbitWorld` carries
no notion of ochre, plaster, ink, brass, an atlas plate, a photographic emulsion, a telemetry frame
or a bit — but it is also true one level further down than the brief was asking about. Every physics
tick, nodes, hazards and nebulas more than 170 units behind `floorY` are deleted outright from
`OrbitWorld`'s own arrays (`src/simulation.js:744–746`), keyed on nothing but Y-position and node
identity. The check that removes a node from the game's memory has no era argument to consult even
if someone wanted it to. So "the simulation hears nothing" is not only a claim about which numbers
the render layer is allowed to read — it is a claim about what continues to exist in memory at all.
Once a row is behind the frontier, its representation has not merely stopped being drawn. It has
stopped being stored.

## The eight names

Each era has its own word for what is advancing on it, the way it has its own word for its
currency ([ECONOMY.md](ECONOMY.md)). None of these renames a number; each is this era's own
language closing over the same rate and the same shoreline.

| Era | Word | What it is |
|---|---|---|
| I · [The Rock](01-rock.md) | **the forgetting** | English, because this era has no script and says so with dots and tallies ([OVERVIEW.md](OVERVIEW.md) rule 2) — a mark that is not held in memory is exactly what the era's own knowledge gain, phenomenon → memory, says a lost mark reverts to. |
| II · [The Ceiling](02-ceiling.md) | **isfet** (jzft, conventionally "isfet") | The disorder ancient Egyptian religious thought set against *ma'at*, cosmic order — attested as a concept, used here as a fictional gameplay translation, not a period label for this mechanic. Distinct from the Storm family's own Set (*Stẖ*, [research/ceiling.md](research/ceiling.md) §5): Set is a deity with a domain, isfet is the abstract absence his domain stands for. |
| III · The Scroll | **hundun** (混沌, *hùndùn*) | The classical Chinese term for the formless chaos before the world had shape — a much older concept than this era's own seventh century, but live vocabulary throughout the classical tradition the Tang scroll belongs to. Attested concept; fictional gameplay translation for its use here. |
| IV · [The Astrolabe](04-astrolabe.md) | **aẓ-ẓulumāt** (الظلمات, "the darknesses") | A genuine Qur'anic and general Arabic term (e.g. Q2:257's "out of the darknesses into the light"), plural because more than one kind of record is failing under this era's own reveal — the engraved geometry and the manuscript page decay by different mechanisms (below). Attested word; fictional gameplay translation for its use here. |
| V · [The Engraving](05-engraving.md) | **the dark** | The shipped baseline, unrenamed — the same "no-twist reading" every currency row keeps where a rename would add nothing ([ECONOMY.md](ECONOMY.md)). Era V is the era the game is already set in; its frontier keeps the game's own word for it. |
| VI · [The Lens](06-lens.md) | **the fog** | A real photographic-conservation term — chemical or age fog, unwanted density veiling an image — reused rather than invented, because this era's own decay (below) already answers to that name in the archives it is drawn from. |
| VII · The Flyby | **LOS** | Loss of Signal, standard Deep Space Network and mission-operations usage, all-caps in the mnemonic style [LETTERING.md](LETTERING.md) already gives this era's telemetry hand — the honest name for what is actually happening (below), not a metaphor reaching for one. |
| VIII · [The Probe](08-probe.md) | **the flux** | Already settled, not reopened here: [ECONOMY.md](ECONOMY.md) names it and gives the reason — a probe is not chased by night but by its own ageing, radiation damage, thermal budget, a reactor's half-life. |

## The decay, era by era

The brief's own list is one line per era. Each line below is what that line means once it is read
against the real material the research files establish, and where the brief's gesture is not quite
the honest mechanism, the correction is stated rather than smoothed over.

| Era | The decay, and what actually fails |
|---|---|
| I · The Rock | Ochre is a mineral pigment — ground haematite, sometimes a manganese black — and it does not chemically fade the way an organic dye does; the brief's "ochre fades" is the one gesture in the whole list that is not quite right. What actually fails is *adhesion*: the thin film the pigment sits in, whatever bound it to the rock, lets go, and the pigment powders away or is buried under a calcite skin deposited by water moving through the stone — a skin that itself can later spall and take the pigment with it. The engraved lines fail by a wholly separate and more catastrophic mechanism: the limestone surface itself — the support, not the mark — exfoliates in scales under moisture and freeze-thaw cycling, a total loss where the painted marks merely thin. Drawn render-side as broken-edged, blotchy erasure rather than a soft wash — a spall's edge is sharp, not a gradient — with small chip particles drifting as the loss happens. **Plausible reconstruction**, general rock-art conservation science; not sourced from [research/rock.md](research/rock.md), which does not cover this. |
| II · The Ceiling | The playable sheet's own ground is mineral and earth pigment on plaster, applied as flat washes ([research/ceiling.md](research/ceiling.md) §3) — almost certainly *secco*, pigment bound onto dry plaster rather than fused into wet lime as true fresco is, which matters because secco fails at the *binder*, not the mineral. Groundwater and humidity carry dissolved salts through the limestone bedrock; crystallising at or near the surface, they push the plaster from its support in blisters that widen into flakes — the dominant failure mode across Egyptian tomb conservation generally. Independently, the secco binder itself (gum, glue, or an egg medium) breaks down and the pigment loses cohesion and powders, whether or not the plaster beneath it has yet moved. Cracks from successive, differently-drying plaster campaigns widen last and drop whole facets at once. Drawn as pale efflorescent bloom first, then flat matte voids in blocky, faceted shapes where plaster has detached — lifting in flakes, not soaking like a wash, which is the visible difference from every ink-based era. **Plausible reconstruction**, general Egyptian wall-painting conservation science; no TT353-specific conservation report was reachable this pass. |
| III · The Scroll | Pine-soot ink (carbon black, chemically close to inert) is bound in glue and brushed onto hemp or mulberry paper ([research/china.md](research/china.md) §4); what actually fails, in the ordinary case, is less the ink than the *paper carrying it* — cellulose degrading by acid hydrolysis as the sheet ages, embrittling it, while humidity cycling causes cockling, foxing (reddish-brown fungal and mineral spotting) and eventual disintegration at every fold and handled edge, with the ink lifting and smearing wherever its own binder gives way alongside it. The reason the actual Dunhuang chart survived a millennium to be drawn from at all is the reverse of this decay: **Cave 17 at Mogao, the "Library Cave," was sealed — commonly dated to around the early eleventh century — and stayed shut for roughly nine hundred years until Wang Yuanlu's 1900 discovery and Aurel Stein's 1907 acquisition** ([research/china.md](research/china.md) §1); a dry, dark, thermally stable rock-cut chamber gives none of light-driven fading, humidity cycling, or biological attack anything to work on. The frontier depicts what resumes the moment that seal is broken — this era's decay is the material's own overdue reckoning with exposure, not a new invention. Drawn as fibres dissolving and the ink itself bleeding outward into soft diffuse stains before the paper thins to nothing, softer and slower than the Engraving's own ink failure below. **Attested** for the cave's sealing and rediscovery dates; **plausible reconstruction** for the general paper-and-ink decay chemistry. |
| IV · The Astrolabe | Two materials, two failures, per this era's own split grammar ([research/instruments.md](research/instruments.md) §1). Engraved brass tarnishes by ordinary oxidation, and it tarnishes *unevenly*: the instrument's own established "gradient of handling" (§8) reads brightest where light and touch concentrate and darkest in the engraved grooves an alidade's edge never reaches — so the decay is that gradient collapsing toward the uniform dark patina an instrument reaches only once no one is picking it up any more, which is a fittingly exact image for an era whose whole subject is measurement by a human hand. Separately, manuscript ink — plant-based or a lighter iron-gall mix than the Engraving's own — fades toward the page's own pale tone under light and oxidation rather than corroding through it, so a sighting arc or a coordinate line does not vanish so much as lose the contrast that made it legible. Drawn as patina pooling and darkening from the grooves outward on the brass, and a slow desaturation toward the page ground on the manuscript, ending in the same place — geometry with nothing left to read it by. **Plausible reconstruction**, extending [research/instruments.md](research/instruments.md) §8's patina account and general manuscript-ink conservation science. |
| V · The Engraving | The opposite failure from the Astrolabe's manuscript ink, and the reason both belong on the same ladder rung by contrast rather than repetition: iron-gall ink is acidic and mildly self-catalytic, and given time and moisture it does not merely darken and hold, it corrodes the cellulose beneath it — browning the paper along every stroke and, in the most concentrated lines, eating clean through the sheet. This is a real, well-documented paper-conservation phenomenon usually called ink corrosion or ink burn, visible in period manuscripts and old-master drawings drawn in a strong iron-gall recipe. The brief's own "paper burns" is exactly this, read correctly: not fire, the ink burning its own drawing out of the page it is drawn on. The honest consequence for the render is that a completed atlas page's *densest* linework — the keylines, the plate-mark rule, the frame — carries the most ink and so fails first, not last, with foxing filling in behind it. Drawn as browning haloes tightening along every stroke into small ragged punctures rather than a uniform loss. **Attested** as a general conservation phenomenon; not sourced from a period-specific Bayer or Cellarius conservation report, and no dedicated research file exists for this era — grounded against [05-engraving.md](05-engraving.md) and general archival science instead. |
| VI · The Lens | Three real, distinct archival-photography failures, not one wash. **Fog** — age or chemical fog, an unwanted overall density from residual processing chemistry or the emulsion's own long-term instability — flattens contrast until an image reads as a grey field rather than a picture. **Silver mirroring** — metallic silver in the densest tones of an old silver-gelatin print migrates to the emulsion's surface and oxidises into a thin reflective sheen, so a mirror-like bloom appears specifically where the image was darkest, not where it was faint. **Emulsion frilling** — the gelatin layer itself separates from its glass or paper support, most often at an edge or wherever moisture has weakened the adhesive beneath it, and curls away in visible frills. Drawn in that order across a body's own image as the frontier nears it: fog first, flattening the picture; mirroring next, blooming in whatever was darkest; frilling last, the image's own border visibly lifting and peeling inward until nothing is attached to anything. **Attested**, standard photographic-conservation vocabulary; general, not sourced from [research/observatory.md](research/observatory.md), which does not cover conservation. |
| VII · The Flyby | Grounded directly in this era's own research rather than reinterpreted from the brief: "a real stream can lose lock: bad sync, a failed checksum, a missing block — visually, a dropped or garbled scan line, a frozen tile in an advancing mosaic, a skipped counter. This is the honest mechanism behind 'static'... not corruption as an effect, but a literal dropped frame" ([research/space-age.md](research/space-age.md) §4). Signal-to-noise falling with distance is not dramatic licence either: received power falls with the square of distance while background noise holds roughly steady, so bit-error rate genuinely rises the farther a craft is from Earth, which is why the frontier reads as worsening with depth rather than as a uniform effect switched on at one row. What a lost frame actually looked like on a Mariner or Voyager image was never television snow — it was a structurally intact frame with pieces missing: a scan line replaced by a flat dropout band, a mosaic tile that never resolves and sits as a grey placeholder among tiles that did, exactly the vidicon scan-line and mosaic-tile structure [research/space-age.md](research/space-age.md) §2 already documents for these missions. Drawn as literal dropout, never grain-as-decoration: a tile stops, a line goes flat, a counter skips. **Attested**, [research/space-age.md](research/space-age.md) §4; deep-space link-budget physics is standard. |
| VIII · The Probe | The one era with no substrate to decay — the "material" is a bitstream, and bitstreams do not flake, tarnish, or fade. What fails is a bit flip, from radiation-induced single-event upsets accumulated over the timescales and exposure a far-future setting implies, and eventually a checksum or error-control failure once the error rate exceeds what the transfer frame's own error-control field ([research/probe.md](research/probe.md) §9) can still correct. At that point a block does not decay toward anything — it reverts to a flat, textureless null or error pattern, because there is no image underneath a corrupted bit for a texture to decay into. This is the correct end of the ladder for exactly that reason: every material above this one leaves some residue of what it was on the way to nothing, and data does not. Drawn as the least textured of all eight decays: a hex or hatched block flattening to one uniform value, on a machine cadence rather than a hand's. **Plausible reconstruction** — single-event upsets and checksum failure are real, attested aerospace and computing phenomena; their application to this specific far-future setting is a fictional gameplay translation. |

## What it may cost, drawn

None of the above is a new physical rule; all of it is paint. `OrbitWorld` reads only `floorY`,
`darknessSpeed()` and `darknessGrace` — nothing in this file adds a field to the simulation, and
nothing in the table above is checked by `flightStep` or `capture()`.

The shipped darkness is already drawn as a cache, not a per-frame computation, and that is the shape
to keep. `darknessPlate(relief)` (`src/effects.js:525`) builds one 640×180 canvas once per relief
state from a seeded generator and is blitted, tiled, every frame after that; the marginalia — a
surfacing Leviathan, a drifting gloss — are separately cached sprites (`src/effects.js` below it)
that redraw on their own slow clock (the creature once every twenty-seven seconds) rather than every
tick. Extending this to eight materials is, in the steady state, free: the per-frame cost stays what
it already is, a handful of image blits, regardless of which era's decay is showing. What is not
free is the one-time authoring cost, and it is worth naming honestly rather than folding into "just
change the colours." Today's `darknessPlate()` bakes in one *technique* — an ink-wash soaking into
paper fibres — gated only on the existing `onPaper()` boolean, while its *colours* already vary per
plate for free through the `dark` plate section ([ARCHITECTURE.md](ARCHITECTURE.md)'s fourteen
registered sections). Seven of this file's eight materials are not ink soaking into paper, so the
actual new work is an era-keyed table of *techniques* sitting beside `darknessPlate()`, in the same
shape [ARCHITECTURE.md](ARCHITECTURE.md) already proposes for stroke primitives
(`STROKE_STYLES[era]`, its obstacle 3) — eight small cache-filling routines behind one shared call
site, not eight new things a frame has to pay for.

## What it must never take

Everything the phenomenon/observation/understood states guarantee stays guaranteed inside the decay
too. [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)'s readability contract is explicit that "the
frontier's shoreline" is part of the vocabulary a player flies by, identical on every sheet, never
staged and never withheld — and the decay described above is not an exception carved into that rule,
it is scenery bounded by it. Whatever material is failing behind the player, the shoreline itself —
the single line standing at the actual value of `floorY` — must remain the sharpest, highest-contrast
edge in the whole decayed field, drawn on top of the grain rather than folded into it, and positioned
exactly where the loss check reads it, never softened or delayed for atmosphere's sake. A cave wall
flaking to nothing is allowed to be beautiful. It is never allowed to be the reason a player
misjudges where the loss threshold actually is. Every orbit ring, capture band, release tick, hazard
field and the guide's own prediction line answer to the same discipline, era by era, for the same
reason: a run is lost to a bad transfer, never to information the game chose to withhold.

## At the transition

[PROGRESSION.md](PROGRESSION.md)'s ten-step transition is where the frontier is finally allowed to
win, on purpose, once per era. Its own rate is never eased — that stays exactly the curve above,
untouched by which step of the transition is playing — what eases is only the world's forward
scroll, the camera's own climb through the rows. Slowing the climb without slowing the pursuit is
what lets the frontier visibly close a gap it has been chasing the whole era at a fixed remove: the
one deliberate moment where the thing pursuing the player is allowed to catch up. What follows is
this file's own decay, for that era, run to completion across everything still standing on the sheet
rather than merely to the shoreline behind the player — the old world does not get covered by a new
one, it is consumed by exactly the process this file specifies, all at once, instead of one row at a
time. Two things are immune to it, and immune for the same reason: the transition object, because it
is what the next era is about to grow outward from, and the Observer Core
([OBSERVER-CORE.md](OBSERVER-CORE.md)), because it is the one thing in the entire game no era's
decay is ever allowed to touch. Everything else on the sheet — every mark, every plate, every frame
— goes. That is the whole difference between an ordinary row lost to the frontier and an era lost to
it: the same process, run once to completion instead of forever to a shoreline.
