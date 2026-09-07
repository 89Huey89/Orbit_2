# VI · The Lens

**1610–1990.** The era a point of light became a place. Three registers, one epistemology —
resolving something distant into a surface — worn by three different instruments in succession:
the eyepiece (1610–1887), the glass plate (1887–1958), and the rendered measurement (1958–1990).
Nothing before this era ever claimed to have seen a body's *face*; nothing after it needs to claim
anything, because from the Flyby onward the game's traveller is finally standing on the thing
itself. This is the hinge of the whole ladder, and the brief is right to ask it to feel that way:
**LIGHT → WORLD.** It is also, honestly, the era with the most wrong beliefs kept of any on the
ladder, because resolving a blur into a surface is exactly the kind of act a century gets to make
confidently and get wrong — Saturn's handles for forty-nine years, a lunar volcano that was never
there, an inhabited Sun, a network of Martian canals, a whole undiscovered planet named and hunted
for fifty-six years before general relativity quietly closed the file on it. Every one of those
mistakes is kept on the sheet exactly as it was believed, because the point of this era is not that
it saw correctly — it is that it was, for the first time, in a position to be wrong about a
*surface* at all.

## The documents

**Register one, the resolving telescope.** Galileo, *Sidereus Nuncius* (Venice, March 1610) —
lunar mountains and craters read off shadow and light, four moons of Jupiter; the same year's
circulated anagram, *altissimum planetam tergeminum observavi*, "I have observed the highest planet
triform," Saturn's own first false reading. Christiaan Huygens, *De Saturni Luna Observatio Nova*
(1656, the ring hidden in its own anagram) and *Systema Saturnium* (1659, the ring stated in full)
— the era's first correction of itself. Giovanni Battista Riccioli, *Almagestum Novum* (1651), with
Grimaldi's lunar map, naming *Mare Tranquillitatis* and every *mare* since. Gian Domenico Cassini
and Christiaan Huygens on Mars's polar caps (1666, 1672); William Herschel, "On the remarkable
appearances at the polar regions of the planet Mars" (*Phil. Trans.*, 1784); Herschel, "An Account
of Three Volcanos in the Moon" (*Phil. Trans.* 77, 1787) and "On the Nature and Construction of the
Sun and Fixed Stars" (*Phil. Trans.* 85, 1795) — the register's two most confident wrong readings,
both read to the Royal Society by the same astronomer within eight years of each other.

**Register two, the plate.** The Carte du Ciel / Astrographic Catalogue (agreed 1887, exposures
into the 1940s), twenty observatories shooting matched **normal astrographs** onto a **réseau** —
27×27 photographically-printed grid lines at 5 mm spacing — printed onto the emulsion before
exposure so a position survives whatever the glass itself later does; more than 22,000 plates, the
single largest coordinated observing programme the ladder has yet drawn. E. E. Barnard, *A
Photographic Atlas of Selected Regions of the Milky Way* (negatives 1889–1905, published 1927 in an
edition of about 700), printed as negatives — dark stars on a pale ground — the one place this
register's "read the silver directly" grammar is attested in print rather than only on glass. The
Harvard Plate Stacks (1880s–1989, 500,000-plus plates), annotated by hand in ink on the glass
*back*, never the emulsion, by the Harvard Computers; the Palomar Observatory Sky Survey
(1949–58, paired blue/red plates per field); the Franklin-Adams Charts (1913–14, posthumous, the
first photographic atlas of the whole sky). Percival Lowell's *Mars* (1895), the register's
best-documented mistake, and Eugène Antoniadi's correction of it at Meudon's 83 cm refractor during
the 1909 opposition, published in full as *La Planète Mars* (1930).

**Register three, the rendered measurement.** The material here is real and dated — the FITS
header standard (Wells, Greisen and Harten, 1981), fixed-width ASCII cards naming a telescope, a
filter, an exposure and a target with no hand in any of it — but stated plainly rather than dressed
up: the register's own most iconic *documents*, the Hubble Pillars of Creation (1995), the Event
Horizon Telescope's black-hole images (2019, 2022) and JWST's first science images (2022), all fall
after this era's own stated 1990 close, because the research file behind this register
([research/observatory.md](research/observatory.md)) was written for a much later era under an
earlier ladder. What genuinely belongs inside 1958–1990 is the register's *opening*, not its
flowering: routine digital imaging entering professional astronomy through the 1970s and the FITS
standard closing the register's own grammar in 1981, three years before the era's stated end. The
honest reading, kept rather than smoothed over, is below in **Risk**. What is not in question is
the game's own document: `PLATE_STYLES.modern` and `renderedSpecimen()` — already shipped, already
producing a lit sphere with a terminator, limb darkening and an atmospheric rim for all seven
families — are this register's climax, built before this file was, and this pass's job is to place
them correctly rather than to invent them.

## The grammar

Three grammars, worn in succession by the same act of resolving.

Register one draws exactly as [The Engraving](05-engraving.md) does — a burin's line, hatching
toward a limb, a fine stipple where hatching alone would go muddy — because a Huygens plate of
Saturn's ring or a Herschel sketch of a lunar "volcano" was, physically, an engraved or hand-inked
illustration in precisely that convention. What changes is not the tool cutting the line; it is
that the line now claims to have resolved a *surface* rather than merely to have lettered a point,
which is the whole difference this era exists to draw.

Register two inverts every convention the ladder has used so far. **The negative is the primary
document.** A star is a growing knot of black metallic silver on an otherwise clear pane —
brightness becomes literal opacity, not drawn light — and composition is not a projection of the
whole sky but a **grid of rectangular fields**, tiled edge to edge the way survey plates actually
tile the sky, each its own small negative with its own réseau or fiducial marks. Figures are
entirely gone. What replaces them, in descending order of how much frame they occupy: the réseau
grid, catalogue numbers and fiducial crosses, the plate's own stamped or written identity, emulsion
defects, and ink laid on afterward by a human hand. Every mark is either physics or bookkeeping —
nothing drawn from imagination or inherited tradition, the sharpest possible contrast to every
earlier era on the ladder.

Register three is light, not line: every resolved body is a lit sphere with a terminator, limb
darkening and an atmospheric rim, nothing hatched, nothing printed as a silhouette. The grammar is
instrumentation rather than illustration — a scale bar, a two-arrow N/E compass, a filter or
wavelength label, an epoch, and, where the colour is false, a colour bar disclosing the mapping.
This is not decoration; it is the picture's proof, the discipline that stands in this register for
a cartouche's maker's mark. Nothing is anonymous, hatched, or hand-lettered.

## Palette

**Register one, inherited unchanged from [The Engraving](05-engraving.md).** A Huygens or a
Herschel plate is drawn in the same ink and the same ground era V already keys, because it is the
same medium — the night-plate indigo, the paper-plate parchment, the gold or iron-gall line, never
a new swatch of its own.

| Material | Hex | Role |
|---|---|---|
| Night-plate ground, deep indigo | `#080f18` | the sky rendered near-black, as era V |
| Paper-plate ground, aged parchment | `#e7dabd` | the loose sheet, this register's true baseline |
| Gold ink, night ground | `#E2C385` | the burin's line where the night reading is chosen |
| Iron-gall ink, paper ground | `#3A2A1C` | the burin's line on the sheet itself |
| Reserved sheet, unprinted | the ground colour itself | a body's own unlit limb, unresolved |

**Register two**, one channel, silver on glass, but not one grey. The ground is the clear emulsion
itself, transparent rather than tinted, and the "gold" is silver, reversed from every earlier
register's leaf or ochre accent.

| Swatch | Source | Hex |
|---|---|---|
| Clear emulsion (ground) | unexposed silver-gelatin | `#e8e4da` |
| Dense silver (bright star) | fully built-up deposit | `#1a1714` |
| Mid-grey (faint star) | thin deposit | `#8a8378` |
| Sepia print tone | warm toning, older prints | `#5c4530` |
| Cold blue-grey | mid-century print stock | `#5a626b` |
| Blue-sensitive cast | the emulsion's own tint, unprinted | `#c9d6d2` |
| Ink annotation, black | India ink, glass back | `#141210` |
| Ink annotation, red | grease pencil / red flag | `#8a2318` |
| Réseau grid line | printed silver hairline | `#3a3630` |

**Register three**, already shipped as the `modern` plate's own tokens: ground the near-black of a
sensor, ink a cool instrument white shading to cyan.

| Swatch | Source | Hex | Confirmed |
|---|---|---|---|
| Sensor ground | `PLATE_STYLES.modern`'s own dark tint | `#04060b` | shipped |
| Instrument ink, light stop | the `modern` tint's light stop | `#e9f2fa` (`[233,242,250]`) | shipped |
| Sulphur-II (SII) | narrowband red channel | `#e8482f` | yes |
| Hydrogen-alpha (Hα) | narrowband green channel | `#39c46a` | yes |
| Oxygen-III (OIII) | narrowband blue channel | `#3aa0e8` | yes |
| EHT ring, amber | attractor's rendered form | `#ff8c3c` | (unverified colormap name) |

## Lettering and the hand

**Register one** keeps [The Engraving](05-engraving.md)'s own faces exactly, IM Fell English and
IM Fell English SC (SIL OFL 1.1), because a Huygens or a Herschel paper was typeset in precisely the
same period-Latin convention as any other atlas page of its century — resolving a surface changed
what the caption claimed, not the fount it was set in. A discovery caption here reads dated, in
Fell italic: `1610 · SIDEREUS NUNCIUS`, `1659 · SYSTEMA SATURNIUM`.

**Register two** breaks from that hand entirely. **Courier Prime** (SIL OFL 1.1), a redrawn
descendant of IBM Courier, is the primary numeral and log face — the one register where a score
plausibly reads as a typed log entry, so the HUD resolves **typed, not stroked**, a value replacing
whole in one instant rather than built up by a nib. **Special Elite** (Apache 2.0, compatible but
not OFL) models a real Smith-Corona machine and is reserved for one dramatic plate-jacket label.
**Libre Franklin** (SIL OFL 1.1), an open revival of Franklin Gothic contemporary with the Carte du
Ciel within a decade, sets réseau labels and catalogue margins. The Harvard hand itself is not a
formal script — the exact letterform used by the Harvard Computers is **(unverified)** — so it is
written as a single continuous, faster, looser line than register one's engraving hand, someone
circling a star through a loupe rather than composing a caption, revealed by a develop-in fade
rather than a stroke.

**Register three**'s exact model is the FITS header card itself: fixed-width, uppercase, no hand
in it at all — `SIMPLE`, `BITPIX`, `NAXIS`, `OBJECT`, `DATE-OBS`, `EXPTIME`, `FILTER`, `TELESCOP`,
`RA`/`DEC`, typeset verbatim, this register's script in the same sense hieroglyphs are era II's.
**IBM Plex Mono** (SIL OFL 1.1) is the card face, cut to the literal ASCII a card uses; **Space
Grotesk** (SIL OFL 1.1) sets margin small capitals; JetBrains Mono, Inter and B612 (drawn for
Airbus cockpit displays, EPL/EDL/OFL) stand as alternates. The reveal is a teletype, not a stroke —
whole-glyph by whole-glyph at a constant cadence, a blinking block cursor in place of a nib —
and numerals **tick rather than write**, like an instrument readout.

## Names

The vocabulary changes register by register, because the game is not translating one culture's
word, it is following one act of resolving through three different institutions.

| Game term | The era's word | Evidence |
|---|---|---|
| An unresolved point | a blurred disc at the eyepiece (reg. 1); a bare knot on the glass (reg. 2); a FITS `OBJECT` field (reg. 3) | fictional gameplay translation; `OBJECT` itself attested |
| The Moon | *Luna*, the first body this era actually resolves — Galileo's terminator and craters, 1610; Riccioli's named *maria*, 1651, though they hold no water | attested |
| A resolved world (the seven families) | undifferentiated by name in registers one and two — a bracketed annotation and a plate's own density stand in for a name no century yet had; **ocean world, rocky/airless world, gas giant, ice giant, desert world, lava world, hot Jupiter** only in register three | reg. 1–2: n/a, by design (per [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md), no family is named until this era resolves one); reg. 3: attested, informal exoplanet-outreach usage |
| Slingshot | a full sweep of the tube on its mount, the slow-motion screw run one whole turn | fictional gameplay translation |
| Shield | the objective's own dew-cap, a plain ring at the tube's mouth | fictional gameplay translation |
| Reflector | a finder-scope's mirrored image (reg. 1); a blink comparator's flipped pair of plates (reg. 2) | fictional gameplay translation, grounded in the attested comparator Tombaugh's own Pluto search used |
| Inkwell | a fresh plate, still boxed and unexposed | fictional gameplay translation |
| Orbit / capture / release | reg. 1: "brought to focus" / "the tube slewed away," constructed; reg. 2: a plate is **exposed**, an object **recovered**, release ends the **exposure**, constructed on attested usage; reg. 3: **acquisition** and **slew**, attested telescope-operations terms | mixed, as noted per register |
| Currency | **exposure**, one word for all three registers | attested concept, renamed once |
| Score | a magnitude the tube resolves (reg. 1); a limiting magnitude reached, or objects catalogued (reg. 2); signal-to-noise, S/N (reg. 3) | attested |
| Chapter/sheet | none named (reg. 1); **plate** / **field** (reg. 2); **visit**, HST's own scheduling unit (reg. 3) | attested, regs. 2–3 |
| Best | the faintest magnitude the tube has thrown (reg. 1); the deepest plate exposed (reg. 2); the longest integration logged (reg. 3) | constructed |
| Daily | none (reg. 1); **the night's plate** (reg. 2) | constructed / attested framing |
| Title "Orbit" | stays **orbit**, unaltered — in register three this is not a translation at all: an HST orbit is the literal unit telescope time is proposed for and awarded in, so in the very last years of this era the game's own title is already this register's name for a rationed cycle of the instrument's flight | attested, and not manufactured — the coincidence is real |

## Currency and the rule

**Currency: exposure**, one word standing for the same rationed quantity in three institutions —
held attention on a guide star at an eyepiece, hours of clear sky and unbroken manual guiding on a
photographic plate, and HST orbit-fractions budgeted around Earth-occultation and guide-star lock.
No rule rides on top of the name: the old plate-only "hold to develop" reveal, where a body brought
up successive rings of density as `INK_ORBIT_GAIN` ticked, is retired as a bespoke mechanic and
folded entirely into the universal three-state reveal every era now runs — a captured body's
observation stage *is* the develop-in, keyed to swept arc rather than to a second private clock,
exactly as [ECONOMY.md](ECONOMY.md) asks every era's currency row to be: a name, a number, a
depiction, nothing else. The completeness-scaled release dividend applies here precisely as it
applies everywhere on the ladder.

## Dangers

| Row | Name | Depiction |
|---|---|---|
| Attractor | **Emulsion void** | At the eyepiece, an occulted patch where a field's stars simply refuse to resolve; on the plate, its dated and attested form — a ragged pale island where the silver has lifted clean off the glass, stars absent inside its border; rendered, the same absence finally admits what it was: the EHT's own black disc, ringed by a thin, deformed bright arc, brighter on one side. |
| Repulsor | **Halation** | A bright body overrunning its own edge: a simple blooming glare at the eyepiece that no aperture stop fully checks; on the plate, halation proper, light scattering back off the glass support into the emulsion, a soft concentric bloom outside the star's true disc — a real period fault, with a real period fix, staining the plate's own back to absorb the backscatter; rendered, the same overrun becomes a coronagraph's occulting disc and the bright three-part structure breaking past it. |
| Crosswind | **Tracking drift** | An unsteady hand at the slow-motion screw drags a whole field one direction over a long exposure — short parallel trails, density fading with distance, a field rather than a body — rendered, the same push becomes the Parker spiral's own drifting solar wind, thin curved arcs and faint drifting specks. |
| Obscurer | **Dark nebula** | A patch where the star count simply falls to nothing, unremarkable until Barnard's and Max Wolf's photographs proved, in the 1900s, that some of the sky's "holes" are nearby opaque dust rather than gaps between distant suns; carried into the rendered register as the dust lanes `paintModernBackdrop()` already draws, captioned in the spirit of the Lynds Dark Nebula catalogue. |

## The bodies

**Before capture**, a body on this sheet is exactly what it is on every earlier sheet: a blurred
point or an unfocused disc, its position, its capture-region size and whatever its class demands
for planning a transfer all as legible as any other era's phenomenon. What it withholds is
identity — not merely a name, as on earlier sheets, but for the first time on this ladder a
*surface*, because this is the one era whose entire epistemology is the act of resolving one.

**While the orbit is held**, which of the three registers above is drawing the body is not a
property of the body — it is a property of how far era VI's own observation ledger has climbed.
This file proposes the simplest rule that needs no new simulation state: the same fraction that
arms the era's transition is read a second time, in thirds, so a capture early in the era's own
span plays in register one's engraved hand, a capture in the era's middle third plays on the plate,
and a capture in its last third — up to and including the transition object itself — renders. This
is a render-side reading of a number the ledger already computes, not a second clock and not a
second call into `this.random()`; it never pauses play, never designates anything, and it must
never be confused with an era transition, which happens exactly once per era and nowhere inside it.
A body's own three checkpoints — capture, ~90°, ~180°, ~240° — play out identically in shape
whichever register is currently drawing them; only the material changes.

*In register one*, at capture the tube's focus is still soft; by ~90° it has thrown off whichever
first reading the century actually saw — Galileo's handles on Saturn, a terminator and craters on
the Moon, a spot on Jupiter, a cap at a Martian pole; by ~240° that first reading has resolved into
its better answer where history gives one within this register — Huygens's ring, 1656–59; Cassini's
spot, tracked to 1713 — and stays exactly as open a reading as the century left it where it does
not.

*In register two*, a body appears at capture as a bare point on the glass, and the held orbit brings
up successive rings of density exactly as a tray print develops — highlights first, the faint outer
wash last. This register carries the era's single richest story. The **dune** family develops, at a
glance, as **Lowell's canals**, ruled straight across the disc in the ink-on-glass hand, `LOWELL
1895` written beside it, because the plate era believed them for fifteen years; under the held
orbit those same canals resolve into **Antoniadi's irregular patches** of 1909, and the sheet
corrects itself in ink beside the first annotation rather than erasing it, exactly as the historical
record corrected itself. One further mistake belongs to this register without belonging to any of
the seven families at all: **Vulcan**, the planet Le Verrier inferred from an unexplained 43″ per
century in Mercury's perihelion in 1859, "confirmed" by Lescarbault's transit the same year, and
never retired from serious search until general relativity closed the question in 1915. Because
nothing at that position was ever real, Vulcan is not a capturable body anywhere in the game — it
survives only as a struck catalogue entry on this era's own knowledge structure, below, a name
entered in 1859 and crossed through rather than erased, the sheet's own honest record of a body
that was catalogued and never found. Ocean is a small, dense, round knot; crater carries a faint
double-density edge standing in for relief; ringed is an elongated oval smear, not a resolved ring;
ice sits fainter, near the plate's own fog level; volcanic is the densest knot, verging on halation
without crossing it; storm is elongated like ringed but with soft internal banding. No diffraction
spikes anywhere in this register: the refractors its key documents were shot on have no spider vane
to cause them.

*In register three*, a composite assembles filtered channel by filtered channel into the rendered
sphere `renderedSpecimen()` already draws for every family — an albedo pass, a lighting pass, a
weather pass, composited exactly as the shipped code already composites them — and the instrument
margin, the scale bar, the filter label, the epoch, arrives only once that composite is complete,
never before, the same discipline [research/observatory.md](research/observatory.md) documents for
the material this register is drawn from.

**Once understood**, a body is what [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) says every body on
this sheet becomes: a resolved world — a ring, a terminator, a band, a cap, a patch — named and
dated to the observation that first drew it, in whichever register drew it. This era keeps more
wrong beliefs than any other on the ladder, and keeps every one of them without correcting itself
past its own registers, because correcting them is not this era's job: Saturn's handles, 1610–1659;
Herschel's three lunar volcanoes, read to the Royal Society 26 April 1787, and his solid, inhabited
Sun, *Phil. Trans.* 85, 1795; Lowell's canals, 1894–1909; Vulcan, 1859–1915. Every one of these is
drawn exactly as its century believed it, sealed by the register's own small completion flourish —
a settling wash, a stamped plate number, a completed FITS card — because a player needs to know an
observation is finished without a gauge, not because the game is endorsing what it drew.
[The Flyby](07-flyby.md) is the era that corrects these, not this one, and correcting them is that
era's own entry in the "wrong belief kept" column, not a claim that this era did its job worse.

**The tool is a refracting telescope, and the Observer Core sits at its eyepiece, not its
objective.** What the game renders around the moving point is the shipped `telescope` mark — barrel,
lens cells and a projected sightline — already one of `OBSERVER_MARKS`' five catalogue marks and
already, per [OBSERVER-CORE.md](OBSERVER-CORE.md), this era's own default tool rather than a
cosmetic choice inside another one. The tube leads objective-first, its sightline projecting ahead
of the traveller's own heading exactly as the shipped mark already draws it; the Observer Core sits
where an eye actually resolves an image, near the tube's trailing end, not where light first enters
it — a decision, not a transcription, because the Core is the point that wants to know, not the
point that merely gathers light. Across the era's own three registers the tube's silhouette may
gain a photographic back in register two and a sensor housing in register three without ever
changing what the Core itself is or where it sits, per [OBSERVER-CORE.md](OBSERVER-CORE.md)'s own
rule that a tool may be re-clad at every transition but the Core never varies within one.

## The frontier

This era's word for the boundary is **the fog**, a real photographic-conservation term reused
rather than invented, because the decay below already answers to that name in the archives it is
drawn from. The rate, the grace and the shoreline are exactly [THE-FRONTIER.md](THE-FRONTIER.md)'s,
unchanged; what fails, in order, as the boundary nears a body on any of the three registers, is
three real and distinct photographic-conservation failures, not one wash. **Fog** first — age or
chemical fog, an unwanted overall density flattening an image's contrast toward a grey field.
**Silver mirroring** next — metallic silver in the densest tones of an old print migrates to the
surface and oxidises into a thin reflective sheen, blooming specifically where the image was
darkest, not where it was faint. **Emulsion frilling** last — the gelatin layer separates from its
support and curls away at an edge, the image's own border visibly lifting until nothing is attached
to anything beneath it. The shoreline itself stays the sharpest edge in the whole decayed field,
drawn on top of the grain rather than folded into it, exactly as every other era's frontier is held
to the same discipline.

## The optical catalogue

The background artefact this era fills is **the optical catalogue**, and which of its own three
forms is showing tracks the same register fraction the reveal above reads: an observing log in
register one, a réseau grid of plotted positions in register two, a table of resolved sources with
their own FITS cards in register three. Empty, whichever form is currently showing is bare — a
blank log page, an unmarked grid, an empty instrument table. Half filled, it reads as the genuine
mixed record such a catalogue actually is: dated entries beside undated blanks, a réseau filling
unevenly as fields are exposed out of strict order, a table with some rows still reading
`OBJECT = UNKNOWN`. Complete, once this era's own ledger has armed, the catalogue carries enough
resolved, dated entries that it reads, at a glance, as a settled record of worlds rather than a
scatter of sightings — including, honestly, the one entry that was never a world at all: **Vulcan**,
entered in 1859 and struck through rather than erased, a single line in whichever hand register two
happens to be showing when the ledger arms, the catalogue's own admission that not every entry it
ever made was kept.

Once armed, per [PROGRESSION.md](PROGRESSION.md)'s ledger and designation, the next main body
already dealt is designated the transition object and completed in whichever of the three registers
the era has reached by then — most often, by construction, the third, since arming happens late in
an era's own span. What follows at that capture is the fog run to completion across everything
still on the sheet, in every register any part of the catalogue happens to be showing, while the
transition object and the Observer Core at the telescope's own eyepiece are the two things that
failure never touches. The telescope itself then gives way to [The Flyby](07-flyby.md)'s spacecraft,
the Core carried over unchanged at the new tool's own sensor boresight, and the body under it is not
replaced but redrawn: the same light that was, a moment before, a rendered sphere with a
terminator and a filter label becomes a mapped place with coordinates, an instrument margin, and,
for the first time on the whole ladder, a caption that corrects rather than merely dates —
[The Flyby](07-flyby.md)'s own entry undoes this era's canals and this era's Vulcan, not by
claiming to have seen better, but by having finally gone there.

This is not this era outdoing the eras before it, and it does not get outdone by the era after it
either. Every earlier era on this ladder learned to fix a position, a name, or a place in an order;
this is the first era to claim a *surface*, and getting a surface wrong in three different
centuries is not a failure of the method, it is what the method actually is — a claim strong enough
to be tested, which no dot, no decan and no engraved point of light before it ever was.

## Frame and furniture

**Register one** keeps era V's own frame nearly whole: the plate-mark's bevelled rule, the wind-heads
cut into the corners, a compass rose thrown from a wide sheet's own margin — furniture cut around
the field, never over it, exactly as the atlas it is drawn from.

**Register two** drops all of it. A plain rectangular border — the plate's own physical edge, with
an unexposed margin left for writing — replaces the cartouche entirely. The réseau grid, where
present, is ruled straight through the whole field rather than confined to a border; a stamped or
written plate-identity block (series letter, running number, date, exposure length) sits in one
corner; the four corner wind-heads drop to plain fiducial crosses, and the compass rose becomes a
small printed N/E/S/W if it survives at all.

**Register three** replaces margin with instrumentation: a scale bar in arcseconds, a two-arrow N/E
compass rather than a four-point rose, a filter or wavelength label, an epoch, a colour bar where
the image is false colour, and a credit line — the FITS-card block itself the natural home for the
HUD's own readouts, a small stack of monospace `KEYWORD = value` lines ticking rather than being
written.

## The signature sheet

**Chosen: one body, drawn three ways on one sheet.** Saturn, the planet this era got wrong longest
and corrected best: Galileo's own 1610 "triform" reading at one corner of the sheet, handled and
uncertain; an elongated, unresolved plate-smear from register two beside it, dated and annotated in
the ink-on-glass hand; and, closing the sheet, the rendered sphere `renderedSpecimen()` already
draws for the ringed family, its shadow band crossing the globe beneath a scale bar and a filter
label. One planet, one era, three centuries of the same question answered three times — the
clearest possible demonstration, in a single image, of what merging three registers into one era
actually buys. Later enrichment: Herschel's three lunar "volcanoes" of 1787, drawn as his own paper
described them and never corrected on this sheet; a Carte du Ciel field with its réseau grid intact,
Lowell's canals beside Antoniadi's patches on the same annotated plate; a rendered Jupiter close,
banded and lit from one quarter.

## Sound

Register one keeps era V's own voice — a filtered-noise scratch for a line being cut, a rising
chime on capture, a brush-flick on a perfect transfer. Register two breaks it: a single mechanical
shutter clack opening an exposure, a softer one closing it; a faint tick or creak from a
slow-motion screw under a held orbit; a crisp, fast blink-comparator click, about three a second,
for anything comparative; a fine dry scratch for the ink-on-glass reveal, distinct from a wet nib;
a soft liquid swish for the develop-in; a single sharp crack of glass for a run-ending loss.
Register three replaces all of it with instrument sound: a short two-tone chime for guide-star
lock on capture, a single dry click for the shutter on release, a brief descending electronic whine
for CCD readout under a capture's score gain, a low continuous servo hum for a slew in flight, and
a harder, more electronic klaxon for a run's loss in place of any of the above.

## The prototype

Two of this era's three registers already have a standalone canvas prototype, built under the old
ladder's separate names for what are now this file's second and third registers.
`docs/eras/prototypes/plate.html` paints register two: a seeded 1280×800 sheet loading Courier
Prime, Special Elite and Libre Franklin locally, its one stated compromise being that no cursive
face models the unverified Harvard hand, so the ink-on-glass annotations use Libre Franklin Italic
with per-glyph jitter instead. `docs/eras/prototypes/observatory.html` paints register three:
IBM Plex Mono and Space Grotesk loaded locally, its tokens matching this file's register-three
palette directly. Both were judged to reach the shipped standard on their respective passes; see
[PROTOTYPES.md](PROTOTYPES.md). **Register one has no prototype at all**, and this is the file's
single largest honest gap: nothing has yet tested whether a Galileo-style wash drawing or a
Herschel-style hand-inked sketch, staged across the same 0°/90°/180°/240° checkpoints every other
register already uses, actually reads as a *resolving* image rather than as era V's own
construction-circle phenomenon redrawn with a different caption.

## Risk

**This is the ladder's biggest authored-art bill, honestly.** Three registers means three palettes,
three lettering systems and, new to this pass, one register-progression mechanic — the ledger-third
rule proposed above — that exists nowhere else on the ladder and is unspiked. The order to build it
in: register two first, because it is nearest to finished (a shipped duotone, an existing
prototype, the lowest risk of any register on the ladder); register three second, because its
climax — `PLATE_STYLES.modern`, `renderedSpecimen()` — already ships and only needs the instrument
margin and the FITS-card HUD built out around it; register one last, because it has no prototype,
no existing renderer of its own beyond era V's, and needs new period-accurate art — a Galileo wash,
a Huygens ring construction, a Herschel sketch — that nothing in the codebase yet draws.

**The register-three date tension is real and is stated above rather than hidden.** This era closes
in 1990; its own richest documents — the Hubble Pillars, the EHT images, JWST's first light — are
all from after that date, because [research/observatory.md](research/observatory.md) was written
for a different, later-opening era under an earlier plan. The honest fix is not to fudge the dates;
it is what this file already does — ground register three's own *window* in the FITS standard
(1981) and the entry of routine digital imaging into professional astronomy through the 1970s, and
treat its richest imagery as the vocabulary [The Flyby](07-flyby.md) and [The Probe](08-probe.md)
inherit forward and put to full use, not as this era's own attested history.

**Vulcan's treatment is invented here and unspiked.** A phantom body that never existed cannot be a
capturable node without breaking the game's own honesty about what identity is ever withheld
(position and capture-region size are never staged, and a body that does not exist has neither); the
struck-catalogue-entry solution above is this document's own answer, not one settled anywhere else
in the ladder's planning, and should be checked against a built knowledge structure before it is
treated as final. The ledger-third register rule is the same kind of provisional number
[PROGRESSION.md](PROGRESSION.md) already flags for its own thresholds and needs the same
`verify.mjs` probe before being trusted at speed.
