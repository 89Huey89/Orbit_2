'use strict';
/* Orbit · src/marks.js
   Gameplay chart marks and engraved line quality: burin rings, route lines, release targets. */
// ---------- Gameplay chart marks: rings, capture bands, ticks, constellations, hazards and the aim guide ----------
// Night literals are lifted verbatim from the pre-plate artwork. Paper recolours orbit roles as sepia/Prussian/
// rubrication/ochre ink per the art direction, turns constellation ink ochre, hazards into a pooled ink blot with
// rubrication accretion and dark hatch (no warm glow), and folds "uniform dark ink" reads (ticks, row labels) into
// onPaper() branches against the shared base tokens rather than the per-node colour role.
definePlate('marks',{
  night:{
    node:'209,190,146',nodeDrift:'148,180,177',nodeFading:'205,159,122',nodeGold:'226,195,133',nodeShield:'150,196,214',
    nodeReflector:'190,166,220',nodeInkwell:'196,152,100',
    nodeRelaxed:'158,206,148',nodeHardcore:'224,98,74',
    connection:'177,192,183',
    constellationLine:'209,189,145',constellationComplete:'218,199,156',constellationStar:'218,196,147',
    constellationFillLit:'rgba(231,212,169,.9)',constellationFillDark:'#111b22',
    constellationLabel:'215,196,156',constellationCaption:'195,188,163',constellationHint:'181,194,184',
    slingRing:'182,169,136',slingFill:'235,212,163',slingNotch:'215,194,149',slingLabel:'216,198,157',
    releaseWindowStar:'222,190,127',releaseWindowPlain:'216,220,198',releaseMark:'244,229,196',
    perfectPreview:'248,229,185',perfectTarget:'244,222,176',
    fadingCritical:'#f59879',fadingWarn:'#dcab7e',
    next:'200,204,186',
    aimDefault:'215,218,206',aimLocked:'232,217,175',aimBlockedStart:'217,157,126',aimBlockedEnd:'217,139,106',
    aimPerfectArc:'245,226,185',aimMarkPerfect:'252,234,182',aimMarkNormal:'217,213,181',aimMarkBlocked:'227,154,117',
    slingAimTick:'220,201,160',
    hazardHalo0:'183,104,77',hazardHaloMid:'155,86,66',hazardHaloEdge:'130,60,53',
    hazardAccretion:'217,166,116',hazardHatch:'200,121,93',hazardCore:'#060a11',hazardEdge:'197,109,83',
    hazardRim:'232,164,119',hazardArcFaint:'202,133,107',hazardOuter:'154,94,79'
  },
  paper:{
    node:'58,42,28',nodeDrift:'52,84,120',nodeFading:'166,58,40',nodeGold:'150,100,32',nodeShield:'56,104,134',
    nodeReflector:'88,54,116',nodeInkwell:'107,74,44',
    nodeRelaxed:'62,104,84',nodeHardcore:'140,30,20',
    connection:'96,74,52',
    constellationLine:'150,100,32',constellationComplete:'176,118,38',constellationStar:'150,100,32',
    constellationFillLit:'rgba(176,118,38,.88)',constellationFillDark:'#e7dabd',
    constellationLabel:'150,100,32',constellationCaption:'176,118,38',constellationHint:'150,100,32',
    slingRing:'96,74,52',slingFill:'176,118,38',slingNotch:'58,42,28',slingLabel:'34,24,16',
    releaseWindowStar:'150,100,32',releaseWindowPlain:'96,74,52',releaseMark:'34,24,16',
    perfectPreview:'34,24,16',perfectTarget:'34,24,16',
    fadingCritical:'#8a2416',fadingWarn:'#a8492c',
    next:'58,42,28',
    aimDefault:'96,74,52',aimLocked:'150,100,32',aimBlockedStart:'166,58,40',aimBlockedEnd:'140,42,28',
    aimPerfectArc:'34,24,16',aimMarkPerfect:'34,24,16',aimMarkNormal:'96,74,52',aimMarkBlocked:'166,58,40',
    slingAimTick:'58,42,28',
    hazardHalo0:'183,104,77',hazardHaloMid:'155,86,66',hazardHaloEdge:'130,60,53',
    hazardAccretion:'166,58,40',hazardHatch:'34,24,16',hazardCore:'#170f08',hazardEdge:'34,24,16',
    hazardRim:'34,24,16',hazardArcFaint:'58,42,28',hazardOuter:'58,42,28'
  }
});
// ---------- Engraved line quality: a burin line swells and tapers, wobbles slightly, doubles where the
// hand went round twice, and breaks in tiny gaps. `burinArc` and `burinSegment` are the two primitives —
// they take any 2D context, so the same hand cuts orbit rings, planet keylines, capture ripples, black-hole
// edges and the plate frame's double rule. `engravedRing` bakes an orbit ring into a small offscreen sprite
// (cached by quantised radius/rgb/alpha/weight/plate/scale/seed so it is painted once and blitted per
// frame); `engravedLine` draws a short constellation segment straight onto ctx.
function burinArc(g,cx,cy,radius,from,to,rgb,alpha,weight,seed,opts={}){
  const span=to-from,flatten=opts.flatten??1,rng=seeded(seed>>>0||1);
  const segCount=opts.segments??clamp(Math.round(Math.abs(span)*Math.max(radius,2)/2.6),6,84);
  const ph1=rng()*TAU,ph2=rng()*TAU,ph3=rng()*TAU;
  const f1=2+Math.floor(rng()*2),f2=5+Math.floor(rng()*3),f3=9+Math.floor(rng()*4);
  const wobPhase=rng()*TAU,wobFreq=3+Math.floor(rng()*2),wobAmp=(opts.wobble??.3)*(1+rng());
  const skipCount=Math.min(opts.skips??Math.round(segCount*.06),segCount-1),skips=new Set();
  while(skips.size<skipCount)skips.add(Math.floor(rng()*segCount));
  g.lineCap='round';g.strokeStyle=`rgba(${rgb},${alpha})`;
  for(let i=0;i<segCount;i++){
    if(skips.has(i))continue;
    const a0=from+span*i/segCount,a1=from+span*(i+1)/segCount,mid=(a0+a1)/2;
    const wob=Math.sin(wobFreq*mid+wobPhase)*wobAmp;
    const s=Math.sin(f1*mid+ph1)*.5+Math.sin(f2*mid+ph2)*.3+Math.sin(f3*mid+ph3)*.2;
    const r=Math.max(.05,radius+wob);
    g.lineWidth=Math.max(.05,weight*(1+clamp(s,-1,1)*.45));
    g.beginPath();
    if(flatten===1)g.arc(cx,cy,r,a0,a1);else g.ellipse(cx,cy,r,Math.max(.05,r*flatten),0,a0,a1);
    g.stroke();
  }
}
// A spiral cut the way burinArc cuts a ring, and with the same wobbling, swelling, occasionally
// skipping burin segments: the difference is only that the radius runs from one value to another
// across the sweep, so the stroke winds inward instead of closing on itself. Each segment is laid
// as a quadratic through its own midpoint, which keeps a coarse sweep smooth without a second
// stroke, so a whole turn of a whirlpool costs about what a turn of a ring costs.
function burinSpiral(g,cx,cy,rFrom,rTo,from,to,rgb,alpha,weight,seed,opts={}){
  const span=to-from,rng=seeded(seed>>>0||1);
  const segCount=opts.segments??clamp(Math.round(Math.abs(span)*Math.max((rFrom+rTo)/2,2)/2.6),6,84);
  const ph1=rng()*TAU,ph2=rng()*TAU,ph3=rng()*TAU;
  const f1=2+Math.floor(rng()*2),f2=5+Math.floor(rng()*3),f3=9+Math.floor(rng()*4);
  const wobPhase=rng()*TAU,wobFreq=3+Math.floor(rng()*2),wobAmp=(opts.wobble??.3)*(1+rng());
  const skipCount=Math.min(opts.skips??Math.round(segCount*.06),segCount-1),skips=new Set();
  while(skips.size<skipCount)skips.add(Math.floor(rng()*segCount));
  g.lineCap='round';g.strokeStyle=`rgba(${rgb},${alpha})`;
  for(let i=0;i<segCount;i++){
    if(skips.has(i))continue;
    const t0=i/segCount,t1=(i+1)/segCount,a0=from+span*t0,a1=from+span*t1,mid=(a0+a1)/2;
    const wob=Math.sin(wobFreq*mid+wobPhase)*wobAmp;
    const s=Math.sin(f1*mid+ph1)*.5+Math.sin(f2*mid+ph2)*.3+Math.sin(f3*mid+ph3)*.2;
    const r0=Math.max(.05,lerp(rFrom,rTo,t0)+wob),r1=Math.max(.05,lerp(rFrom,rTo,t1)+wob);
    // The control point is pushed out by the half-angle's secant so the curve passes through the
    // arc rather than cutting the chord, which is what keeps a two-segment turn from reading as a
    // polygon at the rim, where the segments are longest.
    const rm=(r0+r1)/2/Math.max(.2,Math.cos((a1-a0)/2));
    g.lineWidth=Math.max(.05,weight*(1+clamp(s,-1,1)*.45));
    g.beginPath();
    g.moveTo(cx+Math.cos(a0)*r0,cy+Math.sin(a0)*r0);
    g.quadraticCurveTo(cx+Math.cos(mid)*rm,cy+Math.sin(mid)*rm,cx+Math.cos(a1)*r1,cy+Math.sin(a1)*r1);
    g.stroke();
  }
}
function burinSegment(g,x1,y1,x2,y2,rgb,alpha,weight,seed,opts={}){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,rng=seeded(seed>>>0||1);
  const ph=rng()*TAU,f=2+Math.floor(rng()*2),ph2=rng()*TAU,f2=5+Math.floor(rng()*3);
  const wobPhase=rng()*TAU,wobFreq=2+Math.floor(rng()*3),wobAmp=opts.wobble??.35;
  const segCount=opts.segments??clamp(Math.round(len/16),5,14);
  const skipCount=Math.min(opts.skips??0,Math.max(0,segCount-2)),skips=new Set();
  while(skips.size<skipCount)skips.add(1+Math.floor(rng()*(segCount-2)));
  g.save();g.lineCap='round';g.strokeStyle=`rgba(${rgb},${alpha})`;
  for(let i=0;i<segCount;i++){
    if(skips.has(i))continue;
    const t0=i/segCount,t1=(i+1)/segCount,tm=(t0+t1)/2;
    const s=Math.sin(f*tm*TAU+ph)*.6+Math.sin(f2*tm*TAU+ph2)*.4;
    const w0=Math.sin(wobFreq*t0*TAU+wobPhase)*wobAmp,w1=Math.sin(wobFreq*t1*TAU+wobPhase)*wobAmp;
    g.lineWidth=Math.max(.05,weight*(1+clamp(s,-1,1)*.4));
    g.beginPath();g.moveTo(x1+dx*t0+nx*w0,y1+dy*t0+ny*w0);g.lineTo(x1+dx*t1+nx*w1,y1+dy*t1+ny*w1);g.stroke();
  }
  if(opts.hair!==false){
    g.strokeStyle=`rgba(${rgb},${(alpha*.4).toFixed(3)})`;g.lineWidth=Math.max(.25,weight*.35);
    const off=(rng()<.5?1:-1)*.8;
    g.beginPath();g.moveTo(x1+nx*off,y1+ny*off);g.lineTo(x2+nx*off,y2+ny*off);g.stroke();
  }
  g.restore();
}
// Four burin sides make an engraved rectangle; used for the plate frame's rules.
function burinRect(g,x,y,w,h,rgb,alpha,weight,seed){
  const long=Math.max(w,h),segs=clamp(Math.round(long/26),8,48);
  burinSegment(g,x,y,x+w,y,rgb,alpha,weight,seed,{segments:segs,hair:false,wobble:.25});
  burinSegment(g,x+w,y,x+w,y+h,rgb,alpha,weight,seed+7,{segments:segs,hair:false,wobble:.25});
  burinSegment(g,x+w,y+h,x,y+h,rgb,alpha,weight,seed+13,{segments:segs,hair:false,wobble:.25});
  burinSegment(g,x,y+h,x,y,rgb,alpha,weight,seed+21,{segments:segs,hair:false,wobble:.25});
}
// Lettering set on a curve, the way an engraver letters a caption round a rim: every glyph is
// placed at its own angle and turned tangent to the arc. Advances come from `measureText` where
// the context provides one and from an average advance where it does not, so the routine works
// on a bare stand-in as well as a browser canvas. The caller owns the font, fill and alpha.
// options: {size, spacing, align:'start'|'center'|'end', inward, direction}
// Returns {start,end,span} in radians so a caller can keep two captions from meeting.
function textAlongArc(g,text,cx,cy,r,startAngle,options={}){
  const chars=Array.from(String(text??''));
  if(!chars.length||!(r>.001))return {start:startAngle,end:startAngle,span:0};
  const size=options.size??12,spacing=options.spacing??0,inward=!!options.inward;
  const dir=options.direction??(inward?-1:1);
  const measured=ch=>{
    if(typeof g.measureText==='function'){
      const m=g.measureText(ch);
      if(m&&Number.isFinite(m.width)&&m.width>0)return m.width;
    }
    return size*(ch===' '?.34:.56);
  };
  const widths=chars.map(measured);
  const length=widths.reduce((a,b)=>a+b,0)+spacing*(chars.length-1);
  const span=length/r;
  const align=options.align||'start';
  const start=startAngle-dir*(align==='center'?span/2:align==='end'?span:0);
  let walked=0;
  for(let i=0;i<chars.length;i++){
    walked+=(i?spacing:0)+widths[i]/2;
    const a=start+dir*walked/r;
    walked+=widths[i]/2;
    if(chars[i]===' '||plainPlate())continue;
    g.save();
    g.textAlign='center';g.textBaseline='alphabetic';
    g.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    g.rotate(a+(inward?-Math.PI/2:Math.PI/2));
    g.fillText(chars[i],0,0);
    g.restore();
  }
  return {start,end:start+dir*span,span};
}
// The small seeded vocabulary the plate letters round its orbits.
const RIM_CAPTIONS=['ORBITA','TABULA','MOTUS','SILENTIUM','ASCENSUS','VIGILIA'];
const ringSprites=new Map();
// The ring the sprite is actually cut at. A held orbit's radius changes on every frame, so bucketing it
// to the nearest half pixel meant re-cutting the sprite — a fresh canvas and ninety-odd burin segments —
// two or three times a second for the planet the player is holding, and evicting the other planets'
// rings from the cache while it did. The ladder below steps by about two per cent of the radius
// instead, and the blit is scaled to the exact radius asked for, so a whole orbit is served by a
// handful of sprites and the line lands where it always did.
function ringRadiusStep(radius){
  const r=Math.max(1,radius);
  return Math.max(.5,Math.round(Math.exp(Math.round(Math.log(r)*48)/48)*1000)/1000);
}
function engravedRing(radius,rgb,alpha,weight,seed){
  const rBucket=ringRadiusStep(radius),aBucket=Math.round(alpha/.05)*.05;
  const key=rBucket+'|'+rgb+'|'+aBucket.toFixed(2)+'|'+weight+'|'+plateName+'|'+scale.toFixed(3)+'|'+seed;
  const cached=ringSprites.get(key);if(cached)return cached;
  const pad=Math.max(6,weight*2.6+3),size=Math.max(2,Math.ceil((rBucket+pad)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);
  // On paper the ring was first tried in red chalk: a broken sanguine arc a little off true, under the ink.
  if(onPaper()){
    const chalkR=rBucket+((seed>>>2)&1?1:-1)*.8,from=((seed>>>9)%997)/997*TAU;
    burinArc(g,.5,-.4,chalkR,from,from+TAU*.62,ink.underdrawing.chalk,Number((aBucket*.55).toFixed(3)),Math.max(.5,weight*.9),seed^0x3d9,{segments:40,skips:6,wobble:.8});
  }
  burinArc(g,0,0,rBucket,0,TAU,rgb,aBucket,weight,seed,{segments:72,skips:4+((seed>>>3)%3)});
  // A fainter second pass a hairline off the true circle, where the hand went round twice.
  const hairGaps=2+((seed>>>5)&1),hairR=rBucket+((seed&1)?.9:-.9),slot=TAU/hairGaps,startOffset=((seed>>>7)%997)/997*TAU;
  for(let k=0;k<hairGaps;k++)burinArc(g,0,0,hairR,startOffset+k*slot,startOffset+k*slot+slot*.7,rgb,Number((aBucket*.4).toFixed(3)),Math.max(.25,weight*.35),seed+k*37,{skips:0,wobble:.12});
  const sprite={canvas:c,size,radius:rBucket};
  ringSprites.set(key,sprite);
  if(ringSprites.size>64)ringSprites.delete(ringSprites.keys().next().value);
  return sprite;
}
function engravedLine(x1,y1,x2,y2,rgb,alpha,weight,seed){burinSegment(ctx,x1,y1,x2,y2,rgb,alpha,weight,seed);}
function drawConnections(){
  const main=world.nodes.filter(n=>n.type!=='gold'&&n.y>world.cameraY-160&&n.y<world.cameraY+world.height+160).sort((a,b)=>a.row-b.row);
  ctx.save();ctx.setLineDash([1,9]);ctx.lineWidth=.55;ctx.strokeStyle=`rgba(${ink.marks.connection},.12)`;
  for(let i=1;i<main.length;i++){
    const a=main[i-1],b=main[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),ux=dx/d,uy=dy/d;
    ctx.beginPath();ctx.moveTo(sx(a.x+ux*(a.cap+13)),sy(a.y+uy*(a.cap+13)));ctx.lineTo(sx(b.x-ux*(b.cap+13)),sy(b.y-uy*(b.cap+13)));ctx.stroke();
  }
  ctx.restore();
}
function releaseTargets(n){
  if(n.row===0){
    const paths=world.nodes.filter(q=>q.difficultyChoice&&!q.visited);
    if(paths.length)return paths;
  }
  if(n.shortcut){
    return [world.nodes.find(q=>q.row===n.row+1&&q.type!=='gold'),world.nodes.find(q=>q.id===n.shortcutId)].filter(q=>q&&!q.visited);
  }
  const chart=world.constellations.find(c=>c.id===n.routeId);
  if(chart){
    if(n.routeRole==='entry')return [chart.main[0],chart.stars[0]].filter(Boolean);
    if(n.routeRole==='main'||n.routeRole==='star'){
      const route=n.routeRole==='star'?chart.stars:chart.main,next=route[route.indexOf(n)+1]||chart.exit;
      if(next&&!next.visited)return [next];
    }
  }
  return world.nodes.filter(q=>!q.visited&&q.y<n.y-60).sort((a,b)=>Math.hypot(a.x-n.x,a.y-n.y)-Math.hypot(b.x-n.x,b.y-n.y)).slice(0,1);
}
