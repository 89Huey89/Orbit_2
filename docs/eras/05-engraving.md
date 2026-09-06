# VI · The Engraving

**Europe, 1600–1801.** The era the game is already set in, written down so the ladder has a
reference point and so the other eight know what they are departing from.

**This era is finished as a sheet.** Under the knowledge horizon it owns one small piece of new
work, the dated discoveries in *The bodies* below; everything else here is the reference point:
when era V asks "what does a figure hand cost?", the answer is Hevelius, Bayer and Bode, all three
already cut.

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

## Its place on the nine-era ladder

The sixth of nine, and, at the provisional score gate in DECISIONS.md §1, the median run's home:
most runs cross into it (at 260) and never reach VII. It keeps the render-side chapter machinery
built for it and nowhere else — the four shipped chapter plates go on cycling by row exactly as
today, where every other era shows one signature sheet. Its row in the `ECONOMY` table
(DECISIONS.md §2) is the shipped currency, named **ink**, under a currency name that render already
reads: `INK_CAPTURE_GAIN`=0.05, `INK_PERFECT_GAIN`=0.12, `INK_ORBIT_GAIN`=0.13,
`INK_SLING_GAIN`=0.85, spent via `inkCost(distance)=distance/INK_REACH·inkMult` — untouched by the
ladder, the number every other era's currency is measured against. No twist: this era carries no
`ECONOMY` rule column entry, being the rule every other era's twist departs from or returns to.

## Dangers

Era VI's dangers landed on `main` after this ladder was first written down, and they are the model
for every other era's: **VORAGO**, the whirlpool in the aether the old charts engrave at the edge of
the world and Descartes' own account of what the heavens are made of; **MACULA**, Galileo's sunspot;
and **VENTUS**, the cheek-blown wind-head — which the frame had already been carrying in its four
corners for a long time before it was given a rule. That is the standard to hold the others to:
**find the thing the era already draws, and give it a rule.** See [DANGERS.md](DANGERS.md).

## The bodies

The one era on the ladder where the seven families are *born*, and under the knowledge horizon
([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)) the only work this file still owns. The shipped
specimens stay as they are. What is added is that each family is tied to the body it was first
seen on and the year, written once per run as a dated caption on the first capture of that
family, and that two of them are drawn as the century first misread them until the orbit is held.

| Family | First seen on | At a glance | Under attention | Caption |
|---|---|---|---|---|
| crater | the Moon, Galileo, 1610 | the shipped *Sidereus Nuncius* terminator and craters | the same | `1610 · GALILEO` |
| ringed | Saturn, 1610 and 1659 | **Galileo's handles** — the disc with two lesser discs The Drift's plate already cuts | **Huygens's ring** | `1610 · GALILEO`, then `1659 · HUYGENS` beside it |
| storm | Jupiter, 1665 | the shipped banded giant with its spot | the same | `1665 · CASSINI` |
| ice | Mars's caps, 1666 to 1784 | a bare disc with one pale cap | the cap read as **snow**, Herschel | `1784 · HERSCHEL` |
| ocean | the Moon's *maria*, Riccioli, 1651 | the shipped ocean world | the same | `1651 · MARE` |
| volcanic | the Moon's "volcanoes", Herschel, 1787 | a disc with a sunspot's dark umbra, the one fire the century drew | Herschel's three volcanoes, an attested mistake | `1787 · HERSCHEL` |
| dune | not yet a family: Syrtis Major, Huygens, 1659 | a bare disc with one dusky patch | the same | `1659 · SYRTIS` |

The years are checked in [research/knowledge-horizon.md](research/knowledge-horizon.md) and the
captions are provisional; the volcanic cell is keyed from that file's verdict on Herschel's 1787
paper, the better hook and a mistake besides. One caveat the research adds: Cassini's "permanent
spot" of 1665 was followed to 1713 and may not be today's Great Red Spot, whose continuous record
begins in 1831, so the storm's caption names the observation, not the storm. The captions are set in
the Fell italic on a leader, exactly as `TRES PERFECTI` is set today, so the era writes its own
discoveries in the hand it already has. Whether the first cycle of seven after the page turn
should be dealt in the order of discovery is open question J.

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
