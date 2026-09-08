# CLAUDE.md

Orbit is a small, dependency-free, single-page arcade game. `README.md` is the
authoritative gameplay/design spec — it documents every rule and number in the
game, in the game's own atlas-engraving prose. Read it for *what the game
does*; this file is the map for working on *the code*.

**The eight-era progression system is indefinitely postponed** (since 2026-09-08, no
resumption date set). It was the plan to extend the plate system into an eight-era
progression through the history of the star atlas, from a Palaeolithic cave wall to
a self-replicating probe, climbed across many runs. Its planning documents are
archived under `docs/archive/eras/` — kept for reference, not a live backlog. Do not
build toward it, and do not treat anything in that tree as an active plan, unless
explicitly asked to resume it. `docs/archive/eras/JOURNEY.md` was the controlling
document for that design; `docs/README.md` maps the rest of the archive.

**Current focus is exclusively the shipped Renaissance atlas** — era V, the only
plate a run ships with today (see README.md's "Plates" and "Catalogue" sections, and
`src/plates.js`). Further polish there is the active work, not new eras or
progression plumbing. Two pieces of that archived plan are already shipped and
unaffected by the postponement — Era I (`src/rock.js`) and Era II (`src/ceiling.js`),
standalone preview doors on the frontispiece, outside of any progression system; see
README.md's "The eras".

## Commands

- `npm start` — dev server (prints the URL); or just open `src/index.html`
  directly. Both run the unbundled source, so no build step is needed between
  edits.
- `npm test` — runs `scripts/verify.mjs`, the whole test suite (deterministic
  simulation/runtime checks, no browser, no framework — plain
  `node:assert/strict`).
- `npm run build` — bundles into `dist/index.html` + `dist/assets/` via
  `scripts/bundle.mjs`.
- `node scripts/probe.mjs` — a tuning instrument, not a test: flies many seeded runs at several
  levels of hand and reports how deep a run actually gets, what it captures, and what the era
  progression's observation ledger would stand at by each row. Makes no assertions and is not run by
  `npm test`. Its first reading is `docs/archive/eras/MEASUREMENTS.md`.
- `npm run glyphs` — regenerates `src/glyphs.js` from the faces in
  `assets/fonts.source.css` (needs `fontkit`).
- `npm run fonts` — regenerates `assets/fonts.css`, the same faces cut to the
  characters the game actually sets, from `assets/fonts.source.css` (needs
  `subset-font`). The charset is read off `src/` rather than kept as a list, so
  run this after adding a character the atlas had not set before.

Those two are the only commands needing a dependency. `assets/fonts.source.css`
holds the full faces, is the input to both, and is never served; the build ships
only the cut `assets/fonts.css`.

Run `npm test` before `npm run build` — CI (`.github/workflows/deploy-pages.yml`)
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
