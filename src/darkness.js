'use strict';
/* Orbit · src/darkness.js
   The rising darkness: its corroded plate art, leviathan and gloss sprites, the marginalia carried on
   it, and the corrosion eating the plate's own drawing as the flood climbs. */

function darknessPlate(relief){
  // The plate goes into the key beside relief, built once here, so two plates on screen at once (a
  // cross-dissolve) never share a slot — and the lookup below can't drift from the store at the end.
  // DPR is in the key too: this is the one major art layer that used to be baked at 1x and stretched
  // to fill the tile drawImage() blits it into, the only mark in the atlas soft enough at the device
  // pixel ratios a phone actually runs at to look stretched rather than engraved.
  const key=plateName+':'+(relief?'r':'n')+':'+DPR.toFixed(2);
  if(darknessPlates.has(key))return darknessPlates.get(key);
  const w=640,h=180,c=makeCanvas(Math.round(w*DPR),Math.round(h*DPR)),g=c.getContext('2d'),rng=seeded(620173);
  g.scale(DPR,DPR);
  const pigment=relief?ink.dark.pigmentRelief:ink.dark.pigment;
  // relief is never baked as a standalone body — drawDark() only ever lays it as a re-inking overlay
  // over the normal bake, faded in by a constellation reprieve. A reprieve is the gold replacing the
  // copper, not stacking a second full wash on top of the first: everything below that would double
  // the body (the wash gradient, the void-layer fills, the coastline's own fill, paper's bleed-stain
  // fills) is skipped here, leaving only the marks that actually carry pigment — the coastline's own
  // stroke, the tide marks, the stipples and the fringe strokes — re-struck in the relief's own tone.
  if(!relief){
  // Seamless pools of dilute ink, growing opaque below the leading edge — clipped to the same wavy
  // front the void layers below draw, not a flat rect: a dead-straight gradient under a wavy coastline
  // read as a ruled horizon peeking out from under it, which is the one thing an engraved sheet with no
  // flat fill anywhere on it cannot afford at the edge that matters most.
  g.save();g.beginPath();g.moveTo(0,h);
  for(let x=0;x<=w;x+=4){const a=x/w*TAU;g.lineTo(x,28+Math.sin(a*3)*6+Math.sin(a*11)*2.5);}
  g.lineTo(w,h);g.closePath();g.clip();
  const wash=g.createLinearGradient(0,24,0,140);
  wash.addColorStop(0,`rgba(${ink.dark.washTop},0)`);wash.addColorStop(.22,`rgba(${ink.dark.washMid},${onPaper()?.94:.78})`);wash.addColorStop(1,ink.dark.washSolid);
  g.fillStyle=wash;g.fillRect(0,0,w,h);
  g.restore();
  }
  if(!relief){
    // The flood bleeds upward along the fibres in short, blunt feathered threads on both plates —
    // a spreading stain's own failure, not a shoreline's — but the two read it in opposite hands, as
    // every other mark on the sheet already does: paper is dark ink climbing a light sheet, so the
    // threads are fleckDark at their own stain alpha; night is a light sheet drawn in reverse, so the
    // threads are the flood's own pigment, lighter still, standing off a dark flood instead of
    // climbing it. Fine enough that they need the flood's own device-resolution bake (see the 1x-bake
    // fix above) to survive to the screen at all.
    const bleed=seeded(311977),paper=onPaper();
    for(let i=0;i<110;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5,reach=1+bleed()*bleed()*7,bend=(bleed()-.5)*10,start=edge+3+bleed()*5;
      for(const wrap of [-w,0,w]){
        g.strokeStyle=paper?`rgba(${ink.dark.fleckDark},${.1+bleed()*.24})`:`rgba(${ink.dark.pigment},${.06+bleed()*.12})`;
        g.lineWidth=.65+bleed()*.65;
        g.beginPath();g.moveTo(x+wrap,start);g.bezierCurveTo(x+wrap+bend*.6,start-4,x+wrap-bend,edge-reach*.5,x+wrap+bend*.5,edge-reach);g.stroke();
      }
    }
    if(paper){
    // The pools a spreading stain actually leaves: irregular blots breaking ahead of the front, not the
    // even comb a shoreline's tree line would be. Enough of them, and large enough, to read as the front
    // itself rather than as flecks caught in it. Paper-only: night already carries this reach in its own
    // five void layers, so it does not also need paper's own stain-pool device.
    // Each pool is laid as ink actually dries in one: a thin body feathered out past its own edge, and
    // the pigment carried to the rim as a darker tide line. Laid as one flat fill at full strength they
    // read as dark chips floating over the sheet, a pile of stones rather than a stain.
    for(let i=0;i<16;i++){
      const x=bleed()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
      const y=edge+2.5-bleed()*bleed()*4,rx=3+bleed()*bleed()*11,ry=2+bleed()*5,seed=Math.floor(bleed()*1e7),strength=.38+bleed()*.32;
      for(const wrap of [-w,0,w])featheredPool(g,x+wrap,y,rx*1.2,ry*.8,seed,ink.dark.fleckDark,strength*.5);
    }
    }
  }
  // One shared shape for a void layer, since the fourteen settled pools below are now interleaved
  // between them rather than drawn (and immediately painted out by) all five at once.
  const voidLayer=layer=>{
    g.beginPath();g.moveTo(0,h);
    for(let x=0;x<=w;x+=4){
      const a=x/w*TAU,y=28+layer*13+Math.sin(a*3+layer*.6)*6+Math.sin(a*11-layer*.4)*2.5;
      g.lineTo(x,y);
    }
    g.lineTo(w,h);g.closePath();g.fillStyle=ink.dark.voidLayers[layer];g.fill();
  };
  // The pools a spreading stain leaves once it has settled, not painted flat over the instant they
  // dry: seven sink into the mid-tones after the third void layer, seven more sit on the deepest wash
  // after the fifth, so some read through the flood and some ride on top of it. Their own alpha is
  // lighter than the paper-only pools above, now that they are read against ink rather than composited
  // under an opaque overlay a moment later.
  if(!relief){
    for(let layer=0;layer<3;layer++)voidLayer(layer);
    if(onPaper()){
      const bleed=seeded(311977+97);
      for(let i=0;i<7;i++){
        const x=bleed()*w,y=44+bleed()*90,rx=10+bleed()*34,ry=4+bleed()*11,seed=Math.floor(bleed()*1e7);
        for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},.35)`;g.fill();}
      }
    }
    for(let layer=3;layer<5;layer++)voidLayer(layer);
    if(onPaper()){
      const bleed=seeded(311977+193);
      for(let i=0;i<7;i++){
        const x=bleed()*w,y=44+bleed()*90,rx=10+bleed()*34,ry=4+bleed()*11,seed=Math.floor(bleed()*1e7);
        for(const wrap of [-w,0,w]){landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${ink.dark.fleckDark},.35)`;g.fill();}
      }
    }
    // Not a shoreline drowning the sheet: the ink burning its own drawing out of it. A browning halo
    // tightens where the void layers are already thickest, darkens toward the calibrated rust as it
    // goes, and foxing spreads in behind it — both concentrated in the same reach the void layers
    // occupy, since past it the body gradient in drawDark() is already solid regardless of anything
    // painted here. Paper only: night's flood is drowning, not corrosion, and keeps its own shoreline.
    if(onPaper()){
      const brown=seeded(311977+281);
      for(let i=0;i<13;i++){
        const x=brown()*w,y=38+brown()*brown()*30,rx=6+brown()*22,ry=3+brown()*7,seed=Math.floor(brown()*1e7);
        const strength=.1+brown()*.16;
        for(const wrap of [-w,0,w])featheredPool(g,x+wrap,y,rx,ry,seed,ink.dark.corrosion,strength*1.6,false);
      }
      const fox=seeded(311977+367);
      for(let i=0;i<34;i++){
        const x=fox()*w,y=54+fox()*34,r=.8+fox()*fox()*4.5,alpha=.16+fox()*.16;
        for(const wrap of [-w,0,w]){
          const spot=g.createRadialGradient(x+wrap,y,0,x+wrap,y,r);
          spot.addColorStop(0,`rgba(${pigment},${alpha})`);spot.addColorStop(1,`rgba(${pigment},0)`);
          g.fillStyle=spot;g.fillRect(x+wrap-r,y-r,r*2,r*2);
        }
      }
    }
  }
  g.save();g.beginPath();g.rect(0,27,w,h-27);g.clip();
  for(let i=0;i<24;i++){
    const x=rng()*w,y=36+rng()*100,rx=14+rng()*52,ry=6+rng()*18,seed=Math.floor(rng()*1e7);
    for(const wrap of [-w,0,w]){
      landContour(g,x+wrap,y,rx,ry,seeded(seed));
      if(!relief){g.fillStyle=i%3?ink.dark.landFillWash:ink.dark.landFillPool;g.fill();}
      g.strokeStyle=`rgba(${pigment},.055)`;g.lineWidth=.6;g.stroke();
    }
  }
  // The pigment settles along paper fibres, leaving a ragged, pale tide mark.
  for(let i=0;i<220;i++){
    const x=rng()*w,a=x/w*TAU,edge=29+Math.sin(a*3)*6+Math.sin(a*11)*2.5;
    const length=2+rng()*15,bend=(rng()-.5)*5;
    for(const wrap of [-w,0,w]){
      g.strokeStyle=`rgba(${pigment},${.045+rng()*.07})`;g.lineWidth=.3+rng()*.45;
      g.beginPath();g.moveTo(x+wrap,edge+length);
      g.bezierCurveTo(x+wrap+bend,edge+length*.6,x+wrap-bend,edge+2,x+wrap,edge);g.stroke();
    }
  }
  for(let i=0;i<2400;i++){
    const x=rng()*w,y=28+rng()*(h-28),fade=Math.pow(1-(y-28)/(h-28),1.5);
    if(i%3)g.fillStyle=`rgba(${pigment},${fade*(.02+rng()*.09)})`;
    else if(!relief)g.fillStyle=`rgba(${ink.dark.fleckDark},${fade*.18})`;
    else continue;
    g.fillRect(x,y,.3+rng()*.65,.35+rng()*.6);
  }
  g.restore();
  // The shallow fringe is translucent; the calibrated danger line stays clear.
  for(let i=0;i<75;i++){
    const x=rng()*w,top=7+rng()*15,length=1+rng()*4;
    g.strokeStyle=`rgba(${pigment},${.035+rng()*.055})`;g.lineWidth=.45;
    g.beginPath();g.moveTo(x,25);g.bezierCurveTo(x+length,21,x-length,top+4,x+.7,top);g.stroke();
  }
  // Where the corrosion above has gone furthest, a small ragged puncture opens: a browned rim standing
  // around a core struck at the calibrated rust itself, since the flood's own body fill (drawDark())
  // already sits solid under this tile at this depth — a hole cut into the tile alone would only bare
  // that solid fill, not the sheet, so the failure is read the way foxed paper actually shows it: a
  // stained ring round a small worn-through core, not a clean cut.
  if(!relief&&onPaper()){
    const bite=seeded(311977+419);
    for(let i=0;i<9;i++){
      const x=bite()*w,y=58+bite()*28,rx=1.6+bite()*bite()*4.5,ry=1.1+bite()*bite()*2.8,seed=Math.floor(bite()*1e7);
      for(const wrap of [-w,0,w]){
        landContour(g,x+wrap,y,rx*1.7,ry*1.7,seeded(seed+1));g.fillStyle=`rgba(${ink.dark.corrosion},${.26+bite()*.2})`;g.fill();
        landContour(g,x+wrap,y,rx,ry,seeded(seed));g.fillStyle=`rgba(${pigment},${.4+bite()*.3})`;g.fill();
      }
    }
  }
  darknessPlates.set(key,c);return c;
}
// A pool of ink as it dries on a sheet: its body laid in three passes, each a little tighter and stronger
// than the last so the edge fades out into the paper instead of stopping, and — for a liquid that carried
// its pigment outward as it dried — a darker tide line round the rim. `strength` is what the old single
// flat fill was laid at, so a caller keeps its own weight.
function featheredPool(g,x,y,rx,ry,seed,rgb,strength,rim=true){
  for(const [k,share] of [[1.35,.22],[1.12,.3],[.9,.36]]){landContour(g,x,y,rx*k,ry*k,seeded(seed));g.fillStyle=`rgba(${rgb},${strength*share})`;g.fill();}
  if(rim){landContour(g,x,y,rx,ry,seeded(seed));g.strokeStyle=`rgba(${rgb},${strength*.55})`;g.lineWidth=.55;g.stroke();}
}
// ---------- Marginalia carried on the rising ink ----------
// A sea-monster and a gloss ride the shoreline, as they do in the empty quarters of an old chart.
// Both are cut once into sprites: the Leviathan only bobs and fades, it is never re-engraved, and
// the waterline crops whatever of him is still under the ink.
const darkMarginalia=new Map();
function leviathanSprite(relief){
  const s=Math.max(.55,Math.min(1.6,scale)),key='leviathan:'+plateName+':'+(relief?'r':'n')+':'+s.toFixed(2)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const w=Math.ceil(180*s),h=Math.ceil(80*s);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR*s,DPR*s);g.lineCap='round';g.lineJoin='round';
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment,base=80,rng=seeded(880517);
  // He is cut the way the monsters in the empty seas of the Carta Marina are cut, not sketched: every
  // part of him is a body with two contours rather than a single line, washed thinly in the flood's own
  // pigment, scaled along the back, crested, and shaded on the side away from the light with parallel
  // strokes running down and to the right, the one slant every other body on the plate is hatched in.
  // Where a coil breaks the surface the water is cut round it in short curling strokes.
  // The fluke is thrown out past the first coil, so the whole beast is set a few points in from the left.
  g.translate(7,0);
  const tone=(a)=>`rgba(${rgb},${a})`;
  // A stroke laid along a run of points, swelling and tapering as a burin line does and lifting at its
  // ends, so a contour drawn through a curve reads as one cut rather than a string of straight pieces.
  const cutAlong=(pts,alpha,weight,seed,taper=true)=>{
    const r=seeded(seed),ph=r()*TAU,f=2+Math.floor(r()*2);
    g.strokeStyle=tone(alpha);
    for(let i=0;i<pts.length-1;i++){
      const u=(i+.5)/(pts.length-1),lift=taper?Math.min(1,Math.sin(Math.PI*u)*1.6+.18):1;
      g.lineWidth=Math.max(.2,weight*lift*(1+Math.sin(f*u*TAU+ph)*.3));
      g.beginPath();g.moveTo(pts[i][0],pts[i][1]);g.lineTo(pts[i+1][0],pts[i+1][1]);g.stroke();
    }
  };
  const arcPts=(cx,cy,rx,ry,a0,a1,n)=>{const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;};
  const bez=(p0,p1,p2,p3,n)=>{const p=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;p.push([u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]]);}return p;};
  // Hatching inside a closed outline: parallel strokes down and to the right, stopped short of the
  // contour and weighted toward the shaded side (sx,sy is where the shade is deepest).
  const hatchInside=(outline,sx,sy,reach,alpha,gap,seed)=>{
    const r=seeded(seed);
    g.save();g.beginPath();g.moveTo(outline[0][0],outline[0][1]);for(const q of outline)g.lineTo(q[0],q[1]);g.closePath();g.clip();
    let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;for(const q of outline){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);}
    for(let k=x0-(y1-y0);k<x1;k+=gap){
      const mx=k+(y1-y0)*.5,my=(y0+y1)*.5,near=clamp(1-Math.hypot(mx-sx,my-sy)/reach,0,1);if(near<=.05||r()<.12)continue;
      g.strokeStyle=tone(alpha*near);g.lineWidth=.35+.45*near;
      g.beginPath();g.moveTo(k,y0);g.lineTo(k+(y1-y0),y1);g.stroke();
    }
    g.restore();
  };
  const wash=(outline,alpha)=>{g.fillStyle=tone(alpha);g.beginPath();g.moveTo(outline[0][0],outline[0][1]);for(const q of outline)g.lineTo(q[0],q[1]);g.closePath();g.fill();};
  // Three coils breaking the surface, each a hump of body between its back and its belly.
  const coils=[[40,15,7.6],[70,18,8.6],[98,13,7]];
  coils.forEach(([cx,cr,t],k)=>{
    const back=arcPts(cx,base,cr,cr*1.05,Math.PI,TAU,22),belly=arcPts(cx,base,cr-t,(cr-t)*1.02,TAU,Math.PI,18);
    const body=back.concat(belly);
    wash(body,.16);
    hatchInside(body,cx+cr*.55,base-cr*.2,cr*1.25,.62,1.35,9100+k);
    cutAlong(back,.92,1.3,9200+k);cutAlong(belly.slice().reverse(),.7,.8,9210+k);
    // Scales: small open arcs in rows along the back, each opening toward the tail.
    for(let row=0;row<2;row++)for(let i=1;i<10;i++){
      const a=Math.PI+Math.PI*i/10,rr=cr-t*(.3+row*.38),x=cx+Math.cos(a)*rr,y=base+Math.sin(a)*rr*1.03;
      if(rng()<.22)continue;
      burinArc(g,x,y,1.45,a+Math.PI*.5,a+Math.PI*1.5,rgb,.5,.42,Math.floor(rng()*1e6)||3,{segments:4,skips:0});
    }
    // The crest: a row of short spines along the back, raking toward the tail.
    for(let i=1;i<8;i++){
      const a=Math.PI+Math.PI*i/8,x=cx+Math.cos(a)*cr,y=base+Math.sin(a)*cr*1.05,nx=Math.cos(a-.35),ny=Math.sin(a-.35),len=3+2.2*Math.sin(Math.PI*i/8);
      burinSegment(g,x,y,x+nx*len,y+ny*len,rgb,.8,.7,9300+k*20+i,{segments:2,hair:false,wobble:.15});
    }
    // The water cut round the coil where it breaks the surface: a crest curling away from the body on
    // each side and a flat hairline running on from it.
    for(const side of [-1,1]){
      const fx=cx+side*(cr+1.5);
      cutAlong(bez([fx,base-.4],[fx+side*2,base-3.2],[fx+side*4.5,base-3],[fx+side*5.2,base-1.4],6),.6,.6,9400+k*3+side);
      burinSegment(g,fx+side*4,base-.3,fx+side*11,base-.3,rgb,.42,.42,9450+k*3+side,{segments:3,hair:false});
    }
  });
  // The tail thrown up behind the first coil: a tapering body curling over, closed in a forked fluke.
  {
    const upper=bez([27,base],[20,base-12],[10,base-20],[9,base-33],16),lower=bez([21,base],[16,base-10],[6,base-18],[5,base-31],16);
    const body=upper.concat(lower.slice().reverse());
    wash(body,.16);hatchInside(body,20,base-6,16,.55,1.4,9500);
    cutAlong(upper,.9,1.15,9510);cutAlong(lower,.72,.8,9520);
    const lobe=(tipX,tipY,seed)=>{
      const o=bez([7,base-32],[7+(tipX-7)*.2,base-41],[tipX-2,tipY+3],[tipX,tipY],8).concat(bez([tipX,tipY],[tipX-(tipX-7)*.15,tipY+6],[7+(tipX-7)*.35,base-34],[7,base-32],8));
      wash(o,.22);cutAlong(o,.85,.8,seed,false);
      for(let i=1;i<4;i++){const u=i/4;burinSegment(g,7,base-33,lerp(7,tipX,u*1.05),lerp(base-33,tipY,u)+2,rgb,.4,.35,seed+i,{segments:2,hair:false});}
    };
    lobe(-6,base-47,9530);lobe(18,base-49,9540);
  }
  // The neck rising out of the third coil, and the head at its top turned into the wind.
  {
    const front=bez([106,base],[112,base-14],[116,base-28],[126,base-38],16),rear=bez([118,base],[121,base-12],[124,base-22],[133,base-31],16);
    const body=front.concat(rear.slice().reverse());
    wash(body,.16);hatchInside(body,124,base-10,22,.62,1.35,9600);
    cutAlong(front,.9,1.25,9610);cutAlong(rear,.75,.9,9620);
    // Throat folds across the neck.
    for(let i=0;i<5;i++){const u=.25+i*.13,a=front[Math.round(u*16)],b=rear[Math.round(u*16)];burinSegment(g,a[0]+.5,a[1],b[0]-.5,b[1],rgb,.38,.4,9630+i,{segments:3,hair:false,wobble:.2});}
    // The head: skull, long upper jaw, the lower jaw dropped open, teeth, an eye under a heavy brow.
    const skull=bez([124,base-38],[122,base-50],[136,base-55],[146,base-50],12),snout=bez([146,base-50],[154,base-49],[162,base-47],[168,base-44],10);
    const upperJaw=bez([168,base-44],[160,base-42],[150,base-42],[138,base-41],10),lowerJaw=bez([140,base-37],[150,base-36],[158,base-33],[164,base-31],10);
    const chin=bez([164,base-31],[156,base-29],[146,base-29],[133,base-31],10);
    const headTop=skull.concat(snout,upperJaw),jaw=lowerJaw.concat(chin);
    wash(headTop.concat([[128,base-36]]),.2);wash(jaw.concat([[138,base-35]]),.18);
    hatchInside(jaw,152,base-30,16,.6,1.3,9700);hatchInside(headTop.concat([[128,base-36]]),140,base-40,14,.45,1.5,9710);
    cutAlong(skull,.95,1.3,9720);cutAlong(snout,.9,1.05,9730);cutAlong(upperJaw,.85,.8,9740);cutAlong(lowerJaw,.85,.85,9750);cutAlong(chin,.8,.95,9760);
    for(let i=0;i<6;i++){const u=.12+i*.14,q=upperJaw[Math.round(u*10)];burinSegment(g,q[0],q[1],q[0]-.5,q[1]+2.1,rgb,.75,.45,9770+i,{segments:2,hair:false});}
    for(let i=0;i<4;i++){const u=.1+i*.2,q=lowerJaw[Math.round(u*10)];burinSegment(g,q[0],q[1],q[0]+.4,q[1]-1.8,rgb,.7,.42,9780+i,{segments:2,hair:false});}
    g.fillStyle=tone(.95);g.beginPath();g.ellipse(140,base-46,1.6,1.25,-.2,0,TAU);g.fill();
    burinArc(g,140,base-46,3.2,Math.PI*.95,Math.PI*2.05,rgb,.6,.5,9790,{segments:7,skips:0});
    burinArc(g,139.5,base-47,5.2,Math.PI*1.1,Math.PI*1.75,rgb,.8,.9,9791,{segments:6,skips:0});
    // A nostril, and the fin behind the jaw swept back along the neck.
    g.beginPath();g.fillStyle=tone(.8);g.ellipse(163,base-46,.9,.6,0,0,TAU);g.fill();
    const fin=bez([128,base-44],[122,base-52],[116,base-54],[110,base-51],8).concat(bez([110,base-51],[116,base-47],[120,base-42],[126,base-39],8));
    wash(fin,.2);cutAlong(fin,.8,.7,9800,false);
    for(let i=1;i<5;i++){const u=i/5,q=fin[Math.round(u*8)];burinSegment(g,127,base-41,q[0],q[1],rgb,.45,.35,9810+i,{segments:2,hair:false});}
    // The spout blown clear of the head, a fan of fine strokes that fall away at their tips.
    for(let i=0;i<9;i++){
      const spread=(i-4)/4*.6,len=13+rng()*9,x0=138,y0=base-54;
      const tip=[x0+Math.sin(spread)*len,y0-Math.cos(spread)*len],droop=[tip[0]+Math.sin(spread)*4,tip[1]+3.5];
      cutAlong(bez([x0,y0],[x0+Math.sin(spread)*len*.4,y0-len*.6],[tip[0],tip[1]],droop,6),.42,.5,9820+i);
    }
  }
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
function glossSprite(relief){
  const size=Math.max(9,11*scale),key='gloss:'+plateName+':'+(relief?'r':'n')+':'+size.toFixed(1)+':'+DPR.toFixed(2);
  const cached=darkMarginalia.get(key);if(cached)return cached;
  const rgb=relief?ink.dark.shorelineRelief:ink.dark.pigment;
  const text='HIC SUNT DRACONES',font=plateFace(size,'sc');
  // Measured, not guessed: the canvas used to be sized from an estimate of the text's width, and
  // whenever the real, rendered string ran wider than that guess the last letters were clipped clean
  // off by the canvas's own edge rather than by anything to do with where the sprite is drawn.
  const measure=makeCanvas(1,1).getContext('2d');measure.font=font;
  const w=Math.ceil(measure.measureText(text).width)+8,h=Math.ceil(size*1.9);
  const c=makeCanvas(Math.max(1,Math.round(w*DPR)),Math.max(1,Math.round(h*DPR))),g=c.getContext('2d');
  g.scale(DPR,DPR);g.font=font;g.textAlign='left';g.textBaseline='alphabetic';
  g.fillStyle=`rgba(${rgb},.9)`;
  g.fillText(text,4,size*1.15);
  g.fillStyle=`rgba(${rgb},.45)`;
  g.fillRect(4,size*1.45,Math.max(1,w-14),.6);
  const sprite={canvas:c,w,h};
  darkMarginalia.set(key,sprite);return sprite;
}
// The lowest line the shoreline's marginalia may reach: the footer band across the bottom of the plate,
// where the chapter name and the utility buttons are set, plus the frame's own inner rule; or the top
// of the impressum's cartouche, at the start of a run when that furniture still sits in this same
// lower margin — whichever comes first. The waterline itself goes on rising past it — only the
// monster and the gloss are held above.
// The chapter title used to be caught at that same lower clamp and parked there for the rest of the
// plate, in the very reach the gloss drifts into, so this floor was lowered by the title's own band to
// keep the two apart — a standing concession to a standing collision. The title rides off the foot of
// the sheet now (revealPoint, celestial.js) instead of coming to rest in the gloss's lane, so the floor
// is the footer band and the impressum again, and the occasional crossing on the way down is what
// glossClearance's own fade is for.
function marginaliaFloor(){return Math.min(H-footerBand()-frameBand()*.92,impressumTop()-8);}
// Where the gloss is printed for a given waterline: it rides just under the ink until the flood would
// carry it into the footer band, and from there it stays where it is while the ink goes on past it.
function marginaliaGloss(fy,gloss){
  const floor=marginaliaFloor();
  return {y:Math.min(fy+9*scale,floor-gloss.h),h:gloss.h};
}
// The Leviathan surfaces slowly and periodically at his own place along the edge, and the gloss
// drifts with the flood. Both stand still when the run is paused or reduced motion is requested, and
// both stay above the footer band however high the ink has risen.
// The gloss keeps off the chart: where it would drift across an orbit ring or a hazard it fades to nothing
// over a short reach and comes back once it is clear, so it never prints through a ring in the play channel.
function glossClearance(x,y,w,h){
  let clear=1;
  const near=(px,py,r)=>{const dx=Math.max(0,Math.abs(px-(x+w*.5))-w*.5),dy=Math.max(0,Math.abs(py-(y+h*.5))-h*.5);return Math.hypot(dx,dy)-r;};
  for(const n of world.nodes){const ny=sy(n.y);if(ny<y-220||ny>y+h+220)continue;clear=Math.min(clear,near(sx(n.x),ny,(n.cap||n.r)*scale+6*scale)/(16*scale));}
  for(const hz of world.hazards){const hy=sy(hz.y);if(hy<y-320||hy>y+h+320)continue;clear=Math.min(clear,near(sx(hz.x),hy,hz.r*scale+14*scale)/(16*scale));}
  // The gloss keeps off lettering as carefully as it keeps off the chart. The chapter title is carried
  // down the sheet by the same ascent that raises the flood, so the two cross on the title's way off the
  // foot of the plate; left uncounted the gloss printed straight through it while they did.
  // Notes set beside the chart are counted the same way, since the solver that places them cannot see a
  // sprite drifting in from the margin.
  const box=(t,b,l,r)=>{
    const dx=Math.max(0,Math.max(l-(x+w),x-r)),dy=Math.max(0,Math.max(t-(y+h),y-b));
    clear=Math.min(clear,Math.hypot(dx,dy)/(14*scale));
  };
  // Everything the plate has lettered, in one question rather than in a clause apiece (ground.js): the
  // chapter title, the notes, the captions under the bodies, the names round the rims, the running head.
  const reach=20*scale;
  for(const m of groundStanding({left:x-reach,right:x+w+reach,top:y-reach,bottom:y+h+reach},'gloss'))box(m.top,m.bottom,m.left,m.right);
  return clamp(clear,0,1);
}
// The atlas's own standing tallies: a landing's gain and the run's running total, inked once into the
// same gutter a floater used to drift up through, then left — carried by the ascent like every other
// mark on the sheet rather than fading over a second and change. Era plates keep the floater exactly
// as it was (see ui.js's two push sites), so this list is empty and idle whenever one of them is on
// the press. At most this many stand on the sheet at once (see the cap below); the lowest gives way.
let tallies=[];
const TALLY_CAP=12;
// The line a marginal note is set on: its subject's own, slid up or down its margin until the note
// stands clear of everything already lettered there. Only lettering that actually reaches into this
// gutter is counted, so a note on the left margin is never pushed about by one on the right. `kind`
// is which register of marginal note is being placed — 'floater' for the eras' own drifting score, or
// 'tally' for the atlas's standing one — so it excuses its own kind from the register the way every
// other solver does, and counts only the standing marks of that same kind already in the gutter.
function floaterLine(f,left,h,kind){
  kind=kind||'floater';
  // The atlas's own foot (the running head) keeps its notes above the row of utility buttons; a sheet
  // with no foot keeps them above that row itself (48px buttons set at least 17px off the bottom, see `.footer`
  // in index.html), or they settled under the icons and stacked there.
  const top=hudBand()+16,bottom=renaissanceAtlas()?H-frameBand()*.92-21:H-84,boxes=[];
  for(const m of groundStanding({left:left?0:W*.5,right:left?W*.5:W,top:0,bottom:H},kind))boxes.push([m.top,m.bottom]);
  const list=kind==='tally'?tallies:floaters;
  for(const q of list)if(q!==f&&q.lift!==undefined&&q.left===left){
    const qy=sy(q.y)+q.lift;boxes.push([qy-h*.55,qy+h*.55]);
  }
  // A tally is ink that stands, so it is kept off the chart as well as off the lettering — a body or a
  // hazard whose disc reaches into the stretch of gutter the note would take is a line the note is not
  // set on, exactly as a note beside the chart steps round the bodies (placeInscription). A floater, gone
  // in a second, never needed to; a tally set across a slingshot's rose would stand there until the sheet
  // carried both away.
  if(kind==='tally'){
    const inner=frameBand()*.92+7,hand=Math.max(4.5,6*scale),size=Math.max(11,13*scale),size2=Math.max(9.5,11*scale);
    ctx.save();ctx.font=plateFace(size,'text','italic');let w=ctx.measureText(f.line1).width;ctx.font=plateFace(size2,'text','italic');w=Math.max(w,ctx.measureText(f.line2).width);ctx.restore();
    const l=left?inner:W-inner-hand*2.4-w,r=left?inner+hand*2.4+w:W-inner;
    const disc=(x,y,rad)=>{if(x+rad>l&&x-rad<r)boxes.push([y-rad,y+rad]);};
    for(const n of world.nodes)disc(sx(n.x),sy(n.y),(n.cap||n.r)*scale+2);
    for(const hz of world.hazards)disc(sx(hz.x),sy(hz.y),hz.r*scale+6);
    // The notes are asked directly as well as through the register: a standing instruction is re-set at
    // the end of a frame, after this frame's lettering has declared its ground, so the register can be one
    // note short at exactly the moment a tally is choosing its line.
    for(const q of inscriptions){const b=inscriptionBox(q);if(b.right>l&&b.left<r)boxes.push([b.top,b.bottom]);}
  }
  const clash=y=>{let worst=0;for(const [t,b] of boxes){const o=Math.min(y+h*.55,b)-Math.max(y-h*.55,t);if(o>worst)worst=o;}return worst;};
  const home=clamp(sy(f.y),top,bottom);
  let best=home,cost=clash(home);
  for(let step=1;step<=12&&cost>0;step++)for(const dir of [1,-1]){
    const y=clamp(home+dir*step*h*.85,top,bottom),c=clash(y);
    if(c<cost){best=y;cost=c;}
  }
  // A gutter this crowded has nowhere left to set the note clear: it is suppressed rather than printed
  // over whatever is already there, the same call placeInscription makes when no clear ground is found.
  return cost>0?null:best;
}
function drawDarkMarginalia(fy,time,alpha){
  // Neither the monster nor the gloss has anything to be carried by while the run is still to be
  // dealt: the flood is only its ready-state resting level, not a rising tide, and drawing them here
  // is what let the gloss print through the frontispiece's own button cloud.
  if(world.state==='ready')return;
  const s=scale,drift=time*2.3*s,cycle=27,window=9.5;
  const floor=marginaliaFloor(),line=Math.min(fy,floor);
  // Both marks below are held to the same copper as every other one on the sheet: rather than be
  // guillotined at the plate mark, each is inked in and out over the last reach of the margin — which
  // is what a mark carried by the flood would do anyway. The vertical clip on the Leviathan (the rect
  // below) only ever kept it inside the canvas, not inside the frame's own inner rule, so on its own it
  // let the monster surface clean through the tick ladder and the corner ornaments; this edge fade is
  // what actually holds it to the plate, the same fade the gloss earned first.
  const rule=frameBand()*.92+6,fade=Math.max(18,26*scale);
  const monster=leviathanSprite(false),phase=((time+7)%cycle)/cycle;
  if(phase<window/cycle&&line>monster.h*.25){
    const u=phase*cycle/window,rise=Math.sin(Math.PI*u);
    const span=W+monster.w*2,x=((.34*span-drift*.62)%span+span)%span-monster.w;
    const y=line-monster.h+(1-rise)*monster.h*1.05;
    const edge=clamp(Math.min(x-rule,W-rule-(x+monster.w))/fade+1,0,1);
    if(edge>0){
      ctx.save();ctx.beginPath();ctx.rect(0,0,W,Math.max(0,line+1));ctx.clip();
      ctx.globalAlpha=alpha*rise*.9*edge;
      ctx.drawImage(monster.canvas,x,y,monster.w,monster.h);
      if(darknessRelief>.001){const r=leviathanSprite(true);ctx.globalAlpha=alpha*rise*.9*darknessRelief*edge;ctx.drawImage(r.canvas,x,y,r.w,r.h);}
      ctx.restore();
    }
  }
  if(plainPlate())return;
  // Wrapped inside the frame's own inner rule rather than across the whole viewport, and clipped to
  // match: the gloss used to drift the full canvas width and lean on alpha alone to fade at the
  // margin, which left it printing straight over the flank's own scale ladder and out past the rule
  // whenever the fade lagged the sprite. Bounding the cycle to the rule and clipping the blit to the
  // same rect means it can only ever be seen entering and leaving at the rule, never past it.
  const gloss=glossSprite(false),inner=frameBand()*.92+8,innerSpan=Math.max(1,W-inner*2)+gloss.w*2;
  const gx=((.62*innerSpan-drift*.62)%innerSpan+innerSpan)%innerSpan-gloss.w+inner;
  const gy=marginaliaGloss(fy,gloss).y;
  if(gy+gloss.h<=0)return;
  const clear=glossClearance(gx,gy,gloss.w,gloss.h);if(clear<=0)return;
  // HIC SUNT DRACONES is lettering like any other once it is actually on the sheet, so it takes its ground
  // in the register too (ground.js) — a note or a caption placed while it drifts past keeps off it, rather
  // than the gloss being the only one of the two doing the yielding.
  markGround('gloss',gx,gy,gx+gloss.w,gy+gloss.h);
  ctx.save();
  ctx.beginPath();ctx.rect(inner,inner,Math.max(0,W-inner*2),Math.max(0,H-inner*2));ctx.clip();
  ctx.globalAlpha=alpha*.5*clear;
  ctx.drawImage(gloss.canvas,gx,gy,gloss.w,gloss.h);
  if(darknessRelief>.001){const r=glossSprite(true);ctx.globalAlpha=alpha*.5*darknessRelief*clear;ctx.drawImage(r.canvas,gx,gy,r.w,r.h);}
  ctx.restore();
}
// Where the flood stands on the sheet, and where its painted coastline actually runs across it — the
// calibrated hairline the simulation kills on, and the two sine terms darknessPlate() cuts its own
// shore from, read in the drifting frame the tiles are laid in. Both are shared out rather than kept
// inside drawDark() because the corrosion the rising ink works on everything the plate has printed
// (corrodeInk, below) has to follow the very edge it is eating out from rather than a ruled horizontal.
const darkWaterline=()=>sy(world.floorY-4);
function darkShoreWave(x){
  const s=scale,tile=640*s,drift=((reducedMotion?0:world.time)*2.3*s)%tile,a=(x+drift)/tile*TAU;
  return (Math.sin(a*3)*6+Math.sin(a*11)*2.5)*s;
}
// ---------- The ink eating the plate's own drawing ----------
// The rising dark is not a curtain drawn over the sheet, it is ink, and iron-gall ink corrodes the
// paper it is drawn on before it covers it. So what the plate has printed browns before it drowns: a
// halo tightens a little ahead of the waterline along whatever ink stands there, darkens at the edge
// itself to the same rust darknessPlate() above deepens toward, and a few nodes are bitten right
// through where the burin struck heaviest.
//
// What corrodes is read off the cached layer the ink was cut into rather than off any list of what was
// drawn there: the band is copied into a scratch sheet and the rust laid over the copy with
// `source-atop`, which can only land where that layer's own ink already stands. That is the mechanism
// bought with one composite mode — no reading back pixel by pixel, and no second, corroded copy of any
// layer, since every layer is the same layer at every waterline and only the band's position and what
// is left of the copy move with the flood. Both cached layers this is asked of — the frame's furniture
// (frameCorrode, frame.js) and a constellation's figure (figureCorrode, figures.js) — therefore stay
// keyed exactly as they were, and the pass costs one band's blending per frame however deep the run
// has got.
let corrodeSheet=null,corrodeKey='';
const CORRODE_LEAD=44,CORRODE_DRAG=26,CORRODE_WAVE=9;
// How far ahead of the waterline the halo runs, how far under it the rust goes on reading, and the
// slack the coastline's own swell needs either side of both. Past the drag the flood's body has gone
// opaque and nothing printed under it is legible anyway, which is what keeps the band a band.
const corrodeSpan=()=>({lead:CORRODE_LEAD*scale,drag:CORRODE_DRAG*scale,wave:CORRODE_WAVE*scale});
const corrodeDepth=()=>(CORRODE_LEAD+CORRODE_DRAG+CORRODE_WAVE*2)*scale+2;
function corrodeSheetFor(w,h){
  const key=Math.ceil(w)+'x'+Math.ceil(h)+'x'+DPR.toFixed(2);
  if(!corrodeSheet||corrodeKey!==key){corrodeSheet=makeCanvas(Math.max(1,Math.ceil(w*DPR)),Math.max(1,Math.ceil(h*DPR)));corrodeKey=key;}
  return corrodeSheet;
}
// One pass of the corrosion over a piece of ink already cut into a layer. `ratio` is how many of that
// layer's own pixels one plate pixel is worth — the frame layer is cut at the device's resolution, a
// figure's raster at the plate's own — so one routine serves both without resampling either; `ox,oy` is
// where the layer itself sits on the plate, and `dx,dy,w,h` the piece of the plate to eat. `spines` are
// the abscissae the piece's own heaviest lines run down, and a piece that names none is browned without
// being bitten. The scratch sheet is cut once per viewport and reused by every call, in whatever corner
// of it the piece needs, so no run ever allocates a second one.
//
// A piece is deliberately taken whole rather than as the two or three narrow bands that actually carry
// ink. Every round trip through the scratch ends in a blit off it and back onto the plate, and that
// blit is a synchronisation point: the work queued on the scratch has to finish before the plate can
// read it. Three narrow trips cost three of those and one wide trip costs one, and the sync is worth
// far more than the blank sheet blended in between the bands — which, after the squaring below, is
// blank in the copy too and so costs nothing but its own fill rate.
function corrodeInk(source,ratio,ox,oy,dx,dy,w,h,spines){
  if(!(w>1&&h>1))return;
  const {lead,drag}=corrodeSpan(),s=scale,fy=darkWaterline();
  const sheet=corrodeSheetFor(W,corrodeDepth()),g=sheet.getContext&&sheet.getContext('2d');
  const sw=w*ratio,sh=h*ratio;
  if(!g||!(sw<=sheet.width+1e-6&&sh<=sheet.height+1e-6))return;
  g.setTransform(ratio,0,0,ratio,0,0);
  g.globalCompositeOperation='source-over';g.clearRect(0,0,w,h);
  g.drawImage(source,(dx-ox)*ratio,(dy-oy)*ratio,sw,sh,0,0,w,h);
  // The copy taken against itself, which squares every pixel's own alpha and is the whole of what makes
  // the heaviest linework fail first: a rule pulled at .62 keeps .38 of itself and takes the rust
  // accordingly, while the faint film a plate leaves over everything it printed (buildFrameLayer's own
  // wiping film, .05) falls to .0025 and is gone, and a figure's hatch and wash go with it while its
  // contour stays. Without it the tint lands in proportion to alpha rather than to density, and that
  // flat film — which covers the whole sheet — browns as readily as the rule does, which prints the
  // corrosion as a rectangle instead of along the marks inside it.
  g.globalCompositeOperation='destination-in';
  g.drawImage(source,(dx-ox)*ratio,(dy-oy)*ratio,sw,sh,0,0,w,h);
  const base=fy-dy,halo=ink.dark.corrosion,rust=ink.dark.pigment;
  // Laid in columns, each shifted by the flood's own coastline where it stands rather than all at one
  // height: a stain spreading from a wavy edge has a wavy reach, and a single fill across the band
  // would have banded the sheet along the one ruled horizontal an engraved plate cannot afford.
  const step=Math.max(6,14*s),columns=fill=>{
    g.fillStyle=fill;
    for(let x=0;x<w;x+=step){
      const shift=darkShoreWave(dx+x);
      g.save();g.translate(0,shift);g.fillRect(x,-shift,Math.min(step,w-x),h);g.restore();
    }
  };
  // How far the corrosion has gone is carried by what is left of the copy, not by how strongly it is
  // tinted: the copy goes over to the rust at full strength first, and only then is eaten back by the
  // veil below. Tinting weakly instead would have laid a near-ink colour back over the very ink it was
  // taken from, which prints the line a second time — a thicker mark, not a browner one.
  g.globalCompositeOperation='source-atop';
  const tone=g.createLinearGradient(0,base-lead,0,base+drag);
  tone.addColorStop(0,`rgba(${halo},1)`);tone.addColorStop(.54,`rgba(${halo},1)`);
  tone.addColorStop(.66,`rgba(${rust},1)`);tone.addColorStop(1,`rgba(${rust},1)`);
  columns(tone);
  // The nodes bitten clean through, a core at the calibrated rust inside a wider browned rim. They are
  // struck under the same `source-atop`, so a bite can only open in ink that was already there — which
  // is the whole of what keeps them off the bare sheet beside the line they are eating. Cut only on a
  // named spine: a bite over blank sheet is invisible and still costs its contour, so a piece whose
  // heavy lines cannot be named in advance is browned and left unbitten rather than bitten at random.
  const lines=spines&&spines.length?spines:null;
  if(lines){
    const bite=seeded(90233+Math.round(dx*7+ox*31));
    for(let i=0;i<5;i++){
      const bx=lines[i%lines.length]-dx+(bite()-.5)*3*s;
      const by=base+(bite()*1.4-.3)*drag,br=(1.2+bite()*bite()*3.2)*s,seed=Math.floor(bite()*1e7)||7;
      landContour(g,bx,by,br*1.9,br*1.35,seeded(seed));g.fillStyle=`rgba(${halo},.5)`;g.fill();
      landContour(g,bx,by,br,br*.7,seeded(seed));g.fillStyle=`rgba(${rust},1)`;g.fill();
    }
  }
  // The reach itself: the copy is eaten away to nothing well ahead of the waterline, holds almost all of
  // itself at the edge, and is gone again a little under it, where the flood's own body has gone opaque
  // and nothing printed beneath it is legible either way. Past both ends the gradient clamps to a full
  // erase, so the band can only ever meet the sheet at nothing.
  g.globalCompositeOperation='destination-out';
  const veil=g.createLinearGradient(0,base-lead,0,base+drag);
  veil.addColorStop(0,'rgba(0,0,0,1)');veil.addColorStop(.32,'rgba(0,0,0,.76)');
  veil.addColorStop(.54,'rgba(0,0,0,.36)');veil.addColorStop(.66,'rgba(0,0,0,.06)');
  veil.addColorStop(.84,'rgba(0,0,0,.26)');veil.addColorStop(1,'rgba(0,0,0,1)');
  columns(veil);
  g.globalCompositeOperation='source-over';
  ctx.drawImage(sheet,0,0,sw,sh,dx,dy,w,h);
}
// The band of the plate the corrosion is working on right now, or null when the flood is nowhere near
// the sheet. Clipped to the plate at both ends, and to whole device pixels, so a caller can intersect
// its own layer with it and hand the result straight to corrodeInk without resampling anything. Paper
// only, for the reason the flood's own corrosion above is: night's rising dark is a drowning, not an
// acid, and it keeps its shoreline. Asked once here so no caller has to ask it again.
function corrodeBand(){
  if(!onPaper())return null;
  const {lead,drag,wave}=corrodeSpan(),fy=darkWaterline(),q=v=>Math.round(v*DPR)/DPR;
  const top=q(Math.max(0,fy-lead-wave)),bottom=q(Math.min(H,fy+drag+wave));
  return bottom-top>2?{top,bottom}:null;
}
function drawDark(dt=0){
  // A plate that draws this in its own hand names the painter (see defineHand() in src/plates.js); a
  // plate that names none is drawn exactly as the atlas always drew it.
  const own=handFor('dark');if(own)return own(dt);
  // Match the visible hairline to the simulation's exact loss threshold.
  const fy=darkWaterline(),near=clamp(1-(world.floorY-4-world.player.y)/190,0,1);
  if(fy>H+100)return;
  const target=clamp(world.darknessGrace/.65,0,1);
  if(world.state!=='paused')darknessRelief=lerp(darknessRelief,target,1-Math.exp(-dt*6));
  const time=reducedMotion?0:world.time,s=scale;
  const shoreBase=ink.dark.pigment.split(',').map(Number),shoreTarget=ink.dark.shorelineRelief.split(',').map(Number);
  const rgb=shoreBase.map((v,i)=>Math.round(lerp(v,shoreTarget[i],darknessRelief))).join(',');
  ctx.save();
  const body=ctx.createLinearGradient(0,fy,0,fy+68*s);
  body.addColorStop(0,`rgba(${ink.dark.bodyTop},.12)`);body.addColorStop(.4,`rgba(${ink.dark.bodyMid},.82)`);body.addColorStop(1,ink.dark.washSolid);
  ctx.fillStyle=body;ctx.fillRect(0,fy,W,Math.max(0,H-fy));
  const tileWidth=640*s,tileHeight=180*s,drift=(time*2.3*s)%tileWidth;
  const normal=darknessPlate(false),relief=darknessPlate(true);
  for(let x=-drift-tileWidth;x<W;x+=tileWidth){
    ctx.drawImage(normal,x,fy-24*s,tileWidth,tileHeight);
    if(darknessRelief>.001){ctx.globalAlpha=darknessRelief;ctx.drawImage(relief,x,fy-24*s,tileWidth,tileHeight);ctx.globalAlpha=1;}
  }
  // One fine shoreline communicates danger; softer sediment lines stay below it. Both are cut with the
  // same burin as every other mark on the sheet rather than ruled straight — the waterline is the one
  // line in the atlas that kills you, and it reads as ink, not a ruler. Seeded off the floor's own
  // rounded position so the cut is stable frame to frame instead of crawling as the flood rises.
  burinSegment(ctx,0,fy,W,fy,rgb,.38+near*.24+darknessRelief*.12,Math.max(.65,s*.75),Math.round(world.floorY),{segments:10,wobble:.5,hair:false});
  for(let layer=0;layer<3;layer++){
    ctx.strokeStyle=`rgba(${rgb},${(.18-layer*.04)*(1+darknessRelief*.45)})`;ctx.lineWidth=.45*s;
    ctx.beginPath();
    for(let x=-8;x<W+9;x+=8){
      const y=fy+(3+layer*5+(Math.sin(x/(48*s)+time*.19+layer)*.5+.5)*(4+layer))*s;
      if(x===-8)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  for(const mote of inkMotes){
    const phase=(mote.phase+time*mote.speed)%1,alpha=Math.sin(phase*Math.PI)*(.13+near*.09+darknessRelief*.1);
    const x=mote.x*W+Math.sin(time*.3+mote.drift)*2*s,y=fy-(4+phase*25)*s;
    line(x,y,x+.3*s,y+mote.length*s,`rgba(${rgb},${alpha})`,.55*s);
  }
  drawDarkMarginalia(fy,time,.55+near*.3+darknessRelief*.15);
  if(near>.2&&world.state==='playing'){
    // The gradient runs from nothing to one alpha, so it is painted once at full strength (sheetWash,
    // src/plates.js) and laid at the strength this frame asks for; while the relief is carrying its ink
    // from one colour to the other, the two ends are laid in their shares rather than a new wash painted
    // for every shade in between.
    const A=clamp(near*.105*(1-darknessRelief*.75),0,1),edgeWash=c=>g=>{const edge=g.createRadialGradient(W*.5,H*.5,H*.3,W*.5,H*.5,Math.max(W,H)*.65);
      edge.addColorStop(0,'rgba(81,48,39,0)');edge.addColorStop(1,`rgba(${c},1)`);g.fillStyle=edge;g.fillRect(0,0,W,H);};
    ctx.save();
    if(darknessRelief<.999){ctx.globalAlpha=A*(1-darknessRelief);sheetWash('dark.edge.'+ink.dark.pigment,edgeWash(ink.dark.pigment));}
    if(darknessRelief>.001){ctx.globalAlpha=A*darknessRelief;sheetWash('dark.edge.'+ink.dark.shorelineRelief,edgeWash(ink.dark.shorelineRelief));}
    ctx.restore();
  }
  ctx.restore();
}
