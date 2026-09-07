# Open questions

> **Partly settled elsewhere.** [JOURNEY.md](JOURNEY.md) now locks the progression design and
> answers several questions below — notably item 11, "open on", which is reinstated rather than
> retired. Read it before treating anything here as open.

What was undecided when the ladder was first written down, what the new brief and the decisions
that reconciled it against this project have since settled and how, and what is still open. Read
this before building anything. The brief in full, and the register that reconciled it against the
plan standing before it, are not repeated here; only their outcomes are, with a pointer to whichever
controlling document now carries the answer.

## Settled by this pass

**1. How many eras, and does the ladder ever run out?** *Settled: eight, and it is finite.* The
roster is I The Rock, II The Ceiling, III The Scroll, IV The Astrolabe, V The Engraving, VI The
Lens, VII The Flyby, VIII The Probe, and there is no era IX — the brief's roster holds one
prehistoric era and no Graeco-Roman one, so the Disc and the Marble retire to
[CANDIDATES.md](CANDIDATES.md) (their full case in [candidates/disc.md](candidates/disc.md) and
[candidates/marble.md](candidates/marble.md)) with their research and prototypes intact, and nothing
is invented past the Probe to replace them. [OVERVIEW.md](OVERVIEW.md).

**2. What gates an era?** *Settled: observation, not score.* The old plan advanced a run on total
score, a number with no relationship to what the player had just done in orbit. Each era now carries
its own observation ledger, filled by every capture and weighted so a completed observation counts
roughly three times a bare one; when it crosses its threshold the era is armed. Score still exists,
still drives the catalogue's unlocks, and no longer decides the century. [PROGRESSION.md](PROGRESSION.md).

**3. How does the run actually change century?** *Settled: the transition object is a designation,
never a spawn.* Once an era is armed, nothing is created and `this.random()` is called nowhere new;
the next eligible main node the chart's own seeded generation was always going to place is flagged
and drawn as the transition object, captured exactly like any other body. This is stated as the
single most load-bearing engineering decision in the whole pass because it is what keeps
`verify.mjs`'s two invariants — one seed deals one chart, and how a run is flown cannot change the
chart it is dealt — true by construction rather than by discipline. [PROGRESSION.md](PROGRESSION.md).

**4. Does every body get the phenomenon/observation/understood reveal, or are some eras exempt?**
*Settled: every era, without exception, and the one exemption on the books is withdrawn.* The
earlier knowledge-horizon draft let the Rock off the mechanic — "a dab stays a dab," on the
reasoning that a Palaeolithic mark-maker had nothing to escalate to. That reasoning does not survive
the brief's own central sentence, which carries no clause exempting antiquity: on the Rock the dab
is now struck in stages, one scratch at capture, a scatter of repeated dabs and tallies by
recognisable, one of the era's own attested sign-forms at completion. The clock for all eight eras
is `player.orbitSweep`, already tracked and already reset at capture, never a duration.
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md).

**5. Does the economy still carry a rule per era, or only a name?** *Settled: one traversal rule and
eight skins, and the class-B rules are gone.* "Internally it may be one mechanic," the brief says,
taken literally: traversing the unknown consumes capacity, successful observation restores it, on
every era's sheet, with no exception. The Observatory's allocation tax retires with its era into the
Lens's third register; the Marble's magnitude rule and the Globe's twice-drawn fork both die outright
rather than merely waiting, which closes this file's own old item C — those two were never only
deferred, they are now refused. What survives as a genuine change, not a rename, is the release
dividend scaling with how documented the departing orbit was left. [ECONOMY.md](ECONOMY.md).

**6. Does the player's tool change per era, and if so, what stays the same across all eight?**
*Settled: the Observer Core is a new, fifth rule.* One tiny motif — a bare disc, drawn with the
shared `markHead()` the game already has — sits at the working end of whatever tool an era hands the
player, and never varies in shape, size or behaviour; it is one of exactly two things (the transition
object is the other) that survive a transition uncut. [OBSERVER-CORE.md](OBSERVER-CORE.md);
[OVERVIEW.md](OVERVIEW.md)'s rule 5.

**7. What does the rising darkness mean, now that the game is telling a history rather than
threatening a universe?** *Settled: it destroys the representation, not the universe.* The rate, the
grace and the shoreline are all untouched; what changes is only what the advancing edge *is* —
ochre flaking, plaster blistering, ink bleeding, brass tarnishing, paper burning, a print fogging, a
signal dropping lock, a bitstream flipping — the record failing in the material of its own era, never
the sky itself. This is why a run can never fly back into an earlier row.
[THE-FRONTIER.md](THE-FRONTIER.md).

**8. How does an endless arcade game coexist with a finite historical climb?** *Settled: endless
mode is the chapter axis, continuing after era VIII.* Reaching the Probe's own transition ends the
historical progression permanently — no ninth era, no invented future century — and from there the
run escalates on machinery the game already owns, `world.row`'s existing scaling of darkness speed,
chart growth and hazard density, once the one hard ceiling,
`chapter=Math.min(3,Math.floor(world.progress/8))`, is lifted past the point era VIII used to be the
end of the story. [PROGRESSION.md](PROGRESSION.md).

**9. What became of the old open question I, the flyby gap?** *Settled: closed, by era VII
existing.* The years 1965–1989, in which the seven families became a typology, used to fall in the
seam between an old era VII and an old era VIII wearing a travelling era's name without actually
travelling. The brief demands a genuine travelling era; era VII, the Flyby, is built to be exactly
that, and the gap it used to name has nowhere left to fall into. [OVERVIEW.md](OVERVIEW.md)'s "why
era VII is new"; [07-flyby.md](07-flyby.md).

**10. Is the solar night barque still the player on the Ceiling?** *Settled: no — the brief says so
directly, and it is corrected.* Only `ceilingDrawPlayer()` is replaced; the roughly seventeen hundred
remaining lines of `src/ceiling.js` are untouched. A rush brush, carrying the Observer Core at the
wet tip of its frayed fan, takes the barque's old place as the vessel the player flies. The barque
itself does not leave the era — it returns to what it always should have been, a mythological motif
in the level, Ra's own vessel among Apep, the Eye of Ra, Shu and Nun, never again mistaken for
something with a wheel. [OBSERVER-CORE.md](OBSERVER-CORE.md)'s "the solar night barque, retired";
[02-ceiling.md](02-ceiling.md).

**11. Does a run still open on any era already reached?** *Settled: "open on" is retired from v1.*
Under a score gate this protected the Engraving's own work from being passed through in a fraction of
a run; under an observation-gated ladder it has no honest answer, because opening mid-ladder would
mean designating a transition for an era whose ledger was never filled, in a chart whose earlier
rungs were never flown. The concern is answered instead by pacing the Engraving's own band generously
and by the daily, which already fixes one seed and one era for everyone. Recorded below as a
reversible post-ship option, not reopened here. [PROGRESSION.md](PROGRESSION.md)'s "what it costs."

## Still open, carried forward

**Verification debt across every research file.** No session's network access has cleared this, and
it is larger now than when it was first recorded: four new research files —
[research/china.md](research/china.md), [research/instruments.md](research/instruments.md),
[research/observer-core.md](research/observer-core.md) and [research/space-age.md](research/space-age.md)
— were written under the same partial-access conditions as the originals, and each era file's own
Risk section carries a fresh crop of `(unverified)` claims and secondary-summary citations rather
than primary sources: the Dunhuang star and asterism counts, the alidade's Oxford and Marāgha
figures, the Flyby's palette hex values and its unnamed-mission silhouette, the probe's dependency on
a Flyby file that did not yet exist when it was written. None of it changes the plan's shape; several
entries change a detail an artist would actually draw. Check them as each era is built, not before.

**Painters to budget per era.** [PROTOTYPES.md](PROTOTYPES.md) records which model reached the
shipped standard on each existing prototype and which needed escalation from Sonnet to Opus to get
there; the newly written eras — the Scroll, the Astrolabe's brass register, the Flyby, the Probe's
harvest HUD — have no prototype yet to judge a painter against, and the budget for each has to be set
once one exists, not guessed from the eras that already have one.

**The Rock's triad.** Three brightnesses — the Moon for Tiro, a bright star for Adeptus, a faint star
for Magister — stand in for the ocean, ringed and volcanic worlds later eras use to make the same
three pressures legible before any caption can. Whether that pressure reads off the Moon and two
dabs alone, on the one sheet in the whole ladder with no caption to fall back on, is unspiked and
needs a built sheet to answer. [01-rock.md](01-rock.md)'s own Risk section;
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md).

**The daily's rotation, now across eight eras rather than nine.** [DANGERS.md](DANGERS.md) commits
the daily plate to one seed and one era, the era rotating through the ladder for everyone, which
answers the *fairness* question but not the *rotation* one: strictly in order, weighted toward the
Engraving the way a median run's own pacing already is, or something else entirely. And a second
question rides beside it, sharper now that the roster is one era shorter than when it was first
asked: does a daily dealt in the Probe show a bill and a generation counter to a player who has never
reached it in a real run, or does the daily's own era choice need to respect what the player has
actually climbed. [ARCHITECTURE.md](ARCHITECTURE.md)'s note on `orbit.dailyLog.v1` is the debt this
question is owed against.

## Newly open

**The observation ledger's constants and each era's own threshold.** `0.35`, `0.65` and the 240°
completion checkpoint are stated as provisional wherever they appear, and the per-era thresholds
compared against the ledger are not chosen at all yet. [PROGRESSION.md](PROGRESSION.md) names the
instrument to tune them against — extend `verify.mjs`'s existing sixty-seed, row-48 tangent-seeking
pilot to sum the ledger at every capture and log the curve — and nothing about the ledger's shape
depends on where the numbers land; only the numbers do. That instrument now exists as
`scripts/probe.mjs`, and its first reading is [MEASUREMENTS.md](MEASUREMENTS.md). It says the
numbers are harder to place than "only the numbers do" allows: a run flown by a hand calibrated
against real play banks about 7 ledger in total, so eight eras spread across it come to roughly one
capture and four seconds each, while the same constants bank 72 for a pilot that never mistimes a
release. No single threshold set serves both ends, and that is a question about the ladder's shape
rather than about a constant — it is stated at the foot of that file and is not answered here.

**The exact sweep checkpoints, on a built sheet.** Capture, ~90°, ~180°, ~240° are
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md)'s own provisional table, stated as needing the same
tuning pass as the ledger above, against real art rather than a description of it.

**Whether the completion flourish reads without a gauge.** The one concession to legibility — a
seal pressed, a wash of pigment settling, a lock of focus, at the instant `documented` reaches `1.0`
— is the whole game's answer to "how does a player know the well is dry" with no progress bar
anywhere on the sheet. Whether one honest instant of feedback is actually enough, per body, per era,
is untested. [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md); [PROGRESSION.md](PROGRESSION.md).

**The Scroll's face, its subset size, and its caption's own layout.** Traditional-versus-simplified
Chinese is an easy production mistake to make once and not notice: Noto Serif TC, not the more
obvious Noto Serif SC, is the face this era wants, and its OFL status was not independently
re-confirmed this pass — a real risk against `npm run fonts`' promise to cut exactly the characters
the atlas sets, for a script this pass has not yet run through that pipeline at all. Beside it sits a
layout question [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) itself carries forward rather than
settles: vertical, right-to-left columns are the historically correct direction for this script's
captions, and whether the game renders them that way or compromises to the horizontal HUD line every
other era already uses is undecided. [03-scroll.md](03-scroll.md)'s own Risk section.

**Whether the Engraving's band is generous enough to be worth what its own art cost.** "Open on" is
retired on the promise that era V's pacing would be tuned generously enough to make the whole climb
worth flying rather than skipped through; that promise is not yet a number, and the six catalogue
plates' worth of shipped work sitting inside this one era raises the cost of getting the pacing wrong
higher than it is for any other rung on the ladder. [PROGRESSION.md](PROGRESSION.md)'s "what it
costs, honestly."

**What era VII's black space is made of, as a material.** The brief's own hardest instruction for
this era — "for the first time: BLACK SPACE," paper and plaster and ink stripped away — names an
absence, not a texture, and every other era on the ladder has a named substance for its frontier to
fail in (ochre, plaster, ink, brass, paper, an emulsion, a bitstream). What the Flyby's own black is
made of, such that it can still decay into something rather than simply being an empty backdrop, is
the hardest unanswered art question on the whole ladder and is not answered by
[THE-FRONTIER.md](THE-FRONTIER.md)'s "LOS" entry, which describes the *signal* failing, not the
space around it.

**Whether the release dividend's floor and the ledger's own weight should be one constant or two.**
`RELEASE_FLOOR` echoes the ledger's `0.35` as a starting guess because both answer "how much does an
early release cost," but [ECONOMY.md](ECONOMY.md) itself flags that a shared starting value is not
evidence the two should ever be tied together — one paces which era a run is in, the other throttles
the resource that keeps the run alive at all, and they may want to diverge once tuned against real
data rather than converge by having been guessed from the same number.

**Whether "open on" returns after ship.** Retired from v1 as a design that has no honest answer under
an observation-gated ladder built one era at a time; recorded, not refused outright, as a reversible
post-ship option once every era exists and a run's median pace through them is actually known rather
than assumed. [PROGRESSION.md](PROGRESSION.md).

**The Lens's third register's own beats.** [KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) states that
the rendered-measurement register exists as a third stage between the plate and the Flyby's black
space without its own capture-and-recognisable beats being settled, leaving that work to
[06-lens.md](06-lens.md); that file's own Risk section calls the register-progression rule "unspiked"
and asks for the same `verify.mjs` treatment as the ledger above before it is trusted at speed.

**What, if not rising from the Earth, now marks the Probe's turn as the ladder's true close.** The
old plan reserved one deliberate rhyme-break for era IX's page turn — the first and only sheet not
drawn rising from the Earth — to mark the ladder's final turn as categorically different from every
turn before it. Under the ten-step transition every era's turn now grows outward from the traveller
rather than rising from the ground, so that distinction is gone for all eight turns at once, and
nothing has yet been proposed to replace it: what the Probe's own transition does, or is made of, or
withholds, that no earlier era's transition does, is stated in
[KNOWLEDGE-HORIZON.md](KNOWLEDGE-HORIZON.md) as an open wound rather than resolved there.

**Vulcan's invented treatment, on the Lens.** A phantom body that was never real cannot become a
capturable node without bending the readability contract itself — position and capture-region size
are never staged for any other body on the ladder, and a body with neither has nothing to withhold in
the first place. [06-lens.md](06-lens.md)'s own answer, a struck catalogue entry rather than a
rendered world, is that file's proposal alone and is not settled anywhere else on the ladder; it
needs checking against a built knowledge structure before it is treated as final.

**The Probe's manifest: arming once, or repeating.** Whether a daughter's bill fills and fires the
way an era's own ledger arms once, or repeats indefinitely across an endless run the way the
constellation-completion grace already does, is [08-probe.md](08-probe.md)'s own stated open
mechanical idea — unbuilt, unspiked, and flagged there as needing the same score-distribution probe
every other era's constants are tuned against before its cadence can be trusted.

**The rush brush's heading legibility, with no point and no aerodynamic vane.** Every other tool on
the Observer Core's roster leans into a turn the way a nib or a hull can; the Ceiling's fan-led brush
is the one tool on the whole ladder built with neither a point nor a vane to carry that lean, and
whether its silhouette still reads a clear heading at speed, on top of the aim guide, is unspiked.
[02-ceiling.md](02-ceiling.md)'s own Risk section; [OBSERVER-CORE.md](OBSERVER-CORE.md).
