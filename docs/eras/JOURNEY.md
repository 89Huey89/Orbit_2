# The Journey — the locked progression design, and the plan to build it

This file is the controlling document for the progression system. It supersedes the parts of the
older era documents listed in *What this overrides*, below, and where it disagrees with them, this
file is right and they are stale. It is written to be implemented from directly, in the stages given
at the end, by an implementer who has not read the rest of `docs/eras/` — every line reference in it
was checked against the code on the branch it was written on, and every claim inherited from an
older document that turned out to be wrong is corrected here rather than repeated.

Read `CLAUDE.md` first. Its three hard contracts govern everything below: `src/simulation.js` stays
DOM-free and only the slice between its `// BEGIN SIMULATION` / `// END SIMULATION` markers is
testable; `src/*.js` are classic scripts in one global scope, ordered by the `<script>` tags in
`src/index.html`; persisted state is versioned and migrated forward, never mutated in place.

---

## 1 · The locked design

**One run is not one historical observer.** The Observer Core is the continuous point of curiosity
that connects the whole game. It passes from rock mark to brush to alidade to quill to telescope to
hull to replicator without the run stopping. This is the premise every rule below serves.

**The four sentences the design answers to.**

> Nodes begin as celestial phenomena and become knowledge through orbit.
> Each age redraws the universe in the language of its own knowledge.
> The sky remains. The language used to understand it changes.
> Knowledge survives the observer.

### 1.1 Three modes, three kinds of persistence

| Mode | Starts in | Advances the ladder | Records |
|---|---|---|---|
| **Journey** | the player's current historical frontier | yes — the only mode that does | progression is the goal; score secondary |
| **Free Play** | any unlocked era, chosen | **never** | personal best per era |
| **Daily** | the day's fixed seed, era and rules | **never** | own record against the daily seed |

Free Play must not feed the Journey. If it did, grinding a favourite era would become the optimal
route up the ladder and the two modes would collapse into one.

### 1.2 The Journey run

A Journey run **starts at the current frontier**, not at era I, and there is no way to pick an
earlier era for a Journey run. Completed eras are accumulated knowledge; they are not replayed every
run. They stay permanently available in Free Play, unlimited.

The one exception is a deliberate **restart**: an explicit "begin the Journey again" action that
returns the frontier to era I and clears the Journey's knowledge. It never happens implicitly, it is
confirmed before it runs, and it leaves Free Play's unlocks and every contextual record untouched —
what it resets is the climb, not the archive. Anyone who wants to re-fly a century without giving up
their frontier uses Free Play, which is what Free Play is for.

### 1.3 A transition never ends the run

This is the load-bearing rule. When the current era becomes transition-ready the run does **not**
stop, show a screen, open a menu, or ask for an extra input. The sequence is:

1. The era's milestones complete → a persistent `transitionReady` state is set.
2. Nothing is forced. The generator is given a fair, readable opportunity to present the transition
   body.
3. The player reaches and captures it with ordinary play.
4. While orbiting it, the era's final knowledge state completes.
5. Presentation may briefly slow. It may not interrupt.
6. The old visual medium recedes — flakes, dissolves, fades, in that era's own material.
7. The transition body remains. It is immune to the decay by construction.
8. The Observer Core remains, unchanged in shape, size and behaviour.
9. The same phenomenon is reinterpreted in the next era's visual language.
10. The player's tool transforms around the unchanged Core.
11. Traversal resource is fully restored.
12. The destruction boundary is pushed substantially back.
13. The player is still safely in orbit around the same body.
14. The generator switches to the next era; its ledger becomes active immediately.
15. The next tap is an ordinary orbital release.

**Nothing resets**: not score, streak, run timer, run mastery state, or accumulated run performance.
The transition is a *second wind* inside the run.

**Multiple transitions in one run are allowed** and must not be blocked. It will be uncommon because
progress accumulates across runs, but a player who enters with an era nearly complete, transitions,
then plays brilliantly, may transition again. That is mastery. The architecture must support any
number of seamless transitions in one continuous run.

### 1.4 Knowledge survives the observer

Everything observed during a Journey run contributes permanently, **even if the player dies
afterwards**. Death ends the attempt, not the knowledge.

Partial observation counts, scaled by how much was actually observed:

```
knowledgeContribution = observationCompletion        // clamp(orbitSweep / SWEEP_FULL, 0, 1)
```

A body observed to 80 % contributes more than one abandoned at 30 %. Full completion caps the
contribution. Full documentation is *not* required for an encounter to have historical value.

**There is no quality term and no floor.** An earlier draft of this design carried
`completion × observationQuality`; the quality half is retired. How cleanly a body was entered — a
tangent against a hard turn against a steep arrival — is a question about *flying*, not about
*knowing*, and it already has a home: `capture()` pays it in score and in the ink dividend, where a
steep arrival earns nothing at all. Knowledge is what was looked at. A floor is likewise refused: an
encounter barely looked at has barely been observed, and a floor would pay a tap-and-run capture for
an observation it never made.

This is the one place where landing skill and knowledge are deliberately decoupled, and it is what
keeps §1.5's milestones honest — an era is reached by looking, and the endless score is where flying
is judged.

This keeps the existing release decision live and must not become a waiting mechanic:

- **release early** — better transfer timing, less knowledge, less refill
- **stay longer** — fuller reveal, more knowledge, greater refill, more danger from the boundary

### 1.5 Named milestones, not a progress bar

Internal numbers are fine for balancing. Player-facing progression is the completion of real,
era-specific knowledge structures — roughly **3–5 per era** — expressed through the era's own large
background knowledge artwork completing, not through a `17 / 20` counter or a mission screen.

Indicative milestones (final wording per era file):

| Era | Milestones |
|---|---|
| Prehistory | recurring light recognised · seasonal alignment · pattern remembered |
| Egypt | recurring stars ordered · decanal structure · circumpolar group · calendar relation |
| China | — per `research/china.md` |
| Islamic | angular measurement · positional cataloguing · geometric relationship |
| Renaissance | documented orbit · planetary ordering · atlas representation |
| Telescopic | resolved disk · moon system · surface / phase / ring detail |
| Space Age | remote mapping · physical arrival · orbital survey |
| von Neumann | — per `08-probe.md` |

**How a milestone is recognised — the hybrid rule.** Each era's milestones carry that era's own name
and its own share of the background artwork, but their *conditions* are, wherever possible, written
over signals the simulation already emits and `ledger.js`'s `UNLOCKS` already knows how to read:
captures by node type, perfects, constellations completed, bodies carried to full documentation,
rows reached. Those can never be blocked by generation, because the generator already produces them.

**At most one curated condition per era** — one that genuinely needs its own generation guarantee,
because it is the milestone that makes that century *that century* rather than a counter with a
costume. That one is the era's own, and the generator owes it: an era whose milestone needs a `sling`
body, a fork, or a particular hazard must be able to rely on one arriving.

**Milestone opportunities must be guaranteed by generation.** Historical progression may never be
blocked indefinitely by RNG. Holding the curated conditions to one per era keeps that promise to
eight guarantees rather than to thirty, and keeps each one auditable on its own.

### 1.6 How long the climb is

**Five typical runs per era. Eight eras. Roughly forty runs for the whole ladder.**

The threshold is the derived quantity, not the decision. Measured under §1.4's formula, a run at the
author's own standard banks a median of **5** knowledge, so:

```
era threshold  = 25          (5 runs × 5 knowledge)
whole ladder   = 200         (8 × 25)
```

Both are starting values to be re-read off `scripts/probe.mjs` once stage 6 is playable, not
constants to defend. What matters is the shape they produce, and it is the shape §1.3 asks for:

- A typical run banks 5 and clears a fifth of an era. No single ordinary run advances the ladder
  alone, so an era is genuinely lived in rather than passed through.
- A strong run (the 4 ms hand: median 10, p90 23) covers two to five typical runs' worth, so skill
  visibly shortens the climb without collapsing it.
- A near-perfect run banks 58 — **2.3 eras in one run**. Multiple transitions inside one continuous
  run therefore happen, exactly as §1.3 requires, and happen only for exceptional play. The design
  did not have to add anything to make that true; it falls out of the numbers.

### 1.7 Contextual records

No single universal high score. `orbit.best.v1` migrates forward into contextual records without
breaking existing saves:

- **Journey** — progression is the goal; a score may exist but is not the comparative record
- **Free Play** — personal best per era
- **Daily** — own score against the day's seed
- **Final Frontier** — true endless score after the von Neumann era; this becomes the primary global
  endless record

### 1.8 Endless is one shared driver, not eight curves

One normalised difficulty driver that keeps rising with run duration and progression, feeding chart
pace, boundary speed, transfer distance, capture tolerance, hazard strength, gravity, wind, special
object density and transfer complexity. Eras may apply restrained multipliers or economy
differences on top. Solve endless growth **once**, not eight times.

### 1.9 The era roster

The user's names and the existing document names are the same eight rungs. Both are used in the
repository; this table is the mapping.

| # | Design name | Document | Existing file |
|---|---|---|---|
| I | Prehistory | The Rock | `01-rock.md` |
| II | Egypt | The Ceiling | `02-ceiling.md` |
| III | China | The Scroll | `03-scroll.md` |
| IV | Islamic astronomy | The Astrolabe | `04-astrolabe.md` |
| V | Renaissance | The Engraving | `05-engraving.md` |
| VI | Telescopic | The Lens | `06-lens.md` |
| VII | Space Age | The Flyby | `07-flyby.md` |
| VIII | von Neumann | The Probe | `08-probe.md` |

---

## 2 · What this overrides

An implementer reading the older documents will otherwise be actively misled. These claims are dead:

| Stale claim | Where | Now |
|---|---|---|
| The ladder is climbed inside a single run | `OVERVIEW.md`, `PROGRESSION.md` | climbed across runs; a run starts at the frontier |
| "Open on any era already reached" is retired from v1 | `OPEN-QUESTIONS.md` item 11 | reinstated — it is the design. Its stated reason (an era whose ledger was never filled) dissolves once the ledger persists |
| Reaching era VIII ends progression, then endless begins | `OVERVIEW.md`, `PROGRESSION.md` | endless scaling is needed from stage 4, for every unlocked era in Free Play |
| The daily exists partly so players see other eras | `DANGERS.md` | the daily is a fairness instrument only; Free Play covers era access |
| One universal record (`orbit.best.v1`) | shipped code | contextual records, §1.7 |
| Build order: spine → Lens → Ceiling → … → Rock sixth | `OVERVIEW.md`, `IMPLEMENTATION.md` | the Rock is stage 2 — it is the front door |
| The transition is a page turn between runs / a ten-step set piece that may pause play | `PROGRESSION.md` | it happens inside the arcade flow and never interrupts, §1.3 |

`KNOWLEDGE-HORIZON.md`, `OBSERVER-CORE.md`, `THE-FRONTIER.md`, `LETTERING.md`, `ECONOMY.md` and the
eight era files remain valid on their own subjects. `IMPLEMENTATION.md`'s per-stage *code scouting*
remains useful; its *ordering* and its single-run assumptions do not.

---

## 3 · Measured facts — do not re-derive

From `scripts/probe.mjs` (see `MEASUREMENTS.md`), 150 seeds per hand:

- **Captures ≈ rows**, 1:1 on the main route.
- **A hand calibrated to real play** (the author reaches ≈ row 20) is the 16–25 ms rung: median row
  16, ~10 captures, ~35 s, a mean documented fraction of **0.44** per encounter, banking a median of
  **5 knowledge** per run under §1.4's formula.
- **A perfect pilot** banks 58 and survives to row 437 without dying. The spread between the two is
  more than a factor of ten and no single threshold serves both — which is exactly why progression is
  now persistent, and why one exceptional run crossing two era boundaries falls out of the numbers
  instead of needing a rule.
- **The run's whole knowledge total** for the human rung spreads p10–median–p90 as **3–5–13**. At
  §1.6's threshold of 25 no ordinary run clears an era alone, which is the intended shape.
- **These numbers moved when the formula did.** Under the earlier `0.35 + 0.65 × documented` the same
  hand banked 7 and the oracle 72. Retiring the floor and the quality term (§1.4) cost roughly 30 %
  of the yield. Any future change to the formula invalidates the threshold; re-run the probe with
  `--floor` and `--span` rather than scaling the old number by hand.
- **The release window is about one frame wide.** The same pilot costed a single 8 ms frame collapses
  from surviving the cap to a median of row 26. 57–80 % of runs die by leaving the star chart.
  Nothing in the era work may narrow that window.
- **Endless is flat today**, which is why §1.8 is stage 4 and not stage 7: `chartPace`'s clamp
  plateaus near row 28; `darknessSpeed()` has a *second*, independent wall-clock clamp that saturates
  around 236 s; hazard radius caps near k≈57; nebula radius is hard-capped with no row term; wind
  reach/force and the gravity pull coefficient have **no** row dependence at all.

Re-run with `node scripts/probe.mjs`; `--seeds`, `--patience`, `--rows`, `--seconds`, `--floor`,
`--span`, `--json`.

---

## 4 · Code map — verified

Line numbers re-checked after stages 1 and 2 landed. Re-check before editing; they drift, and the
whole point of this section is that nobody edits against a number they did not measure.

**Simulation** (`src/simulation.js`, all inside the markers)
- `TAU` `:6`; `BASE_SPEED/MAX_SPEED` `:7`; **`SWEEP_FULL = TAU*2/3` `:12`** — stage 1 landed it.
- Ink gains `:39`. `OBSERVATIONS` `:164` — the *feats* table. Do not shadow or reuse this name.
- `HAZARD_KINDS` `:185`. Player init, `orbitSweep:0` `:314`.
- `release()` `:550`; `p.launch={…sweep:p.orbitSweep…}` `:555`; **`n.documented=clamp(p.orbitSweep/
  SWEEP_FULL,0,1)` `:559`** — the only write site, one line before `p.node=null`.
- `capture()` `:563`; zeroes `p.orbitSweep` `:581`.
- `die()` `:635` — never clears `p.node`, so a body held at death keeps reading the live sweep. Proven
  by fixture.
- `p.orbitSweep+=turn` `:699`. Fading death at 4.5 s of orbit `:711`.
- Prune `:754`, guarded: `if(this.nodes.some(n=>n!==p.node&&n.y>=pruneY))this.nodes=this.nodes.filter(…)`.

**Reveal** (`src/reveal.js`) — rewritten by stage 1; the old single-clock shape is gone.
- `REVEAL_CAP=3` `:23`; the throttle that returns `0` `:50`.
- `NODE_PEN` `:101`, now carrying `d` and `taken` beside `t`.
- `revealFlourish` `:105` — the completion hook, a no-op by default; `watchCompletion()` beneath it.
- `revealNode()` `:122` — **two clocks**: `t` on `reveal.progress()`, `d` read directly off
  `p.orbitSweep/SWEEP_FULL` or `n.documented`. `n.difficultyChoice` forces `d=1` (a holding position,
  not a decision — see §9).
- `revealLabel()` `:145` — untouched by stage 1 and to stay that way.
- `sketchDisc()` `:204`; `revealPlanet()` `:217`, which now draws stage (0) — the light point and the
  laid-in rough disc — before survey → wash → keyline → hatch.
- `revealRetire()` `:283`.

**Figures / marks** (`src/figures.js`, `src/marks.js`)
- `drawNode()` `:635`; `const pen=revealNode(n)` `:640`; `if(pen.t<=0)return;` `:641`.
- The slingshot charge band gates on `pen.ring`, not `pen.survey` — it is a readout, not a depiction.
- `engravedRing(radius,rgb,alpha,weight,seed,sketch)` `marks.js:191` — the `sketch` pass draws an
  orbit no traveller has taken, and is part of the cache key.

**Plates** (`src/plates.js`)
- `PLATE_STYLES` `:236` — a plate is `{base, wash, tint}`; a mock era is three lines.
- `plateName` `:301`; `applyPlate()` `:386`; `setPlate()` `:392`.
- Single-slot caches `laidTile`/`laidSheet` `:430`; `grain`/`grainSheetCanvas` `:371`.

**Ledger and unlocks** (`src/ledger.js`) — *the Free Play selection UI already exists here*
- `readLedger()` **`:21`** (this was `:22` in the first draft and was wrong then too);
  `migrateRecords()` `:38`; `UNLOCKS` `:93`; `unlockMet()` `:182`; `unlockedIds()` `:186`;
  `isUnlocked()` `:192`; `cosmeticItems()` `:218`; `setCosmetic()` refuses a locked id `:246`.
- `personalBests` is already a map keyed by difficulty — per-era records fit the same shape.

**Frame / UI / effects / ceiling**
- `frame.js:406` — `if(ceilingPlate()){`, the separate render branch.
- `ui.js:411` chapter cap; `ui.js` also now carries `rockPath()`/`openRock()` `:186`, the frontispiece
  door to the Rock spike, and the `#rock-open` listener beside `#ceiling-open`.
- `effects.js:381` `markHead(boost,charge,inkHeld)`; `:390` `OBSERVER_MARKS`; `:509` the
  `cosmetic('mark')` lookup; `darknessPlates` keyed by `relief` alone `:526`.
- `ceiling.js:90` `ceilingWatch()`; `:1350` `ceilingDrawPlayer()`; `:1565` `ceilingFractureEdge()`;
  `:1575` `ceilingDrawDark()`.

**Build** (`scripts/build.mjs`) — writes `dist/index.html`, copies `assets/`, and carries
`docs/eras/prototypes/rock-read.html` to `dist/rock-read.html` under the same no-network check.

**Tests** (`scripts/verify.mjs`)
- Destructuring list `:9` — see landmine L1. It now carries `SWEEP_FULL`.
- `'One seed deals one chart'` `:684`; `'How a run is flown cannot change the chart it is dealt'`
  `:693`; the stage-1 fixtures sit beside them and after the `fade` fixture, and in the runtime
  block's pen section.

---

## 5 · Landmines

**L1 · The silent `ReferenceError`.** `verify.mjs:8` destructures named globals off the `vm` context.
If a name it lists stops being a bare top-level binding — e.g. `INK_PERFECT_GAIN` folded into an
economy row — `vm.runInContext` throws before a single assertion runs and the whole suite dies with
a low-level crash, not a readable failure. **Every new top-level name the simulation slice exports
must be added to that list, and no listed name may stop existing.**

**L2 · Two different "documented" values.** They share a formula and a constant and read different
data at different times. Never give them names that invite confusion.
- `n.documented` — frozen on the node at `release()`, read by the renderer for as long as the node
  lives.
- `launch.sweep` — carried on the player, read at the *next* `capture()` for the dividend and the
  knowledge contribution.

**L3 · The designation is derived, never stored.** Main nodes are skippable *by design* and the score
system pays a `skipBonus` for it; a skipped node is pruned (`:745`) with no dangling-reference
recovery anywhere. A "search once, wait for capture" implementation strands the transition
permanently for exactly the players the game rewards. Re-resolve the flag every row and on every
prune. Exclude `type==='fading'` (dies at 4.5 s of orbit — it could kill the player mid-transition)
and any `difficultyChoice` node. Tolerate the search coming up empty and retry next row.

**L4 · `REVEAL_CAP` must not gate earned documentation.** `reveal.progress()` returns `0` while three
other marks are drawing. That throttle exists to stagger marks *entering the view*. Routing the
observation clock through it would blank an already-earned reveal the moment a fourth body scrolled
in — which happens routinely. The observation clock is read directly.

**L5 · `ink` is mutated, not replaced — and stale keys survive.** `applyPlate()` (`:386`) does
`for(const key of Object.keys(PLATES[name]))ink[key]=PLATES[name][key];`. A key present in the
outgoing plate but **absent** in the incoming one is never cleared. With one plate at a time this has
never mattered. With eight eras it is a real bug: era A's leftover section will silently paint era B.
Either give every era a complete token set, or clear `ink` before applying.

**L6 · The chapter cap has five call shapes, not four.** `ui.js:402` `Math.min(3,…)`;
`celestial.js:485`, `celestial.js:732`, `frame.js:393` `clamp(…,0,3)`; `ledger.js:78`
`Math.min(4,…+1)`; **and `ceiling.js:90` `ceilingWatch()`**, which the older documents miss entirely.
Grepping one literal finds one of them.

**L7 · `ceilingPlate()` is read at 21 sites, not 4.** Counted, not estimated: `ui.js` ×13,
`audio.js` ×4, `plates.js` ×3, `frame.js` ×1 — announcements, end-screen text, the tutorial line, the sistrum, the grind. The older
documents name four "bypasses". Entsandboxing the Ceiling means answering all 24.

**L8 · `darknessRelief` names two unrelated things** in one global scope: a render-side smoothed tint
in `plates.js` and `OrbitWorld.prototype.darknessRelief()` in the simulation. Rename the render-side
one before a third era's decay collides with it.

**L9 · `ceilingFractureEdge()` (`ceiling.js:1565`) allocates per frame**, violating the project's own
"nothing generative runs per frame". Do not copy that shape into any new era's decay.

**L10 · Name collisions to avoid.** `OBSERVATIONS` (feats, `simulation.js:159`), `ledger` (the
lifetime document, `ledger.js`), `chapter` (the existing row-band index). The Journey's own state
must not take any of these names.

---

## 6 · Contracts — fix these names before any parallel work starts

So that stages built by different agents fit together without a rename pass.

**Simulation-side** (inside the markers, added to `verify.mjs:8`'s list):

```
SWEEP_FULL          TAU*2/3 — the completion arc
ECONOMY             the per-era economy row table
n.documented        0..1, written once in release()
n.transition        boolean, the derived designation flag
world.eraId         1..8, the current era ordinal
world.eraKnowledge  the run's accumulating contribution for the current era
world.transitionReady
world.difficultyDriver()   the shared endless scalar, §1.8
```

**Persistence** (new file `src/journey.js`, loaded after `ledger.js`):

```
JOURNEY_KEY = 'orbit.journey.v1'
journey = {era:1, knowledge:0, milestones:{}, unlocked:[1], bests:{}}
journeyCommit()     folds the run's contribution in; called on death and on page-hide,
                    exactly as ledger.js already does for the lifetime document
journeyReset()      §1.2's deliberate restart — era back to 1, knowledge and milestones cleared,
                    `unlocked` and `bests` untouched. Confirmed before it runs; never implicit.
ERA_THRESHOLD       §1.6's 25, one number until an era earns its own
```

**Mode** — one global, read by `plates.js` and `ui.js`:

```
runMode  'journey' | 'free' | 'daily'
```

Only `'journey'` may call `journeyCommit()`.

---

## 7 · The stages

Each stage names what lands, the files, how it is proven, and what must not break. Stages 1–5 are
sequential. Stage 6 fans out. Stage 7 fans out per era.

> **Delegation note.** Stages marked *parallel-safe* can be handed to separate agents once the
> contracts in §6 exist. Stages marked *single-owner* touch shared state or persisted data and should
> be done by one agent in small, separately revertible commits. Every agent must run `npm test` before
> committing and must not edit `verify.mjs`'s existing assertions without saying so.

### Stage 1 — the orbit-based reveal · *single-owner, small* · **BUILT**

Bodies read as phenomena and are represented progressively during orbit. No era plumbing at all.

- `src/simulation.js`: add `SWEEP_FULL = TAU*2/3` beside the speed constants. In `release()` (`:545`),
  before `p.node=null`, write `n.documented=clamp(p.orbitSweep/SWEEP_FULL,0,1)`. One line, one site.
- `src/reveal.js`: split `revealNode()` (`:105`) into two clocks.
  - `t` (and `ring`) stay on `reveal.progress(n,NODE_REVEAL)` — the phenomenon is owed to the player
    the instant the body is on screen.
  - `d = active ? clamp(p.orbitSweep/SWEEP_FULL,0,1) : (n.documented||0)`, read **directly**, never
    through `reveal.progress()` (L4).
  - `keyline`/`hatch`/`wash`/`survey` re-span over `d`, ending at completion — start from
    `keyline 0→.4`, `hatch .28→.62`, `wash .36→.84`, `survey .58→1` and tune by eye.
  - `done = t>=1 && d>=1`.
- `src/reveal.js` `revealPlanet()`: add a stage (0) — a flat, dry disc at low alpha scaled by
  `pen.ring` and fading out as `d` rises, so an un-orbited body is a mass and a position rather than
  an absence. Use `ink.reveal.dry`; never write `ctx.font` or a colour literal.
- **Leave `revealLabel()` alone.** Every caption `drawNode()` prints is planning information — the row
  number, `+15`, `SCUTUM`, `REPULSA`, `INK`, `NEXT`, `SLINGSHOT STAR` — not identity. Staging them
  would withhold something a trajectory depends on, which the design forbids.
- Completion flourish **detection site only**: track the previous frame's `d` for the active node and
  fire once on the `<1 → 1` crossing. Default implementation is a no-op; each era's own flourish is
  stage 7.

*Proven by*: fixtures that `n.documented` is correct at release and untouched by a later capture; a
node held at death keeps reading live `orbitSweep`; a never-captured node reads `0`; a fourth,
already-documented node is **not** gated by `REVEAL_CAP`; the flourish fires exactly once on the
crossing and never for a body that does not complete. *Must not break*: `:684`, `:693` — add a fixture
flying one seed two ways and asserting an identical node array despite differing `documented`.

### Stage 2 — the Prehistory readability prototype · *parallel-safe, art-led* · **BUILT — and it passes**

The Rock is now the front door: a new player's first run, possibly several, is era I. Its own risk
section flags an unspiked question and it must be answered before anything expensive is drawn.

Build an intentionally **rough** prototype — rock surface, scratches, ochre, charcoal, primitive
marks — as a standalone page beside `docs/eras/prototypes/rock.html`. The goal is not beauty. With no
conventional text labels, prove a player can immediately read: the target phenomenon · the capture
region · weak versus bright phenomena · their own position · their trajectory · danger · observation
completion.

*Proven by*: eye, against the one-frame release window from §3 — if the pre-literate language costs
the player timing, it has failed regardless of how it looks. Record the outcome in `PROTOTYPES.md`.

### Stage 3 — era state and Journey persistence · *single-owner, the riskiest stage*

Everything in §6's contracts, and nothing else. Land it in separately revertible commits in this
order: the `eraId()` accessor; the Ceiling entsandboxing; the cache keys; the singleton-to-map
conversions; `src/journey.js`.

- `plates.js`: `eraIndex` / `eraId()`; `syncPlate()` gains `data-era`; `index.html` gains one
  `[data-era]` rule per era. `[data-plate-id]` narrows to mean a cosmetic variation *inside* an era.
- Fold an era id into every cache key: `regionPlates`, `celestialPlates`, `ringSprites`,
  `glowSprites`, `flareSprites`, `nebulaSprites`, `figureLayers`, the `glyphs` LRU, **and**
  `darknessPlates` (`effects.js:526`, keyed by `relief` alone today). Convert the single-slot
  singletons `laidTile`, `laidSheet`, `grain`/`grainSheetCanvas` and `backdrop` to small maps —
  `laidPaper()`/`laidSheetFor()` are on the hot per-frame path, so a two-era working set on a
  single slot is a full rebuild every frame.
- Fix L5 before any of the above is trusted.
- Remove the Ceiling's sandbox: `frame.js:406`'s separate render branch (a cross-dissolve between two
  tools cannot run until both renderers share a frame), the scoring bypasses, and the remaining
  `ceilingPlate()` reads — all 24 (L7).
- `src/journey.js`: the persisted document, `journeyCommit()`, the milestone table, unlock state, and
  `runMode`. Free Play era selection reuses `ledger.js`'s `UNLOCKS`/`isUnlocked()`/`setCosmetic()`
  machinery — an era becomes an unlockable whose condition reads the Journey document. **The
  selection UI does not need to be designed; it needs to be re-pointed.**
- Migrate `orbit.ledger.v1` and `orbit.best.v1` forward into §1.7's contextual records. Never mutate
  a stored shape in place.

*Proven by*: two eras' cache entries at the same index never collide; `laidPaper()`/`laidSheetFor()`/
`paintBackdrop()` hit rather than rebuild for two eras in one frame; a `resize()` repaints every map
entry; an old saved ledger and an old `orbit.best.v1` both survive migration; `journeyCommit()` is
never called in Free Play or Daily. *Must not break*: the `plateIds` loops (`:842`,`:1078`) — extend
them to loop era ids so a new era is smoke-tested the moment it is registered.

### Stage 4 — the shared endless driver · *parallel-safe once §6 exists*

One normalised, non-saturating scalar — `world.difficultyDriver()` — rising with run duration and
progression, feeding chart pace, boundary speed, transfer distance, capture tolerance, hazard
strength, gravity, wind, special-object density and transfer complexity. Eras apply restrained
multipliers on top; the backbone is shared.

Specifically un-clamp or re-key: `chartPace`'s `(row-3)/25` clamp; `darknessSpeed()`'s *second*,
wall-clock clamp; the hazard-radius `Math.min(8,k*.14)` term; the hard nebula-radius cap; and the
wind and pull coefficients, which have no row term at all. Lift the chapter cap at **all five** call
shapes (L6).

Per rule 1, the driver may read row, elapsed and progression — it may **not** read `eraId`. Two runs
at the same row must still mean the same thing.

*Proven by*: extend the long-run courses well past row 48 and assert the curves are still visibly
rising at rows 200 and 500. *Must not break*: `'The reward must move visible darkness away'` `:805`,
`'Pausing preserves the reprieve'` `:807`, `'Darkness resumes after the reward'` `:809`.

### Stage 5 — the seamless transition · *single-owner, largest render work*

§1.3, entirely inside gameplay. The old medium recedes; the transition body and the Observer Core
remain; the phenomenon is reinterpreted; the tool transforms; resource is restored; the boundary is
pushed back; the player is still in orbit; the next tap is an ordinary release.

The growth compositing is the largest genuinely new render work in the plan, but not from nothing:
`landContour()` growing outward under a `0..1` fraction is already how `reveal.js` blooms a planet's
wash and spreads a hazard's ink drop. The new work is scaling that to a full-screen, multi-second,
two-layer composite. Spike it first against a placeholder decay.

Must support **any number of transitions in one run** (§1.3) — nothing may assume one per run.
Nothing may reset score, streak, run timer or mastery state.

*Proven by*: eye, frame by frame — the body and the Core never flicker or dim; the new world grows
from a point rather than arriving from an edge; no dropped frame; no input required. Plus a
simulation fixture that two transitions in one run leave score and streak monotonic.

### Stage 6 — the whole ladder in mocks · *parallel-safe, cheap*

Eight eras end to end with placeholder visuals, so the complete loop is playable and tunable before
any expensive art. A mock era is a `PLATE_STYLES` entry (`plates.js:236`) — `{base, wash, tint:
duotone(...)}`, three lines each.

This stage is where §1.5's milestone tables and the generation guarantees behind them are written and
tuned against `scripts/probe.mjs`, and where §12's acceptance test must pass.

### Stage 7 — the era art · *parallel-safe, one agent per era*

Per era: the economy row, token overrides, the `[data-era]` rule, backdrop painter, body painter, the
reveal spans, the completion flourish, the tool geometry, the frontier decay technique, stroke style,
hazard depictions, figure hand, faces, the knowledge-structure painter (the artefact that *is* the
progress display, read live and grown as the era's knowledge fills), the signature sheet, sound, and
README prose once it ships.

Order: **I Prehistory first** (already prototyped in stage 2), then VI Telescopic and II Egypt (both
have shipped renderers), then V and VII, then IV, III, and finally VIII.

---

## 8 · The acceptance test

Before any polish, this whole loop must work on placeholders:

1. Start a Journey run at the current frontier. 2. Play several short runs. 3. Die. 4. **All earned
observation progress remains.** 5. Start again directly at the same frontier. 6. Complete named
milestones. 7. `transitionReady` sets. 8. A fair transition body is presented. 9. Capture it
normally. 10. The full seamless transition runs. 11. Still in orbit. 12. **The same run continues** in
the next era. 13. Resource restored, boundary pushed back. 14. Die later. 15. Restart directly in the
newly reached era. 16. The previous era is selectable in unlimited Free Play. 17. **Free Play does not
advance the Journey.** 18. Per-era records work. 19. Free Play keeps scaling rather than saturating.

If that passes with placeholder visuals, the progression architecture is correct.

---

## 9 · Still open

Decisions this file does not make, and which should not be invented by an implementer:

- **The milestone tables for China and von Neumann**, and the final wording of all eight — including
  which single condition per era is the curated one §1.5 allows.
- **The threshold's final value.** §1.6 sets 25 per era from the measurement, which fixes the *shape*
  — five typical runs per era, forty for the ladder. The number itself is re-read off the probe once
  stage 6 is playable and the milestones, not the raw total, are what actually gate an era.
- **How the milestones and the knowledge total relate.** §1.5 gates an era on named milestones and
  §1.6 measures the climb in knowledge; whether the milestones *are* the gate with the total merely
  pacing them, or both must be satisfied, is not settled and should be decided in stage 6 against a
  playable ladder rather than on paper.
- **What the von Neumann era's own transition withholds** that no earlier one does, now that every
  transition grows outward from the traveller.
- **Era VII's black space as a material** — the frontier needs a substance to fail in.
- **The Rock's triad**, pending stage 2.
- **The checkpoints are not legible as checkpoints.** Stage 1's spans — `keyline 0→.4`, `hatch
  .28→.62`, `wash .36→.84`, `survey .58→1` — were flown and *feel* right: the body fills at a pace
  that matches the orbit. What they do not do is read as four named stages a player could learn and
  aim at. Whether that matters is the open question. Either the stages want a mark of their own at
  each threshold, or the whole idea of nameable checkpoints is wrong for a body being drawn on and
  the smooth fill is the honest answer. Do not tune the numbers to fix this — they are not the
  problem — and do not invent a threshold mark before the question is settled.
- **How the opening triad is drawn.** `revealNode()` currently forces `d=1` for a `difficultyChoice`
  node, so all three pressures stay drawn in full as they always were. That is a **holding position,
  not a decision**: the three worlds are shown for the first time in the Rock, and the era's own art
  direction settles what they look like before an orbit has taken them. Until then, leave it.
