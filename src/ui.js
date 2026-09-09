'use strict';
/* Orbit · src/ui.js
   Presentation, storage, viewport, screens, the single gameplay input, and bootstrap. */
// ---------- Presentation, storage, viewport, and the single gameplay input ----------
// Every ripple, ring and blot carries its own seed so the burin cuts each one differently.
let ringSeq=0;const ringSeed=()=>(ringSeq=(ringSeq+9781)>>>0)||1;
let eraReturn=null;
let replayLog=null;
// The atlas's own vocabulary — what a plain run of the printed star chart calls things, in its
// own words. A plate cut for another century registers its own defineVoice() and replaces only the
// entries it renames (see plateWords()/spoken() in src/plates.js); anything it leaves out is still
// read from here, which is why an empty map or a blank string below is itself a meaningful entry.
defineVoice('atlas',{
  chart:'',
  chartNoun:'constellation',
  chartSaid:'{chart} complete. Sixty bonus points. Darkness retreats for four seconds.',
  observations:{},
  pressures:DIFFICULTY_LABELS,
  pressureSet:'PRESSURE SET · {label}',
  losses:{},
  opening:'Game started. Tap to release. Skim an orbit for a perfect transfer. Circle slingshot stars to gain speed and to fill the nib. Every flight spends ink by the distance flown; hold an orbit to re-charge it.',
  ended:'Run complete. Score {score}. Best {best}. Tap to try again.',
  unrecorded:'',
  hud:{pace:'SPEED ×',flow:'FLOW ×',shield:POWERUP_LABELS.shield+' ARMED',reflector:POWERUP_LABELS.reflector+' ARMED',dawn:POWERUP_LABELS.dawn+' ARMED'},
  chrome:{brand:'ORBIT',bestLabel:'Best',endTitle:'One more orbit.',pauseTitle:'Suspended.',pauseEyebrow:'THE PRESS STANDS IDLE',pauseNote:'Tap the sheet to continue',pauseResume:'TAKE UP THE PEN',pauseLeave:'RETURN TO THE FRONTISPIECE',pauseLabel:'Pause the run',gameLabel:'Orbit arcade game',canvasLabel:'Orbit. Tap or press Space to start. While orbiting, tap to release toward the next node.'},
  tips:{first:'Release when the pricked line reaches the next orbit.',dark:'Circle a slingshot star to gain speed. The dark grows faster.',faded:'Copper orbits fade. Release before the ring runs out.',vortex:'Close flybys bend your path. Follow the curved guide and leave room for the dark eye.',angle:'Skim the orbit’s rim for a perfect transfer.',speed:'Perfect transfers keep your speed. Faster earns more points.'},
  chapters,
  chapterSaid:'Plate {numeral}. {name}.',
  held:{choose:'Aim for TIRO, ADEPTUS, or MAGISTER — your first orbit sets the pressure.',dry:'The nib is running dry. Hold this orbit to re-charge it, or find a star.',sling:'One lap builds speed. Tap sooner for less. Perfect landings keep it.',release:'Tap when the pricked line skims the next orbit’s rim.',bend:'Vortices bend your flight. Follow the curve; give the dark eye room.'}
});
// Everything the run has to say is written onto the chart itself, beside whatever it is about: see
// src/inscriptions.js. `where` names the subject — a planet or star to follow, or the point on the sheet
// the thing happened at — and the note is set clear of it and left as ink for the chart to carry away.
function say(text,where){
  return inscribe(text,where);
}
function event(type,e){
  if(type==='start'){audio.start();if(replayLog)replayLog.startedAt=world.time;return;}
  if(type==='release'){
    audio.release();burst(e.x,e.y,8,'gold',.4);rings.push({x:e.x,y:e.y,start:4,distance:25,age:0,life:.32,alpha:.45,seed:ringSeed()});
    // The departure is surveyed on the orbit just left, and stays on the sheet as dried ink.
    recordDeparture(e);
    rings.push({kind:'blot',x:e.x,y:e.y,size:1.5+e.charge*1.5,age:0,life:1.5,alpha:.6,seed:ringSeed()});
    if(e.sling&&e.charge>.15){
      audio.tone(155,.45,0,.25,'sine',230+e.charge*200);
      if(!reducedMotion){burst(e.x,e.y,Math.round(8+e.charge*12),'gold',.9);rings.push({x:e.x,y:e.y,start:5,distance:55,age:0,life:.5,alpha:.42,seed:ringSeed()});}
      say('SLINGSHOT · SPEED ×'+e.factor.toFixed(1),{x:e.x,y:e.y});
    }
  }else if(type==='charged'){
    // The trail ladder counts the star's own band filling, which every charged event means by
    // definition; gating it on e.max instead asked for the chart's absolute top speed, a bar a
    // hand loses the moment its release is a frame late, and the ladder's chalk-to-gold-leaf
    // reading of common-to-rare needs its first rung reachable the way a full charge already is.
    tally('maxSpeedSlings');
    audio.tone(392,.65,0,.16);audio.tone(587.33,.65,.12,.12);say(e.max?'MAX SPEED · FIND YOUR LINE':'FULL CHARGE · SPEED IS YOURS',{node:world.player.node});
  }else if(type==='capture'){
    tally('captures');if(e.perfect)tally('perfects');if(e.steep)tally('badAngles');
    // The landing is surveyed where the flight met the ring; a square is answered with two short tones.
    recordLanding(e);
    if(e.steep){
      // A rough impression still earns its base; the duller strike and displaced colour carry the
      // cost now, while the score floater makes the continuous angle progression explicit.
      audio.tone(196,.35,0,.2,'triangle',150);audio.brush(700,.18);burst(e.x,e.y,6,'red',.4);
    }else{
      audio.capture(e.n.row,e.perfect);burst(e.x,e.y,e.perfect?12:6,'gold',.5);
      if(e.square){audio.tone(880,.3,.02,.12);audio.tone(1174.66,.3,.11,.1);}
    }
    floaters.push({x:e.n.x,y:e.n.y-e.n.r-17,text:'+'+e.gain+(e.angleBonus?'  ·  ANGLE +'+e.angleBonus:'')+(e.scoreMultiplier>=1.05?'  ·  ×'+e.scoreMultiplier.toFixed(1):''),age:0});screenFlash=e.perfect?.28:0;
    rings.push({kind:'capture',node:e.n,x:e.n.x,y:e.n.y,start:e.n.r+2,distance:e.perfect?18:11,angle:Math.atan2(e.y-e.n.y,e.x-e.n.x),perfect:e.perfect,age:0,life:e.perfect?.85:.55,alpha:e.perfect?.86:.56,seed:ringSeed()});
    // The landing is announced on the orbit it was made on, so the note travels with that planet.
    const at={node:e.n};
    if(e.steep)say('ROUGH IMPRESSION · BASE '+(e.gain-e.skipBonus),at);
    else if(e.skip)say(e.skipped+' ORBIT'+(e.skipped===1?'':'S')+' SKIPPED · +'+e.skipBonus,at);
    else if(e.n.routeRole==='entry')say('TRACE 3 STARS · +60 & A REPRIEVE',at);
    else if(e.n.type==='sling')say('ORBIT TO GAIN SPEED · TAP TO LEAVE',at);
    else if(e.n.type==='fading')say('FADING ORBIT · KEEP MOVING',at);
    else if(e.n.type==='gold')say('GOLDEN DETOUR',at);
    else if(e.square)say('RIGHT ANGLE · +'+e.squareBonus,at);
    else if(e.perfect)say(e.combo>=3?'PERFECT · FLOW ×'+e.combo:'PERFECT · MOMENTUM KEPT',at);
    else if(e.n.type==='drift'&&e.n.row<10)say('A WANDERING ORBIT',at);
    recordBest(world.score);
  }else if(type==='chartProgress'){
    say((plateWords().chart||e.chart.name)+' · '+e.count+' / 3',{node:e.chart.stars[e.count-1]||world.player.node});
    audio.tone(e.count===1?523.25:659.25,.6,.1,.13);
  }else if(type==='constellation'){
    tallyMap('constellations',e.chart.name);
    say((plateWords().chart||e.chart.name)+' · COMPLETE +60',{node:e.chart.stars[1]||e.chart.entry});
    for(const n of e.chart.stars){
      if(!reducedMotion){burst(n.x,n.y,9,'gold',.5);rings.push({x:n.x,y:n.y,start:n.r,distance:35,age:0,life:1.3,alpha:.5,seed:ringSeed()});}
    }
    audio.medal();
    $('announcement').textContent=spoken('chartSaid',{chart:e.chart.name});
    recordBest(world.score);
  }else if(type==='shield'){
    audio.tone(660,.4,0,.22,'sine',880);burst(e.x,e.y,10,'blue',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(POWERUP_LABELS.shield+' ARMED · SURVIVES ONE VORTEX',{x:e.x,y:e.y});
  }else if(type==='shieldBreak'){
    tally('shieldsSpent');
    audio.tone(180,.5,0,.3,'triangle',90);audio.brush(900,.3);
    burst(e.x,e.y,20,'blue',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6,seed:ringSeed()});
    say(POWERUP_LABELS.shield+' ABSORBED THE IMPACT',{x:e.x,y:e.y});
  }else if(type==='reflector'){
    audio.tone(740,.4,0,.22,'sine',920);burst(e.x,e.y,10,'violet',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(POWERUP_LABELS.reflector+' ARMED · TURNS BACK THE EDGE',{x:e.x,y:e.y});
  }else if(type==='reflectorBreak'){
    tally('reflectorsSpent');
    audio.tone(210,.5,0,.3,'triangle',105);audio.brush(900,.3);
    burst(e.x,e.y,20,'violet',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6,seed:ringSeed()});
    say(POWERUP_LABELS.reflector+' THREW YOU BACK',{x:e.x,y:e.y});
  }else if(type==='dawn'){
    audio.tone(587.33,.45,0,.2,'sine',784);audio.tone(880,.45,.13,.14);burst(e.x,e.y,10,'gold',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(POWERUP_LABELS.dawn+' ARMED · TURNS BACK THE DARK',{x:e.x,y:e.y});
  }else if(type==='dawnBreak'){
    tally('dawnsSpent');
    // The flood going back down the sheet is the constellation reprieve's own event, so it is answered in
    // the same register: a rising pair rather than the dull note a spent shield or reflector takes.
    audio.tone(392,.6,0,.22);audio.tone(659.25,.6,.14,.18);audio.brush(1200,.25);
    burst(e.x,e.y,24,'gold',1);rings.push({x:e.x,y:e.y,start:4,distance:70,age:0,life:.7,alpha:.6,seed:ringSeed()});
    say(POWERUP_LABELS.dawn+' DROVE THE DARK BACK',{x:e.x,y:e.y});
  }else if(type==='inkwell'){
    tally('inkwellsFound');
    audio.tone(523.25,.5,0,.16);audio.tone(659.25,.5,.12,.14);
    burst(e.x,e.y,14,'gold',.7);rings.push({x:e.x,y:e.y,start:4,distance:40,age:0,life:.6,alpha:.5,seed:ringSeed()});
    say('A RECKLESS LINE · A NEW COLOUR TAKES',{x:e.x,y:e.y});
  }else if(type==='inkwellDry'){
    audio.tone(220,.3,0,.18,'triangle',160);burst(e.x,e.y,5,'red',.3);
    say('THE WELL RUNS DRY · FLY RECKLESS FIRST',{x:e.x,y:e.y});
  }else if(type==='observation'){
    tallyMap('observations',e.key);
    say('OBSERVATION · '+(plateWords().observations[e.key]||e.latin));
    audio.tone(587.33,.5,0,.15);audio.tone(880,.5,.15,.13);
  }else if(type==='near'){
    tally('grazes');
    audio.tone(698.46,.28,0,.16);floaters.push({x:e.x,y:e.y-20,text:'CLOSE +5',age:0});
    recordBest(world.score);
  }else if(type==='death'){
    audio.death();
    if(e.reason==='LEFT THE STAR CHART'){
      // Run off the side and the hand jitters: the nib skids off the sheet and spills, rather than
      // bursting. The kill boundary sits 16 units past the visible edge, so the splat sits at the
      // actual point the player left by, only capped to just inside the visible edge in case that
      // point landed further out than the sheet ever drew.
      const dir=e.x>=0?1:-1,edgeX=dir*Math.min(Math.abs(e.x),Math.max(0,world.width/2-8));
      rings.push({kind:'splat',x:edgeX,y:e.y,dir,size:24,age:0,life:1.8,alpha:.72,seed:ringSeed()});
    }else{
      burst(e.x,e.y,56,'gold',1.4);burst(e.x,e.y,24,'red',.7);
      rings.push({x:e.x,y:e.y,start:3,distance:115,age:0,life:1.2,alpha:.6,seed:ringSeed()});
    }
    screenFlash=1;
    // The sheet is wiped of everything the run was saying: the colophon is a leaf of its own.
    clearInscriptions();
  }else if(type==='difficulty'){
    setDifficulty(e.value);
    audio.tone(440,.3,0,.15);say(spoken('pressureSet',{label:plateWords().pressures[e.value]}));
  }
}
function newWorld(){
  reveal.reset();glyphs.clear();trailSampledAt=-1;particles=[];rings=[];floaters=[];clearInscriptions();lastScore=-1;lastChapter=-1;deathShown=false;screenFlash=0;accumulator=0;
  regionBlend=0;darknessRelief=0;chapterReveal={index:0,age:5};
  recordAtStart=currentBest();resetRunTally();world=new OrbitWorld(dailyOn?dailySeed:++runSeed,W/scale,H/scale,event,!dailyOn,dailyOn);
  // The four pressure multipliers are left at OrbitWorld's own defaults here, not set from the last
  // remembered pressure: an ordinary run's own pressure is not yet chosen at this point, only decided
  // once one of the three opening targets is captured, and that capture already sets all four itself
  // through the same 'difficulty' event replayRun() answers the same way. Setting them here too raced
  // that event — a run remembered at Tiro or Magister flew its opening leg, before the choice, on the
  // wrong ink cost, a discrepancy replayRun() never reproduces, since it always starts a plate at these
  // same defaults and waits for the identical event. The daily plate loses nothing: it offers no choice,
  // and activeDifficulty() already reads 'classic' for it, the same values these defaults already hold.
  $('copy-score').textContent='COPY SCORE';
  ambience={random:seeded(world.seed^0x5c8a21),wait:7,event:null,sequence:0};
  // A chart's whole course reduces to one thing repeated: when the traveller released. Kept here as
  // world.time — the sim's own clock, immune to real time and frame jitter — so the plate can later be
  // flown again from nothing but its seed and this list. startedAt defaults to 0 (an immediate start)
  // and is corrected the moment 'start' actually fires (event(), below): the sim clock ticks on while
  // the traveller is still reading the frontispiece, so a run that sat a while before its first tap
  // logs every release well after world.time zero, and the replay has to sit through that same idle
  // stretch rather than starting cold at the first release's own timestamp.
  replayLog={seed:world.seed,width:world.width,height:world.height,offerDifficulty:!dailyOn,varyOpening:dailyOn,startedAt:0,releases:[],resizes:[]};
}
function resetToFrontispiece(){
  game.classList.remove('playing','over','cataloguing');$('intro').classList.remove('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  syncLastReviewButton();syncPauseControl();
}
function syncEraChrome(){
  // Everything here is a plate's own name for a fixture the atlas also has; the fixture stays where
  // it is, and only the words on it change. The entry button is the one exception even to that: what
  // it says depends on a capability (whether the standing plate is itself a mode, not on which one).
  const chrome=plateWords().chrome;
  // Each century that has a door on the frontispiece names it on its own row in PLATE_STYLES, so a
  // third era is a button in the markup and that row, rather than another label written out here. The
  // doors stand on the atlas's sheet only; from inside a century the way back is the exit, which is
  // the same door out of all of them.
  for(const id in PLATE_STYLES){
    const door=PLATE_STYLES[id].door;if(!door)continue;
    const button=$(door.button);if(button)button.textContent=door.label;
  }
  const brand=$('brand');if(brand)brand.textContent=chrome.brand;
  const bestLabel=$('best-label');if(bestLabel)bestLabel.textContent=chrome.bestLabel;
  const endTitle=$('end-title');if(endTitle)endTitle.textContent=chrome.endTitle;
  const pauseTitle=$('pause-title');if(pauseTitle)pauseTitle.textContent=chrome.pauseTitle;
  const pauseEyebrow=$('pause-eyebrow');if(pauseEyebrow)pauseEyebrow.textContent=chrome.pauseEyebrow;
  const pauseNote=$('pause-note');if(pauseNote)pauseNote.textContent=chrome.pauseNote;
  const pauseResume=$('pause-resume');if(pauseResume)pauseResume.textContent=chrome.pauseResume;
  const pauseLeave=$('pause-leave');if(pauseLeave)pauseLeave.textContent=chrome.pauseLeave;
  syncPauseControl();
  game.setAttribute('aria-label',chrome.gameLabel);
  canvas.setAttribute('aria-label',chrome.canvasLabel);
}
// A century is entered by putting its plate on the press, and left by putting back whatever plate was
// on it before. What the daily is doing is set aside on the way in and restored on the way out,
// because a century is not a day of the atlas's own almanac. A plate that has something to wait for
// before its sheet can be painted — a face still loading, say — names a `ready` painter and it is
// called last, once there is something on screen to repaint.
function enterEra(name){
  if(plateOwns('mode')){leaveEra();return;}
  if(world&&world.state==='playing')return;
  if(!PLATES[name])return;
  eraReturn={plate:plateName,dailyOn,dailyDay,dailyReplay,difficulty};
  dailyOn=false;dailyReplay=false;dailyDay=utcDay();dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  applyPlate(name);invalidateArt();syncPlate();syncDaily();newWorld();resetToFrontispiece();syncEraChrome();render(0);
  const ready=handFor('ready');if(ready)ready();
}
function leaveEra(){
  if(!plateOwns('mode'))return;
  const keep=eraReturn||{};
  difficulty=keep.difficulty&&DARKNESS_MULT[keep.difficulty]?keep.difficulty:difficulty;
  dailyOn=!!keep.dailyOn;dailyDay=dailyOn&&dailyOpen(keep.dailyDay)?keep.dailyDay:utcDay();dailyReplay=dailyOn&&dailyDay!==utcDay();dailySeed=dayStamp(dailyDay);dailyBest=readDailyBest();
  // A daily returned to asks its own showcase again — freshly, in case the day turned over while the
  // era held the press — rather than trusting the plate snapshotted on the way in; anything else puts
  // back whatever plate was standing before the era, or night if that was itself another mode's own.
  const kept=keep.plate&&PLATES[keep.plate]&&!(PLATE_STYLES[keep.plate]&&PLATE_STYLES[keep.plate].can&&PLATE_STYLES[keep.plate].can.mode);
  const restore=dailyPressPlate()||(kept?keep.plate:'night');
  applyPlate(restore);eraReturn=null;invalidateArt();syncPlate();syncDaily();newWorld();resetToFrontispiece();syncEraChrome();render(0);
}
function setPlaying(){
  // A daily plate is entered in the log the moment its run begins, and only while it is the current
  // day's: that entry is the whole of what opens a past plate to be drawn again.
  noteDailyPlay();
  game.classList.add('playing');game.classList.remove('over');$('intro').classList.add('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  clearInscriptions();
  $('announcement').textContent=plateWords().opening;
  chapterReveal={index:0,age:0};
}
function showEnd(){
  const preview=plateOwns('score');deathShown=true;game.classList.remove('playing');game.classList.add('over');$('end').classList.remove('hidden');
  $('end-score').textContent=world.score;$('end-reason').textContent=plateWords().losses[world.reason]||world.reason;
  $('record').textContent=preview?plateWords().unrecorded:world.score>recordAtStart?'A NEW RECORD':'BEST '+currentBest();
  $('end-captures').textContent=world.captures;$('end-perfects').textContent=world.perfects;$('end-flow').textContent=world.maxCombo+'×';
  const row=Math.floor(world.progress),newRow=!preview&&row>bestRow;
  if(newRow){bestRow=row;storage.set('orbit.bestRow.v1',bestRow);}
  $('end-row').textContent=row;$('end-row-note').textContent=newRow?'BEST ROW '+bestRow:'';
  const charts=world.constellationsCompleted;
  $('end-constellations').textContent=charts+' '+plateWords().chartNoun+(charts===1?'':'s')+' traced';
  $('end-observations').textContent=world.observations.map(o=>plateWords().observations[o.key]||o.latin).join(', ');
  $('end-daily').textContent=dailyOn?dailyLabel():'';
  // The run is folded into the ledger here, and anything the catalogue has just granted is named on
  // the colophon and announced once.
  const fresh=preview?[]:[...pendingUnlocks,...ledgerCommit()];pendingUnlocks=[];
  const names=fresh.map(id=>UNLOCK_BY_ID[id]&&UNLOCK_BY_ID[id].name).filter(Boolean);
  $('end-unlocked').textContent=names.length?'NEW IN THE CATALOGUE \u00b7 '+names.join(' \u00b7 '):'';
  if(names.length){audio.tone(523.25,.7,0,.14);audio.tone(783.99,.7,.16,.12);}
  syncCatalogueMarks();
  syncImpressumScreen();
  // Saved regardless of preview: the plate itself was really drawn, whether or not its score was
  // the kind the ledger keeps. Eras I and II are their own doors, outside review entirely.
  if(eraId()===0)saveLastReplay(replayLog,{score:world.score,row,reason:world.reason,capturedAt:Date.now()});
  // Which situation the run ended in, in the same precedence the atlas always checked it in; a plate
  // that gives several of these the same line (the Ceiling gives four of the six one shared sentence)
  // still reads correctly, since only the chosen key's text is ever read. The old inline ternary this
  // replaced also carried 'Circle a slingshot star to gain speed. The wall breaks away faster.' for
  // this same dark-tip case, but nested inside the branch that only runs once the plate is already
  // known not to be the Ceiling — so the era's own wording was written but never once reached, and is
  // recorded here rather than silently dropped with the ternary that could never read it.
  const tip=world.captures===0?'first':world.reason==='THE DARK CAUGHT UP'?'dark':world.reason==='THE ORBIT FADED'?'faded':world.reason==='DRAWN INTO A VORTEX'?'vortex':world.perfects<2?'angle':'speed';
  $('end-tip').textContent=plateWords().tips[tip];
  $('announcement').textContent=spoken('ended',{score:world.score,best:best});
}
// ---------- The catalogue: the ledger's own leaf ----------
// A ruled library-catalogue page over the plate. It lists what the ledger has recorded and, under it,
// every cosmetic the atlas can be printed with: the ones that have been earned are selectable, the
// rest are blank rules with their condition beside them. Nothing here touches the simulation, and the
// button that opens it is only on the plate when no run is in progress.
let pendingUnlocks=[],catalogueOpen=false,catalogueTab='record';
const commas=n=>Math.round(Number(n)||0).toLocaleString('en-US');
function chartTime(seconds){
  const total=Math.max(0,Math.round(Number(seconds)||0)),h=Math.floor(total/3600),m=Math.floor(total%3600/60);
  return h?h+'h '+m+'m':m?m+'m':total+'s';
}
const plainText=value=>String(value??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
// Chapter numbers are printed the way the running head and the plate reveal already print them — a
// roman numeral beside the chapter's own name (see `numerals`/`chapters` in src/plates.js) — rather
// than a bare digit. ledger.deepestChapter and ledger.deepestHardcoreChapter are stored 1-4, or 0 for
// a ledger that has never yet folded in a finished run.
function chapterLabel(value){
  const n=Math.max(0,Math.min(chapters.length,Math.round(Number(value)||0)));
  return n?numerals[n-1]+' · '+chapters[n-1]:'—';
}
// The atlas's eight named feats, in the order src/simulation.js's OBSERVATIONS lists them, paired with
// the Latin caption the sheet inscribes when each first fires — must keep matching the medal entries
// of the same name in src/ledger.js's UNLOCKS.
const OBSERVATION_LABELS=[['perfectThree','Tres Perfecti'],['skipFive','Saltus Quinque'],['maxSpeed','Velocitas Summa'],
  ['graze','Periculum'],['pureChart','Linea Pura'],['fortyRows','Altitudo'],['threeMinutes','Vigilia'],['rightAngle','Angulus Rectus']];
function catalogueTable(){
  const rows=[
    ['Orbits captured',commas(ledger.captures)],
    ['Perfect transfers',commas(ledger.perfects)],
    ['Constellations traced',commas(ledgerStat('constellations'))],
    ['Highest row',commas(ledger.bestRow)],
    ['Runs',commas(ledgerStat('runs'))],
    ['Time in the chart',chartTime(ledger.playSeconds)]
  ];
  return '<table class="ledger-table"><tbody>'+
    rows.map(([label,value])=>`<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('')+
    '</tbody></table>';
}
function catalogueOverview(){
  const total=UNLOCKS.length,earned=unlockedIds().size,percent=total?Math.round(earned/total*100):100;
  const locked=UNLOCKS.filter(entry=>!isUnlocked(entry.id));
  const next=locked.map(entry=>({entry,progress:unlockProgress(entry)}))
    .filter(item=>item.progress).sort((a,b)=>a.progress.value/a.progress.threshold-b.progress.value/b.progress.threshold)[0];
  const nextText=next?next.entry.describe():locked.length?'Complete a named feat':'The catalogue is complete';
  const nextProgress=next?commas(Math.min(next.progress.value,next.progress.threshold))+' / '+commas(next.progress.threshold):locked.length?'SPECIAL':commas(total)+' / '+commas(total);
  return '<div class="cat-overview">'+
    '<div class="cat-overview-seal"><strong>'+earned+'</strong><span>/ '+total+'</span></div>'+
    '<div class="cat-overview-copy"><span class="cat-overview-kicker">THE STUDIOLO · '+percent+'%</span>'+
      '<strong>'+plainText(nextText)+'</strong>'+
      '<span class="cat-overview-progress">NEXT · '+nextProgress+'</span>'+
      '<span class="cat-progress-rule"><i style="width:'+percent+'%"></i></span></div>'+
    '</div>';
}
function recordOverview(){
  return '<div class="record-overview">'+
    '<div class="record-stat"><strong>'+commas(unlockedIds().size)+' / '+UNLOCKS.length+'</strong><span>Unlocks</span></div>'+
    '<div class="record-stat"><strong>'+commas(ledgerStat('constellations'))+' / '+CONSTELLATIONS.length+'</strong><span>Routes traced</span></div>'+
    '<div class="record-stat"><strong>'+commas(ledger.bestRow)+'</strong><span>Highest row</span></div>'+
    '<div class="record-stat"><strong>'+commas(ledger.bestFlow)+'×</strong><span>Best flow</span></div>'+
    '</div>';
}
// The score and the run count the ledger holds for each pressure, TIRO through MAGISTER, beside the
// daily plate's own tally under its own name.
function pressureTable(){
  const rows=[['relaxed',DIFFICULTY_LABELS.relaxed],['classic',DIFFICULTY_LABELS.classic],
    ['hardcore',DIFFICULTY_LABELS.hardcore],['daily','Tabula diei']];
  return '<table class="ledger-table"><tbody>'+
    rows.map(([key,label])=>`<tr><th scope="row">${plainText(label)}</th><td>${commas(ledger.personalBests[key]||0)} best · ${commas(ledger.runs[key]||0)} runs</td></tr>`).join('')+
    '</tbody></table>';
}
// The fuller record: the original six lifetime figures the catalogue has always shown, then every
// other stat the ledger keeps that otherwise never surfaces anywhere in the UI on its own — some of
// it only ever leaking out as a locked cosmetic's "progress toward" text, and only until that rule is
// unlocked and the text disappears for good.
function catalogueRecord(){
  const streak=typeof dailyStreak==='function'?dailyStreak():{current:0,longest:0};
  const rows=[
    ['Best flow',commas(ledger.bestFlow)+'×'],
    ['Deepest chapter reached',chapterLabel(ledger.deepestChapter)],
    ['Deepest chapter at '+DIFFICULTY_LABELS.hardcore+' pressure',chapterLabel(ledger.deepestHardcoreChapter)],
    ['Vortices grazed',commas(ledger.grazes)],
    [POWERUP_LABELS.shield+' spent',commas(ledger.shieldsSpent)],
    [POWERUP_LABELS.reflector+' spent',commas(ledger.reflectorsSpent)],
    [POWERUP_LABELS.dawn+' spent',commas(ledger.dawnsSpent)],
    ['Slingshots left at full charge',commas(ledger.maxSpeedSlings)],
    ['Inkwells filled on a streak',commas(ledger.inkwellsFound)],
    ['Rough impressions',commas(ledger.badAngles)],
    ['Daily streak',commas(streak.current)+' day'+(streak.current===1?'':'s')+' · best '+commas(streak.longest)]
  ];
  let html=recordOverview()+catalogueTable()+'<table class="ledger-table"><tbody>'+
    rows.map(([label,value])=>`<tr><th scope="row">${label}</th><td>${value}</td></tr>`).join('')+
    '</tbody></table>';
  html+='<section class="cat-group"><h3>By pressure<span class="cat-latin">Pondera</span></h3>'+pressureTable()+'</section>';
  html+='<section class="cat-group"><h3>Feats achieved<span class="cat-latin">Insignia</span></h3><table class="ledger-table"><tbody>'+
    OBSERVATION_LABELS.map(([key,latin])=>`<tr><th scope="row">${plainText(latin)}</th><td>${commas(ledger.observations[key]||0)}</td></tr>`).join('')+
    '</tbody></table></section>';
  html+='<section class="cat-group"><h3>Constellations<span class="cat-latin">Asterismi</span></h3><table class="ledger-table"><tbody>'+
    CONSTELLATIONS.map(c=>`<tr><th scope="row">${plainText(c.name)}</th><td>${commas(ledger.constellations[c.name]||0)}</td></tr>`).join('')+
    '</tbody></table></section>';
  return html;
}
// ---------- The catalogue's engraved previews ----------
// Every card shows the thing itself rather than a stand-in character. These were single Unicode
// dingbats before, set in the plate's own face — and a face that was never cut for a nib or a comet
// falls through to whatever the device keeps for them, which on a phone is the colour emoji font: a
// glossy pen and a cartoon comet, laid on an engraved plate. They are cut here instead, in the
// vocabulary of the marks they stand for, as inline SVG over a 120×72 field held inside the middle of
// the window so its own rules still read around the drawing. Everything strokes in currentColor — the
// plate's gold — except the two kinds that are themselves about colour: a plate prints as a swatch of
// its own ground, ink and gold, and a trail ink is laid in the very ink it would letter a run in.
const ART_FIELD='0 0 120 72',ART_GROUND='rgb(var(--veil))';
const artRound=n=>Math.round(n*10)/10;
const artRgb=v=>'rgb('+(Array.isArray(v)?v.join(','):v)+')';
const artLine=(d,w=1.1,a=1,c='',extra='')=>'<path d="'+d+'"'+(c?' stroke="'+c+'"':'')+' stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+extra+'/>';
const artFill=(d,a=1,c='')=>'<path d="'+d+'" stroke="none" fill="'+(c||'currentColor')+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
const artDot=(x,y,r,a=1,c='')=>'<circle cx="'+artRound(x)+'" cy="'+artRound(y)+'" r="'+artRound(r)+'" stroke="none" fill="'+(c||'currentColor')+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
const artRing=(x,y,r,w=1.1,a=1,c='')=>'<circle cx="'+artRound(x)+'" cy="'+artRound(y)+'" r="'+artRound(r)+'"'+(c?' stroke="'+c+'"':'')+' stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+'/>';
// Arcs, stars and spirals are cut rather than typed out: a ring of beads, a compass rose and a
// vortex are all far shorter as a loop than as path data, and stay true when a size is changed.
function artArc(cx,cy,r,from,to){
  const x0=cx+Math.cos(from)*r,y0=cy+Math.sin(from)*r,x1=cx+Math.cos(to)*r,y1=cy+Math.sin(to)*r;
  return 'M'+artRound(x0)+' '+artRound(y0)+'A'+artRound(r)+' '+artRound(r)+' 0 '+(Math.abs(to-from)>Math.PI?1:0)+' '+(to>from?1:0)+' '+artRound(x1)+' '+artRound(y1);
}
function artStar(cx,cy,points,outer,inner,turn=-Math.PI/2){
  let d='';
  for(let i=0;i<points*2;i++){
    const a=turn+i*Math.PI/points,r=i%2?inner:outer;
    d+=(i?'L':'M')+artRound(cx+Math.cos(a)*r)+' '+artRound(cy+Math.sin(a)*r);
  }
  return d+'Z';
}
function artSpiral(cx,cy,rFrom,rTo,from,to,steps=44){
  let d='';
  for(let i=0;i<=steps;i++){
    const u=i/steps,a=lerp(from,to,u),r=lerp(rFrom,rTo,u);
    d+=(i?'L':'M')+artRound(cx+Math.cos(a)*r)+' '+artRound(cy+Math.sin(a)*r);
  }
  return d;
}
// A plate is a colourway, so its card is a sheet of it: the plate's own ground under its own ink, with
// one orbit and one star of its own gold. Every derived plate has passed the base tokens through its
// transform already (see PLATE_STYLES in src/plates.js), so this reads eight sheets from one drawing.
function platePreview(id){
  const p=(PLATES[id]||PLATES.night).base,line=artRgb(p.ink),soft=artRgb(p.inkSoft),gold=artRgb(p.gold);
  return '<rect x="25" y="10" width="70" height="52" fill="'+p.paper+'" stroke="'+line+'" stroke-width="1.1"/>'+
    '<rect x="29" y="14" width="62" height="44" fill="none" stroke="'+soft+'" stroke-width=".6" opacity=".7"/>'+
    artRing(60,36,18,.7,.6,soft)+artRing(60,36,11,1,.85,line)+
    artFill(artStar(60,36,4,7.5,2.2),1,gold)+
    artDot(41,22,1.5,.9,line)+artDot(79,49,1.3,.85,line)+artDot(77,21,1.1,.7,soft)+artDot(43,49,1.2,.7,soft)+
    artLine('M33 55h11M87 17H76',.7,.55,soft);
}
// A trail ink is the one cosmetic that is nothing but colour, so its card is a stroke of it, and the
// whole life of one: the card lays the same line the pen lays, read back to front. The bead at the point
// and the wet leading half are the ink as it leaves the nib; the swelling body behind them is the same
// ink drying; and the thin tail it runs back to is the dried route the run's whole flight is printed in
// — which is a tone of its own, `path`, and the one most of the ink standing on a chart actually is (see
// drawTrail and drawInkPath in src/effects.js, which read these very tokens). Under all of it the wash
// the nib leaves in the paper, over it the dry-brush edge, and a blot where the stroke began. Every tone
// is the ink's own registered value on the plate now on the press; nothing here is a stand-in for one.
// The card prints them at close to full strength where the chart lays them thin and lets them fade, so
// it reads as a pigment swatch rather than as a screenshot of a stroke — which is what a catalogue of
// inks is for. The lay is one cubic; every segment below is cut from it, so they meet as one line.
function trailPreview(id){
  const pen=trailInk(id),lay='M26 55C46 48 68 29 94 14',dry=artRgb(pen.dry);
  return (pen.keyline?artLine(lay,5.4,.34,artRgb(pen.keyline)):'')+
    artLine(lay,9,.2,artRgb(pen.wash))+
    artLine('M26 55Q39.5 49.9 54.4 39.7',1.8,.8,artRgb(pen.path||ink.dark.pathInk))+
    artLine('M47.8 43.9Q68.8 29.7 94 14',3.2,.92,dry)+artLine('M57.8 37.5Q69.5 29.5 82.6 21',4.6,.92,dry)+
    artLine('M66 32Q79.2 22.8 94 14',3.4,1,artRgb(pen.wet))+
    artLine('M30 52C50 45 70 26 93 11',.7,.5,artRgb(pen.edge))+
    (pen.shimmer?artLine('M42 45C58 39 74 26 92 14',.6,.85,artRgb(pen.shimmer)):'')+
    artDot(95,13.5,3.4,1,artRgb(pen.wet));
}
// Where the stroke began, the card spills one — and that one is not drawn here at all. A splat is a
// seeded contour under five burin flicks and seven flung droplets, and reproducing any of that in path
// data would be a second copy of it to keep true; so the card carries a canvas at the same field the
// SVG is cut on, and `inkSplat` (src/effects.js) paints it, the very function the chart spills with, at
// the ink's own blotWet-to-blotDry mix and at its own alphas. What the card chooses is only the moment:
// SPLAT_LIFE is a seventh of the way in, which is exactly where the spill has finished spreading and
// has barely begun to dry, so the card shows an ink at its fullest body — .70 on the pool's own .85,
// against the .72 the chart peaks at. The spray is thrown left, out of the window and away from the
// stroke, and the seed is the ink's own name, so a card keeps one blot rather than a new one per pass.
const SPLAT_LIFE=.18,SPLAT_SIZE=11.5,SPLAT_AT=[25,57];
const splatSeed=id=>{let h=0x811c9dc5;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),0x01000193);return h>>>0;};
function paintCatalogueSplats(body){
  if(!body||!body.querySelectorAll)return;
  for(const c of body.querySelectorAll('canvas.cat-splat')){
    const w=c.clientWidth,h=c.clientHeight;
    if(!(w>0&&h>0)||!c.getContext)continue;
    c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
    const g=c.getContext('2d');if(!g)continue;
    // The same fit the SVG beside it is given, so the spill lands on the stroke's own start.
    const k=Math.min(w/120,h/72);
    g.setTransform(DPR,0,0,DPR,0,0);
    g.translate((w-120*k)/2,(h-72*k)/2);g.scale(k,k);
    g.translate(SPLAT_AT[0],SPLAT_AT[1]);
    g.lineCap='round';g.lineJoin='round';
    inkSplat(g,trailInk(c.getAttribute('data-ink')),SPLAT_LIFE,splatSeed(c.getAttribute('data-ink')||''),SPLAT_SIZE,.72,Math.PI,true);
  }
}
// The eight observer marks, cut as the pen cuts them in flight (see OBSERVER_MARKS in src/effects.js).
// Five of them are walked out of a loop here rather than typed as path data — the feather's vane off
// the very `vaneProfile` the flight lays it with, and the comet's rays, Saturn's hatching, the
// cross-staff's divisions and the moon's broken terminator off the same arithmetic the chart uses —
// so a card cannot quietly drift from the mark it is offering.
const MARK_ART={
  quill:(()=>{
    const QX=40,QY=43,PX=108,PY=11,CX=72,CY=18,N=26,edge=[[],[]];
    let barbs='';
    for(let i=0;i<N;i++){
      const u=(i+.7)/(N+.7),x=qAt(u,QX,CX,PX),y=qAt(u,QY,CY,PY);
      const tx=2*((1-u)*(CX-QX)+u*(PX-CX)),ty=2*((1-u)*(CY-QY)+u*(PY-CY)),tl=Math.hypot(tx,ty)||1;
      const ux=tx/tl,uy=ty/tl,w=vaneProfile(u);
      for(const side of [-1,1]){
        const r=w*(side>0?14:9.4),nx=-uy*side,ny=ux*side,ex=x+nx*r+ux*r*.95,ey=y+ny*r+uy*r*.95;
        barbs+='M'+artRound(x)+' '+artRound(y)+'Q'+artRound(x+nx*r*.78+ux*r*.2)+' '+artRound(y+ny*r*.78+uy*r*.2)+' '+artRound(ex)+' '+artRound(ey);
        edge[side>0?0:1].push(artRound(ex)+' '+artRound(ey));
      }
    }
    const vane=side=>'M'+QX+' '+QY+'L'+edge[side].join('L')+'L'+PX+' '+PY+'Z';
    return artFill(vane(0),.17)+artFill(vane(1),.13)+artLine(barbs,.45,.68)+
      artLine('M'+QX+' '+QY+'Q'+CX+' '+CY+' '+PX+' '+PY,1.3)+
      artLine('M26.1 47.3L38.7 40.8M29.9 52.7L41.3 45.3',.75,.8)+
      artLine('M31 46.7L33.3 50.4M34.4 44.8L36.7 48.5',.5,.5)+
      artFill('M10 63L26.1 47.3L29.9 52.7Z',.9)+artLine('M12.4 61L24.4 50.2',1,1,ART_GROUND)+
      artLine('M22.5 47.2L26.6 52.9',.6,.7)+artDot(15.6,59.3,2.2);
  })(),
  comet:(()=>{
    const HX=94,HY=31,LEN=78,SPREAD=15,CURL=5,RAYS=9;
    let rays='',beard='';
    for(let i=0;i<RAYS;i++){
      const v=i/(RAYS-1)*2-1,s=v*(.42+.58*Math.abs(v)),run=.62+(i%3)*.14+(i&1)*.08;
      rays+='M'+artRound(HX-6-Math.abs(s)*5)+' '+artRound(HY+s*11)+
        'Q'+artRound(HX-LEN*.36)+' '+artRound(HY+s*SPREAD*.3+CURL*.3)+
        ' '+artRound(HX-LEN*run)+' '+artRound(HY+s*SPREAD+CURL*run);
    }
    for(let i=0;i<9;i++){
      const a=(i/8-.5)*2.1,r=13,out=3+((i*5)%4)*1.7;
      beard+='M'+artRound(HX+Math.cos(a)*r)+' '+artRound(HY+Math.sin(a)*r)+'L'+artRound(HX+Math.cos(a)*(r+out))+' '+artRound(HY+Math.sin(a)*(r+out));
    }
    const u=.64,far=LEN*u;
    const wash='M'+(HX-4)+' '+artRound(HY-2.6)+'Q'+artRound(HX-far*.5)+' '+artRound(HY-SPREAD*u*.44+CURL*.2)+
      ' '+artRound(HX-far)+' '+artRound(HY-SPREAD*u*.78+CURL*u)+'L'+artRound(HX-far)+' '+artRound(HY+SPREAD*u+CURL*u)+
      'Q'+artRound(HX-far*.5)+' '+artRound(HY+SPREAD*u*.5+CURL*.2)+' '+(HX-4)+' '+artRound(HY+2.6)+'Z';
    return artFill(wash,.1)+artLine(rays,.7,.6)+
      artDot(HX,HY,11.5,.15)+artLine(beard,.55,.55)+artDot(HX,HY,5.6,.3)+artRing(HX,HY,5.6,1.2);
  })(),
  telescope:artFill('M88 18L56 24L22 30L22 44L56 50L88 56Z',.12)+
    artLine('M88 18L56 24L22 30M88 56L56 50L22 44',1,.9)+
    artLine('M34 28v18M44 26v22M68 22v30M78 20v36',.45,.3)+
    '<ellipse cx="88" cy="37" rx="2.8" ry="19" stroke-width="1"/>'+
    '<ellipse cx="56" cy="37" rx="2.4" ry="13" stroke-width=".8" opacity=".8"/>'+
    '<ellipse cx="22" cy="37" rx="1.8" ry="7" stroke-width=".8" opacity=".8"/>'+
    artLine('M92 32L101 29',.5,.4,'',' stroke-dasharray="3 3"')+artFill(artStar(106,27,4,4.4,1.3),.85),
  moth:artFill('M58 26C44 16 28 22 27 34C26 44 42 44 58 34Z',.14)+artFill('M62 26C76 16 92 22 93 34C94 44 78 44 62 34Z',.14)+
    artLine('M58 26C44 16 28 22 27 34C26 44 42 44 58 34Z',.9,.9)+artLine('M62 26C76 16 92 22 93 34C94 44 78 44 62 34Z',.9,.9)+
    artLine('M58 34C48 38 42 48 48 56C54 60 60 48 60 40Z',.8,.75)+artLine('M62 34C72 38 78 48 72 56C66 60 60 48 60 40Z',.8,.75)+
    artLine('M56 30L34 28M56 33L32 36M57 36L37 41',.4,.4)+artLine('M64 30L86 28M64 33L88 36M63 36L83 41',.4,.4)+
    artLine('M57 21C52 14 46 11 40 11M63 21C68 14 74 11 80 11',.8,.8)+
    artLine('M50 14l-3-3M45 12l-2-3M69 14l3-3M74 12l2-3',.45,.5)+
    artLine('M60 22V54',2.4)+artDot(60,22,3,.9),
  // Three bodies and no ring, since that is what the glass showed and what the chart draws.
  saturn:(()=>{
    let bars='';
    for(const side of [-1,1])for(let i=0;i<4;i++){
      const y=28+i*5.4,w=9*Math.sqrt(Math.max(0,1-((y-36)/14)*((y-36)/14)));
      bars+='M'+artRound(60+side*(30-w))+' '+y+'H'+artRound(60+side*(30+w));
    }
    return '<ellipse cx="30" cy="36" rx="10.5" ry="14" transform="rotate(-7 30 36)" stroke-width="1.1" fill="currentColor" fill-opacity=".18"/>'+
      '<ellipse cx="90" cy="36" rx="10.5" ry="14" transform="rotate(7 90 36)" stroke-width="1.1" fill="currentColor" fill-opacity=".18"/>'+
      artLine(bars,.5,.5)+artDot(60,36,12,.2)+artRing(60,36,12,1.3)+
      artLine('M50 31C55 33 66 33 70 31M50 41C55 39 66 39 70 41',.55,.5);
  })(),
  crossstaff:(()=>{
    const Y=36,X0=112,X1=14,CROSS=54,ARM=25;
    let ticks='';
    for(let i=1;i<12;i++){const x=lerp(X0,X1,i/12),t=i%3?1:1.8;ticks+='M'+artRound(x)+' '+artRound(Y-3.2*t)+'V'+artRound(Y+3.2*t);}
    return artLine('M'+X0+' '+Y+'H'+X1,1.4)+artLine(ticks,.5,.6)+
      artFill('M'+(CROSS-2.6)+' '+(Y-ARM)+'H'+(CROSS+2.6)+'V'+(Y+ARM)+'H'+(CROSS-2.6)+'Z',.14)+
      artLine('M'+CROSS+' '+(Y-ARM)+'V'+(Y+ARM),1.4)+
      artLine('M'+(CROSS-2)+' '+(Y-ARM)+'H'+(CROSS+10)+'M'+(CROSS-2)+' '+(Y+ARM)+'H'+(CROSS+10),1)+
      artLine('M'+X1+' '+(Y-8)+'V'+(Y+8)+'M'+(X1-4)+' '+(Y-5)+'V'+(Y+5),.9)+
      artLine('M'+CROSS+' '+(Y-ARM)+'L'+(X1-4)+' '+Y+'M'+CROSS+' '+(Y+ARM)+'L'+(X1-4)+' '+Y,.5,.45);
  })(),
  burin:(()=>{
    let turning='';
    for(let i=0;i<3;i++){const x=35-i*5.8;turning+='M'+x+' 25.4Q'+(x-2.5)+' 36 '+(x+.9)+' 46';}
    return artFill('M110 40L40 32.4L40 46Z',.16)+artLine('M110 40L40 32.4L40 46Z',.9)+
      artFill('M106 39.2L44 33.9L44 37.7Z',.55)+
      artFill('M40 32.4C34.9 23.4 19.8 24.1 17.6 36.5C17 43.4 20.4 46 24.6 46L40 46Z',.22)+
      artLine('M40 32.4C34.9 23.4 19.8 24.1 17.6 36.5C17 43.4 20.4 46 24.6 46L40 46Z',1)+
      artLine(turning,.5,.5)+artLine('M110 40L100 34.6',.8,.9)+
      artLine('M110 38.6Q104.7 29 90.8 29.6Q80 30.3 83 36.1',.7,.8);
  })(),
  moon:(()=>{
    const CX=64,CY=36,R=30,K=Math.cos(Math.PI*.4);
    let term='',dark='';
    for(let i=1;i<=14;i++){
      const th=Math.PI/2-i/14*Math.PI,jag=(((i*7)%5)-2)*1.4+((i&1)?1:-.9);
      term+='L'+artRound(CX+Math.cos(th)*(K*R+jag))+' '+artRound(CY+Math.sin(th)*R);
    }
    for(let i=0;i<4;i++){const a0=Math.PI/2+i*Math.PI/4+.16;dark+=artArc(CX,CY,R,a0,a0+Math.PI/4-.32);}
    const limb=artArc(CX,CY,R,-Math.PI/2,Math.PI/2);
    let spots='';
    for(const [along,y,r] of [[.34,-13,5.4],[.5,11,7.4],[.72,1.4,3.9]]){
      const edge=Math.sqrt(Math.max(.04,1-(y/R)*(y/R))),x=CX+lerp(K*R,R,along)*edge;
      spots+=artDot(x,CY+y,r,.26)+artRing(x,CY+y,r,.5,.6);
    }
    return artFill(limb+term+'Z',.22)+artLine(limb,1.2)+artLine('M'+CX+' '+(CY+R)+term,.75,.85)+
      artLine(dark,.6,.45)+spots;
  })()
};
// What the burin leaves at a planet as the traveller is taken (see CAPTURE_MARKS in src/effects.js).
const CAPTURE_ART={
  ripple:(()=>{
    let broken='',outer='',fan='';
    for(let i=0;i<5;i++){
      const a=i/5*TAU-Math.PI/2;
      broken+=artArc(60,36,20,a+.13,a+TAU/5-.13);outer+=artArc(60,36,26,a+.3,a+TAU/5-.36);
    }
    for(let i=-2;i<=2;i++){
      const a=i*.13,reach=9*(1-Math.abs(i)*.16);
      fan+='M'+artRound(60+Math.cos(a)*28)+' '+artRound(36+Math.sin(a)*28)+'L'+artRound(60+Math.cos(a)*(28+reach))+' '+artRound(36+Math.sin(a)*(28+reach));
    }
    return artLine(broken,1.4)+artLine(outer,.7,.55)+artRing(60,36,7,.9,.65)+artLine(fan,.6,.7);
  })(),
  rose:artFill(artStar(60,36,4,26,7),.9)+artFill(artStar(60,36,4,17,6,-Math.PI/4),.6)+
    artRing(60,36,7.5,.8,.7)+artRing(60,36,28.5,.6,.45)+artLine('M70 36H98',.7,.6),
  seal:artFill('M62 12C77 11 88 20 87 33C86 45 76 59 61 59C46 60 33 49 32 35C31 21 46 13 62 12Z',.2)+
    artLine('M62 12C77 11 88 20 87 33C86 45 76 59 61 59C46 60 33 49 32 35C31 21 46 13 62 12Z',1)+
    artLine(artStar(60,36,6,15,6.5),.85,.9)+artRing(60,36,19,.7,.7),
  manicule:'<g transform="translate(56 36) scale(28)">'+
    artLine('M-1 -.5L-.66 -.6L-.66 .6L-1 .5Z',.04)+
    artLine('M-.62 -.52C-.2 -.6 -.02 -.42 .18 -.34L.92 -.26C1.16 -.2 1.16 -.02 .9 .02L.2 .06C.42 .3 .24 .62 -.16 .6L-.62 .56Z',.04)+
    artLine('M-.1 .1L.16 .13M-.14 .3L.1 .32',.024,.75)+'</g>'
};
// The marginal ornaments cut into the frame's four corners (see frameOrnaments in src/frame.js).
const FRAME_ART={
  windheads:(()=>{
    let curls='';
    for(let i=0;i<5;i++){
      const a=Math.PI*.74+i/4*Math.PI*.98;
      curls+=artRing(44+Math.cos(a)*17.4,34+Math.sin(a)*17.4,5.6,.85,.8);
    }
    return artRing(44,34,17,1.3)+curls+
      artLine('M48 23Q56 20.5 62 24',1,.8)+artLine('M49 28Q55 32 61 28',1.1,.9)+
      artLine('M42 40Q53 48 61 39',1.1,.85)+artRing(59,35,4,1.1)+artDot(59,35,1.7,.85)+
      artLine('M64 31L98 20',.9,.5)+artLine('M64 33L100 27',1,.7)+artLine('M64 35L101 36',1.1,.8)+
      artLine('M64 37L99 44',1,.65)+artLine('M64 39L96 52',.9,.5);
  })(),
  strapwork:artLine('M24 30H50M70 30H96M24 42H50M70 42H96',1.1,.9)+
    artLine('M24 30A6 6 0 0 0 24 42M96 30A6 6 0 0 1 96 42',.95,.85)+
    artLine('M52 10V62M68 10V62',1.1,.95)+
    artLine('M52 10A8 8 0 0 1 68 10M52 62A8 8 0 0 0 68 62',.95,.9)+
    artLine('M27 36L34 29L41 36L34 43ZM79 36L86 29L93 36L86 43ZM60 14L67 21L60 28L53 21Z',.8,.85)+
    artRing(34,36,1.8,.6,.7)+artRing(86,36,1.8,.6,.7)+artRing(60,21,1.8,.6,.7),
  acanthus:artLine('M20 58C34 55 46 43 54 30C61 21 74 13 87 18',1.6,.9)+
    artLine(artSpiral(86,27,9,1.2,-1.4,-1.4+TAU*1.35),1.1,.9)+artDot(86,27,1.5,.8)+
    artFill('M30 52C31 43 37 37 45 35C43 43 38 49 30 52Z',.12)+artLine('M30 52C31 43 37 37 45 35C43 43 38 49 30 52Z',.9,.85)+
    artFill('M43 40C46 31 53 26 61 25C58 33 52 38 43 40Z',.12)+artLine('M43 40C46 31 53 26 61 25C58 33 52 38 43 40Z',.9,.8)+
    artFill('M56 28C60 20 67 16 75 15C71 23 65 27 56 28Z',.12)+artLine('M56 28C60 20 67 16 75 15C71 23 65 27 56 28Z',.9,.75)+
    artLine('M32 50C36 46 40 42 44 37M45 38C48 33 52 30 59 27M57 27C60 23 65 19 72 17',.4,.45),
  seamonsters:artLine('M14 52A12 12 0 0 1 38 52M38 52A14 14 0 0 1 66 52',1.2)+
    artLine('M20 44l-3-3M28 40l-2-4M36 44l-3-3M46 40l-3-4M56 39l-2-4M62 45l-3-3',.5,.45)+
    artLine('M66 52C74 48 74 38 80 30',1.2,.95)+
    artFill('M74 28C74 20 82 15 91 18C99 21 100 29 94 32L80 35Z',.16)+
    artLine('M74 28C74 20 82 15 91 18C99 21 100 29 94 32L80 35Z',1.1)+
    artLine('M80 25L96 22',.65,.7)+artDot(81,22.5,1.4)+
    artLine('M84 28v3M88 27v3M92 26v3',.5,.5)+
    artLine('M88 15L84 7M91 15L92 6M92 16L99 9',.7,.5)+
    artLine('M12 55H108',.6,.3)+artLine('M16 59H104',.55,.22)+artLine('M22 63H98',.5,.15)
};
// The three engraver's manners, shown on the Lyre — one of the twelve figures the chart actually deals
// (see CONSTELLATIONS in src/simulation.js) — so the card offers a hand rather than an invented beast.
// One contour and one set of stars, cut at the weight, breakage and hatching the chosen hand uses:
// Hevelius's medium broken line, Bayer's finer and more continuous one, Bode's heavy cut under far more
// shading (see FIGURE_STYLES in src/figures.js). The stars are struck the same in all three, since the
// hand changes how the figure over them is engraved and never where the chart says they stand.
const FIGURE_SHELL='M46 44C46 56 52 61 60 61C68 61 74 56 74 44Z';
const FIGURE_ARMS='M48 44C40 38 34 28 36 19M72 44C80 38 86 28 84 19M33 20H87';
const FIGURE_STRINGS='M48 21V44M54 21V44M60 21V44M66 21V44M72 21V44';
const FIGURE_STARS=[[36,17],[84,17],[60,20],[60,61],[40,31]];
const FIGURE_STIPPLE=[[54,50],[60,52],[66,50],[57,56],[63,56],[50,47],[70,47],[60,46],[60,58]];
function figurePreview(weight,dash,hatch,stipple){
  let hat='';
  for(let i=0;i<hatch;i++)hat+='M'+artRound(49+i*3.4)+' 46l2.4 '+artRound(8-Math.abs(i-hatch/2)*1.4);
  const cut=dash?' stroke-dasharray="'+dash+'"':'';
  return artLine(FIGURE_SHELL,weight,.92,'',cut)+artLine(FIGURE_ARMS,weight,.92,'',cut)+
    artLine(artSpiral(36,17,4.5,1,-.4,-.4+TAU*1.1,22),weight*.85,.85)+
    artLine(artSpiral(84,17,4.5,1,Math.PI+.4,Math.PI+.4-TAU*1.1,22),weight*.85,.85)+
    artLine(FIGURE_STRINGS,weight*.5,.6)+artLine(hat,weight*.5,.42)+
    FIGURE_STIPPLE.slice(0,stipple).map(([x,y])=>artDot(x,y,.9,.5)).join('')+
    FIGURE_STARS.map(([x,y])=>artFill(artStar(x,y,4,4.4,1.3),.95)).join('');
}
const FIGURE_ART={
  hevelius:figurePreview(1.15,'4.5 2.2',4,5),
  bayer:figurePreview(.75,'',3,3),
  bode:figurePreview(1.9,'3 2.6',7,9)
};
// A struck medal: a beaded rim, a plain field, and the feat's own device cut into it.
function medalRoundel(device){
  let beads='';
  for(let i=0;i<26;i++){const a=i/26*TAU;beads+=artDot(60+Math.cos(a)*23.2,36+Math.sin(a)*23.2,.85,.6);}
  return artRing(60,36,26,1.3)+artRing(60,36,20,.6,.55)+beads+device;
}
const MEDAL_ART={
  // Three perfect transfers in a row, five orbits cleared in one flight, the chart's top speed.
  perfecti:medalRoundel(artFill(artStar(47,36,4,4.8,1.5))+artFill(artStar(60,36,4,4.8,1.5))+artFill(artStar(73,36,4,4.8,1.5))),
  quinque:medalRoundel(artLine('M46 44Q60 22 74 44',1.2)+[46,53,60,67,74].map(x=>artDot(x,46,1.7,.9)).join('')),
  summa:medalRoundel(artLine('M50 26L63 36L50 46M60 26L73 36L60 46',2)),
  // A vortex grazed at speed, a chart traced in perfect transfers alone, the fortieth row.
  periculum:medalRoundel(artLine(artSpiral(60,36,13,1.4,0,TAU*1.7),1.1)+artLine('M47 25C55 32 63 40 73 46',1.1,.8)),
  pura:medalRoundel(artLine('M60 25L48 45L72 45Z',.9,.8)+artFill(artStar(60,25,4,4.6,1.4))+artFill(artStar(48,45,4,4.6,1.4))+artFill(artStar(72,45,4,4.6,1.4))),
  altitudo:medalRoundel(artLine('M60 48V24M55 29L60 22L65 29',1.5)+artLine('M51 46H69M53 40H67M55 34H65',.8,.7)),
  // Three minutes aloft, a right angle of arrival, twenty-five narrow escapes, ten thousand orbits.
  vigilia:medalRoundel(artLine('M50 24H70L60.5 36L70 48H50L59.5 36Z',1.2)+artLine('M54 45H66',.8,.7)+artDot(60,33,1.2,.8)),
  rectus:medalRoundel(artLine('M48 22V48H76',1.6)+artLine('M48 41H55V48',.8,.8)+artDot(48,48,2)),
  evasio:medalRoundel(artLine(artArc(60,36,14,.8,TAU-.8),1.5)+artLine('M49 42C57 39 68 35 78 31',1.1,.85)),
  myrias:medalRoundel(artLine('M50 27L70 46M70 27L50 46',1.6)+artLine('M50 21H70',1.1,.85)+
    [[46,29],[74,29],[46,45],[74,45]].map(([x,y])=>artDot(x,y,1,.5)).join(''))
};
// The engraver's own two: the burin the plate is cut with, and the stamp the sheet is owned by.
const CREDIT_ART=artFill('M24 44C18 40 18 32 24 28C31 25 39 29 39 36C39 43 31 47 24 44Z',.16)+
  artLine('M24 44C18 40 18 32 24 28C31 25 39 29 39 36C39 43 31 47 24 44Z',1.2)+
  artLine('M39 31L45 30V42L39 41Z',.9,.9)+
  artFill('M45 31L92 21L96 26L46 41Z',.14)+artLine('M45 31L92 21L96 26L46 41Z',1.2)+
  artLine('M46 34L93 24',.55,.5)+artLine('M28 56H92',.6,.3);
const STAMP_ART='<ellipse cx="60" cy="36" rx="32" ry="22" stroke-width="1.3"/>'+
  '<ellipse cx="60" cy="36" rx="27" ry="17.5" stroke-width=".6" opacity=".55"/>'+
  artFill('M44 41C50 37 55 37 60 39C65 37 70 37 76 41L76 30C70 26 65 26 60 28C55 26 50 26 44 30Z',.14)+
  artLine('M44 41C50 37 55 37 60 39C65 37 70 37 76 41L76 30C70 26 65 26 60 28C55 26 50 26 44 30Z',1.1)+
  artLine('M60 28V39',.8,.8)+artLine('M47 47H73',.6,.5);
// ---------- The two categories that are about what stands behind the chart ----------
// An oval is the one primitive the rest of this file never needed: the graticule is a sphere seen
// edge-on, and so is every parallel and meridian on it.
const artOval=(x,y,rx,ry,w=1.1,a=1,turn=0)=>'<ellipse cx="'+artRound(x)+'" cy="'+artRound(y)+'" rx="'+artRound(rx)+'" ry="'+artRound(ry)+'" stroke-width="'+w+'"'+(a===1?'':' opacity="'+a+'"')+(turn?' transform="rotate('+artRound(turn)+' '+artRound(x)+' '+artRound(y)+')"':'')+'/>';
// Strokes cut radially between two radii, as one path: the divisions of a dial, the graduations of a
// limb, and the rhumbs a wind-node throws are all the same figure at different reaches.
function artRays(x,y,r0,r1,count,turn=0){
  let d='';
  for(let i=0;i<count;i++){
    const a=turn+i/count*TAU;
    d+='M'+artRound(x+Math.cos(a)*r0)+' '+artRound(y+Math.sin(a)*r0)+'L'+artRound(x+Math.cos(a)*r1)+' '+artRound(y+Math.sin(a)*r1);
  }
  return d;
}
// The compass prick and its two crossed ruling strokes: the first mark of every construction, and on
// the unruled card the only one.
const SPHERE_PRICK=artLine('M55.5 36h9M60 31.5v9',.7,.8)+artDot(60,36,1.2,.95);
// Each construction as its own hand actually sets it out (see SPHERE_HANDS in src/frame.js), cut small.
const SPHERE_ART={
  graticule:artOval(60,36,33,20.5,1,.9)+artOval(60,36,33,20.5,.85,.7,-18)+
    artOval(60,36,33,17,.5,.45)+artOval(60,36,33,11,.5,.4)+
    artOval(60,36,9,20.5,.5,.42)+artOval(60,36,20,20.5,.5,.36)+SPHERE_PRICK,
  // The limb, the two tropics, and the eccentric ecliptic laid tangent inside one and outside the
  // other — set out at the very proportions paintReteSphere solves for.
  rete:artRing(60,36,30,1,.9)+artRing(60,36,13.2,.55,.45)+artRing(60,36,21.6,.5,.35)+
    artRing(73.4,19.1,8.4,.9,.75)+artLine('M30 36h60M60 6v60',.5,.28)+
    artLine('M67.6 26.5Q57 31 46 42',.6,.6)+artLine('M45.5 39.5L46 42L48.5 42.4',.5,.6)+artDot(46,42,1.1,.85)+
    artLine('M80.5 25Q86 35 81 47',.6,.6)+artLine('M83 44.8L81 47L78.5 46',.5,.6)+artDot(81,47,1.1,.85),
  // Seven heavens about the earth, the outermost doubled and pricked with the fixed stars.
  orbs:artRing(60,36,30,1,.9)+artRing(60,36,28.4,.55,.45)+
    [5.5,9.5,13.5,17.5,21.5,25.5].map(r=>artRing(60,36,r,.5,.4)).join('')+
    artRing(60,36,3,.6,.7)+artLine('M57.3 34.7h5.4M57.3 37.3h5.4',.45,.5)+
    artRing(75.5,25,2.8,.55,.6)+artDot(77.5,23.3,1,.85)+
    Array.from({length:8},(_,i)=>artDot(60+Math.cos(i/8*TAU+.4)*29.2,36+Math.sin(i/8*TAU+.4)*29.2,.75,.55)).join(''),
  // Dials on a common pin, divided into twelve, with the index swung over them and its thread hanging.
  volvelle:artRing(60,36,30,1,.9)+artRing(60,36,27,.55,.45)+artRing(60,36,22,.5,.4)+artRing(60,36,17,.5,.36)+artRing(60,36,12,.5,.3)+
    artLine(artRays(60,36,27,30,12,-Math.PI/2),.5,.42)+artLine(artRays(60,36,17,22,4,-Math.PI/2),.5,.3)+
    artLine('M53.6 48.5L74.5 21.7',1)+artLine('M70.5 21.2L74.5 21.7L74.9 25.6',.55,.75)+
    artRing(60,36,3.2,.7,.8)+artLine('M67.5 30.5V43',.4,.4)+artDot(67.5,43,1.4,.6),
  // An unruled sheet: its corner marks, and the prick that is the one thing a capture always makes.
  none:artLine('M28 14h7M28 14v7M92 14h-7M92 14v7M28 58h7M28 58v-7M92 58h-7M92 58v-7',.6,.34)+SPHERE_PRICK
};
// The chapter print in miniature: plate I's monumental lunar limb, its graduated arc, and the small
// companion above it — which is what the distance is when it is switched on. Drawn deliberately past
// the field on the left, exactly as the print runs off the sheet.
const SCENE_PRINT=artRing(6,44,34,1,.55)+artLine(artArc(6,44,24,-1.16,1.16),.55,.32)+
  artRing(22,30,4,.5,.5)+artRing(14,55,5.5,.5,.42)+artRing(29,49,3,.5,.38)+
  artLine(artArc(6,44,38,-1.2,1.2),.5,.3)+
  artLine(Array.from({length:9},(_,i)=>{const a=-1.2+i*.3,out=38+(i%2?3:6);
    return 'M'+artRound(6+Math.cos(a)*38)+' '+artRound(44+Math.sin(a)*38)+'L'+artRound(6+Math.cos(a)*out)+' '+artRound(44+Math.sin(a)*out);}).join(''),.45,.3)+
  artRing(97,15,11,.8,.5)+artRing(94,12,2.6,.45,.4)+artRing(100,19,2,.45,.35);
// A wind rose, cut as paintWindRose cuts it: sixteen points in halves, one inked and one left open.
function artRose(x,y,r){
  let art='';
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+i/16*TAU,len=r*(i%4===0?1:i%2?.44:.68);
    for(const side of [-1,1]){
      const edge=a+side*Math.PI/16;
      const d='M'+artRound(x+Math.cos(a)*len)+' '+artRound(y+Math.sin(a)*len)+'L'+artRound(x+Math.cos(edge)*r*.14)+' '+artRound(y+Math.sin(edge)*r*.14)+'L'+artRound(x)+' '+artRound(y)+'Z';
      art+=artFill(d,side<0?.5:.16)+artLine(d,.35,.5);
    }
  }
  return art+artRing(x,y,r*.14,.4,.5)+artRing(x,y,r*.68,.4,.4);
}
const SCENE_ART={
  // A sheet with nothing behind the chart: its plate-mark, its inner rule and its laid lines, and that
  // is the whole card, because that is the whole of what is printed there.
  none:'<rect x="25" y="10" width="70" height="52" fill="none" stroke="currentColor" stroke-width="1" opacity=".75"/>'+
    '<rect x="29" y="14" width="62" height="44" fill="none" stroke="currentColor" stroke-width=".5" opacity=".35"/>'+
    artLine('M33 22h54M33 30h54M33 38h54M33 46h54M33 54h54',.4,.15),
  chapterplates:SCENE_PRINT,
  // The hidden circle, its eight wind-nodes each throwing their own lines clean across the sheet, the
  // four winds heavier than the rest of them, and the rose on the node the chart is oriented from.
  rhumbs:artLine(Array.from({length:8},(_,i)=>{const a=i/8*TAU;return artRays(60+Math.cos(a)*26,36+Math.sin(a)*26,0,90,8);}).join(''),.35,.11)+
    artLine(artRays(60,36,15,90,16),.4,.18)+artLine(artRays(60,36,15,90,4),.4,.4)+
    artRing(60,36,26,.4,.26)+artRose(60,36,15),
  // The same copper pulled a second time onto a damp sheet: reversed, weaker, and doubled a hair off
  // itself. The card is the print's own art run through the very transform the blit runs it through.
  counterproof:'<g transform="translate(120,0) scale(-1,1)"><g opacity=".5">'+SCENE_PRINT+'</g>'+
    '<g opacity=".26" transform="translate(2,1.5)">'+SCENE_PRINT+'</g></g>'
};
const PREVIEW_ART={
  plate:platePreview,trail:trailPreview,
  sphere:id=>SPHERE_ART[id]||SPHERE_ART.graticule,
  scenery:id=>SCENE_ART[id]||SCENE_ART.none,
  mark:id=>MARK_ART[id]||MARK_ART.quill,
  capture:id=>CAPTURE_ART[id]||CAPTURE_ART.ripple,
  frame:id=>FRAME_ART[id]||FRAME_ART.windheads,
  figures:id=>FIGURE_ART[id]||FIGURE_ART.hevelius,
  medal:id=>MEDAL_ART[id]||medalRoundel(artFill(artStar(60,36,6,13,5))),
  credit:()=>CREDIT_ART,stamp:()=>STAMP_ART
};
function cataloguePreview(item,kind,locked=false){
  const cut=PREVIEW_ART[kind],art=cut?cut(item.id):medalRoundel(artFill(artStar(60,36,6,13,5)));
  const spill=!locked&&kind==='trail'?'<canvas class="cat-splat" data-ink="'+plainText(item.id)+'" aria-hidden="true"></canvas>':'';
  const shown=locked?'<span class="cat-preview-glyph">?</span>'
    :'<svg class="cat-art" viewBox="'+ART_FIELD+'" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">'+art+'</svg>'+spill;
  return '<span class="cat-preview'+(locked?' is-locked':'')+'" data-kind="'+plainText(kind)+'" data-item="'+plainText(item.id)+'" aria-hidden="true">'+
    shown+'<span class="cat-preview-rule"></span></span>';
}
function catalogueRow(item,kind){
  const entry=UNLOCK_BY_ID[item.id];
  if(entry&&!isUnlocked(item.id)){
    const progress=unlockProgress(entry);
    const need=entry.describe()+(progress?' · '+commas(Math.min(progress.value,progress.threshold))+' / '+commas(progress.threshold):' · SPECIAL FEAT');
    return `<li class="cat-row cat-card locked">${cataloguePreview(item,entry.kind||kind||'medal',true)}<div class="cat-card-copy"><span class="cat-name">${plainText(item.name)}</span><span class="cat-latin">${plainText(item.latin)}</span><span class="cat-state">LOCKED</span><span class="cat-cond">${plainText(need)}</span></div></li>`;
  }
  const chosen=kind&&cosmetic(kind)===item.id;
  const label=`<span class="cat-name">${plainText(item.name)}</span><span class="cat-latin">${plainText(item.latin)}</span><span class="cat-state">${chosen?'EQUIPPED':'UNLOCKED'}</span>`;
  if(!kind)return `<li class="cat-row cat-card">${cataloguePreview(item,entry?.kind||'medal')}<div class="cat-card-copy">${label}</div></li>`;
  return `<li class="cat-row cat-card"><button class="cat-item" type="button" data-kind="${kind}" data-id="${item.id}" aria-pressed="${chosen}">${cataloguePreview(item,kind)}<span class="cat-card-copy">${label}</span></button></li>`;
}
// Every cosmetic group, the named feats as earned-or-not, and the engraver's credit — the catalogue
// half of the leaf, unchanged from before the Record tab existed beside it.
function catalogueItems(){
  let html=catalogueOverview();
  for(const group of COSMETIC_KINDS){
    html+=`<section class="cat-group"><h3>${group.title}<span class="cat-latin">${group.latin}</span></h3><ul class="cat-grid">`;
    for(const item of cosmeticItems(group.kind))html+=catalogueRow(item,group.kind);
    html+='</ul></section>';
  }
  return html;
}
function catalogueInsignia(){
  let html=catalogueOverview();
  html+='<section class="cat-group"><h3>Named feats<span class="cat-latin">Insignia</span></h3><ul class="cat-grid">';
  for(const entry of UNLOCKS)if(entry.kind==='medal')html+=catalogueRow(entry,null);
  html+='</ul></section>';
  html+='<section class="cat-group"><h3>The engraver<span class="cat-latin">Sculptor</span></h3><ul class="cat-grid">';
  for(const id of ['delineavit','exlibris'])html+=catalogueRow(UNLOCK_BY_ID[id],null);
  html+='</ul>';
  if(isUnlocked('delineavit')){
    html+='<p class="cat-initials"><label for="initials">Initials, three letters</label>'+
      `<input id="initials" type="text" maxlength="3" size="3" autocomplete="off" spellcheck="false" value="${plainText(initials)}"></p>`;
  }
  html+='</section>';
  return html;
}
// The leaf holds three sections — the ledger's Record, the cosmetic Catalogue, and Insignia — and a
// small tab switch between them. All are rendered into the DOM on every pass; only the inactive one is
// hidden with the .hidden class already used elsewhere for whole-screen show/hide (see .cat-pane.hidden
// in src/index.html), so anything that reads the leaf's markup — including scripts/verify.mjs, which
// searches catalogue-body's innerHTML right after opening it — finds every section regardless of which
// tab is showing.
function renderCatalogue(){
  const body=$('catalogue-body');if(!body)return;
  const tabs=[['record','RECORD','CHRONICLE'],['catalogue','CATALOGUE','STUDIOLO'],['insignia','INSIGNIA','FEATS']];
  let html='<div class="cat-tabs">'+
    tabs.map(([id,label,sub])=>`<button type="button" class="diff-btn cat-tab-btn" data-tab="${id}" data-sub="${sub}" aria-pressed="${catalogueTab===id}">${label}</button>`).join('')+
    '</div>';
  html+=`<div class="cat-pane${catalogueTab==='record'?'':' hidden'}" data-pane="record">${catalogueRecord()}</div>`;
  html+=`<div class="cat-pane${catalogueTab==='catalogue'?'':' hidden'}" data-pane="catalogue">${catalogueItems()}</div>`;
  html+=`<div class="cat-pane${catalogueTab==='insignia'?'':' hidden'}" data-pane="insignia">${catalogueInsignia()}</div>`;
  body.innerHTML=html;
  paintCatalogueSplats(body);
  const field=$('initials');
  if(field&&field.addEventListener&&!field.wired){
    field.wired=true;
    field.addEventListener('input',()=>{const clean=setInitials(field.value);if(field.value!==clean)field.value=clean;});
  }
}
// The ex libris stamp is printed on the colophon once the ledger has a score at every pressure.
function syncCatalogueMarks(){
  const stamp=$('end-exlibris');
  if(stamp)stamp.classList.toggle('hidden',!isUnlocked('exlibris'));
  const mark=$('exlibris-initials');
  if(mark)mark.textContent=initials||'ORBIS';
}
function openCatalogue(){
  if(ephemerisOpen)closeEphemeris();
  // Always opens on the Record tab, whichever tab was showing when the leaf was last closed.
  catalogueOpen=true;catalogueTab='record';renderCatalogue();
  $('catalogue').classList.remove('hidden');$('catalogue').setAttribute('aria-hidden','false');
  $('catalogue-open').setAttribute('aria-expanded','true');
  game.classList.add('cataloguing');
  if(audio.enabled)audio.brush(1200,.14);
}
function closeCatalogue(){
  catalogueOpen=false;
  $('catalogue').classList.add('hidden');$('catalogue').setAttribute('aria-hidden','true');
  $('catalogue-open').setAttribute('aria-expanded','false');
  game.classList.remove('cataloguing');
}
// A changed HUD line is written in rather than swapped, by the hand that writes the sheet.
function inked(id,text){
  const el=$(id);if(el.textContent===text)return;
  el.textContent=text;el.classList.remove('inked');void el.offsetWidth;el.classList.add('inked');
}
// Whichever vortex is nearest the traveller, for the instruction that is about one.
function nearestHazard(){
  let best=null,bestD=Infinity;
  for(const h of world.hazards){
    if(h.kind&&h.kind!=='vortex')continue;
    const d=Math.hypot(h.x-world.player.x,h.y-world.player.y);
    if(d<bestD){bestD=d;best=h;}
  }
  return best;
}
function updateUI(dt){
  if(lastScore!==world.score){lastScore=world.score;inked('score',String(world.score));inked('best',String(currentBest()));}
  const words=plateWords().hud;
  inked('pace',words.pace+world.speedMultiplier().toFixed(1));
  inked('flow',world.combo>1&&world.captures>0?words.flow+world.combo:'');
  inked('shield',world.player.shielded?words.shield:'');
  inked('reflector',world.player.reflectorArmed?words.reflector:'');
  inked('dawn',world.player.dawnArmed?words.dawn:'');
  // The nib's reservoir. The rule drains with the ink in hand and takes the copper of a warning
  // once what is left will not carry an ordinary transfer.
  // The reservoir is a CSS gradient on a DOM element laid over the chart. Assigning one makes the
  // browser re-parse the gradient, recalculate that element's style and repaint its layer — and this
  // was assigned on every single frame, with a figure that changed on every single frame, for a rule
  // that had moved a fraction of a pixel. The mark is read to a quarter of a per cent and written only
  // when it actually moves, so the gauge repaints when it has something to show and not otherwise.
  const level=world.inkLevel(),gauge=$('ink'),held=(Math.round(level*400)/4).toFixed(2);
  const wet=level<=.34?'var(--copper)':'var(--gold)';
  const paint='linear-gradient(to right,'+wet+' 0 '+held+'%,var(--line) '+held+'% 100%)';
  if(paint!==inkGaugePaint){inkGaugePaint=paint;gauge.style.background=paint;}
  gauge.classList.toggle('dry',level<=.12);
  const chapter=Math.min(3,Math.floor(world.progress/8));
  // The plate's number and name are engraved at the foot of the sheet rather than set in the DOM; the
  // live region is told once, so the change is still spoken.
  if(chapter!==lastChapter){
    lastChapter=chapter;
    if(chapter>0&&world.state==='playing'){chapterReveal={index:chapter,age:0};$('announcement').textContent=spoken('chapterSaid',{numeral:numerals[chapter],name:plateWords().chapters[chapter]});}
  }
  // The standing instructions of the opening rows are written on the chart beside what they are about:
  // the orbit being held, or the vortex that is bending the flight. Each is kept on the sheet while
  // its condition holds, and left as ink for the chart to carry away as soon as it stops.
  if(world.state==='playing'&&world.difficultyPending){
    inscribeHeld('instruction',plateWords().held.choose,{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node&&world.inkLevel()<=.28){
    inscribeHeld('instruction',plateWords().held.dry,{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node?.type==='sling'&&world.player.node.row<=7){
    inscribeHeld('instruction',plateWords().held.sling,{node:world.player.node});
  }else if(world.state==='playing'&&world.captures<2){
    inscribeHeld('instruction',plateWords().held.release,{node:world.player.node});
  }else if(world.state==='playing'&&world.progress<12&&world.flightPreview?.curved){
    inscribeHeld('instruction',plateWords().held.bend,{node:nearestHazard()});
  }
  if(world.state==='dead'&&!deathShown&&world.player.deadTime>.65)showEnd();
}
function resize(){
  // Floored at 1.5 even on an ordinary "1x" screen: the engraving's hairline burin strokes run well
  // under a device pixel wide, and rasterising them with no supersampling turns a crisp incised line
  // into a soft grey smear. The floor costs at most the same fill rate already paid on any 2x display.
  const rect=game.getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(Math.max(window.devicePixelRatio||1,1.5),2);scale=Math.min(W/440,H/780);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  // Resizing the canvas resets its context state, so this is set again on every resize: it governs how
  // the cached planet, figure and ring sprites get resampled when blitted at the chart's current scale.
  ctx.imageSmoothingQuality='high';
  backdrop=paintBackdrop();if(!grain)grain=grainTexture();
  if(world){
    world.resize(W/scale,H/scale);
    // A resize mid-run pulls already-drawn nodes inboard (see OrbitWorld.resize), which the seed alone
    // cannot reproduce; logged here so a replay can repeat the same pull at the same moment instead of
    // only matching the run up to the first time the window changed shape.
    if(replayLog)replayLog.resizes.push({at:world.time,width:world.width,height:world.height});
  }
}
function enterFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)return;
  try{const request=game.requestFullscreen||game.webkitRequestFullscreen;if(request){const p=request.call(game,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}}catch(_){}
}
function handleInput(){
  if(catalogueOpen||ephemerisOpen||reviewing)return;
  audio.unlock();
  if(world.state==='ready'){recordAtStart=currentBest();world.start();setPlaying();enterFullscreen();}
  else if(world.state==='playing'){if(world.release()&&replayLog)replayLog.releases.push(world.time);}
  else if(world.state==='dead'&&world.player.deadTime>.7){newWorld();world.start();setPlaying();}
  else if(world.state==='paused')resume();
}
game.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;
  e.preventDefault();handleInput();
},{passive:false});
// iOS/WebKit doesn't reliably treat pointerdown as a user gesture for unlocking Web
// Audio, so also unlock on the touch events it does recognize.
for(const type of ['touchstart','touchend'])game.addEventListener(type,()=>audio.unlock(),{passive:true});
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&(catalogueOpen||ephemerisOpen)){e.preventDefault();if(catalogueOpen)closeCatalogue();else closeEphemeris();return;}
  if(catalogueOpen||ephemerisOpen)return;
  // With no leaf open over the plate, Escape is the desk's own halt: it sets a run down and takes it up.
  if(e.code==='Escape'&&!reviewing&&world&&(world.state==='playing'||world.state==='paused')){e.preventDefault();if(world.state==='playing')pause();else resume();return;}
  if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&!e.target.closest('button')){e.preventDefault();handleInput();}
});
game.addEventListener('contextmenu',e=>e.preventDefault());
// One control does both, so it is a switch and says so — the plate's own name for the halt, and beside
// it whether the run is being held down, exactly as the sound and daily switches are read.
function syncPauseControl(){
  const control=$('pause-open');if(!control)return;
  control.setAttribute('aria-label',plateWords().chrome.pauseLabel);
  control.setAttribute('aria-pressed',String(!!(world&&world.state==='paused')));
}
// A run is suspended by the footer's own control, by Escape, or by the page being switched away from,
// and it is taken up again by that same control, by a tap anywhere on the sheet exactly as it always
// was, or from the leaf the suspended sheet now carries: the plate's word for the halt, and beneath it
// the two things that can be done with a run held in hand.
function pause(){if(world&&world.state==='playing'){world.state='paused';$('pause').classList.remove('hidden');accumulator=0;$('announcement').textContent=plateWords().chrome.pauseTitle;syncPauseControl();}}
function resume(){
  if(!world||world.state!=='paused')return;
  // The presentation clock is picked up from now rather than from whenever the run was set down, so a
  // sheet left standing for a minute does not come back to a minute's worth of frames owed.
  world.state='playing';accumulator=0;renderDue=0;paceIntervals.length=0;frameTime=performance.now();$('pause').classList.add('hidden');syncPauseControl();
}
// Leaving a suspended run is not a death: no colophon is pulled and nothing is scored, the plate in hand
// is simply set aside unfinished and the frontispiece comes back up with a fresh chart dealt behind it.
// What the run did is still folded into the ledger, exactly as it is when the page is switched away from,
// so orbits already flown are never lost with the sheet; anything earned waits for the next colophon to
// name it. A preview era keeps its own record and so writes nothing here, as it writes nothing anywhere.
function leaveRun(){
  if(!world||world.state!=='paused')return;
  if(!plateOwns('score'))for(const id of ledgerCommit())if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
  newWorld();resetToFrontispiece();render(0);
}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    pause();
    // A run that is never finished still counts what it did: fold it in now, and keep anything it
    // unlocked for the colophon to name when the run does end.
    if(!plateOwns('score'))for(const id of ledgerCommit())if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
    if(audio.ctx)audio.ctx.suspend().catch(()=>{});
  }else{frameTime=performance.now();renderDue=0;paceIntervals.length=0;}
});
window.addEventListener('blur',pause);
$('pause-open').addEventListener('click',()=>{
  if(!world)return;
  if(world.state==='playing'){pause();if(audio.enabled)audio.brush(1200,.12);}
  else if(world.state==='paused'){resume();if(audio.enabled)audio.brush(1600,.1);}
});
$('pause-resume').addEventListener('click',()=>{if(world&&world.state==='paused'){resume();if(audio.enabled)audio.brush(1600,.1);}});
$('pause-leave').addEventListener('click',()=>{if(world&&world.state==='paused'){leaveRun();if(audio.enabled)audio.tone(392,.35,0,.15);}});
$('sound').addEventListener('click',()=>{audio.toggle();storage.set('orbit.sound.v1',audio.enabled?'on':'off');syncSound();if(audio.enabled)audio.tone(440,.25,0,.2);});
$('plate').addEventListener('click',()=>{setPlate(onPaper()?'night':'paper');if(audio.enabled)audio.brush(1500,.12);});
$('catalogue-open').addEventListener('click',()=>{if(catalogueOpen)closeCatalogue();else openCatalogue();});
$('catalogue-close').addEventListener('click',()=>closeCatalogue());
$('catalogue').addEventListener('pointerdown',e=>{if(e.stopPropagation)e.stopPropagation();});
$('catalogue-body').addEventListener('click',e=>{
  const tabButton=e.target&&e.target.closest?e.target.closest('button[data-tab]'):null;
  if(tabButton){
    const wanted=tabButton.getAttribute('data-tab');
    if(catalogueTab!==wanted){catalogueTab=wanted;renderCatalogue();if(audio.enabled)audio.brush(1400,.1);}
    return;
  }
  const button=e.target&&e.target.closest?e.target.closest('button[data-kind]'):null;
  if(!button)return;
  if(setCosmetic(button.getAttribute('data-kind'),button.getAttribute('data-id'))){
    renderCatalogue();if(audio.enabled)audio.tone(587.33,.22,0,.11);
  }
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{invalidateArt();if(world)render(0);}).catch(()=>{});
// The switch lives on both the title screen and the run-complete colophon, so a daily run is never a
// dead end: tapping either one toggles the same setting and the next "tap to try again" honours it.
function toggleDaily(){setDaily(!dailyOn);if(audio.enabled)audio.tone(dailyOn?659.25:392,.3,0,.16);}
$('daily').addEventListener('click',toggleDaily);
$('daily-end').addEventListener('click',toggleDaily);
for(const id in PLATE_STYLES){
  const door=PLATE_STYLES[id].door;if(!door)continue;
  const button=$(door.button);if(button)button.addEventListener('click',()=>enterEra(id));
}
$('ceiling-exit-end').addEventListener('click',leaveEra);
$('ceiling-exit').addEventListener('click',leaveEra);
$('copy-score').addEventListener('click',()=>{copyScore();if(audio.enabled)audio.tone(523.25,.25,0,.14);});
function syncSound(){$('sound').classList.toggle('muted',!audio.enabled);$('sound').setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(audio.enabled));}
// The full instruction paragraph prints on its own the first time the frontispiece is ever seen;
// after that it stays off the page unless this toggle calls it back, same as any other standing text.
function syncInstructions(){
  const open=!$('instructions').hidden;
  $('instructions-toggle').textContent=open?'HIDE':'HOW TO PLAY';
  $('instructions-toggle').setAttribute('aria-expanded',String(open));
}
$('instructions-toggle').addEventListener('click',()=>{
  $('instructions').hidden=!$('instructions').hidden;syncInstructions();
  if(audio.enabled)audio.brush(1400,.1);
});
// A second disclosure in the same shape: the ephemeris, both era doors and the last plate stay off
// the frontispiece until this is opened, so the sheet first shown offers only the day's two live
// choices — HOW TO PLAY and DAILY PLATE.
function syncMoreMenu(){
  const open=!$('more-menu').hidden;
  $('more-toggle').textContent=open?'HIDE':'MORE';
  $('more-toggle').setAttribute('aria-expanded',String(open));
}
$('more-toggle').addEventListener('click',()=>{
  $('more-menu').hidden=!$('more-menu').hidden;syncMoreMenu();
  if(audio.enabled)audio.brush(1400,.1);
});
$('fullscreen').addEventListener('click',()=>{
  if(document.fullscreenElement||document.webkitFullscreenElement){try{const exit=document.exitFullscreen||document.webkitExitFullscreen;const p=exit.call(document);if(p&&p.catch)p.catch(()=>{});}catch(_){}}
  else enterFullscreen();
});
if(!game.requestFullscreen&&!game.webkitRequestFullscreen)$('fullscreen').style.visibility='hidden';
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');resize();});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(game);else window.addEventListener('resize',resize);
// ---------- Presenting: painting the sheet only as often as it can actually be laid down ----------
// A phone with a 120 Hz screen asks for a frame every eight milliseconds. This chart is a wide,
// heavily blended engraving, and on a screen that fast the press cannot always pull a sheet in the
// time it is given — so frames arrive late and unevenly, which is exactly what a stutter is. The
// cadence the screen is actually achieving is measured over a short window; if the screen is a fast
// one and the press is plainly missing it, the sheet is pulled every other frame instead, which lands
// on a steady sixty rather than a ragged eighty. The flight is stepped on its own fixed clock either
// way, so nothing about the simulation, the input timing or the run changes — only how often the page
// is painted, and the elapsed time is handed to the renderer whole so every animation still runs at
// its own speed. It probes back up at widening intervals, so a screen the press can keep up with is
// never held down for long, and on an ordinary sixty-hertz screen it never engages at all.
const PACE_WINDOW=48,PACE_FAST_PANEL=11.5,PACE_MISS=1.5;
const paceIntervals=[];
let presentEvery=1,presentIn=1,renderDue=0,paceProbeIn=0,paceProbeWait=5;
function pacePresent(dt,raw){
  if(presentEvery>1){
    paceProbeIn-=dt;
    if(paceProbeIn<=0){presentEvery=1;presentIn=1;paceIntervals.length=0;}
    return;
  }
  // A frame that took longer than a tenth of a second was not slow drawing: it was a tab waking up,
  // a plate being rebuilt, or the phone attending to something else. Those say nothing about cadence.
  if(!(raw>0)||raw>100)return;
  paceIntervals.push(raw);
  if(paceIntervals.length<PACE_WINDOW)return;
  const sorted=paceIntervals.slice().sort((a,b)=>a-b);
  const native=sorted[Math.floor(sorted.length*.1)],achieved=sorted[sorted.length>>1];
  paceIntervals.length=0;
  if(native<PACE_FAST_PANEL&&achieved>native*PACE_MISS){
    presentEvery=2;presentIn=1;paceProbeIn=paceProbeWait;paceProbeWait=Math.min(30,paceProbeWait*2);
  }
}
function tick(now){
  const raw=frameTime?now-frameTime:0;
  const dt=frameTime?Math.min(raw/1000,.05):0;frameTime=now;
  if(!document.hidden){
    if(reviewing){
      if(--presentIn<=0){presentIn=presentEvery;renderReview();}
    }else{
      accumulator+=dt;
      while(accumulator>=FLIGHT_STEP){
        world.update(FLIGHT_STEP);accumulator-=FLIGHT_STEP;
      }
      recordTrail();
      audio.scratch(world.state==='playing',Math.hypot(world.player.vx,world.player.vy));
      pacePresent(dt,raw);
      renderDue+=dt;
      if(--presentIn<=0){presentIn=presentEvery;render(renderDue);renderDue=0;}
    }
  }
  requestAnimationFrame(tick);
}
if(!tutorialSeen){$('instructions').hidden=false;markTutorialSeen();}
syncPlate();resize();newWorld();syncSound();syncDifficulty();syncDaily();syncCatalogueMarks();syncInstructions();syncMoreMenu();syncEraChrome();syncLastReviewButton();$('best').textContent=currentBest();render(0);requestAnimationFrame(tick);
