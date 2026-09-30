# The Journey — the locked progression design, and the plan to build it

This file is the controlling document for the progression system. It supersedes the parts of the
older era documents listed in *What this overrides*, below, and where it disagrees with them, this
file is right and they are stale. It is written to be implemented from directly, in the stages given
at the end, by an implementer who has not read the rest of `docs/archive/eras/` — every line reference in it
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

> *Re-measured in stage 6: the threshold is now **50**, not 25. The shape below is kept, the number is not;
> see stage 6 for the reading.*

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
- **Endless was flat** until stage 4 landed, which is why §1.8 was stage 4 and not stage 7: `chartPace`'s clamp
  plateaus near row 28; `darknessSpeed()` has a *second*, independent wall-clock clamp that saturates
  around 236 s; hazard radius caps near k≈57; nebula radius is hard-capped with no row term; wind
  reach/force and the gravity pull coefficient have **no** row dependence at all.

Re-run with `node scripts/probe.mjs`; `--seeds`, `--patience`, `--rows`, `--seconds`, `--floor`,
`--span`, `--json`.

---

## 4 · Code map — verified

Line numbers checked on this branch. Re-check before editing; they drift.

**Simulation** (`src/simulation.js`, all inside the markers)
- `SWEEP_FULL` does not exist yet. `TAU` `:6`; `BASE_SPEED/MAX_SPEED` `:7`.
- `OBSERVATIONS` `:159` — the *feats* table. Do not shadow or reuse this name.
- `HAZARD_KINDS` `:180`. Ink gains `:33–35`.
- player init, `orbitSweep:0` `:309`.
- `release()` `:545`; `p.launch={…sweep:p.orbitSweep…}` `:550`.
- `capture()` `:554`; zeroes `p.orbitSweep` `:572`.
- `die()` `:626` — never clears `p.node`, so a body held at death keeps reading live.
- `p.orbitSweep+=turn` `:690`.
- fading death at 4.5 s of orbit `:702`.
- prune `:745`, guarded: `if(this.nodes.some(n=>n!==p.node&&n.y>=pruneY))this.nodes=this.nodes.filter(…)`.

**Reveal** (`src/reveal.js`)
- `REVEAL_CAP=3` `:23`; the throttle that returns `0` `:50`.
- `NODE_PEN` `:101`; `revealNode()` `:105`; `revealLabel()` `:118`; `revealRetire()` `:213`.
- `revealPlanet()` draws stages in order survey → wash → keyline → hatch.

**Figures** (`src/figures.js`)
- `drawNode()` `:635`; `const pen=revealNode(n)` `:640`; `if(pen.t<=0)return;` `:641`.

**Plates** (`src/plates.js`)
- `PLATE_STYLES` `:236` — a plate is `{base, wash, tint}`; a mock era is three lines.
- `plateName` `:301`; `const ink={}` `:302`; `syncPlate()` `:375`; `applyPlate()` `:386`;
  `setPlate()` `:392`.
- single-slot caches `laidTile`/`laidSheet` `:430`; `grain`/`grainSheetCanvas` `:371`.

**Ledger and unlocks** (`src/ledger.js`) — *the Free Play selection UI already exists here*
- `LEDGER_KEY='orbit.ledger.v1'`, `COSMETICS_KEY`, `INITIALS_KEY` `:10`.
- `emptyLedger()` `:11`; `readLedger()` `:22`; `migrateRecords()` `:38`.
- `UNLOCKS` `:93`; `unlockMet()` `:182`; `unlockedIds()` `:186`; `isUnlocked()` `:192`;
  `cosmeticItems()` `:218`; `setCosmetic()` refuses a locked id `:246`; locked-plate fallback `:256`.
- `personalBests` is already a map keyed by difficulty — per-era records fit the same shape.

**Frame / UI / effects / ceiling**
- `frame.js:406` — `if(ceilingPlate()){` the separate render branch.
- `ui.js:402` chapter cap; `ui.js:468` the `ledgerCommit()` skip.
- `effects.js:381` `markHead(boost,charge,inkHeld)`; `:390` `OBSERVER_MARKS`; `:509` the
  `cosmetic('mark')` lookup; `darknessPlates` keyed by `relief` alone `:526`,`:587`.
- `ceiling.js:1350` `ceilingDrawPlayer()`; `:1565` `ceilingFractureEdge()`; `:1575`
  `ceilingDrawDark()`.

**Tests** (`scripts/verify.mjs`)
- destructuring list `:8–9` — see landmine L1.
- `'One seed deals one chart'` `:684`; `'How a run is flown cannot change the chart it is dealt'`
  `:693`; the skipped-dividend fixture `:392–411`; `'A refused selection leaves the default in
  place'` `:867`; the `plateIds` loops `:842`,`:1078`.

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

**L7 · paid off.** It read: *`ceilingPlate()` is read at 24 sites, not 4.* The true count when the work
was done was **21** — `ui.js` ×13, `audio.js` ×4, `plates.js` ×3, `frame.js` ×1; audio.js and plates.js
had already been consolidated since the landmine was written. It is now **nought**, and a source-level
assertion in `verify.mjs` fails the suite if the string comes back.

What the census found is worth more than the count. The 21 were not one question asked 21 times:
**five** were capabilities (keeps its own record · is entered as a mode), **fifteen** were *vocabulary* —
"what is this thing called here", which wants a table and not a fork — **one** was a hand (it draws the
whole frame), and **one was dead code**: a Ceiling wording for the dark-death tip, sitting inside a
branch the preview flag had already excluded, that no player has ever seen. A second era answering the
same way would not have added 21 conditionals; it would have written the same fifteen-row table out by
hand a second time. That is the argument for the three declarations in §6.1 below.

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

### 6.1 · What a plate declares — built

Landed. `src/plates.js` carries three optional, purely declarative fields on a plate's own row, and no
code anywhere asks which era is on the press:

```
can        {score,mode}     what the plate keeps to itself
door       {button,label}   the frontispiece door that opens onto it, if it has one
era        1..8             the ordinal; nought is not "no era" — the printed atlas is itself era V
render     'ceiling'|'rock' which hand draws it, keyed into the painter registry
```

```
plateOwns(trait)     defineVoice(id,words) / plateWords() / spoken(key,vars)
defineHand(id,{...}) / handFor(name)        eraId()
```

`defineVoice` is additive rather than a single declaration, because an era's words belong in that era's
own file, which loads after `plates.js`. `handFor` returns undefined for a plate that names no painter
of that kind, and every seam in the pipeline is two lines at the head of the atlas's own painter, so a
plate that names none is drawn exactly as it always was — asserted painter by painter for the night and
paper plates. Sixteen seams exist: `atmosphere`, `node`, `hazard`, `player`, `dark`, `plateFrame`,
`laid`, `figure`, `surveys`, `hudLeaf`, `runningHead`, `chapterReveal`, `flourish`, `ready`, `frame`,
and the four audio ones (`scratch` as a row of numbers, `capture`/`death`/`medal` as painters).

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

### Stage 1 — the orbit-based reveal · *single-owner, small*

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

### Stage 2 — the Prehistory readability prototype · *done*

The Rock is now the front door: a new player's first run, possibly several, is era I. Its own risk
section flags an unspiked question and it must be answered before anything expensive is drawn.

Build an intentionally **rough** prototype — rock surface, scratches, ochre, charcoal, primitive
marks — as a standalone page beside `docs/archive/eras/prototypes/rock.html`. The goal is not beauty. With no
conventional text labels, prove a player can immediately read: the target phenomenon · the capture
region · weak versus bright phenomena · their own position · their trajectory · danger · observation
completion.

*Proven by*: eye, against the one-frame release window from §3 — if the pre-literate language costs
the player timing, it has failed regardless of how it looks. Record the outcome in `PROTOTYPES.md`.

**Landed**, and the era is now built from it — see stage 7 below. The spike page survives in
`prototypes/rock-read.html` as the record of the question; the frontispiece no longer opens it.

### Stage 3 — era state and Journey persistence · *landed*

**The back half** (2026-09-27): the contextual records of §1.7 are `orbit.records.v1` (Free Play, per era
and per reading) and the Journey document's `bests` (per era), read and kept by `contextBest()` and
`keepContextBest()` in `src/journey.js`; `orbit.best.v1` is dropped rather than carried forward (the game
was not yet played for real, so there was nothing to keep), and the daily keeps the record it already had. A Journey run no longer
writes Free Play's record, a pressure's personal best (the ledger counts it under `journey`) or a
century's own record (`caveRun`). Free Play is re-pointed: each era is an unlockable of the catalogue's
shape (`ERA_UNLOCKS`) whose condition reads `journey.unlocked`, answered by `ledger.js`'s own `unlockMet()`
and consulted by the doors and `enterEra()` — behind `JOURNEY_GATES_DOORS`, which is **off** by choice: every century stays open to Free Play while
the climb is still being tuned. (An earlier note here said the frontier could not pass VI; it could — every
century has a plate, and stage 6's acceptance test climbs all eight.) Turning
it on is one line; LINKING.md's "first chapter of an era not yet reached stays open as a proof" is not
built and belongs with it. `orbit.ledger.v1`'s migration was already done (v1 → v2, `readLedger()`).

**What is built.** The plate-declares-itself seam (§6.1), `eraId()` and `data-era`, the Ceiling fully
entsandboxed (L7, nought reads left), the caches keyed, and the singleton-to-map conversions. **What is
not:** ~~`src/journey.js`, the persisted document, `runMode`~~ (landed, see `LINKING.md`), the milestone table, the Free Play
re-pointing, and the migrations. Those are the whole of the rest of this stage and none of them exists.

Two corrections to the plan below, both measured rather than argued:

- **Four of the nine caches needed the plate folded in, not nine.** `figureLayers`, `glowSprites`,
  `flareSprites`, `nebulaSprites` and `ringSprites` already carried `plateName`. The four that did not
  were `celestialPlates` (a bare region index), `regionPlates` (only paper against not-paper),
  `grainSheet` and `darknessPlates` (a bare boolean).
- **`paintBackdrop()` was worse than a single slot.** It rebuilt the whole sheet on every call and the
  only thing holding a result was the variable it was assigned to. It is now the cache itself, over a
  `buildBackdrop()` that paints. `laidTile`/`laidSheet` became small maps beside it.
- **L5 was never live.** `definePlate()` writes every section for every plate and nothing else ever
  writes `PLATES`, so no plate can carry a key another lacks and `applyPlate()` cannot strand one. It
  stays true only while every era token is registered through `definePlate`; that is a discipline, not
  a fix, and the fixtures assert the key sets match across all plates.



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

### Stage 4 — the shared endless driver · *landed*

**Built** (2026-09-26): `world.difficultyDriver()` in `src/simulation.js`, a row term and a clock term, each
`log₂(1 + over/span)` from the point the last flat curve settled (row 28, and the flood's clock at
≈234 s), so it is nothing through any run of ordinary depth and is still rising at rows 200 and 500. It
feeds the pace a crossing is cut for, the flood, the lethal hazard radius, a field strength cut into each
hazard (`h.force`, read by `bendVelocity`, so the guide and the flight agree), the nebula cap, and — on
its whole units — the wind cadence, route-closing and hazard cadence. The capture band stops widening at
the plateau growth, the one tightening of the landing. It is behind `world.driven`, off by default like
every other world flag; `newWorld()` sets it for every run with `goalRow` 0 and the replay log carries
it, so a log from before it replays flat. The README's gameplay section states every number.

Two things the plan below asked for were deliberately left out, and why:

- **Gravity and wind with no row term** are fed through the per-hazard field strength rather than the
  two global coefficients (`1800`, `WIND_FORCE`), so a field is the strength it was dealt with and a
  guide can never read a different chart from the flight. Newton mode's node pull is untouched: it is an
  optional plate of its own and was not part of the flat-curve census in §3.
- **The chapter cap (L6)** is presentation, not difficulty: no simulation value reads `chapter`, so the
  driver does not need it lifted. What a fifth chapter onward *looks* like on each plate is an art
  question for stage 7, and the five call shapes are still as L6 lists them.

Measured with `scripts/probe.mjs --seeds=40 --rows=600 --seconds=1500` (and `--flat` for the chart
before it): the hands at σ 20–30 ms are unchanged (median rows 24 and 21), σ 10 ms goes from a median
of row 71 to 63, and the oracle from a median of row 190 (p90 421, one run in twenty surviving to the
cap) to a median of 150 (p90 209, none surviving), dying 60 % of the time to the dark.

The plan as it was written:


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

### Stage 5 — the seamless transition · *landed*

**What landed** (2026-09-27).

- **The simulation** (`src/simulation.js`): the page raises `world.transitionReady` once the era is known;
  `capture()` then turns the century on the next landing whose body `transitionBody()` accepts — anything but
  a fading body or an opening target, read at the moment it is landed on and never stored (L3). `eraTransition()`
  refills the nib, drives the dark back by `DARKNESS_RESCUE_DROP` with `DARKNESS_RESCUE_LEAD`, holds it for
  `TRANSITION_GRACE`, sets `eraFrom` and emits `eraTransition`. Score, streak, flow and clock are untouched,
  and there may be any number in one run. `nextTransitionBody()` names the body on the way, for the mark.
- **The page** (`src/ui.js`): `journeyArm()` raises readiness from the knowledge banked plus what the run has
  observed so far, and writes NEXT LANDING on the sheet. On `eraTransition` the climb is banked and turned and
  `turnEraInRun()` puts the next century on the press without dealing a new chart; a century's own simulation
  flags and transition rows come with it. Every century's chapters now count from `eraFrom` (`eraRow()` in
  `src/plates.js`), so a century reached at row 60 still opens on its first chapter.
- **The render** (`src/frame.js`): the frame as it stood under the old hand is taken whole at the landing and laid
  back outside a circle growing from the body, over 2.4 s, with the new plate's gold on its edge — two plates
  in one frame by keeping one of them as a still. `drawEraMark()` rings the body on the way.
- **The acceptance test** now takes steps 8 to 13 on the live page for three kinds of turn (a century to a
  century, a century onto the atlas, the atlas onto a century), and `tools/shots/scenarios/era-transition.mjs`
  shows it at 430×932.

**The old medium's own failure** (§1.3 step 6) landed after: `src/recede.js` wears a copy of the still
away at the growing edge in each century's own material, from `THE-FRONTIER.md`'s table — spall, salt bloom and
flaking, ink bleed and foxing, patina, ink burn, fog and frilling, tile dropout — with falling fragments
coloured from the still itself. The Probe's bit flips are not drawn: no century is above it to give way to.

**The unchanged core** (§1.3 step 10) came last: while the circle grows, `drawEraCore` in `src/frame.js`
holds the traveller as a small inked core keyed in paper, the one mark neither century draws in its own hand,
and for the first 0.7 s eight short gold strokes converge onto it — strokes rather than a ring, as
`OBSERVER-CORE.md` asks, so the new tool is seen closing round the core rather than a halo being hung on it.
The core lets go over the last half-second of the growth, when the new century's own traveller is drawn whole.

**Known compromises of this first cut.** The old medium is a still, not a live drawing: its marks do not
move while the circle grows, and it is held in place rather than carried up with the camera, because carrying
it opened a strip of the new sheet along its top edge. The DOM chrome (score, HUD labels) of the new century
waits for the circle and fades in once the sheet is whole. The phenomenon is reinterpreted (§1.3 step 9) as
`PROGRESSION.md` step 7 describes it: the body is drawn again from nothing by the incoming hand with the staged
reveal every body gets on first sight (`reveal.forget`), and the sheet writes the century that now holds it. A
cut-out of the old hand's drawing of the body, kept over it and read away, was tried and set aside: the camera
moves on after the landing, so the cut-out sat off the body, and an unvisited body is barely drawn in the old
hand at all. A run that
changed century is not saved for review, since a log cannot yet say which hand each stretch was flown under.

The plan as it was written:


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

### The ends of the climb · *landed*

(2026-09-27.) Knowing era VIII climbs the ladder (`journeyComplete()` in `src/journey.js`), said once on the
sheet. From then on a Journey run is the **Final Frontier** of §1.7: it goes on at the last rung, and its
score is kept as the Journey document's `bests.frontier`, the primary endless record, apart from the last
rung's own best. The deliberate restart of §1.2 has a control at last: BEGIN THE JOURNEY AGAIN in the
frontispiece's MORE menu, shown once any of the climb has been made, asked twice, sending the frontier back
to era I while the centuries reached stay open and every record, the Final Frontier's included, is kept.

### Stage 6 — the whole ladder in mocks · *landed, without the mocks*

**What landed** (2026-09-27). No mocks were needed: all eight centuries already had a playable plate by the
time this stage came up, so the ladder was climbable end to end on real art from the start.

- **The acceptance test runs**, as a runtime fixture in `scripts/verify/runtime.mjs` that climbs the live
  page from era I to era VIII: a Journey run at the frontier, a death that keeps its knowledge, a restart at
  the same frontier, every milestone standing, the page turned, a passed century open in Free Play, Free
  Play leaving the Journey untouched, and the records kept apart (§8 steps 1–7 and 14–18). Steps 8–13 are
  stage 5's in-run transition; until it exists the between-runs turn stands in for them. Step 19 is the
  endless driver's own fixture.
- **The climb is measured directly.** `node scripts/probe.mjs --ladder` has simulated players climb the
  whole ladder run after run under `src/journey.js`'s own rules (a ready era banks nothing further, the turn
  comes between runs) and reports the runs each century holds a player for. Read at 40 runs per hand on
  each chart, 400 players:

  | hand | runs per era at 25 | climb at 25 | runs per era at 50 | climb at 50 |
  |---|---|---|---|---|
  | σ 10 ms | 1 | 12 | 2 | 16 |
  | σ 20 ms | 2–3 | 20 | 4–6 | 35 |
  | σ 30 ms | 3 | 24 | 5–6 | 42 |
  | σ 45 ms | 4–5 | 34 | 7–9 | 63 |
  | σ 70 ms | 6 | 46 | 10–12 | 86 |

- **`ERA_THRESHOLD` is 50.** §1.6 asks for about five runs an era and about forty for the ladder at the
  author's own hand, which reaches about row 20. On the spread model that hand is σ 20–30 ms (median rows 24
  and 21), and at 25 it climbed an era in two or three runs: the knowledge formula and the release grace
  have both moved since §1.6's number was read off the late model. At 50 it takes four to six, and forty
  runs or so for the whole ladder, while a sharper hand still climbs in half that and a rough one in about
  twice. §1.6's shape is kept; its number is replaced.
- **The Rock held a player longer than the rest** — about one run more — because its chasms ended runs
  sooner and a shorter run observes less (a median of 8 to 9 banked a run against 10 to 13 on the atlas's
  chart). Playtesting found the same thing from the other side: wide cracks and the rising dark together
  left runs with no way out. The chasms were taken out of the base game (LINKING.md, "Endless, later"),
  and the Rock now holds a player exactly as long as every other century: 4 runs at σ 20 ms, 5 at σ 30.

**Not done here**, because each is a decision rather than a measurement: the curated milestone per era
§1.5 allows, and so the generation guarantees behind them (§9).

The plan as it was written:


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

**Era I is built** — `src/rock.js`, registered as a hand. The ground, the four primitives, the body's
build order over the observation clock, the ring and its completion cue, the two dangers the spike
drew plus the Draught, the traveller, the forgetting, and the fixtures of a printed sheet it names as
drawing nothing. Still the atlas's hand on that sheet, and the next pass rather than that one: the aim
guide, the wet trail and the dried route, the connection lines, the particle effects and the written
inscriptions. Not built at all: the economy row, the knowledge-structure painter, the tool geometry
beyond the crayon's contact point, the signature sheet, and sound.

One thing the port learned that every later era inherits: **a baked ground must be drawn at one sample
to one device pixel.** The wall's tooth is a per-pixel term, and drawing its tile at `size × scale` CSS
pixels on a 2× screen smeared away exactly the detail it exists to carry — the sheet read as fog until
the blit was made 1:1 and snapped to whole device pixels. See `PROTOTYPES.md`.

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
  which single condition per era is the curated one §1.5 allows. *Shape settled by the author (2026-09-28):
  each era's curated milestone is a **signature feat** drawn from that century's own mechanic (a swing-by
  round a `sling` body on the Flyby, Saturn resolved on the Lens, and so on), counted as one milestone more
  beside the chapters, and it **gates**: an era is transition-ready only when its chapters stand and its
  signature feat has been flown. Its generation guarantee is therefore owed, one per era. The eight were
  chosen the same day: the Struck Ring (I), Those Who Know No Rest (II), the Three Schools (III), a Wanderer
  Sighted (IV), Linea Pura (V), Saturn in One Sitting (VI), Gravity Assist (VII), Closure (VIII) — see
  `SIGNATURES` in `src/centuries.js`, each with the guarantee it rests on beside it.*
- *Settled in stage 6 (2026-09-27): the threshold is 50, re-read off `probe.mjs --ladder` so that the
  author's hand keeps §1.6's shape of about five runs an era.*
- *Settled in `LINKING.md` (2026-09-24): the milestones are the gate and knowledge only paces them; each
  era's milestones are the chapters its preview is already told in.*
- *How the milestones and the knowledge total relate, which this list once kept open, is the question the
  line above settles: the chapters are the gate and knowledge opens them one at a time
  (`journeyMilestones()` in `src/journey.js`), with the signature feat as the one milestone knowledge cannot
  pace.*
- *What the von Neumann era's own transition withholds* — settled by the author (2026-09-30), §9.1.
- *Era VII's black space as a material* — settled by the author (2026-09-30), §9.1.
- *The Rock's triad* — settled by the author (2026-09-30), §9.1.
- *Whether the Journey ever gates Free Play* — settled by the author (2026-09-30), §9.1.

### 9.1 · Settled by the author, 2026-09-30

Four questions this list kept open, answered by the author in one sitting. Recorded here, not yet built;
each is owed its own pass (§10, Open).

- **The ladder closes as a circle, back to the cave.** Era VIII's turn is the one that has no century above
  it, and it is the only turn that does not grow into a new hand. Once the Probe's chapters stand and
  Closure has been flown, the probe *replicates* — the Observer Core is copied into a daughter rather than
  carried across, which is the one thing no earlier turn does — and the daughter, sent out, finds a world
  like the Earth, seen as it was some seventeen thousand years ago, when the Hall of the Bulls at Lascaux
  was painted. The run then goes on in the cave: the sheet becomes era I's wall, and the sky the probe was
  sent to is the sky the first hand is about to notice. What this turn withholds that no other does is
  *the future*: every earlier turn reveals the next century, this one reveals the first.
  The Journey then begins a **new round**: the frontier returns to era I and the knowledge banked is cleared,
  as `journeyReset()` already does for BEGIN THE JOURNEY AGAIN, while every century reached stays open,
  every heirloom stays on the atlas and every record is kept. The document counts how many times the circle
  has been closed. This **replaces the Final Frontier** of §1.7 and "The ends of the climb": a Journey run no
  longer goes on at the last rung for ever; its endless record becomes the round's, and the rounds closed
  are the ladder's own lasting mark. (Lascaux is dated c. 17,000 BP; era I spans c. 40,000–3,000 BCE, so the
  date sits inside the century the circle returns to.)
- **Era VII's black is vacuum as measurement**, as `07-flyby.md` proposed: a parallaxing star field, a faint
  standing texture of the DSN link (carrier lock, signal-to-noise, a Doppler trace), the odd cosmic-ray hit
  and, over an irregular body, the shape-model mesh. The ground stays the starkest on the ladder; what the
  frontier (LOS) fails in is that measurement — the signal drops lock, lines go flat, tiles stop, the stars
  freeze in their parallax. Nothing is softened towards grey.
- **The Rock's triad reads by size, not brightness.** Three struck dabs in three sizes stand for the three
  pressures, because size separates at speed and in peripheral vision where three brightnesses on a torchlit
  wall need to be looked at. `ROCK_TRIAD` in `src/rock.js` is to be recut accordingly (the largest for Tiro,
  the smallest for Magister); the Moon keeps its place as a body of the wall, not as the easiest pressure.
- **The Journey gates Free Play, with a proof chapter.** `JOURNEY_GATES_DOORS` is to be turned on once the
  proof is built: a century the Journey has reached is open in Free Play, and of one not yet reached only the
  first chapter is open, as `LINKING.md`'s door-access line planned. The proof chapter is not built yet, and
  the gate stays off until it is, so no door is ever simply shut.

---

## 10 · Where the climb stands (2026-09-27)

A ledger of this plan against the code, so the next pass starts from what is true rather than from the
stages above.

**Done.**

- *Stage 3*: era state and the Journey document (`src/journey.js`); contextual records in
  `orbit.records.v1`, one per era and reading, with the Final Frontier's apart; the door mechanism
  (`eraOpen`, `ERA_UNLOCKS`) built and held off by `JOURNEY_GATES_DOORS=false`. No old records are
  carried over: the game had no players to carry them for.
- *Stage 4*: the shared endless driver, `world.difficultyDriver()`, on every Endless reading and the
  Journey; `probe.mjs --flat` reads the chart as it was before it.
- *Stage 5*: the in-run change of century, §1.3 steps 7–13 — NEXT LANDING and the ringed body, the growing
  circle over a still of the old sheet (`src/frame.js`), the old medium giving way in its own material
  (`src/recede.js`, eras I–VII), the body drawn again in the new hand (`reveal.forget`), the Observer Core
  held steady with the new tool's strokes closing on it (`drawEraCore`), resource restored and the dark
  pushed back, chapters counted from the arrival row (`eraRow`), any number of changes in one run.
- *Stage 6*: the whole ladder on real art, `ERA_THRESHOLD=50` measured with `probe.mjs --ladder`, the §8
  acceptance loop as a runtime fixture from era I to VIII, the Rock's chasms taken out of the base game.
- *The ends of the climb*: the ladder climbed and the Final Frontier; BEGIN THE JOURNEY AGAIN.
- *The replay of a run that changed century* (2026-09-27): the log keeps when each change was armed and
  what each new century set on the world (`eras`, beside `newtonOn` and the opening `transitionRows`), the
  replay arms the same landing and applies the same settings, and such a run ending on the atlas is saved
  as a plate and reviewable (`src/replay.js`; a runtime check replays each turn of the §8 fixture).
- *The bottom tally overlap on the Flyby and the Lens* (2026-09-27): an era's score floater settled its line
  a frame before it could see the note the same landing wrote; it now asks the notes directly and waits out
  its first frame, as the Ceiling's did. The shots harness also let floaters stand through skipped paints,
  pinned at the foot of the sheet, which is where the overlap was seen.
- *The signature feats* (2026-09-28): one per century (§9), read off events the simulation already emits
  (`signatureEvent`), recorded by `journeySign()` and asked by `journeyReady()` and the arming of the in-run
  change; seven rest on what the chart already deals, and the Ceiling's on a wanderer dealt in every watch.
- *Per-era catalogues and the links between centuries* (2026-09-28): `orbit.eras.v1` keeps a log per century
  (`src/centuries.js`), and the one catalogue turns between eight leaves, each with its record, its collection,
  ten to fifteen feats of its own and a lineage; every known century leaves an heirloom on the atlas's Feats tab.
- *The ladder re-read with the signature feats* (2026-09-30): `probe.mjs --ladder` climbs on the feats as well
  as knowledge, read off the game's own detectors. At the author's hand they add two to four runs to the
  climb (33 → 35 at σ 20 ms, 40 → 44 at σ 30 ms), nearly all in era V, and nothing since Linea Pura was made fair. §1.6's shape holds and
  `ERA_THRESHOLD` stays at 50 (`MEASUREMENTS.md`, "The third reading").
- *Linea Pura made fair* (2026-09-30): the author's call, keeping the eight-row rhythm. The entry no longer
  spoils a figure, and a figure's stars hold a perfect band 2.2 times as wide with their reach opened to it
  (`FIGURE_RIM`). A hand of σ 45 ms flies the feat in about one run in ten (was one in a hundred), and every
  hand now climbs all eight.
- *Saturn in One Sitting against a rough hand* (2026-09-30), settled by the author as it stands. The sitting
  forgives one charge spent to save it. A hand of σ 70 ms still stays in era VI for about 27 runs against 11
  for its chapters, because the feat asks a run to reach the sensor at row 24 of the Lens and a hand that
  rough rarely gets that deep. The sitting is not shortened; at σ 45 ms and better the feat costs nothing
  (`MEASUREMENTS.md`, "Linea Pura made fair").
- *Readings*: a Chronicle and an Endless reading of every century, the atlas's own Chronicle (TO THE PRESS)
  included; the Ceiling's night wraps its hours when read Endless.

**Open.**

- **The heirlooms on the sheet itself.** Every known century now leaves its heirloom in the atlas's catalogue
  (below, Done), but none is yet drawn on the atlas's chart: the bull faint under Taurus, the rete star lettered
  under its Arabic name, the Dendera zodiac as a construction.
- **The review of a run that changed century, in each century's hand.** The log now carries the changes and
  the replay turns where the run did (above), but the review paints the whole chart in the atlas's hand,
  the stretch flown in the century below included; the page is not yet turned on the sheet itself.
- **The old medium as a live drawing.** The receding sheet is a still: its marks do not move, and it is held
  in place rather than carried with the camera.
- **The circle back to the cave** (§9.1): the Probe's replication, the Earth-like world as it was at
  Lascaux, the run going on on the wall, and the Journey's new round in place of the Final Frontier.
- **Endless-hard dangers.** One per century, in the spirit of the Rock's chasms, drafted in
  `ENDLESS-HARD.md` and not built.
- **The doors** (§9.1): the gate is built and off; it is turned on once the proof chapter of an unreached
  century is built.
- **The Rock's triad by size** (§9.1): `ROCK_TRIAD` recut from brightness to three sizes of dab.
- **The Flyby's vacuum as measurement** (§9.1): check the shipped ground and LOS against the settled
  reading and fill in what it lacks.
