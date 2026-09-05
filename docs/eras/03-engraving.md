# III · The Engraving

**Europe, 1600–1801.** The era the game is already set in, written down so the ladder has a
middle and so the other four know what they are departing from.

**This era is finished. Nothing in this file is outstanding work.** It is here as the reference
point: when era II asks "what does a figure hand cost?", the answer is Hevelius, Bayer and Bode,
all three already cut.

## The documents the game already quotes

- **Johann Bayer, *Uranometria*** (1603) — the first atlas to letter the stars of a constellation
  by Greek letter, an ordering still in use. The game's magnitude classes descend from this
  tradition.
- **Andreas Cellarius, *Harmonia Macrocosmica*** (1660) — gold on deep blue. Shipped as the
  **Cellarius plate**, earned at 1,000 lifetime captures.
- **Johannes Hevelius, *Firmamentum Sobiescianum*** (1687–90) — the constellations drawn as seen
  from *outside* the sphere, and so mirrored. Shipped as the default **figure hand**, and its
  mirroring is why the game mirrors each figure onto the side its fork branches from.
- **John Flamsteed, *Atlas Coelestis*** (1729) — the first great telescopic atlas.
- **Johann Elert Bode, *Uranographia*** (1801) — the last and most crowded of the great figured
  atlases, and the end of the tradition. Shipped as the heavier **Bode figure hand** at
  twenty-five completions of any single constellation.
- **Galileo, *Sidereus Nuncius*** (1610) — quoted directly in all four chapter plates: the
  terminator and crater rims on The Quiet's moon, Saturn as a disc with two handles on The Drift,
  sunspot groups on The Eclipse, and Jupiter's Medicean stars as `O * * *` on The Deep.

## What it already owns

Everything registered as `night` or `paper` in the thirteen `definePlate` sections, plus the six
plates derived from them (Cellarius, Verdigris, Foxed, Proof before letters, Carta azzurra,
Sepia), the burin primitives, the Fell types, the Latin captions, the wind-heads and the compass
rose, the twelve Hevelius figures and the three figure hands.

## The grammar, for contrast

Line, not tone. Everything is built from an engraved stroke that swells and tapers; colour arrives
afterward as hand-applied wash, deliberately off-register. Bodies are modelled by **hatching that
darkens toward the limb**, never by a gradient. Lettering is set in type and in Latin. The sheet
is present as a material — laid wires, chain lines, foxing.

## What the other eras take from it

- The **plate/chapter split** and the page turn between chapters.
- The **cached-layer discipline**: nothing generative runs per frame.
- The **lettering pipeline**: `scripts/glyphs.mjs` was written for the Fell faces and generalises
  to any embedded OFL face without change.
- The **catalogue mechanic**: an era is one `UNLOCKS` entry and one `PLATE_STYLES` entry.
