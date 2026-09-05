# III · The Ceiling

**Egypt, c. 1479–1458 BCE.** The sky as it was painted on the underside of a tomb, where the point was never to help anyone find a star — and, alongside the tomb ceiling, a real coexisting grammar of grids and tables the game's own node lattice already resembles.

## The documents

- **Senenmut's astronomical ceiling, tomb TT353, Deir el-Bahri** (XVIII Dynasty, joint reign of
  Hatshepsut and Thutmose III). The oldest known Egyptian celestial diagram, in two panels: a
  **northern panel** of twelve month-circles, each divided into twenty-four segments, with the
  circumpolar *ikhemu-sek* ("the imperishable ones") and the five planets as *ikhemu-wretju*
  ("the stars that know no rest") sailing in barques; and a **southern panel** carrying the
  decanal star list, with **Sah** (Orion) striding, **Sopdet** (Sirius/Sothis) seated behind him,
  a hippopotamus figure holding a mooring post, and **Meskhetiu** (the Bull's Foreleg, our Big
  Dipper) tied to it — the one certainly identified constellation on the ceiling. A Metropolitan
  Museum facsimile by Charles K. Wilkinson is published and photographed.
- **Diagonal star tables ("star clocks")**, Middle Kingdom coffin lids, predominantly from Asyut
  with single examples from Thebes, Gebelein and Aswan. Decan names against thirty-six ten-day
  weeks, read diagonally — the era's real chart form, a literal table, no figures at all.
- **Ramesside star clocks**, royal tombs (KV6, KV1, KV9), c. 12th century BCE — a roughly
  twelve-column-by-seven-row grid of stars keyed to individual body parts of a seated figure
  ("upon the heart," "the right eye"). The single most useful document for this era's gameplay:
  the closest thing in the whole ladder's record to the game's own tangent/release geometry.
- **The Book of Nut**, from the Osireion at Abydos and the tomb of Ramesses IV — Nut arched over
  the earth, swallowing the sun at her mouth each evening and birthing it at dawn, Shu kneeling
  beneath her holding her apart from Geb, decans annotated onto her body: the figure *is* the
  diagram.
- **The Dendera zodiac** (Ptolemaic, c. 50 BCE, Louvre) — much later and already contaminated by
  imported Babylonian/Greek zodiacal signs, but the best-preserved circular Egyptian sky and the
  one everyone recognises. Use it as a chapter plate, not as the era's grammar.

## The grammar

Flat. No perspective, no vanishing point, no light source, no gradient, no atmospheric depth — structurally absent from every document above, including the latest and most sophisticated (Dendera). Figures stand in the canonical composite view (frontal torso, profile head and legs, frontal eye); bodies are flat coloured discs or upright figures with a heavy black keyline, never spheres, never shaded toward a limb. Two grammars actually coexist: the **figure-register grammar** (Senenmut's southern panel, the Book of Nut) — deities and animals standing for constellations at a fixed scale, captioned in hieroglyph columns; and the **table grammar** (diagonal star clocks, and differently the Ramesside clocks) — no figures at all, or one figure as a coordinate origin, the chart literally rows and columns. The tension this era poses the game is with *depth*, not structure — a grid of nodes and Egypt are not in tension; modelling, foreshortening, and (outside Dendera) circular composition are.

## Palette

| Pigment | Hex | Role |
|---|---|---|
| Egyptian blue | `#1B4D8C`–`#2A6099` | night ground / Nut's flesh; hue shifts with grind fineness |
| Red ochre | `#A63B23` | outline sketch, flesh of male figures |
| Yellow ochre | `#C9A227` | flesh of female figures, secondary fill |
| Orpiment | `#F4C430` | the era's real gold accent — a deliberate, cheaper stand-in for gold leaf |
| Malachite / green frit | `#145A32` | vegetation, the Nile, occasional deity skin |
| Carbon black | `#1B1B1B` | final linework, hair, night sky dots |
| Huntite / gypsum white | `#F1EAD9` | highlights, star discs, garments |
| Ground: plaster cream | `#E8DCC0` | southern/decan panels, daylight registers |
| Ground: deep blue | `#0B1830`–`#12244A` | northern panel and any night sky |

Gold leaf itself was reserved for coffins, masks and divine flesh elsewhere, never a painted ceiling — but orpiment is chosen precisely because it reads as gold at a fraction of the cost, and painters used that substitution deliberately. The era's honest "gold" is orpiment, not an absence.

## Lettering and the hand

Hieroglyphs, set in vertical columns, read into the row by which way the glyphs face rather than a fixed left/right convention. The instrument for tomb-wall work was a reed brush cut from *Juncus maritimus* and chewed at the tip to fray it into a soft brush, worked from a palette carrying two dry ink cakes — black (carbon soot) and red (iron-rich ochre) — rewetted with a damp brush. The confirmed wall sequence is **four** steps, not three: a draftsman **sketches in red**, a senior artist **corrects in black**, painters **flood** flat colour region by region, and a final **black outline** closes every edge and adds fine detail last — that final pass is what reads as "the drawing" to a modern eye. Fonts: **Noto Sans Egyptian Hieroglyphs** (OFL 1.1, © The Noto Project, 1,079 glyphs, U+13000–1342F), embeddable and subsettable through `scripts/glyphs.mjs` like any other face. Pipeline note: real hieroglyphic text packs two to four small glyphs into one full-size sign's square footprint — **quadrat stacking** — and no font or canvas text performs that layout; the format-control codepoints that describe it (U+13430–1345F) render, at best, as their own near-invisible characters. The pipeline has to fake it by hand: group source characters at authoring time and lay each group's glyphs into a shared cell, exactly as `textAlongArc` already places glyphs individually. Hieratic, the real cursive hand, is confirmed not usably encoded in Unicode and is a dead end for any caption face. Numerals are base-10, additive, no place value, no zero, conventionally stacked in tidy blocks — a genuine solution to the game's own small-count legibility problem, recommended for small HUD counters only; Hindu-Arabic digits, set in the hieroglyph caption face, carry the score itself.

## Names

Attested words are preferred throughout; constructed extensions and merely-recalled dictionary entries are marked.

| Game term | Egyptian word | Gloss | Status |
|---|---|---|---|
| Ocean world | *mw* | water | attested (family-naming constructed) |
| Crater world | — | pockmarked disc | constructed, no attested source |
| Ringed world | *bḥdty* | the winged sun-disc of Horus of Edfu | attested motif, applied by analogy |
| Ice world | *ḥḏ* | white / silver | attested |
| Dune world | *dšrt* | "the red land," the desert | attested |
| Volcanic world | Sekhmet (*Sḫmt*) | the fire/plague goddess, an aspect of the Eye of Ra | attested deity, by analogy |
| Storm world | Set (*Stẖ*) | god of storms, chaos, foreign deserts | attested |
| Slingshot | *wp rnpt* | "opener of the year" — Sopdet's heliacal rising, resetting the calendar | attested phrase, applied by analogy |
| Shield (Scutum) | *ikm* | shield | attested |
| Reflector (Repulsa) | *ḫsf* | "to repel, turn back" | recalled |
| Inkwell | *gsti* | scribe's palette | recalled |
| Orbit | *pḫr* | "to go around, circle" | attested, extended usage |
| Capture | *jṯi* | "to seize, take possession of" | recalled |
| Release | *wn* | "to open" | recalled, constructed usage |
| Currency (ink) | *ḫꜣr* (khar) | a grain-volume measure, ~76.9 L, paid to Deir el-Medina workers | attested unit |
| Score | *ḥsb* | "to count, reckon" | recalled |
| Chapter / sheet | *wnwt* | "hour" — the Amduat's own 12-part night structure | attested structure, corrects "register" |
| Personal best | — | no attested equivalent | constructed |
| Daily plate | *hrw* | "day" | attested word, constructed application |
| Title "Orbit" | Nut (*Nwt*) / *pḫr* | the sky goddess arched over everything, or "the circling" | attested, evocative rather than literal |

"Register" is a modern Egyptological/art-historical term describing the composition, not an ancient Egyptian word — useful as a design term but not as the era's own vocabulary; *wnwt* ("hour") is the better-attested fit for "chapter."

## Currency and the rule

Currency is *khar*, the grain ration — the record's real answer is grain, not gold. Deir el-Medina, the walled village of the royal tomb-builders, paid workers a fixed monthly grain ration; the strike of year 29 of Ramesses III, when rations arrived nearly a month late, is recorded on the Turin Strike Papyrus, one of the best-documented labour actions in the ancient world, and anchors the currency directly. Rule (class A): **rename only** — ink becomes *khar*, spent and gained exactly as shipped, with the inkwell pickup standing for the ration itself; no schedule or number changes. Deferred: the research's own twist — a flat *khar* dividend paid every tenth row, independent of how that stretch was flown, echoing the ten-day week the ration was paid against — was graded a "B" economy rule by the research itself, not a free "A," and is held back pending the same sign-off DANGERS.md defers.

## Dangers

| Row | Name | Depiction |
|---|---|---|
| Attractor | **Apep** | The serpent that ambushes the sun god's bark nightly in the underworld, a recurring threat survived rather than defeated — drawn coiled flat within a register. |
| Repulsor | **The Eye of Ra** | The scorching solar disc sent out as Sekhmet, or simply radiating uraei — "pushes outward, small lethal core," survivable at range, dangerous only close in. |
| Crosswind | **Shu** | The god of air, physically holding Nut and Geb apart — drawn kneeling with raised arms, a myth that already describes "holds things at a steady distance." |
| Obscurer | **Nun** | The formless waters before creation, everywhere and nowhere — the natural fit for an inert fog patch that hides rather than harms. |

## The seven families

**Ocean** is a flat mid-blue Egyptian-blue wash with a wave-line hatch near the rim standing in for the *mw* sign, no gradient, no reflection. **Crater** is the ochre disc with small black dot-and-ring marks scattered irregularly, the same shorthand tomb painters used for hide spots or stone texture. **Ringed** flattens the winged sun-disc silhouette into a circle with a horizontal band, two raised wing-shapes either side reading, at this scale, as a ring. **Ice** is a huntite-white disc with a thin black keyline and nothing else, its difference simply being the one pale disc among ochre and blue neighbours. **Dune** is a red-ochre disc, unornamented, sometimes a thin wave-hatch suggesting drift. **Volcanic** is the same red recoloured toward Sekhmet's fire, a rubricated disc with a small hatched flame tuft echoing the uraeus. **Storm** is a hatched, turbulent-edged disc in a darker tone, the hatching irregular rather than volcanic's single tuft.

## Frame and furniture

A tomb ceiling has no frame in the atlas sense — its boundary is the room's own architecture, and its furniture is the register grid itself plus hieroglyphic captions beside every figure. The **cartouche** (*shenu*, "that which encircles"), the oval ring around a royal name, is a genuine, structurally simple element and the natural home for a player's initials or best-score readout. The civil calendar — season (*Akhet*/*Peret*/*Shemu*), month, day — is a real dating formula and a better fit for the daily plate's date line than a generic "day N." Rim captions become decan-name columns beside the main orbit, as on the Senenmut ceiling itself. There is no colophon in the modern sense; a scribe's dedication text is the closest equivalent and a weaker fit than era VI's imprint line — probably not worth forcing.

## The signature sheet

**The southern panel of the Senenmut ceiling** — Sah striding, Sopdet seated behind him with her star, the decan-name columns running beside them (the prototype substitutes Meskhetiu for Sah, since research names it the one certainly identified constellation and its mooring-post story gives the figure something to do). Later enrichment adds the other three from the research: the northern panel (the twelve month-circles), a Ramesside star clock (the twelve-by-seven body-keyed grid), and the Book of Nut (Nut arched across the whole sheet).

## Sound

A grinding pigment-grind (orbit-hold), a single wet dab (capture), a dry brush-flick (perfect release), a low stone thud (death), a sistrum rattle (constellation complete/medal).

## The prototype

`docs/eras/prototypes/ceiling.html` exists and paints the southern-panel scene. Its header comment records: **Noto Sans Egyptian Hieroglyphs** loaded locally (falling back to hand-drawn pictographs, never a system font, if it fails to load); five caption glyphs copied byte-for-byte from the research file, every other caption spelled phonetically from Gardiner's uniliteral alphabet plus four one-sign logograms, each codepoint individually looked up this session; the title set as "Nwt" over "*pḫr*"; Meskhetiu chosen over Sah for the constellation; the currency rendered as the research's own no-twist reading, the every-tenth-row dividend explicitly withheld pending sign-off; dangers drawn per DANGERS.md's option A; and the reveal built on the corrected four-step order (sketch red → correct black → flood colour → outline black). The sheet's own "not achieved" note flags quadrat stacking as unbuilt (every caption sets one sign per line, the sanctioned fallback, not the authentic layout) and Reret the hippopotamus cut to a bare post for space. Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md).

Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md).

## Risk

A flat, unmodelled, register-based sky is at genuine odds with a game built on depth, motion and speed; the Ramesside star clock softens this (the era does have a native grid grammar) but grid does not equal depth, and the game's bodies, hazards and lensing effects still want to imply volume this era's documents never do. Quadrat stacking is real, unbudgeted layout work, not a font problem, and should be spiked before hieroglyphic captions are committed to. The northern panel's seasonal quadrant layout is weakly sourced — no museum or journal page was reachable this session, only search-snippet paraphrases; get eyes on Wilkinson's facsimile or the Neugebauer & Parker plates directly before keying the panel literally. Beyond Sah, Sopdet and Meskhetiu, decan-to-modern-constellation identification is genuinely disputed among Egyptologists — don't invent confident mappings for the other roughly thirty-three. Several Names-table entries (Repulsa, Inkwell, Capture, Release, Score) are recalled rather than re-verified this session. `WebFetch` was unavailable throughout the research pass; every citation traces to a search-snippet paraphrase, not a primary page read end to end.