# V · The Globe

**Islamic Golden Age, 964 CE (al-Ṣūfī) to 1437 CE (Ulugh Beg).** The moment the constellations
stopped being a story and became a catalogue with pictures — and, incidentally, where most of the
star names in use today come from.

## The documents

- **ʿAbd al-Raḥmān al-Ṣūfī, *Kitāb ṣuwar al-kawākib al-thābita*** ("Book of the Images of the Fixed
  Stars"), composed c. 964 CE — a systematic revision of Ptolemy's *Almagest*, magnitudes
  re-observed, Arabic star-names given beside the Greek figures. Every constellation drawn
  **twice**, once from a globe looking out, once looking up at the sky, deliberately mirrored — al-
  Ṣūfī's own stated reason: so a viewer is "not confused if he saw the figure on the globe differing
  from what he sees in the sky." Teaching logic, already half built into Orbit's own fork mirroring.
- **Museum of Islamic Art, Doha, MS.2.1998.SO**, April 1125 CE, Baghdad — "the most authoritative
  copy" of al-Ṣūfī's work (Savage-Smith, 2013), now the strongest grammar source. **Correction to
  the previous file:** Bodleian MS Marsh 144's colophon claims 1009 CE, but recent codicological
  work redates it to the end of the 12th century — prefer Doha 1125, not Marsh 144, as the earliest.
- **The 1085 Valencia celestial globe**, Museo Galileo — the oldest surviving Islamic celestial
  globe, brass, stars as small punched points, no colour: a globe has only metal.
- **The Lahore/Kashmir seamless celestial globes** (Mughal, 16th–17th c.) — hollow brass cast in one
  seamless piece, stars inlaid as silver points sized to magnitude. Postdates this era's 1437
  endpoint by a century-plus; flagged rather than silently imported.
- **Ulugh Beg's *Zīj-i Sulṭānī*** (Samarkand, finished 1437) — 1,018 independently re-observed
  stars, a three-storey observatory whose Fakhrī sextant trenched 40 m into a hillside. The correct
  closing document for the era.

## The grammar

Two grammars survive and the record doesn't converge on one: the **manuscript page** (al-Ṣūfī
tradition) and the **instrument** (globe/astrolabe). This era ships the manuscript page, per
DECISIONS.md §4, not the brass instrument. Figures are full standing human/animal forms in
Abbasid/Persianate dress, a confident continuous contour filled with flat, unmodulated colour
("Baghdad school": no chiaroscuro, no cast shadow, a figure reads as silhouette-plus-pattern);
textile pattern carries what shading would elsewhere. **Stars sit over the figure at their
catalogued positions as small gold discs, independent of anatomy** — exactly Orbit's existing
layering, figure as illustration, discs as data. The instrument grammar — no colour, only engraved
line and inlaid points — appears only once, small, as a colophon vignette. Never present: linear
perspective, cast shadow, or a painted night sky — the sky is always the page, never black.

## Palette

| Swatch | Hex | Role |
|---|---|---|
| Gold leaf, burnished | `#D4AF37` | the accent — discs, rims, borders |
| Shell gold | `#C9A227` | fine linework, star-lettering |
| Lapis lazuli (*lājvard*) | `#1B3F8F` | the era's costliest blue, often pricier than gold |
| Vermilion | `#E34234` | robes, rubrication |
| Orpiment | `#F4C430` | secondary figure colour |
| Verdigris / malachite | `#3E8E7E` | secondary figure colour, foliate ornament |
| Lamp-black soot ink (*ḥibr*) | `#241C11` | contour line, all text |
| Sized cream manuscript paper | `#EFE1C4` | the ground — page, not sky |
| Engraved brass | `#8A6E3E` | instrument-grammar ground, vignette only |

## Lettering and the hand

**Naskh** for running captions, **thuluth** for anything monumental, **kufic** for cartouches and
coin-like roundels — all three right-to-left. The **qalam**, a cut reed pen, swells and thins by
drag angle, no pressure modulation, and never lifts within a joined run of letters; only after the
skeleton is laid does the scribe add the dots (*iʿjām*) in a second pass — draw the run unbroken,
then a sweep of dots, the concrete motion for this era's large-hand reveal. **Pipeline:** fontkit
ships its own `ArabicShaper` (`src/opentype/shapers/ArabicShaper.js`), real GSUB/GPOS joining and
mark-positioning — per DECISIONS.md §4, captions are pre-shaped at build time via `font.layout()`
and the resolved glyph sequence stored exactly as Latin glyphs are today, so `textAlongArc` places a
pre-resolved right-to-left run and never sees raw Arabic characters.

| Face | Style | Licence |
|---|---|---|
| Amiri | naskh, book text | OFL |
| Noto Naskh Arabic | naskh, book text | OFL |
| Scheherazade New | naskh, wide diacritics | SIL |
| Reem Kufi | kufic, display | OFL |
| Aref Ruqaa | *ruqʿah*, not thuluth | OFL |

No genuine OFL thuluth display face was found; Reem Kufi is a modern geometric kufic revival, fine
for cartouches, not for claiming manuscript authenticity. Numerals: Eastern Arabic-Indic
٠١٢٣٤٥٦٧٨٩.

## Names

Attested unless marked constructed.

| Game term | Era's word | Gloss | Status |
|---|---|---|---|
| ocean / crater | *baḥr* / *ḥufra* | sea / pit | constructed application |
| ringed / ice | *dhū ḥalqa* / *jalīd* | "ring-possessor" / ice | constructed / constructed |
| dune / volcanic | *kathīb* / *jabal nārī* | dune / "fire-mountain" | constructed |
| storm | *ʿāṣifa* | storm | constructed application |
| orbit / title | *falak* | celestial sphere, "to turn" | attested |
| orbit (path) | *madār* | circuit, the track a body runs | attested |
| capture / release | *qabḍ* / *iṭlāq* | grasping / setting loose | attested |
| ink (currency) | *ḥibr* | lamp-black writing ink | attested |
| score | *ḥisāb* | reckoning, the method behind *zīj* tables | attested |
| chapter / sheet | *bāb* / *waraqa* | "door" / a leaf of paper | attested |
| best / daily plate | *afḍal* / *waraqat al-yawm* | "most excellent" / "the day's sheet" | attested word / constructed |
| catalogue | *fihrist* | index, al-Nadīm's 10th-c. sense | attested |

Pickups (sling, shield, reflector, inkwell) are outside the research's own name table; the prototype
builds them from attested general vocabulary (*miqlāʿ*, *dirʿ*, *rādd*, *dawāh*) rather than
inventing outright, marked constructed application throughout.

## Currency and the rule

**Gold and lapis, rationed by weight.** Illumination materials were priced by weight — gold by the
*mithqal* (~4.25 g, the gold dinar's own basis), lapis sometimes costing *more* than the gold beside
it; scribal labour was paid by the unit of work (a 15th-c. Herat account: 250 dinars per thousand
copied couplets). Per DECISIONS.md §2: rename only — ink stays ink, renamed *ḥibr* in the HUD, every
number identical, since an atlas page's ink genuinely was rationed by the well.

*Deferred:* the twice-drawn convention — a constellation traced to completion on one fork spawns its
mirrored twin later in the same run, worth its own +60 if traced within the same chapter, echoing
al-Ṣūfī's own logic that globe and sky views must agree. A spawn-scheduling rule, held back as class
B under DECISIONS.md §2.

## Dangers

Depiction only, same four rows, this era's name and image over each.

| Danger | Name | Depiction |
|---|---|---|
| Attractor | *raʾs al-tinnīn* | the ascending lunar node as a coiled dragon whose head is the pull — the equally attested **al-Ghūl** is held back to avoid diluting the row |
| Repulsor | al-Shams' burning | the sun figured on an astrolabe, heat as radiating lines from a gilt disc |
| Crosswind | *al-Rīḥ* (*sammūm*) | the specific violent hot desert wind, glossed by the general word for wind |
| Obscurer | *al-shayʾ al-saḥābī* | "the little cloud," al-Ṣūfī's own words for the Andromeda nebula — the name is attested, the drawing convention is invented by necessity |

## The seven families

Gilt roundels: a disc of flat, unmodulated colour, a fine dark contour, a burnished gold rim;
interior carries pattern, not shading — density, how tightly the motif crowds toward one edge, is
the only depth cue allowed. Ocean: a plain lapis disc, unornamented. Crater: broken by small dark
contour circles, tessellation logic rather than impact geology. Ringed: one or two concentric gold
bands inside the rim. Ice: pale ground, fine silver hatching. Dune: repeating chevron/wave
interlace, warm ochre. Volcanic: vermilion ground, pattern crowded hard to one edge. Storm: the
densest interlace of the seven, indigo-on-lapis, verging on illegible as a real storm-band would.

## Frame and furniture

A plain ruled border, sometimes a fine gold rule inside it; a colophon at the close (scribe's name,
place, date). No European-style cartouche, no scale bar — this tradition lists and draws, table and
figure side by side, not one unified plate. Keep the double-rule plate-mark discipline era VI
already has, but drop the RA/declination hour-ticks for a graduated ring-scale reading like an
astrolabe's limb; a colophon-style end-of-run line (scribe/place/date → player/plate/seed) fits.

## The signature sheet

First build: **Orion, *al-Jabbār* ("the Giant"), in both views** — sky and mirrored globe view side
by side, pulled from the Doha 1125 copy, the clearest teaching moment the ladder has: the mirroring
is functional and already half-built. Later enrichment adds the other three: the 1085 Valencia globe
seen close, no colour; an astrolabe's rete, its bird's-head pointers labelled with star names; the
Samarkand observatory's Fakhrī sextant, a trench cut into the hillside.

## Sound

The qalam's nib scratching a joined run onto sized paper, drier than a quill; a dip into the
inkwell between runs, small and contained; gold leaf being burnished, a soft dry rhythmic rub; a
brass globe tapped, a dull warm ring quickly damped; heavy paper leaves turning, a mineral rasp; a
dragon hiss-and-coil for the attractor's approach, dry, not the engraving era's liquid pull.

## The prototype

`docs/eras/prototypes/globe.html` builds the manuscript-page grammar throughout: sized cream paper,
fine brown-black contour, flat colour fills, gold discs for stars over the figure, lapis and
vermilion the prized accents; the instrument grammar appears once, small, as a colophon vignette.
Its header records the choice made where research offered options — *raʾs al-tinnīn* over al-Ghūl
for the attractor — and builds pickup names from attested general vocabulary since the research's
own table doesn't cover them. **Divergence from the decided pipeline:** the prototype relies on the
browser's own bidi/shaping (`ctx.direction='rtl'`, plain `fillText`), not fontkit's `ArabicShaper` —
DECISIONS.md §4 commits the shipped build to build-time pre-shaping instead, so this is a fallback
to verify against, not the final pipeline.

Painter verdict: _to be recorded in PROTOTYPES.md_.

## Risk

Arabic shaping is tractable with a known tool (fontkit's `ArabicShaper`) but real, scoped work —
spike it early: pre-shape one full caption via `font.layout()` before any other asset is built, and
confirm the outlines stroke cleanly through `penLettering`/`writeText`. Two grammars exist for one
era; building both halfway is the failure mode DECISIONS.md's manuscript-page choice heads off, but
the instrument vignette still needs its own small spike. The obscurer has an attested name but no
attested drawing tradition — the depiction is invented while only the name is real. The Mughal
seamless-globe material postdates the era's 1437 endpoint by up to two centuries (flagged, not
silently imported). Marsh 144's redated range still needs pinning to a named primary source. A
genuine OFL thuluth display face is still missing.
