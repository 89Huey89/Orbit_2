# tools/shots — the screenshot harness

Pulls the game in headless Chromium at any viewport, on any plate or era, at any moment of a seeded
run, and writes PNGs with a manifest and a contact sheet. A tool of the desk like
`scripts/probe.mjs`: it asserts nothing, and `npm test` never runs it.

```sh
npm run shots                                   # the smoke scenario on the reference phone
npm run shots -- run end                        # named scenarios
npm run shots -- plates --viewport=iphone-se    # every atlas plate on the shortest phone
npm run shots -- smoke --viewport=all           # every named viewport at once
npm run shots -- run --viewport=390x844@3,laptop --plate=night,paper   # crossings
npm run shots -- --list                         # scenarios, viewports, profiles
npm run shots -- --help                         # every option
```

Output goes to `tools/shots/out/` (git-ignored) as `<scenario>/<variant>/NN-name.png`, where the
variant names the viewport and whatever plate, era or profile differs from the default. Beside them:
`index.html`, a contact sheet of the whole invocation, and `manifest.json`, which records each file
with the run's state when it was taken (`state`, `row`, `score`, `time`, `seed`, `plate`). Page
errors are reported on the console, in the manifest and on the contact sheet, and make the command
exit non-zero.

Needs Playwright and a Chromium. It is **not** a project dependency: the harness uses a local
`node_modules/playwright` if there is one, else the global install (the cloud sandbox has both it and
a Chromium preinstalled). Elsewhere: `npm i -g playwright && npx playwright install chromium`, or
pass `--chromium=/path/to/chrome`.

## Why the captures are repeatable

`lib/page-init.mjs` runs before the game's own scripts and puts the page on a virtual clock:
`requestAnimationFrame`, `performance.now`, `Date` and `Math.random` all answer to the harness. The
harness advances time by hand, so *eight seconds into seed 7* is the same sheet on every machine,
however slowly it paints — two invocations with the same options produce byte-identical PNGs.
Long flights fast-forward: the simulation steps every frame but painting is skipped until the last
fraction of a second (`--paint-all` paints every frame, for checking animations).

## The options

| Option | Meaning |
|---|---|
| `--viewport` | a name from `lib/viewports.mjs`, `WxH[@scale]`, a comma list, or `all`. Default `iphone-15-pro-max` (430×932 @3), the reference sheet. |
| `--scale` | device pixel ratio, overriding the viewport's own |
| `--plate` | `night`, `paper`, `cellarius`, `verdigris`, `foxed`, `azzurra`, `sepia`, `proof`, `modern` — set with `setPlate()`, bypassing the unlock check |
| `--era` | `rock`, `ceiling`, `scroll` or `astrolabe`, entered through `enterEra()` after boot |
| `--profile` | what localStorage holds at boot, from `lib/fixtures.mjs`: `fresh` (first visit), `returning` (default), `full` (whole catalogue earned) |
| `--storage` | extra localStorage keys as JSON, layered over the profile |
| `--seed` | the run's seed (default 7) |
| `--difficulty` | `classic`, `relaxed`, `hardcore` |
| `--daily` / `--date` | play the daily plate; `--date` sets the page's wall clock (default `2026-09-24T12:00:00Z`) |
| `--hand` | the pilot: `oracle` (default), `good`, `fair`, `poor`, or a release lateness in seconds |
| `--dist` | shoot `dist/index.html` (after `npm run build`) instead of `src/` |
| `--out`, `--clean`, `--headed`, `--chromium` | output folder, empty it first, show the browser, a Chromium binary |

`viewport`, `plate` and `era` are axes: a comma list on any of them runs the scenario once per
combination, each in a fresh browser context.

## Writing a scenario

A scenario is a file in `scenarios/` — it is picked up by name with no registration:

```js
// scenarios/shield.mjs
export default {
  name: 'shield',
  description: 'A run carrying a shield.',
  defaults: {profile: 'full', viewport: ['iphone-15-pro-max', 'iphone-se']}, // CLI still overrides
  async run(g, options) {
    await g.start();
    await g.fly(12);
    await g.eval(() => { world.player.shielded = true; });
    await g.advance(.5);
    await g.shot('shielded');
  }
};
```

For a one-off that does not belong in the shared set, write the same file anywhere and pass its
path: `npm run shots -- /tmp/mine.mjs`. From another script, use the library directly:

```js
import {shoot} from './tools/shots/lib/index.mjs';
await shoot({viewport: 'laptop', plate: 'modern'}, async g => { await g.shot('front'); });
```

### The driver (`lib/game.mjs`)

| Verb | Does |
|---|---|
| `g.shot(name, {selector, fullPage, note})` | a capture; `selector` crops to an element, `fullPage` takes the whole scrollable leaf |
| `g.start()` | taps the frontispiece to begin the run |
| `g.fly(seconds, {hand, patience, paint})` | flies with the pilot (probe.mjs's hand) for that long |
| `g.flyTo(row, {maxSeconds})` | flies until the run reaches `row` |
| `g.advance(seconds, {fps, paint, settle})` / `g.idle(seconds)` | lets time pass with no hand on the run |
| `g.tap()` | one tap: release in flight, deal again from the colophon |
| `g.die(reason)` | ends the run with that loss and waits for the colophon |
| `g.pause()` / `g.resume()` | the pause leaf |
| `g.openCatalogue(tab)` / `g.closeCatalogue()` / `g.openEphemeris()` / `g.openMore()` / `g.openReview()` | the leaves |
| `g.setPlate(id)` / `g.enterEra(id)` / `g.leaveEra()` | change the press mid-scenario |
| `g.click(selector)` | a real pointer click on a control |
| `g.eval(fn, arg)` | anything else, in the page — the game's globals (`world`, `handleInput`, `render`, ...) are all reachable. Top-level `let`s like `runSeed` are reachable by name only, not through `window`. |
| `g.state()` | `{state, row, score, captures, time, seed, plate, reason}` |

### Extending the rest

- **A new viewport:** a row in `VIEWPORTS` in `lib/viewports.mjs`.
- **A new storage profile:** an entry in `PROFILES` in `lib/fixtures.mjs`.
- **A new driver verb:** a method on `Game` in `lib/game.mjs`, if more than one scenario needs it.
- **A new axis** (crossed like `plate`): add it to `AXES` and `BASE_OPTIONS` in `lib/runner.mjs` and
  apply it in `Game.boot()`.

## Files

```
tools/shots/
├── shots.mjs              the command line
├── scenarios/             one capture sequence per file (smoke, frontispiece, run, deep, end,
│                          catalogue, plates, eras)
└── lib/
    ├── runner.mjs         crosses scenarios × viewports × plates × eras, one context each
    ├── game.mjs           the driver a scenario is handed, and the pilot
    ├── page-init.mjs      the virtual clock and seeded storage, injected before the game boots
    ├── viewports.mjs      named viewports and WxH@scale parsing
    ├── fixtures.mjs       localStorage profiles (FULL_LEDGER mirrors scripts/verify.mjs)
    ├── scenarios.mjs      finds scenarios by name or path
    ├── contact-sheet.mjs  the index.html written beside the captures
    ├── server.mjs         a static server on a free port
    ├── playwright.mjs     finds Playwright (local or global) and launches Chromium
    └── index.mjs          the harness as a library: shoot(options, fn)
```
