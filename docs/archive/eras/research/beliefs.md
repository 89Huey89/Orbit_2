# A belief kept, and corrected — research file

The table behind docs/KNOWLEDGE-AUDIT.md §3.2 item 7, decided by the author on 2026-10-01: every century
that has an honest pair sets one belief of its own time on the sheet, and later in the same run sets it
again struck through with the correction beneath, **in the form the Lens already used** — `LOWELL 1895`
on Mars's plate, then `NOT CANALS · A. 1909` beside it (now struck through in the same red). The game's
copy is `BELIEFS` in `src/beliefs.js`; this file argues for each pair. Labels are ERA-AUDIT.md's three:
**attested**, **plausible reconstruction**, **gameplay translation**.

Two rules, the author's: **only attested beliefs and attested corrections**, never invented; and the
correction is dated no later than the era can honestly reach — inside the same century, or, where that is
the honest history, the next one (the Flyby, correcting the Lens).

Compiled 2026-10-01. Wikipedia, MDPI and most primary-source sites are blocked from the sandbox this was
written in; what was checked, and through what, is listed under each pair and in "What could not be
verified" at the end.

## How it is drawn

A belief is a standing inscription in the plate's own small caps (`inscribeHeld`, so it takes each era's
`inscriptionInk` hand — cut in rock, painted on the Ceiling, brushed on the Scroll, inked on the
Astrolabe's paper, engraved on the atlas, read out in mono on the Flyby and the Probe) beside the first
plain main-line body from row `at` of the century. The correction is set the same way beside the first
plain body from row `fixAt`: the belief quoted first and struck through (`beliefStrikeLine`, one rule per
line in the plate's own ink, drawn left to right after the pen has written it), the correction beneath.
If the first note is still on the sheet then, it is struck where it stands as well. Nothing is erased.
The rows are counted from the row the century was entered on; where a century tells itself in dated
chapters, `at` and `fixAt` fall in the chapters of the two dates. Nothing in `src/simulation.js` changes.

## The table

| Era | Belief, as set | Correction, as set | Rows | Label | Sources |
|---|---|---|---|---|---|
| I · Rock | — none | — none | — | — | No Palaeolithic belief survives in words; see below. |
| II · Ceiling | `THE YEAR IS 365 DAYS` | `SOPDET SLIPS A DAY IN FOUR YEARS · CANOPUS, 238 BCE` | 3 → 15 (hour II → hour VI) | attested (the reading of the civil year as a belief is ours: see below) | Decree of Canopus, 7 March 238 BCE (Ptolemy III) |
| III · Scroll | `寸差千里 · AN INCH OF SHADOW PER THOUSAND LI` | `一行 YIXING, 724 · 2.1 INCHES IN 527 LI` | 3 → 11 (Azure Dragon → Black Tortoise) | attested | The Kaiyuan meridian survey, 724, under Yixing and Nangong Yue |
| IV · Astrolabe | `PRECESSION · ONE DEGREE A CENTURY · PTOLEMY` | `ONE DEGREE IN 66 YEARS · AL-SUFI, ISFAHAN 964` | Baghdad or Isfahan → Isfahan (rows 1–10 → 6–11) | attested | al-Ṭūsī, *al-Tadhkira fī ʿilm al-hayʾa* (1261); Ragep |
| V · Atlas | `CŒLUM IMMUTABILE · ARISTOTELES` | `STELLA NOVA SUPRA LUNAM · TYCHO 1572` | 3 → 10 (Tabula I → Tabula II, 1572) | attested | Tycho Brahe, *De nova stella* (1573) |
| VI · Lens | `LOWELL 1895` (on Mars's plate) | `NOT CANALS · A. 1909`, Lowell struck through | as the plate develops → once developed | attested | Lowell, *Mars* (1895); Antoniadi, Meudon 83 cm, 1909 |
| VII · Flyby | `A DEAD WORLD, LIKE THE MOON · MARINERS 4–7` | `RIVER BEDS AND VOLCANOES · MARINER 9, 1971` | both in Chryse, 1971–76 (rows 6–11) | attested | Mariners 4, 6, 7 (1965, 1969); Mariner 9 in orbit from November 1971 |
| VIII · Probe | `TWO GIANTS · VAN DE KAMP 1969` | `NOT FOUND · TELESCOPE FAULT, 1973` | 13 → 19 (Arrival → Seed, Barnard's Star b) | attested | van de Kamp 1963, 1969; Gatewood & Eichhorn 1973; Hershey 1973 |

## Each pair

### I · The Rock — none, and why

The Rock asserts nothing. No belief of the people who painted Lascaux survives in words, so none can be
quoted and struck. The only "beliefs" on offer are modern readings of the walls (Rappenglück's Pleiades
over the Hall of the Bulls, the lunar-calendar tallies) contested by other modern readings; setting one of
those as the wall's own belief and another as its correction would put a twentieth-century argument in a
Palaeolithic mouth. The author's brief said to leave the Rock without rather than invent, and it is left
without. `BELIEFS[1]` is absent and the suite asserts it.

### II · The Ceiling — the year of 365 days, and Canopus

- **Belief.** The Egyptian civil year: twelve months of thirty days and five epagomenal days, 365 in all,
  with no leap day, the year Egypt's administration kept from the Old Kingdom on. *Attested* as the
  calendar in use (the Senenmut ceiling's own twelve circles are lunar months, a different reckoning). Framing it as a *belief* is this file's reading, and a hedge is owed: the Egyptians knew the
  civil year wandered against the seasons and against Sopdet's (Sirius's) heliacal rising, and kept the
  wandering year anyway; what the line records is the convention, not a naive error.
- **Correction.** The Decree of Canopus, issued by the priests under Ptolemy III Euergetes on 7 March
  238 BCE, in hieroglyphic, Demotic and Greek: because "the rising of Sothis advances to another day in
  every 4 years", a sixth epagomenal day is to be added every fourth year so that the feasts kept in
  winter are not one day kept in summer. *Attested.* The reform lapsed and was taken up only under
  Augustus's Alexandrian calendar; the line does not claim it held.
- **Dating.** The correction is twelve centuries after Senenmut, but still inside Egypt's own tradition and
  written in the same script; it is dated on the sheet, so nothing is passed off as Senenmut's own.
- Checked: attalus.org's translation of the decree; the Decree of Canopus and Intercalation articles
  (through search snippets); the 2025 reports of a new complete hieroglyphic copy.

### III · The Scroll — an inch per thousand li, and Yixing's survey

- **Belief.** 寸差千里: that a gnomon's noon shadow changes one *cun* for every thousand *li* travelled
  north or south — the rule of the *Zhoubi suanjing* tradition and its commentaries. *Attested*; Liu
  Zhuo already doubted it under the Sui and proposed a survey to test it.
- **Correction.** The Kaiyuan survey of 724, directed by the monk Yixing (一行) with Nangong Yue: along a
  line of nearly the same longitude, from Baima (Huaxian) to Shangcai, 526 *li* 270 *bu*, the
  summer-solstice shadow differed by 2.1 *cun*, and one *du* of the pole's height came to 351 *li* 80
  *bu*. *Attested.* The line sets the survey's own numbers (2.1 inches in 527 li), with *cun* glossed as
  inches, as the Scroll glosses its other measures.
- **Why not Mars at the Heart.** The audit's candidate was 熒惑守心, Mars lingering at Antares, read as
  an omen of the ruler's death — already the Scroll's vortex. The omen was never corrected inside the
  era; the correction on offer is Huang Yi-long's study (*Ziran kexueshi yanjiu*, 1990/1991), which
  computed that seventeen of twenty-three recorded instances never happened and were written in after
  the fact. That is a twentieth-century correction, six centuries past the Scroll's last chapter, and
  dating it on a Tang scroll would break the rule the Lens already keeps (never corrected past what its
  century knew). Yixing's survey is the Tang's own correction, inside the Scroll's span (649–1276).
- Checked: search snippets of Baidu Baike, the Tsinghua UP history chapter and the China Geological Survey
  page (Chinese, with the 526 li 270 bu, 2.1 cun and 351 li 80 bu figures); the MDPI *Religions* paper
  "The Astronomical Innovations of Monk Yixing" (13(6):543) by title and snippet only — its page is
  blocked.

### IV · The Astrolabe — the equant, and al-Ṭūsī's two circles

- **Belief.** Ptolemy's equant (Ar. *muʿaddil al-masīr*, معدل المسير): the point off the centre about
  which a planet's epicycle centre moves uniformly — kept by the Almagest tradition and built into the
  equatoria of al-Andalus (the Valencia chapter draws one). *Attested.* Ibn al-Haytham's *al-Shukūk ʿalā
  Baṭlamyūs* (c. 1028) objected to it as impossible as a physical motion.
- **Correction.** Naṣīr al-Dīn al-Ṭūsī's pair of circles, one rolling inside another twice its size, which
  turns two uniform circular motions into a straight one; in *al-Tadhkira fī ʿilm al-hayʾa* (Marāgha,
  659 AH / 1261) it replaces the equant in his planetary models. *Attested.* The Maragha door already
  draws it. Hedges: the name "Ṭūsī couple" is modern (E. S. Kennedy), so the line says only "two circles";
  al-Ṭūsī did not solve Mercury, so the line says "for the equant", not "no equant"; and both models are
  geocentric — the correction is of the equant, not of the sky.
- Checked: Ragep, "The origins of the Ṭūsī-couple revisited" (NYU archive, by snippet); the Muslim
  Heritage survey of Persian astronomy; the Ibn al-Shāṭir article (snippet). The Arabic term was matched
  in search results; its vocalisation is not set on the sheet.

### V · The Atlas — the unchanging heavens, and the new star of 1572

- **Belief.** Aristotle's heavens above the Moon, ungenerated and unchanging; set in Latin as the atlas
  sets its notes (`CŒLUM IMMUTABILE`). *Attested* as the doctrine; the Latin tag is the atlas's own
  phrasing, not a quotation.
- **Correction.** Tycho Brahe, *De nova stella* (1573): the new star in Cassiopeia of November 1572 showed
  no daily parallax and so stood beyond the Moon, in the heavens that were not supposed to change.
  *Attested.* The atlas's own second chapter line already says so in English ("the heavens can change"),
  which is the gloss the Latin note is read against.
- Checked: HAO/UCAR's Tycho page; arXiv:1712.04532 and arXiv:2309.10120 (abstracts); World History
  Encyclopedia.

### VI · The Lens — Lowell's canals, struck

Already built (KNOWLEDGE-HORIZON.md, register two). The only change: `LOWELL 1895` is now struck through
in the grease-pencil red as Antoniadi's correction is typed, with the same stroke every other century
uses, rather than left standing beside it.

### VII · The Flyby — the canals, and Mariner 4

- **Belief.** Lowell's canals, `LOWELL 1895` as the Lens dates it. A belief the Flyby inherits rather than
  makes: by the 1960s most astronomers had dropped the canals, but they were still drawn and still hoped
  for, and Mariner 4 is remembered as the mission that ended them. This is the one pair whose belief
  belongs to the century below — "explicitly the next one where that is the honest history" — and
  KNOWLEDGE-HORIZON.md already called the Flyby the era that corrects the Lens.
- **Correction.** Mariner 4's flyby of 14–15 July 1965: 21 complete pictures covering about one per cent
  of the planet, showing craters and no canals. *Attested.*
- **Not chosen, for the author.** The Flyby has a belief of its own, corrected inside its own span:
  after Mariners 4, 6 and 7, Mars was read as a dead, Moon-like cratered world; Mariner 9 (1971–72) found
  the volcanoes, Valles Marineris and the outflow channels Viking 1 later landed beside at Chryse. It
  would fit the Chryse chapter well; the canals were kept because 07-flyby.md and the audit planned them.
- Checked: NASA Science "Triumph of Mariner 4"; Caltech's fiftieth-anniversary article; Space.com.

### VIII · The Probe — van de Kamp's planets, and a telescope's fault

- **Belief.** Peter van de Kamp's astrometric planet of Barnard's Star (1963, about 1.6 Jupiter masses,
  from Sproul Observatory plates of 1916–62), and his two-planet solution of 1969 (about 1.1 and 0.8
  Jupiter masses). Widely accepted until 1973, and one reason Project Daedalus (1973–78) chose Barnard's
  Star — the Probe's own destination. *Attested.*
- **Correction.** Gatewood & Eichhorn (1973) found no such wobble on other telescopes' plates; Hershey
  (1973) traced it to the Sproul refractor, whose objective was cleaned and remounted in the 1940s.
  *Attested.* The sheet says `TELESCOPE FAULT, 1973`.
- **And after.** Barnard's Star does have planets, but small ones: four of 0.19–0.34 Earth masses
  (minimum), confirmed by Basant et al. (ApJL 982 L1, March 2025) after González Hernández et al. (2024)
  found b; a 2018 super-Earth claim (Ribas et al.) was itself retracted as stellar activity (Lubin et al.
  2021). The correction falls at the Seed chapter, whose place is Barnard's Star b, a rocky world.
- **A conflict to note for the author.** The Probe's Arrival drawing (probe.js, stage 3) sets a
  `CLASS-ATM` storm world among Barnard's Star's four orbits. That is van de Kamp's kind of giant, and
  the 2025 survey rules out anything above 0.57 Earth masses in the habitable zone; the drawing is
  untouched here.
- Checked: Bartlett & Ianna, "Barnard's Star: Planets or Pretense" (AAS HAD, PDF by snippet); AAS Nova and
  IOPscience for Basant et al. 2025; arXiv:2105.07005 (Lubin et al.); Centauri Dreams on Daedalus.

## What could not be verified

- The MDPI Yixing paper, Wikipedia and the primary texts were blocked; Yixing's figures rest on several
  agreeing Chinese secondary pages, not on the *Jiu Tang shu* or *Xin Tang shu* themselves.
- The exact Arabic spelling and vocalisation of *muʿaddil al-masīr* was matched in English-language
  scholarship only, not in a manuscript.
- No text was found stating that Egyptians *believed* the 365-day year kept step with Sopdet; the pair
  says only that the civil year was 365 days and that Canopus corrected it, both attested.
- Hershey's paper (AJ 78, 1973) was not read directly; the lens-remounting account is from Bartlett &
  Ianna's history and later reviews.

## Revised 2026-10-01

Two pairs were moved so a run actually reaches them, each kept inside the chapters whose dates it carries (`until`,
`fixUntil` in `src/beliefs.js`). The Astrolabe's equant and al-Ṭūsī's circles needed the fifth chapter, Maragha, which
few runs reach; it now keeps the precession instead — Ptolemy's degree a century (Almagest VII.2), corrected to a degree in
about 66 years by al-Battānī and taken up in al-Ṣūfī's Book of the Fixed Stars (Isfahan, 964), which adds 12°42′ to
Ptolemy's longitudes. The Flyby's canals fell under the Viking heading, since the Mariner chapter deals no plain body
past its opening; and Lowell's canals are already the Lens's pair. It now keeps the belief its own first pictures made:
Mariners 4, 6 and 7 happened on the old cratered uplands and Mars was read as a dead, Moon-like world, until Mariner 9,
in orbit from November 1971, mapped Olympus Mons, Valles Marineris and channels cut by water. Both are set in the
1971–76 chapter. Unverified here as before: the 12°42′ figure and al-Battānī's rate rest on secondary summaries.
