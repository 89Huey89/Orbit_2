# III · The Ceiling

**Egypt, c. 1473–1458 BCE.** The sky as a painted order of hours, months, decans, moving lights and protective beings. The primary visual document is Senenmut's tomb ceiling TT353; other Egyptian objects may explain a single borrowed motif, but may not silently be composited into that ceiling.

## The documents

- **Senenmut's astronomical ceiling, tomb TT353, Deir el-Bahri** (XVIII Dynasty, reign of
  Thutmose III). This is the era's controlling source: two stacked registers on a **light painted
  ground**, circumpolar figures and deities, decan names and stars, twelve named lunar-month
  circles, and four named planets — Jupiter, Saturn, Mercury and Venus; Mars is omitted. The
  [Ancient Egyptian Astronomy database entry](https://aea.mcmaster.ca/index.php/en/database/ars/ar1-type-menu/tomb-of-senenmut)
  explicitly records `Nut: No`, so no Nut arch belongs on this sheet. The Metropolitan Museum's
  [public-domain Wilkinson facsimile](https://www.metmuseum.org/art/collection/search/544566)
  supplies the image reference and dates the original to c. 1473–1458 BCE.
- **Diagonal star tables ("star clocks")**, Middle Kingdom coffin lids, predominantly from Asyut
  with single examples from Thebes, Gebelein and Aswan. Decan names against thirty-six ten-day
  weeks, read diagonally — the era's real chart form, a literal table, no figures at all.
- **Ramesside star clocks**, royal tombs (KV6, KV1, KV9), c. 12th century BCE — a roughly
  twelve-column-by-seven-row grid of stars keyed to individual body parts of a seated figure
  ("upon the heart," "the right eye"). The single most useful document for this era's gameplay:
  the closest thing in the whole ladder's record to the game's own tangent/release geometry.
- **The Book of Nut**, from the Osireion at Abydos and the tomb of Ramesses IV — a later source
  for a different diagram type. It may inform research into Egyptian cosmology but is not a
  licence to add Nut to TT353.
- **The Dendera zodiac** (Ptolemaic, c. 50 BCE, Louvre) — much later and syncretic, incorporating
  Babylonian/Greek zodiacal signs, but the best-preserved circular Egyptian sky and the
  one everyone recognises. Use it as a chapter plate, not as the era's grammar.

## Reference board — actual Egyptian drawings

![Charles K. Wilkinson's public-domain facsimile of Senenmut's astronomical ceiling, after TT353](https://images.metmuseum.org/CRDImages/eg/original/48.105.52_EGDP012289.jpg)

The facsimile above is the visual test for every decision on the built sheet: warm plaster is the
largest colour field; black lines and columns do most of the work; red is an accent; blue and green
are local fills; the composition is dense, orthogonal and captioned rather than atmospheric.

Two later drawings are deliberately kept beside it, not blended into it:

- [Greenfield Papyrus, frame 85](https://www.britishmuseum.org/collection/object/Y_EA10554-85),
  c. 950–930 BCE: a black-line solar barque. It licenses the player's flat boat silhouette, not
  a claim that this boat appears on TT353.
- [Greenfield Papyrus, frame 87](https://www.britishmuseum.org/collection/object/Y_EA10554-87),
  c. 950–930 BCE: Nut arched over Geb and supported by Shu, with black hieroglyphic labels. It is
  useful for the crosswind figure's visual grammar; its Nut arch is specifically excluded from
  the TT353 background.

The [Met's pigment demonstration](https://www.metmuseum.org/fr/perspectives/paint-like-an-egyptian)
and the [Australian Museum's account of registers, composite view and snapped grids](https://australian.museum/learn/cultures/international-collection/ancient-egyptian/the-painter-in-ancient-egypt/)
control material and figure construction. No modern blue star field, faux-papyrus texture,
cinematic glow, atmospheric perspective or shaded sphere survives comparison with these images.

## The grammar

Flat. No vanishing point, gradient, cast shadow, atmospheric depth or shaded limb. Figures use the
canonical composite view; hierarchy comes from scale, separation, overlap and the register, not
from perspective. Bodies are signs, discs or divine figures, never little rendered planets. Two
grammars coexist without being mixed indiscriminately: the **figure-register grammar** of TT353,
and the **table grammar** of star clocks. The game's node lattice fits the latter; the moving
figures fit the former. Both reject a spatial starfield.

## Palette

| Pigment | Hex | Role |
|---|---|---|
| Lime plaster | `#DDCFAD` / `#EEE4CD` | **dominant field**, wear and repairs |
| Carbon black | `#241D16` | principal drawing, captions, borders and final line |
| Red ochre | `#9D3724` | setting-out, corrections, solar discs and sparse rubrication |
| Yellow ochre | `#C4932E` | sparse flat fills and star signs |
| Egyptian blue | `#285987` | local divine/animal fill and gameplay guidance only |
| Green | `#526F59` | rare local fill only |
| Plaster loss | `#9D8966` | chips, hairline cracks and abraded patches |

The hierarchy matters more than the swatches: roughly three quarters light plaster, most of the
remaining information fine black, then small red/yellow/blue/green islands. Egyptian blue is a
valuable pigment in the wider palette, but **not this ceiling's background**. Orpiment and gold
leaf do not become generic UI gold; the built sheet uses a muted yellow ochre instead.

## Lettering and the hand

The historical image layer uses locally bundled **Noto Sans Egyptian Hieroglyphs** (OFL 1.1),
registered in the build as `Noto Egyptian Hieroglyphs` and named by the plate as a face token,
`hiero`, like any other. The face supplies the shape and the renderer supplies the hand: every sign
is painted in the wall's four passes — red setting-out laid off register, thin black correction,
flat flood, black closing line, with the pigment doubled a hair off register where the brush
reloaded — so no two signs are identical and none of them reads as type. Signs are **stacked in
quadrats**, one, two or three to a square, which is what makes a column read as writing rather than
as a list of pictures; the columns beside the route spell only words the checked vocabulary can
spell in full.

The English words are an openly modern curatorial layer, and they say so in their own type: a
**slab serif** (Zilla Slab, OFL 1.1), the class the trade named "Egyptian" in the 1810s after the
revival Napoleon's expedition set off, and the type an excavation plate has been captioned in ever
since. A neutral screen serif claimed no century at all and read as the absence of a decision. The
Latin is kept out of the historical columns and does not masquerade as a translated tomb
inscription. The score remains an Arabic number for instant play readability, held in a cartouche;
a count the sheet itself makes — the hour — is written in Egyptian numerals, stroke by stroke.

The reveal turns a documented workshop logic into four legible gameplay phases: red setting-out,
black correction, flat colour, black closure. This is a **plausible reconstruction used as an
animation system**, not a claim that every TT353 mark preserves four visible stages.

## Universe model and player object

This universe is not a volume seen through a window. It is a **painted order**: named decans,
lunar months, imperishable northern lights and wandering lights arranged so time and cosmic order
can be read. The camera's upward movement therefore means passage through the night watches, not
literal acceleration away from Earth. Orbit circles are redrawn as twenty-four-part hour circles;
the route is a sequence of brush dabs; each chapter is a `wnwt`, an hour/watch.

The player is a **flat night barque**, chosen because a carrier moving through an ordered night is
the era's most coherent equivalent of the comet in the base game. Its hull is a single profile,
with one solar disc and one upright sign: no banking, foreshortening, exhaust, bloom or metallic
highlight. This barque is a marked borrow from the wider funerary corpus — visually checked against
Greenfield Papyrus frame 85, roughly five centuries later — and not presented as an object copied
from TT353. In the eventual chronology, the invariant is not “the same spaceship in costume” but
**the era's mediator between observer and sky**: mark, carrier, measuring instrument, recorded
object, autonomous observer.

## Names

Attested words are preferred throughout; constructed extensions and merely-recalled dictionary entries are marked.

| Game term | Egyptian word | Gloss | Status |
|---|---|---|---|
| A decan star | *sbꜣ* | star | attested |
| The wanderers | *ikhemu-wretju* | "the stars that know no rest," each a deity in a barque — Jupiter "Horus who bounds the Two Lands", Saturn "Horus, Bull of the Sky", Venus "the crossing star", Mercury *sbg(w)*, of unknown meaning; Mars, "Horus the Red", is absent from this ceiling | attested (research/knowledge-horizon.md §3); Mars's absence attested |
| The Moon | *jꜥḥ* | the moon | attested |
| A surface of any kind | — | not drawn: no Egyptian document differentiates a body's face | — |
| Slingshot | *wp rnpt* | "opener of the year" — Sopdet's heliacal rising, resetting the calendar | attested phrase, applied by analogy |
| Shield (Scutum) | *ikm* | shield | attested |
| Reflector (Repulsa) | *ḫsf* | "to repel, turn back" | recalled |
| Inkwell | *gsti* | scribe's palette | recalled |
| Orbit | *pḫr* | "to go around, circle" | attested, extended usage |
| Capture | *jṯi* | "to seize, take possession of" | recalled |
| Release | *wn* | "to open" | recalled, constructed usage |
| Currency (future economy) | *ḫꜣr* (khar) | a grain-volume measure, ~76.9 L, paid to later tomb workers at Deir el-Medina | attested later unit; gameplay translation |
| Score | *ḥsb* | "to count, reckon" | recalled |
| Chapter / sheet | *wnwt* | "hour" — the Amduat's own 12-part night structure | attested structure, corrects "register" |
| Personal best | — | no attested equivalent | constructed |
| Daily plate | *hrw* | "day" | attested word, constructed application |
| Title / chapter | *wnwt* / *pḫr* | hour/watch / "to go around" | attested words, evocative UI use |

"Register" is a modern Egyptological/art-historical term describing the composition, not an ancient Egyptian word — useful as a design term but not as the era's own vocabulary; *wnwt* ("hour") is the better-attested fit for "chapter."

## Currency and the rule

The current special area keeps the base simulation's resource but depicts it plainly as a reed
brush drying and being rewetted; it does not pretend that TT353 labels a game currency. A future
economy may use *khar*, the grain ration of later tomb workers at Deir el-Medina, as a marked
cross-period translation. If retained, it is a rename only; the proposed ten-row dividend remains
deferred. Gold is specifically rejected as a generic Egyptian currency.

## Dangers

The named beings below answer the historical brief — danger as people imagined it in the sky —
but their assignment to four force mechanics is a fictional gameplay translation. The depictions
obey Egyptian image grammar; the physics do not claim an ancient source.

| Row | Name | Depiction |
|---|---|---|
| Attractor | **Apep** | The serpent that ambushes the sun god's bark nightly in the underworld, a recurring threat survived rather than defeated — drawn coiled flat within a register. |
| Repulsor | **The Eye of Ra** | The scorching solar disc sent out as Sekhmet, or simply radiating uraei — "pushes outward, small lethal core," survivable at range, dangerous only close in. |
| Crosswind | **Shu** | The god of air, physically holding Nut and Geb apart — drawn kneeling with raised arms, a myth that already describes "holds things at a steady distance." |
| Obscurer | **Nun** | The formless waters before creation, everywhere and nowhere — the natural fit for an inert fog patch that hides rather than harms. |

## The bodies

Under the knowledge horizon ([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) this era draws no
planetary family and no surface. An ordinary node is a five-point star sign or plain painted disc;
a moving light may be carried by a tiny profile barque. The same glyph survives at thumbnail,
orbit and capture scale. Size, position, caption and carrier distinguish a light — texture,
terminator, crater, cloud and ring never do.

TT353 names Jupiter, Saturn, Mercury and Venus and omits Mars. The special area therefore treats
the barque as the **class sign for a wanderer** rather than generating a false one-to-one catalogue
of five named planets from random gameplay nodes. A future authored signature sheet may show the
four attested entries and the omission precisely; the procedural field must not invent the missing
mapping.

The earlier seven-family reading — the *mw* wave-hatch, dot-and-ring, the winged disc flattened to a ring, the pale disc, the red land, Sekhmet's tuft, Set's hatching — was the era's most elegant set of constructed analogies and survives in `prototypes/ceiling.html`, and in the dangers, where the deities still belong.

## Frame and furniture

A tomb ceiling has no frame in the atlas sense — its boundary is the room's own architecture, and its furniture is the register grid itself plus hieroglyphic captions beside every figure. The **cartouche** (*shenu*, "that which encircles"), the oval ring around a royal name, is a genuine, structurally simple element and the natural home for a player's initials or best-score readout; the running score and best are now set inside one. The civil calendar — season (*Akhet*/*Peret*/*Shemu*), month, day — is a real dating formula and a better fit for the daily plate's date line than a generic "day N." Rim captions become decan-name columns beside the main orbit, as on the Senenmut ceiling itself. There is no colophon in the modern sense; a scribe's dedication text is the closest equivalent and a weaker fit than era VI's imprint line — probably not worth forcing.

## The signature sheet

**TT353 as one authored sheet** — the circumpolar group, decan columns, four attested moving
lights, omitted Mars and twelve lunar-month circles laid out from the facsimile rather than freely
recomposed. Ramesside star clocks and the Book of Nut belong to separate, explicitly later Egyptian
studies; they must not become extra “chapters” inside a purported reconstruction of TT353.

## Sound

A grinding pigment-grind (orbit-hold), a single wet dab (capture), a dry brush-flick (perfect release), a low stone thud (death), a sistrum rattle (constellation complete/medal).

## The prototype

`docs/eras/prototypes/ceiling.html` exists and paints the southern-panel scene. Its header comment records: **Noto Sans Egyptian Hieroglyphs** loaded locally (falling back to hand-drawn pictographs, never a system font, if it fails to load); five caption glyphs copied byte-for-byte from the research file, every other caption spelled phonetically from Gardiner's uniliteral alphabet plus four one-sign logograms, each codepoint individually looked up this session; the title set as "Nwt" over "*pḫr*"; Meskhetiu chosen over Sah for the constellation; the currency rendered as the research's own no-twist reading, the every-tenth-row dividend explicitly withheld pending sign-off; dangers drawn per DANGERS.md's option A; and the reveal built on the corrected four-step order (sketch red → correct black → flood colour → outline black). The sheet's own "not achieved" note flags quadrat stacking as unbuilt (every caption sets one sign per line, the sanctioned fallback, not the authentic layout) and Reret the hippopotamus cut to a bare post for space. Painter verdict: Opus reached the standard on the second pass; budget Opus for this era. See [PROTOTYPES.md](PROTOTYPES.md).

That prototype remains a useful drawing study but is superseded as colour authority: any dark-blue
night reading and Nut association did not survive comparison with the Met facsimile and the AEA
record. The playable implementation is `src/ceiling.js`, entered temporarily from the main menu.
It owns its plaster cache, the painter's snapped red canon grid, the kheker frieze and polychrome
block borders, the star bands, twelve painted month circles, Meskhetiu with its seven stars and
Reret with her crocodile and mooring post, quadrat-stacked decan columns, Egyptian numerals,
node/body painter, player, four hazard painters, route, reveal, darkness and chapter labels while
reusing the unchanged simulation. Entry uses a non-persistent plate application and return restores
the prior atlas; because the wall is baked into one cached canvas, entry also waits on both of the
era's faces before painting it, or the sign columns would stay blank for the whole visit. What that
sheet still owes the atlas beside it — a visible brush, a wall that passes with the climb, dangers
that are not still lifes, and the era's own five sounds — is audited and put in build order in
[CEILING-POLISH.md](CEILING-POLISH.md).

## Risk

A flat, register-based sky is at genuine odds with a game built on depth and speed; the solution is
to translate vertical motion into time/order, never to add modelling. Quadrat stacking is now built,
but only for the words the checked vocabulary spells; the density it buys has to stay at the margins
of the sheet, because a wall painted edge to edge would bury the flight. Beyond securely documented labels, decan-to-modern-constellation
identifications must not be invented. Several words in the Names table remain recalled rather than
re-verified and should not enter final hieroglyphic prose. The Met facsimile and the AEA record have
now been inspected directly; Greenfield frames 85 and 87 remain later comparators. The special
area's mythology is consistent and clearly bounded, but it is still a designed synthesis rather
than a reconstruction of one intact ancient room.
