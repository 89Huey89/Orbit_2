# Open questions

What was undecided when the ladder was first written down, what has since been settled and how,
and what is still open. Read this before building anything.

## Settled

**1. Where does the progression happen?** *Settled: the run is the progression, gated on score.*
Every run opens on the Rock and climbs; the era is a function of the score; the page turns at the
next capture. The engraving keeps its place through "open on" in the catalogue and through the
daily, which fixes one era per day. [PROGRESSION.md](PROGRESSION.md).

**2. Do the dangers change per era, or only their depiction?** *Settled for the first build:
depiction only, everywhere.* The score gate makes rule changes safe in principle, and two are
taken — but as economy rules, not hazard rules ([ECONOMY.md](ECONOMY.md)). Hazard rules per era
stay off the table until an era has shipped under depiction alone. [DANGERS.md](DANGERS.md).

**3. What earns an era?** *Settled: reaching it.* An era is not an unlockable; it is where a
run's score takes you. What is *earned* is the right to open a run on it, which is recorded the
first time it is reached. The six catalogue plates keep their lifetime-figure unlocks and remain
era VI's treatments.

**4. One ledger, or one per era?** *Settled: one ledger.* Scores stay comparable because the era
is a function of the score. `orbit.ledger.v1` gains `deepestEra`, the "open on" choice, `maxGen`
and the closure medal, migrated forward.

**5. Does the frame change per era?** *Settled: yes, each era brings its own furniture or its own
absence of it.* The Rock has no margin but the torch's reach; the Disc's rim and horizon arcs are
its frame; the Marble cuts its circles as grooves; the Plate has a glass edge and a réseau; the
Observatory an instrument margin; the Probe a plaque's engraved border. Era VIII's hybrid — rendered
bodies inside the engraved frame — stays available as a treatment but is not the era.

**6. Typefaces and reveal animations per era.** *Answered in [LETTERING.md](LETTERING.md):* the
faces are chosen and licensed, the pipeline generalises, and three scripts need one spike each
(Arabic shaping, hieroglyph quadrats, the Hershey stroke path).

**7. The economy.** *Settled: one currency per era, one rule per century, in a table.* The probe
harvests and replicates; the observatory pays an allocation; everything else is a name.

**8. How long is antiquity?** *Settled: about forty-five seconds of a median run,* two or three
captures per era before the engraving, with the thresholds tuned to that against data.

**9. How many chapter plates per era?** *Settled: one signature sheet each* at first; the
engraving keeps its four; enrichment later.

**10. Do the seven families exist in every era?** *Proposed and written up, not yet built: no.*
An era shows of a body only what its century could know; the families are a discovery of era
VI, dated, misread where the century misread them, and true only from era VIII. Rule 3 is
rewritten, every era file's bodies section with it, and the mechanism is one render-side table
with two readings per body, the second developing on the held orbit. What it costs and what it
leaves open is in [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md); the history is sourced in
[research/knowledge-horizon.md](research/knowledge-horizon.md).

## Still open

**A. The thresholds themselves.** The numbers in PROGRESSION.md are provisional. They need the
verify.mjs score probe and the ledger's recorded bests before they are committed.

**B. Which eras are live at once.** The spine keys every cache by era, but how many eras' caches
to keep warm is a memory question: the current era and the next, or all reached? Prototype with
two before deciding.

**C. Two deferred rules.** The Marble's magnitude classes narrowing the perfect window, and the
Globe's twice-drawn fork. Both are attractive, both are class B, both wait until the base ships.

**D. The Rock's unlit reading and the Disc's oar-strokes.** The Rock's obscurer is "the rock the
torch has not reached" and the Disc's crosswind is the barge's oar-strokes; both are the weakest
attested dangers on the ladder and both should be looked at again on the built sheet.

**E. The daily's rotation.** Through all nine eras in order, or weighted toward the engraving?
And does a daily in the probe show a bill and a generation counter to a player who has never
reached it?

**F. The probe's bill.** Four of each is a guess. Tune it so the first daughter departs about as
often as a constellation completes, and be ready to collapse four materials to one.

**G. Verification debt.** Web access was partial during the research: many claims are marked
`(unverified)` in [research/](research/) and collected in each era file's Risk section. None of
them changes the plan's shape; several change a detail an artist would draw. Check them as each
era is built.

**H. Painters.** Which model can paint which era to the shipped standard is recorded per era in
[PROTOTYPES.md](PROTOTYPES.md); the eras that needed escalation there should be budgeted for it
when built.

**I. The flyby gap.** The seven families became a typology between 1965 and 1989, the years
between era VII's close and era VIII's opening. Either era VIII opens at about 1965 and owns the
flyby years as its first chapter, or the Flyby is the tenth era. Decide before era VIII's
signature sheet is committed; [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md).

**J. The order of discovery inside era VI.** Every seven main nodes carry all seven families in
a run-dependent order, so the dated captions of the engraving will fire out of historical order.
A chart is a sheet, not a timeline, and the date is on the caption; but the first cycle after
the page turn could be dealt in the order of discovery for the price of an era-aware
`planetFamily`. Decide on the built sheet.

**K. The Rock's triad.** Three brightnesses — the Moon, a bright star, a faint star — in place of
three families. Whether the pressure still reads before its caption does is a question for the
built sheet, since the Rock has no caption to fall back on.

**L. The horizon's verification debt.** Every date in KNOWLEDGE-HORIZON.md's table is to be read
against [research/knowledge-horizon.md](research/knowledge-horizon.md), and the cells that file
marks corrected or unverified must be keyed from it, not from the design file.
