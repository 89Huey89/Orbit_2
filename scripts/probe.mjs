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

   What it reports is what `PROGRESSION.md` says the era thresholds must be read off rather than
   guessed at: how far a run gets, how many bodies it captures on the way, how much of each orbit it
   actually holds, and what the observation ledger would therefore stand at by each row. */
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const simulation=(await readFile(new URL('../src/simulation.js',import.meta.url),'utf8')).split('// BEGIN SIMULATION')[1].split('// END SIMULATION')[0];
const sandbox={};vm.createContext(sandbox);
vm.runInContext(simulation+'\nthis.api={OrbitWorld};',sandbox);
const {OrbitWorld}=sandbox.api;

const STEP=1/120,TAU=Math.PI*2;
// The swept arc at which an observation is complete, per KNOWLEDGE-HORIZON.md's own checkpoint, and
// the ledger PROGRESSION.md proposes over it: a tap-and-run capture banks the floor, a body held to
// completion banks the whole. Both are provisional there and both are provisional here — they are
// parameters of the probe precisely so the curve can be re-read once they move.
const SWEEP_FULL=TAU*2/3,LEDGER_FLOOR=.35,LEDGER_SPAN=.65;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const documented=sweep=>clamp(sweep/SWEEP_FULL,0,1);
const ledgerOf=sweep=>LEDGER_FLOOR+LEDGER_SPAN*documented(sweep);

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
function fly(seed,hand){
  const w=new OrbitWorld(seed,seed%3===0?1280:440,860);w.start();
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
  return {seed,row:w.progress,captures:w.captures,elapsed:w.elapsed,score:w.score,reason:w.state==='dead'?w.reason:'(survived the cap)',sweeps,ledger,byRow};
}

const sorted=a=>[...a].sort((x,y)=>x-y);
const pct=(a,q)=>{const s=sorted(a);return s.length?s[Math.min(s.length-1,Math.floor(q*s.length))]:0;};
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
const pad=(s,n)=>String(s).padEnd(n),padL=(s,n)=>String(s).padStart(n);

const report=[];
for(const hand of HANDS){
  const runs=[];for(let seed=1;seed<=SEEDS;seed++)runs.push(fly(seed,hand));
  const rows=runs.map(r=>r.row),caps=runs.map(r=>r.captures),all=runs.flatMap(r=>r.sweeps);
  const deaths={};for(const r of runs)deaths[r.reason]=(deaths[r.reason]||0)+1;
  report.push({
    hand:hand.name,
    rowMedian:pct(rows,.5),rowP10:pct(rows,.1),rowP90:pct(rows,.9),
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

console.log('\nOrbit · run-length probe — '+SEEDS+' seeds per hand, patience '+(PATIENCE/TAU).toFixed(2)+' turns, cut off at row '+ROW_CAP+' or '+TIME_CAP+' s\n');
console.log(pad('hand',9)+padL('row p10',9)+padL('median',8)+padL('p90',7)+padL('captures',10)+padL('secs',7)+padL('doc',6)+padL('full',7)+padL('ledger/cap',12)+padL('ledger',8));
console.log('-'.repeat(83));
for(const r of report)console.log(
  pad(r.hand,9)+padL(r.rowP10.toFixed(0),9)+padL(r.rowMedian.toFixed(0),8)+padL(r.rowP90.toFixed(0),7)+
  padL(r.capMedian.toFixed(0),10)+padL(r.elapsedMedian.toFixed(0),7)+
  padL(r.documentedMean.toFixed(2),6)+padL((r.completeShare*100).toFixed(0)+'%',7)+
  padL(r.ledgerPerCapture.toFixed(2),12)+padL(r.ledgerMedian.toFixed(0),8));
console.log('\n  row p10/median/p90 · how deep the run got   captures · bodies landed   secs · run length');
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
