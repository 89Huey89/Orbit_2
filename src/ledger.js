'use strict';
/* Orbit · src/ledger.js
   The persistent ledger, the catalogue of unlockables, and the chosen cosmetics. */
// ---------- The ledger: one JSON document of everything the atlas has recorded ----------
// A single document under `orbit.ledger.v1` holds the lifetime figures. The run's own figures are
// tallied in memory as the simulation reports them and folded into the document at death and whenever
// the page is hidden, so a run that is never finished still counts what it did. Blocked storage and a
// malformed document are both ordinary conditions: the ledger falls back to an empty one and the game
// plays exactly as it does with a full one.
const LEDGER_KEY='orbit.ledger.v1',COSMETICS_KEY='orbit.cosmetics.v1',INITIALS_KEY='orbit.initials.v1';
function emptyLedger(){
  return {captures:0,perfects:0,bestFlow:0,constellations:{},bestRow:0,deepestChapter:0,deepestHardcoreChapter:0,
    grazes:0,shieldsSpent:0,maxSpeedSlings:0,runs:{},playSeconds:0,personalBests:{},observations:{},allFourInOneRun:false};
}
const countOf=value=>{const n=Number(value);return Number.isFinite(n)&&n>0?Math.floor(n):0;};
function cleanCounts(raw){
  const out={};
  if(raw&&typeof raw==='object'&&!Array.isArray(raw))for(const key in raw){const n=countOf(raw[key]);if(n>0)out[String(key)]=n;}
  return out;
}
function readLedger(){
  const empty=emptyLedger();
  let raw=null;
  try{raw=JSON.parse(storage.get(LEDGER_KEY,'null'));}catch(_){raw=null;}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return empty;
  const out=empty;
  for(const key of ['captures','perfects','bestFlow','bestRow','deepestChapter','deepestHardcoreChapter','grazes','shieldsSpent','maxSpeedSlings'])out[key]=countOf(raw[key]);
  out.playSeconds=Math.max(0,Number(raw.playSeconds)||0);
  out.constellations=cleanCounts(raw.constellations);out.runs=cleanCounts(raw.runs);
  out.observations=cleanCounts(raw.observations);out.personalBests=cleanCounts(raw.personalBests);
  out.allFourInOneRun=raw.allFourInOneRun===true;
  return out;
}
const ledger=readLedger();
function saveLedger(){storage.set(LEDGER_KEY,JSON.stringify(ledger));}
// The two records that predate the ledger are folded into it once, and left where they are: the
// colophon and the HUD still read `orbit.best.v1` and `orbit.bestRow.v1` exactly as before.
function migrateRecords(){
  let changed=false;
  if(bestRow>ledger.bestRow){ledger.bestRow=bestRow;changed=true;}
  if(best>0&&best>(ledger.personalBests[difficulty]||0)){ledger.personalBests[difficulty]=best;changed=true;}
  if(changed)saveLedger();
}
migrateRecords();
const ledgerRuns=l=>Object.values(l.runs).reduce((a,b)=>a+b,0);
const ledgerTopChart=l=>Object.values(l.constellations).reduce((a,b)=>Math.max(a,b),0);
const ledgerCharts=l=>Object.values(l.constellations).reduce((a,b)=>a+b,0);
function ledgerStat(name,l=ledger){
  if(name==='runs')return ledgerRuns(l);
  if(name==='topConstellation')return ledgerTopChart(l);
  if(name==='constellations')return ledgerCharts(l);
  return Number(l[name])||0;
}
// ---------- The run's own tally ----------
// Counted from the simulation's events, zeroed whenever it is folded in, so a second fold after a
// page has been hidden and resumed adds only what happened since the first.
let runTally=freshTally(),runCounted=false,runSeconds=0;
function freshTally(){return {captures:0,perfects:0,grazes:0,shieldsSpent:0,maxSpeedSlings:0,constellations:{},observations:{}};}
function resetRunTally(){runTally=freshTally();runCounted=false;runSeconds=0;}
function tally(key,by=1){runTally[key]+=by;}
function tallyMap(map,key){if(!key)return;runTally[map][key]=(runTally[map][key]||0)+1;}
function foldCounts(into,from){for(const key in from)into[key]=(into[key]||0)+from[key];}
// Fold the run into the ledger and write it. Returns the ids unlocked by this write, in catalogue order.
function ledgerCommit(){
  if(typeof world==='undefined'||!world)return [];
  const before=unlockedIds();
  ledger.captures+=runTally.captures;ledger.perfects+=runTally.perfects;
  ledger.grazes+=runTally.grazes;ledger.shieldsSpent+=runTally.shieldsSpent;ledger.maxSpeedSlings+=runTally.maxSpeedSlings;
  foldCounts(ledger.constellations,runTally.constellations);foldCounts(ledger.observations,runTally.observations);
  const key=dailyOn?'daily':difficulty;
  const elapsed=Math.max(0,world.elapsed||0);
  ledger.playSeconds=Math.round((ledger.playSeconds+Math.max(0,elapsed-runSeconds))*100)/100;
  runSeconds=elapsed;
  ledger.bestFlow=Math.max(ledger.bestFlow,world.maxCombo||0);
  ledger.bestRow=Math.max(ledger.bestRow,Math.floor(world.progress||0));
  const chapter=Math.min(4,Math.floor((world.progress||0)/8)+1);
  ledger.deepestChapter=Math.max(ledger.deepestChapter,chapter);
  if(key==='hardcore')ledger.deepestHardcoreChapter=Math.max(ledger.deepestHardcoreChapter,chapter);
  ledger.personalBests[key]=Math.max(ledger.personalBests[key]||0,world.score||0);
  if((world.constellationsCompleted||0)>=4)ledger.allFourInOneRun=true;
  if(!runCounted&&world.state!=='ready'){ledger.runs[key]=(ledger.runs[key]||0)+1;runCounted=true;}
  runTally=freshTally();
  saveLedger();
  unlockedNow=unlockedIds();
  return [...unlockedNow].filter(id=>!before.has(id));
}
// ---------- The catalogue of unlockables ----------
// Every entry names the cosmetic it grants, the Latin caption it is catalogued under, and the one
// condition that earns it: either a lifetime figure and its threshold, or a predicate over the ledger.
// Nothing is ever taken away once earned, and nothing here touches the simulation.
const UNLOCKS=[
  {id:'cellarius',kind:'plate',name:'Cellarius plate',latin:'Tabula Cellarii',stat:'captures',threshold:1000,
    describe:()=>'Capture 1,000 orbits in all'},
  {id:'verdigris',kind:'plate',name:'Verdigris plate',latin:'Tabula ærugine',test:l=>l.deepestHardcoreChapter>=4,
    describe:()=>'Reach chapter IV, The Deep, at Hardcore pressure'},
  {id:'foxed',kind:'plate',name:'Foxed plate',latin:'Tabula maculosa',stat:'runs',threshold:100,
    describe:()=>'Play 100 runs'},
  {id:'proof',kind:'plate',name:'Proof before letters',latin:'Ante litteras',test:l=>l.allFourInOneRun,
    describe:()=>'Trace four constellations in one run'},
  {id:'comet',kind:'mark',name:'Comet',latin:'Cometa',stat:'runs',threshold:25,
    describe:()=>'Play 25 runs'},
  {id:'telescope',kind:'mark',name:'Galilean telescope',latin:'Perspicillum',stat:'perfects',threshold:100,
    describe:()=>'Make 100 perfect transfers'},
  {id:'moth',kind:'mark',name:'Moth',latin:'Phalæna',stat:'perfects',threshold:500,
    describe:()=>'Make 500 perfect transfers'},
  {id:'saturn',kind:'mark',name:'Saturn with handles',latin:'Saturnus ansatus',stat:'perfects',threshold:1500,
    describe:()=>'Make 1,500 perfect transfers'},
  {id:'sanguine',kind:'trail',name:'Red chalk',latin:'Sanguinea',stat:'maxSpeedSlings',threshold:10,
    describe:()=>'Leave 10 slingshot stars at full speed'},
  {id:'silverpoint',kind:'trail',name:'Silverpoint',latin:'Stilus argenteus',stat:'maxSpeedSlings',threshold:50,
    describe:()=>'Leave 50 slingshot stars at full speed'},
  {id:'goldleaf',kind:'trail',name:'Gold leaf',latin:'Aurum foliatum',stat:'maxSpeedSlings',threshold:200,
    describe:()=>'Leave 200 slingshot stars at full speed'},
  {id:'rose',kind:'capture',name:'Compass rose',latin:'Rosa ventorum',stat:'captures',threshold:250,
    describe:()=>'Capture 250 orbits in all'},
  {id:'seal',kind:'capture',name:'Wax seal',latin:'Sigillum',stat:'captures',threshold:1000,
    describe:()=>'Capture 1,000 orbits in all'},
  {id:'manicule',kind:'capture',name:'Manicule',latin:'Manicula',stat:'captures',threshold:5000,
    describe:()=>'Capture 5,000 orbits in all'},
  {id:'strapwork',kind:'frame',name:'Strapwork',latin:'Ligamenta',stat:'bestRow',threshold:20,
    describe:()=>'Reach row 20'},
  {id:'acanthus',kind:'frame',name:'Acanthus scrolls',latin:'Acanthus',stat:'bestRow',threshold:40,
    describe:()=>'Reach row 40'},
  {id:'seamonsters',kind:'frame',name:'Sea monsters',latin:'Cete',stat:'bestRow',threshold:60,
    describe:()=>'Reach row 60'},
  {id:'bayer',kind:'figures',name:'Bayer manner',latin:'More Bayeri',stat:'topConstellation',threshold:10,
    describe:()=>'Complete one constellation 10 times'},
  {id:'bode',kind:'figures',name:'Bode manner',latin:'More Bodii',stat:'topConstellation',threshold:25,
    describe:()=>'Complete one constellation 25 times'},
  {id:'delineavit',kind:'credit',name:'Engraver’s credit',latin:'Delineavit',stat:'runs',threshold:50,
    describe:()=>'Play 50 runs'},
  {id:'exlibris',kind:'stamp',name:'Ex libris stamp',latin:'Ex libris',test:l=>Object.keys(DARKNESS_MULT).every(key=>(l.personalBests[key]||0)>0),
    describe:()=>'Score on Relaxed, Classic and Hardcore'}
];
const UNLOCK_BY_ID={};for(const entry of UNLOCKS)UNLOCK_BY_ID[entry.id]=entry;
function unlockMet(entry,l=ledger){
  if(typeof entry.test==='function')return !!entry.test(l);
  return ledgerStat(entry.stat,l)>=entry.threshold;
}
function unlockedIds(l=ledger){
  const set=new Set();
  for(const entry of UNLOCKS)if(unlockMet(entry,l))set.add(entry.id);
  return set;
}
let unlockedNow=unlockedIds();
const isUnlocked=id=>!UNLOCK_BY_ID[id]||unlockedNow.has(id);
// How far along a condition the ledger stands, for the catalogue's greyed rules.
function unlockProgress(entry,l=ledger){
  if(typeof entry.test==='function')return null;
  return {value:ledgerStat(entry.stat,l),threshold:entry.threshold};
}
// ---------- The chosen cosmetics ----------
// One selection per category under `orbit.cosmetics.v1`. Everything defaults to the classic look, a
// locked selection is never honoured, and the plate is additionally kept in `orbit.plate.v1` as it
// always has been, so the footer's night/paper toggle needs no ledger at all.
const COSMETIC_KINDS=[
  {kind:'plate',title:'Plates',latin:'Tabulæ',fallback:'night',
    stock:[{id:'night',name:'Night plate',latin:'Tabula nocturna'},{id:'paper',name:'Paper plate',latin:'Tabula chartacea'}]},
  {kind:'mark',title:'Observer marks',latin:'Signa observatoris',fallback:'quill',
    stock:[{id:'quill',name:'Quill',latin:'Penna'}]},
  {kind:'trail',title:'Trail inks',latin:'Atramenta',fallback:'irongall',
    stock:[{id:'irongall',name:'Iron gall',latin:'Atramentum ferreum'}]},
  {kind:'capture',title:'Capture marks',latin:'Signa capturæ',fallback:'ripple',
    stock:[{id:'ripple',name:'Broken ripple',latin:'Unda fracta'}]},
  {kind:'frame',title:'Frame ornaments',latin:'Ornamenta marginis',fallback:'windheads',
    stock:[{id:'windheads',name:'Wind-heads',latin:'Capita ventorum'}]},
  {kind:'figures',title:'Figure styles',latin:'Manus figurarum',fallback:'hevelius',
    stock:[{id:'hevelius',name:'Hevelius manner',latin:'More Hevelii'}]}
];
const COSMETIC_FALLBACK={};for(const group of COSMETIC_KINDS)COSMETIC_FALLBACK[group.kind]=group.fallback;
// Every item of a category, stock first, then the catalogue's own in the order they are earned.
function cosmeticItems(kind){
  const group=COSMETIC_KINDS.find(g=>g.kind===kind);
  return [...(group?group.stock:[]),...UNLOCKS.filter(u=>u.kind===kind)];
}
function readCosmetics(){
  const chosen={};
  let raw=null;
  try{raw=JSON.parse(storage.get(COSMETICS_KEY,'null'));}catch(_){raw=null;}
  if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};
  for(const group of COSMETIC_KINDS){
    const want=raw[group.kind];
    const known=cosmeticItems(group.kind).some(item=>item.id===want);
    chosen[group.kind]=known&&isUnlocked(want)?want:group.fallback;
  }
  return chosen;
}
const cosmetics=readCosmetics();
function saveCosmetics(){storage.set(COSMETICS_KEY,JSON.stringify(cosmetics));}
const cosmetic=kind=>cosmetics[kind]||COSMETIC_FALLBACK[kind];
// Record a selection without acting on it; the plate's own setter calls this so the two keys agree.
function recordCosmetic(kind,id){
  if(cosmetics[kind]===id)return;
  cosmetics[kind]=id;saveCosmetics();
}
// Choose a cosmetic. A locked or unknown item is refused; a plate change goes through setPlate so the
// cached artwork is rebuilt exactly as the footer toggle rebuilds it.
function setCosmetic(kind,id){
  if(!(kind in cosmetics))return false;
  if(!cosmeticItems(kind).some(item=>item.id===id)||!isUnlocked(id))return false;
  if(cosmetics[kind]===id)return true;
  if(kind==='plate'){setPlate(id);return true;}
  recordCosmetic(kind,id);
  if(kind==='figures'||kind==='frame')invalidateArt();
  if(typeof world!=='undefined'&&world&&W&&H)render(0);
  return true;
}
// The plate recorded in `orbit.plate.v1` may be one the ledger has not earned — a cleared ledger, or a
// document copied between browsers. Fall back to the classic sheet rather than printing a locked plate.
if(!isUnlocked(plateName))applyPlate(cosmetics.plate&&isUnlocked(cosmetics.plate)?cosmetics.plate:'night');
else if(cosmetics.plate!==plateName)recordCosmetic('plate',plateName);
// ---------- The engraver's initials ----------
const readInitials=()=>String(storage.get(INITIALS_KEY,'')||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);
let initials=readInitials();
function setInitials(value){
  initials=String(value||'').toUpperCase().replace(/[^A-Z]/g,'').slice(0,3);
  storage.set(INITIALS_KEY,initials);
  invalidateArt();
  if(typeof world!=='undefined'&&world&&W&&H)render(0);
  return initials;
}
// The engraver's line in the frame margin, with the initials set before it once they are earned.
function engraverCredit(){
  return isUnlocked('delineavit')&&initials?initials.split('').join('.')+'. delineavit et sculpsit · Orbis Tabula':'Delineavit et sculpsit · Orbis Tabula';
}
