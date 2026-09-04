'use strict';
/* Orbit · src/ui.js
   Presentation, storage, viewport, screens, the single gameplay input, and bootstrap. */
// ---------- Presentation, storage, viewport, and the single gameplay input ----------
// Every ripple, ring and blot carries its own seed so the burin cuts each one differently.
let ringSeq=0;const ringSeed=()=>(ringSeq=(ringSeq+9781)>>>0)||1;
function toast(text,seconds=1.4){
  // Removing and re-adding the class starts the ink wipe again for a toast that follows another one.
  const note=$('toast');note.textContent=text;note.classList.remove('show');void note.offsetWidth;note.classList.add('show');toastLife=seconds;
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
      toast('SLINGSHOT · SPEED ×'+e.factor.toFixed(1),1.2);
    }
  }else if(type==='charged'){
    if(e.max)tally('maxSpeedSlings');
    audio.tone(392,.65,0,.16);audio.tone(587.33,.65,.12,.12);toast(e.max?'MAX SPEED · FIND YOUR LINE':'FULL CHARGE · SPEED IS YOURS',1.8);
  }else if(type==='capture'){
    tally('captures');if(e.perfect)tally('perfects');
    audio.capture(e.n.row,e.perfect);burst(e.x,e.y,e.perfect?12:6,'gold',.5);
    // The landing is surveyed where the flight met the ring; a square is answered with two short tones.
    recordLanding(e);
    if(e.square){audio.tone(880,.3,.02,.12);audio.tone(1174.66,.3,.11,.1);}
    rings.push({kind:'capture',node:e.n,x:e.n.x,y:e.n.y,start:e.n.r+2,distance:e.perfect?18:11,angle:Math.atan2(e.y-e.n.y,e.x-e.n.x),perfect:e.perfect,age:0,life:e.perfect?.85:.55,alpha:e.perfect?.86:.56,seed:ringSeed()});
    floaters.push({x:e.n.x,y:e.n.y-e.n.r-17,text:'+'+e.gain+(e.scoreMultiplier>=1.05?'  ·  ×'+e.scoreMultiplier.toFixed(1):''),age:0});screenFlash=e.perfect?.28:0;
    if(e.skip)toast(e.skipped+' ORBIT'+(e.skipped===1?'':'S')+' SKIPPED · +'+e.skipBonus,2);
    else if(e.n.routeRole==='entry')toast('TRACE 3 STARS · +60 & A REPRIEVE',2.6);
    else if(e.n.type==='sling')toast('ORBIT TO GAIN SPEED · TAP TO LEAVE',2.5);
    else if(e.n.type==='fading')toast('FADING ORBIT · KEEP MOVING');
    else if(e.n.type==='gold')toast('GOLDEN DETOUR');
    else if(e.square)toast('RIGHT ANGLE · +'+e.squareBonus,1.8);
    else if(e.perfect)toast(e.combo>=3?'PERFECT · FLOW ×'+e.combo:'PERFECT · MOMENTUM KEPT');
    else if(e.n.type==='drift'&&e.n.row<10)toast('A WANDERING ORBIT');
    recordBest(world.score);
  }else if(type==='chartProgress'){
    toast(e.chart.name+' · '+e.count+' / 3',1.8);
    audio.tone(e.count===1?523.25:659.25,.6,.1,.13);
  }else if(type==='constellation'){
    tallyMap('constellations',e.chart.name);
    toast(e.chart.name+' · COMPLETE +60',2.8);
    for(const [i,n] of e.chart.stars.entries()){
      if(!reducedMotion){burst(n.x,n.y,9,'gold',.5);rings.push({x:n.x,y:n.y,start:n.r,distance:35,age:0,life:1.3,alpha:.5,seed:ringSeed()});}
      audio.tone([261.63,329.63,392][i],1.1,i*.14,.24);
    }
    $('announcement').textContent=e.chart.name+' complete. Sixty bonus points. Darkness retreats for four seconds.';
    recordBest(world.score);
  }else if(type==='shield'){
    audio.tone(660,.4,0,.22,'sine',880);burst(e.x,e.y,10,'blue',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45,seed:ringSeed()});
    toast('SHIELD ARMED · SURVIVES ONE BLACK HOLE',2.4);
  }else if(type==='shieldBreak'){
    tally('shieldsSpent');
    audio.tone(180,.5,0,.3,'triangle',90);audio.brush(900,.3);
    burst(e.x,e.y,20,'blue',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6,seed:ringSeed()});
    toast('SHIELD ABSORBED THE IMPACT',1.8);
  }else if(type==='observation'){
    tallyMap('observations',e.key);
    toast('OBSERVATION \u00b7 '+e.latin,2.6);
    audio.tone(587.33,.5,0,.15);audio.tone(880,.5,.15,.13);
  }else if(type==='near'){
    tally('grazes');
    audio.tone(698.46,.28,0,.16);floaters.push({x:e.x,y:e.y-20,text:'CLOSE +5',age:0});
    recordBest(world.score);
  }else if(type==='death'){
    audio.death();burst(e.x,e.y,56,'gold',1.4);burst(e.x,e.y,24,'red',.7);
    rings.push({x:e.x,y:e.y,start:3,distance:115,age:0,life:1.2,alpha:.6,seed:ringSeed()});screenFlash=1;
    $('hint').classList.remove('visible');$('toast').classList.remove('show');toastLife=0;
  }else if(type==='difficulty'){
    setDifficulty(e.value);
    audio.tone(440,.3,0,.15);toast('PRESSURE SET · '+e.value.toUpperCase(),1.8);
  }
}
function newWorld(){
  reveal.reset();glyphs.clear();trail=[];inkPath=[];particles=[];rings=[];floaters=[];surveys=[];lastScore=-1;lastChapter=-1;deathShown=false;screenFlash=0;accumulator=0;
  regionBlend=0;darknessRelief=0;chapterReveal={index:0,age:5};
  recordAtStart=currentBest();resetRunTally();world=new OrbitWorld(dailyOn?dailySeed:++runSeed,W/scale,H/scale,event,!dailyOn);
  world.darknessMult=DARKNESS_MULT[activeDifficulty()];
  $('copy-score').textContent='COPY SCORE';
  ambience={random:seeded(world.seed^0x5c8a21),wait:7,event:null,sequence:0};
}
function setPlaying(){
  game.classList.add('playing');game.classList.remove('over');$('intro').classList.add('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  $('hint').textContent='Tap when the pricked line skims the next orbit’s rim.';$('hint').classList.add('visible');$('toast').classList.remove('show');toastLife=0;
  $('announcement').textContent='Game started. Tap to release. Skim an orbit for a perfect transfer. Circle slingshot stars to gain speed and earn more points.';
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
  $('end-daily').textContent=dailyOn?'Tabula diei · '+dailyDay:'';
  // The run is folded into the ledger here, and anything the catalogue has just granted is named on
  // the colophon and announced once.
  const fresh=[...pendingUnlocks,...ledgerCommit()];pendingUnlocks=[];
  const names=fresh.map(id=>UNLOCK_BY_ID[id]&&UNLOCK_BY_ID[id].name).filter(Boolean);
  $('end-unlocked').textContent=names.length?'NEW IN THE CATALOGUE \u00b7 '+names.join(' \u00b7 '):'';
  if(names.length){toast('NEW IN THE CATALOGUE \u00b7 '+names.join(' \u00b7 ').toUpperCase(),3.2);audio.tone(523.25,.7,0,.14);audio.tone(783.99,.7,.16,.12);}
  syncCatalogueMarks();
  $('end-tip').textContent=world.captures===0?'Release when the pricked line reaches the next orbit.':world.reason==='THE DARK CAUGHT UP'?'Circle a slingshot star to gain speed. The dark grows faster.':world.reason==='THE ORBIT FADED'?'Copper orbits fade. Release before the ring runs out.':world.reason==='CAUGHT BY A BLACK HOLE'?'Close flybys bend your path. Follow the curved guide and leave room for the dark center.':world.perfects<2?'Skim the orbit’s rim for a perfect transfer.':'Perfect transfers keep your speed. Faster earns more points.';
  $('announcement').textContent='Run complete. Score '+world.score+'. Best '+best+'. Tap to try again.';
}
// ---------- The catalogue: the ledger's own leaf ----------
// A ruled library-catalogue page over the plate. It lists what the ledger has recorded and, under it,
// every cosmetic the atlas can be printed with: the ones that have been earned are selectable, the
// rest are blank rules with their condition beside them. Nothing here touches the simulation, and the
// button that opens it is only on the plate when no run is in progress.
let pendingUnlocks=[],catalogueOpen=false;
const commas=n=>Math.round(Number(n)||0).toLocaleString('en-US');
function chartTime(seconds){
  const total=Math.max(0,Math.round(Number(seconds)||0)),h=Math.floor(total/3600),m=Math.floor(total%3600/60);
  return h?h+'h '+m+'m':m?m+'m':total+'s';
}
const plainText=value=>String(value??'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
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
function renderCatalogue(){
  const body=$('catalogue-body');if(!body)return;
  let html=catalogueTable();
  for(const group of COSMETIC_KINDS){
    html+=`<section class="cat-group"><h3>${group.title}<span class="cat-latin">${group.latin}</span></h3><ul>`;
    for(const item of cosmeticItems(group.kind))html+=catalogueRow(item,group.kind);
    html+='</ul></section>';
  }
  html+='<section class="cat-group"><h3>The engraver<span class="cat-latin">Sculptor</span></h3><ul>';
  for(const id of ['delineavit','exlibris'])html+=catalogueRow(UNLOCK_BY_ID[id],null);
  html+='</ul>';
  if(isUnlocked('delineavit')){
    html+='<p class="cat-initials"><label for="initials">Initials, three letters</label>'+
      `<input id="initials" type="text" maxlength="3" size="3" autocomplete="off" spellcheck="false" value="${plainText(initials)}"></p>`;
  }
  html+='</section>';
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
  catalogueOpen=true;renderCatalogue();
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
// A changed HUD line is written in rather than swapped: the same ink wipe the toasts use.
function inked(id,text){
  const el=$(id);if(el.textContent===text)return;
  el.textContent=text;el.classList.remove('inked');void el.offsetWidth;el.classList.add('inked');
}
function updateUI(dt){
  if(lastScore!==world.score){lastScore=world.score;inked('score',String(world.score));inked('best',String(currentBest()));}
  inked('pace','SPEED ×'+world.speedMultiplier().toFixed(1));
  inked('flow',world.combo>1&&world.captures>0?'FLOW ×'+world.combo:'');
  inked('shield',world.player.shielded?'SHIELD ARMED':'');
  const chapter=Math.min(3,Math.floor(world.progress/8));
  if(chapter!==lastChapter){lastChapter=chapter;$('chapter').innerHTML=numerals[chapter]+' &nbsp; / &nbsp; '+chapters[chapter];if(chapter>0&&world.state==='playing')chapterReveal={index:chapter,age:0};}
  if(world.state==='playing'&&world.difficultyPending){
    $('hint').textContent='Aim for RELAXED, CLASSIC, or HARDCORE — your first orbit sets the pressure.';$('hint').classList.add('visible');
  }else if(world.state==='playing'&&world.player.node?.type==='sling'&&world.player.node.row<=7){
    $('hint').textContent='One lap builds speed. Tap sooner for less. Perfect landings keep it.';$('hint').classList.add('visible');
  }else if(world.state==='playing'&&world.captures<2){
    $('hint').textContent='Tap when the pricked line skims the next orbit’s rim.';$('hint').classList.add('visible');
  }else if(world.state==='playing'&&world.progress<12&&world.flightPreview?.curved){
    $('hint').textContent='Black holes bend your flight. Follow the curve; give the dark center room.';$('hint').classList.add('visible');
  }else $('hint').classList.remove('visible');
  if(toastLife>0&&world.state!=='paused'){toastLife-=dt;if(toastLife<=0)$('toast').classList.remove('show');}
  if(world.state==='dead'&&!deathShown&&world.player.deadTime>.65)showEnd();
}
function resize(){
  const rect=game.getBoundingClientRect();W=rect.width;H=rect.height;DPR=Math.min(window.devicePixelRatio||1,2);scale=Math.min(W/440,H/780);
  canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);
  backdrop=paintBackdrop();if(!grain)grain=grainTexture();
  if(world)world.resize(W/scale,H/scale);
}
function enterFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)return;
  try{const request=game.requestFullscreen||game.webkitRequestFullscreen;if(request){const p=request.call(game,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{});}}catch(_){}
}
function handleInput(){
  if(catalogueOpen)return;
  audio.unlock();
  if(world.state==='ready'){recordAtStart=currentBest();world.start();setPlaying();enterFullscreen();}
  else if(world.state==='playing')world.release();
  else if(world.state==='dead'&&world.player.deadTime>.7){newWorld();world.start();setPlaying();}
  else if(world.state==='paused'){world.state='playing';accumulator=0;frameTime=performance.now();$('pause').classList.add('hidden');}
}
game.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;
  e.preventDefault();handleInput();
},{passive:false});
window.addEventListener('keydown',e=>{
  if(e.code==='Escape'&&catalogueOpen){e.preventDefault();closeCatalogue();return;}
  if(catalogueOpen)return;
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
  }else frameTime=performance.now();
});
window.addEventListener('blur',pause);
$('sound').addEventListener('click',()=>{audio.toggle();storage.set('orbit.sound.v1',audio.enabled?'on':'off');syncSound();if(audio.enabled)audio.tone(440,.25,0,.2);});
$('plate').addEventListener('click',()=>{setPlate(onPaper()?'night':'paper');if(audio.enabled)audio.brush(1500,.12);});
$('catalogue-open').addEventListener('click',()=>{if(catalogueOpen)closeCatalogue();else openCatalogue();});
$('catalogue-close').addEventListener('click',()=>closeCatalogue());
$('catalogue').addEventListener('pointerdown',e=>{if(e.stopPropagation)e.stopPropagation();});
$('catalogue-body').addEventListener('click',e=>{
  const button=e.target&&e.target.closest?e.target.closest('button[data-kind]'):null;
  if(!button)return;
  if(setCosmetic(button.getAttribute('data-kind'),button.getAttribute('data-id'))){
    renderCatalogue();if(audio.enabled)audio.tone(587.33,.22,0,.11);
  }
});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{invalidateArt();if(world)render(0);}).catch(()=>{});
$('daily').addEventListener('click',()=>{setDaily(!dailyOn);if(audio.enabled)audio.tone(dailyOn?659.25:392,.3,0,.16);});
$('copy-score').addEventListener('click',()=>{copyScore();if(audio.enabled)audio.tone(523.25,.25,0,.14);});
function syncSound(){$('sound').classList.toggle('muted',!audio.enabled);$('sound').setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');$('sound').setAttribute('aria-pressed',String(audio.enabled));}
$('fullscreen').addEventListener('click',()=>{
  if(document.fullscreenElement||document.webkitFullscreenElement){try{const exit=document.exitFullscreen||document.webkitExitFullscreen;const p=exit.call(document);if(p&&p.catch)p.catch(()=>{});}catch(_){}}
  else enterFullscreen();
});
if(!game.requestFullscreen&&!game.webkitRequestFullscreen)$('fullscreen').style.visibility='hidden';
document.addEventListener('fullscreenchange',()=>{$('fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen');resize();});
if('ResizeObserver'in window)new ResizeObserver(resize).observe(game);else window.addEventListener('resize',resize);
function tick(now){
  const dt=frameTime?Math.min((now-frameTime)/1000,.05):0;frameTime=now;
  if(!document.hidden){
    accumulator+=dt;
    while(accumulator>=FLIGHT_STEP){
      world.update(FLIGHT_STEP);accumulator-=FLIGHT_STEP;
    }
    recordTrail();
    render(dt);
  }
  requestAnimationFrame(tick);
}
syncPlate();resize();newWorld();syncSound();syncDifficulty();syncDaily();syncCatalogueMarks();$('best').textContent=currentBest();render(0);requestAnimationFrame(tick);
