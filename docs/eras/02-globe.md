# II · The Globe

**Islamic Golden Age, 964 CE.** The moment the constellations stopped being a story and became a
catalogue with pictures — and, incidentally, where most of the star names in use today come from.

## The documents

- **ʿAbd al-Raḥmān al-Ṣūfī, *Kitāb ṣuwar al-kawākib al-thābita*** (*Book of the Images of the
  Fixed Stars*), c. 964 CE. The central document of this era and one of the best-attested
  illustrated star atlases before print. Copies are held by the Bodleian, the Met, the Library of
  Congress and others; a celebrated c. 1430 copy is widely reproduced.
- **The defining convention: every constellation is drawn twice** — once as it appears looking up
  at the sky, and once mirrored, as it appears looking down at a celestial globe. Nothing else in
  the history of the star atlas does this, and it is the era's signature. It is also, usefully, a
  ready-made mechanic: the game already mirrors each figure onto the side its fork branches from.
- **Brass celestial globes and astrolabes** (10th–15th c.) — engraved and inlaid, the stars as
  small punched or inlaid discs on a curved brass ground.
- **Ulugh Beg's *Zīj-i Sulṭānī*** (Samarkand, 1437) — the observational high-water mark, and the
  last great star catalogue compiled without a telescope.

## The grammar

Figures in Abbasid and Persian dress, drawn with a fine confident contour and filled with flat
colour and patterned textile. The stars are **on top of the figure, not inside it** — small gold
discs laid over the drawing at their catalogued positions, often with the magnitude written
beside them. The figure is decoration; the discs are the data. That separation is exactly how the
game already layers a constellation figure behind its three stars.

## Palette

**Gold leaf** and **lapis lazuli ultramarine**, first of all — this is the era that earns gold.
Then vermilion, malachite green, a warm manuscript cream for the ground, and a fine brown-black
contour ink. Grounds are the page, not the night: an Islamic star chart is drawn on paper, and the
sky is not painted in.

## Lettering

Arabic, in **naskh** for captions and **kufic** for anything monumental, set right-to-left. Both
**Amiri** and **Noto Naskh Arabic** are OFL-licensed. Right-to-left and the cursive joining
behaviour are the real work here — `textAlongArc` sets glyph by glyph and would need to be taught
to shape a run before placing it, or to place pre-shaped runs.

## Names

This era is where the modern star names come from, which makes its captions the most legible to a
modern player of any pre-modern era:

| Modern name | From |
|---|---|
| Aldebaran | *al-dabarān*, "the follower" |
| Betelgeuse | *yad al-jawzāʾ*, "the hand of the giant" |
| Vega | *al-nasr al-wāqiʿ*, "the swooping eagle" |
| Altair | *al-nasr al-ṭāʾir*, "the flying eagle" |
| Deneb | *dhanab al-dajājah*, "the tail of the hen" |
| Rigel | *rijl al-jawzāʾ*, "the foot of the giant" |
| Fomalhaut | *fam al-ḥūt*, "the mouth of the fish" |

Use the Arabic with a transliteration, and let the player recognise the modern name inside it.
That recognition is the best single moment available anywhere in this ladder.

## How the seven families are depicted

Gilt roundels. A flat disc of colour with a burnished gold rim, a fine contour, and a patterned
interior — textile geometry rather than geography. No shading, but unlike era I there is
**modelling by pattern density**: the interior ornament crowds toward one edge. The ringed world
takes a concentric gold band; the storm world takes an interlace.

## Chapter plates

1. Orion (*al-jabbār*) in both views, mirrored, as al-Ṣūfī sets him.
2. A brass celestial globe seen close, its engraved figures and inlaid star discs curving away.
3. An astrolabe's rete — the pierced star map itself, its pointers naming the bright stars.
4. The Samarkand observatory's great sextant arc, cut into the hillside.

## Dangers

**al-Ghūl / the tinnīn** for the attractor — the dragon of the lunar nodes, *ra's al-jawzahar*, whose
head and tail devour sun and moon at eclipse, and whose name survives in the star Algol. The burning
of **al-Shams** for the repulsor and **al-Rīḥ** for the crosswind. See [DANGERS.md](DANGERS.md).

## Risk

Moderate. Arabic shaping is real work and should be spiked early. Everything else — flat colour,
gold, contour drawing, mirrored figures — is squarely inside what the engine already does well.
