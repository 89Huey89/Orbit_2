# docs/

`README.md` at the root is the authoritative record of what Orbit **does** — every rule and number
in the game as it stands. `CLAUDE.md` is the map for working on the code. This directory holds
neither: it is where work that has not been built yet is written down, so a plan survives between
the sessions that build it.

Nothing here describes shipped behaviour. When a piece of this work lands, its account moves into
the root `README.md` in that file's own voice and the plan here is reduced to what is still
outstanding.

```
docs/
└── eras/                     the progression through the history of the star atlas, in one run
    ├── OVERVIEW.md           the nine-era ladder, the two decisions, the four rules, the build order
    ├── PROGRESSION.md        the score-gated run: thresholds, the page turn, "open on", the daily
    ├── ECONOMY.md            one currency per era, one rule per century; the probe's harvest
    ├── ARCHITECTURE.md       what an era costs in this codebase, and the multi-era spine
    ├── DANGERS.md            hazards per era, and the one place an era stops being cosmetic
    ├── LETTERING.md          faces, numerals and reveal animations per era; shaping, quadrats, strokes
    ├── OPEN-QUESTIONS.md     what has been settled, and what is still open — read before building
    ├── PROTOTYPES.md         how each era's prototype fared against the shipped standard
    ├── 01-rock.md            I    · c. 17,000 BCE — the cave wall
    ├── 02-disc.md            II   · c. 1600 BCE — the Nebra sky disc
    ├── 03-ceiling.md         III  · c. 1479 BCE — the tomb ceiling
    ├── 04-marble.md          IV   · c. 150 CE — the Farnese Atlas
    ├── 05-globe.md           V    · 964 CE — al-Ṣūfī's fixed stars
    ├── 06-engraving.md       VI   · 1600–1801 — the era the game is already set in
    ├── 07-plate.md           VII  · 1887–1958 — the photographic sky survey
    ├── 08-observatory.md     VIII · 1990– — the rendered, false-colour composite
    ├── 09-probe.md           IX   · the far future — the self-replicating probe
    ├── research/             the long research file under each era, with sources and doubts
    └── prototypes/           one standalone canvas page per era, its faces, and its screenshots
```
