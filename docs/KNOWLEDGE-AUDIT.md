# What the atlas teaches · knowledge audit and proposals

An audit of Orbit as a carrier of knowledge, done on 2026-09-30 against `main` at pull request #111
(the circle amended, JOURNEY.md §9.2). The game is well suited to teaching the concepts and the history
of astronomy: its one mechanic is the act of observing, and its ladder is the history of how the sky
was drawn. The audit asks three things: **what the game already teaches**, **what has to be checked**,
and **where it could teach more**. The eight centuries were read from code and docs by five scouts,
each of them reporting with file and line. Every factual flag in section 2 was then re-read in the
code, and the doubtful ones were checked against outside sources (listed at the end). Nothing here was
seen in a browser except the corrections of section 2.1, which were captured at 430×932.

[`ART-AUDIT-TODO.md`](../ART-AUDIT-TODO.md) judged the atlas by its historical claim as a plate;
[`ART-REVIEW.md`](ART-REVIEW.md) by what a player sees on the phone. This file judges it by what a
player **learns**, and it adds to both rather than repeating them.

## Summary

There is more real knowledge in the game than its surface suggests: about ninety curator's lines and
marginal notes across five centuries (`chapterLines` and `chartNotes`, roughly 1,400 words), dated
captions, heirloom glosses, and five source lines on the frontispieces that say plainly what is a
gameplay translation. Most of it is carefully researched and much of it carefully hedged. Three things
hold it back:

1. **Shown, not explained.** Latin, hieroglyphs, Chinese, Arabic, the equator and the ecliptic are set
   on the sheet and almost never glossed, in places against CLAUDE.md's own rule that a name the player
   has to understand carries an English italic gloss.
2. **Fleeting.** A marginal note is carried off as the sheet scrolls, and is skipped when there is no
   clear ground for it (`inscriptions.js`). Only the Rock keeps its notes on the catalogue once seen
   (`rock.js`, its collection's `gloss`).
3. **The game everyone plays teaches least.** Era V keeps no lore of its own
   (`chapterLines:null, chartNotes:null` in `ui.js`), and the marginalia that would teach — the
   MAGNITUDINES key, the construction's labels — are wide-sheet furniture that the reference phone
   shows only while paused, at six to eight pixels.

About a dozen statements in text the player reads were wrong or stated too firmly. They are corrected
in the same change as this file (§2.1).

## 1 · What the game already teaches

| Era | What reaches the player | Reading |
|---|---|---|
| I · Rock | Four chamber notes and twelve animal notes: Lascaux, Chauvet, Altamira, Rouffignac, the Newgrange midwinter sunrise | The model for hedging ("may be the Pleiades, or may not"). The only era whose notes stay on the catalogue. |
| II · Ceiling | The twelve Amduat hours as gates, hieroglyph columns, the source line | Labels only. Transliterations and glosses exist in `CEILING_WORD` and are never drawn. |
| III · Scroll | The 28 lodges at their true widths in dù (they sum to 365), the three schools' colours | Almost entirely Chinese. No notes, no source line; the palaces' names reach only the screen reader. |
| IV · Astrolabe | Six curator's lines, twelve notes on Arabic star names, a true stereographic plate for 33.3° N with the rete's stars at their catalogued places, the Ṭūsī couple | The best-explained century. |
| V · Atlas | Figures in Latin with an English gloss, Bayer's letters, the magnitude key, equator and ecliptic, an ephemeris with the true solar longitude and moon age, Saturn from *tergeminum* (1610) to *annulus* (1659) | Much shown, almost nothing explained. |
| VI · Lens | Six + twelve notes, dated captions, `LOWELL 1895` struck through by `NOT CANALS · A. 1909`, Vulcan "never found" | The strongest teaching moment in the game: science correcting itself. |
| VII · Flyby | Six + twelve notes (Morabito and Io, the 1977 airborne occultation of Uranus), GRAVITY ASSIST named | Good; the concepts stay unexplained. |
| VIII · Probe | Six + twelve notes (Bessel's parallax of 61 Cygni, Daedalus); 5.96 ly at 0.12 c against `T+0049.6 Y` | Internally consistent physics; HZ, M4V and ΔV never glossed. |

The cross-cutting frame teaches least of all in words. The design claim that holding an orbit turns a
phenomenon into knowledge reaches the player as drawing, and as one line of chrome:
`KNOWLEDGE {k} / {of} · LONGER ORBITS TEACH MORE` (`ui.js`). The Journey's milestones were planned in
JOURNEY.md §1.5 as knowledge structures ("decanal structure", "angular measurement", "resolved disk");
they shipped, as LINKING.md settled, as places and chapters ("HOURS I TO III", "THE HALL OF THE BULLS",
"AT THE EYEPIECE"), and none of the §1.5 names is in `src/`. The signature feats carry history in their
names (THOSE WHO KNOW NO REST, THE THREE SCHOOLS, GRAVITY ASSIST) and only mechanics in their
`describe`. The descent of §9.2 is deliberately wordless.

## 2 · What had to be checked

### 2.1 · Corrected in this change

Each was re-read in the code; the ones marked *web* were checked against the sources at the end.

- **The Ceiling took the Amduat's hours for decans.** The Record row read *Decans of the night passed*
  and a feat *ALL TWELVE DECANS* for the twelve hours' gates. There were thirty-six decans; a night's
  twelve hours were each marked by one rising, which is the real link, but the Amduat's hours are
  regions of the underworld, not decans. Now *Hours of the night passed* and *ALL TWELVE HOURS* (the
  feat's id, `allDecans`, is unchanged, so no record moves).
- **The Dendera heirloom** said "the night's twelve decans" were cut in the ring at Dendera. The circular
  zodiac carries thirty-six decans round the twelve signs, as the README already said. The gloss now
  says so, and dates it to the last century BCE.
- **The Ceiling's source line** said "the decan columns … are Senenmut's, from TT353". The columns stand
  where TT353 sets its decan names, but the words in them come from the fourteen-word vocabulary
  `CEILING_WORD` can spell (Apep, Shu, Sekhmet, *shield*, *red* …), which holds no decan name. The line
  now says the columns are laid out after Senenmut's and the words are a short vocabulary; the README's
  Ceiling paragraph says the same.
- **BETELGEUSE · THE SHOULDER** (Astrolabe, *web*). The Latin name comes from *yad al-jawzāʾ*, the hand of
  al-Jawzāʾ, its *y* misread as a *b* (Kunitzsch). *Mankib al-jawzāʾ*, the shoulder, is a real Arabic
  name of the star but not the source. The pointer now reads يد الجوزاء · BETELGEUSE · THE HAND; the
  shaping was checked at 430×932. `04-astrolabe.md`'s signature-sheet paragraph is corrected with it.
- **Maragha's quadrant, "roughly forty metres, it is said"** (*web*). The peer-reviewed survey gives the
  mural quadrant a radius of 4.3 m; forty metres is Samarkand's Fakhrī sextant, two lines further down
  the same chapter list. Secondary summaries repeat both figures, so the line now names no radius:
  "a quadrant built into a wall along the meridian". The research file and era file carry the check.
- **"The first written record of another galaxy."** Al-Ṣūfī recorded a little cloud; that it is a galaxy
  is a twentieth-century reading. Now "the oldest surviving record of what we now know is another
  galaxy".
- **司天監印 on a chart of 649–684** (*web*). When the Dunhuang chart was drawn the office was the Taishi
  Ju, 太史局; it was renamed Sitian Tai in 758, and Sitian Jian is later still. The title seal now reads
  太史局印, and the fonts were cut again for its three new characters. `03-scroll.md` and
  `research/china.md` had the same slip, and `03-scroll.md` dated the Qintianjian to the Yuan rather
  than the Ming.
- **"The Bureau kept the sky's record for nine centuries."** The nine centuries in the docs are the span
  from the guest star of 1054 to its identification with the Crab in 1942; China's official record of
  the sky runs about two thousand years. The frontispiece now says two thousand years. The heirloom said
  the guest-star record "only reached Western astronomy in the twentieth" century; it had been read in
  Europe before then, and its great work came in the twentieth, which is what the gloss now says.
- **The ephemeris's *stylo veteri*** was always ten days behind — the gap of Augsburg's quarrel — while
  the leaf is dated MMXXVI, when the gap is thirteen. `julianOf()` now counts the gap from the year in
  hand (ten in 1582 and 1600, eleven from March 1700, thirteen now). Its comment no longer calls
  Augsburg the one city the reform brought to riot; Riga rioted too.
- **The Rock's heirloom** called the aurochs "the oldest bull in the sky" outright. Reading the Hall of
  the Bulls as Taurus is a minority view that `research/rock.md` says the game should not assert. The
  gloss now makes it conditional: "if the dots on its shoulder are the Pleiades, as a few have read
  them".
- **Five hieroglyphic spellings on the Ceiling's wall** (found while building §3.1, item 4; checked
  against each codepoint's Unicode name, which carries its Gardiner number). Three groups copied from
  `research/ceiling.md` as "attested" spelled other words: *white* was a harpoon and t (T21, X1), *wꜥt*,
  "one"; *the red land* was a stool and t (Q3, X1), *pt*, "sky"; *shield* was a ring-stand and an owl
  (W11, G17), *gm*, "find". They are now the mace and cobra, *ḥḏ*; hand, pool, mouth, bread and hills,
  *dšrt*; and reed, basket and owl, *ikm*. *Apep* had lost its opening arm (ꜥ, D36), and the *star*
  was N6, the sun with a uraeus, where the star is N14. The research file's table is corrected too.
- **README drift:** the Rock's paragraph described the Moon as a crescent with tally notches, after
  Laussel and Blanchard. Since the triad became one light in three sizes (§9.1, commit `2ca35ac`)
  `rockTier()` never returns `'moon'`, so no body is drawn that way. The README now says the mark is kept
  and dealt to no body. Whether the Moon comes back as a body of the wall, as §9.1's last clause
  suggests, is left to the author.

Two scout flags were dismissed on re-reading: the Saturn comment in `reveal.js` is right (one band, no
division, since the division is Cassini's of 1675), and "Cairo, c. 1027" for Ibn al-Haytham's *Optics*
sits inside the disputed range (1011–1021 against 1028–1038). A third, that the Rock's note speaks of
"six dots" where the wall draws three, is not a contradiction: the note is about the painting at
Lascaux, and the three dots are the game's own sign.

### 2.2 · Still open: a mechanic that contradicts its claim

These need a design decision, not a text edit.

- **Arbitrary pairings that read as fact.** On the Scroll a body's school is its row taken in threes and
  its asterism name is its id taken in twenty-fours, so the caption pairs them at random. On the
  Astrolabe the qadr comes from the seed and a star's name goes to any bright body, so Sirius can read
  qadr 3. On the Probe the spectral class is `n.id%6`, so any star can be M4V, against the README's
  "everything is either a measurement or an inheritance". Either bind them to real data or say, in the
  source line, that the pairings are illustrative.
  *Built 2026-10-01, bound to real data in all three.* The Astrolabe's rete stars carry their catalogued
  qadr (the Almagest's, which al-Ṣūfī keeps) and each is dealt only to a body of that greatness, so a
  named star always reads its own; until then a named body could read any first or second greatness.
  On the Scroll a body takes its school from its row as before and then an office that school truly set
  down (`SCROLL_OFFICES`, after the Kaiyuan Zhanjing's three lists) in the palace of the lodge it is held
  in, so name and colour always agree, and its source line no longer calls the pairing a translation.
  The Probe's systems carry their stars' catalogued classes (`PRB_SYSTEMS`), and a star prints its own
  component's (Barnard's Star `M4V`; Alpha Centauri `A G2V`, `B K1V`, `C M5.5V`), with Barnard's mass
  corrected to 0.16 M☉. The values were checked through search summaries only, since the primary
  catalogues could not be opened from the sandbox; a reading against Toomer's Almagest, the Kaiyuan
  Zhanjing's chapters 65–70 and RECONS is still owed.
- **The Lens's families do not follow its chapters.** A body's family comes from
  `planetFamily(row,runSeed)`, not from the register, so by the code a 1610 chapter can caption a body
  `1787 · THREE VOLCANOS`. Not yet seen in play. Its sensor-era names (OCEAN WORLD, LAVA WORLD) sit on a
  1990 card before any exoplanet was known, which `06-lens.md` admits. *Built 2026-10-01:* the Lens binds a
  body's family to its chapter (`lensFamily` redraws, from row and seed, any family whose caption year is
  later than its chapter's, so Padua shows only the Moon and Venus and The Hague adds the ring), checked
  in `scripts/verify/runtime.mjs`; the register-three names stay as `06-lens.md`'s "Names" chose them, the
  families being known by 1787 and only the words postdating 1990, and are left for a decision.
- **A gravity assist is not a lap.** The Flyby's signature feat asks to "leave a gravity well on a full
  lap". A real assist is a single hyperbolic pass that borrows the planet's orbital motion; a full lap
  would be a capture. The mechanic can stay; its gloss should not teach the wrong picture.
- **The atlas's twelve figures** mix Ptolemaic ones (Lyra, Corona, Serpens, Argo), Bayer's southern ones
  of 1603 (Phoenix, Tucana, Pavo) and four invented ones (Acus, Penna, Laterna, Phalæna). Velum is
  Lacaille's division of Argo in the 1750s, flown beside Argo itself. None of this is disclosed, and the
  atlas is the one frontispiece with no source line. *Since 2026-09-30 the figures' own notes disclose it
  (§3.1, item 2); since 2026-10-01 the atlas has its source line too, naming Bayer's Uranometria, the
  figures' four sources and the gameplay translation.*
- **The Ceiling fuses three sources** a century and a half apart: Senenmut's ceiling (c. 1470 BCE), the
  Book of Nut and the Amduat (Ramesside). The source line discloses part of it. *Built 2026-10-01:* the
  source line now dates Senenmut's ceiling and the Ramesside books and says the sheet sets the three side
  by side.
- **Smaller:** the compass rose sets ORIENS on the right, the terrestrial convention, where a chart of
  the sky seen from below has east on the left; VIS GRAVITATIS is a softened pull of finite range, while
  its only English (an aria label) calls it "real gravity"; the Mariner 4 "ten-hour frames" in
  `flyby.js`'s header and `07-flyby.md` do not match their own figures (240,000 bits at 8⅓ bit/s is
  eight hours); the Ceiling's month circles are drawn with thirty spokes where
  `research/ceiling.md` records twenty-four segments. *Built 2026-10-01:* all four are done. The rose
  letters ORIENS on the left and OCCIDENS on the right, and the frame's hours of right ascension now rise
  from right to left with it; the aria label says the pull is softened and has a short reach; Mariner 4's
  frames are eight hours in `flyby.js`, `07-flyby.md` and `research/space-age.md`; the month circles have
  twenty-four spokes.

### 2.3 · How claims are kept honest

The research files carry sources, but fifteen of thirty-seven flags in them still read "unverified",
and `OPEN-QUESTIONS.md` records the verification debt. The tests count notes and never check them. Two
cheap steps would close most of the gap:

- **A register of claims.** Every factual line the player reads — curator's line, note, heirloom gloss,
  dated caption, source line — carries a source and one of ERA-AUDIT.md's three labels: attested,
  plausible reconstruction, gameplay translation. It can live as a field beside each note in the
  voices, and `scripts/verify/runtime.mjs` can assert that none is missing.
- **A source line for every frontispiece.** The Rock, the Scroll and the atlas have none. The Rock's
  should say what its framing is ("Someone has to remember them" is a story, not a finding); the
  atlas's should name Bayer's *Uranometria* (Augsburg, 1603) and say that the telescopic bodies and the
  invented figures are a gameplay translation.
  *Built 2026-10-01:* the Rock and the atlas now carry theirs, so every frontispiece has one. The Rock's
  says no painted dot is asserted to be a star and that the keeping hand is a story, not a finding.

## 3 · Where it could teach more

### 3.1 · Cheap, data only, high return

1. **Keep every note seen on the catalogue, in every century**, as the Rock already does. The catalogue
   becomes a compendium the player earns by flying, which is the design's own thesis in the form a
   player can reread: holding a light turns it into knowledge. This is the single most useful change.
   *Built 2026-09-30:* a met chart's card carries its note on every century that says one
   (`centuryChartNote` in `centuries.js`), and each century's Record keeps its curator's lines chapter by
   chapter under *Chapter by chapter · Annales* once a run has reached them (`centuryAnnals`), both read
   off what the centuries' records already keep. Any line added to the Ceiling or the Scroll under 3
   below is kept the same way with no further work.
2. **Give the atlas its own lines.** Candidates: Bayer (1603) and his Greek letters, α for a figure's
   brightest; Phoenix, Tucana and Pavo, first charted from Keyser and de Houtman's voyage of 1595–97; the
   slingshot star named for what the README says it is, a *stella nova* (Tycho, 1572); *Ecliptica*, the
   Sun's yearly path; the calendar reform of 1582, which the ephemeris already double-dates.
   *Built 2026-09-30:* four chapter lines, in date order (Apian's volvelles, 1540; Tycho's nova, 1572;
   the Gregorian reform, 1582; the Medicean stars, 1610) and a note for each of the twelve figures, which also closes
   §2.2's point that the invented figures were undisclosed: the Needle, the Quill, the Lantern and the
   Moth now say they are the atlas's own. The atlas's Record keeps both (the notes under the Asterismi
   register, the lines as *Annales*). Building it found that every voice inherits the atlas's lore unless
   it sets its own, so the Ceiling and the Scroll now set theirs to none, and the suite checks that no
   century speaks the atlas's lines. *Built 2026-10-01:* the two captions left over. A slingshot held to a
   full observation is lettered *Stella nova* on its rim, as a world is with its species, and the
   construction's *Æquator cælestis* and *Ecliptica* carry their English in italic beneath them (*the
   celestial equator*, *the Sun's yearly path*).
3. **Bring the Scroll up to the Astrolabe.** Curator's lines for the four palaces; notes such as *Xin,
   the Heart, is Antares*, *the Weaver Girl and the Herd Boy are Vega and Altair*, *twenty-eight lodges,
   about one for each night of the Moon's round*, *365¼ dù, a day for each of the Sun's*; pinyin beside
   the Chinese; a source line.
   *Built 2026-09-30:* a line as each palace opens (its quarter, season and lodges, the 365¼ dù and the
   Moon's round among them), a note under each of the twelve star offices, pinyin beside every mansion and
   office on the leaf, and a source line on the frontispiece that names the Dunhuang chart and calls the
   office and school each light is filed under a gameplay translation — which also discloses §2.2's
   arbitrary pairing, though it does not bind it. The offices are kept on the leaf through a new
   `orbit.scroll.v1`, a bitmask of the offices ever filed.
4. **Show the glosses that exist.** `CEILING_WORD`'s transliterations and glosses ("Sah · Orion", "the
   Foreleg"); the hazard Latin (VORAGO, MACULA, VENTUS on the atlas, *Nihil visum* and *Manus tremula*
   on the Lens). The charges already have the right pattern — `SCUTUM ARMED · SURVIVES ONE VORTEX` — and
   the hazards could borrow it.
   *Built 2026-09-30:* the atlas names each hazard kind once as VORAGO · A WHIRLPOOL, MACULA · A SUNSPOT,
   VENTUS · A WIND; the Lens's eyepiece notes carry their English after them in the same hand (*Nihil
   visum · nothing seen*, *Foramen in caelo? · a hole in the sky?*); and the Ceiling's leaf lists the
   fourteen words its columns spell, each in its signs, with a reading a player can say (Sah, Apep,
   Deshret — no embedded face carries ꜣ or ꜥ), its sense and one sentence of what it meant. Setting the
   words out found five of them misspelled on the wall itself, now corrected and recorded in §2.1.
5. **Half a clause of why on every signature feat.** GRAVITY ASSIST: a planet's motion borrowed, first
   done between planets by Mariner 10 at Venus in 1974. THE THREE SCHOOLS: three old star catalogues,
   told apart on one chart by colour. THOSE WHO KNOW NO REST: the wandering stars Senenmut's ceiling
   carries in barques, Mars missing among them.
   *Built 2026-10-01:* every entry of `SIGNATURES` carries a `why`, set on each century's Record (and
   the atlas's) under *The century's feat · Signum* above what to fly. GRAVITY ASSIST's says plainly
   that a real assist is one pass, not a lap, which answers §2.2's point about the mechanic without
   changing it; THOSE WHO KNOW NO REST's is hedged, since reading the "unwearying" stars as the planets
   is a reading.

### 3.2 · Design, medium

6. **Milestones that say what was learned.** Keep the chapter as the milestone, as LINKING.md settled,
   and give each the knowledge §1.5 meant it to stand for as its gloss, in the one place a milestone is
   named, `A MILESTONE STANDS · {name}`: "HOURS I TO III · the decans as a clock".
7. **A belief kept, and corrected, in every century.** The Lens is the model and
   KNOWLEDGE-HORIZON.md's column for it is empty for eras I–IV. Candidates: on the Scroll, Mars at the
   Heart as the omen it was read as (it is already a danger there); on the Astrolabe, Ptolemy's equant
   and the Ṭūsī couple that replaced it; on the Flyby, Mariner 4 finding craters where Lowell drew
   canals — planned in `07-flyby.md`, and the word *canal* is not yet in `flyby.js`, although the Lens
   already sets `NOT CANALS` two centuries below.
   *Built 2026-10-01:* in the Lens's own form, decided by the author — a belief of the time set beside a body
   early in the run, then set again later in the same run struck through, never erased, with its correction
   beneath (`src/beliefs.js`, and the Lens's `LOWELL 1895` now struck in red as Antoniadi's note is typed).
   Only attested pairs: the Ceiling's 365-day year and the Decree of Canopus (238 BCE); the Scroll's inch of
   shadow per thousand li and Yixing's survey of 724 (Mars at the Heart was dropped: its only correction is
   Huang Yi-long's computation of 1990, six centuries past the Scroll); the Astrolabe's equant and al-Ṭūsī's
   two circles at Marāgha (1261); the atlas's unchanging heavens and Tycho's new star of 1572; the Flyby's
   canals and Mariner 4 (1965); the Probe's van de Kamp planets of Barnard's Star and the telescope fault
   found in 1973. The Rock is left without: it asserts nothing a later hand corrected. Table and sources in
   KNOWLEDGE-HORIZON.md and `docs/archive/eras/research/beliefs.md`; the suite checks every century sets its
   belief and strikes it later, and `npm run shots -- beliefs` shows each at 430×932.
8. **One star through several hands.** Antares is *Xin*, *qalb al-aqrab* and "the rival of Ares"; Vega
   and Altair are the Weaver Girl and the Herd Boy and al-Ṣūfī's two eagles; Aldebaran leads from the
   Hall of the Bulls, hedged, to *al-dabarān* to the guest star of 1054 at the Bull's horn. The
   heirlooms already walk this path in part.
9. **The phone first.** On 430×932 the magnitude key and the construction's labels are next to
   invisible. The pause leaf could be the atlas's legend: *I brightest · VI faintest, as Ptolemy ranked
   them*; *the celestial equator*; *the ecliptic, the Sun's yearly path*.

### 3.3 · The lever in §9.2: what each round reveals

JOURNEY.md §9.2 leaves "what each round's layer reveals" for the author, and it is the natural place to
put knowledge in front: it makes a second round worth flying for what it shows, which is also §9.2's
own answer to the grind. Three directions, offered for the author's choice rather than decided here:

- **One star, eight names** (recommended). Each round follows one real body through all eight hands —
  the Pleiades, Sirius, Antares, Aldebaran — and the descent ends on it. The descent already ends on
  "the same star the probe was looking at", set as a dot of ochre by a hand; a round that names that star
  in every century it passes through turns the circle into the lesson.
- **The correction.** Each round shows what the next century set right in the one before.
- **The instruments.** Each round shows how a century's tool actually measured: the merkhet, the
  astrolabe's altitude, the telescope's resolution, parallax.

Whatever is chosen, the three hints the descent carries — panspermia, the multiverse, time run back —
should stay unnamed, as §9.2 has them, and never be stated as knowledge.

*Built 2026-10-01:* the author chose **one star, eight names** (JOURNEY.md §9.2). Round 2 follows the Pleiades,
round 3 Sirius, round 4 Antares, round 5 Aldebaran, then the four again; round 1 reveals nothing. In each century of
such a round one plain body is the star, inscribed in the plate's own small caps with the name the century gave it
(or, where it gave none that survives, a line saying so) and given the century's note on landing; the descent that
ends the round letters the ochre dot with the star's name and names nothing else; and the atlas's Record keeps the
names met under `orbit.star.v1`. Every one of the thirty-two entries carries an evidence label and a source
(`ONE_STARS` in `src/onestar.js`; `docs/archive/eras/research/one-star.md`), and six of them are honest absences.
This also answers part of §3.2 item 8 (one star through several hands) for these four stars.

## Sources checked for this audit

- Betelgeuse's name: [All Skies Encyclopaedia](https://xing.fmi.uni-jena.de/mediawiki/index.php/Betelgeuse),
  after Kunitzsch (1959).
- Marāgha's quadrant: *Astronomical Methods and Instrumentation in the Islamic World*,
  [arXiv:2511.19559](https://arxiv.org/pdf/2511.19559); the 40 m figure repeated by secondary pages such as
  [Madain Project](https://madainproject.com/maragheh_observatory).
- The Tang bureau's names: [Qintianjian](https://en.wikipedia.org/wiki/Qintianjian); Qiao Yang, *Becoming an
  Astronomer in Late Medieval China*, [Journal of Chinese History](https://www.cambridge.org/core/journals/journal-of-chinese-history/article/becoming-an-astronomer-in-late-medieval-china/175166F3E9991B23E0C579163B43643A).
- Ibn al-Haytham's dates: [Ibn al-Haytham](https://en.wikipedia.org/wiki/Ibn_al-Haytham).
