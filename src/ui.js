'use strict';
/* Orbit · src/ui.js
   Presentation, storage, viewport, screens, the single gameplay input, and bootstrap. */
// ---------- Presentation, storage, viewport, and the single gameplay input ----------
function toast(text,seconds=1.4){$('toast').textContent=text;$('toast').classList.add('show');toastLife=seconds;}
function event(type,e){
  if(type==='start'){audio.start();return;}
  if(type==='release'){
    audio.release();burst(e.x,e.y,8,'gold',.4);rings.push({x:e.x,y:e.y,start:4,distance:25,age:0,life:.32,alpha:.45});
    if(e.sling&&e.charge>.15){
      audio.tone(155,.45,0,.25,'sine',230+e.charge*200);
      if(!reducedMotion){burst(e.x,e.y,Math.round(8+e.charge*12),'gold',.9);rings.push({x:e.x,y:e.y,start:5,distance:55,age:0,life:.5,alpha:.42});}
      toast('SLINGSHOT · SPEED ×'+e.factor.toFixed(1),1.2);
    }
  }else if(type==='charged'){
    audio.tone(392,.65,0,.16);audio.tone(587.33,.65,.12,.12);toast(e.max?'MAX SPEED · FIND YOUR LINE':'FULL CHARGE · SPEED IS YOURS',1.8);
  }else if(type==='capture'){
    audio.capture(e.n.row,e.perfect);burst(e.x,e.y,e.perfect?12:6,'gold',.5);
    rings.push({kind:'capture',node:e.n,x:e.n.x,y:e.n.y,start:e.n.r+2,distance:e.perfect?18:11,angle:Math.atan2(e.y-e.n.y,e.x-e.n.x),perfect:e.perfect,age:0,life:e.perfect?.85:.55,alpha:e.perfect?.86:.56});
    floaters.push({x:e.n.x,y:e.n.y-e.n.r-17,text:'+'+e.gain+(e.scoreMultiplier>=1.05?'  ·  ×'+e.scoreMultiplier.toFixed(1):''),age:0});screenFlash=e.perfect?.28:0;
    if(e.skip)toast(e.skipped+' ORBIT'+(e.skipped===1?'':'S')+' SKIPPED · +'+e.skipBonus,2);
    else if(e.n.routeRole==='entry')toast('TRACE 3 STARS · +60 & A REPRIEVE',2.6);
    else if(e.n.type==='sling')toast('ORBIT TO GAIN SPEED · TAP TO LEAVE',2.5);
    else if(e.n.type==='fading')toast('FADING ORBIT · KEEP MOVING');
    else if(e.n.type==='gold')toast('GOLDEN DETOUR');
    else if(e.perfect)toast(e.combo>=3?'PERFECT · FLOW ×'+e.combo:'PERFECT · MOMENTUM KEPT');
    else if(e.n.type==='drift'&&e.n.row<10)toast('A WANDERING ORBIT');
    if(world.score>best){best=world.score;storage.set('orbit.best.v1',best);}
  }else if(type==='chartProgress'){
    toast(e.chart.name+' · '+e.count+' / 3',1.8);
    audio.tone(e.count===1?523.25:659.25,.6,.1,.13);
  }else if(type==='constellation'){
    toast(e.chart.name+' · COMPLETE +60',2.8);
    for(const [i,n] of e.chart.stars.entries()){
      if(!reducedMotion){burst(n.x,n.y,9,'gold',.5);rings.push({x:n.x,y:n.y,start:n.r,distance:35,age:0,life:1.3,alpha:.5});}
      audio.tone([261.63,329.63,392][i],1.1,i*.14,.24);
    }
    $('announcement').textContent=e.chart.name+' complete. Sixty bonus points. Darkness retreats for four seconds.';
    if(world.score>best){best=world.score;storage.set('orbit.best.v1',best);}
  }else if(type==='shield'){
    audio.tone(660,.4,0,.22,'sine',880);burst(e.x,e.y,10,'blue',.5);
    rings.push({x:e.x,y:e.y,start:4,distance:30,age:0,life:.5,alpha:.45});
    toast('SHIELD ARMED · SURVIVES ONE BLACK HOLE',2.4);
  }else if(type==='shieldBreak'){
    audio.tone(180,.5,0,.3,'triangle',90);audio.brush(900,.3);
    burst(e.x,e.y,20,'blue',.9);rings.push({x:e.x,y:e.y,start:4,distance:60,age:0,life:.6,alpha:.6});
    toast('SHIELD ABSORBED THE IMPACT',1.8);
  }else if(type==='near'){
    audio.tone(698.46,.28,0,.16);floaters.push({x:e.x,y:e.y-20,text:'CLOSE +5',age:0});
    if(world.score>best){best=world.score;storage.set('orbit.best.v1',best);}
  }else if(type==='death'){
    audio.death();burst(e.x,e.y,56,'gold',1.4);burst(e.x,e.y,24,'red',.7);
    rings.push({x:e.x,y:e.y,start:3,distance:115,age:0,life:1.2,alpha:.6});screenFlash=1;
    $('hint').classList.remove('visible');$('toast').classList.remove('show');toastLife=0;
  }
}
function newWorld(){
  glyphs.clear();trail=[];particles=[];rings=[];floaters=[];lastScore=-1;lastChapter=-1;deathShown=false;screenFlash=0;accumulator=0;
  regionBlend=0;darknessRelief=0;chapterReveal={index:0,age:5};
  recordAtStart=best;world=new OrbitWorld(++runSeed,W/scale,H/scale,event);
  world.darknessMult=DARKNESS_MULT[difficulty];
  ambience={random:seeded(world.seed^0x5c8a21),wait:7,event:null,sequence:0};
}
function setPlaying(){
  game.classList.add('playing');game.classList.remove('over');$('intro').classList.add('hidden');$('end').classList.add('hidden');$('pause').classList.add('hidden');
  $('hint').textContent='Tap when the dotted line skims the next orbit’s rim.';$('hint').classList.add('visible');$('toast').classList.remove('show');toastLife=0;
  $('announcement').textContent='Game started. Tap to release. Skim an orbit for a perfect transfer. Circle slingshot stars to gain speed and earn more points.';
  chapterReveal={index:0,age:0};
}
function showEnd(){
  deathShown=true;game.classList.remove('playing');game.classList.add('over');$('end').classList.remove('hidden');
  $('end-score').textContent=world.score;$('end-reason').textContent=world.reason;
  $('record').textContent=world.score>recordAtStart?'A NEW PERSONAL BEST':'BEST '+best;
  $('end-captures').textContent=world.captures;$('end-perfects').textContent=world.perfects;$('end-flow').textContent=world.maxCombo+'×';
  $('end-constellations').textContent=world.constellationsCompleted+' / 4 constellations traced';
  $('end-tip').textContent=world.captures===0?'Release when the dotted line reaches the next orbit.':world.reason==='THE DARK CAUGHT UP'?'Circle a slingshot star to gain speed. The dark grows faster.':world.reason==='THE ORBIT FADED'?'Copper orbits fade. Release before the ring runs out.':world.reason==='CAUGHT BY A BLACK HOLE'?'Close flybys bend your path. Follow the curved guide and leave room for the dark center.':world.perfects<2?'Skim the orbit’s rim for a perfect transfer.':'Perfect transfers keep your speed. Faster earns more points.';
  $('announcement').textContent='Run complete. Score '+world.score+'. Best '+best+'. Tap to try again.';
}
function updateUI(dt){
  if(lastScore!==world.score){lastScore=world.score;$('score').textContent=world.score;$('best').textContent=best;}
  const pace='SPEED ×'+world.speedMultiplier().toFixed(1);if($('pace').textContent!==pace)$('pace').textContent=pace;
  const flow=world.combo>1&&world.captures>0?'FLOW ×'+world.combo:'';if($('flow').textContent!==flow)$('flow').textContent=flow;
  const shieldText=world.player.shielded?'SHIELD ARMED':'';if($('shield').textContent!==shieldText)$('shield').textContent=shieldText;
  const chapter=Math.min(3,Math.floor(world.progress/8));
  if(chapter!==lastChapter){lastChapter=chapter;$('chapter').innerHTML=numerals[chapter]+' &nbsp; / &nbsp; '+chapters[chapter];if(chapter>0&&world.state==='playing')chapterReveal={index:chapter,age:0};}
  if(world.state==='playing'&&world.player.node?.type==='sling'&&world.player.node.row<=7){
    $('hint').textContent='One lap builds speed. Tap sooner for less. Perfect landings keep it.';$('hint').classList.add('visible');
  }else if(world.state==='playing'&&world.captures<2){
    $('hint').textContent='Tap when the dotted line skims the next orbit’s rim.';$('hint').classList.add('visible');
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
  audio.unlock();
  if(world.state==='ready'){recordAtStart=best;world.start();setPlaying();enterFullscreen();}
  else if(world.state==='playing')world.release();
  else if(world.state==='dead'&&world.player.deadTime>.7){newWorld();world.start();setPlaying();}
  else if(world.state==='paused'){world.state='playing';accumulator=0;frameTime=performance.now();$('pause').classList.add('hidden');}
}
game.addEventListener('pointerdown',e=>{
  if(e.target.closest('button')||!e.isPrimary||e.button!==0)return;
  e.preventDefault();handleInput();
},{passive:false});
window.addEventListener('keydown',e=>{
  if((e.code==='Space'||e.code==='Enter')&&!e.repeat&&!e.target.closest('button')){e.preventDefault();handleInput();}
});
game.addEventListener('contextmenu',e=>e.preventDefault());
function pause(){if(world&&world.state==='playing'){world.state='paused';$('pause').classList.remove('hidden');accumulator=0;}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(audio.ctx)audio.ctx.suspend().catch(()=>{});}else frameTime=performance.now();});
window.addEventListener('blur',pause);
$('sound').addEventListener('click',()=>{audio.toggle();storage.set('orbit.sound.v1',audio.enabled?'on':'off');syncSound();if(audio.enabled)audio.tone(440,.25,0,.2);});
$('plate').addEventListener('click',()=>{setPlate(onPaper()?'night':'paper');if(audio.enabled)audio.brush(1500,.12);});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{invalidateArt();if(world)render(0);}).catch(()=>{});
$('diff-relaxed').addEventListener('click',()=>setDifficulty('relaxed'));
$('diff-classic').addEventListener('click',()=>setDifficulty('classic'));
$('diff-hardcore').addEventListener('click',()=>setDifficulty('hardcore'));
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
syncPlate();resize();newWorld();syncSound();syncDifficulty();$('best').textContent=best;render(0);requestAnimationFrame(tick);
