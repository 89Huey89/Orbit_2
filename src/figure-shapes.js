'use strict';
/* Orbit · src/figure-shapes.js
   The per-constellation figures cut behind each fork's three stars, and the dispatch
   table that looks one up by name — split out of figures.js, which keeps the geometry
   primitives (figSpine, figBox, figRibbon, figInk, figHatch, figWash, ...) these call. */
// A long sailmaker's needle: a thin tapering shaft with a pierced eye near the blunt end, and a
// curling thread that doubles back through all three stars. A needle that carried the budget in its
// shaft would stop being a needle, so the shaft takes only enough of it to read as forged and the
// thread — which is free to wander — spends the rest, swinging nearly the whole box at the middle star.
function figNeedle(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,54),steps=48,box=figBox(spine,p1);
  const shaft=t=>3.4+box.lat(t,.055);
  const halfW=t=>t<.05?shaft(t)*.76:t>.9?Math.max(.4,shaft(t)*(1-(t-.9)/.1)):shaft(t);
  const left=figRibbon(spine,t=>-halfW(t),steps),right=figRibbon(spine,t=>halfW(t),steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.7,.08,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.08,1.3,state.contourRgb,state.contourAlpha);
  // Set clear of the star punch (buildFigureLayer's own destination-out pass erases every figure mark
  // within p0.r+8), which used to take the eye out with it: pushed out to p0.r+18 on the spine's own
  // outward side, with its long axis turned across the spine rather than along it. That reach is
  // capped the same way figBox caps every other outward mark — by what inboard() leaves past p0's own
  // position — since a fork whose bottom star is cut at the full inboard reach would otherwise push
  // the eye past the sheet's own edge; the 54-unit lead-in to spine.at(0) already clears the punch on
  // its own, so the cap can give ground there without the eye landing back inside it.
  const eyeReach=Math.max(12,Math.min(p0.r+18,world.inboard(FIG_EDGE)-Math.abs(p0.x)));
  const eyeDir=spine.at(0),eye=figAt(spine,0,eyeReach),eyeSeed=Math.floor(rng()*4294967296)>>>0;
  g.save();g.translate(eye.x,eye.y);g.rotate(Math.atan2(eyeDir.ty,eyeDir.tx)+Math.PI/2);
  burinArc(g,0,0,3.6,0,TAU,state.contourRgb,state.contourAlpha,1.3,eyeSeed,{flatten:7/3.6,segments:16,skips:2,wobble:.25});
  burinArc(g,0,0,1.4,0,TAU,state.contourRgb,state.contourAlpha,1,eyeSeed^0x91,{flatten:3.2/1.4,segments:12,skips:2,wobble:.25});
  g.restore();
  const thread=[];for(let i=0;i<=76;i++){const t=.08+i/76*.86,s=spine.at(t),o=box.lat(t,Math.sin(t*9+side)*.95);thread.push({x:s.x+s.px*o,y:s.y+s.py*o});}
  figInk(g,thread,rng,.7,.1,1,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,t=>-halfW(t),t=>halfW(t),Math.round(46*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-halfW(t)-2,t=>halfW(t)+2,26,rng,.9);
}
// A billowing lateen sail on a spar: a near-straight luff close to the spine and a bulging leech that
// bellies out through the middle star.
function figSail(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,46),steps=52,box=figBox(spine,p1);
  // The luff is hauled close to the spine on the crowded outward side; the leech bellies into the open
  // half of the sheet and is fullest at the middle star, which is where a lateen sail draws.
  const inner=t=>2.4+box.lat(t,.05),outer=t=>-2.4+box.lat(t,-.95);
  const left=figRibbon(spine,inner,steps),right=figRibbon(spine,outer,steps);
  figChalkTrial(g,rng,left,right);
  // The spar: a taut, nearly straight timber the luff is hauled to, cut with almost none of the
  // cloth's own jag so it reads as rigid beside the belly of the leech — the one mark that turns the
  // shape from a generic lens into a sail set on a mast.
  const mast=figRibbon(spine,()=>0,steps);
  figInk(g,[mast[3],mast[steps-3]],rng,.1,0,1.7,state.contourRgb,state.contourAlpha);
  figInk(g,left,rng,.6,.06,1.5,state.contourRgb,state.contourAlpha);figInk(g,right,rng,1,.05,1.2,state.contourRgb,state.contourAlpha);
  // The foot and head: a real closing line at full weight rather than the incidental stroke a shared
  // seed used to leave behind, so the belly reads as cloth bent between two named edges.
  figInk(g,[left[2],right[2]],rng,.3,0,1.3,state.contourRgb,state.contourAlpha);figInk(g,[left[steps-2],right[steps-2]],rng,.3,0,1.3,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,inner,outer,Math.round(60*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,inner,outer,30,rng,.9);
}
// A classical chelys lyre: two curved arms rising from a soundbox to a crossbar, with strings strung
// between, the soundbox low on the frame and the yoke high.
function figLyre(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,40),steps=48,box=figBox(spine,p1);
  // Both arms sweep out from the soundbox to the yoke, each taking its own side's share of the budget:
  // the inward arm is the deeper of the two because that is the half of the sheet that is free.
  const armOut=t=>2.6+box.lat(t,.92),armInner=t=>1.7+box.lat(t,.46);
  const bowOut=t=>-2.6+box.lat(t,-.92),bowInner=t=>-1.7+box.lat(t,-.46);
  const leftOut=figRibbon(spine,bowOut,steps),leftIn=figRibbon(spine,bowInner,steps);
  const rightIn=figRibbon(spine,armInner,steps),rightOut=figRibbon(spine,armOut,steps);
  figChalkTrial(g,rng,leftOut,rightOut);
  figInk(g,leftOut,rng,.7,.07,1.3,state.contourRgb,state.contourAlpha);figInk(g,leftIn,rng,.7,.09,1,state.contourRgb,state.contourAlpha);
  figInk(g,rightIn,rng,.7,.09,1,state.contourRgb,state.contourAlpha);figInk(g,rightOut,rng,.7,.07,1.3,state.contourRgb,state.contourAlpha);
  // Moved clear of the star punch (see figNeedle's eye, above) rather than shrunk: set in on the
  // spine's inward side at p0.r+16, and given the full mass of a real soundbox now that there is room.
  const boxDir=spine.at(0),chelys=figAt(spine,0,-(p0.r+16));
  g.save();g.translate(chelys.x,chelys.y);g.rotate(Math.atan2(boxDir.ty,boxDir.tx));
  burinArc(g,0,0,34,0,TAU,state.contourRgb,state.contourAlpha,1.4,Math.floor(rng()*4294967296)>>>0,{flatten:12/34,segments:28,skips:3,wobble:.2});
  g.restore();
  const i92=Math.round(steps*.92),yl=leftIn[i92],yr=rightIn[i92];
  burinSegment(g,yl.x,yl.y,yr.x,yr.y,state.contourRgb,state.contourAlpha,1.5,Math.floor(rng()*4294967296)>>>0,{segments:3,wobble:.3,hair:true});
  for(let i=0;i<7;i++){
    const u=i/6,t0=.14,t1=.9,a=spine.at(t0),b=spine.at(t1);
    const o0=lerp(bowInner(t0),armInner(t0),u)*.86,o1=lerp(bowInner(t1),armInner(t1),u)*.86;
    const x0=a.x+a.px*o0,y0=a.y+a.py*o0,x1=b.x+b.px*o1,y1=b.y+b.py*o1;
    burinSegment(g,x0,y0,x1,y1,state.contourRgb,state.contourAlpha,.7,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.2,hair:false});
  }
  if(state.hatchFrac>0){
    figHatch(g,spine,bowOut,bowInner,Math.round(20*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,armInner,armOut,Math.round(20*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,leftOut,leftIn,state);figWash(g,rightIn,rightOut,state);}
  g.fillStyle=state.contour;figStipple(g,spine,bowOut,armOut,22,rng,.7);
}
// A pointed diadem: a smooth hoop with five discrete points rising off it, and a jewel collar set
// clear of each star's rim.
function figCrown(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,34),steps=48,[t0,,t2]=spine.stops,box=figBox(spine,p1);
  // The hoop keeps close to the spine on both sides; a band this thin sampled at 48 steps is smooth
  // whatever bumps ride on it, unlike the square wave the points used to be built into, which cut as
  // a jagged polygon rather than a crown.
  const band=t=>-2+box.lat(t,-.13),hoop=t=>2.4+box.lat(t,.1);
  const left=figRibbon(spine,band,steps),right=figRibbon(spine,hoop,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  // Five points, rooted at fixed stations across the hoop rather than sampled into its own boundary:
  // each a pair of burin cuts converging from the band to an apex a flat 26 units past it, closed with
  // a small bead at the tip, the way a real diadem's points are struck apart from its rim.
  for(const u of [.12,.32,.5,.68,.88]){
    const t=lerp(t0,t2,u),ta=t-.02,tb=t+.02;
    const a=figAt(spine,ta,band(ta)),b=figAt(spine,tb,band(tb)),apex=figAt(spine,t,band(t)-26);
    const seed=Math.floor(rng()*4294967296)>>>0;
    burinSegment(g,a.x,a.y,apex.x,apex.y,state.contourRgb,state.contourAlpha,1.1,seed,{segments:2,wobble:.22,hair:false});
    burinSegment(g,b.x,b.y,apex.x,apex.y,state.contourRgb,state.contourAlpha,1.1,seed^0x5b,{segments:2,wobble:.22,hair:false});
    burinArc(g,apex.x,apex.y,1.6,0,TAU,state.contourRgb,state.contourAlpha,1,seed^0x91,{segments:8,skips:1,wobble:.2});
  }
  // Collars pushed clear of the node's own capture ring (see the figure-furniture finding).
  for(const p of [p0,p1,p2]){
    burinArc(g,p.x,p.y,p.r+22,0,TAU,state.contourRgb,state.contourAlpha,1.2,Math.floor(rng()*4294967296)>>>0,{segments:24,skips:3,wobble:.2});
    burinArc(g,p.x,p.y,p.r+30,-.65,.65,state.contourRgb,state.contourAlpha,1.2,Math.floor(rng()*4294967296)>>>0,{segments:8,skips:1,wobble:.2});
  }
  if(state.hatchFrac>0){figHatch(g,spine,band,hoop,Math.round(40*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>band(t)-2,t=>hoop(t)+2,24,rng,.9);
}
// Points along a circular arc, ready for figInk to cut as a broken hand-drawn curve.
function figArcPts(cx,cy,r,from,to,steps){
  const pts=[];for(let i=0;i<=steps;i++){const a=lerp(from,to,i/steps);pts.push({x:cx+Math.cos(a)*r,y:cy+Math.sin(a)*r});}
  return pts;
}
// A phoenix. The body rises along the spine from the nest below the bottom star, the wings open
// either side of the middle one, and a crested, hook-beaked head is set past the top; the tail
// fans out behind the nest, and the fire under it throws its light past the bird's own feet.
function figPhoenix(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,50),steps=72,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const wingOut=t=>box.lat(t,.95),wingIn=t=>box.lat(t,-.95);
  const body=t=>t>t2?Math.max(1,6.5-(t-t2)*44):t<t0?Math.max(1,5-(t0-t)*20):6;
  const spanOut=t=>wingOut(t)+body(t),spanIn=t=>wingIn(t)-body(t);
  const left=figRibbon(spine,spanIn,steps),right=figRibbon(spine,spanOut,steps);
  const bodyL=figRibbon(spine,t=>-body(t),steps),bodyR=figRibbon(spine,body,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,bodyL,rng,.5,.08,1,state.contourRgb,state.contourAlpha);figInk(g,bodyR,rng,.5,.08,1,state.contourRgb,state.contourAlpha);
  // The seam between each wing and its own covert feathers, run from the middle star to the wing's
  // own edge the same way the moth's veins are.
  const edge=(t,o)=>o<0?spanIn(t):spanOut(t);
  for(const o of [-1,1])for(let i=0;i<5;i++){
    const t=lerp(t1+.02,t2-.03,i/5),far=edge(t,o)*(.6+i*.07);
    if(Math.abs(far)>body(t)+3)figInk(g,[figAt(spine,t1,o*body(t1)),figAt(spine,t,far)],rng,.6,.2,.5,state.contourRgb,state.contourAlpha);
  }
  // Body rings, then the crested head past the top star: a hooked beak on its leading edge and
  // three plumes fanned off the crown, in place of the moth's own combed antennae.
  for(let i=0;i<10;i++){
    const t=lerp(t0,t2-.02,i/10);
    figInk(g,[figAt(spine,t,-body(t)),figAt(spine,t,body(t))],rng,.35,.18,.5,state.contourRgb,state.contourAlpha);
  }
  const tip=spine.at(1),headD=Math.max(46,p2.r+20),headR=6;
  const along=d=>({x:p2.x+tip.tx*d,y:p2.y+tip.ty*d});
  const head=along(headD),beakBase=along(headD+headR),beak=along(headD+headR+9);
  burinSegment(g,tip.x,tip.y,head.x,head.y,state.contourRgb,state.contourAlpha,.8,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.2,hair:false});
  burinArc(g,head.x,head.y,headR,0,TAU,state.contourRgb,state.contourAlpha,1,Math.floor(rng()*4294967296)>>>0,{segments:14,skips:2,wobble:.2});
  figInk(g,[beakBase,beak,{x:beak.x+tip.px*4,y:beak.y+tip.py*4}],rng,.4,0,.8,state.contourRgb,state.contourAlpha);
  for(const o of [-1,0,1]){
    const base={x:head.x+tip.px*o*2.5,y:head.y+tip.py*o*2.5},apex={x:base.x+tip.tx*11+tip.px*o*5,y:base.y+tip.ty*11+tip.py*o*5};
    figInk(g,[base,apex],rng,.5,.06,.85,state.contourRgb,state.contourAlpha);
  }
  // The fanned tail, struck below the nest as plumes spread past the spine's own lower extension.
  const foot=spine.at(0),trail=d=>({x:p0.x-foot.tx*d,y:p0.y-foot.ty*d});
  for(let i=0;i<7;i++){
    const o=(i-3)/3,feather=[];
    for(let k=0;k<=10;k++){const u=k/10,base=trail(16+u*54),off=o*(u*u*32+4);feather.push({x:base.x+foot.px*off,y:base.y+foot.py*off});}
    figInk(g,feather,rng,.5,.08,.8,state.contourRgb,state.contourAlpha);
  }
  // The nest and its fire: a rough ring of struck twigs at the bottom star with flame rays thrown
  // past it, the same vocabulary the lantern's own flame throws past its rim.
  burinArc(g,p0.x,p0.y,p0.r+14,-2.4,2.4,state.contourRgb,state.contourAlpha,1.1,Math.floor(rng()*4294967296)>>>0,{segments:14,skips:2,wobble:.3});
  for(let i=0;i<14;i++){
    const a=Math.PI*.5+(rng()-.5)*1.6,long=i%3===0,r0=p0.r+10,r1=r0+(long?18:9)+rng()*5;
    figInk(g,[{x:p0.x+Math.cos(a)*r0,y:p0.y+Math.sin(a)*r0},{x:p0.x+Math.cos(a)*r1,y:p0.y+Math.sin(a)*r1}],rng,.4,0,long?.7:.45,state.contourRgb,state.contourAlpha);
  }
  if(state.hatchFrac>0){
    figHatch(g,spine,spanIn,t=>-body(t),Math.round(30*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,body,spanOut,Math.round(30*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,bodyL,state);figWash(g,bodyR,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>spanIn(t)-2,t=>spanOut(t)+2,30,rng,.8);
}
// A toucan. The body fills the lower two stars and the perched feet grip the bottom one; the head
// and its bill — by far the largest single shape in the figure, exactly as it dwarfs the bird it
// sits on — rise past the top star as a single tapered wedge, the one line on the plate cut clean.
function figToucan(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,44),steps=56,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const neck=t=>Math.pow(clamp((t-t1)/Math.max(.001,t2-t1),0,1),.6);
  const bodyOut=t=>t<=t1?box.lat(t,.9):lerp(box.lat(t1,.9),3,neck(t)),bodyIn=t=>t<=t1?box.lat(t,-.9):lerp(box.lat(t1,-.9),-3,neck(t));
  const left=figRibbonRange(spine,bodyIn,steps,0,t2),right=figRibbonRange(spine,bodyOut,steps,0,t2);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.8,.06,1.4,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.8,.06,1.4,state.contourRgb,state.contourAlpha);
  // A folded wing laid over the body's outward flank.
  figInk(g,figRibbonRange(spine,t=>bodyOut(t)*.6,steps,t0*.3,t1),rng,.6,.1,.9,state.contourRgb,state.contourAlpha);
  // Perched feet, gripping a bare branch under the bottom star.
  const footDir=spine.at(0),footAnchor={x:p0.x-footDir.tx*(p0.r+20),y:p0.y-footDir.ty*(p0.r+20)},perchHalf=Math.max(20,box.out*.55);
  figInk(g,[{x:footAnchor.x-footDir.px*perchHalf,y:footAnchor.y-footDir.py*perchHalf},{x:footAnchor.x+footDir.px*perchHalf,y:footAnchor.y+footDir.py*perchHalf}],rng,.3,0,1.1,state.contourRgb,state.contourAlpha);
  for(const o of [-.4,.4]){
    const toe={x:footAnchor.x+footDir.px*o*perchHalf,y:footAnchor.y+footDir.py*o*perchHalf};
    figInk(g,[figAt(spine,0,o*bodyOut(0)*1.3),toe],rng,.3,0,.8,state.contourRgb,state.contourAlpha);
  }
  // The head at the top star, and the bill struck past it as a smooth curve rather than the body's
  // own broken contour.
  const dir=spine.at(1),billLen=Math.max(80,box.out*1.5,p2.r+50),seed=Math.floor(rng()*4294967296)>>>0;
  burinArc(g,p2.x,p2.y,9,0,TAU,state.contourRgb,state.contourAlpha,1.2,seed,{segments:14,skips:2,wobble:.2});
  const along=d=>({x:p2.x+dir.tx*d,y:p2.y+dir.ty*d}),tip=along(billLen),bx=dir.px*9,by=dir.py*9;
  figCurve(g,[[p2.x+bx,p2.y+by],[p2.x+bx+dir.tx*billLen*.4,p2.y+by+dir.ty*billLen*.4],[tip.x+dir.px*2,tip.y+dir.py*2],[tip.x,tip.y]],state.contourRgb,state.contourAlpha,1.3,seed);
  figCurve(g,[[p2.x-bx,p2.y-by],[p2.x-bx+dir.tx*billLen*.4,p2.y-by+dir.ty*billLen*.4],[tip.x-dir.px*2,tip.y-dir.py*2],[tip.x,tip.y]],state.contourRgb,state.contourAlpha,1.3,seed^0x5b);
  burinSegment(g,p2.x,p2.y,tip.x,tip.y,state.contourRgb,state.contourAlpha*.7,.7,seed^0x91,{segments:3,wobble:.15,hair:false});
  const eye=along(-4);
  burinArc(g,eye.x+dir.px*6,eye.y+dir.py*6,1.6,0,TAU,state.contourRgb,state.contourAlpha,1,seed^0x2f,{segments:8,skips:1,wobble:.2});
  if(state.hatchFrac>0)figHatch(g,spine,bodyIn,bodyOut,Math.round(46*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>bodyIn(t)-2,t=>bodyOut(t)+2,26,rng,.85);
}
// A peacock. A slender body runs the spine from the legs at the bottom star to the crested head at
// the top, and the train opens in a fan behind the middle one, each feather struck to an eye near
// its own tip, spread across the outward half-turn a fork always leaves clear there.
function figPeacock(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,46),steps=56,[,t1]=spine.stops,box=figBox(spine,p1);
  const bodyOut=t=>1.8+box.lat(t,.12),bodyIn=t=>-1.8+box.lat(t,-.12);
  const left=figRibbon(spine,bodyIn,steps),right=figRibbon(spine,bodyOut,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  // The train: a rib per feather, swung out from the star's own rim across a half-turn, each ending
  // in an eye of two concentric rings rather than closing into the astrolabe's own full circle.
  const root=spine.at(t1),fanR=Math.max(28,Math.min(box.out*1.5,world.inboard(FIG_EDGE)-Math.abs(root.x))),plumes=9;
  for(let i=0;i<plumes;i++){
    const u=i/(plumes-1)-.5,a=u*Math.PI*.86,dx=root.px*Math.cos(a)+root.tx*Math.sin(a),dy=root.py*Math.cos(a)+root.ty*Math.sin(a);
    const rib=[];for(let k=0;k<=10;k++){const rr=k/10*fanR*(1-.08*Math.abs(u));rib.push({x:root.x+dx*(p1.r+16+rr),y:root.y+dy*(p1.r+16+rr)});}
    figInk(g,rib,rng,.5,.1,.9,state.contourRgb,state.contourAlpha);
    const eye={x:root.x+dx*(p1.r+16+fanR*.94),y:root.y+dy*(p1.r+16+fanR*.94)};
    figInk(g,figArcPts(eye.x,eye.y,3.6,0,TAU,12),rng,.4,.1,.7,state.contourRgb,state.contourAlpha);
    figInk(g,figArcPts(eye.x,eye.y,1.6,0,TAU,10),rng,.35,.14,.5,state.contourRgb,state.contourAlpha);
  }
  burinArc(g,p1.x,p1.y,p1.r+13,-Math.PI*.5,Math.PI*.5,state.contourRgb,state.contourAlpha,1.1,Math.floor(rng()*4294967296)>>>0,{segments:16,skips:2,wobble:.2});
  // Legs at the bottom star.
  const footDir=spine.at(0);
  for(const o of [-.4,.4]){
    const toe={x:p0.x-footDir.tx*(p0.r+16)+footDir.px*o*10,y:p0.y-footDir.ty*(p0.r+16)+footDir.py*o*10};
    figInk(g,[figAt(spine,0,o*bodyOut(0)*1.2),toe],rng,.4,0,.9,state.contourRgb,state.contourAlpha);
  }
  // The crested head above the top star.
  const tip=spine.at(1),headD=Math.max(30,p2.r+18),headR=5;
  const along=d=>({x:p2.x+tip.tx*d,y:p2.y+tip.ty*d}),head=along(headD);
  burinSegment(g,p2.x,p2.y,head.x,head.y,state.contourRgb,state.contourAlpha,.8,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.2,hair:false});
  burinArc(g,head.x,head.y,headR,0,TAU,state.contourRgb,state.contourAlpha,1,Math.floor(rng()*4294967296)>>>0,{segments:12,skips:2,wobble:.2});
  for(const o of [-1,0,1]){
    const base={x:head.x+tip.px*o*2.5,y:head.y+tip.py*o*2.5};
    figInk(g,[base,{x:base.x+tip.tx*10,y:base.y+tip.ty*10}],rng,.4,0,.7,state.contourRgb,state.contourAlpha);
  }
  if(state.hatchFrac>0)figHatch(g,spine,bodyIn,bodyOut,Math.round(20*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>bodyIn(t)-2,t=>bodyOut(t)+2,18,rng,.8);
}
// A serpent. The body is a wave whose centre line crosses the spine at each of the three stars,
// tapering to a tail below and rearing into a head above the top one.
function figSerpent(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,74),steps=88,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const phase=t=>t<=t0?(t-t0)/Math.max(.001,t0)*2.3:t<=t1?Math.PI*(t-t0)/(t1-t0):
    t<=t2?Math.PI*(1+(t-t1)/(t2-t1)):Math.PI*2+(t-t2)/Math.max(.001,1-t2)*2.1;
  // The centre line still crosses the spine at all three stars, so each coil is free to take its own
  // side's share of the budget: the coil above the middle star swings into the open inward half and is
  // half again as deep as the one below it, and the body is thickest where it passes the middle star.
  const swing=t=>Math.sin(phase(t)),mid=t=>box.lat(t,swing(t)*.92)+swing(t)*6;
  const thick=t=>1.4+box.half*.15*box.mass(t);
  const left=figRibbon(spine,t=>mid(t)-thick(t),steps),right=figRibbon(spine,t=>mid(t)+thick(t),steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.7,.05,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.05,1.3,state.contourRgb,state.contourAlpha);
  // Belly bands across the body, thickest where it coils past the middle star.
  for(let i=1;i<26;i++){
    const t=t0*.4+i/26*(1-t0*.4);
    figInk(g,[figAt(spine,t,mid(t)-thick(t)),figAt(spine,t,mid(t)+thick(t))],rng,.4,.22,.55,state.contourRgb,state.contourAlpha);
  }
  // The head: a wedge with an eye and a forked tongue, set on the spine's upper extension.
  const head=spine.at(.985),hx=head.x+head.px*mid(.985),hy=head.y+head.py*mid(.985);
  const dir=Math.atan2(head.ty,head.tx),headSeed=Math.floor(rng()*4294967296)>>>0;
  g.save();g.translate(hx,hy);g.rotate(dir);
  figCurve(g,[[-9,-6],[6,-8],[14,-4],[20,-1.4],[14,4],[6,7],[-9,6]],state.contourRgb,state.contourAlpha,1.2,headSeed);
  burinArc(g,4,-1.6,1.9,0,TAU,state.contourRgb,state.contourAlpha,1,headSeed^0x2f,{segments:10,skips:2,wobble:.25});
  burinSegment(g,20,-1.4,30,-4.6,state.contourRgb,state.contourAlpha,.8,headSeed^0x53,{segments:2,wobble:.25,hair:false});
  burinSegment(g,24.6,-2.9,30,.6,state.contourRgb,state.contourAlpha,.8,headSeed^0x77,{segments:2,wobble:.25,hair:false});
  g.restore();
  if(state.hatchFrac>0){figHatch(g,spine,t=>mid(t)-thick(t),t=>mid(t)+thick(t),Math.round(60*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>mid(t)-thick(t)-2,t=>mid(t)+thick(t)+2,30,rng,.8);
}
// A ship. The hull is bellied out below the deck, its keel deepest amidships at the middle star where
// the mast is stepped, and the truck with its pennant is set on the top one.
function figArgo(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,60),steps=52,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  // The hull is stepped amidships on the middle star rather than ending there, so its deepest point —
  // the figure's whole mass — falls at t1 and the keel rises away to stem and stern. Below deck is the
  // inward half of the sheet and above deck the outward one, which is the same way round as the sail.
  const stern=Math.max(.02,t0-(t1-t0)*.34),bow=Math.min(.99,t1+(t2-t1)*.46);
  const arc=t=>t<=stern||t>=bow?0:Math.pow(Math.sin(Math.PI/2*(t<t1?(t-stern)/(t1-stern):(bow-t)/(bow-t1))),.7);
  const hull=t=>-arc(t)*box.room(t)*.92,deck=t=>arc(t)*box.out*.16;
  const keel=figRibbonRange(spine,hull,steps,stern,bow),sheer=figRibbonRange(spine,deck,steps,stern,bow);
  figChalkTrial(g,rng,keel,sheer);
  figInk(g,keel,rng,.8,.04,1.6,state.contourRgb,state.contourAlpha);figInk(g,sheer,rng,.6,.06,1.2,state.contourRgb,state.contourAlpha);
  for(const f of [.7,.46,.24])figInk(g,figRibbonRange(spine,t=>lerp(deck(t),hull(t),f),steps,stern,bow),rng,.7,.12,.7,state.contourRgb,state.contourAlpha);
  // Oar ports along the upper strake, and the stem and stern posts.
  for(let i=1;i<10;i++){
    const t=lerp(stern,bow,i/10),o=lerp(deck(t),hull(t),.82);
    figInk(g,[figAt(spine,t,o-3),figAt(spine,t,o+3)],rng,.3,0,.75,state.contourRgb,state.contourAlpha);
  }
  figInk(g,[figAt(spine,stern,0),figAt(spine,stern-.045,16)],rng,.6,0,1.5,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,stern-.045,16),figAt(spine,stern-.03,8)],rng,.5,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,bow,0),figAt(spine,bow+.04,13)],rng,.6,0,1.5,state.contourRgb,state.contourAlpha);
  // The mast, stepped on the middle star and carrying its yard and square sail.
  figInk(g,[figAt(spine,t1,-2),figAt(spine,t2+.02,-2)],rng,.5,0,1.9,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,t1,2),figAt(spine,t2+.02,2)],rng,.5,0,1.5,state.contourRgb,state.contourAlpha);
  const yard=lerp(t1,t2,.58);
  figInk(g,[figAt(spine,yard,-box.out*.3),figAt(spine,yard,box.out*.98)],rng,.5,0,1.5,state.contourRgb,state.contourAlpha);
  const luff=[],leech=[];
  for(let i=0;i<=20;i++){
    const u=i/20,t=lerp(yard,t1+.02,u);
    luff.push(figAt(spine,t,lerp(-box.out*.14,0,u)));
    leech.push(figAt(spine,t,lerp(box.out*.94,box.out*.2,u)+Math.sin(Math.PI*u)*box.out*.28));
  }
  figInk(g,leech,rng,.9,.04,1.25,state.contourRgb,state.contourAlpha);figInk(g,luff,rng,.5,.1,.8,state.contourRgb,state.contourAlpha);
  figInk(g,[leech[20],luff[20]],rng,.5,0,.9,state.contourRgb,state.contourAlpha);
  for(let i=1;i<5;i++){const u=i/5;figInk(g,[luff[Math.round(u*20)],leech[Math.round(u*20)]],rng,.6,.42,.5,state.contourRgb,state.contourAlpha);}
  // Shrouds and a pennant streaming from the truck.
  for(const o of [-.3,.64])figInk(g,[figAt(spine,t2-.012,0),figAt(spine,t1+.008,o*box.out)],rng,.6,.18,.6,state.contourRgb,state.contourAlpha);
  const flag=[];for(let i=0;i<=10;i++){const u=i/10;flag.push(figAt(spine,lerp(t2+.025,t2+.014,u),u*box.out*.64+Math.sin(u*6)*4));}
  figInk(g,flag,rng,.5,.04,.85,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,deck,hull,Math.round(50*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,sheer,keel,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>hull(t)-2,t=>deck(t)+2,26,rng,.85);
}
// A quill. The nib is cut at the bottom star, the vane opens at the middle one and the plume
// curls past the top; the barbs are laid in with short slanted strokes on both sides of the shaft.
function figQuill(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,66),steps=56,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const shaft=t=>1+2.9*clamp((t-t0*.5)/Math.max(.001,1-t0*.5),0,1);
  // The vane is stripped from the calamus below, opens to its full width at the middle star, and
  // tapers away into the plume above — which is where a real feather is widest as well.
  const barbs=t=>{const bare=lerp(t0,t1,.42);return t<=bare||t>=.995?0:t<t1?Math.pow(Math.sin(Math.PI/2*(t-bare)/(t1-bare)),.8):Math.pow(Math.sin(Math.PI/2*(.995-t)/(.995-t1)),.75);};
  const vane=t=>-barbs(t)*box.room(t)*.93;
  const inner=t=>barbs(t)*box.out*.42;
  const left=figRibbon(spine,t=>vane(t)-shaft(t),steps),right=figRibbon(spine,t=>inner(t)+shaft(t),steps);
  const shaftL=figRibbon(spine,t=>-shaft(t),steps),shaftR=figRibbon(spine,shaft,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,shaftL,rng,.6,.05,1.25,state.contourRgb,state.contourAlpha);figInk(g,shaftR,rng,.6,.05,1.25,state.contourRgb,state.contourAlpha);
  figInk(g,left,rng,1.1,.07,1.15,state.contourRgb,state.contourAlpha);figInk(g,right,rng,1,.09,1,state.contourRgb,state.contourAlpha);
  // Barbs, laid from the shaft out to the edge of each vane.
  for(let i=0;i<88;i++){
    const t=lerp(lerp(t0,t1,.42),.99,i/88),slant=.16;
    const o1=vane(t),o0=inner(t);
    if(o1<-1)figInk(g,[figAt(spine,t,-shaft(t)),figAt(spine,t-slant*.04,o1*(.82+rng()*.18))],rng,.4,0,.5,state.contourRgb,state.contourAlpha);
    if(o0>1)figInk(g,[figAt(spine,t,shaft(t)),figAt(spine,t-slant*.04,o0*(.82+rng()*.18))],rng,.4,0,.45,state.contourRgb,state.contourAlpha);
  }
  // The nib: two lines closing to a point at the bottom star, with its slit.
  const nib=t0;
  figInk(g,[figAt(spine,nib+.06,-3.4),figAt(spine,nib-.012,-.7)],rng,.4,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.06,3.4),figAt(spine,nib-.012,.7)],rng,.4,0,1.1,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.055,0),figAt(spine,nib-.01,0)],rng,.3,0,.6,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,nib+.062,-3.6),figAt(spine,nib+.062,3.6)],rng,.3,0,.7,state.contourRgb,state.contourAlpha);
  if(state.hatchFrac>0){figHatch(g,spine,vane,inner,Math.round(54*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>vane(t)-2,t=>inner(t)+2,26,rng,.8);
}
// A hanging lantern. The dome springs from the top star, the flame burns at the middle one and
// throws its light out past the rim, and the foot stands on the bottom star.
function figLantern(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,62),steps=56,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  const dome=t=>clamp((t-t2)/Math.max(.001,(1-t2)*.62),0,1);
  const foot=t=>clamp((t0-t)/Math.max(.001,t0*.62),0,1);
  // A bellied lantern rather than a straight-sided box: the glass is fullest where the flame burns at
  // the middle star and draws in a little toward the sills on the outer two.
  const shell=t=>(t>t2?Math.max(0,Math.cos(dome(t)*Math.PI*.5)):t<t0?1+foot(t)*.24:1)*(.76+.24*box.mass(t));
  const glassIn=t=>-shell(t)*box.room(t)*.94,glassOut=t=>shell(t)*box.out*.94;
  const left=figRibbon(spine,glassIn,steps),right=figRibbon(spine,glassOut,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.7,.06,1.4,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.7,.06,1.4,state.contourRgb,state.contourAlpha);
  // Corner posts, glazing bars and the sills at each star.
  for(const w of [glassIn,glassOut])figInk(g,figRibbon(spine,t=>w(t)-Math.sign(w(t))*4.5,steps),rng,.6,.16,.8,state.contourRgb,state.contourAlpha);
  for(const t of [t0,lerp(t0,t1,.5),t1,lerp(t1,t2,.5),t2]){
    figInk(g,[figAt(spine,t,glassIn(t)),figAt(spine,t,glassOut(t))],rng,.5,.06,t===t0||t===t2?1.5:.7,state.contourRgb,state.contourAlpha);
  }
  // The foot below and the ring above.
  const sill=Math.max(0,t0-t0*.62);
  figInk(g,[figAt(spine,sill,glassIn(sill)*1.12),figAt(spine,sill,glassOut(sill)*1.12)],rng,.5,0,1.6,state.contourRgb,state.contourAlpha);
  const hook=spine.at(clamp(t2+(1-t2)*.82,0,1));
  figInk(g,figArcPts(hook.x,hook.y,11,0,TAU,20),rng,.6,.06,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,[figAt(spine,t2+(1-t2)*.62,0),figAt(spine,t2+(1-t2)*.72,0)],rng,.4,0,1.4,state.contourRgb,state.contourAlpha);
  // The flame at the middle star, and the light it throws beyond the glass — its own rays sprung
  // from clear of the node's own capture ring rather than from inside it.
  for(let i=0;i<30;i++){
    const a=i/30*TAU,long=i%3===0,r0=p1.r+18,r1=r0+(long?26:13)+rng()*6;
    figInk(g,[{x:p1.x+Math.cos(a)*r0,y:p1.y+Math.sin(a)*r0},{x:p1.x+Math.cos(a)*r1,y:p1.y+Math.sin(a)*r1}],rng,.4,0,long?.7:.45,state.contourRgb,state.contourAlpha);
  }
  if(state.hatchFrac>0){figHatch(g,spine,glassIn,glassOut,Math.round(56*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>glassIn(t)-3,t=>glassOut(t)+3,26,rng,.85);
}
// A moth. The wings open either side of the middle star, the head and its feathered antennae are
// set on the top star, and the abdomen tapers away below the bottom one.
function figMoth(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,48),steps=72,[t0,t1,t2]=spine.stops,box=figBox(spine,p1);
  // The thorax stays on the spine, so the stars still run down the moth's back; it is the wings that
  // take the budget, each pair a single lobe centred on the middle star — the budget's own mass curve
  // already peaks at t1 and falls to the body by t0 and t2 — cut as a broad triangle across the spine
  // rather than two pods up it. The fore/hind seam below is carried by the interior vein lines alone,
  // not by a notch pinched into the silhouette's own edge.
  const wingOut=t=>box.lat(t,.95),wingIn=t=>box.lat(t,-.95);
  const body=t=>t>t2?Math.max(1,7-(t-t2)*46):t<t0?Math.max(1,6.5-(t0-t)*30):6.5;
  const spanOut=t=>wingOut(t)+body(t),spanIn=t=>wingIn(t)-body(t);
  const left=figRibbon(spine,spanIn,steps),right=figRibbon(spine,spanOut,steps);
  const bodyL=figRibbon(spine,t=>-body(t),steps),bodyR=figRibbon(spine,body,steps);
  figChalkTrial(g,rng,left,right);
  figInk(g,left,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.9,.05,1.3,state.contourRgb,state.contourAlpha);
  figInk(g,bodyL,rng,.5,.08,1,state.contourRgb,state.contourAlpha);figInk(g,bodyR,rng,.5,.08,1,state.contourRgb,state.contourAlpha);
  // The seam between fore and hind wing, and the veins running out from the thorax.
  const edge=(t,o)=>o<0?spanIn(t):spanOut(t);
  for(const o of [-1,1]){
    figInk(g,[figAt(spine,t1,o*body(t1)),figAt(spine,t1-.012,edge(t1,o)*.96)],rng,.5,.06,.8,state.contourRgb,state.contourAlpha);
    for(let i=0;i<5;i++){
      const t=lerp(t1+.02,t2+.02,i/5),far=edge(t,o)*(.55+i*.08);
      if(Math.abs(far)>body(t)+3)figInk(g,[figAt(spine,t1+.005,o*body(t1)),figAt(spine,t,far)],rng,.6,.2,.5,state.contourRgb,state.contourAlpha);
    }
    for(let i=0;i<4;i++){
      const t=lerp(t0-.01,t1-.02,i/4),far=edge(t,o)*(.6+i*.07);
      if(Math.abs(far)>body(t)+3)figInk(g,[figAt(spine,t1-.01,o*body(t1)),figAt(spine,t,far)],rng,.6,.24,.45,state.contourRgb,state.contourAlpha);
    }
  }
  // An eyespot on each forewing.
  for(const o of [-1,1]){
    const t=lerp(t1,t2,.55),c=figAt(spine,t,edge(t,o)*.58);
    figInk(g,figArcPts(c.x,c.y,7.5,0,TAU,16),rng,.5,.08,.9,state.contourRgb,state.contourAlpha);
    figInk(g,figArcPts(c.x,c.y,3.4,0,TAU,12),rng,.4,.12,.6,state.contourRgb,state.contourAlpha);
  }
  // Body segments, then a real head disc on the top star, with the combed antennae springing from
  // its own rim rather than from a bare point on the spine.
  for(let i=0;i<12;i++){
    const t=lerp(t0-.05,t2-.01,i/12);
    figInk(g,[figAt(spine,t,-body(t)),figAt(spine,t,body(t))],rng,.35,.18,.5,state.contourRgb,state.contourAlpha);
  }
  // The head and its antennae are extrapolated straight on past the spine's own clamped tip (t=1)
  // rather than sampled inside it, since the star punch (p2.r+8) reaches well past that tip on a
  // real fork and would otherwise erase a head placed anywhere the t-parametrization can still reach.
  const tip=spine.at(1),headD=Math.max(50,p2.r+22),headR=6.5;
  const along=d=>({x:p2.x+tip.tx*d,y:p2.y+tip.ty*d});
  const head=along(headD);
  // A short neck bridges the abdomen's own tapered end (the spine's clamped tip) to the head, so the
  // two read as one continuous body rather than a disc stranded past a gap.
  burinSegment(g,tip.x,tip.y,head.x,head.y,state.contourRgb,state.contourAlpha,.8,Math.floor(rng()*4294967296)>>>0,{segments:2,wobble:.2,hair:false});
  burinArc(g,head.x,head.y,headR,0,TAU,state.contourRgb,state.contourAlpha,1,Math.floor(rng()*4294967296)>>>0,{segments:16,skips:2,wobble:.2});
  for(const o of [-1,1]){
    const feel=[];for(let i=0;i<=12;i++){const u=i/12,base=along(headD+u*40),off=o*(headR*.9+u*u*26);feel.push({x:base.x+tip.px*off,y:base.y+tip.py*off});}
    figInk(g,feel,rng,.5,.04,.85,state.contourRgb,state.contourAlpha);
    for(let i=2;i<12;i+=1){
      const p=feel[i],q=feel[i-1],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy)||1;
      figInk(g,[p,{x:p.x-dy/d*3.4*o,y:p.y+dx/d*3.4*o}],rng,.25,0,.4,state.contourRgb,state.contourAlpha);
    }
  }
  if(state.hatchFrac>0){
    figHatch(g,spine,spanIn,t=>-body(t),Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
    figHatch(g,spine,body,spanOut,Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);
  }
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,bodyL,state);figWash(g,bodyR,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>spanIn(t)-2,t=>spanOut(t)+2,34,rng,.8);
}
// A placeholder for catalogue figures that have no engraving of their own yet: a broken
// contour joining the three stars, doubled as a hairline, with a small ornament at the
// middle star. It reads as an asterism on the plate without claiming to be a figure.
function figAsterism(g,p0,p1,p2,side,rng,state){
  const spine=figSpine(p0,p1,p2,side,30),steps=44;
  const swell=t=>3+Math.sin(Math.PI*clamp(t,0,1))*9;
  const left=figRibbon(spine,t=>-swell(t),steps),right=figRibbon(spine,swell,steps);
  g.strokeStyle=state.contour;
  figInk(g,left,rng,.8,.14,1.25,state.contourRgb,state.contourAlpha);figInk(g,right,rng,.8,.14,1.25,state.contourRgb,state.contourAlpha);
  figInk(g,figRibbon(spine,()=>0,steps),rng,.6,.22,.7,state.contourRgb,state.contourAlpha);
  const mid=spine.at(.5);
  g.save();g.translate(mid.x+mid.px*(swell(.5)+11),mid.y+mid.py*(swell(.5)+11));g.rotate(Math.atan2(mid.ty,mid.tx));
  g.lineWidth=1.1;g.beginPath();g.arc(0,0,6.5,0,TAU);g.stroke();
  g.beginPath();g.moveTo(-10,0);g.lineTo(10,0);g.moveTo(0,-10);g.lineTo(0,10);g.stroke();g.restore();
  for(const q of [p0,p1,p2]){g.lineWidth=.9;g.beginPath();g.arc(q.x,q.y,q.r+13,-.5,.5);g.stroke();g.beginPath();g.arc(q.x,q.y,q.r+13,Math.PI-.5,Math.PI+.5);g.stroke();}
  if(state.hatchFrac>0){figHatch(g,spine,t=>-swell(t),swell,Math.round(34*state.hatchFrac),rng,state.hatchRgb,state.hatchAlpha,figStyle.hatchWeight);}
  if(state.wash){g.fillStyle=state.wash;figWash(g,left,right,state);}
  g.fillStyle=state.contour;figStipple(g,spine,t=>-swell(t)-3,t=>swell(t)+3,22,rng,.85);
}
// Every entry in the catalogue has its own engraving, looked up by name. figAsterism remains only
// as the last resort for a chart whose name this plate has never been cut for.
const FIGURE_SHAPES={
  'THE NEEDLE':figNeedle,'THE SAIL':figSail,'THE LYRE':figLyre,'THE CROWN':figCrown,
  'THE PHOENIX':figPhoenix,'THE TOUCAN':figToucan,'THE SERPENT':figSerpent,'THE ARGO':figArgo,
  'THE PEACOCK':figPeacock,'THE QUILL':figQuill,'THE LANTERN':figLantern,'THE MOTH':figMoth
};
const figureFor=chart=>FIGURE_SHAPES[chart&&chart.name]||FIGURE_SHAPES[CONSTELLATIONS[chart&&chart.catalogueIndex]&&CONSTELLATIONS[chart.catalogueIndex].name]||figAsterism;
