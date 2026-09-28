/* The Journey's document, read and folded on its own: src/journey.js is loaded alone over the few
   globals it reads, so its rules are checked here without booting a page — what a Journey run banks,
   what it never banks, and what the document survives. Called once by the driver in ../verify.mjs. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

export async function runJourneyChecks(){
  const journeySource=await readFile(new URL('../../src/journey.js',import.meta.url),'utf8');
  const TAU_J=Math.PI*2,SWEEP=TAU_J*2/3;
  const load=(seed={},over={})=>{
    const saved=new Map(Object.entries(seed));
    const context={Math,Number,JSON,Array,Set,Object,String,SWEEP_FULL:SWEEP,dailyOn:false,world:null,plate:0,...over,
      clamp:(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),
      cleanCounts:raw=>{const out={};if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const k in raw){const n=Math.floor(Number(raw[k]));if(n>0)out[k]=n;}return out;},
      storage:{get:(k,f)=>over.blocked?f:(saved.get(k)??f),set:(k,v)=>{if(!over.blocked)saved.set(k,String(v));}}};
    context.eraId=()=>context.plate;
    vm.createContext(context);
    vm.runInContext(journeySource+'\nthis.j={get doc(){return journey},get run(){return journeyRun},set mode(m){runMode=m},journeyObserve,journeyCommit,journeyReset,journeyAdvance,journeyMilestones,journeyReady,journeySigned,journeySign,resetJourneyRun,ERA_THRESHOLD,JOURNEY_KEY,get records(){return records},contextBest,keepContextBest,eraOpen,journeyComplete,RECORDS_KEY};',context);
    return {j:context.j,context,saved};
  };
  const held=(sweep)=>({state:'dead',player:{node:sweep===null?null:{},orbitSweep:sweep||0}});
  {
    const {j,saved}=load();
    assert.deepEqual(JSON.parse(JSON.stringify(j.doc)),{era:1,knowledge:0,milestones:{},unlocked:[1],bests:{}},'A fresh store opens the Journey at era I with nothing banked');
    // Free Play is the default, and observes nothing however much is flown.
    j.journeyObserve(1);assert.equal(j.run,0,'Free Play must bank nothing toward the Journey');
    assert.equal(j.journeyCommit(true),null,'Only a Journey run may fold anything into the Journey');
    assert(!saved.has(j.JOURNEY_KEY),'Free Play must never write the Journey document');
  }
  {
    const {j,context,saved}=load({},{plate:1});
    j.mode='journey';context.world=held(null);
    j.journeyObserve(.5);j.journeyObserve(1.4);j.journeyObserve(-1);
    assert.equal(j.run,1.5,'Each encounter banks its observed fraction, clamped to a whole observation and never below none');
    let fold=j.journeyCommit();
    assert.equal(j.doc.knowledge,1.5);assert.equal(JSON.parse(saved.get(j.JOURNEY_KEY)).knowledge,1.5,'A fold is written at once');
    assert.equal(fold.opened,0);assert.equal(fold.of,4,'The Rock has its four chambers for milestones');
    j.journeyCommit();assert.equal(j.doc.knowledge,1.5,'A second fold adds only what was observed since the first');
    // Death ends the attempt, not the knowledge: the body held at the end counts for what it was observed
    // to, once, and a fold that is not an ending (the page hidden mid-orbit) does not count it at all.
    context.world=held(SWEEP*.5);
    j.journeyCommit();assert.equal(j.doc.knowledge,1.5,'A body still held is not banked by a fold that does not end the run');
    j.journeyCommit(true);assert.equal(j.doc.knowledge,2,'The body held at death is banked for what it was observed to');
    context.world=held(null);
    for(let i=0;i<10;i++)j.journeyObserve(1);fold=j.journeyCommit(true);
    assert.equal(j.doc.knowledge,12);assert.equal(fold.opened,0,'Twelve of fifty is still short of the first of four milestones');
    j.journeyObserve(.5);fold=j.journeyCommit(true);
    assert.equal(fold.opened,1,'Knowledge opens a milestone at each ERA_THRESHOLD/k');assert.equal(fold.open,1);assert.equal(fold.ready,false);
    for(let i=0;i<60;i++)j.journeyObserve(1);fold=j.journeyCommit(true);
    assert.equal(j.doc.knowledge,j.ERA_THRESHOLD,'A ready era banks nothing past the threshold: the surplus is the transition\'s');
    assert.equal(fold.open,4);assert.equal(fold.opened,3);assert.equal(fold.ready,false,'Every chapter standing is not enough: the century\'s signature feat is still owed');
    // The signature feat (JOURNEY.md §9): recorded once, only for the frontier's own century flown in the Journey.
    context.plate=6;assert.equal(j.journeySign(6),false,'A feat flown on another century than the frontier\'s is not the frontier\'s');
    context.plate=1;j.mode='free';assert.equal(j.journeySign(1),false,'A feat flown in Free Play never moves the Journey');
    j.mode='journey';assert.equal(j.journeySign(1),true,'The frontier\'s own feat is recorded');
    assert.equal(j.journeySign(1),false,'and recorded once');
    assert.equal(j.journeyReady(),true,'Every chapter standing and the feat flown is transition-ready, and nothing else is asked');
    assert.equal(JSON.parse(saved.get(j.JOURNEY_KEY)).milestones.sig1,true,'The feat is written with the climb');
    // A run on another century than the frontier's, or on the daily plate, banks nothing and keeps nothing over.
    context.plate=6;j.journeyObserve(1);assert.equal(j.journeyCommit(true),null,'A run on an era that is not the frontier is not the frontier\'s to bank');
    assert.equal(j.run,0,'Nor is its knowledge carried over to the next fold');
    context.plate=1;context.dailyOn=true;j.journeyObserve(1);assert.equal(j.journeyCommit(true),null,'The daily plate never moves the Journey');
    context.dailyOn=false;j.resetJourneyRun();
    // The deliberate restart clears the climb and nothing else.
    const doc=j.doc;doc.era=3;doc.unlocked=[1,2,3];doc.bests={2:40};
    j.journeyReset();
    assert.equal(j.doc.era,1);assert.equal(j.doc.knowledge,0);assert.deepEqual(JSON.parse(JSON.stringify(j.doc.unlocked)),[1,2,3],'A restart leaves the eras already reached open');
    assert.equal(j.doc.bests[2],40,'A restart leaves every record where it was');
  }
  {
    // The printed atlas is itself era V, and banks for a frontier that stands there.
    const {j,context}=load({'orbit.journey.v1':JSON.stringify({era:5,knowledge:3,unlocked:[1,2,3,4,5]})},{plate:0});
    j.mode='journey';context.world=held(null);j.journeyObserve(1);
    assert.equal(j.journeyCommit(true).of,4,'The atlas has its four chapters for milestones');assert.equal(j.doc.knowledge,4);
  }
  // Whatever the store holds, the Journey opens: malformed, blocked, or out of range.
  for(const raw of ['{ not a journey','[1,2]','null','{"era":99,"knowledge":-4,"unlocked":"all","bests":[3]}','{"era":4,"knowledge":1e9,"unlocked":[0,2,9,"3"],"milestones":{"x":true,"y":1}}']){
    const {j}=load({'orbit.journey.v1':raw});const d=j.doc;
    assert(d.era>=1&&d.era<=8&&d.knowledge>=0&&d.knowledge<=j.ERA_THRESHOLD,'A malformed Journey document reads as a sane one: '+raw);
    assert(d.unlocked.includes(1)&&d.unlocked.includes(d.era),'The frontier and era I are always open: '+raw);
    assert(d.unlocked.every(e=>Number.isInteger(e)&&e>=1&&e<=8),'Only real eras are ever open: '+raw);
  }
  {const {j}=load({'orbit.journey.v1':'{"era":4,"knowledge":1e9,"unlocked":[0,2,9,"3"],"milestones":{"x":true,"y":1}}'});
    assert.deepEqual(JSON.parse(JSON.stringify(j.doc)),{era:4,knowledge:50,milestones:{x:true},unlocked:[1,2,3,4],bests:{}});}
  {
    // Until the in-run transition exists, a known era is turned over between runs, and only onto a century
    // that is drawn.
    const {j}=load({'orbit.journey.v1':JSON.stringify({era:1,knowledge:50})});
    assert.equal(j.journeyAdvance(()=>true),false,'A known era whose feat is not flown does not move');
    j.doc.milestones.sig1=true;
    assert.equal(j.journeyAdvance(()=>false),false,'The frontier never climbs onto a century with nothing drawn');
    assert.equal(j.doc.era,1);
    assert.equal(j.journeyAdvance(e=>e===2),true,'A known era is turned over to the next');
    assert.equal(j.doc.era,2);assert.equal(j.doc.knowledge,0,'The next era starts its own knowledge from nothing');
    assert(j.doc.unlocked.includes(2),'An era reached stays open');
    assert.equal(j.journeyAdvance(()=>true),false,'An era not yet known does not move');
    assert.equal(j.journeyMilestones().toward,0);
  }
  {
    // JOURNEY.md §1.7: every record is kept by the way its run was played. The old universal best is not
    // carried forward: nothing had been played for real when the records were split.
    const {j,context,saved}=load({'orbit.best.v1':'420'},{plate:0});
    assert.equal(j.contextBest(),0,'The old universal best is not carried into the new records');
    assert.equal(j.keepContextBest(500),true);assert.equal(j.contextBest(),500);
    assert.equal(JSON.parse(saved.get(j.RECORDS_KEY)).free['5'],500,'The atlas keeps its Free Play record under era V');
    assert.equal(j.keepContextBest(300),false,'A lower score is not a record');
    assert.equal(saved.get('orbit.best.v1'),'420','Nothing writes the old key any more');
    j.mode='journey';
    assert.equal(j.contextBest(),0,'A Journey run is measured against the Journey\'s own best, not Free Play\'s');
    assert.equal(j.keepContextBest(90),true);assert.equal(j.doc.bests['5'],90,'A Journey run\'s best is kept on the Journey\'s document, per era');
    assert.equal(j.records.free['5'],500,'A Journey run never rewrites Free Play\'s record');
    j.mode='free';context.plate=1;
    assert.equal(j.contextBest(),0,'Each century keeps its own');
    context.plateWords=()=>({endless:true});context.eraReading=()=>'endless';context.readingDefault=()=>'chronicle';
    j.keepContextBest(40);assert.equal(j.records.free['1:endless'],40,'A century read Endless keeps a record apart from its Chronicle');
    context.eraReading=()=>'chronicle';assert.equal(j.contextBest(),0);
    context.dailyOn=true;assert.equal(j.keepContextBest(9999),false,'The daily keeps its own record elsewhere');context.dailyOn=false;
    const again=load({[j.RECORDS_KEY]:saved.get(j.RECORDS_KEY)});
    assert.equal(again.j.records.free['5'],500,'The record document is read back');
    const junk=load({[j.RECORDS_KEY]:'{ not records'});
    assert.deepEqual(JSON.parse(JSON.stringify(junk.j.records)),{free:{}},'A malformed record document reads as none');
  }
  {
    // Free Play's doors: each century an unlockable reading the Journey's document, behind a gate that is off.
    const {j}=load({'orbit.journey.v1':JSON.stringify({era:3,unlocked:[1,2,3]})},{unlockMet:e=>!!e.test()});
    for(let era=1;era<=8;era++)assert.equal(j.eraOpen(era),true,'Every door stays open while the gate is off: '+era);
    assert.deepEqual([1,2,3,4,5,6,7,8].filter(e=>j.eraOpen(e,true)),[1,2,3,5],'Gated, a century is open once the Journey has reached it, and the atlas always');
  }
  {
    // The ladder climbed: the last century known, and the Journey's runs from then on keep the Final Frontier's
    // record (§1.7), apart from the last rung's own. A restart sends the climb back and keeps that record.
    const {j,context}=load({'orbit.journey.v1':JSON.stringify({era:8,knowledge:49,unlocked:[1,2,3,4,5,6,7,8],bests:{8:300}})},{plate:8});
    assert.equal(j.journeyComplete(),false,'Short of the threshold the last rung is not yet climbed');
    j.mode='journey';assert.equal(j.contextBest(),300,'Until then a Journey run at the last rung is measured against its own best');
    context.world={state:'dead',player:{node:null}};j.journeyObserve(1);j.journeyCommit(true);
    assert.equal(j.journeyComplete(),false,'Its knowledge alone does not climb it: the Probe\'s own feat is owed');
    j.journeySign(8);
    assert.equal(j.journeyComplete(),true,'Knowing the last century and flying its feat climbs the ladder');
    assert.equal(j.journeyAdvance(()=>true),false,'There is no century above the last to turn to');
    assert.equal(j.contextBest(),0,'From then on a Journey run is measured against the Final Frontier');
    assert.equal(j.keepContextBest(900),true);assert.equal(j.doc.bests.frontier,900,'The Final Frontier keeps its own record');
    assert.equal(j.doc.bests['8'],300,'Apart from the last rung\'s');
    j.journeyReset();assert.equal(j.doc.era,1);assert.equal(j.doc.bests.frontier,900,'A restart keeps the Final Frontier\'s record');
    assert.equal(j.journeyComplete(),false,'And the ladder is to be climbed again');
  }
  {const {j,context,saved}=load({},{blocked:true,plate:1});j.mode='journey';context.world=held(null);j.journeyObserve(1);
    assert.equal(j.journeyCommit(true).open,0,'Blocked storage is an ordinary condition: the Journey plays on in memory');assert.equal(saved.size,0);}
}
