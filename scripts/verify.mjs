/* Deterministic simulation and runtime checks. No browser or dependencies required. */
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {Worker,isMainThread,parentPort,workerData} from 'node:worker_threads';
import {bundle} from './bundle.mjs';
import {simSandbox,useSimulationApi,setScript} from './verify/sandbox.mjs';
import {taskRoute60,taskChasmRoute60,taskDetourDeep,taskSling60,taskVariedOpening} from './verify/tasks.mjs';
import {runtime} from './verify/runtime.mjs';
import {runJourneyChecks} from './verify/journey.mjs';
import {runSequentialChecks} from './verify/checks.mjs';

// ---------- worker entry: when this file is spawned as a worker, run exactly the one task asked for ----------
if(!isMainThread){
  const {task,simulation,params}=workerData;
  try{
    if(simulation)useSimulationApi(simSandbox(simulation));
    if(workerData.script)setScript(workerData.script);
    let result;
    if(task==='route60')result=taskRoute60();
    else if(task==='chasmRoute60')result=taskChasmRoute60();
    else if(task==='detourDeep')result=taskDetourDeep();
    else if(task==='sling60')result=taskSling60();
    else if(task==='variedOpening')result=taskVariedOpening();
    else if(task==='runtime')result=runtime(params.width,params.height,params.storageBlocked,params.reduceMotion,params.seed,params.checkRename);
    else throw new Error('Unknown worker task: '+task);
    parentPort.postMessage({ok:true,result});
  }catch(err){
    parentPort.postMessage({ok:false,error:{name:err.name,message:err.message,stack:err.stack,actual:err.actual,expected:err.expected,operator:err.operator}});
  }
}else{

// ---------- the driver: bundle once, fire every heavy block into a worker immediately, then run every
// fast sequential check below on the main thread while that work runs alongside it ----------
// `--quick` (npm run test:quick) leaves out the seeded playthroughs — the five sixty-flight loops in verify/tasks.mjs
// and the long pressure and rusher pilots at the end — and boots two of the seven page scenarios
// instead of all of them, which together are nearly all of the suite's wall time. Every fixture and
// every generation sweep still runs. The playthroughs read nothing but the simulation slice of
// src/simulation.js, so they can only change their verdict when that file has. The quick run
// therefore asks git whether it has been touched on this branch (committed since it left origin/main,
// staged, unstaged or untracked) and flies the whole suite anyway when it has, or when git cannot say.
// `--quick=force` skips that question. Editing the playthrough tasks themselves still wants `npm test`.
function simulationTouched(){
  const git=args=>execFileSync('git',args,{cwd:new URL('..',import.meta.url),encoding:'utf8',stdio:['ignore','pipe','ignore']});
  try{
    let base='HEAD';try{base=git(['merge-base','HEAD','origin/main']).trim();}catch{}
    const changed=git(['diff','--name-only',base,'--'])+git(['ls-files','--others','--exclude-standard']);
    return changed.split('\n').includes('src/simulation.js');
  }catch{return true;}
}
const quickArg=process.argv.find(a=>a==='--quick'||a.startsWith('--quick='));
let quick=!!quickArg;
if(quick&&quickArg!=='--quick=force'&&simulationTouched()){
  quick=false;console.error('verify: src/simulation.js has changed on this branch (or git cannot tell), so the quick run flies the full suite instead.');
}
if(quick)console.error('verify: quick run — the seeded playthroughs and five of the seven page scenarios are skipped; npm test runs them.');
const bundled=await bundle();const html=bundled.html;const script=bundled.script;
const simulation=(await readFile(new URL('../src/simulation.js',import.meta.url),'utf8')).split('// BEGIN SIMULATION')[1].split('// END SIMULATION')[0];
useSimulationApi(simSandbox(simulation));

await runJourneyChecks();

const workers=[];
function runInWorker(task,extra={}){
  const worker=new Worker(new URL(import.meta.url),{workerData:{task,...extra}});
  workers.push(worker);
  return new Promise((resolve,reject)=>{
    worker.once('message',m=>{
      if(m.ok){resolve(m.result);return;}
      const info=m.error;
      const err=info.name==='AssertionError'?new assert.AssertionError({message:info.message,actual:info.actual,expected:info.expected,operator:info.operator}):new Error(info.message);
      err.stack=info.stack||err.stack;reject(err);
    });
    worker.once('error',reject);
  });
}
// A runtime scenario needs OrbitWorld too — the daily-plate checks build one directly, beside the
// world the booted page deals itself, to confirm both read the same catalogue for the same seed.
function runtimeLayout(params){return runInWorker('runtime',{script,simulation,params});}

// Every seed-loop and full-page scenario below is an independent, seeded run that never reads or
// writes another's state (proven by the daily-plate determinism checks further down, which are the
// same claim about a single run), so all of them are fired at once here and only awaited where their
// results are actually needed, letting them run on worker threads alongside the sequential checks.
const playthrough=task=>quick?Promise.resolve({}):runInWorker(task,{simulation});
const pRoute=playthrough('route60');
const pChasmRoute=playthrough('chasmRoute60');
const pDetourDeep=playthrough('detourDeep');
const pSling=playthrough('sling60');
const pVaried=playthrough('variedOpening');
// A ledger that has earned the whole catalogue, seeded into storage before the page boots, so the
// unlocked half of every screen is exercised as well as the empty one.
const FULL_LEDGER=JSON.stringify({captures:10500,perfects:4000,bestFlow:9,constellations:{'THE LYRE':40},bestRow:88,
  deepestChapter:4,deepestHardcoreChapter:4,grazes:40,shieldsSpent:20,reflectorsSpent:10,maxSpeedSlings:400,inkwellsFound:14,badAngles:550,runs:{classic:140,relaxed:6,hardcore:20},
  playSeconds:41000,personalBests:{classic:2400,relaxed:900,hardcore:1800},
  observations:{perfectThree:6,skipFive:5,maxSpeed:3,graze:2,pureChart:2,fortyRows:9,threeMinutes:4,rightAngle:12},allFourInOneRun:true});
// A plate from a previous visit, saved under its own seed and viewport rather than this layout's —
// review has to rebuild it as it was flown, not as the frontispiece booting it happens to be sized.
const SAVED_REPLAY=JSON.stringify({seed:1,width:440,height:860,offerDifficulty:true,releases:[],resizes:[],score:250,row:9,reason:'THE NIB RAN DRY',capturedAt:Date.now()});
// A v1 document, seeded only under the legacy key, carrying lifetime counts under the three names
// "Bayer's own dozen" (ART-AUDIT-TODO.md) retired — proof that the v1→v2 migration folds them
// onto the new names rather than losing them.
const RENAMED_LEDGER=JSON.stringify({captures:40,perfects:5,bestFlow:2,constellations:{'THE COMPASS':7,'THE HOURGLASS':3,'THE ASTROLABE':2,'THE LYRE':1},bestRow:12,runs:{classic:60},playSeconds:600,personalBests:{classic:80},observations:{},allFourInOneRun:false});
// A quick run boots only the two marked `quick`: the reference phone with storage blocked and motion
// reduced, and the wide sheet with the whole catalogue earned and a plate saved — between them an
// empty and a full ledger, a narrow and a wide frame, blocked and working storage. The other five
// (the other viewports, the v1 rename, the junk ledger and daily log, the derived plate) wait for `npm test`.
const layout=(params,inQuick=false)=>quick&&!inQuick?null:runtimeLayout(params);
const pLayouts=Promise.all([
  layout({width:390,height:844}),
  layout({width:430,height:932,storageBlocked:true,reduceMotion:true},'quick'),
  // The whole catalogue earned, on a wide plate where the frame prints its credit line and its legend.
  layout({width:1440,height:900,seed:{'orbit.ledger.v1':FULL_LEDGER,'orbit.initials.v1':'ORB','orbit.lastReplay.v1':SAVED_REPLAY,
    'orbit.cosmetics.v1':JSON.stringify({plate:'night',mark:'telescope',trail:'sanguine',capture:'rose',frame:'acanthus',figures:'bayer'})}},'quick'),
  layout({width:844,height:390}),
  layout({width:400,height:800,seed:{'orbit.ledger.v1':RENAMED_LEDGER},checkRename:true}),
  // A ledger that is not JSON at all is the same as no ledger: the page boots on an empty one. The
  // ephemeris log is seeded here too, with junk among the days, beside a daily record from before the
  // log existed for the boot to fold in.
  layout({width:320,height:568,seed:{'orbit.ledger.v1':'{ this is not a ledger',
    'orbit.dailyLog.v1':JSON.stringify({'2018-05-04':{best:'420',plays:3},nonsense:{best:9},'3000-01-01':{best:5},'2018-05-05':7}),
    'orbit.daily.v1':JSON.stringify({date:'2019-11-30',best:88})}}),
  // The same, under reduced motion, with a derived plate, an ink, a mark, an ornament and a hand chosen.
  layout({width:412,height:915,reduceMotion:true,seed:{'orbit.ledger.v1':FULL_LEDGER,'orbit.plate.v1':'cellarius','orbit.initials.v1':'ORB',
    'orbit.cosmetics.v1':JSON.stringify({plate:'cellarius',mark:'saturn',trail:'goldleaf',capture:'seal',frame:'seamonsters',figures:'bode'})}}),
]);

try{
  await runSequentialChecks({script,html,quick,pRoute,pChasmRoute,pDetourDeep,pSling,pVaried,pLayouts});
}finally{
  for(const w of workers)w.terminate();
}

}
