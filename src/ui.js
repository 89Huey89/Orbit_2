'use strict';
/* Orbit · src/ui.js
   Presentation, storage, viewport, screens, the single gameplay input, and bootstrap. */
// ---------- Presentation, storage, viewport, and the single gameplay input ----------
// Every ripple, ring and blot carries its own seed so the burin cuts each one differently.
let ringSeq=0;const ringSeed=()=>(ringSeq=(ringSeq+9781)>>>0)||1;
// Everything the run has to say is written onto the chart itself, beside whatever it is about: see
// src/inscriptions.js. `where` names the subject — a planet or star to follow, or the point on the sheet
// the thing happened at — and the note is set clear of it and left as ink for the chart to carry away.
function say(text,where){
  return inscribe(text,where);
}
function event(type,e){
  if(type==='start'){audio.start();return;}
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
    if(e.max)tally('maxSpeedSlings');
    audio.tone(392,.65,0,.16);audio.tone(587.33,.65,.12,.12);say(e.max?'MAX SPEED · FIND YOUR LINE':'FULL CHARGE · SPEED IS YOURS',{node:world.player.node});
  }else if(type==='capture'){
    tally('captures');if(e.perfect)tally('perfects');if(e.steep)tally('badAngles');
    // The landing is surveyed where the flight met the ring; a square is answered with two short tones.
    recordLanding(e);
    if(e.steep){
      // Too steep to earn anything: a duller thud in place of the ordinary capture chime, and no
      // floater, since there is no score to announce.
      audio.tone(196,.35,0,.2,'triangle',150);audio.brush(700,.18);burst(e.x,e.y,6,'red',.4);
    }else{
      audio.capture(e.n.row,e.perfect);burst(e.x,e.y,e.perfect?12:6,'gold',.5);
      if(e.square){audio.tone(880,.3,.02,.12);audio.tone(1174.66,.3,.11,.1);}
      floaters.push({x:e.n.x,y:e.n.y-e.n.r-17,text:'+'+e.gain+(e.scoreMultiplier>=1.05?'  ·  ×'+e.scoreMultiplier.toFixed(1):''),age:0});screenFlash=e.perfect?.28:0;
    }
    rings.push({kind:'capture',node:e.n,x:e.n.x,y:e.n.y,start:e.n.r+2,distance:e.perfect?18:11,angle:Math.atan2(e.y-e.n.y,e.x-e.n.x),perfect:e.perfect,age:0,life:e.perfect?.85:.55,alpha:e.perfect?.86:.56,seed:ringSeed()});
    // The landing is announced on the orbit it was made on, so the note travels with that planet.
    const at={node:e.n};
    if(e.steep)say('TOO STEEP · NO ORBIT EARNED',at);
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
    say(e.chart.name+' · '+e.count+' / 3',{node:e.chart.stars[e.count-1]||world.player.node});
    audio.tone(e.count===1?523.25:659.25,.6,.1,.13);
  }else if(type==='constellation'){
    tallyMap('constellations',e.chart.name);
    say(e.chart.name+' · COMPLETE +60',{node:e.chart.stars[1]||e.chart.entry});
    for(const [i,n] of e.chart.stars.entries()){
      if(!reducedMotion){burst(n.x,n.y,9,'gold',.5);rings.push({x:n.x,y:n.y,start:n.r,distance:35,age:0,life:1.3,alpha:.5,seed:ringSeed()});}
      audio.tone([261.63,329.63,392][i],1.1,i*.14,.24);
    }
    $('announcement').textContent=e.chart.name+' complete. Sixty bonus points. Darkness retreats for four seconds.';
    recordBest(world.score);
  }else if(type==='shield'){
    audio.tone(660,.4,0,.22,'sine',880);burst(e.x,e.y,10,'blue',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    say(POWERUP_LABELS.shield+' ARMED · SURVIVES ONE BLACK HOLE',{x:e.x,y:e.y});
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
    say('OBSERVATION \u00b7 '+e.latin);
    audio.tone(587.33,.5,0,.15);audio.tone(880,.5,.15,.13);
  }else if(type==='near'){
    tally('grazes');
    audio.tone(698.46,.28,0,.16);floaters.push({x:e.x,y:e.y-20,text:'CLOSE +5',age:0});
    recordBest(world.score);
  }else if(type==='death'){
    audio.death();
    if(e.reason==='LEFT THE STAR CHART'){
      // Run off the side and the hand jitters: the nib skids off the sheet and spills, rather than
      // bursting. The kill boundary sits 16 units past the visible edge, so the splat is pulled back
      // to just inside it — on the edge the player actually left by, not out past where it is unseen.
      const dir=e.x>=0?1:-1,edgeX=dir*Math.max(0,world.width/2-50);
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
    audio.tone(440,.3,0,.15);say('PRESSURE SET · '+DIFFICULTY_LABELS[e.value]);
  }
}
function newWorld(){
  reveal.reset();glyphs.clear();trail=[];trailSampledAt=-1;inkPath=[];particles=[];rings=[];floaters=[];surveys=[];clearInscriptions();lastScore=-1;lastChapter=-1;deathShown=false;screenFlash=0;accumulator=0;
  regionBlend=0;darknessRelief=0;chapterReveal={index:0,age:5};
  recordAtStart=currentBest();resetRunTally();world=new OrbitWorld(dailyOn?dailySeed:++runSeed,W/scale,H/scale,event,!dailyOn);
  world.darknessMult=DARKNESS_MULT[activeDifficulty()];world.inkMult=INK_MULT[activeDifficulty()];world.perfectMult=PERFECT_MULT[activeDifficulty()];world.capMult=CAP_MULT[activeDifficulty()];
  $('copy-score').textContent='COPY SCORE';
  ambience={random:seeded(world.seed^0x5c8a21),wait:7,event:null,sequence:0};
}
function setPlaying(){
  // A daily plate is entered in the log the moment its run begins, and only while it is the current
  // day's: that entry is the whole of what opens a past plate to be drawn again.
  noteDailyPlay();
  game.classList.add('playing');game.classList.remove('over');$('intro').classList.add('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  clearInscriptions();
  $('announcement').textContent='Game started. Tap to release. Skim an orbit for a perfect transfer. Circle slingshot stars to gain speed and to fill the nib. Every flight spends ink by the distance flown; hold an orbit to re-charge it.';
  chapterReveal={index:0,age:0};
}
function showEnd(){
  deathShown=true;game.classList.remove('playing');game.classList.add('over');$('end').classList.remove('hidden');
  $('end-score').textContent=world.score;$('end-reason').textContent=world.reason;
  $('record').textContent=world.score>recordAtStart?'A NEW PERSONAL BEST':'BEST '+currentBest();
  $('end-captures').textContent=world.captures;$('end-perfects').textContent=world.perfects;$('end-flow').textContent=world.maxCombo+'×';
  const row=Math.floor(world.progress),newRow=row>bestRow;
  if(newRow){bestRow=row;storage.set('orbit.bestRow.v1',bestRow);}
  $('end-row').textContent=row;$('end-row-note').textContent=newRow?'BEST ROW '+bestRow:'';
  const charts=world.constellationsCompleted;
  $('end-constellations').textContent=charts+' constellation'+(charts===1?'':'s')+' traced';
  $('end-observations').textContent=world.observations.map(o=>o.latin).join(', ');
  $('end-daily').textContent=dailyOn?dailyLabel():'';
  // The run is folded into the ledger here, and anything the catalogue has just granted is named on
  // the colophon and announced once.
  const fresh=[...pendingUnlocks,...ledgerCommit()];pendingUnlocks=[];
  const names=fresh.map(id=>UNLOCK_BY_ID[id]&&UNLOCK_BY_ID[id].name).filter(Boolean);
  $('end-unlocked').textContent=names.length?'NEW IN THE CATALOGUE \u00b7 '+names.join(' \u00b7 '):'';
  if(names.length){audio.tone(523.25,.7,0,.14);audio.tone(783.99,.7,.16,.12);}
  syncCatalogueMarks();
  $('end-tip').textContent=world.captures===0?'Release when the pricked line reaches the next orbit.':world.reason==='THE DARK CAUGHT UP'?'Circle a slingshot star to gain speed. The dark grows faster.':world.reason==='THE ORBIT FADED'?'Copper orbits fade. Release before the ring runs out.':world.reason==='CAUGHT BY A BLACK HOLE'?'Close flybys bend your path. Follow the curved guide and leave room for the dark center.':world.perfects<2?'Skim the orbit’s rim for a perfect transfer.':'Perfect transfers keep your speed. Faster earns more points.';
  $('announcement').textContent='Run complete. Score '+world.score+'. Best '+best+'. Tap to try again.';
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
    ['Black holes grazed',commas(ledger.grazes)],
    [POWERUP_LABELS.shield+' spent',commas(ledger.shieldsSpent)],
    [POWERUP_LABELS.reflector+' spent',commas(ledger.reflectorsSpent)],
    ['Slingshots left at top speed',commas(ledger.maxSpeedSlings)],
    ['Inkwells filled on a streak',commas(ledger.inkwellsFound)],
    ['Arrivals too steep to score',commas(ledger.badAngles)],
    ['Daily streak',commas(streak.current)+' day'+(streak.current===1?'':'s')+' · best '+commas(streak.longest)]
  ];
  let html=catalogueTable()+'<table class="ledger-table"><tbody>'+
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
function catalogueRow(item,kind){
  const entry=UNLOCK_BY_ID[item.id];
  if(entry&&!isUnlocked(item.id)){
    const progress=unlockProgress(entry);
    const need=entry.describe()+(progress?' · '+commas(Math.min(progress.value,progress.threshold))+' / '+commas(progress.threshold):'');
    return `<li class="cat-row locked"><span class="cat-blank" aria-hidden="true"></span><span class="cat-cond">${plainText(need)}</span></li>`;
  }
  const label=`<span class="cat-name">${plainText(item.name)}</span><span class="cat-latin">${plainText(item.latin)}</span>`;
  if(!kind)return `<li class="cat-row"><span class="cat-granted">${label}</span></li>`;
  const chosen=cosmetic(kind)===item.id;
  return `<li class="cat-row"><button class="cat-item" type="button" data-kind="${kind}" data-id="${item.id}" aria-pressed="${chosen}">${label}</button></li>`;
}
// Every cosmetic group, the named feats as earned-or-not, and the engraver's credit — the catalogue
// half of the leaf, unchanged from before the Record tab existed beside it.
function catalogueItems(){
  let html='';
  for(const group of COSMETIC_KINDS){
    html+=`<section class="cat-group"><h3>${group.title}<span class="cat-latin">${group.latin}</span></h3><ul>`;
    for(const item of cosmeticItems(group.kind))html+=catalogueRow(item,group.kind);
    html+='</ul></section>';
  }
  html+='<section class="cat-group"><h3>Named feats<span class="cat-latin">Insignia</span></h3><ul>';
  for(const entry of UNLOCKS)if(entry.kind==='medal')html+=catalogueRow(entry,null);
  html+='</ul></section>';
  html+='<section class="cat-group"><h3>The engraver<span class="cat-latin">Sculptor</span></h3><ul>';
  for(const id of ['delineavit','exlibris'])html+=catalogueRow(UNLOCK_BY_ID[id],null);
  html+='</ul>';
  if(isUnlocked('delineavit')){
    html+='<p class="cat-initials"><label for="initials">Initials, three letters</label>'+
      `<input id="initials" type="text" maxlength="3" size="3" autocomplete="off" spellcheck="false" value="${plainText(initials)}"></p>`;
  }
  html+='</section>';
  return html;
}
// The leaf holds two sections — the ledger's Record and the unlockables' Catalogue — and a small tab
// switch between them. Both are always rendered into the DOM on every pass; only the inactive one is
// hidden with the .hidden class already used elsewhere for whole-screen show/hide (see .cat-pane.hidden
// in src/index.html), so anything that reads the leaf's markup — including scripts/verify.mjs, which
// searches catalogue-body's innerHTML right after opening it — finds both sections regardless of which
// tab is showing.
function renderCatalogue(){
  const body=$('catalogue-body');if(!body)return;
  const tabs=[['record','RECORD'],['catalogue','CATALOGUE']];
  let html='<div class="cat-tabs">'+
    tabs.map(([id,label])=>`<button type="button" class="diff-btn cat-tab-btn" data-tab="${id}" aria-pressed="${catalogueTab===id}">${label}</button>`).join('')+
    '</div>';
  html+=`<div class="cat-pane${catalogueTab==='record'?'':' hidden'}" data-pane="record">${catalogueRecord()}</div>`;
  html+=`<div class="cat-pane${catalogueTab==='catalogue'?'':' hidden'}" data-pane="catalogue">${catalogueItems()}</div>`;
  body.innerHTML=html;
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
// Whichever black hole is nearest the traveller, for the instruction that is about one.
function nearestHazard(){
  let best=null,bestD=Infinity;
  for(const h of world.hazards){
    if(h.kind&&h.kind!=='hole')continue;
    const d=Math.hypot(h.x-world.player.x,h.y-world.player.y);
    if(d<bestD){bestD=d;best=h;}
  }
  return best;
}
function updateUI(dt){
  if(lastScore!==world.score){lastScore=world.score;inked('score',String(world.score));inked('best',String(currentBest()));}
  inked('pace','SPEED ×'+world.speedMultiplier().toFixed(1));
  inked('flow',world.combo>1&&world.captures>0?'FLOW ×'+world.combo:'');
  inked('shield',world.player.shielded?POWERUP_LABELS.shield+' ARMED':'');
  inked('reflector',world.player.reflectorArmed?POWERUP_LABELS.reflector+' ARMED':'');
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
    if(chapter>0&&world.state==='playing'){chapterReveal={index:chapter,age:0};$('announcement').textContent='Plate '+numerals[chapter]+'. '+chapters[chapter]+'.';}
  }
  // The standing instructions of the opening rows are written on the chart beside what they are about:
  // the orbit being held, or the black hole that is bending the flight. Each is kept on the sheet while
  // its condition holds, and left as ink for the chart to carry away as soon as it stops.
  if(world.state==='playing'&&world.difficultyPending){
    inscribeHeld('instruction','Aim for TIRO, ADEPTUS, or MAGISTER — your first orbit sets the pressure.',{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node&&world.inkLevel()<=.28){
    inscribeHeld('instruction','The nib is running dry. Hold this orbit to re-charge it, or find a star.',{node:world.player.node});
  }else if(world.state==='playing'&&world.player.node?.type==='sling'&&world.player.node.row<=7){
    inscribeHeld('instruction','One lap builds speed. Tap sooner for less. Perfect landings keep it.',{node:world.player.node});
  }else if(world.state==='playing'&&world.captures<2){
    inscribeHeld('instruction','Tap when the pricked line skims the next orbit’s rim.',{node:world.player.node});
  }else if(world.state==='playing'&&world.progress<12&&world.flightPreview?.curved){
    inscribeHeld('instruction','Black holes bend your flight. Follow the curve; give the dark center room.',{node:nearestHazard()});
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
  if(world)world.resize(W/scale,H/scale);
}
function enterFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)return;
  try{const request=game.requestFullscreen||game.webkitRequestFullscreen;if(request){const p=request.call(game,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}}catch(_){}
}
function handleInput(){
  if(catalogueOpen||ephemerisOpen)return;
  audio.unlock();
  if(world.state==='ready'){recordAtStart=currentBest();world.start();setPlaying();enterFullscreen();}
  else if(world.state==='playing')world.release();
  else if(world.state==='dead'&&world.player.deadTime>.7){newWorld();world.start();setPlaying();}
  else if(world.state==='paused'){world.state='playing';accumulator=0;renderDue=0;paceIntervals.length=0;frameTime=performance.now();$('pause').classList.add('hidden');}
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
  if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&!e.target.closest('button')){e.preventDefault();handleInput();}
});
game.addEventListener('contextmenu',e=>e.preventDefault());
function pause(){if(world&&world.state==='playing'){world.state='paused';$('pause').classList.remove('hidden');accumulator=0;}}
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){
    pause();
    // A run that is never finished still counts what it did: fold it in now, and keep anything it
    // unlocked for the colophon to name when the run does end.
    for(const id of ledgerCommit())if(!pendingUnlocks.includes(id))pendingUnlocks.push(id);
    if(audio.ctx)audio.ctx.suspend().catch(()=>{});
  }else{frameTime=performance.now();renderDue=0;paceIntervals.length=0;}
});
window.addEventListener('blur',pause);
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
$('copy-score').addEventListener('click',()=>{copyScore();if(audio.enabled)audio.tone(523.25,.25,0,.14);});
function syncSound(){$('sound').classList.toggle('muted',!audio.enabled);$('sound').setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(audio.enabled));}
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
  requestAnimationFrame(tick);
}
syncPlate();resize();newWorld();syncSound();syncDifficulty();syncDaily();syncCatalogueMarks();$('best').textContent=currentBest();render(0);requestAnimationFrame(tick);
