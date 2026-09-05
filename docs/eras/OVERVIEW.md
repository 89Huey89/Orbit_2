# The ascent through time

Orbit is a star atlas. The history of the star atlas *is* the history of astronomy, which
means the game already owns the subject a progression through time would be about: it does
not have to invent a fiction to justify changing its look, only to admit which century each
sheet was pulled in. This document sets out the ladder of eras, the rules that keep them one
game rather than five, and the order to build them in.

The game today sits in exactly one of these eras — the third — and is unaware of it.

## The rule that makes this affordable

**An era is a plate. A chapter is a scene inside that era.**

These are two different axes and the codebase already has both, cleanly separated:

- The **plate** is the art direction. It is global, cached, earned in the ledger, chosen by
  the player, and switching it rebuilds every cached layer once. Six exist.
- The **chapter** is the scene. It is `Math.floor(world.progress/8)` clamped to four, computed
  entirely on the render side, cross-faded continuously as the player climbs, and announced
  with a page turn. The simulation has never heard of it.

The tempting reading of "progress through time as you progress through the game" is to make
the chapters the eras — Egypt at row 0, the space age by row 32. Resist it. It forces a global,
fully cached art direction to change four times a run, restarts every run in Egypt, and spends
four thousand years in ninety seconds. See `ARCHITECTURE.md` for what that actually costs.

The reading that works, *as far as the architecture is concerned*: **you earn your way forward
through the centuries**, and each era you have earned still has its own four chapters. Egypt's four chapters are four Egyptian skies. The
observatory's four are four modern ones. The ladder is the meta-progression; the chapters stay
the shape of a run. Nothing about the plate/chapter split has to be fought.

Whether that is the reading the *game* wants is a separate matter, and it is not settled — it
trades away any sense of the centuries turning while you play. A third shape, where a run opens on
the era you have earned and drifts forward from there, is set out in
[OPEN-QUESTIONS.md](OPEN-QUESTIONS.md#1-where-does-the-progression-actually-happen-the-big-one).
Read that before building against this one.

## The ladder

| | Era | When | The document it is pulled from |
|---|---|---|---|
| **I** | [The Ceiling](01-ceiling.md) | c. 1479 BCE | Senenmut's astronomical ceiling, TT353 |
| **II** | [The Globe](02-globe.md) | 964 CE | al-Ṣūfī, *Kitāb ṣuwar al-kawākib al-thābita* |
| **III** | [The Engraving](03-engraving.md) | 1600–1801 | Bayer, Cellarius, Hevelius, Flamsteed, Bode |
| **IV** | [The Plate](04-plate.md) | 1887–1958 | Carte du Ciel; Barnard; the Palomar survey |
| **V** | [The Observatory](05-observatory.md) | 1990– | narrowband composites; Gaia; the survey pipeline |

Era III is the game as it ships. Everything already in the catalogue — the night and paper
plates, Cellarius, Verdigris, Foxed, Proof, Carta azzurra, Sepia, the Hevelius/Bayer/Bode
figure hands, the Fell types, the Latin captions — belongs to it and needs no further work.
The ladder extends outward from a middle that is already finished.

## The four rules every era answers to

An era that breaks any of these is a different game, not another plate.

1. **The simulation never learns about it — as far as it can.** `simulation.js` stays DOM-free, and
   an era is cosmetic exactly as every plate is today. This holds cleanly for grounds, bodies,
   lettering, figures and frames. It does **not** survive contact with dangers: `HAZARD_KINDS` lives
   inside the simulation slice, so an era that changes which dangers a chart carries changes the
   chart itself. [DANGERS.md](DANGERS.md) sets out what that costs and the three ways round it; until
   one is chosen, an era re-*depicts* and re-*names* the existing hazard rows and adds none.
2. **Every era speaks in its own hand.** The Latin captions are not neutral — they are era
   III's voice. Egypt captions in hieroglyphs with a transliteration; the Globe in Arabic;
   the Plate in survey designations and plate numbers; the Observatory in catalogue numbers.
   An era that borrows another's lettering has not been built yet.
3. **Every era keeps the same seven families, and the same hazard rows.** Ocean, crater, ringed,
   ice, dune, volcanic, storm are the vocabulary of the game's bodies; the attractor, the repulsor
   and the crosswind are the vocabulary of its dangers. An era changes how they are *depicted* — a
   painted disc, a gilt roundel, an engraved specimen, a photographic blur, a lit sphere; a serpent,
   a dragon, a whirlpool, a dead patch of emulsion, a black hole — and never what they are. The
   player must read the chart the same way on any sheet.
4. **No dependencies, no external resources.** The build fails if the bundled page references
   anything over the network. Every era's fonts are embedded and its art is generated.

## Build order

Build **outward from era III**, and build the far end first.

1. **V, The Observatory** — first, and already begun. It is the era furthest from what exists,
   so it is the one that tests whether the architecture survives an era at all. It also
   delivers rendered bodies, which is the thing most worth having on its own.
2. **IV, The Plate** — next, because it is the cheapest possible second era: it is era V's
   ground and era III's lettering discipline, in one channel, and it needs no new figure
   drawing at all.
3. **Generalise.** With three bases standing, replace the `onPaper()` boolean with a style id
   and give `definePlate` its third and fourth variants for real. Do this *after* two eras have
   been built, not before — the right shape of the abstraction is not knowable until then.
4. **II, The Globe** — the first era that needs a new lettering face, a new figure hand and a
   new palette discipline all at once. The real test of the generalised form.
5. **I, The Ceiling** — last. The furthest from the engine's assumptions (flat register bands,
   no perspective, no shading at all) and therefore the one that most wants everything else
   already in place.

## What each era costs

Roughly the size of the paper plate — which is to say, a substantial but ordinary piece of
work on this codebase, done once per era and never a rewrite. The itemised list is in
[ARCHITECTURE.md](ARCHITECTURE.md).

## Eras considered and deferred

Not for lack of documentation — each of these is well attested — but because each duplicates
a neighbour's visual language or fails rule 3.

- **Babylonian, c. 1000 BCE (MUL.APIN, the three-star astrolabes).** Superbly documented, but
  the record is a *text*: cuneiform tablets listing rising dates, not a picture of the sky.
  There is no Babylonian star map to pull a plate from. It would have to be invented, and an
  invented era is the one thing this ladder cannot afford.
- **Greek/Roman, c. 150 CE (the Farnese Atlas; Ptolemy's *Almagest*).** The Farnese globe is
  the oldest surviving depiction of the Greek constellations, and it is marble — a sculptural
  relief, not a drawing. Beautiful, and a genuinely distinct look, but the *Almagest*'s own
  catalogue is textual and the constellation tradition it fixes is the one era II and era III
  both already inherit. Held as the strongest candidate for a sixth era.
- **Chinese, c. 700 CE (the Dunhuang star chart, BL Or.8210/S.3326).** The oldest complete
  preserved star atlas of any civilisation, twelve panels in quasi-cylindrical projection plus
  a circumpolar map, over 1,300 stars in three colours for the three schools of Shi, Gan and
  Wu Xian. It is *the* strongest candidate on documentation alone and it fails no rule. It sits
  out of the ladder only because it is contemporary with era II and the ladder wants one era
  per millennium, not two. If the ladder ever grows to six, this is the one.
- **19th-century lithographic (Argelander's *Bonner Durchmusterung*, 1859–62).** The moment the
  figures were abandoned and stars became magnitude dots on a grid. Historically the most
  important transition on this list — and visually a near-relation of era IV's discipline
  without era IV's photographic ground. Its ideas are folded into era IV instead.
