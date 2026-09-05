# docs/

`README.md` at the root is the authoritative record of what Orbit **does** — every rule
and number in the game as it stands. `CLAUDE.md` is the map for working on the code.
This directory holds neither: it is where work that has not been built yet is written
down, so a plan survives between the sessions that build it.

Nothing here describes shipped behaviour. When a piece of this work lands, its account
moves into the root `README.md` in that file's own voice and the plan here is reduced to
what is still outstanding.

```
docs/
└── eras/                     the long-term progression through the history of the star atlas
    ├── OVERVIEW.md           the ladder, the design rules that hold it together, the build order
    ├── ARCHITECTURE.md       what an era costs in this codebase, and where the seams already are
    ├── OPEN-QUESTIONS.md     what is undecided — read this before building anything
    ├── LETTERING.md          typefaces and reveal animations per era, and the font budget
    ├── DANGERS.md            hazards per era, and the one place an era stops being cosmetic
    ├── 01-ceiling.md         Egypt, c. 1479 BCE — the tomb ceiling
    ├── 02-globe.md           Islamic Golden Age, 964 CE — al-Ṣūfī's fixed stars
    ├── 03-engraving.md       Europe, 1600–1801 — the era the game is already set in
    ├── 04-plate.md           1887–1958 — the photographic sky survey
    └── 05-observatory.md     1990– — the rendered, false-colour composite
```
