# Endless-hard — one danger a century (draft; the Rock's and the atlas's are built)

A first reading of the idea recorded in [LINKING.md](LINKING.md), "Endless, later": a harder Endless
reading in which each century switches on one danger of its own, too harsh for the Chronicle, the Journey
or the daily, and in which generation still always leaves a way through. The Rock's chasm is the one that
exists; everything else here is a proposal to be argued with, not a decision. Drafted 2026-09-27 from the
era files, `DANGERS.md` and the hazard code in `src/simulation.js`.

| Era | Danger | What it does | The promise generation keeps | Cost |
|---|---|---|---|---|
| I Rock | **The chasm** — the long crack across the wall | a capsule that kills a free flight crossing it (built: `chasmsOn`, `src/rock.js`, `taskChasmRoute60`); *dealt in the reading THE CRACKED WALL since 2026-10-02* | a fan of 24 departure headings sampled, at least 82 % left clear, and one exact tangent held clear in either winding | none: flip the flag |
| II Ceiling | **The sealed hour** — a gate between the Amduat's hours | a full-width wall at an hour boundary with one gap | the gap centred on an exact tangent between the last body and the next, sized to the capture band and a margin; no qualifying tangent, no wall that hour | medium: line geometry, an hour-keyed placement rule, its own pilot |
| III Scroll | **The escapement** — Su Song's clock tower ticking | a lethal row whose core switches on and off on a fixed period, on its own random stream | the chasm's fan restated in time: the safe phase at a tangent departure's predicted transit covers a wide majority of a window round it | medium: a timing rule in `flightStep`, a render change, a timing pilot |
| IV Astrolabe | **The trench** — the Fakhrī sextant's walls cut into the hill | a curved capsule, a masonry arc | the chasm's fan and tangent rule, against point-to-arc distance | medium to large: arc distance does not exist yet |
| V Atlas | **The slipped stroke** — an engraver's trial slipped onto the plate | the chasm itself under the atlas's hand; *built 2026-10-02* as the reading ENDLESS · SLIPPED STROKES (`atlasChasm` in `src/figures.js`, named LAPSUS · A SLIPPED STROKE) | the chasm's own | small: a skin over the chasm's code path |
| VI Lens | **The cracked plate** — a stressed glass plate failing | a capsule that lengthens every few rows | the fan re-checked at every growth step; a growth that would close it arrests the crack instead | large: live, revalidated capsules are new state |
| VII Flyby | **The ring-plane crossing** — Cassini's Grand Finale gap | the sealed hour's wall and gap, rarer, as a one-time threading | as the sealed hour | small once II exists |
| VIII Probe | **Bit rot** — errors outrunning the frame's own correction | a corruption meter filled near flux, draining when clear; overflow ends the run | a pilot flying every tangent through the densest flux never overflows by more than a set margin | large: new run state, a HUD meter, a new loss |

**How it would be switched on.** A third reading beside Chronicle and Endless on a century's own
frontispiece, arming only that century's danger; never in a Chronicle, the Journey or the daily, which keep
one frozen roster so their seeds and records mean what they always did. Every new danger that draws random
numbers takes its own isolated stream, as the wind, the cloud and the chasm already do, so a seed still
deals the same chart with it off.

**What it runs against.** `DANGERS.md` defers any roster that differs by era (its option B) until each era
has shipped the depiction-only one (option A), because of the daily's one-seed contract, comparable bests
and the vortex-only graze. Keeping every entry here inside an opt-in reading avoids the first two; the third
would still need a look (`figures.js`'s graze test). It also breaks `OVERVIEW.md`'s rule that the simulation
never learns the era — for this reading only, `HAZARD_KINDS` and the spawn rules would be chosen per era.

*Built 2026-10-02 for I and V:* the reading is a third step of the frontispiece's reading button (`readingCycle()`, `hardOn()` in `src/ui.js`), offered on the atlas and on any century whose plate sets `can.hard`, keeping its own record under `:hard`; the danger is the simulation's unchanged chasm generator, so no new pilot was needed. **Open.** Whether the toggle is per century or one global modifier (built per century); whether the Ceiling's and the Flyby's
shared wall-and-gap is acceptable reuse; whether the growing crack and the meter can share the chasm
pilot's shape in `scripts/verify/tasks.mjs`.
