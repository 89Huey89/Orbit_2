'use strict';
/* Orbit · src/review.js
   The finished plate, read back rather than played: a free-scrolling camera over a world rebuilt by
   replayRun(), with nothing on it that only made sense while the ink was still wet. */
// ---------- Reviewing a finished run ----------
let reviewWorld=null,reviewCameraY=0,reviewReturnScreen='end',reviewOpenedAt=0,reviewTakenAt=0;
// The one thing kept between visits: not the run, which the darkness has already taken apart, but the
// list of moments it was flown from. A seed and a handful of numbers outlive the tab that drew them.
const LAST_REPLAY_KEY='orbit.lastReplay.v1';
function saveLastReplay(log,meta){
  if(!log||!Array.isArray(log.releases))return;
  try{storage.set(LAST_REPLAY_KEY,JSON.stringify({...log,...meta}));}catch(_){}
}
function loadLastReplay(){
  let rec;try{rec=JSON.parse(storage.get(LAST_REPLAY_KEY,'null'));}catch(_){return null;}
  return rec&&Number.isFinite(rec.seed)&&Array.isArray(rec.releases)?rec:null;
}
function syncLastReviewButton(){
  const btn=$('review-last');if(!btn)return;
  const rec=loadLastReplay();
  btn.hidden=!rec;
  const note=$('review-last-note');
  if(note)note.textContent=rec?'ROW '+Math.floor(rec.row||0)+' · '+commas(rec.score||0):'';
}
// The same opening framing the constructor itself chooses for a fresh world (-height*.62) bounds the
// bottom of the scroll; the top is however far the traveller actually climbed, with a little headroom
// above it. min is clamped to max so a run that barely began still opens onto a single valid position.
function reviewBounds(w){
  const max=-w.height*.62;
  return {min:Math.min(max,w.topY-w.height*.2),max};
}
function panReviewBy(delta){
  if(!reviewing)return;
  const b=reviewBounds(reviewWorld);
  reviewCameraY=clamp(reviewCameraY+delta,b.min,b.max);
}
// log defaults to the run just played (the colophon's own button); the frontispiece's button passes
// a log read back from storage instead, and names 'intro' as the screen to return to on close.
function openReview(log,returnTo){
  if(reviewing)return;
  const l=log||replayLog;if(!l)return;
  reviewWorld=replayRun(l);reviewOpenedAt=performance.now();reviewTakenAt=Number(l.capturedAt)||Date.now();
  reviewing=true;reviewReturnScreen=returnTo||'end';
  $('review-catch').textContent=reviewReturnScreen==='end'?'Colophon.':'Orbit.';
  const b=reviewBounds(reviewWorld);
  // Opens on where the run ended, not the start — the one fixed position review is allowed, since
  // nothing after this moves the camera on its own. Free scrolling from here is the whole point.
  reviewCameraY=clamp(reviewWorld.player.y-reviewWorld.height*.5,b.min,b.max);
  game.classList.add('reviewing');$(reviewReturnScreen).classList.add('hidden');
}
function closeReview(){
  if(!reviewing)return;
  reviewing=false;reviewWorld=null;
  game.classList.remove('reviewing','review-dragging');$(reviewReturnScreen).classList.remove('hidden');
}
function renderReview(){
  const w=reviewWorld;if(!w)return;
  const b=reviewBounds(w);reviewCameraY=clamp(reviewCameraY,b.min,b.max);
  const savedWorld=world;world=w;world.cameraY=reviewCameraY;
  ctx.setTransform(DPR,0,0,DPR,0,0);
  drawAtmosphere(0,null);drawRenaissanceGrid();drawConstellationFigures();drawGravitationalLenses();
  ctx.save();
  for(const g of world.nebulas)revealHazard(g,drawHazard);
  drawConnections();drawConstellations();
  for(const n of world.nodes)drawNode(n,null);
  for(const h of world.hazards)revealHazard(h,drawHazard);
  {const paintChasm=handFor('chasm');if(paintChasm)for(const c of world.chasms)paintChasm(c);}
  // The route actually flown, and the angle every departure and landing was measured at — see
  // replayRun() in src/replay.js, which surveys the whole run again as it rebuilds it.
  drawInkPath();drawSurveys();
  drawImpressum();drawReviewTablet(w);
  ctx.restore();
  // The folio and the grain, in the order render() itself cuts them: a finished plate is still a page
  // of the atlas, and a page with no number on it and no wires in its stock is not a sheet at all.
  // drawHudLeaf() is the one pass deliberately left out — it reserves a patch of stock for a hand that
  // is no longer playing, and over a finished plate that is a blank scraped in the chart for nothing.
  drawPlateFrame();drawRunningHead();drawLaidPaper();
  world=savedWorld;
}
// ---------- The finished plate's title tablet ----------
// A finished plate is titled the way the imprint titles the opening one: a strapwork tablet cut into the
// sheet just below where the run ended, which is where review opens, carrying the plate as an impression
// taken — the table and region reached, the day it was drawn, the pressure, the orbits, the sum and the
// figures traced, and the engraver's credit. It is lettered in the plate's Latin (CLAUDE.md, the two
// voices) and inks on row by row as the review opens, and it rides with the sheet in world coordinates, so
// panning down toward the opening plate leaves it behind. The stock inside it is cleared first, so the
// chart under it never runs through the lettering.
function reviewTabletRows(w){
  const chapter=clamp(Math.floor(w.progress/8),0,3),d=new Date(reviewTakenAt);
  const pressure=Object.keys(DARKNESS_MULT).find(k=>DARKNESS_MULT[k]===w.darknessMult)||'classic';
  const words=plateWords().pressures||{};
  return [
    {text:'TAB. '+numerals[chapter]+' · '+chaptersLatin[chapter],face:'sc',size:1.2},
    {text:'die '+roman(d.getUTCDate())+' '+MONTHS_LATIN_GEN[d.getUTCMonth()]+' · anno '+roman(d.getUTCFullYear()),face:'italic',size:.92},
    {text:(words[pressure]||pressure.toUpperCase())+' · ORBITÆ '+roman(Math.max(1,Math.floor(w.progress)+1)),face:'sc',size:1},
    {text:'SUMMA '+commas(w.score)+' · ASTERISMI '+(w.constellationsCompleted?roman(w.constellationsCompleted):'—'),face:'sc',size:1},
    {text:engraverCredit(),face:'italic',size:.84}
  ];
}
function drawReviewTablet(w){
  if(eraId()!==0||plainPlate())return;
  const rows=reviewTabletRows(w),size=Math.max(8.5,9.6*scale),lineH=size*1.5,padY=size*.9;
  ctx.save();
  let width=0;for(const r of rows){ctx.font=r.face==='italic'?plateFace(size*r.size,'text','italic'):plateFace(size*r.size,'sc');width=Math.max(width,ctx.measureText(r.text).width);}
  width=Math.min(W-frameBand()*2-60,width+size*3);
  const height=rows.reduce((h,r)=>h+lineH*r.size,0)+padY*2,cx=W*.5,top=sy(w.player.y+w.height*.28);
  if(top>H||top+height<0){ctx.restore();return;}
  const out=pressCartoucheInset(width,height),left=cx-width*.5,t=(performance.now()-reviewOpenedAt)/1000;
  ctx.fillStyle=`rgba(${ink.base.paperRgb},${onPaper()?.9:.86})`;ctx.fillRect(left,top,width,height);
  drawPressCartouche(left-out.x,top-out.y,width+out.x*2,height+out.y*2,ink.base.inkStrong,onPaper()?.6:.42,frameWide()?1:.75,70219);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=ink.frame.text;
  let y=top+padY;
  rows.forEach((r,i)=>{
    const rs=size*r.size,lh=lineH*r.size;
    ctx.font=r.face==='italic'?plateFace(rs,'text','italic'):plateFace(rs,'sc');
    writeText(ctx,r.text,cx,y+lh*.5,reducedMotion?1:clamp((t-.25-i*.22)/.5,0,1),{size:rs,nib:false});
    y+=lh;
  });
  ctx.restore();
}
// ---------- Input: drag or wheel, nothing automatic ----------
let reviewPointerId=null,reviewLastY=0;
game.addEventListener('pointerdown',e=>{
  if(!reviewing||e.target.closest('button')||!e.isPrimary)return;
  reviewPointerId=e.pointerId;reviewLastY=e.clientY;
  game.classList.add('review-dragging');
  if(canvas.setPointerCapture)try{canvas.setPointerCapture(e.pointerId);}catch(_){}
});
game.addEventListener('pointermove',e=>{
  if(!reviewing||e.pointerId!==reviewPointerId)return;
  panReviewBy(-(e.clientY-reviewLastY)/scale);reviewLastY=e.clientY;
});
function endReviewDrag(e){
  if(reviewPointerId===null||e.pointerId!==reviewPointerId)return;
  reviewPointerId=null;game.classList.remove('review-dragging');
}
game.addEventListener('pointerup',endReviewDrag);
game.addEventListener('pointercancel',endReviewDrag);
game.addEventListener('wheel',e=>{
  if(!reviewing)return;
  e.preventDefault();panReviewBy(e.deltaY/scale);
},{passive:false});
window.addEventListener('keydown',e=>{
  if(reviewing&&e.code==='Escape'){e.preventDefault();closeReview();}
});
$('review-open').addEventListener('click',()=>openReview());
$('review-close').addEventListener('click',closeReview);
$('review-last').addEventListener('click',()=>{const rec=loadLastReplay();if(rec)openReview(rec,'intro');});
// ---------- The plate in miniature, on the colophon ----------
// The end leaf used to cover the chart the player had just drawn and show none of it. A period atlas
// that had a long coast to print laid it across a folding plate, cut into strips and set one under the
// next; the colophon carries the whole run the same way, small: rebuilt from its own log (replayRun, the
// same pass the review opens), laid on its side so the climb reads left to right, and folded into as many
// strips as give it the largest scale. The dried route, every body it was taken on, the figures it closed
// and where it ended — the image a run is remembered by, and the one worth keeping.
function paintEndMiniature(){
  const c=$('end-miniature');if(!c)return;
  const show=eraId()===0&&!plainPlate()&&!!replayLog&&replayLog.releases&&replayLog.releases.length>0;
  c.hidden=!show;if(!show||!c.getContext)return;
  const w=c.clientWidth,h=c.clientHeight;if(!(w>0&&h>0))return;
  let run;try{run=replayRun(replayLog);}catch(_){c.hidden=true;return;}
  const path=run.inkPath||[];if(path.length<2){c.hidden=true;return;}
  c.width=Math.max(1,Math.round(w*DPR));c.height=Math.max(1,Math.round(h*DPR));
  const g=c.getContext('2d');if(!g)return;
  g.setTransform(DPR,0,0,DPR,0,0);g.clearRect(0,0,w,h);
  let y0=Infinity,y1=-Infinity;for(const p of path){y0=Math.min(y0,p.y);y1=Math.max(y1,p.y);}
  const width=run.width||440,length=Math.max(1,y1-y0)+width*.1,pad=3,fold=4;
  // The number of strips that prints the run largest: more strips buy length, and cost breadth.
  let strips=1,unit=0;
  for(let k=1;k<=4;k++){const s=Math.min((h-pad*2-(k-1)*fold)/k/width,(w-pad*2)*k/length);if(s>unit){unit=s;strips=k;}}
  const bandH=width*unit,seg=length/strips,top=(h-(bandH*strips+fold*(strips-1)))/2;
  const paper=onPaper(),rgb=paper?ink.base.inkStrong:ink.base.inkSoft,rubric=ink.press.rubric;
  // A world point to its place in strip k: world x across the strip, the climb (y falling) along it.
  const at=(x,y,k)=>[pad+((y1+width*.05)-y-k*seg)*unit,top+k*(bandH+fold)+(x+width/2)*unit];
  for(let k=0;k<strips;k++){
    const by=top+k*(bandH+fold);
    burinRect(g,pad-1,by-1,w-pad*2+2,bandH+2,rgb,paper?.5:.38,.5,90901+k);
    g.save();g.beginPath();g.rect(pad,by,w-pad*2,bandH);g.clip();
    // Hazards as the small cross a chart marks a danger with, bodies as the rings they were taken on.
    g.strokeStyle=`rgba(${rgb},${paper?.28:.22})`;g.lineWidth=.5;
    for(const hz of run.hazards||[]){const [px,py]=at(hz.x,hz.y,k),r=Math.max(1,hz.r*unit*.6);g.beginPath();g.moveTo(px-r,py-r);g.lineTo(px+r,py+r);g.moveTo(px+r,py-r);g.lineTo(px-r,py+r);g.stroke();}
    for(const n of run.nodes||[]){
      if(!n.visited)continue;
      const [px,py]=at(n.x,n.y,k);if(px<-4||px>w+4)continue;
      g.strokeStyle=`rgba(${rgb},${paper?.55:.45})`;g.lineWidth=.55;g.beginPath();g.arc(px,py,Math.max(.9,n.r*unit),0,TAU);g.stroke();
    }
    // The figures the run closed, struck in the rubricator's colour as the press strikes them on the chart.
    for(const chart of run.constellations||[]){
      if(!chart.completed)continue;
      g.strokeStyle=`rgba(${rubric},${paper?.75:.7})`;g.lineWidth=.7;g.beginPath();
      chart.stars.forEach((s,i)=>{const [px,py]=at(s.x,s.y,k);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();
      g.fillStyle=`rgba(${rubric},.85)`;for(const s of chart.stars){const [px,py]=at(s.x,s.y,k);g.beginPath();g.arc(px,py,1,0,TAU);g.fill();}
    }
    // The route, in one continuous dried line.
    g.strokeStyle=`rgba(${rgb},${paper?.85:.75})`;g.lineWidth=.7;g.lineJoin='round';g.beginPath();
    path.forEach((p,i)=>{const [px,py]=at(p.x,p.y,k);i?g.lineTo(px,py):g.moveTo(px,py);});g.stroke();
    g.restore();
  }
  // Where it ended: a small blot of the run's own ink at the last point of the route.
  const last=path[path.length-1],k=clamp(Math.floor(((y1+width*.05)-last.y)/seg),0,strips-1),[ex,ey]=at(last.x,last.y,k);
  g.fillStyle=`rgba(${mixRgb(trailInk().blotWet,trailInk().blotDry,.4)},.8)`;g.beginPath();g.arc(ex,ey,1.8,0,TAU);g.fill();
}
