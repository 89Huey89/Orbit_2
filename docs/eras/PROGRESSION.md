# The run is the progression

How a single run climbs the ladder, what it costs, and how the engraving keeps its place.

## The shape

Every run opens on the Rock. Era boundaries are total-score thresholds. The era is a function of
the score and of nothing else — not of rows, not of the plate the player chose, not of the
difficulty knobs (`DARKNESS_MULT`, `INK_MULT`, `PERFECT_MULT` and `CAP_MULT` do not touch the
score, so the ladder holds across pressures too).

**The page turns at a capture, never mid-flight.** Score can cross a threshold between orbits.
The boundary is *armed* when the score crosses it, and the page turns at the next capture, so the
century never changes while the player has no say in it. The capture is also where the world is
handed the next era's `ECONOMY` row ([ECONOMY.md](ECONOMY.md)), so a rule never changes under a
transfer already in flight.

**Chapters stay what they are.** `chapter = Math.min(3, Math.floor(world.progress/8))` keeps
driving the simulation's escalation and the constellation draw order, because those are what make
one seed deal one chart. The *render-side* chapter machinery — the announcement, the page turn,
the chapter plates, `deepestChapter` — is retargeted to the era. Within era VI the four shipped
chapter plates cycle by row exactly as today; every other era shows its one signature sheet, and
row-driven chapters inside it are felt through the hazards and the figures, not through a new plate.

## The thresholds

Provisional, chosen so that the five eras before the engraving take about forty-five seconds of a
median run — two or three captures each — and the engraving opens early enough to be the run's home:

| Era | I | II | III | IV | V | VI | VII | VIII | IX |
|---|---|---|---|---|---|---|---|---|---|
| Opens at score | 0 | 35 | 75 | 125 | 185 | 260 | 800 | 1500 | 2400 |

The bands are deliberately unequal. A tight first five so nobody is stranded in antiquity; a wide
sixth so the median run lives where the game's art lives; three long bands at the top for the
strong runs the observatory and the probe are for. Score is superlinear in skill, so a struggling
player sees the least of the ladder — the tight opening bands are the answer to that, and the
thresholds must be tuned against the real distribution, not by feel:

- add a score-distribution probe to `verify.mjs`, which already simulates sixty courses through
  row 48, and print the score at each row;
- read the ledger's recorded bests once the spine ships;
- hold the median run's antiquity at forty-five seconds and move the upper thresholds so that a
  personal-best run on Adeptus reaches the observatory and only the top decile reaches the probe.

## The engraving keeps its place: "open on"

The concern that opened this question was that the Renaissance work is not to be given up, which
it would be if every run began on a cave wall and passed the engraving in a fifth of its runtime.
Two things answer it.

**Open on.** The catalogue gains one more choice beside the plate and the figure hand: the era a
run *opens* on, any era the player has already reached. The thresholds are offset by the chosen
era's opening score, so the climb continues from there — a player who opens on the engraving
starts at the engraving and reaches the plate at the same relative point a Rock opening would
have. Antiquity is then something a player passes through until they choose not to, and the
engraving is the ground state for anyone who wants it to be. This costs one ledger field and one
subtraction.

**The daily.** One seed and one era per day, the era rotating through the ladder for everyone, so
the daily is the way to spend a whole run inside one century and it stays comparable because seed
and era are both shared. A beginner's daily may fall in the probe: the daily is its own thing and
does not consult what the player has reached.

## What it costs, honestly

- **The six catalogue plates are era VI's.** Cellarius, Verdigris, Foxed, Proof, Carta azzurra and
  Sepia are treatments of the engraving and apply only inside its band. They keep their unlocks
  and their place in the catalogue and simply do nothing on another century's sheet. Some
  generalise later — Proof before letters is "no captions" on any era, Sepia is a duotone — but
  that is enrichment, not spine.
- **Several eras are live in one run.** Every cache must be keyed by era as well as by chapter and
  plate. This is the one piece of genuinely new engineering in the plan and it is paid once;
  [ARCHITECTURE.md](ARCHITECTURE.md) itemises it and asks for it to be proven with two eras before
  any sheet is drawn.
- **Weak runs see the least variety.** Answered above by the unequal bands and by "open on";
  worth watching in the ledger after the spine ships.
- **The ledger.** `orbit.ledger.v1` gains `deepestEra` and the "open on" choice; migrate forward,
  never mutate in place. One list of bests: the score gate is what keeps them one list.

## The transition between eras

Do not cross-fade two art directions. `pageTurn(mix)` and `drawSheetEdge()` already animate a new
sheet sliding over the old one with its shadow, cut edge and plate-mark. A change of era is a page
turn, and a page turn is a hard cut with a flourish — which is the honest metaphor, since these
really are different sheets from different centuries. The announcement that today names the
chapter names the era: its numeral, its name, and its year.
