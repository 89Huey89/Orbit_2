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
const JOURNEY_KEY='orbit.journey.v1',ERA_THRESHOLD=25,JOURNEY_ERAS=8;
// Each era's milestones are the chapters it is already told in (LINKING.md): the Rock's four chambers,
// the Ceiling's four watches of the night, the Scroll's four palaces, the Astrolabe's six parts, the
// atlas's four chapters, the Lens's three registers. The two eras not yet drawn keep three until theirs
// are named. The milestones are the gate and knowledge only paces them: an era of k milestones opens one
// for every ERA_THRESHOLD/k banked, and stands transition-ready when all of them do.
const ERA_MILESTONES=[0,4,4,4,6,4,3,3,3];
let runMode='free',journeyRun=0;
function emptyJourney(){return {era:1,knowledge:0,milestones:{},unlocked:[1],bests:{}};}
function readJourney(){
  const out=emptyJourney();
  let raw=null;
  try{raw=JSON.parse(storage.get(JOURNEY_KEY,'null'));}catch(_){raw=null;}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return out;
  const era=Math.floor(Number(raw.era));
  out.era=era>=1&&era<=JOURNEY_ERAS?era:1;
  out.knowledge=Math.min(ERA_THRESHOLD,Math.max(0,Number(raw.knowledge)||0));
  // The curated milestone §1.5 allows an era is not written yet; whatever an era records here is kept.
  if(raw.milestones&&typeof raw.milestones==='object'&&!Array.isArray(raw.milestones))for(const key in raw.milestones)if(raw.milestones[key]===true)out.milestones[key]=true;
  const unlocked=new Set([1,out.era]);
  if(Array.isArray(raw.unlocked))for(const e of raw.unlocked){const n=Math.floor(Number(e));if(n>=1&&n<=JOURNEY_ERAS)unlocked.add(n);}
  out.unlocked=[...unlocked].sort((a,b)=>a-b);
  out.bests=cleanCounts(raw.bests);
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
const journeyReady=(doc=journey)=>{const m=journeyMilestones(doc);return m.open>=m.of;};
// A run's knowledge, banked as each body is released and zeroed whenever it is folded in, so a second
// fold after the page has been hidden adds only what has been observed since the first.
function resetJourneyRun(){journeyRun=0;}
function journeyObserve(fraction){
  if(runMode!=='journey')return;
  journeyRun+=clamp(Number(fraction)||0,0,1);
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
  if(ending&&p&&p.node)journeyRun+=clamp(p.orbitSweep/SWEEP_FULL,0,1);
  const before=journeyMilestones().open;
  // A ready era banks nothing further: what a run observes past the threshold is the transition's to spend.
  journey.knowledge=Math.min(ERA_THRESHOLD,journey.knowledge+journeyRun);
  journeyRun=0;saveJourney();
  const after=journeyMilestones().open;
  return {opened:after-before,open:after,of:journeyMilestones().of,ready:journeyReady()};
}
// The frontier moves up one era once every milestone of its own stands. JOURNEY.md §1.3 has this happen
// inside a run, as a transition that never stops it; until that transition is built (stage 5), a ready
// era is turned over between runs instead, as the next Journey run is begun. `playable` says whether the
// era above has anything to be flown on yet, so the frontier never climbs onto a century not drawn.
function journeyAdvance(playable){
  if(!journeyReady()||journey.era>=JOURNEY_ERAS||!playable(journey.era+1))return false;
  journey.era++;journey.knowledge=0;journeyRun=0;
  if(!journey.unlocked.includes(journey.era))journey.unlocked.push(journey.era);
  saveJourney();return true;
}
// The deliberate restart of §1.2: the frontier back to era I and its knowledge cleared, while the eras
// already reached stay open to Free Play and every record stays where it was. The page confirms it first;
// nothing calls this on its own.
function journeyReset(){
  journey.era=1;journey.knowledge=0;journey.milestones={};journeyRun=0;
  saveJourney();
}
