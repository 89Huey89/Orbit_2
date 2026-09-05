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
