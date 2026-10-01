/* Orbit · scripts/probe.mjs
   A tuning instrument, not a test. `verify.mjs` proves the simulation is correct; this asks a
   different question the test suite deliberately never asks — how deep does a *run* actually get —
   and answers it by flying many seeded courses at several levels of hand. It is not run by
   `npm test`, it makes no assertions, and it never fails a build: it prints numbers to read.

   The suite's own tangent-seeking pilot releases on the frame the oracle first reports a clean
   transfer, which is a hand no player has: it does not die, and a course flown to row 437 says
   nothing about the length of a run someone actually plays. The one thing that separates a hand
   from that oracle in this game is *when the release is let go*, because the perfect band is a
   window in time and every failure downstream — a hard turn instead of a tangent, a miss, a flight
   into the dark — begins with a release let go too late. So the pilot here is the same pilot with
   one faculty removed: it commits to a release the instant the oracle likes the shot, and the
   release itself lands a set number of milliseconds later, by which time the orbit has carried it
   off the heading it aimed at. Lateness is the whole model, and it is the honest half of a hand's
   error: a player who anticipates well is also sometimes early, which this cannot represent, so a
   given lateness reads as the pessimistic end of the hand it stands for.

   What it reports is what `JOURNEY.md` reads its era thresholds off rather than guessing them: how
   far a run gets, how many bodies it captures on the way, how much of each orbit it actually holds,
   and what the Journey's knowledge would therefore stand at by each row. */
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const simulation=(await readFile(new URL('../src/simulation.js',import.meta.url),'utf8')).split('// BEGIN SIMULATION')[1].split('// END SIMULATION')[0];
const sandbox={};vm.createContext(sandbox);
vm.runInContext(simulation+'\nthis.api={OrbitWorld};',sandbox);
const {OrbitWorld}=sandbox.api;

const STEP=1/120,TAU=Math.PI*2;
// The swept arc at which an observation is complete, per KNOWLEDGE-HORIZON.md's own checkpoint. It is
// a parameter of the probe rather than a constant of it, so the curve can be re-read if it moves.
const SWEEP_FULL=TAU*2/3;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const documented=sweep=>clamp(sweep/SWEEP_FULL,0,1);

// The hands the probe flies. The oracle is the suite's own pilot, kept as the top of the scale so a
// degraded run always has the undegraded one to be read against; every other row is that pilot with
// its release let go the named number of milliseconds late.
// The scale is finer than a reaction time because the window it is measured against is finer than
// one: a release let go a single 8 ms frame past the moment the oracle chose already loses most of
// what the oracle was flying for, so a ladder in twenty-five millisecond steps would have measured
// nothing but its own bottom rung.
const HANDS=[
  {name:'oracle',late:0},
  {name:'4 ms',late:.004},
  {name:'8 ms',late:.008},
  {name:'16 ms',late:.016},
  {name:'25 ms',late:.025},
  {name:'40 ms',late:.04},
  {name:'60 ms',late:.06},
  {name:'100 ms',late:.1}
];

const args=process.argv.slice(2);
const flag=(name,fallback)=>{const hit=args.find(a=>a.startsWith('--'+name+'='));return hit?Number(hit.slice(name.length+3)):fallback;};
// Which hand the probe flies. `late` is the first reading's model above, kept so that reading can still
// be reproduced. `spread`, the default, is a hand that sees a window coming, aims at its middle and lets
// go early as often as late — a spread of release errors about the moment it meant, rather than a delay
// after a moment an oracle chose. Only that model can say what a grace either side of a tap is worth,
// because the lateness model is never early and so never finds the half of the grace that lies before it.
const MODEL=args.includes('--model=late')?'late':'spread';
const SPREAD_HANDS=[
  {name:'σ 0 ms',sigma:0},
  {name:'σ 10 ms',sigma:.010},
  {name:'σ 20 ms',sigma:.020},
  {name:'σ 30 ms',sigma:.030},
  {name:'σ 45 ms',sigma:.045},
  {name:'σ 70 ms',sigma:.070}
];
// The release grace the world is flown under. Left unset, the probe flies the game as it ships; set to 0
// it reads the chart as it was before the grace existed, which is the baseline the grace is judged by.
const GRACE=args.some(a=>a.startsWith('--grace='))?flag('grace',0):null;
// Which pressure the world is flown under. The live game sets the pressure's multipliers on a world just
// after dealing it, and so does the probe, read off plates.js's own tables rather than copied here, so
// the two cannot drift apart. Left unset it flies the simulation's own defaults, which are Adeptus's.
const PRESSURE=(args.find(a=>a.startsWith('--pressure='))||'').slice(11)||null;
const plates=await readFile(new URL('../src/plates.js',import.meta.url),'utf8');
const pressureTable=name=>{const m=plates.match(new RegExp('const '+name+'=(\\{[^}]*\\});'));return m?vm.runInNewContext('('+m[1]+')'):null;};
const MULTS=PRESSURE?{darknessMult:pressureTable('DARKNESS_MULT'),inkMult:pressureTable('INK_MULT'),perfectMult:pressureTable('PERFECT_MULT'),capMult:pressureTable('CAP_MULT'),releaseGrace:pressureTable('RELEASE_GRACE_BY')}:null;
if(PRESSURE&&!(PRESSURE in MULTS.darknessMult))throw new Error('Unknown pressure '+PRESSURE);
// Whether the endless driver is felt. The live game turns it on for every run with no row it is won at,
// which is every run the probe flies, so it is on unless `--flat` asks for the chart as it was before it.
const DRIVEN=!args.includes('--flat');
// `era` carries what a century changes in the simulation itself, which is only the Rock's: its chasms
// and its relighting flares (PLATE_STYLES.rock.can in src/plates.js). Every other century flies the
// atlas's own chart under its own art.
// `--rock` flies the main report on the Rock's chart instead of the atlas's; `--chasms` cuts the cracks the
// wall ships without back into it.
const ROCK_CHART=args.includes('--rock'),ROCK={chasms:args.includes('--chasms'),relight:true};
function dealWorld(seed,era=ROCK_CHART?ROCK:{},emit=()=>{}){
  const w=new OrbitWorld(seed,seed%3===0?1280:440,860,emit,false,false,false,!!era.chasms,!!era.relight);w.driven=DRIVEN;
  // The Lens is the one century whose chart crosses rows of its own, the registers (plateWords().transitionRows),
  // and each crossing buys a breath of grace from the dark, so it is flown on a chart of its own as well.
  if(era.transitionRows)w.transitionRows=era.transitionRows.slice();
  if(MULTS)for(const key in MULTS)if(MULTS[key])w[key]=MULTS[key][PRESSURE];
  if(GRACE!==null)w.releaseGrace=GRACE;
  return w;
}
// Seeds are flown from 1 upward so a curve can be compared against a previous run of the probe, and
// against `verify.mjs`'s own sixty courses, which start in the same place.
const SEEDS=flag('seeds',120);
// How long the pilot will hold a body before it settles for whatever transfer is on offer, in turns.
// This is the single knob that decides the ledger's yield per capture, so it is exposed rather than
// buried: the suite's pilot waits 1.5 turns, which is already past the completion checkpoint.
const PATIENCE=flag('patience',1.5)*TAU;
// A run is cut off rather than flown forever, because the oracle does not die. Both ceilings are far
// past anything a hand reaches, so they bind on the oracle's row only.
// The Marathon (below) is one life flown through every century, so it is given far more room by default.
const MARATHON=args.includes('--marathon');
const ROW_CAP=flag('rows',MARATHON?2000:200),TIME_CAP=flag('seconds',MARATHON?3600:420);
// What one encounter contributes to the Journey's knowledge, as `JOURNEY.md` settles it: the observed
// fraction of the completion arc and nothing else. There is no floor, because an encounter barely
// looked at has barely been observed, and no landing term, because how cleanly a body was entered is
// a question about flying rather than about knowing — it stays where it already is, in the score.
// Both are flags rather than constants so the older `floor + span × documented` shape the planning
// documents were first written against can still be read off the same instrument for comparison.
const LEDGER_FLOOR=flag('floor',0),LEDGER_SPAN=flag('span',1);
const ledgerOf=sweep=>LEDGER_FLOOR+LEDGER_SPAN*documented(sweep);
const JSON_OUT=args.includes('--json');

// The lateness jitter is drawn from a seeded generator rather than Math.random, so the probe reads
// the same twice: a tuning instrument whose numbers move between runs cannot be tuned against.
function rng(seed){let s=seed>>>0||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296;};}

// One run, flown by one hand. The pilot is the suite's own, with three changes. It will take a body
// up to three rows ahead rather than only the next one, since a hand that misses a window has to
// recover onto whatever is left rather than giving up on the chart — but not one further out than
// that, because a chart is not flown by lunging at the horizon. It refuses a transfer the guide
// already marks dry, which is the one warning the game prints on the sheet and no player ignores
// twice. And the release it decides on is scheduled rather than taken, so the orbit carries it past
// the heading it chose before the hand catches up with it, which is the whole of the model.
// What the spread hand can see coming: the guide read at each point of the orbit ahead of it, over a
// short horizon, exactly as the drawn release ticks and perfect arcs show it to a player. A hand that
// knows it errs both ways aims where an error costs least: at the perfect window to a body it would take
// that sits deepest inside the stretch of orbit from which the release lands somewhere at all, so a miss
// either side of it is still a landing. Failing any perfect window, and only once the pilot has run out
// of patience, it aims at the middle of the widest stretch that lands on a body it would take. A stretch
// still open at the horizon is not aimed at yet, since its far edge is not yet seen. Returns the offset
// aimed at, or null.
const LOOK=1/240,HORIZON=.6;
function forecast(w,eligible,settle,sigma=0,perfectOnly=false){
  // The world's clock is carried forward with the orbit, so a drifting body is read where it will be
  // when the release is let go rather than where it stands now.
  const p=w.player,n=p.node,angle=p.angle,rate=p.dir*p.speed/p.rad,samples=[],now=w.time,nx=n.x,nvx=n.vx;
  for(let o=0;o<=HORIZON+1e-9;o+=LOOK){
    p.angle=angle+rate*o;w.time=now+o;
    if(n.amp){const phase=w.time*.72+n.phase;n.x=n.baseX+Math.sin(phase)*n.amp;n.vx=Math.cos(phase)*n.amp*.72;}
    w.positionPlayer();
    const a=w.aim();samples.push({o,safe:!!a&&!a.dry,ok:!!a&&eligible(a),perfect:!!a&&a.perfect&&eligible(a)});
  }
  p.angle=angle;w.time=now;n.x=nx;n.vx=nvx;w.positionPlayer();
  let best=null,bestMargin=-1,wide=null,wideLength=-1;
  for(let i=0;i<samples.length;){
    if(!samples[i].safe){i++;continue;}
    let j=i;while(j+1<samples.length&&samples[j+1].safe)j++;
    if(j<samples.length-1){
      const start=samples[i].o,end=samples[j].o;
      for(let k=i;k<=j;){
        if(!samples[k].perfect){k++;continue;}
        let m=k;while(m+1<=j&&samples[m+1].perfect)m++;
        // Measured to the edge of the whole stretch of landings, not of the band: a perfect band is where
        // the flight skims the rim, so one side of it is usually the edge of a miss.
        const mid=(samples[k].o+samples[m].o)/2,margin=Math.min(mid-start,end-mid);
        if(margin>bestMargin){bestMargin=margin;best=mid;}
        k=m+1;
      }
      for(let k=i;k<=j;){
        if(!samples[k].ok){k++;continue;}
        let m=k;while(m+1<=j&&samples[m+1].ok)m++;
        if(samples[m].o-samples[k].o>wideLength){wideLength=samples[m].o-samples[k].o;wide=(samples[k].o+samples[m].o)/2;}
        k=m+1;
      }
    }
    i=j+1;
  }
  // A hand that knows its own spread only goes for a perfect band with at least that much room beside it
  // before a miss; otherwise it takes the middle of the widest landing on offer at once, as a player does
  // who would rather land than skim.
  if(best!==null&&bestMargin>=sigma)return best;
  return wide!==null&&!perfectOnly&&(settle||sigma>0)?wide:null;
}
// A star of a figure still worth going for: its chart neither traced, run past, nor already spoiled by a
// rough landing after its entry (simulation.js), and this star not yet visited.
function figureOpen(w,n){
  if(n.routeRole!=='star')return false;
  const chart=w.constellations.find(c=>c.id===n.routeId);
  return !!chart&&!chart.completed&&!chart.expired&&chart.pure&&!(chart.mask&1<<n.starIndex);
}
function gauss(r){const u=Math.max(1e-12,r()),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function flySpread(seed,hand,era,watch){
  const w=dealWorld(seed,era,watch&&watch.emit);if(watch)watch.bind(w);w.start();
  const jitter=rng(seed*7919+Math.round(hand.sigma*1000)+17);
  const sweeps=[],byRow=new Map();
  let ledger=0,pending=-1,frame=0;
  for(let i=0;i<120*TIME_CAP&&w.state==='playing'&&w.progress<ROW_CAP;i++,frame++){
    const p=w.player;
    if(p.node){
      if(pending<0&&frame%4===0&&p.orbitTime>.12&&(p.node.type!=='sling'||w.charge()===1)){
        const row=Math.floor(w.progress)+1,near=a=>!a.steep&&!a.dry&&a.n.row>=row&&a.n.row<=row+2;
        // A hand after Linea Pura goes for a figure's stars while the figure is still clean, and
        // only on a perfect transfer with room beside it, since one rough landing spoils the figure and a
        // miss ends the run. With such a body in reach it would rather circle for the next window than land
        // roughly, until its patience runs out; otherwise it flies the main line as ever.
        const chasing=era&&(era.figures||era.chase&&era.chase())&&w.nodes.some(n=>n.row>=row&&n.row<=row+2&&figureOpen(w,n));
        let aimAt=chasing?forecast(w,a=>near(a)&&figureOpen(w,a.n),false,hand.sigma,true):null;
        if(aimAt===null&&(!chasing||p.orbitSweep>PATIENCE))aimAt=forecast(w,a=>near(a)&&a.n.type!=='gold',p.orbitSweep>PATIENCE,hand.sigma);
        if(aimAt!==null)pending=w.time+Math.max(0,aimAt+gauss(jitter)*hand.sigma);
      }
      if(pending>=0&&w.time>=pending){
        sweeps.push(p.orbitSweep);ledger+=ledgerOf(p.orbitSweep);
        byRow.set(Math.floor(w.progress),ledger);
        pending=-1;w.release();
      }
    } else pending=-1;
    w.update(STEP);
    if(watch&&frame%2===1)watch.frame();
    if(era&&era.tick)era.tick(w,ledger);
  }
  // The body still held when the run ends is banked for what it had been observed to, as the Journey
  // banks it at death (journeyCommit in src/journey.js).
  const held=w.player.node?ledgerOf(w.player.orbitSweep):0;
  return {seed,row:w.progress,captures:w.captures,perfects:w.perfects,elapsed:w.elapsed,score:w.score,reason:w.state==='dead'?w.reason:'(survived the cap)',sweeps,ledger,byRow,held,feats:watch?watch.flown():null};
}
function fly(seed,hand,era,watch){
  if(MODEL==='spread')return flySpread(seed,hand,era,watch);
  const w=dealWorld(seed,era,watch&&watch.emit);if(watch)watch.bind(w);w.start();
  const jitter=rng(seed*7919+Math.round(hand.late*1000));
  const sweeps=[],byRow=new Map();
  let ledger=0,pending=-1;
  for(let i=0;i<120*TIME_CAP&&w.state==='playing'&&w.progress<ROW_CAP;i++){
    if(w.player.node){
      if(pending<0){
        const aim=w.aim();
        const row=Math.floor(w.progress)+1;
        if(aim&&!aim.steep&&!aim.dry&&aim.n.type!=='gold'&&aim.n.row>=row&&aim.n.row<=row+2&&(aim.perfect||w.player.orbitSweep>PATIENCE)&&w.player.orbitTime>.12&&(w.player.node.type!=='sling'||w.charge()===1))
          // Half the named lateness is the hand's own bias and half is drawn per decision, so a hand
          // is a distribution of releases rather than one delay applied identically every time.
          pending=w.time+hand.late*(.5+jitter());
      }
      // Deliberately not an `else`: a hand with no lateness at all has to be able to decide and let
      // go inside the same frame, because that is what the oracle it stands for does. Costing it one
      // frame instead would make the whole scale read against a hand that is already 8 ms late —
      // which, on a release window this narrow, is not a rounding error but most of the effect.
      if(pending>=0&&w.time>=pending){
        sweeps.push(w.player.orbitSweep);ledger+=ledgerOf(w.player.orbitSweep);
        byRow.set(Math.floor(w.progress),ledger);
        pending=-1;w.release();
      }
    } else pending=-1;
    w.update(STEP);
    if(watch&&i%2===1)watch.frame();
  }
  const held=w.player.node?ledgerOf(w.player.orbitSweep):0;
  return {seed,row:w.progress,captures:w.captures,perfects:w.perfects,elapsed:w.elapsed,score:w.score,reason:w.state==='dead'?w.reason:'(survived the cap)',sweeps,ledger,byRow,held,feats:watch?watch.flown():null};
}

const sorted=a=>[...a].sort((x,y)=>x-y);
const pct=(a,q)=>{const s=sorted(a);return s.length?s[Math.min(s.length-1,Math.floor(q*s.length))]:0;};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const pad=(s,n)=>String(s).padEnd(n),padL=(s,n)=>String(s).padStart(n);

// ---------- The signature feats, read off the game's own detectors ----------
// A century is left only once its chapters stand and its own feat has been flown on it (SIGNATURES in
// src/centuries.js), so a ladder climbed on knowledge alone reads every century short by however many runs
// its feat takes. The feats are not re-told here: the detectors themselves, and the few rules of each
// century they ask (which body is a doubled ring on the wall, which carries a wanderer, which school a row
// belongs to, what the probe's harvest has paid for), are cut out of the game's own files by name and run
// as the page runs them, so the probe cannot drift from what the game asks. What is stubbed is only what
// has nothing to do with the question: the frontier (each century's copy records its own feat, once), and
// the probe's paint-side bookkeeping, sound and screen coordinates.
const FEAT_SOURCES={
  'effects.js':['tileHash'],
  'backdrop.js':['planetFamilies'],
  'planets.js':['planetFamily','DIFFICULTY_FAMILY','PICKUP_FAMILIES','planetFamilyFor'],
  'rock.js':['ROCK_TRIAD','ROCK_TIER_BRIGHT','rockTier'],
  'ceiling.js':['ceilingHash','ceilingWatchWanderer','ceilingWanderer'],
  'scroll.js':['scrollSchool'],
  'astrolabe.js':['ASTRO_CHAPTER_ROWS','ASTRO_PLANETS','astroPlainRow','astroWanderer'],
  'lens.js':['LENS_CHAPTER_ROWS','LENS_REG_ROWS'],
  'probe.js':['PRB_MATS','PRB_MAT_OF','PRB_SIDE_OF','PRB_YIELD','PRB_PART_OF','PRB_BILL','prbBill','PRB_REFINE','prbShort','prbPay','PRB_CHOICE','prbFamily','prbFresh','prbHarvest'],
  'centuries.js':['sigRun','SIGNATURES','signatureEvent']
};
// One top-level declaration of a classic script, by name: a function to its closing brace, a const or let
// to the semicolon that ends its statement, stepping over strings, templates and line comments.
function cut(text,name,file){
  const at=text.search(new RegExp('^(?:function '+name+'\\(|(?:const|let) '+name+'\\b)','m'));
  if(at<0)throw new Error('probe: '+name+' is no longer declared in src/'+file);
  const fn=text.startsWith('function',at);let depth=0,opened=false;
  for(let i=at;i<text.length;i++){
    const c=text[i];
    if(c==='/'&&text[i+1]==='/'){i=text.indexOf('\n',i);if(i<0)break;continue;}
    if(c==='\''||c==='"'||c==='`'){for(i++;i<text.length&&text[i]!==c;i++)if(text[i]==='\\')i++;continue;}
    if(c==='{'||c==='('||c==='['){depth++;if(c==='{')opened=true;continue;}
    if(c==='}'||c===')'||c===']'){depth--;if(fn&&opened&&depth===0)return text.slice(at,i+1);continue;}
    if(!fn&&c===';'&&depth===0)return text.slice(at,i+1);
  }
  throw new Error('probe: could not find the end of '+name+' in src/'+file);
}
const FEAT_SCRIPT=await (async()=>{
  const parts=['const TAU=Math.PI*2,SWEEP_FULL=TAU*2/3,clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));',
    // The page's own frame of reference, reduced to what the detectors read: the world in hand, and the
    // frontier, which is this copy's century and records its feat the first time it is flown.
    'let world=null,signed=false;const journeyEraOf=()=>ERA,journeySign=era=>era===ERA&&!signed&&(signed=true);',
    // The probe's harvest as the page runs it each frame, less what it draws and plays.
    'let prbState=null,prbRunWorld=null;const prbRun=()=>{if(prbRunWorld!==world){prbRunWorld=world;prbState=prbFresh();}},prbNoteGen=()=>{},prbLaunchSound=()=>{},sx=x=>x,sy=y=>y;'];
  for(const [file,names] of Object.entries(FEAT_SOURCES)){
    const text=await readFile(new URL('../src/'+file,import.meta.url),'utf8');
    for(const name of names)parts.push(cut(text,name,file));
  }
  parts.push('this.api={bind(w){world=w;signed=false;prbState=null;prbRunWorld=null;},event(type,e){signatureEvent(type,e);},harvest(){if(ERA===8)prbHarvest();},get signed(){return signed;},LENS_REG_ROWS};');
  return parts.join('\n');
})();
// One copy of the detectors per century, each with its own run state, all listening to the same flight: a
// run on the atlas's chart is read for every century flown on that chart at once.
const FEAT_COPIES=[...Array(9)].map((_,era)=>{if(!era)return null;const c={ERA:era};vm.createContext(c);vm.runInContext(FEAT_SCRIPT,c);return c.api;});
// The atlas's own chart, flown by a hand that goes after its feat: see figureOpen().
const FIGURES={figures:true};
const LENS={transitionRows:[FEAT_COPIES[6].LENS_REG_ROWS,FEAT_COPIES[6].LENS_REG_ROWS*2]};
function featWatch(eras){
  const copies=eras.map(e=>FEAT_COPIES[e]);
  return {
    bind:w=>{for(const c of copies)c.bind(w);},
    emit:(type,e)=>{for(const c of copies)c.event(type,e);},
    frame:()=>{if(eras.includes(8))FEAT_COPIES[8].harvest();},
    flown:()=>Object.fromEntries(eras.map(e=>[e,FEAT_COPIES[e].signed]))
  };
}

// ---------- The ladder: the Journey climbed across runs ----------
// `--ladder` asks the question JOURNEY.md §1.6 is written against, directly rather than by dividing a
// median: a player flies Journey runs one after another at the frontier, every run banking what it
// observed (and the body held at death), a ready era banking nothing further, and the frontier turning
// over between runs once its chapters stand and its signature feat has been flown in one of them — the
// rules src/journey.js keeps. The game now turns the page inside a run as well (stage 5); the ladder still
// turns it between runs, so it reads each century's stay a little long for a run that became ready early
// and flew on. Runs are independent of one another, so the climb is not flown run by run: each hand flies
// `--seeds` runs on each of three charts — the atlas's, the Rock's (whose flares relight the ochre, and
// under `--chasms` whose cracks open) and the Lens's (whose registers each buy a breath of grace) — with
// every century flown on that chart reading its own feat off the same flight, and the players then climb
// by drawing runs from those, which reads the same as flying every run of every climb at a fraction of the
// cost. What it reports is how often a run flies each century's feat, how many runs each century holds a
// player for, and how many the whole climb takes, beside what knowledge alone would have held them for.
// `--threshold` reads the ladder at other era thresholds than the one the game ships with (a
// comma-separated list); `--players` sets how many climb, `--runs` how many runs a climb is given before it
// is called unfinished.
// `--hands=20,45` flies only the hands of those milliseconds, for a quicker reading of the ones that matter;
// it serves the ladder as well, so its hands can be flown side by side as separate processes.
const ONLY=(args.find(a=>a.startsWith('--hands='))||'').slice(8).split(',').filter(Boolean).map(Number);
const LADDER=args.includes('--ladder');
if(LADDER){
  const journeySource=await readFile(new URL('../src/journey.js',import.meta.url),'utf8');
  const SHIPPED=Number((journeySource.match(/ERA_THRESHOLD=([\d.]+)/)||[])[1]);
  const asked=args.find(a=>a.startsWith('--threshold='));
  const THRESHOLDS=asked?asked.slice(12).split(',').map(Number).filter(t=>t>0):[SHIPPED];
  const PLAYERS=flag('players',400),RUN_CAP=flag('runs',400);
  const hands=(MODEL==='spread'?SPREAD_HANDS:HANDS).filter(h=>(args.includes('--oracle')||(h.sigma??h.late)>0)&&(!ONLY.length||ONLY.includes(Math.round((h.sigma??h.late)*1000))));
  const tables=THRESHOLDS.map(()=>[]),featTable=[];
  const ON_ATLAS=[2,3,4,7,8],ERA_NAMES=['I','II','III','IV','V','VI','VII','VIII'];
  for(const hand of hands){
    // Each century's pool: what a run on its chart banked, and whether it flew that century's feat.
    const bank=r=>r.ledger+r.held,pools=[...Array(9)].map(()=>[]);
    for(let seed=1;seed<=SEEDS;seed++){
      const atlas=fly(seed,hand,undefined,featWatch(ON_ATLAS)),rock=fly(seed,hand,ROCK,featWatch([1])),lens=fly(seed,hand,LENS,featWatch([6]));
      const figures=fly(seed,hand,FIGURES,featWatch([5]));
      pools[1].push({bank:bank(rock),feat:rock.feats[1]});pools[6].push({bank:bank(lens),feat:lens.feats[6]});pools[5].push({bank:bank(figures),feat:figures.feats[5]});
      for(const era of ON_ATLAS)pools[era].push({bank:bank(atlas),feat:atlas.feats[era]});
    }
    featTable.push({hand:hand.name,share:pools.slice(1).map(p=>p.filter(r=>r.feat).length/p.length)});
    THRESHOLDS.forEach((THRESHOLD,ti)=>{
      // Both climbs start from the same draws, so what separates them is the feats and not the luck of the draw.
      const climb=feats=>{
        const draw=rng(4099+Math.round((hand.sigma??hand.late)*1e4)+ti),pick=list=>list[Math.floor(draw()*list.length)];
        const perEra=[...Array(9)].map(()=>[]),totals=[];let finished=0;
        for(let player=0;player<PLAYERS;player++){
          let era=1,knowledge=0,signed=!feats,runs=0,eraRuns=0;
          while(era<=8&&runs<RUN_CAP){
            const run=pick(pools[era]);runs++;eraRuns++;
            knowledge=Math.min(THRESHOLD,knowledge+run.bank);signed=signed||run.feat;
            if(knowledge>=THRESHOLD&&signed){perEra[era].push(eraRuns);era++;knowledge=0;signed=!feats;eraRuns=0;}
          }
          if(era>8){finished++;totals.push(runs);}
        }
        return {perEra:perEra.slice(1).map(a=>a.length?pct(a,.5):null),total:totals.length?pct(totals,.5):null,finished:finished/PLAYERS};
      };
      const shipped=climb(true),alone=climb(false);
      tables[ti].push({hand:hand.name,runLedger:pct(pools[2].map(r=>r.bank),.5),rockLedger:pct(pools[1].map(r=>r.bank),.5),...shipped,alone});
    });
  }
  if(JSON_OUT){console.log(JSON.stringify({seeds:SEEDS,players:PLAYERS,runCap:RUN_CAP,shipped:SHIPPED,feats:featTable,tables:THRESHOLDS.map((t,i)=>({threshold:t,table:tables[i]}))},null,2));process.exit(0);}
  console.log('\nOrbit · the Journey climbed across runs — '+SEEDS+' runs per hand on each chart, '+PLAYERS+' players, at most '+RUN_CAP+' runs');
  console.log('hand model '+MODEL+', pressure '+(PRESSURE||'default')+', endless driver '+(DRIVEN?'on':'off'));
  console.log('\nHow often a run flies each century\'s signature feat\n');
  console.log(pad('hand',9)+ERA_NAMES.map(e=>padL(e,6)).join(''));
  console.log('-'.repeat(9+8*6));
  for(const r of featTable)console.log(pad(r.hand,9)+r.share.map(v=>padL(Math.round(v*100)+'%',6)).join(''));
  const cell=v=>v===null?'—':v;
  THRESHOLDS.forEach((THRESHOLD,ti)=>{
    console.log('\nera threshold '+THRESHOLD+(THRESHOLD===SHIPPED?' (as shipped)':' (shipped: '+SHIPPED+')')+' · runs a century holds a player for, chapters and feat\n');
    console.log(pad('hand',9)+padL('run',5)+padL('rock',6)+ERA_NAMES.map(e=>padL(e,5)).join('')+padL('climb',7)+padL('done',6)+padL('alone',7)+padL('done',6));
    console.log('-'.repeat(9+11+8*5+26));
    for(const r of tables[ti])console.log(pad(r.hand,9)+padL(r.runLedger.toFixed(1),5)+padL(r.rockLedger.toFixed(1),6)+r.perEra.map(v=>padL(cell(v),5)).join('')+padL(cell(r.total),7)+padL(Math.round(r.finished*100)+'%',6)+padL(cell(r.alone.total),7)+padL(Math.round(r.alone.finished*100)+'%',6));
    console.log('\n  knowledge alone, runs per century');
    for(const r of tables[ti])console.log(pad('  '+r.hand,11)+r.alone.perEra.map(v=>padL(cell(v),5)).join(''));
  });
  console.log('\n  I … VIII (feats) · share of runs on that century\'s chart that fly its feat at least once');
  console.log('  run, rock · the median run\'s whole banked observation on the atlas\'s chart and on the Rock\'s');
  console.log('  I … VIII · median runs a century holds a player for   climb · median runs for the whole ladder');
  console.log('  done · share of players who climbed all eight inside the cap   alone · the same climb on knowledge alone\n');
  process.exit(0);
}

// ---------- The Marathon: the whole ladder in one life ----------
// `--marathon` asks what JOURNEY.md §9.2 leaves open for the Marathon: what gate each century should set when
// nothing is banked across runs, so the whole of it has to be met inside the one life. A run starts on the
// Rock and is flown as the page flies a Journey run: once what it has observed since the century began reaches
// the gate (and, unless `--nofeats`, the century's own feat has been flown in it), the world is armed and its
// next ordinary landing grows the next century, refilling the nib and pushing the dark back (eraTransition in
// simulation.js). What each century sets on the world is set here as the page sets it (ui.js, the arming of the
// next century): the Rock's flares relight, the Lens crosses its registers, and from the Probe the circle turns
// back to the cave and goes on. The driver is the run's own, by row and clock, so the climb only steepens.
// `--gates=3,5,8` reads several gates; the record it reports is the number of centuries flown, which is the
// Marathon's own (§9.2): a century counts once it has been left, so a run that dies on the Rock has flown none.
if(MARATHON){
  const GATES=((args.find(a=>a.startsWith('--gates='))||'').slice(8)||'2,4,6,8').split(',').map(Number).filter(g=>g>0);
  const FEATS=!args.includes('--nofeats'),ERA_NAMES=['I','II','III','IV','V','VI','VII','VIII'];
  const LENS_ROWS=FEAT_COPIES[6].LENS_REG_ROWS;
  const hands=(MODEL==='spread'?SPREAD_HANDS:HANDS).filter(h=>(h.sigma??h.late)>0&&(!ONLY.length||ONLY.includes(Math.round((h.sigma??h.late)*1000))));
  const table=[];
  for(const gate of GATES)for(const hand of hands){
    const flown=[],seconds=[],rows=[],reached=Array(8).fill(0),eraSeconds=[...Array(9)].map(()=>[]);
    for(let seed=1;seed<=SEEDS;seed++){
      // The century in hand, where its knowledge began, and when it began, for the time a century holds a life.
      let era=1,base=0,banked=0,since=0,left=0,copy=FEAT_COPIES[1],w=null;
      const watch={
        bind:x=>{w=x;copy.bind(x);},
        emit:(type,e)=>{
          if(type==='eraTransition'){
            eraSeconds[era].push(w.elapsed-since);left++;
            // The knowledge a century counts begins at the landing that grew it, as the page clears the run's.
            era=era>=8?1:era+1;since=w.elapsed;base=banked;
            w.relightOn=era===1;w.chasmsOn=false;
            w.transitionRows=era===6?[LENS_ROWS,LENS_ROWS*2].map(r=>r+w.eraFrom):[];w.transitionsCrossed=0;
            copy=FEAT_COPIES[era];copy.bind(w);
          }
          copy.event(type,e);
        },
        frame:()=>{if(era===8)copy.harvest();},
        flown:()=>({})
      };
      const course={relight:true,chase:()=>era===5,tick:(x,ledger)=>{
        banked=ledger;
        if(!x.transitionReady&&ledger-base>=gate&&(!FEATS||copy.signed))x.transitionReady=true;
      }};
      const r=flySpread(seed,hand,course,watch);
      flown.push(left);seconds.push(r.elapsed);rows.push(r.row);
      for(let k=0;k<Math.min(left+1,8);k++)reached[k]++;
    }
    table.push({gate,hand:hand.name,median:pct(flown,.5),p90:pct(flown,.9),best:Math.max(...flown),circle:flown.filter(n=>n>=8).length/SEEDS,
      seconds:pct(seconds,.5),row:pct(rows,.5),reached:reached.slice(1).map(n=>n/SEEDS),eraSeconds:eraSeconds.slice(1).map(a=>a.length?Math.round(pct(a,.5)):null)});
  }
  if(JSON_OUT){console.log(JSON.stringify({seeds:SEEDS,feats:FEATS,table},null,2));process.exit(0);}
  console.log('\nOrbit · the Marathon, the whole ladder in one life — '+SEEDS+' runs per hand and gate');
  console.log('hand model '+MODEL+', pressure '+(PRESSURE||'default')+', feats '+(FEATS?'required':'not required')+', capped at row '+ROW_CAP+' or '+TIME_CAP+' s');
  console.log('\n'+pad('gate',6)+pad('hand',9)+padL('flown',6)+padL('p90',5)+padL('best',5)+padL('circle',7)+padL('row',5)+padL('secs',6)+'   share of lives that reach each century: '+ERA_NAMES.slice(1).join(' · '));
  console.log('-'.repeat(120));
  for(const r of table)console.log(pad(r.gate,6)+pad(r.hand,9)+padL(r.median,6)+padL(r.p90,5)+padL(r.best,5)+padL(Math.round(r.circle*100)+'%',7)+padL(Math.round(r.row),5)+padL(Math.round(r.seconds),6)+'   '+r.reached.map(v=>padL(Math.round(v*100)+'%',5)).join(''));
  console.log('\n  median seconds a century holds a life (of the lives that left it)\n');
  console.log(pad('gate',6)+pad('hand',9)+ERA_NAMES.map(e=>padL(e,6)).join(''));
  for(const r of table)console.log(pad(r.gate,6)+pad(r.hand,9)+r.eraSeconds.map(v=>padL(v===null?'—':v,6)).join(''));
  console.log('\n  gate · knowledge a century asks of the life before its next landing grows the next one');
  console.log('  flown · median centuries left in one life (the Marathon\'s record)   p90, best · the same at the top');
  console.log('  circle · share of lives that close the circle   row, secs · median depth and length of a life\n');
  process.exit(0);
}

const report=[];
for(const hand of (MODEL==='spread'?SPREAD_HANDS:HANDS).filter(h=>!ONLY.length||ONLY.includes(Math.round((h.sigma??h.late)*1000)))){
  const runs=[];for(let seed=1;seed<=SEEDS;seed++)runs.push(fly(seed,hand));
  const rows=runs.map(r=>r.row),caps=runs.map(r=>r.captures),all=runs.flatMap(r=>r.sweeps);
  const deaths={};for(const r of runs)deaths[r.reason]=(deaths[r.reason]||0)+1;
  report.push({
    hand:hand.name,
    rowMedian:pct(rows,.5),rowP10:pct(rows,.1),rowP90:pct(rows,.9),
    perfectShare:caps.reduce((a,b)=>a+b,0)?runs.reduce((a,r)=>a+r.perfects,0)/caps.reduce((a,b)=>a+b,0):0,
    capMedian:pct(caps,.5),capP10:pct(caps,.1),capP90:pct(caps,.9),
    elapsedMedian:pct(runs.map(r=>r.elapsed),.5),
    documentedMean:mean(all.map(documented)),
    completeShare:all.length?all.filter(s=>documented(s)>=1).length/all.length:0,
    ledgerPerCapture:mean(all.map(ledgerOf)),
    ledgerMedian:pct(runs.map(r=>r.ledger),.5),
    ledgerP10:pct(runs.map(r=>r.ledger),.1),ledgerP90:pct(runs.map(r=>r.ledger),.9),
    // What a threshold actually buys, which is the only question a per-era number has to answer:
    // how many runs bank enough to clear it once. Under a ladder climbed inside one run this reads
    // as "how many players ever see the next century"; under one climbed across runs it reads as
    // "how often a run advances the ladder at all", and the same column serves both readings.
    clears:[1,2,3,5,7,9,12].map(t=>({t,share:runs.filter(r=>r.ledger>=t).length/runs.length})),
    deaths,
    // How many runs got that far at all. The percentiles above say how deep a typical run goes; this
    // says how rare a deep one is, which is the number an era late on the ladder is really asking
    // about — an era nobody reaches is not a slow era, it is an unbuilt one.
    survival:[10,20,30,40,48].map(row=>({row,share:rows.filter(r=>r>=row).length/rows.length})),
    // What the ledger stands at by each row, which is the curve an era threshold is placed on: the
    // median across every run that actually reached the row, so a row only reports what the runs
    // that got there had banked, never an average diluted by the ones that never arrived.
    curve:[5,10,15,20,25,30,40,48].map(row=>{
      const reached=runs.map(r=>r.byRow.get(row)).filter(v=>v!==undefined);
      return {row,runs:reached.length,ledger:reached.length?pct(reached,.5):null};
    })
  });
}

if(JSON_OUT){console.log(JSON.stringify({seeds:SEEDS,patience:PATIENCE/TAU,sweepFull:SWEEP_FULL,ledgerFloor:LEDGER_FLOOR,ledgerSpan:LEDGER_SPAN,report},null,2));process.exit(0);}

console.log('\nOrbit · run-length probe — '+SEEDS+' seeds per hand, patience '+(PATIENCE/TAU).toFixed(2)+' turns, cut off at row '+ROW_CAP+' or '+TIME_CAP+' s');
console.log('hand model '+MODEL+', pressure '+(PRESSURE||'default')+', release grace '+(GRACE===null?'as shipped':Math.round(GRACE*1000)+' ms')+', endless driver '+(DRIVEN?'on':'off')+(ROCK_CHART?', the Rock\'s chart':''));
console.log('knowledge per encounter = '+LEDGER_FLOOR+' + '+LEDGER_SPAN+' × documented\n');
console.log(pad('hand',9)+padL('row p10',9)+padL('median',8)+padL('p90',7)+padL('captures',10)+padL('secs',7)+padL('perf',6)+padL('doc',6)+padL('full',7)+padL('ledger/cap',12)+padL('ledger',8));
console.log('-'.repeat(89));
for(const r of report)console.log(
  pad(r.hand,9)+padL(r.rowP10.toFixed(0),9)+padL(r.rowMedian.toFixed(0),8)+padL(r.rowP90.toFixed(0),7)+
  padL(r.capMedian.toFixed(0),10)+padL(r.elapsedMedian.toFixed(0),7)+padL((r.perfectShare*100).toFixed(0)+'%',6)+
  padL(r.documentedMean.toFixed(2),6)+padL((r.completeShare*100).toFixed(0)+'%',7)+
  padL(r.ledgerPerCapture.toFixed(2),12)+padL(r.ledgerMedian.toFixed(0),8));
console.log('\n  row p10/median/p90 · how deep the run got   captures · bodies landed   secs · run length');
console.log('  perf · share of landings that were perfect transfers');
console.log('  doc · mean documented fraction at release   full · share of orbits held to completion');
console.log('  ledger/cap · mean observation banked per capture   ledger · the run\'s whole observation total');

console.log('\nHow a run died\n');
for(const r of report){
  const total=Object.values(r.deaths).reduce((a,b)=>a+b,0);
  const top=Object.entries(r.deaths).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k.toLowerCase()+' '+Math.round(v/total*100)+'%').join(' · ');
  console.log('  '+pad(r.hand,9)+top);
}

console.log('\nHow many runs reach a row at all\n');
console.log(pad('hand',9)+report[0].survival.map(s=>padL('r'+s.row,9)).join(''));
console.log('-'.repeat(9+report[0].survival.length*9));
for(const r of report)console.log(pad(r.hand,9)+r.survival.map(s=>padL((s.share*100).toFixed(0)+'%',9)).join(''));

console.log('\nThe observation ledger by row — median of the runs that reached it\n');
console.log(pad('hand',9)+report[0].curve.map(c=>padL('r'+c.row,9)).join(''));
console.log('-'.repeat(9+report[0].curve.length*9));
for(const r of report)console.log(pad(r.hand,9)+r.curve.map(c=>padL(c.ledger===null?'—':c.ledger.toFixed(0),9)).join(''));
console.log('\n  A blank means no run of that hand reached the row at all.');

console.log('\nWhat share of runs banks enough observation to clear a threshold once\n');
console.log(pad('hand',9)+padL('spread',13)+report[0].clears.map(c=>padL(c.t,7)).join(''));
console.log('-'.repeat(22+report[0].clears.length*7));
for(const r of report)console.log(
  pad(r.hand,9)+padL(r.ledgerP10.toFixed(0)+'–'+r.ledgerMedian.toFixed(0)+'–'+r.ledgerP90.toFixed(0),13)+
  r.clears.map(c=>padL((c.share*100).toFixed(0)+'%',7)).join(''));
console.log('\n  spread · the run\'s whole observation total at p10, median and p90.');
console.log('  Read down a column for a ladder climbed inside one run — the share of players who ever');
console.log('  see the next century. Read it across for one climbed over many — how often a run advances.');

console.log('\nWhat an eight-era ladder would cost each hand\n');
for(const r of report)console.log(
  '  '+pad(r.hand,9)+'ledger '+padL(r.ledgerMedian.toFixed(0),4)+
  '  →  '+padL((r.ledgerMedian/8).toFixed(1),5)+' per era, '+padL((r.capMedian/8).toFixed(1),5)+' captures per era, '+
  padL((r.elapsedMedian/8).toFixed(0),4)+' s per era');
console.log('\n  The last column is the question the ladder actually has to answer: how long a century is on screen.\n');
