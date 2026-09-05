# The ascent through time

Orbit is a star atlas. The history of the star atlas *is* the history of astronomy, which means
the game already owns the subject a progression through time would be about: it does not have to
invent a fiction to justify changing its look, only to admit which century each sheet was pulled
in. This document sets out the ladder of eras, the rules that keep them one game rather than nine,
the decisions taken, and the order to build them in.

The game today sits in exactly one of these eras — the sixth — and is unaware of it.

## The two decisions that shape everything

**The run is the progression, gated on score.** Every run opens on a cave wall and climbs
forward through the centuries. Era boundaries sit at total-score thresholds, not at rows and not
at anything the player chooses, so the era is a pure function of the score: two runs that reached
the same figure have passed through the same eras in the same order and met the same rules,
whoever flew them. This is the shape [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) was converging on
when the ladder was first written down, and it has now been chosen. What it costs, and how the
engraving keeps its place, is set out in [PROGRESSION.md](PROGRESSION.md).

**One currency per era, one rule per century, all in a table.** Ink is era VI's word for a
resource every century rationed under its own name — ochre, gold foil, a grain ration, the
chisel's edge, gold and lapis, exposure, telescope time, mass. The names are free. A few eras add
one rule beside the name, and the last era changes the rule: the probe does not spend ink, it
harvests the bodies it orbits and replicates. Because the era is a function of the score, every
player meets every rule at the same point, and the score still means one thing. The table, the
rules and the probe's harvest are in [ECONOMY.md](ECONOMY.md).

## The rule that makes this affordable

**An era is a plate. A chapter is a scene inside the run.** These are two axes and they stay two:

- The **era** is the art direction *and* the economy row: global, cached, entered at a score
  threshold, announced with a page turn. Nine exist on the ladder, one of them shipped.
- The **chapter** is the simulation's own row-based escalation — which hazards a row may carry,
  which constellation is drawn next. It never learns about the era, so one seed still deals one
  chart on every sheet.

The tempting reading, eras as chapters gated on rows, was resisted in the first version of this
plan and is still resisted: rows and score decouple, so two runs at one score could have seen
different centuries. The score gate is what keeps the ladder honest.

## The ladder

| | Era | When | The document it is pulled from | Currency | Rule |
|---|---|---|---|---|---|
| **I** | [The Rock](01-rock.md) | c. 17,000 BCE | Lascaux, the Hall of the Bulls | ochre | the torch |
| **II** | [The Disc](02-disc.md) | c. 1600 BCE | the Nebra sky disc | gold foil | the arcs |
| **III** | [The Ceiling](03-ceiling.md) | c. 1479 BCE | Senenmut's astronomical ceiling, TT353 | the *khar* ration | — |
| **IV** | [The Marble](04-marble.md) | c. 150 CE | the Farnese Atlas; Ptolemy's *megethos* | *acies*, the edge | — |
| **V** | [The Globe](05-globe.md) | 964 CE | al-Ṣūfī, *Kitāb ṣuwar al-kawākib al-thābita* | gold and lapis | — |
| **VI** | [The Engraving](06-engraving.md) | 1600–1801 | Bayer, Cellarius, Hevelius, Flamsteed, Bode | ink | shipped |
| **VII** | [The Plate](07-plate.md) | 1887–1958 | the Carte du Ciel; Barnard; Harvard's plates | exposure | hold to develop |
| **VIII** | [The Observatory](08-observatory.md) | 1990– | the Pillars; the EHT ring; the FITS header | telescope time, in orbits | the allocation |
| **IX** | [The Probe](09-probe.md) | the far future | the Pioneer plaque; a CCSDS telemetry frame | mass | harvest and replicate |

Era VI is the game as it ships. Everything already in the catalogue — the night and paper plates,
Cellarius, Verdigris, Foxed, Proof, Carta azzurra, Sepia, the Hevelius/Bayer/Bode figure hands,
the Fell types, the Latin captions — belongs to it and needs no further work. The ladder extends
outward from a middle that is already finished: five centuries of hand-made skies before it, and
three of instruments after, ending with an instrument that draws no picture at all.

The two ends rhyme. The first era is marks struck into rock because nothing else would last; the
last is a probe that still carries an engraved metal plate for the same reason. Both are burin
work, and the game's own pen lettering is the thread between them.

Each era's own file carries its documents, grammar, palette, lettering, names, currency, dangers,
the seven families, its signature sheet, its prototype and its risks. Beneath each sits a longer
research file in [research/](research/) and a standalone art prototype in
[prototypes/](prototypes/); [PROTOTYPES.md](PROTOTYPES.md) records how each prototype fared
against the shipped standard and which painter reached it.

## The four rules every era answers to

An era that breaks any of these is a different game, not another plate.

1. **The simulation learns about the era in exactly two places, both tables.** `simulation.js`
   stays DOM-free. The era reaches it only as one row of `ECONOMY` (the currency's numbers) and as
   the score-threshold table that names the era; hazards, spawn rules, rows and chapters never
   consult it. Depicting a hazard differently per era is free and render-side
   ([DANGERS.md](DANGERS.md)); changing a hazard's rule per era stays off the table until an era
   has shipped under depiction alone.
2. **Every era speaks in its own hand.** The Latin captions are era VI's voice. The rock has no
   words and says so with dots and tallies; the disc counts with punches; the ceiling letters in
   hieroglyph columns; the marble cuts Roman capitals and Ptolemy's Greek; the globe writes naskh
   right to left; the plate types and inks by hand on the glass; the observatory prints a FITS
   header; the probe engraves a single-stroke line and logs telemetry. An era that borrows
   another's lettering has not been built yet. [LETTERING.md](LETTERING.md).
3. **Every era keeps the same seven families and the same hazard rows.** Ocean, crater, ringed,
   ice, dune, volcanic, storm are the vocabulary of the game's bodies; the attractor, the repulsor,
   the crosswind and the obscurer are the vocabulary of its dangers. An era changes how they are
   *depicted* — a dab of ochre, a chased gold disc, a painted decan, a carved roundel, a gilt
   roundel, an engraved specimen, an overexposed blur, a lit sphere, a sensed mass with its
   readouts — and never what they are. The player must read the chart the same way on any sheet.
   In era IX the families gain a second reading, the material each yields, without losing the first.
4. **No dependencies, no external resources.** The build fails if the bundled page references
   anything over the network. Every era's faces are embedded, cut to what the atlas sets, and
   loaded with the era rather than up front; every era's art is generated.

## Build order

Build the spine first, then outward from era VI, then the ends.

1. **The multi-era spine, with no new art.** Key every cache by era as well as chapter; add the
   `ECONOMY` and threshold tables; arm the boundary on the score and turn the page at the next
   capture; add `deepestEra` to the ledger; give the daily its era; add "open on" to the catalogue.
   [ARCHITECTURE.md](ARCHITECTURE.md) itemises it. Prove it with two eras live in one run before
   any sheet is drawn.
2. **VIII, The Observatory** — already partly built. Finish it: the instrument margin, the FITS
   HUD, the black hole, telescope time and the allocation.
3. **VII, The Plate** — the cheapest full era: a negative, a grid, a blur and a set of annotations
   over machinery that exists.
4. **Generalise.** With three bases standing, replace the `onPaper()` boolean with a style id. Do
   this after three eras, not before.
5. **V, IV, III** — the Globe (spike the shaping first), the Marble, the Ceiling (spike the
   quadrats first). Three eras of hand-made skies, each one figure hand and one face.
6. **II and I** — the Disc and the Rock, the two with no script, whose reveals are a punch and a
   dab and whose frames are a rim and a torch's reach.
7. **IX, The Probe** — last, because its rule needs the spine and its plaque hand needs a new
   stroke path, and because the ladder should end on the thing it was built toward.

## What each era costs

Roughly the size of the paper plate, plus one signature sheet — a substantial but ordinary piece of
work, done once per era and never a rewrite. The spine is the one piece of genuinely new
engineering and is paid once. The itemised list is in [ARCHITECTURE.md](ARCHITECTURE.md).

## Eras considered and not taken

- **Babylonian, c. 700 BCE (MUL.APIN; the Nineveh planisphere K.8538).** The planisphere is a real
  circular sky on clay and cuneiform has an OFL face, so the earlier objection — that the record is
  only text — was too strong. It sits out because the ladder already has two eras between the Rock
  and the Ceiling's neighbours, and because the Disc holds the same millennium with a more singular
  object. The strongest candidate for a tenth era.
- **Chinese, c. 700 CE (the Dunhuang star chart).** The oldest complete star atlas of any
  civilisation, and it fails no rule. It is contemporary with era V and the ladder wants one era
  per grammar, not two per millennium. Second candidate.
- **19th-century lithographic (the *Bonner Durchmusterung*).** Folded into era VII, as before.
