'use strict';
/* Orbit · src/figures.js
   Constellation figures, nodes, gravitational lenses, hazards, and the aim guide. */
// ---------- Constellation figures: the plate each fork route is engraved for ----------
// Behind the three stars of a fork, draw the figure the route is named for — every entry in the
// twelve-figure catalogue has its own engraving — as Hevelius or Bayer would cut it: broken ink contours and stipple that are
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
  const minY=Math.min(s[0].y,s[1].y,s[2].y),maxY=Math.max(s[0].y,s[1].y,s[2].y),pad=96;
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
  // Where each star falls along the spine, so a figure can hang its hinges, waists and joints on them.
  const stops=[segLen[0]/total,(segLen[0]+segLen[1])/total,(segLen[0]+segLen[1]+segLen[2])/total];
  return {total,stops,at(t){
    let d=clamp(t,0,1)*total,i=0;
    while(i<segLen.length-1&&d>segLen[i]){d-=segLen[i];i++;}
    const a=chain[i],b=chain[i+1],frac=d/segLen[i],tx=(b.x-a.x)/segLen[i],ty=(b.y-a.y)/segLen[i];
    let px=-ty,py=tx;if(px*side<0){px=-px;py=-py;}
    return {x:lerp(a.x,b.x,frac),y:lerp(a.y,b.y,frac),tx,ty,px,py};
  }};
}
// One point on the figure: a distance `o` off the spine at parameter `t`, on the outward side.
function figAt(spine,t,o){const s=spine.at(t);return {x:s.x+s.px*o,y:s.y+s.py*o};}
function figRibbon(spine,fn,steps){return figRibbonRange(spine,fn,steps,0,1);}
// The same contour over part of the spine only, for a figure that ends before the extensions do.
function figRibbonRange(spine,fn,steps,from,to){
  const pts=[];for(let i=0;i<=steps;i++){const t=lerp(from,to,i/steps),s=spine.at(t),o=fn(t);pts.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  return pts;
}
// ---------- The hand the figures are cut in ----------
// One style object is consulted by the four primitives every figure is built from — the contour, the
// hatching, the stipple and the wash — and by the pen the layer is drawn with, whose line weight is
// scaled as it is set. So all twelve engravings answer to the chosen hand without being rewritten:
// Bayer's is finer, more geometric and less broken, Bode's heavier and far more shaded.
const FIGURE_STYLES={
  hevelius:{weight:1,breaks:1,jag:1,hatch:1,stipple:1},
  bayer:{weight:.78,breaks:.4,jag:.3,hatch:.8,stipple:.65},
  bode:{weight:1.4,breaks:1.35,jag:1.3,hatch:2,stipple:1.7}
};
const figureStyle=()=>FIGURE_STYLES[cosmetic('figures')]||FIGURE_STYLES.hevelius;
let figStyle=FIGURE_STYLES.hevelius;
// The pen the figure is cut with: every line weight set on it, by the primitives below or by a figure
// reaching for the context directly, is scaled by the style's weight.
function figPen(g,style){
  return new Proxy(g,{
    get(target,key){const value=target[key];return typeof value==='function'?value.bind(target):value;},
    set(target,key,value){target[key]=key==='lineWidth'?value*style.weight:value;return true;}
  });
}
// A hand-inked contour: short broken segments with a little jitter, never a mechanical curve.
function figInk(g,pts,rng,jag,gap,width){
  g.lineWidth=width;g.beginPath();
  for(let i=0;i<pts.length-1;i++){
    if(rng()<gap*figStyle.breaks)continue;
    const a=pts[i],b=pts[i+1];
    const j=jag*figStyle.jag;
    g.moveTo(a.x+(rng()-.5)*j,a.y+(rng()-.5)*j);g.lineTo(b.x+(rng()-.5)*j,b.y+(rng()-.5)*j);
  }
  g.stroke();
}
function figStipple(g,spine,leftFn,rightFn,count,rng,size){
  const n=Math.round(count*figStyle.stipple);
  for(let i=0;i<n;i++){
    const t=rng(),s=spine.at(t),o=lerp(leftFn(t),rightFn(t),rng());
    g.fillRect(s.x+s.px*o,s.y+s.py*o,size,size);
  }
}
function figHatch(g,spine,leftFn,rightFn,count,rng){
  const n=Math.round(count*figStyle.hatch);
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
// Points along a circular arc, ready for figInk to cut as a broken hand-drawn curve.
function figArcPts(cx,cy,r,from,to,steps){
  const pts=[];for(let i=0;i<=steps;i++){const a=lerp(from,to,i/steps);pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});}
  return pts;
}
// A pair of dividers. The hinge closes on the top star, the pencil socket rings the middle star,
// and the fixed leg's point descends into the bottom one; the second leg swings out to the side
// and a graduated sector arc spans the opening.
function figCompass(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,58),steps=52,[t0,t1,t2]=spine.stops;
  const hinge=Math.min(1,t2+(1-t2)*.3);
  const open=t=>clamp((t2-t)/Math.max(.001,t2-t0),0,1.6);
  const cap=t=>clamp(1-(t-t2)/Math.max(.001,(1-t2)*.3),0,1);
  const legA=t=>-2.2-open(t)*2.6,legB=t=>2.2+open(t)*40;
  const wA=t=>(3.1-open(t)*1.9)*cap(t),wB=t=>(3.3-open(t)*2.1)*cap(t);
  const aIn=figRibbonRange(spine,t=>legA(t)-wA(t),steps,0,hinge),aOut=figRibbonRange(spine,t=>legA(t)+wA(t),steps,0,hinge);
  const bIn=figRibbonRange(spine,t=>legB(t)-wB(t),steps,0,hinge),bOut=figRibbonRange(spine,t=>legB(t)+wB(t),steps,0,hinge);
  g.strokeStyle=state.contour;
  figInk(g,aIn,rng,.7,.07,1.35);figInk(g,aOut,rng,.7,.07,1.35);
  figInk(g,bIn,rng,.7,.07,1.35);figInk(g,bOut,rng,.7,.07,1.35);
  // The hinge: a knuckle ring round the top star with two rivet ticks.
  g.lineWidth=1.3;figInk(g,figArcPts(p2.x,p2.y,p2.r+12,0,TAU,30),rng,.5,.06,1.3);
  figInk(g,figArcPts(p2.x,p2.y,p2.r+17,-2.5,-.6,10),rng,.5,0,.9);
  figInk(g,figArcPts(p2.x,p2.y,p2.r+17,.5,2.4,10),rng,.5,0,.9);
  // The socket that grips the lead, on the middle star.
  figInk(g,figArcPts(p1.x,p1.y,p1.r+11,0,TAU,26),rng,.6,.1,1.1);
  for(let i=0;i<6;i++){
    const a=i/6*TAU,q0={x:p1.x+Math.cos(a)*(p1.r+8),y:p1.y+Math.sin(a)*(p1.r+8)};
    const q1={x:p1.x+Math.cos(a)*(p1.r+15),y:p1.y+Math.sin(a)*(p1.r+15)};
    figInk(g,[q0,q1],rng,.4,0,.8);
  }
  // The sector arc between the two points, graduated in fifths.
  const aTip=figAt(spine,0,legA(0)),bTip=figAt(spine,0,legB(0)),foot=spine.at(0);
  const sector=[];
  for(let i=0;i<=22;i++){const u=i/22,bow=Math.sin(Math.PI*u)*13;
    sector.push({x:lerp(aTip.x,bTip.x,u)-foot.tx*bow,y:lerp(aTip.y,bTip.y,u)-foot.ty*bow});}
  figInk(g,sector,rng,.6,.08,.9);
  for(let i=1;i<5;i++){
    const p=sector[Math.round(i/5*22)],q=sector[Math.round(i/5*22)+1]||p;
    const dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy)||1;
    figInk(g,[p,{x:p.x-dy/d*5,y:p.y+dx/d*5}],rng,.3,0,.7);
  }
  const inA=t=>legA(clamp(t,0,hinge))-wA(clamp(t,0,hinge)),outA=t=>legA(clamp(t,0,hinge))+wA(clamp(t,0,hinge));
  const inB=t=>legB(clamp(t,0,hinge))-wB(clamp(t,0,hinge)),outB=t=>legB(clamp(t,0,hinge))+wB(clamp(t,0,hinge));
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,inA,outA,Math.round(22*state.hatchFrac),rng);
    figHatch(g,spine,inB,outB,Math.round(26*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,aIn,aOut);figWash(g,bIn,bOut);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>inA(t)-4,t=>outB(t)+4,26,rng,.85);
}
// An hourglass. The waist pinches at the middle star, and the two plates are set on the outer
// stars, joined by the corner posts, with the sand run out into the lower bulb.
function figHourglass(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,34),steps=64,[t0,t1,t2]=spine.stops;
  const reach=Math.max(.001,Math.max(t1-t0,t2-t1));
  const waist=t=>4+Math.pow(clamp(Math.abs(clamp(t,t0,t2)-t1)/reach,0,1),1.15)*38;
  const left=figRibbonRange(spine,t=>-waist(t),steps,t0,t2),right=figRibbonRange(spine,waist,steps,t0,t2);
  g.strokeStyle=state.contour;figInk(g,left,rng,.7,.05,1.4);figInk(g,right,rng,.7,.05,1.4);
  // A plate on each of the outer stars, with a foot, joined by the two corner posts.
  const post=52;
  for(const t of [t0,t2]){
    const out=t===t0?-.05:.05;
    figInk(g,[figAt(spine,t,-post),figAt(spine,t,post)],rng,.5,0,1.9);
    figInk(g,[figAt(spine,t+out*.55,-post+5),figAt(spine,t+out*.55,post-5)],rng,.5,0,.9);
    figInk(g,[figAt(spine,t+out,-post*.7),figAt(spine,t+out,post*.7)],rng,.5,0,1.4);
    for(const o of [-1,1])figInk(g,[figAt(spine,t,o*post),figAt(spine,t+out,o*post*.7)],rng,.5,0,1.1);
  }
  for(const o of [-1,1])figInk(g,[figAt(spine,t0,o*(post-3)),figAt(spine,t2,o*(post-3))],rng,.9,.12,1.15);
  // The sand: a thread falling through the waist and a drift heaped in the lower bulb.
  const thread=[];for(let i=0;i<=14;i++){const t=lerp(t1,t0+.015,i/14);thread.push(figAt(spine,t,Math.sin(i*1.9)*1.3));}
  figInk(g,thread,rng,.4,.18,.6);
  g.fillStyle=state.contour;
  for(let i=0;i<110;i++){
    const t=lerp(t0+.008,t1-.02,rng()*rng()),s=spine.at(t),o=(rng()*2-1)*waist(t)*.7;
    g.fillRect(s.x+s.px*o,s.y+s.py*o,.9,.9);
  }
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>-waist(t),waist,Math.round(52*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-waist(t)-3,t=>waist(t)+3,22,rng,.85);
}
// A serpent. The body is a wave whose centre line crosses the spine at each of the three stars,
// tapering to a tail below and rearing into a head above the top one.
function figSerpent(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,74),steps=88,[t0,t1,t2]=spine.stops;
  const phase=t=>t<=t0?(t-t0)/Math.max(.001,t0)*2.3:t<=t1?Math.PI*(t-t0)/(t1-t0):
    t<=t2?Math.PI*(1+(t-t1)/(t2-t1)):Math.PI*2+(t-t2)/Math.max(.001,1-t2)*2.1;
  const amp=t=>10+30*Math.sin(Math.PI*clamp(t,0,1)),mid=t=>Math.sin(phase(t))*amp(t);
  const thick=t=>1.4+9.5*Math.pow(Math.sin(Math.PI*clamp(t,0,1)),.65);
  const left=figRibbon(spine,t=>mid(t)-thick(t),steps),right=figRibbon(spine,t=>mid(t)+thick(t),steps);
  g.strokeStyle=state.contour;figInk(g,left,rng,.7,.05,1.3);figInk(g,right,rng,.7,.05,1.3);
  // Belly bands across the body, thickest where it coils past the middle star.
  for(let i=1;i<26;i++){
    const t=t0*.4+i/26*(1-t0*.4);
    figInk(g,[figAt(spine,t,mid(t)-thick(t)),figAt(spine,t,mid(t)+thick(t))],rng,.4,.22,.55);
  }
  // The head: a wedge with an eye and a forked tongue, set on the spine's upper extension.
  const head=spine.at(.985),hx=head.x+head.px*mid(.985),hy=head.y+head.py*mid(.985);
  const dir=Math.atan2(head.ty,head.tx);
  g.save();g.translate(hx,hy);g.rotate(dir);g.lineWidth=1.2;
  g.beginPath();g.moveTo(-9,-6);g.bezierCurveTo(6,-8,14,-4,20,-1.4);g.bezierCurveTo(14,4,6,7,-9,6);g.stroke();
  g.beginPath();g.arc(4,-1.6,1.9,0,TAU);g.stroke();
  g.lineWidth=.8;g.beginPath();g.moveTo(20,-1.4);g.lineTo(30,-4.6);g.moveTo(24.6,-2.9);g.lineTo(30,.6);g.stroke();
  g.restore();
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>mid(t)-thick(t),t=>mid(t)+thick(t),Math.round(60*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>mid(t)-thick(t)-2,t=>mid(t)+thick(t)+2,30,rng,.8);
}
// A ship. The hull is bellied out below, its keel deepest at the bottom star, the mast is stepped
// on the middle star, and the truck with its pennant is set on the top one.
function figArgo(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,60),steps=52,[t0,t1,t2]=spine.stops;
  const stern=Math.max(.02,t0-(t1-t0)*.5),bow=t1;
  const arc=t=>{const u=(t-stern)/(bow-stern);return u<=0||u>=1?0:Math.pow(Math.sin(Math.PI*u),.7);};
  const hull=t=>arc(t)*56,deck=t=>-arc(t)*9;
  const keel=figRibbonRange(spine,hull,steps,stern,bow),sheer=figRibbonRange(spine,deck,steps,stern,bow);
  g.strokeStyle=state.contour;figInk(g,keel,rng,.8,.04,1.6);figInk(g,sheer,rng,.6,.06,1.2);
  for(const f of [.7,.46,.24])figInk(g,figRibbonRange(spine,t=>lerp(deck(t),hull(t),f),steps,stern,bow),rng,.7,.12,.7);
  // Oar ports along the upper strake, and the stem and stern posts.
  for(let i=1;i<10;i++){
    const t=lerp(stern,bow,i/10),o=lerp(deck(t),hull(t),.82);
    figInk(g,[figAt(spine,t,o-3),figAt(spine,t,o+3)],rng,.3,0,.75);
  }
  figInk(g,[figAt(spine,stern,0),figAt(spine,stern-.045,-16)],rng,.6,0,1.5);
  figInk(g,[figAt(spine,stern-.045,-16),figAt(spine,stern-.03,-8)],rng,.5,0,1.1);
  figInk(g,[figAt(spine,bow,0),figAt(spine,bow+.04,-13)],rng,.6,0,1.5);
  // The mast, stepped on the middle star and carrying its yard and square sail.
  figInk(g,[figAt(spine,t1,-2),figAt(spine,t2+.02,-2)],rng,.5,0,1.9);
  figInk(g,[figAt(spine,t1,2),figAt(spine,t2+.02,2)],rng,.5,0,1.5);
  const yard=lerp(t1,t2,.58);
  figInk(g,[figAt(spine,yard,-16),figAt(spine,yard,50)],rng,.5,0,1.5);
  const luff=[],leech=[];
  for(let i=0;i<=20;i++){
    const u=i/20,t=lerp(yard,t1+.02,u);
    luff.push(figAt(spine,t,lerp(-6,0,u)));
    leech.push(figAt(spine,t,lerp(48,10,u)+Math.sin(Math.PI*u)*14));
  }
  figInk(g,leech,rng,.9,.04,1.25);figInk(g,luff,rng,.5,.1,.8);
  figInk(g,[leech[20],luff[20]],rng,.5,0,.9);
  for(let i=1;i<5;i++){const u=i/5;figInk(g,[luff[Math.round(u*20)],leech[Math.round(u*20)]],rng,.6,.42,.5);}
  // Shrouds and a pennant streaming from the truck.
  for(const o of [-15,32])figInk(g,[figAt(spine,t2-.012,0),figAt(spine,t1+.008,o)],rng,.6,.18,.6);
  const flag=[];for(let i=0;i<=10;i++){const u=i/10;flag.push(figAt(spine,lerp(t2+.025,t2+.014,u),u*32+Math.sin(u*6)*4));}
  figInk(g,flag,rng,.5,.04,.85);
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,deck,hull,Math.round(50*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,sheer,keel);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>deck(t)-2,t=>hull(t)+2,26,rng,.85);
}
// An astrolabe. The graduated limb rings the middle star, the alidade lies along all three, its
// sighting vanes on the outer two, and the throne and suspension ring rise above the figure.
function figAstrolabe(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,58),steps=40,[t0,t1,t2]=spine.stops;
  const halfRule=t=>3.4-Math.abs(t-t1)*1.4;
  const left=figRibbon(spine,t=>-halfRule(t),steps),right=figRibbon(spine,halfRule,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.6,.06,1.2);figInk(g,right,rng,.6,.06,1.2);
  const limbOuter=p1.r+25,limbInner=p1.r+15;
  figInk(g,figArcPts(p1.x,p1.y,limbOuter,0,TAU,52),rng,.7,.05,1.35);
  figInk(g,figArcPts(p1.x,p1.y,limbInner,0,TAU,44),rng,.6,.08,.9);
  for(let i=0;i<48;i++){
    const a=i/48*TAU,inner=i%4===0?limbInner:limbOuter-3.5;
    figInk(g,[{x:p1.x+Math.cos(a)*inner,y:p1.y+Math.sin(a)*inner},{x:p1.x+Math.cos(a)*limbOuter,y:p1.y+Math.sin(a)*limbOuter}],rng,.25,0,i%4===0?.75:.45);
  }
  // Sighting vanes on the outer stars.
  for(const q of [p0,p2]){
    figInk(g,figArcPts(q.x,q.y,q.r+10,0,TAU,22),rng,.5,.12,.9);
    for(const o of [-1,1])figInk(g,[{x:q.x+o*(q.r+16),y:q.y-5},{x:q.x+o*(q.r+16),y:q.y+5}],rng,.3,0,1.1);
  }
  // Throne and suspension ring above the instrument.
  const crown=spine.at(clamp(t2+(1-t2)*.42,0,1)),ring=spine.at(clamp(t2+(1-t2)*.78,0,1));
  figInk(g,[figAt(spine,t2+(1-t2)*.1,-11),figAt(spine,t2+(1-t2)*.42,-7),figAt(spine,t2+(1-t2)*.42,7),figAt(spine,t2+(1-t2)*.1,11)],rng,.5,0,1.2);
  figInk(g,figArcPts(crown.x,crown.y,9,0,TAU,16),rng,.5,.1,.9);
  figInk(g,figArcPts(ring.x,ring.y,11,0,TAU,20),rng,.6,.06,1.3);
  figInk(g,figArcPts(ring.x,ring.y,6.5,0,TAU,14),rng,.5,.1,.7);
  if(state.hatchFrac>0){
    g.strokeStyle=state.hatch;
    const n=Math.round(40*state.hatchFrac);
    for(let i=0;i<n;i++){
      const a=rng()*TAU,d=lerp(limbInner,limbOuter,rng()),x=p1.x+Math.cos(a)*d,y=p1.y+Math.sin(a)*d,len=1.6+rng()*2.4;
      g.beginPath();g.moveTo(x-Math.cos(a)*len,y-Math.sin(a)*len);g.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);g.stroke();
    }
    figHatch(g,spine,t=>-halfRule(t),halfRule,Math.round(14*state.hatchFrac),rng);
  }
  if(state.wash){
    g.fillStyle=state.wash;figWash(g,left,right);
    g.beginPath();g.arc(p1.x,p1.y,limbOuter,0,TAU);g.arc(p1.x,p1.y,limbInner,TAU,0,true);g.fill();
  }
  g.fillStyle=state.contour;figStipple(g,spine,t=>-halfRule(t)-3,t=>halfRule(t)+3,18,rng,.8);
}
// A quill. The nib is cut at the bottom star, the vane opens at the middle one and the plume
// curls past the top; the barbs are laid in with short slanted strokes on both sides of the shaft.
function figQuill(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,66),steps=56,[t0,t1,t2]=spine.stops;
  const shaft=t=>1+2.9*clamp((t-t0*.5)/Math.max(.001,1-t0*.5),0,1);
  const vane=t=>{const u=(t-t1)/Math.max(.001,.99-t1);return u<=0||u>=1?0:Math.pow(Math.sin(Math.PI*u),.7)*40;};
  const inner=t=>-vane(t)*.52;
  const left=figRibbon(spine,t=>inner(t)-shaft(t),steps),right=figRibbon(spine,t=>vane(t)+shaft(t),steps);
  const shaftL=figRibbon(spine,t=>-shaft(t),steps),shaftR=figRibbon(spine,shaft,steps);
  g.strokeStyle=state.contour;
  figInk(g,shaftL,rng,.6,.05,1.25);figInk(g,shaftR,rng,.6,.05,1.25);
  figInk(g,left,rng,1,.09,1);figInk(g,right,rng,1.1,.07,1.15);
  // Barbs, laid from the shaft out to the edge of each vane.
  for(let i=0;i<74;i++){
    const t=lerp(t1,.985,i/74),slant=.16;
    const o1=vane(t),o0=inner(t);
    if(o1>1)figInk(g,[figAt(spine,t,shaft(t)),figAt(spine,t-slant*.04,o1*(.82+rng()*.18))],rng,.4,0,.5);
    if(o0<-1)figInk(g,[figAt(spine,t,-shaft(t)),figAt(spine,t-slant*.04,o0*(.82+rng()*.18))],rng,.4,0,.45);
  }
  // The nib: two lines closing to a point at the bottom star, with its slit.
  const nib=t0;
  figInk(g,[figAt(spine,nib+.06,-3.4),figAt(spine,nib-.012,-.7)],rng,.4,0,1.1);
  figInk(g,[figAt(spine,nib+.06,3.4),figAt(spine,nib-.012,.7)],rng,.4,0,1.1);
  figInk(g,[figAt(spine,nib+.055,0),figAt(spine,nib-.01,0)],rng,.3,0,.6);
  figInk(g,[figAt(spine,nib+.062,-3.6),figAt(spine,nib+.062,3.6)],rng,.3,0,.7);
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,inner,vane,Math.round(54*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>inner(t)-2,t=>vane(t)+2,26,rng,.8);
}
// A hanging lantern. The dome springs from the top star, the flame burns at the middle one and
// throws its light out past the rim, and the foot stands on the bottom star.
function figLantern(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,62),steps=56,[t0,t1,t2]=spine.stops;
  const dome=t=>clamp((t-t2)/Math.max(.001,(1-t2)*.62),0,1);
  const foot=t=>clamp((t0-t)/Math.max(.001,t0*.62),0,1);
  const body=t=>{
    if(t>t2)return Math.max(0,42*Math.cos(dome(t)*Math.PI*.5));
    if(t<t0)return 42+foot(t)*10;
    return 42;
  };
  const left=figRibbon(spine,t=>-body(t),steps),right=figRibbon(spine,body,steps);
  g.strokeStyle=state.contour;figInk(g,left,rng,.7,.06,1.4);figInk(g,right,rng,.7,.06,1.4);
  // Corner posts, glazing bars and the sills at each star.
  for(const o of [-1,1])figInk(g,figRibbon(spine,t=>o*(body(t)-4.5),steps),rng,.6,.16,.8);
  for(const t of [t0,lerp(t0,t1,.5),t1,lerp(t1,t2,.5),t2]){
    const w=body(t);figInk(g,[figAt(spine,t,-w),figAt(spine,t,w)],rng,.5,.06,t===t0||t===t2?1.5:.7);
  }
  // The foot below and the ring above.
  figInk(g,[figAt(spine,Math.max(0,t0-t0*.62),-52),figAt(spine,Math.max(0,t0-t0*.62),52)],rng,.5,0,1.6);
  const hook=spine.at(clamp(t2+(1-t2)*.82,0,1));
  figInk(g,figArcPts(hook.x,hook.y,11,0,TAU,20),rng,.6,.06,1.3);
  figInk(g,[figAt(spine,t2+(1-t2)*.62,0),figAt(spine,t2+(1-t2)*.72,0)],rng,.4,0,1.4);
  // The flame at the middle star, and the light it throws beyond the glass.
  for(let i=0;i<30;i++){
    const a=i/30*TAU,long=i%3===0,r0=p1.r+9,r1=r0+(long?26:13)+rng()*6;
    figInk(g,[{x:p1.x+Math.cos(a)*r0,y:p1.y+Math.sin(a)*r0},{x:p1.x+Math.cos(a)*r1,y:p1.y+Math.sin(a)*r1}],rng,.4,0,long?.7:.45);
  }
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>-body(t),body,Math.round(56*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-body(t)-3,t=>body(t)+3,26,rng,.85);
}
// A moth. The wings open either side of the middle star, the head and its feathered antennae are
// set on the top star, and the abdomen tapers away below the bottom one.
function figMoth(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,48),steps=72,[t0,t1,t2]=spine.stops;
  const lobe=(t,a,b,peak)=>{const u=(t-a)/(b-a);return u<=0||u>=1?0:Math.pow(Math.sin(Math.PI*u),.62)*peak;};
  const wing=t=>Math.max(lobe(t,t0-(t1-t0)*.34,t1+.015,40),lobe(t,t1-.015,t2+(t2-t1)*.2,58));
  const body=t=>t>t2?Math.max(1,7-(t-t2)*46):t<t0?Math.max(1,6.5-(t0-t)*30):6.5;
  const span=t=>wing(t)+body(t);
  const left=figRibbon(spine,t=>-span(t),steps),right=figRibbon(spine,span,steps);
  const bodyL=figRibbon(spine,t=>-body(t),steps),bodyR=figRibbon(spine,body,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.9,.05,1.3);figInk(g,right,rng,.9,.05,1.3);
  figInk(g,bodyL,rng,.5,.08,1);figInk(g,bodyR,rng,.5,.08,1);
  // The seam between fore and hind wing, and the veins running out from the thorax.
  for(const o of [-1,1]){
    figInk(g,[figAt(spine,t1,o*body(t1)),figAt(spine,t1-.012,o*span(t1)*.96)],rng,.5,.06,.8);
    for(let i=0;i<5;i++){
      const t=lerp(t1+.02,t2+.02,i/5),reach=span(t)*(.55+i*.08);
      if(reach>body(t)+3)figInk(g,[figAt(spine,t1+.005,o*body(t1)),figAt(spine,t,o*reach)],rng,.6,.2,.5);
    }
    for(let i=0;i<4;i++){
      const t=lerp(t0-.01,t1-.02,i/4),reach=span(t)*(.6+i*.07);
      if(reach>body(t)+3)figInk(g,[figAt(spine,t1-.01,o*body(t1)),figAt(spine,t,o*reach)],rng,.6,.24,.45);
    }
  }
  // An eyespot on each forewing.
  for(const o of [-1,1]){
    const t=lerp(t1,t2,.55),c=figAt(spine,t,o*span(t)*.58);
    figInk(g,figArcPts(c.x,c.y,7.5,0,TAU,16),rng,.5,.08,.9);
    figInk(g,figArcPts(c.x,c.y,3.4,0,TAU,12),rng,.4,.12,.6);
  }
  // Body segments, then the head and its combed antennae on the top star.
  for(let i=0;i<12;i++){
    const t=lerp(t0-.05,t2-.01,i/12);
    figInk(g,[figAt(spine,t,-body(t)),figAt(spine,t,body(t))],rng,.35,.18,.5);
  }
  for(const o of [-1,1]){
    const feel=[];for(let i=0;i<=12;i++){const u=i/12;feel.push(figAt(spine,lerp(t2+.005,1,u),o*(3+u*u*26)));}
    figInk(g,feel,rng,.5,.04,.85);
    for(let i=2;i<12;i+=1){
      const p=feel[i],q=feel[i-1],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;
      figInk(g,[p,{x:p.x-dy/d*3.4*o,y:p.y+dx/d*3.4*o}],rng,.25,0,.4);
    }
  }
  if(state.hatchFrac>0){
    g.strokeStyle=state.hatch;
    figHatch(g,spine,t=>-span(t),t=>-body(t),Math.round(34*state.hatchFrac),rng);
    figHatch(g,spine,body,span,Math.round(34*state.hatchFrac),rng);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,bodyL);figWash(g,bodyR,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-span(t)-2,t=>span(t)+2,34,rng,.8);
}
// A placeholder for catalogue figures that have no engraving of their own yet: a broken
// contour joining the three stars, doubled as a hairline, with a small ornament at the
// middle star. It reads as an asterism on the plate without claiming to be a figure.
function figAsterism(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,30),steps=44;
  const swell=t=>3+Math.sin(Math.PI*clamp(t,0,1))*9;
  const left=figRibbon(spine,t=>-swell(t),steps),right=figRibbon(spine,swell,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.8,.14,1.25);figInk(g,right,rng,.8,.14,1.25);
  figInk(g,figRibbon(spine,()=>0,steps),rng,.6,.22,.7);
  const mid=spine.at(.5);
  g.save();g.translate(mid.x+mid.px*(swell(.5)+11),mid.y+mid.py*(swell(.5)+11));g.rotate(Math.atan2(mid.ty,mid.tx));
  g.lineWidth=1.1;g.beginPath();g.arc(0,0,6.5,0,TAU);g.stroke();
  g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.moveTo(0,-10);g.lineTo(0,10);g.stroke();g.restore();
  for(const q of [p0,p1,p2]){g.lineWidth=.9;g.beginPath();g.arc(q.x,q.y,q.r+13,-.5,.5);g.stroke();g.beginPath();g.arc(q.x,q.y,q.r+13,Math.PI-.5,Math.PI+.5);g.stroke();}
  if(state.hatchFrac>0){g.strokeStyle=state.hatch;figHatch(g,spine,t=>-swell(t),swell,Math.round(34*state.hatchFrac),rng);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-swell(t)-3,t=>swell(t)+3,22,rng,.85);
}
// Every entry in the catalogue has its own engraving, looked up by name. figAsterism remains only
// as the last resort for a chart whose name this plate has never been cut for.
const FIGURE_SHAPES={
  'THE NEEDLE':figNeedle,'THE SAIL':figSail,'THE LYRE':figLyre,'THE CROWN':figCrown,
  'THE COMPASS':figCompass,'THE HOURGLASS':figHourglass,'THE SERPENT':figSerpent,'THE ARGO':figArgo,
  'THE ASTROLABE':figAstrolabe,'THE QUILL':figQuill,'THE LANTERN':figLantern,'THE MOTH':figMoth
};
const figureFor=chart=>FIGURE_SHAPES[chart&&chart.name]||FIGURE_SHAPES[CONSTELLATIONS[chart&&chart.catalogueIndex]&&CONSTELLATIONS[chart.catalogueIndex].name]||figAsterism;
function buildFigureLayer(chart,frame,count,curScale){
  const w=Math.max(1,Math.ceil(frame.w*curScale)),h=Math.max(1,Math.ceil(frame.h*curScale));
  const c=makeCanvas(w,h),g=c.getContext('2d');
  g.scale(curScale,curScale);g.translate(-frame.originX,-frame.originY);g.lineJoin='round';g.lineCap='round';
  const rng=seeded(48200+((chart.catalogueIndex??chart.id)+chart.id*13)*104729),pal=ink.figures,expired=chart.expired,fade=expired?.24:1;
  figStyle=figureStyle();
  const contourA=(onPaper()?.4:.3)*fade*(figStyle.weight>1?1.1:.95),hatchA=(onPaper()?.17:.12)*fade,washA=onPaper()?.1:.07;
  const state={contour:`rgba(${pal.contour},${contourA})`,hatch:`rgba(${pal.hatch},${hatchA})`,style:figStyle,
    hatchFrac:expired?0:count/3,wash:(!expired&&chart.completed)?`rgba(${pal.wash},${washA})`:null};
  const [p0,p1,p2]=chart.stars;
  figureFor(chart)(figPen(g,figStyle),p0,p1,p2,frame.side,rng,state);
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
  const bucket=Math.round(scale*20),key=chart.id+':'+plateName+':'+cosmetic('figures')+':'+frame.side+':'+bucket;
  let layer=figureLayers.get(key);
  if(!layer||layer.count!==count||layer.completed!==chart.completed||layer.expired!==chart.expired){
    if(figureLayers.size>10)figureLayers.clear();
    layer=buildFigureLayer(chart,frame,count,scale);figureLayers.set(key,layer);
  }
  const x=sx(frame.originX),y=sy(frame.originY);
  if(x>W||y>H||x+layer.canvas.width<0||y+layer.canvas.height<0)return;
  ctx.drawImage(layer.canvas,x,y);
}

function drawConstellations(){
  for(const chart of world.constellations){
    revealFigure(chart,drawConstellationFigure);
    if(!chart.stars.length||sy(chart.entry.y)<-150||sy(chart.stars[chart.stars.length-1].y)>H+170)continue;
    const count=chart.stars.filter(n=>n.visited).length,points=[chart.entry,...chart.stars];if(chart.exit)points.push(chart.exit);
    ctx.save();revealChartClip(chart);ctx.lineWidth=.8*scale;
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
    // The chart's name is engraved round the rim of its entry star for as long as the route is live.
    if(!chart.expired){
      const e=chart.entry,ex=sx(e.x),ey=sy(e.y),size=Math.max(8,9.5*scale);
      if(ey>-80&&ey<H+80&&!captionsHeld()){
        // The name is set round the top of the rim, and turns to the bottom of it — the same flip the node
        // captions make — when the star sits too near the top edge for the lettering to print inside the frame.
        const ring=e.r*scale+11*scale+size,inner=frameBand()*.92+8;
        const guard=Math.abs(ex-W*.5)<HUD_TEXT_HALF?Math.max(inner,hudBand()):inner,below=ey-ring-size<guard;
        ctx.save();ctx.translate(ex,ey);
        ctx.font=`${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
        ctx.fillStyle=`rgba(${ink.marks.constellationLabel},${chart.completed?.34:.52})`;
        textAlongArc(ctx,chart.name,0,0,ring,below?Math.PI/2:-Math.PI/2,{align:'center',size,spacing:size*.24,inward:below});
        ctx.restore();
      }
    }
    // Progress toward the constellation is announced once, as permanent ink, by the "chartProgress" and
    // "constellation" inscriptions (see event() in ui.js) pinned to the star each capture happens at.
    // A second, live caption chasing whichever star is next would just repeat the same name in a
    // different place every frame — the name would seem to drift as the target moved from star to star.
    if(chart.completed&&chart.flash>0&&!chart.expired&&!plainPlate()&&!captionsHeld()){
      const label=chart.stars[2];
      // The caption rides above its star, flips below it and clears the HUD band exactly as a node caption does.
      const x=clamp(sx(label.x),20,W-20),star=sy(label.y),r=label.r*scale;
      const y=star+captionOffset(sx(label.x),star,r,46*scale);
      ctx.textAlign=label.x>0?'right':'left';ctx.font="14px 'IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationLabel},.8)`;ctx.fillText(chart.name,x,y);
      ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationCaption},.78)`;ctx.fillText('COMPLETE · +60',x,y+16);
    }
    // Skipped where the node already carries the early-run "NEXT" caption (see drawNode in figures.js):
    // the wide-orbit hint sits on the same main-line node right after a constellation's entry, and the
    // two captions would otherwise print on top of each other.
    const nextCaptioned=world.captures<2&&chart.main[0]&&chart.main[0].row===Math.floor(world.progress)+1;
    if(world.player.node===chart.entry&&chart.main[0]&&!nextCaptioned&&!plainPlate()&&!captionsHeld()){
      const n=chart.main[0];ctx.textAlign='center';ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.constellationHint},.66)`;ctx.fillText('WIDE ORBITS',sx(n.x),sy(n.y)-(n.r+26)*scale);
    }
    ctx.restore();
  }
}
// How far either side of the middle the DOM HUD's centre column — the score, the pace and the flow — can
// reach. A caption printed inside it has to keep below the whole HUD band rather than merely inside the frame.
const HUD_TEXT_HALF=150;
// The frontispiece is its own leaf: while the run is still to be dealt, the chart beneath it is printed
// without a caption on it, so nothing the pen would letter can show through the title cartouche.
const captionsHeld=()=>world.state==='ready';
// Captions ride above their planet, but flip underneath it when the node sits so high that the text would
// cross the frame's inner rule or run into the DOM score block in the middle of the HUD band. Returns the
// y offset in node-local coordinates, where 0 is the planet's centre.
function captionOffset(x,y,r,gap){
  const inner=frameBand()*.92+8,guard=Math.abs(x-W*.5)<HUD_TEXT_HALF?Math.max(inner,hudBand()):inner;
  if(y-r-gap>=guard)return -(r+gap);
  let below=Math.max(r+gap+3,guard+12-y);
  const band=revealBand();
  if(band&&Math.abs(x-W*.5)<W*.45&&y+below>band.top&&y+below<band.bottom+12)below=band.bottom+12-y;
  return below;
}
// The halo behind a planet. It used to be a radial gradient built per node and rasterised over a box
// four planet-diameters across, every frame — and, because the held orbit's radius changes constantly,
// the gradient behind the active planet was rebuilt on every single frame as well. The falloff does
// not depend on the radius, only on the plate and whether the orbit is held, so it is baked once into
// a small sprite and blitted at whatever size the planet needs: the same halo, as a plain copy rather
// than a screenful of gradient evaluation.
const glowSprites=new Map();
function nodeGlow(rgb,active,paper){
  const key=plateName+'|'+(active?1:0)+'|'+(paper?'-':rgb);
  const cached=glowSprites.get(key);if(cached!==undefined)return cached;
  const size=192,c=makeCanvas(size,size),g=c&&c.getContext?c.getContext('2d'):null;
  if(!g||!g.createRadialGradient){glowSprites.set(key,null);return null;}
  g.setTransform(size/2,0,0,size/2,size/2,size/2);
  // Ink does not glow: the night gradient is a coloured light bloom, the paper one a pale halo of raised, worn paper.
  const glow=g.createRadialGradient(0,0,.2/2.1,0,0,1);
  if(paper){glow.addColorStop(0,`rgba(${ink.base.paperRgb},${active?.55:.2})`);glow.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);}
  else{glow.addColorStop(0,`rgba(${rgb},${active?.07:.026})`);glow.addColorStop(1,`rgba(${rgb},0)`);}
  g.fillStyle=glow;g.fillRect(-1,-1,2,2);
  glowSprites.set(key,c);
  if(glowSprites.size>24)glowSprites.delete(glowSprites.keys().next().value);
  return c;
}
function drawNode(n,aim){
  const p=world.player,active=p.node===n,used=n.visited&&!active,target=aim&&aim.n.id===n.id;
  const x=sx(n.x),y=sy(n.y),r=(active?p.rad:n.r)*scale;
  if(y<-r*2||y>H+r*2)return;
  // The pen has to have reached this planet before any of it is on the page.
  const pen=revealNode(n),struck=used?revealRetire(n):0;
  if(pen.t<=0)return;
  const gold=n.type==='gold',drift=n.type==='drift',fading=n.type==='fading',sling=n.type==='sling',shield=n.type==='shield';
  const reflector=n.type==='reflector',inkwell=n.type==='inkwell';
  // The two outer pressures carry their own coloured ink — a verdant, friendly accent for the
  // gentlest choice and a rubrication red for the fiercest — while the middle target keeps the
  // plate's ordinary ink, reading as the plain, unmarked choice between the two.
  const rgb=n.difficultyChoice==='relaxed'?ink.marks.nodeRelaxed:n.difficultyChoice==='hardcore'?ink.marks.nodeHardcore:drift?ink.marks.nodeDrift:fading?ink.marks.nodeFading:gold?ink.marks.nodeGold:shield?ink.marks.nodeShield:reflector?ink.marks.nodeReflector:inkwell?ink.marks.nodeInkwell:ink.marks.node;
  ctx.save();ctx.translate(x,y);
  if(world.state==='ready'&&n.row>1)ctx.globalAlpha=.35;
  if(used)ctx.globalAlpha=lerp(.62,.2,struck);
  const paper=onPaper();
  const halo=nodeGlow(rgb,active,paper);
  if(halo)ctx.drawImage(halo,-r*2.1,-r*2.1,r*4.2,r*4.2);
  else{
    const glow=ctx.createRadialGradient(0,0,r*.2,0,0,r*2.1);
    if(paper){glow.addColorStop(0,`rgba(${ink.base.paperRgb},${active?.55:.2})`);glow.addColorStop(1,`rgba(${ink.base.paperRgb},0)`);}
    else{glow.addColorStop(0,`rgba(${rgb},${active?.07:.026})`);glow.addColorStop(1,`rgba(${rgb},0)`);}
    ctx.fillStyle=glow;ctx.fillRect(-r*2.1,-r*2.1,r*4.2,r*4.2);
  }
  revealPlanet(glyph(n.seed,n.type,n.row,world.seed,n.difficultyChoice),n.r*scale,world.time,pen,n.seed);
  if(sling&&pen.survey>0){
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
    if(!used&&!captionsHeld()){
      ctx.textAlign='center';ctx.font="13px 'IM Fell English SC','IM Fell English',Georgia,serif";ctx.fillStyle=`rgba(${ink.marks.slingLabel},.82)`;
      const pace=world.speedMultiplier().toFixed(1);
      const caption=active?(p.speed>=MAX_SPEED?'MAX SPEED  ·  ×'+pace:charge>=1?'SPEED HELD  ·  ×'+pace:'BUILDING SPEED  ·  ×'+pace):'SLINGSHOT STAR';
      // The caption for the orbit being held is always set below the planet, where it cannot cover the
      // release marks; when the star is high enough that below is still inside the HUD band, it is pushed
      // clear of the band instead.
      let dy=active?r+28*scale:captionOffset(x,y,r,25*scale);
      if(active&&Math.abs(x-W*.5)<HUD_TEXT_HALF&&y+dy<hudBand()+12)dy=hudBand()+12-y;
      writeText(ctx,caption,0,dy,revealLabel(pen,caption),{size:13});
    }
  }
  const wedged=penWedgeBegin(pen,n,Math.max(r,n.cap*scale)*2+30);
  {
    const ring=engravedRing(r,rgb,active?.59:target?.57:.25,.7,n.seed);
    const fit=ring.size*(ring.radius>0?r/ring.radius:1);
    ctx.drawImage(ring.canvas,-fit/2,-fit/2,fit,fit);
  }
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
  if(wedged)penWedgeEnd(pen,n,r);
  if(used)penStrike(n,r,struck,rgb);
  // A Latin caption engraved round the outer rim of every fourth main orbit, set in small caps at a
  // whisper — the sheet reads better with fewer of them, and fainter. It is printed only on orbits the
  // player is not holding, so it can never cross the release marks, the perfect window, or the fading
  // ring, which are drawn on the current orbit alone.
  if(!active&&!sling&&!gold&&!shield&&!reflector&&!inkwell&&n.row>0&&n.row%4===0&&r>15&&!captionsHeld()){
    const word=RIM_CAPTIONS[(n.seed+n.row)%RIM_CAPTIONS.length],size=Math.max(6.5,7.4*scale);
    ctx.font=`${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
    ctx.fillStyle=paper?`rgba(${ink.base.ink},.22)`:`rgba(${rgb},.15)`;
    textAlongArc(ctx,word,0,0,r+11*scale+size,Math.PI/2,{align:'center',size,spacing:size*.2,inward:true});
  }
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
  if(!used&&!captionsHeld()){
    ctx.font=`${Math.max(9,10*scale)}px 'IM Fell English',Georgia,serif`;ctx.textAlign='left';ctx.fillStyle=paper?`rgba(${ink.base.ink},.72)`:`rgba(${rgb},.48)`;
    const mark=gold?'+15':shield?POWERUP_LABELS.shield:reflector?POWERUP_LABELS.reflector:inkwell?'INK':String(Math.floor(n.row)+1).padStart(2,'0');
    writeText(ctx,mark,r+12*scale,4*scale,revealLabel(pen,mark),{size:Math.max(9,10*scale)});
    if(drift){const dy=captionOffset(x,y,r,15),up=dy<0?1:-1;ctx.beginPath();ctx.strokeStyle=`rgba(${rgb},.45)`;ctx.lineWidth=.65;ctx.moveTo(-9,dy);ctx.bezierCurveTo(-3,dy-8*up,3,dy+8*up,9,dy);ctx.stroke();}
    // A difficulty node takes the "next" caption's spot, centred so it never runs off either
    // edge, and names the pressure it sets instead of just marking the node as reachable. A
    // sling star keeps its own name in that same spot instead (see above): the first main-line
    // star is always row 2, so without this the two captions would print on top of each other.
    if(world.captures<2&&!active&&!sling&&n.row===Math.floor(world.progress)+1){
      const label=n.difficultyChoice?DIFFICULTY_LABELS[n.difficultyChoice]:'NEXT';
      ctx.textAlign='center';ctx.font=`${Math.max(9,9*scale)}px 'IM Fell English SC','IM Fell English',Georgia,serif`;ctx.fillStyle=paper?`rgba(${ink.base.ink},.75)`:`rgba(${ink.marks.next},.6)`;writeText(ctx,label,0,captionOffset(x,y,r,24*scale),revealLabel(pen,label),{size:Math.max(9,9*scale)});
    }
  }
  ctx.restore();
}
function drawGravitationalLenses(){
  for(const h of world.hazards){
    if(h.kind&&h.kind!=='hole')continue;
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
    // Each band costs a clip (the one genuinely expensive Canvas2D call here) plus a rotate, scale
    // and drawImage, every frame this hole is on screen. The magnification only ever spans 1x-1.7x
    // across the whole radius, so a coarser band count is not visible; scale it down for a small or
    // distant hole, where it matters least, and cap it well under the old fixed 24 everywhere else.
    const bands=Math.max(10,Math.min(16,Math.round(outer/6)));
    for(let band=0;band<bands;band++){
      const a=band/bands,b=(band+1)/bands,ro=lerp(outer,inner,a),ri=lerp(outer,inner,b);
      const weight=((a+b)/2)**2,magnify=1+.7*weight;
      ctx.save();ctx.beginPath();ctx.arc(0,0,ro+.2,0,TAU);ctx.arc(0,0,ri,TAU,0,true);ctx.closePath();ctx.clip();
      ctx.rotate(twist*weight);ctx.scale(magnify,magnify);ctx.drawImage(lensPatch,-outer,-outer,diameter,diameter);ctx.restore();
    }
    ctx.restore();
  }
}
// Palettes for the two later hazard kinds. The black-hole colours above are untouched.
definePlate('field',{
  night:{flareCore:'244,222,168',flareRim:'226,178,112',flareRay:'223,166,109',flareEdge:'205,159,122',
    flareUmbra:'6,9,15',flarePenumbra:'214,163,110',fieldRing:'205,159,122',
    fog:'202,214,220',fogEdge:'139,156,168'},
  paper:{flareCore:'176,118,38',flareRim:'150,100,32',flareRay:'160,84,52',flareEdge:'150,100,32',
    flareUmbra:'26,18,12',flarePenumbra:'140,86,44',fieldRing:'166,58,40',
    fog:'116,94,66',fogEdge:'58,42,28'}
});
// A sunspot in the Galileo manner: a dark umbra, a penumbra of fine radial strokes, and a broken
// limb. Everything that does not move is baked into a sprite; only the flare's rays are cut live.
const flareSprites=new Map();
function flareSprite(seed,radius,core){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+Math.round(core)+':'+plateName+':'+DPR.toFixed(2);
  const cached=flareSprites.get(key);if(cached)return cached;
  const pad=Math.max(6,rBucket*.45),size=Math.max(4,Math.ceil((rBucket+pad)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.lineCap='round';
  const p=ink.field,rng=seeded((seed>>>0)||1),r=rBucket,u=Math.max(1.5,core);
  // The penumbra: radial strokes, close-set and long where the spot is deepest.
  for(let i=0;i<108;i++){
    const a=i/108*TAU+rng()*.03,from=u*(.98+rng()*.06),to=r*(.82+rng()*.24);
    const bow=(rng()-.5)*.06;
    g.strokeStyle=`rgba(${p.flarePenumbra},${.1+rng()*.26})`;g.lineWidth=(i%3?.4:.7);
    g.beginPath();g.moveTo(Math.cos(a)*from,Math.sin(a)*from);
    g.quadraticCurveTo(Math.cos(a+bow)*(from+to)/2,Math.sin(a+bow)*(from+to)/2,Math.cos(a+bow*2)*to,Math.sin(a+bow*2)*to);
    g.stroke();
  }
  // Two broken contours: the outer limb of the penumbra and the edge of the umbra.
  burinArc(g,0,0,r,0,TAU,p.flareEdge,.34,.6,seed+7,{segments:34,skips:4});
  burinArc(g,0,0,r*.82,0,TAU,p.flareEdge,.2,.45,seed+13,{segments:26,skips:5});
  // The umbra itself: a pool of ink with a ragged edge and a rubricated rim.
  g.beginPath();
  for(let i=0;i<=22;i++){const a=i/22*TAU,jr=u*(1+(rng()-.5)*.18);const x=Math.cos(a)*jr,y=Math.sin(a)*jr;if(i)g.lineTo(x,y);else g.moveTo(x,y);}
  g.closePath();g.fillStyle=`rgba(${p.flareUmbra},${onPaper()?.92:.96})`;g.fill();
  burinArc(g,0,0,u,0,TAU,p.flareRim,.75,.9,seed+19,{segments:20,skips:2});
  for(let i=0;i<14;i++){const a=rng()*TAU,d=u*(1.05+rng()*.5);g.fillStyle=`rgba(${p.flarePenumbra},${.14+rng()*.3})`;g.fillRect(Math.cos(a)*d,Math.sin(a)*d,.8,.8);}
  // Two lesser spots of the same group, as the sunspot plates always show.
  for(let i=0;i<2;i++){
    const a=rng()*TAU,d=r*(.62+rng()*.3),sr=u*(.2+rng()*.16);
    g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,sr,0,TAU);g.fillStyle=`rgba(${p.flareUmbra},.75)`;g.fill();
    g.strokeStyle=`rgba(${p.flarePenumbra},.35)`;g.lineWidth=.5;g.beginPath();g.arc(Math.cos(a)*d,Math.sin(a)*d,sr*2.1,0,TAU);g.stroke();
  }
  const sprite={canvas:c,size};
  flareSprites.set(key,sprite);
  if(flareSprites.size>16)flareSprites.delete(flareSprites.keys().next().value);
  return sprite;
}
function drawFlare(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale,core=hazardCore(h)*scale,reach=gravityRadius(h)*scale;
  if(x+reach<0||x-reach>W||y+reach<0||y-reach>H)return;
  const c=ink.field,rng=seeded(h.seed),pulse=reducedMotion?1:.9+.1*Math.sin(world.time*1.6+(h.phase||0));
  ctx.save();ctx.translate(x,y);
  // The field is drawn as a dotted ring at its true radius, with small outward barbs: this hazard
  // pushes, and its ring is pricked, where a black hole's edge is cut solid.
  ctx.setLineDash([1.7*scale,4.4*scale]);
  ctx.strokeStyle=`rgba(${c.fieldRing},.3)`;ctx.lineWidth=.8*scale;
  ctx.beginPath();ctx.arc(0,0,reach,0,TAU);ctx.stroke();ctx.setLineDash([]);
  for(let i=0;i<8;i++){
    const a=i/8*TAU+(h.phase||0)*.2;
    ctx.strokeStyle=`rgba(${c.fieldRing},.32)`;ctx.lineWidth=.65*scale;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a-.035)*(reach-2.6*scale),Math.sin(a-.035)*(reach-2.6*scale));
    ctx.lineTo(Math.cos(a)*(reach+1.4*scale),Math.sin(a)*(reach+1.4*scale));
    ctx.lineTo(Math.cos(a+.035)*(reach-2.6*scale),Math.sin(a+.035)*(reach-2.6*scale));
    ctx.stroke();
  }
  // The flare: burin strokes leaving the limb, breathing with the plate's own time.
  for(let i=0;i<36;i++){
    const a=i/36*TAU+(h.phase||0)*.1,len=r*(.5+rng()*1.05)*pulse;
    ctx.strokeStyle=`rgba(${c.flareRay},${(.1+rng()*.26)*pulse})`;ctx.lineWidth=(i%3?.45:.85)*scale;
    ctx.beginPath();ctx.moveTo(Math.cos(a)*(r+1),Math.sin(a)*(r+1));ctx.lineTo(Math.cos(a)*(r+1+len),Math.sin(a)*(r+1+len));ctx.stroke();
  }
  const sprite=flareSprite(h.seed,r,core);
  ctx.drawImage(sprite.canvas,-sprite.size/2,-sprite.size/2,sprite.size,sprite.size);
  ctx.restore();
}
// A nebula patch: a faint stippled haze, no more. There is no hatch and no fill; a sparse stipple
// thins to nothing well before the edge, and one broken contour is barely suggested inside it, so the
// cloud is noticed rather than looked at. It is baked once per patch and blitted, since nothing about
// it moves — it exists only to hide the chart, which the fogged guide ring says plainly enough.
const nebulaSprites=new Map();
function nebulaSprite(seed,radius){
  const rBucket=Math.round(radius/2)*2,key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2);
  const cached=nebulaSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil(rBucket*2.3));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);
  const p=ink.field,rng=seeded((seed>>>0)||1),r=Math.max(2,rBucket),paper=onPaper();
  const dots=Math.round(340+r*7);
  for(let i=0;i<dots;i++){
    // Drawn well inside the patch and faded off with the cube of the distance, so the stipple has no
    // edge of its own to read as a disc.
    const a=rng()*TAU,d=Math.pow(rng(),.8)*r*.92,fade=Math.pow(1-d/r,3);
    const wobble=1+Math.sin(a*3+seed)*.12;
    g.fillStyle=`rgba(${p.fog},${((paper?.02:.028)+rng()*(paper?.07:.1))*fade})`;
    g.fillRect(Math.cos(a)*d*wobble,Math.sin(a)*d*.82,.5+rng()*.45,.5+rng()*.4);
  }
  // One contour, mostly lifted: a suggestion of a boundary rather than a drawn one. Cut with the same
  // burin that engraves every other stroke on the plate, so the mist reads as ink and not a plotted curve.
  burinArc(g,0,0,r*.72,0,TAU,p.fogEdge,paper?.075:.055,.4,seed+31,{flatten:.82,segments:20,skips:9,wobble:.5});
  const sprite={canvas:c,size};
  nebulaSprites.set(key,sprite);
  if(nebulaSprites.size>10)nebulaSprites.delete(nebulaSprites.keys().next().value);
  return sprite;
}
function drawNebula(h){
  const x=sx(h.x),y=sy(h.y),r=h.r*scale;if(x+r*1.2<0||x-r*1.2>W||y+r<0||y-r>H)return;
  const sprite=nebulaSprite(h.seed,r);
  ctx.drawImage(sprite.canvas,x-sprite.size/2,y-sprite.size/2,sprite.size,sprite.size);
}
// The dark core, its edge, rim, faint arcs and outer glow depend only on h.seed and the plate —
// never on pull or the pulse — so, exactly like flareSprite and nebulaSprite above, they are cut
// once into a sprite instead of being replayed (including the paper core's own RNG-jittered edge)
// every single frame a hole is on screen.
const hazardCoreSprites=new Map();
function hazardCoreSprite(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2);
  const cached=hazardCoreSprites.get(key);if(cached)return cached;
  const size=Math.max(4,Math.ceil((rBucket+18)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);
  const rng=seeded(seed),r=rBucket;
  if(onPaper()){
    // A pooled ink blot with a slightly ragged, hand-drawn edge rather than a clean printed circle.
    g.fillStyle=ink.marks.hazardCore;g.beginPath();
    const edges=20;
    for(let i=0;i<=edges;i++){const a=i/edges*TAU,jr=r*(1+(rng()-.5)*.14);const px=Math.cos(a)*jr,py=Math.sin(a)*jr;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}
    g.closePath();g.fill();
  }else{
    g.fillStyle=ink.marks.hazardCore;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
  }
  burinArc(g,0,0,r,0,TAU,ink.marks.hazardEdge,.62,.85,seed+3,{segments:28,skips:2});
  burinArc(g,-.7,-.3,r,Math.PI*1.04,Math.PI*1.82,ink.marks.hazardRim,.8,1.35,seed+11,{segments:14,skips:1});
  for(let i=0;i<6;i++)burinArc(g,0,0,r+3+i*1.35,Math.PI*(1+i*.05),Math.PI*(1.8-i*.04),ink.marks.hazardArcFaint,.12-i*.014,.5,seed+17+i,{segments:8,skips:1});
  burinArc(g,0,0,r+15,0,TAU,ink.marks.hazardOuter,.16,.4,seed+41,{segments:18,skips:3});
  const sprite={canvas:c,size};
  hazardCoreSprites.set(key,sprite);
  if(hazardCoreSprites.size>24)hazardCoreSprites.delete(hazardCoreSprites.keys().next().value);
  return sprite;
}
// The 54 hatch strokes' angles and lengths come only from h.seed, bucketed by alpha band so
// same-alpha strokes share one stroke() call. Only the bucket alphas (via the live pulse) change
// frame to frame, so the geometry — the RNG walk and the Map/array bucketing, the biggest
// allocation in drawHazard — is cached; every stroke is still issued live at its exact current
// alpha, so the breathing pulse animation is untouched.
const hazardHatchCache=new Map();
function hazardHatchGeometry(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket;
  const cached=hazardHatchCache.get(key);if(cached)return cached;
  const rng=seeded(seed),buckets=new Map();
  for(let i=0;i<54;i++){
    const a=i/54*TAU,l=2+rng()*rBucket*.42,base=.08+rng()*.27,bucket=Math.min(11,Math.floor((base-.08)/.27*12));
    let seg=buckets.get(bucket);if(!seg){seg=[];buckets.set(bucket,seg);}
    seg.push(Math.cos(a)*(rBucket+3),Math.sin(a)*(rBucket+3),Math.cos(a+.035)*(rBucket+l+3),Math.sin(a+.035)*(rBucket+l+3));
  }
  const entries=[...buckets.entries()];
  hazardHatchCache.set(key,entries);
  if(hazardHatchCache.size>32)hazardHatchCache.delete(hazardHatchCache.keys().next().value);
  return entries;
}
// The accretion rings' shape depends only on h.seed, the plate and the viewport scale; their alpha
// is scaled uniformly by (1+pull*.5), and pull is 0 whenever the player is orbiting — the
// overwhelming majority of play, since it only turns nonzero during a brief free flight close
// enough to a hole to feel its pull. That common (pull===0) case is baked once and blitted; the
// rare pulled case falls back to the exact original live drawing rather than approximate it, so
// the pulled look never changes.
const hazardAccretionSprites=new Map();
function hazardAccretionSprite(seed,radius){
  const rBucket=Math.round(radius),key=seed+':'+rBucket+':'+plateName+':'+DPR.toFixed(2)+':'+scale.toFixed(3);
  const cached=hazardAccretionSprites.get(key);if(cached)return cached;
  const outer=rBucket*1.91+Math.max(10,rBucket*.15),size=Math.max(4,Math.ceil(outer*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.rotate(-.35);
  for(let i=0;i<4;i++){
    const rr=rBucket*(1.64+i*.09);
    burinArc(g,0,0,rr,0,TAU,ink.marks.hazardAccretion,.23-i*.04,(i===0?.9:.45)*scale,seed+i*29,{segments:20,skips:2,flatten:(.47+i*.028)/(1.64+i*.09)});
  }
  const sprite={canvas:c,size};
  hazardAccretionSprites.set(key,sprite);
  if(hazardAccretionSprites.size>24)hazardAccretionSprites.delete(hazardAccretionSprites.keys().next().value);
  return sprite;
}
function drawHazard(h){
  if(h.kind==='nebula')return drawNebula(h);
  if(h.kind==='flare')return drawFlare(h);
  const x=sx(h.x),y=sy(h.y),r=h.r*scale;if(y<-r*3||y>H+r*3)return;
  ctx.save();ctx.translate(x,y);const pulse=reducedMotion?1:.95+.05*Math.sin(world.time*1.2+(h.phase||0)),paper=onPaper();
  const pull=world.player.node?0:clamp(1-Math.hypot(world.player.x-h.x,world.player.y-h.y)/gravityRadius(h),0,1);
  // Ink does not glow: the paper plate drops the warm gravity-well halo and reads the pull only through the
  // rubrication accretion rings and the dark radiating hatch below.
  if(!paper){
    const halo=ctx.createRadialGradient(0,0,r*.7,0,0,r*3.4);halo.addColorStop(0,`rgba(${ink.marks.hazardHalo0},${(.25+pull*.12)*pulse})`);halo.addColorStop(.5,`rgba(${ink.marks.hazardHaloMid},.07)`);halo.addColorStop(1,`rgba(${ink.marks.hazardHaloEdge},0)`);ctx.fillStyle=halo;ctx.fillRect(-r*3.4,-r*3.4,r*6.8,r*6.8);
  }
  if(pull>0){
    ctx.save();ctx.rotate(-.35);
    for(let i=0;i<4;i++){
      const rr=r*(1.64+i*.09);
      burinArc(ctx,0,0,rr,0,TAU,ink.marks.hazardAccretion,(.23-i*.04)*(1+pull*.5),(i===0?.9:.45)*scale,h.seed+i*29,{segments:20,skips:2,flatten:(.47+i*.028)/(1.64+i*.09)});
    }
    ctx.restore();
  }else{
    const ring=hazardAccretionSprite(h.seed,r);
    ctx.drawImage(ring.canvas,-ring.size/2,-ring.size/2,ring.size,ring.size);
  }
  {
    const hatch=hazardHatchGeometry(h.seed,r);
    ctx.lineWidth=.5;
    for(const [bucket,seg] of hatch){
      ctx.strokeStyle=`rgba(${ink.marks.hazardHatch},${(.08+(bucket+.5)/12*.27)*pulse})`;
      ctx.beginPath();
      for(let j=0;j<seg.length;j+=4){ctx.moveTo(seg[j],seg[j+1]);ctx.lineTo(seg[j+2],seg[j+3]);}
      ctx.stroke();
    }
  }
  const core=hazardCoreSprite(h.seed,r);
  ctx.drawImage(core.canvas,-core.size/2,-core.size/2,core.size,core.size);
  ctx.restore();
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
  const warn=blocked||aim?.steep;
  const guideRgb=warn?ink.marks.aimBlockedStart:aim?ink.marks.aimLocked:ink.marks.aimDefault;
  const nearAlpha=warn?.72:aim?.78:.5,farAlpha=warn?.5:aim?.34:.12,weight=aim?1.15:.92;
  const legs=[];let total=0,px=ax,py=ay;
  for(let i=1;i<points.length;i++){
    if(points[i].distance<12)continue;
    const qx=sx(points[i].x),qy=sy(points[i].y),len=Math.hypot(qx-px,qy-py);
    if(len>.001){legs.push({x:px,y:py,ux:(qx-px)/len,uy:(qy-py)/len,len});total+=len;}
    px=qx;py=qy;
  }
  // Where the nib would run out along this course, as a fraction of the drawn line. Past it the
  // pricking is starved to almost nothing: the pen has no ink left to set it down.
  const dryFrom=preview.inkRange>=0&&end.distance>0?clamp(preview.inkRange/end.distance,0,1):1;
  if(total>1){
    const gap=Math.max(4,8.5*scale),crawl=reducedMotion?0:(world.time*26*scale)%gap;
    let leg=0,walked=0,d=crawl;
    while(d<total&&leg<legs.length){
      while(leg<legs.length-1&&walked+legs[leg].len<d){walked+=legs[leg].len;leg++;}
      const l=legs[leg],along=clamp(d-walked,0,l.len),f=d/total;
      const x=l.x+l.ux*along,y=l.y+l.uy*along,size=(1.8+f*2.2)*scale*weight;
      const starved=f>dryFrom?.16:1;
      ctx.fillStyle=`rgba(${guideRgb},${lerp(nearAlpha,farAlpha,f)*starved})`;
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
  if(aim?.perfect&&!preview.fogged){
    ctx.strokeStyle=`rgba(${ink.marks.aimPerfectArc},.65)`;ctx.lineWidth=1.2*scale;ctx.beginPath();ctx.arc(sx(aim.cx),sy(aim.cy),aim.radius*scale,aim.entryAngle,aim.entryAngle+aim.entryDir*.46,aim.entryDir<0);ctx.stroke();
  }
  // A transfer the nib cannot pay for is still aimed and still drawn: the course is barred with a
  // copper stroke where the ink gives out, so the decision to fly it is made in full knowledge.
  if(dryFrom<1&&total>1){
    let leg=0,walked=0,d=dryFrom*total;
    while(leg<legs.length-1&&walked+legs[leg].len<d){walked+=legs[leg].len;leg++;}
    const l=legs[leg],along=clamp(d-walked,0,l.len);
    const x=l.x+l.ux*along,y=l.y+l.uy*along,bar=4.6*scale;
    line(x-l.uy*bar,y+l.ux*bar,x+l.uy*bar,y-l.ux*bar,`rgba(${ink.marks.aimMarkBlocked},.8)`,1.1);
    ctx.strokeStyle=`rgba(${ink.marks.aimMarkBlocked},.55)`;ctx.lineWidth=.75;
    ctx.beginPath();ctx.arc(x,y,2.4*scale,0,TAU);ctx.stroke();
  }
  if(preview.fogged){ctx.setLineDash([]);ctx.strokeStyle=`rgba(${ink.field.fogEdge},.5)`;ctx.lineWidth=.9;ctx.beginPath();ctx.arc(bx,by,3.2,0,TAU);ctx.stroke();}
  // A course too steep to earn anything is marked with an open chevron across the line rather than
  // the landing square: the flight still reaches the planet, but the landing pays nothing.
  else if(aim?.steep){
    const l=legs[legs.length-1]||{ux:1,uy:0},w2=4.2*scale;
    ctx.strokeStyle=`rgba(${ink.marks.aimMarkBlocked},.8)`;ctx.lineWidth=1;ctx.beginPath();
    ctx.moveTo(bx-l.uy*w2-l.ux*w2,by+l.ux*w2-l.uy*w2);ctx.lineTo(bx,by);
    ctx.lineTo(bx+l.uy*w2-l.ux*w2,by-l.ux*w2-l.uy*w2);ctx.stroke();
  }
  else if(aim){ctx.translate(bx,by);ctx.rotate(Math.PI/4);ctx.strokeStyle=aim.perfect?`rgba(${ink.marks.aimMarkPerfect},.9)`:`rgba(${ink.marks.aimMarkNormal},.49)`;ctx.lineWidth=.8;ctx.strokeRect(-2.5,-2.5,5,5);}
  else if(blocked){line(bx-3,by-3,bx+3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,.9);line(bx+3,by-3,bx-3,by+3,`rgba(${ink.marks.aimMarkBlocked},.7)`,.9);}
  ctx.restore();
}
