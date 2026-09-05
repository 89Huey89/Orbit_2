# Research — IV · The Globe (Islamic Golden Age, 964 CE, to Ulugh Beg, 1437)

Deepens and corrects `docs/eras/02-globe.md`, which is short and broadly right; the correction
below is specific, and the rest adds what it never had (palette hex, font data, a shaping method,
a names table, currency, sound). Sources actually checked this session are in §13; a claim resting
on general art-historical knowledge rather than a session fetch is flagged at the point it matters.

**Correction, because it changes the lead artefact:** 02-globe.md doesn't name or date Marsh 144,
so it isn't wrong — but the research brief that spawned this file did, and the claim doesn't hold.
**Bodleian MS Marsh 144's colophon states it was copied in 400 AH / 1009 CE, allegedly by
al-Ṣūfī's own son, and older literature (Ridpath's *Star Tales*, most museum wall text) repeats
that as the earliest surviving copy. Recent codicological work has redated it to the end of the
12th century** — over a century after its own colophon's claim. Don't present Marsh 144 as the
1009 copy; present it as fine but of disputed, later date. The manuscript current scholarship
treats as the benchmark is different (next section).

## 1. The documents

- **ʿAbd al-Raḥmān al-Ṣūfī, *Kitāb ṣuwar al-kawākib al-thābita*** ("Book of the Images of the
  Fixed Stars"), composed c. 964 CE for the Buyid amir ʿAḍud al-Dawla. No autograph survives.
  A systematic revision of Ptolemy's *Almagest* catalogue — Ptolemaic latitudes kept, longitudes
  advanced 12°42′ for 826 years of precession to al-Ṣūfī's own epoch of 1 Oct. 964 — with
  magnitudes re-observed by al-Ṣūfī himself, and Arabic Bedouin star-names given beside the Greek
  figures. 55 tables plus 48 constellation drawings, each given **twice**: once as seen on a globe
  from outside, once looking up at the sky, deliberately mirrored, so — al-Ṣūfī's own stated
  reason — "the beholder [is not] confused if he saw the figure on the globe differing from what
  he sees in the sky." Teaching-instrument logic, not decoration, and the single most useful fact
  here: the mirroring is functional, attested, and already half-built into Orbit's fork rendering.
- **Museum of Islamic Art, Doha, MS.2.1998.SO** — **April 1125 CE, Baghdad**. Called "the most
  authoritative copy" of al-Ṣūfī's work by Emilie Savage-Smith (Yale UP, 2013), and now the
  strongest candidate for this era's *grammar*, since Marsh 144's early date is no longer secure.
  48 constellations in both views, Abbasid-period figure style; prefer this over Marsh 144.
- **Bibliothèque nationale de France, MS Arabe 5036** — a celebrated 1430s copy associated with
  Ulugh Beg's own library at Samarkand (almost certainly what earlier drafts meant by "the
  celebrated c. 1430 copy"). Later Timurid-court style — finer line, more saturated colour — a
  generation past Baghdad's 1125 idiom; a legitimate second reference for a "late" variant.
- **The Met** (acc. group incl. 446297) and the **Library of Congress/WDL copy** (bound with
  al-Qazwīnī's *ʿAjāʾib al-Makhlūqāt*, "Wonders of Creation") — later Persian-tradition copies,
  useful for cross-checking figure conventions but secondary to Doha and BnF.
- **The 1085 Valencia celestial globe**, by **Ibrāhīm ibn Saʿīd al-Sahlī** and his son Muḥammad
  (inscribed 478 AH/1085 CE), 22 cm brass, Museo Galileo, Florence — the oldest surviving Islamic
  celestial globe. Stars are small punched/engraved points at catalogued positions; outlines are
  fine incised line, not colour — a globe has no paint, only metal, and depth comes from
  engraving. Only the sphere is original; the stand is later.
- **The Lahore/Kashmir seamless celestial globes** (Mughal, 16th–17th c.; the technique invented
  by ʿAlī Kashmīrī ibn Luqmān in 1589–90, perfected by Lahore's Qāʾim Muḥammad workshop — his son
  Ḍiyāʾ al-Dīn Muḥammad alone cast roughly thirty-three between 1623 and 1691): hollow brass
  spheres cast **in one seamless piece by lost-wax casting** — thought impossible with period
  tools by modern metallurgists until these proved otherwise — with **stars inlaid as silver
  points, in three sizes of nail keyed to magnitude.** Postdates the era's 1437 endpoint by a
  century-plus, but is by far the best-documented "inlaid-point brass globe" — flag the date gap
  rather than silently importing 17th-century Lahore into a 10th–15th-century era.
- **Ulugh Beg's observatory and *Zīj-i Sulṭānī*, Samarkand, built 1428–1429, catalogue finished
  1437–1439.** A three-storey observatory whose principal instrument was a giant **meridian
  sextant (Fakhrī sextant)** trenched into a hillside, two parallel walls 40 m in radius — double
  any prior instrument of its type. The *Zīj* catalogues **1,018 stars**, independently
  re-observed rather than copied, year-length accurate to within about a minute of the modern
  value — unmatched until Tycho Brahe. The correct closing document for the era.

## 2. The grammar

Two entirely different grammars; the era should decide which one, or which per chapter.

**Manuscript grammar (al-Ṣūfī tradition):** figures as full standing human/animal forms in
contemporary Abbasid/Persianate dress, drawn with a fine confident continuous contour and filled
with flat, unmodulated colour ("Baghdad school" pre-Mongol flat colour: no chiaroscuro, no cast
shadow, a figure reads as silhouette-plus-pattern, not modelled volume). Textile pattern carries
what shading would otherwise carry. **Stars sit over the figure at their catalogued positions as
small discs, independent of anatomy** — a star lands where the table says, magnitude sometimes
lettered beside it. This separation — figure as illustration, discs as data — is exactly Orbit's
existing layering (figure behind, three named stars in front), the cleanest match here.

**Instrument grammar (globe/astrolabe tradition):** no colour, no fill, only engraved line on
metal. A globe's constellation is a continuous incised contour; its stars are **physical points
punched or inlaid into the brass**, not drawn — closer to "gold disc" language than the painted
manuscript tradition. An astrolabe's rete pushes this further: not a picture of the sky but a
**pierced, openwork map of it** — surviving material only the strapwork between named stars, each
marked by a shaped pointer (often a stylised bird's-head) engraved with that star's name, almost
entirely negative space threaded around labelled points — star data with the figure removed
entirely. Emphatically NOT present anywhere in this era: linear perspective, cast shadow,
atmospheric depth, or a painted night sky — the "sky" is always the page or the metal, never black.

## 3. Palette

| Material | Hex (approx.) | Role |
|---|---|---|
| Gold leaf, burnished | `#D4AF37` | the accent — discs, rims, illumination borders |
| Shell gold (powdered gold + gum, painted not leafed) | `#C9A227` | fine linework where leaf can't be laid — star-lettering, hair-fine outline |
| Lapis lazuli ultramarine (*lājvard*) | `#1B3F8F` | the era's most prized blue; often costlier than gold itself |
| Vermilion (ground cinnabar) | `#E34234` | figure robes, rubrication, warning/heat marks |
| Orpiment (arsenic sulfide yellow) | `#F4C430` | secondary figure colour, small ornament |
| Verdigris / malachite green | `#3E8E7E` | secondary figure colour, foliate ornament |
| Lamp-black / soot ink (*ḥibr*, *midād*) | `#241C11` | contour line, all text |
| Sized cream manuscript paper (Samarkand-paper ground) | `#EFE1C4` | the ground — page, not sky |
| Engraved brass (globe/astrolabe ground, unpainted) | `#8A6E3E` | the ground for instrument-grammar plates |

Gold is the accent, lamp-black ink is the "ink" in every sense (drawing medium and the game's
currency-name candidate), and the cream paper — not indigo, not black — is the ground: this era
draws on a lit page, and per 02-globe.md's own correct observation, does not paint the sky at all.

## 4. Lettering and how people wrote

**Scripts, in role:** **naskh** (نسخ, "copying") for running text and captions — small, rounded,
even, designed for legibility at book scale; **thuluth** (ثلث, "a third," naming the proportion of
the pen-nib's slant used in its curves) for headings, titles and anything monumental — larger,
more ornamental, permits extreme vertical extension and interlace; **kufic** — angular, no
curves, the oldest formal Arabic hand — for anything meant to look carved or struck rather than
written: cartouches, coin-like roundels, architectural bands. All three set **right-to-left**.
This era is also, not incidentally, the exact moment the proportioned system behind naskh and
thuluth was codified — Ibn Muqla (886–940) and, a generation later, Ibn al-Bawwāb (d. 1022) fixed
the "six pens" (*al-aqlām al-sitta*) as geometric ratios of a single rhombic dot cut by the nib —
so a Baghdad scribe working within a few decades of al-Ṣūfī's own lifetime is literally inventing
the rules this era's captions would be following. *(This paragraph rests on established
art-historical record rather than a page fetched this session — flagged per the brief's
instruction, though it is standard and uncontested.)*

**The instrument:** the **qalam**, a length of dried reed (traditionally from the marshes near
Wasit or Basra) cut to a nib with a knife (*qaṭṭ*), sliced at a shallow diagonal so the stroke
swells and thins purely by the angle the pen is dragged at — no pressure modulation needed, unlike
a Latin quill. **The pen never lifts within a joined run of letters**; a whole connected word (or
run of connected letters) is one continuous stroke, and only after the skeleton is fully laid does
the scribe go back and add the dots (*iʿjām*) that disambiguate letters sharing a base shape, in a
second pass. That two-pass rhythm — draw the whole joined run unbroken, dot afterward — is the
concrete motion for the game's large-hand reveal: not "one glyph at a time," but "one *run* at a
time, then a second sweep of dots." Ink was lamp-black soot bound in gum arabic (*ḥibr*, or
*midād* for the reservoir it's kept in), carried in an inkwell the qalam is dipped into, not a
self-feeding pen.

**Typefaces (all OFL, all embeddable):**

| Face | Style | Glyphs | Google Fonts | Notes |
|---|---|---|---|---|
| **Amiri** | naskh, book text | ~6,000+ (Wikipedia's figure; a narrower internal count of ~535 unique outlines plus positional/ligature variants also circulates — treat the headline number as "everything the font can produce," not base letterforms) | yes | by Khaled Hosny; revival of the Bulaq Press "Amiri" naskh; the closest OFL face to this era's actual book hand |
| **Noto Naskh Arabic** | naskh, book text | full Arabic block + extensions | yes | Google/Noto project; broad Unicode coverage, slightly more mechanical letterforms than Amiri |
| **Scheherazade New** | naskh, wide diacritic support | full Arabic + Quranic annotation marks | no (SIL) | best diacritic/mark positioning of the three; heaviest stroke weight |
| **Reem Kufi** | kufic, display | Arabic core set | yes | by Khaled Hosny; a *modern revival* kufic, geometric rather than a period-accurate monumental kufic — good enough for cartouche/roundel use, not for claiming manuscript authenticity |
| **Aref Ruqaa** | *ruqʿah*, not thuluth | Arabic core set | yes | closer to informal fast handwriting than to thuluth's formal monumental register; if a genuine thuluth-flavoured display face is wanted, none of the above is quite it and a fourth face may need sourcing later |

Unicode: **Arabic block U+0600–06FF** (256 code points, the base letters, digits, diacritics) is
the floor; captions built from presentation forms also draw on **Arabic Presentation Forms-A,
U+FB50–FDFF** (688 code points — ligatures and contextual variants mainly needed for Persian/
Urdu/Sindhi, so partially relevant given Samarkand's Persianate end of this era) and **Arabic
Presentation Forms-B, U+FE70–FEFF** — the block that actually carries the plain initial/medial/
final/isolated forms and the lām-alif ligatures every naskh caption needs.

**Shaping — concretely, for this pipeline.** Arabic is the one script in this ladder that
actually needs shaping (Egyptian quadrat stacking is a layout problem, not a glyph-substitution
one; Latin needs neither). Two real options, both checked this session:

- **(a) Manual presentation-forms table.** A small joining-class table (each letter: does it join
  to its left neighbour, right neighbour, both, neither) plus a lookup into Presentation Forms-B
  for the four positional variants, plus one special-cased lām-alif ligature, gets naskh to roughly
  95% correctness by hand — this is the brief's own estimate and it's a reasonable one; Arabic's
  joining rules are genuinely simpler than Indic reordering or Hangul composition.
- **(b) Pre-shape at build time with fontkit itself.** Confirmed this session: **fontkit ships its
  own OpenType layout engine**, `font.layout(string)`, built on an `OTLayoutEngine` that picks a
  script-specific shaper — and **fontkit has a dedicated `ArabicShaper`**
  (`src/opentype/shapers/ArabicShaper.js` in `foliojs/fontkit`) implementing the standard Arabic
  joining/ligature/mark-positioning feature stages through real GSUB/GPOS tables, not a hand-rolled
  approximation.

**Recommend (b).** The game's own pipeline already accepts that captions are a closed, known set
extracted once at build time (`scripts/glyphs.mjs` already walks `src/` for the character set
before cutting the font) — Arabic captions are no different, just bigger sentences instead of
single characters. Call `font.layout(caption)` once per caption string during the glyph-extraction
step, and store the *already-shaped* glyph-id sequence (with each shaped glyph's outline) directly
in `src/glyphs.js`, exactly as Latin glyphs are stored today. `textAlongArc` and the reveal
functions then never see raw Arabic characters at all — they place a pre-resolved run of glyph
outlines right-to-left, which is a change to iteration direction only, not a shaping engine. This
avoids writing and maintaining a joining-class table by hand, reuses a dependency the build already
has (fontkit, per `npm run glyphs`), and only degrades gracefully — if fontkit's Arabic shaper
turns out to have gaps, option (a)'s manual table remains the fallback for whatever it misses,
scoped down to only the captions that render wrong.

**Numerals:** Eastern Arabic-Indic numerals, **٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩** (0–9), are what this era's own
astronomers and scribes set numbers in (the "Arabic numerals" of the West are the *Western* Arabic
forms that travelled through Iberia — a different, later-diverging branch of the same Indian-
origin system). Set the HUD in these. One regional nuance worth knowing even if not acted on:
Samarkand and the Persianate end of this era's date range would in practice lean toward the
closely related but distinct Perso-Arabic digit forms (۰۱۲۳۴۵۶۷۸۹, notably a different four, five
and six) rather than the Mashriqi set given above — the brief specifies the Mashriqi set, so use
that, but the distinction is real if a later pass wants Samarkand-specific accuracy.

## 5. Names for the game's things

| Game term | Word | Transliteration | Gloss | Status |
|---|---|---|---|---|
| orbit / the title | فلك | *falak* | "celestial sphere," a turning, revolving thing — root meaning "to turn" | attested |
| orbit (alt., an ecliptic path specifically) | مدار | *madār* | "circuit," the track a body runs | attested |
| capture | قبض | *qabḍ* | grasping, seizing | attested (general usage; not a period gameplay term, naturally) |
| release | إطلاق | *iṭlāq* | setting loose, launching | attested |
| ink (currency) | حبر | *ḥibr* | ink, specifically the lamp-black writing ink | attested |
| ink (alt., the reservoir/stock of it) | مداد | *midād* | ink-stock, what a *ḥibr* is drawn from | attested |
| score / tally | حساب | *ḥisāb* | reckoning, calculation — the word behind *zīj* tables' whole method | attested |
| chapter | باب | *bāb* | "door" — the standard word for a book's chapter/section, incl. in al-Nadīm's *Fihrist* | attested |
| sheet | ورقة | *waraqa* | a leaf/sheet of paper | attested |
| the run | دورة | *dawra* | a circuit, a cycle — used for an orbital revolution | constructed (attested word, applied here by extension) |
| personal best | أفضل | *afḍal* | "best, most excellent" — superlative | attested (word only; "personal best" as a phrase is constructed) |
| daily plate | ورقة اليوم | *waraqat al-yawm* | "the sheet of the day" | constructed |
| catalogue | فهرست | *fihrist* | index/catalogue — the word Ibn al-Nadīm's own 10th-century book of that name fixed for exactly this sense | attested |
| attractor (danger, general sense) | جاذب | *jādhib* | "that which pulls/attracts" | attested (see §7 for the era's own depicted name, which is more specific and better) |
| repulsor (danger, general sense) | دافع | *dāfiʿ* | "that which pushes away" | attested |
| crosswind | ريح | *rīḥ* | wind | attested |
| nebula / obscurer | سحابة | *saḥāba*, or specifically **الشيء السحابي** *al-shayʾ al-saḥābī* ("the little cloud") | cloud; the second form is al-Ṣūfī's own words for the Andromeda smear | attested — al-Ṣūfī's actual phrase |
| ocean world | بحر | *baḥr* | sea | constructed application |
| crater world | حفرة | *ḥufra* | pit, hollow | constructed application |
| ringed world | ذو حلقة | *dhū ḥalqa* | "possessor of a ring" | constructed application |
| ice world | جليد | *jalīd* | ice | constructed application |
| dune world | كثيب | *kathīb* | sand dune | constructed application (Qurʾānic word, well attested in general) |
| volcanic world | جبل ناري | *jabal nārī* | "fire-mountain" | constructed — classical Arabic has no dedicated volcano-word; the compound is the honest option |
| storm world | عاصفة | *ʿāṣifa* | storm, tempest | constructed application |

Attested words are strongly preferred per the brief and used everywhere one exists; only the four
pickups, the run, the daily plate and the seven family names are genuinely constructed, and each
is flagged as such rather than dressed up as period vocabulary.

## 6. Currency and one rule

**What the era's resource actually was: gold and lapis, rationed by weight, and time.** Two
separate historical facts anchor this. First, **illumination materials were priced and measured by
weight** — gold by the *mithqal* (the standard medieval weight-unit, ~4.25 g, also the basis of the
gold dinar coin itself) and lapis lazuli sometimes costing *more* than the gold it sat beside on
the page, imported as it was from a single source region (Badakhshan, in what is now Afghanistan)
and processed at real expense to extract usable ultramarine from raw stone. Second, **scribal and
illuminator labour was itself paid, by the unit of work done**: a documented 15th-century Herat
account shows a calligrapher paid 250 dinars per thousand copied couplets — real, attested,
period-typical piece-work pricing — and "Chinese" paper billed at 20 dinars a page in the same
account. A luxury manuscript with full gold illumination could cost as much as a house. The
resource, in short, was never free-flowing: every gold disc and every lapis wash was a rationed,
weighed, purchased quantity, and every line of finished text was paid labour.

**The "no twist" reading:** ink stays ink, renamed. Rename `INK_REACH`'s currency to *ḥibr* in
the HUD, keep every number identical. This alone would be honest to the record — an atlas page's
ink genuinely was rationed by the well.

**The proposed twist, grounded in the twice-drawn convention specifically (§1, §2):** al-Ṣūfī drew
every constellation twice for a stated pedagogical reason — so the globe view and the sky view
would never be mistaken for each other. Orbit already mirrors a constellation's fork onto the
branch side it spawns from; make that mirroring *count*. **A constellation traced to completion on
one fork spawns its mirrored twin later in the same run, on the opposite side of the chart,
worth its own +60 only if traced within the same chapter** — echoing al-Ṣūfī's own logic that the
two drawings must agree, and rewarding a player who recognises the same figure reversed rather
than one who only ever plays one side of the fork. This slots into the existing economy without
new numbers: it reuses `CONSTELLATIONS`' existing fork/mirror machinery and the existing +60/4s-
reprieve constellation-completion reward, just gated on a second, mirrored instance of the same
figure appearing before the chapter ends. It costs a spawn-scheduling rule, not a new stat.

## 7. Dangers

Per DANGERS.md's option A (depiction only, safe under the current architecture): same three rows,
this era's own name and image over each.

- **Attractor — al-Jawzahar / raʾs al-tinnīn ("the head of the dragon").** Verified and more
  specific than 02-globe.md's phrasing: Islamic astronomy inherited a Middle Persian concept
  (*gōzihr*) of an eighth, invisible "planet" responsible for eclipses, identified with the Moon's
  two orbital nodes — the ascending node is *raʾs al-tinnīn* / *raʾs al-jawzahar* ("head of the
  dragon"), the descending node *dhanab al-tinnīn* / *dhanab al-jawzahar* ("tail"). Depict as a
  coiled dragon/serpent whose head is the pull. Separately and just as well attested: **al-Ghūl**
  ("the ghoul"), the desert demon that gives the star Algol its name (*raʾs al-ghūl*, "the demon's
  head") — a second, equally valid attractor-name if the dragon reads as too close to Egypt's Apep.
  Either is real and period; use one, not both, to avoid diluting the row.
- **Repulsor — al-Shams' burning.** As 02-globe.md already has it: the sun figured on an
  astrolabe or in a manuscript throws heat as radiating lines from a gilt disc. No new correction
  needed here; it is squarely attested practice (sun-figures with radiating rays are standard
  astrolabe/manuscript iconography) even though no single named "sunspot" concept exists in this
  record the way Galileo's does for era III.
- **Crosswind — al-Rīḥ, or specifically simoom (*sammūm* / *nār al-samūm*, "fire of the scorching
  winds").** *Sammūm* is the period/regional name for the specific violent hot desert wind, more
  vivid and more specific than the bare word for "wind"; use it in the caption, gloss it with
  *al-Rīḥ* as the general term.
- **Obscurer/nebula — al-shayʾ al-saḥābī, "the little cloud."** Al-Ṣūfī's own words, used of the
  Andromeda nebula (M31) in his Andromeda chapter — the earliest surviving description of a galaxy
  beyond the Milky Way anywhere in the historical record — and, separately, of the Large
  Magellanic Cloud as visible from southern Arabia. This is the one hazard row where the *name* is
  perfectly attested and the *drawing convention* genuinely is not (DANGERS.md already flags this
  correctly) — no period image of a nebula as a hazard-shape exists to copy, so the game would be
  inventing the depiction while borrowing only the name and the astronomical fact.

## 8. The seven families

Two legitimate renderings depending which grammar (§2) the plate leans on; describe both so the
artist can pick, or alternate by chapter.

**Manuscript mode (gilt roundels, flat colour):** a disc of flat, unmodulated colour with a fine
dark contour and a burnished gold rim; interior carries pattern rather than shading, and pattern
*density* — how tightly the interior motif crowds toward one edge — is the only depth cue this
grammar allows itself. *Ocean* = a plain lapis disc, unornamented, calmest of the seven. *Crater*
= the disc broken by small dark contour circles scattered per the ordinary Islamic geometric-
tessellation logic, not as impact geology. *Ringed* = one or two concentric gold bands set inside
the rim, the plainest and most emblematic reading. *Ice* = pale ground, fine silver (not gold)
contour hatching. *Dune* = repeating chevron/wave interlace, warm ochre. *Volcanic* = vermilion
ground, the pattern crowded hard to one edge, rubrication-red. *Storm* = the densest interlace of
the seven, indigo-on-lapis, verging on illegible the way a real storm-band ornament does.

**Instrument mode (engraved brass, inlaid points):** no colour at all. Each family is a fine
incised contour circle on brass, and the difference between families is carried entirely by **the
density and pattern of engraved hatch-lines inside the circle** plus, where a family calls for a
ring, a second incised circle set inside the first rather than a gold band. This is the harder,
more abstract of the two modes but the more historically defensible one for anything explicitly
staged as a globe or astrolabe chapter-plate (§10).

## 9. Chart furniture, frame, HUD

Manuscript-mode furniture: a plain ruled border, sometimes a fine gold rule inside it; a colophon
at the close of the text (scribe's name, place, date — exactly the kind of line whose disputed
accuracy opens this document); no cartouche in the European engraved-atlas sense, no scale bar —
this tradition doesn't chart the sky to a projection grid the way era III does, it *lists and
draws*, table and figure side by side, not a single unified plate. Instrument-mode furniture: an
astrolabe's outer ring is graduated in degrees, sometimes double-banked (solar and zodiacal
scales); its throne and shackle at the top are the closest thing to a maker's mark, alongside an
engraved dedication. A globe's furniture is its brass meridian ring and horizon ring, both
graduated, holding the sphere rather than framing a page. For the game's HUD: keep the double-rule
plate-mark discipline the engine already has for era III, but drop RA/declination hour-ticks (a
grid convention this era doesn't use) in favour of a graduated ring-scale reading like an
astrolabe's limb; a colophon-style line at run's end (scribe/place/date, i.e. player name/plate/
seed) is a natural, attested-shaped fit for the existing end-screen.

## 10. Four chapter plates

1. **Orion, *al-Jabbār* ("the Giant"), in both views** — sky and mirrored globe view side by side
   or cross-faded, pulled from the Doha 1125 copy in preference to Marsh 144.
2. **The 1085 Valencia globe seen close** — engraved brass, incised figures, punched star-points,
   no colour at all; the clearest possible demonstration of instrument-mode grammar.
3. **An astrolabe's rete** — the openwork star-map itself, its bird's-head pointers each labelled
   with a star's name, read against its graduated limb.
4. **The Samarkand observatory's Fakhrī sextant** — the trench-cut double-walled arc, 40 m radius,
   built into the hillside itself rather than a portable instrument; the era's observational
   high-water mark and its literal architecture.

## 11. Sound

- The **qalam's nib** scratching a joined run onto sized paper — drier and finer-grained than a
  quill, no ink-blot pop at stroke-ends because the reed doesn't load the way a quill does.
- A **dip into the inkwell** between runs — a small, wet, contained sound, not continuous flow.
- **Gold leaf being burnished** — a soft, dry, insistent rubbing/polishing sound, rhythmic,
  distinct from a wet brush stroke.
- A **brass globe or astrolabe struck or tapped** — a dull, warm metal ring, quickly damped (solid
  cast brass rings far less than sheet metal).
- **Vellum/heavy paper leaves turning** — a stiffer, thicker sound than era III's laid paper, with
  a faint mineral-grain rasp from the sizing.
- A **dragon/serpent hiss-and-coil** cue for the attractor's approach, distinct from era III's
  liquid vortex-pull sound — dry rather than wet.

## 12. Risks and open questions

- **Arabic shaping is real, scoped work**, per LETTERING.md's own flag — but this session confirms
  it is *tractable* work with a known tool (fontkit's own `ArabicShaper`), not a research gap.
  Spike it early: extract and pre-shape one full caption string through `font.layout()` before any
  other era-II asset is built, and confirm the resulting glyph outlines actually stroke on cleanly
  through the existing `penLettering`/`writeText` machinery.
- **Manuscript dating is contested, and this file's own confidence should be held loosely.** Marsh
  144's redating is real (multiple independent mentions found this session) but this session did
  not reach the primary codicological paper making the case, only secondary summaries — the exact
  redated range (given here as "end of the 12th century") should be pinned to a named source before
  it goes in any player-facing copy.
- **Two grammars, one era.** §2 and §8 both had to describe a manuscript mode and an instrument
  mode because the record genuinely doesn't converge on one look the way, say, era III's engraving
  tradition does. The era needs an explicit decision — one grammar per whole era, or per chapter —
  before art begins; building both halfway is the likely failure mode.
- **The obscurer has a name but no drawing tradition** (§7) — flagged already in DANGERS.md, and
  confirmed here: nothing found this session shows a period image of "the little cloud" as
  anything other than a few plotted dots near Andromeda's mouth. The game will have to invent this
  one depiction while keeping everything else attested.
- **The Mughal seamless-globe material (§1) postdates the era's stated 1437 endpoint by up to two
  centuries.** It's included because it is by far the best-documented "inlaid-point brass globe"
  source, but using it uncritically would mean quietly importing 17th-century Lahore into a
  10th–15th-century era; either bound the era's globes to the 1085 Valencia piece alone, or extend
  the era's own stated date range, but don't do neither.
- **Font choice for thuluth remains open** — Aref Ruqaa is *ruqʿah*, not thuluth, and Reem Kufi is
  a modern geometric revival rather than a period monumental kufic; if the era wants a genuinely
  thuluth-flavoured heading face distinct from its naskh body face, none of the five faces
  researched here quite delivers it, and a further font search is needed before the "three faces
  as a plate token" pattern (per LETTERING.md) can be filled in for this era.

## 13. Sources

- https://commons.wikimedia.org/wiki/Category:Kit%C4%81b_%E1%B9%A2uwar_al-kaw%C4%81kib_(al-th%C4%81bitah)_(Bodleian_Library_MS._Marsh_144)
- https://www.sothebys.com/buy/d59903e9-de07-4f89-907a-86415176ba9b/lots/7bab06d1-7b64-4b76-bc9e-bd790dc7cbca
- https://www.academia.edu/84171207/Al_Sufi_and_Son_Ibn_Al_Sufi_s_Poem_on_the_Stars_and_Its_Prose_Parent
- https://www.metmuseum.org/art/collection/search/446297
- http://www.ianridpath.com/startales/alsufi.html (via search summary)
- https://en.wikipedia.org/wiki/The_Book_of_Fixed_Stars (via search summary)
- https://commons.wikimedia.org/wiki/File:Al-Sufi's_Orion,_1125_Baghdad_copy,_Doha_Museum_of_Islamic_Art_Ms_2._1998._SO.jpg
- https://www.academia.edu/11565988/The_Most_Authoritative_Copy_of_%CA%BFAbd_al_Rahman_al_Sufi_s_Tenth_century_Guide_to_the_Constellations (Savage-Smith, 2013)
- http://messier.obspm.fr/more/m031_alsufi.html
- https://en.wikipedia.org/wiki/Ibrahim_ibn_Said_al-Sahli (via search summary)
- https://catalogue.museogalileo.it/object/CelestialGlobe_n14.html
- http://drseeminrubab.blogspot.com/2011/12/seamless-celestial-globe.html
- https://www.si.edu/object/islamic-celestial-globe:nmah_694630
- https://en.wikipedia.org/wiki/Zij-i_Sultani (via search summary)
- https://webspace.science.uu.nl/~gent0113/ulughbeg/ulughbeg_star_catalogue.htm (via search summary)
- https://www.britishmuseum.org/blog/seeing-stars-astrolabes-and-islamic-world
- https://www.metmuseum.org/learn/educators/curriculum-resources/art-of-the-islamic-world/unit-four/featured-works-of-art/image-16
- https://en.wikipedia.org/wiki/Aja%27ib_al-Makhluqat (via search summary)
- https://www.nature.com/articles/s40494-018-0217-y (Islamic manuscript materials/pigments)
- https://www.tandfonline.com/doi/full/10.1080/00393630.2026.2619152 (ultramarine/lapis in Persian sources)
- https://en.wikipedia.org/wiki/Amiri_(typeface) / https://fonts.google.com/specimen/Amiri / https://github.com/aliftype/amiri
- https://en.wikipedia.org/wiki/Scheherazade_New
- https://github.com/foliojs/fontkit (`src/opentype/shapers/ArabicShaper.js`) / https://deepwiki.com/foliojs/fontkit/6.2-opentype-shaping-(gsub-and-gpos)
- https://www.unicode.org/charts/PDF/UFB50.pdf ; https://en.wikipedia.org/wiki/Arabic_Presentation_Forms-A ; https://en.wikipedia.org/wiki/Arabic_Presentation_Forms-B
- https://en.wikipedia.org/wiki/Zuhal / https://en.wikipedia.org/wiki/Qamar (via search summary)
- https://en.wiktionary.org/wiki/%D9%81%D9%84%D9%83 (falak)
- https://en.wikipedia.org/wiki/Al-Fihrist
- https://www.iranicaonline.org/articles/gozihr/ (jawzihr/al-jawzahar)
- https://www.etymonline.com/word/Algol ; https://earthsky.org/brightest-stars/algol-the-demon-star/
- https://en.wikipedia.org/wiki/Nar_as-samum
- https://www.iranicaonline.org/articles/paper-iran-prior-printing/ (copyist fees, paper costs)
- https://www.researchgate.net/publication/235761489_A_Brief_History_of_Money_in_Islam_and_Estimating_the_Value_of_Dirham_and_Dinar
- https://www.dailyartmagazine.com/lapis-lazuli-pigment/
