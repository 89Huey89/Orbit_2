'use strict';
/* Orbit · src/centuries.js
   Every century's own leaf of the catalogue: its record, its collection and its feats, and the heirloom it
   leaves the atlas once it is known. Loads after journey.js and before the era files, each of which
   registers its own page here with defineCentury(); catalogue.js prints them. */
// ---------- Each century's own log ----------
// The atlas's ledger (src/ledger.js) only ever folds a run flown on the atlas: every other century owns its
// score (plateOwns('score')) and so wrote nothing of what it was flown for anywhere but its own small record,
// and the Ceiling and the Scroll not even that. `orbit.eras.v1` is that ledger for the other seven, kept one
// log per century in the same shape, from the same run tally, folded at the same moments. It counts every
// run a century was flown in, a Journey run's stretch in it included, because what it keeps is how much of
// the century has been seen; the records a run is measured against stay where JOURNEY.md §1.7 put them.
const ERAS_KEY='orbit.eras.v1',CENTURY_NUMERALS=['I','II','III','IV','V','VI','VII','VIII'];
const ERA_LOG_COUNTS=['runs','captures','perfects','grazes','constellations','bestRow','bestFlow','won'];
function emptyEraLog(){const log={playSeconds:0,deaths:{}};for(const key of ERA_LOG_COUNTS)log[key]=0;return log;}
function readEraLogs(){
  let raw=null;
  try{raw=JSON.parse(storage.get(ERAS_KEY,'null'));}catch(_){raw=null;}
  const doc=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{},out={};
  for(let era=1;era<=JOURNEY_ERAS;era++){
    if(era===5)continue;
    const log=emptyEraLog(),src=doc[era];
    if(src&&typeof src==='object'&&!Array.isArray(src)){
      for(const key of ERA_LOG_COUNTS)log[key]=countOf(src[key]);
      log.playSeconds=Math.max(0,Number(src.playSeconds)||0);log.deaths=cleanCounts(src.deaths);
    }
    out[era]=log;
  }
  return out;
}
const eraLogs=readEraLogs();
const eraLog=era=>eraLogs[era]||emptyEraLog();
function saveEraLogs(){storage.set(ERAS_KEY,JSON.stringify(eraLogs));}
// Fold the run in hand into the log of the century it is being flown in, exactly as ledgerCommit() folds
// the atlas's: the tally is zeroed, so a second fold after the page was hidden adds only what came since.
// `ending` is true once, at the colophon, which is the only moment a Chronicle can have been won. Returns
// the feats this fold granted, which the colophon names beside the atlas's own.
function eraLedgerCommit(ending=false){
  const era=eraId(),log=eraLogs[era];
  if(!log||dailyOn||typeof world==='undefined'||!world)return [];
  const before=centuryUnlockedIds();
  log.captures+=runTally.captures;log.perfects+=runTally.perfects;log.grazes+=runTally.grazes;
  for(const key in runTally.constellations)log.constellations+=runTally.constellations[key];
  foldCounts(log.deaths,runTally.deaths);
  const elapsed=Math.max(0,world.elapsed||0);
  log.playSeconds=Math.round((log.playSeconds+Math.max(0,elapsed-runSeconds))*100)/100;
  runSeconds=elapsed;
  // Rows are the century's own, counted from where a run that changed century arrived in it (eraRow).
  log.bestRow=Math.max(log.bestRow,Math.floor(eraRow()));
  log.bestFlow=Math.max(log.bestFlow,world.maxCombo||0);
  if(!runCounted&&world.state!=='ready'){log.runs++;runCounted=true;}
  if(ending&&chronicleWon(world))log.won++;
  runTally=freshTally();
  saveEraLogs();
  return [...centuryUnlockedIds()].filter(id=>!before.has(id));
}
// A run that changes century mid-flight folds what it did in the old one before the new one is put on the
// press, into whichever book the old one keeps, and is counted again as a run of the century it arrives in.
function foldBeforeTurn(){
  const fresh=plateOwns('score')?eraLedgerCommit():ledgerCommit();
  for(const id of fresh)if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
  runCounted=false;
}
// ---------- The pages ----------
// A century's page is registered by its own file, in its own words, since only that file knows its
// material. The shape (all optional but `title`):
//   title, latin          — the century's name as its frontispiece sets it, and the Latin (or its own
//                           tongue's) caption beneath; `gloss` is an English line under both.
//   leaf                  — {heading, subs:[record, collection, feats]}: the leaf's own heading and the
//                           captions under its three tabs, for a century that sets no Latin.
//   recordRows()          — extra [label, value] rows for the Record, read from the century's own store.
//   collection            — {title, latin, items()}: items() returns [{name, latin, gloss, seen, count,
//                           art}] where `seen` says whether it has been met, `count` how often (optional),
//                           and `art()` an SVG string over the catalogue's 120×72 field (optional).
//   feats                 — [{id, name, latin, describe(), stat+threshold | test(log) | value(log)+threshold,
//                           art()}]: `stat` is a key of the century's log; `value(log)` any figure read
//                           from its own store; `test(log)` a feat with no figure to count toward.
//   heirloom              — {name, latin, gloss, art()}: what the century leaves in the atlas's own
//                           catalogue once it is known (centuryKnown), and on the page of the one after it.
const CENTURIES={};
function defineCentury(era,page){
  const into=CENTURIES[era]||(CENTURIES[era]={era,feats:[]});
  for(const key in page)if(key!=='feats')into[key]=page[key];
  for(const feat of page.feats||[])into.feats.push(Object.assign({},feat,{id:'c'+era+'.'+feat.id,era}));
  return into;
}
const CENTURY_FEAT_BY_ID={};
function centuryFeat(id){
  if(CENTURY_FEAT_BY_ID[id])return CENTURY_FEAT_BY_ID[id];
  for(const era in CENTURIES)for(const feat of CENTURIES[era].feats)CENTURY_FEAT_BY_ID[feat.id]=feat;
  return CENTURY_FEAT_BY_ID[id]||null;
}
// How far a feat stands, for its greyed rule: null for a feat with no figure to count toward.
function centuryFeatProgress(feat){
  const log=eraLog(feat.era);
  if(typeof feat.test==='function')return null;
  const value=typeof feat.value==='function'?Number(feat.value(log))||0:Number(log[feat.stat])||0;
  return {value,threshold:feat.threshold};
}
function centuryFeatMet(feat){
  if(typeof feat.test==='function'){try{return !!feat.test(eraLog(feat.era));}catch(_){return false;}}
  const p=centuryFeatProgress(feat);return p.value>=p.threshold;
}
function centuryUnlockedIds(){
  const set=new Set();
  for(const era in CENTURIES)for(const feat of CENTURIES[era].feats)if(centuryFeatMet(feat))set.add(feat.id);
  return set;
}
// ---------- What the centuries leave each other ----------
// LINKING.md, "Links between eras": every century that is known leaves one heirloom in the atlas's own
// catalogue. Known is the one thing both ways of playing it can say: its Chronicle flown to its ending in
// Free Play, or the Journey climbed past it (the last century, once the ladder itself is climbed). A century
// climbed past stays known when the climb begins again, by the circle or by the restart: the century above it
// was reached, and every one of the eight is known once the circle has been closed.
function centuryKnown(era){
  if(era===5)return true;
  if(eraLog(era).won>0)return true;
  if(journeyCircled())return true;
  return era<JOURNEY_ERAS?journey.era>era||journey.unlocked.includes(era+1):journeyComplete();
}
const centuryTitle=era=>era===5?'The Atlas':(CENTURIES[era]&&CENTURIES[era].title)||'Century '+CENTURY_NUMERALS[era-1];
// ---------- What a century said, kept on its own leaf ----------
// A century speaks as it is flown: a curator's line as each chapter opens and a note under each chart as it
// closes. The sheet carries both off as it scrolls, and lets a note go when there is no clear ground for it;
// the leaf keeps them, so that what a flight taught can be read again, and only once the flight has met it
// (docs/KNOWLEDGE-AUDIT.md, §3.1). No store of its own is needed: a chart's card is already kept as met by the
// century's own record, and a chapter is reached once the century's log has a row at or past its first.
// `centuryWords` is the century's voice as its own run hears it, the atlas's filling in what it leaves unset.
function centuryWords(era){
  if(era===5)return VOICES.atlas||null;
  for(const id in PLATE_STYLES)if(PLATE_STYLES[id].era===era)return mergeTokens(VOICES.atlas||{},VOICES[id]||{});
  return null;
}
// A chart's note, for its card in the collection. A note that opens on the chart's own name ("Io: …") drops
// it there, since the card is already headed with that name, and starts the sentence left over as one.
function centuryChartNote(era,i,name=''){
  const words=centuryWords(era),note=(words&&words.chartNotes||[])[i]||'',cut=note.indexOf(': ');
  if(!(cut>0&&note.slice(0,cut).toUpperCase()===String(name).toUpperCase()))return note;
  const rest=note.slice(cut+2);return rest.charAt(0).toUpperCase()+rest.slice(1);
}
// The curator's lines, one to a chapter, each with whether a run has reached it: read off the century's log,
// whose bestRow is counted in the same rows (eraRow) that set the line on the sheet. The atlas keeps no such
// log; its ledger keeps the deepest chapter a run has reached (1–4, nought for none) instead.
function centuryAnnals(era){
  const words=centuryWords(era),lines=words&&words.chapterLines;
  if(!lines||!lines.length)return [];
  const log=era===5?null:eraLog(era),rows=words.chapterRows||8;
  return lines.map((line,i)=>({
    head:fmt(words.chapterSaid,{numeral:numerals[i],name:(words.chapters||[])[i]||''}).replace(/\.$/,''),
    line,row:i*rows,reached:log?log.runs>0&&log.bestRow>=i*rows:i<ledger.deepestChapter
  }));
}
// ---------- Each century's signature feat ----------
// JOURNEY.md §1.5 and §9, as the author settled them: every century has one curated milestone of its own
// beside the chapters its knowledge opens, a feat drawn from that century's own mechanic, and a Journey run
// does not leave the century until it has been flown there. Each one is read off events the simulation
// already emits, and each is owed by the chart: the note beside it names what the generator promises.
// Kept on the Journey's document as `milestones['sig'+era]`, which a restart clears with the rest.
// `why` is the half-sentence of history the feat is named for, set on the century's Record beside it
// (docs/KNOWLEDGE-AUDIT.md, §3.1): `describe` says what to fly, `why` what flying it stands for — and where
// the mechanic is a game's shorthand for the real thing, as the Flyby's lap is for a gravity assist, says so.
let sigRun={held:null,schools:[],rescues:0};
const SIGNATURES={
  // A sling body is dealt at row 2 and every eighth row after 7, always at radius 57, which the wall's naked
  // eye always sorts as major: a doubled ring is on the wall within eight rows of anywhere.
  1:{name:'THE STRUCK RING',describe:'Hold one of the brightest lights, a doubled ring, for a whole orbit',
    why:'Rings pecked round a hollow are among the commonest marks on later prehistoric rock. Some read them as lights in the sky; no one knows.',
    test:(type,e)=>type==='release'&&sigRun.held&&rockTier(sigRun.held)==='major'&&sigRun.held.documented>=1},
  // One ordinary body in every watch of the night is a wanderer carried in its barque (ceilingWanderer).
  2:{name:'THOSE WHO KNOW NO REST',describe:'Land on a wandering star carried in its barque',
    why:'Some read the Egyptians’ unwearying stars as the planets: Senenmut’s ceiling sails four of them in barques, and leaves out Mars.',
    test:(type,e)=>type==='capture'&&typeof ceilingWanderer==='function'&&ceilingWanderer(e.n)},
  // A body's school is its row taken in threes, so any three rows running carry all three schools.
  3:{name:'THE THREE SCHOOLS',describe:'Land three perfect transfers in a row on the three schools, Gan, Shi and Wu Xian',
    why:'The old star lists were credited to three astronomers, Gan De, Shi Shen and Wu Xian; the Dunhuang chart tells their stars apart by colour.',
    test:(type,e)=>{
      if(type!=='capture')return false;
      if(!e.perfect){sigRun.schools=[];return false;}
      sigRun.schools=[...sigRun.schools,scrollSchool(e.n)].slice(-3);
      return new Set(sigRun.schools).size===3;
    }},
  // One wanderer is set on a plain row of every chapter after the first (astroWanderer).
  4:{name:'A WANDERER SIGHTED',describe:'Land on the wandering star of a chapter',
    why:'The Arabic kawkab sayyar, like the Greek planetes, means a star that wanders; the zijes tabled where each of the five would stand.',
    test:(type,e)=>type==='capture'&&astroWanderer(e.n)!==-1},
  // A figure forks off every eighth row.
  5:{name:'LINEA PURA',describe:'Reach all three stars of a constellation in perfect transfers',
    why:'Copperplate made a chart repeatable: every impression of Bayer’s plates set the same stars in the same places, line for line.',
    test:(type,e)=>type==='observation'&&e.key==='pureChart'},
  // The registers change at fixed rows counted from where the Lens began. One charge spent to save the sitting
  // is forgiven, since a rough hand spends one in most sittings long enough to reach the sensor; a second is
  // not (MEASUREMENTS.md, "Linea Pura made fair").
  6:{name:'SATURN IN ONE SITTING',describe:'Carry one sitting from the eyepiece to the sensor with no more than one charge spent to save it',
    why:'Saturn was seen in stages: Galileo’s handles in 1610, Huygens’s ring in 1659, Cassini’s gap in 1675, and the rings’ fine weave from space.',
    test:(type,e)=>{
      if(type==='shieldBreak'||type==='dawnBreak'||type==='reflectorBreak')sigRun.rescues++;
      return type==='transition'&&e.index===1&&sigRun.rescues<=1;
    }},
  // A sling body at row 2 and every eighth row after 7, as on every sheet.
  7:{name:'GRAVITY ASSIST',describe:'Leave a gravity well on a full lap, at full charge',
    why:'A real assist is one pass, not a lap: the craft borrows the planet’s own motion round the Sun. Mariner 10 swung past Venus to Mercury in 1974.',
    test:(type,e)=>type==='release'&&e.sling&&e.charge>=1},
  // The bill is sized so a steady run meets closure in its middle phases, and never stalls (probe.js).
  8:{name:'CLOSURE',describe:'Launch the first daughter probe',
    why:'Closure is the 1980 NASA study’s word for a factory that can make all of its own parts; von Neumann had shown on paper that a machine could copy itself.',
    test:()=>typeof prbState!=='undefined'&&prbState&&prbState.gen>=2}
};
// Heard from every simulation event (ui.js). Returns the signature this event flew, or null.
function signatureEvent(type,e){
  if(type==='start'||type==='eraTransition'){sigRun={held:null,schools:[],rescues:0};return null;}
  const era=journeyEraOf(),sig=SIGNATURES[era];
  if(!sig)return null;
  let flown=false;
  try{flown=!!sig.test(type,e||{});}catch(_){flown=false;}
  if(type==='capture')sigRun.held=e&&e.n||null;
  return flown&&journeySign(era)?sig:null;
}
