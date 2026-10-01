'use strict';
/* Orbit · src/journey.js
   The Journey: the one mode whose runs climb the eras, and the document that keeps the climb. */
// ---------- The climb, kept across runs ----------
// See docs/archive/eras/JOURNEY.md and LINKING.md. A Journey run starts at the frontier and banks what it
// observes: every encounter adds the fraction of the completion arc it was actually held for, and nothing
// else, so knowledge is what was looked at and never how cleanly it was landed. The run's knowledge is
// folded into the document at death and whenever the page is hidden, exactly as the ledger is, and
// survives the run that earned it. Only a Journey run folds anything: Free Play and the daily plate never
// move the frontier, or grinding a favourite century would become the way up the ladder.
const JOURNEY_KEY='orbit.journey.v1',ERA_THRESHOLD=50,JOURNEY_ERAS=8;
// Each era's milestones are the chapters it is already told in (LINKING.md): the Rock's four chambers,
// the Ceiling's four watches of the night, the Scroll's four palaces, the Astrolabe's six parts, the
// atlas's four chapters, the Lens's three registers, the Flyby's three legs of the mission — Mars, the
// Grand Tour, the edge of the planets — and the Probe's three: the crossing, the seed, and closure. The milestones are the gate and knowledge only paces them: an era of k milestones opens one
// for every ERA_THRESHOLD/k banked, and stands transition-ready when all of them do.
const ERA_MILESTONES=[0,4,4,4,6,4,3,3,3];
let runMode='free',journeyRun=0;
// What the run in hand has done toward the climb, kept only so the leaf can say where the knowledge came
// from: the orbits watched, how many were held whole and how many were left before half their arc, and what
// was actually banked. It survives the folds a hidden page makes and is cleared only as a run begins.
let journeyTally={orbits:0,whole:0,early:0,banked:0};
function emptyJourney(){return {era:1,knowledge:0,milestones:{},unlocked:[1],bests:{},rounds:0};}
function readJourney(){
  const out=emptyJourney();
  let raw=null;
  try{raw=JSON.parse(storage.get(JOURNEY_KEY,'null'));}catch(_){raw=null;}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  const era=Math.floor(Number(raw.era));
  out.era=era>=1&&era<=JOURNEY_ERAS?era:1;
  out.knowledge=Math.min(ERA_THRESHOLD,Math.max(0,Number(raw.knowledge)||0));
  // The curated milestone §1.5 allows an era, its signature feat, is kept here as `sig<era>`.
  if(raw.milestones&&typeof raw.milestones==='object'&&!Array.isArray(raw.milestones))for(const key in raw.milestones)if(raw.milestones[key]===true)out.milestones[key]=true;
  const unlocked=new Set([1,out.era]);
  if(Array.isArray(raw.unlocked))for(const e of raw.unlocked){const n=Math.floor(Number(e));if(n>=1&&n<=JOURNEY_ERAS)unlocked.add(n);}
  out.unlocked=[...unlocked].sort((a,b)=>a-b);
  out.bests=cleanCounts(raw.bests);
  // The circles closed (§9.1), a field a document written before the circle simply lacks and reads as none.
  out.rounds=Math.max(0,Math.floor(Number(raw.rounds)||0));
  return out;
}
const journey=readJourney();
function saveJourney(){storage.set(JOURNEY_KEY,JSON.stringify(journey));}
// The printed atlas names no era of its own on its plate, because it is itself era V.
const journeyEraOf=()=>eraId()||5;
// `toward` is how far the knowledge banked has carried toward the next milestone still closed, 0..1.
function journeyMilestones(doc=journey){
  const of=ERA_MILESTONES[doc.era]||3,per=ERA_THRESHOLD/of;
  const open=Math.min(of,Math.floor(doc.knowledge/per+1e-9));
  return {of,open,toward:open>=of?1:clamp(doc.knowledge/per-open,0,1)};
}
// The century's own signature feat (SIGNATURES, src/centuries.js) is the milestone knowledge cannot pace:
// an era stands ready only when its chapters stand and its feat has been flown on it in a Journey run.
const journeySigned=(doc=journey)=>doc.milestones['sig'+doc.era]===true;
const journeyReady=(doc=journey)=>{const m=journeyMilestones(doc);return m.open>=m.of&&journeySigned(doc);};
// Records the feat for the frontier's own century, from a Journey run flown on it; true the first time.
function journeySign(era){
  if(runMode!=='journey'||dailyOn||era!==journey.era||journeyEraOf()!==era||journeySigned())return false;
  journey.milestones['sig'+era]=true;saveJourney();return true;
}
// The ladder is climbed once the last century is known. It does not end there (JOURNEY.md §9.1 and §9.2): the
// last century's turn closes the circle back to the cave, and the Final Frontier is a door of its own.
const journeyComplete=(doc=journey)=>doc.era>=JOURNEY_ERAS&&journeyReady(doc);
// The century a known era turns to: the next one up, and from the last, the first.
const journeyNext=era=>era>=JOURNEY_ERAS?1:era+1;
// The Final Frontier and the Marathon are opened by the first closing of the circle.
const journeyCircled=(doc=journey)=>doc.rounds>0;
// A run's knowledge, banked as each body is released and zeroed whenever it is folded in, so a second
// fold after the page has been hidden adds only what has been observed since the first.
function resetJourneyRun(){journeyRun=0;journeyTally={orbits:0,whole:0,early:0,banked:0};}
function journeyObserve(fraction){
  if(runMode!=='journey')return;
  const f=clamp(Number(fraction)||0,0,1);
  journeyRun+=f;journeyTally.orbits++;if(f>=1-1e-9)journeyTally.whole++;else if(f<.5)journeyTally.early++;
}
// Fold the run in and write it. `ending` is true where the run is over: the body still held at the end
// then counts for what it had been observed to, since death ends the attempt and not the knowledge — and
// only then, so a page hidden mid-orbit and a death in that same orbit cannot count it twice. Returns the
// milestones this fold opened, or null where the run was not a Journey run at all.
function journeyCommit(ending=false){
  if(runMode!=='journey'||dailyOn||typeof world==='undefined'||!world)return null;
  // A run flown on another century's plate than the frontier's is not the frontier's to bank.
  if(journeyEraOf()!==journey.era){journeyRun=0;return null;}
  const p=world.player;
  if(ending&&p&&p.node&&p.orbitSweep>0)journeyObserve(p.orbitSweep/SWEEP_FULL);
  const before=journeyMilestones().open,had=journey.knowledge;
  // A ready era banks nothing further: what a run observes past the threshold is the transition's to spend.
  journey.knowledge=Math.min(ERA_THRESHOLD,journey.knowledge+journeyRun);
  journeyTally.banked+=journey.knowledge-had;
  journeyRun=0;saveJourney();
  const after=journeyMilestones().open;
  return {opened:after-before,open:after,of:journeyMilestones().of,ready:journeyReady()};
}
// The frontier moves up one era once every milestone of its own stands. JOURNEY.md §1.3 has this happen
// inside a run, as a transition that never stops it; until that transition is built (stage 5), a ready
// era is turned over between runs instead, as the next Journey run is begun. `playable` says whether the
// era above has anything to be flown on yet, so the frontier never climbs onto a century not drawn.
// The last century's turn is the circle's (§9.1): the probe replicates, the daughter finds the Earth as it was
// when the Hall of the Bulls was painted, and the climb begins a new round on the cave wall. The round clears
// what the climb banked, feats included, exactly as the deliberate restart does, and keeps everything else.
function journeyAdvance(playable){
  if(!journeyReady()||!playable(journeyNext(journey.era)))return false;
  if(journey.era>=JOURNEY_ERAS){journey.rounds++;journey.era=1;journey.knowledge=0;journey.milestones={};journeyRun=0;saveJourney();return true;}
  journey.era++;journey.knowledge=0;journeyRun=0;
  if(!journey.unlocked.includes(journey.era))journey.unlocked.push(journey.era);
  saveJourney();return true;
}
// The deliberate restart of §1.2 (the circles closed and the Final Frontier's record are kept with the rest): the frontier back to era I and its knowledge cleared, while the eras
// already reached stay open to Free Play and every record stays where it was. The page confirms it first;
// nothing calls this on its own.
function journeyReset(){
  journey.era=1;journey.knowledge=0;journey.milestones={};journeyRun=0;
  saveJourney();
}
// ---------- Contextual records ----------
// JOURNEY.md §1.7: there is no single universal high score. Each record belongs to the way a run was
// played. The daily keeps its own, beside its log (plates.js). A Journey run's best is kept per era on the
// Journey's own document, in `bests`, and is never the comparative record, because progression is what a
// Journey run is for. Free Play keeps a best per century and per reading, so a Chronicle flown to its
// ending and the same century flown Endless are never measured against each other. The atlas has only
// its endless reading and is keyed by its era, V, alone.
const RECORDS_KEY='orbit.records.v1';
function readRecords(){
  let raw=null;
  try{raw=JSON.parse(storage.get(RECORDS_KEY,'null'));}catch(_){raw=null;}
  // The one universal best there used to be, `orbit.best.v1`, is not carried forward: nothing had been
  // played for real when the records were split, so there was nothing to keep.
  return {free:raw&&typeof raw==='object'&&!Array.isArray(raw)?cleanCounts(raw.free):{}};
}
const records=readRecords();
// Which record the run in hand is measured against: null on the daily, which keeps its own.
function recordContext(){
  if(dailyOn)return null;
  const era=journeyEraOf();
  if(runMode==='frontier')return {journey:true,key:'frontier'};
  if(runMode==='journey')return {journey:true,key:String(era)};
  // A reading that is not the century's own default is kept apart from it: ':endless' for a century whose
  // default is its Chronicle, ':chronicle' for the atlas, whose default is Endless.
  const reading=typeof eraReading==='function'?eraReading():'',fallback=typeof readingDefault==='function'?readingDefault():reading;
  return {journey:false,key:era+(reading&&reading!==fallback?':'+reading:'')};
}
function contextBest(){
  const c=recordContext();if(!c)return 0;
  return (c.journey?journey.bests:records.free)[c.key]||0;
}
// Returns whether the score was a new record for its context.
function keepContextBest(score){
  const c=recordContext(),n=Math.floor(Number(score)||0);if(!c||n<=0)return false;
  const table=c.journey?journey.bests:records.free;
  if(n<=(table[c.key]||0))return false;
  table[c.key]=n;
  if(c.journey)saveJourney();else storage.set(RECORDS_KEY,JSON.stringify(records));
  return true;
}
// ---------- Free Play's doors ----------
// LINKING.md, "Door access": a century is open in Free Play once the Journey has reached it. Each era is an
// unlockable of the catalogue's own shape, whose condition reads the Journey's document rather than the
// ledger, so the one unlockMet() in src/ledger.js answers both kinds. They are kept out of UNLOCKS, and so off
// the catalogue's pages. No door is ever simply shut (JOURNEY.md §9.1): a century not yet reached still opens,
// as a proof — its first chapter alone, won at that chapter's end — and is flown whole once the Journey gets
// there. The gate is a binding rather than a constant only so the test harnesses can fly every century whole.
const JOURNEY_GATES_DOORS=true;
let journeyGatesDoors=JOURNEY_GATES_DOORS;
const ERA_UNLOCKS=[1,2,3,4,6,7,8].map(era=>({id:'era'+era,kind:'era',era,test:()=>journey.unlocked.includes(era),describe:()=>'Reach this century in the Journey'}));
// The atlas is always open: it is where the Journey and Free Play both begin.
function eraOpen(era,gated=journeyGatesDoors){
  if(!gated||era===5)return true;
  const entry=ERA_UNLOCKS.find(e=>e.era===era);
  return !entry||unlockMet(entry);
}
// Whether the run on the press is a proof: Free Play on a century the Journey has not reached. A Journey or
// Frontier run is let in at a century it has reached by definition, and the daily is the atlas's own.
const eraProof=(era=eraId())=>!!era&&runMode==='free'&&!dailyOn&&!eraOpen(era);
// ---------- The century's own instrument ----------
// Every century flies the traveller as the one comet (travellerComet(), src/effects.js), because the eye has to
// find the point that collides and nothing else, at the size of a fingertip on the reference phone. The tool a
// century actually looked through — the crayon, the barque, the sighting tube, the alidade, the telescope, the
// craft, the probe — is earned as that century is reached in the Journey, exactly as its door would be, and is
// then a choice rather than a replacement: one switch on the frontispiece, kept for every century at once and
// honoured only where it has been earned. Drawn either way, its Observer Core stands on the true point.
const INSTRUMENTS_KEY='orbit.instruments.v1';
let instrumentsOn=storage.get(INSTRUMENTS_KEY,'off')==='on';
function instrumentEarned(era=eraId()){
  const entry=ERA_UNLOCKS.find(e=>e.era===era);
  return !!entry&&unlockMet(entry);
}
const instrumentOn=()=>instrumentsOn&&instrumentEarned();
function setInstruments(on){instrumentsOn=!!on;storage.set(INSTRUMENTS_KEY,instrumentsOn?'on':'off');syncInstruments();}
function syncInstruments(){
  const button=$('instrument');if(!button)return;
  button.hidden=!instrumentEarned();button.setAttribute('aria-pressed',String(instrumentOn()));
}
