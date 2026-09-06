# Research — The Instrument (Islamic Golden Age: astrolabe, alidade, angular measurement)

**Reframes the Islamic-Golden-Age era (964 CE, al-Ṣūfī, to 1437 CE, Ulugh Beg) around the language
of measurement rather than the language of manuscript illumination.** [globe.md](globe.md) already
covers this era's documents, its manuscript grammar, its script and font pipeline, its currency and
its dangers in depth; this file does not re-derive any of that. It supplies the half the brief
says is missing — the astrolabe's actual anatomy, how a sighting is taken, the observatories as
working institutions, engraved brass as a material, and the geometric-diagram tradition — and it
says plainly, in §1, which parts of the existing research the new brief overrides and which stand.
Web access this session was intermittent: two of the richest primary sources (`hsm.ox.ac.uk` and
`mhs.ox.ac.uk`, Oxford's Museum of the History of Science and its dedicated astrolabe catalogue)
were blocked by the network egress proxy on direct fetch, so everything drawn from them below comes
from search-engine summary snippets rather than a page this session actually read, and is marked
**(unverified)** accordingly, exactly as the brief instructs and exactly as [rock.md](rock.md) and
`globe.md` already do for their own gaps. A later finalization pass over this file, run in a
separate session, found network egress blocked entirely for that session (every external domain
tried, not only the two named above) — see the note at the top of §14 for what that pass could
and could not re-check.

## 1. What this file supersedes, and what it leaves standing

**Supersedes:**

- **Which grammar leads.** `globe.md` §2 and [05-globe.md](../05-globe.md)'s own text choose the
  **manuscript page** as the era's primary grammar (per `DECISIONS.md` §4, cited there), with the
  instrument grammar — engraved brass, no colour, no fill — appearing "only once, small, as a
  colophon vignette." The new brief inverts this for the era's gameplay identity: "avoid generic
  crescent-moon decoration," build the era's visual and mechanical language from astrolabes,
  alidades, angular measurement and engraved brass, and make the player's own on-screen form an
  alidade. Under the new brief, **instrument grammar is the era's primary register**; the
  manuscript page (al-Ṣūfī's constellation figures, gilt discs, flat colour) survives only as the
  *ground the geometric construction sits on* — a background register, not the chart's main voice.
- **The player tool and the knowledge-gain statement.** Neither [05-globe.md](../05-globe.md) nor
  its research file names a player tool or a knowledge-gain arc for this era — those concepts
  postdate them. The new brief supplies both: player form is "an alidade / astronomical sighting
  pointer / measurement arm," the Observer Core sits at its sighting point, and the era's knowledge
  gain is **VISIBLE OBJECT → MEASURABLE OBJECT**. §10 below works out what that means concretely
  for a moving, one-tap avatar.
- **The three reveal states.** [05-globe.md](../05-globe.md) describes only an end state (a body
  "under the held orbit… a gold disc sized to its class… with a fine dark contour and a burnished
  rim"). The brief's three-state structure — a celestial target before orbit, sighting arcs and
  engraved divisions during it, a precisely measured phenomenon after — is new; §11 works it out.

**Leaves standing (do not re-derive; cite instead):**

- The **document list** (al-Ṣūfī's *Ṣuwar al-kawākib al-thābita*; MIA Doha MS.2.1998.SO, 1125 CE;
  BnF Arabe 5036; the 1085 Valencia globe; Ulugh Beg's *Zīj-i Sulṭānī*) and the correction that
  Bodleian Marsh 144 is a disputed, later-dated copy, not the 1009 CE benchmark — `globe.md`
  §1 already did this work.
- The **manuscript-grammar palette rows** (gold leaf `#D4AF37`, shell gold `#C9A227`, lapis
  `#1B3F8F`, vermilion `#E34234`, orpiment `#F4C430`, verdigris `#3E8E7E`, lamp-black `#241C11`,
  cream paper `#EFE1C4`) — these survive as the palette for the geometric-diagram ground and for
  whatever manuscript vignette remains; §9 below only adds what that table left thin, the brass
  and gilt-instrument rows.
- The **script and font pipeline** (naskh/thuluth/kufic role assignment, the qalam's two-pass
  draw-then-dot motion, Amiri/Noto Naskh/Scheherazade/Reem Kufi, fontkit's `ArabicShaper`
  pre-shaping plan) is unchanged for *manuscript* text. §6 below adds the one correction the new
  emphasis surfaces: an instrument's own engraved numerals are not the Eastern Arabic-Indic digits
  that file recommends for the HUD.
- The **four-row danger table** (al-jawzahar's dragon, al-Shams' burning, al-Rīḥ/sammūm, al-Ṣūfī's
  little cloud) is, almost word for word, what the brief itself asks for — this is the one area
  where the brief and the existing research already agree. §12 below keeps the same four names and
  reworks only the *depiction*, from manuscript iconography to instrument iconography, per the
  brief's own instruction to use engraved brass rather than painted figures.
- The **seven-family "instrument mode"** already sketched in `globe.md` §8 (no colour;
  each family a fine incised contour differentiated by hatch-density; a second incised circle where
  a gold ring would sit) is, under this brief, promoted from an alternate mode to the era's default.

## 2. The instruments: named, dated, collected

Real objects anchor an instrument-grammar era the way named manuscripts anchor a scribal one. The
following are the best-attested planispheric astrolabes and related pieces relevant to this era's
964–1437 CE window; museum holdings that postdate 1437 are marked as such rather than silently
imported, following this file's own §1 rule and `globe.md`'s precedent with the Mughal
seamless globes.

- **The Nastūlus astrolabe**, signed by Muḥammad ibn ʿAbd Allāh, known as Nastūlus, dated 315 AH /
  927–928 CE, made in Baghdad, now in the **Kuwait National Museum** (Dār al-Āthār al-Islāmiyyah).
  Widely cited as the earliest *securely dated* astrolabe to survive, though several earlier,
  undated Abbasid instruments are also known — **attested**, cross-confirmed across independent
  sources this session (McGill's *Biographical Encyclopedia of Astronomers*, Sotheby's lot notes,
  Muslim Heritage). No shelf/inventory number was found this session — flagged (unverified).
- **An astrolabe by Aḥmad ibn Muḥammad al-Naqqāsh, dated 1079/80 CE**, held by the
  **Germanisches Nationalmuseum, Nuremberg**, described in a search summary as "probably the oldest
  existing astrolabe" in that museum's own holdings — note this is a claim about *that collection*,
  not a challenge to Nastūlus's 927/8 priority overall; treat the "oldest existing" phrasing as
  imprecise museum-copy language rather than a contested date, and mark the object and date
  **(unverified)**, since this session reached it only as a search-engine summary, not a fetched
  page.
- **The Museum of the History of Science, Oxford**, holds what several independent summaries call
  the world's largest and most systematically catalogued astrolabe collection — on the order of 170
  instruments, spanning India, the Islamic world and Europe, with its own dedicated online
  catalogue (`mhs.ox.ac.uk/astrolabe`). This session could not fetch that catalogue directly (proxy
  block); a search summary of it names an **astrolabe by Muḥammad Muqīm al-Yazdī, Persian, dated
  1647/8, inventory number 45747**, and a **spherical astrolabe by Mūsā, Eastern Islamic, dated
  1480/81, inventory number 49687** — both fall after this era's 1437 close and both, including the
  inventory numbers themselves, are marked **(unverified)**, carried only as far as a search
  summary took them.
- **The Adler Planetarium, Chicago**, holds one of the largest astrolabe collections outside the
  Islamic world and Europe; a search summary describes its oldest piece as an astrolabe whose main
  body was made in **Baghdad in 1130–31 CE**, with other objects in the collection dated to around
  1250 CE — both dates **(unverified)**, again reached only through search summary rather than a
  fetched collection page.
- **Germanisches Nationalmuseum, Nuremberg — the European end of the same tradition, useful for
  contrast.** An astrolabe attributed to Georg Peuerbach, Vienna, 1457, called the oldest instrument
  of the Viennese school Regiomontanus himself belonged to; and a gilt-brass astrolabe of 1516,
  probably by Johannes Werner, working in the Regiomontanus tradition. Both **(unverified)**, from
  search summary. Useful chiefly to show that the instrument, unlike the manuscript, crosses the
  era's own cultural boundary intact — the same mater/rete/alidade vocabulary, the same brass,
  reappears a full Renaissance later in Nuremberg workshops, which is itself a small argument for
  why "engraved brass" reads as a coherent visual language across a very long span.
- **The 1085 CE Valencia celestial globe** (Ibrāhīm ibn Saʿīd al-Sahlī, Museo Galileo, Florence) —
  already fully covered in `globe.md` §1; not re-derived here, only flagged as the
  instrument-grammar era's other great attested object besides the astrolabe proper.

## 3. Anatomy of the planispheric astrolabe

The planispheric astrolabe projects the celestial sphere onto a flat brass disc (a stereographic
projection, centred on one of the poles) and stacks its parts so that projection can be read,
rotated and re-read for any date, time and latitude within its design range. Every part below is
**attested** — this is standard instrument-history material, cross-confirmed across the Museo
Galileo, Whipple Museum (Cambridge) and Encyclopaedia Iranica pages read this session — and
every part earns its keep mechanically, which is exactly the "language of measurement" the brief
asks for: nothing on the object is purely decorative.

| Part | What it is | What it is for |
|---|---|---|
| **Mater** ("mother") | The thick brass body of the instrument, a shallow dish with a raised, graduated rim | Everything else nests or pivots inside it; it is the fixed reference the rest of the stack rotates against |
| **Limb** | The mater's own raised outer edge, engraved with a full 360° scale | Where every reading is finally taken off — hours, degrees of altitude, degrees of the zodiac, depending on which face and which use |
| **Tympan** / **plate** (a stack of several, swapped for latitude) | A flat disc engraved with the local sky's coordinate lines — altitude circles (almucantars), azimuth lines, the horizon, unequal-hour lines — cut for one specific latitude | The one part of the whole stack keyed to *where on Earth* the observer stands; a traveller carried several plates, one per latitude band they expected to use |
| **Rete** ("net") | An openwork, pierced brass disc laid over the tympan: a skeletal ring for the ecliptic (the sun's annual path) plus a scatter of shaped pointers, each tipped at one bright star's exact catalogued position | The sky itself, made to rotate: turning the rete simulates the whole sphere's daily turning against the fixed local-latitude plate beneath it |
| **Star pointers** | Small stylised shapes on the rete's arms — commonly a bird's head, a leaf, a dagger tip or a flame — each engraved beside it with that star's Arabic name, its tip alone marking the star's true position | Because the rete is otherwise near-total negative space, star data is carried entirely by *labelled points*, not by picture — the figure is gone; only catalogued position and name remain |
| **Rule** | A slim bar pivoting on the front face's central pin, laid across the rete and read against the limb | Reads off a date on the ecliptic, or a time against the limb's hour scale — the front-face working tool, distinct from the alidade on the back |
| **Alidade** | A rotating sighting bar on the *back* face, with a small upright sighting vane (a **pinnule**, pierced with a hole or slot) fixed at each end | The instrument's actual observing tool: sighted at a star or the sun through its two pinnule-holes, then read against the limb on the back to give that body's **altitude** directly |
| **Throne** | A raised, often pierced and decorated bracket at the top of the mater, carrying a swivelling ring | Lets the whole instrument hang plumb from a thumb, so its own weight keeps the disc vertical while a sighting is taken — a mechanical necessity, not a maker's flourish, though it is also where a maker's finest decorative and calligraphic work usually sits |
| **Shackle / ring** | The ring itself, hinged into the throne | What the observer's thumb actually hooks through |
| **Pin and horse** | A single pin through the stack's common centre, headed at the front, slotted at the back; a small wedge (the **horse**) driven through that slot | Clamps the whole assembly — alidade behind, mater/plates/rete in front — into one rigid, still-rotatable stack around one shared axis |

The back face also usually carries a **shadow square** (an altitude scale ruled in two sets of
twelve divisions, used with the alidade to find the linear height of an object from the length of
its shadow by simple ratio) and often a calendar/zodiac scale and a quadrant of trigonometric or
horary curves. None of this is picture-making. Every line on an astrolabe answers a question a
sighting or a calculation asked of it — the single cleanest available illustration of the era's own
shift the brief names, from a sky one paints to a sky one measures.

## 4. Taking a sighting, and reading an altitude

The procedure, reconstructed from Museo Galileo's and the Whipple Museum's own explanatory pages
(**attested**, consistent across independent sources this session): the observer suspends the
astrolabe by its throne-ring, thumb through the shackle, letting the whole disc hang plumb so the
back face's own zero-line reads true against the horizon. Holding the instrument up, they sight the
target — the sun (indirectly, by its shadow through the vanes, never looked at directly) by day, a
named bright star by night — through the alidade's two pinnule holes, rotating the alidade on its
central pin until the target is lined up through both holes at once, exactly as a modern gun-sight
or a surveyor's dumpy level is aligned. Once the two holes and the target sit on one line, the
alidade is held still and the observer reads, on the **limb**, the single number where the
alidade's edge now crosses the graduated scale: that number, directly, is the object's **altitude**
— its angular height above the horizon, typically given in degrees and (on finer instruments)
minutes.

That single reading is a mechanical fact, not yet knowledge: the altitude, taken alone, only
becomes the sun's declination, the local time, or the qibla direction once it is carried forward to
the *front* face and combined there with the plate's engraved coordinate lines and the rule laid
across the rete. Concretely: to read the time from a solar altitude, the front-face rule and the
rete are rotated together until their point of intersection lands exactly on the altitude
(almucantar) line the back-face reading matched, on the correct side for morning or afternoon; the
rule is then read off against the limb's own hour scale. This two-stage structure — a raw angle
taken at the back, then resolved into a date, a time, or a direction at the front — is itself a
strong, attested shape for a two-phase reveal (§11): the sighting is the *act*, the front-face
resolution is the *knowledge* the act was for.

## 5. The observatories as institutions

Two purpose-built observatories bracket this era's engineering peak, and both scale the astrolabe's
own logic — a fixed graduated arc, a sighting device run along it — up to instruments the size of
buildings, which the brief's language ("angular measurement… engraved divisions… fine circular
measurement structures") is squarely describing.

**Marāgha, founded 1259, under Naṣīr al-Dīn al-Ṭūsī** — the Ilkhanid Mongol ruler Hülegü's
observatory, near modern Maragheh, Iran, with al-Ṭūsī as its director and, per its Wikipedia and
McGill *Biographical Encyclopedia of Astronomers* summaries (**attested**), a library reported at
roughly 400,000 volumes and a team of astronomers drawn from across the Islamic world, including
Chinese astronomers, working together on instrument design. Its chief instrument-maker, Muʾayyad
al-Dīn al-ʿUrḍī (d. 1266), is credited with documenting its equipment himself, per the same
secondary summaries: a **mural quadrant** of roughly 40 m radius, a solstitial armilla, an azimuth
ring, a parallactic ruler (a triquetrum, descended from Ptolemy's own instrument for lunar
parallax), an armillary sphere of roughly 160 cm radius, and a dioptrical ruler after Hipparchus for
measuring the apparent diameters of the sun and moon and timing eclipses — **the specific radii in
this list are themselves only as reliable as the secondary summaries carrying them; see §13, and
treat "roughly" as load-bearing rather than decorative here.** Marāgha's astronomers produced the
*Zīj-i Īlkhānī* and, more consequentially for the history of astronomy generally, al-Ṭūsī's own
geometric technique (the "Ṭūsī couple," a pair of circles generating straight-line motion from
circular motion) later reappears, whether by direct transmission or independent invention is still
debated, in Copernicus's own models — the clearest single link this era has to what comes after it
(**attested**, and the transmission-versus-independent-invention question is itself a live,
attested scholarly debate rather than a gap in this session's research).

**Samarkand, built 1428–1429, catalogue finished 1437–1439, under Ulugh Beg** (grandson of
Tamerlane, ruler and astronomer in his own right) — a three-storey observatory whose principal
instrument was a giant meridian sextant, the **Fakhrī sextant**, trenched into a hillside, two
parallel walls 40 m in radius — double any prior instrument of its type (**attested**, carried
forward from `globe.md` §1, which already establishes these figures). A search summary reached this
session adds further architectural specifics beyond what `globe.md` established — a building
roughly **46 m in diameter and about 30 m tall** above ground, decorated in glazed tile and marble,
construction beginning around **1420** — and describes the trench itself as roughly **two metres
wide**; none of these additional figures were reached via a fetched primary or peer-reviewed source
this session, so mark them **(unverified)**, distinct from the `globe.md`-sourced figures they sit
beside. The design choice of trenching the arc directly into bedrock, rather than building a
freestanding metal instrument, is itself **attested** reasoning in the secondary literature: a
structure keyed into the hillside does not shift the way a freestanding metal instrument does,
removing the small positional errors a movable instrument accumulates. Its output, the *Zīj-i
Sulṭānī*, catalogued **1,018 stars**, independently re-observed rather than copied from Ptolemy or
al-Ṣūfī, with a year-length accurate to within about a minute of the modern value — unmatched in
precision until Tycho Brahe a century and a half later (**attested**, all figures already
established in `globe.md` §1; repeated here only because this section's job is the institution, not
the catalogue).

Both observatories make the same argument in stone that the astrolabe makes in brass: precision is
purchased by a fixed, graduated arc and a device that runs along it, sized to the ambition of the
measurement — a hand-sized disc for a traveller's altitude, a hillside trench for a kingdom's star
catalogue.

## 6. Al-Ṣūfī's catalogue as the thing this era measures into

`globe.md` already establishes al-Ṣūfī's *Ṣuwar al-kawākib al-thābita* (964 CE) as a
systematic *re-observation* of Ptolemy's magnitudes, not a mechanical copy — al-Ṣūfī re-graded star
brightnesses himself against the sky rather than trusting the *Almagest*'s inherited figures
(**attested**, carried from `globe.md` §1). That fact is the hinge this instrument-first file
needs: **the catalogue is the destination the sighting was for.** An astrolabe's rete carries a
fixed, small set of the brightest named stars as pointers, each positioned by a catalogued
coordinate; a sighting taken with an alidade produces exactly the kind of raw altitude that,
accumulated and cross-checked over years, is what a *zīj* (an astronomical handbook of tables) is
built from. Read this way, the three institutions this era actually produced — al-Ṣūfī's
re-observed magnitudes, the astrolabe as a portable measuring instrument, and Ulugh Beg's *Zīj-i
Sulṭānī* as an observatory-scale catalogue built the same way — are one continuous activity at
three different scales (**fictional gameplay translation**: this specific three-scales-in-one-line
framing is this file's own synthesis, offered as the grounding for the brief's own
**VISIBLE OBJECT → MEASURABLE OBJECT** knowledge-gain line, not a claim any cited source states in
these terms). Al-Ṣūfī's magnitude classes are literally what "measured" meant for a star in this
century, and the instrument is the tool that produced them.

## 7. Script on metal versus script on paper, and the geometric-diagram tradition

**Correction to `globe.md`'s numeral recommendation, scoped narrowly.** That file recommends
Eastern Arabic-Indic numerals (٠١٢٣٤٥٦٧٨٩) for the game's HUD, which is correct for *manuscript* and
*book* numbers — the digits al-Ṣūfī's own tables and a zīj's printed pages would have used. But a
real astrolabe's engraved limb is graduated differently: astrolabe scales are conventionally marked
in **abjad numerals** — the twenty-eight letters of the Arabic alphabet, each assigned a fixed
numeric value (a system inherited, ultimately, from the same alphabetic-numeral logic as Greek and
Hebrew) — **attested** as a real and well-documented numeral system in general use for this purpose
across Islamic scientific instruments, though the finer convention of exactly which intervals carry
a full value versus an abbreviation is, per a search summary of scholarly instrument literature,
**(unverified)** as to the exact source but consistent with general knowledge of the practice: the
point standing is that **an engraved scale and a written page numbered the same quantities two
different ways**, and an instrument-grammar era should show that difference rather than flatten it:
HUD text set as manuscript prose stays in Eastern Arabic-Indic digits per the existing research;
anything drawn as an *engraved graduation* — a limb, a shadow square, a ring — should carry abjad
letter-numerals instead, a small, cheap, and genuinely more accurate detail this brief's emphasis
surfaces.

**Script, likewise split by surface, per a search summary of instrument literature — (unverified)
beyond this session's search summary.** The main engraving on an astrolabe — star names on the
rete, the maker's signature, dedications — is conventionally cut in a **decorative naskh**;
inscriptions on the back plate, meanwhile, are sometimes in a small, neat **kufic**, occasionally
re-engraved later in a heavier cursive hand when an instrument was updated or repaired — consistent
with `globe.md`'s own naskh/kufic role split for the manuscript tradition, which gives some
independent confidence in the pattern even though this specific instrument-surface claim was not
independently re-confirmed this session. The practical upshot for the game: naskh remains the era's
running-caption face across both grammars, but kufic on an *instrument* plate should read as cut,
angular and small — cartouche-scale, not book-scale — never as the flowing book hand naskh is used
for elsewhere.

**The geometric-diagram tradition — Ibn al-Haytham's optics figures.** Ibn al-Haytham (Alhazen,
965–c. 1040 CE), a slightly younger contemporary of the century al-Ṣūfī opens, wrote the *Kitāb
al-Manāẓir* ("Book of Optics"), a seven-book treatise whose manuscripts — the Süleymaniye Library's
1083 CE (Ayasofya) copy among the best known — are dense with hand-drawn geometric diagrams
illustrating the geometry of vision, reflection and refraction: rays as straight lines, angles of
incidence, constructed circles standing in for the eye's own geometry (**attested**; the diagrams'
survival and their use in tracing manuscript lineage is itself the subject of published codicology,
per a paper on rebuilding a *stemma codicum* from the diagrams' own variations, reached this
session only as a search summary — **(unverified)** as to that paper's specific claims, though not
as to the treatise's basic existence and diagram-dense character, which is well-established general
knowledge). The construction circle — a compass-drawn circle with radii, tangents and inscribed
angles ruled straight across it, labelled at each vertex with a single letter — is this era's other
authentic "chart," distinct from both the astrolabe's engraved brass and al-Ṣūfī's painted figure: a
diagram meant to be *proved*, not measured from directly, drawn with the same straightedge-and-
compass toolset a rete-layout used but in service of an argument rather than an instrument. For the
game, this is the natural source for the manuscript-ground register §1 demotes but does not remove:
thin black construction lines, lettered vertices, a compass-swing arc left visible — geometry as
diagram, on paper, beside geometry as graduation, on brass.

## 8. Engraved brass as a material

Everything the brief asks the art to look like — "engraved brass," "sighting arcs," "engraved
divisions" — comes down to one craft process, reconstructed here from general instrument-making
literature reached this session (World History Encyclopedia, an astrolabe-making project blog, a
burin-technique summary) and marked **plausible reconstruction** where it generalises from
engraving practice broadly rather than a period-specific source: an astrolabe body was cast or
hammered from **brass** (a copper-zinc alloy, chosen for workability and a warm gold-adjacent colour
that takes fine engraving cleanly), then laid out with the same geometric toolkit as a manuscript's
own construction lines — straightedges, scribing compasses, dividers, a scriber — before a single
line was cut. A line is then cut into the brass with a **burin**, a small steel tool with a sharp
angled tip held at a shallow angle to the surface and pushed (not struck) through the metal,
producing a clean V-section groove; graduations along a limb or a shadow square are **struck**
rather than freehand-drawn — stepped off with dividers from a constructed reference circle so every
degree-mark is geometrically exact rather than eyeballed, the same discipline a modern machinist's
dividing engine automates. A rete's openwork is cut by removing the brass between the star-arms
entirely, leaving a true skeleton rather than an engraved picture on a solid ground — the
"pierced, openwork map" `globe.md` §2 already names.

**Gilding and patina, as a reading, not just a recipe — plausible reconstruction throughout.** The
finest instruments — princely commissions especially — were further decorated by **damascening**:
gold or silver hammered into grooves cut into the brass (or, on steel objects, into the harder base
metal), a technique that takes its Western name from Damascus, where it was long practised, though
the technique itself is older and wider than one city (**attested**, per Metropolitan Museum and
Britannica reference material on the technique generally). Read visually rather than technically: a
plain engraved line on bare brass reads as **warm, matte, mid-value** — the base metal itself, worn
slightly bright at every edge a thumb or an alidade actually touches, dulled everywhere it doesn't;
a **gilded** line or disc reads as a **brighter, cooler-yellow highlight** sitting on top of that
base tone, concentrated at thrones, dedications and star-pointer tips — the parts meant to catch a
viewer's eye first; and **patina** — the brass's own natural oxidation, plus, on damascened objects,
a deliberately induced black surface (period technique: an acid or oxidising wash, sometimes
followed by a tannic-acid treatment) used specifically to darken the base metal *around* an inlay so
the inlay reads brighter by contrast — reads as **dark, uneven, pooling in engraved grooves and low
relief** while the raised, handled surfaces stay comparatively bright. This paragraph's specific
technical sequence (acid wash, then tannic-acid treatment) is a **plausible reconstruction**
generalised from metalworking practice broadly, not a period Islamic instrument-maker's own
account. The game-legible version of all three: brass is not one flat colour but a *gradient of
handling* — brightest where light, touch and gilding concentrate, darkest in the grooves and shadows
an engraving tool actually cut.

## 9. Palette — the instrument-mode set

Extends `globe.md`'s manuscript-mode table (§1, kept as-is for the paper/diagram ground)
with the rows that table left thin, since the brief now asks brass to carry the era's main visual
weight rather than a single vignette row.

| Material | Hex (approx.) | Status | Role |
|---|---|---|---|
| Polished brass, high light | `#C9A24A` | judged | Where an alidade, a limb-edge or a throne actually catches light — the brightest brass reads this session judged from general reference to brass's warm gold-adjacent hue, not from a colour-measured object |
| Working brass, mid-value | `#8A6E3E` | measured (carried from `globe.md` §3, "engraved brass, unpainted") | The instrument's own ground — plates, mater body, the rete's un-pierced arms |
| Brass patina / shadow, in the groove | `#4A3B22` | judged | Pooled darkness inside a cut line or low relief, and general oxidation on an unpolished back face |
| Gilt highlight (thrones, dedications, star-tips) | `#D4AF37` | measured (carried from `globe.md` §3, "gold leaf, burnished") | Reused deliberately, not duplicated by accident: gilding on an instrument and gold leaf on a page are visually the same material doing the same job — marking the part meant to be seen first |
| Silver inlay (damascened lines, rare) | `#C7C4B8` | judged | A cooler, paler accent than gilt — used sparingly, for a maker's costliest pieces only, never as the default line colour |
| Engraved incision line (bare metal, no fill) | `#2A2216` | judged | The cut groove itself, in raking light, before any gilt or inlay — the line the game's "engraved divisions" reveal state actually draws |
| Sized cream manuscript paper (ground for geometric diagrams) | `#EFE1C4` | measured (carried from `globe.md` §3) | Kept as-is for the construction-circle/diagram register described in §7 — geometry on paper is not geometry on brass and should not share one ground |
| Lamp-black ink (construction-line colour, on paper only) | `#241C11` | measured (carried from `globe.md` §3) | The diagram's own line colour when it is drawn on the paper ground, not the brass one |

No new colour-measurement was performed this session on an actual object or photograph; every hex
above is either carried forward from `globe.md`'s own measured/judged rows or newly **judged** from
general knowledge of brass, gilding and patina rather than a specific sampled image, and is labelled
accordingly rather than presented as a colour-checked reading.

## 10. Game translation: the alidade as player avatar

The brief's hardest single ask for this era is mechanical, not visual: "Player form: an alidade /
astronomical sighting pointer / measurement arm. The Observer Core sits at the sighting point," in
a one-tap game where the avatar is small and in continuous motion. §3–4 above supply the concrete
anchor: a real alidade is a bar with **two sighting vanes (pinnules)**, each pierced with a small
hole, and a sighting is only valid when both holes and the target line up on one axis. That gives
three candidate placements for the Observer Core, evaluated against the brief's own rule that the
Core sits "at the active end / focal point" of the tool:

- **The forward pinnule's hole** (**fictional gameplay translation**, chosen here) — the vane
  nearer whatever the alidade is presently sighted toward. A small bright point glimpsed *through* a
  drilled hole in rotating brass is both mechanically accurate (this is genuinely where the sight-
  line passes) and visually exactly what the brief asks the Core to be everywhere else: "a small
  bright star, spark, cross, glowing point." It also reads correctly at a glance in motion — the
  point a moving pointer leads with is legible even when the pointer itself is a thin, fast-rotating
  line, which a mid-bar or pivot-pin placement would not be.
- The **central pivot pin** (§3's "pin and horse") is mechanically important but wrong for this
  purpose: it is where the alidade is *anchored*, not where it *looks*, and the brief's own examples
  (tip of an engraving tool, bristles of a brush, focus of a telescope) are all consistently the
  *active, working* end, never the fixed end.
- The **rearward pinnule** is symmetrical with the forward one mechanically but reads worse in a
  vertically scrolling game, where the avatar's forward-facing end should be the end the player's
  eye and the game's own trajectory-guide naturally track.

Concretely (**fictional gameplay translation**): the player-avatar is a short, thin brass bar (the
alidade proper) with a small pierced vane at its leading end; the Observer Core is the point of
light showing *through* that pierced hole — literally a hole drilled in metal with a spark behind
it, which also gives a natural, attested-material justification for why the Core reads as
bright-against-dark even against a brass, not black, background. The bar's far end can carry the
second, unlit pinnule as a small closed shape for silhouette balance, echoing the real instrument's
two-vane symmetry without competing for the eye. Because the whole avatar is small and constantly
turning through capture and release exactly as a real alidade is constantly re-sighted, the
rotation itself is free characterisation (**fictional gameplay translation**): the player is not
flying a spacecraft shaped like a ruler, they are the sighting act itself, turning to find the next
thing worth measuring.

## 11. The three reveal states

Following the brief's universal template (distant phenomenon → observation/orbit → understood
object) but drawn in this era's own instrument vocabulary rather than another era's, and explicitly
building on §3's real mechanical sequence (a raw sighting, then a resolved reading). This whole
section is **fictional gameplay translation** — a design proposal built on the attested mechanics
above, not itself a documented period practice:

1. **Before orbit — a celestial target.** A body appears as an unadorned point of light with no
   engraved structure around it at all — the thing an alidade has not yet been sighted on. This
   matches the knowledge-horizon principle already governing every era
   ([KNOWLEDGE-HORIZON.md](../KNOWLEDGE-HORIZON.md), left standing, not superseded): before
   measurement, a body is a point, nothing more, exactly as it is to the naked eye before an
   instrument is raised to it.
2. **During orbit — sighting arcs, angle marks, engraved divisions.** As the player's alidade-avatar
   orbits, a **thin engraved arc** grows around the body — the visual equivalent of an alidade being
   swept through the angle needed to bring a target into its sights — struck with fine **tick marks**
   at even intervals exactly as a limb's degrees are struck (§8), in the bare-incision colour
   (`#2A2216`) rather than gilt, since this is the *act* of measuring, not its finished record.
   Following §4's real two-stage structure, the arc's completeness should track orbital progress the
   way the brief's own reveal curve specifies (first mark at capture, recognisable by ~90°, complete
   by 180–240°): early ticks are sparse and unlit; by mid-orbit the arc reads as a genuine partial
   protractor scale; a body left before completion keeps an honestly unfinished scale, not a
   softened placeholder.
3. **After orbit — a precisely measured phenomenon.** The completed arc closes into a full graduated
   ring around the body, its ticks now picked out in the gilt highlight (`#D4AF37`), with a small
   abjad-numeral value (§7's correction) lettered beside it in naskh — the body's now-known altitude
   or magnitude class, stated the way al-Ṣūfī stated a star's re-observed *qadr* (§6). The body
   itself gains the manuscript-ground disc treatment [05-globe.md](../05-globe.md) already specifies
   (a gold disc sized to class, fine dark contour, burnished rim) *inside* that ring, so the finished
   state visually nests the instrument reading around the manuscript-tradition record it feeds —
   measured arc outside, catalogued disc inside, echoing §6's claim that the sighting and the
   catalogue are one activity at two scales.

## 12. Four-row danger table

Same four rows `globe.md` §7 and [DANGERS.md](../DANGERS.md) already establish for this era — §1
above already flags this as the one area the brief and the existing research agree on outright —
reworked here only in *depiction*, from painted/manuscript iconography toward engraved-instrument
iconography, per the brief's own instruction to lean on measurement's visual language rather than
generic decoration. The "Astronomical fact" column is attested per the citations named for each row;
the "Instrument-mode depiction" column is design work built on top of it and is labelled per-row.

| Row | Name | Astronomical fact (attested) | Instrument-mode depiction |
|---|---|---|---|
| **Attractor** | *raʾs al-tinnīn* / al-jawzahar, "the head of the dragon" | The Moon's ascending orbital node, the point where eclipses become possible — a genuine, load-bearing concept in every zīj's eclipse tables, inherited from a Middle Persian *gōzihr* | A dragon whose knotted, tail-in-mouth body is engraved (not cast) as a fine incised line around the throne or shackle, its head marking the pull — grounded in **attested** Seljuk/Ilkhanid dragon iconography of exactly this coiled, knotted form, but the specific placement on an astrolabe's own throne is a **plausible reconstruction**, not a documented period object |
| **Repulsor** | al-Shams' burning | The sun, whose position and heat an alidade's shadow-square (§3) is built to measure without ever sighting it directly | A gilt disc with fine radiating incised lines struck outward from it at even angles, echoing the shadow square's own ruled divisions rather than a painted sunburst — **plausible reconstruction**, matching how the sun is drawn on period manuscript astrolabe diagrams generally |
| **Crosswind** | *al-Rīḥ*, specifically *sammūm* ("fire of the scorching winds") | The specific violent hot desert wind named in period texts, distinct from the general word for wind | A short compass-rose fragment — a few engraved rhumb-line ticks radiating from a point, the same drafting mark a portolan's wind-rose or an astrolabe's own azimuth lines use — **plausible reconstruction**, since no period astrolabe carries a decorative wind-figure the way a portolan chart's margin does |
| **Obscurer** | *al-shayʾ al-saḥābī*, "the little cloud" | Al-Ṣūfī's own words for the Andromeda nebula (M31) and, separately, the Large Magellanic Cloud — the earliest surviving description of a galaxy beyond the Milky Way, and **attested** exactly as `globe.md` §7 already states | A loose scatter of small unengraved, unlit dots — the one hazard depicted by *absence* of the instrument's own engraving discipline rather than by a drawn shape, since no period image of a nebula as a hazard-form exists (flagged already in `globe.md` and [DANGERS.md](../DANGERS.md); the depiction remains invented while the name stays real) |

## 13. Risks and open questions

- **The Oxford sources are the strongest available and the least verifiable this session.** Both
  `hsm.ox.ac.uk` and `mhs.ox.ac.uk` — Oxford's Museum of the History of Science and its own
  dedicated astrolabe catalogue, described independently as the world's largest such collection —
  were blocked by the network egress proxy on every fetch attempt. Everything drawn from them here
  is a search-engine summary, not a page this session read, and the two inventory numbers in §2
  should be independently re-confirmed by a session with access before they are used as documented
  fact in player-facing copy.
- **The dragon-on-a-throne depiction (§12) is invented, and should stay flagged as invented.** The
  astronomical concept and its name are solid; period dragon iconography of the right knotted,
  tail-biting form is genuinely attested in Seljuk/Ilkhanid decorative art broadly; but no source
  found this session shows that specific motif engraved on an astrolabe's own throne or shackle.
  Treat it as a design choice grounded in real period motifs, not a documented artefact.
- **The abjad-versus-Eastern-Arabic-Indic numeral split (§7) needs a build-time decision, not just a
  research note.** If the shipped game's HUD and its engraved-instrument reveal state both need to
  show numerals on screen at once, the two numeral systems will sit side by side in the same frame —
  worth a small spike to confirm they read as *deliberately different registers* rather than as an
  inconsistency, before committing the split into the glyph pipeline.
- **"Sightline through a pinhole" as the Observer Core (§10) is this file's own proposal, not
  something the brief itself specifies beyond "the sighting point."** It fits every constraint the
  brief states, but it is a design choice made here, not a documented one — flagged per this file's
  own house rule for anything past attested fact.
- **The Marāgha instrument list and the extra Samarkand architectural figures (§5) rest on secondary
  summaries, not a primary text read directly this session.** The specific radii (Marāgha's quadrant
  "about 40 m," its armillary sphere "about 160 cm") are widely repeated across independent sources
  reached this session but should be traced to a named primary or peer-reviewed source before being
  presented as more precise than "on the order of." The Samarkand building's diameter, height and
  trench width, and its ~1420 construction start, are marked (unverified) in §5 for the same reason
  and should not be treated as more solid than the `globe.md`-sourced figures they sit beside.
- **Engraving-and-gilding technique (§8) generalises from engraving and metalworking practice
  broadly, not from a period Islamic instrument-maker's own account** — flagged as plausible
  reconstruction throughout that section rather than attested procedure, since no period technical
  manual for astrolabe-making was reached this session.
- **A later finalization pass over this file could not re-check any of the URLs in §14 at all** —
  see the note at the top of that section. The attested/unverified labels throughout this file
  reflect what the original research pass could and could not fetch, not an independent
  re-verification; treat any single source below as needing a fresh check before it is relied on
  for a claim this file marks as more than "judged" or "plausible reconstruction."

## 14. Sources

Note on this list, added during a later finalization pass over this file: that pass ran in a
session whose network egress was blocked entirely — every external domain attempted, including
ordinary reference sites, returned a proxy policy denial rather than a page. None of the URLs below
could be re-fetched or re-confirmed as live in that pass. The list is carried forward from the
original research pass essentially as written, with a small number of additions where a source
supporting a claim already marked **(unverified)** or **(via search summary)** in the prose above
lacked the matching tag here, for internal consistency. One entry (the Kuehn dragon-iconography
citation) is newly flagged below because this file's author cannot confirm the exact title matches
a specific known publication, distinct from the general, well-attested fact that Kuehn has published
on dragon iconography in medieval Islamic and Christian art.

- https://catalogue.museogalileo.it/indepth/AstrolabeComponents.html
- https://catalogue.museogalileo.it/indepth/Astrolabe.html
- https://catalogue.museogalileo.it/indepth/Quadrant.html
- https://www.whipplemuseum.cam.ac.uk/explore-whipple-collections/astronomy/medieval-astrolabe/parts-astrolabe
- https://www.iranicaonline.org/articles/astorlab-or-ostorlab-astrolabe-an-instrument-used-in-astronomy-for-a-variety-of-purposes-e/
- https://en.wikipedia.org/wiki/Alidade
- https://en.wikipedia.org/wiki/Shadow_square
- https://en.wikipedia.org/wiki/Nastulus
- https://islamsci.mcgill.ca/RASI/BEA/Nastulus_BEA.htm
- https://www.sothebys.com/en/auctions/ecatalogue/2006/arts-of-the-islamic-world-l06222/lot.87.html
- https://muslimheritage.com/using-an-astrolabe/
- https://www.mhs.ox.ac.uk/astrolabe/ (via search summary; direct fetch blocked by egress proxy)
- https://www.hsm.ox.ac.uk/discover-the-astrolabe (via search summary; direct fetch blocked by egress proxy)
- https://www.adlerplanetarium.org/history-of-astronomy-collections/ (via search summary)
- https://www.academia.edu/34693228/127_KING_1992_Die_Astrolabiensammlung_des_Germanischen_Nationalmuseums (via search summary)
- https://brunelleschi.imss.fi.it/galileopalazzostrozzi/object/georgpeuerbachattrastrolabe.html (via search summary)
- http://www.sites.hps.cam.ac.uk/starry/regioaslabe.html (via search summary)
- https://islamsci.mcgill.ca/RASI/BEA/Urdi_BEA.htm
- https://en.wikipedia.org/wiki/Maragheh_observatory
- https://web.astronomicalheritage.net/index.php/show-entity?identity=29&idsubentity=1
- https://en.wikipedia.org/wiki/Ulugh_Beg_Observatory
- https://sakisavavi.substack.com/p/the-observatory-that-outlived-the (via search summary)
- https://www.labrujulaverde.com/en/2025/02/the-fabulous-observatory-of-ulugh-beg-tamerlanes-grandson-in-samarkand/
- https://en.wikipedia.org/wiki/Book_of_Optics
- https://isaw.nyu.edu/exhibitions/romance-reason/rrobjects/diagram-eye
- https://www.researchgate.net/publication/263337787_Building_the_stemma_codicum_from_geometric_diagrams_A_treatise_on_optics_by_Ibn_al-Haytham_as_a_test_case (via search summary)
- https://en.wikipedia.org/wiki/Abjad_numerals
- https://majnouna.substack.com/p/letters-as-numbers (via search summary)
- https://majnouna.com/kufi/ (via search summary)
- https://www.bonhams.com/auction/24197/lot/116/a-rare-andalusian-brass-astrolabe-islamic-spain-13th-century-probably-before-1238/
- https://www.metmuseum.org/perspectives/metalworking-damascening
- https://www.britannica.com/art/damascening
- https://www.mhs.ox.ac.uk/almizan/ArtOfMetalwork.html (via search summary; direct fetch blocked)
- https://en.wikipedia.org/wiki/Burin_(engraving)
- https://www.worldhistory.org/Astrolabe/
- https://www.academia.edu/39239308/Kuehn_S_The_Dragon_in_Medieval_Islamic_Astrology_and_Its_Indian_and_Iranian_Influences (unverified — title as given could not be matched with confidence to a specific known publication this session; Sara Kuehn's attested published work on this subject is the book *The Dragon in Medieval East Christian and Islamic Art*, which may or may not be what this academia.edu entry actually contains)
- `globe.md`, [../05-globe.md](../05-globe.md), [../DANGERS.md](../DANGERS.md) (this repository)
