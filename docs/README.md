# docs/

`README.md` at the root is the authoritative record of what Orbit **does** — every rule and number
in the game as it stands. `CLAUDE.md` is the map for working on the code. This directory holds
neither: it is where work that is not being built right now is written down, so a plan survives
between the sessions that might one day resume it.

## Current focus

The eight-era progression system archived below is **indefinitely postponed** (since 2026-09-08,
no resumption date set). Active development is exclusively on polishing the shipped Renaissance
atlas — era V, the only plate a run ships with today (root `README.md`'s "Plates" and "Catalogue"
sections; `src/plates.js`'s default). Nothing under `archive/` is a live backlog; do not build
toward it without being explicitly asked to resume it.

## `archive/eras/` — the archived eight-era progression plan

Nothing here describes shipped behaviour, with two exceptions: Era I (`01-rock.md`) and Era II
(`02-ceiling.md`) are already playable, standalone preview doors reached from the frontispiece
(`src/rock.js`, `src/ceiling.js` — see root `README.md`'s "The eras"). They ship on their own,
outside of any progression system; everything else below is unbuilt, postponed design.

```
archive/
└── eras/                     the postponed progression through the history of the star atlas,
    │                         climbed across many runs
    ├── JOURNEY.md             the controlling document: locked progression design, code map, build plan
    ├── OVERVIEW.md           the older entry point; superseded in part by JOURNEY.md
    ├── MEASUREMENTS.md       what the simulation actually measures, for the design above
    ├── IMPLEMENTATION.md     the order the work would be done in, costed against src/
    ├── PROGRESSION.md        the observation-gated run: the ledger, the transition object, endless mode
    ├── KNOWLEDGE-HORIZON.md  the three states a body is drawn through, on the swept arc of the orbit
    ├── ECONOMY.md            one traversal rule, eight skins; the probe's harvest
    ├── ARCHITECTURE.md       what an era costs in this codebase, and the multi-era spine
    ├── THE-FRONTIER.md       the boundary destroys the representation, not the universe
    ├── OBSERVER-CORE.md      the one motif that survives every era, and the eight tools around it
    ├── CANDIDATES.md         the eras that didn't make the climb, and what reviving one would cost
    ├── DANGERS.md            hazards per era, and the one place an era stops being cosmetic
    ├── LETTERING.md          faces, numerals and reveal animations per era; shaping, quadrats, strokes
    ├── ERA-AUDIT.md          astronomy history read as art history, era by era
    ├── CEILING-POLISH.md     the Ceiling's shipped preview, audited against its own era file
    ├── PROTOTYPES.md         how each era's prototype fared against the shipped standard
    ├── OPEN-QUESTIONS.md     what has been settled, and what is still open
    ├── 01-rock.md            I    · c. 40,000–3,000 BCE — the cave wall (shipped, `src/rock.js`)
    ├── 02-ceiling.md         II   · c. 1473–1458 BCE — the tomb ceiling (shipped, `src/ceiling.js`)
    ├── 03-scroll.md          III  · c. 649–684 CE — the star chart on the scroll
    ├── 04-astrolabe.md       IV   · 964–1437 CE — the sky read through the instrument
    ├── 05-engraving.md       V    · c. 1540–1610 — the atlas page
    ├── 06-lens.md            VI   · 1610–1990 — the lens, the plate, the rendered sphere
    ├── 07-flyby.md           VII  · 1965–present — the mission mosaic
    ├── 08-probe.md           VIII · the far future — the self-replicating probe
    ├── candidates/           eras argued for and set aside, kept rather than deleted
    ├── research/             the long research file under each era, with sources and doubts
    └── prototypes/           one standalone canvas page per era, its faces, and its screenshots
```

The ladder used to be an art-direction problem — nine skins for one mechanic, chosen by
century. It became a claim about the mechanic itself: a node begins as a bare celestial
phenomenon, and orbiting it is the act that turns it into knowledge, in the hand of whichever
century is currently held. `JOURNEY.md` is the controlling statement of that claim and the door to
open first if the design is ever picked back up; `research/` holds four files behind it —
`china.md`, `instruments.md`, `observer-core.md`, and `space-age.md` — reached from the era files
and cross-cutting docs above that draw on them.
