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
// hand went round twice, and breaks in tiny gaps. `engravedRing` bakes an orbit ring's main stroke into a
// small offscreen sprite (cached by quantised radius/rgb/alpha/weight/plate/scale/seed so it is painted
// once and blitted per frame); `engravedLine` draws a short constellation segment directly since there are
// only a few of them per frame.
const ringSprites=new Map();
function engravedRing(radius,rgb,alpha,weight,seed){
  const rBucket=Math.round(radius*2)/2,aBucket=Math.round(alpha/.05)*.05;
  const key=rBucket+'|'+rgb+'|'+aBucket.toFixed(2)+'|'+weight+'|'+plateName+'|'+scale.toFixed(3)+'|'+seed;
  const cached=ringSprites.get(key);if(cached)return cached;
  const pad=Math.max(6,weight*2.6+3),size=Math.max(2,Math.ceil((rBucket+pad)*2));
  const c=makeCanvas(Math.max(1,Math.round(size*DPR)),Math.max(1,Math.round(size*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.translate(size/2,size/2);g.lineCap='round';
  const rng=seeded(seed>>>0||1);
  const ph1=rng()*TAU,ph2=rng()*TAU,ph3=rng()*TAU;
  const f1=2+Math.floor(rng()*2),f2=5+Math.floor(rng()*3),f3=9+Math.floor(rng()*4);
  const wobPhase=rng()*TAU,wobFreq=3+Math.floor(rng()*2),wobAmp=.3+rng()*.3;
  const segCount=72,skipCount=4+Math.floor(rng()*3),skips=new Set();
  while(skips.size<skipCount)skips.add(Math.floor(rng()*segCount));
  g.strokeStyle=`rgba(${rgb},${aBucket})`;
  for(let i=0;i<segCount;i++){
    if(skips.has(i))continue;
    const a0=i/segCount*TAU,a1=(i+1)/segCount*TAU,mid=(a0+a1)/2;
    const wob=Math.sin(wobFreq*mid+wobPhase)*wobAmp;
    const s=Math.sin(f1*mid+ph1)*.5+Math.sin(f2*mid+ph2)*.3+Math.sin(f3*mid+ph3)*.2;
    g.lineWidth=weight*(1+clamp(s,-1,1)*.45);
    g.beginPath();g.arc(0,0,rBucket+wob,a0,a1);g.stroke();
  }
  const hairGaps=2+Math.floor(rng()*2),hairR=rBucket+(rng()<.5?1:-1)*.9;
  const slot=TAU/hairGaps,coverFrac=.7,startOffset=rng()*TAU;
  g.strokeStyle=`rgba(${rgb},${(aBucket*.4).toFixed(3)})`;g.lineWidth=Math.max(.25,weight*.35);
  for(let k=0;k<hairGaps;k++){
    const s0=startOffset+k*slot,e0=s0+slot*coverFrac;
    g.beginPath();g.arc(0,0,hairR,s0,e0);g.stroke();
  }
  const sprite={canvas:c,size};
  ringSprites.set(key,sprite);
  if(ringSprites.size>64)ringSprites.delete(ringSprites.keys().next().value);
  return sprite;
}
function engravedLine(x1,y1,x2,y2,rgb,alpha,weight,seed){
  const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
  const rng=seeded((seed>>>0||1));
  const ph=rng()*TAU,f=2+Math.floor(rng()*2),ph2=rng()*TAU,f2=5+Math.floor(rng()*3);
  const segCount=Math.max(5,Math.min(14,Math.round(len/16)));
  ctx.save();ctx.lineCap='round';ctx.strokeStyle=`rgba(${rgb},${alpha})`;
  for(let i=0;i<segCount;i++){
    const t0=i/segCount,t1=(i+1)/segCount,tm=(t0+t1)/2;
    const s=Math.sin(f*tm*TAU+ph)*.6+Math.sin(f2*tm*TAU+ph2)*.4;
    ctx.lineWidth=weight*(1+clamp(s,-1,1)*.4);
    ctx.beginPath();ctx.moveTo(x1+dx*t0,y1+dy*t0);ctx.lineTo(x1+dx*t1,y1+dy*t1);ctx.stroke();
  }
  ctx.strokeStyle=`rgba(${rgb},${(alpha*.4).toFixed(3)})`;ctx.lineWidth=Math.max(.25,weight*.35);
  const off=(rng()<.5?1:-1)*.8;
  ctx.beginPath();ctx.moveTo(x1+nx*off,y1+ny*off);ctx.lineTo(x2+nx*off,y2+ny*off);ctx.stroke();
  ctx.restore();
}
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
