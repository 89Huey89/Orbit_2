'use strict';
/* Orbit · src/frame.js
   The engraved plate frame, degree scale, marginalia, and the frame-per-frame render() composition. */
// ---------- Plate frame: the engraved margin, degree scale, and marginalia framing the play field ----------
// A single offscreen frameLayer holds everything static (plate-mark, double rule, tick ladders, corner
// ornaments, and — on wide screens — the compass rose, scale bar and credit line). It is rebuilt only when
// its key (size, pixel ratio, plate) changes. The one moving part, the declination numbers on the side
// scales, is cheap enough to redraw live each frame straight onto ctx after the cached layer is blitted.
definePlate('frame',{
  night:{markEdge:'rgba(155,174,171,.14)',mark:'rgba(198,187,155,.08)',rule:'rgba(198,187,155,.4)',ruleFaint:'rgba(155,174,171,.22)',tick:'rgba(198,187,155,.32)',tickMinor:'rgba(155,174,171,.16)',text:'rgba(198,187,155,.42)',orn:'rgba(198,187,155,.26)'},
  paper:{markEdge:'rgba(96,74,52,.18)',mark:'rgba(58,42,28,.1)',rule:'rgba(58,42,28,.52)',ruleFaint:'rgba(96,74,52,.3)',tick:'rgba(58,42,28,.42)',tickMinor:'rgba(96,74,52,.24)',text:'rgba(58,42,28,.48)',orn:'rgba(58,42,28,.36)'}
});
let frameLayer=null,frameKey='';
function frameWide(){return W>780;}
function frameBand(){return frameWide()?26:14;}
function frameEdgeTicks(len){const unitPx=frameWide()?7:5,n=Math.max(20,Math.round(len/unitPx));return {n,step:len/n};}
function frameCorner(g,x,y,dirX,dirY,color){
  const len=frameWide()?11:7;
  g.strokeStyle=color;g.lineWidth=1;
  g.beginPath();g.moveTo(x,y+len*dirY);g.lineTo(x,y);g.lineTo(x+len*dirX,y);g.stroke();
  g.beginPath();g.arc(x+4*dirX,y+4*dirY,1.3,0,TAU);g.strokeStyle=color;g.lineWidth=.7;g.stroke();
}
function frameCompassRose(g,cx,cy,r,colors){
  // The ornament and its four cardinal names stay within 3r of cx,cy, so callers can budget the footprint.
  g.save();g.translate(cx,cy);g.strokeStyle=colors.orn;g.lineWidth=.8;
  g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();g.beginPath();g.arc(0,0,r*.5,0,TAU);g.stroke();
  for(let i=0;i<8;i++){
    const a=i/8*TAU-Math.PI/2,long=i%2===0,rr=long?r:r*.6;
    g.lineWidth=long?.9:.6;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);g.stroke();
  }
  g.fillStyle=colors.orn;g.beginPath();g.moveTo(0,-r-3);g.lineTo(-2,-r+1.2);g.lineTo(0,-r-.5);g.lineTo(2,-r+1.2);g.closePath();g.fill();
  g.restore();
  // The four winds named round the rose, each set on its own quarter of the ring.
  const size=Math.max(4.6,r*.42),ring=r*1.9;
  g.strokeStyle=colors.tickMinor;g.lineWidth=.5;g.beginPath();g.arc(cx,cy,ring-1.5,0,TAU);g.stroke();
  g.font=`${size}px 'IM Fell English SC','IM Fell English',Georgia,serif`;
  g.fillStyle=colors.text;
  const opts={align:'center',size,spacing:size*.14};
  textAlongArc(g,'SEPTENTRIO',cx,cy,ring+size,-Math.PI/2,opts);
  textAlongArc(g,'ORIENS',cx,cy,ring+size,0,opts);
  textAlongArc(g,'OCCIDENS',cx,cy,ring+size,Math.PI,opts);
  textAlongArc(g,'MERIDIES',cx,cy,ring,Math.PI/2,{...opts,inward:true});
}
// A cherubic wind-head, cut for the corner of the plate: a puffing face turned into the chart with its
// breath streaming away from the mouth. Seeded so no two corners are the same head.
function frameWindHead(g,cx,cy,angle,rgb,alpha,radius,seed){
  const rng=seeded(seed>>>0||1),R=radius;
  g.save();g.translate(cx,cy);g.rotate(angle);
  // The face, cut with few and heavy strokes so it still reads at the size of a margin ornament.
  burinArc(g,0,0,R,0,TAU,rgb,alpha,1.1,seed+3,{segments:24,skips:2});
  // Hair, a wreath of curls round the back of the head only.
  for(let i=0;i<6;i++){
    const a=Math.PI*.62+i/5*Math.PI*.76+(rng()-.5)*.1,cxx=Math.cos(a)*R*1.02,cyy=Math.sin(a)*R*1.02;
    burinArc(g,cxx,cyy,R*(.3+rng()*.12),a-2.4,a+.9,rgb,alpha*(.7+rng()*.4),.75,seed+11+i*5,{segments:6,skips:0});
  }
  // Closed eyes under heavy brows, and the swell of two cheeks blown full of wind.
  for(const s of [-1,1]){
    burinArc(g,R*.06,s*R*.3,R*.24,-1,.7,rgb,alpha,.8,seed+31+(s>0?1:0),{segments:5,skips:0});
    burinArc(g,R*.02,s*R*.32,R*.34,-.8,.35,rgb,alpha*.65,.6,seed+41+(s>0?1:0),{segments:4,skips:0});
    burinArc(g,R*.34,s*R*.46,R*.42,-2.5,-.15,rgb,alpha*.8,.7,seed+51+(s>0?1:0),{segments:6,skips:0});
  }
  // The pursed mouth, blowing along the local x axis.
  burinArc(g,R*.74,0,R*.2,0,TAU,rgb,alpha,.9,seed+61,{segments:10,skips:0});
  g.fillStyle=`rgba(${rgb},${alpha*.7})`;g.beginPath();g.arc(R*.74,0,R*.09,0,TAU);g.fill();
  // The breath: long tapering strokes leaving the mouth and spreading over the margin.
  for(let i=0;i<5;i++){
    const spread=(i-2)/2*.4,len=R*(2.1+rng()*2.2);
    const x0=R*.98,y0=Math.sin(spread)*R*.28;
    burinSegment(g,x0,y0,x0+Math.cos(spread)*len,y0+Math.sin(spread)*len,rgb,alpha*(.6-Math.abs(spread)*.5),.7,seed+71+i*7,{segments:6,skips:1,hair:false,wobble:1.1});
  }
  g.restore();
}
function frameScaleBar(g,x,y,colors){
  const w=30,h=3;
  g.lineWidth=1;g.strokeStyle=colors.rule;g.strokeRect(x+.5,y+.5,w,h);
  g.fillStyle=colors.orn;for(let i=0;i<4;i+=2)g.fillRect(x+i*w/4,y,w/4,h);
  g.font=`italic 7px 'IM Fell English',Georgia,serif`;g.fillStyle=colors.text;g.textAlign='left';g.fillText('Scala',x+w+5,y+h+1);
}
function buildFrameLayer(){
  const c=makeCanvas(Math.max(1,Math.ceil(W*DPR)),Math.max(1,Math.ceil(H*DPR))),g=c.getContext('2d');g.scale(DPR,DPR);
  const colors=ink.frame,wide=frameWide(),band=frameBand();
  const pm1=band*.2,pm2=band*.42;
  g.lineWidth=1;g.strokeStyle=colors.markEdge;g.strokeRect(pm1+.5,pm1+.5,Math.max(1,W-pm1*2-1),Math.max(1,H-pm1*2-1));
  if(onPaper()){g.lineWidth=.6;g.strokeStyle=colors.mark;g.strokeRect(pm2+.5,pm2+.5,Math.max(1,W-pm2*2-1),Math.max(1,H-pm2*2-1));}
  // The double rule is cut with the same burin as the orbit rings: it swells, wobbles and lifts a little.
  const outerR=band*.56,innerR=band*.92;
  const ruleRgb=ink.base.inkStrong,faintRgb=ink.base.inkSoft;
  burinRect(g,outerR+.5,outerR+.5,Math.max(1,W-outerR*2-1),Math.max(1,H-outerR*2-1),ruleRgb,onPaper()?.62:.46,wide?1.4:1,90211);
  burinRect(g,innerR+.5,innerR+.5,Math.max(1,W-innerR*2-1),Math.max(1,H-innerR*2-1),faintRgb,onPaper()?.34:.26,wide?1:.7,44127);
  // Graduated scale between the two rules: fine ticks every unit, heavier every 5th, numbered every 10th.
  const tickLen=Math.max(1,innerR-outerR);
  const hLen=Math.max(1,W-band*2),{n:hn,step:hStep}=frameEdgeTicks(hLen);
  for(let i=0;i<=hn;i++){
    const x=band+i*hStep,major=i%5===0,numbered=i%10===0,len=tickLen*(major?.9:.45);
    g.lineWidth=major?.9:.5;g.strokeStyle=major?colors.tick:colors.tickMinor;
    g.beginPath();g.moveTo(x,outerR);g.lineTo(x,outerR+len);g.stroke();
    g.beginPath();g.moveTo(x,H-outerR);g.lineTo(x,H-outerR-len);g.stroke();
    if(numbered){
      g.font=`${wide?8:6.5}px 'IM Fell English',Georgia,serif`;g.textAlign='center';g.fillStyle=colors.text;
      g.fillText(String(i),x,outerR+tickLen*.72+2);g.fillText(String(i),x,H-outerR-tickLen*.72+5);
    }
  }
  const vLen=Math.max(1,H-band*2),{n:vn,step:vStep}=frameEdgeTicks(vLen);
  for(let i=0;i<=vn;i++){
    const y=band+i*vStep,major=i%5===0,len=tickLen*(major?.9:.45);
    g.lineWidth=major?.9:.5;g.strokeStyle=major?colors.tick:colors.tickMinor;
    g.beginPath();g.moveTo(outerR,y);g.lineTo(outerR+len,y);g.stroke();
    g.beginPath();g.moveTo(W-outerR,y);g.lineTo(W-outerR-len,y);g.stroke();
  }
  // Restrained corner brackets at the inner rule.
  frameCorner(g,innerR,innerR,1,1,colors.orn);frameCorner(g,W-innerR,innerR,-1,1,colors.orn);
  frameCorner(g,innerR,H-innerR,1,-1,colors.orn);frameCorner(g,W-innerR,H-innerR,-1,-1,colors.orn);
  // A wind-head in each corner, blowing along the diagonal into the chart, kept in the margin's tone.
  {
    const head=wide?14:9,inset=innerR+head*.9+(wide?3:2),windRgb=ink.base.inkSoft,windAlpha=onPaper()?.34:.24;
    const corners=[[inset,inset,1,1],[W-inset,inset,-1,1],[inset,H-inset,1,-1],[W-inset,H-inset,-1,-1]];
    for(const [x,y,dx,dy] of corners)frameWindHead(g,x,y,Math.atan2(dy,dx),windRgb,windAlpha,head,51001+Math.round(x*7+y*13));
  }
  // Marginalia in the flanks either side of the play channel — desktop only, and clear of the centre 55%.
  // Anchored a fixed distance off the bottom edge so the whole cluster (rose, bar, its label, the credit
  // line below) always lands inside the band regardless of how band scales.
  if(wide){
    const flank=W*.225,leftCx=(band+4+flank)/2,rightX=W-flank+4,oy=H-15,roseR=13;
    // The rose is set in the left flank, clear of the play channel, where its cardinal names have room.
    frameCompassRose(g,leftCx,Math.min(H-roseR*3-band,H*.63),roseR,colors);
    frameScaleBar(g,rightX,oy-2,colors);
    g.font=`italic 6.5px 'IM Fell English',Georgia,serif`;g.fillStyle=colors.text;g.textAlign='left';
    g.fillText('Delineavit et sculpsit · Orbis Tabula',rightX,oy+10);
    // A key to the six star forms used on the plate, set in the right flank clear of the play channel.
    const keyX=rightX,keyTop=Math.max(H*.28,band+70);
    g.font="8px 'IM Fell English SC','IM Fell English',Georgia,serif";g.fillStyle=colors.text;g.textAlign='left';
    g.fillText('MAGNITUDINES',keyX,keyTop);
    g.lineWidth=.6;g.strokeStyle=colors.tickMinor;g.beginPath();g.moveTo(keyX,keyTop+3.5);g.lineTo(keyX+66,keyTop+3.5);g.stroke();
    g.font="italic 7.5px 'IM Fell English',Georgia,serif";
    for(let m=5;m>=0;m--){
      const row=keyTop+17+(5-m)*12;
      starGlyph(g,keyX+7,row-4.5,m,ink.atmosphere.starGlyph,.62,1.3);
      g.fillStyle=colors.text;g.fillText(MAGNITUDES[5-m],keyX+24,row);
    }
  }
  return c;
}
function drawPlateFrame(){
  if(!W||!H)return;
  const key=W+'x'+H+'x'+DPR+':'+plateName;
  if(!frameLayer||key!==frameKey){frameLayer=buildFrameLayer();frameKey=key;}
  ctx.drawImage(frameLayer,0,0,W,H);
  // The side scales alone track world.cameraY, redrawn live over the cached ladder so the chart reads as
  // ascending with the player; everything else in the frame stays perfectly still.
  const colors=ink.frame,band=frameBand(),outerR=band*.56,innerR=band*.92,tickLen=Math.max(1,innerR-outerR);
  const {n,step}=frameEdgeTicks(Math.max(1,H-band*2)),scroll=Math.round(-world.cameraY*.015);
  ctx.font=`${frameWide()?8:6.5}px 'IM Fell English',Georgia,serif`;ctx.fillStyle=colors.text;
  for(let i=0;i<=n;i+=10){
    const y=band+i*step,value=(((i+scroll)%90)+90)%90;
    ctx.textAlign='left';ctx.fillText(String(value),outerR+tickLen*.72-2,y+2.5);
    ctx.textAlign='right';ctx.fillText(String(value),W-outerR-tickLen*.72+2,y+2.5);
  }
}
function render(dt){
  const aim=world.aim();ctx.setTransform(DPR,0,0,DPR,0,0);drawAtmosphere(dt,aim);drawGravitationalLenses();
  ctx.save();if(!reducedMotion&&world.shake>.08)ctx.translate(Math.sin(world.time*109)*world.shake*scale,Math.cos(world.time*137)*world.shake*.65*scale);
  for(const g of world.nebulas)drawHazard(g);
  drawConnections();drawConstellations();for(const n of world.nodes)drawNode(n,aim);for(const h of world.hazards)drawHazard(h);
  drawAim(aim);drawTrail();drawEffects(dt);drawPlayer();drawDark(dt);ctx.restore();
  drawPlateFrame();
  if(screenFlash>0){if(!reducedMotion){ctx.fillStyle=`rgba(${ink.dark.screenFlash},${screenFlash*.055})`;ctx.fillRect(0,0,W,H);}if(world.state!=='paused')screenFlash=Math.max(0,screenFlash-dt*3);}
  drawChapterReveal(dt);
  drawLaidPaper();
  updateUI(dt);
}

