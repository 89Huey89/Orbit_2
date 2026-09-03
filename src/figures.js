'use strict';
/* Orbit · src/figures.js
   Constellation figures, nodes, gravitational lenses, hazards, and the aim guide. */
// ---------- Constellation figures: the plate each fork route is engraved for ----------
// Behind the three stars of a fork (THE NEEDLE / THE SAIL / THE LYRE / THE CROWN), draw the figure the
// route is named for, as Hevelius or Bayer would engrave it: broken ink contours and stipple that are
// always present once the frame is on the page, fine hatching that fills in as each star is captured,
// and a last dilute wash once the whole chart is complete. An expired chart fades to hairlines. The
// figure is baked once per (chart, plate, side, scale) into an offscreen layer and blitted per frame.
definePlate('figures',{
  night:{contour:'222,190,127',hatch:'222,190,127',wash:'222,190,127'},
  paper:{contour:'150,100,32',hatch:'58,42,28',wash:'58,42,28'}
});
const figureLayers=new Map();
function figFrame(chart){
  const s=chart.stars,side=(s[0].x+s[1].x+s[2].x)>=0?1:-1;
  const minX=Math.min(s[0].x,s[1].x,s[2].x),maxX=Math.max(s[0].x,s[1].x,s[2].x);
  const minY=Math.min(s[0].y,s[1].y,s[2].y),maxY=Math.max(s[0].y,s[1].y,s[2].y),pad=78;
  return {side,originX:minX-pad,originY:minY-pad,w:maxX-minX+pad*2,h:maxY-minY+pad*2};
}
// A parametric spine running bottom-to-top through the three stars (their fixed generation order),
// extended a little past both ends. Its perpendicular always points to the outward side of the fork,
// away from the main route, so the figure is mirrored by `side` to face the route it branches from.
function figSpine(p0,p1,p2,side,ext){
  const dir0=Math.atan2(p1.y-p0.y,p1.x-p0.x),dir2=Math.atan2(p2.y-p1.y,p2.x-p1.x);
  const chain=[{x:p0.x-Math.cos(dir0)*ext,y:p0.y-Math.sin(dir0)*ext},p0,p1,p2,{x:p2.x+Math.cos(dir2)*ext,y:p2.y+Math.sin(dir2)*ext}];
  const segLen=chain.slice(1).map((b,i)=>Math.hypot(b.x-chain[i].x,b.y-chain[i].y)||.001);
  const total=segLen.reduce((a,b)=>a+b,0);
  return {total,at(t){
    let d=clamp(t,0,1)*total,i=0;
    while(i<segLen.length-1&&d>segLen[i]){d-=segLen[i];i++;}
    const a=chain[i],b=chain[i+1],frac=d/segLen[i],tx=(b.x-a.x)/segLen[i],ty=(b.y-a.y)/segLen[i];
    let px=-ty,py=tx;if(px*side<0){px=-px;py=-py;}
    return {x:lerp(a.x,b.x,frac),y:lerp(a.y,b.y,frac),tx,ty,px,py};
  }};
}
function figRibbon(spine,fn,steps){
  const pts=[];for(let i=0;i<=steps;i++){const t=i/steps,s=spine.at(t),o=fn(t);pts.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  return pts;
}
// A hand-inked contour: short broken segments with a little jitter, never a mechanical curve.
function figInk(g,pts,rng,jag,gap,width){
  g.lineWidth=width;g.beginPath();
  for(let i=0;i<pts.length-1;i++){
    if(rng()<gap)continue;
    const a=pts[i],b=pts[i+1];
    g.moveTo(a.x+(rng()-.5)*jag,a.y+(rng()-.5)*jag);g.lineTo(b.x+(rng()-.5)*jag,b.y+(rng()-.5)*jag);
  }
  g.stroke();
}
function figStipple(g,spine,leftFn,rightFn,n,rng,size){
  for(let i=0;i<n;i++){
    const t=rng(),s=spine.at(t),o=lerp(leftFn(t),rightFn(t),rng());
    g.fillRect(s.x+s.px*o,s.y+s.py*o,size,size);
  }
}
function figHatch(g,spine,leftFn,rightFn,n,rng){
  for(let i=0;i<n;i++){
    const t=rng(),s=spine.at(t),o=lerp(leftFn(t),rightFn(t),rng()),len=2+rng()*3;
    const x=s.x+s.px*o,y=s.y+s.py*o,a=Math.atan2(s.ty,s.tx)+Math.PI/2+(rng()-.5)*.6;
    g.beginPath();g.moveTo(x-Math.cos(a)*len,y-Math.sin(a)*len);g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);g.stroke();
  }
}
function figWash(g,left,right){
  g.beginPath();g.moveTo(left[0].x,left[0].y);
  for(const p of left)g.lineTo(p.x,p.y);
  for(let i=right.length-1;i>=0;i--)g.lineTo(right[i].x,right[i].y);
  g.closePath();g.fill();
}
// A long sailmaker's needle: a thin tapering shaft with a pierced eye near the blunt end, and a
// curling thread that doubles back through all three stars.
function figNeedle(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,54),steps=48;
  const halfW=t=>t<.05?4.2:t>.9?Math.max(.4,5.6*(1-(t-.9)/.1)):5.6;
  const left=figRibbon(spine,t=>-halfW(t),steps),right=figRibbon(spine,t=>halfW(t),steps);
  g.strokeStyle=state.contour;figInk(g,left,rng,.7,.08,1.3);figInk(g,right,rng,.7,.08,1.3);
  const eye=spine.at(.04);g.save();g.translate(eye.x+eye.px*8,eye.y+eye.py*8);g.rotate(Math.atan2(eye.ty,eye.tx));
  g.lineWidth=1.3;g.beginPath();g.ellipse(0,0,7,3.6,0,0,TAU);g.stroke();
  g.beginPath();g.ellipse(0,0,3.2,1.4,0,0,TAU);g.stroke();g.restore();
  const thread=[];for(let i=0;i<=60;i++){const t=.08+i/60*.86,s=spine.at(t),amp=20*Math.sin(t*Math.PI),o=Math.sin(t*11+side)*amp;thread.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  g.lineWidth=1;figInk(g,thread,rng,.7,.1,1);
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>-halfW(t),t=>halfW(t),Math.round(46*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-halfW(t)-2,t=>halfW(t)+2,26,rng,.9);
}
// A billowing lateen sail on a spar: a near-straight luff close to the spine and a bulging leech that
// bellies out through the middle star.
function figSail(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,46),steps=52;
  const inner=()=>-2.6,outer=t=>6+Math.pow(Math.sin(Math.PI*clamp(t,.04,.96)),1.3)*44;
  const left=figRibbon(spine,inner,steps),right=figRibbon(spine,outer,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.6,.06,1.5);figInk(g,right,rng,1,.05,1.2);
  figInk(g,[left[2],right[2]],rng,.5,0,1);figInk(g,[left[steps-2],right[steps-2]],rng,.5,0,1);
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,inner,outer,Math.round(60*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,inner,outer,30,rng,.9);
}
// A classical chelys lyre: two curved arms rising from a soundbox to a crossbar, with strings strung
// between, the soundbox low on the frame and the yoke high.
function figLyre(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,40),steps=48;
  const armOut=t=>9+Math.sin(Math.PI*clamp(t,0,1))*34,armIn=t=>5+Math.sin(Math.PI*clamp(t,0,1))*17;
  const leftOut=figRibbon(spine,t=>-armOut(t),steps),leftIn=figRibbon(spine,t=>-armIn(t),steps);
  const rightIn=figRibbon(spine,t=>armIn(t),steps),rightOut=figRibbon(spine,t=>armOut(t),steps);
  g.strokeStyle=state.contour;
  figInk(g,leftOut,rng,.7,.07,1.3);figInk(g,leftIn,rng,.7,.09,1);
  figInk(g,rightIn,rng,.7,.09,1);figInk(g,rightOut,rng,.7,.07,1.3);
  const box=spine.at(.06);g.save();g.translate(box.x,box.y);g.rotate(Math.atan2(box.ty,box.tx));
  g.lineWidth=1.4;g.beginPath();g.ellipse(0,0,19,10,0,0,TAU);g.stroke();g.restore();
  const i92=Math.round(steps*.92),yl=leftIn[i92],yr=rightIn[i92];
  g.lineWidth=1.5;g.beginPath();g.moveTo(yl.x,yl.y);g.lineTo(yr.x,yr.y);g.stroke();
  for(let i=0;i<7;i++){
    const u=-1+i/3,t0=.14,t1=.9,a=spine.at(t0),b=spine.at(t1);
    const x0=a.x+a.px*u*armIn(t0)*.8,y0=a.y+a.py*u*armIn(t0)*.8,x1=b.x+b.px*u*armIn(t1)*.8,y1=b.y+b.py*u*armIn(t1)*.8;
    g.lineWidth=.7;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  }
  if(state.hatchFrac>0){
    g.strokeStyle=state.hatch;
    figHatch(g,spine,t=>-armOut(t),t=>-armIn(t),Math.round(20*state.hatchFrac),rng);
    figHatch(g,spine,armIn,armOut,Math.round(20*state.hatchFrac),rng);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,leftOut,leftIn);figWash(g,rightIn,rightOut);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-armOut(t),armOut,22,rng,.7);
}
// A pointed diadem: a thin band that arcs past the stars with occasional spikes, and a jewel collar
// set clear of each star's rim.
function figCrown(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,34),steps=48;
  const band=t=>5+(Math.abs(Math.sin(t*Math.PI*2.4))>.8?17:0);
  const left=figRibbon(spine,t=>-band(t)*.45,steps),right=figRibbon(spine,band,steps);
  g.strokeStyle=state.contour;g.lineWidth=1.2;figInk(g,left,rng,.6,.06,1.2);figInk(g,right,rng,.6,.06,1.2);
  for(const p of [p0,p1,p2]){
    g.lineWidth=1.2;g.beginPath();g.arc(p.x,p.y,p.r+14,0,TAU);g.stroke();
    g.beginPath();g.arc(p.x,p.y,p.r+21,-.65,.65);g.stroke();
  }
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>-band(t)*.45,band,Math.round(40*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-band(t)*.45-2,t=>band(t)+2,24,rng,.9);
}
const FIGURE_SHAPES=[figNeedle,figSail,figLyre,figCrown];
function buildFigureLayer(chart,frame,count,curScale){
  const w=Math.max(1,Math.ceil(frame.w*curScale)),h=Math.max(1,Math.ceil(frame.h*curScale));
  const c=makeCanvas(w,h),g=c.getContext('2d');
  g.scale(curScale,curScale);g.translate(-frame.originX,-frame.originY);g.lineJoin='round';g.lineCap='round';
  const rng=seeded(48200+chart.id*104729),pal=ink.figures,expired=chart.expired,fade=expired?.24:1;
  const contourA=(onPaper()?.4:.3)*fade,hatchA=(onPaper()?.17:.12)*fade,washA=onPaper()?.1:.07;
  const state={contour:`rgba(${pal.contour},${contourA})`,hatch:`rgba(${pal.hatch},${hatchA})`,
    hatchFrac:expired?0:count/3,wash:(!expired&&chart.completed)?`rgba(${pal.wash},${washA})`:null};
  const [p0,p1,p2]=chart.stars;
  FIGURE_SHAPES[chart.id](g,p0,p1,p2,frame.side,rng,state);
  // Never let the ink cross the orbit rings, release marks, or the pricked guide around a star.
  g.save();g.globalCompositeOperation='destination-out';g.fillStyle='#000';
  for(const s of chart.stars){g.beginPath();g.arc(s.x,s.y,s.r+8,0,TAU);g.fill();}
  g.restore();
  return {canvas:c,count,completed:chart.completed,expired:chart.expired};
}
function drawConstellationFigure(chart){
  if(chart.stars.length<3)return;
  if(sy(chart.entry.y)<-190||sy(chart.stars[2].y)>H+210)return;
  const frame=figFrame(chart),count=chart.stars.filter(n=>n.visited).length;
  const bucket=Math.round(scale*20),key=chart.id+':'+plateName+':'+frame.side+':'+bucket;
  let layer=figureLayers.get(key);
  if(!layer||layer.count!==count||layer.completed!==chart.completed||layer.expired!==chart.expired){
    layer=buildFigureLayer(chart,frame,count,scale);figureLayers.set(key,layer);
  }
  const x=sx(frame.originX),y=sy(frame.originY);
  if(x>W||y>H||x+layer.canvas.width<0||y+layer.canvas.height<0)return;
  ctx.drawImage(layer.canvas,x,y);
}

function drawConstellations(){
  for(const chart of world.constellations){
    drawConstellationFigure(chart);
    if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)continue;
    const count=chart.stars.filter(n=>n.visited).length,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
    ctx.save();ctx.lineWidth=.8*scale;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],lit=chart.completed||(a.visited&&b.visited),dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1;
      const start=a.cap+10,end=b.cap+10,alpha=chart.expired?.065:lit?.55:.25;
      const ax=sx(a.x+dx/d*start),ay=sy(a.y+dy/d*start),bx=sx(b.x-dx/d*end),by=sy(b.y-dy/d*end);
      if(lit&&!chart.expired){
        ctx.setLineDash([]);engravedLine(ax,ay,bx,by,ink.marks.constellationLine,alpha,.8*scale,a.id*131+b.id);
      }else{
        ctx.strokeStyle=`rgba(${ink.marks.constellationLine},${alpha})`;ctx.setLineDash(lit?[]:[3*scale,7*scale]);
        ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    if(chart.completed){
      const first=chart.stars[0],last=chart.stars[2];ctx.strokeStyle=`rgba(${ink.marks.constellationComplete},${.16+Math.min(.22,chart.flash*.12)})`;ctx.lineWidth=.55*scale;
      ctx.beginPath();ctx.moveTo(sx(first.x),sy(first.y));ctx.lineTo(sx(last.x),sy(last.y));ctx.stroke();
    }
    for(const n of chart.stars){
      const x=sx(n.x),y=sy(n.y)-(n.r+15)*scale;
      ctx.strokeStyle=`rgba(${ink.marks.constellationStar},${chart.expired?.2:n.visited?.9:.6})`;ctx.fillStyle=n.visited?ink.marks.constellationFillLit:ink.marks.constellationFillDark;ctx.lineWidth=.8;
      ctx.beginPath();
      for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2,r=(i%2?1.4:4.8)*scale;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
      ctx.closePath();ctx.fill();ctx.stroke();
    }
    const label=chart.completed?chart.stars[2]:chart.stars.find(n=>!n.visited);
    if(label&&!chart.expired&&(!chart.completed||chart.flash>0)){
      const x=clamp(sx(label.x),20,W-20),y=sy(label.y)-(label.r+46)*scale;
      ctx.textAlign=label.x>0?'right':'left';ctx.font="14px 'IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationLabel},.8)`;ctx.fillText(chart.name,x,y);
      ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationCaption},.78)`;ctx.fillText(chart.completed?'COMPLETE · +60':count+' / 3 STARS · +60',x,y+16);
    }
    if(world.player.node===chart.entry&&chart.main[0]){
      const n=chart.main[0];ctx.textAlign='center';ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationHint},.66)`;ctx.fillText('WIDE ORBITS',sx(n.x),sy(n.y)-(n.r+26)*scale);
    }
    ctx.restore();
  }
}
// Captions ride above their planet, but flip underneath it when the node sits so high that the text would
// cross the frame's inner rule or run into the DOM score block in the middle of the HUD band. Returns the
// y offset in node-local coordinates, where 0 is the planet's centre.
function captionOffset(x,y,r,gap){
  const inner=frameBand()*.92+8,guard=Math.abs(x-W*.5)<104?Math.max(inner,hudBand()):inner;
  if(y-r-gap>=guard)return -(r+gap);
  let below=Math.max(r+gap+3,guard+12-y);
  const band=revealBand();
  if(band&&Math.abs(x-W*.5)<W*.45&&y+below>band.top&&y+below<band.bottom+12)below=band.bottom+12-y;
  return below;
}
function drawNode(n,aim){
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=aim&&aim.n.id===n.id;
  const x=sx(n.x),y=sy(n.y),r=(active?p.rad:n.r)*scale;
  if(y<-r*2||y>H+r*2)return;
  const gold=n.type==='gold',drift=n.type==='drift',fading=n.type==='fading',sling=n.type==='sling',shield=n.type==='shield';
  const rgb=drift?ink.marks.nodeDrift:fading?ink.marks.nodeFading:gold?ink.marks.nodeGold:shield?ink.marks.nodeShield:ink.marks.node;
  ctx.save();ctx.translate(x,y);
  if(world.state==='ready'&&n.row>1)ctx.globalAlpha=.35;
  if(used)ctx.globalAlpha=.2;
  const paper=onPaper(),glowKey=r.toFixed(2)+':'+active+':'+paper;
  if(n._glowKey!==glowKey){
    const glow=ctx.createRadialGradient(0,0,r*.2,0,0,r*2.1);
    // Ink does not glow: the night gradient is a coloured light bloom, the paper one a pale halo of raised, worn paper.
    if(paper){glow.addColorStop(0,`rgba(${ink.base.paperRgb},${active?.55:.2})`);glow.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);}
    else{glow.addColorStop(0,`rgba(${rgb},${active?.07:.026})`);glow.addColorStop(1,`rgba(${rgb},0)`);}
    n._glow=glow;n._glowKey=glowKey;
  }
  ctx.fillStyle=n._glow;ctx.fillRect(-r*2.1,-r*2.1,r*4.2,r*4.2);
  drawPlanet(glyph(n.seed,n.type,n.row,world.seed),n.r*scale,world.time);
  if(sling){
    const charge=active?world.charge():0,band=r*.73;
    for(let i=0;i<18;i++){
      const a=-Math.PI/2+i*TAU/18;
      ctx.strokeStyle=`rgba(${ink.marks.slingRing},.27)`;ctx.lineWidth=2.2*scale;ctx.beginPath();ctx.arc(0,0,band,a+.026,a+TAU/18-.026);ctx.stroke();
      const fill=clamp(charge*18-i,0,1);
      if(fill>0){ctx.strokeStyle=`rgba(${ink.marks.slingFill},.9)`;ctx.beginPath();ctx.arc(0,0,band,a+.026,a+.026+(TAU/18-.052)*fill);ctx.stroke();}
    }
    for(const a of [0,Math.PI]){
      ctx.save();ctx.rotate(a);ctx.strokeStyle=`rgba(${ink.marks.slingNotch},.6)`;ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(band-3,-3);ctx.lineTo(band,1);ctx.lineTo(band+3,-3);ctx.stroke();ctx.restore();
    }
    if(!used){
      ctx.textAlign='center';ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.slingLabel},.82)`;
      const pace=world.speedMultiplier().toFixed(1);
      ctx.fillText(active?(p.speed>=MAX_SPEED?'MAX SPEED  ·  ×'+pace:charge>=1?'SPEED HELD  ·  ×'+pace:'BUILDING SPEED  ·  ×'+pace):'SLINGSHOT STAR',0,active?r+28*scale:captionOffset(x,y,r,25*scale));
    }
  }
  {const ring=engravedRing(r,rgb,active?.59:target?.57:.25,.7,n.seed);ctx.drawImage(ring.canvas,-ring.size/2,-ring.size/2,ring.size,ring.size);}
  ctx.lineWidth=.45;ctx.strokeStyle=`rgba(${rgb},.19)`;ctx.beginPath();ctx.arc(0,0,r-2.5*scale,n.phase,n.phase+TAU*.78);ctx.stroke();
  ctx.strokeStyle=`rgba(${rgb},${target?.36:.11})`;ctx.setLineDash([1*scale,5*scale]);ctx.beginPath();ctx.arc(0,0,n.cap*scale,0,TAU);ctx.stroke();ctx.setLineDash([]);
  ctx.lineWidth=.5;ctx.strokeStyle=paper?`rgba(${ink.base.ink},.4)`:`rgba(${rgb},.16)`;ctx.beginPath();
  for(let i=0;i<48;i++){
    if(i%4===0)continue;
    const a=i/48*TAU;ctx.moveTo(Math.cos(a)*(r+3*scale),Math.sin(a)*(r+3*scale));ctx.lineTo(Math.cos(a)*(r+4.2*scale),Math.sin(a)*(r+4.2*scale));
  }
  ctx.stroke();
  ctx.strokeStyle=paper?`rgba(${ink.base.inkStrong},.6)`:`rgba(${rgb},.37)`;ctx.beginPath();
  for(let i=0;i<48;i+=4){
    const a=i/48*TAU;ctx.moveTo(Math.cos(a)*(r+3*scale),Math.sin(a)*(r+3*scale));ctx.lineTo(Math.cos(a)*(r+6.2*scale),Math.sin(a)*(r+6.2*scale));
  }
  ctx.stroke();
  if(active){
    for(const next of releaseTargets(n)){
      const d=Math.hypot(next.x-n.x,next.y-n.y),a=Math.atan2(next.y-n.y,next.x-n.x)-p.dir*Math.acos(clamp(p.rad/d,-1,1)),window=Math.asin(clamp(next.cap/d,0,.8));
      ctx.strokeStyle=next.routeRole==='star'||(sling&&next.id===n.shortcutId)?`rgba(${ink.marks.releaseWindowStar},.35)`:`rgba(${ink.marks.releaseWindowPlain},.24)`;ctx.lineWidth=1.5*scale;ctx.beginPath();ctx.arc(0,0,r,a-window,a+window);ctx.stroke();
      for(const path of orbitTangents({...n,r:p.rad},next,p.dir)){
        if(world.hazards.some(h=>segmentCircle(path.x,path.y,path.bx,path.by,h.x,h.y,gravityRadius(h))!==null))continue;
        ctx.strokeStyle=`rgba(${ink.marks.releaseMark},.92)`;ctx.lineWidth=2.2*scale;ctx.beginPath();ctx.arc(0,0,r,path.angle-.023,path.angle+.023);ctx.stroke();
      }
    }
    if(world.flightPreview?.curved&&aim?.perfect){
      ctx.strokeStyle=`rgba(${ink.marks.perfectPreview},.98)`;ctx.lineWidth=2.6*scale;ctx.beginPath();ctx.arc(0,0,r,p.angle-.038,p.angle+.038);ctx.stroke();
    }
    // A fading orbit visibly unravels in less than two revolutions.
    if(fading){const left=clamp(1-p.orbitTime/4.5,0,1);ctx.strokeStyle=left<.3?ink.marks.fadingCritical:ink.marks.fadingWarn;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,0,r+9*scale,-Math.PI/2,-Math.PI/2+TAU*left);ctx.stroke();}
  }
  if(target){
    ctx.strokeStyle=`rgba(${rgb},${aim.perfect?.78:.34})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,n.cap*scale+4,world.time*.3,world.time*.3+TAU*.72);ctx.stroke();
    if(aim.perfect){
      ctx.strokeStyle=`rgba(${ink.marks.perfectTarget},.8)`;ctx.lineWidth=1.5*scale;ctx.beginPath();ctx.arc(0,0,r,aim.entryAngle-.18,aim.entryAngle+.18);ctx.stroke();
    }
  }
  if(!used){
    ctx.font=`${Math.max(9,10*scale)}px 'IM Fell English',Georgia,serif`;ctx.textAlign='left';ctx.fillStyle=paper?`rgba(${ink.base.ink},.72)`:`rgba(${rgb},.48)`;ctx.fillText(gold?'+15':shield?'SHIELD':String(Math.floor(n.row)+1).padStart(2,'0'),r+12*scale,4*scale);
    if(drift){const dy=captionOffset(x,y,r,15),up=dy<0?1:-1;ctx.beginPath();ctx.strokeStyle=`rgba(${rgb},.45)`;ctx.lineWidth=.65;ctx.moveTo(-9,dy);ctx.bezierCurveTo(-3,dy-8*up,3,dy+8*up,9,dy);ctx.stroke();}
    if(world.captures<2&&!active&&n.row===Math.floor(world.progress)+1){ctx.textAlign='center';ctx.font=`${Math.max(9,9*scale)}px 'IM Fell English SC','IM Fell English',Georgia,serif`;ctx.fillStyle=paper?`rgba(${ink.base.ink},.75)`:`rgba(${ink.marks.next},.6)`;ctx.fillText('NEXT',0,captionOffset(x,y,r,24*scale));}
  }
  ctx.restore();
}
function drawGravitationalLenses(){
  for(const h of world.hazards){
    const x=sx(h.x),y=sy(h.y),outer=gravityRadius(h)*scale,inner=(h.r+1)*scale,diameter=outer*2;
    if(x+outer<0||x-outer>W||y+outer<0||y-outer>H)continue;
    if(!lensPatch)lensPatch=makeCanvas(640,640);
    const g=lensPatch.getContext('2d'),left=x-outer,top=y-outer;
    const sourceX=Math.max(0,left*DPR),sourceY=Math.max(0,top*DPR);
    const sourceRight=Math.min(canvas.width,(x+outer)*DPR),sourceBottom=Math.min(canvas.height,(y+outer)*DPR);
    const sw=sourceRight-sourceX,sh=sourceBottom-sourceY;if(sw<=0||sh<=0)continue;
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,640,640);
    g.drawImage(canvas,sourceX,sourceY,sw,sh,(sourceX/DPR-left)/diameter*640,(sourceY/DPR-top)/diameter*640,sw/(DPR*diameter)*640,sh/(DPR*diameter)*640);
    // Resample the actual atlas and starlight in clipped annuli. The warp
    // reaches zero at the edge; foreground targets and the player stay sharp.
    const twist=reducedMotion?0:Math.sin(world.time*.32+(h.phase||0))*.024;
    ctx.save();ctx.translate(x,y);
    for(let band=0;band<24;band++){
      const a=band/24,b=(band+1)/24,ro=lerp(outer,inner,a),ri=lerp(outer,inner,b);
      const weight=((a+b)/2)**2,magnify=1+.7*weight;
      ctx.save();ctx.beginPath();ctx.arc(0,0,ro+.2,0,TAU);ctx.arc(0,0,ri,TAU,0,true);ctx.closePath();ctx.clip();
      ctx.rotate(twist*weight);ctx.scale(magnify,magnify);ctx.drawImage(lensPatch,-outer,-outer,diameter,diameter);ctx.restore();
    }
    ctx.restore();
  }
}
function drawHazard(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale;if(y<-r*3||y>H+r*3)return;
  ctx.save();ctx.translate(x,y);const rng=seeded(h.seed),pulse=reducedMotion?1:.95+.05*Math.sin(world.time*1.2+(h.phase||0)),paper=onPaper();
  const pull=world.player.node?0:clamp(1-Math.hypot(world.player.x-h.x,world.player.y-h.y)/gravityRadius(h),0,1);
  // Ink does not glow: the paper plate drops the warm gravity-well halo and reads the pull only through the
  // rubrication accretion rings and the dark radiating hatch below.
  if(!paper){
    const halo=ctx.createRadialGradient(0,0,r*.7,0,0,r*3.4);halo.addColorStop(0,`rgba(${ink.marks.hazardHalo0},${(.25+pull*.12)*pulse})`);halo.addColorStop(.5,`rgba(${ink.marks.hazardHaloMid},.07)`);halo.addColorStop(1,`rgba(${ink.marks.hazardHaloEdge},0)`);ctx.fillStyle=halo;ctx.fillRect(-r*3.4,-r*3.4,r*6.8,r*6.8);
  }
  ctx.save();ctx.rotate(-.35);
  for(let i=0;i<4;i++){
    const rr=r*(1.64+i*.09);
    burinArc(ctx,0,0,rr,0,TAU,ink.marks.hazardAccretion,(.23-i*.04)*(1+pull*.5),(i===0?.9:.45)*scale,h.seed+i*29,{segments:20,skips:2,flatten:(.47+i*.028)/(1.64+i*.09)});
  }
  ctx.restore();
  {
    const buckets=new Map();
    for(let i=0;i<54;i++){
      const a=i/54*TAU,l=2+rng()*r*.42,base=.08+rng()*.27,bucket=Math.min(11,Math.floor((base-.08)/.27*12));
      let seg=buckets.get(bucket);if(!seg){seg=[];buckets.set(bucket,seg);}
      seg.push(Math.cos(a)*(r+3),Math.sin(a)*(r+3),Math.cos(a+.035)*(r+l+3),Math.sin(a+.035)*(r+l+3));
    }
    ctx.lineWidth=.5;
    for(const [bucket,seg] of buckets){
      ctx.strokeStyle=`rgba(${ink.marks.hazardHatch},${(.08+(bucket+.5)/12*.27)*pulse})`;
      ctx.beginPath();
      for(let j=0;j<seg.length;j+=4){ctx.moveTo(seg[j],seg[j+1]);ctx.lineTo(seg[j+2],seg[j+3]);}
      ctx.stroke();
    }
  }
  if(paper){
    // A pooled ink blot with a slightly ragged, hand-drawn edge rather than a clean printed circle.
    ctx.fillStyle=ink.marks.hazardCore;ctx.beginPath();
    const edges=20;
    for(let i=0;i<=edges;i++){const a=i/edges*TAU,jr=r*(1+(rng()-.5)*.14);const px=Math.cos(a)*jr,py=Math.sin(a)*jr;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}
    ctx.closePath();ctx.fill();
  }else{
    ctx.fillStyle=ink.marks.hazardCore;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.fill();
  }
  burinArc(ctx,0,0,r,0,TAU,ink.marks.hazardEdge,.62,.85,h.seed+3,{segments:28,skips:2});
  burinArc(ctx,-.7,-.3,r,Math.PI*1.04,Math.PI*1.82,ink.marks.hazardRim,.8,1.35,h.seed+11,{segments:14,skips:1});
  for(let i=0;i<6;i++)burinArc(ctx,0,0,r+3+i*1.35,Math.PI*(1+i*.05),Math.PI*(1.8-i*.04),ink.marks.hazardArcFaint,.12-i*.014,.5,h.seed+17+i,{segments:8,skips:1});
  burinArc(ctx,0,0,r+15,0,TAU,ink.marks.hazardOuter,.16,.4,h.seed+41,{segments:18,skips:3});ctx.restore();
}
function drawAim(aim){
  const p=world.player;if(!p.node||world.state==='dead')return;
  const preview=world.flightPreview,points=preview?.points;if(!points||points.length<2)return;
  const launch=world.launchVelocity(),speed=launch.speed,dx=launch.vx/speed,dy=launch.vy/speed,sling=p.node.type==='sling',end=points[points.length-1],blocked=!!preview.blocked;
  ctx.save();ctx.lineCap='round';
  const ax=sx(p.x+dx*12),ay=sy(p.y+dy*12),bx=sx(end.x),by=sy(end.y);
  // The course is pricked, not ruled: small burin wedges are set along the predicted path, spaced and sized
  // by the plate scale, opening slightly toward the destination. They creep forward with the flight unless
  // reduced motion is requested, in which case the pricking stands still.
  const guideRgb=blocked?ink.marks.aimBlockedStart:aim?ink.marks.aimLocked:ink.marks.aimDefault;
  const nearAlpha=blocked?.72:aim?.78:.5,farAlpha=blocked?.5:aim?.34:.12,weight=aim?1.15:.92;
  const legs=[];let total=0,px=ax,py=ay;
  for(let i=1;i<points.length;i++){
    if(points[i].distance<12)continue;
    const qx=sx(points[i].x),qy=sy(points[i].y),len=Math.hypot(qx-px,qy-py);
    if(len>.001){legs.push({x:px,y:py,ux:(qx-px)/len,uy:(qy-py)/len,len});total+=len;}
    px=qx;py=qy;
  }
  if(total>1){
    const gap=Math.max(4,8.5*scale),crawl=reducedMotion?0:(world.time*26*scale)%gap;
    let leg=0,walked=0,d=crawl;
    while(d<total&&leg<legs.length){
      while(leg<legs.length-1&&walked+legs[leg].len<d){walked+=legs[leg].len;leg++;}
      const l=legs[leg],along=clamp(d-walked,0,l.len),f=d/total;
      const x=l.x+l.ux*along,y=l.y+l.uy*along,size=(1.8+f*2.2)*scale*weight;
      ctx.fillStyle=`rgba(${guideRgb},${lerp(nearAlpha,farAlpha,f)})`;
      ctx.beginPath();
      ctx.moveTo(x-l.ux*size,y-l.uy*size);
      ctx.lineTo(x+l.ux*size*.6-l.uy*size*.5,y+l.uy*size*.6+l.ux*size*.5);
      ctx.lineTo(x+l.ux*size*.6+l.uy*size*.5,y+l.uy*size*.6-l.ux*size*.5);
      ctx.closePath();ctx.fill();
      d+=gap*(1+f*.65);
    }
  }
  if(sling){
    for(let seconds=.5;seconds<1.9;seconds+=.5){
      const index=points.findIndex(q=>q.time>=seconds);if(index<1)break;
      const a=points[index-1],b=points[index],t=(seconds-a.time)/(b.time-a.time),length=Math.hypot(b.x-a.x,b.y-a.y)||1;
      const x=sx(lerp(a.x,b.x,t)),y=sy(lerp(a.y,b.y,t)),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
      line(x+nx*2.5*scale,y+ny*2.5*scale,x-nx*2.5*scale,y-ny*2.5*scale,`rgba(${ink.marks.slingAimTick},.45)`,.7);
    }
  }
  if(aim?.perfect){
    ctx.strokeStyle=`rgba(${ink.marks.aimPerfectArc},.65)`;ctx.lineWidth=1.2*scale;ctx.beginPath();ctx.arc(sx(aim.cx),sy(aim.cy),aim.radius*scale,aim.entryAngle,aim.entryAngle+aim.entryDir*.46,aim.entryDir<0);ctx.stroke();
  }
  if(aim){ctx.translate(bx,by);ctx.rotate(Math.PI/4);ctx.strokeStyle=aim.perfect?`rgba(${ink.marks.aimMarkPerfect},.9)`:`rgba(${ink.marks.aimMarkNormal},.49)`;ctx.lineWidth=.8;ctx.strokeRect(-2.5,-2.5,5,5);}
  else if(blocked){line(bx-3,by-3,bx+3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,.9);line(bx+3,by-3,bx-3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,.9);}
  ctx.restore();
}
