'use strict';
/* Orbit · src/recede.js
   How the old century gives way when the Journey changes century inside a run (JOURNEY.md §1.3 step 6):
   each medium fails in its own material, as docs/archive/eras/THE-FRONTIER.md sets out era by era. */
// ---------- The old medium, failing ----------
// When the century changes, the frame as it last stood is taken whole (beginEraGrowth in src/frame.js) and a
// working copy of it is laid over the new century every frame while a circle grows from the body landed on.
// That copy is not cut back by a clean circle: each frame the old medium is worn away at the circle's edge by
// the failure its own material actually suffers, and the copy only ever loses — nothing worn away comes back.
// Every technique below is paint on that copy and on a handful of falling fragments; none reads the old
// century's hand or tokens, which are already off the press, so any century can recede under any other.
// A fragment's colour is read off the still itself, once, from a small sample of it taken at the start.
const RECEDE_SAMPLE=8;
function recedeBegin(g){
  const w=Math.max(1,Math.ceil(W/RECEDE_SAMPLE)),h=Math.max(1,Math.ceil(H/RECEDE_SAMPLE));
  g.parts=[];g.done=new Set();g.clock=0;g.rng=seeded((Math.floor((g.x||0)*97+(g.y||0)*13)>>>0)^0x5ec0de);
  try{
    g.layer=makeCanvas(g.snap.width,g.snap.height);g.layer.getContext('2d').drawImage(g.snap,0,0);
    const s=makeCanvas(w,h),c=s.getContext('2d');c.drawImage(g.snap,0,0,w,h);
    const im=c.getImageData&&c.getImageData(0,0,w,h);g.sample=im&&im.data&&im.data.length>=w*h*4?{w,h,data:im.data}:null;
  }catch(_){g.layer=g.layer||null;g.sample=null;}
}
function recedeColour(g,x,y){
  const s=g.sample;if(!s)return [120,110,100];
  const i=(clamp(Math.floor(y/RECEDE_SAMPLE),0,s.h-1)*s.w+clamp(Math.floor(x/RECEDE_SAMPLE),0,s.w-1))*4;
  return [s.data[i],s.data[i+1],s.data[i+2]];
}
// A stable hash for a cell or a vertex, so an edge keeps its shape from one frame to the next.
const recedeHash=(a,b)=>{let h=(a*374761393+b*668265263)>>>0;h=(h^(h>>>13))*1274126177>>>0;return (h^(h>>>16))/4294967296;};
function recedeErase(l,draw){l.save();l.globalCompositeOperation='destination-out';draw(l);l.restore();}
// A fragment of the old medium falling away: a spalled chip, a lifted flake, a dropped tile. Drawn over the
// new century, above the copy, with its own weight and a fade.
function recedePart(g,x,y,size,kind){
  if(reducedMotion||g.parts.length>140)return;
  const r=g.rng,[cr,cg,cb]=recedeColour(g,x,y),a=Math.atan2(y-g.cy,x-g.cx);
  const span=kind==='flake'?.45+r()*.3:.7+r()*.6;
  g.parts.push({x,y,vx:Math.cos(a)*(20+r()*50)+(r()-.5)*30,vy:Math.sin(a)*(20+r()*40)-20*r(),rot:r()*TAU,vr:(r()-.5)*6,size,kind,life:0,span,col:`${cr},${cg},${cb}`,seed:r()});
}
function recedeDrawParts(g,dt){
  if(!g.parts.length)return;
  ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);
  for(const p of g.parts){
    p.life+=dt;p.vy+=(p.kind==='bit'?0:420)*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
    const a=clamp(1-p.life/p.span,0,1);if(a<=0)continue;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.kind==='chip'||p.kind==='flake'?p.rot:0);ctx.globalAlpha=a;ctx.fillStyle=`rgb(${p.col})`;
    if(p.kind==='chip'){const s=p.size;ctx.beginPath();ctx.moveTo(-s*.6,-s*.3);ctx.lineTo(s*.5,-s*.5);ctx.lineTo(s*.2,s*.6);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.6;ctx.stroke();}
    else{const s=p.size;ctx.fillRect(-s/2,-s/2,s,s);if(p.kind==='flake'){ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=.6;ctx.strokeRect(-s/2,-s/2,s,s);}}
    ctx.restore();
  }
  ctx.restore();
  g.parts=g.parts.filter(p=>p.life<p.span);
}
// The edge worn along a ring of vertices whose radii are jittered by a stable hash: a spall's edge is sharp
// and faceted, never a gradient (THE-FRONTIER.md, era I), and an ink burn's is ragged on a finer scale.
function recedePolygon(l,cx,cy,R,n,amp,seed){
  l.beginPath();
  for(let i=0;i<n;i++){const a=i/n*TAU,k=R*(1+amp*(recedeHash(i,seed)-.5)*2);if(i)l.lineTo(cx+Math.cos(a)*k,cy+Math.sin(a)*k);else l.moveTo(cx+Math.cos(a)*k,cy+Math.sin(a)*k);}
  l.closePath();
}
// A grid of cells lost one by one as the edge reaches each, a little early or late by the cell's own hash, so
// the edge advances in whole pieces: lifted plaster, a dropped mosaic tile, a flipped block.
function recedeCells(g,l,cx,cy,R,cell,lead,onLose){
  const cols=Math.ceil(W/cell),rows=Math.ceil(H/cell);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const key=j*cols+i;if(g.done.has(key))continue;
    const x=(i+.5)*cell,y=(j+.5)*cell,d=Math.hypot(x-cx,y-cy)-recedeHash(i,j)*lead;
    if(d<R){g.done.add(key);onLose(i*cell,j*cell,x,y);}
  }
}
// A ring just ahead of the edge, painted onto what is left of the old medium and nowhere else.
function recedeAhead(l,cx,cy,R,width,stops){
  const gr=l.createRadialGradient(cx,cy,Math.max(0,R),cx,cy,R+width);
  for(const [at,colour] of stops)gr.addColorStop(at,colour);
  l.save();l.globalCompositeOperation='source-atop';l.fillStyle=gr;l.beginPath();l.arc(cx,cy,R+width,0,TAU);l.fill();l.restore();
}
// The seven failures, keyed by the century that is giving way (the eighth never gives way to another). Each is handed the working copy's context (in
// CSS pixels), the circle's centre and radius, and the frame's step.
const RECEDE={
  // I · the Rock: the limestone surface spalls. The edge is broken into sharp facets that change as it
  // advances, and chips break off it and fall.
  1(g,l,cx,cy,R){
    recedeErase(l,c=>{recedePolygon(c,cx,cy,R,46,.14,Math.floor(R/22));c.fill();});
    if(R>4)for(let k=0;k<3;k++){const a=g.rng()*TAU,r=R*(1.02+.1*g.rng());recedePart(g,cx+Math.cos(a)*r,cy+Math.sin(a)*r,3+g.rng()*6,'chip');}
  },
  // II · the Ceiling: salts bloom pale on the plaster first, then the secco lifts in blocky flakes.
  2(g,l,cx,cy,R){
    recedeAhead(l,cx,cy,R,34,[[0,'rgba(246,242,228,.55)'],[1,'rgba(246,242,228,0)']]);
    recedeCells(g,l,cx,cy,R,14,18,(x,y,mx,my)=>{recedeErase(l,c=>c.fillRect(x,y,14,14));if(g.rng()<.03&&g.parts.length<24)recedePart(g,mx,my,10,'flake');});
  },
  // III · the Scroll: the ink bleeds outward into soft stains and the paper foxes before it thins to nothing,
  // softer and slower than any other edge.
  3(g,l,cx,cy,R){
    recedeAhead(l,cx,cy,R,48,[[0,'rgba(92,58,30,.45)'],[.5,'rgba(120,80,40,.18)'],[1,'rgba(120,80,40,0)']]);
    recedeErase(l,c=>{const gr=c.createRadialGradient(cx,cy,Math.max(0,R-40),cx,cy,R+6);gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.beginPath();c.arc(cx,cy,R+6,0,TAU);c.fill();});
    if(!reducedMotion&&g.rng()<.5){const a=g.rng()*TAU,r=R+14+g.rng()*40,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      l.save();l.globalCompositeOperation='source-atop';l.fillStyle='rgba(140,84,42,.22)';l.beginPath();l.arc(x,y,2+g.rng()*5,0,TAU);l.fill();l.restore();}
  },
  // IV · the Astrolabe: the patina pools dark from the grooves outward, until the geometry is left with
  // nothing to be read by. (A desaturation ahead of it was tried and set aside: on the manuscript's cream it
  // read as a cold grey bruise rather than as tarnish.)
  4(g,l,cx,cy,R){
    recedeAhead(l,cx,cy,R,30,[[0,'rgba(58,70,48,.55)'],[.6,'rgba(70,82,56,.18)'],[1,'rgba(70,82,56,0)']]);
    recedeErase(l,c=>{c.beginPath();c.arc(cx,cy,Math.max(0,R),0,TAU);c.fill();});
  },
  // V · the atlas: the iron-gall ink burns its own drawing out of the sheet, browning along the edge and
  // eating ragged holes through it just ahead.
  5(g,l,cx,cy,R){
    recedeAhead(l,cx,cy,R,26,[[0,'rgba(96,52,20,.7)'],[1,'rgba(120,70,30,0)']]);
    recedeErase(l,c=>{recedePolygon(c,cx,cy,R,90,.035,7);c.fill();
      for(let k=0;k<2;k++){const a=g.rng()*TAU,r=R+4+g.rng()*22;recedePolygon(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r,2+g.rng()*4,7,.5,k+Math.floor(R));c.fill();}});
  },
  // VI · the Lens: the plate fogs, flattening the picture to grey ahead of the edge, and the emulsion frills,
  // its border lifting in a pale curl as it lets go.
  6(g,l,cx,cy,R){
    recedeAhead(l,cx,cy,R,70,[[0,'rgba(150,150,146,.75)'],[.7,'rgba(150,150,146,.2)'],[1,'rgba(150,150,146,0)']]);
    recedeErase(l,c=>{c.beginPath();c.arc(cx,cy,Math.max(0,R),0,TAU);c.fill();});
    if(R>3){ctx.save();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.strokeStyle='rgba(60,50,40,.25)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(cx,cy,R+3,0,TAU);ctx.stroke();
      ctx.strokeStyle='rgba(236,232,220,.8)';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.stroke();ctx.restore();}
  },
  // VII · the Flyby: loss of signal. Whole tiles of the mosaic drop out as the edge reaches them, and scan
  // lines just ahead of it go flat: a dropped frame, never snow.
  7(g,l,cx,cy,R){
    recedeCells(g,l,cx,cy,R,24,30,(x,y)=>{recedeErase(l,c=>c.fillRect(x,y,24,24));});
    if(!reducedMotion)for(let k=0;k<3;k++){const y=cy+(g.rng()-.5)*2*(R+40),half=Math.sqrt(Math.max(0,(R+40)**2-(y-cy)**2));
      if(half<=0)continue;l.save();l.globalCompositeOperation='source-atop';l.fillStyle='rgba(58,60,62,.9)';l.fillRect(cx-half,y,half*2,2+g.rng()*3);l.restore();}
  }
  // VIII · the Probe has no century above it to give way to, so its bit flips are never drawn here.
};
// One frame of the old medium giving way, drawn over the new century. Returns false once there is no copy to
// wear, so the caller falls back to the plain circle.
function recedeFrame(g,cx,cy,R,dt){
  if(!g.layer)return false;
  g.cx=cx;g.cy=cy;g.clock+=dt;
  const l=g.layer.getContext('2d');l.save();l.setTransform(DPR,0,0,DPR,0,0);
  (RECEDE[g.era]||RECEDE[5])(g,l,cx,cy,Math.max(0,R),dt);
  l.restore();
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(g.layer,0,0);ctx.restore();
  recedeDrawParts(g,dt);
  return true;
}
