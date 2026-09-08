'use strict';
/* Orbit · src/review.js
   The finished plate, read back rather than played: a free-scrolling camera over a world rebuilt by
   replayRun(), with nothing on it that only made sense while the ink was still wet. */
// ---------- Reviewing a finished run ----------
let reviewWorld=null,reviewCameraY=0,reviewReturnScreen='end';
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
  reviewWorld=replayRun(l);
  reviewing=true;reviewReturnScreen=returnTo||'end';
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
  drawAtmosphere(0,null);drawRenaissanceGrid();drawGravitationalLenses();
  ctx.save();
  for(const g of world.nebulas)revealHazard(g,drawHazard);
  revealConnections(drawConnections);drawConstellations();
  for(const n of world.nodes)drawNode(n,null);
  for(const h of world.hazards)revealHazard(h,drawHazard);
  // The route actually flown, and the angle every departure and landing was measured at — see
  // replayRun() in src/replay.js, which surveys the whole run again as it rebuilds it.
  drawInkPath();drawSurveys();
  drawImpressum();
  ctx.restore();
  drawPlateFrame();
  world=savedWorld;
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
