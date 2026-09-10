# Art Audit — TODO

Outstanding items from the *Orbis Tabula · Relatio Artis* art audit of the shipped Renaissance atlas (era V — see CLAUDE.md and README.md's "Plates"/"Catalogue" sections). 31 agents, 10 dimensions, adversarially verified. Extracted from the audit artifact on 2026-09-10.

Eight defects the audit also raised were fixed directly in the working tree the same day (the double-set imprint, derived-plate ink bleed, marginal score-note collisions, HIC SUNT DRACONES over the chapter title, the gloss running off the copper, TABULAE/digraph mismatch, the Cassini Division seventy-two years early, and Saturn's handles hatched flat) and are not repeated below — only what is still open.

Severity is the atlas's own magnitude class (Magnitude I = brightest/most important, down to V). Effort is the audit's own estimate. Each item's proposal is the audit's suggested fix.

**Totals: 177 findings, 53 new-art gaps, 45 source-fetch items. 19 findings checked off since extraction (2026-09-10): the inscription-collision floor, the chapter-title/inscription symmetry fix, the telescopic-families/imprint-date second state, the narrow-width compass needle/engraver's line/MAGNITUDINES key, the double-set impressum/button-row collision, the rising dark's treeline/flat-fill edge, the constellations' Latin entry-star lettering, the stale inscription carried through the footer band, the held-orbit gameplay marks' weight against the burin ring, the phone catalogue's opaque ground and forty straight rules, the leaked round cap on every open burin stroke, the unscaled margin text, the glowing scrims/duplicate shadows, the ink reservoir's CSS progress bar, the sound icon's speaking-trumpet (one Magnitude V finding marked superseded as a result — see its own note), the DOM pen's missing nib mark, the chapter title/running head double-naming, the frontispiece/colophon action rows recut as one ruled measure, and the Leviathan's own edge fade at the inner rule.**

## Contents

- [The historical claim, judged strictly](#era-fidelity)
- [One hand, one press, one sheet](#cohesion)
- [The frame and the marginalia](#frame)
- [Lettering, faces and the Latin](#typography)
- [The planets as hand-coloured specimens](#bodies)
- [Colour, ink and the plate system](#palette)
- [The dark, the comet and the hazards](#effects)
- [Constellation figures and the burin line](#figures)
- [The living pen and the act of drawing](#pen)
- [Screens, HUD and the interface as printed matter](#chrome)
- [New art needed](#new-art-needed)
- [Sources worth fetching](#sources-worth-fetching)

---

<a id="era-fidelity"></a>
## The historical claim, judged strictly

*20 findings.*

- [x] **The imprint is set twice in the same 60px of margin, in two hands, and collides with the button row as well** `Magnitude I · bug · trivial effort` — *Done: part (1) was already fixed 2026-09-10 (`syncImpressumScreen()` hides `#printer-line` once the cartouche draws). Part (2) now lands too — `impressumAnchor()` no longer commits to a permanent position while `world.state==='ready'`: it measures live against `#start-copy`'s actual `getBoundingClientRect().top` (the MORE disclosure included) and clamps above it, only settling for good — the original one-time anchor — once a run actually begins and the intro leaf hides. Verified at 430×932 with MORE collapsed and expanded, and once a run starts.*

  Two parts, both small. (1) The canvas cartouche is the better artefact — it is plate furniture, it scrolls with the sheet, it reveals row by row — so hide #atlas-impressum whenever drawImpressum() will draw (eraId()===0 && !plainPlate()), keeping the DOM span only for the ceiling/rock doors and the reduced layout at index.html:208. (2) That alone does not fix desktop: while the frontispiece leaf is up, the cartouche still prints through the button block. Give impressumAnchor() (frame.js:646) a second clamp while world.state==='ready' that keeps the cartouche's top above the intro overlay's occupied band, so it settles into place only once the run starts and the leaf lifts — which is also what README:68's 'nothing prints through a leaf' already asks for.

- [x] **Seven telescopic planet families, ring division included, under an imprint that dates the plate 1603** `Magnitude I · era-error · small effort` — *Done: `impressumRows()` now carries a second-state row, `AUCTA ET RECUSA · ANNO MDCLXXXVII`, that appears the first time a run captures a body from one of the seven telescopic-only families (lifetime or current run, via the new `ledger.telescopicCaptures`/`runTally.telescopicCaptures` counters).*

  Fix the date, not the art. In impressumRows() (frame.js:689-697) split the imprint into two states, the way an atlas copperplate was actually re-pulled with additions: keep AUGUSTA VINDELICORUM · ANNO MDCIII as the first state, and add one second-state row — AUCTA ET RECUSA · ANNO MDCLXXXVII — set the first time a run captures a body whose family only a lens could resolve. That converts the sheet's largest anachronism into its declared publishing history. It must land after the collision above is fixed, since the cartouche already carries nine rows and is already overprinting.

- [x] **At 430×932 the sheet ships with no compass rose, no scale bar, no magnitude key and no engraver's line** `Magnitude I · gap · medium effort` — *Done, via option (b): a bare `frameNorthNeedle()` now stands in the upper-left corner slot at narrow width (frame.js), the engraver's credit line is set centered along the bottom inner rule at narrow width, and a new `drawPauseMagnitudeKey()` draws the MAGNITUDINES key as a horizontal six-glyph strip below the pause leaf's card — live, only while `world.state==='paused'` and `!frameWide()`. No scale bar equivalent was added at narrow width; the degree graduation already carries that role there. Verified at 430×932 in both ghost and classified states.*

  The auditor's placement will not fit and should not be attempted: at narrow width frameBand() is 14 (frame.js:15), so outerR≈7.8 and innerR≈12.9 leave about 5px between the rules — nothing near the 14px a punch-and-numeral strip needs. Put the key where the phone actually has room instead: (a) a horizontal six-punch strip with Roman I-VI, at ~0.55 scale, set inside the play field just under the running head's own leaf at the foot of the sheet, reusing renaissanceStarGlyph() and renaissanceLegendMask() unchanged; or (b) if the play channel must stay clear, set it on the pause leaf, which has whole empty columns in 14-pause-night-phone.png and is exactly where a reader stops to consult a legend. Then add a bare north needle (a single arrow plus SEPT.) to the upper-left corner-ornament slot at narrow width, and set the engraver's line as a hairline italic along the bottom inner rule.

- [x] **The rising dark is the only flat opaque field on the sheet and at phone size it reads as hills with a treeline** `Magnitude I · era-error · medium effort` — *Done: the paper `voidLayers` ramp is capped at .82 rather than .97, the wash gradient is now clipped to the same wavy front the void layers draw instead of a flat rect, and the bleed-thread fringe is sparser (260→110), shorter (reach capped ~8 vs 18) and blunter (0.65-1.3px vs .35-1.05), with a new pass of 16 irregular near-opaque pools breaking forward of the edge. Verified at 430×932 on paper (edge and deep zones) and night (unaffected by the paper-only thread/pool changes, unregressed by the shared wash-clip change).*

  Two changes in darknessPlate(). Cap the paper voidLayers at about .82 (effects.js:39) and let the laid-paper tile and the 2,400-fleck stipple pass (effects.js:1027-1031) continue to read through the flood, so the sheet is visibly still under the ink. Then rebuild the leading edge from the era's own failure rather than a shoreline: shorter, blunter feathering at 0.6-1.2px with occasional near-opaque pools breaking forward of the edge, which is what a spreading stain does and what a treeline does not. Losing the hard horizontal wash band at effects.js:981-983 matters as much as the alpha.

- [x] **Twelve constellations lettered in English on a page headed ASTERISMI, against the era doc's own rule** `Magnitude I · inconsistency · small effort` — *Done: each `CONSTELLATIONS` entry (simulation.js) now carries a `latin` field (ACUS, VELUM, LYRA, CORONA, CIRCINUS, HOROLOGIUM, SERPENS, ARGO, ASTROLABIUM, PENNA, LATERNA, PHALÆNA — standard-U spelling, since the V-for-U convention is its own separate, not-yet-adopted editorial decision per the Æ-ligature finding below), lettered as the primary arc round the entry star (figures.js), with the English name demoted to a smaller italic gloss arcing just outside it. `name` itself is untouched — the ledger still keys on it. The completion caption (a separate site) is intentionally left English, unchanged. Verified at 430×932.*

  Take only the cheap half, and take it carefully. Add a `latin` field to each entry in simulation.js:164-177 and letter that round the entry star (ACVS, VELVM, LYRA, CORONA, CIRCINVS, HOROLOGIVM, SERPENS, ARGO, ASTROLABIVM, PENNA, LANTERNA, PHALÆNA), demoting the English to the smaller gloss the catalogue already pairs beneath a name. Do NOT change the existing `name` strings: ledger.js keys lifetime records by them (ui.js:378 reads ledger.constellations[c.name]) and CONSTELLATIONS is one of the named globals verify.mjs pulls out of the simulation slice, so renaming needs an orbit.ledger.v1 → v2 migration per CLAUDE.md's own convention. Adding a field costs neither.

- [x] **Three inscriptions print on top of one another at 430×932, in direct violation of the sheet's own stated rule** `Magnitude I · bug · small effort` — *Done: `placeInscription()` now returns whether it found clash-free ground; `inscribe()` drops a note rather than printing it over another, and `inscribeHeld()` defers a reposition instead of committing to an overlap.*

  Give placeInscription a floor. When best.clash exceeds zero after all sixteen candidates (inscriptions.js:126), do not print: for a transient note, drop it — the run has plenty more to say — and for a held instruction (inscribeHeld, inscriptions.js:198-216) defer placement to the next frame rather than committing to a clashing box, since inscriptions.js:206-209 already re-places a held note when its box loses room. Raising the clash weight above 40 will not help; the problem is that there is no 'don't' in the decision at all.

- [ ] **The plate dates its own press run MDCIII and signs four of its figures to Galileo** `Magnitude III · era-error · trivial effort`

  Date the figures rather than leaving them undated: set 'Fig. I · Luna, Galilaeo delin. MDCIX', 'Fig. II · Saturnus, Galilaeo delin. MDCX', 'Fig. III · Sol maculosus, Galilaeo delin. MDCXII', 'Fig. IV · IVPITER ET MEDICEA SIDERA, Galilaeo delin. MDCX'. A re-issued plate always dated its additions, so this alone turns the collision into the sheet's own record of when each figure joined it — it does not need the second-state imprint to land first. Four strings in the array at celestial.js:484.

- [ ] **The chapter-plate Latin uses vocabulary coined 48 to 56 years after the sheet's date** `Magnitude III · era-error · trivial effort`

  Four strings. 'Luna · Cava et montes' (Plutarch's hollows and heights, which is both what 05-engraving.md:117 asks for and what the drawn terminator actually shows); 'Saturnus · Ansae', which also makes the marginal ansae sketch at celestial.js:488-494 read as the notation it is; keep 'Sol · Obscuratio'; and 'Fig. IV · IVPITER ET MEDICEA SIDERA', which does the same for the 'O * * *' device at celestial.js:496-506.

- [ ] **A three-armed spiral is engraved as the Deep's nebula** `Magnitude III · era-error · trivial effort`

  Do NOT redraw it. README:60 documents 'a large spiral star field' as the Deep's identity and README:64 hangs an ambient glint on 'the spiral arms' specifically, so replacing the arms with a milky patch breaks a documented ambient event and one quarter of the scenery's whole reason to be earned. Declare it instead, the way era I's slab-serif modern captions are declared: change the caption at celestial.js:479 from 'Nebula · Profundum' to something that admits the reach — 'Nebula · Profundum · post tempus huius tabulae' — or let it ride on the second-state imprint above, which is the same fix the planet families need and would cover both from one row.

- [ ] **TAB. means three different things on the same sheet** `Magnitude III · inconsistency · trivial effort`

  Keep TAB. V · I for the plate — that is what an impressum is for — and rename the other two. The running head at frame.js:621 becomes REGIO I · SILENTIVM (or drops the numeral and sets the chapter's Latin name alone), and the chapter-plate caption at celestial.js:481 becomes FIG. rather than TAB., which is what it actually numbers. Region names would also close the last English display type on the chart, the 'PLATE III / THE ECLIPSE' reveal visible in 11-run-mid-night-phone-row16.png.

- [ ] **The daily plate dates itself in ISO 8601 five lines under ANNO MDCIII** `Magnitude III · era-error · small effort`

  Set the daily date the way the sheet sets its own year. 'TABULA DIEI · DIE VIII SEPTEMBRIS · ANNO MMXXVI' uses MONTHS_LATIN already at ephemeris.js:10 and the roman() helper already at ephemeris.js:14, and leaves ITERUM alone. If the exact ISO date must stay machine-readable, keep it in the DOM line at frame.js:716 and let the cartouche carry the Latin form.

- [ ] **The paper plate paints two soft light-glows over the flood, against its own no-glow rule** `Magnitude III · craft · small effort`

  Make the leaf a material rather than a light. On paper, replace the radial ground gradient with a torn paper patch: a landContour-bounded card of the sheet's own ground at full opacity, with a ragged deckle edge and the laid-paper tile still reading through it — a slip of paper laid over the flood, which is what a printer would actually do and what the game already draws elsewhere (the impressum's burinRect cartouche at frame.js:728-729 does exactly this job with a hard edge and reads correctly on both plates). Drop the shadowBlur at celestial.js:707 on paper and let the ground card carry the contrast instead.

- [ ] **The wide-sheet margin annotations are telemetry: a Leibniz delta, a zero-padded counter, and a caption with nothing under it** `Magnitude V · era-error · trivial effort`

  Drop the Δ and the padding and set ASCENSVS over a plain unpadded numeral — the game already has ASCENSVS in its own Latin at marks.js:179, so this is the codebase agreeing with itself rather than a new coinage. Then either give MOMENTUM a value (the run's speed factor as a plain multiple, under the period term IMPETVS) or cut it and let the right flank stay bare; a bare rule is better than a caption for an empty field.

- [ ] **Modern arithmetic notation runs through the HUD, the surveys and the catalogue, and the multiplier sign changes sides** `Magnitude V · era-error · small effort`

  Take the inconsistency first, since it costs nothing and is indefensible: put × on one side of the numeral everywhere — leading, matching the HUD, which is where it appears most (ui.js:246, 335, 358). Then drop the padStart at figures.js:1054 so a rim mark reads 4 rather than 04, and drop the en-US grouping in commas() at ui.js:283. Leave the × itself and the % alone unless the whole HUD register is being reconsidered; 'SPEED 2.4' with no sign is the period-correct form but loses more legibility than it buys.

- [ ] **The Æ ligature appears and disappears inside the same cartouche** `Magnitude V · inconsistency · trivial effort`

  Set 'EX OFFICINA ORBIS TABVLÆ' at frame.js:690 — one string, no font work, since Æ is already in the subset. The V-for-U half of this (AVGVSTA VINDELICORVM, PRIVILEGIVM) is a genuinely period Augsburg titling convention and would be handsome, but it is an editorial decision across the whole cartouche and the catalogue's Latin names too; do it wholly or not at all, and not in the same commit as the one-character fix.

- [ ] **The side graduation is a ruler that silently restarts at 90, with no unit and no label** `Magnitude V · craft · small effort`

  Keep the 90-unit cycle and declare it. Alternate the sign at each wrap so the ladder reads as declination running out from the equator rather than 0-89 forever — that goes in the live pass at frame.js:358-364. Letter DECL. once at the top of each side scale and ASC. RECTA once at the left end of the top scale — those are static, so they belong in buildFrameLayer beside frame.js:229-246. Skip the degree mark at narrow width: the band is 14px carrying 6.5px type (frame.js:15, 359), and there is no room for it.

- [ ] **The mute control is a 20th-century loudspeaker among four marks that were thought about** `Magnitude V · era-error · trivial effort` — **SUPERSEDED:** the cohesion section's "The sound control is a modern loudspeaker..." finding redrew this same icon as a speaking-trumpet instead (2026-09-10, user's call after the conflict was raised — see that finding's Done note). Do not also cut it as a bell; when reached, check this off as superseded rather than re-implementing.

  Cut it as a hand-bell: a small bell body with a clapper in the same 1.1px stroke as its neighbours, and a struck-through diagonal for the muted state. Roughly fifteen path commands replacing index.html:636-639, keeping the .sound-wave and .mute-mark class hooks so the toggle CSS at index.html:90 is untouched. The game's own audio vocabulary is already chimes and brushes rather than tones, so a bell is also the more honest icon for what it silences.

- [ ] **A 21st-century observatory plate ships in the registry that no player can ever reach** `Magnitude V · gap · small effort`

  Decide and commit. Either give it a catalogue entry in ledger.js:97-108 with an openly modern, Latin-free name (Modern survey) at a deep threshold, with a one-line card saying this is the same chart as a present-day survey would publish it — declared exactly the way era I's slab-serif modern captions are — or delete the id from PLATE_STYLES and the render:'modern' branches in backdrop.js and planets.js. If it is kept, keep the frame and the cartouche over it deliberately, because that contrast is the point.

- [ ] **Newtonian gravity is lettered NEWTON on the frontispiece though the catalogue already has its Latin** `Magnitude V · era-error · trivial effort`

  Set both buttons to VIS GRAVITATIS, the string ledger.js:198 already carries — two literals, index.html:560 and 588. Do not add an impressum row for it yet: the cartouche is already nine rows and already overprinting (see the first finding), and the second-state row for the planet families has the stronger claim on the tenth.

- [ ] **One of the three catalogue tabs inverts the game's own English-over-Latin pairing** `Magnitude V · inconsistency · trivial effort`

  Swap the third pair at ui.js:864 to ['insignia','FEATS','INSIGNIA'] so all three read vernacular over learned, matching every UNLOCKS and COSMETIC_KINDS row in ledger.js. If the large word must stay INSIGNIA for its shape, then flip the other two instead — either order is fine, one order is required.

<a id="cohesion"></a>
## One hand, one press, one sheet

*19 findings.*

- [x] **The chapter title and the inscriptions are both placed once and neither can see the other** `Magnitude I · bug · small effort` — *Done: `judge()` in inscriptions.js now costs a candidate against `revealBand()`, and `revealAnchor()` in celestial.js now costs each candidate line against every inscription on the sheet.*

  Two symmetrical additions. In `placeInscription`'s `judge()` (inscriptions.js:113), add the chapter band as a cost term exactly as the surveys are: `const rb=revealBand(); if(rb)cost+=inscriptionSpan(box.top,box.bottom,rb.top,rb.bottom)*inscriptionSpan(box.left,box.right,0,W)/100*2;`. In `revealAnchor()` (celestial.js:645), add `for(const g of inscriptions){const b=inscriptionBox(g); cost+=Math.max(0,Math.min(y+38,b.bottom)-Math.max(y-38,b.top));}` to the per-candidate cost. Neither is more than three lines and both run at most a few times a run.

- [x] **The four heaviest strokes on the plate are all gameplay furniture on a held orbit, and the burin ring behind them is the palest mark in its own frame** `Magnitude I · craft · medium effort` — *Done: the sling charge band (`drawNode`, figures.js) is now a graduated limb — a faint guide ring carrying eighteen radial ticks that grow in length and weight as `world.charge()` reaches them, in place of the tangential arc-dashes that only lit up. The 2.2px release marks and 2.6px perfect-preview arc are replaced by a new `registerMark()` — a small cross-in-circle punched at each release point, a third the ink of the arc it replaces, doubled (a second inner circle plus a diagonal cross) and struck at a heavier weight for a perfect release. The target sweep no longer rotates on `world.time`; it is a fixed arc on `aim.entryAngle` whose alpha reads the same continuous quality formula (`(angle-GRAZE_MINIMUM)/(90-GRAZE_MINIMUM)`) already named `arrivalQuality` where the score uses it. Every mark this touches is capped at `1.4*scale`, the frame's own outer-rule gauge. Verified at 430×932: the register marks read cleanly at the rim of a held orbit, a mid-charge and a forced full-charge limb both fill correctly, a forced 'perfect' mark reads as heavier and doubled, and a forced target sweep sits fixed on the entry bearing with alpha rising toward a perfect angle.*

  Cap the chart at the frame's own weight: nothing drawn inside the inner rule may exceed `1.4*scale`, which is the outer rule's own gauge. Cut the charge band as a graduated limb whose ticks *fill* rather than dashes that light — the paper plate already does something close to this at 30-play-paper-phone-t58-row21.png (490,930) and reads far better. Replace the 2.2px release marks and the 2.6px preview with punched register marks on the rim (see New art). Stop the target sweep rotating: make it a fixed arc on the entry bearing whose alpha answers to aim quality, which is the information the player actually reads.

- [x] **On a phone the catalogue covers the entire plate with an opaque CSS ground and forty straight rules** `Magnitude I · gap · medium effort` — *Done, adapted to the game's own idiom rather than the auditor's cached-canvas-behind-the-DOM route: `.catalogue-leaf`'s ground drops from `.975` to `.9` so the laid-paper flood already painted under the DOM every frame reads through. The leaf's plain CSS border is replaced by a small in-DOM `<canvas class="cat-leaf-frame">` — a plate-mark rect, one faint `burinRect` inner rule and a single `frameRosette` corner ornament, painted by the new `paintCatalogueLeafFrame()` in ui.js — a book page, not a chart, with no tick ladder. The forty `.ledger-table` row rules are gone from CSS; each table now sits in a `.ledger-wrap` carrying its own `canvas.ledger-rule`, painted by the new `paintLedgerRules()` at a pitch measured from the table's own live `clientHeight / rows.length` (not guessed), so the strip can never drift out of register over a long scrolling table the way a fixed-height CSS tile could. A new `ledgerTable(rows)` helper replaces the five ad-hoc `<table>`-building call sites. The ephemeris leaf, which shares the `.catalogue-leaf` class, is untouched — scoped via `#catalogue .catalogue-leaf` and canvases that only exist in the catalogue's own markup. Verified at 430×932 and at 1024×768: before/after screenshots (via `git stash`) confirm the row rule went from a solid straight line to a wobbled burin cut; the record, catalogue and insignia tabs, a long scroll to the last constellation row, and the untouched ephemeris leaf were all checked for collisions and drift.*

  Stage it. (1) Two CSS values: drop the ground to about `.90` and lay the canvas's own laid-paper/foxing tile behind it so the sheet's stock reads through — this alone buys most of the reading. (2) Cut a leaf-sized frame into one cached canvas layer behind the DOM: reuse `buildFrameLayer`'s plate-mark `strokeRect` plus one `burinRect` inner rule and one corner ornament — a book page, not a chart, so no tick ladder. (3) Replace the `border-bottom` row rules with a repeating strip of `burinSegment` rules drawn once at the row pitch into that same layer. Do not extend this to the ephemeris.

  Stage it. (1) Two CSS values: drop the ground to about `.90` and lay the canvas's own laid-paper/foxing tile behind it so the sheet's stock reads through — this alone buys most of the reading. (2) Cut a leaf-sized frame into one cached canvas layer behind the DOM: reuse `buildFrameLayer`'s plate-mark `strokeRect` plus one `burinRect` inner rule and one corner ornament — a book page, not a chart, so no tick ladder. (3) Replace the `border-bottom` row rules with a repeating strip of `burinSegment` rules drawn once at the row pitch into that same layer. Do not extend this to the ephemeris.

- [x] **An inscription the run has stopped asking for is carried through the footer band and prints across the running head and the DOM icons** `Magnitude I · bug · trivial effort` — *Done: the strike test in `drawInscriptions()` (inscriptions.js) now reads `box.top>H-footerBand()` rather than `box.top>H-rule`. Confirmed by placing a note at box.top≈882 (between the two thresholds, 862 and 919 at 430×932) — struck under the new test, would have survived under the old one.*

  One line: change the strike test at inscriptions.js:265 from `box.top>H-rule` to `box.top>H-footerBand()` for any note that is not currently held, so it leaves the sheet at the footer rather than at the inner rule — the same floor `marginaliaFloor()` (effects.js:1110) already uses for the gloss. Held instructions keep their existing re-set path.

- [x] **Every mark ends in a hemisphere, and the cap of a plain stroke depends on draw order** `Magnitude III · craft · small effort` — *Done: both `burinArc` and `burinSpiral` (marks.js) now wrap their draw loop in `g.save()`/`g.restore()`, so the `lineCap='round'` they set no longer leaks into whatever draws next. Each function now also computes `open=Math.abs(span)<TAU-.01` and, on the last segment of an open stroke only, draws it at 0.3× weight with `lineCap='butt'` once the nominal weight exceeds .8px — closed rings (`span===TAU`, engraved orbits, rosettes, planet keylines) are untouched, since every point on a closed ring is mid-stroke. Verified npm test still passes (unaffected, no simulation code touches these), and at 430×932 and 1024×768 the frame's wind-head/rosette corner ornaments, the hazard rims and the orbit rings all still render intact with no dropped strokes or leaked caps.*

  Wrap `burinArc` and `burinSpiral` in `g.save()`/`g.restore()` like `burinSegment` — that alone removes the leak and costs two lines each. Then taper only *open* strokes: in `burinSegment` and in `burinArc`/`burinSpiral` when `Math.abs(to-from) < TAU-0.01`, drop the last segment's weight to about 0.3x and set `lineCap='butt'` above ~0.8px. Do NOT taper closed rings — a full-circle `burinArc` would then carry a permanent thin spot at a fixed angle on every orbit on the sheet.

- [x] **The whole margin is set at 6.4–8.5px, never multiplied by scale, in text figures that do not resolve** `Magnitude III · craft · small effort` — *Done, the scaling half only: every margin text size in frame.js now reads `Math.max(<floor>,<nominal>*scale)` instead of a bare literal — the "Scala" label, both the cached and the live-redrawn tick-ladder numerals, the wide flank's engraver credit and MAGNITUDINES key (heading and rows), the narrow no-flank credit line, and the narrow pause leaf's own MAGNITUDINES key (heading and rows) — nine declarations in all, each floored at roughly 90% of its nominal size. Skipped `frameBand()`'s 14→18 widen: verified visually at 430×932, at 320×568 (scale≈0.73, where the bug bites hardest) and at 1024×768 wide that the now-properly-scaled text already sits clear of the ticks and the inner rule with room to spare, so widening the band would only undo the narrow-width compass-needle/engraver-line/MAGNITUDINES-key placement already tuned against the current 14px band in an earlier pass, for no reading gained. Also left alone: the numeral-offset-from-its-tick fix (a dedicated Magnitude I finding under "The frame and the marginalia" owns that) and the lining-figures/roman-numeral change for the '1o'/'2o' misread (the same root cause as the separate Fell's-old-style-zero finding under typography) — both are addressed more thoroughly where the audit files them on their own.*

  Multiply each of those seven by `scale` with a floor (`Math.max(7,8*scale)` and so on), widen `frameBand()` (frame.js:15) from 14 to about 18 on narrow sheets to give them room, offset the numeral half a tick-length clear of the tick it labels, and set the graduated scale in lining figures (or roman numerals, which is what a 1603 limb would carry anyway) so the `1o`/`2o` reading cannot happen.

- [x] **The scrims read as light sources, and four technologies are doing the same job** `Magnitude III · era-error · medium effort` — *Done: the HUD leaf and the chapter-reveal leaf (both radial gradients) now share one alpha between their centre and the .85 stop — a flat plateau, dropped to .5 on paper — with only the last sliver feathering to nothing, in place of the old smooth taper that read as a glow. The running-head leaf is no longer a gradient at all: `drawRunningHead()` now fills a measured rectangular band (sized to the actual text width) and rules it top and bottom with `burinSegment`, the way a printer clears a running head, replacing `runningHeadGradient()` outright (also updated a stale comment in ceiling.js that named it). The duplicate `shadowBlur` on the chapter title, the `text-shadow` on `#score` and `h1`, and the now-meaningless `text-shadow:none` override for era 2 are all removed, along with the now-dead `chapterShadow` ink token. Kept as a single filter rather than deleted outright: the `.utility` icon `drop-shadow` — "doubled" read as the literal duplicate call (the same filter stacked twice on one rule) rather than the technique itself, since the footer icons have no leaf of their own and do sit over the rising dark at times. Verified at 430×932 on both plates: a stashed before/after confirms the running head went from a blurry edgeless ellipse bleeding into the hourglass icon to a crisp ruled band, and the chapter title and HUD leaf both still read cleanly with no halo.*

  Keep the three leaves and fix their shape: give each a hard-ish inner plateau and a short feather (move the mid stop to about .85 and drop the centre alpha to about .5 on paper) so it reads as reserved ground, and cut the running-head leaf to a band between two hairline rules — the way a printer actually clears a running head — rather than an ellipse. Then delete the duplicates: `shadowBlur` at celestial.js:707, the two CSS `text-shadow`s, and the doubled icon `drop-shadow` (index.html:87), which on the paper plate is a light halo on a light ground and does nothing but glow.

- [x] **The ink reservoir is a CSS progress bar where the spec calls for an engraved rule with a wet bead** `Magnitude III · era-error · small effort` — *Done: a new `drawInkGauge()` in frame.js, called from `drawHudLeaf()`'s pass, cuts the reservoir as two `burinSegment`s — the wet length in gold (copper once `level<=.34`, at full alpha) and the spent length as a bare score in the copper at low alpha, with `penBead` at the wet/spent boundary — in place of the DOM's CSS gradient bar, for the atlas only (`renaissanceAtlas()`). The `#ink` div itself stays in the DOM, invisible, purely to hold the score-block's vertical rhythm for whatever sits below it; its live `getBoundingClientRect()` positions the canvas marks, the same technique `impressumAnchor()` already uses. Era II's own reed-shaped bar and the modern plate's plain CSS bar are both left exactly as they were — scoped out with `#game:not([data-era]):not([data-plate-id="modern"])`. One bug caught by `npm test`: an unguarded `getBoundingClientRect()` produced non-finite coordinates in the headless test DOM and threw inside `burinSegment`'s `moveTo`; fixed with the same `Number.isFinite` guard `impressumAnchor()` already uses for the same reason. Verified at 430×932 on paper and night, at full charge, at a low level (short saturated wet stub, bead, long faint spent scratch) and on the modern plate (confirmed its DOM bar still shows, unaffected).*

  Move it to the canvas, drawn under the score in `drawHudLeaf`'s pass: one `burinSegment` of the sheet's own gold for the wet portion, the spent portion left as a bare score in the copper (alpha and weight both down) rather than a grey remainder, with `penBead` at the wet end and a copper shift below 0.34 as now. It wanders a hair like every other rule and is one call per frame. If it must stay in the DOM, at minimum give it the era II treatment — a clip-path nib silhouette — so the shipped plate is not the only one without a shape.

- [x] **The sound control is a modern loudspeaker where the sheet's own spec calls it a speaking-trumpet** `Magnitude III · era-error · small effort` — *Done: the `#sound` icon (index.html) is now a tapering horn — a short mouthpiece stub, two diverging sides and a `Q` curve for the bell's rim — keylined at the same 1.1 stroke with the standard `translate(.5,.4) opacity .3 stroke-width .45` ghost, matching the pause hourglass and catalogue book beside it (the icon's own ghost had drifted to `.6,.5/.35/.5`; brought in line with the rest of the set). The `.mute-mark` is now a plug curve stopping the bell mouth (a matching `Q` curve turned inward, with a small cross-tick) instead of an `×`, swapped in under the same `.sound-wave`/`.mute-mark` class toggle so the CSS and JS wiring are untouched. The sound-wave arcs are left exactly as they were. Note: a separate, not-yet-reached Magnitude V finding under "The historical claim, judged strictly" also proposes redrawing this same icon, as a hand-bell instead — asked the user, who chose to land the trumpet now (already scheduled here) and mark that finding superseded when reached rather than implementing two conflicting redesigns. Verified at 430×932 in both the unmuted and muted states, with a stashed before/after confirming the read against the old speaker-cone-and-× icon it replaces.*

  Recut the sound icon alone as an actual speaking-trumpet: a long tapering horn with a mouthpiece at the small end, keylined in the same 1.1 stroke as the hourglass and the book beside it, with the same `translate(.5,.4) opacity .3` ghost. Mute becomes the horn stopped with a plug rather than an `×`. Leave the other five alone.

- [x] **The DOM's pen has no nib: the wipe keyframe was written and never wired up** `Magnitude III · bug · trivial effort` — *Done: `@keyframes ink-nib` (index.html) already existed but nothing referenced it — `.inked` itself correctly runs the separate, already-working `ink-wipe` clip-path reveal, but no rule ever drew the travelling nib mark. Added `.score-block>*{position:relative}` for a positioning context and the missing `.inked::after` rule exactly as proposed, running `ink-nib`. Verified via `getComputedStyle(el,'::after')` that the pseudo-element resolves the animation name, position, width and clip-path correctly once `.inked` is (re-)applied — the existing `inked()` helper in ui.js already force-reflows and re-adds the class on every score/pace/flow change, so no JS changes were needed, only the CSS it was always missing.*

  Give `.score-block` children a positioning context and add the missing rule: `.inked::after{content:'';position:absolute;top:0;bottom:0;width:2px;background:currentColor;clip-path:polygon(0 0,100% 12%,100% 88%,0 100%);animation:ink-nib .34s ease-out}`, the wedge cut to match `penNib` (reveal.js:160). The keyframe already exists and already animates `left` from -2% to 100%.

- [x] **The chapter title names the plate a hand's breadth above a running head naming the same plate** `Magnitude III · craft · small effort` — *Done: `drawRunningHead()` (frame.js) now returns early while `chapterReveal.age<4.2` and the running head's own line falls within the title's `revealBand()` by roughly the audit's own margin. One adjustment against the literal number: at 430×932 `revealPoint()`'s own clamp never lets the title drift closer than ~66px to the running head, so the threshold is 70 rather than 60 — otherwise the fix would never actually engage at the reference viewport's own worst case. Left the longer-term "re-evaluate revealAnchor continuously" suggestion alone (a larger, separate change). Verified with `chapterReveal.age` pinned via a getter (real time otherwise blew past the 4.2s window between Playwright round-trips) and `chapterReveal.wy` pushed to its clamp: the running head correctly disappears from the footer while the title sits fresh and drifted low, confirmed against the un-pinned baseline where both print at once.*

  Suppress `drawRunningHead()` while `chapterReveal.age` is under about 4.2s and the title's clamped y is within roughly 60px of the running head's line — one condition in frame.js:614, and `revealBand()` already computes the box. Longer term, re-evaluate `revealAnchor` continuously (three candidates, three loops — it is cheap) so the title slides along its own line rather than freezing and drifting to the foot.

- [x] **The frontispiece and colophon set their actions as ragged chips over the drawing** `Magnitude III · craft · medium effort` — *Done, the "one measure, hairline-divided" half in full; the specimen/block reordering left out, reasoned below. Every `.diff-btn` group that reads as a scatter (the frontispiece's `.daily-group` and `#more-menu`, the colophon's `.end-plate-line`) now wraps its buttons in one `.action-row`: equal-width flex cells (`flex:1 1 0`), a single hairline `border-right` between them instead of each button carrying its own box, and labels set to wrap (`.action-row .diff-btn` drops `.diff-btn`'s implicit nowrap) rather than overflow when a cell is narrow — 'REVIEW THE PLATE' breaks cleanly to two lines in the colophon's three- and four-button states rather than bleeding into its neighbour, which an equal-width row without wrap did on the first pass (caught by eye, not by `npm test`, since the harness has no layout engine). The colophon's row keeps a plain CSS border, since it already sits on the leaf's own opaque paper; the frontispiece's two rows sit directly on the open plate, so their CSS border is dropped (`#intro .action-row{border-color:transparent}`) and a new `drawActionFrames()` in frame.js cuts a `burinRect` behind each instead, measured live off `#daily-actions`/`#more-actions` via `getBoundingClientRect()` exactly as `drawInkGauge()` measures `#ink`, guarded with the same `Number.isFinite` check for the harness's DOM stand-in, and gated to `world.state==='ready'` (so it never draws once a run is live) and to the atlas (`eraId()===0&&!plainPlate()`, matching `drawImpressum()`). The pause slip itself is unchanged — it is the model cited, not a target. Left out: moving the block below "the specimen" (the row-0 body the player idles on) and pulling the specimen up between the title cartouche and it. That reposition has no CSS lever — the specimen's screen position is `world.cameraY`, set once at `OrbitWorld` construction (`-height*.62`) and then carried unchanged into the run itself once the player taps (nothing re-centres it before the follow-camera's own lerp takes over), so it is gameplay's starting camera framing, not frontispiece decoration, and moving it risks reshaping the opening seconds of every run for a cohesion polish pass. It was also already unclear the move was needed: measured live at 430×932, the specimen (row-0 ring, screen y≈522–634) already sits between the title (ends ≈330) and the action block (now begins ≈739) with room on both sides — the literal geometry the finding asks for was already true; what read as "ragged chips over the drawing" was the chip styling itself, which the row/frame rework above addresses directly. Verified at 430×932 (frontispiece, the MORE disclosure open, the colophon at two and three visible buttons) and at 1024×768 wide.*

  Apply the pause slip's own rule to `.diff-btn` groups generally: one measure, equal-width entries in a grid rather than a centred flex wrap, separated by hairline rules instead of each carrying its own box. On the frontispiece, move the block below the specimen and pull the specimen up between the title cartouche and it, so the drawing is looked at rather than used as a ground. Where a group sits directly on the plate, draw its frame as one `burinRect` on the canvas behind it rather than as CSS borders.

- [x] **The marginal gloss is still the one mark allowed to run off the copper** `Magnitude III · bug · trivial effort` — *Done. The gloss's own edge fade (`drawDarkMarginalia()`, effects.js) turned out to already be in place — the same-day working-tree fix CLAUDE.md calls "the gloss running off the copper" had already added the `rule`/`fade`/`edge` calculation this finding asks for, confirmed by the comment already sitting on it in past tense ("It is held to the same copper as every other mark..."). What was still open, exactly as the proposal's second sentence flags, was the Leviathan: its vertical `ctx.rect` clip only ever bounded it to the canvas (`0` to `W`), never to the frame's own inner rule, so it could surface clean through the tick ladder and corner ornaments with no fade at all. `rule`/`fade` are now hoisted to the top of `drawDarkMarginalia()` and shared; the monster's alpha (both the normal and relief draws) is multiplied by the same `edge` falloff the gloss uses, computed from its own `x`/`w` against the identical rule and fade distance, and the draw is skipped once `edge<=0`. Verified by forcing `world.time` to a value that places the monster at the right inner rule (solved numerically against its own drift formula) with the run paused so the frame holds still: before the fix its head, eye and reed-tuft sat fully opaque astride the rule; after, the same pose fades to a thin trace at the same position. `npm test`'s runtime layouts (which exercise `drawDark`/`drawDarkMarginalia` every frame across six viewports) still pass, confirming no non-finite canvas arguments from the new arithmetic.*

  Clamp `gx` to `[inner, W-inner-gloss.w]` and have the sprite reverse at the rule instead of wrapping; or, cheaper and consistent with the clearance system that was just added, fade the gloss out over the last 20px before each inner rule the way `glossClearance` already fades it over a ring. Apply the same to the Leviathan's `x` at effects.js:1132.

- [ ] **The plate mark is a hard-cornered vector rectangle, not an impression** `Magnitude III · era-error · small effort`

  Replace both `strokeRect` calls with a rounded-corner path (corner radius about `band*.25`, so roughly 3.5px on the narrow sheet) and stroke it twice a half-pixel apart: a lighter pass outward and a darker one inward, so the edge reads as an indentation rather than a rule. On paper, add a very faint wobble by cutting it with `burinRect` at a low `wobble` — the copper's filed edge was never straight either. About ten lines in `buildFrameLayer`, inside a layer that is cut once per run.

- [ ] **There is no named weight ladder, and its top rung is on the wrong marks** `Magnitude III · craft · medium effort`

  Do the cheap half first: add to marks.js a named ladder — `const BURIN={hair:.34,fine:.5,line:.72,bold:1.05,rule:1.5}` with `cut(step)=>BURIN[step]*scale` — and sweep only the marks drawn live onto the chart (figures.js `drawNode`, effects.js, celestial.js) onto the nearest rung, with `rule` reserved for the frame. Do not sweep sprite interiors: `glossSprite`, `flareSprite`, `leviathanSprite` and the planet glyph cache draw into fixed-resolution offscreen canvases that are then blitted scaled, so multiplying their weights by `scale` would be wrong. Expect the chart's own set to collapse to five with no visible loss and a large gain in hierarchy.

- [ ] **The upper corner ornaments resolve as dirt on the reference sheet** `Magnitude III · craft · small effort`

  Cut a simplified head for the narrow sheet — an outline, one cheek swell, a mouth and three breath strokes, six marks — at radius 7-8 rather than 4.05, and move it further along the corner diagonal so it clears the HUD text boxes by position rather than by shrinking (the HUD clearance is why `TOP_HEAD=.45` exists at all; solve it with placement instead). Keep the detailed head for `frameWide()`, where the band is 26px.

- [ ] **The flare's silhouette is a polygon with eighteen dead-straight edges** `Magnitude V · craft · trivial effort`

  Walk each edge in three or four sub-steps with a small perpendicular wobble seeded from the vertex index, or replace the `lineTo` run with the same `landContour` machinery the ink blots already use. Ten lines in `flareSprite`, and it is a cached sprite so it costs nothing per frame.

- [ ] **Two derived-plate accent tokens still print in the base plate's ink** `Magnitude V · inconsistency · trivial effort`

  Add `--copper` and `--reflector` to the four derived-plate blocks (index.html:23-26) at the values each plate's own transform in plates.js returns for them, exactly as the six that were just added. Two values per line.

- [ ] **Both ends of a flight letter their centre point `a`, so a re-used node carries two** `Magnitude V · bug · trivial effort`

  Letter the landing construction `d`, `e`, `f` (effects.js:478-480) and leave the departure as `a`, `b`, `c`. Three character changes, and the two figures then read as one continuous piece of working — which is what they are.

<a id="frame"></a>
## The frame and the marginalia

*19 findings.*

- [ ] **The DOM impressum line prints straight through the engraved impressum cartouche** `Magnitude I · bug · trivial effort`

  Drop #atlas-impressum from the atlas frontispiece: the engraved cartouche IS the impressum and says four times as much. Keep the span for era II (.ceiling-only) and for plainPlate(), where drawImpressum returns early at frame.js:722 and the sheet would otherwise carry no imprint at all — that is exactly what impressumScreenLine()'s 'ANTE LITTERAS' branch is for, so gate the .atlas-only span on the proof plate rather than deleting it. If the line must stay on every plate, publish impressumTop() to CSS as a --impressum-top custom property on #game on every resize and give .start-copy a matching padding-bottom.

- [ ] **The graduation is a pixel count, and the README says it should be hours and degrees** `Magnitude I · era-error · medium effort`

  Fix the graduation to the sky rather than to the screen. Horizontal: 24 hours of right ascension in Roman numerals (I–XXIV or I–XII twice), subdivided into five- or ten-minute ticks, so the count is 24 at every viewport and only the spacing changes — which also brings the border into the notation sphereGraduation already uses. Vertical: declination in degrees with sign, +80 … +10 … 0 … −10 … −80, the 0 cut heavier as the equator, with a single ° or GRAD at the head of each flank; keep driving the offset from world.cameraY but clamp or reflect at ±90 rather than wrapping mod 90.

- [ ] **Every mark in the frame layer except the double rule is cut by a ruling pen, not a burin** `Magnitude I · inconsistency · medium effort`

  Route the graduation through burinSegment with a small wobble (.2-.3) and a per-tick seed derived from i, the way burinRect already seeds its four sides; do the same for the corner brackets and the rosette's points, and give the rose's two rings burinArc (it exists and frameWindHead uses it three functions above). Keep the lengths and colours exactly as they are — only the delivery changes. Vary the majors' weight slightly so every fifth mark reads as a heavier cut rather than a wider lineWidth. The whole layer is cached and rebuilt only on a resize or plate change (frame.js:352), so the cost is paid once.

- [ ] **The graduation numerals are struck through by their own ticks and by the inner rule** `Magnitude I · craft · small effort`

  Give the numerals their own lane. Shorten the major ticks to about 60% of the band on the numbered fifths only, and set the numeral in the gap that leaves, with its baseline one pixel clear of the inner rule so nothing crosses it. Mirror the bottom on the top exactly (baseline = H - outerR - tickLen*.72 - 1, textBaseline 'alphabetic') rather than the current +5 fudge, which is what pushes the bottom row across the outer rule. On the flanks set the numerals wholly inside the band — textBaseline 'middle', and drop the ±2 nudges at frame.js:362-363.

- [ ] **The two upper corner ornaments are below their own legibility floor at the target viewport** `Magnitude III · craft · small effort`

  Keep the documented clearance and change the mark. Cut a different, simpler ornament for the two upper corners rather than a miniature of the lower one: the breath alone works — three or four tapering burin strokes streaming diagonally out of the corner with a small filled punch at their origin, recognisably the same wind at a scale that survives. A pierced trefoil or a small strapwork knot at R=4 would also hold. Keep TOP_BREATH for the reach; TOP_HEAD then becomes unnecessary. This satisfies README.md:68 (still tucked into the corner, still clear of ORBIT and BEST) while producing a mark the eye can name.

- [ ] **On desktop the scale bar is laid straight across the graduation it duplicates** `Magnitude III · bug · small effort`

  Lift the bar and its label out of the graduation without disturbing the credit: anchor the bar to oy - 16 or so, or better, move the bar and label up into the flank above the credit and let the credit keep its correct place under the rule. Then divide the bar in the same units the border ladder carries so the two agree instead of contradicting each other.

- [ ] **The reference sheet carries no MAGNITUDINES key at all** `Magnitude III · gap · medium effort`

  Give the phone a key it has room for. The 14px margin cannot hold a column, but the *foot* can: a single horizontal strip of the six signs in descending order, set once above the running head or in the lower margin between the inner rule and the footer band, spanning perhaps 120px, with I and VI lettered at the ends and the four between unlabelled — a legend rather than a table. Gate it on impressumTop() the way the other lower-margin furniture already does, and drive its alphas from the same renaissanceLegendMask so it still earns its rows. Alternatively print it on the pause or colophon leaf, where there is space and the player is already reading.

- [ ] **The double rule changes ink the instant the pen finishes drawing it** `Magnitude III · inconsistency · trivial effort`

  Make the tokens the single source. Either point buildFrameLayer's burinRect at ink.frame.rule/ruleFaint (parsing the alpha out of the token, or splitting each into an rgb token plus an alpha the way ink.base does), or drop rule/ruleFaint from definePlate('frame') entirely and have reveal.js:508-509 read ink.base.inkStrong/inkSoft at the same .62/.34 the layer uses. The second is the smaller edit and makes the animated rule and the printed rule provably the same ink. The screenshots do not catch the moment (the reveal is 1.4s on the opening sheet, .5s on a restart), which is exactly why it has survived.

- [ ] **The corner bracket and the corner ornament are drawn on the same point** `Magnitude III · craft · trivial effort`

  Push the ornament out along its diagonal past the bracket's reach: inset = innerR + cornerLen + size*.9 + gap rather than innerR + size*.9 + gap. Or — cheaper and arguably better — drop frameCorner in the corners that carry an ornament and keep it only for plainPlate() and the unruled sheet, where it would be the corner's only mark and would read as the register mark it is.

- [ ] **The lower wind-heads print across their own rule and into the tick ladder** `Magnitude III · craft · small effort`

  Choose a side and commit. Simplest: raise the inset so the ornament's outermost stroke — the hair, not the face circle — clears innerR by 2px, which means budgeting inset from R*1.44 rather than R*.9. The breath then blows into the field, which is the right direction anyway. More period-true: set the whole ornament outside the outer rule, in the plate margin where corner masks actually sit on 16th-century plates, and shorten the breath to stay inside the plate mark. Either way clamp the breath's reach so it stops short of footerBand() instead of running into the buttons.

- [ ] **The brightest class in the MAGNITUDINES key is three rows tall** `Magnitude III · craft · small effort`

  Keep the .72 gauge (it is documented and correct) but stop assuming a uniform pitch. Compute each row's height from renaissanceStarSpan(magnitude)*.72 — figures.js:43-46 answers exactly this question — and stack the rows with a fixed 4px gutter, so class I gets about 24px and class VI about 5px. That is what a real key looks like: a descending column of unequal signs. Raise the ghost alpha for the rays and rings specifically (they need roughly .22 to survive, not .12 further multiplied by .85 and .38) or draw an unclassified row as an outline-only version of the full form. Measure the heading with ctx.measureText and rule to it rather than to a hard 66.

- [ ] **The same plate is called PLATE IV and TAB. IV in the same second** `Magnitude III · inconsistency · trivial effort`

  Set the chapter reveal's label to 'T A B U L A   ' + numerals[index], or 'T A B .   ' + numeral to match the running head exactly. The letterspacing trick, penLettering and everything downstream are unchanged — it is a one-string edit at celestial.js:711.

- [ ] **The wide-sheet flanks are 43% of the plate carrying four small marks** `Magnitude III · gap · large effort`

  Fill it with the apparatus the game already has the data for — see the TABULA STELLARUM entry in newArt, which is the direct answer, plus a dedication cartouche under the rose to take the privilege line currently crowding the impressum. Short of that, at minimum move the MAGNITUDINES key down to sit above the scale bar so the right flank reads as one cluster rather than two orphans, and give the rose a companion in the left flank (a small inset of the current chapter plate, or the engraver's device already drawn at frame.js:705-711).

- [ ] **The laid tile is reduced to a scale nothing else on the sheet is reduced to** `Magnitude III · craft · small effort`

  Take the grain to the same reduction as the lettering: laid wires every 4 CSS px and chain lines every 100–140, with the wire weight dropped so the banding falls to two or three grey levels rather than seven. Keep the spacing an integer multiple of a device pixel at the ratios that matter (4 CSS px is 8 device px at 2x, 4 at 1x) so the wires stay crisp and the blit stays one-to-one. Widen the tile to suit the new chain spacing. The chain lines becoming rare and wide is the change that matters most — it gives the sheet a real vertical rhythm it currently lacks.

- [ ] **The plate mark is a hairline rectangle, so nothing on the sheet proves it was printed** `Magnitude III · gap · medium effort`

  Cut it as an indentation. Rounded corners at roughly band*.35; a two-tone edge (a darker outer stroke immediately outside a lighter inner one, one device pixel apart) rather than a single line; and a very faint warm tone filling the area inside it that stops dead at the mark. On the paper-based plates add a handful of short wiped burr streaks running out from the corners at one consistent rag angle across every plate; at night the same mark reads as a faint bright lip instead of a dark one. It all belongs in the cached layer at frame.js:219-221, so it costs nothing per frame and changes the reading of the whole sheet.

- [ ] **The whole frame layer is re-cut on a change no phone can draw** `Magnitude V · bug · trivial effort`

  Fold the width test into the key: `':'+(frameWide()?legend:0)`. One expression at frame.js:351.

- [ ] **HIC SUNT DRACONES is guillotined mid-letter by the sheet edge** `Magnitude V · craft · small effort`

  Fade it at the margins instead of cutting it: a horizontal alpha ramp over the last gloss.w of travel at each end, or clip it to the inner rule and let it dissolve there. Simplest and best: constrain the drift so the sprite never leaves the ruled area — turn it back at the inner rules rather than wrapping — which also keeps it off the frontispiece buttons without teaching glossClearance about the DOM.

- [ ] **The compass rose sets three of its four winds one way and the fourth another** `Magnitude V · craft · small effort`

  Set all four names at one radius. Give MERIDIES the treatment a printed rose actually gives its bottom name — the same radius, letters rotated 180° so the word runs the other way and reads right-side-up from below — rather than pulling it inward. Move the faint ring out to sit under the letters (ring + size*1.5 or so) so it is the band the names stand on, or drop it. Neither change touches what README.md documents.

- [ ] **The 'Scala' bar is a mile-scale on a sheet that has no distances** `Magnitude V · era-error · trivial effort`

  Relabel it SCALA GRADUUM and divide it into the same units the border ladder carries — ten degrees, subdivided into two fives — so the two agree instead of contradicting each other. Add a small pair of open dividers stepping the bar: a standard, cheap period mark that instantly says the bar is angular rather than linear. Combine with lifting it clear of the ladder per the bottom-right finding.

<a id="typography"></a>
## Lettering, faces and the Latin

*23 findings.*

- [ ] **The DOM printer-line prints straight through the engraved impressum cartouche, in the same words** `Magnitude I · bug · trivial effort`

  Delete `#atlas-impressum` from index.html:571 and `impressumScreenLine()`/`syncImpressumScreen()` (frame.js:712-719) for the atlas era, leaving the ceiling-only span in place. The canvas cartouche already sets everything the DOM line sets. The daily marker the DOM line appends is already carried by the cartouche's own `daily` row (frame.js:697), so nothing is lost. Cheaper stopgap if the span must live: hide it whenever `drawImpressum()` is actually painting — `#atlas-impressum{display:none}` under the atlas era, exactly as index.html:212 already hides `.subtitle-latin,.printer-line` in the short-viewport media query.

- [ ] **The score floaters and the chart inscriptions overprint each other into an unreadable mash** `Magnitude I · bug · medium effort`

  One shared occupancy list is the right fix, not two one-way patches. Have both systems push their laid boxes into a per-frame `laidBoxes` array: `placeInscription`'s `judge()` gains a term summing `inscriptionClash`-style overlap against live floater boxes, and the floater loop at effects.js:1396 nudges `y` (it already has vertical freedom, and drifts anyway) clear of any inscription box whose x-span it overlaps before drawing. Floaters live 1.15s and inscriptions are permanent, so the floater should always be the one that yields.

- [ ] **The score at display size is unreadable: '1775' reads as a foreign script, not a number** `Magnitude I · craft · small effort`

  The era-true answer, and the one that also fixes the scale: print the number twice, as an early book gives a date. Bring `#end-score` down to `clamp(58px,14vw,80px)` with `letter-spacing:.02em` and enough `margin-bottom` to clear the 7/5 descenders from `#record`, then set the same number beneath it in Roman, small caps, ~13px — '1775' over 'MDCCLXXV'. `roman()` already exists at ephemeris.js:13-17 and the impressum on the frontispiece already establishes the convention two screens earlier with ANNO MDCIII (frame.js:692). The Roman line carries the display weight the Arabic can no longer bear.

- [ ] **Fell's old-style zero is a lowercase o, and the HUD prints one every frame of every run** `Magnitude I · craft · small effort`

  Three moves, each small. (1) HUD: drop the tenth when it is nil — `const m=world.speedMultiplier(); words.pace+(m%1?m.toFixed(1):m)` — so the opening reads 'SPEED ×1'. (2) Row numerals: drop `.padStart(2,'0')` at figures.js:1054 entirely; an unpadded row number is what a plate sets and the leading zero was never period. (3) Nil counts: route them through the convention `roman()` already declares — a value of 0 renders '—' rather than a figure, in `pressureTable()` (ui.js:348), the Feats and Constellations tables (ui.js:374-379) and `#end-constellations` (ui.js:251, which should read 'no constellations traced'). Note this last one must be done as a *glyph* change, not a row change: README.md:169 explicitly commits to 'an untraced one printing a plain nought rather than dropping from the list', so the row stays and only the mark in it changes.

- [ ] **The twelve constellations — the sheet's subject — are the only things on it with no Latin name** `Magnitude I · gap · medium effort`

  Give each `CONSTELLATIONS` entry a `latin` field and set it as the primary caption at figures.js:804, with the English dropping beneath as an italic gloss at about two-thirds the size — precisely the two-register pairing `.cat-name`/`.cat-latin` (index.html:403-404) already uses on every card in the catalogue. ACUS · VELUM · LYRA · CORONA · CIRCINUS · CLEPSAMMIA · SERPENS · ARGO · ASTROLABIUM · PENNA · LATERNA · PHALÆNA. The completion caption at figures.js:805 keeps its place. In the catalogue, the Latin fills the `.cat-latin` slot in the Asterismi table at ui.js:377-379 so that table finally matches the Feats table above it.

- [ ] **The small-caps face is shipped, subsetted and asked for everywhere — and never once actually set as small caps** `Magnitude III · craft · medium effort`

  Pick the places where the third register earns its keep and set them mixed case: the impressum's subordinate rows (frame.js:689-698 — 'Ex officina Orbis Tabulæ', 'Anno MDCIII', 'Cum privilegio' in small caps against the place-line's full caps), the construction labels (`label()` at frame.js:397 — 'Æquator cælestis', 'Ecliptica'), and the `.cat-group h3`/`.ledger-table th` pairs, by dropping `text-transform:uppercase` from index.html:310 and 313 and sentence-casing the data. Leave the display lines — the running head, ORBIT, the eyebrows — in full caps, which is correct. That gives the sheet an actual hierarchy without adding a single new mark.

- [ ] **AUGUSTA VINDELICORUM is the wrong form for an imprint — Bayer's own title page reads AUGUSTÆ** `Magnitude III · era-error · trivial effort`

  `AUGUSTÆ VINDELICORUM` at frame.js:689, with the ligature, per the digraph finding. If the DOM duplicate is deleted per the overprint finding, that is the only change. Worth a one-line amendment to docs/archive/eras/05-engraving.md:333 so the record and the code agree.

- [ ] **Æ and AE are spelled two different ways four rows apart inside one cartouche** `Magnitude III · inconsistency · trivial effort`

  Declare the ligature and apply it: `EX OFFICINA ORBIS TABULÆ` (frame.js:690), `Lunæ` (ephemeris.js:12), `Galilæo` (celestial.js:484). Amend docs/archive/eras/05-engraving.md:333 to match. Then run `npm run fonts` — the charset is read off `src/`, so nothing else needs touching.

- [ ] **One row of node captions carries four notations in four registers, and the proper names are in the wrong face** `Magnitude III · inconsistency · small effort`

  Split the slot by kind, not by language. Named things — SCUTUM, REPULSA, AURORA, and AURUM for the gold node — go in `plateFace(size,'sc')`, mixed case, like every other proper name on the plate. Numbers — the row, the gain — stay in the roman face and lose the padding (see the zero finding). And let 'INK' be the gloss it is declared to be: set it in `plateFace(size,'text','italic')`, the same italic every other gloss on the sheet uses, so the one deliberate English word on the chart announces itself as one.

- [ ] **The construction labels and hour numerals get no paper leaf, so the lines they name print through them** `Magnitude III · craft · small effort`

  Give `label()` at frame.js:397 the same `runningHeadGradient()` leaf the running head uses — one soft pass of the plate's ground, feathered to nothing, sized from `measureText`, before the fill. For the numerals at frame.js:415, skip any numeral whose box would fall inside a body's `cap` radius; the position and the cap are both already in hand in the loop.

- [ ] **The one named feat announced in English is the one the medal table, the survey and the catalogue all name in Latin** `Magnitude III · inconsistency · trivial effort`

  Change ui.js:79 to `say('ANGULUS RECTUS · +'+e.squareBonus,at)`, matching effects.js:485 and the medal. Change the floater at ui.js:68 to `' · ANGULUS +'+e.angleBonus` so the two marks within 150px of each other agree. Change `join(', ')` at ui.js:252 to `join(' · ')`. Leave 'SKIP' at effects.js:487 and 'CLOSE +5' at ui.js:137 alone — a skip count and a graze warning are instruction, not names, and the English there is the declared register.

- [ ] **The catalogue's three tabs use three different label conventions, and the third inverts the page's own rule** `Magnitude III · inconsistency · trivial effort`

  One rule, English label over Latin caption: `[['record','RECORD','Chronicon'],['catalogue','CATALOGUE','Studiolo'],['insignia','FEATS','Insignia']]`. Keep STUDIOLO — it is a genuine art-historical term for exactly this kind of cabinet, it is the one Italianism the sheet earns, and an Augsburg shop naming an Italian cabinet in the Italian is a good fact — but set it mixed case in the caption slot so it reads as the borrowed word it is rather than as a third convention.

- [ ] **The catalogue tab sub-line is the one caps line in the atlas set solid** `Magnitude III · craft · trivial effort`

  Take the CSS at its word and set the sub mixed case — 'Chronicon', 'Studiolo', 'Insignia' per the tab-convention finding — in `var(--face-text)` italic, which is exactly what `.cat-latin` (index.html:319/404) already does for every caption on the leaf. That makes the tabs the same object as the section heads instead of a fourth thing.

- [ ] **The chapter reveal calls its own sheet a PLATE in English, and its letterspacing is typed in as spaces** `Magnitude III · inconsistency · small effort`

  Set it as `'TABULA '+numerals[chapterReveal.index]` (or 'TAB. ' to match the running head exactly) with no inserted spaces, and letterspace it properly — `ctx.letterSpacing` where the browser supports it, or advance the pen by an explicit tracking value inside `penLettering()`, which already walks per-glyph advances from src/glyphs.js. The English chapter name below it stays: it is the game's own poetry and reads correctly as the vernacular gloss under a Latin head.

- [ ] **The same eight Latin feat-names are held in three tables, in two capitalisations, and one of them shows** `Magnitude III · inconsistency · small effort`

  One table. Keep the canonical strings in `OBSERVATIONS` (simulation.js:195-198) in sentence case — 'Tres perfecti', 'Saltus quinque', 'Velocitas summa', 'Linea pura', 'Angulus rectus' — and have ledger.js:200-215 and ui.js:300-301 read from it rather than restate it. Where the sheet wants caps (the record table, the survey note at effects.js:485) let the setting raise them, as index.html:310 already does. Not the data.

- [ ] **HIC SUNT DRACONES is clipped mid-letter on every plate** `Magnitude III · bug · trivial effort`

  Measure the string: set the font on the sprite context first, then `const w=Math.ceil(g.measureText(text).width)+8`. The context is already created before the fill, so it is a two-line reorder. Then clamp the sprite's x so its right edge stops at the same inner rule the inscriptions respect (`frameBand()*.92+8`, inscriptions.js:33).

- [ ] **'Jupiter' is the one J on a sheet that spells I everywhere else** `Magnitude V · era-error · trivial effort`

  `'Fig. IV · Iuppiter et satellites, Galilaeus delin.'` — the I for the J, and the nominative since 'delin.' overwhelmingly abbreviates *delineavit* on prints. Set the other three to the nominative too for consistency. Keep 'satellites': Kepler coins it in 1611, inside the same knowingly borrowed Galilean window as the figures themselves.

- [ ] **The plate captions run three grammatical forms, and one noun is spelled both Italian and Latin four rows apart** `Magnitude V · inconsistency · trivial effort`

  `Charta azzurra` at ledger.js:105 — keep the declared Venetian adjective, spell the Latin noun the Latin way, and the collision with `Charta nuda` disappears without touching the fiction. For the two loose adjectives, give them the noun their neighbours have: `Creta sanguinea` (ledger.js:126) and `Azurrum ultramarinum` (ledger.js:146), the attested period name for the pigment.

- [ ] **The impressum's nine rows have no typographic hierarchy** `Magnitude V · craft · small effort`

  Grade `impressumMetrics()` to return a per-row size rather than one: place and printer at `size*1.25` in full caps, year and title at `size`, correction and privilege at `size*.85`, and set the engraver's row and the daily row in italic (`plateFace(size*.85,'text','italic')`). Combined with the small-caps finding, the subordinate rows go mixed case in the SC face and the cartouche finally grades.

- [ ] **The impressum numbers the sheet TAB. V while the running head at its foot numbers it TAB. I–IV** `Magnitude V · inconsistency · trivial effort`

  Keep both recorded strings and disambiguate by setting rather than by rewording — this is a typography problem, not a naming one. Move the era number out of the TAB. run by giving it its own row or its own register: `TAB. I · A1` in the plate row (the sheet's own number, matching the running head), with `EDITIO V` set smaller in the graded hierarchy proposed above. That keeps every documented element on the plate and stops one abbreviation meaning two things six inches apart.

- [ ] **Survey letters restart at 'a' for every construction, so one figure carries many a's** `Magnitude V · craft · small effort`

  Carry a monotonic letter counter on `world` and stamp each new survey record (effects.js:313 and :326) with its own run of three from a continuous a…z sequence, wrapping to aa/bb/cc rather than restarting; the letters then read as one long figure being built up the sheet, which is exactly what it is. Also give them the ground leaf proposed for the construction labels — on a crater surface they vanish into the hatching.

- [ ] **'Δ / 001' is the one mark on the sheet no 1603 hand could have made, and it renders as the word 'ooi'** `Magnitude V · era-error · trivial effort`

  `ASCENSUS` (already the atlas's own rim caption at marks.js:179) over the figure in Roman, unpadded, using `roman()` from ephemeris.js:13 — which also returns '—' at zero, so the opening row reads as a ruled blank rather than 'ooo'. Or keep Arabic and simply drop both the delta and the `padStart`.

- [ ] **The ephemeris truncates its Latin weekdays to three letters with no abbreviation point** `Magnitude V · craft · trivial effort`

  If the planetary signs (newArt) are too much, the cheap correct version is one character: `name.slice(0,3)+'.'` — SOL. LUN. MAR. MER. IOV. VEN. SAT. The `.eph-head` cells at index.html:444 have room, and the `title="dies Lunae"` tooltip already carries the unabbreviated form for anyone who wants it.

<a id="bodies"></a>
## The planets as hand-coloured specimens

*17 findings.*

- [ ] **Warm literals leak through the cool duotone plates — ochre continents and orange lava on a blue-grey sheet** `Magnitude I · inconsistency · trivial effort`

  Set `pixels:true` on verdigris, azzurra and proof only (plates.js:288, 292, 297) — the pass already exists, is cached per glyph and runs once per body. Leave cellarius and foxed alone: cellarius costs the pass for no visible gain and foxed's transform is documented as hue-preserving. Do NOT reach for the live-drawn marks this way: the ember tile and the weather tile are baked and pressed at planets.js:581, but the ice fringe at planets.js:620-629 is stroked live in drawPlanet and so escapes any pixel pass — register that one literal as a plate token instead.

- [ ] **The hand-colour misregistration is clipped away on four of seven families** `Magnitude I · bug · small effort`

  Move the clip to after the impression transform in both places (planets.js:607-609; reveal.js:328-330). Do NOT raise the amplitude 3× as the auditor proposes — `(impressionRng()-.5)*6*rough` (simulation.js:689) gives an expected offset of about 1.5 CSS px, which is exactly the "one to two pixels" README:56 specifies; tripling it would break the spec, not honour it. The second half of the auditor's proposal is right and more valuable than the amplitude: `paintPlanetSurface`'s crater rims, ice fractures and dune ripples are burin work and should move to `front` with the hatching so they stay put, leaving only the body wash and `paintPigment` in the colourist's shifting layer.

- [ ] **The seven worlds spend their variety budget on hue, which is the first thing a duotone takes away** `Magnitude I · craft · medium effort`

  Give each of the five undifferentiated worlds one silhouette-level mark that survives at 45px and survives a duotone, and fix the ringed/storm collision first since it is the cheapest: give the storm giant a hard equatorial band pair reaching the limb and take the belts off the ringed body entirely, so the two stop being one drawing. Then the ice world an angular fracture web rather than hairlines, the dune world one dominant dark rift crossing the whole disc, the ocean world a single large landmass with a real coast rather than four small blobs, the volcanic world a broken, spotted limb. Do NOT widen `palette.size` to 16-34 as the auditor proposes — the registered sizes are in backdrop.js:247-272 (not plates.js), worlds already span 21-29 against pickups at 14-15, and pushing a world down to 16 would make it smaller than a pickup while pushing one to 34 would crowd its own orbit ring.

- [ ] **The paper plate's three cool pigments never reach the sheet** `Magnitude I · inconsistency · small effort`

  Raise the cool pigments where they are actually laid rather than cutting the engraving. Two cheap moves: use `palette.rgb` rather than the desaturated `palette.body` for the wash disc at planets.js:535 on the three cool families, and lift the pigment-wash alpha at planets.js:157 from `.06+rng()*.05` toward `.12+rng()*.08` for families whose registered hue is more than 60° from the sheet's 41°. Then re-measure against the same three warm families: a cool world should reach saturation .25-.35 rather than .06-.16. If more headroom is needed, thin the 440 stipple rectangles at planets.js:236-240 before touching the hatch, since the stipple is the flattest of the three warm layers.

- [ ] **A true annulus with a division, on a sheet that prints Galileo's two-eared Saturn in its own margin** `Magnitude III · era-error · trivial effort`

  Two tiers. The trivial one, which should be done regardless: delete the division at planets.js:133 (`if(i>44&&i<50)continue;`). Nobody saw it until 1675 and nothing depends on it. The ambitious one is the newArt entry below — stage the ansae opening into a ring across the observation clock, which makes the game's one real era-error into its best piece of storytelling. Do NOT move the impressum year: that belongs to the frame, not to the bodies, and the sheet's Galileo quotations are already named as quotations at README:151.

- [ ] **Engraving density is fixed per body, so the smallest bodies are the darkest marks on the sheet** `Magnitude III · craft · trivial effort`

  Scale the stipple and pigment counts by the area ratio `k=(core/26)^2` — 440→`Math.round(440*k)`, 950→`Math.round(950*k)`, 65→`Math.round(65*k)`. For the hatch, keep the *pitch* constant instead of the count: set `step` to a fixed ~1.4 CSS px and derive the stroke count as `Math.round((core-x0)/step)`, which fixes the crater's half-pitch and the size inversion in the same line. Re-measure the twelve bodies afterwards; no pickup should be darker than any world.

- [ ] **Craters are drawn round all the way to the limb** `Magnitude III · era-error · trivial effort`

  In planets.js:46-58, compute `d=Math.hypot(x,y)/core`, rotate the ellipse to `Math.atan2(y,x)` and compress the axis along that radius by `Math.sqrt(Math.max(0,1-d*d))`. Apply the same to the crater-rim glints on the dark side (planets.js:202-208) and to the modern albedo craters (planets.js:359-365), which use plain `arc()` and have the identical problem. Keep the existing random `flatten` as a small extra irregularity on top of the geometric term rather than in place of it.

- [ ] **The polar caps rotate around the limb, disagreeing with the graticule that shares their axis** `Magnitude III · bug · trivial effort`

  Move both caps out of paintPlanetSurface into the still `front` layer, drawn after the engraving and rotated by `art.tilt` alone — the treatment the ice fringe already gets at planets.js:620-629. While there, align the graticule's own rotation with `art.tilt` instead of the hard-coded -.28 so the poles, the caps and the meridians finally agree, and add the matching south cap: one cap at the top of a tilted globe is the one thing a cartographer would never draw.

- [ ] **The belts cross the hatching, producing exactly the cross-hatch the plate says it never cuts** `Magnitude III · inconsistency · small effort`

  Curve the belts with the form instead of ruling them across it. In planets.js:64-68 (and the dune ripples at 94-101), bend each belt into an ellipse arc concentric with the limb — the same move planets.js:230-234 already makes for the second hatch pass — so belt and hatch run in sympathy rather than at a right angle. If the horizontal reading must be kept for the giants, reserve the belts to the middle third of the disc and let the hatch own the limb, so the two never overlap. Check the result against crops/vz-ringed.png at the same magnification.

- [ ] **The keyline stage draws a doughnut, not a keyline** `Magnitude III · craft · small effort`

  Narrow the clip to roughly `core*0.94` to `core*1.10` so a genuine hairline contour sweeps round. One caveat the auditor missed: for the ringed family the same clip is what brings in the front half of the ring system (planets.js:566 puts it in `art.front` out to core*2.0), so narrowing it alone would strand the rings until the hatch band arrives. Give the ring system its own reveal off `pen.survey` (reveal.js:148), which already carries the back half via `art.back` at reveal.js:321, so both halves close together on completion as the code comment at reveal.js:320 intends. Fade the punched hole out earlier so the centre is bare sheet inside a closed contour rather than a hole.

- [ ] **The observatory plate is still drawn by a pen it does not have, and is the one plate with no completion mark** `Magnitude III · inconsistency · medium effort`

  Fix the gap first, because it is cheap and it is the real defect: register a `modern` hand for `flourish` via defineHand (the ceiling.js:1779 registration is the template) and give it a focus-lock bracket or a plate-solve tick struck at `art.core*1.2` rather than at the missing survey radius. Then, if there is appetite, fork the three staged marks on `modernPlate()` in reveal.js: a soft unfocused disc that sharpens in place of `sketchDisc`, and scan rows locking top-down in place of the keyline annulus and hatch band. Give the modern gold pickup a rendered analogue of the rosette while you are in there (planets.js:567-570 lives in the engraved branch only).

- [ ] **A used body is composited down to 20% ink, on a sheet whose own rule is that ink does not fade** `Magnitude III · craft · trivial effort`

  Do not touch the observation clock — that is the design. Change one number and one grouping: floor the used alpha at about 0.75 rather than 0.2 (figures.js:960) and let the diagonal strike at reveal.js:383 carry the spent reading on its own, which is what README:133 already says it does. If more separation is wanted between live and retired bodies, retire the *colour* only — fade `art.surface` toward the sheet while holding `art.back` and `art.front` at full ink — rather than dimming the whole composite.

- [ ] **No body carries a name, a number or a letter of its own — but a geometer's letter is already sitting on top of it** `Magnitude III · gap · medium effort`

  See the newArt entries. Two constraints on whichever is built: the caption must ride `documented` and not `taken`, since README:133 makes identity the property the observation clock buys; and it must not be set where the survey construction's `a` and its bearing numeral already go, so `textAlongArc` (marks.js:146) round the outside of the orbit ring is the right home rather than anywhere on the disc. Separately, and cheaply, push the survey letters clear of the body: raise `off` at effects.js:417 from `8*scale` to something derived from the node's drawn core so the geometer's letters sit outside the specimen rather than on it.

- [ ] **The pickups are drawn as banded globes with a full meridian graticule, which the code says they are not** `Magnitude III · inconsistency · trivial effort`

  Guard both marks on `PICKUP_FAMILIES.has(family)`: skip the graticule block at planets.js:242-245, and replace the thirteen latitude ellipses at planets.js:122-125 with something that is not a globe reading — a flat burnish, a struck field, or simply the wash and the keyline with the device around it doing the work. That also frees the pickups' ink budget, which the density finding above shows is currently the heaviest on the sheet.

- [ ] **The planet hatching is the only line work on the sheet not cut with the burin primitives** `Magnitude V · craft · small effort`

  Route the hatch through the same three-harmonic width modulation burinSegment already uses (marks.js:117-123) rather than a new taper, so the bodies match the rest of the plate exactly instead of introducing a third line quality. Let a few strokes skip, and jitter the pitch a little stroke to stroke — evenly spaced lines are the giveaway. Combine with the constant-pitch change in the density finding above; both touch the same loop at planets.js:215-221.

- [ ] **The dune family is the only one with no paper branch** `Magnitude V · inconsistency · trivial effort`

  Add the paper fork at planets.js:99-104 following the pattern of the other five families: a darker sepia contour tone for the trough lines, a paler dilute wash for the crests, and the rift cut as a burin line rather than a filled brown stroke. Move the polar cap out to the still `front` layer at the same time, per the polar-cap finding above.

- [ ] **A proof before letters is pulled uncoloured** `Magnitude V · era-error · small effort`

  Fork on the existing `plain` flag rather than adding a new one: when `PLATE_STYLES[plateName].plain` is set, skip the `palette.body` fill at planets.js:535 and the `paintPigment` call at planets.js:539, leaving the bodies as pure line and hatch on bare sheet. That also removes proof from the warm-literal leak in the first finding, so it need not be added to the `pixels:true` list if this is done instead.

<a id="palette"></a>
## Colour, ink and the plate system

*12 findings.*

- [ ] **The duotone is luminance-only, so four derived plates lose the entire role palette** `Magnitude I · inconsistency · medium effort`

  Unchanged from the auditor and correct: add per-plate override blocks to definePlate('marks') (marks.js:9) and definePlate('inks') (effects.js:66) for cellarius, verdigris, azzurra AND modern, listing the roughly nine tokens that carry meaning with no shape signal — nodeDrift, nodeGold, nodeFading, nodeRelaxed, nodeHardcore, hazardAccretion, aimBlockedStart/End, fadingCritical. Choose each within that plate's own declared identity rather than adding hues it does not own: cellarius separates them by value along its gold ramp (05-engraving.md:365 fixes it as gold on deep blue, so do not add a second hue there); verdigris keeps green for the sheet and rubricates danger in iron red; azzurra separates by value against its mid ground; modern is the one plate where a false-colour role palette is period-honest and should get real hue. mergeTokens/definePlate at plates.js:363-377 already merges variants[id] over the tinted base, so this is data only.

- [ ] **On three derived plates the rising darkness reads as a rising light** `Magnitude I · bug · small effort`

  Declare a void family that never goes through the tint. Add `voidInk:[r,g,b]` to the PLATE_STYLES rows at plates.js:287-297 and have the eight "this means black" tokens read it — dark.washTop/washMid/washSolid/bodyTop/bodyMid/voidLayers (effects.js:37-38), marks.hazardCore (marks.js:29), reveal.blot (reveal.js:16). Enforce a floor rather than a fixed colour: each plate's void must sit at least 25 L below that plate's own sheet. Azzurra a bistre near [38,34,40]; cellarius a true ink-black near [6,8,20]; verdigris near [8,14,12]. Cheaper alternative if you would rather not touch PLATE_STYLES: give those three plates an override block in definePlate('dark') and definePlate('reveal') — the merge path exists.

- [ ] **planets.js paints 116 colour literals against 3 token reads, so on a mid-value plate the bodies stop obeying the sheet** `Magnitude I · inconsistency · medium effort`

  REWRITTEN — the auditor's step (1) is wrong and would make things worse. Setting `pixels:true` on cellarius/verdigris/azzurra/proof double-tints every pixel that came from an already-tinted token (planets.js:535-536 fills with palette.body, which definePlate already transformed, into the very layer pressPixels then presses). A plain duotone is not idempotent: azzurra's sheet [8,15,24] goes to [107,123,138] on the first pass and to [164,176,185] on a second. Sepia gets away with it only because `topped(...,.86)` renormalises and is near-idempotent (I checked: [195,180,142] -> [198,178,147] -> [198,177,146]). So do step (2) alone: move the ~15 literals that carry meaning — shoreline fill/stroke, crater shadow/wall/lit, ring major/minor, storm major/minor, ice fracture, dune rift, volcanic fissure inner/outer, pigment light/dark — into a `definePlate('surface', ...)` block beside definePlate('planets') at backdrop.js:245, so a plate states them rather than inheriting them through a pixel pass. If you do want a pixel pass as a stopgap, wrap it in `topped()` the way sepia is, so it is safe to apply twice.

- [ ] **The DOM palette is a second, hand-maintained palette that four plates barely re-ink** `Magnitude I · inconsistency · small effort`

  REWRITTEN — do not map the registry onto the CSS vars as the auditor proposed. The two are not 1:1 (night --gold #d5b779 vs base.gold #e2c385; --copy #a9b3b6 vs base.caption 198,187,155), so that mapping would silently restyle both base plates. Instead, keep index.html:15-16 as the two authored base palettes and DELETE lines 19-22; then in syncPlate() (plates.js:481) derive the derived plates' CSS vars by running `PLATE_STYLES[plateName].tint` over the base plate's own declared values, exactly as tintValue does for canvas tokens. Night and paper stay pixel-identical, every derived plate becomes automatically consistent with its own canvas, and any future plate needs no CSS at all. Keep an explicit override only where a plate genuinely departs (azzurra and modern already do). Do the same for `.footer` at index.html:17.

- [ ] **The proof plate is the opposite of a proof before letters** `Magnitude I · era-error · trivial effort`

  Darken the mid stop and lift the light stop: `duotone([14,12,10],[86,78,66],[250,245,233])`, which drops paper's ink (L .177) from a 41% position on a far-too-light ramp to a dark bistre near [43,39,33] and lifts the sheet above the standard paper's. Wrap it in `topped(...,.9)` the way sepia is (plates.js:295) so the sheet actually reaches the light stop instead of stopping short. Add a small dressSheet branch for it — not dirt, but the marks of a fresh pull: a crisper plate-mark bevel and a faint burnisher sheen. Test: proof's ink-to-sheet contrast must exceed paper's 9.92:1, and its studiolo swatch must be the brightest card in the paper family, not the dullest.

- [ ] **The four chapter palettes are registered 5-9 units apart, so the run's four-act structure never reaches the sheet** `Magnitude III · gap · small effort`

  Do not add a glaze — widen the one that exists. Re-author the four `wash` values at plates.js:512-520 so that, composited at the alphas already in celestial.js:793, adjacent chapters land at least 6-8 units apart in at least two channels and chapter I to chapter IV spans 20+: e.g. night I cool grey-green '38,56,52', II warm brown '68,48,32', III mauve '46,34,52', IV indigo '22,36,64'; paper I '96,86,58', II '124,84,42', III '112,58,50', IV '58,74,104'. Then verify by sampling the margin at each chapter — the check the current values would have failed. A faint change in the laid-paper blend strength (plates.js:588) across the four would sell the gathering as a slightly different stock as well. Period-true twice over: gatherings of a hand-coloured atlas genuinely vary in tone, and a colourist's palette drifts through a book.

- [ ] **The catalogue, colophon and ephemeris cover the sheet with flat colour, so the game's own book pages are the only ones that are not paper** `Magnitude III · gap · medium effort`

  Give the panels the plate's own sheet. At syncPlate() (plates.js:481), export a 256x256 crop of paintBackdrop() composited with laidPaper() as a data URL into a CSS custom property, and set `.catalogue-leaf`, `.colophon` and the ephemeris leaf to that image behind a lower-opacity veil. Then replace the 1px `var(--line)` box (index.html:100, :296) with a burinRect plate-mark and a double rule. On foxed the catalogue should be foxed; on cellarius it should carry the gold bloom. Do finding 4 first — a sheet-backed panel with the wrong --veil under it is worse than a flat one.

- [ ] **Sepia's ground is the paper plate's ground to within one unit, so the two plates are indistinguishable in the studiolo** `Magnitude III · craft · small effort`

  Two numbers, no machinery. (1) Deepen the mid stop so the one brown actually bites: `duotone([34,24,15],[104,78,50],[231,218,189])`, which takes sepia's ink to roughly [63,47,31] — at or below paper's — and darkens every role token with it. (2) Move the sheet off the paper plate's exact ground so the swatch reads: either take the light stop to a slightly cooler, greyer cream near [226,216,192], or lean harder on the existing dressSheet branch (backdrop.js:63-72) by raising the deposited-rim alphas, so the sepia sheet declares itself as a sheet that has taken wash after wash rather than as a fresh one. Then check the studiolo: the two swatches must differ by at least 8-10 units of mean, or the unlock is invisible where it is bought.

- [ ] **Carta azzurra prints its plate-mark and frame furniture as white heightening** `Magnitude III · era-error · small effort`

  Give azzurra a single override block in definePlate('frame') (frame.js:9) — nine tokens — setting markEdge, mark, rule, ruleFaint, tick, tickMinor, text and orn to a dark ink against the ground: rule around 'rgba(44,42,50,.45)', tick 'rgba(44,42,50,.36)', text 'rgba(38,36,44,.5)', mark 'rgba(30,28,36,.12)' for the plate-mark's bite. Leave every mark in definePlate('marks') and reveal.nib/bead on the pale end, which is where 05-engraving.md:366 actually puts the white heightening. That one block gives the plate its missing dark end where it is historically owed it, without contradicting the recorded design of the drawing itself.

- [ ] **The modern plate overrides the one section that already worked and leaves the twelve role tokens on the duotone** `Magnitude III · inconsistency · small effort`

  Add a `modern:` block to definePlate('marks') (marks.js:9) giving the twelve node roles the instrument colours the DOM already declares — nodeShield to the cyan family, nodeReflector to the violet, nodeGold and nodeDawn to the amber, nodeDrift to a cooler cyan-white, nodeHardcore and nodeFading to a real alert red — and match --gold/--shield/--reflector/--dawn in index.html:29 to those values rather than the other way round. This is also the one plate that can honestly carry the marginal channel key in newArt below, which would then be a legend rather than a decoration.

- [ ] **Dead and orphan colours: four registered tokens no plate can reach, and two literals outside the registry** `Magnitude V · inconsistency · trivial effort`

  For celestial.js:822, add `sheetEdgeShade` to definePlate('atmosphere') (celestial.js:727) with night '2,5,10' and paper '58,42,28' and read it. For planets.js:557, read ink.base.inkStrong. For the three paper halo tokens, delete them — the `if(!paper)` guard at figures.js:1416 is the right call and the tokens are misleading. For the night chalk, let the night plate use it: draw the same sanguine trial arc on night at a lower alpha, so red chalk under the ink is a mark both base plates share.

- [ ] **The screen flash exists on night and is invisible on paper** `Magnitude V · inconsistency · trivial effort`

  SIMPLIFIED — no composite change is needed. Set the paper token to the plate's own blot, around '22,20,38', and raise the paper alpha at frame.js:762 to about .09; a source-over fill of a dark colour at low alpha is already a darkening. That gives the paper plate a momentary shadow across the sheet — the press coming down — in the ink it already spills. Leave night exactly as it is.

<a id="effects"></a>
## The dark, the comet and the hazards

*16 findings.*

- [ ] **The waterline — the one line in the game that kills you — is a dead-straight ruler line** `Magnitude I · craft · small effort`

  Cut it as ink, and let the atlas's own graduated scale keep the measuring job it already does in the margin (visible at both edges of verify/v-night-waterline.png). Replace the single `line()` at effects.js:1213 with 8-12 chained `burinSegment` pieces at wobble ~0.5, seeded off `Math.round(world.floorY)` so it is stable frame to frame rather than crawling, and give the three sediment lines at 1214-1220 the same treatment or raise their amplitude to at least 4*s. Do NOT letter or graduate the waterline (see the newArt I dropped): the frame's own row scale already numbers this axis a few pixels away, and a second graduated rule inside the play channel would be the atlas measuring the same thing twice.

- [ ] **The sunspot's body is the only mark in the atlas not cut with a burin, and it no longer covers what kills you** `Magnitude I · era-error · small effort`

  Keep the burst silhouette, restore the hand and the promise. Walk the same 18 vertices but stroke the closed path piece by piece with `burinSegment` (or add a `burinPolygon` beside `burinRect` in marks.js:133) so the rim skips and swells. Set `notch=u` with a small ±8% jitter so the ink never retreats inside the lethal radius, and `tip=Math.max(u*1.45,r*.85)` so the points read as flare tongues beyond the core. Restore the two deleted limb contours at r and r*0.82 — they were the only marks drawing the flare's own drawn radius, which is what the pricked field ring is measured from.

- [ ] **On the duotone plates the lethal body of a hazard is within five levels of the plate's own ground** `Magnitude I · bug · small effort`

  These two tokens are not a colour, they are the absence of the sheet, and the duotone should not be allowed to raise them. Add a `sink(token, floor)` beside `duotone()` in plates.js that clamps a token's luminance to at least ~22 levels below the tinted `paperRgb`, and apply it to `flareUmbra` in definePlate('field') and `hazardCore` in definePlate('marks'). While you are there, check `ink.dark.washSolid` and `voidLayers[4]` on cellarius for the same collapse — the flood's body is built from the same end of the ramp.

- [ ] **The rising darkness is the only major art layer baked at 1× and stretched** `Magnitude I · craft · small effort`

  Bake at device resolution like everything else: `makeCanvas(Math.round(640*DPR),Math.round(180*DPR))`, `g.scale(DPR,DPR)`, and add `DPR.toFixed(2)` to the key at effects.js:976. Keep the 640×180 drawing coordinates so nothing else changes. At the clamped DPR of 2 that is two plates × 1280×360 device px ≈ 3.7MB total, and the map is already keyed per plate.

- [ ] **HIC SUNT DRACONES parks exactly where the chapter lettering comes to rest** `Magnitude I · bug · small effort`

  Fold `revealBand()`'s top/bottom into `glossClearance` as a rectangle test alongside the node and hazard discs, so the gloss fades exactly as it does near a ring. Because the collision is systematic rather than occasional, also lower `marginaliaFloor()` by the chapter band's height while `revealBand()` is non-null, so the gloss sinks under the lettering and stays there instead of blinking on and off behind it.

- [ ] **The dark takes you and the sheet answers with eighty sparks; the edge takes you and it answers with ink** `Magnitude I · inconsistency · medium effort`

  Give the dark its own mark in the sheet's own language: at the waterline, a blot of the run's own `trailInk()` spreading upward from the point of loss with the pen's last trail segments drowned in it, plus a short crown of the flood's own bleed threads climbing over the spot — `inkSplat` already takes a `spray` direction, so point it up the sheet. Keep `burst()` for the vortex and the sunspot if you want the three deaths told apart, since those two are heat and violence rather than drowning; but drop `screenFlash` on the darkness death, or reduce it to one frame of the flood's own tone rather than a warm white.

- [ ] **During a constellation reprieve the flood's leading edge gets heavier, not lighter** `Magnitude III · bug · small effort`

  Make the relief plate a pure re-inking overlay: pass a second flag into `darknessPlate()` that skips the wash gradient, the void-layer fills, the landContour fills and the `fleckDark` branches, leaving only the marks that actually carry `pigment` — the contour strokes at 1013, the 220 tide marks at 1017-1025, the pigment stipples and the 75 fringe strokes at 1033-1037. The gold then replaces the copper instead of stacking on it.

- [ ] **The vortex is a flat black hole, not a pooled ink blot — the whirl that names it is invisible** `Magnitude III · craft · medium effort`

  Rebuild the paper core as a blot: fill at ~0.86 so the laid tile reads through, add a coffee-ring by re-striking the same contour at r*0.94 and r*1.0 in a darker tone at 0.5-0.7 alpha, and replace the 20-segment polygon with `landContour` (planets.js:8), which already produces the wobbling quadratic edge the pools and splats elsewhere use. Roughly double the whirl's alpha (0.26→0.5, 0.13→0.26) and carry the arms further in, so the water turning is read before the eye. This also delivers the vortex/flare silhouette separation from the vortex's side, which is a cheaper way to buy it than distorting the flare's umbra.

- [ ] **The gust's wind-head has no face; the frame's wind-head does** `Magnitude III · inconsistency · small effort`

  Port the eye/brow/cheek block from frame.js:58-62 into `windSprite`, scaled to `head`, and fill the mouth centre as frame.js:65 does. It is baked once per gust so it is free at runtime, and it makes the two heads one engraver's.

- [ ] **The flare's two companion spots are perfect circles that land on the burst's own rim** `Magnitude III · craft · trivial effort`

  Push them out, shrink them, and cut them by hand: `d=r*(1.05+rng()*.35)`, `sr=u*(.14+rng()*.1)`, skip any placement whose centre falls within 1.15× of the burst radius sampled at that angle, and replace the two `arc()` calls with a jittered `landContour` fill and a `burinArc` penumbra ring so they are engraved like everything else.

- [ ] **The live rays don't line up with the burst they were rewritten to line up with** `Magnitude III · bug · trivial effort`

  Delete `(h.phase||0)*.1` at figures.js:1200 — or, better, move the same term into the sprite's angle at figures.js:1158 and add `h.phase` to the sprite key, so the gusts still differ from one another but each one's rays and points agree. Start the rays at `tip` rather than `r*.8` so they extend the points instead of piercing them, and keep the per-ray length jitter.

- [ ] **The ambient comet is a gradient motion-streak in an atlas that has written down how to cut a comet** `Magnitude III · era-error · medium effort`

  Redraw the ambient comet in the vocabulary README:163 already specifies: a punched head, a coma of 9-12 short radiating hairs leaving the coma's limb rather than the nucleus, and a tail of 5-7 tapering `burinSegment` strokes that fan, lean off the axis and run out of ink at different lengths. Weight everything `*scale`. Keep the peak alpha low and the clearance rules exactly as they are — the fix here is the mark, not the loudness.

- [ ] **The night flood's edge is a wash with a wavy line on it, not ink soaking into a sheet** `Magnitude III · inconsistency · medium effort`

  Do not simply un-gate the paper branch. Run the same bleed-thread loop on night with a night-appropriate colour fork: `pigment`/`shorelineRelief` at 0.06-0.18 rather than `fleckDark` at 0.08-0.30 — light threads standing off a dark flood rather than dark threads climbing a light one, which is how the night plate handles every other mark. Fixing the 1× bake (finding 4) is a prerequisite; at the current ~2× upscale threads this fine will not survive to the screen anyway.

- [ ] **The paper flood's fourteen settled pools are painted out immediately after they are drawn** `Magnitude III · bug · trivial effort`

  Move the pool loop (effects.js:995-998) to after the void-layer loop, and interleave it: draw pools 0-6 after layer 2 and pools 7-13 after layer 4, so some settle into the mid-tones and some sit on the deepest wash. Drop their alpha from 0.55 to ~0.35 once they are no longer competing with an opaque overlay. The 260 bleed threads should stay where they are — they live above the layers' contours and read correctly.

- [ ] **The chapter leaf becomes a soft airbrushed halo when the flood is under it** `Magnitude III · craft · medium effort`

  Give the leaf a second form for when it lands on ink. When the flood covers the reveal point (fy above the lettering's band), draw the pass as a reserve instead of a glow: a hard-edged panel of the sheet's ground with a `burinRect`/`landContour` boundary and a hairline rule round it, sized to the lettering, so the name sits in unprinted sheet the way a cartouche does. Over the chart, keep the feathered pass exactly as it is. This also pairs with the DRACONES collision (finding 5): once the lettering has a reserve, the gloss has a rectangle to keep clear of.

- [ ] **The hazard halo tokens are registered identically on both plates but only ever drawn on one** `Magnitude V · inconsistency · trivial effort`

  Delete the three paper entries so the registry states plainly that only the night plate carries a halo, and add a line to the comment naming it as the night plate's starlight rather than its ink. If you want the two plates to agree about reach, the era-true way is not to add a halo to paper but to carry the whirl's outer arm further out on both — which finding 8's rebuild already does.

<a id="figures"></a>
## Constellation figures and the burin line

*16 findings.*

- [ ] **The figure prints as two faint parallel rules and never strengthens when the chart completes** `Magnitude I · craft · small effort`

  Make the contour earn strength the way an engraver's plate does — a first light cut, then the same line gone over. Ramp contourA with progress: `(onPaper()?.34:.26)+(onPaper()?.20:.16)*(count/3)` so an untouched chart is a faint construction line at ~.26 and a completed one lands near .5, and on completion re-strike the outermost contour once with burinSegment at half alpha so the finished figure carries the doubled line the shield device already has (figures.js:895). Leave `expired` on the .24 fade.

- [ ] **Every figure is a ribbon: 3.2:1 to 8.6:1 at real fork geometry, and the fork's own numbers forbid the obvious fix** `Magnitude I · craft · large effort`

  Stop trying to widen the strap and instead give each figure a concentrated identifying mass at the middle star, where the spine is straightest and both sides of the sheet are free. Add `figBox(spine)` returning a lateral budget (outward `min(75, inboard-headroom)`, inward `min(110, |starX|-40)`) and rewrite each figure's off-spine functions as fractions of that budget, biased inward, so the widest part of the drawing sits at t1 and tapers to the strap at t0 and t2. Then pay the rest of the debt in the margin rather than on the chart: the completion vignette and the TABULA ASTERISMORUM plate below are what let the reader ever see a whole figure at proper proportion.

- [ ] **The star punch is wider than most figures and erases the needle's eye and the lyre's whole soundbox** `Magnitude I · bug · medium effort`

  Move the details clear of the punch rather than shrinking or reordering it — the punch is what keeps figure ink off the tick fence and the dashed capture ring, and drawing details after the destination-out pass (the auditor's part 2) would put them straight back across that furniture. Draw the needle's eye centred at `spine.at(0)` offset ±(r+18) on the outward side with its long axis across the spine, and the lyre's soundbox centred at `spine.at(0)` offset -(r+16) with half-axes 34x12. Where a figure genuinely needs mass at a star, make the punch a ring rather than a disc: erase only r+3..r+8 so the figure can carry ink inside its own star's rim, which is where a real plate crowds it.

- [ ] **The figures are cut with a constant-width jittered polyline, and their details with perfectly smooth vector curves — two hands neither of which is the burin** `Magnitude I · inconsistency · medium effort`

  Route figInk through burinSegment per surviving span — `burinSegment(g,a.x,a.y,b.x,b.y,rgb,alpha,width,seed,{segments:2,wobble:jag*.6,hair:i%3===0})` with the seed derived from the figure's rng so the cached raster stays deterministic — and give figInk the rgb/alpha explicitly instead of inheriting strokeStyle. Then replace every raw detail curve with burinArc (the needle's eye, the lyre's soundbox, the crown's collars, the serpent's eye) and burinSegment (the lyre's strings and crossbar, the serpent's tongue); a helper `figCurve(g,pts,...)` chaining burinSegment over a sampled bezier covers the serpent's head. Once contours swell, the hand differences below arrive for free.

- [ ] **figHatch shades across each figure's own axis, contradicting the plate's most-repeated rule** `Magnitude I · inconsistency · medium effort`

  Rewrite figHatch to take a fixed sheet-space angle (~0.95 rad, down-right) instead of the spine normal, and lay an ordered parallel set with a spacing rather than n random samples: walk t at a fixed step, and at each step lay a stroke whose length follows the local ribbon width and whose alpha ramps across the ribbon so the outward edge is darkest — the same profile planets.js:214-219 already uses. Then strike each stroke with burinSegment so the tone system matches the contour system.

- [ ] **The three engraver's hands cost 10 and 25 tracings and are indistinguishable on the sheet, while the catalogue previews them as obviously different** `Magnitude I · gap · medium effort`

  Make the hand change the cut, not the count. Once figInk goes through burinSegment, give each style a swell amplitude and a hair rule: Bayer fine and even (weight .8, swell .2, hair on every stroke, breaks .3); Hevelius medium with a strong swell and frequent skips (weight 1.05, swell .5, hair every third, breaks 1); Bode heavier with dense ordered hatching but a clean cut (weight 1.3, swell .35, breaks .5, hatch 2.4). Replace the `figStyle.weight>1?1.1:.95` fudge at figures.js:707 with a per-style `ink` value so contour alpha is a deliberate choice per hand, and make the ui.js:675-679 preview draw from the same style object rather than from three hand-typed literals so it can never drift from the plate again.

- [ ] **Hatch line weight is inherited by accident and never set, so the moth is shaded with a different tool from the crown** `Magnitude III · bug · trivial effort`

  Add an explicit `width` parameter to figHatch, set at the top of the routine from a new `figStyle.hatchWeight` (about .45), and pass it at all twelve call sites. One line in figHatch plus twelve edits — and it should land in the same pass as the down-right rewrite above.

- [ ] **Bode is modelled as the sloppiest hand, and the plate's own controlling engraver is behind the deepest unlock** `Magnitude III · era-error · small effort`

  Give Bode {weight:1.3, breaks:.5, jag:.4, hatch:2.4, stipple:1.7} — heaviest and by far the most shaded, but the cleanest cut — and let Hevelius carry the broken, jagged character (breaks 1.15, jag 1.1). Then swap the stock and the first unlock: make 'bayer' the ledger.js:255 fallback and stock entry and move 'hevelius' to the ten-tracing unlock, so the plate opens in the manner it says it is printed in and the two unlocks travel forward in time from it.

- [ ] **The nova's 'reserve of bare sheet' prints as a hard black washer on every night-based plate** `Magnitude III · bug · small effort`

  Gate the reserve on `onPaper()`. On the dark plates drop it and start the spokes at core*1.15 instead of core*1.55 so the rays spring from the point rather than from a gap. Separately cut the coronas from 1+round(charge*2) to at most two, push the outermost to radius*2.6, and lengthen the primaries to radius*(1.8+charge) so the rays outrun the rings and the mark reads as light rather than as a gauge.

- [ ] **THE MOTH, THE CROWN and THE SAIL do not read as their objects** `Magnitude III · craft · large effort`

  Moth: make `wing(t)` a single lobe centred on the middle star and multiply it by a lateral profile so the span peaks at t1 and falls to the body at t0 and t2, giving a broad triangle across the spine instead of two pods up it; add a real head disc at the top star with the two combed antennae springing from it. Crown: replace the square wave with five discrete points rooted at fixed t values, each drawn as two converging burin cuts to an apex 26 units out with a small bead at the tip, raised from a smooth band; move the collars to r+22/r+30 per the furniture finding. Sail: draw a spar as a real line across the top two thirds at half-width 6, hang the luff from it at -14, let the leech belly to 70 and close the two with a foot line — three cuts more and it is a sail.

- [ ] **The aim guide is thirty solid filled arrowheads on a plate whose own comment says it has none** `Magnitude III · inconsistency · small effort`

  Cut the pricking as an open burin wedge — two converging burinSegment strokes seeded from `l.x*13+d` so consecutive marks differ — rather than a fill. Reverse the size ramp so the marks shrink with distance as the nib empties, letting the existing `starved` factor at figures.js:1469 carry the running-dry story alone and freeing alpha to stay near-constant so the whole course reads as one line.

- [ ] **Figure furniture lands exactly on the node's own capture ring** `Magnitude III · craft · small effort`

  Reserve the annulus from r to r+16 for the chart alone. Push every figure ring outward past it (crown collars to r+22/r+30, compass hinge to r+20, astrolabe vanes to r+20, lantern flame origin to r+18) and give the figure's rings a different character from the chart's: the chart's are pricked or dashed, so cut the figure's as continuous burin arcs with skips, which the burin rewrite above supplies anyway.

- [ ] **The flare's rim is one continuous vector stroke, and its two companions are perfect circles** `Magnitude III · inconsistency · small effort`

  Strike the burst's rim with burinSegment along each of the eighteen edges of the jagged path (seeded from the sprite's own rng, wobble .3, hair off) so the silhouette keeps its shape but the edge is cut. Then give the two companions the same nine-point silhouette at quarter size, or drop them — one big estoile plus two round spots reads as an error rather than as a group. Amend the comment: this is a flare star cut as a burst, not a sunspot, and the sheet should say so.

- [ ] **The figures get neither the red-chalk underdrawing nor the off-register wash overrun that every planet on the same sheet gets** `Magnitude III · inconsistency · small effort`

  Two cheap changes. (1) In paintHandColour, offset the OUTER edge of each strip by 1-2 units perpendicular to the contour, per stroke, with the sign taken from the frozen impression direction — so a few passes cross the printed line, exactly as planets.js:552 does. (2) Lay a sanguine trial contour under the paper-plate figure: before the black pass, run the outermost `left`/`right` arrays through burinSegment in `ink.underdrawing.chalk` at ~.3 alpha with heavy wobble and skips, offset a unit or two off true, so the figure carries the same chalk-then-pen story every orbit ring already carries.

- [ ] **The rim caption names a figure that is off the sheet** `Magnitude III · craft · small effort`

  Anchor the caption to the fork's own middle star (`chart.stars[1]`) rather than to the entry node, keeping the existing top/bottom flip and HUD guard, so the name and at least the middle third of the figure are on the sheet together. Keep a much fainter mark at the entry star — a bare pricked arc or the catalogue index in small caps — so the entry still announces that a chart begins there without spending the name on it.

- [ ] **The vortex winds the sky but not the figure engraved on the same sheet** `Magnitude V · craft · small effort`

  Do NOT simply move the call after drawConstellations as the auditor suggests — that would also warp the constellation route lines the player navigates by, and the lens sits outside the shake save/restore at frame.js:757 so moving it would desynchronise the resample from sx/sy. Instead split drawConstellations into two passes: a figure pass (revealFigure/drawConstellationFigure) called before drawGravitationalLenses, and the route/caption/star pass called after. The whirl then catches the grid and the figure while every navigable mark stays square.

<a id="pen"></a>
## The living pen and the act of drawing

*17 findings.*

- [ ] **The planet's keyline mask catches the hatching, and art.front is composited twice for the back half of every observation** `Magnitude I · bug · medium effort`

  Split the layer at glyph time. In planets.js:551-567, bake the keyline circle, its off-register colour circle, the chalk underdrawing and the 11 rim arcs into their own small raster (`art.key`) instead of appending them to `front`; `front` then holds only paintEngraving's output. reveal.js's keyline stage reveals `art.key` alone, through a tight annulus of core±2px so it reads as a line being cut round; `front` comes only through the hatch mask. That removes the double composite outright, because no raster is drawn twice. Then give the hatch its own band rather than an axis-aligned rect: the strokes run near-vertical from -core*1.14 to core*1.1 (planets.js:216-222), so the band edge should be parallel to a stroke and sweep perpendicular to the set, uncovering one whole stroke at a time.

- [ ] **The capture is the one moment on the sheet with no act of drawing: the sketch ring is swapped for the cut ring in a single frame** `Magnitude I · gap · small effort`

  Reuse the wedge on the capture clock. In figures.js:1000-1005, when `pen.taken<1`, draw the sketch sprite first and then the cut sprite clipped to a wedge opening from `n.phase` through `TAU*pen.taken`, with penBead/penNib at the wedge head — the burin closing the sketch into the cut line as the traveller goes round his first lap, the sketch still showing ahead of the tool. That is exactly the mask penWedgeBegin/penWedgeEnd already implement; it needs a second clock argument, not new geometry. Leave a hairline of the sketch visible outside the cut ring where the two disagree, which is what a corrected setting-out actually looks like.

- [ ] **penNib draws an arrowhead, not a nib — and on night it is the brightest mark on the plate** `Magnitude I · craft · small effort`

  Replace the wedge in penNib with the traveller's own nib silhouette from effects.js:704-712, scaled to `reach`, and continue the shaft collinear off the frame edge instead of stopping at reach*1.9 — a hand's pen has no visible end. On night drop `ink.reveal.night.nib` (reveal.js:15) from 242,232,205 to at or below the frame's inkSoft so the tool sits under the ink, and drop the fill alpha from .9 to ~.55; leave the paper token alone, it already measures correctly. Keep the bead bright on both, since a bead IS ink. Add a ~120ms lift when a stroke finishes (scale up 12%, alpha to 0) so the pen leaves rather than blinks out.

- [ ] **The score floater is outside the placement solver and prints straight through other lettering** `Magnitude I · bug · small effort`

  Do not convert the floater into an inscription — that would lose the documented register. Instead give it the solver's collision test only: before drawing, build the floater's box and run `inscriptionClash` against every live inscription plus every other floater; if it clashes, step y by one line height (up on the left margin, down on the right) until it does not, or suppress the note. That is ~10 lines in effects.js:1360-1371 reusing machinery inscriptions.js already exports, keeps README:82's drift and manicule intact, and costs nothing when the margin is clear.

- [ ] **An inscription is carried into the footer band and prints over the running head and the buttons** `Magnitude I · bug · trivial effort`

  Move the bottom of the clip and the strike test to the same edge the placement solver already uses. In drawInscriptions, clip to `ctx.rect(rule, rule, W-rule*2, Math.max(0, H-footerBand()-rule))` and strike when `box.top > H-footerBand()`. The note is then carried under the footer exactly the way it is carried under the inner rule — no fade, nothing new drawn, one line changed — and the footer becomes the sheet's own lower rule, which is what it looks like anyway.

- [ ] **There is no single hand: two to three nibs are on the sheet at once** `Magnitude I · inconsistency · small effort`

  Add a per-frame nib claim in reveal.js: a module-local `nibClaim={x,y,angle,alpha,priority}` cleared at the top of the frame, with penNib recording a candidate rather than drawing. Draw exactly one at the end of the frame. Priority should be explicit rather than 'nearest the traveller' — the opening sheet has a frame reveal and no traveller, so rank it: the ring wedge of the node being orbited > the most recently begun stroke > the frame. Every other in-progress stroke keeps only its `penBead`, which is correct anyway: a bead is wet ink already on the page, not a tool. penRule (reveal.js:672-679) gets one nib, on the arm the rule started from.

- [ ] **Four classes of primary mark are revealed by a plain alpha ramp** `Magnitude III · gap · medium effort`

  Do the nova and the survey arcs; leave the star and the charge devices. Nova (figures.js:117-155): the geometry is already parametric and already ordered — reserve the halo, then spokes by index against pen.taken, then coronas outward one ring per third, then let the sparks land last. Survey arcs (planets.js:247-263): they are already burinArcs, so sweep them by angle against `pen.survey` instead of blitting art.back at alpha, and let `atlasFlourish` (reveal.js:369-378) become the bead left where the last arc closed rather than a separate gold ring drawn on top.

- [ ] **The frame's rules are composited three times over during the last quarter of the reveal** `Magnitude III · bug · small effort`

  Kill the overlaps rather than the stand-in. (1) Stop drawing penDashRect once its own span reaches 1 — pass the two spans in and return early. (2) Clip the settle blit to the complement of the swept band (`framePerimeterClip` already computes the band; take its inverse with an even-odd path) so nothing is ever composited twice. If you also want the rule to arrive as itself, bake a second frame layer holding only the two burinRects and sweep that through `framePerimeterClip` instead of dash-stroking — but that is a README:133 change, so make it deliberately.

- [ ] **REVEAL_CAP counts urgent marks that are exempt from it** `Magnitude III · bug · trivial effort`

  Count only throttled marks: keep a separate `queued` set that urgent registrations do not join, and test `queued.size>=REVEAL_CAP`. One line in `progress`, one in the completion branch, one in `reset`. The cap then means what its comment says.

- [ ] **The constellation figure's nib rides a phantom spine, not any stroke** `Magnitude III · craft · small effort`

  Drop the nib from revealFigure entirely and let the wipe be a wipe — a figure is a plate area coming up, not a single stroke, and the honest reading is that the pen is elsewhere. If a tool is wanted, put it on the figure's actual link path: chart.stars are joined by drawn links, so walk that polyline against `t` and claim the nib at the point along it, which also makes the sweep and the pen agree. Either way this is the first call site to give up its claim under the single-hand fix above.

- [ ] **Two lettering hands on one sheet, and the caption nib teleports by a glyph width** `Magnitude III · inconsistency · small effort`

  Cheap and correct: interpolate the clip edge continuously between glyph boundaries so the current letter is uncovered left to right as the nib crosses it and the nib moves smoothly — three lines in writeText, using the fractional part of `progress*text.length` to lerp between `measureText(slice(0,n))` and `measureText(slice(0,n+1))`. Also drop the `Math.max(1,...)` so the first glyph is not popped in whole at progress≈0. Better, if you want one hand: route captions above ~11px through penLettering; the outlines are already loaded and the cost is per-glyph contour stroking on a handful of short strings.

- [ ] **Route lines are held back by one full-width horizontal guillotine shared by every node on the sheet** `Magnitude V · craft · small effort`

  Clip per segment, not per sheet. drawConnections (marks.js:223-232) already walks consecutive pairs (a,b); pass b's `reveal.peek` into it and draw the segment only from a to `lerp(a,b,revealSpan(t,0,.7))`. That is the correct mask — a line drawn along its own length — and it deletes the frontier scalar, the O(n²) predecessor scan and the fork mispairing in one change.

- [ ] **The rim captions are the only lettering on the sheet that is never written** `Magnitude V · inconsistency · trivial effort`

  `textAlongArc` (marks.js:146) already places glyphs one at a time and returns {start,end,span}, so add an optional progress argument: draw `Math.ceil(progress*chars.length)` glyphs and let the caller claim the nib at the last glyph's tangent. Drive it from `revealLabel(pen,word)` like every other caption, so it begins after the ring closes.

- [ ] **The planet's reserve halo arrives whole before a single line is drawn** `Magnitude V · craft · trivial effort`

  Multiply the halo alpha by `pen.ring` at figures.js:963 on both plates, and on paper draw it inside penWedgeBegin (before the ring sprite) so the bare sheet opens as the line goes round it, which is how a reserve is actually made. Two lines.

- [ ] **The nib's spatter travels with the nib instead of landing on the sheet** `Magnitude V · bug · trivial effort`

  Place the flecks at the quantised cell origin: `const gx=Math.floor(x/7)*7, gy=Math.floor(y/7)*7`, then draw at `gx+cos(a)*d, gy+sin(a)*d`. Two identifiers. Better still, record a fleck into a small ring buffer the first time a cell is entered and keep drawing that buffer for the rest of the run, so spatter that lands stays landed.

- [ ] **A letter's contours are all stroked simultaneously, with the pen on only one of them** `Magnitude V · craft · small effort`

  Sequence the contours: allocate the letter's LETTER_STROKE window across its contours by arc length (the spans are already computed at reveal.js:625-630), stroke each in turn, and put the bead and nib on whichever contour is currently in hand. That also fixes the contours[0] / longest-contour mismatch by construction, since the pen is on the contour actually being cut.

- [ ] **The same inscription can stand twice on one sheet** `Magnitude V · bug · small effort`

  REWRITTEN — the auditor's fix ('refresh its age') would be wrong: `age` drives the writing progress (inscriptions.js:218), so refreshing it would make the standing note unwrite and rewrite itself, breaking inscriptions.js:11's law directly. Instead, in `inscribe`, before placing, scan `inscriptions` for a note with identical `text` whose box is within ~120*scale of the new anchor; if one is found, do not write a second copy — draw a second leader from the existing note's box to the new subject (drawInscription already builds a leader from box to anchor, so this is a list of anchors rather than one), which is exactly what a working plate does when one note serves two things. If a tally reads better, append a small roman numeral to the standing note instead.

<a id="chrome"></a>
## Screens, HUD and the interface as printed matter

*18 findings.*

- [ ] **The WIDE ORBITS hint is the one caption that skips the HUD guard, and it prints through BEST** `Magnitude I · bug · trivial effort`

  Change figures.js:812 to `const n=chart.main[0],nx=sx(n.x),ny=sy(n.y); ctx.fillText('WIDE ORBITS',nx,ny+captionOffset(nx,ny,n.r*scale,26*scale))` — i.e. route it through the same helper the COMPLETE caption uses. Do NOT widen HUD_TEXT_HALF to the full HUD footprint as the auditor proposed: README:70 spells out that an inscription is kept clear of 'the frame's margin, the score band, or the footer', so the 300px centre corridor is the deliberate scope, and widening it to 430px would force every note on the top third of the sheet below y=132 and defeat the placement solver.

- [ ] **Three of the four footer marks are the right object drawn in its modern icon form** `Magnitude I · craft · medium effort`

  Re-cut three marks against README:86 rather than replacing the motifs. (a) Sound: a real speaking-trumpet — a long tapering tube in three-quarter view, narrow mouthpiece at lower left, flared bell at upper right, one hoop band; sounding adds three tapering breath strokes off the bell, silent draws the bell stopped with a short bar. (b) Plate: a real sheet — a laid rectangle at a slight angle with one deckle edge and two chain lines, printed-side-up on the night plate and blank on the paper plate, instead of a corner fold. (c) Fullscreen: see newArt — register crosses, which is the one genuine trade object that answers 'make the sheet fill the frame'. Give all three the same `transform="translate(.5,.4)" opacity=".3"` ghost the other marks carry, so the row obeys its own stated rule. Keep the drop-shadow keyline; it is documented and it is doing real work over the flood.

- [ ] **Every control is a hairline rectangle, and on the frontispiece they wrap into a ragged chip cloud** `Magnitude I · era-error · medium effort`

  Retire the border on `.diff-btn` and set choices as a ruled printed list: each option in small caps on its own line, a hairline rule *between* entries rather than around them, the chosen one rubricated in `--gold` and pricked with the lozenge already cut at `.score-frame::before` (index.html:207) and `.eph-cell[aria-pressed]::before`. Give the frontispiece a fixed two-column measure so nothing wraps, and open MORE as a ruled sub-list on the same measure rather than another wrap row. Keep the 44px hit target with padding, not with a drawn box, and keep `aria-pressed` unchanged so nothing about the state machine moves.

- [ ] **The leaves are made of a paper with no laid structure, at an opacity that satisfies neither purpose** `Magnitude I · inconsistency · medium effort`

  Make the leaves opaque (1.0) and give them the sheet's own grain: generate `laidPaper()` (plates.js:543) once per plate in `setPlate()`, set it as a data-URI CSS custom property on `#game`, and use it as a repeating `background-image` on `.catalogue-leaf`/`.colophon`/`.pause-leaf`, blended the way `drawLaidPaper()` blends it (plates.js:587 — multiply at .35 on paper, screen at .055 on night). Note the pause leaf at .86 is a separate and defensible decision — index.html:129-132's comment says the slip is meant to leave the plate legible around it — so give it grain but keep it translucent. Give the two full leaves a deckle or torn edge rather than a hairline rectangle if you want them to read as a second sheet.

- [ ] **The same chapter is called PLATE and TAB. in the same frame** `Magnitude III · inconsistency · trivial effort`

  Change celestial.js:711 to `'T A B U L A   '+numerals[...]` — the letterspaced form the reveal already uses, and the full word rather than the abbreviation, since the running head's abbreviation is what a folio does at small size and a title lettering does not. Prefix ui.js:295 `chapterLabel()` with 'TAB. ' so the record pane and the ephemeris agree. Three lines, one word.

- [ ] **The ink reservoir and the studiolo meter are CSS progress bars** `Magnitude III · era-error · medium effort`

  Move the reservoir onto the canvas as part of `drawHudLeaf()` (frame.js:589): a short burin-cut rule with a bead of wet ink at the charged end that shortens and dries as ink is spent, turning copper below .34 and beading up at .12 rather than flashing — which also deletes the per-frame DOM style write ui.js:927-934 goes to some trouble to throttle. For the studiolo, replace the bar with what a catalogue actually does: a printed fraction and a row of pricked lozenges, N filled of 12, reusing the `.score-frame::before` lozenge. Keep the `#game[data-era="2"] #ink` clip-path override (index.html:169) working or move it with the mark.

- [ ] **The catalogue's Record pane is a spreadsheet, and the sticky tabs guillotine its first row** `Magnitude III · craft · medium effort`

  Restore a real margin (drop the full-bleed override, or reduce it to 10px side padding) so the double rule reads. Set a 1.4px head rule over each group with entries at 0.5px, and run the numbers in a ruled column with its own vertical hairline rather than flush right in space. Cut the four KPI tiles and fold those figures into the register as its first four lines, set larger — they duplicate rows that already exist further down (HIGHEST ROW and BEST FLOW appear twice on one screen in 04-catalogue-night.png). Add 12px clearance under the sticky tabs so no row is guillotined.

- [ ] **NEWTON, and eight other words the sheet's own registry already knows the Latin for** `Magnitude III · era-error · small effort`

  Use what the ledger holds: 'VIS GRAVITATIS' on both buttons, keeping the existing explanatory `aria-label`. 'REDUCE MOTION' → 'A STILLER PRESS'. 'COPY SCORE' → 'TAKE AN IMPRESSION'. LOCKED / UNLOCKED / EQUIPPED → 'NOT YET CUT' / 'IN THE CASE' / 'ON THE PRESS'; 'SPECIAL FEAT' → 'BY FEAT ALONE'. I would leave the HUD alone: the auditor wanted 'FLOW ×' renamed to 'CATENA ×', but SPEED and FLOW are read in a half-second at 10px while a body is falling, and the sheet's English register (README:70's 'a slingshot taken, a transfer landed square') already licenses plain English for what the run is doing.

- [ ] **HIC SUNT DRACONES prints straight over the frame's scale ladder and out past the inner rule** `Magnitude III · bug · small effort`

  Wrap the gloss blit (effects.js:1181-1184) in the same inner-rule clip drawImpressum uses: `ctx.rect(m.inner,m.inner,W-m.inner*2,H-m.inner*2)` with `m.inner=frameBand()*.92+8`, and let the drift wrap inside that rect rather than across the full viewport, so it enters and leaves at the rule rather than being sliced by it. Separately, suppress the dark marginalia entirely while `world.state==='ready'` — the flood has not started and the sea monster has nothing to surface from, which also clears it off the frontispiece button cloud. Worth naming as art direction: 'hic sunt dracones' survives on exactly one globe and is largely a modern legend about old maps; keep it as a knowing anachronism, but then place it like one.

- [ ] **The ephemeris never got the mobile leaf the catalogue got, and it bleeds** `Magnitude III · gap · small effort`

  Extend the mobile leaf rules to the ephemeris — change the selectors at index.html:351-354 to `#catalogue,#ephemeris` and `#catalogue .catalogue-leaf,#ephemeris .catalogue-leaf`, then delete `.eph-leaf{max-width:min(460px,100%)}` at :429 so the month grid gets the full 430px measure (the seven columns are currently 60px wide inside a 400px card and the day heads are set at 8.5px to fit). Then fill the squares — see the newArt proposal for planetary heads and a lunar column, which needs no data the game does not already have.

- [ ] **The reviewed plate has no folio anywhere on it, and its only chrome is a chip pinned on the corner ornament** `Magnitude III · gap · medium effort`

  Add `drawRunningHead()` and `drawLaidPaper()` to `renderReview()` after `drawPlateFrame()` (review.js:70), so the reviewed sheet keeps its folio and its grain; leave `drawHudLeaf()` out, since there is no HUD to leaf. Move the way out off the plate — see the catchword in newArt — or at minimum give `#review-close` `top:calc(env(safe-area-inset-top) + 30px)` and `right:30px` so it clears both the inner rule and the corner rosette. And give the finished plate a title tablet; see newArt.

- [ ] **Locked catalogue cards use a dashed border and a question mark inside five nested rectangles** `Magnitude III · era-error · small effort`

  Make the locked state a blank plate rather than a placeholder: solid hairline, no dash, the drawing simply absent, and DESIDERATUR set small in the plate's caption ink where the '?' is — which is exactly how an incomplete plate book records a sheet not yet pulled, and it reads as a state rather than a redaction. Drop `.cat-preview::after` (index.html:396) and one of the two remaining nested borders so each card carries at most three rules.

- [ ] **Two buttons in the same row are both labelled HIDE** `Magnitude III · bug · trivial effort`

  Give the two disclosures distinct closed labels. The instructions toggle should close to 'FOLD' or 'ENOUGH' and the more-toggle to 'LESS' — or, better, once the ruled-list treatment above lands, neither needs a close label at all: the open sub-list carries a hairline rule and the head stays HOW TO PLAY / MORE with a small pricked lozenge turned to mark the open state, which is how a printed rubric marks an opened section. Whichever, keep `aria-expanded` as the accessible state and stop encoding it in the visible word twice.

- [ ] **The record pane prints an impossible fraction as a headline figure: ROUTES TRACED 40 / 12** `Magnitude III · bug · trivial effort`

  Either print the distinct count in the tile — `Object.keys(ledger.constellations).filter(k=>ledger.constellations[k]>0).length + ' / ' + CONSTELLATIONS.length` — or drop the denominator and set it as a plain lifetime tally, 'ROUTES TRACED · 40', matching the CONSTELLATIONS TRACED row four lines below it which already prints 40 correctly and unfractioned. Check ledger.js:107's sepia threshold against whichever reading is intended and make the two agree, since the same ambiguity sits under the unlock.

- [ ] **The running head's paper leaf prints under the utility icon row** `Magnitude III · craft · small effort`

  Narrow the leaf to the head it is under: measure the text once per chapter with `ctx.measureText(head).width` and scale the gradient to that half-width plus about 18px of feather, instead of the fixed `Math.min(W*.34,116)`. At 430px 'TAB. IV · THE DEEP' measures roughly 88px wide, so the leaf would span x≈171-259 and clear the icon run entirely, while getting *denser* under the letters that need it. Cheap: cache the width alongside `runningHeadGradients` (frame.js:604), keyed the same way.

- [ ] **Numbers are set in three conventions, none of them the sheet's** `Magnitude V · era-error · trivial effort`

  Set thousands with a thin space rather than a comma — `String(n).replace(/\B(?=(\d{3})+(?!\d))/g,' ')` — which is both period and cleaner in old-style figures. Set durations as '11 hor. 23 min.' (Roman numerals would be a step too far for a figure that changes every session). Pick one multiplier form: × before the figure everywhere, since that reads as an instruction rather than a unit, and set the × at the figure's own optical size rather than letting Fell's superior form shrink it.

- [ ] **The proof-before-letters plate is lettered by the interface** `Magnitude V · inconsistency · small effort`

  On a plain plate, print the HUD labels blind. Drop the brand, the SPEED/FLOW/BEST words and the powerup readouts to an uninked embossed ghost — a 1px light offset in the sheet's own ground with no ink at all, which a `#game[data-plate-id="proof"] .brand,.small{color:transparent;text-shadow:0 1px 0 rgba(255,255,255,.45),0 -1px 0 rgba(0,0,0,.10)}` reproduces exactly — and keep the figures inked so the game stays playable. That reads precisely like a blind impression and extends the plate's own conceit to the one layer that ignores it.

- [ ] **The Asterismi register is the only one of three whose rows are set in English** `Magnitude V · inconsistency · small effort`

  Add a `latin` field beside `name` in simulation.js's CONSTELLATIONS — Acus, Velum, Lyra, Corona, Circinus, Horologium, Serpens, Argo Navis, Astrolabium, Penna, Lucerna, Phalæna — and print it in the register the way every cosmetic row already prints its Latin: English name in the `th`, Latin in a `.cat-latin` span beside it. Leave the chart itself alone: the auditor wanted the Latin set as the caption there too, but the chart names are drawn along an arc at 13-14px (figures.js:790-791) and doubling them would crowd the ring; the register is where a reader has room to learn the pair.

---

<a id="new-art-needed"></a>
## New art needed

*53 pieces the audit identified as missing, grouped by the dimension that raised them.*

### The historical claim, judged strictly

- [ ] **The second state: a plate re-struck with additions** `small effort` — src/frame.js:689-697 impressumRows(), one more entry plus a gate alongside impressumHasCapture() (frame.js:666); the blank-row rule already exists at frame.js:734. The trigger wants a world.resolvedFamily flag set in the capture path in src/ui.js. HARD DEPENDENCY: the cartouche is currently overprinting the DOM impressum line and, on desktop, the button row (see the first finding). IMPRESSUM_ROWS is 9 at frame.js:637 and impressumMetrics() sizes the box from it, so a tenth row makes the collision worse until that is fixed. Do them in that order.

  One more row in the impressum cartouche, under a thin burin rule. The first state stays exactly as it is — AUGUSTA VINDELICORUM · EX OFFICINA ORBIS TABVLÆ · TAB. V · I / A1 · ANNO MDCIII · URANOMETRIA. Beneath it, a second-state line set the first time a run draws a body no naked eye could have resolved (any crater, ringed, storm, ice, dune or volcanic family): AUCTA ET RECUSA · ANNO MDCLXXXVII, with a small compositor's device between. On a run that never captures such a body the row stays a ruled blank, exactly as the year and title rows already do (frame.js:733-735). On a complete atlas the privilege line moves below the second state, where a re-issued privilege belongs.

  *Historical basis:* Atlas copperplates were assets, not editions: Bayer's own Uranometria plates were re-pulled and added to for well over a century, and Cellarius, Hevelius and Blaeu plates all circulated in second and third states with new imprints cut into the same copper. A plate showing Galileo's craters and Huygens's ring while its first state reads 1603 is not an impossible object — it is an ordinary one, provided the sheet says so.

- [ ] **A magnitude key cut for the hand** `small effort` — NOT in the lower margin band as first proposed: at narrow width frameBand() is 14 (src/frame.js:15), leaving about 5px between the outer and inner rules — a 14px strip cannot go there. Two places that work: (a) inside the play field just above the running head's own leaf at the foot of the sheet, drawn in the live pass rather than the cached layer so it can dodge the flood; or (b) on the pause leaf, which has whole empty columns in 14-pause-night-phone.png and is where a reader actually stops to consult a legend. Either reuses renaissanceStarGlyph() and renaissanceLegendMask() unchanged from src/frame.js:268-285.

  The six star signs laid in one horizontal strip on the phone: six punches at about 0.55 scale with Roman I-VI beneath and the word MAGNITUDINES small at the left end. Rows stay pale until a class has actually been classified in play, exactly as the desktop key does, so the strip fills in over a player's lifetime.

  *Historical basis:* Every plate in Uranometria carries its magnitude key, because the size of the printed dot is the only quantitative statement the plate makes. 05-engraving.md makes that the whole of this era's vocabulary for a body — 'a magnitude given by nothing more than the size of the printed dot itself'. Shipping the system to the target device with no legend withholds the sheet's one measurable claim.

- [ ] **Ink burn: the plate destroying its own drawing** `large effort` — src/effects.js darknessPlate() (effects.js:975-1040) for the flood itself, plus a corrosion pass over the cached frame layer in src/frame.js (frameLayer is already rebuilt per plate and size at frame.js:352, so a progress-keyed variant is cheap) and over the cached constellation rasters in src/figures.js. Deep rows of any paper-based plate: paper, foxed, sepia, proof — 30-play-paper-phone-t76-row27.png and 22-run-foxed-row30.png are the frames to judge it on.

  Replace the paper plate's opaque flood with iron-gall corrosion. As the dark rises, the heaviest linework fails first, not last: browning haloes tighten along the frame's double rule, along completed figure contours and along the densest keylines; the halo darkens to rust; then a small ragged puncture opens where the ink was thickest and the sheet shows through. Foxing spreads behind it. Light marks — stipple, a faint construction circle, an unclassified punch — survive longest, so the last thing legible on a dying sheet is what the burin barely touched.

  *Historical basis:* Iron-gall ink is acidic and mildly self-catalytic; given damp it corrodes the cellulose under every stroke, browning first and eventually eating clean through. 05-engraving.md:253-254 names it as this era's own frontier in exactly these words — 'not fire, the ink burning its own drawing out of the page it is drawn on' — and specifies the inversion that makes it dramatic: the densest linework fails first. It would also retire the current flood, which is this dimension's worst craft failure at the target viewport.

- [ ] **The Augsburg calendar quarrel, double-dated in the ephemeris** `small effort` — src/ephemeris.js:56-86, the day-cell and month-header builders, which already hold MONTHS_LATIN, WEEKDAYS_LATIN and roman(); the .eph-cell CSS in src/index.html would take one more small span.

  Each day cell carries its Gregorian numeral large and, beneath it in a smaller, paler hand, the Julian numeral ten days earlier. The month header sets both months where they differ. A single line under the grid reads STYLO NOVO · STYLO VETERI, and the existing note keeps its place below.

  *Historical basis:* Augsburg — the city the impressum claims — is the one place in Europe whose calendar reform produced a riot. The Gregorian calendar arrived in 1583; the city's Protestant half refused it, and Augsburg kept two dates side by side, through lawsuits and an imperial standoff, until 1700. A dated sheet pulled in Augsburg in 1603 would be read by people who checked both columns. This turns the game's bare AUGUSTA VINDELICORUM claim into something the sheet has actually thought about — and it lands in the one screen (07-ephemeris-*.png) that is currently the plainest in the game.

- [ ] **An escutcheon over the dedication** `small effort` — src/frame.js drawImpressum() around frame.js:736-740, drawn only when impressumHasCompleteAtlas() is true; reuses impressumDevice() at frame.js:706-712 for the charge. Same dependency as the second state: the cartouche has to stop overprinting first.

  When the atlas is complete and SERENISSIMO PRINCIPI · PATRONO ASTRONOMIÆ · CUM PRIVILEGIO is finally set, a small arms shield is cut above it inside the cartouche: a heater shield about 14px tall, field hatched one direction, charged with the plate's own compass-and-quill device, with two short strapwork volutes flanking it.

  *Historical basis:* A privilege and a princely dedication on a 1603 plate are never bare lines of type — they sit under the patron's arms in a strapwork cartouche, because the dedication is the point of the plate's expensive front matter. The game already draws an escutcheon well: the shield charge in src/figures.js is cut from Hevelius's Scutum Sobiescianum. Reusing that shape here makes the sheet's rarest state also its most finished-looking one, which is the right reward shape.

- [ ] **Bayer's own dozen, as three of the twelve** `large effort` — src/figures.js figCompass, figHourglass and figAstrolabe replaced by three new painters in the same idiom; src/simulation.js:164-177 for the entries. IMPORTANT CONSTRAINT the original proposal missed: do not change the existing `name` strings. ledger.js keys lifetime records by them (ui.js:378 reads ledger.constellations[c.name]) and CONSTELLATIONS is one of the named globals verify.mjs pulls off the simulation slice, so renaming needs an orbit.ledger.v1 → v2 migration following migrateRecords per CLAUDE.md. Adding a `latin` field alongside is free; retiring a figure is not. Land the Latin lettering first as its own change, then this.

  Retire THE COMPASS, THE HOURGLASS and THE ASTROLABE — the three that most clearly belong to Lacaille's 1752 instrument cabinet — and cut PHOENIX, TVCANA and PAVO in their place: a phoenix rising from a small flame nest with a fanned tail across the spine, a toucan with the bill on the top star and the body between the lower two, a peacock with the fan opened behind the middle star. Same figure grammar as the existing twelve: spine, broken contour, hatch, stipple, wash, three hands.

  *Historical basis:* Uranometria's fame rests partly on the twelve constellations Bayer added in 1603 — Apus, Chamaeleon, Dorado, Grus, Hydrus, Indus, Musca, Pavo, Phoenix, Triangulum Australe, Tucana, Volans — every one an animal or an exotic bird brought back from the southern voyages, and none an instrument. The game adds exactly twelve of its own, which is the right instinct; making three of them Bayer's own kind of novelty is what earns the imprint the sheet already claims. The moth is already halfway to MVSCA.

### One hand, one press, one sheet

- [ ] **Marginalia for the sheet the game is actually played on** `medium effort` — frame.js `buildFrameLayer`, a narrow branch beside the existing `if(wide)` at frame.js:249. Cut once into the cached frame layer, so it costs nothing per frame, and present on every frame of every run on the reference device.

  A narrow-sheet marginal set that lives in the 14px band rather than in a flank: an eight-point fleuron rose set at the head between the two rules, the scale bar re-cut as a graduated foot rule running under the bottom rule, and the engraver's credit set along the foot in the same italic. The desktop flank set, redrawn to run along a band.

  *Historical basis:* frame.js:249-284 gates the compass rose, the scale bar, the engraver's credit and the MAGNITUDINES key behind `frameWide()`, which frame.js:14 defines as `W>780`. The reference viewport is 430x932. So the sheet CLAUDE.md and README:92 both name as the one every visual judgement is made on is the only sheet in the game with no marginalia at all, while the bonus desktop gets all of it — and README:129 frames the flank set as something wide screens *add*, which is a decision about where they go, not about whether a hand-held plate carries its own scale and orientation. Every printed sheet of any size carries both.

- [ ] **Register marks in place of the release arcs** `small effort` — figures.js `drawNode`, the `if(active)` block at figures.js:1032-1045. On screen every time an orbit is held, which is most of the run.

  Replace the 2.2px release marks and the 2.6px perfect-preview arc with an engraver's register mark cut on the orbit rim: a small cross inside a fine circle for an ordinary release point, the cross struck heavier and doubled for a perfect one. The same information, a third of the ink, and a mark that says "this is where the plate lines up".

  *Historical basis:* Register or pin marks punched at the rim are how a copperplate was aligned on the press for a second pull, and they are exactly the shape the game needs — a precise point on a circle. The current arcs (figures.js:1037 at `2.2*scale`, figures.js:1041 at `2.6*scale`) are the two heaviest strokes anywhere on the sheet, drawn with a plain `ctx.arc` and a round cap, and n1.png shows what that does to the reading. The fullscreen icon at index.html:671-676 already draws this exact vocabulary — four corner brackets with four filled pins — so it is already in the sheet's hand.

- [ ] **Names for the two hazards, and a key that states the distinction** `small effort` — figures.js `drawFlare` (figures.js:1179) and the vortex painter, using the existing `textAlongArc`; key rows in frame.js `buildFrameLayer` under the MAGNITUDINES block (frame.js:266-284). Present from region three onward.

  A rim caption for each hazard in the same small caps the fourth-row orbits carry — `VORAGO` on the vortex, `MACULA` on the flare, lettered on an arc outside the field ring — plus a two-row key under MAGNITUDINES on the wide sheet showing the pricked repulsion ring against the solid cut edge, so the plate states its own notation for the one distinction that kills you.

  *Historical basis:* The Latin names already exist in the simulation and are never printed: simulation.js:217 `vortex:{…latin:'VORAGO'…}` and simulation.js:218 `flare:{…latin:'MACULA'…}`, used only for the observation list in ui.js. Meanwhile orbits carry Latin rim captions (figures.js:1029), charts carry their figure's name (figures.js:791), stars carry Greek letters and the four regions carry plate titles — so the two hazards are the only bodies on the plate with no name, and the data for naming them is already there. Scheiner's and Galileo's sunspot plates letter and number every spot they show; an unnamed body on a printed atlas is an omission, not restraint.

- [ ] **A strapwork cartouche for the plate title** `medium effort` — celestial.js `drawChapterReveal` (celestial.js:686). Keep the leaf underneath but much weaker — the cartouche does the work the 12px `shadowBlur` at celestial.js:707 is currently doing, and that line goes with it. Seen at the start of a run and at each page turn, so four times a deep run.

  A rolled-and-pierced strapwork panel, cut once per chapter into a cached sprite, that the chapter title is lettered into — two straps crossing behind the panel, a pierced lozenge either side, curled terminals, the field left bare. It gives the reserved ground a printed reason to be clear, and gives the largest type on the chart the only ornament it has.

  *Historical basis:* Every plate in Bayer's Uranometria 1603 and every one in Cellarius sets its title in a strapwork or drapery cartouche; a bare title standing on a feathered halo is the one thing about the chapter reveal no plate of the period does. The vocabulary is already in the codebase — `frameStrapwork` (frame.js:80) draws interlaced straps with pierced lozenges and curled terminals for the corner ornament and can be re-proportioned into a panel.

- [ ] **A real printer's device for the impressum** `medium effort` — frame.js `drawImpressum` (frame.js:721), in the cartouche at the foot of the opening sheet — visible on the frontispiece and through the first rows of every run. Note the cartouche is now the only impressum on screen, the DOM line having just been suppressed in the working tree (frame.js:718-726), which makes the device the one picture on it.

  An armillary sphere on a turned plinth inside an oval strapwork frame, with `ORBIS TABULA` on a ribbon beneath, cut at about 34px and printed under the impressum's last rule once the perfect chain is earned — in place of the four abstract strokes currently there.

  *Historical basis:* `impressumDevice` (frame.js:705-711) is one `burinArc` and three `burinSegment` calls at `m.size*.9` — roughly 6-7px on the narrow sheet, a scribble standing in for the one picture a 1603 colophon is actually expected to carry, and unreadable at the size it is cut. Every Augsburg and Frankfurt office of the period had a device; the armillary sphere was the standing mark of astronomical printers, and the game's own subtitle (`Sive de Motu Corporum Cælestium`) sets it up.

- [ ] **A cul-de-lampe where the flood meets the frame** `medium effort` — effects.js `drawDark`, revealed as `world.floorY` rises — so it becomes visible exactly when the run is most tense, at deep rows, and only there.

  An engraved tailpiece at the foot of the sheet that the rising darkness uncovers as it climbs — an overturned ink bottle with the spill running to the frame rule, or a wave-and-monster tailpiece — cut once into a sprite and revealed by the same waterline that already carries the Leviathan and the gloss.

  *Historical basis:* The rising dark is a linear gradient plus a tiled shoreline (effects.js `drawDark`, from effects.js:1190), which makes it the only large passage on the sheet with no drawn object in it. A cul-de-lampe closing the foot of a plate is standard sixteenth- and seventeenth-century furniture, and the machinery to reveal one is already built: `marginaliaFloor` (effects.js:1110), the sprite cache and the relief pass all exist for the Leviathan.

### The frame and the marginalia

- [ ] **TABULA STELLARUM — the star table in the right flank** `large effort` — src/frame.js buildFrameLayer, inside the `if(wide)` block below the MAGNITUDINES key (currently frame.js:265-283), filling the 552px void down to the scale bar. The live inking has to sit outside the cached layer and be redrawn per frame like the side-scale numerals in drawPlateFrame (frame.js:358-364), keyed off world.constellations. Note this earns nothing on the 430x932 reference sheet, so it should be scheduled after the phone-side magnitude legend, not instead of it.

  A ruled table filling the right flank on wide sheets, headed with the name of the constellation currently under the pen, set in four narrow columns: the Greek letter, the magnitude sign, a short Latin position word (in capite, in humero, ad pedem), and a tick column. Each row is engraved blank — a ruled line with empty cells — and inked glyph by glyph through the existing writeText pen at the moment its star is classified (renaissanceStarClassified, figures.js:24). When a chart completes, the table rules off with a heavier line and the next constellation's head is cut beneath it; three or four fit the flank before it scrolls. The magnitude column uses the same six signs as the MAGNITUDINES key, so the key finally has something to key.

  *Historical basis:* This is literally what Bayer's Uranometria is: every plate faces a table of its stars, one line each, carrying the Greek letter Bayer invented for the purpose, the magnitude class, and a positional description — 'α, in humero dextro, mag. I'. Hevelius and Bode continue the practice; Doppelmayr and the later planispheres set the table beside the figure rather than on the verso when the sheet is wide enough. It also makes the sheet's most-repeated Latin word, URANOMETRIA, mean something.

- [ ] **A strapwork cartouche for the impressum** `medium effort` — src/frame.js drawImpressum (frame.js:721-741), replacing the two burinRect calls; the strap geometry can be factored out of frameStrapwork so both callers share one routine. This should land with the DOM-impressum fix, since the two occupy the same strip.

  Replace the impressum's plain double rectangle (frame.js:728-729) with a proper Augsburg cartouche: a strapwork frame with rolled and pierced volutes at the four corners, a curled terminal at top and bottom centre, and the nine rows set inside it. Reuse frameStrapwork's vocabulary — the paired edges, the pierced lozenge, the curled terminal — at a larger gauge, so the cartouche and the corner ornaments are visibly by one hand. The blank waiting rows keep their short rules, which then read as a form ruled up inside a cartouche rather than as a table with holes.

  *Historical basis:* No imprint of 1600 sits in a bare box. The strapwork cartouche — leather-strap forms rolled, cut and pierced — is the Northern-Mannerist ornament of exactly this decade and exactly this city; Augsburg and Antwerp printers set every title, dedication and imprint in one. The game already draws strapwork as a catalogue frame ornament (frame.js:80-107), so the hand exists and only the gauge changes.

- [ ] **A nocturnal set beside the compass rose in the left flank** `medium effort` — src/frame.js, a new painter called from the `if(wide)` block near frame.js:259, below frameCompassRose's own 3r footprint.

  A small nocturnal — the instrument you actually orient a night sheet with: a graduated outer ring of the twelve months, an inner hour ring numbered I–XII in Roman, a long index arm with a filed point, and a central sighting hole. Set in the left flank below the rose, at about the rose's own gauge, so the flank carries a pair rather than a solitary ornament. Its hour ring uses the same Roman numerals sphereGraduation already cuts (frame.js:409), so the two flanks agree in notation.

  *Historical basis:* A nocturnal is the period's own answer to "which way is the sky facing tonight" — a paper or brass instrument for reading the hour off the pointers of the Bear. Apian, Blagrave and the volvelle-makers all cut them, and ORBIT already draws a volvelle (frame.js:512-552), so the mechanical vocabulary is in hand. Setting it *beside* the rose rather than replacing it is deliberate: README.md:129 and :139 document the rose and its four winds as shipped furniture, and the four winds blowing into a circle set in a square is itself a real celestial-planisphere convention, so the rose should stay.

- [ ] **Plate tone: the printer's wiping streaks across the whole sheet** `medium effort` — src/backdrop.js, in paintPaperBackdrop (ending at backdrop.js:138) and paintNightBackdrop (ending at 166), replacing or supplementing the closing vignette so the two are not doing the same job twice. It pairs with the plate-mark finding: the tone should stop dead at the mark.

  A pass of long, very faint diagonal streaks running corner to corner across the entire sheet at one fixed angle, denser toward the edges and corners and thinning to nothing through the middle — the film of ink the printer's rag failed to take off. Painted once into the cached backdrop at a lower amplitude than the laid wires, and tinted by the plate transform so the verdigris sheet is wiped green and the sepia sheet brown. On the derived plates the angle stays the same, because it is the same printer.

  *Historical basis:* Plate tone is what makes two impressions from one plate different objects. The rag wipes diagonally, so the residue lies in one direction and pools at the edges where the bevel holds it; connoisseurs read a state off it. ORBIT currently does this tonal job with a radial vignette — backdrop.js:137-138 on paper and 165-166 at night, both createRadialGradient falloffs — which is a photographic device, a lens effect, not a printing one. The streaks would do the same work while being the right kind of mark, and would give the derived plates one more thing they share as one press rather than one filter.

- [ ] **A margin of trials: the engraver's own scratches outside the plate mark** `small effort` — src/frame.js buildFrameLayer, in the band outside the plate mark drawn at frame.js:220, seeded from plateName so a plate's trials are stable across resizes. Note the band is only band*.2 = 2.8 CSS px deep on a phone, so this reads on wide sheets and needs the plate mark pulled in slightly to work in the hand.

  Three or four tiny burin trials pricked into the sheet outside the plate mark — a short hatched patch, a test of a curve, a slipped stroke, a compass pin-prick — placed asymmetrically, seeded per plate so each plate keeps its own, printed at the faintest weight on the sheet. On the 'Ante litteras' proof they are heavier and more numerous, and one of them is a trial of the very magnitude sign the plate uses.

  *Historical basis:* Engravers tested the burin and the bite in the margin of the copper, outside the area that would print as the image but inside the plate; those trials print with every impression and are one of the surest signs of an early state. A proof before letters is precisely the state where you see the most of them. It costs almost nothing and gives the frame a second register — marks the engraver made for himself, beside the marks he made for the reader — which nothing on the sheet currently has.

### Lettering, faces and the Latin

- [ ] **The twelve figures lettered in Latin, Bayer's way** `medium effort` — src/simulation.js:164-177 (add `latin` to each entry), src/figures.js:804-805 (set Latin, then English gloss), src/ui.js:377-379 (the Asterismi table), and the completion inscription at src/ui.js:87.

  Give each of the twelve constellations a Latin name and set it on the chart as the primary caption, with the English dropping beneath as an italic gloss at about two-thirds the size — the same two-register pairing every card in the catalogue already uses. ACUS · VELUM · LYRA · CORONA · CIRCINUS · CLEPSAMMIA · SERPENS · ARGO · ASTROLABIUM · PENNA · LATERNA · PHALÆNA. The Latin sits in the small-caps face as the sweep reveals the figure; in the catalogue it fills the `.cat-latin` slot the Asterismi table is currently the only table on the leaf to lack.

  *Historical basis:* docs/archive/eras/05-engraving.md:96 states the intent already: 'Captions are lettered in Latin, as Bayer's own plates are.' Uranometria letters all fifty-one plates with the Latin figure name in a banderole, and Bayer's whole innovation is a fixed repeatable Latin naming convention for the sky — the reason the book is the controlling document. Lyra and Corona are Ptolemaic under exactly these names, Argo Navis is one of the original forty-eight, Circinus and Horologium are later but real, and Clepsammia is genuine late Latin for an hourglass. Two of the twelve words are already in the codebase under other headings: Phalæna at ledger.js:113 and Penna as the obvious pair to the Quill.

- [ ] **The score printed twice — Arabic, then Roman** `small effort` — src/index.html:105 (`#end-score`) and the update at src/ui.js:244; `roman()` already exists at src/ephemeris.js:13-17.

  Print the run's score in Fell figures at a size where the old-style forms behave (60-80px rather than 84-120), and set the same number in Roman beneath it in small caps at about 13px: '1775 · MDCCLXXV'. The Roman line carries the display weight the Arabic can no longer bear at that size, and it is the atlas's own voice saying the number.

  *Historical basis:* Early printed books routinely give a date twice, once in figures and once in Roman or in words, precisely because figures are unreliable at a glance. The impressum on the frontispiece already does exactly this two screens earlier with ANNO MDCIII (frame.js:692), so the convention is established before the player ever sees the colophon. It also fixes the confirmed legibility failure: '1775' at 84px reads as four unrelated letterforms in 15-colophon-night-phone.png.

- [ ] **A cut mark for nothing, generalised from the two places the atlas already cuts it** `small effort` — src/ui.js:348 (pressure rows), src/ui.js:374-379 (Feats and Asterismi tables), src/ui.js:251 (`#end-constellations`, which should read 'no constellations traced'), reusing the `.cat-blank` rule at src/index.html:321. Note README.md:169 commits to the untraced row staying in the list, so this changes only the mark inside the row, not the row.

  Give the atlas one mark meaning 'nothing recorded' and use it in every table where a count can be nil: a short ruled hairline, or the em rule, where a figure would otherwise stand.

  *Historical basis:* A ledger rules a blank rather than writing a nought — the nought is a value, the rule is an absence, and the distinction matters in a book of accounts as much as in a star catalogue. Crucially, this atlas has already invented the mark twice and simply not generalised it: the ephemeris rules a hairline in the square of a day nothing was drawn on (`.eph-rule`, index.html:444, ephemeris.js:66), the impressum rules a hairline across an unearned row (frame.js:735), and `roman()` at ephemeris.js:16 already returns '—' when handed zero. Three independent decisions, all the same decision, none of them reaching the tables where it is most needed: 06-catalogue-end-night.png prints eleven lowercase o's in a right-aligned numeric column.

- [ ] **MAGNITUDINES on the phone** `medium effort` — Extract the key painter from src/frame.js:268-282 and draw it into `.pause-leaf` (src/index.html:594) or onto the canvas behind it while `world.state==='paused'`.

  Fold the magnitude key into the pause slip: the six star forms at the gauge the chart punches them at, six Roman numerals beside them, and the ghost rows for classes the run has not yet classified — the same drawing `buildFrameLayer()` already makes, at a size a thumb can read. It appears when the press stands idle, which is exactly when a reader consults a key.

  *Historical basis:* The magnitude key is the piece of marginalia that makes Uranometria what it is: the legend for the fixed repeatable convention the whole book is built on, and Bayer prints it on the plate. Confirmed gated off on the target viewport: src/frame.js:256 opens `if(wide){` and the key at frame.js:268-282 sits inside it, alongside the compass rose, the scale bar and the engraver's line. On 430×932 — the sheet the game is actually read on — the atlas's best Latin marginalia never appears at all.

- [ ] **Planetary signs at the head of the ephemeris columns** `medium effort` — src/ephemeris.js:60 (the `.eph-head` loop) and 62-71 (the day cells), with a small glyph painter alongside `starGlyph()` in src/plates.js. Currently rendering as SOL LUN MAR MER IOV VEN SAT in 90-ephemeris-night-phone.png.

  Replace the three-letter truncations SOL/LUN/MAR/MER/IOV/VEN/SAT with the seven planetary symbols cut as small burin glyphs — ☉ ☽ ♂ ☿ ♃ ♀ ♄ — drawn rather than set, since every form is already in the codebase's hands (`starGlyph`, `burinArc`, `burinSegment`, and the ragged terminator in `paintEngraving` for the crescent). Optionally a small filled-to-hollow disc in each day's corner for the moon's age.

  *Historical basis:* Every printed ephemeris and almanac of the period — Stadius, Origanus, Magini — heads its weekday columns with planetary signs rather than letters. It is the single most recognisable piece of almanac furniture there is. 'IOV' as an abbreviation of *Iovis* is a spreadsheet's habit; the sign of Jupiter is what a reader of 1603 would look for. Drawing rather than setting them is also the only option here: the build fails on any external resource, and the Fell subset holds no astronomical symbols.

- [ ] **A colophon that closes in Latin** `small effort` — src/index.html:585-592 (`.colophon`, after `#end-exlibris`), reusing `impressumDevice()` from src/frame.js:709 as a small inline canvas.

  Strike the shop's device and a closing formula at the foot of the colophon leaf once the run is entered in the ledger: the device `impressumDevice()` already cuts (frame.js:709-714), with FINIS beneath it in small caps, or LAVS DEO on a perfect chain. Revealed last, after the observation line, the way `#end-observations` already animates in at index.html:491.

  *Historical basis:* The colophon is the one page a period book ends in Latin — the word itself is the finishing stroke, and FINIS, LAVS DEO or the printer's device closing the last gathering are the standard forms. Confirmed in 15-colophon-night-phone.png: the leaf currently carries no Latin except the three feat names and EX LIBRIS, while the frontispiece two screens back carries a Latin subtitle and a nine-row Latin imprint. The book opens in Latin and shuts in English.

- [ ] **The sun's place on the ephemeris head** `small effort` — src/ephemeris.js:75, `title.textContent=MONTHS_LATIN[ephMonth.m]+' · '+roman(ephMonth.y)`. Needs a low-precision solar longitude from the UTC date — a dozen lines, not trivial, and it must stay off the simulation's RNG the way the rest of this file already does.

  Extend the month line from 'SEPTEMBER · MMXXVI' to 'SEPTEMBER · MMXXVI · ☉ IN VIRGINE', with the zodiac sign cut as one small glyph beside the Roman year. One line, one glyph, and the leaf stops being a calendar in Latin dress and becomes an ephemeris.

  *Historical basis:* The sun's place in the zodiac is the first column of every printed ephemeris of the century — it is what the genre is for. Both 'in Virginem' (entering) and 'in Virgine' (standing in) are attested table headings.

### The planets as hand-coloured specimens

- [ ] **Explicatio figurarum — a marginal index of the seven worlds** `medium effort` — frame.js, alongside the MAGNITUDINES key block at frame.js:268-282 for wide sheets; the colophon for the phone. Miniatures come free from the glyph cache (planets.js:518-521).

  A small ruled table in the sheet's margin listing the seven species: a 14px miniature of each body, its figure numeral and its Latin name, each row ghosted at low alpha until that species has first been documented in the run and inked at full strength once it has. On a wide sheet it sits on the left flank opposite MAGNITUDINES; on a phone, where there is no flank, it is printed on the colophon as the run's own index, filling in across the run and standing complete at the end. I would add one thing the auditor did not: draw each miniature from the *actual cached glyph* of the body that was documented, not a generic one, so the index is a record of this run's specimens rather than a legend.

  *Historical basis:* Every plate in Bayer, Blaeu, Hevelius and Cellarius carries an explicatio or index of figures, and Uranometria's plates carry a lettered table keyed to the stars figured on them. The atlas already speaks this vocabulary fluently: the MAGNITUDINES key does exactly this job for the star glyphs, including the ghosted-until-earned state, and README:145 documents that convention.

- [ ] **A lettered specimen — the body gets a name when the observation closes** `medium effort` — reveal.js, in atlasFlourish/drawAtlasFlourish (reveal.js:362-378), set with textAlongArc (marks.js:146-177) and laid down glyph by glyph by writeText (reveal.js:538-556); persisted on the node the way n.documented already is. Two collisions to design around, both verified: the release construction's letters and bearing numeral already occupy the disc and its inner radius (effects.js:407-420), and for the ringed family the survey arcs and the completion ring both sit at core*1.98 (planets.js:249, reveal.js:373) — the caption must be set outside all three.

  At full observation a Fell italic caption is written along the outside of the orbit ring, glyph by glyph in the pen's own hand: a figure numeral and a Latin species name — Terra aquosa, Luna cavernosa, Globus ansatus, Orbis glacialis, Terra arida, Terra ignea, Globus fasciatus. It stays on the sheet after release, so a finished chart reads as a lettered plate rather than a field of anonymous circles, and it is the visible payoff for holding an orbit to 240° instead of leaving at the first tangent.

  *Historical basis:* This is simply what a printed atlas does: nothing is figured without being named. Bayer letters every star, Hevelius letters every lunar feature, and a plate's figures are always keyed to a caption. README:133 already makes identity the thing the observation clock buys, so gating the name on `documented` reaching 1 is the atlas's own logic rather than a new rule.

- [ ] **Saturn resolving — the ansae opening into a ring** `large effort` — planets.js paintPlanetRings (128-147) and the ringed half of paintPlanetSurface (60-75), staged through the existing pen.d clock in reveal.js:280-348. If only one thing is done, delete the division at planets.js:133 — that is a one-line change and it removes the single most anachronistic mark on the plate.

  Redraw the ringed body's escalation as the century actually experienced it. At the phenomenon and early-observation stages it is Galileo's tricorporeal Saturn: a central disc with two attached lobes growing from the limb, no gap and no annulus. Around d≈0.6 the lobes detach at the limb and thin. Only at d=1 does the figure open into a true ring — a hairline ellipse, one band, no division — and take a dated caption.

  *Historical basis:* Sidereus Nuncius, 1610: altissimum planetam tergeminum observavi. The handles vanished in 1612 and returned; Huygens closed the question in 1659; the division is Cassini, 1675. The atlas already draws the correct 1610 figure in its own margin (celestial.js:488-494) and already stakes an unlockable observer mark on the ansae reading (README:159), so this makes the gameplay body agree with two marks the sheet already carries rather than importing a new authority. Note this is justified by the shipped atlas's own internal evidence, not by the archived era ladder.

- [ ] **The colourist's overrun, laid as brush patches** `medium effort` — planets.js glyph (522-585) and drawPlanet (598-631), borrowing paintHandColour's stroke model from figures.js:267-300 (verified present). Requires the clip-order fix first, or the patches will be cut back to the disc on four of seven families exactly as the wash is now. Keep the per-stroke jitter inside README:56's one-to-two-pixel budget.

  Replace the flat wash disc with the model the constellation figures already use: lay the body colour as six to ten brush patches with rounded, loaded starts, each offset by the body's frozen impression plus a per-stroke jitter scaled by how rough the landing was, deliberately running past the keyline on the offset side and leaving bare sheet showing on the other. A perfect tangent keeps every patch inside the printed figure; a radial strike leaves colour visibly outside the line.

  *Historical basis:* Hand-colouring was a separate trade — the Briefmaler or illuminator worked fast, after the press, often years later and in a different town, and the register is always a little out. That gap between the engraver's line and the colourist's brush is the most characteristic thing about a coloured Renaissance plate, and README:56 already commits the atlas to drawing it.

- [ ] **Comparatio magnitudinum — the bodies at true relative size** `small effort` — frame.js, right flank beside frameScaleBar (209-215), wide sheets only. This is the only place the size hierarchy can ever be legible: a body's drawn radius on the chart is core*(n.r/60)*scale (figures.js:947, planets.js:600), so it is tied to the orbit rather than to the world, and the registered sizes only span 21-29 for the seven worlds (backdrop.js:247-253).

  A narrow ruled strip in the margin showing the seven species' discs drawn to their true relative diameters against the sheet's own Scala, with the currently orbited body picked out. Each disc is bare until that species has been documented, then filled with its own hatch.

  *Historical basis:* Comparative-diameter plates are a standard early-modern device, from Riccioli's Almagestum Novum onward, and are the natural companion to a magnitude key. The frame already carries both a Scala bar and a MAGNITUDINES key (frame.js:209-215, 268-282), so the marginal grammar exists and this asks for no new idiom.

### Colour, ink and the plate system

- [ ] **Explicatio colorum — a marginal key to the plate's own inks** `medium effort` — src/frame.js, in the `wide` branch of buildFrameLayer() beside frameScaleBar() and the MAGNITUDINES block (frame.js:209-282). SCOPE CORRECTION: the auditor proposed a compressed row across the phone's running head. Do not — every existing key of this kind is gated behind frameWide() (W>780), and CLAUDE.md's target-viewport rule makes the phone the sheet that must not gain furniture. Wide sheet only; the phone gets nothing.

  A small engraved legend in the wide sheet's right flank, in the manner of the MAGNITUDINES key already cut at frame.js:270: five or six ruled rows, each a short specimen stroke in one of the plate's role inks with its name set beside it in italic small caps — 'Prussica · errantes' for drift, 'Rubrica · periculum' for danger, 'Ochra · lucrum' for gold, 'Atramentum · manus' for the player's own line. Rows fill in as the reader first meets each role, the way the magnitude key already ghosts unclassified classes. On the modern plate the same furniture becomes a channel legend, which is what that plate has been asking for all along.

  *Historical basis:* An 'explicatio colorum' or 'declaratio signorum' is standard furniture on 16th- and 17th-century hand-coloured maps and atlases — the colourist's key telling the reader what the tints mean, printed or written into the margin. Ortelius, Blaeu and the Dutch atlas trade all carry one.

- [ ] **A rubricator's pass over the chapter heads** `small effort` — src/frame.js drawRunningHead() (frame.js:616+), the chapter head painted from definePlate('dark')'s chapterLabel/chapterRule/chapterDiamond (effects.js:27), and the ecliptic arc in the graticule painters below sphereMeasure() (frame.js:380-401).

  Give the paper plate a genuine rubrication hierarchy rather than one alarm accent: a red paragraph mark and a rubricated two-line initial on the chapter title ('THE DRIFT'), a red rule under the running head, and the ecliptic picked out in red on the construction sphere — all in the same iron-earth red the failure state already uses, so the plate's one accent becomes a system with three weights instead of a single loud ring.

  *Historical basis:* Rubrication is the oldest and most consistent second-colour convention in the printed book — red initials, red paragraph marks, red rules — and in printed astronomical plates specifically the ecliptic and the zodiac band are picked out in red. 05-engraving.md's palette table already names the pigment for it: 'Vermilion accent, paper ground #A63A28 — a rubricated caption or hand-coloured garment, spent sparingly against the sheet's own brown', and #A63A28 is exactly marks.js:33's nodeFading '166,58,40'. The colour is already declared and already correct; what is missing is anywhere else for it to belong.

- [ ] **The catalogue and ephemeris as leaves of the atlas** `large effort` — src/index.html .catalogue-leaf (index.html:349), .colophon (index.html:99) and the ephemeris leaf, fed by a sheet patch exported from paintBackdrop()/laidPaper() at syncPlate() (plates.js:481). SCOPE CORRECTION: the auditor also proposed rebuilding the unlock rows as a ruled table with leader rules. That already exists and is well set — see the CHRONICLE tab in 04-catalogue-paper.png. Do not rebuild it; only give it a sheet to sit on.

  Rebuild the catalogue, colophon and ephemeris panels as real sheets: the plate's own ground behind them, a burin plate-mark and double rule as the border instead of a 1px CSS box, laid wires and chain lines running under the type, and a foxing pass on the foxed plate. The tab strip becomes three ruled headings rather than three buttons.

  *Historical basis:* The catalogue is, in the fiction, the atlas's own index and colophon — the two leaves of an early printed book most likely to be set with a full apparatus, and there is no version of a 1603 atlas in which the index is the one leaf printed without a plate-mark. The ephemeris is a calendar table, which is the single most printed page-form of the century.

### The dark, the comet and the hazards

- [ ] **The mark the dark leaves** `medium effort` — src/ui.js:148-151 (the `burst`+ring branch, for `THE DARK CAUGHT UP` only); the drawing reuses `inkSplat` with `spray` pointing up the sheet, or a small `drownMark()` beside it in src/effects.js.

  When the flood takes the traveller the sheet keeps nothing — sparks fly, the page flashes, and the colophon covers it. Give the moment ink: at the waterline, a blot of the run's own `trailInk()` spreading upward from the point of loss, the pen's last few trail segments drowned in it, and a short crown of the flood's own bleed threads wicking up over the spot as though the spill had climbed to swallow the line. It dries from `blotWet` to `blotDry` over about a second and stays on the sheet under the colophon leaf, so the last thing the plate shows is where the ink won.

  *Historical basis:* Nothing borrowed — this is the sheet's own idiom, already fully invented and argued in `inkSplat` (src/effects.js:1332-1400) for the death off the side of the chart, whose comment states the thesis outright: 'A run lost off the side of the chart is not a burst but a spill.' The point is that the atlas answers its two commonest losses in one language.

- [ ] **A cut comet** `medium effort` — src/celestial.js:615-619, the comet branch of the ambient draw.

  Replace the gradient streak with a struck comet in the plate's own hand: a punched head on a small reserved disc, a coma of ten to twelve short radiating hairs leaving the coma's limb rather than the nucleus, and a tail of six tapering `burinSegment` strokes that fan, lean off the axis and break as they go — drawn on by the pen over about a second with the nib riding the tail's leading edge, held, then lifted. Keep it quiet and keep every one of the existing clearance rules; the change is the medium, not the volume.

  *Historical basis:* README:163 already specifies exactly this for the comet observer mark ('a bundle of divergent rays rather than a shape with an outline, as the cometary plates of the century cut one') and src/ui.js:508-527 cuts it. The comet broadsides of 1577 and 1618 draw a comet the same way. I have deliberately dropped the auditor's proposed dated inscription: README:64 makes ambient events things that fade near everything the player is looking at, and a lettered caption would turn a quiet event into an inscription that has to fight the placement solver in src/inscriptions.js.

- [ ] **The vortex as a charted maelstrom** `medium effort` — src/figures.js:1338-1348 (`hazardCoreSprite`) and 1378-1384 (`vortexWhirl`).

  Redraw the vortex so the water turning is the first thing read and the eye is the second. On paper: a pooled blot built with `landContour`, filled at ~0.86 so the laid lines read through the thin middle, with a coffee-ring — the contour re-struck at 0.94r and 1.0r in a darker tone — where the pigment dried at the rim. The three whirl arms roughly doubled in weight and alpha and carried further in, so they visibly wind into the eye rather than hovering outside it. On night, the same arms carry the reach the halo currently carries.

  *Historical basis:* Olaus Magnus's Carta Marina (1539) and the maelstroms on Ortelius's Septentrionalium Regionum are drawn as concentric turning water around a dark eye, never as a filled disc. README:125 promises 'vortices are pooled ink blots', and the code's own comment at src/figures.js:1374-1377 says the mark is meant to read as water turning rather than a disc seen edge-on.

- [ ] **A face for the gust** `small effort` — src/figures.js:1237-1255 (`windSprite`), porting the block from src/frame.js:58-65 scaled to `head`.

  Give the hazard wind-head the frame ornament's own closed eyes under heavy brows, its two cheek swells blown full of wind, and a filled pursed mouth, so the two wind-heads on the plate are demonstrably one engraver's and a 10-21px head still reads as a creature rather than a scalloped hatched circle.

  *Historical basis:* Every margin wind-head of the century — Ortelius, Mercator, Blaeu — is legible at thumbnail size because of the eye and the puffed cheek. The atlas already cuts it correctly once, at src/frame.js:57-65, and README:38 asks the hazard head for 'a cheek puffed round with the breath in it' that the current sprite only barely gives.

- [ ] **The high-water mark the reprieve leaves behind** `medium effort` — src/effects.js — a small ring buffer of high-water rows written when `darknessGrace` first goes positive, drawn in `drawDark` just before `drawDarkMarginalia` (src/effects.js:1229) so the marginalia still ride above them.

  A completed constellation actually drives the flood back — `floorY += 48*respite` (src/simulation.js:873) — and today the only record of it is four seconds of gold that then goes away. Let the retreat leave a stain: at the highest point the ink reached, lay down a dried tide mark in the flood's own pale pigment — a broken, wobbled contour with a faint band of settled fleck below it — and leave it on the sheet in world coordinates for the rest of the run, so it scrolls up and away exactly as an orbit does. A run with three reprieves in it ends carrying three old tide lines up the page, and the player can see how close the dark got each time.

  *Historical basis:* README:125 already lists 'old tide marks' among the things the paper sheet carries, and the flood is built out of exactly that vocabulary — a stain that dries at the level it stopped at is what an old damp-damaged plate looks like. It also gives the reprieve a permanent mark instead of a temporary colour, which is the same instinct that keeps inscriptions on the sheet as ink rather than fading them out (README:68).

- [ ] **MACULA and VORAGO, lettered** `small effort` — src/figures.js `drawFlare` / `drawWind` / `drawHazard` — but route the placement through the inscription solver in src/inscriptions.js rather than drawing it on the hazard directly, because README:68's 'nothing printed over the plate shares a line with anything else' is already being broken in this exact band (see the DRACONES finding), and a caption welded to a moving hazard cannot honour it.

  The hazard table already names all three in Latin (src/simulation.js:217-219) and nothing on the sheet ever prints those names. Letter each hazard as a node's rim caption is lettered: `VORAGO` round the outside of the vortex's whirl, `MACULA` beside the sunspot's limb, `VENTUS` under the gust's mouth — small caps at the caption size, written on by the pen as the hazard reveals, and skipped on the proof plate with every other piece of lettering.

  *Historical basis:* Scheiner's Rosa Ursina letters every spot group, and every chart of the century names its whirlpools and its winds. The atlas already letters constellation names round an entry star's rim and wind bearings on wide screens, so the hand exists (`textAlongArc`, src/marks.js:146-177).

### Constellation figures and the burin line

- [ ] **TABULA ASTERISMORUM — the plate index of the twelve figures** `large effort` — src/ui.js catalogue, as a fourth tab beside RECORD/CATALOGUE/INSIGNIA. Today the twelve names are bare text rows with counts in the Chronicle tab — confirmed in 06-catalogue-end-night.png, which is the only place in the whole game the twelve figures are enumerated and not one of them is drawn.

  A fourth section in the catalogue: the twelve figures struck as small proof impressions in a 3x4 grid, each drawn at a canonical proportion rather than the run's stretched fork geometry, each with its three stars in place, its name lettered beneath in small caps, and the number of times it has been traced. Untraced entries print as the bare three-star asterism inside a dotted frame — the plate not yet cut. Traced entries print in full in whichever hand is equipped, so the catalogue becomes the one place the hand cosmetic can actually be compared. NOTE this cannot 'reuse buildFigureLayer directly' as first proposed: the figures' off-spine reaches are absolute constants against a 520-600 unit spine, so a square synthetic chart would blow every figure out of its box. It depends on the figBox rewrite in the ribbon finding, and should be built after it.

  *Historical basis:* Every plate-book of the period carries an index of its plates: Bayer's Uranometria opens with its table of the tabulae, Hevelius's Firmamentum Sobiescianum lists and numbers its figures. The 'proof before letters' plate already in the catalogue is the same idea from the other end.

- [ ] **The completion vignette — the figure struck once at proper proportion** `medium effort` — src/figures.js drawConstellations, the `chart.completed && chart.flash>0` branch at figures.js:783-793, drawn through the same cached-layer machinery with a square synthetic frame. Same dependency on figBox as the plate index above.

  When a chart completes, print the figure once more as a small margin cut beside the third star: about 120x100px at canonical proportion, inside a light cartouche with the chart's name across the top and '+60' below, held for the length of the existing flash and then wiped by the pen. This is the one moment the player has earned the right to see the whole drawing, and given how the tall fork geometry crops the figure in play it may be the only time they ever do. It is currently spent on two lines of type.

  *Historical basis:* The inset vignette in the margin of a chart, showing at a glance what the scattered stars are meant to be — used throughout the period and the direct ancestor of the modern star-chart inset.

- [ ] **The figure's own name lettered across the figure** `medium effort` — src/figures.js, a new branch in drawConstellations beside the entry-star caption at figures.js:775-782, using writeText with the existing HUD/frame guards.

  Set the chart's name across the figure's widest point at the middle star — italic, horizontal on the sheet rather than rotated along the spine, broken where it would cross a star punch, revealed with the same sweep the figure is. It arrives with the third star, so the naming and the completion are one event; the caption at the fork's entry stays for the unfinished chart.

  *Historical basis:* Bayer letters the constellation name across the figure itself on nearly every plate of the Uranometria, in a large italic sitting over the body; Hevelius does the same in Latin capitals. It is the single most characteristic piece of typography on a plate of this period and the atlas currently has none of it. Setting it horizontally rather than along the near-vertical spine matters — rotated vertical captions across a figure are not a mark of this period.

- [ ] **The colophon's row of traced devices** `medium effort` — src/frame.js drawImpressum and the colophon screen. Confirmed as plain type with no drawn art in crops/v-colophon.png, which shows a 33-row run closing on the line '0 constellations traced' and nothing engraved anywhere on the sheet.

  On the end sheet, replace the bare '0 constellations traced' line with a row of the run's traced figures pressed as small devices — each about 34px, in the plate's ink, struck in the order they were completed, with the count set in small caps beneath. A run that traced none shows the empty rule, which is its own reproach.

  *Historical basis:* The printer's device and the row of small emblems at the foot of a colophon page — the press signing off with the marks it cut. AUGUSTA VINDELICORUM / EX OFFICINA ORBIS TABULAE is already there; the devices are what belongs beside it.

### The living pen and the act of drawing

- [ ] **The burin head: a second instrument for the engraved register** `medium effort` — src/reveal.js, a new function beside penNib (reveal.js:160), plus a tool argument threaded through penWedgeEnd (198), revealHazard (394), revealFigure (445) and revealFrame (504). ink.reveal gains `graver` and `groove` tokens (reveal.js:14-20) so each plate names its own tool colour. It should land after the single-nib claim, so there is one tool per frame and it is the right one.

  A `burinHead(x,y,angle,alpha)` beside penNib, used wherever a mark is described as cut rather than written — the frame's double rule, orbit rings, planet keylines, constellation figures, hazard arms, capture ripples. No bead and no spatter: a short lozenge point at the cut, a curl of swarf thrown forward off it (two or three tightening hairline arcs, seeded, falling away within ~0.25s), and the freshly cut groove carried one value brighter than the finished line for about 20px behind the tool, drying back as it moves on. Route it by a `tool` argument on the reveal call sites; keep the quill nib for the manuscript register — inscriptions, surveys, floaters, the trail, the impressum — which is genuinely pen work.

  *Historical basis:* Bayer's Uranometria plates were cut in copper by Alexander Mair; Hevelius cut his own. A burin is pushed through metal and throws up a curl of swarf, leaving a V-groove that swells where the tool bit deeper — exactly what marks.js's burinArc/burinSegment already model (variable width, wobble, skips where the tool lifted). The one thing a graver never leaves is a bead of wet ink. VERIFIED: the game already owns the instrument — ledger.js:122 lists "Engraver's burin / Scalprum" as an earned observer mark, and it is drawn in full at ui.js:565-573.

- [ ] **The chalk stub, and the setting-out laid before the ink** `medium effort` — src/marks.js engravedRing (191-220), which needs a progress argument rather than a baked constant; and src/reveal.js, where the un-taken ring's arrival is currently the wedge alone. Paper plates only — do not invent a night-side twin, see below.

  A blunt red-chalk instrument — no point, no bead, a granular broken line that skips on the tooth — and a reordering so the sanguine underdrawing is laid a beat BEFORE the ink rather than baked invisibly beneath it. On paper an un-taken orbit would arrive as: chalk arc, off true and open, over ~0.35s; then the ink sketch pass over it; then, when the orbit is taken, the cut ring closing over both (see the capture-wedge finding above), with the chalk left showing wherever the two disagree.

  *Historical basis:* Red chalk setting-out under a pen or ink drawing is standard sixteenth-century workshop practice and is what an engraver's preparatory drawing looks like. VERIFIED: the game already cuts it and the player never sees it laid — marks.js:198-202 lays a broken sanguine arc a little off true under every paper ring, and planets.js:559-561 lays two more under every paper planet keyline, both baked into the sprite at a fixed constant.

- [ ] **The correction: a plate that has been wrong** `small effort` — src/ui.js:57 where `badAngles` is tallied, firing a permanent mark recorded the way `struck:` already is, drawn through penStrike's existing machinery (reveal.js:383-392) at the capture band rather than across the whole orbit.

  When the run records a rough impression — a steep, badly-angled arrival — let the pen cross out the offending arrival on the chart once, on the frame it happens: two quick hatch strokes over the capture band it came in on, and a small marginal query mark in italic beside it, drawn on and then left there permanently as ink. Gated to once or twice a run.

  *Historical basis:* Working star atlases are full of corrections, deletions and queries; Bayer's own plates carry them, and Tycho's and Hevelius's manuscript charts more so. VERIFIED and RESHARPENED: the impressum already prints '* CORR.' (frame.js:695) and its condition is `impressumHasRoughImpression()` (frame.js:676-680) — `ledger.badAngles>0 || runTally.badAngles>0`, tallied at ui.js:57 on `e.steep`. So the sheet already promises a correction notice for exactly this event and the chart carries no mark for it: the only splat in the game is the death splat at ui.js:147, which is a different thing. Tie the drawn correction to `e.steep`, not to an abandoned observation as the auditor proposed — that way the impressum row and the chart mark are the same fact.

- [ ] **The press: the frame arriving as an impression, not as a drawing** `medium effort` — src/reveal.js revealFrame (504-521), replacing penDashRect and the settle crossfade entirely. It also resolves the triple-composite finding above outright, because there would be nothing left to composite twice.

  Replace the frame's pen reveal with the pull of a press. The plate-mark presses in first — the outer rectangle embossing over ~0.25s with a hairline of raised paper along its inner edge and a faint bruise outside it — then the whole engraved layer lands in one roll from top to bottom over ~180ms, arriving very slightly off register and creeping into register as it settles. No nib anywhere on it.

  *Historical basis:* A rolling press lays the whole copper plate in a single pull; a printed sheet never appears line by line, and the plate-mark, the slight off-register and the dampened-paper cockle are the three things that say 'this was printed' at a glance. The game already models the plate-mark (frame.js:220-221) and a registration offset (`impression`, threaded through reveal.js:330 and planets.js), but only as static facts. NOTE HONESTLY: this changes a documented behaviour — README:133 specifies 'the double rule by dash offset, then the graduated ticks around the perimeter, then the marginal ornaments' — so it needs the spec amended alongside, not slipped in.

### Screens, HUD and the interface as printed matter

- [ ] **The speaking-trumpet, actually cut as a speaking-trumpet** `small effort` — src/index.html:632-634, replacing the three `#sound` paths. The auditor proposed a wind-head instead — I refute that: README:86 names the speaking-trumpet, and the wind-heads already sit in all four frame corners (frame.js:47 frameWindHead, visible in every screenshot), so a fifth at 21px would repeat a motif the frame owns.

  Replace the loudspeaker at index.html:632-634 with the object README:86 already says it is: a long tapering tube in three-quarter view, narrow mouthpiece at the lower left, flared bell at the upper right, one hoop band round the throat, drawn with two or three swells per stroke rather than one uniform 1.1px hairline. Sounding: three tapering breath strokes issue from the bell. Silent: the strokes are gone and the bell is drawn stopped with a single closed bar. Keep the existing `.mute-mark` / `.sound-wave` class swap so the muted logic is untouched, and add the `transform="translate(.5,.4)" opacity=".3"` ghost pull every other mark in the row carries.

  *Historical basis:* The speaking-trumpet is the century's own instrument for carrying sound — Kircher's Phonurgia Nova and Morland's tuba stentorophonica figure it exactly this way, and it is already the object the README chose. The current path is instead the canonical 20th-century loudspeaker silhouette, so this is not a new motif at all; it is drawing the one that was decided on.

- [ ] **The sheet, actually cut as a sheet** `small effort` — src/index.html:672-678, keeping the existing `.plate-night` / `.plate-paper` class swap at index.html:96-98 so the state logic is untouched. The auditor proposed a lunar phase roundel here; I refute it — the button switches ground, not time of day, and the moon is already spoken for as an earnable observer mark (ui.js:575-591, README:159).

  Replace the dog-eared document at index.html:672-678 with a laid sheet seen at a slight angle: one long deckle edge, two chain lines running the short way, a faint lift at the near corner. Night state prints the sheet with three short rules of engraved lettering on it; paper state leaves it blank with only the chain lines. The mark then answers the actual question the button asks — which ground is this plate printed on — rather than asking the reader to decode a file icon.

  *Historical basis:* README:86 already names this mark 'the sheet'. What is drawn is the 1984 Macintosh document with a folded corner, plus an ink blot. A laid sheet with chain lines and a deckle is the object itself, and the game already generates exactly this texture in `laidPaper()` (plates.js:543), so the mark and the ground it stands for are cut from one idea.

- [ ] **Register crosses for the fullscreen mark** `small effort` — src/index.html:681-686, replacing the `#fullscreen` paths. The state change is pure CSS on the existing `aria-pressed`.

  Replace the four corner brackets at index.html:681-686 with the printer's register cross: a fine cross inside a small circle, cut at each of the four corners of a small sheet outline. Pressed (fullscreen), the crosses move out to the corners of the frame and the sheet outline drops away; released, they draw back in. Give it the same off-register ghost pull the other marks carry — it is currently the only mark in the row with none.

  *Historical basis:* Register or point-hole marks are genuine trade apparatus of exactly this period, cut into every plate that took a second pull, and they are the reason two impressions line up. That makes them the one honest period answer to 'make the sheet fill the frame', and it closes the gap README:86 leaves open when it says every mark in the row is an object the century had — the four corner brackets are a 1990s video convention and are not an object at all. The frontispiece's own compass star (index.html:527-533) is already close to this shape, so the mark would rhyme with the title cartouche.

- [ ] **Planetary column heads and a lunar column for the ephemeris** `medium effort` — src/ephemeris.js — the heads where `name.slice(0,3)` is uppercased, and the cell builder beside it — with a small `moonPhase(date)` helper. One correction to the obvious implementation: do NOT set the planetary characters as text. ui.js's own comment above `cataloguePreview` records that a face never cut for a glyph 'falls through to whatever the device keeps for them, which on a phone is the colour emoji font', and ☉ ☽ ♄ are almost certainly outside the Fell subset `npm run fonts` cuts. Draw the seven characters as inline SVG in the plate's caption ink, the same decision the catalogue previews already made.

  Head the seven columns with the planetary characters instead of SOL LUN MAR MER IOV VEN SAT, moving the Latin genitives into the `title` attribute the cells already carry. Then give every square of the month the moon's phase for that day as a small roundel filled from one limb, drawn in the plate's caption ink at 7px: new a hollow ring, full a solid disc, the quarters half filled. Days actually drawn keep their score under the roundel; days not yet come now carry the phase instead of a blank rule.

  *Historical basis:* This is what an ephemeris is. Origanus, Magini and Stadius all head their columns with the planetary characters and rule a lunar column down the page, and the moon's age is the first thing an almanac tells a reader. It also fills the two-fifths of the table currently sitting at `opacity:.13` (index.html:450, visible in 90-ephemeris-night-phone.png) with something honest, and needs no data the game does not have — the phase is a function of the date alone.

- [ ] **A title tablet for the finished plate in review** `medium effort` — src/review.js:69, beside the existing `drawImpressum()` call, drawn with `burinRect`/`burinSegment` from marks.js and `writeText` from reveal.js so it inks on as the review opens. Land it together with the `drawRunningHead()` restoration in the same function, so the reviewed sheet gets both its folio and its signature in one pass.

  When review opens, engrave a strapwork tablet in the lower margin of the reviewed sheet — a shaped cartouche with rolled ends in the manner of the impressum's own device — carrying the plate as a finished impression: TAB. and the chapter reached, the date drawn, the pressure (TIRO / ADEPTUS / MAGISTER), the score, the row, the constellations traced, and the engraver's credit. It rides with the sheet the way the impressum does, so panning up leaves it behind on the opening plate.

  *Historical basis:* Every plate in the Uranometria carries a lettered cartouche naming what it shows and who cut it, and a presentation impression carries its state and date besides. It also answers a confirmed gap: 95-review-night-phone.png has no folio and no identity anywhere on a freely-panning sheet, and the impressum it does carry shows three lines over six blank rules.

- [ ] **MODUS OPERANDI: the instructions as a printed rubric** `small effort` — src/index.html:556 (`#instructions`) and its `.instruction` rule at index.html:78, with the atlas text lifted out of the inline span into the voice map at src/ui.js:26 so a plate can set its own rubric — which is the same move `chrome:` and `held:` already made for every other string in that file.

  Reset the four HOW TO PLAY lines as a rubric rather than four centred sentences: a small-caps head — THE MANNER OF USE, or MODUS OPERANDI — a hairline rule under it, the four rules set left-aligned in a hanging indent with marginal roman numerals i. ii. iii. iv., and a light rule bracketing the block at left. The three pressure names stay rubricated in gold where they appear in rule iv.

  *Historical basis:* The numbered rubric with marginal numerals and a hanging indent is the standard apparatus of every instructional printed book of the period — the 'canones' pages that precede an ephemeris are set exactly this way, telling the reader how to use the tables that follow, which is precisely the relationship this block has to the chart behind it. 09-howtoplay-open-night.png shows the real problem it fixes: four centred sentences of four different lengths, with no left edge for the eye to return to, printed straight across the traveller's orbit and a planet.

- [ ] **The catchword as the way out of every leaf** `medium effort` — src/index.html:610 (`#catalogue-close`), :624 (`#ephemeris-close`) and :591 (`#review-close`), with a shared `.catchword` class replacing `.diff-btn`. Two conditions on keeping it: the catchword must keep an explicit `aria-label` ('Close the catalogue') since the visible word no longer says what it does, and it needs a 44px hit area and a visible hairline rule above it so it reads as actionable rather than as decoration — a corner of italic text with no affordance is a worse target than a chip, not a better one. On review it also solves the corner collision reported above, since the lower-right corner is empty.

  Retire the CLOSE chips on the catalogue, the ephemeris and the review sheet. In their place set a catchword at the lower right of the leaf — a rule above it, then in italic the first word of the page being returned to: 'Orbit.' from the catalogue and the ephemeris, 'Colophon.' from review — with the leaf's signature mark at lower left ('A ij' and so on). The whole lower-right corner becomes the target.

  *Historical basis:* The catchword and the signature are the two devices every book of 1540-1610 carries at the foot of the recto, and they exist for exactly this purpose: to tell the binder and the reader what comes next. It converts the most modern element on three screens into the most period one.

---

<a id="sources-worth-fetching"></a>
## Sources worth fetching

*Specific items the audit named as worth sourcing — not general reading, but things that would settle a specific open question above.*

- [ ] Bamber Gascoigne, 'How to Identify Prints: A Complete Guide to Manual and Mechanical Processes from Woodcut to Ink Jet' (Thames & Hudson, 2nd ed. 2004). This is THE book for this audit: it is built around magnified photographs of single lines, with engraving, etching, drypoint, stipple and every photomechanical process shown side by side at the same magnification. If the user owns or buys one book off this list, it should be this one — it is the direct visual reference for fixing src/marks.js.

- [ ] Ad Stijnman, 'Engraving and Etching 1400-2000: A History of the Development of Manual Intaglio Printmaking Processes' (Archetype/HES & De Graaf, 2012). The exhaustive technical history — inks, wiping, presses, plate preparation, papers. This is where the plate-tone, retroussage and wear questions in my Gaps list would actually be answered.

- [ ] Emily J. Peters, 'The Brilliant Line: Following the Early Modern Engraver, 1480-1650' (RISD Museum, 2009). The exhibition catalogue for the source I could not fetch. It is specifically about engraving as a *mark system* rather than as a history, and it is where the c.1560 swelled-line date and the analysis of Goltzius/Cort/Dürer line systems come from.

- [ ] Antony Griffiths, 'Prints and Printmaking: An Introduction to the History and Techniques' (British Museum Press). The standard short reference; useful as a cross-check on states, editions and the delineavit/sculpsit/excudit convention.

- [ ] A high-resolution scan of one Bayer Uranometria 1603 plate at 600dpi or better — ideally a *coloured* copy and an *uncoloured* copy of the same constellation. Linda Hall Library, ETH Zurich e-rara, and the US Naval Observatory all hold digitised copies. What is needed specifically is enough resolution to measure hatch interval and stroke width in pixels-per-millimetre, which the web-sized images do not give. If the user can obtain a single tiff at that resolution, most of my Gaps list closes.

- [ ] A physical impression, if the budget exists: a loose original leaf from Bayer 1603, or Hevelius 1687, or (much cheaper) any 17th-century engraved plate at all. £40-150 buys a real one from a print dealer. Nothing on a screen teaches plate tone, the platemark emboss, and ink relief the way holding one under a raking light does — and those are precisely the three things Orbit is missing.

- [ ] A copy of Hevelius, 'Firmamentum Sobiescianum sive Uranographia' (1687) and Bode, 'Uranographia' (1801) plates at matching resolution, to rebuild src/figures.js's three 'hands' (FIGURE_STYLES at figures.js:203-205) from evidence. Right now the three hands differ only by a density multiplier; with three real plates side by side they could differ by *system* — Bayer/Mair finer and more geometric, Hevelius broader, Bode crossed and far more shaded.

- [ ] Whether the user has a preference on the crossing question (finding i). This is an art-direction call I should not make unilaterally: does this press cross its hatching (true to a 1603 copperplate, and what Bayer/Mair actually did), or does it keep the current no-crossing Galileo-wash rule as a named house style? Everything in planets.js, figures.js and celestial.js follows from that one answer.

- [ ] Any high-resolution reference the user already has for *engraved lettering* on a plate — a cartouche, a title, a scale bar — as opposed to letterpress. Finding (n) proposes splitting the two artefacts, and I have no good sample of cut plate-lettering at magnification to specify what 'clean-edged, hairline entries, breaks by wear' should actually look like at 6-12px.

- [ ] High-resolution scans of four specific Uranometria (1603) plates INCLUDING the full sheet edge - most online scans crop the border away, which is exactly the part this audit needs. The four that would earn their keep: Orion (for the star-symbol punches at large size), Taurus or Leo (a zodiacal plate, for the shaded 8-degrees-either-side ecliptic band Orbit is missing), Cygnus (for the dotted Milky Way, the other missing mark), and one of the two planispheres (for the outer graduated limb and any printed key). The Linda Hall Library's 'Out of This World' exhibition and Cambridge Digital Library both hold these; CUDL returned 403 to me but should open in a browser.

- [ ] Chet Van Duzer, 'Frames That Speak: Cartouches on Early Modern Maps' (Brill, 2023) - open access. This is the book on cartouche chronology and it would settle, properly and by decade, what the frontispiece box at index.html:517-523 should actually be, and whether a celestial plate gets a cartouche at all.

- [ ] Chet Van Duzer, 'Sea Monsters on Medieval and Renaissance Maps' (British Library, 2013) - settles the sea-monster question for frame.js:147-183 directly: which genres carry them, what they signify, and whether any celestial sheet ever did.

- [ ] Deborah Jean Warner, 'The Sky Explored: Celestial Cartography 1500-1800' (Alan R. Liss / Theatrum Orbis Terrarum, 1979) - the catalogue raisonné of essentially every celestial map of the period. This is the one book that could turn 'I found no celestial plate with a compass rose' into a fact rather than an inference. Out of print but findable secondhand.

- [ ] Nick Kanas, 'Star Maps: History, Artistry, and Cartography' (Springer, 3rd ed. 2019) - the standard modern reference, with a chapter on how celestial plates were actually constructed (projections, grids, magnitude notation). Would settle several 'likely' items above in one read.

- [ ] Robert H. van Gent (ed.), the Taschen facsimile 'Cellarius: Harmonia Macrocosmica of 1660' - if you own it, its plates are the best available reference for what a legitimately ORNATE celestial sheet looks like, which is the direct model for Orbit's cellarius plate (20-front-cellarius.png) and for any title cartouche work.

- [ ] A scan of the character table from Bayer's 'Explicatio characterum aeneis Uranometrias' (1624) - this is the one document that would let Orbit's six magnitude punches (README.md:145, figures.js:47) be a reconstruction rather than an invention.

- [ ] A decision from you on one thing research cannot settle: is the plate Bayer's or Hevelius's? The imprint says Bayer (frame.js:686-695: URANOMETRIA, AUGUSTA VINDELICORUM, ANNO MDCIII) and the default figure hand says Hevelius (README.md:159). They imply opposite sky handedness, and the compass rose at frame.js:39-42 currently agrees with neither.

- [ ] A facsimile or high-resolution scan of the folding plate in Huygens, Systema Saturnium (1659) — the one collecting Figs. I-XIII of earlier Saturn hypotheses. This single image is the reference for turning planets.js:529's fixed ring opening into a dated sequence, and for settling the ansa shapes at celestial.js:493 and effects.js:812. The Smithsonian Dibner scan is free; a printed facsimile would be better for judging line weight.

- [ ] Do you own, or can you get, Albert Van Helden's translation and commentary on Huygens's Systema Saturnium, or his 'Saturn and his Anses' (Journal for the History of Astronomy, 1974)? That paper is the standard scholarly account of the whole 1610-1659 shape sequence and would remove most of my uncertainty about Figs. IV-XIII.

- [ ] Galileo, Istoria e dimostrazioni intorno alle macchie solari (Rome, 1613) — a scan of the 38 sunspot figures, or better, Eileen Reeves and Albert Van Helden's translation 'On Sunspots' (Chicago, 2010), which reproduces both Galileo's and Scheiner's plates. This is what figures.js:1131-1206's flare should be measured against, and it will settle how much solar limb a spot needs behind it to read.

- [ ] A scan of Scheiner's Rosa Ursina (1626-30) plates. Its sunspot engravings are the most elaborate of the century and the closest match to the hatched-penumbra style Orbit is already reaching for.

- [ ] Johannes Hevelius, Dissertatio de nativa Saturni facie (1656) — specifically the plate of Saturn's 'variis phasibus', the phase cycle. This is the direct visual model for a run that shows a sequence of ring openings. MDZ has it free.

- [ ] Hevelius, Cometographia (1668) — the tail-form plates. effects.js:723 already names this book; having the actual plates in front of you would let the ambient comet at celestial.js:615-620 be re-cut in the same hand as the player's mark instead of as a gradient streak. Library of Congress has it digitised.

- [ ] A Uranometria (1603) plate at high resolution alongside a 1600s Augsburg almanac or ephemeris sheet — so the planetary-sigil question can be settled by looking rather than by convention. e-rara and the David Rumsey collection both have Bayer free; the almanac is the harder half and may need a purchase or a library visit.

- [ ] Galileo, Sidereus Nuncius (1610) — the Medicean-star diagrams specifically, not just the lunar washes. Peter Barker's or Albert Van Helden's edition. The nightly configurations are what celestial.js:499-505 should be seeded from.

- [ ] William Gilbert's lunar map as printed in De mundo nostro sublunari philosophia nova (Amsterdam, 1651), and Harriot's July 1609 sheet. If Orbit ever wants a planetary mark that is genuinely legal on a 1603 sheet, Gilbert's map is the only lunar image that qualifies, and it looks nothing like the crater family.

- [ ] Confirmation from you on one design question I cannot answer from the source: is the paper plate meant to be a LATER STATE of the same copperplate as the night plate, or a different edition? If yes, the 1603/1675 tension becomes a printing history — ansae on the early state, rings on the late — and stops being an anachronism at all.

- [ ] A page-image or facsimile of Bayer's Uranometria 1603 engraved title page and one lettered plate (Orion is the usual reference) — the e-rara Zurich scan at https://www.e-rara.ch/zut/doi/10.3931/e-rara-309 is free and complete. This settles the privilege wording, the cartouche layout, and how the Greek letters actually sit against the stars and the figure.

- [ ] Stanley Morison and Harry Carter, 'John Fell, the University Press, and the "Fell" Types' (Oxford, 1967). This is THE source on what the Fell types are and when each punch was cut; it would let README.md:143 state the 1670–72 / 1686 dates honestly in one sentence instead of eliding them.

- [ ] Hendrik D. L. Vervliet, 'The Palaeotypography of the French Renaissance' (Brill, 2008) or his 'French Renaissance Printing Types: A Conspectus' (2010). These are the reference works for what a Garamond roman and a Granjon italic actually look like at 1540–1610, and would let the project say what type the atlas is *pretending* to be, as against what it is set in.

- [ ] Robert H. van Gent's commentary volume to the Taschen facsimile 'Cellarius Atlas: Harmonia Macrocosmica of 1660' (ISBN 9783822852903) — the user already borrows Cellarius as a plate name (ledger.js:97 'Tabula Cellarii'), and this volume transcribes and translates the plate cartouches and imprints.

- [ ] Adriano Cappelli, 'Lexicon Abbreviaturarum / Dizionario di abbreviature latine ed italiane' — the standard dictionary of Latin contraction marks. If the atlas is ever to set 'Añno' or 'quã' rather than modern full spellings, this is the authority for which contraction is right, and it is available free as a scan.

- [ ] Ian Ridpath, 'Star Tales' (2nd ed., 2018) — his Bayer-letters chapter is the clearest correction of the brightness-order myth and would settle how Orbit should order letters within a magnitude class.

- [ ] If the user owns or can borrow ANY leaf of a genuine 1600–1650 Latin folio — even a single detached page — a flatbed scan of one text block at 600dpi would answer the long-s, ligature, small-caps and nasal-stroke questions faster than any secondary source, and would give a real ink-on-paper target for the body copy on 02-howtoplay-paper.png.

- [ ] A statement from the user, in one line, of the intended English/Latin voice rule: which surfaces are the plate speaking Latin and which are the game speaking English. Nothing in README.md or docs/archive/eras/ states it, and half the findings below hang on it.

- [ ] Robert H. van Gent, 'Andreas Cellarius: Harmonia Macrocosmica of 1660 — The Finest Atlas of the Heavens' (Taschen, ISBN 9783836535977, or the earlier 9783822852903). Full-plate colour reproductions. This is the one book that would settle the Cellarius plate's colourway (plates.js:287) in an afternoon, and Taschen's colour is faithful enough to sample from.

- [ ] Nick Kanas, 'Star Maps: History, Artistry, and Cartography' (Springer, 3rd ed. 2019). The standard reference that actually tabulates atlas-by-atlas conventions — magnitude symbols, grid types, figure orientation (sky-view vs globe-view), border graduation. It would answer the biggest open question in this report: what Bayer's six magnitude signs look like.

- [ ] Deborah J. Warner, 'The Sky Explored: Celestial Cartography 1500-1800' (Alan R. Liss / Theatrum Orbis Terrarum, 1979). The catalogue of record for the period the game is set in; out of print but findable secondhand. Use it to check the imprint wording and plate counts the colophon claims.

- [ ] A purchased high-resolution scan from Linda Hall's image-request service of THREE specific Bayer plates: ARGO NAVIS, LYRA and CORONA BOREALIS — because those three map directly onto Orbit's THE ARGO, THE LYRE and THE CROWN (figures.js:694-698) and would let the Bayer hand be redrawn from the original rather than from a style guess. Their fee schedule is on the Document Delivery and Image Reproduction page.

- [ ] A scan of one Explicatio characterum table page (any constellation) — the Greek letter / magnitude / Ptolemy-number table Bayer printed on the plate versos. This is the direct model for a phone-legible magnitude key to replace the desktop-only marginal one at frame.js:266-286.

- [ ] The Latusseck 2014 JHA paper 'The Milky Way in Johann Bayer's Uranometria, 1603' as a PDF, if you have institutional access. It contains the reconstructed Milky Way outline, which is what a Via Lactea construction stage would be traced from.

- [ ] Alexander Mair's engraved title page to the 1603 Uranometria at the highest resolution you can get (e-rara or Commons). Orbit's frontispiece is currently a typographic panel; Bayer's is an architecture — Atlas and Hercules on pedestals, Apollo, Cybele and Diana above, Capricorn and a vignette of the city of Augsburg below, signed AMF. That is the missing art the frontispiece screenshots are asking for.

- [ ] If you own any physical early-modern printed leaf or a good facsimile: a 1200 dpi flatbed scan in raking light. The laid-wire and chain-line pitch in README's paper plate is currently a guess, and one measured sheet would replace it with a number.

- [ ] Stanley Morison, 'The Fell Types' / 'John Fell: The University Press and the Fell Types' (Carter, 1967) — only if you decide to KEEP IM Fell knowingly, in which case it gives you the dates to name the anachronism with. Otherwise skip it and take EB Garamond instead.

- [ ] A facsimile or scan of the Egenolff-Berner specimen sheet (Frankfurt 1592) — one page — as the type reference if you move the lettering to EB Garamond. It shows Garamont's roman and Granjon's italic at the sizes a 1603 printer would actually have set.
