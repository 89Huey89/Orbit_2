# V · The Engraving

**Europe, c. 1540–1610.** The printed sky at the height of what the eye alone, a compass and a
burin could do with it: a star fixed by lettering rather than by instrument, a constellation
composed as a figure on a page rather than measured as a set of angles, a whole hemisphere brought
under one printed convention in the decades just before a tube of ground glass made the eye alone
no longer enough. This is the era the shipped game has always been set in, and revising it under
the new ladder is mostly a narrowing: everything the game's atlas already draws that depends on a
telescope having been pointed at something — Galileo's terminator, Huygens's ring, Cassini's spot,
Riccioli's *maria*, Herschel's mistaken volcanoes, the whole dated-discovery table the old file kept
here — belongs to a different way of knowing a body than this one, and **moves out to
[06-lens.md](06-lens.md)**, which is where it is now owned and where it should be read. What stays
is the half of the old file that was never about a telescope at all: the printed atlas page itself,
the burin's own grammar, the Latin hand, and the six catalogue plates and three figure hands the
game already ships as dressings for it.

## The documents

- **Alessandro Piccolomini, *De le stelle fisse* (Venice, 1540)** — by most standard accounts the
  first printed star atlas to letter its stars by a fixed, repeatable convention, in Latin capitals
  rather than Greek. It is named here as the plausible opening of this era's own window rather than
  as a document the game quotes directly. **(unverified — no research file exists for this era this
  pass; stated from general history-of-astronomy knowledge, not checked this pass against a primary
  source or a library's collection record.)**
- **Johann Bayer, *Uranometria* (Augsburg, 1603)** — the atlas the game's own magnitude classes and
  Greek-letter ordering descend from, still in use today, and the one document in this list whose
  date sits comfortably inside the era's stated span. Its own plates are themselves already a
  synthesis, drawing on Tycho Brahe's naked-eye catalogue for position and on classical figure
  drawing for the constellation art riding over it — a composed sky, not an observed one, which is
  the whole difference this era is built to show.
- **Andreas Cellarius, *Harmonia Macrocosmica* (Amsterdam, 1660)** — gold lettering on a deep blue
  ground, shipped as the **Cellarius plate**, one of this era's six catalogue dressings (below).
- **Johannes Hevelius, *Firmamentum Sobiescianum* (Danzig, 1687–90)** — the constellations drawn as
  seen from *outside* the celestial sphere rather than from within it, and mirrored for that reason;
  shipped as the default **figure hand**, and the reason a route's figure is mirrored onto the side
  its fork branches from.
- **Johann Elert Bode, *Uranographia* (Berlin, 1801)** — the last and most crowded of the great
  figured atlases, closing the tradition it belongs to; shipped as the heavier **Bode figure hand**.

**Both Hevelius and Bode postdate this era's own 1540–1610 window by a wide margin — by seventy-
seven and a hundred and ninety-one years respectively — and that has to be said plainly rather than
smoothed over.** The honest reading is not that the dates are wrong or that the window should be
stretched to cover them; it is that this era's *window* names the moment the printed atlas
tradition opens, while its shipped *hands* are drawn from across the whole span of that same
tradition, because a hand is a way of cutting a line rather than a claim about a single year. Bayer
gives this era a figure hand that genuinely belongs inside its own window (below); Hevelius and Bode
are the tradition's middle and its close, kept because the game needs more than one hand to show a
figure being cut differently, and because retiring either one to a later era would put a
seventeenth- and an eighteenth-century printing convention on a sheet that is otherwise about
resolving light into worlds, which is a worse fit than the honest anachronism of keeping them here as
what they actually are: the atlas tradition's own middle age and its old age, read back into the
sheet that shows its youth. Cellarius sits in the same company for the same reason and is not
picked out separately below.

## The grammar

Everything on this sheet is built from a burin's own line, never a wash laid down first and drawn
over. A contour is cut, then hatching darkens a body toward its limb — never a gradient, because a
graver cannot lay one — then a fine stipple stands in for tone where hatching alone would go muddy.
Colour, where it appears at all, arrives last and by hand: a brush wash applied after the plate was
already pulled, with uneven pigment, dry gaps, visible bristle-loaded starts and a few strokes that
wander just beyond the printed contour. It must read as a colourist working on a finished proof, not
as a second colour plate that missed registration. A perfect landing keeps the wash cleanly inside
the figure; a hard landing freezes a small offset in that wash; and when all three stars of a
constellation are documented, one complete colour pass is laid over the figure. Initials, coats of
arms and garments may carry that colour, while the star signs and the compass-struck coordinate
grid remain black printed marks. The three figure-hand cosmetics carry three related colourist
manners as well: mineral, rubricated and dry, each still visibly hand-applied.
Construction geometry — the compass-struck circle, the divided arc, the straightedge's own ruled
line — is not decoration on this sheet; it is the actual method by which a figure was composed before
any instrument existed that could measure one, the geometer's tools standing in for the astronomer's.
The sheet itself is present as a material object rather than a neutral background: laid wires and
chain lines from the mould the paper was formed in, foxing, a plate-mark pressed into the sheet's own
edge by the press that printed it.

## Palette

| Material | Hex | Role |
|---|---|---|
| Night-plate ground, deep indigo | `#080f18` | the atlas read by candlelight, sky rendered as near-black |
| Paper-plate ground, aged parchment | `#e7dabd` | the loose sheet as pulled from the press, this era's true baseline |
| Gold ink, night ground | `#E2C385` | the burin's line where the night reading is chosen — a printer's gold-on-blue convention, after Cellarius |
| Iron-gall ink, paper ground | `#3A2A1C` | the burin's line on the sheet itself, browning slightly with age even where it has not yet failed |
| Copper, night ground | `#CD9F7A` | the plate-mark's own bevel, compass hinges, ruling furniture |
| Blue-grey mineral wash, night ground | `#94B4B1` | a hand-applied mineral wash over a printed figure, with the occasional rough landing carrying it slightly beyond the line |
| Vermilion accent, paper ground | `#A63A28` | a rubricated caption or hand-coloured garment, spent sparingly against the sheet's own brown |
| Reserved sheet, unprinted | the ground colour itself | wherever the plate held no ink at all — a body's own unlit limb, a construction line not yet cut |

## Lettering and the hand

The atlas is set in **IM Fell English** and its small-capitals companion, **IM Fell English SC**
(SIL Open Font License) — a genuine seventeenth-century English type revival, close enough to this
era's own printing to letter it honestly without claiming to be Bayer's own specific fount. Every
caption, every inscription, every discovery note the game writes anywhere is built from these two
faces through `plateFace()`, and running copy in the surrounding page reads from the same stack.
Captions are lettered in Latin, as Bayer's own plates are, and the large hand — `penLettering()` —
strokes each glyph's real outline on by a travelling dash offset with a wet bead riding the nib,
then floods the counters with ink once the stroke has closed, at roughly a hundred and twenty
milliseconds a letter with adjacent letters overlapping: **attested, shipped, and the control case
every other era's lettering animation is judged against**, per [LETTERING.md](LETTERING.md).

Three figure hands cut the same twelve-figure catalogue rather than three different figures: the
default **Hevelius manner** (*More Hevelii*), broken and heavy, mirrored for the reason above;
**Bayer manner** (*More Bayeri*), unlocked at ten completions of one constellation, finer and more
geometric, less broken, the hand that actually belongs inside this era's own window; and **Bode
manner** (*More Bodii*), unlocked at twenty-five completions, heavier again and far more shaded than
either. Each hand answers to one shared table of weights — line weight, how often a contour breaks,
how jagged its own break is, how dense the hatching, how heavy the stipple — and to its paired
colourist manner: Hevelius's mineral wash, Bayer's denser rubrication, or Bode's dry, patchy brush.
The same twelve constructions can therefore be cut and coloured three different ways without three
different drawings existing anywhere in the code.

## Names

| Game term | The era's word or mark | Evidence |
|---|---|---|
| A star | *stella fixa*, sized to one of the atlas's own magnitude classes | attested (Bayer's magnitude-ranked lettering) |
| The Moon | *Luna*, its natural blotches read as Plutarch's hollows and heights | attested as a period reading of the lunar face, general history of astronomy; not run through a dedicated research file this pass |
| A constellation | a Bayer-lettered figure, α, β, γ… in descending order of brightness | attested |
| A wandering star | *stella errans*, or *planeta* | attested Latin vocabulary |
| Slingshot | a compass swept a full turn, the point never lifted | fictional gameplay translation, grounded in the attested method of striking a circle |
| Shield | a construction circle, compass-struck and left otherwise bare | fictional gameplay translation |
| Reflector | the figure mirrored, in Hevelius's own convention for a sphere seen from outside | convention attested; its use here as a pickup is fictional gameplay translation |
| Inkwell | an inkwell — no reskin needed | attested, no translation required |
| Orbit | a construction circle, ruled bare until the figure within it resolves | fictional gameplay translation, grounded in an attested drafting method |
| Capture | the point pricked and the first line laid to it | fictional gameplay translation |
| Release | the quill lifted, the wet line left to dry | fictional gameplay translation |
| Currency | ink | attested, shipped, unrenamed — this is the baseline every other era's currency is a rename of |
| Score | a numeral tally in Arabic digits, set beside the plate-mark | attested convention for this era's captions |
| Chapter | — not this era's; the four chapter plates and their Galilean quotations now belong to [06-lens.md](06-lens.md). This sheet shows one signature sheet, dressed in six catalogue colourways, not a cycling chapter | n/a — moved out with the dated-discovery table |
| Best | the deepest row the plate reached before the sheet was lost | constructed, on shipped mechanics |
| Daily | the day's own pull off the press, dated in the impressum as any print run was | fictional gameplay translation |
| Impressum | the plate's own record of place, maker, workshop and privilege | constructed period furniture, grounded in the printed-atlas tradition |
| Title | the plate-mark itself, undressed | deliberately untranslated |

## Currency and the rule

Currency is **ink**, unrenamed, because this is the era the game already runs its economy in
Latin-free plain English for: `INK_REACH=2000` world units bought by a full nib, `INK_CAPTURE_GAIN
=0.05` and `INK_PERFECT_GAIN=0.12` credited on landing (before the new completeness multiplier
[ECONOMY.md](ECONOMY.md) applies to every era alike), `INK_ORBIT_GAIN=0.13` and `INK_SLING_GAIN
=0.85` per second an orbit or a slingshot lap is held. No twist sits on top of any of this — this
row carries no rule column entry of its own, because it is the row every other era's own currency is
measured against, not a departure from it. The one thing every era now shares, the release dividend
scaling with how documented the departing body was left, applies here exactly as it applies
everywhere else; this era invented none of it and gets no exemption from it either.

## Dangers

| Row | Name | Depiction |
|---|---|---|
| Attractor | **VORAGO** | The whirlpool in the aether the old charts engrave at the world's edge, and Descartes' own account of what the heavens are made of — a burin-cut spiral drawing the eye inward toward a lethal core. |
| Repulsor | **MACULA** | Galileo's sunspot, hatched dark at its penumbra and pushing outward over a wider, non-lethal reach around a smaller lethal core. |
| Crosswind | **VENTUS** | The cheek-blown wind-head, cut into the frame's own four corners since long before it carried a rule — puffed cheeks, closed eyes, breath streaming one steady way across its own lane. |
| Obscurer | **NEBULA** | A soft burin-stippled patch at the sheet's margin, thinning toward its own edge rather than stopping sharply — a cloud is a cloud on every era's sheet, and this era's own Latin word for it needs no translation at all. |

**One honest tension, named rather than buried.** MACULA depicts a sunspot, and Galileo's sunspot
observations date to 1610–1612 — the very year this era's own window closes, and arguably a
telescopic discovery rather than a naked-eye one. It stays on this sheet regardless, because a
hazard's figure is not a claim about a body's surface the way a family's Understood state is
([KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)): VORAGO and VENTUS are not astronomical claims
either, and MACULA sits beside them as a figure for a force the era had a word and a shape for, not
as a second Galileo entry duplicating what [06-lens.md](06-lens.md) already owns properly, dated,
under crater and the rest of the family table.

## The bodies

**Before capture**, a body on this sheet is a point marked only by a faint construction circle —
the compass's own first cut, struck before a single line of the figure inside it exists. That circle
already carries everything a flight needs: the body's position, the true size of its capture region,
and whatever its class demands for planning a transfer, all as legible as the ring drawn around any
other era's phenomenon. What the circle withholds is identity alone — what kind of thing, if any, is
about to be drawn inside it — because a construction line is, honestly, the one mark a burin can cut
before deciding what it is a construction line *for*.

**While the orbit is held**, the quill draws the body into existence, in stages tied to how far the
orbit has actually swept rather than to how long it has been held. At capture, 0°, the first mark
lands: one contour stroke, the plate's opening gesture, no more legible on its own than any other
freshly cut line on the sheet. By roughly ninety degrees the body is recognisable as its kind —
hatching has begun to darken it toward a limb, a construction circle from the compass work has begun
tightening into the figure's own outline, and a Greek letter has been pencilled in position even
where it is not yet inked. By roughly a hundred and eighty degrees the plate is substantially
documented: the hatching has filled toward the density the finished figure will carry, stipple has
begun standing in where a gradient cannot, and the letter is inked rather than merely placed. By
roughly two hundred and forty degrees nothing further is gained, and the plate may carry a small
finishing flourish — a last, slightly heavier contour stroke closing the figure's own outline, the
printer's own way of saying a plate is proved — so a player knows the sheet is dry without a gauge
telling them so.

**Once documented**, what results is a plate proof: a Bayer letter set beside the figure, a Latin
name lettered under it, and a magnitude given by nothing more than the size of the printed dot
itself — the entire vocabulary this era's eye has for a body's brightness, and, past that dot's own
size, the entire vocabulary it has for the body at all. The six traditional classes are visibly
separate: I and II grow into larger multi-rayed printer's signs, while V and VI remain only small
punctures in the plate. A Greek letter is withheld until the point has been watched long enough;
the occasional faint, uncertain point waits almost for the full orbit before it is classified. The
right-hand key begins as a pale construction of all six forms and darkens class by class as play
supplies those observations. The caption carries a date, once per run,
the first time each constellation's own letter is completed — `1603 · URANOMETRIA`, the atlas's own
year rather than a discovery date, because nothing on this sheet is discovered in the sense
[06-lens.md](06-lens.md)'s dated family table means it; it is composed, and the date records the
composition, not an observation. The Moon is the one body this era's naked eye
differentiates further: a plain disc carrying its own attested natural blotches, read here as
Plutarch's hollows and heights, the reading Galileo's own telescope is one era away from
overturning. This is also the era's one honest wrong belief, and it is a claim about the heavens
rather than about any single body: the outer sphere of the fixed stars, held to be literally
unchanging, a belief this era's own span already breaks within itself, at Tycho Brahe's parallax
measurements of the nova of 1572 and the comet of 1577 — both showing a supposedly immutable
heaven change *(general history of astronomy; not checked this pass against a dedicated research
file for this era)*.

**What this era does not do, said plainly rather than left implicit:** it does not draw a crater, a
ring, a storm band, an ice cap, a *maria* ocean, a volcanic disc, or a dune-streaked world as
anything other than a lettered dot and a figure — no family is born here, because a family is a
claim about a surface and this era's eye has not yet resolved one. **Galileo's terminator and
craters on the Moon, Huygens's ring on Saturn, Cassini's spot on Jupiter, Riccioli's named *maria*,
Herschel's mistaken lunar volcanoes and solid Sun — the whole dated-discovery table the game's atlas
used to carry on this very sheet — belong to [06-lens.md](06-lens.md) now**, because every one of
them is an act of resolving a point of light into a surface, which is exactly the epistemology that
era owns and this one does not.
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)'s own table entry for this era states the same limit:
a brightness class is the only differentiation this era, and every era before it, draws among
bodies; `DIFFICULTY_FAMILY` does not apply until the Lens has something to apply it to.

**The tool is the quill, and the Observer Core sits at its nib.** What the game actually renders
around the moving point is the shipped quill — barrel, feather and a nib cut to a point at the
traveller's own exact position, flexing a little as the flight quickens and easing back at rest —
and the small bright head at that point, the reserved highlight, dark keyline and nib ticks every
tool on every era shares, is the Observer Core: the point that was actually laying down ink, not the
feather trailing behind it. Per [OBSERVER-CORE.md](OBSERVER-CORE.md), the game's five shipped
cosmetic marks split unevenly across the ladder rather than staying five interchangeable skins on
one instrument. The quill itself is fixed as this era's own default tool, attested as the control
case the whole system is built from. Two of the remaining four — the comet and the moth — and a
third, Saturn, become this era's own alternate cosmetic cuts of the same quill, unlocked the way the
six catalogue plates already are: a player may choose to draw with a different cut of nib, never a
different core. The fifth mark, the telescope, is **not** this era's to keep; it is drawn eyepiece-
first for the reason [06-lens.md](06-lens.md) owns it, and its presence in the shared catalogue
should not be read as this era borrowing a later century's instrument.

## The frontier

This era's word for the boundary is **the dark**, the game's own baseline term kept rather than
translated: per [THE-FRONTIER.md](THE-FRONTIER.md), the Engraving is the era the game has always
been set in, and its frontier keeps the game's own name for it, exactly as its currency stays ink,
unrenamed, above. Its rate, its grace and its shoreline are [THE-FRONTIER.md](THE-FRONTIER.md)'s
own, untouched by any of this; what changes, era to era, is only the material failing behind the
player.

Iron-gall ink is acidic and mildly self-catalytic, and given time and moisture it does not merely
darken and hold: it corrodes the cellulose beneath it, browning the paper along every stroke and, in
the most concentrated lines, eating clean through the sheet — a real, well-documented
paper-conservation phenomenon usually called ink corrosion or ink burn, visible in period manuscripts
and old-master drawings cut in a strong iron-gall recipe. The brief's own "paper burns" is exactly
this, read correctly: not fire, the ink burning its own drawing out of the page it is drawn on. The
honest consequence for the render is that a completed plate's *densest* linework — the keylines, the
plate-mark's own bevelled rule, the frame's double rule — carries the most ink and so fails first,
not last, with foxing filling in behind it. Drawn as browning haloes tightening along every stroke
into small ragged punctures rather than a uniform loss *(attested as a general conservation
phenomenon; not sourced from a period-specific Bayer or Cellarius conservation report, per this
file's own evidence discipline above)*.

The star a Bayer letter sits beside was there before the burin ever struck a line for it and stays
there after the plate corrodes past reading; what the dark erases is only ever this sheet's own
account of having composed it, which is why a run can never fly back to a plate already proved and
lost.

## The atlas page

The background artefact this era fills, per [PROGRESSION.md](PROGRESSION.md), is **the atlas page
becoming populated, plate by plate**, the way Bayer's own *Uranometria* fills a folio one
constellation at a time — built once per era, growing as the observation ledger grows, read at a
glance rather than counted. Empty, it is a bare, ruled sheet: a plate-mark struck into the paper's
own edge, the frame's double rule and degree ticks laid in, not one figure yet cut anywhere on the
whole working surface. Half filled, it reads as a working folio genuinely mid-composition would: a
handful of constellations closed and lettered beside others still no more than a faint construction
circle and a pencilled Greek letter waiting on ink, uneven the way any real engraving campaign is
uneven, dense where the burin has actually been at work and bare everywhere it has not. Complete,
once this era's own ledger has armed, the folio reads as a proved plate reads: every figure closed,
every letter inked, the sheet standing as a catalogue of a hemisphere brought under one printed
convention — composed, not observed, and captioned as such.

Once armed, per [PROGRESSION.md](PROGRESSION.md)'s ledger and designation, the next main body already
dealt in the chart is designated the transition object and drawn exactly as any other body on this
sheet — struck through the same four swept-arc stages above, captured the same way. What follows at
that capture is the dark run to completion rather than to a shoreline: every other figure this era
ever cut, every plate-mark, every wind-head, corrodes and foxes by the same ink-burn failure named
above, all at once, while the transition object and the Observer Core at the quill's own nib are the
two things that failure never touches. The quill itself then gives way to [The Lens](06-lens.md)'s
telescope, the Core carried over unchanged from the nib to the eyepiece — not where light first
enters the tube, but where an eye actually resolves what it has gathered, per
[OBSERVER-CORE.md](OBSERVER-CORE.md) — and the body beneath it is not replaced but redrawn: the same
star that was, a moment before, a lettered dot and a composed figure becomes a blurred point waiting
to be resolved, the atlas's own confident composition given up for the harder, slower business of
actually looking.

This is not this era outdoing the Astrolabe's measured point before it, and it does not get outdone
by the Lens's resolved surface after it. What this tradition did that no other era on the ladder does
is fix a star by lettering rather than by instrument or by name alone — a hemisphere composed on a
page, once, in a convention still legible today, which is a different kind of knowing than a measured
*qadr* or a resolved terminator, and one the Lens inherits rather than surpasses: the star Galileo's
own tube first resolves was, a plate's width away, already Bayer's own α.

## Frame and furniture

The plate-mark presses a shallow bevelled rule into the sheet's own edge; inside it a double rule and
a ladder of degree ticks run the frame, denser where the frame is wide enough to carry them. The
four corners each carry a wind-head, cheek-blown, breath streaming into the margin — cut before it
carried a rule and kept exactly as it always was. On a wide sheet a compass rose is thrown from
whichever contact point needs one: two faint rings, eight rays with the cardinals cut long, and the
four winds lettered round it in small capitals — SEPTENTRIO, ORIENS, OCCIDENS, MERIDIES — the
Latin cardinal names a period atlas margin would actually carry. A scale bar and a credit line sit
in the same wide-sheet margin. Nothing on the frame changes what a trajectory needs to be read; it
is furniture cut around the play field, never over it.

## The impressum cartouche

A Renaissance plate should record not only the sky it contains but the fact that it was made. The
lower margin therefore carries a narrow **impressum cartouche**, set inside the frame's furniture
and kept clear of the play channel, the HUD leaf and the run's live inscriptions. It is not a modern
status panel and it is never pinned to the viewport: it is a small piece of the plate, ruled and
lettered in the same Fell hand as the title, with a tiny device between its lines. The playfield
stays fixed. When the sheet advances, the cartouche advances with the already engraved sheet and
therefore moves downward, exactly like every other mark, until the inner rule carries it out of
view. The title and end leaves may show the same state as static leaves, so a daily run can be
recognised as a dated pull without introducing a second in-run element.

The cartouche is assembled in the order in which a sheet earns the right to call itself a proof. Its
fixed workshop furniture is present from the first pull; the more boastful lines are left as ruled
spaces until the corresponding achievement has happened:

| Proof state | What the cartouche sets |
|---|---|
| Every pull | `AUGUSTÆ VINDELICORUM` as the print place, `EX OFFICINA ORBIS TABULAE` as the printer or publisher, `TAB. V · I` as the plate number, and `A1` as the sheet signature at lower right. The workshop name is deliberate game fiction; Augsburg is inherited from Bayer's signature sheet, not a claim about a historical printer. |
| First documented star | `ANNO MDCIII`, the year of the atlas convention now being set on the sheet. It is the first proof that the page has begun to document itself rather than merely carry blank furniture. |
| First constellation | `URANOMETRIA`, the title line, set as the plate's own name rather than as a modern level label. |
| First rough impression | A small setter's correction sign — `* CORR.` beside the relevant rule — admits that the compositor had to mark an imperfect setting instead of pretending that every proof came out clean. |
| First uninterrupted perfect-transfer chain | The engraver's name line, `DELINEAVIT ET SCULPSIT`, and a small compass-and-quill burin mark cut from the chain's repeated tangent gesture. The existing `Delineavit` catalogue credit supplies the player's initials when it is earned, so the line can become personal without changing the plate's authorship fiction. |
| Complete atlas | `SERENISSIMO PRINCIPI · PATRONO ASTRONOMIÆ` and `CUM PRIVILEGIO`, a dedication to a princely patron and the printer's privilege notice. They are the cartouche's final claim that the whole convention has been completed and authorised. |
| Daily Run | `TABULA DIEI · YYYY-MM-DD`, using the same UTC date that seeds the daily plate, so the sheet reads as that day's exact pull from the press. A past-day replay appends `· ITERUM`; it never changes the recorded date or the chart. |

The completed form can therefore read:

`AUGUSTÆ VINDELICORUM · EX OFFICINA ORBIS TABULAE · TAB. V · I · A1`

`ANNO MDCIII · URANOMETRIA · DELINEAVIT ET SCULPSIT · A.B.C.`

`SERENISSIMO PRINCIPI · PATRONO ASTRONOMIÆ · CUM PRIVILEGIO`

`TABULA DIEI · 2026-09-08`

The mark and the correction sign are engraved linework, not emoji-like badges: the former is a
compact cut device, the latter a tiny compositor's intervention. At reduced motion the whole earned
state is already printed; in an ordinary run each newly earned line is set once at the cartouche's
world position and then becomes inert ink. No line follows the traveller, no cartouche is regenerated
at the viewport edge, and nothing is attached to the HUD or the player. This makes the daily's date
visible as material provenance — a dated impression of the same seed everyone received — while the
completed atlas supplies the dedication and privilege that turn a good run into a finished
Renaissance publication.

## The signature sheet

**Bayer's own *Uranometria* page** — a single constellation, lettered by descending magnitude in
Greek, its figure cut in fine, geometric, lightly broken line, a construction circle still faintly
legible under the finished contour where the compass first struck it. Six catalogue plates dress the
same sheet in six different hands without changing a line of its construction: the **Cellarius
plate** (gold on deep blue, at 1,000 lifetime captures), the **Verdigris plate** (a cooler green-
toned wash), the **Foxed plate** (the aged paper reading, spotted and browned), **Proof before
letters** (rich ink, a clean sheet, no caption cut into it at all — struck for a run that completes
all four difficulty settings), the **blue prepared paper** plate (*Carta azzurra*, white heightening
on a blue-grey ground, as the Florentine workshops actually prepared their sheets, struck at
twenty-five grazes survived), and the **Sepia plate** (the whole chart in one brown ink, exactly as
Galileo himself washed his own drawings of the Moon, struck at twelve constellations completed).
Three figure hands ride over any of the six. No chapter cycles through this sheet the way one does
on the Lens; this is the one signature sheet the era shows, dressed six ways.

## Sound

The atlas's own default voice, already shipped: a quill's scratch is filtered noise ground out in
small random grains rather than a looped sample, faster and a touch louder the harder the line
bites, so no seam is ever audible in a long line. A run opens on a rising three-note chime; a
capture rings a note off the row's own musical scale with a brush-flick riding over it, a perfect
transfer adding two notes more; a release chimes once and adds a lighter brush; the run's death is a
dying chord under a longer brush of noise. None of this is invented for this pass — it is the
game's own default fork wherever `ceilingPlate()` is false, which is to say, this era's own sound
whenever the wall of era II is not on the press.

## The prototype

**This era has no standalone canvas prototype in `prototypes/`, and that absence is deliberate
rather than an oversight.** Every other era on the ladder is prototyped first in an isolated file
because its renderer does not exist yet; this era's renderer *is* the shipped game — `src/index.html`
loaded on the paper or night plate already draws everything this file describes, at production
quality, because the game has always been set here. What this pass adds on top of that shipped
renderer — the three-state reveal keyed to swept arc rather than to a fixed staged animation, the
construction-circle phenomenon stage, the tool split described above — is new work against real,
already-tested code rather than a spike against a blank canvas, and should be built and checked
directly in `src/reveal.js` and `src/effects.js` rather than in a throwaway prototype file.

## Risk

The honest anachronism of the Hevelius and Bode figure hands is the file's largest named risk and is
stated above rather than hidden; if a future pass decides a hundred-and-ninety-one-year gap between
an era's window and its own default figure hand is too much to carry, the fix is narrower framing of
what "this era's hand" means, not a fabricated 1540–1610 source for either engraving. MACULA's
Galilean sunspot sits at the same seam for a different reason — a hazard figure rather than a body,
but drawn from an observation that arguably belongs one era later — and is kept on the strength of
the argument above, not because the seam does not exist. No dedicated research file exists for this
era, unlike every other era on the ladder; every claim above that is not sourced to the game's own
shipped code is marked accordingly, and the Piccolomini date in particular should be checked against
a primary source or a library catalogue record before it is treated as settled. The construction-
circle phenomenon stage and the three swept-arc checkpoints are new render work, not yet built or
spiked against a live transfer, and should be checked for legibility the way
[OBSERVER-CORE.md](OBSERVER-CORE.md) already asks the astrolabe's alidade sprite to be checked —
a construction circle is visually close to an ordinary orbit ring, and the two must never be
confused in flight. Finally, the comet and Saturn marks becoming this era's own cosmetic tool
variants is a real cosmetic decision, not merely a bookkeeping one: both read, out of context, as
later-era imagery (a comet's tail, a ringed planet) sitting inside a pre-telescopic atlas, and
whether that reads as a harmless period-blind cosmetic catalogue or as a visible crack in the era's
own honesty is worth a second look once they are actually drawn as quill cuts rather than left as
the generic marks they are today.
