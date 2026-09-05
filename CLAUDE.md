# CLAUDE.md

Orbit is a small, dependency-free, single-page arcade game. `README.md` is the
authoritative gameplay/design spec — it documents every rule and number in the
game, in the game's own atlas-engraving prose. Read it for *what the game
does*; this file is the map for working on *the code*.

`docs/` holds work that has not been built yet — currently `docs/eras/`, the
long-term plan to extend the plate system into a progression through the history
of the star atlas. Read it before adding a plate; nothing in it describes shipped
behaviour.

## Commands

- `npm start` — dev server (prints the URL); or just open `src/index.html`
  directly. Both run the unbundled source, so no build step is needed between
  edits.
- `npm test` — runs `scripts/verify.mjs`, the whole test suite (deterministic
  simulation/runtime checks, no browser, no framework — plain
  `node:assert/strict`).
- `npm run build` — bundles into `dist/index.html` + `dist/assets/` via
  `scripts/bundle.mjs`.
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
