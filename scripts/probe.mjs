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
function dealWorld(seed,era=ROCK_CHART?ROCK:{}){
  const w=new OrbitWorld(seed,seed%3===0?1280:440,860,()=>{},false,false,false,!!era.chasms,!!era.relight);w.driven=DRIVEN;
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
const ROW_CAP=flag('rows',200),TIME_CAP=flag('seconds',420);
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
function forecast(w,eligible,settle,sigma=0){
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
  return wide!==null&&(settle||sigma>0)?wide:null;
}
function gauss(r){const u=Math.max(1e-12,r()),v=r();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
function flySpread(seed,hand,era){
  const w=dealWorld(seed,era);w.start();
  const jitter=rng(seed*7919+Math.round(hand.sigma*1000)+17);
  const sweeps=[],byRow=new Map();
  let ledger=0,pending=-1,frame=0;
  for(let i=0;i<120*TIME_CAP&&w.state==='playing'&&w.progress<ROW_CAP;i++,frame++){
    const p=w.player;
    if(p.node){
      if(pending<0&&frame%4===0&&p.orbitTime>.12&&(p.node.type!=='sling'||w.charge()===1)){
        const row=Math.floor(w.progress)+1;
        const aimAt=forecast(w,a=>!a.steep&&!a.dry&&a.n.type!=='gold'&&a.n.row>=row&&a.n.row<=row+2,p.orbitSweep>PATIENCE,hand.sigma);
        if(aimAt!==null)pending=w.time+Math.max(0,aimAt+gauss(jitter)*hand.sigma);
      }
      if(pending>=0&&w.time>=pending){
        sweeps.push(p.orbitSweep);ledger+=ledgerOf(p.orbitSweep);
        byRow.set(Math.floor(w.progress),ledger);
        pending=-1;w.release();
      }
    } else pending=-1;
    w.update(STEP);
  }
  // The body still held when the run ends is banked for what it had been observed to, as the Journey
  // banks it at death (journeyCommit in src/journey.js).
  const held=w.player.node?ledgerOf(w.player.orbitSweep):0;
  return {seed,row:w.progress,captures:w.captures,perfects:w.perfects,elapsed:w.elapsed,score:w.score,reason:w.state==='dead'?w.reason:'(survived the cap)',sweeps,ledger,byRow,held};
}
function fly(seed,hand,era){
  if(MODEL==='spread')return flySpread(seed,hand,era);
  const w=dealWorld(seed,era);w.start();
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
  }
  const held=w.player.node?ledgerOf(w.player.orbitSweep):0;
  return {seed,row:w.progress,captures:w.captures,perfects:w.perfects,elapsed:w.elapsed,score:w.score,reason:w.state==='dead'?w.reason:'(survived the cap)',sweeps,ledger,byRow,held};
}

const sorted=a=>[...a].sort((x,y)=>x-y);
const pct=(a,q)=>{const s=sorted(a);return s.length?s[Math.min(s.length-1,Math.floor(q*s.length))]:0;};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const pad=(s,n)=>String(s).padEnd(n),padL=(s,n)=>String(s).padStart(n);

// ---------- The ladder: the Journey climbed across runs ----------
// `--ladder` asks the question JOURNEY.md §1.6 is written against, directly rather than by dividing a
// median: a player flies Journey runs one after another at the frontier, every run banking what it
// observed (and the body held at death), a ready era banking nothing further, and the frontier turning
// over between runs once every milestone stands — exactly the rules src/journey.js keeps, until stage 5
// lets the turn happen inside a run. Runs are independent of one another, so the climb is not flown
// run by run: each hand flies `--seeds` runs on the atlas's chart and as many on the Rock's (the one
// century whose simulation differs: its flares relight the ochre, and under `--chasms` its cracks open), and the players then climb by drawing runs from those, which reads
// the same as flying every run of every climb at a fraction of the cost. What it reports is how many runs
// each century holds a player for, and how many the whole climb takes. `--threshold` reads the ladder at
// other era thresholds than the one the game ships with (a comma-separated list); `--players` sets how
// many climb, `--runs` how many runs a climb is given before it is called unfinished.
const LADDER=args.includes('--ladder');
if(LADDER){
  const journeySource=await readFile(new URL('../src/journey.js',import.meta.url),'utf8');
  const SHIPPED=Number((journeySource.match(/ERA_THRESHOLD=([\d.]+)/)||[])[1]);
  const asked=args.find(a=>a.startsWith('--threshold='));
  const THRESHOLDS=asked?asked.slice(12).split(',').map(Number).filter(t=>t>0):[SHIPPED];
  const PLAYERS=flag('players',400),RUN_CAP=flag('runs',400);
  const hands=(MODEL==='spread'?SPREAD_HANDS:HANDS).filter(h=>args.includes('--oracle')||(h.sigma??h.late)>0);
  const tables=THRESHOLDS.map(()=>[]);
  for(const hand of hands){
    const bank=r=>r.ledger+r.held,atlas=[],rock=[];
    for(let seed=1;seed<=SEEDS;seed++){atlas.push(bank(fly(seed,hand)));rock.push(bank(fly(seed,hand,ROCK)));}
    THRESHOLDS.forEach((THRESHOLD,ti)=>{
      const draw=rng(4099+Math.round((hand.sigma??hand.late)*1e4)+ti),pick=list=>list[Math.floor(draw()*list.length)];
      const perEra=[...Array(9)].map(()=>[]),totals=[];let finished=0;
      for(let player=0;player<PLAYERS;player++){
        let era=1,knowledge=0,runs=0,eraRuns=0;
        while(era<=8&&runs<RUN_CAP){
          runs++;eraRuns++;knowledge=Math.min(THRESHOLD,knowledge+pick(era===1?rock:atlas));
          if(knowledge>=THRESHOLD){perEra[era].push(eraRuns);era++;knowledge=0;eraRuns=0;}
        }
        if(era>8){finished++;totals.push(runs);}
      }
      tables[ti].push({hand:hand.name,runLedger:pct(atlas,.5),rockLedger:pct(rock,.5),perEra:perEra.slice(1).map(a=>a.length?pct(a,.5):null),total:totals.length?pct(totals,.5):null,finished:finished/PLAYERS});
    });
  }
  if(JSON_OUT){console.log(JSON.stringify({seeds:SEEDS,players:PLAYERS,runCap:RUN_CAP,shipped:SHIPPED,tables:THRESHOLDS.map((t,i)=>({threshold:t,table:tables[i]}))},null,2));process.exit(0);}
  console.log('\nOrbit · the Journey climbed across runs — '+SEEDS+' runs per hand on each chart, '+PLAYERS+' players, at most '+RUN_CAP+' runs');
  console.log('hand model '+MODEL+', pressure '+(PRESSURE||'default')+', endless driver '+(DRIVEN?'on':'off'));
  THRESHOLDS.forEach((THRESHOLD,ti)=>{
    console.log('\nera threshold '+THRESHOLD+(THRESHOLD===SHIPPED?' (as shipped)':' (shipped: '+SHIPPED+')')+'\n');
    console.log(pad('hand',9)+padL('run',5)+padL('rock',6)+['I','II','III','IV','V','VI','VII','VIII'].map(e=>padL(e,5)).join('')+padL('climb',7)+padL('done',6));
    console.log('-'.repeat(9+11+8*5+13));
    for(const r of tables[ti])console.log(pad(r.hand,9)+padL(r.runLedger.toFixed(1),5)+padL(r.rockLedger.toFixed(1),6)+r.perEra.map(v=>padL(v===null?'—':v,5)).join('')+padL(r.total===null?'—':r.total,7)+padL(Math.round(r.finished*100)+'%',6));
  });
  console.log('\n  run, rock · the median run\'s whole banked observation on the atlas\'s chart and on the Rock\'s');
  console.log('  I … VIII · median runs a century holds a player for   climb · median runs for the whole ladder');
  console.log('  done · share of players who climbed all eight inside the cap\n');
  process.exit(0);
}

// `--hands=20,45` flies only the hands of those milliseconds, for a quicker reading of the ones that matter.
const ONLY=(args.find(a=>a.startsWith('--hands='))||'').slice(8).split(',').filter(Boolean).map(Number);
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
