# CLAUDE.md

Orbit is a small, dependency-free, single-page arcade game. `README.md` is the
authoritative gameplay/design spec — it documents every rule and number in the
game, in the game's own atlas-engraving prose. Read it for *what the game
does*; this file is the map for working on *the code*.

**The eight-era progression system is active again** (resumed 2026-09-24, after being
postponed since 2026-09-08). It is the plan to extend the plate system into an eight-era
progression through the history of the star atlas, from a Palaeolithic cave wall to
a self-replicating probe, climbed across many runs. Its planning documents live under
`docs/archive/eras/`. `docs/archive/eras/JOURNEY.md` is the controlling document for
that design; `docs/README.md` maps the rest of the tree.

**Current focus now includes building out the eight-era progression**, alongside
continued polish of the shipped Renaissance atlas — era V, the only plate a run ships
with today (see README.md's "Plates" and "Catalogue" sections, and `src/plates.js`).
Two pieces of that plan are already shipped, independent of the progression system
itself — Era I (`src/rock.js`) and Era II (`src/ceiling.js`), standalone preview doors
on the frontispiece; see README.md's "The eras".

## Commands

- `npm start` — dev server (prints the URL); or just open `src/index.html`
  directly. Both run the unbundled source, so no build step is needed between
  edits.
- `npm test` — runs `scripts/verify.mjs`, the whole test suite (deterministic
  simulation/runtime checks, no browser, no framework — plain
  `node:assert/strict`).
- `npm run test:quick` — the same file with `--quick`: skips the seeded playthroughs
  (the five 60-seed worker loops and the long pressure/rusher pilots) and runs two of
  the seven full-page runtime scenarios (430×932 blocked storage, 1440×900 full
  ledger). About a minute instead of six. Use it for changes that leave gameplay alone. It
  checks git and runs the full suite instead if `src/simulation.js` has changed since
  the branch left `origin/main` (committed, staged, unstaged or untracked);
  `--quick=force` skips that check. Run the full `npm test` before pushing anything
  that touches gameplay, the ledger's migrations, the daily log, or the playthrough
  tasks in verify.mjs themselves. CI always runs the full suite.
- `npm run build` — bundles into `dist/index.html` + `dist/assets/` via
  `scripts/bundle.mjs`.
- `node scripts/probe.mjs` — a tuning instrument, not a test: flies many seeded runs at several
  levels of hand and reports how deep a run actually gets, what it captures, and what the era
  progression's observation ledger would stand at by each row. Makes no assertions and is not run by
  `npm test`. Its first reading is `docs/archive/eras/MEASUREMENTS.md`.
- `npm run shots` — the screenshot harness (`tools/shots/`, see its README): pulls named scenarios
  of the game in headless Chromium on a virtual clock, at any viewport (`--viewport=iphone-se`,
  `390x844@3`, `all`), plate, era or seed, into `tools/shots/out/` with a contact sheet. Captures are
  deterministic. Use it for the 430×932 check below instead of building a one-off harness; add a
  scenario file to `tools/shots/scenarios/` when a new capture is worth keeping. Needs Playwright
  (not a dependency — the global install is found).
- `npm run glyphs` — regenerates `src/glyphs.js` from the faces in
  `assets/fonts.source.css` (needs `fontkit`).
- `npm run fonts` — regenerates `assets/fonts.css`, the same faces cut to the
  characters the game actually sets, from `assets/fonts.source.css` (needs
  `subset-font`). The charset is read off `src/` rather than kept as a list, so
  run this after adding a character the atlas had not set before.

Those two are the only commands needing a dependency. `assets/fonts.source.css`
holds the full faces, is the input to both, and is never served; the build ships
only the cut `assets/fonts.css`.

Run `npm test` (the full suite, not `test:quick`) before `npm run build` — CI (`.github/workflows/deploy-pages.yml`)
does the same before deploying `dist/` to GitHub Pages on every push to `main`.

## Architecture

- `src/*.js` are **classic scripts sharing one global scope** — no
  `import`/`export`. Load order is set by the `<script src="...">` tags in
  `src/index.html` and matters (a later file freely uses globals an earlier
  one defined). See the file map in README.md's "Source" section for what
  each file owns.
- `scripts/bundle.mjs` is the single source of truth for turning those script
  tags into one inline `<script>`; `build.mjs` and `verify.mjs` both call it,
  so the tested code and the shipped code are always the same bundle.
- `src/simulation.js` must stay **DOM-free**: `verify.mjs` extracts only the
  code between its `// BEGIN SIMULATION` / `// END SIMULATION` markers, runs
  that slice alone in a `vm` sandbox, and pulls specific named globals off it
  (`OrbitWorld`, `segmentCircle`, `flightStep`, `CONSTELLATIONS`, ...). Keep
  those markers in place, and update verify.mjs's destructuring list if you
  rename or add to what it needs.
- No runtime dependencies and no external resources of any kind: `build.mjs`
  fails the build if the bundled page contains any
  `<script|link|img|audio|video src/href="https?:...">`. Fonts, art, and
  audio are all generated or embedded in the repo.

## Target viewport

**Mobile is the target; the iPhone 15 Pro Max (430×932 CSS px, portrait) is the
reference sheet.** Every visual size — glyph radii, stroke weights, type sizes,
spacing — is judged there first, and on the paper plate, which is what the game is
actually played on. Desktop is supported and gets the wide-sheet marginalia (compass
rose, scale bar, engraver's line, MAGNITUDINES key), but it is a bonus: where a size
reads well on a laptop and badly in the hand, the hand wins.

`scale` (`Math.min(W/440, H/780)`, set in `resize()` in `ui.js`) is about **0.98** on
that viewport, so a number written in the source is very nearly a CSS pixel there —
but a CSS pixel on a phone is physically about two thirds of one on a desktop monitor,
which is why marks that look fine in a desktop browser can be unreadable on the
device. Size against the target, not against the window you are testing in.

Check a change at 430×932 before calling it done: `npm run shots -- <scenario>` (the reference
sheet is its default viewport), or `npm start` and a 430×932 viewport in devtools. `npm test` never renders a browser,
so it cannot catch any of this.

## Conventions

- Code is written dense (packed statements, little whitespace); comments are
  reserved for *why*, written as full prose sentences in the same voice as
  the README. Match a file's existing style rather than reformatting it.
- No `ctx.font` or CSS `font-family` is written out where text is drawn. The
  canvas asks `plateFace(size, variant, style)` and the stylesheet reads
  `var(--face-text|--face-sc|--face-body)`; the faces themselves are a plate
  token like any colour, so a plate can letter in its own type.
- Persisted state is versioned `localStorage` keys (`orbit.ledger.v1`,
  `orbit.plate.v1`, `orbit.daily.v1`, ...). If you change a stored shape,
  bump the version suffix and migrate the old key forward (see `ledger.js`'s
  `migrateRecords`) rather than mutating it in place.
